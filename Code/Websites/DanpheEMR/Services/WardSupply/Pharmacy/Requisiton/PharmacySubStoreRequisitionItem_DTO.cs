using DanpheEMR.ServerModel;
using System;

namespace DanpheEMR.Services.WardSupply.Pharmacy.Requisiton
{
    public class PharmacySubStoreRequisitionItem_DTO
    {
        public int RequisitionItemId { get; set; }
        public int ItemId { get; set; }
        public double Quantity { get; set; }
        public double ReceivedQuantity { get; set; }
        public double PendingQuantity { get; set; }
        public int RequisitionId { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn { get; set; }
        public string AuthorizedRemark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public double CancelQuantity { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public virtual PharmacySubStoreRequisition_DTO Requisition { get; set; }
    }
}
