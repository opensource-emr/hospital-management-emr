using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InventoryFiscalYearStock
    {
        [Key]
        public int FiscalYearStockId { get; set; }
        public int FiscalYearId { get; set; }
        public int StoreId { get; set; }
        public int StockId { get; set; }
        public int GRItemId { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal MRP { get; set; }
        public decimal Price { get; set; }
        public double? OpeningQty { get; set; }
        public double? ClosingQty { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
