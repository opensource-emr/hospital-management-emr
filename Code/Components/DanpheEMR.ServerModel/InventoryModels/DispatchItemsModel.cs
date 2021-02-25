using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class DispatchItemsModel
    {
        [Key]
        public int DispatchItemsId { get; set; }
        public int? DepartmentId { get; set; }
        public int RequisitionId { get; set; } //added later for easier use, hospitals like MIKC may face issue if we use this one.
        public int RequisitionItemId { get; set; }
        public double DispatchedQuantity { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public int ItemId { get; set; }
        public int DispatchId { get; set; }

        public int StoreId { get; set; }
        public int? ReceivedById { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
    }
}
