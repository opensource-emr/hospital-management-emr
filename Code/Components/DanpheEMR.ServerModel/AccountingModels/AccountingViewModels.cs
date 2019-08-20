using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class AccountClosureVM
    {
        public virtual FiscalYearModel nextFiscalYear { get; set; }
        public virtual TransactionModel TnxModel { get; set; }
    }

    public class AccountingTxnSyncVM
    {
        public virtual List<SyncBillingAccountingModel> billingSyncs { get; set; }
        public virtual List<TransactionModel> txnModels { get; set; }
        //public virtual List<TransactionLinkModel> txnLinks { get; set; }
    }
}
