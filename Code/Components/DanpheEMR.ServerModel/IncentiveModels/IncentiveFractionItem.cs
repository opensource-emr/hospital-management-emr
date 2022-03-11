using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class IncentiveFractionItemModel
    {
        [Key]
        public int InctvTxnItemId { get; set; }
        public string InvoiceNoFormatted { get; set; }
        public DateTime TransactionDate { get; set; }
        public string PriceCategory { get; set; }
        public int? BillingTransactionId { get; set; }//make it not null later on.
        public int BillingTransactionItemId { get; set; }
        public int PatientId { get; set; }
        public int? BillItemPriceId { get; set; }
        public string ItemName { get; set; }
        public double? TotalBillAmount { get; set; }
        public string IncentiveType { get; set; }
        public int IncentiveReceiverId { get; set; }
        public string IncentiveReceiverName { get; set; }
        public double IncentivePercent { get; set; }
        public double IncentiveAmount { get; set; }
        public bool? IsPaymentProcessed { get; set; }//to be used later for payment to doctors or any other parties.
        public int? PaymentInfoId { get; set; }//to be used later for payment to doctors or any other parties.
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        public bool IsMainDoctor { get; set; }
        public double? TDSPercentage { get; set; }
        public double? TDSAmount { get; set; }
        public double? Quantity { get; set; }
    }
}
