using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public  class ReturnToVendorItemsModel
    {

        [Key]
        public int ReturnToVendorItemId { get; set; }
        public int VendorId { get; set; }
        public int ItemId { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public int? GoodsReceiptId { get; set; }
        public int CreditNoteNo { get; set; }
        public int StockId { get; set; }
        public string BatchNo { get; set; }
        public double Quantity { get; set; }
        public decimal ItemRate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal VAT { get; set; }
        public string Remark { get; set; }
        public string ReturnType { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public int CreatedBy { get; set; }

        [NotMapped]
        public string VendorName { get; set; }
        [NotMapped]
        public string ItemName { get; set; }

    }
}
