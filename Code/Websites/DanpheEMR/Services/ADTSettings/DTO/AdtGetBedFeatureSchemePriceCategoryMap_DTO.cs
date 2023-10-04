using DanpheEMR.ServerModel;

namespace DanpheEMR.Services.ADTSettings.DTO
{
    public class AdtGetBedFeatureSchemePriceCategoryMap_DTO
    {
        public int BedFeatureSchemePriceCategoryMapId {get; set;}
        public string BedFeatureName {get; set;}
        public int BedFeatureId {get; set;}
        public int SchemeId {get; set;}
        public string SchemeName {get; set;}
        public int PriceCategoryId {get; set;}
        public string PriceCategoryName {get; set;}
        public bool IsActive { get; set; }

    }
}
