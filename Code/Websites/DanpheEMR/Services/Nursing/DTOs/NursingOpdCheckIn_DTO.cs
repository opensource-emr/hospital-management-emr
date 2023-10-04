using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.ClinicalModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Nursing.DTOs
{
    public class NursingOpdCheckIn_DTO
    {
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int? PerformerId { get; set; }
        public string PerformerName { get; set; }

        public List<AddFinalDiagnosis_DTO> DiagnosisList { get; set; }

        public List<AddChiefComplaint_DTO> ChiefComplaints { get; set; }


    }
}
