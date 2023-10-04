using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class SubLedgerModel
    {
		[Key]
        public int SubLedgerId { get; set; }
        public string SubLedgerName { get; set; }
        public string SubLedgerCode { get; set; }
        public int LedgerId { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public decimal OpeningBalance { get; set; }
        public bool DrCr { get; set; }
        public int HospitalId { get; set; }
        public bool IsDefault { get; set; }
    }
}
