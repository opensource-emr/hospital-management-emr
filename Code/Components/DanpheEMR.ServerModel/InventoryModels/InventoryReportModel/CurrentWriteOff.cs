using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
   public class CurrentWriteOff
    {
        public Nullable<DateTime> WriteOffDate { get; set; }
        public string ItemName { get; set; }
        public string BatchNO { get; set; }
        public Nullable<double> WriteOffQuantity { get; set; }
        public Nullable<decimal> ItemRate { get; set; }
        public Nullable<decimal> TotalAmount { get; set; }
        public string RequestedBy { get; set; }
        public string Remark { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }
    }
}
