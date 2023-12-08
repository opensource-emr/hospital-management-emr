namespace DanpheEMR.Services.DepartmentSettings.DTOs
{
    public class OPDServiceItemDTO
    {
        public int ServiceItemId { get; set; }
        public string ServiceItemName { get; set; }
        public string ItemCode { get; set; }
        public string IntegrationName { get; set; }
        public int ServiceDepartmentId { get; set; }
        public bool IsActive { get; set; }
        public decimal Price { get; set; }
    }
}
