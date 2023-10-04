using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class BankReconciliationAdditionalTransaction_DTO
    {
        public string CategoryName { get; set; }
        public int LedgerId { get; set; }
        public int SubLedgerId { get; set; }
        public bool DrCr { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
    }
}
