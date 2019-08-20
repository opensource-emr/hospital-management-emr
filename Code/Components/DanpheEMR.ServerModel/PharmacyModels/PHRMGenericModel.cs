using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMGenericModel
    {
        [Key]
        public int GenericId { get; set; }
        public string GenericName { get; set; }
        public int? CategoryId { get; set; }
        public string GeneralCategory { get; set; }
        public string TherapeuticCategory { get; set; }
        public string Counseling { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsAllergen { get; set; }

        ////added: sud: 15Jul'18
        //[NotMapped]
        //public string Dosage { get; set; }
        //[NotMapped]
        //public string Frequency { get; set; }
        //[NotMapped]
        //public string FrequencyDescription { get; set; }
        //[NotMapped]
        //public string Duration { get; set; }
    }
}
