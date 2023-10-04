using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SchedulingModels
{
    public class EmpSchedules
    {
        [Key]
        public int EmployeeSCHId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime? Date { get; set; }
        public string DayName { get; set; }
        public Boolean? IsWorkingDay { get; set; }
        public Boolean? IsPresent { get; set; }

        [NotMapped]
        public string TxnType { get; set; }
    }
}
