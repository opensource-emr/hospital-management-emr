namespace DanpheEMR.ViewModel.Pharmacy
{
    public class PharmacyStockModel
    {
        public int StockId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int StoreId { get; set; }
        public string BatchNo { get; set; }
        public decimal CostPrice { get; set; }
        public string ItemCode { get; set; }
        public string SubCategoryName { get; set; }
        public int UnitOfMeasurementId { get; set; }
        public string UOMName { get; set; }
        public double AvailableQuantity { get; set; }
        public double NewAvailableQuantity { get; set; }
    }
}
