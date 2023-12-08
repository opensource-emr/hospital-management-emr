using System;

namespace DanpheEMR.Services.WardSupply.Inventory.Requisition.DTOs
{
    public class SubStoreRequisitionItems_DTO
    {
        public double? PendingQuantity { get; set; }
        public double Quantity { get; set; }
        public double DispatchedQuantity { get; set; }
        public string Remark { get; set; }
        public double ReceivedQuantity { get; set; }
        public double CancelQuantity { get; set; }
        public int CreatedBy { get; set; }
        public int? CancelBy { get; set; }
        public DateTime? CancelOn { get; set; }
        public string CancelRemarks { get; set; }
        public string CreatedByName { get; set; }
        public DateTime CreatedOn { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string ItemName { get; set; }
        public string Code { get; set; }
        public decimal TotalAmount { get; set; }
        public int? RequisitionNo { get; set; }
        public int? RequisitionId { get; set; }
        public string ReceivedBy { get; set; }
        public DateTime? MINDate { get; set; }
        public string MSSNO { get; set; }
        public int RequisitionItemId { get; set; }
        public string ItemCategory { get; internal set; }
        public bool IsActive { get; set; }
        public string CancelledByName { get; set; }
    }
}
