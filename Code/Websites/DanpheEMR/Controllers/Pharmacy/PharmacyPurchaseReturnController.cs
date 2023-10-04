using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;


namespace DanpheEMR.Controllers.PharmacyPurchaseReturn
{
    public class PharmacyPurchaseReturnController : CommonController
    {
        public static IHostingEnvironment _environment;
        private readonly PharmacyDbContext _pharmacyDbContext;
        public PharmacyPurchaseReturnController(IHostingEnvironment env, IOptions<MyConfiguration> _config) : base(_config)
        {
            _environment = env;
            _pharmacyDbContext = new PharmacyDbContext(connString);
        }
        /*[HttpGet]
        [Route("PharmacyItemsWithTotalAvailableQuantity")]
        public IActionResult GetPHRMItemsWithTotalAvailableQuantity()
        {
            // else if (reqType == "PHRMItemListWithTotalAvailableQuantity")
            Func<object> func = () => GetPHRMItemsWithTotalAvailableQty();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetPHRMItemsWithTotalAvailableQty()
        {
            var GRItemList = (from GRI in _pharmacyDbContext.PHRMGoodsReceiptItems
                              from GR in _pharmacyDbContext.PHRMGoodsReceipt.Where(gr => gr.GoodReceiptId == GRI.GoodReceiptId)
                              from S in _pharmacyDbContext.StoreStocks.Where(s => s.StockId == GRI.StockId && s.IsActive == true && s.AvailableQuantity > 0)
                              from I in _pharmacyDbContext.PHRMItemMaster.Where(i => i.ItemId == S.ItemId)
                              from U in _pharmacyDbContext.PHRMUnitOfMeasurement.Where(u => u.UOMId == I.UOMId).DefaultIfEmpty()
                              from G in _pharmacyDbContext.PHRMGenericModel.Where(g => g.GenericId == I.GenericId).DefaultIfEmpty()
                              group new { GRI, GR, S, I, U, G } by new { GRI.GoodReceiptItemId } into GRIGrouped
                              select new
                              {
                                  GoodReceiptItemId = GRIGrouped.FirstOrDefault().GRI.GoodReceiptItemId,
                                  GoodReceiptId = GRIGrouped.FirstOrDefault().GR.GoodReceiptId,
                                  SupplierId = GRIGrouped.FirstOrDefault().GR.SupplierId,
                                  FiscalYearId = GRIGrouped.FirstOrDefault().GR.FiscalYearId,
                                  GoodReceiptPrintId = GRIGrouped.FirstOrDefault().GR.GoodReceiptPrintId,
                                  ItemId = GRIGrouped.FirstOrDefault().S.ItemId,
                                  ItemName = GRIGrouped.FirstOrDefault().I.ItemName,
                                  ItemCode = GRIGrouped.FirstOrDefault().I.ItemCode,
                                  GenericName = GRIGrouped.FirstOrDefault().G.GenericName,
                                  UOMName = GRIGrouped.FirstOrDefault().U.UOMName,
                                  BatchNo = GRIGrouped.FirstOrDefault().GRI.BatchNo,
                                  ExpiryDate = GRIGrouped.FirstOrDefault().GRI.ExpiryDate,
                                  SalePrice = GRIGrouped.FirstOrDefault().GRI.SalePrice,
                                  ItemPrice = GRIGrouped.FirstOrDefault().GRI.GRItemPrice,
                                  ReceivedQuantity = GRIGrouped.FirstOrDefault().GRI.ReceivedQuantity,
                                  TotalAvailableQuantity = GRIGrouped.Sum(a => a.S.AvailableQuantity),
                                  BatchWiseAvailableQuantity = GRIGrouped.Sum(a => a.S.AvailableQuantity),
                                  FreeQuantity = GRIGrouped.FirstOrDefault().GRI.FreeQuantity,
                                  DiscountPercentage = GRIGrouped.FirstOrDefault().GRI.DiscountPercentage,
                                  VATPercentage = GRIGrouped.FirstOrDefault().GRI.VATPercentage,
                                  CCCharge = GRIGrouped.FirstOrDefault().GRI.CCCharge,
                              }).ToList();
            return GRItemList;
        }*/
        /*               else if (reqType == "PHRMItemListWithTotalAvailableQuantity")
                        {
                            var GRItemList = (from GRI in phrmdbcontext.PHRMGoodsReceiptItems
                                              from GR in phrmdbcontext.PHRMGoodsReceipt.Where(gr => gr.GoodReceiptId == GRI.GoodReceiptId)
                                              from S in phrmdbcontext.StoreStocks.Where(s => s.StockId == GRI.StockId && s.IsActive == true && s.AvailableQuantity > 0)
                                              from I in phrmdbcontext.PHRMItemMaster.Where(i => i.ItemId == S.ItemId)
                                              from U in phrmdbcontext.PHRMUnitOfMeasurement.Where(u => u.UOMId == I.UOMId).DefaultIfEmpty()
                                              from G in phrmdbcontext.PHRMGenericModel.Where(g => g.GenericId == I.GenericId).DefaultIfEmpty()
                                              group new { GRI, GR, S, I, U, G } by new { GRI.GoodReceiptItemId } into GRIGrouped
                                              select new
                                              {
                                                  GoodReceiptItemId = GRIGrouped.FirstOrDefault().GRI.GoodReceiptItemId,
                                                  GoodReceiptId = GRIGrouped.FirstOrDefault().GR.GoodReceiptId,
                                                  SupplierId = GRIGrouped.FirstOrDefault().GR.SupplierId,
                                                  FiscalYearId = GRIGrouped.FirstOrDefault().GR.FiscalYearId,
                                                  GoodReceiptPrintId = GRIGrouped.FirstOrDefault().GR.GoodReceiptPrintId,
                                                  ItemId = GRIGrouped.FirstOrDefault().S.ItemId,
                                                  ItemName = GRIGrouped.FirstOrDefault().I.ItemName,
                                                  ItemCode = GRIGrouped.FirstOrDefault().I.ItemCode,
                                                  GenericName = GRIGrouped.FirstOrDefault().G.GenericName,
                                                  UOMName = GRIGrouped.FirstOrDefault().U.UOMName,
                                                  BatchNo = GRIGrouped.FirstOrDefault().GRI.BatchNo,
                                                  ExpiryDate = GRIGrouped.FirstOrDefault().GRI.ExpiryDate,
                                                  SalePrice = GRIGrouped.FirstOrDefault().GRI.SalePrice,
                                                  ItemPrice = GRIGrouped.FirstOrDefault().GRI.GRItemPrice,
                                                  ReceivedQuantity = GRIGrouped.FirstOrDefault().GRI.ReceivedQuantity,
                                                  TotalAvailableQuantity = GRIGrouped.Sum(a => a.S.AvailableQuantity),
                                                  BatchWiseAvailableQuantity = GRIGrouped.Sum(a => a.S.AvailableQuantity),
                                                  FreeQuantity = GRIGrouped.FirstOrDefault().GRI.FreeQuantity,
                                                  DiscountPercentage = GRIGrouped.FirstOrDefault().GRI.DiscountPercentage,
                                                  VATPercentage = GRIGrouped.FirstOrDefault().GRI.VATPercentage,
                                                  CCCharge = GRIGrouped.FirstOrDefault().GRI.CCCharge,
                                              }).ToList();

                responseData.Status = "OK";
                            responseData.Results = GRItemList;
                        }*/


