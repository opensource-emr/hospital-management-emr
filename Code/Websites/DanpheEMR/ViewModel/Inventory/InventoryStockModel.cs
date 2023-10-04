using System;

namespace DanpheEMR.ViewModel.Inventory
{
    public class InventoryStockModel
    {
        public int StockId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int StoreId { get; set; }
        public string BatchNo { get; set; }
        public decimal CostPrice { get; set; }
        public DateTime GRDate { get; set; }
        public double MinQuantity { get; set; }
        public string ItemCode { get; set; }
        public string ItemType { get; set; }
        public string SubCategoryName { get; set; }
        public int UnitOfMeasurementId { get; set; }
        public bool IsFixedAssets { get; set; }
        public string UOMName { get; set; }
        public double AvailQuantity { get; set; }
        public double NewQuantity { get; set; }

    }
}
