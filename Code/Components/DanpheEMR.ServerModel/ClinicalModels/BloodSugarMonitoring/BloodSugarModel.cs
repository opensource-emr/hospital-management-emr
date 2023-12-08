using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.BloodSugarMonitoring
{
    public class BloodSugarModel
    {
        [Key]
        public int BloodSugarMonitoringId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public DateTime EntryDateTime { get; set; }
        public decimal RbsValue { get; set; }
        public decimal Insulin { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
