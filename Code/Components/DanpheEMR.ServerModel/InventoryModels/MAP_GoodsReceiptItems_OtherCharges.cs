using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class MAP_GoodsReceiptItems_OtherCharges
    {


        [Key]
        public int Id { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public int ChargeId { get; set; }
        public int? VendorId { get; set; }
        public decimal? Amount { get; set; }
        public decimal? VATPercentage { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public GoodsReceiptItemsModel GoodsReceiptItems { get; set; }
    }
}
