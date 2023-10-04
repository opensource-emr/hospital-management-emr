using System.Collections.Generic;
using System;

namespace DanpheEMR.Services.Verification.DTOs.Pharmacy
{
    public class PharmacySubStoreRequisitionVerification_DTO
    {
        public int RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public int StoreId { get; set; }
        public DateTime RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public virtual List<PharmacySubStoreRequisitionItemVerification_DTO> RequisitionItems { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public int MaxVerificationLevel { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public string VerificationStatus { get; set; }
        public bool IsVerificationAllowed { get; set; }
        public string  VerificationRemarks { get; set; }
        public int? VerificationId { get; set; }
        public string TransactionType { get; set; }
    }
}
