using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPackageServiceItems_DTO
    {
        public int PackageServiceItemId { get; set; }
        public int BillingPackageId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal DiscountPercent { get; set; }
        public double Quantity { get; set; }
        public int? PerformerId { get; set; }
        public bool IsActive { get; set; }
    }
}
