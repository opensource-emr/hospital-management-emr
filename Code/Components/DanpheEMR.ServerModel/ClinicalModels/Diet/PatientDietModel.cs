using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.Diet
{
    public class PatientDietModel
    {
        [Key]
        public int PatientDietId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int DietTypeId { get; set; }
        public string ExtraDiet { get; set; }
        public int WardId { get; set; }
        public DateTime RecordedOn { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
