namespace DanpheEMR.Services.Admission.DTOs
{
    public class AdtBedFeatureSchemePriceCategoryMap_DTO
    {
        public int BedFeatureSchemePriceCategoryMapId { get; set; }
        public int BedFeatureId { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsActive { get; set; }
    }
}
