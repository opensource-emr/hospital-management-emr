using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SchedulingModels
{
    public class EmpDayWiseAvailability
    {
        [Key]
        public int EmployeeId { get; set; }
        public int DayId { get; set; }
        public string DayName { get; set; }
        public Boolean? IsWorking { get; set; }
    }
}
