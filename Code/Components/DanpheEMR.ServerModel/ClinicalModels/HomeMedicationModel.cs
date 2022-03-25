using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    
    public class HomeMedicationModel
    {
        [Key]
        public int HomeMedicationId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? MedicationId { get; set; }
        [NotMapped]
        public string MedicationName { get; set; }
        public string Dose { get; set; }
        public string Route { get; set; }
        public int Frequency { get; set; }
        public DateTime LastTaken { get; set; }
        public string Comments { get; set; }
        public string MedicationType { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual PatientModel Patient { get; set; }
    }
}
