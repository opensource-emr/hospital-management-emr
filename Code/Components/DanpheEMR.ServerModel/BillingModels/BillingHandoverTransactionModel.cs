using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillingHandoverTransactionModel
    {
        [Key]
        public int HandoverTxnId { get; set; }
        public int? HandoverByEmpId { get; set; }
        public int? HandoverToEmpId { get; set; }
        public int? CounterId { get; set; }
        public string HandoverType { get; set; }
        public string BankName { get; set; }
        public string VoucherNumber { get; set; }
        public DateTime? VoucherDate { get; set; }
        public double? HandoverAmount { get; set; }
        public double? DueAmount { get; set; }
        public string HandoverRemarks { get; set; }
        public int? ReceivedById { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceiveRemarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        
    }
}
