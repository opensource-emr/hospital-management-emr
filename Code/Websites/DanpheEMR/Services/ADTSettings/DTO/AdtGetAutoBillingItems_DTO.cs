namespace DanpheEMR.Services.ADTSettings.DTO
{
    public class AdtGetAutoBillingItems_DTO
    {

        public int AdtAutoBillingItemId { get; set; }
        public string BedFeatureName { get; set; }
        public int BedFeatureId { get; set; }
        public string SchemeName { get; set; }
        public int SchemeId { get; set; }
        public string ItemName { get; set; }
        public int ServiceItemId { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public decimal PercentageOfBedCharges { get; set; }
        public bool UsePercentageOfBedCharges { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsActive { get; set; }
    }
}
