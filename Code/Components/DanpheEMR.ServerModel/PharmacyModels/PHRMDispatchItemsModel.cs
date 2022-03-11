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
        public int? DispatchId { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public int ItemId { get; set; }
        public int? RequisitionId { get; set; }
        public int? RequisitionItemId { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal CostPrice { get; set; }
        public decimal MRP { get; set; }
        public double DispatchedQuantity { get; set; }
        public DateTime? DispatchedDate { get; set; }
        public string ReceivedBy { get; set; }
        public string ItemRemarks { get; set; }
        public string Remarks { get; set; }
        public string ReceivedRemarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ReceivedById { get; set; }
        public DateTime? ReceivedOn { get; set; }
    }
}
