using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.DalLayer
{
    public class PHRMMRPHistoryModel
    {
        [Key]
        public int PHRMStockMRPHistoryId { get; set; }
        public decimal? MRP { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int StockId { get; set; }

    }
}