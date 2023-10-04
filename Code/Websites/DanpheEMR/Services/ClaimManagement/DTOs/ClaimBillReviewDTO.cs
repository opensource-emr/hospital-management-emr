using System;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class ClaimBillReviewDTO
    {
        public int CreditStatusId;
        public Int64? ClaimCode;
        public int InvoiceRefId;
        public int FiscalYearId;
        public string HospitalNo;
        public string PatientName;
        public int PatientId;
        public string AgeSex;
        public DateTime? DateOfBirth;
        public string MemberNo;
        public string InvoiceNo;
        public DateTime InvoiceDate;
        public string SchemeName;
        public int SchemeId;
        public int CreditOrganizationId;
        public decimal TotalAmount;
        public decimal NetCreditAmount;
        public decimal NonClaimableAmount;
        public string ClaimStatus;
        public string VisitType;
        public DateTime? AdmissionDate;
        public DateTime? DischargeDate;
        public string CreditModule;
        public bool IsClaimable;
        public bool IsSelected;
        public int? ClaimSubmissionId;
    }
}
