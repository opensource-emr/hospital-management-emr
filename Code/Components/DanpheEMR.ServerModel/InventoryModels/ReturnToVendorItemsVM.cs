using System.Collections.Generic;

namespace DanpheEMR.ServerModel
{
    public class ReturnToVendorItemsVM
    {
        public class BatchDetail
        {
            public string BatchNo { get; set; }
            public double? AvailQty { get; set; }
            public decimal ItemRate { get; set; }
            public int StockId { get; set; }
            public int GRId { get; set; }
            public int GoodsReceiptId { get; set; }
            public int? GoodReceiptNo { get; set; }
        }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string FiscalYearFormatted { get; set; }
        public List<BatchDetail> BatchDetails { get; set; }
    }
}
