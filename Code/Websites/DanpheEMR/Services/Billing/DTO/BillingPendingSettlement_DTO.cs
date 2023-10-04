using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingPendingSettlement_DTO
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string PatientName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public decimal CreditTotal { get; set; }
        public decimal ProvisionalTotal { get; set; }
        public decimal DepositBalance { get; set; }
        public DateTime LastTxnDate { get; set; }
    }
}
