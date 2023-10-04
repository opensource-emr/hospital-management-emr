namespace DanpheEMR.Services.Admission.DTOs
{
    public class AdtAutoBillingItem_DTO
    {
        public int AdtAutoBillingItemId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public decimal Price { get; set; }
        public decimal PercentageOfBedCharges { get; set; }
        public bool UsePercentageOfBedCharges { get; set; }
        public bool IsRepeatable { get; set; }
        public int PriceCategoryId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public bool IsTaxApplicable { get; set; }
        public bool IsDiscountApplicable { get; set; }
        public decimal DiscountPercent { get; set; }
        public bool IsPriceChangeAllowed { get; set; }
        public bool IsZeroPriceAllowed { get; set; }
        public bool HasAdditionalBillingItems { get; set; }
        public bool IsDoctorMandatory { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPayCashPercent { get; set; }
        public decimal CoPayCreditPercent { get; set; }
        public int IntegrationItemId { get; set; }
        public string IntegrationName { get; set; }
        public bool IsActive { get; set; }
    }
}