        [HttpGet]
        [Route("GoodsReceiptsInfo")]
        public IActionResult GetGoodsReceiptsInfo(int? supplierId, int? grNo, string invoiceNo, DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "returnToSupplier")
            Func<object> func = () => GetGoodsReceiptsInformation(supplierId, grNo, invoiceNo, fromDate, toDate);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGoodsReceiptsInformation(int? supplierId, int? grNo, string invoiceNo, DateTime fromDate, DateTime toDate)
        {
            //var testdate = toDate.AddDays(1);
            var InvoiceIdStr = invoiceNo.ToString();
            //List<SqlParameter> paramList = new List<SqlParameter>() {
            //     new SqlParameter("@FromDate", FromDate),
            //     new SqlParameter("@ToDate", ToDate),
            //     new SqlParameter("@SupplierId", supplierId),
            //     new SqlParameter("@InvoiceNo", InvoiceIdStr),
            //     new SqlParameter("@GoodsReceiptPrintId",gdprintId)
            // };
            //DataTable returnToSupplier = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GetReturnToSupplier", paramList, phrmdbcontext);

            var returnToSupplier = (from GR in _pharmacyDbContext.PHRMGoodsReceipt
                                    join S in _pharmacyDbContext.PHRMSupplier on GR.SupplierId equals S.SupplierId
                                    where (GR.SupplierId == supplierId || supplierId == null) && (GR.GoodReceiptPrintId == grNo || grNo == null)
                                    && (GR.InvoiceNo == invoiceNo || invoiceNo == "null") && (DbFunctions.TruncateTime(GR.CreatedOn) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(GR.CreatedOn) <= DbFunctions.TruncateTime(toDate))
                                    group new { GR, S } by new { GR.GoodReceiptId, GR.GoodReceiptDate, GR.GoodReceiptPrintId, GR.SubTotal, GR.VATAmount, GR.DiscountAmount, GR.TotalAmount, GR.InvoiceNo, S.SupplierName } into GRGrouped
                                    select new
                                    {

                                        GoodReceiptId = GRGrouped.Key.GoodReceiptId,
                                        GoodReceiptDate = GRGrouped.Key.GoodReceiptDate,
                                        GoodReceiptPrintId = GRGrouped.Key.GoodReceiptPrintId,
                                        SupplierName = GRGrouped.Key.SupplierName,
                                        SubTotal = GRGrouped.Key.SubTotal,
                                        DiscountAmount = GRGrouped.Key.DiscountAmount,
                                        VATAmount = GRGrouped.Key.VATAmount,
                                        TotalAmount = GRGrouped.Key.TotalAmount,
                                        InvoiceNo = GRGrouped.Key.InvoiceNo,
                                    }).ToList().OrderByDescending(gr => gr.GoodReceiptPrintId);


            return returnToSupplier;
        }
        /* else if (reqType == "returnToSupplier")
                   {
                       var testdate = ToDate.AddDays(1);
           var InvoiceIdStr = invoiceid.ToString();
           //List<SqlParameter> paramList = new List<SqlParameter>() {
           //     new SqlParameter("@FromDate", FromDate),
           //     new SqlParameter("@ToDate", ToDate),
           //     new SqlParameter("@SupplierId", supplierId),
           //     new SqlParameter("@InvoiceNo", InvoiceIdStr),
           //     new SqlParameter("@GoodsReceiptPrintId",gdprintId)
           // };

           //DataTable returnToSupplier = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GetReturnToSupplier", paramList, phrmdbcontext);

           var returnToSupplier = (from GR in phrmdbcontext.PHRMGoodsReceipt
                                   join S in phrmdbcontext.PHRMSupplier on GR.SupplierId equals S.SupplierId
                                   where ((GR.SupplierId == supplierId || supplierId == null) && (GR.GoodReceiptPrintId == gdprintId || gdprintId == null)
                                   && (GR.InvoiceNo == invoiceNo || invoiceNo == "null") && (GR.CreatedOn > FromDate && GR.CreatedOn < testdate))
                                   group new { GR, S } by new { GR.GoodReceiptId, GR.GoodReceiptDate, GR.GoodReceiptPrintId, GR.SubTotal, GR.VATAmount, GR.DiscountAmount, GR.TotalAmount, GR.InvoiceNo, S.SupplierName } into GRGrouped
                                   select new
                                   {
                                       GoodReceiptId = GRGrouped.Key.GoodReceiptId,
                                       GoodReceiptDate = GRGrouped.Key.GoodReceiptDate,
                                       GoodReceiptPrintId = GRGrouped.Key.GoodReceiptPrintId,
                                       SupplierName = GRGrouped.Key.SupplierName,
                                       SubTotal = GRGrouped.Key.SubTotal,
                                       DiscountAmount = GRGrouped.Key.DiscountAmount,
                                       VATAmount = GRGrouped.Key.VATAmount,
                                       TotalAmount = GRGrouped.Key.TotalAmount,
                                       InvoiceNo = GRGrouped.Key.InvoiceNo,
                                   }).ToList().OrderByDescending(gr => gr.GoodReceiptPrintId);

           responseData.Status = "OK";
                       responseData.Results = returnToSupplier;
                   }*/



