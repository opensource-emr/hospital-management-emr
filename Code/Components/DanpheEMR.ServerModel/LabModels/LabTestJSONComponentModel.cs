using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class LabTestJSONComponentModel
    {
        [Key]
        public int ComponentId { get; set; }
        public string ComponentName { get; set; }
        public string Unit { get; set; }
        public string ValueType { get; set; }
        public string ControlType { get; set; }
        public string Range { get; set; }
        public string MaleRange { get; set; }
        public string FemaleRange { get; set; }
        public string ChildRange { get; set; }
        public string RangeDescription { get; set; }
        public string Method { get; set; }
        public string ValueLookup { get; set; }        
        public Nullable<double> MinValue { get; set; }
        public Nullable<double> MaxValue { get; set; }
        public string DisplayName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        [NotMapped]
        public int DisplaySequence { get; set; }
        [NotMapped]
        public bool IndentationCount { get; set; }
        [NotMapped]
        public int ComponentMapId { get; set; }

    }
}
