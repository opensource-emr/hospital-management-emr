using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Core.Caching;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using System.Configuration;
using System.Data.Entity;
using System.Transactions;

namespace DanpheEMR.Controllers.Billing
{
    public class BillingBL
    {

        public static string InvoiceCode = "BL";

        public DateTime GetCounterDay_Active(string connString)
        {
            DateTime currCounterDay = (DateTime)DanpheCache.Get("currCounterDay");
            if (currCounterDay == null)
            {
                DanpheEMR.DalLayer.BillingDbContext billingDbcontext = new DalLayer.BillingDbContext(connString);

            }


            return currCounterDay;
        }
        //startDate<currDate && currDate <= end
        //it should be less than or equal to fsc.EndDate

        public static BillingFiscalYear GetFiscalYear(string connString)
        {
            BillingDbContext billDbContext = new BillingDbContext(connString);
            return GetFiscalYear(billDbContext);
        }

        //Overload for GetFiscalYear with dbcontext as parameter, no need to initialize dbcontext if we already have that object.
        public static BillingFiscalYear GetFiscalYear(BillingDbContext billingDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return billingDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }

        //public static int? GetInvoiceNumber(string connString, bool? isInsuranceBIlling)
        //{
        //    int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
        //    DanpheEMR.DalLayer.BillingDbContext billDbContext = new DalLayer.BillingDbContext(connString);
        //    int? invoiceNumber = (from txn in billDbContext.BillingTransactions
        //                          where txn.FiscalYearId == fiscalYearId
        //                          where (txn.IsInsuranceBilling ?? false) == (isInsuranceBIlling ?? false)
        //                          select txn.InvoiceNo).DefaultIfEmpty(0).Max();

        //    return invoiceNumber + 1;
        //}

