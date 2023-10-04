using System;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class ClaimPaymentDTO
    {
        public int ClaimPaymentId;
        public int ClaimSubmissionId;
        public Int64 ClaimCode;
        public int CreditOrganizationId;
        public decimal ReceivedAmount;
        public decimal ServiceCommission;
        public int ReceivedBy;
        public DateTime ReceivedOn;
        public string ChequeNumber;
        public string PaymentDetails;
        public string BankName;
        public string Remarks;
    }
}
