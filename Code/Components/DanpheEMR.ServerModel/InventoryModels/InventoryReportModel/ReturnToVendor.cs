using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class ReturnToVendor
    {
        public Nullable<DateTime> CreatedOn { get; set; }
        public string VendorName { get; set; }
        public Nullable<int> CreditNoteNo { get; set; }
        public string ItemName { get; set; }
        public Nullable<double> Quantity { get; set; }
        public Nullable<decimal> ItemRate { get; set; }
        public Nullable<decimal> TotalAmount { get; set; }
        public string Remark { get; set; }
        public string ReturnedBy { get; set; }
    }
}
