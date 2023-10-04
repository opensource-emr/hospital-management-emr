using System;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    public class CreditOrganizationDTO
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsDefault { get; set; }
        public bool IsClaimManagementApplicable { get; set; }
        public bool IsClaimCodeCompulsory { get; set; }
        public bool IsClaimCodeAutoGenerate { get; set; }
        public string DisplayName { get; set; }
    }
}
