using System;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class PHRMPurchaseOrderForGoodReceiptVM
    {
        public int PurchaseOrderId { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public int? PurchaseOrderNo { get; set; }
        public string ReferenceNo { get; set; }
        public string POStatus { get; set; }
        public DateTime? PODate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal CCChargeAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int DeliveryDays { get; set; }
        public string Remarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public decimal? TaxableAmount { get; set; }
        public decimal? NonTaxableAmount { get; set; }
        public decimal? Adjustment { get; set; }
        public int FiscalYearId { get; set; }
    }
}
