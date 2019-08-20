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
        
        public Int32 OrderNumber { get; set; }
        public string ItemName { get; set; }
        public Nullable<double> TotalQty { get; set; }
        public Nullable<double> ReceivedQuantity { get; set; }
        public Nullable<double> PendingQuantity { get; set; }
        public Nullable<decimal> StandardRate { get; set; }
        public DateTime DueDate { get; set; }




    }
       
}

