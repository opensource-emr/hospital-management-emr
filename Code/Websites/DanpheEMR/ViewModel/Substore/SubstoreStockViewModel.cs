using System;

namespace DanpheEMR.ViewModel.Substore
{
    public class SubstoreStockViewModel
    {
        public int ItemId { get; set; }
        public int StockId { get; set; }
        public string ItemName { get; set; }
        public double? MinimumQuantity { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Code { get; set; }
        public string UOMName { get; set; }
        public bool? IsColdStorageApplicable { get; set; }
        public decimal MRP { get; set; }
        public string BatchNo { get; set; }
        public string ItemType { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public int SubStoreId { get; set; }
        public decimal ItemRate { get; set; }
        public double AvailableQuantity { get; set; }
        public double NewAvailableQuantity { get; set; }
    }
}
