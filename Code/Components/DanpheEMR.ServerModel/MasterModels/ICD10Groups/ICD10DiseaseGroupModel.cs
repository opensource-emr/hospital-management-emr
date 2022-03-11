using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ICD10DiseaseGroupModel
    {
        [Key]
        public int DiseaseGroupId { get; set; }
        public int SerialNumber { get; set; }
        public int ReportingGroupId { get; set; }
        public string ICDCode { get; set; }
        public string DiseaseGroupName { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
