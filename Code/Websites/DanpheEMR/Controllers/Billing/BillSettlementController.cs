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
using System.Data;
using DanpheEMR.Enums;
using System.Data.SqlClient;
using DanpheEMR.ServerModel.BillingModels;

namespace DanpheEMR.Controllers
{

    public class BillSettlementController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        public BillSettlementController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }



        [HttpGet]
        public string Get(string reqType, int? patientId, int? settlementId, int billingTransactionId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string ipDataString = this.ReadPostData();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);

                if (reqType != null && reqType == "allPendingSettlements")
                {
                    DataTable settlInfo = DanpheEMR.DalLayer.DALFunctions.GetDataTableFromStoredProc("SP_TXNS_BILL_SettlementSummary", billingDbContext);
                    responseData.Results = settlInfo;
                    ////include only: unpaid and NOT Returned BILLS.
                    //var allBillSettlement = (from bill in billingDbContext.BillingTransactions.Include("Patient")
                    //                         where bill.BillStatus == "unpaid" && bill.ReturnStatus != true
                    //                         group bill by new { bill.PatientId, bill.Patient.PatientCode, bill.Patient.FirstName, bill.Patient.LastName, bill.Patient.MiddleName, bill.Patient.DateOfBirth, bill.Patient.Gender } into p
                    //                         select new
                    //                         {
                    //                             PatientId = p.Key.PatientId,
                    //                             PatientCode = p.Key.PatientCode,
                    //                             ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                    //                             Gender = p.Key.Gender,
                    //                             DateOfBirth = p.Max(a => a.Patient.DateOfBirth.Value),
                    //                             LastCreditBillDate = p.Max(a => a.CreatedOn.Value),
                    //                             TotalCredit = Math.Round(p.Sum(a => a.TotalAmount.Value), 2)
                    //                         }).OrderByDescending(b => b.LastCreditBillDate).ToList();

                    //responseData.Results = allBillSettlement;
                }
                else if (reqType != null && reqType == "getAllBillingInfoOfPatientForSettlement" && patientId != null && patientId != 0)
                {
                    PatientModel currPatient = billingDbContext.Patient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@PatientId", patientId),
                    };
                        DataSet dsBillingInfoOfPatientForSettlement = DALFunctions.GetDatasetFromStoredProc("SP_BIL_GetAllBillingInfoOfPatientForSettlement", paramList, billingDbContext);

                        DataTable dtPatientInfo = dsBillingInfoOfPatientForSettlement.Tables[0];
                        DataTable dtCreditInvoices = dsBillingInfoOfPatientForSettlement.Tables[1];
                        DataTable dtDepositInfo = dsBillingInfoOfPatientForSettlement.Tables[2];
                        DataTable dtProvisionalInfo = dsBillingInfoOfPatientForSettlement.Tables[3];

                        var billingInfoToReturn = new
                        {
                            PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                            CreditInvoiceInfo = dtCreditInvoices,
                            DepositInfo = Settlement_DepositInfoVM.MapDataTableToSingleObject(dtDepositInfo),
                            ProvisionalInfo = Settlement_ProvisionalInfoVM.MapDataTableToSingleObject(dtProvisionalInfo)

                        };
                        responseData.Status = "OK";
                        responseData.Results = billingInfoToReturn;

                    }

                }

                else if (reqType != null && reqType == "unpaidInvoiceByPatientId" && patientId != null && patientId != 0)
                {
                    PatientModel currPatient = billingDbContext.Patient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in billingDbContext.Patient
                                             join countrySubdiv in billingDbContext.CountrySubdivisions
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditInvoice = (from bill in billingDbContext.BillingTransactions.Include("BillingTransactionItems")
                                            where bill.BillStatus == ENUM_BillingStatus.unpaid // "unpaid" 
                                            && bill.ReturnStatus != true && bill.PatientId == patientId

                                            //&& bill.IsInsuranceBilling == false
                                            //sud:5June'19
                                            //if IsInsuranceBilling is null then true by default, else IsInsuranceBilling should be false.  
                                            //&& bill.IsInsuranceBilling == null ?  true : bill.IsInsuranceBilling==false                
                                            && (bill.IsInsuranceBilling.HasValue ? (bill.IsInsuranceBilling.Value == false) : true)
                                            select bill).ToList<BillingTransactionModel>().OrderBy(b => b.BillingTransactionId);

                    //Added by ANISH: Start: 13 August, View Detail of Patient from Settlement Deducting Returned Amount based upon Quantity---
                    var returnedItems = (from ret in billingDbContext.BillInvoiceReturnItems
                                         where ret.PatientId == patientId
                                         group ret by ret.BillingTransactionItemId into dt
                                         select new
                                         {
                                             BillingTransactionItemId = dt.Key,
                                             RetQuantity = dt.Sum(d => d.RetQuantity)
                                         }).ToDictionary(k => k.BillingTransactionItemId, v => v.RetQuantity);

                    var returnedItemsBillItemId = returnedItems.Keys.ToList();

                    foreach (var transaction in patCreditInvoice)
                    {
                        foreach (var item in transaction.BillingTransactionItems)
                        {
                            if (returnedItems.ContainsKey(item.BillingTransactionItemId))
                            {
                                var perUnitPrice = item.TotalAmount.Value / item.Quantity;
                                item.ReturnQty = Convert.ToInt32(returnedItems[item.BillingTransactionItemId]);
                                item.Quantity -= item.ReturnQty;
                                item.TotalAmount = item.Quantity * perUnitPrice;
                            }
                        }
                        transaction.TotalAmount = transaction.BillingTransactionItems.Select(i => i.TotalAmount).Sum();
                        transaction.BillingTransactionItems = transaction.BillingTransactionItems.Where(b => b.Quantity > 0).ToList();
                    }
                    //Added by ANISH: Start: 13 August, END---------


                    AdmissionDbContext admissionDbContext = new AdmissionDbContext(base.connString);

                    bool isAdmitted = (from patAdmission in admissionDbContext.Admissions
                                       where patAdmission.PatientId == patientId
                                           && patAdmission.AdmissionStatus == "admitted"
                                       select patAdmission.AdmissionStatus
                                          ).FirstOrDefault() == null ? false : true;

                    var patCreditDetails = new { Patient = currPatient, CreditItems = patCreditInvoice, IsPatientAdmitted = isAdmitted };


                    responseData.Results = patCreditDetails;

                }
                else if (reqType != null && reqType == "allSettlementDetails")
                {
                    var allSettlments = billingDbContext.BillSettlements.Include("Patient").Include("Patient.CountrySubDivision")
                       .OrderByDescending(s => s.SettlementReceiptNo).ToList();

                    responseData.Results = allSettlments;

                }
                //added: sud: 21may'18-- for duplicate print of settlementid
                else if (reqType == "settlementInfoBySettlmntId" && settlementId != null)
                {
                    RbacDbContext rbacDbContext = new RbacDbContext(connString);

                    /*BillSettlementModel currSettlmnt = billingDbContext.BillSettlements.Include("BillingTransactions").Include("Patient").Include("Patient.CountrySubDivision")
                        .Where(b => b.SettlementId == settlementId.Value)
                        .FirstOrDefault();
                    if (currSettlmnt != null)
                    {

                        string billingUser = rbacDbContext.Users.Where(u => u.EmployeeId == currSettlmnt.CreatedBy).Select(u => u.UserName).FirstOrDefault();
                        currSettlmnt.BillingUser = billingUser;
                        if (currSettlmnt.BillingTransactions != null)
                        {
                            currSettlmnt.BillingTransactions.ForEach(txn =>
                                                    {
                                                        txn.Patient = null;
                                                    });

                        }

                    }
                    responseData.Results = currSettlmnt;*/

                    List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SettlementId", settlementId),
                    };

                    DataSet dsSettlementDetails = DALFunctions.GetDatasetFromStoredProc("SP_Get_Settlement_Details_By_SettlementId", paramList, billingDbContext);
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
                        //DepositReturn = dtDepositReturn,
                        DepositInfo = dtDepositInfo
                    };

                    string billingUser = rbacDbContext.Users.Where(u => u.EmployeeId == settlementPreview.SettlementInfo.CreatedBy).Select(u => u.UserName).FirstOrDefault();
                    settlementPreview.SettlementInfo.BillingUser = billingUser;
                    responseData.Status = "OK";
                    responseData.Results = settlementPreview;

                }
                else if (reqType == "get-settlement-single-invoice-preview")
                {

                    List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@BillingTransactionId", billingTransactionId),
                    };
                    DataSet dsInvoicePreview = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Settlement_GetBillAndReturnItemsOfInvoiceForPreview", paramList, billingDbContext);

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
                    responseData.Status = "OK";
                    responseData.Results = settlmntInvoicePreview;

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
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            int CreatedBy = ToInt(this.ReadQueryStringData("CreatedBy"));
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            string ipDataString = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                if (reqType == "postSettlementInvoice")//submit
                {
                    BillSettlementModel settlement = DanpheJSONConvert.DeserializeObject<BillSettlementModel>(ipDataString);
                    //List<BillingTransactionItemModel> billTxnItm = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataString);
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                    using (var dbTransaction = billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var txns = settlement.BillingTransactions;

                            //step:0, As EF automatically Inserts Child collection (billingtransactionmodel) while inserting settlement
                            // we have to first create a new list and set settlement.BillingTransactions as null.
                            List<BillingTransactionModel> newTxnList = new List<BillingTransactionModel>();

                            foreach (BillingTransactionModel txn in txns)
                            {
                                //BillingTransactionModel newTxn = BillingTransactionModel.GetCloneWithItems(txn);
                                //newTxnList.Add(newTxn);


                                BillingTransactionModel newTxn = billingDbContext.BillingTransactions
                                    .Where(b => b.BillingTransactionId == txn.BillingTransactionId).FirstOrDefault();
                                newTxnList.Add(newTxn);

                            }
                            settlement.BillingTransactions = null;

                            //Step1: assign server side values to the input model and Save the settlementModel 
                            settlement.SettlementReceiptNo = GetSettlementReceiptNo(billingDbContext);
                            DateTime currentDateTime = DateTime.Now;
                            settlement.CreatedOn = currentDateTime;
                            settlement.SettlementDate = currentDateTime;
                            settlement.FiscalYearId = BillingBL.GetFiscalYear(billingDbContext).FiscalYearId;
                            settlement.CreatedBy = currentUser.EmployeeId;

                            billingDbContext.BillSettlements.Add(settlement);
                            billingDbContext.SaveChanges();

                            //adding CollectionFrom Receivable as InAmount into EmpCashTransaction table.. 
                            if (settlement.CollectionFromReceivable.HasValue && settlement.CollectionFromReceivable.Value > 0)
                            {
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = "CollectionFromReceivable";
                                empCashTransaction.ReferenceNo = settlement.SettlementId;
                                empCashTransaction.InAmount = settlement.CollectionFromReceivable;
                                empCashTransaction.OutAmount = 0;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = currentDateTime;
                                empCashTransaction.CounterID = settlement.CounterId;

                                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                            }

                            //adding CashDiscountGiven during settlement as OutAmount into EmpCashTransaction table.. 
                            if (settlement.DiscountAmount.HasValue && settlement.DiscountAmount.Value > 0)
                            {
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = "CashDiscountGiven";
                                empCashTransaction.ReferenceNo = settlement.SettlementId;
                                empCashTransaction.InAmount =  0;
                                empCashTransaction.OutAmount = settlement.DiscountAmount;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = currentDateTime;
                                empCashTransaction.CounterID = settlement.CounterId;

                                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                            }



                            if (newTxnList != null && newTxnList.Count > 0)
                            {
                                //step2: Update necessary fields of BillingTransaction acc to above Settlement Object
                                foreach (var txn in newTxnList)
                                {
                                    billingDbContext.BillingTransactions.Attach(txn);
                                    txn.SettlementId = settlement.SettlementId;
                                    txn.BillStatus = ENUM_BillingStatus.paid;// "paid";
                                    txn.PaidAmount = txn.TotalAmount;
                                    txn.PaidDate = settlement.SettlementDate;
                                    txn.PaymentReceivedBy = currentUser.EmployeeId;//added: sud: 29may'18
                                    txn.PaidCounterId = settlement.CounterId;//added: sud: 29may'18

                                    billingDbContext.Entry(txn).Property(b => b.BillStatus).IsModified = true;
                                    billingDbContext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                                    billingDbContext.Entry(txn).Property(b => b.PaidAmount).IsModified = true;
                                    billingDbContext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                                    billingDbContext.Entry(txn).Property(b => b.PaymentReceivedBy).IsModified = true;//added: sud: 29may'18
                                    billingDbContext.Entry(txn).Property(b => b.PaidCounterId).IsModified = true;//added: sud: 29may'18

                                    //setp3: Update BillStatus and PaidDate of each transaction items attached with above transactions

                                    List<BillingTransactionItemModel> txnItems = billingDbContext.BillingTransactionItems
                                                                                  .Where(b => b.BillingTransactionId == txn.BillingTransactionId).ToList();

                                    if (txnItems != null && txnItems.Count > 0)
                                    {
                                        for (int i = 0; i < txnItems.Count; i++)
                                        {
                                            txnItems[i] = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext,
                                            txnItems[i],
                                            "paid",
                                            currentUser,
                                            settlement.SettlementDate,
                                            settlement.CounterId);
                                        }
                                        billingDbContext.SaveChanges();
                                    }
                                }
                                billingDbContext.SaveChanges();
                            }

                            //step: 4 Add new row to deposit table if Deposit is deducted
                            if (settlement.DepositDeducted != null && settlement.DepositDeducted > 0)
                            {
                                VisitModel patientVisit = billingDbContext.Visit.Where(visit => visit.PatientId == settlement.PatientId)
                                    .OrderByDescending(a => a.PatientVisitId)
                                    .FirstOrDefault();
                                BillingDeposit depositModel = new BillingDeposit()
                                {
                                    Amount = settlement.DepositDeducted,
                                    DepositType = ENUM_BillDepositType.DepositDeduct,// "depositdeduct",
                                    IsActive = true,
                                    FiscalYearId = BillingBL.GetFiscalYear(billingDbContext).FiscalYearId,
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
                                    PaymentMode = ENUM_BillPaymentMode.cash //krishna 26th NOV'21
                                };

                                billingDbContext.BillingDeposits.Add(depositModel);
                                billingDbContext.SaveChanges();

                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = ENUM_BillDepositType.DepositDeduct;
                                empCashTransaction.ReferenceNo = depositModel.DepositId;
                                empCashTransaction.InAmount = 0;
                                empCashTransaction.OutAmount = depositModel.Amount;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = DateTime.Now;
                                empCashTransaction.CounterID = depositModel.CounterId;

                                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);


                            }


                            //Add new row to Deposit table if there is refundable amount.
                            if (settlement.RefundableAmount != null && settlement.RefundableAmount > 0)
                            {
                                VisitModel patientVisit = billingDbContext.Visit.Where(visit => visit.PatientId == settlement.PatientId)
                                    .OrderByDescending(a => a.PatientVisitId)
                                    .FirstOrDefault();
                                BillingDeposit depositModel = new BillingDeposit()
                                {
                                    Amount = settlement.RefundableAmount,
                                    DepositType = ENUM_BillDepositType.ReturnDeposit,// "returnDeposit",
                                    IsActive = true,
                                    FiscalYearId = BillingBL.GetFiscalYear(billingDbContext).FiscalYearId,
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

                                billingDbContext.BillingDeposits.Add(depositModel);
                                billingDbContext.SaveChanges();
                              
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = ENUM_BillDepositType.ReturnDeposit; //depositReturn
                                empCashTransaction.ReferenceNo = depositModel.DepositId;
                                empCashTransaction.InAmount = 0;
                                empCashTransaction.OutAmount = depositModel.Amount;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = DateTime.Now;
                                empCashTransaction.CounterID = depositModel.CounterId;

                                BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                            }


                            
                            

                            //to update BillReturnInvoice table by updating SettlementId for the rows that are being settled.
                            if (settlement.BillReturnIdsCSV.Count > 0)
                            {
                                BillInvoiceReturnModel billInvoiceReturnModel = new BillInvoiceReturnModel();
                                foreach (int stl in settlement.BillReturnIdsCSV)
                                {
                                    billInvoiceReturnModel = billingDbContext.BillInvoiceReturns.Where(b => b.BillReturnId == stl).FirstOrDefault();
                                    billInvoiceReturnModel.SettlementId = settlement.SettlementId;
                                    billingDbContext.Entry(billInvoiceReturnModel).Property(a => a.SettlementId).IsModified = true;
                                }
                                billingDbContext.SaveChanges();
                            }



                            dbTransaction.Commit();

                            responseData.Status = "OK";
                            responseData.Results = settlement;
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.ToString();
                        }
                    }
                }
                //responseData.Results = null;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        [HttpPut]
        public string Put(string reqType, int settlementId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                if (reqType == "updateSettlementPrintCount")
                {
                    BillingDbContext bilDbContext = new BillingDbContext(connString);
                    int settlmntId = settlementId;
                    var currSettlment = bilDbContext.BillSettlements.Where(s => s.SettlementId == settlmntId).FirstOrDefault();
                    if (currSettlment != null)
                    {
                        int? printCount = currSettlment.PrintCount.HasValue ? currSettlment.PrintCount : 0;
                        printCount += 1;
                        bilDbContext.BillSettlements.Attach(currSettlment);
                        currSettlment.PrintCount = printCount;
                        currSettlment.PrintedOn = System.DateTime.Now; //Yubraj: 13th August'19
                        currSettlment.PrintedBy = currentUser.EmployeeId;
                        bilDbContext.Entry(currSettlment).Property(b => b.PrintCount).IsModified = true;
                        bilDbContext.SaveChanges();

                        responseData.Results = new { SettlementId = settlementId, PrintCount = printCount };
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
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
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
