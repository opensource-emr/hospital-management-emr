using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class StockModel
    {
        [Key]
        public int StockId { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public int ItemId { get; set; }
        public string BatchNO { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double ReceivedQuantity { get; set; }
        public double AvailableQuantity { get; set; }
        public DateTime? ReceiptDate { get; set; }
        public int? CreatedBy  { get; set; }
        public DateTime? CreatedOn { get; set; }

        //Below properties for only information display
        //ItemRate and VATAmount need for Write-off functionality only for show to user
        [NotMapped]
        public decimal VATAmount { get; set; }
        [NotMapped]
        public decimal ItemRate { get; set; }

    }
}
