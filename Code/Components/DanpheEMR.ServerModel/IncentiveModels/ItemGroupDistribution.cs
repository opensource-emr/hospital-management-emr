using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class ItemGroupDistribution
    {
        [Key]
        public int ItemGroupDistributionId { get; set; }
        public string IncentiveType { get; set; }
        public int BillItemPriceId { get; set; }
        public int EmployeeBillItemsMapId { get; set; }
        public int FromEmployeeId { get; set; }
        public int DistributeToEmployeeId { get; set; }
        public Nullable<double> DistributionPercent { get; set; }
        public Nullable<double> FixedDistributionAmount { get; set; }
        public Nullable<bool> IsFixedAmount { get; set; }

        public Nullable<int> DisplaySeq { get; set; }
        public string Remarks { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<DateTime> CreatedOn { get; set; } //when coming from client we may get null value, which we've to update from server side.
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<DateTime> ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
