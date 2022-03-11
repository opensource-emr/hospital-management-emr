using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryReportModel
{
   public class QuotionRatesModel
    {


        public int PurchaseOrderId { get; set; }

        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public int? Price { get; set; }
        public string Status { get; set; }

        public int? VendorId { get; set; }
        public string VendorName { get; set; }


    }
}
