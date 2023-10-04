using DanpheEMR.Controllers.Nursing.DTOs;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Nursing.DTOs
{
    public class NursingOpdCheckOut_DTO
    {
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int PerformerId { get; set; }
        public int DepartmentId { get; set; }
        public string PerformerName { get; set; }
        public string DepartmentName { get; set; }
        public int FollowUpDay { get; set; }
        public string ConcludedNote { get; set; }

        public DateTime ConcludedDate { get; set; }
        public List<AddFinalDiagnosis_DTO> DiagnosisList { get; set; }
        public VisitModel Visit { get; set; }



    }
}
