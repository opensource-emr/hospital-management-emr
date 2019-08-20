using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillingDeposit
    {
        [Key]
        public int DepositId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? PatientId { get; set; }
        public int? BillingTransactionId { get; set; }
        public string DepositType { get; set; }
        public double? Amount { get; set; }
        public string Remarks { get; set; }
        //this will be employeeid of the current user--sudarshan:7may'17
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        //needed to add transactio at the time of deposit--sud:8Sept'17
        public int? FiscalYearId { get; set; }
        public int? ReceiptNo { get; set; }
        public int? CounterId { get; set; }
        public int? PrintCount { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        [NotMapped]
        public string FiscalYear { get; set; }//added: ashim-8May'18 (need to show this in client side)
        [NotMapped]
        public string BillingUser { get; set; }
        public BillingTransactionModel BillingTransaction { get; set; }
        public int? SettlementId { get; set; }//added: sud-17May

        public double? DepositBalance { get; set; }

        //Yubraj: 18th Dec '18
        public bool? IsActive { get; set; }
        public bool? IsTransferTransaction { get; set; }
        public string ModifiedRemarks { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        public string CareOf { get; set; } //Yubraj: 11th Jan '19
        public DateTime? PrintedOn { get; set; } //Yubraj: 13th August'19
        public int? PrintedBy { get; set; } //Yubraj: 13th August '19
    }
}
