using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class MAP_GoodsReceipt_OtherCharges
    {
        [Key]
        public int Id { get; set; }
        public int GoodsReceiptID { get; set; }
        public int ChargeId { get; set; }
        public decimal? Amount { get; set; }
        public decimal? VATPercentage { get; set; }
        public decimal? VATAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public GoodsReceiptModel goodsReceiptModel { get; set; }
    }
}
