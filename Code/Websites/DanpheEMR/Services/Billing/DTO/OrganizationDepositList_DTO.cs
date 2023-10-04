using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class OrganizationDepositList_DTO
    {
        public int DepositId { get; set; }
        public int? DepositReceiptNo { get; set; }
        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
        public string CreditOrganization { get; set; }
        public string Remarks { get; set; }
        public DateTime ReceiptDate { get; set; }
        public int? PrintCount { get; set; }
        public decimal DepositBalance { get; set; }
        public string FiscalYear { get; set; }
        public string BillingUser { get; set; }
        public string Representative { get; set; }
    }
}
