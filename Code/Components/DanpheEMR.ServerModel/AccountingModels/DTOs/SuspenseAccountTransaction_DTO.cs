using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class SuspenseAccountTransaction_DTO
    {
        public TransactionModel Transaction { get; set; }
        public MapBankAndSuspenseAccountReconciliation_DTO ReconciliationMap { get; set; }
    }
}
