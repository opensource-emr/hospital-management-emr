namespace DanpheEMR.Services.Billing.DTO
{
    public class PharmacyCreditInvoiceDetail_DTO
    {
        public int InvoiceId { get; set; }
        public int OrganizationId { get; set; }
        public decimal CreditAmount { get; set; }
    }
}
