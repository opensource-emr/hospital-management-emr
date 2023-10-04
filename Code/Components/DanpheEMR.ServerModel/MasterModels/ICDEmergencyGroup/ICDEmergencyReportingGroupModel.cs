using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MasterModels.ICDEmergencyGroup
{
    public class ICDEmergencyReportingGroupModel
    {
        [Key]
        public int EMER_ReportingGroupId { get; set; }
        public int SerialNumber { get; set; }
        public string EMER_ReportingGroupName { get; set; }    
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public string GroupCode { get; set; }
        public string IcdVersion { get; set; }
    }
}
