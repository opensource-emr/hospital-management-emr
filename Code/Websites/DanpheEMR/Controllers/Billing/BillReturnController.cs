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

namespace DanpheEMR.Controllers
{

    public class BillReturnController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        public BillReturnController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
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
            string ipDataString = this.ReadPostData();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                MasterDbContext masterDbContext = new MasterDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqType == "returnInvoice")//submit
                {
                    //var currentDate = DateTime.Now;
                    BillInvoiceReturnModel billInvoiceRet = DanpheJSONConvert.DeserializeObject<BillInvoiceReturnModel>(ipDataString);
                    if (billInvoiceRet != null)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                        {
                            try
                            {
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
                                billingDbContext.Entry(billTxn).Property(a => a.ReturnStatus).IsModified = true;
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
                                    invoiceItems[i] = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext,
                                    invoiceItems[i],
                                    "returned",
                                    currentUser.EmployeeId);
                                }

                                //Yubraj: 18th Dec '18 :: Updating IsActive in deposit table while invoice return
                                List<BillingDeposit> deposit = (from dpt in billingDbContext.BillingDeposits
                                                                where dpt.BillingTransactionId == billInvoiceRet.BillingTransactionId &&
                                                                 (dpt.DepositType == "depositdeduct" || dpt.DepositType == "ReturnDeposit")
                                                                select dpt).ToList();
                                if (deposit != null)
                                {
                                    deposit.ForEach(a =>
                                    {
                                        a.IsActive = true; //keeping false was affecting the patient deposit info
                                        a.ModifiedRemarks = "Updated after invoice return of BillTxnId: "+ billInvoiceRet.BillingTransactionId.ToString();
                                        a.ModifiedOn = DateTime.Now;
                                        a.ModifiedBy = currentUser.EmployeeId;
                                    });
                                }
                                billInvoiceRet.ReturnedItems = invoiceItems.ToList();
                                billingDbContext.SaveChanges();

                                dbContextTransaction.Commit(); //end of transaction
                                responseData.Results = billInvoiceRet;

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
