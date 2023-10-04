namespace DanpheEMR.Services.Billing.DTO
{
    public class ServiceItemSchemeSettings_DTO
    {
        public int ServiceItemId { get; set; }
        public int SchemeId { get; set; }
        public bool? IsCoPayment { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
    }
}
