using System;

namespace DanpheEMR.ViewModel.Dispensary
{
    public class ProvisionalSaleDetailVm
    {
        public int InvoiceItemId { get; set; }
        public int StoreId { get; set; }
        public int? PatientId { get; set; }
        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public string BatchNo { get; set; }
        public double? Quantity { get; set; }
        public decimal? Price { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal? TotalAmount { get; set; }
        public string BilItemStatus { get; set; }
        public string Remark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CounterId { get; set; }
        public string VisitType { get; set; }
        public decimal? TotalDisAmt { get; set; }
        public decimal? PerItemDisAmt { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string WardUser { get; set; }
        public string WardName { get; set; }
        public int StockId { get; set; }
        //public int? ProviderId { get; set; }
        public int? PrescriberId { get; set; }
        public string RackNo { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
        public bool IsCoPayment { get; set; }
        public string DefaultPaymentMode { get; set; }
        public int? DefaultCreditOrganizationId { get; set; }
        public int SchemeId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? PriceCategoryId { get; set; }
        public int? ReceiptNo { get; set; }
    }
}
