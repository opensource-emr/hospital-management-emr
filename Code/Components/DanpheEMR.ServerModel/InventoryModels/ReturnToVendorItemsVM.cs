using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public decimal? VAT { get; set; }
        public List<BatchDetail> BatchDetails { get; set; }
    }
}
