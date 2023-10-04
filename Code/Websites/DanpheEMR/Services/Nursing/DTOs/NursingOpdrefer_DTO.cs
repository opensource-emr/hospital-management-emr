using DanpheEMR.Controllers.Nursing.DTOs;
using System.Collections.Generic;

namespace DanpheEMR.Services.Nursing.DTOs
{
    public class NursingOpdrefer_DTO
    {
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int ReferredDoctorId { get; set; }
        public int ReferreddepartmentId { get; set; }

        public string VisitType { get; set; }
        public string VisitStatus { get; set; }
        public string BillingStatus { get; set; }

        public string AppointmentType { get; set; }
        public string ReferredDepartment { get; set; }
        public string ReferredDoctor { get; set; }
        public string ReferRemarks { get; set; }
        public List<AddFinalDiagnosis_DTO> DiagnosisList { get; set; }

    }
}
