using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMInvoiceReturnModel
    {
        [Key]
        public int InvoiceReturnId { get; set; }
        public int? InvoiceId { get; set; }
        public int? PatientId { get; set; }
        public int? CounterId { get; set; }
        public int? CreditNoteId { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public decimal? Tender { get; set; }
        public decimal? Change { get; set; }
        public int? PrintCount { get; set; }
        public decimal? Adjustment { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsRealtime { get; set; }
        public bool? IsRemoteSynced { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public virtual List<PHRMInvoiceReturnItemsModel> InvoiceReturnItems { get; set; }
        public string PaymentMode { get; set; }

        public int? FiscalYearId { get; set; }
        public string Remarks { get; set; }

    }
}
