using System;
namespace DanpheEMR.ServerModel.BillingModels.DischargeModel
{
    public class PharmacyPendingBillItem
    {
        public int InvoiceItemId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal Price { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal TotalDisAmount { get; set; }
        public DateTime CreatedOn { get; set; }
        public string User { get; set; }
        public int StoreId { get; set; }
        public int CounterId { get; set; }
        public int? PrescriberId { get; set; }
        public int? PriceCategoryId { get; set; }
        public int? PatientVisitId { get; set; }
    }
}
