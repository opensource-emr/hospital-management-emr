using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingDepositsList_DTO
    {
        public int DepositId { get; set; }
        public string HospitalNo { get; set; }
        public string InPatientNo { get; set; }
        public DateTime ReceiptDate { get; set; }
        public string ReceiptNo { get; set; }
        public decimal Amount { get; set; }
        public string DepositType { get; set; }
        public string TransactionType { get; set; }
        public string User { get; set; }
        public string Remarks { get; set; }
        public bool IsDepositRefundedUsingDepositReceiptNo  { get; set; }
        public int DepositHeadId { get; set; }

    }
}
