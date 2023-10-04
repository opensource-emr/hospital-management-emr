namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPackageServiceItemList_DTO
    {
        public int PackageServiceItemId { get; set; }
        public int BillingPackageId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal DiscountPercent { get; set; }
        public double Quantity { get; set; }
        public int? PerformerId { get; set; }
        public bool IsActive { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public decimal Price { get; set; }
        public string PerformerName { get; set; }
    }
}
