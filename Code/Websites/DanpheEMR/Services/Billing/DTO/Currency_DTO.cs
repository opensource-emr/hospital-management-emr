using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class Currency_DTO
    {
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencyName { get; set; }
        public decimal ExchangeRateDividend { get; set; }
        public bool ISBaseCurrency { get; set; }
        public bool IsActive { get; set; }
    }
}
