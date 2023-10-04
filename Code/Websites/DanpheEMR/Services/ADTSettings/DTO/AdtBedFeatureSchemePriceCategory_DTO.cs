using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.Services.ADTSettings.DTO
{
    public class AdtBedFeatureSchemePriceCategory_DTO
    {
        public int BedFeatureSchemePriceCategoryMapId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsActive { get; set; }
    }
}
