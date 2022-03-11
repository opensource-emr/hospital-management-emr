using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class MakeSupplierLedgerPaymentVM
    {
        public int LedgerId { get; set; }
        public int SupplierId { get; set; }
        public DateTime? GRDate { get; set; }
        public int? GoodsReceiptId { get; set; }
        public int? GoodsReceiptPrintId { get; set; }
        public string BillNo { get; set; }
        public decimal? CreditAmount { get; set; }
        public decimal? DebitAmount { get; set; }
        public decimal? BalanceAmount { get; set; }
        public decimal? GRTotalAmount { get; set; }
        public decimal PayingAmount { get; set; }
        public string Status { get; set; }
    }
  
}