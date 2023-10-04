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

namespace DanpheEMR.Jobs.IRDNepal
{
    class PostToIRD : IRemoteSync
    {
        public static string bilConString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
        string maxTxnRecords = ConfigurationManager.AppSettings["maximumTXNRecords"];

        public void SyncSalesToRemoteServer()
        {
            try
            {
                int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
                var irdCommonSalesBillItems = (from cmnInv in dbContext.IrdCommonInvoiceSets
                                               where (cmnInv.module_name == "billing" && cmnInv.invoice_type == "sales")
                                               where (cmnInv.is_remote_synced == false || !cmnInv.is_remote_synced.HasValue)
                                               select cmnInv).Take(maxRecords).ToList();
                if (irdCommonSalesBillItems != null && irdCommonSalesBillItems.Count > 0)
                {
                    string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                    string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                    for (int i = 0; i < irdCommonSalesBillItems.Count; i++)
                    {
                        IRD_BillViewModel bill = IRD_BillViewModel.GetMappedSalesBillForIRD(irdCommonSalesBillItems[i]);
                        using (var client = new HttpClient())
                        {
                            client.DefaultRequestHeaders.Accept.Clear();
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            client.BaseAddress = new Uri(url_IRDNepal);
                            var response = client.PostAsJsonAsync(api_SalesIRDNepal, bill).Result;
                            if (response.IsSuccessStatusCode)
                            {
                                var message = response.Content.ReadAsStringAsync();
                                string mstTxt = message.Result;
                                if (mstTxt == "200")
                                {
                                    irdCommonSalesBillItems[i].is_remote_synced = true;
                                    irdCommonSalesBillItems[i].synced_on = System.DateTime.Now;
                                    irdCommonSalesBillItems[i].sync_attempt_count = irdCommonSalesBillItems[i].sync_attempt_count + 1;
                                    irdCommonSalesBillItems[i].sync_response_msg = mstTxt;
                                }
                                else
                                {
                                    irdCommonSalesBillItems[i].is_remote_synced = false;
                                    irdCommonSalesBillItems[i].synced_on = System.DateTime.Now;
                                    irdCommonSalesBillItems[i].sync_attempt_count = irdCommonSalesBillItems[i].sync_attempt_count + 1;
                                    irdCommonSalesBillItems[i].sync_response_msg = mstTxt;
                                }
                            }
                        }
                    }
                    //update IRD Common Sales bill items data after post
                    UpdateIRDSyncInvoiceCommon(irdCommonSalesBillItems);
                    Console.WriteLine("{0} billing records processed to IRD Server..", irdCommonSalesBillItems.Count);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void SyncSalesReturnToRemoteServer()
        {
            try
            {
                int maxRecords = (maxTxnRecords != null) ? Convert.ToInt32(maxTxnRecords) : 1000;
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
                var irdCommonReturnBills = (from cmnInv in dbContext.IrdCommonInvoiceSets
                                            where (cmnInv.module_name == "billing" && cmnInv.invoice_type == "sales-return")
                                            where (cmnInv.is_remote_synced == false || !cmnInv.is_remote_synced.HasValue)
                                            select cmnInv).Take(maxRecords).ToList();
                if (irdCommonReturnBills != null && irdCommonReturnBills.Count > 0)
                {
                    string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                    string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
                    for (int i = 0; i < irdCommonReturnBills.Count; i++)
                    {
                        IRD_BillReturnViewModel bill = IRD_BillReturnViewModel.GetMappedSalesReturnBillForIRD(irdCommonReturnBills[i]);
                        using (var client = new HttpClient())
                        {
                            client.DefaultRequestHeaders.Accept.Clear();
                            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            client.BaseAddress = new Uri(url_IRDNepal);
                            var response = client.PostAsJsonAsync(api_SalesIRDNepal, bill).Result;
                            if (response.IsSuccessStatusCode)
                            {
                                var message = response.Content.ReadAsStringAsync();
                                string mstTxt = message.Result;
                                if (mstTxt == "200")
                                {
                                    irdCommonReturnBills[i].is_remote_synced = true;
                                    irdCommonReturnBills[i].synced_on = System.DateTime.Now;
                                    irdCommonReturnBills[i].sync_attempt_count = irdCommonReturnBills[i].sync_attempt_count + 1;
                                    irdCommonReturnBills[i].sync_response_msg = mstTxt;
                                }
                                else
                                {
                                    irdCommonReturnBills[i].is_remote_synced = false;
                                    irdCommonReturnBills[i].synced_on = System.DateTime.Now;
                                    irdCommonReturnBills[i].sync_attempt_count = irdCommonReturnBills[i].sync_attempt_count + 1;
                                    irdCommonReturnBills[i].sync_response_msg = mstTxt;
                                }
                            }
                        }
                    }
                    //update IRD Common Sales bill items data after post
                    UpdateIRDSyncInvoiceCommon(irdCommonReturnBills);
                    Console.WriteLine("{0} return billing records processed to IRD Server..", irdCommonReturnBills.Count);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        //this method update IRDSyncInvoiceCommon table information after 
        //Post Sales & Sales-return items to IrD
        public static void UpdateIRDSyncInvoiceCommon(List<IRD_Common_InvoiceModel> itemList)
        {
            try
            {
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);
                if (itemList != null && itemList.Count > 0)
                {
                    foreach (IRD_Common_InvoiceModel itm in itemList)
                    {
                        dbContext.IrdCommonInvoiceSets.Attach(itm);
                        dbContext.Entry(itm).Property(x => x.is_remote_synced).IsModified = true;
                        dbContext.Entry(itm).Property(x => x.synced_on).IsModified = true;
                        dbContext.Entry(itm).Property(x => x.sync_attempt_count).IsModified = true;
                        dbContext.Entry(itm).Property(x => x.sync_response_msg).IsModified = true;
                    }
                    dbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;//need to maintain log of all exception
            }
        }
    }
}
