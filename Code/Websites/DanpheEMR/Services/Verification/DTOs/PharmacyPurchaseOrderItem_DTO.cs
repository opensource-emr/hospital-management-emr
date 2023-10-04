using System;

namespace DanpheEMR.Services.Verification.DTOs
{
    public class PharmacyPurchaseOrderItem_DTO
    {
        public int PurchaseOrderItemId { get; set; }
        public int PurchaseOrderId { get; set; }
        public double Quantity { get; set; }
        public decimal StandardRate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remark { get; set; }
        public string POItemStatus { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public bool IsActive { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public decimal FreeQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal CCChargePercentage { get; set; }
        public decimal CCChargeAmount { get; set; }
        public bool? IsCancel { get; set; }

    }
}

