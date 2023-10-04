namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for RequisitionItemsById Endpoint in WardSupply Controller </summary>
    public class WardSupplyRequisitionItemsByIdDTO
    {
        public int RequisitionItemId { get; set; }
        public int RequisitionId { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public int DispatchedQty { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public bool enableItmSearch { get; set; }
    }
}