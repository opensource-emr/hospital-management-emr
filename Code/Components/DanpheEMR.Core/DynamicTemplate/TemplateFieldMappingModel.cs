using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Core.DynamicTemplate
{
    public class TemplateFieldMappingModel
    {
        [Key]
        public int TemplateFieldMapId { get; set; }
        public int TemplateId { get; set; }
        public int FieldMasterId { get; set; }
        public string DisplayLabel { get; set; }
        public bool IsMandatory { get; set; }
        public int? EnterSequence { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
