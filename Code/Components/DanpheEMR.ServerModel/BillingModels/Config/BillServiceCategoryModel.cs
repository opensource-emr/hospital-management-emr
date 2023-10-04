using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class BillServiceCategoryModel
    {
        [Key]
        public int ServiceCategoryId { get; set; }
        public string ServiceCategoryCode { get; set; }
        public string ServiceCategoryName { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
