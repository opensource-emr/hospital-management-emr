using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class AccountingSync_DTO
    {
        public string ReferenceIdCSV { get; set; }
        public string BaseTransactionType { get; set; }
        public string TransactionType { get; set; }
        public string PaymentMode { get; set; }
        public decimal TotalAmount { get; set; }
        public int LedgerId { get; set; }
        public int SubLedgerId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; }
        public int DisplaySequence { get; set; }
        public bool DrCr { get; set; }
        public int TransactionRefNo { get; set; }
    }
}
