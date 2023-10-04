using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System;

namespace DanpheEMR.Services.Inventory.DTO.InventoryRequisition
{
    public class InventoryRequisitionItem_DTO
    {
        public int RequisitionItemId { get; set; }
        public int ItemId { get; set; }
        public double Quantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public int? RequisitionId { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn { get; set; }
        public string AuthorizedRemark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public double? CancelQuantity { get; set; }
        public DateTime? CancelOn { get; set; }
        public int? CancelBy { get; set; }
        public string CancelRemarks { get; set; }
        public DateTime? MatIssueDate { get; set; }
        public string MatIssueTo { get; set; }
        public string MSSNO { get; set; }
        public string FirstWeekQty { get; set; }
        public string SecondWeekQty { get; set; }
        public string ThirdWeekQty { get; set; }
        public string FourthWeekQty { get; set; }
        public DateTime? MINDate { get; set; }
        public string MINNo { get; set; }
        public bool IsActive { get; set; }
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }
        public bool IsEdited { get; set; }
        public double AvailableQuantity { get; set; }
        public virtual RequisitionModel Requisition { get; set; }
        public string ItemCategory { get; set; }
        public string Specification { get; set; }
        public virtual List<BarCodeNumberDTO> BarCodeList { get; set; }
        public double? CostPrice { get; set; }
    }
}