        public static int? GetInvoiceNumber(string connString)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            {
                int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
                DanpheEMR.DalLayer.BillingDbContext billDbContext = new DalLayer.BillingDbContext(connString);
                int? invoiceNumber = (from txn in billDbContext.BillingTransactions
                                      where txn.FiscalYearId == fiscalYearId
                                      select txn.InvoiceNo).DefaultIfEmpty(0).Max();

                return invoiceNumber + 1;
            }
        }
        public static int? GetDepositReceiptNo(string connString)
        {

            //This is to get the uncommited row data (ReceiptNo).
            using (new TransactionScope(TransactionScopeOption.Required,new TransactionOptions{IsolationLevel = IsolationLevel.ReadUncommitted}))
            {
                                    int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
                                    BillingDbContext billDbContext = new BillingDbContext(connString);
                                    int? receiptNo = (from depTxn in billDbContext.BillingDeposits
                                                      where depTxn.FiscalYearId == fiscalYearId
                                                      select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

                                    return receiptNo + 1;
            }

            /*int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            BillingDbContext billDbContext = new BillingDbContext(connString);
            int? receiptNo = (from depTxn in billDbContext.BillingDeposits
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;*/
        }

        public static int? GetProvisionalReceiptNo(string connString)
        {
            int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            BillingDbContext billDbContext = new BillingDbContext(connString);
            int? receiptNo = (from txnItems in billDbContext.BillingTransactionItems
                              where txnItems.ProvisionalFiscalYearId == fiscalYearId
                              select txnItems.ProvisionalReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }

        public static void SyncBillToRemoteServer(object billToPost, string billType, BillingDbContext dbContext)
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
        public static void PostIRDLog(IRDLogModel irdLogdata, BillingDbContext dbContext)
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

        //public static void UpdateInsuranceCurrentBalance_NotRequired(string connString,
        //        int patientId,
        //        int insuranceProviderId,
        //         int currentUserId,
        //         double amount,
        //         bool isDeduct = false)
        //{
        //    BillingDbContext dbContext = new BillingDbContext(connString);
        //    try
        //    {
        //        InsuranceModel insurance = dbContext.Insurances.Where(ins => ins.PatientId == patientId && ins.InsuranceProviderId == insuranceProviderId).FirstOrDefault();
        //        if (insurance != null)
        //        {
        //            insurance.CurrentBalance = isDeduct ? insurance.CurrentBalance - amount : amount;
        //            insurance.ModifiedOn = DateTime.Now;
        //            insurance.ModifiedBy = currentUserId;
        //            dbContext.Entry(insurance).State = EntityState.Modified;
        //            dbContext.SaveChanges();
        //        }
        //        else
        //        {
        //            throw new Exception("Unable to update Insurance Balance. Detail: Insurance object is null.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception("Unable to update Insurance Balance. Detail:" + ex.ToString());
        //    }
        //}

        public static void AddPatientInsurancePackage(BillingDbContext dbContext, int packageId, int patientId, int currentUserId)
        {
            try
            {
                PatientInsurancePackageTransactionModel patInsPkgTxn = new PatientInsurancePackageTransactionModel();
                patInsPkgTxn.PatientId = patientId;
                patInsPkgTxn.PackageId = packageId;
                patInsPkgTxn.StartDate = DateTime.Now;
                patInsPkgTxn.CreatedOn = DateTime.Now;
                patInsPkgTxn.CreatedBy = currentUserId;
                patInsPkgTxn.IsActive = true;
                dbContext.PatientInsurancePackageTransactions.Add(patInsPkgTxn);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to update Insurance Balance. Detail:" + ex.ToString());
            }
        }

        //method to return inner most exception 
        public static string GetInnerMostException(Exception ex)
        {
            Exception currentEx = ex;
            while (currentEx.InnerException != null)
            {
                currentEx = currentEx.InnerException;
            }
            return currentEx.Message;
        }


        public static void AddEmpCashTransaction(BillingDbContext dbContext, EmpCashTransactionModel empCashTransaction)
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
                dbContext.EmpCashTransactions.Add(empCashTxn);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        //Recalulate Due amount After Handover
        public static void ReCalculateEmployeeDueAmount(BillingDbContext dbContext, int empId, DateTime lastTxnDateTime)
        {
            try
            {
                var empDueAmt = dbContext.EmpDueAmounts.Where(txn => txn.EmployeeId == empId).FirstOrDefault();
                double OutAmt = 0;
                double InAmt = 0;

                //If Due Amount is already found Update the same Amount Else Add New De amount
                if (empDueAmt != null)
                {
                    var latestTxnDate = empDueAmt.LatestTransactionDate;
                    var latestDueAmount = empDueAmt.LatestDueAmount;

                    var empCashTxnList = dbContext.EmpCashTransactions.Where(txn => txn.EmployeeId == empId && txn.TransactionDate > latestTxnDate).ToList();

                    for (int i = 0; i < empCashTxnList.Count; i++)
                    {
                        OutAmt += empCashTxnList[i].OutAmount ?? 0;
                        InAmt += empCashTxnList[i].InAmount ?? 0;
                    }
                    var newDueAmount = latestDueAmount + (InAmt - OutAmt);

                    dbContext.EmpDueAmounts.Attach(empDueAmt);
                    empDueAmt.LatestDueAmount = newDueAmount;
                    empDueAmt.LatestTransactionDate = lastTxnDateTime;
                    dbContext.Entry(empDueAmt).Property(a => a.LatestDueAmount).IsModified = true;
                    dbContext.Entry(empDueAmt).Property(a => a.LatestTransactionDate).IsModified = true;
                    dbContext.SaveChanges();
                }
                else
                {
                    var empCashTxnList = dbContext.EmpCashTransactions.Where(txn => txn.EmployeeId == empId).ToList();

                    for (int i = 0; i < empCashTxnList.Count; i++)
                    {
                        OutAmt += empCashTxnList[i].OutAmount ?? 0;
                        InAmt += empCashTxnList[i].InAmount ?? 0;
                    }

                    EmpDueAmountModel empDueAmount = new EmpDueAmountModel();
                    empDueAmount.EmployeeId = empId;
                    empDueAmount.LatestTransactionDate = lastTxnDateTime;
                    empDueAmount.LatestDueAmount = InAmt - OutAmt;
                    dbContext.EmpDueAmounts.Add(empDueAmount);
                    dbContext.SaveChanges();
                }

            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        //Get Due Amount after calulation
        public static EmpDueAmountModel GetEmpDueAmount(BillingDbContext dbContext, int empId)
        {
            var empDueAmt = dbContext.EmpDueAmounts.Where(txn => txn.EmployeeId == empId).FirstOrDefault();
            var empPendingReceive = dbContext.HandoverTransaction.Where(txn => txn.ReceivedById == null && txn.HandoverByEmpId == empId).ToList();
            double OutAmt = 0;
            double InAmt = 0;
            double TotalPendingReceive = 0;

            EmpDueAmountModel empDueAmountObj = new EmpDueAmountModel();

            if (empPendingReceive !=null)
            {
                for(int i = 0; i< empPendingReceive.Count; i++)
                {
                    TotalPendingReceive += empPendingReceive[i].HandoverAmount ?? 0;
                }

                empDueAmountObj.PendingReceiveAmount = TotalPendingReceive;
            }


            //If Due Amount is already found Then recalulate from latest Transaction Date Else calculate from the begining
            if (empDueAmt != null)
            {
                DateTime latestTxnDate = empDueAmt.LatestTransactionDate;
                var latestDueAmount = empDueAmt.LatestDueAmount;

                var empCashTxnList = dbContext.EmpCashTransactions.Where(txn => txn.EmployeeId == empId && txn.TransactionDate > latestTxnDate).ToList();

                for (int i = 0; i < empCashTxnList.Count; i++)
                {
                    OutAmt += empCashTxnList[i].OutAmount ?? 0;
                    InAmt += empCashTxnList[i].InAmount ?? 0;
                }
                var newDueAmount = latestDueAmount + (InAmt - OutAmt);


                empDueAmountObj.EmployeeDueId = empDueAmt.EmployeeDueId;
                empDueAmountObj.EmployeeId = empId;
                empDueAmountObj.LatestDueAmount = newDueAmount;
                empDueAmountObj.LatestTransactionDate = DateTime.Now;
 

            }
            else
            {
                var empCashTxnList = dbContext.EmpCashTransactions.Where(txn => txn.EmployeeId == empId).ToList();

                for (int i = 0; i < empCashTxnList.Count; i++)
                {
                    OutAmt += empCashTxnList[i].OutAmount ?? 0;
                    InAmt += empCashTxnList[i].InAmount ?? 0;
                }

                empDueAmountObj.EmployeeId = empId;
                empDueAmountObj.LatestTransactionDate = DateTime.Now;
                empDueAmountObj.LatestDueAmount = InAmt - OutAmt;
            }

            return empDueAmountObj;
        }
    }
}
