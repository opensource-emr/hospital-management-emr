using System;

namespace DanpheEMR.Services.Accounting.DTOs
{
    public class SubLedger_DTO
    {
        public int SubLedgerId { get; set; }
        public string SubLedgerName { get; set; }
        public string SubLedgerCode { get; set; }
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
