using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{

    public class GetDispensaryStockVm
    {
        public int ItemId { get; set; }
        public string GenericName { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal MRP { get; set; }
        public decimal CostPrice { get; set; }
        public double AvailableQuantity { get; set; }
        public bool? IsInsuranceApplicable { get; set; }
        public decimal? GovtInsurancePrice { get; set; }
    }
}
