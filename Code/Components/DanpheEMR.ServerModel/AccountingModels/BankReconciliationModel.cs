using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class BankReconciliationModel
    {
        [Key]
        public int Id { get; set; }
        public int? SectionId { get; set; }
        public string VoucherNumber { get; set; }
        public DateTime? TransactionDate { get; set; }
        public int? FiscalyearId { get; set; }
        public DateTime? BankTransactionDate { get; set; }
        public int? CategoryId { get; set; }
        public decimal? BankBalance { get; set; }
        public bool? IsVerified { get; set; }
        public int? VerifiedBy { get; set; }
        public DateTime? VerifiedOn { get; set; }
        public string Remark { get; set; }
        public decimal? Difference { get; set; }

        public int? TransactionId { get; set; }
        public int LedgerId { get; set; }

        public int? HospitalId { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }

        public bool? DrCr { get; set; }

    }
}

