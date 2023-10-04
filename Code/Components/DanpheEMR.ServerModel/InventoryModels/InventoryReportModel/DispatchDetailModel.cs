using System;
using System.ComponentModel.DataAnnotations.Schema;


namespace DanpheEMR.ServerModel.ReportingModels
{
    public class DispatchDetailModel
    {
        public int? DispatchId { get; set; }
        public int? RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public DateTime DispatchedDate { get; set; }
        public int RequisitionItemId { get; set; }
        public int? ItemId { get; set; }
        public string Code { get; set; }
        public string ItemName { get; set; }
        public double? Quantity { get; set; }
        public double? PendingQuantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? DispatchedQuantity { get; set; }
        public decimal? CostPrice { get; set; }
        public double? Amt { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string RequestedByName { get; set; }
        public string DispatchedByName { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public string SourceStoreName { get; set; }
        public string TargetStoreName { get; set; }
        public string Specification { get; set; }
        [NotMapped]
        public string BarCodeNumber { get; set; }
        [NotMapped]
        public string ItemRemarks { get; set; }
        public bool IsDirectDispatched { get; set; }
    }
}
