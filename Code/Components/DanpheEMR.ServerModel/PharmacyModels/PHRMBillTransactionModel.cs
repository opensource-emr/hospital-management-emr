using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMBillTransactionModel
    {
        [Key]
        public int BilTransactionId { get; set; }
        public int PatientId { get; set; }
        public int CounterId { get; set; }
        public DateTime PaidDate { get; set; }
        public string TransactionType { get; set; }
        public double TotalQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public float DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public float VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal AmountFromDeposit { get; set; }
        public decimal CreditAmount { get; set; }
        public string BilStatus { get; set; }
        public int PrintCount { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }


        public virtual List<PHRMBillTransactionItem> BillTransactionItems { get; set; }


        public PHRMBillTransactionModel()
        {
            this.BillTransactionItems = new List<PHRMBillTransactionItem>();
        }
    }
}
