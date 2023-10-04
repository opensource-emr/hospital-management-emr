using System;

namespace DanpheEMR.Services.MarketingReferral.DTOs
{
    public class ReferringPartyGroup_DTO
    {
        public int ReferringPartyGroupId { get; set; }
        public string GroupName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
