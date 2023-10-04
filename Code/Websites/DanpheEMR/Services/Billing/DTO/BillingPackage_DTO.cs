using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPackage_DTO
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
        public bool IsEditable { get; set; }
        public List<BillingPackageServiceItems_DTO> BillingPackageServiceItemList{ get; set; }

    }
}
