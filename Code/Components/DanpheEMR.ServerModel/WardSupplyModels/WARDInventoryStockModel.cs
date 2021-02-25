using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDInventoryStockModel
    {
        [Key]
        public int StockId { get; set; }
        public int StoreId { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public int ItemId { get; set; }
        public double AvailableQuantity { get; set; }
        public decimal MRP { get; set; }
        public decimal? Price { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? DepartmentId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        [NotMapped]
        public int? DispachedQuantity { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        [NotMapped]
        public string Remarks { get; set; }
        public double UnConfirmedQty { get; set; } = 0;
    }
}
