using System;
using System.Security.Claims;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class PendingClaimDTO
    {
		public int ClaimSubmissionId;
		public Int64 ClaimCode;
		public string HospitalNo;
		public string PatientName;
		public int PatientId;
		public string AgeSex;
		public string MemberNumber;
		public decimal TotalBillAmount;
		public decimal NonClaimableAmount;
		public decimal ClaimableAmount;
		public decimal ClaimedAmount;
		public decimal ApprovedAmount;
		public decimal RejectedAmount;
		public string ClaimSubmittedBy;
		public decimal TotalReceivedAmount;
		public decimal ServiceCommissionAmount;
		public decimal PendingAmount;
		public int CreditOrganizationId;
    }
}
