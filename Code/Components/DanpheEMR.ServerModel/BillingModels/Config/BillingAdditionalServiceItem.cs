using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels.Config
{
    public class BillingAdditionalServiceItemModel
    {
        [Key]
        public int AdditionalServiceItemId { get; set; }
        public string GroupName { get; set; }
        public int ServiceItemId { get; set; }
        public int PriceCategoryId { get; set; }
        public string ItemName { get; set; }
        public bool UseItemSelfPrice { get; set; }
        public decimal PercentageOfParentItemForSameDept { get; set; }
        public decimal PercentageOfParentItemForDiffDept { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public bool IsPreAnaesthesia { get; set; }
        public bool WithPreAnaesthesia { get; set; }
        public bool IsOpServiceItem { get; set; }
        public bool IsIpServiceItem { get; set; }
        public bool HasChildServiceItems { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Remarks { get; set; }
    }
}
