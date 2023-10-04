using System;

namespace DanpheEMR.ViewModel.Substore
{

    /// <summary> The output class for Internal Consumption Details Endpoint in WardSupply Controller </summary>
    public class WardSupplyInternalConsumptionDetailsDTO
    {
        public int ConsumptionId { get; set; }
        public int ConsumptionItemId { get; set; }
        public string ItemName { get; set; }
        public int ItemId { get; set; }
        public int SubStoreId { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public double SalePrice { get; set; }
        public int Quantity { get; set; }
        public double TotalAmount { get; set; }
        public string Remark { get; set; }
        public string User { get; set; }
        public string Department { get; set; }
        public int DepartmentId { get; set; }
        public DateTime Date { get; set; }
        public int GenericId { get; set; }
        public string GenericName { get; set; }
    }
}