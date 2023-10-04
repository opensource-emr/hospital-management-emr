using System;

namespace DanpheEMR.Services.Verification.DTOs
{
    public class PharmacyPurchaseOrderVerifierSignatory_DTO
    {
        public string FullName { get; set; }
        public string EmployeeRoleName { get; set; }
        public DateTime? VerifiedOn { get; set; }
        public string VerificationStatus { get; set; }
        public string VerificationRemarks { get; set; }
        public int CurrentVerificationLevel { get; set; }

    }
}
