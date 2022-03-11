using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetDepreciationModel
    {
        [Key]
        public int AssetDepreciationId { get; set; }
        public int FixedAssetStockId { get; set; }
        public int AssetDeprnMethodId { get; set; }

        public int? Rate { get; set; }
        public decimal DepreciationAmount { get; set; }
        public int FiscalYearId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
