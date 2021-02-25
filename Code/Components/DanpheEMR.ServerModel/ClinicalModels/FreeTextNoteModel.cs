using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels
{
    public class FreeTextNoteModel
    {
        [Key]
        public int FreeTextId { get; set;}
        public int NotesId { get; set; }

        public int? PatientId { get; set; }

        public int? PatientVisitId { get; set; }


        public string FreeText { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }



    }
}
