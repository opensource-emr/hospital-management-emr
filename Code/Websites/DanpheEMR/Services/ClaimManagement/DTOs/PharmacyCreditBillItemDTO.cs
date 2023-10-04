namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class PharmacyCreditBillItemDTO
    {
        public int PhrmCreditBillItemStatusId { get; set; }
        public int PhrmCreditBillStatusId { get; set; }
        public int InvoiceId { get; set; }
        public int InvoiceItemId { get; set; }
        public int ItemId { get; set; }
        public decimal NetTotalAmount { get; set; }
        public bool IsClaimable { get; set; }
    }
}
