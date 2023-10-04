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
        public int ServiceItemId { get; set; }
        public Nullable<int> BillItemPriceId { get; set; }
        public Nullable<double> PerformerPercent { get; set; } // Krishna, 20th,jun'22, AssignedToPercent changed to PerformerPercent.
        public Nullable<double> PrescriberPercent { get; set; } // Krishna, 20th,jun'22, ReferredByPercent changed to PrescriberPercent.
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

        public Nullable<double> ReferrerPercent { get; set; } // Krishna, 20th,jun'22, Added a new column ReferrerPercent.
    }
}
