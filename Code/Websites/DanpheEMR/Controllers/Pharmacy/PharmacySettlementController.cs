using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services.Pharmacy.DTOs.Settlement;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace DanpheEMR.Controllers.Pharmacy
{
    public class PharmacySettlementController : CommonController
    {
        private readonly PharmacyDbContext _phrmDbcontext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly MasterDbContext _masterDbContext;

        public PharmacySettlementController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _phrmDbcontext = new PharmacyDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
        }

        [HttpGet]
        [Route("PendingBills")]
        public IActionResult PendingBills(int storeId, int organizationId)
        {
            //else if (reqType == "pending-bills-for-settlements")
            //{
            List<SqlParameter> paramList = new List<SqlParameter>()
                        {
                            new SqlParameter("@StoreId", storeId),
                            new SqlParameter("@OrganizationId", organizationId)
                         };

            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_TXNS_PHRM_SettlementSummary", paramList, _phrmDbcontext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Settlements")]
        public IActionResult PharmacySettlements(int storeId, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "allPHRMSettlements" && storeId != 0)
            //{
            var realToDate = ToDate.AddDays(1);
            Func<object> func = () => (from sett in _phrmDbcontext.BillingSettlementModel
                                       join pat in _phrmDbcontext.PHRMPatient on sett.PatientId equals pat.PatientId
                                       where sett.StoreId == storeId
                                       select new
                                       {
                                           HospitalNo = pat.PatientCode,
                                           PatientName = pat.ShortName,
                                           DateOfBirth = pat.DateOfBirth,
                                           Gender = pat.Gender,
                                           ContactNumber = pat.PhoneNumber,
                                           SettlementDate = sett.SettlementDate,
                                           SettlementId = sett.SettlementId,
                                           ReceiptNo = sett.SettlementReceiptNo,
                                       }).OrderByDescending(s => s.ReceiptNo)
                                            .Where(s => s.SettlementDate > FromDate && s.SettlementDate < realToDate).ToList();

            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientUnpaidInvoices")]
        public IActionResult PatientUnpaidInvoices(int patientId, int organizationId)
        {
            // else if (reqType != null && reqType == "unpaidInvoiceByPatientId" && patientId != null && patientId != 0)
            //{

            Func<object> func = () => GetPatientsUnpaidInvoicesDetails(patientId, organizationId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PreviewInvoice")]
        public IActionResult PreviewInvoice(int invoiceId)
        {
            //else if (reqType == "get-settlement-single-invoice-preview")
            // {

            Func<object> func = () => GetInvoiceToPreview(invoiceId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientProvisionalItems")]
        public IActionResult PatientProvisionalItems(int patientId)
        {
            //else if (reqType != null && reqType == "provisionalItemsByPatientIdForSettle" && patientId != null && patientId != 0)
            //{
            Func<object> func = () => GetPatientProvisionalItems(patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DuplicatePrints")]
        public IActionResult DuplicatePrints()
        {
            //else if (reqType == "settlements-duplicate-prints")
            // {

            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_TXNS_PHRM_SettlementDuplicatePrint", _phrmDbcontext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("SettlementDetail")]
        public IActionResult SettlementDetail(int settlementId)
        {
            //else if (reqType == "get-settlements-duplicate-details")
            //{

            Func<object> func = () => GetSettlementDetails(settlementId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpPost]
        [Route("NewSettlement")]
        public IActionResult NewSettlement([FromBody] PharmacySettlement_DTO billNewSettlement_DTO)
        {
            // else if (reqType == "postSettlementInvoice")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            Func<object> func = () => AddNewSettlement(billNewSettlement_DTO, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("PrintCount")]
        public IActionResult PrintCount(int settlementId)
        {
            //else if (reqType == "updateSettlementPrintCount")
            //{

            Func<object> func = () => UpdatePrintCount(settlementId);
            return InvokeHttpPutFunction<object>(func);
        }

        private object UpdatePrintCount(int settlementId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int settlmntId = settlementId;
            var currSettlment = _phrmDbcontext.PHRMSettlements.Where(s => s.SettlementId == settlmntId).FirstOrDefault();
            if (currSettlment != null)
            {
                int? printCount = currSettlment.PrintCount.HasValue ? currSettlment.PrintCount : 0;
                printCount += 1;
                _phrmDbcontext.PHRMSettlements.Attach(currSettlment);
                currSettlment.PrintCount = printCount;
                currSettlment.PrintedOn = System.DateTime.Now;
                currSettlment.PrintedBy = currentUser.EmployeeId;
                _phrmDbcontext.Entry(currSettlment).Property(b => b.PrintCount).IsModified = true;
                _phrmDbcontext.SaveChanges();

                return new { SettlementId = settlementId, PrintCount = printCount };
            }
            else
            {
                throw new InvalidOperationException();
            }
        }

        private object AddNewSettlement(PharmacySettlement_DTO pharmacySettlement, RbacUser currentUser)
        {
            using (var dbTransaction = _phrmDbcontext.Database.BeginTransaction())
            {
                try
                {
                    DateTime currentDateTime = DateTime.Now;
                    BillSettlementModel settlement = MapSettlementData(pharmacySettlement);

                    List<PHRMInvoiceTransactionModel> newPharmacyTransactionList = new List<PHRMInvoiceTransactionModel>();
                    var pharmacyInvoices = pharmacySettlement.PHRMInvoiceTransactions;

                    foreach (var txn in pharmacyInvoices)
                    {
                        PHRMInvoiceTransactionModel newTxn = _phrmDbcontext.PHRMInvoiceTransaction.Where(b => b.InvoiceId == txn.InvoiceId).FirstOrDefault();
                        newPharmacyTransactionList.Add(newTxn);

                    }

                    SaveSettlement(pharmacySettlement, currentUser, settlement, currentDateTime, _phrmDbcontext);

                    if (newPharmacyTransactionList.Count > 0)
                    {
                        UpdatePharmacyCreditBillStatus(newPharmacyTransactionList, _phrmDbcontext, settlement.SettlementId, currentUser.EmployeeId);
                    }

                    SaveEmployeeCashTransactions(_phrmDbcontext, currentUser, connString, settlement, pharmacySettlement.PHRMEmployeeCashTransactions, currentDateTime, settlement.FiscalYearId);

                    UpdatePharmacyInvoiceAndItems(newPharmacyTransactionList, _phrmDbcontext, settlement, currentUser);

                    if (pharmacySettlement.PHRMReturnIdsCSV.Count > 0)
                    {
                        UpdatePharmacyInvoiceReturn(_phrmDbcontext, pharmacySettlement);
                    }

                    HandleDeposits(_phrmDbcontext, currentUser, settlement);

                    dbTransaction.Commit();

                    return pharmacySettlement;

                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw new Exception("Failed to save settlement" + ex.ToString());
                }
            }
        }

        private static BillSettlementModel MapSettlementData(PharmacySettlement_DTO pharmacySettlement)
        {
            return new BillSettlementModel()
            {
                PatientId = pharmacySettlement.PatientId,
                PayableAmount = pharmacySettlement.PayableAmount,
                RefundableAmount = pharmacySettlement.RefundableAmount,
                PaidAmount = pharmacySettlement.PaidAmount,
                ReturnedAmount = pharmacySettlement.ReturnedAmount,
                DepositDeducted = pharmacySettlement.DepositDeducted,
                DueAmount = pharmacySettlement.DueAmount,
                DiscountAmount = pharmacySettlement.DiscountAmount,
                PaymentMode = pharmacySettlement.PaymentMode,
                PaymentDetails = pharmacySettlement.PaymentDetails,
                CounterId = pharmacySettlement.CounterId,
                Remarks = pharmacySettlement.Remarks,
                IsActive = true,
                Patient = pharmacySettlement.Patient,
                CollectionFromReceivable = pharmacySettlement.CollectionFromReceivable,
                DiscountReturnAmount = pharmacySettlement.DiscountReturnAmount,
                OrganizationId = pharmacySettlement.OrganizationId,
                StoreId = pharmacySettlement.StoreId,

            };
        }

        private void SaveSettlement(PharmacySettlement_DTO pharmacySettlement, RbacUser currentUser, BillSettlementModel settlement, DateTime currentDateTime, PharmacyDbContext pharmacyDbContext)
        {
            settlement.SettlementReceiptNo = GetSettlementReceiptNo(_phrmDbcontext);
            settlement.CreatedBy = currentUser.EmployeeId;
            settlement.CreatedOn = currentDateTime;
            settlement.SettlementDate = currentDateTime;
            settlement.FiscalYearId = PharmacyBL.GetFiscalYear(pharmacyDbContext).FiscalYearId;
            settlement.ModuleName = ENUM_ModuleNames.Dispensary;
            pharmacyDbContext.BillingSettlementModel.Add(settlement);
            pharmacyDbContext.SaveChanges();
            pharmacySettlement.SettlementId = settlement.SettlementId;



            PHRMEmployeeCashTransaction empCashTransaction = new PHRMEmployeeCashTransaction()
            {
                TransactionType = ENUM_EMP_CashTransactinType.CollectionFromReceivable,
                ReferenceNo = settlement.SettlementId,
                InAmount = (decimal)settlement.PaidAmount,
                OutAmount = 0,
                EmployeeId = currentUser.EmployeeId,
                TransactionDate = currentDateTime,
                CounterID = settlement.CounterId,
                PatientId = settlement.PatientId,
                PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(pharmacyDbContext),
                ModuleName = ENUM_ModuleNames.Dispensary,
                FiscalYearId = PharmacyBL.GetFiscalYear(pharmacyDbContext).FiscalYearId
            };

            AddEmpCashTransaction(pharmacyDbContext, empCashTransaction);

        }

        private void UpdatePharmacyCreditBillStatus(List<PHRMInvoiceTransactionModel> newPharmacyTransactionList, PharmacyDbContext pharmacyDbContext, int settlementId, int employeeId)
        {
            try
            {
                if (newPharmacyTransactionList.Count > 0)
                {
                    var patientId = newPharmacyTransactionList[0].PatientId;
                    var invoiceIds = newPharmacyTransactionList.Select(a => a.InvoiceId);
                    List<PHRMTransactionCreditBillStatus> phrmCreditBillStatuses = pharmacyDbContext.PHRMTransactionCreditBillStatus
                                                                            .Where(a => a.PatientId == patientId && invoiceIds.Contains(a.InvoiceId))
                                                                            .ToList();
                    phrmCreditBillStatuses.ForEach(a =>
                    {
                        a.SettlementId = settlementId;
                        a.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                        a.ModifiedBy = employeeId;
                        a.ModifiedOn = DateTime.Now;

                        pharmacyDbContext.Entry(a).Property(p => p.SettlementId).IsModified = true;
                        pharmacyDbContext.Entry(a).Property(p => p.SettlementStatus).IsModified = true;
                        pharmacyDbContext.Entry(a).Property(p => p.ModifiedBy).IsModified = true;
                        pharmacyDbContext.Entry(a).Property(p => p.ModifiedOn).IsModified = true;

                    });
                    pharmacyDbContext.SaveChanges();
                }
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        private void SaveEmployeeCashTransactions(PharmacyDbContext pharmacyDbContext, RbacUser currentUser, string connString, BillSettlementModel settlement, List<PHRMEmployeeCashTransaction> empCashTransactionModel, DateTime currentDateTime, int fiscalYearId)
        {
            //CollectionFromReceivable as InAmount into EmpCashTranscation table...
            if (settlement.CollectionFromReceivable > 0)
            {
                List<PHRMEmployeeCashTransaction> empCashTransactionsList = new List<PHRMEmployeeCashTransaction>();
                for (int i = 0; i < empCashTransactionModel.Count; i++)
                {
                    PHRMEmployeeCashTransaction empCashTransaction = new PHRMEmployeeCashTransaction
                    {
                        TransactionType = ENUM_EMP_CashTransactinType.CollectionFromReceivable,
                        ReferenceNo = settlement.SettlementId,
                        InAmount = empCashTransactionModel[i].InAmount,
                        OutAmount = 0,
                        EmployeeId = currentUser.EmployeeId,
                        TransactionDate = currentDateTime,
                        CounterID = settlement.CounterId,
                        PatientId = settlement.PatientId,
                        ModuleName = ENUM_ModuleNames.Dispensary,
                        Remarks = empCashTransactionModel[i].Remarks,
                        PaymentModeSubCategoryId = empCashTransactionModel[i].PaymentModeSubCategoryId,
                        FiscalYearId = fiscalYearId
                    };
                    empCashTransactionsList.Add(empCashTransaction);
                }
                AddEmpCashtransactionForBilling(pharmacyDbContext, empCashTransactionsList);
            }

            //adding CashDiscountGiven during settlement as OutAmount into EmpCashTransaction table.. 
            if (settlement.DiscountAmount > 0)
            {
                PHRMEmployeeCashTransaction empCashTransaction = new PHRMEmployeeCashTransaction()
                {
                    TransactionType = ENUM_EMP_CashTransactinType.CashDiscountGiven,
                    ReferenceNo = settlement.SettlementId,
                    InAmount = 0,
                    OutAmount = (decimal)settlement.DiscountAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = currentDateTime,
                    CounterID = settlement.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(pharmacyDbContext),
                    ModuleName = ENUM_ModuleNames.Dispensary
                };
                AddEmpCashTransaction(pharmacyDbContext, empCashTransaction);
            }
        }

        private void AddEmpCashtransactionForBilling(PharmacyDbContext pharmacyDbContext, List<PHRMEmployeeCashTransaction> empCashTransaction)
        {
            try
            {
                for (int i = 0; i < empCashTransaction.Count; i++)
                {
                    PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction()
                    {
                        TransactionType = empCashTransaction[i].TransactionType,
                        ReferenceNo = empCashTransaction[i].ReferenceNo,
                        EmployeeId = empCashTransaction[i].EmployeeId,
                        InAmount = empCashTransaction[i].InAmount,
                        OutAmount = empCashTransaction[i].OutAmount,
                        Description = empCashTransaction[i].Description,
                        TransactionDate = empCashTransaction[i].TransactionDate,
                        CounterID = empCashTransaction[i].CounterID,
                        IsActive = true,
                        ModuleName = empCashTransaction[i].ModuleName,
                        PatientId = empCashTransaction[i].PatientId,
                        PaymentModeSubCategoryId = empCashTransaction[i].PaymentModeSubCategoryId,
                        Remarks = empCashTransaction[i].Remarks,
                        FiscalYearId = empCashTransaction[i].FiscalYearId,
                    };
                    pharmacyDbContext.phrmEmployeeCashTransaction.Add(empCashTxn);
                }
                pharmacyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        private void AddEmpCashTransaction(PharmacyDbContext pharmacyDbContext, PHRMEmployeeCashTransaction empCashTransaction)
        {
            try
            {
                PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction()
                {
                    TransactionType = empCashTransaction.TransactionType,
                    ReferenceNo = empCashTransaction.ReferenceNo,
                    EmployeeId = empCashTransaction.EmployeeId,
                    InAmount = empCashTransaction.InAmount,
                    OutAmount = empCashTransaction.OutAmount,
                    Description = empCashTransaction.Description,
                    TransactionDate = empCashTransaction.TransactionDate,
                    CounterID = empCashTransaction.CounterID,
                    IsActive = true,
                    ModuleName = empCashTransaction.ModuleName,
                    PatientId = empCashTransaction.PatientId,
                    PaymentModeSubCategoryId = empCashTransaction.PaymentModeSubCategoryId,
                    FiscalYearId = empCashTransaction.FiscalYearId,
                };
                pharmacyDbContext.phrmEmployeeCashTransaction.Add(empCashTxn);
                pharmacyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        private void UpdatePharmacyInvoiceAndItems(List<PHRMInvoiceTransactionModel> newPharmacyTransactionList, PharmacyDbContext pharmacyDbContext, BillSettlementModel settlement, RbacUser currentUser)
        {
            if (newPharmacyTransactionList != null && newPharmacyTransactionList.Count > 0)
            {
                foreach (var txn in newPharmacyTransactionList)
                {
                    pharmacyDbContext.PHRMInvoiceTransaction.Attach(txn);
                    txn.SettlementId = settlement.SettlementId;
                    txn.BilStatus = ENUM_BillingStatus.paid;
                    txn.PaidDate = settlement.SettlementDate;
                    txn.Remark = settlement.Remarks;

                    pharmacyDbContext.Entry(txn).Property(b => b.BilStatus).IsModified = true;
                    pharmacyDbContext.Entry(txn).Property(b => b.PaymentMode).IsModified = true;
                    pharmacyDbContext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                    pharmacyDbContext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                    pharmacyDbContext.Entry(txn).Property(b => b.Remark).IsModified = true;

                    //Update BillStatus and PaidDate of each transaction items attached with above transactions
                    List<PHRMInvoiceTransactionItemsModel> txnItems = pharmacyDbContext.PHRMInvoiceTransactionItems
                                                                  .Where(b => b.InvoiceId == txn.InvoiceId).ToList();

                    if (txnItems != null && txnItems.Count > 0)
                    {
                        for (int i = 0; i < txnItems.Count; i++)
                        {
                            txnItems[i] = UpdatePharmacyTxnItemsBillStatus(pharmacyDbContext, txnItems[i], ENUM_BillingStatus.paid);
                        }
                        pharmacyDbContext.SaveChanges();
                    }

                }
                pharmacyDbContext.SaveChanges();
            }
        }

        private void HandleDeposits(PharmacyDbContext pharmacyDbContext, RbacUser currentUser, BillSettlementModel settlement)
        {
            var DefaultDepositHead = pharmacyDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
            var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;

            //Add new row to deposit table if Deposit is deducted
            if (settlement.DepositDeducted > 0)
            {
                VisitModel patientVisit = pharmacyDbContext.PHRMPatientVisit.Where(visit => visit.PatientId == settlement.PatientId)
                    .OrderByDescending(a => a.PatientVisitId)
                    .FirstOrDefault();
                BillingDepositModel depositModel = new BillingDepositModel()
                {
                    OutAmount = (decimal)settlement.DepositDeducted,
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    CreditOrganizationId = null,
                    DepositHeadId = DepositHeadId,
                    IsActive = true,
                    FiscalYearId = PharmacyBL.GetFiscalYear(_phrmDbcontext).FiscalYearId,
                    Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = settlement.CounterId,
                    PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                    SettlementId = settlement.SettlementId,
                    PatientId = settlement.PatientId,
                    DepositBalance = 0,
                    ReceiptNo = GetDepositReceiptNo(pharmacyDbContext),
                    PaymentMode = ENUM_BillPaymentMode.cash,
                    VisitType = ENUM_VisitType.outpatient
                };

                pharmacyDbContext.BillingDepositModel.Add(depositModel);
                pharmacyDbContext.SaveChanges();

                PHRMEmployeeCashTransaction empCashTransaction = new PHRMEmployeeCashTransaction()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,
                    ReferenceNo = depositModel.DepositId,
                    InAmount = 0,
                    OutAmount = depositModel.OutAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = DateTime.Now,
                    CounterID = depositModel.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(pharmacyDbContext),
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    FiscalYearId = PharmacyBL.GetFiscalYear(pharmacyDbContext).FiscalYearId

                };
                AddEmpCashTransaction(pharmacyDbContext, empCashTransaction);
            }

            //Add new row to Deposit table if there is refundable amount.
            if (settlement.RefundableAmount > 0)
            {
                VisitModel patientVisit = pharmacyDbContext.PHRMPatientVisit.Where(visit => visit.PatientId == settlement.PatientId)
                    .OrderByDescending(a => a.PatientVisitId)
                    .FirstOrDefault();
                BillingDepositModel depositModel = new BillingDepositModel()
                {
                    OutAmount = (decimal)settlement.RefundableAmount,
                    TransactionType = ENUM_DepositTransactionType.ReturnDeposit,
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    CreditOrganizationId = null,
                    DepositHeadId = DepositHeadId,
                    IsActive = true,
                    FiscalYearId = PharmacyBL.GetFiscalYear(_phrmDbcontext).FiscalYearId,
                    Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = settlement.CounterId,
                    PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                    SettlementId = settlement.SettlementId,
                    PatientId = settlement.PatientId,
                    DepositBalance = 0,
                    ReceiptNo = GetDepositReceiptNo(pharmacyDbContext),
                    PaymentMode = ENUM_BillPaymentMode.cash,
                    VisitType = ENUM_VisitType.outpatient

                };

                pharmacyDbContext.BillingDepositModel.Add(depositModel);
                pharmacyDbContext.SaveChanges();

                PHRMEmployeeCashTransaction empCashTransaction = new PHRMEmployeeCashTransaction()
                {
                    TransactionType = ENUM_DepositTransactionType.ReturnDeposit,
                    ReferenceNo = depositModel.DepositId,
                    InAmount = 0,
                    OutAmount = depositModel.OutAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = DateTime.Now,
                    CounterID = depositModel.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetDepositPaymentModeSubCategoryId(pharmacyDbContext),
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    FiscalYearId = PharmacyBL.GetFiscalYear(pharmacyDbContext).FiscalYearId
                };

                AddEmpCashTransaction(pharmacyDbContext, empCashTransaction);
            }
        }

        private PHRMInvoiceTransactionItemsModel UpdatePharmacyTxnItemsBillStatus(PharmacyDbContext pharmacyDbContext, PHRMInvoiceTransactionItemsModel billItem, string billStatus)
        {
            pharmacyDbContext.PHRMInvoiceTransactionItems.Attach(billItem);
            if (billStatus == ENUM_BillingStatus.paid)
            {
                billItem.BilItemStatus = billStatus;

                pharmacyDbContext.Entry(billItem).Property(a => a.BilItemStatus).IsModified = true;
            }

            return billItem;
        }

        private void UpdatePharmacyInvoiceReturn(PharmacyDbContext pharmacyDbContext, PharmacySettlement_DTO phrmsettlement)
        {
            PHRMInvoiceReturnModel phrmInvocieReturn = new PHRMInvoiceReturnModel();
            foreach (int stl in phrmsettlement.PHRMReturnIdsCSV)
            {
                phrmInvocieReturn = pharmacyDbContext.PHRMInvoiceReturnModel.Where(b => b.InvoiceReturnId == stl && b.SettlementId != 0).FirstOrDefault();
                if (phrmInvocieReturn != null)
                {
                    phrmInvocieReturn.SettlementId = phrmsettlement.SettlementId;
                    _phrmDbcontext.Entry(phrmInvocieReturn).Property(a => a.SettlementId).IsModified = true;
                }
            }
            _phrmDbcontext.SaveChanges();

        }
        private int GetPaymentModeSubCategoryId(PharmacyDbContext pharmacyDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = pharmacyDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }

        private int GetSettlementReceiptNo(PharmacyDbContext dbContext)
        {
            int? currSettlmntNo = dbContext.BillingSettlementModel.Max(a => a.SettlementReceiptNo);
            if (!currSettlmntNo.HasValue)
            {
                currSettlmntNo = 0;
            }

            return currSettlmntNo.Value + 1;
        }

        private int? GetDepositReceiptNo(PharmacyDbContext pharmacyDbContext)
        {
            int fiscalYearId = PharmacyBL.GetFiscalYear(_phrmDbcontext).FiscalYearId;
            int? receiptNo = (from depTxn in pharmacyDbContext.BillingDepositModel
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }
        private int GetDepositPaymentModeSubCategoryId(PharmacyDbContext pharmacyDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = pharmacyDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }


        private object GetSettlementDetails(int settlementId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SettlementId", settlementId),
                    };

            DataSet dsPHRMSettlementDetails = DALFunctions.GetDatasetFromStoredProc("SP_Get_PHRM_Settlement_Details_By_SettlementId", paramList, _phrmDbcontext);
            DataTable dtPatientInfo = dsPHRMSettlementDetails.Tables[0];
            DataTable dtSettlementInfo = dsPHRMSettlementDetails.Tables[1];
            DataTable dtSalesInfo = dsPHRMSettlementDetails.Tables[2];
            DataTable dtSalesReturn = dsPHRMSettlementDetails.Tables[3];
            DataTable dtCashDiscountReturn = dsPHRMSettlementDetails.Tables[4];
            DataTable dtDepositInfo = dsPHRMSettlementDetails.Tables[5];



            var settlementPreview = new
            {
                PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                SettlementInfo = Settlement_Info_VM.MapDataTableToSingleObject(dtSettlementInfo),
                SalesInfo = dtSalesInfo,
                SalesReturn = dtSalesReturn,
                CashDiscountReturn = dtCashDiscountReturn,
                DepositInfo = dtDepositInfo
            };

            string billingUser = _rbacDbContext.Users.Where(u => u.EmployeeId == settlementPreview.SettlementInfo.CreatedBy).Select(u => u.UserName).FirstOrDefault();
            settlementPreview.SettlementInfo.BillingUser = billingUser;
            return settlementPreview;
        }

        private object GetPatientProvisionalItems(int patientId)
        {
            PHRMPatient currPatient = _phrmDbcontext.PHRMPatient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
            if (currPatient != null)
            {
                string subDivName = (from pat in _phrmDbcontext.PHRMPatient
                                     join countrySubdiv in _phrmDbcontext.CountrySubDivision
                                     on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                     where pat.PatientId == currPatient.PatientId
                                     select countrySubdiv.CountrySubDivisionName
                                  ).FirstOrDefault();

                currPatient.CountrySubDivisionName = subDivName;
                //remove relational property of patient//sud: 12May'18
                currPatient.PHRMInvoiceTransactionItems = null;
            }

            //for this request type, patientid comes as inputid.
            var patCreditItems = (from bill in _phrmDbcontext.PHRMInvoiceTransactionItems//.Include("ServiceDepartment")
                                  where bill.BilItemStatus == "provisional" && bill.PatientId == patientId
                                  select bill).ToList<PHRMInvoiceTransactionItemsModel>().OrderBy(b => b.InvoiceId);

            //clear patient object from Items, not needed since we're returning patient object separately
            if (patCreditItems != null)
            {

                var allEmployees = (from emp in _phrmDbcontext.Employees
                                    join dep in _phrmDbcontext.Departments
                                    on emp.DepartmentId equals dep.DepartmentId into empDpt
                                    from emp2 in empDpt.DefaultIfEmpty()
                                    select new
                                    {
                                        EmployeeId = emp.EmployeeId,
                                        EmployeeName = emp.FirstName,
                                        DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                        DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                    }).ToList();

                PharmacyFiscalYear fiscYear = PharmacyBL.GetFiscalYear(connString);

            }

            //create new anonymous type with patient information + Credit Items information : Anish:4May'18
            var patCreditDetails = new
            {
                Patient = currPatient,
                CreditItems = patCreditItems.OrderBy(itm => itm.CreatedOn).ToList()
            };


            return patCreditDetails;
        }

        private object GetInvoiceToPreview(int invoiceId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@invoiceId", invoiceId),
                    };
            DataSet dsInvoicePreview = DALFunctions.GetDatasetFromStoredProc("SP_PHRM_Settlement_GetInvoiceAndInvoiceReturnItemsOfInvoiceForPreview", paramList, _phrmDbcontext);

            DataTable dtInvoiceInfo = dsInvoicePreview.Tables[0];
            DataTable dtInvoiceItemInfo = dsInvoicePreview.Tables[1];
            DataTable dtCreditNotes = dsInvoicePreview.Tables[2];
            DataTable dtCreditNoteItems = dsInvoicePreview.Tables[3];

            var settlmntInvoicePreview = new
            {
                InvoiceInfo = Settlement_InvoicePreview_InvoiceInfoVM.MapDataTableToSingleObject(dtInvoiceInfo),
                InvoiceItems = dtInvoiceItemInfo,
                CreditNotes = dtCreditNotes,
                CreditNoteItems = dtCreditNoteItems
            };
            return settlmntInvoicePreview;
        }

        private object GetPatientsUnpaidInvoicesDetails(int patientId, int organizationId)
        {
            PHRMPatient currPatient = _phrmDbcontext.PHRMPatient.Where(pat => pat.PatientId == patientId).FirstOrDefault();

            if (currPatient != null)
            {
                List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@PatientId", patientId),
                        new SqlParameter("@OrganizationId", organizationId)
                    };
                DataSet dsPharmacyInfoOfPatientForSettlement = DALFunctions.GetDatasetFromStoredProc("SP_PHRM_GetAllInvoiceOfPatientForSettlement", paramList, _phrmDbcontext);

                DataTable dtPatientInfo = dsPharmacyInfoOfPatientForSettlement.Tables[0];
                DataTable dtCreditInvoices = dsPharmacyInfoOfPatientForSettlement.Tables[1];
                DataTable dtDepositInfo = dsPharmacyInfoOfPatientForSettlement.Tables[2];
                DataTable dtProvisionalInfo = dsPharmacyInfoOfPatientForSettlement.Tables[3];

                var pharmacyReturnInfo = new
                {
                    PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                    CreditInvoiceInfo = dtCreditInvoices,
                    DepositInfo = Settlement_DepositInfoVM.MapDataTableToSingleObject(dtDepositInfo),
                    ProvisionalInfo = Settlement_ProvisionalInfoVM.MapDataTableToSingleObject(dtProvisionalInfo)



                };
                return pharmacyReturnInfo;
            }
            else
            {
                throw new InvalidOperationException();
            }
        }
    }
}
