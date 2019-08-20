using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
   public class GoodReceiptItemsViewModel
    {
        public int? GoodReceiptItemId { get; set; }
        public int GoodReceiptId { get; set; }
        public string CompanyName { get; set; }
        public string SupplierName { get; set; }
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int GenericId { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime ManufactureDate { get; set; }
        public double ReceivedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public string UOMName { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal GRItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public double VATPercentage { get; set; }
        public double? CCCharge { get; set; }
        public double DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public string GenericName { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal MRP { get; set; }

        public double AvailableQuantity { get; set; }

        [NotMapped]
        public double QtyDiffCount { get; set; }
        [NotMapped]
        public string StkManageInOut { get; set; }
        [NotMapped]
        public bool? IsActive { get; set; }
        [NotMapped]
        public decimal? Price { get; set; }
        [NotMapped]
        public double? MinStockQuantity { get; set; }


    }
    public class GoodReceiptItemsForSaleViewModel
    {
        public int GoodReceiptItemId { get; set; }
        public int GoodReceiptId { get; set; }
        public string CompanyName { get; set; }
        public string SupplierName { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime ManufactureDate { get; set; }
        public double ReceivedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public string UOMName { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal GRItemPrice { get; set; }
        public decimal SubTotal { get; set; }
        public double VATPercentage { get; set; }
        public double? CCCharge { get; set; }
        public double DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal MRP { get; set; }

        public double AvailableQuantity { get; set; }

        [NotMapped]
        public double QtyDiffCount { get; set; }
        [NotMapped]
        public string StkManageInOut { get; set; }

    }
}
