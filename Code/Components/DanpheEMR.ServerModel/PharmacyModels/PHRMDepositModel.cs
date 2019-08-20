using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;



namespace DanpheEMR.ServerModel
{
    public class PHRMDepositModel
    {
        [Key]
        public int DepositId { get; set; }
        public int? FiscalYearId { get; set; }
        public int? ReceiptNo { get; set; }
        public int? PatientVisitId { get; set; }
        public int? PatientId { get; set; }
        public string DepositType { get; set; }
        public double? DepositAmount { get; set; }
        public string Remark { get; set; }
        public int? CounterId { get; set; }
        public int? PrintCount { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        public int? TransactionId { get; set; }
        public int? SettlementId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public double? DepositBalance { get; set; }


        [NotMapped]
        public string FiscalYear { get; set; }//need to show this in client side
        [NotMapped]
        public string PhrmUser { get; set; }
    }
}
