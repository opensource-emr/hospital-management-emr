using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class SubLedgerTransactionModel
    {
        [Key]
        public int SubLedgerTransactionId { get; set; }
        public int LedgerId { get; set; }
        public int TransactionItemId { get; set; }
        public int SubLedgerId { get; set; }
        public decimal DrAmount { get; set; }
        public decimal CrAmount { get; set; }
        public string VoucherNo { get; set; }
        public int VoucherType { get; set; }
        public string Description { get; set; }
        public DateTime VoucherDate { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public int FiscalYearId { get; set; }
        public int HospitalId { get; set; }
        public int CostCenterId { get; set; }
        public bool IsVerified { get; set; }
    }
}
