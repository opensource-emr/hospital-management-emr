using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class EmployeeIncentiveInfo
    {
        [Key]
        public int EmployeeIncentiveInfoId { get; set; }
        public int EmployeeId { get; set; }
        public Nullable<double> TDSPercent { get; set; }
        public int CreatedBy { get; set; }
        public Nullable<DateTime> CreatedOn { get; set; } //when coming from client we may get null value, which we've to update from server side.
        public bool IsActive { get; set; }
        [NotMapped]
        public List<EmployeeBillItemsMap> EmployeeBillItemsMap { get; set; }


    }
}
