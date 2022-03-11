using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMWriteOffItemsModel
    {
        [Key]
        public int WriteOffItemId { get; set; }
        public int WriteOffId { get; set; }
        [NotMapped]
        public int? GoodReceiptItemId { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public decimal ItemPrice { get; set; }
        public double WriteOffQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public string WriteOffItemRemark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        [NotMapped]
        public DateTime? ExpiryDate { get; set; }
        [NotMapped]
        public int? FreeQuantity { get; set; }
        [NotMapped]
        public decimal? MRP { get; set; }
        
        public List<PHRMGoodsReceiptItemsModel> SelectedGRItems = new List<PHRMGoodsReceiptItemsModel>();

    }
}
