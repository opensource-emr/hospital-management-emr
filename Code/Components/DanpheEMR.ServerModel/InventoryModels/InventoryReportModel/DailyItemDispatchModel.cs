using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
   public class DailyItemDispatchModel
    {
        public DateTime Date { get; set; }
        
        public string DepartmentName { get; set; }
        public string ItemName { get; set; }
        public Nullable<double> DispatchedQuantity { get; set; }
        public string ReceivedBy { get; set; }
        public string DispatchedBy { get; set; }
    }
       
}

