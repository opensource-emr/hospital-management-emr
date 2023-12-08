using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels.DTOs
{
    public class SubLedgerForMakePayment_DTO
    {
        public int SubLedgerId { get; set; }
        public int? ReferenceId { get; set; }
        public string SubLedgerName { get; set; }
        public string SubLedgerCode { get; set; }
        public string LedgerType { get; set; }
        public int LedgerId { get; set; }
        public string LedgerName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public decimal OpeningBalance { get; set; }
        public bool DrCr { get; set; }
        public int HospitalId { get; set; }
        public bool IsDefault { get; set; }
    }
}
