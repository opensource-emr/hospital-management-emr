using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using DanpheEMR.ServerModel;
using DanpheEMR.Sync.IRDNepal.Models;
using DanpheEMR.Sync;
using Newtonsoft.Json;

namespace DanpheEMR.Sync.IRDNepal
{
    public class PostToIRD
    {
        public static string bilConString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
        static string maxTxnRecords = ConfigurationManager.AppSettings["maximumTXNRecords"];

        public static void SyncSalesToRemoteServer()
        {

            IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
            int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
            //get only those records whic are not synced remotely
            List<BillingTransactionModel> unSyncedBillTxns = dbContext.BillingTransactions.Include("Patient")
                                           .Where(b => !b.IsRemoteSynced.HasValue || b.IsRemoteSynced.Value == false)
                                           .Where(b => b.TransactionType == "ItemTransaction").Take(maxRecords)
                                           .ToList();

            foreach (BillingTransactionModel billTxn in unSyncedBillTxns)
            {
                IRDLogModel irdLog = new IRDLogModel();
                string responseMsg = null;
                try
                {
                    IRD_BillViewModel salesBill = IRD_BillViewModel.GetMappedSalesBillForIRD(billTxn, false);
                    irdLog.JsonData = JsonConvert.SerializeObject(salesBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostSalesBillToIRD(salesBill);
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
                    billTxn.IsRealtime = false;
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

                irdLog.BillType = "billing-sales";
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog);
            }

        }

        public static void SyncSalesReturnToRemoteServer()
        {
            IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
            int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
            //get only those records whic are not synced remotely
            List<BillInvoiceReturnModel> unsyncedBillRets = (from ret in dbContext.BillInvoiceReturns.Include(b => b.Patient)
                                                             where !ret.IsRemoteSynced.HasValue || ret.IsRemoteSynced.Value == false
                                                             select ret).Take(maxRecords).ToList();

            foreach (BillInvoiceReturnModel billRet in unsyncedBillRets)
            {
                IRDLogModel irdLog = new IRDLogModel();
                string responseMsg = null;
                try
                {
                    IRD_BillReturnViewModel salesRetBill = IRD_BillReturnViewModel.GetMappedSalesReturnBillForIRD(billRet, false);
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
                    //salesRetBill.IsRealtime = true;
                    billRet.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    //billRet.IsRealtime = false;
                    billRet.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(billRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(billRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = "billing-sales-return";
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog);
            }

        }

        public static void SynchPhrmInvoiceToRemoteServer()
        {
            IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
            int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
            //get only those records which are not synced remotely
            List<PHRMInvoiceTransactionModel> unSyncedBillTxns = (from ret in dbContext.PhrmInvoiceSale
                                                                  where ret.IsRemoteSynced == null || (ret.IsRemoteSynced == null && ret.IsReturn == true)
                                                                  select ret).Take(maxRecords).ToList();

            foreach (PHRMInvoiceTransactionModel invoice in unSyncedBillTxns)
            {
                IRDLogModel irdLog = new IRDLogModel();
                string responseMsg = null;
                try
                {
                    invoice.PANNumber = GetPANNumber(dbContext, invoice.PatientId);
                    invoice.ShortName = GetShortName(dbContext, invoice.PatientId);
                    invoice.FiscalYear = GetFiscalYearNameById(dbContext, invoice.FiscalYearId);
                    IRD_PHRMBillSaleViewModel phrmInvoice = IRD_PHRMBillSaleViewModel.GetMappedInvoiceForIRD(invoice, false);
                    irdLog.JsonData = JsonConvert.SerializeObject(phrmInvoice);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceToIRD(phrmInvoice);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PhrmInvoiceSale.Attach(invoice);
                if (responseMsg == "200")
                {
                    invoice.IsRealtime = false;
                    invoice.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    invoice.IsRealtime = false;
                    invoice.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(invoice).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(invoice).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = "phrm-invoice";
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog);

            }
        }

        public static void SyncPhrmInvoiceReturnToRemoteServer()
        {       
            IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
            int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
            //get only those records whic are not synced remotely
            List<PHRMInvoiceTransactionModel> unsyncedBillRets = (from ret in dbContext.PhrmInvoiceSale
                                                                  where ret.IsReturn == true && (ret.IsRemoteSynced == true || ret.IsRemoteSynced == null)
                                                                  select ret).Take(maxRecords).ToList();
                                                      
            foreach (PHRMInvoiceTransactionModel InvoiceRet in unsyncedBillRets)
            {
                IRDLogModel irdLog = new IRDLogModel();
                string responseMsg = null;
                try
                {
                    InvoiceRet.PANNumber = GetPANNumber(dbContext, InvoiceRet.PatientId);
                    InvoiceRet.ShortName = GetShortName(dbContext, InvoiceRet.PatientId);                                
                    IRD_PHRMBillSaleReturnViewModel salesRetBill = IRD_PHRMBillSaleReturnViewModel.GetMappedPhrmSalesReturnBillForIRD(InvoiceRet, false);
                    salesRetBill.fiscal_year = GetFiscalYearNameById(dbContext,InvoiceRet.PatientId);
                    salesRetBill.credit_note_number=GetCreditNoteNumberByInvoiceId(dbContext,InvoiceRet.InvoiceId).ToString();
                    irdLog.JsonData = JsonConvert.SerializeObject(salesRetBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceReturnToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PhrmInvoiceSale.Attach(InvoiceRet);
                if (responseMsg == "200")
                {
                    //  salesRetBill.IsRealtime = true;
                    InvoiceRet.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    // billRet.IsRealtime = false;
                    InvoiceRet.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(InvoiceRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(InvoiceRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = "phrm-invoice-return";
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog);
            }

        }

        //this function post IRD posting log details to Danphe IRD_Log table
        public static void PostIRDLog(IRDLogModel irdLogdata)
        {
            try
            {
                irdLogdata.CreatedOn = DateTime.Now;
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
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
                    case "phrm-invoice":
                        {
                            //string api_PhrmInvoiceIRDNepal = ConfigurationManager.AppSettings["api_PhrmInvoiceIRDNepal"];
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }
                    case "phrm-invoice-return":
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
        public static string GetInnerMostException(Exception ex)
        {
            Exception currentEx = ex;
            while (currentEx.InnerException != null)
            {
                currentEx = currentEx.InnerException;
            }
            return currentEx.Message;
        }


        private static string GetFiscalYearNameById(IRDNepalDbContext dbContext, int? fiscalYearId)
        {
            try
            {
                return dbContext.BillingFiscalYears.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearFormatted;
            }
            catch (Exception ex)
            {
                throw ex;
            }            
        }

        private static string GetPANNumber(IRDNepalDbContext dbContext, int? PatientId)
        {
            try
            {
                return dbContext.Patients.Where(s => s.PatientId == PatientId).FirstOrDefault().PANNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static string GetShortName(IRDNepalDbContext dbContext, int? PatientId)
        {
            try
            {
                var pat = dbContext.Patients.Where(s => s.PatientId == PatientId).FirstOrDefault();
                return pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private static int GetCreditNoteNumberByInvoiceId(IRDNepalDbContext dbContext, int? InvoiceId)
        {
            try
            {
                return (int)dbContext.PhrmInvoiceReturnItems.Where(s => s.InvoiceId == InvoiceId).FirstOrDefault().CreditNoteNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
