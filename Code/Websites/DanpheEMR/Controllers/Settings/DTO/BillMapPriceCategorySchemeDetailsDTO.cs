namespace DanpheEMR.Controllers.Settings.DTO
{
    public class BillMapPriceCategorySchemeDetailsDTO
    {
        public int PriceCategorySchemeMapId { get; set; }
        public int SchemeId { get; set; }
        public string SchemeName { get; set; }
        public int PriceCategoryId { get; set; }
        public string PriceCategoryName { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
    }
}