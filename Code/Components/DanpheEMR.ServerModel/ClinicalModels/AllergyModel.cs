using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DanpheEMR.ServerModel
{
    public class AllergyModel
    {
        [Key]
        public int PatientAllergyId { get; set; }
        public int PatientId { get; set; }
        public int? AllergenAdvRecId { get; set; }

        //[NotMapped]//commented: sud--15Jun'18--we'll add the name as well.
        public string AllergenAdvRecName { get; set; }
        //public string Others { get; set; }
        public string AllergyType { get; set; }
        public string Severity { get; set; }
        public bool Verified { get; set; }
        public string Reaction { get; set; }
        public string Comments { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual PatientModel Patient { get; set; }
    }

}
