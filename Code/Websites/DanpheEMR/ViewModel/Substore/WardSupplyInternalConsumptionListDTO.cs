using System;

namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for Internal Consumption List Endpoint in WardSupply Controller </summary>

    public class WardSupplyInternalConsumptionListDTO
    {
        public int ConsumptionId { get; set; }
        public DateTime ConsumedDate { get; set; }
        public string SubStoreName { get; set; }
        public string ConsumedBy { get; set; }
        public string Remark { get; set; }
    }
}