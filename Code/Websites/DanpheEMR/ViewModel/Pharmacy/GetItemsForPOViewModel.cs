using System.Collections.Generic;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetItemsForPOViewModel
    {
        public List<GetItemForPODto> ItemList { get; set; }
    }

    public class GetItemForPODto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string UOMName { get; set; }
        public decimal LastGRItemPrice { get; set; }
        public bool IsVATApplicable { get; set; }
        public double? VATPercentage { get; set; }
        public int GenericId { get; set; }
        public decimal PurchaseRate { get; set; }
        public decimal SalesRate { get; set; }
        public decimal PurchaseDiscount { get; set; }
        public double CCCharge { get; set; }
    }
}
