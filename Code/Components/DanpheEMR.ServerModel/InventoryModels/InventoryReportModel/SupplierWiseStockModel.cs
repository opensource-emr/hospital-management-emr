using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class SupplierWiseStockModel
    {
        public double? OpeningStock { get; set; }
        public string VendorName { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string StoreName { get; set; }
        public double? PurchaseQty { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double? ConsumedQty { get; set; }
        public string OtherQtyTxn { get; set; }
        public double? ClosingStock { get; set; }
    }

}
