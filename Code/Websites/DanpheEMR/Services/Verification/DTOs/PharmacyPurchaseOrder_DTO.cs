using System.Collections.Generic;
using System;

namespace DanpheEMR.Services.Verification.DTOs
{
    public class PharmacyPurchaseOrder_DTO
    {
        public int PurchaseOrderId { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; } 
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; } 
        public decimal VATAmount { get; set; }
        public bool IsCancel { get; set; }
        public List<PharmacyPurchaseOrderItem_DTO> PurchaseOrderItems { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public int MaxVerificationLevel { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public string VerificationStatus { get; set; }
        public bool IsVerificationAllowed { get; set; } 
        public bool IsModificationAllowed { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal CCChargeAmount { get; set; }
        public bool IsActive { get; set; } 
        public decimal TaxableAmount { get; set; }
        public decimal NonTaxableAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal CCChargeApplicableAmount { get; set; }
        public decimal CCChargePercentage { get; set; }
        public string VerificationRemarks { get; set; }
        public int? VerificationId { get; set; }
        public string TransactionType { get; set; }

    }
}

