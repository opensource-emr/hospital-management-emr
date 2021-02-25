using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DeathDetailsModel
    {
        [Key]
        public int DeathId { get; set; }
        public DateTime DeathDate { get; set; }
        public TimeSpan DeathTime { get; set; }
        public string CertificateNumber { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int? MedicalRecordId { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public int? CertifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public bool IsActive { get; set; }


        public string FatherName { get; set; }
        public string MotherName { get; set; }
        public string SpouseOf { get; set; }
        public string VisitCode { get; set; }
        public string CauseOfDeath { get; set; }        
        public string Age { get; set; }
        public string FiscalYear { get; set; }
        public int PrintCount { get; set; }
        public int? PrintedBy { get; set; }
        public DateTime? PrintedOn { get; set; }
        [NotMapped]
        public string ShortName { get; set; }
    }
}
