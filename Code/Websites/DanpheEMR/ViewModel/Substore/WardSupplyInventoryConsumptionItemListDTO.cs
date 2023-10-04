namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for InventoryConsumptionItemList Endpoint in WardSupply Controller </summary>
    public class WardSupplyInventoryConsumptionItemListDTO
    {
        public string ItemName { get; set; }
        public double Quantity { get; set; }
        public string UsedBy { get; set; }
    }
}