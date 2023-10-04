using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.EmergencyModels
{
    public class EmergencyDischargeSummaryModel
    {
        [Key]
        public int ERDischargeSummaryId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string DischargeType { get; set; }
        public string ChiefComplaints { get; set; }
        public string TreatmentInER { get; set; }
        public string Investigations { get; set; }
        public string AdviceOnDischarge { get; set; }
        public string OnExamination { get; set; }
        public string ProvisionalDiagnosis { get; set; }
        public string DoctorName { get; set; }
        public string MedicalOfficer { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        
    }
}
