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
        public string NoteType { get; set; }
        public string FollowUp { get; set; }
        public string Remarks { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        [NotMapped]
        public string VisitCode { get; set; }
        [NotMapped]
        public DateTime? VisitDate {get;set;}
        [NotMapped]
        public string ReferredBy { get; set; }
        [NotMapped]
        public virtual SubjectiveNoteModel SubjectiveNote { get; set; }
        [NotMapped]
        public virtual ObjectiveNoteModel ObjectiveNote { get; set; }
        [NotMapped]
        public virtual List<ClinicalDiagnosisModel> AllIcdAndOrders { get; set; }
    }

}
