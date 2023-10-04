using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.AdmissionModels.Config
{
    public class AdtDepositSettingsModel
    {
        [Key]
        public int AdtDepositSettingId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int DepositHeadId { get; set; }
        public decimal MinimumDepositAmount { get; set; }
        public bool IsOnlyMinimumDeposit { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
