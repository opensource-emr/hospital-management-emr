using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using DanpheEMR.ServerModel;
using System.Configuration;
using DanpheEMR.Jobs.Utilities;
namespace DanpheEMR.Jobs.IRDNepal
{
    public class SyncLocalData
    {

        string connString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
        string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
        string fiscal_year = "2074.075";//NBB-remove hardcode//ConfigurationManager.AppSettings["fiscal_year_IRDNepal"];
        string maxTxnRecords = ConfigurationManager.AppSettings["maximumTXNRecords"];
        #region Sync billing data to local table
        public void SyncLocal_BillingSalesData()
        {
            using (IRDNepalDbContext dbContext = new IRDNepalDbContext(connString))
            {
                try
                {
                    int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
                    List<BillingTransactionModel> unSyncedBillTxns = dbContext.BillingTransactions.Include("Patient")
                                        .Where(b =>!b.IsRemoteSynced.HasValue || b.IsRemoteSynced.Value == false )
                                        .Where(b=> b.TransactionType=="ItemTransaction").Take(maxRecords)
                                        .ToList();
                    if (unSyncedBillTxns != null && unSyncedBillTxns.Count > 0)
                    {
                        using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                foreach (BillingTransactionModel bilTxn in unSyncedBillTxns)
                                {
                                    IRD_Common_InvoiceModel salesInvoice = IRD_Common_InvoiceModel.MapFromBillTxnModel(bilTxn);
                                    string npDate=DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(salesInvoice.invoice_date_eng)));                                    
                                    salesInvoice.invoice_date = npDate;
                                    dbContext.IrdCommonInvoiceSets.Add(salesInvoice);
                                }
                                dbContext.SaveChanges();

                                //once these are saved, go ahead and update IsRemoteSync properties  to 1
                                foreach (BillingTransactionModel billItm in unSyncedBillTxns)
                                {
                                    dbContext.BillingTransactions.Attach(billItm);
                                    billItm.IsRemoteSynced = true;
                                    dbContext.Entry(billItm).Property(x => x.IsRemoteSynced).IsModified = true;
                                }
                                dbContext.SaveChanges();
                                dbContextTransaction.Commit();
                                Console.WriteLine("{0} billing records processed to local..",unSyncedBillTxns.Count);
                            }
                            catch (Exception ex)
                            {
                                //Rollback all transaction if exception occured  
                                dbContextTransaction.Rollback();
                                throw ex;//need to log this somewhere. 
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw ex; //need to log this somewhere.
                }
            }
        }
        public void SyncLocal_BillingSalesReturnData()
        {                       
            using (IRDNepalDbContext dbContext = new IRDNepalDbContext(connString))
            {
                try
                {
                    int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
                    var retBillsToSync = (from ret in dbContext.BillReturnRequests
                                          join bil in dbContext.BillingTransactions.Include(b => b.Patient)
                                          on ret.BillingTransactionId equals bil.BillingTransactionId
                                          where !ret.IsRemoteSynced.HasValue || ret.IsRemoteSynced.Value == false
                                          select new
                                          {
                                              module_name = "billing",
                                              invoice_type = "sales-return",
                                              table_data_id = ret.BillingReturnId,
                                              // invoice_date= ret.CreatedOn.ToString(),//doubt BillingTxn CreatedOn or BillReturn CreatedOn
                                              invoice_number = bil.BillingTransactionId.ToString(),//REVISION Reqd.
                                              seller_pan = seller_pan,
                                              buyer_name = bil.Patient.FirstName + " " + bil.Patient.LastName,
                                              buyer_pan = bil.Patient.PANNumber,//REVISION Reqd.
                                              fiscal_year = fiscal_year,//change it to fiscal year later on.//REVISION Reqd.
                                              total_sales = ret.SubTotal.Value,//REVISION Reqd.
                                              discount_amount = ret.DiscountAmount.Value,//REVISION Reqd.
                                              taxable_sales_hst = ret.TotalAmount,//REVISION Reqd.
                                              hst = ret.HST,//REVISION Reqd.
                                              entered_by = ret.CreatedBy.ToString(),//need username here.                 
                                              credit_note_number = ret.BillingReturnId,//REVISION Reqd.
                                              credit_note_date = ret.ReturnDate.ToString(),
                                              remarks = ret.ReturnRemarks,//REVISION Reqd.
                                              is_remote_synced = false,
                                              sync_attempt_count = 0,
                                              SalesReturnModel = ret
                                          }).ToList().Select(x => new IRD_Common_InvoiceModel
                                          {
                                              module_name = x.module_name,
                                              invoice_type = x.invoice_type,
                                              table_data_id = x.table_data_id,
                                              invoice_number = x.invoice_number,
                                              //invoice_date=  x.invoice_date.ToString(),
                                              seller_pan = x.seller_pan,
                                              buyer_name = x.buyer_name,
                                              buyer_pan = x.buyer_pan,
                                              fiscal_year = x.fiscal_year,
                                              total_sales = x.total_sales,
                                              discount_amount = x.discount_amount,
                                              taxable_sales_hst = x.taxable_sales_hst,
                                              hst = x.hst,
                                              entered_by = x.entered_by,
                                              credit_note_number = x.credit_note_number.ToString(),
                                              credit_note_date= DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(x.credit_note_date))),
                                              return_date_eng = x.credit_note_date,
                                              remarks = x.remarks,
                                              is_remote_synced = x.is_remote_synced,
                                              sync_attempt_count = x.sync_attempt_count,
                                              SalesReturnModel = x.SalesReturnModel,

                                          }).Take(maxRecords).ToList();


                    if (retBillsToSync != null && retBillsToSync.Count > 0)
                    {
                        using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                List<BillReturnRequestModel> retItemsToUpdate = new List<BillReturnRequestModel>();
                                //store to Common-Invoice table which will be further synced to IRD.
                                foreach (IRD_Common_InvoiceModel inv in retBillsToSync)
                                {
                                    string npDate = DanpheDateConvertor.NepDateToString(
                                        DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(inv.return_date_eng)));
                                    inv.credit_note_date = npDate;
                                    retItemsToUpdate.Add(inv.SalesReturnModel);                                    
                                    dbContext.IrdCommonInvoiceSets.Add(inv);
                                }
                                dbContext.SaveChanges();

                                //once these are saved, go ahead and update IsRemoteSync properties of BillingReturn Table to 1
                                foreach (BillReturnRequestModel ret in retItemsToUpdate)
                                {
                                    dbContext.BillReturnRequests.Attach(ret);
                                    ret.IsRemoteSynced = true;
                                    dbContext.Entry(ret).Property(x => x.IsRemoteSynced).IsModified = true;
                                }
                                dbContext.SaveChanges();
                                dbContextTransaction.Commit();
                                Console.WriteLine("{0} billing return records processed to local..",retBillsToSync.Count);
                            }
                            catch (Exception ex)
                            {
                                //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
                                dbContextTransaction.Rollback();
                                throw ex;//need to log this somewhere. 
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw ex; //need to log this somewhere.
                }
            }
        }
        #endregion




        #region Sync pharmacy data to local table
        #endregion

    }



}
