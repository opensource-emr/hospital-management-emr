using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMDispensaryStockModel
    {
        [Key]
        public int StockId { get; set; }
        public int? DispensaryId { get; set; }
        public int? ItemId { get; set; }
        public string BatchNo { get; set; }
        public double? AvailableQuantity { get; set; }
        public decimal? MRP { get; set; }
        public decimal? Price { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? GoodReceiptItemId { get; set; }
        [NotMapped]
        public string InOut { get; set; }
    }

    //ViewModel for displaying stock report of dispensary
    public class PHRMDispensaryStockViewModel
    {
        public int ItemId { get; set; }
        public int StockId { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate{get;set;}
        public string ItemName { get; set; }
        public double AvailableQuantity { get; set; }
        public decimal? MRP { get; set; }
        public decimal? Price { get; set; }
        public int GoodsReceiptItemId { get; set; }

    }
}
