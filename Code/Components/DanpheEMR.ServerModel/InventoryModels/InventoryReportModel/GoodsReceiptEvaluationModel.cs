using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class GoodsReceiptEvaluationModel
    {
        
        [Key]
        public int GoodsReceiptID { get; set; }
        public int GoodsReceiptNo { get; set; }
        public string ItemName { get; set; }
        public string Code { get; set; }
        public string ItemType { get; set; }
        public string BatchNO { get; set; }
        public string TransactionType { get; set; }
        public string InOut { get; set; }
        public string TransactionBy { get; set; }
        public Decimal ItemRate { get; set; }
        public Double Quantity { get; set; }
        public Int32 ReferenceNo { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string UOMName { get; set; }
    }
}
