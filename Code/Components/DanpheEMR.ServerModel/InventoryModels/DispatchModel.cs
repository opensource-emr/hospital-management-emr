using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class DispatchModel
    {
        [Key]
        public int DispatchId { get; set; }
        public int RequisitionId { get; set; }
        public int FiscalYearId { get; set; }
        public int DispatchNo { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string Remarks { get; set; }
        public int? ReqDisGroupId { get; set; }
        public int? ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        public List<DispatchItemsModel> DispatchItems { get; set; } = new List<DispatchItemsModel>();

    }
}
