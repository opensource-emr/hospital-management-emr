using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VaccineMasterModel
    {
        [Key]
        public int VaccineId { get; set; }
        public string VaccineName { get; set; }
        public int NumberOfDoses { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public List<DoseNumber> DoseDetail { get; set; }
    }
}
