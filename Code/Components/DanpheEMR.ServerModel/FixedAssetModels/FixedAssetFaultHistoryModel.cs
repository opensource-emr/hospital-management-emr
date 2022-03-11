using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetFaultHistoryModel
    {
        [Key]
        public int FaultHistoryId { get; set; }
        public int FixedAssetStockId { get; set; }

        public DateTime? FaultDate { get; set; }
        public string FaultDescription { get; set; }

        public DateTime? FaultResolvedDate { get; set; }
        public string FaultResolvedRemarks { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsFaultResolved { get; set; }







    }
}