        [HttpGet]
        [Route("ReturnedList")]
        public IActionResult GetReturnItemsToSuppliers(DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "returnItemsToSupplierList")
            Func<object> func = () => GetReturnItemsToSuppliersList(fromDate, toDate);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetReturnItemsToSuppliersList(DateTime fromDate, DateTime toDate)
        {

            //var testdate = toDate.AddDays(1);
            var returnItemToSupplierList = (from retSupp in _pharmacyDbContext.PHRMReturnToSupplier
                                            join supp in _pharmacyDbContext.PHRMSupplier on retSupp.SupplierId equals supp.SupplierId
                                            join retSuppItm in _pharmacyDbContext.PHRMReturnToSupplierItem on retSupp.ReturnToSupplierId equals retSuppItm.ReturnToSupplierId
                                            join rbac in _pharmacyDbContext.Users on retSupp.CreatedBy equals rbac.EmployeeId
                                            join gr in _pharmacyDbContext.PHRMGoodsReceipt on retSupp.GoodReceiptId equals gr.GoodReceiptId
                                            where (retSuppItm.Quantity != 0 && (DbFunctions.TruncateTime(retSuppItm.CreatedOn) >= fromDate && DbFunctions.TruncateTime(retSuppItm.CreatedOn) <= toDate))

                                            group new { supp, retSuppItm, retSupp, rbac, gr } by new
                                            {
                                                supp.SupplierName,
                                                retSupp.ReturnToSupplierId,
                                                retSupp.CreditNotePrintId,

                                            } into p
                                            select new
                                            {
                                                CreditNotePrintId = p.Key.CreditNotePrintId,
                                                SupplierName = p.Key.SupplierName,
                                                ReturnToSupplierId = p.Key.ReturnToSupplierId,
                                                ReturnDate = p.Select(a => a.retSupp.ReturnDate).FirstOrDefault(),
                                                CreditNoteNo = p.Select(a => a.retSupp.CreditNoteId).FirstOrDefault(),
                                                Quantity = p.Sum(a => a.retSuppItm.Quantity),
                                                FreeQuantity = p.Select(a => a.retSuppItm.FreeQuantity),
                                                SubTotal = p.Select(a => a.retSupp.SubTotal).FirstOrDefault(),
                                                DiscountAmount = p.Select(a => a.retSupp.DiscountAmount).FirstOrDefault(),
                                                VATAmount = p.Select(a => a.retSupp.VATAmount).FirstOrDefault(),
                                                CCAmount = p.Select(a => a.retSupp.CCAmount).FirstOrDefault(),
                                                TotalAmount = p.Select(a => a.retSupp.TotalAmount).FirstOrDefault(),
                                                Email = p.Select(a => a.supp.Email).FirstOrDefault(),
                                                ContactNo = p.Select(a => a.supp.ContactNo).FirstOrDefault(),
                                                ContactAddress = p.Select(a => a.supp.ContactAddress).FirstOrDefault(),
                                                City = p.Select(a => a.supp.City).FirstOrDefault(),
                                                SupplierPANNumber = p.Select(a => a.supp.PANNumber).FirstOrDefault(),
                                                Remarks = p.Select(a => a.retSupp.Remarks).FirstOrDefault(),
                                                ReturnStatus = p.Select(a => a.retSupp.ReturnStatus).FirstOrDefault(),
                                                UserName = p.Select(a => a.rbac.UserName).FirstOrDefault(),
                                                CreatedOn = p.Select(a => a.retSupp.CreatedOn).FirstOrDefault(),
                                                GoodReceiptPrintId = p.Select(a => a.gr.GoodReceiptPrintId).FirstOrDefault()
                                            }
                    ).ToList().OrderByDescending(a => a.ReturnToSupplierId);

            return returnItemToSupplierList;

        }

