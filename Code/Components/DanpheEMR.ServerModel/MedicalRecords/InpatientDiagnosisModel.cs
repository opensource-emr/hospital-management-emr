using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InpatientDiagnosisModel
    {
        [Key]
        public int DiagnosisId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int MedicalRecordId { get; set; }
        public int ICD10ID { get; set; }
        public string ICD10Code { get; set; }
        public string ICD10Name { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}


