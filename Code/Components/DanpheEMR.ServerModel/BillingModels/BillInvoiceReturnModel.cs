using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/*
 File: BillInvoiceReturnModel.cs
 Created: 5May'18 <sudarshan>
 Description: Created after IRD and HAMS Update
 Remarks: Name is similar as that of BillingReturnRequestModel, change that later on.
     */


namespace DanpheEMR.ServerModel
{
    public class BillInvoiceReturnModel
    {
        [Key]
        public int BillReturnId { get; set; }
        public int? CreditNoteNumber { get; set; }
        public int RefInvoiceNum { get; set; }
        public int? PatientId { get; set; }
        public string FiscalYear { get; set; }
        public int? FiscalYearId { get; set; }
        public int? BillingTransactionId { get; set; }
        public double? SubTotal { get; set; }
        public double? DiscountAmount { get; set; }
        public double? TaxableAmount { get; set; }
        public double? TaxTotal { get; set; }
        public double? TotalAmount { get; set; }
        public string Remarks { get; set; }
        public int? CounterId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsActive { get; set; }
        [NotMapped]
        public float Tender { get; set; }

        [NotMapped]
        public List<BillingTransactionItemModel> ReturnedItems { get; set; }
        public PatientModel Patient { get; set; }//added for IRD-sud:6May'18

        public int? TaxId { get; set; }
        public string InvoiceCode { get; set; }

        public bool? IsRemoteSynced { get; set; }
        public bool? IsRealtime { get; set; }//sud: 10May'18

        //public bool? IsLocalSynced { get; set; }//sud: 10May'18

        [NotMapped]
        public int? PartialReturnTxnId { get; set; }
    }
}
