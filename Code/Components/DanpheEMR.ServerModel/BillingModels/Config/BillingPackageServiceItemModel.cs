using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels.Config
{
    public class BillingPackageServiceItemModel
    {
        [Key]
        public int PackageServiceItemId { get; set; }
        public int BillingPackageId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal DiscountPercent { get; set; }
        public double Quantity { get; set; }
        public int? PerformerId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