        /*     else if (reqType == "returnItemsToSupplierList")
        {
            var testdate = ToDate.AddDays(1);
                var returnItemToSupplierList = (from retSupp in phrmdbcontext.PHRMReturnToSupplier
                                                join supp in phrmdbcontext.PHRMSupplier on retSupp.SupplierId equals supp.SupplierId
                                                join retSuppItm in phrmdbcontext.PHRMReturnToSupplierItem on retSupp.ReturnToSupplierId equals retSuppItm.ReturnToSupplierId
                                                join rbac in phrmdbcontext.Users on retSupp.CreatedBy equals rbac.EmployeeId
                                                join gr in phrmdbcontext.PHRMGoodsReceipt on retSupp.GoodReceiptId equals gr.GoodReceiptId
                                                where (retSuppItm.Quantity != 0 && (retSuppItm.CreatedOn > FromDate && retSuppItm.CreatedOn < testdate))
                                                group new { supp, retSuppItm, retSupp, rbac, gr } by new
                                                {
                                                    supp.SupplierName,
                                                    retSupp.ReturnToSupplierId,
                                                    retSupp.CreditNotePrintId,

                                                } into p
                                                select new
                                                {
                                                    CreditNotePrintId = p.Key.CreditNotePrintId,
                                                    SupplierName = p.Key.SupplierName,
                                                    ReturnToSupplierId = p.Key.ReturnToSupplierId,
                                                    ReturnDate = p.Select(a => a.retSupp.ReturnDate).FirstOrDefault(),
                                                    CreditNoteNo = p.Select(a => a.retSupp.CreditNoteId).FirstOrDefault(),
                                                    Quantity = p.Sum(a => a.retSuppItm.Quantity),
                                                    FreeQuantity = p.Select(a => a.retSuppItm.FreeQuantity),
                                                    SubTotal = p.Select(a => a.retSupp.SubTotal).FirstOrDefault(),
                                                    DiscountAmount = p.Select(a => a.retSupp.DiscountAmount).FirstOrDefault(),
                                                    VATAmount = p.Select(a => a.retSupp.VATAmount).FirstOrDefault(),
                                                    CCAmount = p.Select(a => a.retSupp.CCAmount).FirstOrDefault(),
                                                    TotalAmount = p.Select(a => a.retSupp.TotalAmount).FirstOrDefault(),
                                                    Email = p.Select(a => a.supp.Email).FirstOrDefault(),
                                                    ContactNo = p.Select(a => a.supp.ContactNo).FirstOrDefault(),
                                                    ContactAddress = p.Select(a => a.supp.ContactAddress).FirstOrDefault(),
                                                    City = p.Select(a => a.supp.City).FirstOrDefault(),
                                                    Pin = p.Select(a => a.supp.PANNumber).FirstOrDefault(),
                                                    Remarks = p.Select(a => a.retSupp.Remarks).FirstOrDefault(),
                                                    ReturnStatus = p.Select(a => a.retSupp.ReturnStatus).FirstOrDefault(),
                                                    UserName = p.Select(a => a.rbac.UserName).FirstOrDefault(),
                                                    CreatedOn = p.Select(a => a.retSupp.CreatedOn).FirstOrDefault(),
                                                    GoodReceiptPrintId = p.Select(a => a.gr.GoodReceiptPrintId).FirstOrDefault()
                                                }
                        ).ToList().OrderByDescending(a => a.ReturnToSupplierId);
                responseData.Status = "OK";
            responseData.Results = returnItemToSupplierList;
        }*/

