using System;

public class PHRMUpdatedStockVM
{
    public int? StockId { get; set; } //for dispensary
    public int? ItemId { get; set; } //for store
    public string BatchNo { get; set; } // for store
    public DateTime? ExpiryDate { get; set; }//for store
    public int? GoodsReceiptItemId { get; set; }//for store
    public int LocationId { get; set; }
    public decimal MRP { get; set; }
    public DateTime? OldExpiryDate { get; set; }
    public string OldBatchNo { get; set; }
    public decimal OldMRP { get; set; }
    public decimal CostPrice { get; set; }
}