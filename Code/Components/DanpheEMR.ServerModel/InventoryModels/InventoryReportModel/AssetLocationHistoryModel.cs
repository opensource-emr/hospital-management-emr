using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class AssetLocationHistoryModel
    {
        [Key]
        public int AssetsLocationHistoryId { get; set; }
        public int FixedAssetStockId { get; set; }
        public string OldLocation { get; set; }
        public int? OldAssetHolderId { get; set; }
        public int OldStoreId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CreatedBy { get; set; }

        public int? OldSubStoreId { get; set; }

    }
}
