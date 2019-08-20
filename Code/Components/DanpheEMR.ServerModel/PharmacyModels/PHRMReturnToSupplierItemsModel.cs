using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public int? FreeQuantity { get; set; }
        public decimal? FreeAmount { get; set; } 
        public decimal? FreeRate { get; set; }
        public int Quantity { get; set; }
        public decimal ItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public double DiscountPercentage { get; set; }
        public double VATPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string ReturnRemarks { get; set; }
        public decimal MRP { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public List<PHRMGoodsReceiptItemsModel> SelectedGRItems = new List<PHRMGoodsReceiptItemsModel>();

    }
}
