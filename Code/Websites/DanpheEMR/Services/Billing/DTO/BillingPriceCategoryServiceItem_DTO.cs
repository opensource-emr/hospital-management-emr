namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPriceCategoryServiceItem_DTO
    {
        public int ServiceItemId { get; set; }
        public decimal Price { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ItemName { get; set; }
        public int? IntegrationItemId { get; set; }
        public string ItemCode { get; set; }
        public int PriceCategoryId { get; set; }

    }
}
