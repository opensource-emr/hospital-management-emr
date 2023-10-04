
using System;

namespace DanpheEMR.Services.Pharmacy.DTOs.Provisional
{
    public class PHRMTransactionProvisionalItems_DTO
    {
        public int InvoiceItemId { get; set; }
        public int? InvoiceId { get; set; }
        public int? CompanyId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal SalePrice { get; set; }
        public decimal FreeQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public string BilItemStatus { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? PrescriptionItemId { get; set; }
        public int? CounterId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int PatientId { get; set; }
        public string VisitType { get; set; }
        public decimal TotalDisAmt { get; set; }
        public int StoreId { get; set; }
        public decimal VATAmount { get; set; }
        public int? PrescriberId { get; set; }
        public int PriceCategoryId { get; set; }
        public int? DischargeStatementId { get; set; }
        public int SchemeId { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
        public bool IsCopayment { get; set; }
        public int? PatientVisitId { get; set; }
        public int? ReceiptNo { get; set; }
        public int FiscalYearId { get; set; }
    }
}
