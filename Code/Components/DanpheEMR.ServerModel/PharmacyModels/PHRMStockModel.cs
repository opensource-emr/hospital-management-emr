using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PHRMStockModel
    {
        [Key]
        public int StockId { get; set; }
        public int? ItemId { get; set; }
        public double? AvailableQuantity { get; set; }
        public string BatchNo { get; set; }
    }
}
