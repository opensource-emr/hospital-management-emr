using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDDispatchItemsModel
    {
        [Key]
        public int DispatchItemId { get; set; }

        public int DispatchId { get; set; }

        public int? RequisitionItemId { get; set; }

        public int ItemId { get; set; }

        public string ItemName { get; set; }

        public string BatchNo { get; set; }

        public DateTime ExpiryDate { get; set; }

        public int Quantity { get; set; }

        public decimal? MRP { get; set; }

        public decimal SubTotal { get; set; }

        public string Remark { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }

        [NotMapped]
        public int TotalQty { get; set; }
    }
}
