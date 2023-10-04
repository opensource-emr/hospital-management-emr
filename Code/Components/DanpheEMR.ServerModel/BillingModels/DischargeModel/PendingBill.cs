using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels.DischargeModel
{
    public class PendingBill
    {
        public IpBillingTxnVM BillingPendingItems { get; set; }
        public List<PharmacyPendingBillItem> PharmacyPendingItem { get; set; }
        public decimal PharmacyTotalAmount { get; set; }
    }
}
