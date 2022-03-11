using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class FixedAssetConditionCheckListModel
    {
        [Key]
        public int  AssetConditionCheckListId { get; set; }
        public int AssetConditionId { get; set; }
        public int FixedAssetStockId { get; set; }
        public bool? Condition { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool? IsActive { get; set; }




    }
}
