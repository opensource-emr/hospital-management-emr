using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ADTBedReservation
    {
        [Key]
        public int ReservedBedInfoId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public int RequestingDepartmentId { get; set; }
        public int AdmittingDoctorId { get; set; }
        public int WardId { get; set; }
        public int BedFeatureId { get; set; }
        public int BedId { get; set; }
        public DateTime AdmissionStartsOn { get; set; }
        public string AdmissionNotes { get; set; }
        public DateTime? ReservedOn { get; set; }
        public int? ReservedBy { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public bool IsActive { get; set; }
        public bool? IsAutoCancelled { get; set; }
        public DateTime? AutoCancelledOn { get; set; }
    }
}
