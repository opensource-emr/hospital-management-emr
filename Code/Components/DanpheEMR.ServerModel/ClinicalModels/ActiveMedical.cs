using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ClinicalModels;

//added this namespace to get [notmapped]
//using System.ComponentModel.DataAnnotations.Schema;
namespace DanpheEMR.ServerModel
{
    public class ActiveMedicalProblem : ProblemList
    {
        [Key]
        public int PatientProblemId { get; set; }
        public string CurrentStatus { get; set; }
        public string Note { get; set; }
        
        public DateTime? OnSetDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public bool IsResolved { get; set; }
        public bool? PrincipleProblem { get; set; }


        public virtual PatientModel Patient { get; set; }
    }

}
