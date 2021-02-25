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
        public DateTime Date { get; set; }
        public int StoreId { get; set; }
        
        public string StoreName { get; set; }
        public string ItemName { get; set; }
        public Nullable<double> DispatchedQuantity { get; set; }
        public string ReceivedBy { get; set; }
        public string DispatchedBy { get; set; }

        [NotMapped]
        public int RequisitionItemId { get; set; }
        [NotMapped]
        public double Amount { get; set; }
        public string Code { get; set; }
        public string UOMName { get; set; }

    }
       
}

