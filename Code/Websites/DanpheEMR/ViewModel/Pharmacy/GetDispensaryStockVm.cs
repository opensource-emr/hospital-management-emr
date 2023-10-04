using System;

namespace DanpheEMR.ViewModel.Pharmacy
{

    public class GetDispensaryStockVm
    {
        public int ItemId { get; set; }
        public string GenericName { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal SalePrice { get; set; }
        public decimal CostPrice { get; set; }
        public double AvailableQuantity { get; set; }
        public bool? IsInsuranceApplicable { get; set; }
        public decimal? GovtInsurancePrice { get; set; }
        public string RackNo { get; set; }
        public int StoreId { get; set; }
        public string  StoreName { get; set; }

    }
}
