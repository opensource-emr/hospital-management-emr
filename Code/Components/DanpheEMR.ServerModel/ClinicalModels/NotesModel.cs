using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ClinicalModels;


namespace DanpheEMR.ServerModel
{
    public class NotesModel
    {
        [Key]
        public int NotesId { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int ProviderId { get; set; }
        public int TemplateId { get; set; }
        public int? SecondaryDoctorId { get; set; }
        public int? NoteTypeId { get; set; }
        public string TemplateName { get; set; }
        public int? FollowUp { get; set; }
        public string FollowUpUnit { get; set; }
        public string Remarks { get; set; }
        public bool? IsPending { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string ICDSelected { get; set; }

        [NotMapped]
        public DateTime? ReceivedOn { get; set; }

        [NotMapped]
        public string VisitCode { get; set; }
        [NotMapped]
        public DateTime? VisitDate {get;set;}
        [NotMapped]
        public string ReferredBy { get; set; }
        [NotMapped]
        public virtual FreeTextNoteModel FreeTextNote { get; set; }
        
        [NotMapped]
        public virtual ProcedureNoteModel ProcedureNote { get; set; }
        [NotMapped]
        public virtual ProgressNoteModel ProgressNote { get; set; }
        [NotMapped]
        public virtual EmergencyNoteModel EmergencyNote { get; set; }
        //[NotMapped]
        //public virtual HistoryAndPhysicalNoteModel HistoryAndPhysicalNote { get; set; }        
        [NotMapped]
        public virtual DischargeSummaryModel DischargeSummaryNote { get; set; }

        [NotMapped]
        public virtual SubjectiveNoteModel SubjectiveNote { get; set; }
        [NotMapped]
        public virtual ObjectiveNoteModel ObjectiveNote { get; set; }
        [NotMapped]
        public virtual PrescriptionNotesModel ClinicalPrescriptionNote { get; set; }
        [NotMapped]
        public virtual List<ClinicalDiagnosisModel> AllIcdAndOrders { get; set; }

        public virtual List<ClinicalDiagnosisModel> RemovedIcdAndOrders { get; set; }
    }

}
