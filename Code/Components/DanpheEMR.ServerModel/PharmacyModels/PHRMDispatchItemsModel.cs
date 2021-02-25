using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class PHRMDispatchItemsModel
    {
        [Key]
        public int DispatchItemsId { get; set; }
        public int RequisitionItemId { get; set; }
        public double DispatchedQuantity { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ReceivedBy { get; set; }
        public int ItemId { get; set; }
        public int DispatchId { get; set; }


    }
}
