using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.DalLayer
{
    public class PHRMMRPHistoryModel
    {
        [Key]
        public int PHRMStockTxnItemMRPHistoryId { get; set; }
        public int PHRMStockTxnItemId { get; set; } //this depends on the location of the stock.
        public decimal? MRP { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int LocationId { get; set; }
        public decimal OldMRP { get; set; }
        public int StoreStockId { get; set; }
    }
}