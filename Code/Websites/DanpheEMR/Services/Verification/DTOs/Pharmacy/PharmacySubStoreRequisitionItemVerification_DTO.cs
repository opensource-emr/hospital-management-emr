using System;

namespace DanpheEMR.Services.Verification.DTOs.Pharmacy
{
    public class PharmacySubStoreRequisitionItemVerification_DTO
    {
        public int RequisitionItemId { get; set; }
        public int ItemId { get; set; }
        public double Quantity { get; set; }
        public double PendingQuantity { get; set; }
        public int RequisitionId { get; set; }
        public string RequisitionItemStatus { get; set; }
        public string Remark { get; set; }
        public double CancelQuantity { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public string Unit { get; set; }
        public virtual PharmacySubStoreRequisitionVerification_DTO Requisition { get; set; }
    }
}
