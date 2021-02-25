using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels
{
  public  class TemplateNoteModel
    {
        [Key]
        public int TemplateId { get; set; }
        public string TemplateName { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsForNursing { get; set; }
    }

   
}
