using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class MapBankAndSuspenseAccountReconciliation_DTO
    {
        public int BankAndSuspenseAccountReconciliationId { get; set; }
        public string BankReconciliationVoucherNumber { get; set; }
        public string SuspensReconciliationVoucherNumber { get; set; }
        public int BankLedgerId { get; set; }
    }
}
