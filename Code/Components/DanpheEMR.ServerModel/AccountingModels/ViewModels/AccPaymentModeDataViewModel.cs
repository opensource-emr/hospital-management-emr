
namespace DanpheEMR.ServerModel.AccountingModels
{
    public class AccPaymentModeDataViewModel
    {
        public string PaymentSubCategoryName { get; set; }
        public string TransactionType { get; set; }
        public decimal TotalAmount { get; set; }
        public int? LedgerId { get; set; }
        public int? OrganizationId { get; set; }
        public int? SubLedgerId { get; set; }
    }
}
