using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   
    public class PHRMPurchaseOrderReportModel
    {
        public DateTime Date { get; set; }
        public string ItemName { get; set; }
        public string POItemStatus { get; set; }
        public double Quantity { get; set; }
        public double ReceivedQuantity { get; set; }
        public decimal StandaredPrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        
    }

    public class PHRMItemWiseStockReportModel
    {
        public string ItemName { get; set; }
        public string ItemTypeName { get; set; }
        public double StockQuantity { get; set; }
        public double StockValue { get; set; }
    }
}
