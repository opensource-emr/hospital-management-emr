using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //swapnil-2-april-2021
    public class FixedAssetDispatchItemsModel
    {
        [Key]
        public int? DispatchItemId { get; set; }

        public int? DispatchId { get; set; }
        public int? RequisitionId { get; set; }
        public int? RequisitionItemId { get; set; }

        public int ItemId { get; set; }

        public string ItemName { get; set; }

        public string BatchNo { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public string BarCodeNumber { get; set; }

        public decimal? MRP { get; set; }

        public decimal? Price { get; set; }

        public decimal SubTotal { get; set; }

        public string Remark { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }
        [NotMapped]
        public double? RequestedQuantity { get; set; }
        [NotMapped]
        public double? ReceivedQuantity { get; set; }
        [NotMapped]
        public double? PendingQuantity { get; set; }
        [NotMapped]
        public double? CancelgQuantity { get; set; }
        [NotMapped]
        public double? DispatchedQuantity { get; set; }
        public int? FixedAssetStockId { get; set; }
    }
}
