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
        public string Get()
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

        [HttpPost]// POST api/values
        public string Post(string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            //string ipDataString = this.ReadPostData();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
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
                                int? maxCreditNoteNum = billingDbContext.BillReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                                billInvoiceRet.CreatedOn = DateTime.Now;
                                if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                                {
                                    maxCreditNoteNum = 0;

                                }

                                billInvoiceRet.FiscalYear = currFiscYear.FiscalYearFormatted;
                                billInvoiceRet.FiscalYearId = currFiscYear.FiscalYearId;
                                billInvoiceRet.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                                billInvoiceRet.CreatedBy = currentUser.EmployeeId;
                                billingDbContext.BillReturns.Add(billInvoiceRet);
                                billingDbContext.SaveChanges();

                                //commented--sud:7Feb--this logic is totally wrong
                                //var visit = billingDbContext.Visit.Where(x => x.PatientId == billInvoiceRet.PatientId).OrderByDescending(x=>x.VisitDate).FirstOrDefault();

                                //visit.BillingStatus = ENUM_BillingStatus.returned;
                                //billingDbContext.Visit.Attach(visit);
                                //billingDbContext.Entry(visit).Property(a => a.BillingStatus).IsModified = true;
                                billingDbContext.AuditDisabled = true;


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

                                if (billTxn.IsInsuranceBilling == true)
                                {
                                    double deductableInsuranceAmount = (billTxn.TotalAmount ?? default(double)) * -1;
                                    BillingBL.UpdateInsuranceCurrentBalance(connString,
                                        billTxn.PatientId,
                                        billTxn.InsuranceProviderId ?? default(int),
                                        currentUser.EmployeeId, deductableInsuranceAmount, true);
                                }

                                var invoiceItems = billingDbContext.BillingTransactionItems.Where(b => b.BillingTransactionId == billInvoiceRet.BillingTransactionId).ToList();
                                //replaced calling centralized function in BillingBL
                                for (int i = 0; i < invoiceItems.Count; i++)
                                {
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
    }
}
