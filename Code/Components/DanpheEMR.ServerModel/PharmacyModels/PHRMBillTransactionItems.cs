using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PHRMBillTransactionItem
    {
        [Key]
        public int BilTransactionItemId { get; set; }
        public int? BilTransactionId { get; set; }
        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public int PatientId { get; set; }
        public int CounterId { get; set; }
        public decimal ItemPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public double Quantity { get; set; }
        public double FreeQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public double DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public double VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime? PaidDate { get; set; }
        public string TransactionType { get; set; }
        public int? ReferenceId { get; set; }
        public string BillStatus { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
