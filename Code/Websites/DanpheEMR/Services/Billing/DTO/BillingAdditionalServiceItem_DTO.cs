using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingAdditionalServiceItem_DTO
    {
        public int AdditionalServiceItemId { get; set; }
        public string GroupName { get; set; }
        public int ServiceItemId { get; set; }
        public int PriceCategoryId { get; set; }
        public string ItemName { get; set; }
        public bool UseItemSelfPrice { get; set; }
        public decimal PercentageOfParentItemForSameDept { get; set; }
        public decimal PercentageOfParentItemForDiffDept { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public bool IsPreAnaesthesia { get; set; }
        public bool WithPreAnaesthesia { get; set; }
        public bool IsOpServiceItem { get; set; }
        public bool IsIpServiceItem { get; set; }
        public bool HasChildServiceItems { get; set; }
        public bool IsActive { get; set; }
        public bool IsMasterServiceItemActive { get; set; }
        public string LegalName { get; set; }
        public decimal Price { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public bool IsDiscountApplicable { get; set; }
        public bool IsTaxApplicable { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public string ItemCode { get; set; }
    }
}
