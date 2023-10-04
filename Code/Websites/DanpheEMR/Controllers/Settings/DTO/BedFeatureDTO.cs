using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace DanpheEMR.Controllers.Settings.DTO
{
    public class BedFeature_DTO
    {
        public int BedFeatureId { get; set; }
        public string BedFeatureCode { get; set; }
        public string BedFeatureName { get; set; }
        public string BedFeatureFullName { get; set; }
        public double? BedPrice { get; set; }
        public bool IsActive { get; set; }
    }
}
