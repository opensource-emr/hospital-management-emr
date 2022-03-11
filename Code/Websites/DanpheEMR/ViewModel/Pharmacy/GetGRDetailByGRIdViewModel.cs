using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetGRDetailByGRIdViewModel
    {
        public GetGRDetailsByGRIdDTO goodReceipt { get; set; }
    }
    public static class GetGRDetailsByGRIdFunc
    {
        public static GetGRDetailByGRIdViewModel GetGRDetailByGRId(this PharmacyDbContext db, int goodsReceiptId, bool isGRCancelled)
        {
            var goodreceipt = (from gr in db.PHRMGoodsReceipt.Where(gr => gr.GoodReceiptId == goodsReceiptId)
                               from supplier in db.PHRMSupplier.Where(s => s.SupplierId == gr.SupplierId)
                               from fy in db.PharmacyFiscalYears.Where(fy => fy.FiscalYearId == gr.FiscalYearId)
                               from rbacUser in db.Users.Where(u => u.EmployeeId == gr.CreatedBy)
                               from cancelByuser in db.Employees.Where(u => u.EmployeeId == gr.CancelBy).DefaultIfEmpty()
                               select new GetGRDetailsByGRIdDTO
                               {
                                   FiscalYearFormatted = fy.FiscalYearName,
                                   GoodReceiptPrintId = gr.GoodReceiptPrintId,
                                   SupplierName = supplier.SupplierName,
                                   ContactNo = supplier.ContactNo,
                                   PurchaseOrderId = gr.PurchaseOrderId,
                                   Pin = supplier.PANNumber,
                                   SupplierBillDate = gr.SupplierBillDate,
                                   GoodReceiptDate = gr.GoodReceiptDate,
                                   InvoiceNo = gr.InvoiceNo,
                                   SubTotal = gr.SubTotal,
                                   DiscountAmount = gr.DiscountAmount,
                                   VATAmount = gr.VATAmount,
                                   TotalAmount = gr.TotalAmount,
                                   UserName = rbacUser.UserName,
                                   CreatedOn = gr.CreatedOn,
                                   IsCancel = gr.IsCancel,
                                   Remarks = gr.Remarks,
                                   CancelRemarks = gr.CancelRemarks,
                                   CancelledBy = (cancelByuser != null) ? cancelByuser.FullName : "",
                                   CancelledOn = gr.CancelOn,
                                   PaymentMode = gr.TransactionType,
                                   CreditPeriod = gr.CreditPeriod
                               })
                               .FirstOrDefault();

            goodreceipt.GoodsReceiptItems = (from gri in db.PHRMGoodsReceiptItems
                                             join item in db.PHRMItemMaster on gri.ItemId equals item.ItemId
                                             join generic in db.PHRMGenericModel on item.GenericId equals generic.GenericId
                                             join uom in db.PHRMUnitOfMeasurement on item.UOMId equals uom.UOMId
                                             join packing in db.PHRMPackingType on gri.PackingTypeId equals packing.PackingTypeId into packingJ
                                             from packingLJ in packingJ.DefaultIfEmpty()
                                             join stock in db.StockMasters on gri.StockId equals stock.StockId
                                             join barcode in db.StockBarcodes on stock.BarcodeId equals barcode.BarcodeId into barcodeG
                                             from barcodeLJ in barcodeG.DefaultIfEmpty()
                                             where gri.GoodReceiptId == goodsReceiptId
                                             select new GetGRDetailsByGRIdItemDTO
                                             {
                                                 GenericName = generic.GenericName,
                                                 ItemName = gri.ItemName,
                                                 UOMName = uom.UOMName,
                                                 StockId = gri.StockId,
                                                 StoreStockId = gri.StoreStockId,
                                                 BatchNo = gri.BatchNo,
                                                 MRP = gri.MRP,
                                                 ExpiryDate = gri.ExpiryDate,
                                                 CompanyName = gri.CompanyName,
                                                 ReceivedQuantity = (int)gri.ReceivedQuantity,
                                                 FreeQuantity = (int)gri.FreeQuantity,
                                                 RejectedQuantity = (int)gri.RejectedQuantity,
                                                 StripRate = gri.StripRate,
                                                 SellingPrice = gri.SellingPrice,
                                                 GRItemPrice = gri.GRItemPrice,
                                                 CCCharge = (int)gri.CCCharge,
                                                 SubTotal = gri.SubTotal,
                                                 GrPerItemVATAmt = gri.GrPerItemVATAmt,
                                                 VATAmt = gri.GrPerItemVATAmt,
                                                 GrTotalDisAmt = gri.GrTotalDisAmt,
                                                 TotalAmount = gri.TotalAmount,
                                                 PackingName = packingLJ.PackingName,
                                                 PackingQuantity = gri.PackingQty,
                                                 StripMRP = gri.StripMRP,
                                                 BarcodeNumber = barcodeLJ == null ? null : (int?)barcodeLJ.BarcodeId,
                                                 IsCancel = gri.IsCancel
                                             }).Where(p => isGRCancelled == true || (isGRCancelled == false && p.IsCancel == false))
                                             .ToList();
            return new GetGRDetailByGRIdViewModel() { goodReceipt = goodreceipt };
        }
    }
    public class GetGRDetailsByGRIdItemDTO
    {
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string CompanyName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int ReceivedQuantity { get; set; }
        public int FreeQuantity { get; set; }
        public int RejectedQuantity { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal GRItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal MRP { get; set; }
        public decimal? CCCharge { get; set; }
        public decimal? GrTotalDisAmt { get; set; }
        public decimal? GrPerItemVATAmt { get; set; }
        public decimal? VATAmt { get; set; }
        public decimal? StripRate { get; set; }
        public int StoreStockId { get; set; }
        public int StockId { get; set; }
        public string GenericName { get; set; }
        public string PackingName { get; set; }
        public double? PackingQuantity { get; set; }
        public decimal? StripMRP { get; set; }
        public bool? IsCancel { get; set; }
        public int? BarcodeNumber { get; set; }
    }
    public class GetGRDetailsByGRIdDTO
    {

        public string FiscalYearFormatted { get; set; }
        public string CurrentFiscalYear { get; set; }
        public int? PurchaseOrderId { get; set; }
        public DateTime? SupplierBillDate { get; set; }
        public int? GoodReceiptPrintId { get; set; }
        public string SupplierName { get; set; }
        public string ContactNo { get; set; }
        public DateTime? GoodReceiptDate { get; set; }
        public string InvoiceNo { get; set; }
        public string Pin { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string UserName { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsCancel { get; set; }
        public string Remarks { get; set; }
        public IList<GetGRDetailsByGRIdItemDTO> GoodsReceiptItems { get; set; }
        public string CancelRemarks { get; set; }
        public string CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string PaymentMode { get; set; }
        public int? CreditPeriod { get; set; }
    }
}
