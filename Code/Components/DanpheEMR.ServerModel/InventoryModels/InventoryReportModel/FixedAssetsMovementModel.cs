using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
   public class FixedAssetsMovementModel
    {
        public DateTime? MovementDate { get; set; }
        public string BarCodeNumber { get; set; }
        public string ItemName { get; set; }
        public string StoreName { get; set; }
        public int Quantity { get; set; }
        public decimal Amount { get; set; }
        public decimal ItemRate { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }
        public string AssetHolder { get; set; }

    }
}
