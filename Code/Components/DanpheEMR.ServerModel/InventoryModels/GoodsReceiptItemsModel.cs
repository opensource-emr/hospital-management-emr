using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
   public class GoodsReceiptItemsModel
    {
        [Key]
        public int GoodsReceiptItemId { get; set; }
        public int GoodsReceiptId { get; set; }
        public int ItemId { get; set; }
        public string BatchNO { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double ReceivedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public decimal ItemRate { get; set; }
        public decimal VATAmount { get; set; }
        public double? VAT { get; set; }
        public decimal TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal SubTotal { get; set; }
        public decimal MRP { get; set; }
        public double? DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal? CcCharge { get; set; }
        public decimal CcAmount { get; set; }
        public int CounterId { get; set; }
        public decimal? OtherCharge { get; set; }
        public virtual ItemMasterModel Item { get; set; }
        public  GoodsReceiptModel GoodsReceipt { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn {get; set; }
    }
}
