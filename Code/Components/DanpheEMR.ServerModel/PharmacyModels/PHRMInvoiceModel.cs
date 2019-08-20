using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMInvoiceTransactionModel
    {
        [Key]
        public int InvoiceId { get; set; }
        //set invoice 
        public int InvoicePrintId { get; set; }
        public int? PatientId { get; set; }
        public bool? IsOutdoorPat { get; set; }
        public int? CounterId { get; set; }
        public double? TotalQuantity { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public string BilStatus { get; set; }
        public decimal? CreditAmount { get; set; }
        public decimal? Tender { get; set; }
        public decimal? Change { get; set; }
        public int? PrintCount { get; set; }
        public decimal? Adjustment { get; set; }
        public string Remark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreateOn { get; set; }
        public bool? IsReturn { get; set; }
        public bool? IsRealtime { get; set; }
        public bool? IsRemoteSynced { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public virtual List<PHRMInvoiceTransactionItemsModel> InvoiceItems { get; set; }
        public string VisitType { get; set; }
        public int? ProviderId { get; set; }
        public decimal? DepositDeductAmount { get; set; }
        public string PaymentMode { get; set; }

        public int? FiscalYearId { get; set; }
        [NotMapped]
        public string FiscalYear { get; set; }
        [NotMapped]
        public string ShortName { get; set; }
        [NotMapped]
        public string PANNumber { get; set; }

        [NotMapped]
        public double? DepositAmount { get; set; }

        [NotMapped]
        public double? DepositBalance { get; set; }
    }
}
