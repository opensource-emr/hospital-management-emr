using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PatientCertificateModel
    {
        [Key]
       public int CertificateId { get; set; }
       public string FiscalYearName { get; set; }
       public DateTime CreatedOn { get; set; }
        public int CreatedBy  { get; set; } 
        public string CertificateNumber { get; set; }
        public int? DischargeSummaryId { get; set; }
       public string CertificateType { get; set; }
      public string IssuedBySignatories { get; set; }
        public string CertifiedBySignatories { get; set; }
        public string BirthType { get; set; }
        public DateTime? DeathDate { get; set; }
        public TimeSpan? DeathTime { get; set; }
        public string DeathCause { get; set; }
        public string FatherName { get; set; }
        public string MotherName { get; set; }
        public string Spouse { get; set; }

        [NotMapped]
        public int BabyBirthDetailsId { get; set; }

    }
}
