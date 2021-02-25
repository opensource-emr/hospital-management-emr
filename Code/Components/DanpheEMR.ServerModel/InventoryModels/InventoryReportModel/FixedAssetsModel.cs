using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class FixedAssetsModel
    {
        public Nullable<DateTime> Date { get; set; }
        public string ItemName { get; set; }
        public string Name { get; set; }
        public Nullable<double> Qty { get; set; }
        public Nullable<decimal> MRP { get; set; }
        public Nullable<double> TotalAmt { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }
    }
}
