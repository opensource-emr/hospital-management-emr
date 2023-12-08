using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class InputOutputModel
    {
        [Key]
        public int InputOutputId { get; set; }
        public int PatientVisitId { get; set; }
        public int InputOutputParameterMainId { get; set; }
        public int? InputOutputParameterChildId { get; set; }
        public double IntakeOutputValue { get; set; }
        public string Unit { get; set; }
        public string IntakeOutputType { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual VisitModel Visit { get; set; }
        public string Contents { get; set; }
        public string Remarks { get; set; }
    }
}
