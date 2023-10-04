using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.PharmacyModels.Provisional
{
    public class PHRMTransactionProvisionalReturnItemsModel
    {
        [Key]
        public int ProvisionalReturnItemId { get; set; }
        public int InvoiceItemId { get; set; }
        public int ReferenceProvisionalReceiptNo { get; set; }
        public int CancellationReceiptNo { get; set; }
        public int FiscalYearId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public string VisitType { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal SalePrice { get; set; }
        public decimal Quantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int? PrescriberId { get; set; }
        public int CounterId { get; set; }
        public string Remarks { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int StoreId { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
    }
}
