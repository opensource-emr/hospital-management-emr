using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MedicalRecords
{
    public class EmergencyFinalDiagnosisModel
    {
        [Key]
        public int FinalDiagnosisId { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int EMER_DiseaseGroupId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsPatientReferred { get; set; }
        public string ReferredBy { get; set; }
        public string ReferredTo { get; set; }
     

    }

}
