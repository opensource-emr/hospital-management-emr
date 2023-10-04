using System;
namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for WardStock and AvailableWardStockEndpoint Endpoint in WardSupply Controller </summary>
    public class WardSupplyWardStockDTO
    {
        public int StoreId { get; set; }
        public int ItemId { get; set; }
        public int StockId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public string BatchNo { get; set; }
        public double AvailableQuantity { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public string Unit { get; set; }
    }
}