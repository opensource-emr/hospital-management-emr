using System;
using System.ComponentModel.DataAnnotations;
namespace DanpheEMR.ServerModel.AccountingModels
{
    public class SubLedgerBalanceHistory
    {
        [Key]
        public int SubLedgerBalanceHistoryId { get; set; }
        public int FiscalYearId { get; set; }
        public int SubLedgerId { get; set; }
        public decimal? OpeningBalance { get; set; }
        public bool? OpeningDrCr { get; set; }
        public decimal? ClosingBalance { get; set; }
        public bool? ClosingDrCr { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public int? HospitalId { get; set; }
    }
}
