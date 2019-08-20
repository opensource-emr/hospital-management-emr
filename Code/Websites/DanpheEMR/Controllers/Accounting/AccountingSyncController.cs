using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using RefactorThis.GraphDiff;//for entity-update.
using DanpheEMR.Security;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingSyncController : CommonController
    {

        //private readonly string connString = null;
        public AccountingSyncController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;

        }

        // GET: api/values
        [HttpGet]
        public string Get(string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            InventoryDbContext invDbContext = new InventoryDbContext(connString);
            try
            {
                if (reqType == "inventory")
                {
                    var invItems = (from goodsReceipt in invDbContext.GoodsReceipts

                                    join vendor in invDbContext.Vendors on goodsReceipt.VendorId equals vendor.VendorId

                                    select new
                                    {
                                        goodsReceipt.GoodsReceiptID,
                                        goodsReceipt.GoodsReceiptDate,
                                        goodsReceipt.TotalAmount,
                                        vendor.VendorName,
                                        goodsReceipt.Remarks,
                                        IsSelected = true,
                                        GoodsReceiptItems = (from goodsReceiptItem in invDbContext.GoodsReceiptItems
                                                             join invItem in invDbContext.Items on goodsReceiptItem.ItemId equals invItem.ItemId
                                                             where goodsReceiptItem.GoodsReceiptId == goodsReceipt.GoodsReceiptID
                                                             select new
                                                             {
                                                                 goodsReceiptItem.GoodsReceiptItemId,
                                                                 goodsReceiptItem.BatchNO,
                                                                 goodsReceiptItem.ExpiryDate,
                                                                 goodsReceiptItem.ReceivedQuantity,
                                                                 goodsReceiptItem.FreeQuantity,
                                                                 goodsReceiptItem.RejectedQuantity,
                                                                 goodsReceiptItem.ItemRate,
                                                                 goodsReceiptItem.VATAmount,
                                                                 goodsReceiptItem.TotalAmount,
                                                                 goodsReceiptItem.ItemId,
                                                                 invItem.ItemName
                                                             }).ToList()
                                    }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = invItems;

                }
            }


            catch (Exception ex)
            {
                string str = ex.InnerException.Message.ToString();
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string companyName = this.ReadQueryStringData("companyName");

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }



        // PUT api/values/5
        [HttpPut]
        public string Update(/*string reqType*/)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);


            try
            {
                //string str = Request.Form.Keys.First<string>();
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

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

