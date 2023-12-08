using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels
{
    public class ClinicalIntakeOutputParameterModel
    {
        [Key]
        public int IntakeOutputId { get; set; }
        public string ParameterType { get; set; }
        public string ParameterValue { get; set; }
        public int ParameterMainId { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
