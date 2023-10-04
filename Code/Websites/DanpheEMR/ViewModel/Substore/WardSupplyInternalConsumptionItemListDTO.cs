namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for Internal Consumption Item List Endpoint in WardSupply Controller </summary>

    public class WardSupplyInternalConsumptionItemListDTO
    {
        public int ConsumptionItemId { get; set; }
        public string GenericName { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public int ConsumedQuantity { get; set; }
    }
}