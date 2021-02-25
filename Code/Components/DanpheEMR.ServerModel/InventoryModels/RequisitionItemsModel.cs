using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        public int Quantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public int? RequisitionId { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn{ get; set; }
        public string AuthorizedRemark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public double? CancelQuantity { get; set; }
        public DateTime?  CancelOn { get; set; }
        public int? CancelBy { get; set; }
        public string CancelRemarks { get; set; }
        public Boolean IsActive { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        [NotMapped]
        public string UOMName { get; set; }
        [NotMapped]
        public string Code { get; set; }
        [NotMapped]
        public bool IsEdited { get; set; }
        public virtual RequisitionModel Requisition { get; set; }
        public virtual ItemMasterModel Item { get; set; }
       // public virtual StockModel Stock { get; set; }
        //public virtual List<StockModel> Stock { get; set; }
    }
}
