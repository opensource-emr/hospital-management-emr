using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BedFeaturesMap
    {
        [Key]
        public int BedFeatureCFGId { get; set; }
        public int BedId { get; set; }
        public int WardId { get; set; }
        public int BedFeatureId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

        public BedFeature BedFeature { get; set; }
        public WardModel Ward { get; set; }
        public BedModel Bed { get; set; }

        [NotMapped]
        public int len { get; set; }

    }
}
