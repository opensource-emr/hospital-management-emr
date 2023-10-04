namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class BillingCreditBillItemDTO
    {
        public int BillingCreditBillItemStatusId { get; set; }
        public int BillingCreditBillStatusId { get; set; }
        public int BillingTransactionId { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal NetTotalAmount { get; set; }
        public bool IsClaimable { get; set; }
    }
}
