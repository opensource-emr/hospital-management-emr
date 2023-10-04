namespace DanpheEMR.Services.BillSettings.DTOs
{
    public class AddUpdateAdditionalServiceItem_DTO
    {
        public int AdditionalServiceItemId { get; set; }
        public string GroupName { get; set; }
        public int ServiceItemId { get; set; }
        public int PriceCategoryId { get; set; }
        public string ItemName { get; set; }
        public bool UseItemSelfPrice { get; set; }
        public decimal PercentageOfParentItemForSameDept { get; set; }
        public decimal PercentageOfParentItemForDiffDept { get; set; }
        public decimal MinimumChargeAmount { get; set; }
        public bool IsPreAnaesthesia { get; set; }
        public bool WithPreAnaesthesia { get; set; }
        public bool IsOpServiceItem { get; set; }
        public bool IsIpServiceItem { get; set; }
        public bool IsActive { get; set; }
    }
}
