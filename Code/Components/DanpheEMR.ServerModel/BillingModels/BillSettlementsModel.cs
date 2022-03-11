using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/*
 File: BillSettlementModel.cs
 Created: 6May'18 <dinesh>
 Description: Created after IRD and HAMS Update
 Remarks: For the credit Payment Settlement, it is created 
     */


namespace DanpheEMR.ServerModel
{
    public class BillSettlementModel
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
        public List<BillingTransactionModel> BillingTransactions { get; set; }
        public PatientModel Patient { get; set; }
        [NotMapped]
        public string BillingUser { get; set; }
        public double? CollectionFromReceivable { get; set; }//added: Krishna: 16th Nov, 21
        public double? DiscountReturnAmount { get; set; }//added: Krishna: 16th Nov, 21

        [NotMapped]
        public List<int> BillReturnIdsCSV { get; set; }// added: Krishna: 22nd Nov'21
    }
}
