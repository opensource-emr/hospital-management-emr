using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.AccountingModels
{
    public class AccountingPaymentModel
    {
        [Key]
        public int PaymentId { get; set; }
        public int TransactionId { get; set; }
        public string  VoucherNumber { get; set; }
        public DateTime PaymentDate { get; set; }
        public int ReceiverLedgerId { get; set; }
        public int GoodReceiptID { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal VoucherAmount { get; set; }
        public decimal? RemainingAmount { get; set; }
        public string PaymentMode { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
       
        [NotMapped]
        public decimal DueAmount { get; set; }
 
        [NotMapped]
        public bool IsPaymentDone { get; set; }
        [NotMapped]
        public int SectionId { get; set; }
    }
}
