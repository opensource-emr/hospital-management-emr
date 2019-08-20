using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
   public class PHRMStockTransactionItemsModel
    {
        [Key]
        public int StockTxnItemId { get; set; }
        public int? ItemId { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double Quantity { get; set; }
        public double? FreeQuantity { get; set; }
        public decimal? Price { get; set; }
        public double DiscountPercentage { get; set; }
        public double VATPercentage { get; set; }
        public double? CCCharge { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public string InOut { get; set; }
        public int? ReferenceNo { get; set; }
        public DateTime? ReferenceItemCreatedOn { get; set; }
        public string TransactionType { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal? MRP { get; set; }
        public int? GoodsReceiptItemId { get; set; }
        public int DispensaryId { get; set; }
        public bool? IsTransferredToACC { get; set; }
        [NotMapped]
        public double? UpdatedQty { get; set; }
    }
}
