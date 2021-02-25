using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VisitModel
    {
        [Key]
        public int PatientVisitId { get; set; }
        public string VisitCode { get; set; } //H followed by 6 digits for InPatient and V for outPatient
        public int PatientId { get; set; }
        public DateTime VisitDate { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public string Comments { get; set; }
        public string ReferredByProvider { get; set; }
        public string VisitType { get; set; }
        public string VisitStatus { get; set; }
        //public DateTime? VisitTime { get; set; }
        public TimeSpan? VisitTime { get; set; }
        public int? VisitDuration { get; set; }
        public int? AppointmentId { get; set; }
        public string BillingStatus { get; set; }
        public int? ReferredByProviderId { get; set; }
        public string AppointmentType { get; set; }
        public int? ParentVisitId { get; set; }
        public bool? IsVisitContinued { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsTriaged { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public string Remarks { get; set; }
        public string ClaimCode { get; set; }
        public bool? IsSignedVisitSummary { get; set; }
        //added: ashim:22Aug2018: To handle transfer visit case.
        public int? TransferredProviderId { get; set; }
        //added: ajay: to handle visit concluded
        public DateTime? ConcludeDate { get; set; }
        //used while adding billing transaction for transfer and referral
        [NotMapped]
        public int? CurrentCounterId { get; set; }

        public int? DepartmentId { get; set; }//sud:19June2019-For DepartmentLevel Appointment.
        public DepartmentModel Department { get; set; }
        [NotMapped]
        public string DepartmentName { get; set; }//Yubaraj:21Jun'19--Needed to show Deptname in List visit page.

        public virtual PatientModel Patient { get; set; }
        public virtual AdmissionModel Admission { get; set; }
        //Clinical
        public List<VitalsModel> Vitals { get; set; }
        public List<InputOutputModel> InputOutput { get; set; }
        public List<NotesModel> Notes { get; set; }

        //Radiology
        public List<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public List<ImagingReportModel> ImagingReports { get; set; }

        public int? QueueNo { get; set; }

    }
}
