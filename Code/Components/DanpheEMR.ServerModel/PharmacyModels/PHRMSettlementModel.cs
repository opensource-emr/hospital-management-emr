
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMSettlementModel
    {
        [Key]
        public int SettlementId { get; set; }
        public int? FiscalYearId { get; set; }
        public int? SettlementReceiptNo { get; set; }
        public DateTime? SettlementDate { get; set; }
        public string SettlementType { get; set; }
        public int PatientId { get; set; }
        public double? PayableAmount { get; set; }
        public double? RefundableAmount { get; set; }
        public double? PaidAmount { get; set; }
        public double? ReturnedAmount { get; set; }
        public double? DepositDeducted { get; set; }
        public double? DueAmount { get; set; }
        public double? DiscountAmount { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        public int? CounterId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string Remarks { get; set; }
        public int? PrintCount { get; set; }
        public DateTime? PrintedOn { get; set; } //Yubraj: 13th August'19
        public int? PrintedBy { get; set; } //Yubraj: 13th August'19
        public bool? IsActive { get; set; }
        public List<PHRMInvoiceTransactionModel> PHRMInvoiceTransactions { get; set; }
        public PatientModel Patient { get; set; }
        [NotMapped]
        public string BillingUser { get; set; }

        public double? CollectionFromReceivable { get; set; }
        public double? DiscountReturnAmount { get; set; }

        [NotMapped]
        public List<int> PHRMReturnIdsCSV { get; set; }

        //[NotMapped]
        public int StoreId { get; set; }
    }
}
