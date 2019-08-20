using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BedFeature
    {
        [Key]
        public int BedFeatureId { get; set; }
        public string BedFeatureName { get; set; }
        public string BedFeatureFullName { get; set; }
        public double BedPrice { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        
        //yubraj: 11th Oct 2018
        [NotMapped]
        public bool? TaxApplicable { get; set; }

        [NotMapped]
        public int? ServiceDepartmentId { get; set; }

    }
}
