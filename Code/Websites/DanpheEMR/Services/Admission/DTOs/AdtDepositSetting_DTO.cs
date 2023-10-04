namespace DanpheEMR.Services.Admission.DTOs
{
    public class AdtDepositSetting_DTO
    {
        public int AdtDepositSettingId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int DepositHeadId { get; set; }
        public decimal MinimumDepositAmount { get; set; }
        public bool IsOnlyMinimumDeposit { get; set; }
        public bool IsActive { get; set; }
    }
}
