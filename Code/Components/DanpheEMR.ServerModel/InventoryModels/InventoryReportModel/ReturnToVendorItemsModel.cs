using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class ReturnToVendorItems
    {
        public DateTime ReturnDate { get; set; }
        public string VendorName { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public int GoodsReceiptNo { get; set; }
        public Nullable<double> Quantity { get; set; }
        public Nullable<decimal> ItemRate { get; set; }
        public Nullable<int> CreditNoteNo { get; set; } 
        public Nullable<decimal> DiscountAmount { get; set; }
        public Nullable<decimal> VAT { get; set; }
        public Nullable<decimal> TotalAmount { get; set; }
        public string Remark { get; set; }
    }
}
