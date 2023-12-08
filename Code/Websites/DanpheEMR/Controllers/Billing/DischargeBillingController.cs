
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.BillingModels.DischargeModel;
using DanpheEMR.ServerModel.BillingModels.DischargeStatementModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.SSF.DTO;
using DanpheEMR.Sync.IRDNepal.Models;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Billing
{
    public class DischargeBillingController : CommonController
    {
        private readonly DischargeDbContext _dischargeDbContext;
        bool realTimeRemoteSyncEnabled = false;
        bool RealTimeSSFClaimBooking = false;

        public DischargeBillingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            RealTimeSSFClaimBooking = _config.Value.RealTimeSSFClaimBooking;
            _dischargeDbContext = new DischargeDbContext(connString);
        }


        [HttpPost]
        [Route("PostBillingAndPharmacyTransactionAndDischarge")]
        public IActionResult PostBillAndPharmacyTransactionAndDischarge()
        {
            string strBillingTransactionData = this.ReadPostData();
            PendingBill pendingBills = DanpheJSONConvert.DeserializeObject<PendingBill>(strBillingTransactionData);
            Func<object> func = () => SaveBillingAndPharmacyTransactionAndDischarge(pendingBills);
            return InvokeHttpPostFunction(func);
        }


        [HttpGet]
        [Route("Statements")]
        public IActionResult GetDischargeStatements(DateTime fromDate, DateTime toDate)
        {

            Func<object> func = () => (from ds in _dischargeDbContext.DischargeStatements
                                       join pat in _dischargeDbContext.Patient on ds.PatientId equals pat.PatientId
                                       where DbFunctions.TruncateTime(ds.StatementDate) >= fromDate && DbFunctions.TruncateTime(ds.StatementDate) <= toDate
                                       select new
                                       {
                                           PatientId = ds.PatientId,
                                           DischargeStatementId = ds.DischargeStatementId,
                                           StatementNo = ds.StatementNo,
                                           PatientName = pat.ShortName,
                                           PatientCode = pat.PatientCode,
                                           StatementDate = ds.StatementDate,
                                           StatemntTime = ds.StatementTime,
                                           AgeSex = pat.Age + "/" + pat.Gender,
                                           PhoneNo = pat.PhoneNumber,
                                           PatientVisitId = ds.PatientVisitId
                                       }).OrderByDescending(ds => ds.StatementNo).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("StatementInfo")]
        public IActionResult StatementInfo(int patientId, int dischargeStatementId, int patientVisitId)
        {
            Func<object> func = () => DischargeDbContext.GetDischargeStatementInfo(patientId, dischargeStatementId, patientVisitId, _dischargeDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SummaryInfo")]
        public IActionResult SummaryInfo(int patientId, int patientVisitId, int? dischargeStatementId)
        {
            Func<object> func = () => GetBillItemsEstimationSummary(patientId, patientVisitId, dischargeStatementId);
            return InvokeHttpGetFunction(func);
        }

        private object SaveBillingAndPharmacyTransactionAndDischarge(PendingBill pendingBills)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            using (var dischargeTransactionScope = _dischargeDbContext.Database.BeginTransaction(System.Data.IsolationLevel.ReadUncommitted))
            {
                try
                {
                    int FiscalYearId = GetFiscalYear(_dischargeDbContext);
                    DateTime currentDate = DateTime.Now;

                    IpBillingTxnVM ipBillingTxnVM = pendingBills.BillingPendingItems;
                    List<PharmacyPendingBillItem> phrmPendingInvoiceItems = pendingBills.PharmacyPendingItem;

                    DischargeStatementModel dischargeStatement = SaveDischargeStatement(currentUser, FiscalYearId, currentDate, ipBillingTxnVM.dischargeDetailVM);

                    if (ipBillingTxnVM.billingTransactionModel.BillingTransactionItems.Count() > 0)
                    {
                        SaveBillingTransactionAndDischarge(currentUser, currentDate, connString, ipBillingTxnVM, dischargeStatement.DischargeStatementId, _dischargeDbContext);
                    }
                    else
                    {
                        DischargeOnZeroItem(ipBillingTxnVM, currentUser, _dischargeDbContext);
                    }
                    if (ipBillingTxnVM.billingTransactionModel.PaymentMode == ENUM_BillPaymentMode.cash && pendingBills.PharmacyTotalAmount > 0)
                    {
                        SettlePharmacyCreditInvoices(ipBillingTxnVM.billingTransactionModel.PatientId, (int)ipBillingTxnVM.billingTransactionModel.PatientVisitId, dischargeStatement.DischargeStatementId,
                            FiscalYearId, currentUser, ipBillingTxnVM.billingTransactionModel.CounterId);
                    }

                    if (ipBillingTxnVM.billingTransactionModel.PaymentMode == ENUM_BillPaymentMode.credit && pendingBills.PharmacyTotalAmount > 0)
                    {
                        UpdatePharmacyInvoiceItemsWithDischargeStatementId(ipBillingTxnVM.billingTransactionModel.PatientId, (int)ipBillingTxnVM.billingTransactionModel.PatientVisitId, dischargeStatement.DischargeStatementId);
                    }

                    dischargeTransactionScope.Commit();

                    return new 
                    {
                        DischargeStatementId = dischargeStatement.DischargeStatementId,
                        PatientId = ipBillingTxnVM.billingTransactionModel.PatientId, 
                        PatientVisitId = dischargeStatement.PatientVisitId
                    };
                }
                catch (Exception ex)
                {
                    dischargeTransactionScope.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
            }            
        }

        private void UpdatePharmacyInvoiceItemsWithDischargeStatementId(int patientId, int patientVisitId, int dischargeStatementId)
        {
            var pharmacyCreditInvoiceDetails = GetPharmacyCreditInvoiceDetails(patientId, patientVisitId);

            if (pharmacyCreditInvoiceDetails.Count() > 0)
            {
                pharmacyCreditInvoiceDetails.ForEach(a =>
                {
                   
                    var InvoiceDetails = _dischargeDbContext.PHRMInvoiceTransaction.Include(inv => inv.InvoiceItems).Where(inv => inv.InvoiceId == a.InvoiceId).FirstOrDefault();
                    if (InvoiceDetails != null)
                    {

                        InvoiceDetails.InvoiceItems.ForEach(invitm =>
                        {
                            invitm.DischargeStatementId = dischargeStatementId;
                            _dischargeDbContext.Entry(invitm).Property(x => x.DischargeStatementId).IsModified = true;
                        });
                        _dischargeDbContext.Entry(InvoiceDetails).Property(x => x.BilStatus).IsModified = true;
                    }
                });
                _dischargeDbContext.SaveChanges();
            }
        }

        
        private void SettlePharmacyCreditInvoices(int PatientId, int PatientVisitId, int DischargeStatementId, int FiscalYearId, RbacUser currentUser, int CounterId)
        {
            var pharmacyCreditInvoiceDetails = GetPharmacyCreditInvoiceDetails(PatientId, PatientVisitId);

            if (pharmacyCreditInvoiceDetails.Count() > 0)
            {
                pharmacyCreditInvoiceDetails.ForEach(a =>
                {
                    BillSettlementModel billSett = new BillSettlementModel
                    {
                        FiscalYearId = FiscalYearId,
                        SettlementDate = DateTime.Now,
                        PatientId = PatientId,
                        SettlementReceiptNo = GetSettlementReceiptNo(),
                        CollectionFromReceivable = (double)a.CreditAmount,
                        PaidAmount = (double)a.CreditAmount,
                        CreatedBy = currentUser.EmployeeId,
                        CreatedOn = DateTime.Now,
                        OrganizationId = a.OrganizationId,
                        IsActive = true,
                        PaymentMode = ENUM_BillPaymentMode.cash,
                        CounterId = CounterId,
                        PrintCount = 0,
                        ModuleName = ENUM_ModuleNames.Billing
                    };

                    _dischargeDbContext.BillSettlements.Add(billSett);
                    _dischargeDbContext.SaveChanges();

                    var InvoiceDetails = _dischargeDbContext.PHRMInvoiceTransaction.Include(inv => inv.InvoiceItems).Where(inv => inv.InvoiceId == a.InvoiceId).FirstOrDefault();
                    if (InvoiceDetails != null)
                    {
                        InvoiceDetails.BilStatus = ENUM_BillingStatus.paid;
                        InvoiceDetails.SettlementId = billSett.SettlementId;

                        InvoiceDetails.InvoiceItems.ForEach(invitm =>
                        {
                            invitm.BilItemStatus = ENUM_BillingStatus.paid;
                            invitm.DischargeStatementId = DischargeStatementId;
                            _dischargeDbContext.Entry(invitm).Property(x => x.BilItemStatus).IsModified = true;
                            _dischargeDbContext.Entry(invitm).Property(x => x.DischargeStatementId).IsModified = true;
                        });
                        _dischargeDbContext.Entry(InvoiceDetails).Property(x => x.BilStatus).IsModified = true;
                        _dischargeDbContext.Entry(InvoiceDetails).Property(x => x.SettlementId).IsModified = true;
                    }
                });
                _dischargeDbContext.SaveChanges();
            }
        }

        private List<PharmacyCreditInvoiceDetail_DTO> GetPharmacyCreditInvoiceDetails(int patientId, int patientVisitId)
        {
            var pharmacyCreditInvoiceDetails = (from inv in _dischargeDbContext.PHRMInvoiceTransaction.Where(inv => inv.PatientId == patientId && inv.PatientVisitId == patientVisitId && inv.BilStatus == ENUM_BillingStatus.unpaid)
                                                join invret in
                                                (
                                                    from invret in _dischargeDbContext.PHRMInvoiceReturnModels.Where(a => a.PatientId == patientId)
                                                    group invret by new { invret.InvoiceId } into invoiceReturn
                                                    select new
                                                    {
                                                        InvoiceId = invoiceReturn.Key.InvoiceId,
                                                        TotalCreditAmount = invoiceReturn.Select(a => a.TotalAmount).DefaultIfEmpty(0).Sum()
                                                    }
                                                )
                                                on inv.InvoiceId equals invret.InvoiceId
                                                into invAndReturn
                                                from invoiceAndReturnDetials in invAndReturn.DefaultIfEmpty()
                                                select new PharmacyCreditInvoiceDetail_DTO
                                                {
                                                    InvoiceId = inv.InvoiceId,
                                                    CreditAmount = inv.TotalAmount - (invoiceAndReturnDetials == null ? 0 : invoiceAndReturnDetials.TotalCreditAmount),
                                                    OrganizationId = (int)inv.OrganizationId
                                                }).ToList();
            return pharmacyCreditInvoiceDetails;
        }


        private int GetSettlementReceiptNo()
        {
            int currSettlmntNo = _dischargeDbContext.BillSettlements.Select(a => a.SettlementReceiptNo).DefaultIfEmpty(0).Max();
            return currSettlmntNo + 1;
        }

        private object DischargeOnZeroItem(IpBillingTxnVM ipBillingTxnVM, RbacUser currentUser, DischargeDbContext dischargeDbContext)
        {
            BillingDepositModel deposit = new BillingDepositModel();

            var admissionDetail = dischargeDbContext.Admissions.Where(a => a.PatientVisitId == ipBillingTxnVM.dischargeDetailVM.PatientVisitId).FirstOrDefault();
            admissionDetail.DischargedBy = currentUser.EmployeeId;
            admissionDetail.DischargeDate = ipBillingTxnVM.dischargeDetailVM.DischargeDate;
            admissionDetail.AdmissionStatus = ENUM_AdmissionStatus.discharged;

            admissionDetail.BillStatusOnDischarge = ENUM_BillingStatus.paid;

            admissionDetail.DischargeRemarks = ipBillingTxnVM.dischargeDetailVM.Remarks;
            dischargeDbContext.Entry(admissionDetail).Property(a => a.DischargedBy).IsModified = true;
            dischargeDbContext.Entry(admissionDetail).Property(a => a.DischargeDate).IsModified = true;
            dischargeDbContext.Entry(admissionDetail).Property(a => a.AdmissionStatus).IsModified = true;
            dischargeDbContext.Entry(admissionDetail).Property(a => a.BillStatusOnDischarge).IsModified = true;
            dischargeDbContext.Entry(admissionDetail).Property(a => a.DischargeRemarks).IsModified = true;
            dischargeDbContext.SaveChanges();


            var patBedInfo = dischargeDbContext.PatientBedInfos.Where(b => (b.PatientVisitId == ipBillingTxnVM.dischargeDetailVM.PatientVisitId) && !b.EndedOn.HasValue &&
            (b.OutAction == null || b.OutAction == "")).OrderByDescending(o => o.PatientBedInfoId).FirstOrDefault();
            patBedInfo.OutAction = ENUM_AdmissionStatus.discharged;
            patBedInfo.EndedOn = ipBillingTxnVM.dischargeDetailVM.DischargeDate;
            dischargeDbContext.Entry(patBedInfo).Property(a => a.OutAction).IsModified = true;
            dischargeDbContext.Entry(patBedInfo).Property(a => a.EndedOn).IsModified = true;
            dischargeDbContext.SaveChanges();


            var bed = dischargeDbContext.Beds.Where(b => b.BedId == patBedInfo.BedId).FirstOrDefault();
            //set bed to not occupied
            bed.IsOccupied = false;
            bed.OnHold = false;
            bed.HoldedOn = null;
            bed.IsReserved = false;
            dischargeDbContext.Entry(bed).Property(a => a.IsOccupied).IsModified = true;
            dischargeDbContext.Entry(bed).Property(a => a.OnHold).IsModified = true;
            dischargeDbContext.Entry(bed).Property(a => a.HoldedOn).IsModified = true;
            dischargeDbContext.Entry(bed).Property(a => a.IsReserved).IsModified = true;
            dischargeDbContext.SaveChanges();

            //Krishna, 27thApril'23, get the Default DepositHeadId ..
            var DefaultDepositHead = _dischargeDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
            int DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;

            if (ipBillingTxnVM.dischargeDetailVM.DepositBalance > 0)
            {
                deposit.PatientId = ipBillingTxnVM.dischargeDetailVM.PatientId;
                deposit.PatientVisitId = ipBillingTxnVM.dischargeDetailVM.PatientVisitId;
                //deposit.Amount = ipBillingTxnVM.dischargeDetailVM.DepositBalance;
                deposit.OutAmount = (decimal)ipBillingTxnVM.dischargeDetailVM.DepositBalance;
                deposit.DepositBalance = 0;
                deposit.CounterId = ipBillingTxnVM.dischargeDetailVM.CounterId;
                deposit.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                deposit.CreatedOn = System.DateTime.Now;
                deposit.CreatedBy = currentUser.EmployeeId;
                BillingFiscalYear fiscYear = GetFiscalYearObject(dischargeDbContext);
                deposit.FiscalYearId = fiscYear.FiscalYearId;
                deposit.ReceiptNo = GetDepositReceiptNo(dischargeDbContext);
                deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                EmployeeModel currentEmp = _dischargeDbContext.Employee.Where(emp => emp.EmployeeId == currentUser.EmployeeId).AsNoTracking().FirstOrDefault();
                deposit.BillingUser = currentEmp.FullName;
                deposit.IsActive = true;
                deposit.ModuleName = ENUM_ModuleNames.Billing;
                deposit.OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient;
                deposit.DepositHeadId = DepositHeadId;

                _dischargeDbContext.BillingDeposits.Add(deposit);
                _dischargeDbContext.SaveChanges();

                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = deposit.TransactionType;
                empCashTransaction.ReferenceNo = deposit.DepositId;
                empCashTransaction.InAmount = 0;
                empCashTransaction.OutAmount = (double)deposit.OutAmount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                empCashTransaction.TransactionDate = DateTime.Now;
                empCashTransaction.CounterID = deposit.CounterId;
                empCashTransaction.IsActive = true;

                _dischargeDbContext.EmpCashTransactions.Add(empCashTransaction);
                _dischargeDbContext.SaveChanges();
            }

            return deposit;
        }

        private BillingFiscalYear GetFiscalYearObject(DischargeDbContext dischargeDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            var FiscalYear = dischargeDbContext.BillingFiscalYears.FirstOrDefault(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate);
            return FiscalYear;
        }

        private DischargeStatementModel SaveDischargeStatement(RbacUser currentUser, int FiscalYearId, DateTime currentDate, DischargeDetailVM dischargeDetailVM)
        {
            DischargeStatementModel dischargeStatement = new DischargeStatementModel();

            int StatementNo = (from dischargeInfo in _dischargeDbContext.DischargeStatements
                               where dischargeInfo.FiscalYearId == FiscalYearId
                               select dischargeInfo.StatementNo).DefaultIfEmpty(0).Max();

            dischargeStatement.StatementNo = StatementNo + 1;
            dischargeStatement.FiscalYearId = FiscalYearId;
            dischargeStatement.StatementDate = currentDate;
            dischargeStatement.StatementTime = currentDate.TimeOfDay;
            dischargeStatement.CreatedOn = currentDate;
            dischargeStatement.PatientId = dischargeDetailVM.PatientId;
            dischargeStatement.PatientVisitId = dischargeDetailVM.PatientVisitId;
            dischargeStatement.CreatedBy = currentUser.EmployeeId;
            dischargeStatement.IsActive = true;
            dischargeStatement.PrintedOn = currentDate;
            dischargeStatement.PrintCount = 1;
            dischargeStatement.PrintedBy = currentUser.EmployeeId;

            _dischargeDbContext.DischargeStatements.Add(dischargeStatement);
            _dischargeDbContext.SaveChanges();
            return dischargeStatement;
        }

        private void SaveBillingTransactionAndDischarge(RbacUser currentUser, DateTime currentDate, string connString, IpBillingTxnVM ipBillingTxnVM, int DischargeStatementId, DischargeDbContext dischargeDbContext)
        {
            BillingTransactionModel billTransaction = ipBillingTxnVM.billingTransactionModel;

            if (billTransaction != null)
            {
                if (IsValidForDischarge(billTransaction.PatientId, billTransaction.PatientVisitId, dischargeDbContext))
                {
                    if (IsDepositAvailable(dischargeDbContext, billTransaction.PatientId, billTransaction.DepositUsed))
                    {
                        ProceedToPostBillTransaction(dischargeDbContext, billTransaction, currentUser, currentDate, DischargeStatementId);

                        DischargeDetailVM dischargeDetail = ipBillingTxnVM.dischargeDetailVM;
                        dischargeDetail.BillingTransactionId = billTransaction.BillingTransactionId;
                        dischargeDetail.BillStatus = billTransaction.BillStatus;
                        dischargeDetail.PatientId = billTransaction.PatientId;
                        dischargeDetail.PatientVisitId = (int)billTransaction.PatientVisitId;

                        ProceedToDischargeFromBilling(dischargeDetail, currentUser, currentDate, dischargeDbContext);
                    }
                    else
                    {
                        throw new Exception("Deposit Amount is Invalid");
                    }

                }
                else
                {
                    throw new Exception("Patient is already discharged.");
                }

            }
        }

        private bool IsValidForDischarge(int patientId, int? patientVisitId, DischargeDbContext dischargeDbContext)
        {
            bool isValidForDischarge = true;

            //condition-1: Check if patient is admitted or not in Admission table.
            AdmissionModel admissionObj = dischargeDbContext.Admissions.Where(adm => adm.PatientId == patientId
                                                  && adm.PatientVisitId == patientVisitId
                                                  && adm.AdmissionStatus == ENUM_AdmissionStatus.admitted).FirstOrDefault();

            //if admissionobject is not found then Patient is nomore Admitted. Hence Discharge is INVALID in such case.
            if (admissionObj == null)
            {
                isValidForDischarge = false;
            }

            return isValidForDischarge;
        }

        private bool IsDepositAvailable(DischargeDbContext contex, int patientId, double? depositUsed)
        {
            var patientAllDepositTxns = (from bill in contex.BillingDeposits
                                         where bill.PatientId == patientId && bill.IsActive == true
                                         group bill by new { bill.PatientId, bill.TransactionType } into p
                                         select new
                                         {
                                             TransactionType = p.Key.TransactionType,
                                             SumInAmount = p.Sum(a => a.InAmount),
                                             SumOutAmount = p.Sum(a => a.OutAmount)
                                         }).ToList();
            decimal totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
            currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault() != null)
            {
                totalDepositAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault().SumInAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault() != null)
            {
                totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault().SumOutAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault() != null)
            {
                totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault().SumOutAmount;
            }
            currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

            depositUsed = depositUsed == null ? 0 : depositUsed;
            return (decimal)depositUsed <= currentDepositBalance ? true : false;
        }

        #region Method to post bill transaction..
        private void ProceedToPostBillTransaction(DischargeDbContext dischargeDbContext, BillingTransactionModel billTransaction, RbacUser currentUser, DateTime currentDate, int DischargeStatementId)
        {
            try
            {

                billTransaction = PostBillingTransaction(dischargeDbContext, billTransaction, currentUser, currentDate, DischargeStatementId);

                //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                if (billTransaction.DepositReturnAmount > 0 && ((billTransaction.PaymentMode != ENUM_BillPaymentMode.credit) || (billTransaction.IsCoPayment && billTransaction.PaymentMode == ENUM_BillPaymentMode.credit)))
                {
                    var DefaultDepositHead = _dischargeDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
                    var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;
                    BillingDepositModel dep = new BillingDepositModel()
                    {
                        TransactionType = ENUM_DepositTransactionType.ReturnDeposit, // "ReturnDeposit",
                        Remarks = "Deposit Refunded from InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                        //Amount = billTransaction.DepositReturnAmount,
                        OutAmount = (decimal)billTransaction.DepositReturnAmount,
                        IsActive = true,
                        BillingTransactionId = billTransaction.BillingTransactionId,
                        DepositBalance = 0,
                        FiscalYearId = billTransaction.FiscalYearId,
                        CounterId = billTransaction.CounterId,
                        CreatedBy = billTransaction.CreatedBy,
                        CreatedOn = currentDate,
                        PatientId = billTransaction.PatientId,
                        PatientVisitId = billTransaction.PatientVisitId,
                        PaymentMode = billTransaction.PaymentMode,
                        PaymentDetails = billTransaction.PaymentDetails,
                        ModuleName = ENUM_ModuleNames.Billing,
                        OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                        DepositHeadId = DepositHeadId, //! Krishna, 27thApril'23, Need to Change this logic
                        VisitType = ENUM_VisitType.inpatient, // Bibek 18th June '23

                    };
                    if (billTransaction.ReceiptNo == null)
                    {
                        dep.ReceiptNo = GetDepositReceiptNo(dischargeDbContext);
                    }
                    else
                    {
                        dep.ReceiptNo = billTransaction.ReceiptNo;
                    }


                    _dischargeDbContext.BillingDeposits.Add(dep);
                    dischargeDbContext.SaveChanges();

                    EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                    empCashTransaction.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                    empCashTransaction.ReferenceNo = dep.DepositId;
                    empCashTransaction.InAmount = 0;
                    empCashTransaction.OutAmount = (double)dep.OutAmount;
                    empCashTransaction.EmployeeId = currentUser.EmployeeId;
                    empCashTransaction.TransactionDate = DateTime.Now;
                    empCashTransaction.CounterID = dep.CounterId;
                    empCashTransaction.PatientId = dep.PatientId;
                    empCashTransaction.ModuleName = ENUM_ModuleNames.Billing;
                    empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(dischargeDbContext);
                    AddEmpCashTransaction(dischargeDbContext, empCashTransaction);

                    List<BillingTransactionItemModel> item = dischargeDbContext.BillingTransactionItems.Where(a => a.PatientId == billTransaction.PatientId
                                                                                                            && a.PatientVisitId == billTransaction.PatientVisitId
                                                                                                            && a.BillStatus == "provisional" && a.Quantity == 0).ToList();
                    if (item.Count() > 0)
                    {
                        item.ForEach(itm =>
                        {
                            var txnItem = UpdateTxnItemBillStatus(dischargeDbContext, itm, "adtCancel", currentUser, currentDate, billTransaction.CounterId, null);
                        });
                    }

                    

                    var allPatientBedInfos = dischargeDbContext.PatientBedInfos.Where(a => a.PatientVisitId == billTransaction.PatientVisitId
                                                                                    && a.IsActive == true).OrderByDescending(b => b.PatientBedInfoId)
                                                                                    .Take(2).ToList();

                    if (allPatientBedInfos.Count > 0)
                    {
                        allPatientBedInfos.ForEach(bed =>
                        {
                            var b = dischargeDbContext.Beds.FirstOrDefault(fd => fd.BedId == bed.BedId);
                            if (b != null)
                            {
                                b.OnHold = false;
                                b.HoldedOn = null;
                                dischargeDbContext.Entry(b).State = EntityState.Modified;
                                dischargeDbContext.Entry(b).Property(x => x.OnHold).IsModified = true;
                                dischargeDbContext.Entry(b).Property(x => x.HoldedOn).IsModified = true;
                                dischargeDbContext.SaveChanges();
                            }
                        });
                    }
                }

                if (realTimeRemoteSyncEnabled)
                {
                    if (billTransaction.Patient == null)
                    {
                        PatientModel pat = dischargeDbContext.Patient.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                        billTransaction.Patient = pat;
                    }
                    //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.

                    Task.Run(() => SyncBillToRemoteServer(billTransaction, "sales", dischargeDbContext));

                }

                //Send to SSF Server for Real time ClaimBooking.
                var patientSchemes = dischargeDbContext.PatientSchemes.Where(a => a.SchemeId == billTransaction.SchemeId && a.PatientId == billTransaction.PatientId).FirstOrDefault();
                if (patientSchemes != null)
                {
                    int priceCategoryId = billTransaction.BillingTransactionItems[0].PriceCategoryId;
                    var priceCategory = dischargeDbContext.PriceCategories.Where(a => a.PriceCategoryId == priceCategoryId).FirstOrDefault();
                    if (priceCategory != null && priceCategory.PriceCategoryName.ToLower() == "ssf" && RealTimeSSFClaimBooking)
                    {
                        //making parallel thread call (asynchronous) to post to SSF Server. so that it won't stop the normal BillingFlow.
                        SSFDbContext ssfDbContext = new SSFDbContext(connString);
                        var billObj = new SSF_ClaimBookingBillDetail_DTO()
                        {
                            InvoiceNoFormatted = $"BL{billTransaction.InvoiceNo}",
                            TotalAmount = (decimal)billTransaction.TotalAmount,
                            ClaimCode = (long)billTransaction.ClaimCode
                        };

                        SSF_ClaimBookingService_DTO claimBooking = SSF_ClaimBookingService_DTO.GetMappedToBookClaim(billObj, patientSchemes);

                        Task.Run(() => BillingBL.SyncToSSFServer(claimBooking, "billing", ssfDbContext, patientSchemes, currentUser));
                    }
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region Method to Discharge a patient from billing..
        private void ProceedToDischargeFromBilling(DischargeDetailVM dischargeDetail, RbacUser currentUser, DateTime currentDate, DischargeDbContext dischargeDbContext)
        {
            try
            {
                AdmissionModel admission = dischargeDbContext.Admissions.Where(adt => adt.PatientVisitId == dischargeDetail.PatientVisitId).FirstOrDefault();

                PatientBedInfo bedInfo = dischargeDbContext.PatientBedInfos
                                                         .Where(bed => bed.PatientVisitId == dischargeDetail.PatientVisitId)
                                                         .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();

                admission.AdmissionStatus = "discharged";
                admission.DischargeDate = dischargeDetail.DischargeDate;
                admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                admission.DischargedBy = currentUser.EmployeeId;
                admission.ModifiedBy = currentUser.EmployeeId;
                admission.ModifiedOn = DateTime.Now;
                admission.ProcedureType = dischargeDetail.ProcedureType;
                admission.DiscountSchemeId = dischargeDetail.DiscountSchemeId;
                admission.DischargeRemarks = dischargeDetail.Remarks;

                FreeBed(bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate, admission.AdmissionStatus, dischargeDbContext);

                dischargeDbContext.Entry(admission).Property(a => a.DischargedBy).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.AdmissionStatus).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.DischargeDate).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.ProcedureType).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.DischargeRemarks).IsModified = true;
                dischargeDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                dischargeDbContext.SaveChanges();
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region This gets the PaymentModeSubCategoryId of Cash PaymentMode.....
        private int GetPaymentModeSubCategoryId(DischargeDbContext dischargeDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = dischargeDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion

        #region This is used to free the occupied bed while discharging...
        private void FreeBed(int bedInfoId, DateTime? endedOn, string status, DischargeDbContext dischargeDbContext)
        {
            try
            {
                PatientBedInfo bedInfo = dischargeDbContext.PatientBedInfos
                                                         .Where(b => b.PatientBedInfoId == bedInfoId)
                                                         .FirstOrDefault();
                UpdateIsOccupiedStatus(bedInfo.BedId, false, dischargeDbContext);
                //endedOn can get updated from Billing Edit item as well.
                if (bedInfo.EndedOn == null)
                    bedInfo.EndedOn = endedOn;


                if (status == "discharged")
                {
                    bedInfo.OutAction = "discharged";
                }
                else if (status == "transfer")
                {
                    bedInfo.OutAction = "transfer";
                }
                else
                {
                    bedInfo.OutAction = null;
                }

                dischargeDbContext.Entry(bedInfo).State = EntityState.Modified;
                dischargeDbContext.Entry(bedInfo).Property(x => x.CreatedOn).IsModified = false;
                dischargeDbContext.Entry(bedInfo).Property(x => x.StartedOn).IsModified = false;
                dischargeDbContext.Entry(bedInfo).Property(x => x.CreatedBy).IsModified = false;
                dischargeDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region This is used to update the Occupied status of a bed...
        private void UpdateIsOccupiedStatus(int bedId, bool status, DischargeDbContext dischargeDbContext)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                BedModel selectedBed = dischargeDbContext.Beds
                                                       .Where(b => b.BedId == bedId)
                                                       .FirstOrDefault();
                selectedBed.IsOccupied = status;
                dischargeDbContext.Entry(selectedBed).State = EntityState.Modified;
                dischargeDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion


        private int GetFiscalYear(DischargeDbContext dischargeDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            var FiscalYear =  dischargeDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
            int fiscalYearId = 0;
            if(FiscalYear != null)
            {
                fiscalYearId = FiscalYear.FiscalYearId;
            }
            return fiscalYearId;
        }

        private BillingTransactionModel PostBillingTransaction(DischargeDbContext dischargeDbContext, BillingTransactionModel billingTransaction, RbacUser currentUser, DateTime currentDate, int DischargeStatementId)
        {
            List<BillingTransactionItemModel> newTxnItems = new List<BillingTransactionItemModel>();
            dischargeDbContext.AuditDisabled = false;
            if (billingTransaction.BillingTransactionItems != null && billingTransaction.BillingTransactionItems.Count > 0)
            {
                foreach (var txnItem in billingTransaction.BillingTransactionItems)
                {

                    BillingTransactionItemModel clonedItem = BillingTransactionItemModel.GetClone(txnItem);
                    clonedItem.BillingTransaction = null;
                    newTxnItems.Add(clonedItem);
                }
                billingTransaction.BillingTransactionItems = null;
            }

            //if paymentmode is credit, paiddate and paidamount should be null
            //handle this in client side as well. 
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            if (billingTransaction.PatientVisitId == null)
            {
                billingTransaction.PatientVisitId = newTxnItems[0].PatientVisitId;
            }
            if (billingTransaction.BillStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                billingTransaction.PaidDate = null;
                billingTransaction.PaidAmount = 0;
                billingTransaction.PaymentReceivedBy = null;
                billingTransaction.PaidCounterId = null;

            }
            else if (billingTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
            {
                billingTransaction.PaidDate = currentDate;
                billingTransaction.PaidCounterId = billingTransaction.CounterId;
                billingTransaction.PaymentReceivedBy = billingTransaction.CreatedBy;
            }

            BillingFiscalYear fiscalYear = GetFiscalYearObject(dischargeDbContext);

            billingTransaction.CreatedOn = currentDate;
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            billingTransaction.FiscalYearId = fiscalYear.FiscalYearId;
            billingTransaction.InvoiceCode = billingTransaction.IsInsuranceBilling == true ? "INS" : BillingBL.InvoiceCode;


            dischargeDbContext.BillingTransactions.Add(billingTransaction);

            dischargeDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
            dischargeDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dischargeDbContext); //To avoid the duplicate the invoiceNo..

            dischargeDbContext.AuditDisabled = true;

            //This will map PatientVisitId to the Provisional Items of inpatient only
            #region This will map PatientVisitId to the Provisional Items of inpatient 
            for (int i = 0; i < newTxnItems.Count; i++)
            {
                if (newTxnItems[i].BillStatus == ENUM_BillingStatus.provisional && billingTransaction.TransactionType == ENUM_BillingType.inpatient)
                {
                    newTxnItems[i].PatientVisitId = billingTransaction.PatientVisitId;
                }
            }
            #endregion

            PostUpdateBillingTransactionItems(dischargeDbContext,
                   newTxnItems,
                   currentUser, currentDate,
                   billingTransaction.BillStatus,
                   billingTransaction.CounterId,
                   DischargeStatementId,
                   billingTransaction.BillingTransactionId
                   );

            dischargeDbContext.SaveChanges();



            if (billingTransaction.BillStatus == ENUM_BillingStatus.paid || billingTransaction.IsCoPayment == true)
            { //If transaction is done with Depositor paymentmode is credit we don't have to add in EmpCashTransaction table
                List<EmpCashTransactionModel> empCashTransaction = new List<EmpCashTransactionModel>();
                for (int i = 0; i < billingTransaction.EmployeeCashTransaction.Count; i++)
                {
                    EmpCashTransactionModel empCashTransactionModel = new EmpCashTransactionModel();
                    empCashTransactionModel.TransactionType = "CashSales";
                    empCashTransactionModel.ReferenceNo = billingTransaction.BillingTransactionId;
                    empCashTransactionModel.InAmount = billingTransaction.EmployeeCashTransaction[i].InAmount;
                    empCashTransactionModel.OutAmount = 0;
                    empCashTransactionModel.EmployeeId = currentUser.EmployeeId;
                    empCashTransactionModel.TransactionDate = DateTime.Now;
                    empCashTransactionModel.CounterID = billingTransaction.CounterId;
                    empCashTransactionModel.PaymentModeSubCategoryId = billingTransaction.EmployeeCashTransaction[i].PaymentModeSubCategoryId;
                    empCashTransactionModel.PatientId = billingTransaction.PatientId;
                    empCashTransactionModel.ModuleName = billingTransaction.EmployeeCashTransaction[i].ModuleName;
                    empCashTransactionModel.Remarks = billingTransaction.EmployeeCashTransaction[i].Remarks;
                    empCashTransaction.Add(empCashTransactionModel);
                }

                AddEmpCashtransactionForBilling(dischargeDbContext, empCashTransaction);
            }

            //step:3-- if there's deposit deduction, then add to deposit table. 
            if ((billingTransaction.IsCoPayment == true &&
                billingTransaction.PaymentMode.ToLower() == ENUM_BillPaymentMode.credit.ToLower() &&  //case of Copayment
                billingTransaction.DepositUsed != null && billingTransaction.DepositUsed > 0) ||
                (billingTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                && billingTransaction.DepositUsed != null && billingTransaction.DepositUsed > 0))
            {
                decimal depBalance = 0;
                if (billingTransaction.InvoiceType == ENUM_InvoiceType.inpatientDischarge)
                {
                    //in case of discharge bill, we clear all remaining deposits of a patient.
                    //but from client side, we're already making deposit balance=0.
                    //so only for DepositTable, we have to re-calcaultate the balance amount again.
                    depBalance = (decimal)billingTransaction.DepositReturnAmount;
                }
                else
                {
                    depBalance = (decimal)billingTransaction.DepositBalance;
                }

                //get Default Deposit Head
                var DefaultDepositHead = _dischargeDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
                var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;
                BillingDepositModel dep = new BillingDepositModel()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct, //"depositdeduct",
                    Remarks = "Deposit used in InvoiceNo. " + billingTransaction.InvoiceCode + billingTransaction.InvoiceNo,
                    IsActive = true,
                    //Amount = billingTransaction.DepositUsed,
                    OutAmount = (decimal)billingTransaction.DepositUsed,
                    BillingTransactionId = billingTransaction.BillingTransactionId,
                    DepositBalance = depBalance,
                    FiscalYearId = billingTransaction.FiscalYearId,
                    CounterId = billingTransaction.CounterId,
                    CreatedBy = billingTransaction.CreatedBy,
                    CreatedOn = currentDate,
                    PatientId = billingTransaction.PatientId,
                    PatientVisitId = billingTransaction.PatientVisitId,
                    PaymentMode = billingTransaction.PaymentMode,
                    PaymentDetails = billingTransaction.PaymentDetails,
                    ReceiptNo = GetDepositReceiptNo(dischargeDbContext),
                    ModuleName = ENUM_ModuleNames.Billing,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    DepositHeadId = DepositHeadId,
                    VisitType = ENUM_VisitType.inpatient
                };
                billingTransaction.ReceiptNo = dep.ReceiptNo + 1;
                dischargeDbContext.BillingDeposits.Add(dep);
                dischargeDbContext.SaveChanges();

                MasterDbContext masterDbContext = new MasterDbContext(connString);
                PaymentModes MstPaymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit").FirstOrDefault();
                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = ENUM_DepositTransactionType.DepositDeduct;
                empCashTransaction.ReferenceNo = dep.DepositId;
                empCashTransaction.InAmount = 0;
                empCashTransaction.OutAmount = (double)dep.OutAmount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                empCashTransaction.TransactionDate = DateTime.Now;
                empCashTransaction.CounterID = dep.CounterId;
                empCashTransaction.ModuleName = "Billing";
                empCashTransaction.PatientId = dep.PatientId;
                empCashTransaction.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;

                AddEmpCashTransaction(dischargeDbContext, empCashTransaction);
            }
            billingTransaction.FiscalYear = fiscalYear.FiscalYearFormatted;

            //create BillingTxnCreditBillStatus when IsCoPayment is true, Krishna,23,Aug'22

            if (billingTransaction.PaymentMode == ENUM_BillPaymentMode.credit)
            {
                BillingTransactionCreditBillStatusModel billingTransactionCreditBillStatus = new BillingTransactionCreditBillStatusModel();

                billingTransactionCreditBillStatus.BillingTransactionId = billingTransaction.BillingTransactionId;
                billingTransactionCreditBillStatus.FiscalYearId = billingTransaction.FiscalYearId;
                billingTransactionCreditBillStatus.InvoiceNoFormatted = $"{billingTransaction.FiscalYear}-{billingTransaction.InvoiceCode}{billingTransaction.InvoiceNo}";
                billingTransactionCreditBillStatus.InvoiceDate = (DateTime)billingTransaction.CreatedOn;
                billingTransactionCreditBillStatus.PatientVisitId = (int)billingTransaction.PatientVisitId;
                billingTransactionCreditBillStatus.SchemeId = billingTransaction.SchemeId;
                billingTransactionCreditBillStatus.LiableParty = billingTransaction.OrganizationId is null ? "SELF" : "Organization";
                billingTransactionCreditBillStatus.PatientId = billingTransaction.PatientId;
                billingTransactionCreditBillStatus.CreditOrganizationId = (int)billingTransaction.OrganizationId;
                billingTransactionCreditBillStatus.MemberNo = billingTransaction.MemberNo;
                billingTransactionCreditBillStatus.SalesTotalBillAmount = (decimal)billingTransaction.TotalAmount;
                billingTransactionCreditBillStatus.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
                billingTransactionCreditBillStatus.ReturnTotalBillAmount = 0; //This will come if bill is returned
                billingTransactionCreditBillStatus.CoPayReceivedAmount = billingTransaction.ReceivedAmount;
                billingTransactionCreditBillStatus.CoPayReturnAmount = 0;
                billingTransactionCreditBillStatus.NetReceivableAmount = billingTransactionCreditBillStatus.SalesTotalBillAmount - billingTransactionCreditBillStatus.CoPayReceivedAmount - (billingTransactionCreditBillStatus.ReturnTotalBillAmount - billingTransactionCreditBillStatus.CoPayReturnAmount);
                billingTransactionCreditBillStatus.CreatedBy = currentUser.EmployeeId;
                billingTransactionCreditBillStatus.NonClaimableAmount = 0;
                billingTransactionCreditBillStatus.IsClaimable = true;
                billingTransactionCreditBillStatus.ClaimCode = billingTransaction.ClaimCode;
                billingTransactionCreditBillStatus.CreatedOn = currentDate;
                billingTransactionCreditBillStatus.IsActive = true;

                dischargeDbContext.BillingTransactionCreditBillStatuses.Add(billingTransactionCreditBillStatus);
                dischargeDbContext.SaveChanges();
            }

            //update PatientPriceCategoryMap table to update CreditLimits according to Visit Types ('inpatient', 'outpatient')
            var patientVisit = dischargeDbContext.Visit.Where(a => a.PatientVisitId == billingTransaction.PatientVisitId).FirstOrDefault();

            //Krishna, 8th-Jan'23 Below logic is responsible to update the MedicareMemberBalance When Medicare Patient Billing is done.
            BillingSchemeModel scheme = new BillingSchemeModel();

            if (patientVisit != null)
            {
                scheme = dischargeDbContext.BillingSchemes.FirstOrDefault(a => a.SchemeId == patientVisit.SchemeId);
            }
            if (scheme != null && (scheme.IsGeneralCreditLimited || scheme.IsOpCreditLimited || scheme.IsIpCreditLimited))
            {
                UpdatePatientSchemeMap(billingTransaction, patientVisit, dischargeDbContext, currentDate, currentUser, scheme);
            }
            //UpdatePatientMapPriceCategoryForMedicarePatientBilling(billingTransaction, patientVisit, dbContext, currentDate, currentUser);

            if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
            {
                UpdateMedicareMemberBalance(billingTransaction, patientVisit, dischargeDbContext, currentDate, currentUser);
            }

            return billingTransaction;
        }

        private static void UpdatePatientSchemeMap(BillingTransactionModel billingTransaction, VisitModel patientVisit, DischargeDbContext dbContext, DateTime currentDate, RbacUser currentUser, BillingSchemeModel scheme)
        {
            PatientSchemeMapModel patientSchemeMap = new PatientSchemeMapModel();
            patientSchemeMap = dbContext.PatientSchemes.Where(a => a.PatientId == billingTransaction.PatientId && a.SchemeId == patientVisit.SchemeId).FirstOrDefault();

            if (scheme.IsGeneralCreditLimited && patientSchemeMap.GeneralCreditLimit > 0)
            {
                if ((decimal)billingTransaction.TotalAmount <= patientSchemeMap.GeneralCreditLimit)
                {
                    patientSchemeMap.GeneralCreditLimit = patientSchemeMap.GeneralCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.GeneralCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("General Credit Limit is less than total bill amount");
                }
            }

            if (scheme.IsOpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.outpatient.ToLower()))
            {

                if (patientSchemeMap != null && patientSchemeMap.OpCreditLimit > 0)
                {
                    patientSchemeMap.OpCreditLimit = patientSchemeMap.OpCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.OpCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("OP Credit Limit is less than total bill amount");
                }
            }

            if (scheme.IsIpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower() && scheme.ApiIntegrationName != ENUM_Scheme_ApiIntegrationNames.SSF))
            {
                if (patientSchemeMap != null && patientSchemeMap.IpCreditLimit > 0)
                {
                    patientSchemeMap.IpCreditLimit = patientSchemeMap.IpCreditLimit - (decimal)billingTransaction.TotalAmount;
                    patientSchemeMap.ModifiedOn = currentDate;
                    patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("IP Credit Limit is less than total bill amount");
                }
            }

            //Below block is for inpatient i.e. either IPCreditlimit only is used or both IP and OP Credit limits are used.
            if (scheme.IsIpCreditLimited && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower() && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.SSF))
            {
                //Here when TotalBillAmount is less than the sum of (IPCreditLimit and OPCreditLimit) then only update Credit limits or allow to use Credit limits
                decimal TotalBillAmount = (decimal)billingTransaction.TotalAmount;
                if (patientSchemeMap != null && (TotalBillAmount <= (patientSchemeMap.IpCreditLimit + patientSchemeMap.OpCreditLimit)))
                {
                    //This checks which credit limit to use (if TotalBillAmount is less than IpCreditLimit itself use IpCreditLimit only and update its value as well)
                    if (TotalBillAmount <= patientSchemeMap.IpCreditLimit)
                    {
                        patientSchemeMap.IpCreditLimit = patientSchemeMap.IpCreditLimit - TotalBillAmount;
                        patientSchemeMap.ModifiedOn = currentDate;
                        patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                        dbContext.SaveChanges();
                    }
                    //(if TotalBillAmount is more than IpCreditLimit and there is OPCreditlimit remaining then use both and update there value as well)
                    else if (TotalBillAmount > patientSchemeMap.IpCreditLimit && patientSchemeMap.OpCreditLimit > 0)
                    {
                        TotalBillAmount = TotalBillAmount - patientSchemeMap.IpCreditLimit;
                        patientSchemeMap.IpCreditLimit = 0;
                        patientSchemeMap.OpCreditLimit = (decimal)(patientSchemeMap.OpCreditLimit - TotalBillAmount);
                        patientSchemeMap.ModifiedOn = currentDate;
                        patientSchemeMap.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(patientSchemeMap).Property(p => p.IpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.OpCreditLimit).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(patientSchemeMap).Property(p => p.ModifiedBy).IsModified = true;
                        dbContext.SaveChanges();
                    }
                }
                else
                {
                    throw new Exception("Credit Limit is less than total bill amount");
                }
            }
        }

        #region Update PatientMapPriceCategory For Medicare Patient Billing only
        private static void UpdatePatientMapPriceCategoryForMedicarePatientBilling(BillingTransactionModel billingTransaction, VisitModel patientVisit, DischargeDbContext dbContext, DateTime currentDate, RbacUser currentUser)
        {
            if (billingTransaction.CoPaymentCreditAmount > 0 && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.outpatient.ToLower()))
            {
                PatientSchemeMapModel patientMapPriceCategory = new PatientSchemeMapModel();
                patientMapPriceCategory = dbContext.PatientSchemes.Where(a => a.PatientSchemeId == billingTransaction.PatientMapPriceCategoryId).FirstOrDefault();
                if (patientMapPriceCategory != null && patientMapPriceCategory.OpCreditLimit > 0)
                {
                    patientMapPriceCategory.OpCreditLimit = patientMapPriceCategory.OpCreditLimit - (decimal)billingTransaction.CoPaymentCreditAmount;
                    patientMapPriceCategory.ModifiedOn = currentDate;
                    patientMapPriceCategory.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientMapPriceCategory).Property(p => p.OpCreditLimit).IsModified = true;
                    dbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
            }

            if (billingTransaction.CoPaymentCreditAmount > 0 && (patientVisit != null && patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower()))
            {
                PatientSchemeMapModel patientMapPriceCategory = new PatientSchemeMapModel();
                patientMapPriceCategory = dbContext.PatientSchemes.Where(a => a.PatientSchemeId == billingTransaction.PatientMapPriceCategoryId).FirstOrDefault();
                if (patientMapPriceCategory != null && patientMapPriceCategory.IpCreditLimit > 0)
                {
                    patientMapPriceCategory.IpCreditLimit = patientMapPriceCategory.IpCreditLimit - (decimal)billingTransaction.CoPaymentCreditAmount;
                    patientMapPriceCategory.ModifiedOn = currentDate;
                    patientMapPriceCategory.ModifiedBy = currentUser.EmployeeId;

                    dbContext.Entry(patientMapPriceCategory).Property(p => p.IpCreditLimit).IsModified = true;
                    dbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedOn).IsModified = true;
                    dbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedBy).IsModified = true;
                    dbContext.SaveChanges();
                }
            }
        }
        #endregion

        #region Update Medicare Member Balance
        private static void UpdateMedicareMemberBalance(BillingTransactionModel billingTransaction, VisitModel patientVisit, DischargeDbContext dbContext, DateTime currentDate, RbacUser currentUser)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();
            var medicareMember = dbContext.MedicareMembers.FirstOrDefault(a => a.PatientId == billingTransaction.PatientId);
            if (medicareMember != null && medicareMember.IsDependent == false)
            {
                medicareMemberBalance = dbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.MedicareMemberId);
            }
            if (medicareMember != null && medicareMember.IsDependent == true)
            {
                medicareMemberBalance = dbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.ParentMedicareMemberId);
            }
            if (patientVisit != null)
            {
                if (patientVisit.VisitType.ToLower() == ENUM_VisitType.outpatient.ToLower())
                {
                    if (medicareMemberBalance.OpBalance >= (decimal)billingTransaction.TotalAmount)
                    {
                        medicareMemberBalance.OpBalance = (medicareMemberBalance.OpBalance - (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.OpUsedAmount = (medicareMemberBalance.OpUsedAmount + (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.ModifiedOn = currentDate;
                        medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(medicareMemberBalance).Property(p => p.OpBalance).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.OpUsedAmount).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                        dbContext.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("Op Balance for Medicare Member is less than Total Bill Amount");
                    }
                }
                if (patientVisit.VisitType.ToLower() == ENUM_VisitType.inpatient.ToLower())
                {
                    if (medicareMemberBalance.IpBalance >= (decimal)billingTransaction.TotalAmount)
                    {
                        medicareMemberBalance.IpBalance = (medicareMemberBalance.IpBalance - (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.IpUsedAmount = (medicareMemberBalance.IpUsedAmount + (decimal)billingTransaction.TotalAmount);
                        medicareMemberBalance.ModifiedOn = currentDate;
                        medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Entry(medicareMemberBalance).Property(p => p.IpBalance).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.IpUsedAmount).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                        dbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                        dbContext.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("Ip Balance for Medicare Member is less than Total Bill Amount");
                    }
                }
            }

        }
        #endregion

        private void GenerateInvoiceNoAndSaveInvoice(BillingTransactionModel billingTransaction, DischargeDbContext dbContext)
        {
            try
            {
                billingTransaction.InvoiceNo = GetInvoiceNumber(dbContext);
                //if(invoiceNoTest == 1) { billingTransaction.InvoiceNo = 258017; invoiceNoTest++; }//logic to test the duplicate invoice no and retry to get the latest invoiceNo
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dbContext);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;

            }
        }
        private int GetInvoiceNumber(DischargeDbContext dischargeDbContext)
        {
            int fiscalYearId = GetFiscalYear(dischargeDbContext);
            int invoiceNumber = (from txn in dischargeDbContext.BillingTransactions
                                 where txn.FiscalYearId == fiscalYearId
                                 select txn.InvoiceNo).DefaultIfEmpty(0).Max();

            return invoiceNumber + 1;
        }

        //post to BIL_TXN_BillingTransactionItems
        private List<BillingTransactionItemModel> PostUpdateBillingTransactionItems(DischargeDbContext dbContext,
            List<BillingTransactionItemModel> billingTransactionItems,
            RbacUser currentUser,
            DateTime currentDate,
            string billStatus,
            int counterId,
            int DischargeStatementId,
             int? billingTransactionId = null
             )
        {

            BillingFiscalYear fiscYear = GetFiscalYearObject(dbContext);

            var srvDepts = dbContext.ServiceDepartment.ToList();
            //var empList = masterDbContext.Employees.ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
                // we are using this only for Provisional billing hence we can use first element to check billing status..
                int? ProvisionalReceiptNo = null;
                if (billingTransactionItems[0].BillStatus == ENUM_BillingStatus.provisional)
                {
                    ProvisionalReceiptNo = GetProvisionalReceiptNo(dbContext);
                }
                for (int i = 0; i < billingTransactionItems.Count; i++)
                {
                    var txnItem = billingTransactionItems[i];
                    if (txnItem.BillingTransactionItemId == 0)
                    {
                        //if (string.IsNullOrEmpty(txnItem.LabTypeName))
                        //{
                        //    txnItem.LabTypeName = "op-lab";
                        //}
                        txnItem.CreatedOn = currentDate;
                        txnItem.CreatedBy = currentUser.EmployeeId;
                        txnItem.RequisitionDate = currentDate;
                        txnItem.CounterId = counterId;
                        txnItem.BillingTransactionId = billingTransactionId;
                        if (txnItem.BillStatus == ENUM_BillingStatus.provisional) // "provisional")
                        {
                            txnItem.ProvisionalReceiptNo = ProvisionalReceiptNo;
                            txnItem.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                            txnItem.ProvFiscalYear = fiscYear.FiscalYearFormatted; //not mapped
                        }

                        //assign providername and servicedepartmentname to each of the incoming transaction items.
                        //Needs Revision: 12-12-17: sud: I think we don't need to get providername since that property already comes from client side: 
                        //txnItem.ProviderName = (from a in empList where a.EmployeeId == txnItem.ProviderId select a.FullName).FirstOrDefault();
                        txnItem.ServiceDepartmentName = (from b in srvDepts where b.ServiceDepartmentId == txnItem.ServiceDepartmentId select b.ServiceDepartmentName).FirstOrDefault();

                        txnItem = GetBillStatusMapped(txnItem, billStatus, currentDate, currentUser.EmployeeId, counterId);
                        //UpdateRequisitionItemsBillStatus(dbContext, txnItem.ServiceDepartmentName, billStatus, currentUser, txnItem.RequisitionId, currentDate);
                        dbContext.BillingTransactionItems.Add(txnItem);
                    }
                    else
                    {
                        txnItem = UpdateTxnItemBillStatus(dbContext, txnItem, billStatus, currentUser, currentDate, counterId, billingTransactionId, DischargeStatementId);
                    }


                    //update the Requisitions billingstatus as 'paid' for above items. 
                    //List<Int32?> requisitionIds = (from a in billTranItems select a.BillItemRequisitionId).ToList();
                    BillItemRequisition billItemRequisition = (from bill in dbContext.BillItemRequisitions
                                                               where bill.RequisitionId == txnItem.RequisitionId
                                                               && bill.ServiceDepartmentId == txnItem.ServiceDepartmentId
                                                               select bill).FirstOrDefault();
                    if (billItemRequisition != null)
                    {
                        billItemRequisition.BillStatus = "paid";
                        dbContext.Entry(billItemRequisition).State = System.Data.Entity.EntityState.Modified;
                    }
                }
                dbContext.SaveChanges();
            }
            else
            {
                throw new Exception("BillingTranscation Items is null");
            }
            return billingTransactionItems;
        }

        private static BillingTransactionItemModel GetBillStatusMapped(BillingTransactionItemModel billItem,
    string billStatus,
    DateTime? currentDate,
    int userId,
    int? counterId)
        {
            if (billStatus == ENUM_BillingStatus.paid) //"paid")
            {
                billItem.PaidDate = currentDate;
                billItem.BillStatus = ENUM_BillingStatus.paid;// "paid";
                billItem.PaymentReceivedBy = userId;
                billItem.PaidCounterId = counterId;

            }
            else if (billStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                billItem.PaidDate = null;
                billItem.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
                billItem.PaidCounterId = null;
                billItem.PaymentReceivedBy = null;

            }
            else if (billStatus == ENUM_BillingStatus.cancel)// "cancel")
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                billItem.CancelledOn = currentDate;
            }
            else if (billStatus == ENUM_BillingStatus.returned)//"returned")
            {
                billItem.ReturnStatus = true;
                billItem.ReturnQuantity = billItem.Quantity;//all items will be returned            
            }
            else if (billStatus == "adtCancel") // if admission cancelled
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = "adtCancel";
                billItem.CancelledOn = currentDate;
            }
            return billItem;
        }
        //updates billStatus in respective tables.
        private static void UpdateRequisitionItemsBillStatus(DischargeDbContext dischargeDbContext,
            string serviceDepartmentName,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            int billingTransactionItemId,
            DateTime? modifiedDate,
            int? patientVisitId)
        {

            string integrationName = dischargeDbContext.ServiceDepartment
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update return status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = dischargeDbContext.LabRequisitions.Where(req => req.BillingTransactionItemId == billingTransactionItemId).FirstOrDefault();
                    if (labItem != null)
                    {
                        labItem.BillingStatus = billStatus;
                        labItem.ModifiedOn = modifiedDate;
                        labItem.ModifiedBy = currentUser.EmployeeId;
                        dischargeDbContext.Entry(labItem).Property(a => a.BillingStatus).IsModified = true;
                        dischargeDbContext.Entry(labItem).Property(a => a.ModifiedOn).IsModified = true;
                        dischargeDbContext.Entry(labItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Radiology
                else if (integrationName.ToLower() == "radiology")
                {
                    var radioItem = dischargeDbContext.RadiologyImagingRequisitions.Where(req => req.BillingTransactionItemId == billingTransactionItemId).FirstOrDefault();
                    if (radioItem != null)
                    {
                        radioItem.BillingStatus = billStatus;
                        radioItem.ModifiedOn = modifiedDate;
                        radioItem.ModifiedBy = currentUser.EmployeeId;
                        dischargeDbContext.Entry(radioItem).Property(a => a.BillingStatus).IsModified = true;
                        dischargeDbContext.Entry(radioItem).Property(a => a.ModifiedOn).IsModified = true;
                        dischargeDbContext.Entry(radioItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Visit
                else if (integrationName.ToLower() == "opd" || integrationName.ToLower() == "er")
                {
                    var visitItem = dischargeDbContext.Visit.Where(vis => vis.PatientVisitId == patientVisitId).FirstOrDefault();
                    if (visitItem != null)
                    {
                        visitItem.BillingStatus = billStatus;
                        visitItem.ModifiedOn = modifiedDate;
                        visitItem.ModifiedBy = currentUser.EmployeeId;
                        dischargeDbContext.Entry(visitItem).Property(a => a.BillingStatus).IsModified = true;
                        dischargeDbContext.Entry(visitItem).Property(a => a.ModifiedOn).IsModified = true;
                        dischargeDbContext.Entry(visitItem).Property(a => a.ModifiedBy).IsModified = true;
                    }
                }

                dischargeDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                dischargeDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

                dischargeDbContext.SaveChanges();
            }


        }


        private static void AddEmpCashtransactionForBilling(DischargeDbContext dbContext, List<EmpCashTransactionModel> empCashTransaction) //This is for testing need to merge this into above function....
        {
            try
            {
                for (int i = 0; i < empCashTransaction.Count; i++)
                {
                    EmpCashTransactionModel empCashTxn = new EmpCashTransactionModel();
                    empCashTxn.TransactionType = empCashTransaction[i].TransactionType;
                    empCashTxn.ReferenceNo = empCashTransaction[i].ReferenceNo;
                    empCashTxn.EmployeeId = empCashTransaction[i].EmployeeId;
                    empCashTxn.InAmount = empCashTransaction[i].InAmount;
                    empCashTxn.OutAmount = empCashTransaction[i].OutAmount;
                    empCashTxn.Description = empCashTransaction[i].Description;
                    empCashTxn.TransactionDate = empCashTransaction[i].TransactionDate;
                    empCashTxn.CounterID = empCashTransaction[i].CounterID;
                    empCashTxn.IsActive = true;
                    empCashTxn.ModuleName = empCashTransaction[i].ModuleName;
                    empCashTxn.PatientId = empCashTransaction[i].PatientId;
                    empCashTxn.PaymentModeSubCategoryId = empCashTransaction[i].PaymentModeSubCategoryId;
                    empCashTxn.Remarks = empCashTransaction[i].Remarks;
                    dbContext.EmpCashTransactions.Add(empCashTxn);
                }
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        private int? GetDepositReceiptNo(DischargeDbContext dischargeDbContext)
        {

            //This is to get the uncommited row data (ReceiptNo).
            //using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            //{
            //}
                int fiscalYearId = GetFiscalYear(dischargeDbContext);
                int? receiptNo = (from depTxn in dischargeDbContext.BillingDeposits
                                  where depTxn.FiscalYearId == fiscalYearId
                                  select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

                return receiptNo + 1;
        }

        private static void AddEmpCashTransaction(DischargeDbContext dbContext, EmpCashTransactionModel empCashTransaction)
        {
            try
            {
                EmpCashTransactionModel empCashTxn = new EmpCashTransactionModel();
                empCashTxn.TransactionType = empCashTransaction.TransactionType;
                empCashTxn.ReferenceNo = empCashTransaction.ReferenceNo;
                empCashTxn.EmployeeId = empCashTransaction.EmployeeId;
                empCashTxn.InAmount = empCashTransaction.InAmount;
                empCashTxn.OutAmount = empCashTransaction.OutAmount;
                empCashTxn.Description = empCashTransaction.Description;
                empCashTxn.TransactionDate = empCashTransaction.TransactionDate;
                empCashTxn.CounterID = empCashTransaction.CounterID;
                empCashTxn.IsActive = true;
                empCashTxn.ModuleName = empCashTransaction.ModuleName;
                empCashTxn.PatientId = empCashTransaction.PatientId;
                empCashTxn.PaymentModeSubCategoryId = empCashTransaction.PaymentModeSubCategoryId;
                dbContext.EmpCashTransactions.Add(empCashTxn);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        private static BillingTransactionItemModel UpdateTxnItemBillStatus(DischargeDbContext dischargeDbContext, BillingTransactionItemModel billItem, string billStatus, RbacUser currentUser, DateTime? modifiedDate = null, int? counterId = null, int? billingTransactionId = null, int? DischargeStatementId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;

            billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
            dischargeDbContext.BillingTransactionItems.Attach(billItem);
            //update returnstatus and returnquantity
            if (billStatus == "paid")
            {
                dischargeDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
            }
            else if (billStatus == "unpaid")
            {

                dischargeDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
            }
            else if (billStatus == "cancel")
            {

                dischargeDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "adtCancel")
            {

                dischargeDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "returned")
            {
                dischargeDbContext.Entry(billItem).Property(a => a.ReturnStatus).IsModified = true;
                dischargeDbContext.Entry(billItem).Property(a => a.ReturnQuantity).IsModified = true;
            }

            if (billItem.BillingTransactionId == null)
            {
                billItem.BillingTransactionId = billingTransactionId;
                dischargeDbContext.Entry(billItem).Property(b => b.BillingTransactionId).IsModified = true;
            }
            if (DischargeStatementId != null)
            {
                billItem.DischargeStatementId = DischargeStatementId;
                dischargeDbContext.Entry(billItem).Property(b => b.DischargeStatementId).IsModified = true;
            }

            //these fields could also be changed during update.
            dischargeDbContext.Entry(billItem).Property(b => b.BillStatus).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.Price).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.DiscountPercent).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.DiscountPercentAgg).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.DiscountSchemeId).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.PerformerId).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.PerformerName).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.PatientVisitId).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.CoPaymentCashAmount).IsModified = true;
            dischargeDbContext.Entry(billItem).Property(a => a.CoPaymentCreditAmount).IsModified = true;
            dischargeDbContext.SaveChanges();


            UpdateRequisitionItemsBillStatus(dischargeDbContext, billItem.ServiceDepartmentName, billStatus, currentUser, billItem.BillingTransactionItemId, modifiedDate, billItem.PatientVisitId);

            //update bill status in BillItemRequistion (Order Table)
            BillItemRequisition billItemRequisition = (from bill in dischargeDbContext.BillItemRequisitions
                                                       where bill.RequisitionId == billItem.RequisitionId
                                                       && bill.ServiceDepartmentId == billItem.ServiceDepartmentId
                                                       select bill).FirstOrDefault();
            if (billItemRequisition != null)
            {
                billItemRequisition.BillStatus = billStatus;
                dischargeDbContext.Entry(billItemRequisition).Property(a => a.BillStatus).IsModified = true;
            }
            return billItem;
        }

        private void SyncBillToRemoteServer(object billToPost, string billType, DischargeDbContext dbContext)
        {
            IRDLogModel irdLog = new IRDLogModel();
            if (billType == "sales")
            {

                string responseMsg = null;
                BillingTransactionModel billTxn = (BillingTransactionModel)billToPost;
                try
                {
                    IRD_BillViewModel bill = IRD_BillViewModel.GetMappedSalesBillForIRD(billTxn, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(bill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesBillToIRD(bill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.BillingTransactions.Attach(billTxn);
                if (responseMsg == "200")
                {
                    billTxn.IsRealtime = true;
                    billTxn.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    billTxn.IsRealtime = false;
                    billTxn.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(billTxn).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billTxn).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = "billing-" + billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
            else if (billType == "sales-return")
            {
                BillInvoiceReturnModel billRet = (BillInvoiceReturnModel)billToPost;

                string responseMsg = null;
                try
                {
                    IRD_BillReturnViewModel salesRetBill = IRD_BillReturnViewModel.GetMappedSalesReturnBillForIRD(billRet, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(salesRetBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesReturnBillToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.BillInvoiceReturns.Attach(billRet);
                if (responseMsg == "200")
                {
                    billRet.IsRealtime = true;
                    billRet.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    billRet.IsRealtime = false;
                    billRet.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(billRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();
                irdLog.BillType = "billing-" + billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
        }

        //this function post IRD posting log details to Danphe IRD_Log table
        private void PostIRDLog(IRDLogModel irdLogdata, DischargeDbContext dbContext)
        {
            try
            {
                irdLogdata.CreatedOn = DateTime.Now;

                string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                switch (irdLogdata.BillType)
                {
                    case "billing-sales":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }
                    case "billing-sales-return":
                        {
                            string api_SalesReturnIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesReturnIRDNepal;
                            break;
                        }
                }
                dbContext.IRDLog.Add(irdLogdata);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {

            }
        }

        //method to return inner most exception 
        private string GetInnerMostException(Exception ex)
        {
            Exception currentEx = ex;
            while (currentEx.InnerException != null)
            {
                currentEx = currentEx.InnerException;
            }
            return currentEx.Message;
        }

        private int? GetProvisionalReceiptNo(DischargeDbContext dischargeDbContext)
        {
            int fiscalYearId = GetFiscalYear(dischargeDbContext);
            int? receiptNo = (from txnItems in dischargeDbContext.BillingTransactionItems
                              where txnItems.ProvisionalFiscalYearId == fiscalYearId
                              select txnItems.ProvisionalReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }


        private object SaveFinalInvoiceOfPharmacyProvisionalAndDischarge(List<PharmacyPendingBillItem> phrmPendingInvoiceItems, RbacUser currentUser, int? DischargeStatementId, int SchemeId, DischargeDbContext dischargeDbContext)
        {

            PHRMInvoiceTransactionModel invoiceObjFromClient = new PHRMInvoiceTransactionModel();
            List<PHRMInvoiceTransactionItemsModel> invoiceItems = new List<PHRMInvoiceTransactionItemsModel>();

            try
            {
                var currFiscalYearId = GetFiscalYear(dischargeDbContext);
                var currentDate = DateTime.Now;

                var InvoiceItemIds = phrmPendingInvoiceItems.Select(a => a.InvoiceItemId).ToList();

                invoiceObjFromClient.InvoiceItems = dischargeDbContext.PHRMInvoiceTransactionItems.Where(invtxn => InvoiceItemIds.Contains(invtxn.InvoiceItemId)).ToList();

                invoiceObjFromClient.InvoiceItems.ForEach(itm => itm.DischargeStatementId = DischargeStatementId);

                List<PHRMInvoiceTransactionItemsModel> invoiceItemsFromClient = invoiceObjFromClient.InvoiceItems;

                SaveInvoice(phrmPendingInvoiceItems, currentUser, invoiceObjFromClient, currFiscalYearId, currentDate, invoiceItemsFromClient, SchemeId, dischargeDbContext);

                SaveInvoiceItems(currentUser, dischargeDbContext, invoiceObjFromClient, currFiscalYearId, currentDate, invoiceItemsFromClient);

                invoiceObjFromClient.InvoiceItems = invoiceItemsFromClient;

                invoiceObjFromClient = PostToIRD(dischargeDbContext, invoiceObjFromClient);

                return invoiceObjFromClient;

            }

            catch (Exception ex)
            {
                throw new Exception("Invoice details is null or failed to Save. Exception Detail: " + ex.Message.ToString());
            }

        }

        private PHRMInvoiceTransactionModel PostToIRD(DischargeDbContext dischargeDbContext, PHRMInvoiceTransactionModel invoiceObjFromClient)
        {
            if (realTimeRemoteSyncEnabled)
            {
                if (invoiceObjFromClient.IsRealtime == null)
                {
                    PHRMInvoiceTransactionModel invoiceSale = dischargeDbContext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == invoiceObjFromClient.InvoiceId).FirstOrDefault();
                    invoiceObjFromClient = invoiceSale;
                }
                if (invoiceObjFromClient.IsReturn == null)
                {
                    //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                    Task.Run(() => SyncPHRMBillInvoiceToRemoteServer(invoiceObjFromClient, "phrm-invoice", dischargeDbContext));
                }
            }

            return invoiceObjFromClient;
        }

        private void SaveInvoiceItems(RbacUser currentUser, DischargeDbContext dischargeDbContext, PHRMInvoiceTransactionModel invoiceObjFromClient, int currFiscalYearId, DateTime currentDate, List<PHRMInvoiceTransactionItemsModel> invoiceItemsFromClient)
        {
            PHRMInvoiceTransactionItemsModel itemFromServer = new PHRMInvoiceTransactionItemsModel();
            foreach (PHRMInvoiceTransactionItemsModel itmFromClient in invoiceItemsFromClient)
            {
                itemFromServer = dischargeDbContext.PHRMInvoiceTransactionItems.Where(itm => itm.InvoiceItemId == itmFromClient.InvoiceItemId).FirstOrDefault();
                if (itemFromServer != null)
                {
                    itemFromServer.InvoiceId = invoiceObjFromClient.InvoiceId;

                    if (invoiceObjFromClient.PaymentMode == ENUM_BillPaymentMode.cash)
                    {
                        itemFromServer.BilItemStatus = ENUM_PHRM_InvoiceItemBillStatus.Paid;
                    }
                    else
                    {
                        itemFromServer.BilItemStatus = ENUM_PHRM_InvoiceItemBillStatus.Unpaid;
                    }

                    //To update the Discount Percentage and totalDisAmount if changes comes from frontend
                    itemFromServer.Quantity = itmFromClient.Quantity;
                    itemFromServer.SubTotal = itmFromClient.SubTotal;
                    itemFromServer.DiscountPercentage = itmFromClient.DiscountPercentage;
                    itemFromServer.TotalDisAmt = itmFromClient.TotalDisAmt;
                    itemFromServer.VATAmount = itmFromClient.VATAmount;
                    itemFromServer.TotalAmount = itmFromClient.TotalAmount;
                    itemFromServer.DischargeStatementId = itmFromClient.DischargeStatementId;
                    dischargeDbContext.SaveChanges();


                    //to update client side
                    if (invoiceObjFromClient.PaymentMode == ENUM_BillPaymentMode.cash)
                    {
                        itmFromClient.BilItemStatus = ENUM_PHRM_InvoiceItemBillStatus.Paid;
                    }
                    else
                    {
                        itmFromClient.BilItemStatus = ENUM_PHRM_InvoiceItemBillStatus.Unpaid;
                    }
                    itmFromClient.InvoiceId = itemFromServer.InvoiceId;

                }

                UpdateStock(currentUser, currFiscalYearId, currentDate, itemFromServer, itmFromClient, dischargeDbContext);
            }
        }


        private void UpdateStock(RbacUser currentUser, int currFiscalYearId, DateTime currentDate, PHRMInvoiceTransactionItemsModel itemFromServer, PHRMInvoiceTransactionItemsModel itmFromClient, DischargeDbContext dischargeDbContext)
        {
            var provisionalSaleTxn = ENUM_PHRM_StockTransactionType.ProvisionalSaleItem;
            var provisionalCancelTxn = ENUM_PHRM_StockTransactionType.ProvisionalCancelItem;
            // find the total sold stock, substract with total returned stock
            var allStockTxnsForThisInvoiceItem = dischargeDbContext.StockTransactions
                                                            .Where(s => (s.ReferenceNo == itemFromServer.InvoiceItemId && s.TransactionType == provisionalSaleTxn)
                                                            || (s.ReferenceNo == itemFromServer.InvoiceItemId && s.TransactionType == provisionalCancelTxn)).ToList();

            // if-guard
            // the provToSale Qty must be equal to the (outQty-inQty) of the stock transactions, otherwise, there might be an issue
            var provToSaleQtyForThisInvoice = allStockTxnsForThisInvoiceItem.Sum(s => s.OutQty - s.InQty);
            if (itmFromClient.Quantity != provToSaleQtyForThisInvoice)
                throw new InvalidOperationException($"Failed. Item: {itmFromClient.ItemName} with Batch: {itmFromClient.BatchNo} has quantity mismatch. ");
            // Find the stock that was sold
            var storeStockIdList = allStockTxnsForThisInvoiceItem.Select(s => s.StoreStockId).Distinct().ToList();
            var soldByStoreId = allStockTxnsForThisInvoiceItem[0].StoreId;
            var storeStockList = dischargeDbContext.StoreStocks.Include(s => s.StockMaster).Where(s => storeStockIdList.Contains((int)s.StoreStockId) && s.StoreId == soldByStoreId).ToList();

            foreach (var storeStock in storeStockList)
            {
                // add a provisional-to-sale stock transaction with quantity = (sold qty - previously returned qty)
                var provToSaleQty = allStockTxnsForThisInvoiceItem.Where(s => s.StoreStockId == storeStock.StoreStockId).Sum(s => s.OutQty - s.InQty);
                if (provToSaleQty == 0) // by pass the same stock with same StockId with same batch and Expiry and SalePrice ie (that item is prov sale and return already);
                {
                    continue;
                }

                var provToSaleTxn = new PHRMStockTransactionModel(
                                           storeStock: storeStock,
                                           transactionType: ENUM_PHRM_StockTransactionType.ProvisionalToSale,
                                           transactionDate: currentDate,
                                           referenceNo: itemFromServer.InvoiceItemId,
                                           createdBy: currentUser.EmployeeId,
                                           createdOn: currentDate,
                                           fiscalYearId: currFiscalYearId
                                           );
                provToSaleTxn.SetInOutQuantity(inQty: provToSaleQty, outQty: 0);

                // add a sale-item stock transaction with quantity = (sold qty - previously returned qty)
                var SaleTxn = new PHRMStockTransactionModel(
                                           storeStock: storeStock,
                                           transactionType: ENUM_PHRM_StockTransactionType.SaleItem,
                                           transactionDate: currentDate,
                                           referenceNo: itemFromServer.InvoiceItemId,
                                           createdBy: currentUser.EmployeeId,
                                           createdOn: currentDate,
                                           fiscalYearId: currFiscalYearId
                                           );
                SaleTxn.SetInOutQuantity(inQty: 0, outQty: provToSaleQty);
                // add to db
                dischargeDbContext.StockTransactions.Add(provToSaleTxn);
                dischargeDbContext.StockTransactions.Add(SaleTxn);
            }
            dischargeDbContext.SaveChanges();
        }

        private void SaveInvoice(List<PharmacyPendingBillItem> phrmPendingInvoiceItems, RbacUser currentUser, PHRMInvoiceTransactionModel invoiceObjFromClient, int currFiscalYearId, DateTime currentDate, List<PHRMInvoiceTransactionItemsModel> invoiceItemsFromClient, int SchemeId, DischargeDbContext dischargeDbContext)
        {
            try
            {
                invoiceObjFromClient.InvoiceItems = null;
                invoiceObjFromClient.IsOutdoorPat = false;
                invoiceObjFromClient.PatientId = dischargeDbContext.PHRMInvoiceTransactionItems.Find(invoiceItemsFromClient[0].InvoiceItemId).PatientId;
                invoiceObjFromClient.CreateOn = currentDate;
                invoiceObjFromClient.CreatedBy = currentUser.EmployeeId;
                invoiceObjFromClient.InvoicePrintId = GetPharmacyInvoiceNumber(dischargeDbContext);
                invoiceObjFromClient.FiscalYearId = currFiscalYearId;
                invoiceObjFromClient.BilStatus = invoiceObjFromClient.PaymentMode == ENUM_BillPaymentMode.credit ? ENUM_BillingStatus.unpaid : ENUM_BillingStatus.paid;
                invoiceObjFromClient.TotalAmount = (decimal)invoiceItemsFromClient.Sum(a => a.TotalAmount);
                invoiceObjFromClient.SubTotal = (decimal)invoiceItemsFromClient.Sum(a => a.SubTotal);
                invoiceObjFromClient.DiscountAmount = (decimal)invoiceItemsFromClient.Sum(a => a.TotalDisAmt);
                invoiceObjFromClient.StoreId = invoiceItemsFromClient.FirstOrDefault().StoreId;
                invoiceObjFromClient.CounterId = (int)invoiceItemsFromClient.FirstOrDefault().CounterId;
                invoiceObjFromClient.PatientVisitId = phrmPendingInvoiceItems.FirstOrDefault().PatientVisitId;
                invoiceObjFromClient.PrescriberId = phrmPendingInvoiceItems.FirstOrDefault().PrescriberId;
                invoiceObjFromClient.VisitType = invoiceItemsFromClient.FirstOrDefault().VisitType;
                invoiceObjFromClient.PaidDate = currentDate;
                invoiceObjFromClient.PaymentMode = ENUM_BillPaymentMode.cash;
                invoiceObjFromClient.PaidAmount = invoiceObjFromClient.TotalAmount;
                invoiceObjFromClient.Tender = invoiceObjFromClient.TotalAmount;
                invoiceObjFromClient.Change = 0;
                invoiceObjFromClient.Adjustment = 0;
                invoiceObjFromClient.PrintCount = 0;
                //invoiceItemsFromClient

                if (invoiceObjFromClient.PaymentMode == ENUM_BillPaymentMode.credit)
                {
                    invoiceObjFromClient.Creditdate = currentDate;
                    invoiceObjFromClient.ReceivedAmount = 0;
                }
                else
                {
                    invoiceObjFromClient.Creditdate = null;
                    invoiceObjFromClient.ReceivedAmount = (decimal)invoiceObjFromClient.TotalAmount;
                }
                dischargeDbContext.PHRMInvoiceTransaction.Add(invoiceObjFromClient);
                dischargeDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private void SyncPHRMBillInvoiceToRemoteServer(object billToPost, string billType, DischargeDbContext dbContext)
        {
            IRDLogModel irdLog = new IRDLogModel();
            if (billType == "phrm-invoice")
            {

                string responseMsg = null;
                PHRMInvoiceTransactionModel invoiceTxn = (PHRMInvoiceTransactionModel)billToPost;
                try
                {
                    invoiceTxn.PANNumber = GetPANNumber(dbContext, invoiceTxn.PatientId);
                    invoiceTxn.ShortName = GetShortName(dbContext, invoiceTxn.PatientId);
                    invoiceTxn.FiscalYear = GetFiscalYearNameById(dbContext, invoiceTxn.FiscalYearId);
                    IRD_PHRMBillSaleViewModel invoicebill = IRD_PHRMBillSaleViewModel.GetMappedInvoiceForIRD(invoiceTxn, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(invoicebill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceToIRD(invoicebill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PHRMInvoiceTransaction.Attach(invoiceTxn);
                if (responseMsg == "200")
                {
                    invoiceTxn.IsRealtime = true;
                    invoiceTxn.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    invoiceTxn.IsRealtime = false;
                    invoiceTxn.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(invoiceTxn).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(invoiceTxn).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = billType;
                irdLog.ResponseMessage = responseMsg;
                PHRMPostIRDLog(irdLog, dbContext);
            }
            else if (billType == "phrm-invoice-return")
            {
                PHRMInvoiceTransactionModel invoiceRet = (PHRMInvoiceTransactionModel)billToPost;

                string responseMsg = null;
                try
                {
                    invoiceRet.PANNumber = GetPANNumber(dbContext, invoiceRet.PatientId);
                    invoiceRet.ShortName = GetShortName(dbContext, invoiceRet.PatientId);
                    invoiceRet.FiscalYear = GetFiscalYearNameById(dbContext, invoiceRet.FiscalYearId);
                    IRD_PHRMBillSaleReturnViewModel salesRetBill = IRD_PHRMBillSaleReturnViewModel.GetMappedPhrmSalesReturnBillForIRD(invoiceRet, true);
                    salesRetBill.credit_note_number = GetCreditNoteNumberByInvoiceId(dbContext, invoiceRet.InvoiceId).ToString();
                    irdLog.JsonData = JsonConvert.SerializeObject(salesRetBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceReturnToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PHRMInvoiceTransaction.Attach(invoiceRet);
                if (responseMsg == "200")
                {

                    invoiceRet.IsRealtime = true;
                    invoiceRet.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    invoiceRet.IsRealtime = false;
                    invoiceRet.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(invoiceRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(invoiceRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();
                irdLog.BillType = billType;
                irdLog.ResponseMessage = responseMsg;
                PHRMPostIRDLog(irdLog, dbContext);
            }
        }

        private static void PHRMPostIRDLog(IRDLogModel irdLogdata, DischargeDbContext dbContext)
        {
            try
            {
                irdLogdata.CreatedOn = DateTime.Now;

                string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                switch (irdLogdata.BillType)
                {
                    case "phrm-invoice":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }
                    case "phrm-invoice-return":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }

                }
                dbContext.IRDLog.Add(irdLogdata);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {

            }
        }

        private int GetPharmacyInvoiceNumber(DischargeDbContext dischargeDbContext)
        {
            int fiscalYearId = GetFiscalYear(dischargeDbContext);

            int invoiceNumber = (from txn in dischargeDbContext.PHRMInvoiceTransaction
                                 where txn.FiscalYearId == fiscalYearId
                                 select txn.InvoicePrintId).DefaultIfEmpty(0).Max();
            return invoiceNumber + 1;
        }

        private string GetFiscalYearNameById(DischargeDbContext dischargeDbContext, int? fiscalYearId)
        {
            return dischargeDbContext.PharmacyFiscalYears.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearName;
        }

        private string GetPANNumber(DischargeDbContext dbContext, int? PatientId)
        {
            try
            {
                return dbContext.PHRMPatient.Where(s => s.PatientId == PatientId).FirstOrDefault().PANNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private string GetShortName(DischargeDbContext dbContext, int? PatientId)
        {
            try
            {
                var pat = dbContext.PHRMPatient.Where(s => s.PatientId == PatientId).FirstOrDefault();
                return pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private int GetCreditNoteNumberByInvoiceId(DischargeDbContext dbContext, int? InvoiceId)
        {
            try
            {
                return (int)dbContext.PHRMInvoiceReturnItemsModel.Where(s => s.InvoiceId == InvoiceId).FirstOrDefault().CreditNoteNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



        private object GetBillItemsEstimationSummary(int patientId, int patientVisitId, int? dischargeStatementId)
        {
            return _dischargeDbContext.GetItemsForBillingDischargeSummaryReceipt(patientId, patientVisitId, dischargeStatementId, "provisional");
        }


    }

}



