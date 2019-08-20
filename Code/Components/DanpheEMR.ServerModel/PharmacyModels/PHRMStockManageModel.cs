using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMStockManageModel
    {
        [Key]
        public int StockManageId { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public decimal? MRP { get; set; }
        public decimal? Price { get; set; }
        public double? Quantity { get; set; }
        public int? StockTxnItemId { get; set; }
        public double? VATPercentage { get; set; }
        public double? SubTotal { get; set; }
        public double? TotalAmount { get; set; }
        public string Remark { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string InOut { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }

        [NotMapped]
        public double? UpdatedQty { get; set; }
    }
}
