using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class RequisitionItemsModel
    {
        [Key]
        public int RequisitionItemId { get; set; }
        public int ItemId { get; set; }
        public decimal Quantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public int? RequisitionId { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public int AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn{ get; set; }
        public string AuthorizedRemark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
       
     
   
        public virtual RequisitionModel Requisition { get; set; }
        public virtual ItemMasterModel Item { get; set; }
       // public virtual StockModel Stock { get; set; }
        //public virtual List<StockModel> Stock { get; set; }
    }
}
