using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels.Config
{
    public class CurrencyModel
    {
        [Key]
        public int CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public string  CurrencyName { get; set; }
        public decimal ExchangeRateDividend { get; set; }
        public bool ISBaseCurrency { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
