using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.AdmissionModels.Config
{
    public class AdtAutoBillingItemModel
    {
        [Key]
        public int AdtAutoBillingItemId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public decimal PercentageOfBedCharges { get; set; }
        public bool UsePercentageOfBedCharges { get; set; }
        public bool IsRepeatable { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
