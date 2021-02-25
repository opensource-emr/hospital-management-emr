using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerBalanceHistoryModel
    {
        [Key]
        public int LedgerBalanceHistoryId { get; set; }
        public int FiscalYearId { get; set; }
        public int LedgerId { get; set; }
        public double? OpeningBalance { get; set; }
        public bool? OpeningDrCr { get; set; }
        public double? ClosingBalance { get; set; }
        public bool? ClosingDrCr { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }

    }
}
