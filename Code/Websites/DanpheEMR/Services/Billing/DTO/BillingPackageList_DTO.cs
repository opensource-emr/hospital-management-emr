using System.Collections.Generic;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPackageList_DTO
    {
        public int BillingPackageId { get; set; }
        public string BillingPackageName { get; set; }
        public string Description { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public string PackageCode { get; set; }
        public bool IsActive { get; set; }
        public string LabTypeName { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public string PriceCategoryName { get; set; }
        public bool IsEditable { get; set; }
    }
}
