using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.HelpdeskModels
{//For Employee Information 
    public class EmployeeInfoModel
    {
        //NOTE: REMOVE THIS MODEL altogether and create dynamic reports for helpdesk
        [Key]
        public string EmployeeName { get; set; }
        public string Designation { get; set; }
        public string DepartmentName { get; set; }
        public string ContactNumber { get; set; }
        public Int16? Extension { get; set; }
        public Int16? SpeedDial { get; set; }
        public string OfficeHour { get; set; }
        public string RoomNumber { get; set; }//added:sud-16aug--
    }
}
