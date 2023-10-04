using System;
using System.Web.UI.WebControls;

namespace DanpheEMR.Services.Dispensary.DTOs
{
    public class DispensaryAvailableStockDetail_DTO
    {
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ItemName { get; set; }
        public decimal SalePrice { get; set; }
        public decimal NormalSalePrice { get; set; }
        public string Unit { get; set; }
        public decimal CostPrice { get; set; }
        public double AvailableQuantity { get; set; }
        public bool IsActive { get; set; }
        public string GenericName { get; set; }
        public int GenericId { get; set; }
        public bool IsNarcotic { get; set; }
        public bool IsVATApplicable { get; set; }
        public double SalesVATPercentage { get; set; }

    }
}
