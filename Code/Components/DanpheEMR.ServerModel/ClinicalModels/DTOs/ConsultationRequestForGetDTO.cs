using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.DTOs
{
    public class ConsultationRequestForGetDTO
    {
        public int ConsultationRequestId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int WardId { get; set; }
        public string WardName { get; set; }
        public int BedId { get; set; }
        public DateTime RequestedOn { get; set; }
        public int RequestingConsultantId { get; set; }
        public string RequestingConsultantName { get; set; }
        public int RequestingDepartmentId { get; set; }
        public string RequestingDepartmentName { get; set; }
        public string PurposeOfConsultation { get; set; }
        public int ConsultingDoctorId { get; set; }
        public string ConsultingDoctorName { get; set; }
        public int ConsultingDepartmentId { get; set; }
        public string ConsultingDepartmentName { get; set; }
        public string ConsultantResponse { get; set; }
        public DateTime? ConsultedOn { get; set; }
        public string Status { get; set; }
        public bool IsActive { get; set; }


    }
}
