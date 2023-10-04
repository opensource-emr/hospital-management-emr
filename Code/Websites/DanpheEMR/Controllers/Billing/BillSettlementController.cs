using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Medicare;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace DanpheEMR.Controllers
{

    public class BillSettlementController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        private readonly BillingDbContext _billingDbContext;
        private readonly SettlementDbContext _settlementDbContext;

        public BillSettlementController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            _billingDbContext = new BillingDbContext(connString);
            _settlementDbContext = new SettlementDbContext(connString);
        }

        [HttpGet]
        [Route("PendingSettlements")]
        public ActionResult PendingSettlements(int organizationId)
        {
            //if (reqType != null && reqType == "allPendingSettlements")
            //{

            Func<object> func = () => GetAllPendingSettlements(organizationId);
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpGet]
        [Route("PatientBillingInfo")]
        public ActionResult PatientBillingInfo(int patientId, int organizationId)
        {
            //if (reqType != null && reqType == "getAllBillingInfoOfPatientForSettlement" && patientId != null && patientId != 0)
            //{

            Func<object> func = () => GetPatientBillingInfoForSettlement(patientId, organizationId);
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpGet]
        [Route("Settlements")]
        public ActionResult Settlements()
        {
            //if (reqType != null && reqType == "allSettlementDetails")
            //{

            Func<object> func = () => (_billingDbContext.BillSettlements.Include("Patient").Include("Patient.CountrySubDivision")
               .OrderByDescending(s => s.SettlementReceiptNo).ToList());
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpGet]
        [Route("SettlementInfo")]
        public ActionResult SettlementInfo(int settlementId)
        {
            //if (reqType == "settlementInfoBySettlmntId" && settlementId != null)
            //{

            Func<object> func = () => GetSettlementInfo(settlementId);
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpGet]
        [Route("InvoiceInfo")]
        public ActionResult InvoiceInfo(int billingTransactionId)
        {
            //if (reqType == "get-settlement-single-invoice-preview")
            //{
            Func<object> func = () => GetSingleInvoiceInfoForSettlement(billingTransactionId);
            return InvokeHttpGetFunction<object>(func);

        }


        [HttpPost]
        [Route("NewSettlement_Old")]
        public ActionResult NewSettlement_Old()
        {
            //if (reqType == "postSettlementInvoice")//submit
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => SaveSettlement(ipDataString, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("NewSettlement")]
        public ActionResult NewSettlement([FromBody] BillNewSettlement_DTO billNewSettlement_DTO)
        {

            if (billNewSettlement_DTO == null)
            {
                throw new ArgumentNullException("Settlement details is not deserialized or it send as null !");
            }
            else
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                using (var settlementTransactionScope = _settlementDbContext.Database.BeginTransaction(IsolationLevel.ReadUncommitted))
                {
                    Func<object> func = () => BillingSettlementBL.SaveSettlement(billNewSettlement_DTO, _settlementDbContext, currentUser, connString);
                    return InvokeHttpPostFunctionSingleTransactionScope(func, settlementTransactionScope);
                }
            }
        }

        [HttpPut]
        [Route("PrintCount")]
        public ActionResult PutPrintCount(int settlementId)
        {
            // if (reqType == "updateSettlementPrintCount")
            // {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateSettlementPrintCount(settlementId, currentUser);
            return InvokeHttpPutFunction(func);
        }


        private object GetAllPendingSettlements(int organizationId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@OrganizationId", organizationId),
                    };
            DataTable settlInfo = DanpheEMR.DalLayer.DALFunctions.GetDataTableFromStoredProc("SP_TXNS_BILL_SettlementSummary", paramList, _billingDbContext);
            List<BillingPendingSettlement_DTO> pendingSettlements = DataTableToList.ConvertToList<BillingPendingSettlement_DTO>(settlInfo);

            return pendingSettlements;
        }

        private object GetPatientBillingInfoForSettlement(int patientId, int organizationId)
        {

            PatientModel currPatient = _billingDbContext.Patient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
            if (currPatient != null)
            {
                List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@PatientId", patientId),
                        new SqlParameter("@OrganizationId", organizationId)
                    };
                DataSet dsBillingInfoOfPatientForSettlement = DALFunctions.GetDatasetFromStoredProc("SP_BIL_GetAllBillingInfoOfPatientForSettlement", paramList, _billingDbContext);

                DataTable dtPatientInfo = dsBillingInfoOfPatientForSettlement.Tables[0];
                DataTable dtCreditInvoices = dsBillingInfoOfPatientForSettlement.Tables[1];
                DataTable dtDepositInfo = dsBillingInfoOfPatientForSettlement.Tables[2];
                DataTable dtProvisionalInfo = dsBillingInfoOfPatientForSettlement.Tables[3];

                return new
                {
                    PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                    CreditInvoiceInfo = dtCreditInvoices,
                    DepositInfo = Settlement_DepositInfoVM.MapDataTableToSingleObject(dtDepositInfo),
                    ProvisionalInfo = Settlement_ProvisionalInfoVM.MapDataTableToSingleObject(dtProvisionalInfo)

                };

            }
            else
            {
                throw new Exception("Patient Not Found");
            }
        }

        private object GetSettlementInfo(int settlementId)
        {

            RbacDbContext rbacDbContext = new RbacDbContext(connString);


            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SettlementId", settlementId),
                    };

            DataSet dsSettlementDetails = DALFunctions.GetDatasetFromStoredProc("SP_Get_Settlement_Details_By_SettlementId", paramList, _billingDbContext);
            DataTable dtPatientInfo = dsSettlementDetails.Tables[0];
            DataTable dtSettlementInfo = dsSettlementDetails.Tables[1];
            DataTable dtSalesInfo = dsSettlementDetails.Tables[2];
            DataTable dtSalesReturn = dsSettlementDetails.Tables[3];
            DataTable dtCashDiscountReturn = dsSettlementDetails.Tables[4];
            //DataTable dtDepositReturn = dsSettlementDetails.Tables[5];
            DataTable dtDepositInfo = dsSettlementDetails.Tables[5];



            var settlementPreview = new
            {
                PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                SettlementInfo = Settlement_Info_VM.MapDataTableToSingleObject(dtSettlementInfo),
                SalesInfo = dtSalesInfo,
                SalesReturn = dtSalesReturn,
                CashDiscountReturn = dtCashDiscountReturn,
                DepositInfo = dtDepositInfo
            };

            string billingUser = rbacDbContext.Users.Where(u => u.EmployeeId == settlementPreview.SettlementInfo.CreatedBy).Select(u => u.UserName).FirstOrDefault();
            settlementPreview.SettlementInfo.BillingUser = billingUser;

            return settlementPreview;

        }

        private object GetSingleInvoiceInfoForSettlement(int billingTransactionId)
        {

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@BillingTransactionId", billingTransactionId),
                    };
            DataSet dsInvoicePreview = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Settlement_GetBillAndReturnItemsOfInvoiceForPreview", paramList, _billingDbContext);

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
        private object SaveSettlement(string ipDataString, RbacUser currentUser)
        {

            BillSettlementModel settlement = DanpheJSONConvert.DeserializeObject<BillSettlementModel>(ipDataString);

            if (BillingTransactionBL.IsDepositAvailable(_billingDbContext, settlement.PatientId, settlement.DepositDeducted))
            {
                using (var dbTransaction = _billingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        var txns = settlement.BillingTransactions;

                        //step:0, As EF automatically Inserts Child collection (billingtransactionmodel) while inserting settlement
                        // we have to first create a new list and set settlement.BillingTransactions as null.
                        List<BillingTransactionModel> newTxnList = new List<BillingTransactionModel>();

                        foreach (BillingTransactionModel txn in txns)
                        {

                            BillingTransactionModel newTxn = _billingDbContext.BillingTransactions
                                .Where(b => b.BillingTransactionId == txn.BillingTransactionId).FirstOrDefault();
                            newTxnList.Add(newTxn);

                        }
                        settlement.BillingTransactions = null;

                        //Step1: assign server side values to the input model and Save the settlementModel 
                        settlement.SettlementReceiptNo = GetSettlementReceiptNo(_billingDbContext);
                        DateTime currentDateTime = DateTime.Now;
                        settlement.CreatedOn = currentDateTime;
                        settlement.SettlementDate = currentDateTime;
                        settlement.FiscalYearId = BillingBL.GetFiscalYear(_billingDbContext).FiscalYearId;
                        settlement.CreatedBy = currentUser.EmployeeId;

                        _billingDbContext.BillSettlements.Add(settlement);
                        _billingDbContext.SaveChanges();

                        //Krishna, 21stApril'23, Update CreditBillStatus 
                        UpdateCreditBillStatus(newTxnList, settlement.SettlementId, currentUser.EmployeeId);

                        //adding CollectionFrom Receivable as InAmount into EmpCashTransaction table.. 
                        if (settlement.CollectionFromReceivable > 0)
                        {
                            List<EmpCashTransactionModel> empCashTransactionModel = new List<EmpCashTransactionModel>();
                            for (int i = 0; i < settlement.empCashTransactionModel.Count; i++)
                            {
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.CollectionFromReceivable;
                                empCashTransaction.ReferenceNo = settlement.SettlementId;
                                //empCashTransaction.InAmount = settlement.CollectionFromReceivable;
                                empCashTransaction.InAmount = settlement.empCashTransactionModel[i].InAmount;
                                empCashTransaction.OutAmount = 0;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = currentDateTime;
                                empCashTransaction.CounterID = settlement.CounterId;
                                empCashTransaction.PatientId = settlement.PatientId;
                                empCashTransaction.ModuleName = "Billing";
                                empCashTransaction.Remarks = settlement.empCashTransactionModel[i].Remarks;
                                empCashTransaction.PaymentModeSubCategoryId = settlement.empCashTransactionModel[i].PaymentModeSubCategoryId;
                                empCashTransactionModel.Add(empCashTransaction);
                            }

                            //BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                            BillingBL.AddEmpCashtransactionForBilling(_billingDbContext, empCashTransactionModel);
                        }

                        //adding CashDiscountGiven during settlement as OutAmount into EmpCashTransaction table.. 
                        if (settlement.DiscountAmount > 0)
                        {
                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.CashDiscountGiven;
                            empCashTransaction.ReferenceNo = settlement.SettlementId;
                            empCashTransaction.InAmount = 0;
                            empCashTransaction.OutAmount = settlement.DiscountAmount;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = currentDateTime;
                            empCashTransaction.CounterID = settlement.CounterId;
                            empCashTransaction.PatientId = settlement.PatientId;
                            empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                            empCashTransaction.ModuleName = "Billing";

                            BillingBL.AddEmpCashTransaction(_billingDbContext, empCashTransaction);
                        }



                        if (newTxnList != null && newTxnList.Count > 0)
                        {
                            //step2: Update necessary fields of BillingTransaction acc to above Settlement Object
                            foreach (var txn in newTxnList)
                            {
                                _billingDbContext.BillingTransactions.Attach(txn);
                                txn.SettlementId = settlement.SettlementId;
                                txn.BillStatus = ENUM_BillingStatus.paid;// "paid";
                                txn.PaidAmount = txn.TotalAmount;
                                txn.PaidDate = settlement.SettlementDate;
                                txn.PaymentReceivedBy = currentUser.EmployeeId;//added: sud: 29may'18
                                txn.PaidCounterId = settlement.CounterId;//added: sud: 29may'18

                                _billingDbContext.Entry(txn).Property(b => b.BillStatus).IsModified = true;
                                _billingDbContext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                                _billingDbContext.Entry(txn).Property(b => b.PaidAmount).IsModified = true;
                                _billingDbContext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                                _billingDbContext.Entry(txn).Property(b => b.PaymentReceivedBy).IsModified = true;//added: sud: 29may'18
                                _billingDbContext.Entry(txn).Property(b => b.PaidCounterId).IsModified = true;//added: sud: 29may'18

                                //setp3: Update BillStatus and PaidDate of each transaction items attached with above transactions

                                List<BillingTransactionItemModel> txnItems = _billingDbContext.BillingTransactionItems
                                                                              .Where(b => b.BillingTransactionId == txn.BillingTransactionId).ToList();

                                if (txnItems != null && txnItems.Count > 0)
                                {
                                    for (int i = 0; i < txnItems.Count; i++)
                                    {
                                        txnItems[i] = BillingTransactionBL.UpdateTxnItemBillStatus(_billingDbContext,
                                        txnItems[i],
                                        "paid",
                                        currentUser,
                                        settlement.SettlementDate,
                                        settlement.CounterId);
                                    }
                                    _billingDbContext.SaveChanges();
                                }
                            }
                            _billingDbContext.SaveChanges();
                        }

                        //step: 4 Add new row to deposit table if Deposit is deducted
                        if (settlement.DepositDeducted != null && settlement.DepositDeducted > 0)
                        {
                            VisitModel patientVisit = _billingDbContext.Visit.Where(visit => visit.PatientId == settlement.PatientId)
                                .OrderByDescending(a => a.PatientVisitId)
                                .FirstOrDefault();
                            BillingDepositModel depositModel = new BillingDepositModel()
                            {
                                //Amount = settlement.DepositDeducted,
                                OutAmount = (decimal)settlement.DepositDeducted,
                                TransactionType = ENUM_DepositTransactionType.DepositDeduct,// "depositdeduct",
                                ModuleName = ENUM_ModuleNames.Billing,
                                OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                                CreditOrganizationId = null,
                                DepositHeadId = 1, //Krishna, 21stApril'23, Yet to be decided.
                                IsActive = true,
                                FiscalYearId = BillingBL.GetFiscalYear(_billingDbContext).FiscalYearId,
                                Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now,
                                CounterId = settlement.CounterId,
                                PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                                SettlementId = settlement.SettlementId,
                                PatientId = settlement.PatientId,
                                DepositBalance = 0,
                                ReceiptNo = BillingBL.GetDepositReceiptNo(connString),
                                //PaymentMode = "cash",//yubraj 4th July '19
                                PaymentMode = ENUM_BillPaymentMode.cash, //krishna 26th NOV'21
                                VisitType = ENUM_VisitType.outpatient // Bibek 18thjune'23
                            };

                            _billingDbContext.BillingDeposits.Add(depositModel);
                            _billingDbContext.SaveChanges();

                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_DepositTransactionType.DepositDeduct;
                            empCashTransaction.ReferenceNo = depositModel.DepositId;
                            empCashTransaction.InAmount = 0;
                            empCashTransaction.OutAmount = (double)depositModel.OutAmount;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = depositModel.CounterId;
                            empCashTransaction.PatientId = settlement.PatientId;
                            empCashTransaction.PaymentModeSubCategoryId = GetDepositPaymentModeSubCategoryId();
                            empCashTransaction.ModuleName = "Billing";

                            BillingBL.AddEmpCashTransaction(_billingDbContext, empCashTransaction);


                        }


                        //Add new row to Deposit table if there is refundable amount.
                        if (settlement.RefundableAmount != null && settlement.RefundableAmount > 0)
                        {
                            VisitModel patientVisit = _billingDbContext.Visit.Where(visit => visit.PatientId == settlement.PatientId)
                                .OrderByDescending(a => a.PatientVisitId)
                                .FirstOrDefault();
                            BillingDepositModel depositModel = new BillingDepositModel()
                            {
                                //Amount = settlement.RefundableAmount,
                                OutAmount = (decimal)settlement.RefundableAmount,
                                TransactionType = ENUM_DepositTransactionType.ReturnDeposit,// "returnDeposit",
                                ModuleName = ENUM_ModuleNames.Billing,
                                OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                                CreditOrganizationId = null,
                                DepositHeadId = 1, //Krishna, 21stApril'23, Yet to be decided.
                                IsActive = true,
                                FiscalYearId = BillingBL.GetFiscalYear(_billingDbContext).FiscalYearId,
                                Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now,
                                CounterId = settlement.CounterId,
                                PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                                SettlementId = settlement.SettlementId,
                                PatientId = settlement.PatientId,
                                DepositBalance = 0,
                                ReceiptNo = BillingBL.GetDepositReceiptNo(connString),
                                //PaymentMode = "cash",//yubraj 4th July '19
                                PaymentMode = ENUM_BillPaymentMode.cash //Krishna 26th NOV'21

                            };

                            _billingDbContext.BillingDeposits.Add(depositModel);
                            _billingDbContext.SaveChanges();

                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_DepositTransactionType.ReturnDeposit; //depositReturn
                            empCashTransaction.ReferenceNo = depositModel.DepositId;
                            empCashTransaction.InAmount = 0;
                            empCashTransaction.OutAmount = (double)depositModel.OutAmount;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = depositModel.CounterId;
                            empCashTransaction.PatientId = settlement.PatientId;
                            empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                            empCashTransaction.ModuleName = "Billing";

                            BillingBL.AddEmpCashTransaction(_billingDbContext, empCashTransaction);
                        }


                        //to update BillReturnInvoice table by updating SettlementId for the rows that are being settled.
                        if (settlement.BillReturnIdsCSV.Count > 0)
                        {
                            BillInvoiceReturnModel billInvoiceReturnModel = new BillInvoiceReturnModel();
                            foreach (int stl in settlement.BillReturnIdsCSV)
                            {
                                billInvoiceReturnModel = _billingDbContext.BillInvoiceReturns.Where(b => b.BillReturnId == stl).FirstOrDefault();
                                billInvoiceReturnModel.SettlementId = settlement.SettlementId;
                                _billingDbContext.Entry(billInvoiceReturnModel).Property(a => a.SettlementId).IsModified = true;
                            }
                            _billingDbContext.SaveChanges();
                        }



                        dbTransaction.Commit();

                        return settlement;
                    }
                    catch (Exception ex)
                    {
                        dbTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            else
            {
                throw new Exception("Deposit Amount is Invalid, Please try again.");
            }


        }

        //Krishna, 21stApril'23 This method is responsible to update the CreditBillStatus Entity..
        private void UpdateCreditBillStatus(List<BillingTransactionModel> newTxnList, int settlementId, int employeeId)
        {
            try
            {
                if (newTxnList.Count > 0)
                {
                    var patientId = newTxnList[0].PatientId;
                    var billingTransactionIds = newTxnList.Select(a => a.BillingTransactionId);
                    List<BillingTransactionCreditBillStatusModel> billingTransactionCreditBillStatuses = _billingDbContext.BillingTransactionCreditBillStatuses
                                                                            .Where(a => a.PatientId == patientId && billingTransactionIds.Contains(a.BillingTransactionId))
                                                                            .ToList();
                    billingTransactionCreditBillStatuses.ForEach(a =>
                  {
                      a.SettlementId = settlementId;
                      a.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                      a.ModifiedBy = employeeId;
                      a.ModifiedOn = DateTime.Now;

                      _billingDbContext.Entry(a).Property(p => p.SettlementId).IsModified = true;
                      _billingDbContext.Entry(a).Property(p => p.SettlementStatus).IsModified = true;
                      _billingDbContext.Entry(a).Property(p => p.ModifiedBy).IsModified = true;
                      _billingDbContext.Entry(a).Property(p => p.ModifiedOn).IsModified = true;

                  });
                    _billingDbContext.SaveChanges();
                }
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        private object UpdateSettlementPrintCount(int settlementId, RbacUser currentUser)
        {

            int settlmntId = settlementId;
            var currSettlment = _billingDbContext.BillSettlements.Where(s => s.SettlementId == settlmntId).FirstOrDefault();
            if (currSettlment != null)
            {
                int? printCount = currSettlment.PrintCount.HasValue ? currSettlment.PrintCount : 0;
                printCount += 1;
                _billingDbContext.BillSettlements.Attach(currSettlment);
                currSettlment.PrintCount = printCount;
                currSettlment.PrintedOn = System.DateTime.Now; //Yubraj: 13th August'19
                currSettlment.PrintedBy = currentUser.EmployeeId;
                _billingDbContext.Entry(currSettlment).Property(b => b.PrintCount).IsModified = true;
                _billingDbContext.SaveChanges();

                return new { SettlementId = settlementId, PrintCount = printCount };
            }
            else
            {
                throw new Exception("SettlementId is invalid");
            }

        }


        private int GetSettlementReceiptNo(BillingDbContext dbContext)
        {
            int? currSettlmntNo = dbContext.BillSettlements.Max(a => a.SettlementReceiptNo);
            if (!currSettlmntNo.HasValue)
            {
                currSettlmntNo = 0;
            }

            return currSettlmntNo.Value + 1;
        }


        #region This gets the PaymentModeSubCategoryId of Cash PaymentMode.....
        private int GetPaymentModeSubCategoryId()
        {
            var paymentModeSubCategoryId = 0;
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            var paymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion
        #region This gets the PaymentModeSubCategoryId of Deposit PaymentMode.....
        private int GetDepositPaymentModeSubCategoryId()
        {
            var paymentModeSubCategoryId = 0;
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            var paymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion
    }
}
