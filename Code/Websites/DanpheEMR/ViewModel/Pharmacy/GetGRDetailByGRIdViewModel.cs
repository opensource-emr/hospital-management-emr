using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetGRDetailByGRIdViewModel
    {
        public GetGRDetailsByGRIdDTO goodReceipt { get; set; }
    }
    public static class GetGRDetailsByGRIdFunc
    {
        public static async Task<GetGRDetailByGRIdViewModel> GetGRDetailByGRIdAsync(this PharmacyDbContext db, int goodsReceiptId)
        {
            var goodreceipt = await (from gr in db.PHRMGoodsReceipt.Where(gr => gr.GoodReceiptId == goodsReceiptId)
                                     from supplier in db.PHRMSupplier.Where(s => s.SupplierId == gr.SupplierId)
                                     from fy in db.BillingFiscalYear.Where(fy => fy.FiscalYearId == gr.FiscalYearId)
                                     from rbacUser in db.Users.Where(u => u.EmployeeId == gr.CreatedBy)
                                     from cancelByUser in db.Employees.Where(u => u.EmployeeId == gr.CancelledBy).DefaultIfEmpty()
                                     select new GetGRDetailsByGRIdDTO
                                     {
                                         FiscalYearFormatted = fy.FiscalYearFormatted,
                                         GoodReceiptPrintId = gr.GoodReceiptPrintId,
                                         SupplierName = supplier.SupplierName,
                                         ContactNo = supplier.ContactNo,
                                         Pin = supplier.Pin,
                                         GoodReceiptDate = gr.GoodReceiptDate,
                                         InvoiceNo = gr.InvoiceNo,
                                         SubTotal = gr.SubTotal,
                                         DiscountAmount = gr.DiscountAmount,
                                         VATAmount = gr.VATAmount,
                                         TotalAmount = gr.TotalAmount,
                                         UserName = rbacUser.UserName,
                                         CreatedOn = gr.CreatedOn,
                                         IsCancel = gr.IsCancel,
                                         CancelledByName = (cancelByUser != null) ? cancelByUser.FullName : "",
                                         CancelledOn = gr.CancelledOn,
                                         CancelRemarks = gr.CancelRemarks
                                     }).FirstOrDefaultAsync();
            goodreceipt.GoodsReceiptItems = await (from gri in db.PHRMGoodsReceiptItems.Where(gri => gri.GoodReceiptId == goodsReceiptId)
                                                   select new GetGRDetailsByGRIdItemDTO
                                                   {
                                                       ItemName = gri.ItemName,
                                                       BatchNo = gri.BatchNo,
                                                       MRP = gri.MRP,
                                                       ExpiryDate = gri.ExpiryDate,
                                                       CompanyName = gri.CompanyName,
                                                       ReceivedQuantity = gri.ReceivedQuantity,
                                                       FreeQuantity = gri.FreeQuantity,
                                                       RejectedQuantity = gri.RejectedQuantity,
                                                       StripRate = gri.StripRate,
                                                       SellingPrice = gri.SellingPrice,
                                                       GRItemPrice = gri.GRItemPrice,
                                                       CCCharge = gri.CCCharge,
                                                       SubTotal = gri.SubTotal,
                                                       GrTotalDisAmt = gri.GrTotalDisAmt,
                                                       TotalAmount = gri.TotalAmount,
                                                       PackingTypeId = gri.PackingTypeId,
                                                       PackingName = (from pack in db.PHRMPackingType.Where(a => a.PackingTypeId == gri.PackingTypeId) select pack.PackingName ).FirstOrDefault(),
                                                   }).ToListAsync();
            return new GetGRDetailByGRIdViewModel() { goodReceipt = goodreceipt };
        }
    }
    public class GetGRDetailsByGRIdItemDTO
    {
        public string ItemName { get; set; }
        public string CompanyName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public double ReceivedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal GRItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public double VATPercentage { get; set; }
        public double DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal MRP { get; set; }
        public double? CCCharge { get; set; }
        public decimal? GrTotalDisAmt { get; set; }
        public decimal? StripRate { get; set; }
        public int? PackingTypeId { get; set; }

        public string PackingName { get; set; }
    }
    public class GetGRDetailsByGRIdDTO
    {
        public string FiscalYearFormatted { get; set; }
        public string CurrentFiscalYear { get; set; }
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
        public IList<GetGRDetailsByGRIdItemDTO> GoodsReceiptItems { get; set; }
        public string CancelRemarks { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelledByName { get;set; }
    }
}
