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
        public double TotalIntake { get; set; }
        public double TotalOutput { get; set; }
        public double Balance { get; set; }
        public string Unit { get; set; }
        public string IntakeType { get; set; }
        public string OutputType { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual VisitModel Visit { get; set; }
    }
}
