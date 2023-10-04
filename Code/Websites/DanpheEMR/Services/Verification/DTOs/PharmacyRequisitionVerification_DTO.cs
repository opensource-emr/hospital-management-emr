using System;

namespace DanpheEMR.Services.Verification.DTOs
{
    public class PharmacyRequisitionVerification_DTO
    {
        public int RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public DateTime RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public string RequestedBy { get; set; }
        public string RequestedStoreName { get; set; }
        public int? CancelledBy { get; set; }
        public string CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public int MaxVerificationLevel { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public string VerificationStatus { get; set; }
        public bool IsVerificationAllowed { get; set; }
        public int? VerificationId { get; set; }
        public string VerifierIds { get; set; }
        public bool IsVerificationEnabled { get; set; }
    }
}
