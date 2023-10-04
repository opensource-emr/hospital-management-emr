using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class WARDStockModel
    {
        [Key]
        public int StockId { get; set; }

        public int? WardId { get; set; }
        public int StoreId { get; set; }

        public int ItemId { get; set; }

        public int AvailableQuantity { get; set; }

        public double SalePrice { get; set; }

        public string BatchNo { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? DepartmentId { get; set; }

        public string StockType { get; set; }
        public decimal? Price { get; set; }

        [NotMapped]
        public int newWardId { get; set; }

        [NotMapped]
        public int? DispachedQuantity { get; set; }

        [NotMapped]
        public string WardName { get; set; }

        [NotMapped]
        public string ItemName { get; set; }

        [NotMapped]
        public string Remarks { get; set; }
        [NotMapped]
        public decimal CostPrice { get; set; }

    }
}
