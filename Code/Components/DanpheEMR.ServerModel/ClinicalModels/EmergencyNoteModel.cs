using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels
{
    public class EmergencyNoteModel
    {
        [Key]
        public int EmergencyNoteId { get; set; }
        public int NotesId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string BroughtIn { get; set; }
        public string BroughtBy { get; set; }
        public string Relationship { get; set; }
        public string PhoneNumber { get; set; }
        public string ModeOfArrival { get; set; }
        public string ReferralDoctorOrHospital { get; set; }
        public TimeSpan? TriageTime { get; set; }
        public string TriagedBy { get; set; }
        public bool Trauma { get; set; }
        public string Disposition { get; set; }
        public int? DispositionDepartmentId { get; set; }
        public string ErCourseDescription { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        public string ICDSelected { get; set; }

    }
}
