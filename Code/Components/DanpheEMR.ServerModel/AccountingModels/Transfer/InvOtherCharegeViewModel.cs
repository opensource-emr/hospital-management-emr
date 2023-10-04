using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class InvOtherCharegeViewModel
    {
        public int GoodsReceiptItemId { get; set; }
        public int ChargeId { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public decimal Amount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int LedgerId { get; set; }
    }
}
