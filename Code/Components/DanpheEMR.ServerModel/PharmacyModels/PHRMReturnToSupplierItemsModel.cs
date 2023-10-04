using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
   public class PHRMReturnToSupplierItemsModel
    {
        [Key]
        public int ReturnToSupplierItemId { get; set; }
        public int ReturnToSupplierId { get; set; }
        public int ItemId { get; set; }
        public int GoodReceiptItemId { get; set; }
        public string BatchNo { get; set; }
        public double? FreeQuantity { get; set; }
        public decimal? FreeAmount { get; set; }
        [NotMapped]
        public int? FreeQuantityReturn { get; set; }
        [NotMapped]
        public decimal? FreeAmountReturn { get; set; }
        public decimal? FreeRate { get; set; }
        public double Quantity { get; set; }
        public decimal OldItemPrice { get; set; }
        public decimal ItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public double DiscountPercentage { get; set; }
        public decimal DiscountedAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal CCAmount { get; set; }
        public decimal ReturnRate { get; set; }
        public decimal ReturnCostPrice { get; set; }//sud,Rohit:6Jul'22 -- This is different than ReturnRate
        public double VATPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ReturnRemarks { get; set; }
        public decimal SalePrice { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        [NotMapped]
        public int StockId { get; set; }
        public List<PHRMGoodsReceiptItemsModel> SelectedGRItems = new List<PHRMGoodsReceiptItemsModel>();

    }
}
