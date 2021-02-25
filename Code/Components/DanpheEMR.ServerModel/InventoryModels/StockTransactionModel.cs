using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class StockTransactionModel
    {
        [Key]
        public int StockTxnId { get; set; }
        public int FiscalYearId { get; set; }
        public int StockId { get; set; }
        public int ItemId { get; set; }
        public decimal? MRP { get; set; }
        public decimal? Price { get; set; }
        public double? Quantity { get; set; }
        public string InOut { get; set; }
        public int ReferenceNo { get; set; }
        public string TransactionType { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? TransactionDate { get; set; }
        public bool? IsActive { get; set; }
        public int? GoodsReceiptItemId { get; set; }
        public bool? IsTransferredToACC { get; set; }
        [NotMapped]
        public virtual int requisitionItemId { get; set; }
    }
}
