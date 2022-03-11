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

namespace DanpheEMR.Controllers
{

    public class BillReturnController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;
        string InvoiceCode = "BL";
        double? DepositReturnAmount = 0;
        BillingTransactionModel billTxnReturnData = new BillingTransactionModel();
        PatientModel patient = new PatientModel();
        public BillReturnController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }



        [HttpGet]
        public string Get(string reqType, int? invoiceNumber, int? CreditNoteNo, int fiscalYrId, bool getVisitInfo)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);

            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                if (reqType != null && reqType == "getInvoiceDetailsForCreditNote" && invoiceNumber != null && invoiceNumber != 0)
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
                    responseData.Results = new
                    {
                        PatientInfo = CRN_PatientInfoVM.GetSinglePatientInfoMappedFromDbTable(dtPatientInfo),
                        InvoiceInfo = CRN_InvoiceInfoVM.GetSingleInvoiceInfoMappedFromDbTable(dtInvoiceInfo),
                        TransactionItems = dtTxnItemInfo,
                        AlreadyReturnedItms = dtAlreadyRetItems,
                        IsInvoiceFound = dtInvoiceInfo.Rows.Count > 0 ? true : false//this flag decides whether or not to display in client side.
                    };


                }

                else if (reqType != null && reqType == "CreditNoteByCreditNoteNo" && CreditNoteNo != null && CreditNoteNo != 0)
                {

                    //BillInvoiceReturnModel bilItmRtn = billingDbContext.BillInvoiceReturns.Where(bilItm => bilItm.CreditNoteNumber == CreditNoteNo && bilItm.FiscalYearId == fiscalYrId).FirstOrDefault();
                    var ReturnReceipt = (from billRtn in billingDbContext.BillInvoiceReturns.Include("Patient")
                                         join pat in billingDbContext.Patient
                                                on billRtn.PatientId equals pat.PatientId
                                         where billRtn.CreditNoteNumber == CreditNoteNo && billRtn.FiscalYearId == fiscalYrId
                                         select new
                                         {
                                             Patient = pat,
                                             BillReturnTxn = billRtn,
                                             BillReturnTxnItm = billingDbContext.BillInvoiceReturnItems.Where(itm => itm.BillReturnId == billRtn.BillReturnId)

                                         }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = new
                    {
                        //Patient = ReturnReceipt.Patient,
                        BillReturnTransaction = ReturnReceipt.BillReturnTxn,
                        BillReturnTransactionItems = ReturnReceipt.BillReturnTxnItm,
                        UserName = rbacDbContext.Users.Where(usr => usr.EmployeeId == ReturnReceipt.BillReturnTxn.CreatedBy).FirstOrDefault().UserName

                    };

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        [HttpPost]// POST api/values
        public string Post(string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            //string ipDataString = this.ReadPostData();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top

            string ipDataString = this.ReadPostData();

            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                MasterDbContext masterDbContext = new MasterDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqType == "returnInvoice")//submit
                {
                    var billInvReturnModel = Request.Form["billInvReturnModel"];
                    var billTransaction = Request.Form["billTransaction"];
                    //var currentDate = DateTime.Now;
                    BillInvoiceReturnModel billInvoiceRet = DanpheJSONConvert.DeserializeObject<BillInvoiceReturnModel>(billInvReturnModel);

                    if (billInvoiceRet != null)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                billingDbContext.AuditDisabled = false;
                                BillingFiscalYear currFiscYear = BillingBL.GetFiscalYear(billingDbContext);
                                //credit note number will continue from current fiscal year, regardless whether the bill was generated in earlier fiscal year.. (sud:30Aug'18)
                                int? maxCreditNoteNum = billingDbContext.BillInvoiceReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                                billInvoiceRet.CreatedOn = DateTime.Now;
                                if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                                {
                                    maxCreditNoteNum = 0;

                                }

                                billInvoiceRet.FiscalYear = currFiscYear.FiscalYearFormatted;
                                billInvoiceRet.FiscalYearId = currFiscYear.FiscalYearId;
                                billInvoiceRet.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                                billInvoiceRet.CreatedBy = currentUser.EmployeeId;
                                billingDbContext.BillInvoiceReturns.Add(billInvoiceRet);
                                billingDbContext.SaveChanges();


                                //commented--sud:7Feb--this logic is totally wrong
                                //var visit = billingDbContext.Visit.Where(x => x.PatientId == billInvoiceRet.PatientId).OrderByDescending(x=>x.VisitDate).FirstOrDefault();

                                //visit.BillingStatus = ENUM_BillingStatus.returned;
                                //billingDbContext.Visit.Attach(visit);
                                //billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                                billingDbContext.AuditDisabled = true;

                                ///sud:30Apr'21--need to remove below PartialBilling logic altogether from billing
                                if (!string.IsNullOrEmpty(billTransaction))
                                {
                                    // Rajesh: 8sept19 once the items are returned then for remaining items will generate new invoice.
                                    BillingTransactionModel billingTXN = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(billTransaction);

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
                                            billingTXN.PaidAmount = null;
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
                                        billingDbContext.Entry(billingTXN).State = System.Data.Entity.EntityState.Detached;
                                        billingDbContext.BillingTransactions.Add(billingTXN);
                                        billingDbContext.SaveChanges();

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
                                            item.RequestedBy = currentUser.EmployeeId;
                                            item.PaidDate = billingTXN.PaidDate;
                                            item.PaidCounterId = billingTXN.CounterId;
                                            item.PaymentReceivedBy = billingTXN.CreatedBy;
                                            billingDbContext.BillingTransactionItems.Add(item);
                                            billingDbContext.SaveChanges();

                                        });
                                    }
                                }
                                //update transactiontable after bill is returned..
                                int invoiceNo = billInvoiceRet.RefInvoiceNum;
                                //BillingTransactionModel billTxn = billingDbContext.BillingTransactions
                                //  .Where(b => b.InvoiceNo == billInvoiceRet.RefInvoiceNum)
                                //  .FirstOrDefault();
                                //changed: sud: 18July, since Invoice No will repeat with fiscal year, so need to find by billingtransactionid.
                                BillingTransactionModel billTxn = billingDbContext.BillingTransactions
                                    .Where(b => b.BillingTransactionId == billInvoiceRet.BillingTransactionId)
                                    .FirstOrDefault();
                                billingDbContext.BillingTransactions.Attach(billTxn);
                                billTxn.ReturnStatus = true;
                                if (billTxnReturnData.BillingTransactionItems != null)
                                {
                                    if (billTxnReturnData.BillingTransactionItems.Count > 0)
                                    {
                                        billTxn.PartialReturnTxnId = billTxnReturnData.BillingTransactionId;
                                    }
                                }
                                billingDbContext.Entry(billTxn).Property(a => a.ReturnStatus).IsModified = true;
                                billingDbContext.Entry(billTxn).Property(a => a.PartialReturnTxnId).IsModified = true;
                                billingDbContext.SaveChanges();

                                //if (billTxn.IsInsuranceBilling == true)
                                //{
                                //    double deductableInsuranceAmount = (billTxn.TotalAmount ?? default(double)) * -1;
                                //    BillingBL.UpdateInsuranceCurrentBalance(connString,
                                //        billTxn.PatientId,
                                //        billTxn.InsuranceProviderId ?? default(int),
                                //        currentUser.EmployeeId, deductableInsuranceAmount, true);
                                //}

                                if (billTxn.IsInsuranceBilling == true && billTxn.ClaimCode != null)
                                {
                                    double deductableInsuranceAmount = (billTxn.TotalAmount ?? default(double)) * -1;
                                    InsuranceBL.UpdateInsuranceCurrentBalance(connString,
                                        billTxn.PatientId,
                                        billTxn.InsuranceProviderId ?? default(int),
                                        currentUser.EmployeeId, deductableInsuranceAmount, true, "Insurance bill returned by patient");
                                }

                                var invoiceItems = billingDbContext.BillingTransactionItems.Where(b => b.BillingTransactionId == billInvoiceRet.BillingTransactionId).ToList();
                                //replaced calling centralized function in BillingBL
                                for (int i = 0; i < invoiceItems.Count; i++)
                                {
                                    ///sud:30Apr'21--need to remove below if condition(PartialBilling) logic altogether from billing
                                    if (string.IsNullOrEmpty(billTransaction))
                                    {

                                        invoiceItems[i] = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext,
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
                                            var serviceDepartment = billingDbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == srvDptId).FirstOrDefault();

                                            if (!string.IsNullOrEmpty(serviceDepartment.IntegrationName))
                                            {
                                                if (serviceDepartment.IntegrationName.ToLower() == "lab")
                                                {
                                                    var LabReq = billingDbContext.LabRequisitions.Where(b => b.RequisitionId == id).FirstOrDefault();
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
                                                    var RadReq = billingDbContext.RadiologyImagingRequisitions.Where(a => a.ImagingRequisitionId == id).FirstOrDefault();
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
                                                    //var aa = billTxn.BillingTransactionItems.Find(a => a.ServiceDepartment.IntegrationName.ToLower() == "opd");
                                                    VisitModel visit = (from v in billingDbContext.Visit
                                                                        where v.PatientId == billTxn.PatientId
                                                                        && v.PatientVisitId == billTxn.PatientVisitId
                                                                        select v).FirstOrDefault();

                                                    if (visit != null)
                                                    {
                                                        visit.BillingStatus = "returned";
                                                        billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                                                    }
                                                }

                                            }




                                        }
                                        invoiceItems[i].ReturnQuantity = invoiceItems[i].Quantity;
                                        billingDbContext.BillingTransactionItems.Attach(invoiceItems[i]);
                                        billingDbContext.Entry(invoiceItems[i]).Property(a => a.ReturnStatus).IsModified = true;
                                        billingDbContext.Entry(invoiceItems[i]).Property(a => a.ReturnQuantity).IsModified = true;
                                        billingDbContext.SaveChanges();
                                    }
                                }

                                //Yubraj: 18th Dec '18 :: Updating IsActive in deposit table while invoice return
                                List<BillingDeposit> deposit = (from dpt in billingDbContext.BillingDeposits
                                                                where dpt.BillingTransactionId == billInvoiceRet.BillingTransactionId &&
                                                                 (dpt.DepositType == ENUM_BillDepositType.DepositDeduct //"depositdeduct" 
                                                                 || dpt.DepositType == ENUM_BillDepositType.ReturnDeposit) // "ReturnDeposit")
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
                                //VisitModel visit = (from v in billingDbContext.Visit
                                //                    where v.PatientId == billTxn.PatientId
                                //                    && v.PatientVisitId == billTxn.PatientVisitId && aa != null
                                //                    select v).FirstOrDefault();

                                //if (visit != null)
                                //{
                                //    visit.BillingStatus = "returned";
                                //    billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                                //}

                                billInvoiceRet.ReturnedItems = invoiceItems.ToList();
                                billInvoiceRet.PartialReturnTxnId = billTxn.PartialReturnTxnId;
                                billingDbContext.SaveChanges();

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
                                    BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                                }

                                dbContextTransaction.Commit(); //end of transaction
                                billInvoiceRet.Patient = patient;
                                billTxnReturnData.Patient = patient;
                                billTxnReturnData.DepositReturnAmount = DepositReturnAmount;
                                responseData.Results = new
                                {

                                    BillingReturnedData = billInvoiceRet,
                                    BillingRemainingData = billTxnReturnData,

                                };


                                //sync to remote server once return invoice is created
                                //send to IRD only after transaction is committed successfully: sud-23Dec'18
                                if (realTimeRemoteSyncEnabled)
                                {
                                    if (billInvoiceRet.Patient == null)
                                    {
                                        PatientModel pat = billingDbContext.Patient.Where(p => p.PatientId == billInvoiceRet.PatientId).FirstOrDefault();
                                        billInvoiceRet.Patient = pat;
                                    }
                                    //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                    //BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext);
                                    Task.Run(() => BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext));
                                }


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
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "billTransactionitems is invalid";
                    }
                }
                else if (reqType == "post-creditnote")
                {
                    BillInvoiceReturnModel billInvoiceRet = DanpheJSONConvert.DeserializeObject<BillInvoiceReturnModel>(ipDataString);
                    DateTime returnDateTime = DateTime.Now;//need same time for CreditNote and Items, hence created a separate variable.
                    using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
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
                                    settlement.SettlementReceiptNo = GetSettlementReceiptNo(billingDbContext);
                                    settlement.CreatedOn = System.DateTime.Now;
                                    settlement.SettlementDate = System.DateTime.Now;
                                    settlement.FiscalYearId = BillingBL.GetFiscalYear(billingDbContext).FiscalYearId;
                                    settlement.CreatedBy = currentUser.EmployeeId;
                                    settlement.CounterId = billInvoiceRet.CounterId;
                                    settlement.PaymentMode = ENUM_BillPaymentMode.cash;

                                    billingDbContext.BillSettlements.Add(settlement);
                                    billingDbContext.SaveChanges();
                                }

                                //section-1: Create new row in creditnote (BillInvoiceReturnModel) table..
                                billingDbContext.AuditDisabled = false;
                                BillingFiscalYear currFiscYear = BillingBL.GetFiscalYear(billingDbContext);
                                //credit note number will continue from current fiscal year, regardless whether the bill was generated in earlier fiscal year.. (sud:30Aug'18)
                                int? maxCreditNoteNum = billingDbContext.BillInvoiceReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                                billInvoiceRet.CreatedOn = returnDateTime;
                                if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                                {
                                    maxCreditNoteNum = 0;
                                }

                                billInvoiceRet.FiscalYear = currFiscYear.FiscalYearFormatted;
                                billInvoiceRet.FiscalYearId = currFiscYear.FiscalYearId;
                                billInvoiceRet.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                                billInvoiceRet.CreatedBy = currentUser.EmployeeId;
                                billInvoiceRet.SettlementId = settlement.SettlementId;
                                billingDbContext.BillInvoiceReturns.Add(billInvoiceRet);
                                billingDbContext.SaveChanges();
                                billingDbContext.AuditDisabled = true;


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

                                //start--section-2: Add new rows for all returned items in BillInvoiceReturnItemsModel table
                                if (billInvoiceRet.ReturnInvoiceItems != null && billInvoiceRet.ReturnInvoiceItems.Count > 0)
                                {

                                    foreach (BillInvoiceReturnItemsModel itm in billInvoiceRet.ReturnInvoiceItems)
                                    {
                                        itm.CreatedBy = currentUser.EmployeeId;
                                        itm.CreatedOn = returnDateTime;
                                        itm.BillReturnId = billInvoiceRet.BillReturnId;
                                        billingDbContext.BillInvoiceReturnItems.Add(itm);
                                    }
                                    billingDbContext.SaveChanges();
                                }

                                //end--section-2: Add new rows for all returned items in BillInvoiceReturnItemsModel table

                                //start--section-3: update status of respective department requisition
                                if (billInvoiceRet.ReturnInvoiceItems != null && billInvoiceRet.ReturnInvoiceItems.Count > 0)
                                {
                                    //If either of Lab, Radiology or Visit item is being returned, then we need to update the Billstatus='returned' in those respective tables also. 
                                    for (int i = 0; i < billInvoiceRet.ReturnInvoiceItems.Count; i++)
                                    {
                                        var currRetItmObj = billInvoiceRet.ReturnInvoiceItems[i];
                                        UpdateDepartemntRequisitionOnReturn(currRetItmObj, billingDbContext);
                                    }
                                }
                                //end--section-3: update status of respective department requisition

                                //start--section-4: Update Insurance Balance if it was Credit Note of INsurance invoice.
                                if (billInvoiceRet.IsInsuranceBilling == true)
                                {
                                    double deductableInsuranceAmount = (billInvoiceRet.TotalAmount ?? default(double)) * -1;
                                    InsuranceBL.UpdateInsuranceCurrentBalance(connString,
                                        billInvoiceRet.PatientId,
                                        billInvoiceRet.InsuranceProviderId ?? default(int),
                                        currentUser.EmployeeId, deductableInsuranceAmount, true, "Insurance bill returned by patient");
                                }

                                //end--section-4: Update Insurance Balance if it was Credit Note of INsurance invoice.

                                //start--section-5: Update Cash collection for current user
                                UpdateEmpCashCollectionAmts(billInvoiceRet, billingDbContext, currentUser, returnDateTime);
                                //end--section-5: Update Cash collection for current user

                                //start--section-6: Send Return Information to IRD SERVER
                                if (realTimeRemoteSyncEnabled)
                                {
                                    if (billInvoiceRet.Patient == null)
                                    {
                                        PatientModel pat = billingDbContext.Patient.Where(p => p.PatientId == billInvoiceRet.PatientId).FirstOrDefault();
                                        billInvoiceRet.Patient = pat;
                                    }
                                    //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                    //BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext);
                                    Task.Run(() => BillingBL.SyncBillToRemoteServer(billInvoiceRet, "sales-return", billingDbContext));
                                }
                                //end--section-6: Send Return Information to IRD SERVER

                            }
                            dbContextTransaction.Commit();

                            responseData.Status = "OK";
                            responseData.Results = billInvoiceRet;//return recently created creditnote to the client for further use.

                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw ex;
                        }


                    }




                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                responseData.Results = null;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        private void UpdateDepartemntRequisitionOnReturn(BillInvoiceReturnItemsModel currRetItmObj, BillingDbContext billingDbContext)
        {
            var requisitionId = currRetItmObj.RequisitionId;
            var srvDptId = currRetItmObj.ServiceDepartmentId;
            var patId = currRetItmObj.PatientId;
            var patVisitId = currRetItmObj.PatientVisitId;

            var serviceDepartment = billingDbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == srvDptId).FirstOrDefault();

            if (!string.IsNullOrEmpty(serviceDepartment.IntegrationName))
            {
                if (serviceDepartment.IntegrationName.ToLower() == "lab")
                {
                    //RequisitionId is Unique within LabRequisition Table
                    var LabReq = billingDbContext.LabRequisitions.Where(b => b.RequisitionId == requisitionId).FirstOrDefault();
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
                    var RadReq = billingDbContext.RadiologyImagingRequisitions.Where(a => a.ImagingRequisitionId == requisitionId).FirstOrDefault();
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
                empCashTransaction.TransactionType = "SalesReturn";
                empCashTransaction.ReferenceNo = invReturnModel.BillReturnId;
                empCashTransaction.InAmount = 0;
                empCashTransaction.OutAmount = invReturnModel.TotalAmount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                empCashTransaction.TransactionDate = txnDateTime;
                empCashTransaction.CounterID = invReturnModel.CounterId;
                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);

                //if Cash Discount Returned during settlement, we need to add that as InAmount in the EmpCashTransaciton Table..
                //It happens when a invoice is returned after settlement. 
                if (invReturnModel.DiscountReturnAmount > 0)
                {
                    EmpCashTransactionModel empCshTxn2 = new EmpCashTransactionModel();
                    empCshTxn2.TransactionType = "CashDiscountReceived";
                    empCshTxn2.ReferenceNo = invReturnModel.BillReturnId;
                    empCshTxn2.InAmount = invReturnModel.DiscountReturnAmount > 0 ? invReturnModel.DiscountReturnAmount : 0;
                    empCshTxn2.OutAmount = 0;
                    empCshTxn2.EmployeeId = currentUser.EmployeeId;
                    empCshTxn2.TransactionDate = txnDateTime;
                    empCshTxn2.CounterID = invReturnModel.CounterId;
                    BillingBL.AddEmpCashTransaction(billingDbContext, empCshTxn2);
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
    }

}
