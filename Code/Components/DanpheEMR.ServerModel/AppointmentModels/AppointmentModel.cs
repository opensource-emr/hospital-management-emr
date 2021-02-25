using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class AppointmentModel
    {
        [Key]
        public int AppointmentId { get; set; }
        public int? PatientId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public string Age { get; set; }
        public string ContactNumber { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public string AppointmentType { get; set; }
        public string AppointmentStatus { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        //according to the task no 152 in tfs
        public string Reason { get; set; }
        public DateTime? CancelledOn { get; set; }
        public int? CancelledBy { get; set; }
        public string CancelledRemarks { get; set; }
        public int? DepartmentId { get; set; }
    }
}
