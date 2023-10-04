using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.ViewModels
{
    public class VoucherVerify_DTO
    {
        public string VoucherNumber { get; set; }
        public List<VoucherLedgerInfo_DTO> Items { get; set; }
        public string Remarks { get; set; }
        public int FiscalYearId { get; set; }
    }

    public class VoucherLedgerInfo_DTO
    {
        public int LedgerId { get; set; }  
        public string Description { get; set; }
        public int CostCenterId { get; set; }
        public int TransactionItemId { get; set; }
    }
}
