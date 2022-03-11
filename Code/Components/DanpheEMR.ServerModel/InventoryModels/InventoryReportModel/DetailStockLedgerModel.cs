using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class DetailStockLedgerModel
    {
        public DateTime? TransactionDate { get; set; }
        public double? ReceiptQty { get; set; }
        public decimal? ReceiptRate { get; set; }
        public double? ReceiptAmount { get; set; }
        public double? IssueQty { get; set; }
        public decimal? IssueRate { get; set; }
        public double? IssueAmount { get; set; }
        public double BalanceQty { get; set; }
        public decimal BalanceRate { get; set; }
        public decimal BalanceAmount { get; set; }
        public int ReferenceNo { get; set; }
        public string Store { get; set; }
        public string Username { get; set; }
        public string Remarks { get; set; }

    }
}
