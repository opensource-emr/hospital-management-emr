using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class EmployeeBillItemsMap
    {
        [Key]
        public int EmployeeBillItemsMapId { get; set; }
        public int EmployeeId { get; set; }
        public int BillItemPriceId { get; set; }
        public Nullable<double> AssignedToPercent { get; set; }
        public Nullable<double> ReferredByPercent { get; set; }
        public int PriceCategoryId { get; set; }
        public Nullable<bool> HasGroupDistribution { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<DateTime> CreatedOn { get; set; } //when coming from client we may get null value, which we've to update from server side.
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<DateTime> ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public string BillingTypesApplicable { get; set; }

        [NotMapped]
        public List<ItemGroupDistribution> GroupDistribution { get; set; }
    }
}
