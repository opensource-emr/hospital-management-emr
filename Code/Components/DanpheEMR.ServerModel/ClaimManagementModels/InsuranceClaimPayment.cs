using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClaimManagementModels
{
    public class InsuranceClaimPayment
    {
        [Key]
        public int ClaimPaymentId { get; set; }
        public int ClaimSubmissionId { get; set; }
        public Int64 ClaimCode { get; set; }
        public int CreditOrganizationId { get; set; }
        public decimal ReceivedAmount { get; set; }
        public decimal ServiceCommission { get; set; }
        public int ReceivedBy { get; set; }
        public DateTime ReceivedOn { get; set; }
        public string ChequeNumber { get; set; }
        public string PaymentDetails { get; set; }
        public string BankName { get; set; }
        public string Remarks { get; set; }
    }
}
