using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
   public class DailyItemDispatchModel
   {
        public string CategoryName { get; set; }
        public string SubCategory { get; set; }
        public string ItemName { get; set; }
        public string Unit { get; set; }
        public double DispatchedQty { get; set; }
        public double CostPrice { get; set; }
        public double TotalDispatchedValue { get; set; }
        public string Substore { get; set; }
   }
       
}

