using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MasterModels.ICDEmergencyGroup
{
    public class ICDEmergencyDiseaseGroupModel
    {
        
            [Key]
            public int EMER_DiseaseGroupId { get; set; }
            public int SerialNumber { get; set; }
            public int EMER_ReportingGroupId { get; set; }
            public string ICDCode { get; set; }
            public string EMER_DiseaseGroupName { get; set; }
            public int CreatedBy { get; set; }
            public DateTime CreatedOn { get; set; }
           public bool IsActive { get; set; }
           public string IcdVersion { get; set; }
    }
}
