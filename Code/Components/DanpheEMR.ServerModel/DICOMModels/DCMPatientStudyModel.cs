using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DCMPatientStudyModel
    {
        [Key]
        public int PatientStudyId { get; set; }     
        public string PatientId { get; set; }
        public string PatientName { get; set; }
        public string StudyInstanceUID { get; set; }
        public string SOPClassUID { get; set; }
        public string Modality { get; set; }
        public string StudyDescription { get; set; }
        public DateTime? StudyDate { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
