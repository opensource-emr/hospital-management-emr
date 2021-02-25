using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using DanpheEMR.ServerModel;
using System.Configuration;
using DanpheEMR.Sync.IRDNepal.Utilities;
using DanpheEMR.Sync.IRDNepal.Models;

namespace DanpheEMR.Sync.IRDNepal
{
    //public class SyncLocalData
    //{


    //    #region Sync billing data to local table
    //    public void SyncLocal_Bulk_BillingSalesData(bool isrealtime = true)
    //    {
    //        string connString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
    //        string maxTxnRecords = ConfigurationManager.AppSettings["maximumTXNRecords"];

    //        using (IRDNepalDbContext dbContext = new IRDNepalDbContext(connString))
    //        {
    //            try
    //            {
    //                int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
    //                //List<BillingTransactionModel> unSyncedBillTxns = dbContext.BillingTransactions.Include("Patient")
    //                //                    .Where(b => !b.IsRemoteSynced.HasValue || b.IsRemoteSynced.Value == false)
    //                //                    .Where(b => b.TransactionType == "ItemTransaction").Take(maxRecords)
    //                //                    .ToList();
    //                //get fiscalyear table locally and assign FiscalYear property
    //                List<BillingFiscalYear> allFiscalYrs = dbContext.BillingFiscalYears.ToList();

    //                List<BillingTransactionModel> unSyncedBillTxns = dbContext.BillingTransactions.Include("Patient")
    //                                .Where(b => !b.IsLocalSynced.HasValue || b.IsLocalSynced.Value == false)
    //                                .Where(b => b.TransactionType == "ItemTransaction").Take(maxRecords)
    //                                .ToList();

    //                if (unSyncedBillTxns != null && unSyncedBillTxns.Count > 0)
    //                {
    //                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
    //                    {
    //                        try
    //                        {
    //                            foreach (BillingTransactionModel bilTxn in unSyncedBillTxns)
    //                            {
    //                                //we only have fiscalyearid
    //                                bilTxn.FiscalYear = allFiscalYrs.Where(f => f.FiscalYearId == bilTxn.FiscalYearId)
    //                                                    .Select(f => f.FiscalYearFormatted).FirstOrDefault();

    //                                SyncLocal_Single_BillingSalesData(bilTxn, dbContext);
    //                            }

    //                            dbContextTransaction.Commit();
    //                            Console.WriteLine("{0} billing records processed to local..", unSyncedBillTxns.Count);
    //                        }
    //                        catch (Exception ex)
    //                        {
    //                            //Rollback all transaction if exception occured  
    //                            dbContextTransaction.Rollback();
    //                            throw ex;//need to log this somewhere. 
    //                        }
    //                    }
    //                }
    //            }
    //            catch (Exception ex)
    //            {
    //                throw ex; //need to log this somewhere.
    //            }
    //        }
    //    }
    //    public void SyncLocal_Bulk_BillingSalesReturnData(bool isrealtime = true)
    //    {
    //        string connString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
    //        string maxTxnRecords = ConfigurationManager.AppSettings["maximumTXNRecords"];

    //        using (IRDNepalDbContext dbContext = new IRDNepalDbContext(connString))
    //        {
    //            try
    //            {
    //                int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
    //                var retBillsToSync = (from ret in dbContext.BillInvoiceReturns.Include(b => b.Patient)
    //                                      where !ret.IsLocalSynced.HasValue || ret.IsLocalSynced.Value == false
    //                                      select ret).Take(maxRecords).ToList();
    //                //get fiscalyear table locally and assign FiscalYear property
    //                List<BillingFiscalYear> allFiscalYrs = dbContext.BillingFiscalYears.ToList();

    //                if (retBillsToSync != null && retBillsToSync.Count > 0)
    //                {
    //                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
    //                    {
    //                        try
    //                        {
    //                            //store to Common-Invoice table which will be further synced to IRD.
    //                            foreach (BillInvoiceReturnModel retBill in retBillsToSync)
    //                            {
    //                                //we only have fiscalyearid
    //                                retBill.FiscalYear = allFiscalYrs.Where(f => f.FiscalYearId == retBill.FiscalYearId)
    //                                                    .Select(f => f.FiscalYearFormatted).FirstOrDefault();
    //                                SyncLocal_Single_BillingReturnData(retBill, dbContext, isrealtime);
    //                            }

    //                            dbContextTransaction.Commit();
    //                            Console.WriteLine("{0} billing return records processed to local..", retBillsToSync.Count);
    //                        }
    //                        catch (Exception ex)
    //                        {
    //                            //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
    //                            dbContextTransaction.Rollback();
    //                            throw ex;//need to log this somewhere. 
    //                        }
    //                    }
    //                }
    //            }
    //            catch (Exception ex)
    //            {
    //                throw ex; //need to log this somewhere.
    //            }
    //        }
    //    }

    //    internal static IRD_Common_InvoiceModel SyncLocal_Single_BillingSalesData(BillingTransactionModel bilTxn, IRDNepalDbContext dbContext)
    //    {
    //        IRD_Common_InvoiceModel salesInvoice = IRD_Common_InvoiceModel.MapFromBillTxnModel(bilTxn);
    //        string npDate = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(salesInvoice.invoice_date_eng)));
    //        salesInvoice.invoice_date = npDate;
    //        dbContext.IrdCommonInvoiceSets.Add(salesInvoice);
    //        dbContext.SaveChanges();
    //        //update IsLocalSynced Property once the common invoice is synced to local. 
    //        dbContext.BillingTransactions.Attach(bilTxn);
    //        bilTxn.IsLocalSynced = true;
    //        dbContext.Entry(bilTxn).Property(x => x.IsLocalSynced).IsModified = true;
    //        dbContext.SaveChanges();

    //        return salesInvoice;
    //    }

    //    internal static IRD_Common_InvoiceModel SyncLocal_Single_BillingReturnData(BillInvoiceReturnModel retBill, IRDNepalDbContext dbContext, bool isrealtime)
    //    {
    //        IRD_Common_InvoiceModel inv = IRD_Common_InvoiceModel.MapFromBillReturnModel(retBill, isrealtime);
    //        dbContext.IrdCommonInvoiceSets.Add(inv);
    //        dbContext.SaveChanges();
    //        //update IsLocalSynced Property once the common invoice is synced to local. 
    //        dbContext.BillInvoiceReturns.Attach(retBill);
    //        retBill.IsLocalSynced = true;
    //        dbContext.Entry(retBill).Property(x => x.IsLocalSynced).IsModified = true;
    //        dbContext.SaveChanges();

    //        return inv;
    //    }

    //    #endregion


    //    #region Sync pharmacy data to local table
    //    #endregion

    //}

}
