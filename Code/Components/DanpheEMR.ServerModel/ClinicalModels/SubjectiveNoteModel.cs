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
    public class SubjectiveNoteModel
    {
        [Key]
        public int SubjectiveNoteId { get; set; }
        public int NotesId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string ChiefComplaint { get; set; }
        public string HistoryOfPresentingIllness { get; set; }
        public string ReviewOfSystems { get; set; }
     
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        
    }

}
