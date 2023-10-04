using AutoMapper;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services;
using DanpheEMR.Services.Pharmacy.DTOs.PurchaseOrder;
using DanpheEMR.Services.Verification.DTOs;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace DanpheEMR.Controllers.Pharmacy
{
    public class PharmacyPurchaseController : CommonController
    {
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly IMapper _mapper;
        public PharmacyPurchaseController(IOptions<MyConfiguration> _config, IMapper mapper) : base(_config)
        {
            _pharmacyDbContext = new PharmacyDbContext(connString);
            _mapper = mapper;
            _rbacDbContext = new RbacDbContext(connString);

        }

        [HttpGet]
        [Route("Orders")]
        public IActionResult GetOrders(string status, DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "getPHRMOrderList")

            string[] poSelectedStatus = status.Split(',');
            Func<object> func = () => (from po in _pharmacyDbContext.PHRMPurchaseOrder
                                       join supp in _pharmacyDbContext.PHRMSupplier on po.SupplierId equals supp.SupplierId
                                       join stats in poSelectedStatus on po.POStatus equals stats
                                       orderby po.PODate descending
                                       select new
                                       {
                                           PurchaseOrderId = po.PurchaseOrderId,
                                           PurchaseOrderNo = po.PurchaseOrderNo,
                                           SupplierId = po.SupplierId,
                                           PODate = po.PODate,
                                           POStatus = po.POStatus,
                                           SubTotal = po.SubTotal,
                                           DiscountAmount = po.DiscountAmount,
                                           CCChargeAmount = po.CCChargeAmount,
                                           TotalAmount = po.TotalAmount,
                                           VATAmount = po.VATAmount,
                                           SupplierName = supp.SupplierName,
                                           ContactNo = supp.ContactNo,
                                           ContactAddress = supp.ContactAddress,
                                           Email = supp.Email,
                                           City = supp.City,
                                           Pin = supp.PANNumber,
                                           TermText = po.TermsConditions,
                                           DeliveryDate = po.DeliveryDate,
                                           CurrentVerificationLevelCount = po.VerificationId != null ? _pharmacyDbContext.VerificationModels.Where(V => V.VerificationId == po.VerificationId)
                                                                                                    .Select(V => V.CurrentVerificationLevelCount).FirstOrDefault() : 0,
                                           VerifierIds = po.VerifierIds
                                       }).Where(a => DbFunctions.TruncateTime(a.PODate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(a.PODate) <= DbFunctions.TruncateTime(toDate)).OrderByDescending(a => a.PurchaseOrderId).ToList();
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("OrderInfo")]
        public IActionResult OrderInfo(int purchaseOrderId)
        {
            //else if (reqType == "getPHRMPOItemsByPOId")

            Func<object> func = () => GetOrderInfo(purchaseOrderId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GoodReceipts")]
        public IActionResult GetGoodReceipts()
        {
            //else if (reqType == "goodsreceipt")

            Func<object> func = () => (from gr in _pharmacyDbContext.PHRMGoodsReceipt
                                       join supp in _pharmacyDbContext.PHRMSupplier on gr.SupplierId equals supp.SupplierId
                                       join fy in _pharmacyDbContext.PharmacyFiscalYears on gr.FiscalYearId equals fy.FiscalYearId
                                       join rbac in _pharmacyDbContext.Users on gr.CreatedBy equals rbac.EmployeeId
                                       orderby gr.CreatedOn descending
                                       select new
                                       {
                                           gr.GoodReceiptId,
                                           gr.GoodReceiptPrintId,
                                           gr.PurchaseOrderId,
                                           gr.InvoiceNo,
                                           gr.GoodReceiptDate,
                                           gr.CreatedOn,
                                           gr.SubTotal,
                                           gr.DiscountAmount,
                                           gr.VATAmount,
                                           gr.TotalAmount,
                                           gr.Remarks,
                                           supp.SupplierName,
                                           supp.ContactNo,
                                           supp.City,
                                           Pin = supp.PANNumber,
                                           supp.ContactAddress,
                                           supp.Email,
                                           gr.IsCancel,
                                           supp.SupplierId,
                                           rbac.UserName,
                                           CurrentFiscalYear = fy.FiscalYearName,
                                           IsTransferredToACC = gr.IsTransferredToACC == null ? false : true
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SuppliersLedgerInfo")]
        public IActionResult SuppliersLedgerInfo(DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "get-goods-receipt-groupby-supplier")

            Func<object> func = () => GetSuppliersLedgerInfo(fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SupplierLedgerInfo")]
        public IActionResult SupplierLedgerInfo(int supplierId, DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "get-goods-receipt-by-SupplierID")

            Func<object> func = () => GetSupplierLedgerInfo(supplierId, fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GoodsReceiptInfo")]
        public IActionResult GoodsReceiptInfo(int goodsReceiptId)
        {
            // else if (reqType == "GRItemsViewByGRId")

            Func<object> func = () => (from gritems in _pharmacyDbContext.PHRMGoodsReceiptItems
                                       join gr in _pharmacyDbContext.PHRMGoodsReceipt on gritems.GoodReceiptId equals gr.GoodReceiptId
                                       where gritems.GoodReceiptId == goodsReceiptId
                                       select new
                                       {
                                           gritems.GoodReceiptId,
                                           gritems.ItemName,
                                           GoodReceiptNo = gr.GoodReceiptPrintId,
                                           gritems.BatchNo,
                                           gritems.ExpiryDate,
                                           gritems.ReceivedQuantity,
                                           gritems.FreeQuantity,
                                           gritems.RejectedQuantity,
                                           gritems.SellingPrice,
                                           gritems.GRItemPrice,
                                           gritems.SubTotal,
                                           VATAmount = gritems.GrPerItemVATAmt,
                                           DiscountAmount = gritems.GrPerItemDisAmt,
                                           gritems.TotalAmount,
                                           gritems.SalePrice,
                                           gritems.CCAmount,
                                           gritems.GrTotalDisAmt,
                                           gritems.StripRate
                                       }
                            ).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GoodsReceiptReturnInfo")]
        public IActionResult GoodsReceiptReturnInfo(int goodsReceiptId, int creditNotePrintId)
        {
            //else if (reqType == "GRItemsViewByGRReturnId")

            Func<object> func = () => (from ret in _pharmacyDbContext.PHRMReturnToSupplier
                                       join retitm in _pharmacyDbContext.PHRMReturnToSupplierItem on ret.ReturnToSupplierId equals retitm.ReturnToSupplierId
                                       where ret.CreditNotePrintId == creditNotePrintId && ret.GoodReceiptId == goodsReceiptId
                                       select new
                                       {
                                           ret.GoodReceiptId,
                                           _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptItemId == retitm.GoodReceiptItemId).FirstOrDefault().ItemName,
                                           ret.CreditNotePrintId,
                                           retitm.BatchNo,
                                           _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptItemId == retitm.GoodReceiptItemId).FirstOrDefault().ExpiryDate,
                                           ReceivedQuantity = retitm.Quantity,
                                           retitm.FreeQuantity,
                                           RejectedQuantity = 0,
                                           _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptItemId == retitm.GoodReceiptItemId).FirstOrDefault().SellingPrice,
                                           _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptItemId == retitm.GoodReceiptItemId).FirstOrDefault().GRItemPrice,
                                           retitm.ReturnRate,
                                           retitm.SubTotal,
                                           retitm.VATAmount,
                                           DiscountAmount = retitm.DiscountedAmount,
                                           retitm.TotalAmount,
                                           retitm.SalePrice,
                                           retitm.CCAmount,
                                           GrTotalDisAmt = retitm.DiscountedAmount,
                                           _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptItemId == retitm.GoodReceiptItemId).FirstOrDefault().StripRate
                                       }
                            ).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("OrderItemsToGoodsReceipt")]
        public IActionResult OrderItemsToGoodsReceipt(int purchaseOrderId)
        {
            Func<object> func = () => GetOrderItemsToGoodsReceipt(purchaseOrderId);
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("GoodsReceiptDetailsByItemId")]
        public IActionResult GoodsReceiptDetailsByItemId(int itemId)
        {
            //else if (reqType == "getGRItemsByItemId" && reqType.Length > 0)


            Func<object> func = () => (from grItems in _pharmacyDbContext.PHRMGoodsReceiptItems
                                       where grItems.ItemId == itemId && grItems.AvailableQuantity > 0
                                       orderby grItems.ExpiryDate descending
                                       select grItems)
                          .ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GoodsReceiptForEdit")]
        public IActionResult GoodsReceiptForEdit(int goodsReceiptId)
        {
            //else if (reqType == "GRforEdit" && reqType.Length > 0)

            Func<object> func = () => GetGoodsReceiptForEdit(goodsReceiptId);
            return InvokeHttpGetFunction(func);
        }

        private object GetSuppliersLedgerInfo(DateTime fromDate, DateTime toDate)
        {
            List<PHRMSupplierGoodReceiptVM> goodReceiptList = new List<PHRMSupplierGoodReceiptVM>();

            goodReceiptList = (from s in _pharmacyDbContext.PHRMSupplier.Where(a => a.IsActive == true)
                               join gr in _pharmacyDbContext.PHRMGoodsReceipt
                               .Where(a => a.IsCancel != true && DbFunctions.TruncateTime(a.GoodReceiptDate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(a.GoodReceiptDate) <= DbFunctions.TruncateTime(toDate)) on s.SupplierId equals gr.SupplierId
                               into leftJ
                               from lj in leftJ.DefaultIfEmpty()
                               group new { s, lj } by new { s.SupplierId, s.SupplierName } into g
                               select new PHRMSupplierGoodReceiptVM
                               {
                                   SupplierId = g.Key.SupplierId,
                                   SubTotal = g.Sum(a => a.lj.SubTotal),
                                   DiscountAmount = g.Sum(a => a.lj.DiscountAmount),
                                   VATAmount = g.Sum(a => a.lj.VATAmount),
                                   TotalAmount = g.Sum(a => a.lj.TotalAmount),
                                   SupplierName = g.Key.SupplierName,
                                   IsCancel = g.Select(a => a.lj.IsCancel).FirstOrDefault(),
                                   GoodReceiptDate = g.Select(a => a.lj.GoodReceiptDate).FirstOrDefault(),
                                   CCAmount = g.Sum(a => a.lj.CCAmount)
                               }).ToList();

            List<PHRMSupplierGoodReceiptVM> goodReceiptReturn = new List<PHRMSupplierGoodReceiptVM>();
            goodReceiptReturn = (from s in _pharmacyDbContext.PHRMSupplier.Where(a => a.IsActive == true)
                                 join grret in _pharmacyDbContext.PHRMReturnToSupplier.Where(a => DbFunctions.TruncateTime(a.ReturnDate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(a.ReturnDate) <= DbFunctions.TruncateTime(toDate)) on s.SupplierId equals grret.SupplierId into leftJ
                                 from lj in leftJ.DefaultIfEmpty()
                                 group new { s, lj } by new { s.SupplierId, s.SupplierName } into g
                                 select new PHRMSupplierGoodReceiptVM
                                 {
                                     SupplierId = g.Key.SupplierId,
                                     SubTotal = g.Sum(a => -a.lj.SubTotal),
                                     DiscountAmount = g.Sum(a => -a.lj.DiscountAmount),
                                     VATAmount = g.Sum(a => -a.lj.VATAmount),
                                     TotalAmount = g.Sum(a => -a.lj.TotalAmount),
                                     SupplierName = g.Key.SupplierName,
                                     IsCancel = false,
                                     GoodReceiptDate = g.Select(a => a.lj.ReturnDate).FirstOrDefault(),
                                     CCAmount = g.Sum(a => -a.lj.CCAmount)
                                 }).ToList();
            goodReceiptList.AddRange(goodReceiptReturn);
            var data = goodReceiptList.GroupBy(a => a.SupplierId).Select(d => new PHRMSupplierGoodReceiptVM
            {
                SupplierId = d.Select(a => a.SupplierId).FirstOrDefault(),
                SubTotal = d.Sum(s => s.SubTotal),
                DiscountAmount = d.Sum(a => a.DiscountAmount),
                VATAmount = d.Sum(a => a.VATAmount),
                TotalAmount = d.Sum(a => a.TotalAmount),
                SupplierName = d.Select(a => a.SupplierName).FirstOrDefault(),
                IsCancel = d.Select(a => a.IsCancel).FirstOrDefault(),
                GoodReceiptDate = d.Select(a => a.GoodReceiptDate).FirstOrDefault(),
                CCAmount = d.Sum(a => a.CCAmount)
            }).OrderBy(b => b.SupplierName);
            return data;
        }

        private object GetSupplierLedgerInfo(int supplierId, DateTime fromDate, DateTime toDate)
        {
            var supplierDettail = _pharmacyDbContext.PHRMSupplier.Where(supplier => supplier.SupplierId == supplierId).Select(s => new
            {
                s.ContactNo,
                s.SupplierName
            }).FirstOrDefault();

            List<PHRMGoodReceiptVM> goodReciptList = new List<PHRMGoodReceiptVM>();

            goodReciptList = _pharmacyDbContext.PHRMGoodsReceipt.Where(a => a.IsCancel != true && a.SupplierId == supplierId && DbFunctions.TruncateTime(a.GoodReceiptDate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(a.GoodReceiptDate) <= DbFunctions.TruncateTime(toDate))
                                                    .Select(a =>
                                                    new PHRMGoodReceiptVM
                                                    {
                                                        SupplierId = a.SupplierId,
                                                        InvoiceNo = a.InvoiceNo,
                                                        GoodReceiptDate = a.GoodReceiptDate,
                                                        SubTotal = a.SubTotal,
                                                        DiscountAmount = a.DiscountAmount,
                                                        VATAmount = a.VATAmount,
                                                        TotalAmount = a.TotalAmount,
                                                        GoodReceiptId = a.GoodReceiptId,
                                                        CreditPeriod = a.CreditPeriod,
                                                        SupplierName = supplierDettail.SupplierName,
                                                        GoodReceiptPrintId = a.GoodReceiptPrintId,
                                                        GoodReceiptType = "Purchased GR",
                                                        ContactNo = supplierDettail.ContactNo,
                                                    }).ToList();

            int? CreditPeriod = null;
            List<PHRMGoodReceiptVM> goodReceiptReturn = new List<PHRMGoodReceiptVM>();

            goodReceiptReturn = _pharmacyDbContext.PHRMReturnToSupplier.Where(a => a.SupplierId == supplierId && DbFunctions.TruncateTime(a.ReturnDate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(a.ReturnDate) <= DbFunctions.TruncateTime(toDate))
                                                                     .Select(a => new PHRMGoodReceiptVM
                                                                     {
                                                                         SupplierId = a.SupplierId,
                                                                         InvoiceNo = a.CreditNoteId,
                                                                         GoodReceiptDate = a.ReturnDate,
                                                                         SubTotal = -a.SubTotal,
                                                                         DiscountAmount = -a.DiscountAmount,
                                                                         VATAmount = -a.VATAmount,
                                                                         TotalAmount = -a.TotalAmount,
                                                                         GoodReceiptId = a.GoodReceiptId,
                                                                         CreditPeriod = CreditPeriod.Value,
                                                                         SupplierName = supplierDettail.SupplierName,
                                                                         GoodReceiptPrintId = a.CreditNotePrintId,
                                                                         GoodReceiptType = "Returned GR",
                                                                         ContactNo = supplierDettail.ContactNo,
                                                                     }).ToList();

            goodReciptList.AddRange(goodReceiptReturn);
            goodReciptList.OrderBy(a => a.GoodReceiptDate);

            return goodReciptList;
        }

        private object GetOrderItemsToGoodsReceipt(int PurchaseOrderId)
        {
            var OrderDetailsForGR = (from po in _pharmacyDbContext.PHRMPurchaseOrder.Where(o => o.PurchaseOrderId == PurchaseOrderId)
                                     join s in _pharmacyDbContext.PHRMSupplier on po.SupplierId equals s.SupplierId
                                     join fy in _pharmacyDbContext.PharmacyFiscalYears on po.FiscalYearId equals fy.FiscalYearId
                                     join emp in _pharmacyDbContext.Employees on po.CreatedBy equals emp.EmployeeId
                                     select new PHRMPurchaseOrderForGoodReceiptVM
                                     {
                                         PurchaseOrderId = po.PurchaseOrderId,
                                         SupplierId = po.SupplierId,
                                         SupplierName = s.SupplierName,
                                         PurchaseOrderNo = po.PurchaseOrderNo,
                                         ReferenceNo = po.ReferenceNo,
                                         POStatus = po.POStatus,
                                         PODate = po.PODate,
                                         Remarks = po.Remarks,
                                         SubTotal = po.SubTotal,
                                         DiscountAmount = po.DiscountAmount,
                                         DiscountPercentage = (decimal)po.DiscountPercentage,
                                         TaxableAmount = po.TaxableAmount,
                                         NonTaxableAmount = po.NonTaxableAmount,
                                         VATAmount = po.VATAmount,
                                         CCChargeAmount = po.CCChargeAmount,
                                         Adjustment = po.Adjustment,
                                         TotalAmount = po.TotalAmount,
                                         CreatedBy = po.CreatedBy,
                                         CreatedOn = po.CreatedOn,
                                         FiscalYearId = po.FiscalYearId
                                     }).FirstOrDefault();

            var OrderItemsDetailsForGR = (from oi in _pharmacyDbContext.PHRMPurchaseOrderItems
                                          .Where(a => a.PurchaseOrderId == PurchaseOrderId && (a.POItemStatus == ENUM_PharmacyPurchaseOrderStatus.Partial || a.POItemStatus == ENUM_PharmacyPurchaseOrderStatus.Active))
                                          join item in _pharmacyDbContext.PHRMItemMaster on oi.ItemId equals item.ItemId
                                          join g in _pharmacyDbContext.PHRMGenericModel on oi.GenericId equals g.GenericId
                                          join uom in _pharmacyDbContext.PHRMUnitOfMeasurement on item.UOMId equals uom.UOMId
                                          select new PHRMPurchaseOrderItemForGoodReceiptVM
                                          {
                                              PurchaseOrderId = oi.PurchaseOrderId,
                                              PurchaseOrderItemId = oi.PurchaseOrderItemId,
                                              ItemId = oi.ItemId,
                                              ItemName = item.ItemName,
                                              UOMName = uom.UOMName,
                                              Quantity = oi.Quantity,
                                              SalePrice = oi.StandardRate,
                                              ReceivedQuantity = oi.ReceivedQuantity,
                                              PendingQuantity = oi.Quantity - oi.ReceivedQuantity,
                                              SubTotal = oi.SubTotal,
                                              DiscountPercentage = oi.DiscountPercentage,
                                              DiscountAmount = oi.DiscountAmount,
                                              VATPercentage = oi.VATPercentage,
                                              VATAmount = oi.VATAmount,
                                              CCChargePercentage = oi.CCChargePercentage,
                                              CCChargeAmount = oi.CCChargeAmount,
                                              TotalAmount = oi.TotalAmount,
                                              Remarks = oi.Remarks,
                                              POItemStatus = oi.POItemStatus,
                                              CreatedOn = oi.CreatedOn,
                                              GenericId = oi.GenericId,
                                              GenericName = g.GenericName,
                                              FreeQuantity = oi.FreeQuantity,
                                              PendingFreeQuantity = oi.PendingFreeQuantity,
                                              TotalQuantity = (float)(oi.Quantity + (float)oi.FreeQuantity),
                                              CreatedBy = oi.CreatedBy
                                          }).ToList();
            return new
            {
                OrderForGR = OrderDetailsForGR,
                OrderItemsForGr = OrderItemsDetailsForGR
            };
        }
        private object GetGoodsReceiptForEdit(int goodsReceiptId)
        {
            PHRMGoodsReceiptModel GoodReceipt = (from gr in _pharmacyDbContext.PHRMGoodsReceipt
                                                 where gr.GoodReceiptId == goodsReceiptId
                                                 select gr).FirstOrDefault();
            var GenericData = _pharmacyDbContext.PHRMGenericModel.Where(a => a.IsActive == true).ToList();
            GoodReceipt.GoodReceiptItem = (from gritems in _pharmacyDbContext.PHRMGoodsReceiptItems
                                           where gritems.GoodReceiptId == goodsReceiptId && gritems.IsCancel == false
                                           select gritems).ToList();
            foreach (var gritm in GoodReceipt.GoodReceiptItem)
            {
                var stockTxn = _pharmacyDbContext.StockTransactions.Where(a => a.StockId == gritm.StockId);
                //ramesh: check if each grItem is altered ie transfered or dispatched; 
                var grItemTxnEnum = ENUM_PHRM_StockTransactionType.PurchaseItem;
                var GenericName = GenericData.Where(a => a.GenericId == gritm.GenericId).Select(a => a.GenericName).FirstOrDefault();
                gritm.GenericName = GenericName;
                if (stockTxn.Any(txnType => txnType.TransactionType != grItemTxnEnum) && stockTxn.Count() > 1)
                {
                    gritm.IsItemAltered = true;
                    GoodReceipt.IsGRModified = true; // Bikash: 29June'20 - added to allow edit of GR details after modification (sale or transfer).
                }
            }
            return GoodReceipt;
        }

        [HttpPost]
        [Route("Order")]
        public IActionResult PostOrder([FromBody] PurchaseOrder_DTO purchaseOrder)
        {
            //else if (reqType != null && reqType == "PurchaseOrder")
            Func<object> func = () => AddOrder(purchaseOrder, _mapper);
            return InvokeHttpPostFunction(func);
        }

        [HttpPut]
        [Route("Order")]
        public IActionResult Order([FromBody] PurchaseOrder_DTO purchaseOrder)
        {
            Func<object> func = () => UpdatePurchaseOrder(purchaseOrder);
            return InvokeHttpGetFunction(func);
        }

        [HttpPost]
        [Route("GoodsReceipt")]
        public IActionResult PostGoodReceipt()
        {
            //else if (reqType != null && reqType == "postGoodReceipt")

            string ipDataString = ReadPostData();
            Func<object> func = () => AddGoodsReceipt(ipDataString);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("GoodsReceiptCancel")]
        public IActionResult PostGoodsReceiptCancel(int goodsReceiptId, string cancelRemarks)
        {
            //else if (reqType == "cancel-goods-receipt")

            Func<object> func = () => CancelGoodReceipt(goodsReceiptId, cancelRemarks);
            return InvokeHttpPostFunction(func);
        }

        [HttpPut]
        [Route("GoodsReceipt")]
        public IActionResult PutGoodsReceipt()
        {
            //else if (reqType == "updateGoodReceipt")

            string ipDataString = ReadPostData();
            Func<object> func = () => UpdateGoodReceipt(ipDataString);
            return InvokeHttpPutFunction(func);
        }


        private object AddOrder(PurchaseOrder_DTO purchaseOrderDTO, IMapper mapper)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            if (purchaseOrderDTO != null && purchaseOrderDTO.PHRMPurchaseOrderItems != null && purchaseOrderDTO.PHRMPurchaseOrderItems.Count > 0)
            {
                int PurchaseOrderId = 0;
                PurchaseOrderId = PharmacyBL.PostPOWithPOItems(purchaseOrderDTO, currentUser, _pharmacyDbContext, mapper);
                if (PurchaseOrderId > 0)
                {
                    return PurchaseOrderId;
                }
                else
                {
                    throw new Exception("PO and PO Items is null or failed to Save");
                }

            }
            return null;
        }


        private object AddGoodsReceipt(string ipDataString)
        {
            PHRMGoodsReceiptViewModel grViewModelData = DanpheJSONConvert.DeserializeObject<PHRMGoodsReceiptViewModel>(ipDataString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            if (grViewModelData != null)
            {
                grViewModelData.goodReceipt.FiscalYearId = PharmacyBL.GetFiscalYearGoodsReceipt(_pharmacyDbContext, grViewModelData.goodReceipt.GoodReceiptDate).FiscalYearId;
                grViewModelData.goodReceipt.GoodReceiptPrintId = PharmacyBL.GetGoodReceiptPrintNo(_pharmacyDbContext, grViewModelData.goodReceipt.FiscalYearId);

                bool flag = PharmacyBL.GoodReceiptTransaction(grViewModelData, _pharmacyDbContext, currentUser);
                if (flag)
                {
                    return grViewModelData.goodReceipt.GoodReceiptId;
                }
                else
                {
                    throw new Exception("Goods Related Items is null or failed to Save");
                }
            }
            throw new Exception("No data found to Save");
        }

        private object CancelGoodReceipt(int goodsReceiptId, string cancelRemarks)
        {
            if (goodsReceiptId > 0)
            {
                try
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    PharmacyBL.CancelGoodsReceipt(_pharmacyDbContext, goodsReceiptId, currentUser, cancelRemarks);
                    return goodsReceiptId;
                }
                catch (Exception ex)
                {
                    throw new Exception("Goods Receipt Cancelation Failed!!");
                }
            }
            else
            {
                throw new Exception("Goods Receipt Cancelation Failed!! GoodsReceiptId is Invalid.");
            }
        }

        private object UpdateGoodReceipt(string ipDataString)
        {
            PHRMGoodsReceiptModel goodsReceipt = DanpheJSONConvert.DeserializeObject<PHRMGoodsReceiptModel>(ipDataString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            goodsReceipt.FiscalYearId = PharmacyBL.GetFiscalYear(_pharmacyDbContext).FiscalYearId;
            if (goodsReceipt != null && goodsReceipt.GoodReceiptItem != null && goodsReceipt.GoodReceiptItem.Count > 0)
            {

                using (var dbTransaction = _pharmacyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        var GRId = goodsReceipt.GoodReceiptId;
                        var storeId = goodsReceipt.StoreId;
                        var currentDate = DateTime.Now;
                        var fiscalYearId = PharmacyBL.GetFiscalYear(_pharmacyDbContext).FiscalYearId;
                        goodsReceipt.ModifiedBy = currentUser.EmployeeId;
                        goodsReceipt.ModifiedOn = currentDate;

                        //if any old grItems has been deleted, we need to compare GRItemIdlist
                        List<int> grItemsIdList = _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == GRId && a.IsCancel != true).Select(a => a.GoodReceiptItemId).ToList();
                        //also find the storestocklist for that deleted old GRItems
                        List<int> grItemStoreStockIdList = _pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == GRId).Select(a => a.StoreStockId).ToList();

                        goodsReceipt.GoodReceiptItem.ForEach(itm =>
                        {

                            if (itm.GoodReceiptItemId > 0) //old elememnt will have the goodsReceiptItemId
                            {
                                if (itm.ReceivedQuantity != 0)
                                {
                                    itm.GrPerItemVATAmt = itm.VATAmount;
                                    itm.GrPerItemDisAmt = itm.DiscountAmount;
                                }
                                _pharmacyDbContext.PHRMGoodsReceiptItems.Attach(itm);
                                _pharmacyDbContext.Entry(itm).State = EntityState.Modified;
                                _pharmacyDbContext.Entry(itm).Property(x => x.GoodReceiptId).IsModified = false;
                                _pharmacyDbContext.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                                _pharmacyDbContext.Entry(itm).Property(x => x.CreatedBy).IsModified = false;

                                var mainStock = _pharmacyDbContext.StockMasters.Where(s => s.StockId == itm.StockId && s.ItemId == itm.ItemId).FirstOrDefault();
                                mainStock.UpdateBatch(itm.BatchNo, currentUser.EmployeeId);
                                mainStock.UpdateExpiry(itm.ExpiryDate, currentUser.EmployeeId);

                                var storeStock = _pharmacyDbContext.StoreStocks.Where(a => a.StockId == itm.StockId && a.StoreStockId == itm.StoreStockId).FirstOrDefault();
                                if (itm.IsItemAltered == false)
                                {
                                    storeStock.UpdateAvailableQuantity(newQty: itm.ReceivedQuantity + itm.FreeQuantity);
                                    storeStock.UpdateNewCostPrice((decimal)itm.CostPrice);
                                    storeStock.UpdateMRP(itm.SalePrice);
                                    mainStock.UpdateNewCostPrice((decimal)itm.CostPrice);
                                    mainStock.UpdateMRP(itm.SalePrice, currentUser.EmployeeId);

                                    //find the stock txn list for that particular grItem to update Batch and Expiry
                                    var stockTxn = _pharmacyDbContext.StockTransactions.Where(a => a.StockId == itm.StockId && a.StoreStockId == itm.StoreStockId).FirstOrDefault();
                                    stockTxn.SetInOutQuantity(itm.ReceivedQuantity + itm.FreeQuantity, 0);

                                    //TODO: Update Batch, ExpiryDate, CostPrice and Update SalePrice for that item
                                    stockTxn.UpdateBatch(itm.BatchNo, currentUser.EmployeeId);
                                    stockTxn.UpdateExpiry(itm.ExpiryDate, currentUser.EmployeeId);
                                    stockTxn.UpdateCostPrice((decimal)itm.CostPrice);
                                    stockTxn.UpdateMRP(itm.SalePrice);
                                }
                                _pharmacyDbContext.SaveChanges();

                            }
                            else //this is the case "if new item is added during Edit";
                            {
                                // Initially,Add to Stock Master 
                                var newStockMaster = new PHRMStockMaster(
                                                            itemId: itm.ItemId,
                                                            batchNo: itm.BatchNo,
                                                            expiryDate: itm.ExpiryDate,
                                                            costPrice: itm.GRItemPrice,
                                                            salePrice: itm.SalePrice,
                                                            mrp: itm.MRP,
                                                            createdBy: currentUser.EmployeeId,
                                                            createdOn: currentDate);

                                // add the new barcode id
                                var barcodeService = new PharmacyStockBarcodeService(_pharmacyDbContext);
                                newStockMaster.UpdateBarcodeId(barcodeService.AddStockBarcode(
                                   stock: newStockMaster,
                                   createdBy: currentUser.EmployeeId
                                    ));

                                _pharmacyDbContext.StockMasters.Add(newStockMaster);
                                _pharmacyDbContext.SaveChanges();

                                // Add  store stock first
                                var newStoreStock = new PHRMStoreStockModel(newStockMaster, storeId, itm.ReceivedQuantity + itm.FreeQuantity, (decimal)itm.CostPrice, itm.SalePrice);
                                _pharmacyDbContext.StoreStocks.Add(newStoreStock);
                                _pharmacyDbContext.SaveChanges();

                                // Add GoodsReceiptItem
                                itm.GoodReceiptId = GRId;
                                itm.StockId = newStoreStock.StockId;
                                itm.StoreStockId = newStoreStock.StoreStockId.Value;
                                itm.CreatedBy = currentUser.EmployeeId;
                                itm.CreatedOn = currentDate;
                                itm.AvailableQuantity = itm.ReceivedQuantity + itm.FreeQuantity;
                                //below fields are used for accounting do not remove
                                if (itm.AvailableQuantity != 0)
                                {
                                    itm.GrPerItemVATAmt = itm.VATAmount;
                                    itm.GrPerItemDisAmt = itm.DiscountAmount;
                                }
                                _pharmacyDbContext.PHRMGoodsReceiptItems.Add(itm);
                                _pharmacyDbContext.SaveChanges();

                                // Add stock txns
                                var newMainStockTxns = new PHRMStockTransactionModel(newStoreStock, ENUM_PHRM_StockTransactionType.PurchaseItem, currentDate, itm.GoodReceiptItemId, currentUser.EmployeeId, currentDate, fiscalYearId);
                                newMainStockTxns.SetInOutQuantity(newStoreStock.AvailableQuantity, 0);
                                _pharmacyDbContext.StockTransactions.Add(newMainStockTxns);
                                _pharmacyDbContext.SaveChanges();
                            }
                            grItemsIdList = grItemsIdList.Where(a => a != itm.GoodReceiptItemId).ToList();
                            grItemStoreStockIdList = grItemStoreStockIdList.Where(a => a != itm.StoreStockId).ToList();

                        });
                        if (grItemsIdList.Any() && grItemStoreStockIdList.Any())
                        {
                            foreach (int grItemId in grItemsIdList)
                            {
                                var grItem = _pharmacyDbContext.PHRMGoodsReceiptItems.Find(grItemId);
                                grItem.IsCancel = true;

                                var strstk = _pharmacyDbContext.StoreStocks.Include(s => s.StockMaster).Where(a => a.StoreStockId == grItem.StoreStockId).FirstOrDefault();

                                //Add transaction data in stock transaction table
                                var stockTxn = new PHRMStockTransactionModel(
                                     storeStock: strstk,
                                     transactionType: ENUM_PHRM_StockTransactionType.CancelledGR,
                                     transactionDate: currentDate,
                                     referenceNo: grItem.GoodReceiptItemId,
                                     createdBy: currentUser.EmployeeId,
                                     createdOn: currentDate,
                                     fiscalYearId: goodsReceipt.FiscalYearId);
                                stockTxn.SetInOutQuantity(inQty: 0, outQty: grItem.AvailableQuantity);
                                _pharmacyDbContext.StockTransactions.Add(stockTxn);
                            }
                            foreach (int storeStockId in grItemStoreStockIdList)
                            {
                                var storeStock = _pharmacyDbContext.StoreStocks.Find(storeStockId);
                                storeStock.UpdateAvailableQuantity(newQty: 0);

                                //TODO:find the stockTxn and Update the IsActive flag to false;

                            }
                            _pharmacyDbContext.SaveChanges();
                        }

                        _pharmacyDbContext.PHRMGoodsReceipt.Attach(goodsReceipt);
                        _pharmacyDbContext.Entry(goodsReceipt).State = EntityState.Modified;
                        _pharmacyDbContext.Entry(goodsReceipt).Property(x => x.CreatedOn).IsModified = false;
                        _pharmacyDbContext.Entry(goodsReceipt).Property(x => x.CreatedBy).IsModified = false;
                        _pharmacyDbContext.SaveChanges();
                        dbTransaction.Commit();
                        return goodsReceipt.GoodReceiptId;
                    }
                    catch (Exception Ex)
                    {
                        dbTransaction.Rollback();
                        throw Ex;
                    }
                }

            }
            throw new Exception("No item found to update");

        }
        [HttpGet]
        [Route("Verifiers")]
        public IActionResult Verifiers()
        {
            Func<object> func = () => GetVerifiers();
            return InvokeHttpGetFunction(func);
        }

        private object GetVerifiers()
        {
            var roles = _rbacDbContext.Roles
                .Where(r => r.IsActive)
                .Select(r => new PHRMPOVerifier_VM
                {
                    Id = r.RoleId,
                    Name = r.RoleName,
                    Type = "role"
                });

            var users = _rbacDbContext.Users
                .Where(u => (bool)u.IsActive)
                .Join(_rbacDbContext.Employees, u => u.EmployeeId, e => e.EmployeeId, (u, e) => new PHRMPOVerifier_VM
                {
                    Id = u.UserId,
                    Name = e.FullName,
                    Type = "user"
                });

            var verifiersList = roles.Union(users).ToList().AsReadOnly();
            return verifiersList;
        }

        private object GetOrderInfo(int PurchaseOrderId)
        {
            var OrderDetails = (from po in _pharmacyDbContext.PHRMPurchaseOrder.Where(o => o.PurchaseOrderId == PurchaseOrderId)
                                join s in _pharmacyDbContext.PHRMSupplier on po.SupplierId equals s.SupplierId
                                join fy in _pharmacyDbContext.PharmacyFiscalYears on po.FiscalYearId equals fy.FiscalYearId
                                join emp in _pharmacyDbContext.Employees on po.CreatedBy equals emp.EmployeeId
                                select new PHRMPurchaseOrderVM
                                {
                                    PurchaseOrderId = po.PurchaseOrderId,
                                    SupplierId = po.SupplierId,
                                    SupplierName = s.SupplierName,
                                    ContactAddress = s.ContactAddress,
                                    ContactNo = s.ContactNo,
                                    PANNumber = s.PANNumber,
                                    FiscalYearId = po.FiscalYearId,
                                    FiscalYearName = fy.FiscalYearName,
                                    PurchaseOrderNo = po.PurchaseOrderNo,
                                    ReferenceNo = po.ReferenceNo,
                                    PODate = po.PODate,
                                    POStatus = po.POStatus,
                                    DeliveryDays = po.DeliveryDays,
                                    DeliveryDate = po.DeliveryDate,
                                    DeliveryAddress = po.DeliveryAddress,
                                    InvoicingAddress = po.InvoicingAddress,
                                    Contact = po.Contact,
                                    Remarks = po.Remarks,
                                    TermsId = po.TermsId == null ? 0 : po.TermsId.Value,
                                    TermsConditions = po.TermsConditions,
                                    SubTotal = po.SubTotal,
                                    DiscountAmount = po.DiscountAmount,
                                    DiscountPercentage = po.DiscountPercentage,
                                    TaxableAmount = po.TaxableAmount,
                                    NonTaxableAmount = po.NonTaxableAmount,
                                    VATAmount = po.VATAmount,
                                    CCChargeAmount = po.CCChargeAmount,
                                    Adjustment = po.Adjustment,
                                    TotalAmount = po.TotalAmount,
                                    EmployeeName = emp.FullName,
                                    CreatedBy = po.CreatedBy,
                                    CreatedOn = po.CreatedOn,
                                    VerificationId = po.VerificationId,
                                    VerifierIds = po.VerifierIds,
                                    IsVerificationEnabled = po.IsVerificationEnabled
                                }).FirstOrDefault();

            var OrderItemsDetails = (from oi in _pharmacyDbContext.PHRMPurchaseOrderItems.Where(a => a.PurchaseOrderId == PurchaseOrderId && a.IsCancel != true)
                                     join item in _pharmacyDbContext.PHRMItemMaster on oi.ItemId equals item.ItemId
                                     join g in _pharmacyDbContext.PHRMGenericModel on oi.GenericId equals g.GenericId
                                     join uom in _pharmacyDbContext.PHRMUnitOfMeasurement on item.UOMId equals uom.UOMId
                                     select new PHRMPurchaseOrderItemVM
                                     {
                                         PurchaseOrderId = oi.PurchaseOrderId,
                                         PurchaseOrderItemId = oi.PurchaseOrderItemId,
                                         ItemId = oi.ItemId,
                                         ItemName = item.ItemName,
                                         UOMName = uom.UOMName,
                                         Quantity = oi.Quantity,
                                         StandardRate = oi.StandardRate,
                                         ReceivedQuantity = oi.ReceivedQuantity,
                                         PendingQuantity = oi.PendingQuantity,
                                         SubTotal = oi.SubTotal,
                                         DiscountPercentage = oi.DiscountPercentage,
                                         DiscountAmount = oi.DiscountAmount,
                                         VATPercentage = oi.VATPercentage,
                                         VATAmount = oi.VATAmount,
                                         CCChargePercentage = oi.CCChargePercentage,
                                         CCChargeAmount = oi.CCChargeAmount,
                                         TotalAmount = oi.TotalAmount,
                                         AuthorizedRemark = oi.AuthorizedRemark,
                                         Remarks = oi.Remarks,
                                         POItemStatus = oi.POItemStatus,
                                         AuthorizedBy = oi.AuthorizedBy,
                                         AuthorizedOn = oi.AuthorizedOn,
                                         CreatedOn = oi.CreatedOn,
                                         IsCancel = oi.IsCancel,
                                         GenericId = oi.GenericId,
                                         GenericName = g.GenericName,
                                         FreeQuantity = oi.FreeQuantity,
                                         TotalQuantity = (float)(oi.Quantity + (float)oi.FreeQuantity),
                                         CreatedBy = oi.CreatedBy
                                     }).ToList();

            var Signatories = GetPharacyVerificationSignatories(OrderDetails.VerificationId);
            return new
            {
                Order = OrderDetails,
                OrderItems = OrderItemsDetails,
                Signatories = Signatories
            };
        }

        private List<PharmacyPurchaseOrderVerifierSignatory_DTO> GetPharacyVerificationSignatories(int? VerificationId)
        {
            var verifierSignatoryList = new List<PharmacyPurchaseOrderVerifierSignatory_DTO>();
            var verifierSignatory = new PharmacyPurchaseOrderVerifierSignatory_DTO();
            if (VerificationId != null)
            {
                var verificationModel = _pharmacyDbContext.VerificationModels.Find(VerificationId);

                var employeeDetail = _pharmacyDbContext.Employees.Include(e => e.EmployeeRole).FirstOrDefault(a => a.EmployeeId == verificationModel.VerifiedBy);
                //var employeeRole = _pharmacyDbContext.EmployeeRoles.FirstOrDefault(a => a.EmployeeRoleId == employeeDetail.EmployeeRoleId);

                if (employeeDetail != null && verificationModel != null)
                {
                    verifierSignatory.FullName = employeeDetail.FullName;
                    verifierSignatory.EmployeeRoleName = employeeDetail.EmployeeRole.EmployeeRoleName;
                    verifierSignatory.VerifiedOn = verificationModel.VerifiedOn;
                    verifierSignatory.VerificationRemarks = verificationModel.VerificationRemarks;
                    verifierSignatory.CurrentVerificationLevel = verificationModel.CurrentVerificationLevel;
                    if (verificationModel.ParentVerificationId != null)
                    {
                        verifierSignatoryList = GetPharacyVerificationSignatories((int)verificationModel.ParentVerificationId);
                    }
                    verifierSignatoryList.Add(verifierSignatory);
                }
            }
            return verifierSignatoryList;
        }

        private object UpdatePurchaseOrder(PurchaseOrder_DTO purchaseOrderDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            var currentDate = DateTime.Now;
            PHRMPurchaseOrderModel purchaseOrderFromClient = DanpheJSONConvert.DeserializeObject<PHRMPurchaseOrderModel>(DanpheJSONConvert.SerializeObject(purchaseOrderDTO));

            if (purchaseOrderFromClient.PurchaseOrderId <= 0)
            {
                throw new ArgumentNullException("Purchase Order Not found to update");
            }

            using (var dbTransaction = _pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {
                    var purchaseOrderFromServer = _pharmacyDbContext.PHRMPurchaseOrder.Include(a => a.PHRMPurchaseOrderItems).Where(a => a.PurchaseOrderId == purchaseOrderFromClient.PurchaseOrderId).FirstOrDefault();

                    var purchaseOrderItemsDict = purchaseOrderFromClient.PHRMPurchaseOrderItems.ToDictionary(item => item.PurchaseOrderItemId);

                    foreach (var item in purchaseOrderFromServer.PHRMPurchaseOrderItems)
                    {
                        if (purchaseOrderItemsDict.TryGetValue(item.PurchaseOrderItemId, out var item1))
                        {
                            item.ItemId = item1.ItemId;
                            item.Quantity = item1.Quantity;
                            item.StandardRate = item1.StandardRate;
                            item.ReceivedQuantity = item1.ReceivedQuantity;
                            item.PendingQuantity = item1.PendingQuantity;
                            item.SubTotal = item1.SubTotal;
                            item.DiscountPercentage = item1.DiscountPercentage;
                            item.DiscountAmount = item1.DiscountAmount;
                            item.VATPercentage = item1.VATPercentage;
                            item.VATAmount = item1.VATAmount;
                            item.CCChargePercentage = item1.CCChargePercentage;
                            item.CCChargeAmount = item1.CCChargeAmount;
                            item.TotalAmount = item1.TotalAmount;
                            item.AuthorizedRemark = item1.AuthorizedRemark;
                            item.Remarks = item1.Remarks;
                            item.POItemStatus = item1.POItemStatus;
                            item.IsCancel = item1.IsCancel;
                            item.ModifiedBy = item1.ModifiedBy;
                            item.ModifiedOn = item1.ModifiedOn;
                            item.GenericId = item1.GenericId;
                            item.FreeQuantity = item1.FreeQuantity;
                            item.ModifiedBy = currentUser.EmployeeId;
                            item.ModifiedOn = currentDate;
                            if (item1.IsCancel == true)
                            {
                                item.CancelledBy = currentUser.EmployeeId;
                                item.CancelledOn = currentDate;
                            }
                        }
                    }

                    var newPurchaseOrderItems = purchaseOrderFromClient.PHRMPurchaseOrderItems.Where(p => p.PurchaseOrderItemId == 0).ToList();
                    newPurchaseOrderItems.ForEach(item =>
                    {
                        item.PurchaseOrderId = purchaseOrderFromClient.PurchaseOrderId;
                        item.CreatedOn = currentDate;
                        item.CreatedBy = currentUser.EmployeeId;
                        item.PendingQuantity = item.Quantity;
                        item.POItemStatus = ENUM_PharmacyPurchaseOrderStatus.Active;
                        item.PendingFreeQuantity = item.FreeQuantity;
                    });
                    purchaseOrderFromServer.PHRMPurchaseOrderItems.AddRange(newPurchaseOrderItems);

                    purchaseOrderFromServer.SupplierId = purchaseOrderFromClient.SupplierId;
                    purchaseOrderFromServer.ReferenceNo = purchaseOrderFromClient.ReferenceNo;
                    purchaseOrderFromServer.PODate = purchaseOrderFromClient.PODate;
                    purchaseOrderFromServer.POStatus = purchaseOrderFromClient.POStatus;
                    purchaseOrderFromServer.SubTotal = purchaseOrderFromClient.SubTotal;
                    purchaseOrderFromServer.CCChargeAmount = purchaseOrderFromClient.CCChargeAmount;
                    purchaseOrderFromServer.DiscountAmount = purchaseOrderFromClient.DiscountAmount;
                    purchaseOrderFromServer.NonTaxableAmount = purchaseOrderFromClient.NonTaxableAmount;
                    purchaseOrderFromServer.TaxableAmount = purchaseOrderFromClient.TaxableAmount;
                    purchaseOrderFromServer.VATAmount = purchaseOrderFromClient.VATAmount;
                    purchaseOrderFromServer.TotalAmount = purchaseOrderFromClient.TotalAmount;
                    purchaseOrderFromServer.DeliveryAddress = purchaseOrderFromClient.DeliveryAddress;
                    purchaseOrderFromServer.InvoicingAddress = purchaseOrderFromClient.InvoicingAddress;
                    purchaseOrderFromServer.Contact = purchaseOrderFromClient.Contact;
                    purchaseOrderFromServer.DeliveryDays = purchaseOrderFromClient.DeliveryDays;
                    purchaseOrderFromServer.Remarks = purchaseOrderFromClient.Remarks;
                    purchaseOrderFromServer.ModifiedOn = purchaseOrderFromClient.ModifiedOn;
                    purchaseOrderFromServer.ModifiedBy = purchaseOrderFromClient.ModifiedBy;
                    purchaseOrderFromServer.TermsId = purchaseOrderFromClient.TermsId;
                    purchaseOrderFromServer.DiscountPercentage = purchaseOrderFromClient.DiscountPercentage;
                    purchaseOrderFromServer.DeliveryDays = purchaseOrderFromClient.DeliveryDays;
                    purchaseOrderFromServer.VerifierIds = PharmacyBL.SerializePHRMPOVerifiers(purchaseOrderDTO.VerifierList);
                    _pharmacyDbContext.SaveChanges();
                    dbTransaction.Commit();
                    return purchaseOrderFromClient.PurchaseOrderId;
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw ex;
                }
            }
        }

        [HttpGet]
        [Route("Items")]
        public IActionResult Items()
        {
            Func<object> func = () => GetItems();
            return InvokeHttpGetFunction(func);
        }

        private object GetItems()
        {
            var items = (from I in _pharmacyDbContext.PHRMItemMaster
                         join generic in _pharmacyDbContext.PHRMGenericModel on I.GenericId equals generic.GenericId
                         let rackDetails = (from rackItem in _pharmacyDbContext.PHRMRackItem
                                            join rack in _pharmacyDbContext.PHRMRack on rackItem.RackId equals rack.RackId
                                            where rackItem.ItemId == I.ItemId
                                            select rack.RackNo).ToList()
                         select new
                         {
                             ItemId = I.ItemId,
                             ItemName = I.ItemName,
                             GenericId = I.GenericId,
                             GenericName = generic.GenericName,
                             PackingTypeId = I.PackingTypeId,
                             PurchaseRate = I.PurchaseRate,
                             SalesRate = I.SalesRate,
                             CCCharge = I.CCCharge,
                             PurchaseDiscount = I.PurchaseDiscount,
                             IsVATApplicable = I.IsVATApplicable,
                             PurchaseVATPercentage = I.PurchaseVATPercentage,
                             SalesVATPercentage = I.SalesVATPercentage,
                             ABCCategory = I.ABCCategory,
                             VED = I.VED,
                             IsActive = I.IsActive,
                             RackNoDetails = rackDetails
                         })
              .OrderByDescending(a => a.ItemId)
              .ToList();
            return items;
        }
    }
}
