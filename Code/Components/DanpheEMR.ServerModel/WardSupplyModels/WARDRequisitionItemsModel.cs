using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDRequisitionItemsModel
    {
        [Key]
        public int RequisitionItemId { get; set; }

        public int RequisitionId { get; set; }

        public int ItemId { get; set; }

        public int Quantity { get; set; }

        public int DispatchedQty { get; set; }
      
        //[NotMapped]
        //public string ItemName { get; set; }
        //[NotMapped]
        //public string BatchNo { get; set; }
        //[NotMapped]
        //public decimal? Price { get; set; }
        //[NotMapped]
        //public decimal? MRP { get; set; }
        //[NotMapped]
        //public decimal? GrItemPrice { get; set; }
        //[NotMapped]
        //public double? FreeQuantity { get; set; }
        //[NotMapped]
        //public decimal? SubTotal { get; set; }
        //[NotMapped]
        //public double? VATPercentage { get; set; }
        //[NotMapped]
        //public double? DiscountPercentage { get; set; }
        //[NotMapped]
        //public decimal? TotalAmount { get; set; }
        //[NotMapped]
        //public string BilItemStatus { get; set; }
        //[NotMapped]
        //public string Remark { get; set; }
        //[NotMapped]
        //public int? CreatedBy { get; set; }
        //[NotMapped]
        //public DateTime? CreatedOn { get; set; }
        //[NotMapped]
        //public int? CounterId { get; set; }

        //[NotMapped]
        //public DateTime? ExpiryDate { get; set; }
        //[NotMapped]
        //public int? GoodReceiptItemId { get; set; }
        //[NotMapped]
        //public double AvailableQuantity { get; set; }
    }
}
