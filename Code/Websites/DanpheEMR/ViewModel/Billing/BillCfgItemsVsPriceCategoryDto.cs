using System;

namespace DanpheEMR.ViewModel.Billing
{
    public class BillCfgItemsVsPriceCategoryDto
    {
        public int PriceCategoryId { get; set; }
        public int BillCfgItemPriceId { get; set; }
        public decimal Price { get; set; }
        public Boolean DiscountApplicable { get; set; }
        public string ItemLegalCode { get; set; }
        public string LegalName { get; set; }
        public decimal Discount { get; set; }
        public Boolean IsCoPayment { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
    }
}