        [HttpGet]
        [Route("ReturnDetail")]
        public IActionResult GetReturnDetailByReturnToSupplierId(int returnToSupplierId)
        {
            // else if (reqType == "getReturnToSupplierItemsByReturnToSupplierId")
            Func<object> func = () => GetReturnDetailsByReturnToSupplierId(returnToSupplierId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetReturnDetailsByReturnToSupplierId(int returnToSupplierId)
        {
            var returnToSupplierItemsList = (from retSuppItm in _pharmacyDbContext.PHRMReturnToSupplierItem
                                             join retSuppl in _pharmacyDbContext.PHRMReturnToSupplier on retSuppItm.ReturnToSupplierId equals retSuppl.ReturnToSupplierId
                                             join itm in _pharmacyDbContext.PHRMItemMaster on retSuppItm.ItemId equals itm.ItemId
                                             where retSuppItm.ReturnToSupplierId == returnToSupplierId
                                             select new
                                             {
                                                 ItemName = itm.ItemName,
                                                 ReturnToSupplierId = retSuppItm.ReturnToSupplierId,
                                                 BatchNo = retSuppItm.BatchNo,
                                                 Quantity = retSuppItm.Quantity,
                                                 FreeQuantity = retSuppItm.FreeQuantity,
                                                 FreeAmount = retSuppItm.FreeAmount,
                                                 ExpiryDate = retSuppItm.ExpiryDate,
                                                 SalePrice = retSuppItm.SalePrice,
                                                 ItemPrice = retSuppItm.ItemPrice,
                                                 ReturnRate = retSuppItm.ReturnRate,
                                                 SubTotal = retSuppItm.SubTotal,
                                                 DiscountPercentage = retSuppItm.DiscountPercentage,
                                                 VATPercentage = retSuppItm.VATPercentage,
                                                 TotalAmount = retSuppItm.TotalAmount,
                                                 ReturnStatus = retSuppl.ReturnStatus,
                                                 CreatedBy = retSuppl.CreatedBy,
                                                 CreatedOn = retSuppl.CreatedOn,
                                                 GoodReceiptId = retSuppl.GoodReceiptId,
                                                 //UserName= rbacDbContext.Users.Where(a=>a.EmployeeId == retSuppl.CreatedBy).Select
                                                 //UserName = rbacDbContext.Users.Where(a => a.EmployeeId == retSuppl.CreatedBy).Select(a => a.UserName).FirstOrDefault()
                                                 //UserName = (from rbac in rbacDbContext.Users
                                                 //            where rbac.EmployeeId == retSuppl.CreatedBy
                                                 //            select rbac.UserName).FirstOrDefault()
                                                 //Created
                                                 //TotalAmt= retSuppl.TotalAmount,
                                                 //DiscAmt= retSuppl.DiscountAmount,
                                                 //CreditNoteId= retSuppl.CreditNotePrintId,
                                                 //vatAmt= retSuppl.VATAmount,
                                                 //Remarks = retSuppl.Remarks,
                                                 //CreditNoteDate= retSuppl.CreatedOn,
                                             }
                               ).ToList();
            var returnSupplierData = (from retSuppl in _pharmacyDbContext.PHRMReturnToSupplier.Where(rts => rts.ReturnToSupplierId == returnToSupplierId)
                                      join goodsreceipt in _pharmacyDbContext.PHRMGoodsReceipt on retSuppl.GoodReceiptId equals goodsreceipt.GoodReceiptId
                                      join supdetail in _pharmacyDbContext.PHRMSupplier on retSuppl.SupplierId equals supdetail.SupplierId into supp
                                      from supplier in supp.DefaultIfEmpty()

                                      select new
                                      {
                                          CreditNoteNo = retSuppl.CreditNotePrintId,
                                          SuppliersCRN = retSuppl.CreditNoteId,
                                          ReturnType = retSuppl.ReturnStatus,
                                          Time = retSuppl.CreatedOn,
                                          UserName = (from emp in _pharmacyDbContext.Employees
                                                      where emp.EmployeeId == retSuppl.CreatedBy
                                                      select emp.FirstName).FirstOrDefault(),
                                          ReturnDate = retSuppl.ReturnDate,
                                          ContactNo = supplier.ContactNo,
                                          PanNo = supplier.PANNumber,
                                          RefNo = goodsreceipt.GoodReceiptPrintId,
                                          SupplierName = supplier.SupplierName,
                                          Remarks = retSuppl.Remarks

                                      }).FirstOrDefault();
            var Results = new
            {
                returnToSupplierItemsList,
                returnSupplierData

            };
            return Results;
        }
        /*else if (reqType == "getReturnToSupplierItemsByReturnToSupplierId")
        {

            var returnToSupplierItemsList = (from retSuppItm in phrmdbcontext.PHRMReturnToSupplierItem
                                             join retSuppl in phrmdbcontext.PHRMReturnToSupplier on retSuppItm.ReturnToSupplierId equals retSuppl.ReturnToSupplierId
                                             join itm in phrmdbcontext.PHRMItemMaster on retSuppItm.ItemId equals itm.ItemId
                                             where retSuppItm.ReturnToSupplierId == returnToSupplierId
                                             select new
                                             {
                                                 ItemName = itm.ItemName,
                                                 ReturnToSupplierId = retSuppItm.ReturnToSupplierId,
                                                 BatchNo = retSuppItm.BatchNo,
                                                 Quantity = retSuppItm.Quantity,
                                                 FreeQuantity = retSuppItm.FreeQuantity,
                                                 FreeAmount = retSuppItm.FreeAmount,
                                                 ExpiryDate = retSuppItm.ExpiryDate,
                                                 SalePrice = retSuppItm.SalePrice,
                                                 ItemPrice = retSuppItm.ItemPrice,
                                                 ReturnRate = retSuppItm.ReturnRate,
                                                 SubTotal = retSuppItm.SubTotal,
                                                 DiscountPercentage = retSuppItm.DiscountPercentage,
                                                 VATPercentage = retSuppItm.VATPercentage,
                                                 TotalAmount = retSuppItm.TotalAmount,
                                                 ReturnStatus = retSuppl.ReturnStatus,
                                                 CreatedBy = retSuppl.CreatedBy,
                                                 CreatedOn = retSuppl.CreatedOn,
                                                 GoodReceiptId = retSuppl.GoodReceiptId,


                                                 //UserName= rbacDbContext.Users.Where(a=>a.EmployeeId == retSuppl.CreatedBy).Select
                                                 //UserName = rbacDbContext.Users.Where(a => a.EmployeeId == retSuppl.CreatedBy).Select(a => a.UserName).FirstOrDefault()
                                                 //UserName = (from rbac in rbacDbContext.Users
                                                 //            where rbac.EmployeeId == retSuppl.CreatedBy
                                                 //            select rbac.UserName).FirstOrDefault()
                                                 //Created
                                                 //TotalAmt= retSuppl.TotalAmount,
                                                 //DiscAmt= retSuppl.DiscountAmount,
                                                 //CreditNoteId= retSuppl.CreditNotePrintId,
                                                 //vatAmt= retSuppl.VATAmount,
                                                 //Remarks = retSuppl.Remarks,
                                                 //CreditNoteDate= retSuppl.CreatedOn,


                                             }
                                         ).ToList();
                var returnSupplierData = (from retSuppl in phrmdbcontext.PHRMReturnToSupplier.Where(rts => rts.ReturnToSupplierId == returnToSupplierId)
                                          join goodsreceipt in phrmdbcontext.PHRMGoodsReceipt on retSuppl.GoodReceiptId equals goodsreceipt.GoodReceiptId
                                          join supdetail in phrmdbcontext.PHRMSupplier on retSuppl.SupplierId equals supdetail.SupplierId into supp
                                          from supplier in supp.DefaultIfEmpty()

                                          select new
                                          {
                                              CreditNoteNo = retSuppl.CreditNotePrintId,
                                              SuppliersCRN = retSuppl.CreditNoteId,
                                              ReturnType = retSuppl.ReturnStatus,
                                              Time = retSuppl.CreatedOn,
                                              UserName = (from emp in phrmdbcontext.Employees
                                                          where emp.EmployeeId == retSuppl.CreatedBy
                                                          select emp.FirstName).FirstOrDefault(),
                                              ReturnDate = retSuppl.ReturnDate,
                                              ContactNo = supplier.ContactNo,
                                              PanNo = supplier.PANNumber,
                                              RefNo = goodsreceipt.GoodReceiptPrintId,
                                              SupplierName = supplier.SupplierName,
                                              Remarks = retSuppl.Remarks
    }).FirstOrDefault();

                responseData.Status = "OK";
            responseData.Results = new { returnToSupplierItemsList, returnSupplierData
            };
        }*/
        [HttpGet]
        [Route("GRDetailWithAvailableStock")]
        public IActionResult GetGRDetail(int goodsReceiptId)
        {
            //else if (reqType == "getGRDetailsToReturnByGoodReceiptId" && goodsReceiptId != 0)
            Func<object> func = () => GetGRDetailsByGoodReceiptId(goodsReceiptId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGRDetailsByGoodReceiptId(int goodsReceiptId)
        {
            //var goodReceiptItemWithAvailableQuantity = (from gr in phrmdbcontext.PHRMGoodsReceipt
            //                                            join gri in phrmdbcontext.PHRMGoodsReceiptItems on gr.GoodReceiptId equals gri.GoodReceiptId
            //                                            join itmMst in phrmdbcontext.PHRMItemMaster on gri.ItemId equals itmMst.ItemId
            //                                            join storeStock in phrmdbcontext.StoreStocks on gri.StoreStockId equals storeStock.StoreStockId
            //                                            where gr.GoodReceiptId == goodsReceiptId && storeStock.AvailableQuantity > 0
            //                                            select new
            //                                            {
            //                                                SupplierId = gr.SupplierId,
            //                                                GoodReceiptId = gri.GoodReceiptId,
            //                                                GoodReceiptItemId = gri.GoodReceiptItemId,
            //                                                ItemName = itmMst.ItemName,
            //                                                BatchNo = gri.BatchNo,
            //                                                ReceivedQuantity = gri.ReceivedQuantity,
            //                                                AvailableQuantity = storeStock.AvailableQuantity,
            //                                                FreeQuantity = gri.FreeQuantity,
            //                                                GRItemPrice = gri.GRItemPrice,
            //                                                VATPercentage = gri.VATPercentage,
            //                                                ItemId = gri.ItemId,
            //                                                CCCharge = gri.CCCharge,
            //                                                SalePrice = gri.SalePrice,
            //                                                DiscountPercentage = gri.DiscountPercentage,
            //                                                ExpiryDate = gri.ExpiryDate
            //                                            }).AsNoTracking()
            //                                              .ToList();
            //responseData.Status = "OK";
            //responseData.Results = goodReceiptItemWithAvailableQuantity;

            var goodReceiptItemDetails = (from gr in _pharmacyDbContext.PHRMGoodsReceipt
                                          join gri in _pharmacyDbContext.PHRMGoodsReceiptItems on gr.GoodReceiptId equals gri.GoodReceiptId
                                          join itmMst in _pharmacyDbContext.PHRMItemMaster on gri.ItemId equals itmMst.ItemId
                                          join storeStock in _pharmacyDbContext.StoreStocks on gri.StoreStockId equals storeStock.StoreStockId
                                          where gr.GoodReceiptId == goodsReceiptId && storeStock.AvailableQuantity > 0
                                          select new
                                          {
                                              SupplierId = gr.SupplierId,
                                              GoodReceiptId = gri.GoodReceiptId,
                                              GoodReceiptItemId = gri.GoodReceiptItemId,
                                              StockId = gri.StockId,
                                              ItemName = itmMst.ItemName,
                                              BatchNo = gri.BatchNo,
                                              ReceivedQuantity = gri.ReceivedQuantity,
                                              AvailableQuantity = storeStock.AvailableQuantity,
                                              FreeQuantity = gri.FreeQuantity,
                                              GRItemPrice = gri.GRItemPrice,
                                              ItemId = gri.ItemId,
                                              SalePrice = gri.SalePrice,
                                              ExpiryDate = gri.ExpiryDate
                                          }).AsNoTracking().ToList();
            return goodReceiptItemDetails;
        }
        /*else if (reqType == "getGRDetailsToReturnByGoodReceiptId" && goodsReceiptId != 0)
                    {
                        //var goodReceiptItemWithAvailableQuantity = (from gr in phrmdbcontext.PHRMGoodsReceipt
                        //                                            join gri in phrmdbcontext.PHRMGoodsReceiptItems on gr.GoodReceiptId equals gri.GoodReceiptId
                        //                                            join itmMst in phrmdbcontext.PHRMItemMaster on gri.ItemId equals itmMst.ItemId
                        //                                            join storeStock in phrmdbcontext.StoreStocks on gri.StoreStockId equals storeStock.StoreStockId
                        //                                            where gr.GoodReceiptId == goodsReceiptId && storeStock.AvailableQuantity > 0
                        //                                            select new
                        //                                            {
                        //                                                SupplierId = gr.SupplierId,
                        //                                                GoodReceiptId = gri.GoodReceiptId,
                        //                                                GoodReceiptItemId = gri.GoodReceiptItemId,
                        //                                                ItemName = itmMst.ItemName,
                        //                                                BatchNo = gri.BatchNo,
                        //                                                ReceivedQuantity = gri.ReceivedQuantity,
                        //                                                AvailableQuantity = storeStock.AvailableQuantity,
                        //                                                FreeQuantity = gri.FreeQuantity,
                        //                                                GRItemPrice = gri.GRItemPrice,
                        //                                                VATPercentage = gri.VATPercentage,
                        //                                                ItemId = gri.ItemId,
                        //                                                CCCharge = gri.CCCharge,
                        //                                                SalePrice = gri.SalePrice,
                        //                                                DiscountPercentage = gri.DiscountPercentage,
                        //                                                ExpiryDate = gri.ExpiryDate
                        //                                            }).AsNoTracking()
                        //                                              .ToList();
                        //responseData.Status = "OK";
                        //responseData.Results = goodReceiptItemWithAvailableQuantity;

                        var goodReceiptItemDetails = (from gr in phrmdbcontext.PHRMGoodsReceipt
                                                      join gri in phrmdbcontext.PHRMGoodsReceiptItems on gr.GoodReceiptId equals gri.GoodReceiptId
                                                      join itmMst in phrmdbcontext.PHRMItemMaster on gri.ItemId equals itmMst.ItemId
                                                      join storeStock in phrmdbcontext.StoreStocks on gri.StoreStockId equals storeStock.StoreStockId
                                                      where gr.GoodReceiptId == goodsReceiptId && storeStock.AvailableQuantity > 0
                                                      select new
                                                      {
                                                          SupplierId = gr.SupplierId,
                                                          GoodReceiptId = gri.GoodReceiptId,
                                                          GoodReceiptItemId = gri.GoodReceiptItemId,
                                                          StockId = gri.StockId,
                                                          ItemName = itmMst.ItemName,
                                                          BatchNo = gri.BatchNo,
                                                          ReceivedQuantity = gri.ReceivedQuantity,
                                                          AvailableQuantity = storeStock.AvailableQuantity,
                                                          FreeQuantity = gri.FreeQuantity,
                                                          GRItemPrice = gri.GRItemPrice,
                                                          ItemId = gri.ItemId,
                                                          SalePrice = gri.SalePrice,
                                                          ExpiryDate = gri.ExpiryDate
                                                      }).AsNoTracking().ToList();
                responseData.Status = "OK";
                        responseData.Results = goodReceiptItemDetails;

                    }

        }*/
        [HttpPost]
        [Route("NewReturnDetail")]
        public IActionResult PostReturnToSupplierItems()
        {
            //else if (reqType != null && reqType == "postReturnToSupplierItems")
            Func<object> func = () => PostReturnToSupplierItemsDetail();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostReturnToSupplierItemsDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            PHRMReturnToSupplierModel retSupplModel = DanpheJSONConvert.DeserializeObject<PHRMReturnToSupplierModel>(str);
            if (retSupplModel != null && retSupplModel.returnToSupplierItems != null)
            {
                var maxretSupp = (from RTS in _pharmacyDbContext.PHRMReturnToSupplier select RTS.CreditNotePrintId).DefaultIfEmpty(0).Max() ?? 0;
                retSupplModel.CreditNotePrintId = maxretSupp + 1;

                int outputRTSId = PharmacyBL.ReturnItemsToSupplierTransaction(retSupplModel, currentUser, _pharmacyDbContext);
                return outputRTSId;
            }
            else
            {
                return null;
            }
        }

        /*             else if (reqType != null && reqType == "postReturnToSupplierItems")
            {

                PHRMReturnToSupplierModel retSupplModel = DanpheJSONConvert.DeserializeObject<PHRMReturnToSupplierModel>(str);
                if (retSupplModel != null && retSupplModel.returnToSupplierItems != null)
                {
                    var maxretSupp = (from RTS in phrmdbcontext.PHRMReturnToSupplier select RTS.CreditNotePrintId).DefaultIfEmpty(0).Max() ?? 0;
        retSupplModel.CreditNotePrintId = maxretSupp + 1;

                    int outputRTSId = PharmacyBL.ReturnItemsToSupplierTransaction(retSupplModel, currentUser, phrmdbcontext);

        responseData.Results = outputRTSId;
                    responseData.Status = "OK";

                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Return to Supplier Items is null or failed to Save";
                }
        }
    */
    }
}
