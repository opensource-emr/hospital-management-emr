using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
   public class PurchaseOrderModel
    {
        public DateTime Date { get; set; }
        public int PONumber { get; set; }
        public string VendorName { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
        public string SubCategory { get; set; }
        public Nullable<double> Quantity { get; set; }
        public Nullable<decimal> StandardRate { get; set; }
        public Nullable<decimal> VAT { get; set; }
        public Nullable<decimal> TotalAmount { get; set; }
        public string Remarks { get; set; }

    }
       
}

