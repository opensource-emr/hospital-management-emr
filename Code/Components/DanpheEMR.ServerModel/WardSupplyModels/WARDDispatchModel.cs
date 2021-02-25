using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDDispatchModel
    {
        [Key]
        public int DispatchId { get; set; }

        public int? RequisitionId { get; set; }
        public int StoreId { get; set; }

        public decimal SubTotal { get; set; }

        public string Remark { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }
        public string ReceivedBy { get; set; }
        [NotMapped]
        public virtual List<WARDDispatchItemsModel> WardDispatchedItemsList { get; set; }

    }
}
