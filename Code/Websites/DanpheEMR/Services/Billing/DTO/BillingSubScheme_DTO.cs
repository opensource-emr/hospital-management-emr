namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingSubScheme_DTO
    {
        public int SubSchemeId { get; set; }
        public string SubSchemeName { get; set; }
        public int SchemeId { get; set; }
        public bool IsActive { get; set; }
    }
}
