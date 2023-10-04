using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetServiceModel
    {
        [Key]
        public int AssetServiceId { get; set; }
        public int FixedAssetStockId { get; set; }

        public DateTime? ServiceDate { get; set; }
        public string ServiceRemarks { get; set; }

        public DateTime? ServiceCompleteDate { get; set; }
        public string ServiceCompleteRemarks { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

    }
}
