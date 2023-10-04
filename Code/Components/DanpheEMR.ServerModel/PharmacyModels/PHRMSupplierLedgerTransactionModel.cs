using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMSupplierLedgerTransactionModel
    {
        [Key]
        public int LedgerTransactionId { get; set; }
        public int FiscalYearId { get; set; }
        public int LedgerId { get; set; }
        public int SupplierId { get; set; }
        public decimal? DebitAmount { get; set; }
        public decimal? CreditAmount { get; set; }
        public string Remarks { get; set; }
        public int? ReferenceNo { get; set; }
        public string TransactionType { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsActive { get; set; }
    }
}
