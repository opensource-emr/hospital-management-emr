using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    [Serializable]
    public class PatientStudyModel
    {
        [Key]
        public int PatientStudyId { get; set; }
        //public int TenantId { get; set; }
        //public string TenantName { get; set; }
        public string PatientId { get; set; }
        public string PatientName { get; set; }
        public string StudyInstanceUID { get; set; }
        public string SOPClassUID { get; set; }
        public DateTime? StudyDate { get; set; }
        public string Modality { get; set; }
        public string StudyDescription { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsMapped { get; set; }
        //add all required properties of DCM_PatientStudy
        //add [Key] attribute to Primary key and also add ForeignKey if required.

    }
}
