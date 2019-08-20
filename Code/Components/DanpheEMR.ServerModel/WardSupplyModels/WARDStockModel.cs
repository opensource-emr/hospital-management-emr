using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDStockModel
    {
        [Key]
        public int StockId { get; set; }

        public int? WardId { get; set; }

        public int ItemId { get; set; }

        public int AvailableQuantity { get; set; }

        public double MRP { get; set; }

        public string BatchNo { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? DepartmentId { get; set; }

        public string StockType { get; set; }  

        [NotMapped]
        public int newWardId { get; set; }

        [NotMapped]
        public int? DispachedQuantity { get; set; }

        [NotMapped]
        public string WardName { get; set; }

        [NotMapped]
        public string ItemName { get; set; }

        [NotMapped]
        public string Remarks { get; set; }

    }
}
