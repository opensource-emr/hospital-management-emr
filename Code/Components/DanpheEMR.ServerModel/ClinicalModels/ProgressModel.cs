using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels
{
   public  class ProgressNoteModel
    {
        [Key]
        public int ProgressNoteId { get; set; }
        //[ForeignKey("Notes")]
        public int? NotesId { get; set; }
        //public NotesModel Notes{ get; set; }
        public int? PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public string SubjectiveNotes { get; set; }
        public string ObjectiveNotes { get; set; }
        public string AssessmentPlan { get; set; }
        public string Instructions { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }




    }
}
