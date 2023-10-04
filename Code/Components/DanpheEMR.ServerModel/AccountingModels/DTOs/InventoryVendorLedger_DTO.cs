using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class InventoryVendorLedger_DTO
    {
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public int LedgerId { get; set; }
        public int? SubLedgerId { get; set; }
        public string LedgerType { get; set; }
    }
}
