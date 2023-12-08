using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using System.Threading.Tasks;
using DanpheEMR.Enums;
using System.Data;
using System.Data.SqlClient;
using DanpheEMR.ServerModel.BillingModels;
using Microsoft.EntityFrameworkCore;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.Services.SSF.DTO;

namespace DanpheEMR.Controllers
{

    public class BillReturnController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;
        bool RealTimeSSFClaimBooking = false;
        string InvoiceCode = "BL";
        double DepositReturnAmount = 0;
        BillingTransactionModel billTxnReturnData = new BillingTransactionModel();
        PatientModel patient = new PatientModel();

        private readonly BillingDbContext _billingDbContext;
        private DanpheHTTPResponse<object> _objResponseData;
        private readonly RbacDbContext _rbacDbContext;
        public BillReturnController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            RealTimeSSFClaimBooking = _config.Value.RealTimeSSFClaimBooking;


            _billingDbContext = new BillingDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);

            _objResponseData = new DanpheHTTPResponse<object>();
            _objResponseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;//this is for default
        }


        [HttpGet]
        [Route("InvoiceDetailsForCreditNote")]
        public ActionResult InvoiceDetailsForCreditNote(int invoiceNumber, int fiscalYearId)
        {
            //if (reqType != null && reqType == "getInvoiceDetailsForCreditNote" && invoiceNumber != null && invoiceNumber != 0)
            //{

            Func<object> func = () => GetInvoiceInfoForCreditNote(invoiceNumber, fiscalYearId, _billingDbContext);
            return InvokeHttpGetFunction<object>(func);

        }





        [HttpGet]
        [Route("CreditNoteInfo")]
        public ActionResult CreditNoteInfo(int creditNoteNum, int fiscalYearId)
        {

            //if (reqType != null && reqType == "CreditNoteByCreditNoteNo" && CreditNoteNo != null && CreditNoteNo != 0)
            //{

            Func<object> func = () => GetCreditNoteInfo(creditNoteNum, fiscalYearId);
            return InvokeHttpGetFunction(func);

        }

        [HttpPost]
        [Route("CreditNote")]
        public ActionResult PostCreditNote()
        {
            //else if (reqType == "post-creditnote")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => SaveCreditNote(ipDataString, currentUser);
            return InvokeHttpPostFunction(func);
        }



        [HttpPost]
        [Route("PostReturnInvoice_Old")]
        public ActionResult PostReturnInvoice_Old()
        {
            //  if (reqType == "returnInvoice")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            string billInvReturnModelStr = Request.Form["billInvReturnModel"];
            string billTransactionStr = Request.Form["billTransaction"];

            Func<object> func = () => SaveReturnInvoice_Old(currentUser, billInvReturnModelStr, billTransactionStr);
            return InvokeHttpPostFunction(func);
        }


        private void UpdateBillCreditStatusAndCreditBalance(BillingDbContext billingDbContext, BillInvoiceReturnModel billInvoiceRet, RbacUser currentUser, bool isCopayment)
        {

            try
            {
                var billCreditStatusObj = billingDbContext.BillingTransactionCreditBillStatuses.Where(a => a.BillingTransactionId == billInvoiceRet.BillingTransactionId).FirstOrDefault();

                billCreditStatusObj.CoPayReturnAmount += billTxnReturnData.IsCoPayment == true ? ((decimal)billInvoiceRet.TotalAmount - billInvoiceRet.ReturnCashAmount) : 0;
                billCreditStatusObj.ReturnTotalBillAmount += (decimal)billInvoiceRet.TotalAmount;
                billCreditStatusObj.NetReceivableAmount = billCreditStatusObj.SalesTotalBillAmount - billCreditStatusObj.CoPayReceivedAmount - (billCreditStatusObj.ReturnTotalBillAmount - billCreditStatusObj.CoPayReturnAmount); //Krishna, 21stApril'23 Need think again for this calculation.4
                billCreditStatusObj.ModifiedOn = DateTime.Now;
                billCreditStatusObj.ModifiedBy = currentUser.EmployeeId;

                billingDbContext.Entry(billCreditStatusObj).Property(p => p.ReturnTotalBillAmount).IsModified = true;
                billingDbContext.Entry(billCreditStatusObj).Property(p => p.CoPayReturnAmount).IsModified = true;
                billingDbContext.Entry(billCreditStatusObj).Property(p => p.NetReceivableAmount).IsModified = true;
                billingDbContext.Entry(billCreditStatusObj).Property(p => p.ModifiedOn).IsModified = true;
                billingDbContext.Entry(billCreditStatusObj).Property(p => p.ModifiedBy).IsModified = true;

                var patientMapPriceCategory = billingDbContext.PatientSchemeMaps.Where(a => a.PatientId == billInvoiceRet.PatientId && a.SchemeId == billInvoiceRet.SchemeId && a.IsActive == true).FirstOrDefault();
                if (patientMapPriceCategory != null)
                {
                    if (billInvoiceRet.TransactionType.ToLower() != ENUM_BillingType.inpatient.ToLower())
                    {
                        patientMapPriceCategory.OpCreditLimit = (patientMapPriceCategory.OpCreditLimit + (decimal)billInvoiceRet.TotalAmount);
                        billingDbContext.Entry(patientMapPriceCategory).Property(p => p.OpCreditLimit).IsModified = true;
                    }
                    else
                    {
                        patientMapPriceCategory.IpCreditLimit = (patientMapPriceCategory.IpCreditLimit + (decimal)billInvoiceRet.TotalAmount);
                        billingDbContext.Entry(patientMapPriceCategory).Property(p => p.IpCreditLimit).IsModified = true;
                    }
                    patientMapPriceCategory.ModifiedBy = currentUser.EmployeeId;
                    patientMapPriceCategory.ModifiedOn = DateTime.Now;

                    billingDbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedBy).IsModified = true;
                    billingDbContext.Entry(patientMapPriceCategory).Property(p => p.ModifiedOn).IsModified = true;
                }
                billingDbContext.SaveChanges();

                var scheme = billingDbContext.BillingSchemes.FirstOrDefault(a => a.SchemeId == billInvoiceRet.SchemeId);
                if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                {
                    UpdateMedicareMemberBalance(billInvoiceRet, billingDbContext, currentUser);
                }

            }
            catch (Exception)
            {

                throw;
            }
        }

        private void UpdateMedicareMemberBalance(BillInvoiceReturnModel billInvoiceRet, BillingDbContext billingDbContext, RbacUser currentUser)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();
            var medicareMember = billingDbContext.MedicareMembers.FirstOrDefault(a => a.PatientId == billInvoiceRet.PatientId);
            if (medicareMember != null && medicareMember.IsDependent == false)
            {
                medicareMemberBalance = billingDbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.MedicareMemberId);
            }
            if (medicareMember != null && medicareMember.IsDependent == true)
            {
                medicareMemberBalance = billingDbContext.MedicareMemberBalances.FirstOrDefault(a => a.MedicareMemberId == medicareMember.ParentMedicareMemberId);
            }
            if (billInvoiceRet.TransactionType.ToLower() == ENUM_BillingType.outpatient.ToLower())
            {
                medicareMemberBalance.OpBalance = (medicareMemberBalance.OpBalance + (decimal)billInvoiceRet.TotalAmount);
                medicareMemberBalance.OpUsedAmount = (medicareMemberBalance.OpUsedAmount - (decimal)billInvoiceRet.TotalAmount);
                medicareMemberBalance.ModifiedOn = DateTime.Now;
                medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                billingDbContext.Entry(medicareMemberBalance).Property(p => p.OpBalance).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.OpUsedAmount).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                billingDbContext.SaveChanges();
            }

            if (billInvoiceRet.TransactionType.ToLower() == ENUM_BillingType.inpatient.ToLower())
            {
                medicareMemberBalance.IpBalance = (medicareMemberBalance.IpBalance + (decimal)billInvoiceRet.TotalAmount);
                medicareMemberBalance.IpUsedAmount = (medicareMemberBalance.IpUsedAmount - (decimal)billInvoiceRet.TotalAmount);
                medicareMemberBalance.ModifiedOn = DateTime.Now;
                medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;

                billingDbContext.Entry(medicareMemberBalance).Property(p => p.IpBalance).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.IpUsedAmount).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedOn).IsModified = true;
                billingDbContext.Entry(medicareMemberBalance).Property(p => p.ModifiedBy).IsModified = true;

                billingDbContext.SaveChanges();
            }
        }

        private void UpdateDepartemntRequisitionOnReturn(BillInvoiceReturnItemsModel currRetItmObj, BillingDbContext billingDbContext)
        {
            var requisitionId = currRetItmObj.RequisitionId;
            var srvDptId = currRetItmObj.ServiceDepartmentId;
            var patId = currRetItmObj.PatientId;
            var patVisitId = currRetItmObj.PatientVisitId;
            var billingTxnItemId = currRetItmObj.BillingTransactionItemId;

            var serviceDepartment = billingDbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == srvDptId).FirstOrDefault();

            if (!string.IsNullOrEmpty(serviceDepartment.IntegrationName))
            {
                if (serviceDepartment.IntegrationName.ToLower() == "lab")
                {
                    //RequisitionId is Unique within LabRequisition Table
                    var LabReq = billingDbContext.LabRequisitions.Where(b => b.BillingTransactionItemId == billingTxnItemId).FirstOrDefault();
                    if (LabReq != null)
                    {
                        LabReq.BillingStatus = "returned";
                        billingDbContext.LabRequisitions.Attach(LabReq);
                        billingDbContext.Entry(LabReq).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.SaveChanges();
                    }
                }
                else if (serviceDepartment.IntegrationName.ToLower() == "radiology")
                {
                    //ImagingRequisitionId is Unique within ImagingRequisition Table
                    var RadReq = billingDbContext.RadiologyImagingRequisitions.Where(a => a.BillingTransactionItemId == billingTxnItemId).FirstOrDefault();
                    if (RadReq != null)
                    {
                        RadReq.BillingStatus = "returned";
                        billingDbContext.RadiologyImagingRequisitions.Attach(RadReq);
                        billingDbContext.Entry(RadReq).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.SaveChanges();
                    }
                }
                else if (serviceDepartment.IntegrationName.ToLower() == "opd")
                {
                    //PatientVisitId is unique within PatientVisit Table
                    VisitModel visit = (from v in billingDbContext.Visit
                                        where v.PatientId == patId && v.PatientVisitId == patVisitId
                                        select v).FirstOrDefault();
                    if (visit != null)
                    {
                        visit.BillingStatus = "returned";
                        billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.SaveChanges();
                    }
                }
            }

        }

        /// <summary>
        /// We need to deduct Current Employee's cash collection if this bill is a Cash Bill.
        /// </summary>
        /// <param name="txnDateTime">Taking this input to make sure that all tables has same timestamp</param>
        private void UpdateEmpCashCollectionAmts(BillInvoiceReturnModel invReturnModel, BillingDbContext billingDbContext, RbacUser currentUser, DateTime txnDateTime)
        {

            //if bill-status is paid, that means user has to return some amount to the patient.
            if (invReturnModel.BillStatus == ENUM_BillingStatus.paid)
            {
                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.SalesReturn;
                empCashTransaction.ReferenceNo = invReturnModel.BillReturnId;
                empCashTransaction.InAmount = 0;
                empCashTransaction.OutAmount = invReturnModel.TotalAmount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                empCashTransaction.TransactionDate = txnDateTime;
                empCashTransaction.CounterID = invReturnModel.CounterId;
                empCashTransaction.ModuleName = "Billing";
                empCashTransaction.PatientId = invReturnModel.PatientId;
                empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);

                //if Cash Discount Returned during settlement, we need to add that as InAmount in the EmpCashTransaciton Table..
                //It happens when a invoice is returned after settlement. 
                if (invReturnModel.DiscountReturnAmount > 0)
                {
                    EmpCashTransactionModel empCshTxn2 = new EmpCashTransactionModel();
                    empCshTxn2.TransactionType = ENUM_EMP_CashTransactinType.CashDiscountReceived;
                    //empCshTxn2.ReferenceNo = invReturnModel.BillReturnId;
                    empCshTxn2.ReferenceNo = invReturnModel.SettlementId; //Changed to SettlementId as the instance of CashDiscountReceived is in Settlement Table... //Krishna, 10th March
                    empCshTxn2.InAmount = invReturnModel.DiscountReturnAmount > 0 ? invReturnModel.DiscountReturnAmount : 0;
                    empCshTxn2.OutAmount = 0;
                    empCshTxn2.EmployeeId = currentUser.EmployeeId;
                    empCshTxn2.TransactionDate = txnDateTime;
                    empCshTxn2.CounterID = invReturnModel.CounterId;
                    empCshTxn2.ModuleName = "Billing";
                    empCshTxn2.PatientId = invReturnModel.PatientId;
                    empCshTxn2.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                    BillingBL.AddEmpCashTransaction(billingDbContext, empCshTxn2);
                }
            }

            if (invReturnModel.BillStatus == ENUM_BillingStatus.unpaid)
            {
                /*Manipal-RevisionNeeded*/
                //sud:22March'23-- Changing from PriceCategoryObj to SchemeObject 
                //var priceCategoryObj = billingDbContext.PriceCategoryModels.FirstOrDefault(a => a.PriceCategoryId == invReturnModel.PriceCategoryId);
                var schemeObj = billingDbContext.BillingSchemes.FirstOrDefault(a => a.SchemeId == invReturnModel.SchemeId);

                if (schemeObj != null && schemeObj.IsBillingCoPayment == true)
                {
                    EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                    empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.SalesReturn;
                    empCashTransaction.ReferenceNo = invReturnModel.BillReturnId;
                    empCashTransaction.InAmount = 0;
                    empCashTransaction.OutAmount = (double)invReturnModel.ReturnCashAmount;
                    empCashTransaction.EmployeeId = currentUser.EmployeeId;
                    empCashTransaction.TransactionDate = txnDateTime;
                    empCashTransaction.CounterID = invReturnModel.CounterId;
                    empCashTransaction.ModuleName = ENUM_ModuleNames.Billing;
                    empCashTransaction.PatientId = invReturnModel.PatientId;
                    empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                    BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                }
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

        private Boolean IsBillReturnValid(BillInvoiceReturnModel returnModel, BillingDbContext billingDbContext)
        {
            var isValid = true;
            var returnDetail = (from returnItem in billingDbContext.BillInvoiceReturnItems.
                                Where(a => a.BillingTransactionId == returnModel.BillingTransactionId)
                                group returnItem by returnItem.BillingTransactionItemId into data
                                select new
                                {
                                    BillingTransactionItemId = data.Key,
                                    RetQuantity = data.Sum(a => a.RetQuantity)
                                }).ToList();
            if (returnDetail.Count() > 0)
            {
                var ItemInBillingTransaction = (from item in billingDbContext.BillingTransactionItems
                                                .Where(a => a.BillingTransactionId == returnModel.BillingTransactionId).AsEnumerable()
                                                join ret in returnDetail
                                                on item.BillingTransactionItemId equals ret.BillingTransactionItemId into r
                                                from retItem in r.DefaultIfEmpty()
                                                select new
                                                {
                                                    Quantity = item.Quantity - (retItem == null ? 0 : retItem.RetQuantity),
                                                    BillingTransactionItemId = item.BillingTransactionItemId
                                                }).ToList();
                var result = (from item in ItemInBillingTransaction
                              join ret in returnModel.ReturnInvoiceItems on item.BillingTransactionItemId equals ret.BillingTransactionItemId
                              select new
                              {
                                  Quantity = item.Quantity - ret.RetQuantity
                              }).ToList();

                if (result != null && result.All(a => a.Quantity >= 0))
                {
                    isValid = true;
                }
                else
                {
                    isValid = false;
                }
                return isValid;
            }
            else
            {
                var ItemInBillingTransaction = (from item in billingDbContext.BillingTransactionItems
                                               .Where(a => a.BillingTransactionId == returnModel.BillingTransactionId)
                                                join ret in billingDbContext.BillInvoiceReturnItems
                                                on item.BillingTransactionItemId equals ret.BillingTransactionItemId into r
                                                from retItem in r.DefaultIfEmpty()
                                                select new
                                                {
                                                    Quantity = item.Quantity - (retItem == null ? 0 : retItem.RetQuantity),
                                                    BillingTransactionItemId = item.BillingTransactionItemId
                                                }).ToList();
                var result = (from item in ItemInBillingTransaction
                              join ret in returnModel.ReturnInvoiceItems on item.BillingTransactionItemId equals ret.BillingTransactionItemId
                              select new
                              {
                                  Quantity = item.Quantity - ret.RetQuantity
                              }).ToList();

                if (result != null && result.All(a => a.Quantity >= 0))
                {
                    isValid = true;
                }
                else
                {
                    isValid = false;
                }
                return isValid;
            }
        }


        private object GetInvoiceInfoForCreditNote(int invoiceNumber, int fiscalYrId, BillingDbContext billingDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@InvoiceNumber", invoiceNumber),
                        new SqlParameter("@FiscalYearId", fiscalYrId)};


            //there are four return table coming from this stored procedure.
            DataSet dsCreditNoteInfos = DALFunctions.GetDatasetFromStoredProc("SP_BIL_GetInvoiceAndPatientDetailsForCreditNote", paramList, billingDbContext);

            DataTable dtPatientInfo = dsCreditNoteInfos.Tables[0];
            DataTable dtInvoiceInfo = dsCreditNoteInfos.Tables[1];
            DataTable dtTxnItemInfo = dsCreditNoteInfos.Tables[2];
            DataTable dtAlreadyRetItems = dsCreditNoteInfos.Tables[3];

            //group them in a new anonymous object and send to client.
            return new
            {
                PatientInfo = CRN_PatientInfoVM.GetSinglePatientInfoMappedFromDbTable(dtPatientInfo),
                InvoiceInfo = CRN_InvoiceInfoVM.GetSingleInvoiceInfoMappedFromDbTable(dtInvoiceInfo),
                TransactionItems = dtTxnItemInfo,
                AlreadyReturnedItms = dtAlreadyRetItems,
                IsInvoiceFound = dtInvoiceInfo.Rows.Count > 0 ? true : false//this flag decides whether or not to display in client side.
            };


        }

        private object GetCreditNoteInfo(int CreditNoteNo, int fiscalYrId)
        {
            var ReturnReceipt = (from billRtn in _billingDbContext.BillInvoiceReturns.Include("Patient")
                                 join pat in _billingDbContext.Patient
                                        on billRtn.PatientId equals pat.PatientId
                                 join billTxn in _billingDbContext.BillingTransactions
                                        on billRtn.BillingTransactionId equals billTxn.BillingTransactionId
                                 where billRtn.CreditNoteNumber == CreditNoteNo && billRtn.FiscalYearId == fiscalYrId
                                 select new
                                 {
                                     Patient = pat,
                                     BillReturnTxn = billRtn,
                                     ReferenceInvoiceDate = billTxn.CreatedOn,
                                     BillReturnTxnItm = _billingDbContext.BillInvoiceReturnItems.Where(itm => itm.BillReturnId == billRtn.BillReturnId)

                                 }).FirstOrDefault();

            return new
            {
                //Patient = ReturnReceipt.Patient,
                BillReturnTransaction = ReturnReceipt.BillReturnTxn,
                BillReturnTransactionItems = ReturnReceipt.BillReturnTxnItm,
                ReferenceInvoiceDate = ReturnReceipt.ReferenceInvoiceDate,
                UserName = _rbacDbContext.Users.Where(usr => usr.EmployeeId == ReturnReceipt.BillReturnTxn.CreatedBy).FirstOrDefault().UserName
            };
        }


        private object SaveCreditNote(string ipDataString, RbacUser currentUser)
        {

            BillInvoiceReturnModel billInvoiceRet = DanpheJSONConvert.DeserializeObject<BillInvoiceReturnModel>(ipDataString);
            DateTime returnDateTime = DateTime.Now;//need same time for CreditNote and Items, hence created a separate variable.
            if (IsBillReturnValid(billInvoiceRet, _billingDbContext))
            {
                using (var dbContextTransaction = _billingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        if (billInvoiceRet != null)
                        {

                            BillSettlementModel settlement = new BillSettlementModel();

                            //Create new row in settlement if there was cash discount given.
                            if (billInvoiceRet.DiscountReturnAmount > 0)
                            {
                                //BillSettlementModel settlement = new BillSettlementModel();
                                settlement.DiscountReturnAmount = billInvoiceRet.DiscountReturnAmount;
                                settlement.PatientId = billInvoiceRet.PatientId;
                                settlement.SettlementReceiptNo = GetSettlementReceiptNo(_billingDbContext);
                                settlement.CreatedOn = System.DateTime.Now;
                                settlement.SettlementDate = System.DateTime.Now;
                                settlement.FiscalYearId = BillingBL.GetFiscalYear(_billingDbContext).FiscalYearId;
                                settlement.CreatedBy = currentUser.EmployeeId;
                                settlement.CounterId = billInvoiceRet.CounterId;
                                settlement.PaymentMode = ENUM_BillPaymentMode.cash;

                                _billingDbContext.BillSettlements.Add(settlement);
                                _billingDbContext.SaveChanges();
                            }

                            //section-1: Create new row in creditnote (BillInvoiceReturnModel) table..
                            _billingDbContext.AuditDisabled = false;
                            BillingFiscalYear currFiscYear = BillingBL.GetFiscalYear(_billingDbContext);
                            //credit note number will continue from current fiscal year, regardless whether the bill was generated in earlier fiscal year.. (sud:30Aug'18)
                            //int maxCreditNoteNum = _billingDbContext.BillInvoiceReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                            int maxCreditNoteNum = (from txn in _billingDbContext.BillInvoiceReturns
                                                    where txn.FiscalYearId == currFiscYear.FiscalYearId
                                                    select txn.CreditNoteNumber).DefaultIfEmpty(0).Max();
                            billInvoiceRet.CreatedOn = returnDateTime;

                            billInvoiceRet.FiscalYear = currFiscYear.FiscalYearFormatted;
                            billInvoiceRet.FiscalYearId = currFiscYear.FiscalYearId;
                            billInvoiceRet.CreditNoteNumber = maxCreditNoteNum + 1;
                            billInvoiceRet.CreatedBy = currentUser.EmployeeId;
                            if (settlement != null && settlement.SettlementId > 0)
                            {
                                billInvoiceRet.SettlementId = settlement.SettlementId;
                            }
                            else
                            {
                                billInvoiceRet.SettlementId = null;
                            }
                            _billingDbContext.BillInvoiceReturns.Add(billInvoiceRet);
                            _billingDbContext.SaveChanges();
                            _billingDbContext.AuditDisabled = true;


                            /*//Create new row in settlement if there was cash discount while creating settlement.
                            if (billInvoiceRet.DiscountFromSettlement > 0)
                            {
                                BillSettlementModel settlement = new BillSettlementModel();
                                settlement.DiscountReturnAmount = billInvoiceRet.DiscountReturnAmount;
                                settlement.ReturnFromReceivable = billInvoiceRet.ReturnFromReceivable;
                                settlement.PatientId = billInvoiceRet.PatientId;
                                settlement.SettlementReceiptNo = GetSettlementReceiptNo(billingDbContext);
                                settlement.CreatedOn = System.DateTime.Now;
                                settlement.SettlementDate = System.DateTime.Now;
                                settlement.FiscalYearId = BillingBL.GetFiscalYear(billingDbContext).FiscalYearId;
                                settlement.CreatedBy = currentUser.EmployeeId;

                                billingDbContext.BillSettlements.Add(settlement);
                                billingDbContext.SaveChanges();
                            }*/

                            /*Manipal-RevisionNeeded*/
                            //Sud:22Mar'23-- Changed from PriceCatgory to Scheme. Below logic needs revision.
                            //var invoicePriceCategoryObj = _billingDbContext.PriceCategoryModels.Where(a => a.PriceCategoryId == billInvoiceRet.PriceCategoryId).FirstOrDefault();
                            var retInvSchemeObj = _billingDbContext.BillingSchemes.Where(sch => sch.SchemeId == billInvoiceRet.SchemeId).FirstOrDefault();

                            if (billInvoiceRet.PaymentMode.ToLower() == ENUM_BillPaymentMode.credit.ToLower())
                            {
                                UpdateBillCreditStatusAndCreditBalance(_billingDbContext, billInvoiceRet, currentUser, retInvSchemeObj.IsBillingCoPayment);
                            }
                            //start--section-2: Add new rows for all returned items in BillInvoiceReturnItemsModel table
                            if (billInvoiceRet.ReturnInvoiceItems != null && billInvoiceRet.ReturnInvoiceItems.Count > 0)
                            {

                                foreach (BillInvoiceReturnItemsModel itm in billInvoiceRet.ReturnInvoiceItems)
                                {
                                    itm.CreatedBy = currentUser.EmployeeId;
                                    itm.CreatedOn = returnDateTime;
                                    itm.BillReturnId = billInvoiceRet.BillReturnId;
                                    _billingDbContext.BillInvoiceReturnItems.Add(itm);
                                }
                                _billingDbContext.SaveChanges();
                            }

                            //end--section-2: Add new rows for all returned items in BillInvoiceReturnItemsModel table

                            //start--section-3: update status of respective department requisition
                            if (billInvoiceRet.ReturnInvoiceItems != null && billInvoiceRet.ReturnInvoiceItems.Count > 0)
                            {
                                //If either of Lab, Radiology or Visit item is being returned, then we need to update the Billstatus='returned' in those respective tables also. 
                                for (int i = 0; i < billInvoiceRet.ReturnInvoiceItems.Count; i++)
                                {
                                    var currRetItmObj = billInvoiceRet.ReturnInvoiceItems[i];
                                    UpdateDepartemntRequisitionOnReturn(currRetItmObj, _billingDbContext);
                                }
                            }
                            //end--section-3: update status of respective department requisition

                            //start--section-4: Update Insurance Balance if it was Credit Note of INsurance invoice.
                            if (billInvoiceRet.IsInsuranceBilling == true)
                            {
                                double deductableInsuranceAmount = billInvoiceRet.TotalAmount * -1;
                                GovInsuranceBL.UpdateInsuranceCurrentBalance(connString,
                                    billInvoiceRet.PatientId,
                                    billInvoiceRet.InsuranceProviderId ?? default(int),
                                    currentUser.EmployeeId, deductableInsuranceAmount, true, "Insurance bill returned by patient");
                            }

                            //end--section-4: Update Insurance Balance if it was Credit Note of INsurance invoice.

                            //start--section-5: Update Cash collection for current user
                            UpdateEmpCashCollectionAmts(billInvoiceRet, _billingDbContext, currentUser, returnDateTime);
                            //end--section-5: Update Cash collection for current user

                            //start--section-6: Send Return Information to IRD SERVER
                            if (realTimeRemoteSyncEnabled)
                            {
                                if (billInvoiceRet.Patient == null)
                                {
                                    PatientModel pat = _billingDbContext.Patient.Where(p => p.PatientId == billInvoiceRet.PatientId).FirstOrDefault();
                                    billInvoiceRet.Patient = pat;
                                }
                                //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                //BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext);
                                Task.Run(() => BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", _billingDbContext));
                            }
                            //end--section-6: Send Return Information to IRD SERVER

                            //start: --section 7: Send Return To SSF Server for SSF Patients
                            var patientSchemes = _billingDbContext.PatientSchemeMaps.Where(a => a.SchemeId == billInvoiceRet.SchemeId && a.PatientId == billInvoiceRet.PatientId).FirstOrDefault();
                            if (patientSchemes != null)
                            {
                                int priceCategoryId = billInvoiceRet.ReturnInvoiceItems[0].PriceCategoryId;
                                var priceCategory = _billingDbContext.PriceCategoryModels.Where(a => a.PriceCategoryId == priceCategoryId).FirstOrDefault();
                                if (priceCategory != null && priceCategory.PriceCategoryName.ToLower() == "ssf" && RealTimeSSFClaimBooking)
                                {
                                    //making parallel thread call (asynchronous) to post to SSF Server. so that it won't stop the normal BillingFlow.
                                    SSFDbContext ssfDbContext = new SSFDbContext(connString);
                                    var billObj = new SSF_ClaimBookingBillDetail_DTO()
                                    {
                                        InvoiceNoFormatted = $"CRN{billInvoiceRet.CreditNoteNumber}",
                                        TotalAmount = -(decimal)billInvoiceRet.TotalAmount, //Keep it negative here, SSF takes return as negative values so that they can subtract later with TotalAmount
                                        ClaimCode = (long)patientSchemes.LatestClaimCode
                                    };

                                    SSF_ClaimBookingService_DTO claimBooking = SSF_ClaimBookingService_DTO.GetMappedToBookClaim(billObj, patientSchemes);

                                    Task.Run(() => BillingBL.SyncToSSFServer(claimBooking, "billing", ssfDbContext, patientSchemes, currentUser));
                                }
                            }
                            //end: --section 7: Send Return To SSF Server for SSF Patients

                        }
                        dbContextTransaction.Commit();

                        return billInvoiceRet;
                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }


                }
            }
            else
            {
                throw new Exception("Sorry !!! Some Items are already returned.");
            }

        }


        [Obsolete("Please use other Method--SaveCreditNote instead of this")]
        private object SaveReturnInvoice_Old(RbacUser currentUser, string billInvReturnModelStr, string billTransactionStr)
        {
            BillInvoiceReturnModel billInvoiceRet = DanpheJSONConvert.DeserializeObject<BillInvoiceReturnModel>(billInvReturnModelStr);

            if (billInvoiceRet != null)
            {
                //Transaction Begins  
                using (var dbContextTransaction = _billingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        _billingDbContext.AuditDisabled = false;
                        BillingFiscalYear currFiscYear = BillingBL.GetFiscalYear(_billingDbContext);
                        //credit note number will continue from current fiscal year, regardless whether the bill was generated in earlier fiscal year.. (sud:30Aug'18)
                        //int maxCreditNoteNum = _billingDbContext.BillInvoiceReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                        int maxCreditNoteNum = (from txn in _billingDbContext.BillInvoiceReturns
                                                where txn.FiscalYearId == currFiscYear.FiscalYearId
                                                select txn.CreditNoteNumber).DefaultIfEmpty(0).Max();
                        billInvoiceRet.CreatedOn = DateTime.Now;

                        billInvoiceRet.FiscalYear = currFiscYear.FiscalYearFormatted;
                        billInvoiceRet.FiscalYearId = currFiscYear.FiscalYearId;
                        billInvoiceRet.CreditNoteNumber = (maxCreditNoteNum + 1);
                        billInvoiceRet.CreatedBy = currentUser.EmployeeId;
                        _billingDbContext.BillInvoiceReturns.Add(billInvoiceRet);
                        _billingDbContext.SaveChanges();


                        //commented--sud:7Feb--this logic is totally wrong
                        //var visit = _billingDbContext.Visit.Where(x => x.PatientId == billInvoiceRet.PatientId).OrderByDescending(x=>x.VisitDate).FirstOrDefault();

                        //visit.BillingStatus = ENUM_BillingStatus.returned;
                        //_billingDbContext.Visit.Attach(visit);
                        //_billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                        _billingDbContext.AuditDisabled = true;

                        ///sud:30Apr'21--need to remove below PartialBilling logic altogether from billing
                        if (!string.IsNullOrEmpty(billTransactionStr))
                        {
                            // Rajesh: 8sept19 once the items are returned then for remaining items will generate new invoice.
                            BillingTransactionModel billingTXN = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(billTransactionStr);

                            billTxnReturnData = billingTXN;

                            List<BillingTransactionItemModel> billingTransactionItems = new List<BillingTransactionItemModel>();
                            // PatientModel patient = new PatientModel();
                            patient = billingTXN.Patient;
                            billingTransactionItems = billingTXN.BillingTransactionItems;
                            DepositReturnAmount = billingTXN.DepositReturnAmount;

                            if (billingTXN.BillingTransactionItems.Count > 0)
                            {
                                billingTXN.BillingTransactionItems = null;
                                billingTXN.Patient = null;
                                billingTXN.CreatedBy = currentUser.EmployeeId;
                                if (billingTXN.BillStatus == "unpaid")
                                {
                                    billingTXN.PaidDate = null;
                                    billingTXN.PaidAmount = 0;
                                    billingTXN.PaymentReceivedBy = null;
                                    billingTXN.PaidCounterId = null;

                                }
                                else if (billingTXN.BillStatus == "paid")
                                {
                                    billingTXN.PaidDate = DateTime.Now;
                                    billingTXN.PaidAmount = billingTXN.TotalAmount;
                                    billingTXN.PaidCounterId = billingTXN.CounterId;
                                    billingTXN.PaymentReceivedBy = billingTXN.CreatedBy;
                                }

                                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

                                billingTXN.CreatedOn = DateTime.Now;
                                billingTXN.CreatedBy = currentUser.EmployeeId;
                                billingTXN.FiscalYearId = fiscYear.FiscalYearId;
                                billingTXN.DepositReturnAmount = 0;
                                billingTXN.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                                billingTXN.InvoiceCode = billingTXN.IsInsuranceBilling == true ? "INS" : BillingBL.InvoiceCode;
                                _billingDbContext.Entry(billingTXN).State = System.Data.Entity.EntityState.Detached;
                                _billingDbContext.BillingTransactions.Add(billingTXN);
                                _billingDbContext.SaveChanges();

                                //check this logic: Pratik--
                                //why are we adding new billingtransactionitems in the database.. ?
                                //ans: sud > this was to handle partialreturn cases..
                                billingTransactionItems.ForEach(item =>
                                {
                                    item.BillingTransactionId = billingTXN.BillingTransactionId;
                                    item.BillingTransaction = null;
                                    item.Patient = null;
                                    item.CreatedBy = currentUser.EmployeeId;
                                    item.CreatedOn = DateTime.Now;
                                    item.RequisitionDate = DateTime.Now;
                                    item.PrescriberId = currentUser.EmployeeId;
                                    item.PaidDate = billingTXN.PaidDate;
                                    item.PaidCounterId = billingTXN.CounterId;
                                    item.PaymentReceivedBy = billingTXN.CreatedBy;
                                    _billingDbContext.BillingTransactionItems.Add(item);
                                    _billingDbContext.SaveChanges();

                                });
                            }
                        }
                        //update transactiontable after bill is returned..
                        int invoiceNo = billInvoiceRet.RefInvoiceNum;
                        //BillingTransactionModel billTxn = _billingDbContext.BillingTransactions
                        //  .Where(b => b.InvoiceNo == billInvoiceRet.RefInvoiceNum)
                        //  .FirstOrDefault();
                        //changed: sud: 18July, since Invoice No will repeat with fiscal year, so need to find by billingtransactionid.
                        BillingTransactionModel billTxn = _billingDbContext.BillingTransactions
                            .Where(b => b.BillingTransactionId == billInvoiceRet.BillingTransactionId)
                            .FirstOrDefault();
                        _billingDbContext.BillingTransactions.Attach(billTxn);
                        billTxn.ReturnStatus = true;
                        if (billTxnReturnData.BillingTransactionItems != null)
                        {
                            if (billTxnReturnData.BillingTransactionItems.Count > 0)
                            {
                                billTxn.PartialReturnTxnId = billTxnReturnData.BillingTransactionId;
                            }
                        }
                        _billingDbContext.Entry(billTxn).Property(a => a.ReturnStatus).IsModified = true;
                        _billingDbContext.Entry(billTxn).Property(a => a.PartialReturnTxnId).IsModified = true;
                        _billingDbContext.SaveChanges();


                        if (billTxn.IsInsuranceBilling == true && billTxn.ClaimCode != null)
                        {
                            double deductableInsuranceAmount = (billTxn.TotalAmount) * -1;
                            GovInsuranceBL.UpdateInsuranceCurrentBalance(connString,
                                billTxn.PatientId,
                                billTxn.InsuranceProviderId ?? default(int),
                                currentUser.EmployeeId, deductableInsuranceAmount, true, "Insurance bill returned by patient");
                        }

                        var invoiceItems = _billingDbContext.BillingTransactionItems.Where(b => b.BillingTransactionId == billInvoiceRet.BillingTransactionId).ToList();
                        //replaced calling centralized function in BillingBL
                        for (int i = 0; i < invoiceItems.Count; i++)
                        {
                            ///sud:30Apr'21--need to remove below if condition(PartialBilling) logic altogether from billing
                            if (string.IsNullOrEmpty(billTransactionStr))
                            {

                                invoiceItems[i] = BillingTransactionBL.UpdateTxnItemBillStatus(_billingDbContext,
                                invoiceItems[i],
                                "returned",
                                currentUser);
                            }
                            else
                            {

                                invoiceItems[i].ReturnStatus = true;
                                invoiceItems[i].IsSelected = billInvoiceRet.ReturnedItems[i].IsSelected;
                                if (billInvoiceRet.ReturnedItems[i].IsSelected == true)
                                {
                                    var id = billInvoiceRet.ReturnedItems[i].RequisitionId;
                                    var srvDptId = invoiceItems[i].ServiceDepartmentId;
                                    var serviceDepartment = _billingDbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == srvDptId).FirstOrDefault();

                                    if (!string.IsNullOrEmpty(serviceDepartment.IntegrationName))
                                    {
                                        if (serviceDepartment.IntegrationName.ToLower() == "lab")
                                        {
                                            var LabReq = _billingDbContext.LabRequisitions.Where(b => b.RequisitionId == id).FirstOrDefault();
                                            if (LabReq != null)
                                            {
                                                LabReq.BillingStatus = "returned";
                                                _billingDbContext.LabRequisitions.Attach(LabReq);
                                                _billingDbContext.Entry(LabReq).Property(a => a.BillingStatus).IsModified = true;
                                                _billingDbContext.SaveChanges();
                                            }
                                        }
                                        else if (serviceDepartment.IntegrationName.ToLower() == "radiology")
                                        {
                                            var RadReq = _billingDbContext.RadiologyImagingRequisitions.Where(a => a.ImagingRequisitionId == id).FirstOrDefault();
                                            if (RadReq != null)
                                            {
                                                RadReq.BillingStatus = "returned";
                                                _billingDbContext.RadiologyImagingRequisitions.Attach(RadReq);
                                                _billingDbContext.Entry(RadReq).Property(a => a.BillingStatus).IsModified = true;
                                                _billingDbContext.SaveChanges();
                                            }
                                        }
                                        else if (serviceDepartment.IntegrationName.ToLower() == "opd")
                                        {
                                            //var aa = billTxn.BillingTransactionItems.Find(a => a.ServiceDepartment.IntegrationName.ToLower() == "opd");
                                            VisitModel visit = (from v in _billingDbContext.Visit
                                                                where v.PatientId == billTxn.PatientId
                                                                && v.PatientVisitId == billTxn.PatientVisitId
                                                                select v).FirstOrDefault();

                                            if (visit != null)
                                            {
                                                visit.BillingStatus = "returned";
                                                _billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                                            }
                                        }

                                    }




                                }
                                invoiceItems[i].ReturnQuantity = invoiceItems[i].Quantity;
                                _billingDbContext.BillingTransactionItems.Attach(invoiceItems[i]);
                                _billingDbContext.Entry(invoiceItems[i]).Property(a => a.ReturnStatus).IsModified = true;
                                _billingDbContext.Entry(invoiceItems[i]).Property(a => a.ReturnQuantity).IsModified = true;
                                _billingDbContext.SaveChanges();
                            }
                        }

                        //Yubraj: 18th Dec '18 :: Updating IsActive in deposit table while invoice return
                        List<BillingDepositModel> deposit = (from dpt in _billingDbContext.BillingDeposits
                                                             where dpt.BillingTransactionId == billInvoiceRet.BillingTransactionId &&
                                                              (dpt.TransactionType == ENUM_DepositTransactionType.DepositDeduct //"depositdeduct" 
                                                              || dpt.TransactionType == ENUM_DepositTransactionType.ReturnDeposit) // "ReturnDeposit")
                                                             select dpt).ToList();
                        if (deposit != null)
                        {
                            deposit.ForEach(a =>
                            {
                                a.IsActive = true; //keeping false was affecting the patient deposit info
                                a.ModifiedRemarks = "Updated after invoice return of BillTxnId: " + billInvoiceRet.BillingTransactionId.ToString();
                                a.ModifiedOn = DateTime.Now;
                                a.ModifiedBy = currentUser.EmployeeId;
                            });
                        }

                        //var aa = billTxn.BillingTransactionItems.Find(a => a.ServiceDepartment.IntegrationName.ToLower() == "opd");
                        //VisitModel visit = (from v in _billingDbContext.Visit
                        //                    where v.PatientId == billTxn.PatientId
                        //                    && v.PatientVisitId == billTxn.PatientVisitId && aa != null
                        //                    select v).FirstOrDefault();

                        //if (visit != null)
                        //{
                        //    visit.BillingStatus = "returned";
                        //    _billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                        //}

                        billInvoiceRet.ReturnedItems = invoiceItems.ToList();
                        billInvoiceRet.PartialReturnTxnId = billTxn.PartialReturnTxnId;
                        _billingDbContext.SaveChanges();

                        //if bill-status is paid, that means user has to return some amount to the patient.
                        if (billTxnReturnData.BillStatus == ENUM_BillingStatus.paid)
                        {
                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = "SalesReturn";
                            empCashTransaction.ReferenceNo = billInvoiceRet.BillReturnId;
                            empCashTransaction.InAmount = 0;
                            empCashTransaction.OutAmount = billInvoiceRet.TotalAmount;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = billInvoiceRet.CounterId;
                            BillingBL.AddEmpCashTransaction(_billingDbContext, empCashTransaction);
                        }

                        dbContextTransaction.Commit(); //end of transaction
                        billInvoiceRet.Patient = patient;
                        billTxnReturnData.Patient = patient;
                        billTxnReturnData.DepositReturnAmount = DepositReturnAmount;


                        //sync to remote server once return invoice is created
                        //send to IRD only after transaction is committed successfully: sud-23Dec'18
                        if (realTimeRemoteSyncEnabled)
                        {
                            if (billInvoiceRet.Patient == null)
                            {
                                PatientModel pat = _billingDbContext.Patient.Where(p => p.PatientId == billInvoiceRet.PatientId).FirstOrDefault();
                                billInvoiceRet.Patient = pat;
                            }
                            //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                            //BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext);
                            Task.Run(() => BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", _billingDbContext));
                        }

                        return new
                        {

                            BillingReturnedData = billInvoiceRet,
                            BillingRemainingData = billTxnReturnData,

                        };



                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            else
            {
                throw new Exception("billTransactionitems is invalid");
            }
        }


    }


}
