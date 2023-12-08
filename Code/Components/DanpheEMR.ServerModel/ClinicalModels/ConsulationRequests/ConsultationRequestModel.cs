using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.ConsulationRequests
{
    public class ConsultationRequestModel
    {
        [Key]
        public int ConsultationRequestId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int? WardId { get; set; }
        public int? BedId { get; set; }
        public DateTime RequestedOn { get; set; }
        public int RequestingConsultantId { get; set; }
        public int RequestingDepartmentId { get; set; }
        public string PurposeOfConsultation { get; set; }
        public int ConsultingDoctorId { get; set; }
        public int ConsultingDepartmentId { get; set; }
        public string ConsultantResponse { get; set; }
        public DateTime? ConsultedOn { get; set; }
        public string Status { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
