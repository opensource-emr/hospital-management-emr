using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MaternityANC
    {
        [Key]
        public int MaternityANCId { get; set; }
        public int MaternityPatientId { get; set; }
        public int PatientId { get; set; }
        public DateTime ANCDateTime { get; set; }
        public string VisitNumber { get; set; }
        public string ANCPlace { get; set; }
        public int PregnancyPeriodInWeeks { get; set; }
        public string ConditionOfANC { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public double Weight { get; set; }
    }
}
