using System;
using System.ComponentModel.DataAnnotations;


namespace DanpheEMR.ServerModel.ClaimManagementModels

{
    public class InsuranceClaim
    {
        [Key]
        public int ClaimSubmissionId { get; set; }
        public Int64? ClaimCode { get; set; }
        public string ClaimReferenceNo { get; set; }
        public int CreditOrganizationId { get; set; }
        public int PatientId { get; set; }
        public int SchemeId { get; set; }
        public string PatientCode { get; set; }
        public string MemberNumber { get; set; }
        public DateTime ClaimSubmittedOn { get; set; }
        public int ClaimSubmittedBy { get; set; }
        public string ClaimStatus { get; set; }
        public decimal TotalBillAmount { get; set; }
        public decimal ClaimableAmount { get; set; }
        public decimal NonClaimableAmount { get; set; }
        public decimal ClaimedAmount { get; set; }
        public string ClaimRemarks { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public decimal ApprovedAmount { get; set; }
        public decimal RejectedAmount { get; set; }
    }
}
