using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class WriteOffItemsModel
    {
        [Key]
        public int WriteOffId { get; set; }
        public int StockId { get; set; }
        public int ItemId { get; set; }
        public decimal? ItemRate { get; set; }
        public double? WriteOffQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? WriteOffDate { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public string BatchNO { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        

    }
}
