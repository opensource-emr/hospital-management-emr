namespace DanpheEMR.Services.ADTSettings.DTO
{
    public class AdtMinimumDepositSetting_DTO
    {
        public int AdtDepositSettingId { get; set; }
        public int BedFeatureId { get; set; }
        public string BedFeatureName { get; set; }
        public int SchemeId { get; set; }
        public string SchemeName { get; set; }
        public string DepositHeadName { get; set; }
        public int DepositHeadId { get; set; }
        public decimal MinimumDepositAmount { get; set; }
        public bool IsOnlyMinimumDeposit { get; set; }
        public bool IsActive { get; set; }
    }
}
