using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
   public class StockItemsReportViewModel
    {
        public int? ItemId { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string ItemName { get; set; }
        public double? AvailableQuantity { get; set; }
        public decimal? MRP { get; set; }
        public decimal? GRItemPrice { get; set; }
        public decimal? TotalAmount { get; set; }
        public Boolean IsActive { get; set; }
        public double? MinStockQuantity { get; set; }
        public string Location { get; set; }


    }
}
