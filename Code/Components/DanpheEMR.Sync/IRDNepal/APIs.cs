using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Configuration;
using DanpheEMR.Sync.IRDNepal.Models;
using DanpheEMR.ServerModel;


namespace DanpheEMR.Sync.IRDNepal
{
    public class APIs
    {

        public static string PostSalesBillToIRD(IRD_BillViewModel salesBill)
        {
            //return "200";
            string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];

            string respMsg = PostCmmonBillToIRd(salesBill, url_IRDNepal, api_SalesIRDNepal);
            return respMsg;
        }
        public static string PostSalesReturnBillToIRD(IRD_BillReturnViewModel salesReturnBill)
        {
            //return "200";
            string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
            string respMsg = PostCmmonBillToIRd(salesReturnBill, url_IRDNepal, api_SalesIRDNepal);
            return respMsg;
        }
        public static string PostPhrmInvoiceToIRD(IRD_PHRMBillSaleViewModel salesBill)
        {
            //return "200";
            string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
            string respMsg = PostCmmonBillToIRd(salesBill, url_IRDNepal, api_SalesIRDNepal);
            return respMsg;
        }
        public static string PostPhrmInvoiceReturnToIRD(IRD_PHRMBillSaleReturnViewModel salesReturnBill)
        {
            //return "200";
            string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
            string respMsg = PostCmmonBillToIRd(salesReturnBill, url_IRDNepal, api_SalesIRDNepal);
            return respMsg;
        }
        //extracted common code for both BillViewModel, BillReturnModel, pharmacy invoice and invoice return posting
        private static string PostCmmonBillToIRd(object bill, string url, string api)
        {
            string responseMessage = null;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.BaseAddress = new Uri(url);
                var response = client.PostAsJsonAsync(api, bill).Result;
                if (response.IsSuccessStatusCode)
                {
                    var message = response.Content.ReadAsStringAsync();
                    responseMessage = message.Result;
                }
                else
                {
                    responseMessage = "400";
                }

                return responseMessage;
            }
        }
    }
}
