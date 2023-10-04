using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WARDSupplyAssetRequisitionItemsModel
    {
        [Key]
        public int RequisitionItemId { get; set; }
        public int? ItemId { get; set; }
        public int? Quantity { get; set; }
        public int RequisitionId { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity  { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public int? IssueNo { get; set; }
        public double? CancelQuantity { get; set; }
        public int? CancelBy { get; set; }
        public DateTime? CancelOn { get; set; }
        public bool IsActive { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public string CancelRemarks { get; set; }






    }
}
