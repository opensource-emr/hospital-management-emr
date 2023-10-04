using System;

namespace DanpheEMR.ViewModel.Substore
{

    /// <summary> The output class for Patient Consumption Item List Endpoint in WardSupply Controller </summary>
    public class WardSupplyPatientConsumptionItemDTO
    {
        public int ConsumptionId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public int Quantity { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string User { get; set; }
        public string Remark { get; set; }
        public int StoreId { get; set; }
        public int InvoiceItemId { get; set; }
        public int? InvoiceId { get; set; }
        public int wardId { get; set; }
    }
}