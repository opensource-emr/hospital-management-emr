using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetDepreciationMethodModel
    {
        [Key]
        public int AssetDeprnMethodId { get; set; }
        public string Method { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
