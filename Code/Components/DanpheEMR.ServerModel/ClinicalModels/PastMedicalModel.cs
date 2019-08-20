using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ClinicalModels;

namespace DanpheEMR.ServerModel
{
    public class PastMedicalProblem : ProblemList
    {
        [Key]
        public int PatientProblemId { get; set; }
        public string CurrentStatus { get; set; }
        public string Note { get; set; }
        public DateTime? OnSetDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public virtual PatientModel Patient { get; set; }


    }
}
