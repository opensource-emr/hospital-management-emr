using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.DalLayer
{
    public class PHRMExpiryDateBatchNoHistoryModel
    {
        [Key] 
        public int PHRMStockBatchExpiryHistoryId { get; set; }
        public int StockId { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int CreatedBy { get; set; }

    }
}