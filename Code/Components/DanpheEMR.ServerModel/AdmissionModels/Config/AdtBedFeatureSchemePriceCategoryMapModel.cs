using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.AdmissionModels.Config
{
    public class AdtBedFeatureSchemePriceCategoryMapModel
    {
        [Key]
        public int BedFeatureSchemePriceCategoryMapId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
