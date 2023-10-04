using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.Transactions
{
    public class BankAndSuspenseAccountReconciliationMapModel
    {
        [Key]
        public int BankAndSuspenseAccountReconciliationId { get; set; }
        public string BankReconciliationVoucherNumber { get; set; }
        public string SuspensReconciliationVoucherNumber { get; set; }
        public int BankLedgerId { get; set; }
    }
}
