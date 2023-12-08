using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.Diet
{
    public class PatientDietDTO
    {
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
        public bool IsActive { get; set; }
    }
}
