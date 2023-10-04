using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientVaccineDetailModel
    {
        [Key]
        public int PatientVaccineId { get; set; }
        public int VaccineId { get; set; }
        public int PatientId { get; set; }
        public int DoseNumber { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public DateTime VaccineDate { get; set; }
        public string Remarks { get; set; }
    }
}
