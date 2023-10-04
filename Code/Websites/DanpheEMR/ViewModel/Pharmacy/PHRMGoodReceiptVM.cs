using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class PHRMGoodReceiptVM
    {
        public int? SupplierId { get; set; }
        public string CreditNoteId { get; set; }
        public string InvoiceNo { get; set; }
        public DateTime? GoodReceiptDate { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? GoodReceiptId { get; set; }
        public int? CreditPeriod { get; set; }
        public string SupplierName { get; set; }
        public int? GoodReceiptPrintId { get; set; }
        public string GoodReceiptType { get; set; }
        public string ContactNo { get; set; }
    }

    public class PHRMSupplierGoodReceiptVM
    {
        public int? SupplierId { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public DateTime? GoodReceiptDate { get; set; }
        public bool? IsCancel { get; set; }
        public string SupplierName { get; set; }
        public decimal? CCAmount { get; set; }
    }
}
