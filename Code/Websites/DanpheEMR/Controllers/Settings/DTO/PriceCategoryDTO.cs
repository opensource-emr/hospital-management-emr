namespace DanpheEMR.Controllers.Settings.DTO
{
    public class PriceCategoryDTO
    {
        public int PriceCategoryId { get; set; }
        public string PriceCategoryCode { get; set; }
        public string PriceCategoryName { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public bool ShowInRegistration { get; set; }
        public bool ShowInAdmission { get; set; }
    }
}
