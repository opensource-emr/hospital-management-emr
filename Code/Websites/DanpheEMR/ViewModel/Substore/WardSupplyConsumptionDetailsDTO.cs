namespace DanpheEMR.ViewModel.Substore
{
    /// <summary> The output class for ConsumptionDetails Endpoint in WardSupply Controller </summary>

    public class WardSupplyConsumptionDetailsDTO
    {
        public int WardId { get; set; }
        public string WardName { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public int PatientId { get; set; }
        public int Quantity { get; set; }
        public string Age { get; set; }
    }
}