using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ViewModel.Pharmacy;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.AspNetCore.Mvc;


namespace DanpheEMR.Controllers.Pharmacy.CreditNote
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class PharmacyCreditNoteController : Controller
    {
        public PharmacyDbContext phrmDbContext;

        private readonly string connString = null;

        public PharmacyCreditNoteController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            phrmDbContext = new PharmacyDbContext(connString);
        }
        [HttpGet("~/api/GetCreditNoteItems")]
        public IActionResult GetCreditNoteItems()
        {
            try
            {
               var totalItems = phrmDbContext.PHRMGoodsReceiptItems.GroupBy(a => new { a.BatchNo, a.ItemId, a.ExpiryDate }).Select(i => new GoodReceiptItemsViewModel

               { ItemId= i.Key.ItemId ,
                   BatchNo= i.Key.BatchNo,
                  ExpiryDate= i.Key.ExpiryDate,
                   ItemName =i.FirstOrDefault().ItemName,
                   GRItemPrice= i.FirstOrDefault().GRItemPrice,
                   GoodReceiptId=i.FirstOrDefault().GoodReceiptId,
                    AvailableQuantity=i.Sum(a=>a.ReceivedQuantity+ a.FreeQuantity)
               });
                //var wOGoodreceipt = phrmDbContext.PHRMStockTransactionItems.Where(a => a.TransactionType == null && a.InOut=="in" && a.ReferenceNo==null);
                //var availableQty= phrmDbContext.phrm

                //var remStk = phrmDbContext.PHRMStockTransactionItems.ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.ExpiryDate }).Select(g =>
                //     new PHRMStockTransactionItemsModel
                //     {
                //         ItemId = g.Key.ItemId,
                //         BatchNo = g.Key.BatchNo,
                //         ExpiryDate = g.Key.ExpiryDate,
                //         //InOut = g.Key.InOut,
                //         Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out")
                //         .Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(f => f.FreeQuantity).Value,
                //         FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),

                //         MRP = g.FirstOrDefault().MRP,
                //         Price = g.FirstOrDefault().Price,
                //     }
                //    ).Where(a => a.Quantity > 0);

                return Ok(totalItems);
            }
            catch(Exception ex)
            {
               // return Ok(ex);
                throw ex;
                
            }
           
        }
        [HttpGet("~/api/GetCreditNote")]
        public IActionResult GetCreditNote()
        {
            try
            {
                return Ok();
                //var test = phrmDbContext.PHRMGoodsReceiptItems.Select(i => new {
                //    i.ItemId,
                //    i.ItemName,
                //    i.GRItemPrice,
                //    i.GoodReceiptId,
                //    i.ReceivedQuantity,
                //    i.FreeQuantity,
                //    i.BatchNo,
                //    i.ExpiryDate
                //}).GroupBy(a => new { a.BatchNo, a.ItemId, a.ExpiryDate });
                ////var wOGoodreceipt = phrmDbContext.PHRMStockTransactionItems.Where(a => a.TransactionType == null && a.InOut=="in" && a.ReferenceNo==null);
                ////var availableQty= phrmDbContext.phrm

                //var remStk = phrmDbContext.DispensaryStockTxns.ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.ExpiryDate }).Select(g =>
                //     new PHRMDispensaryStockTransactionModel
                //     {
                //         ItemId = g.Key.ItemId,
                //         BatchNo = g.Key.BatchNo,
                //         ExpiryDate = g.Key.ExpiryDate,
                //         Quantity = 0,

                //         MRP = g.FirstOrDefault().MRP,
                //         CostPrice = g.FirstOrDefault().CostPrice,
                //     }
                //    ).Where(a => a.Quantity > 0);

                //return Ok(remStk);
            }
            catch (Exception ex)
            {
                // return Ok(ex);
                throw ex;

            }

        }


        [HttpPost]
        public IActionResult Post([FromBody]PHRMGoodsReceiptModel value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                
                return Ok();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
