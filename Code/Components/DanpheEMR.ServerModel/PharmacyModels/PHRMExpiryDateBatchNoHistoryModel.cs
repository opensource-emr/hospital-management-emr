using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.DalLayer
{
    public class PHRMExpiryDateBatchNoHistoryModel
    {
        [Key]
        public int PHRMExpBatchHistoryId { get; set; }
        public int StoreStockId { get; set; } //this depends on the location of the stock.
        public int CreatedBy { get; set; }
        public DateTime? OldExpiryDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string OldBatchNo { get; set; }
    }
}