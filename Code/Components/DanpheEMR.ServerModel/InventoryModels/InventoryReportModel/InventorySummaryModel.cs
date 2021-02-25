using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
   public class InventorySummaryModel
    {
        public DateTime Dates { get; set; }
        
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }
        public Nullable<decimal> ItemRates { get; set; }
        public Nullable<double> PurchaseQty { get; set; }
        public Nullable<double> PurchaseValue { get; set; }
        public Nullable<double> DispatchQty { get; set; }
        public Nullable<double> DispatchValue { get; set; }
        public Nullable<double> WriteoffQty { get; set; }
        public Nullable<double> WriteoffValue { get; set; }
        public Nullable<double> ReturnToVendorQty { get; set; }
        public Nullable<double> ReturnToVendorValue { get; set; }
       
    }
       
}

