using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class BillingPackageModel
    {
        [Key]
        public int BillingPackageId { get; set; }
        public string BillingPackageName { get; set; }
        public string Description { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public string BillingItemsXML { get; set; }
        public string PackageCode { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool InsuranceApplicable { get; set; }
        public string   LabTypeName { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsEditable { get; set; }
    }
}
