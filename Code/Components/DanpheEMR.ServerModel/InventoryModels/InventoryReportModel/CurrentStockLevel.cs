using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DanpheEMR.ServerModel.ReportingModels
{
   public class CurrentStockLevel
    {
        public string ItemName { get; set; }
        public string CompanyName { get; set; }
        public string VendorName { get; set; }
        public string BatchNO { get; set; }
        public Nullable<double> AvailableQuantity { get; set; }
        public Nullable<double> BudgetedQuantity { get; set; }
        public Nullable<double> MinimumQuantity { get; set; }
        public Nullable<decimal> ItemRate { get; set; }  
        public Nullable<DateTime> CreatedOn { get; set; }
    }
}
