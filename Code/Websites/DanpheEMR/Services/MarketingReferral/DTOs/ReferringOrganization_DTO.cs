using System;

namespace DanpheEMR.Services.MarketingReferral.DTOs
{
    public class ReferringOrganization_DTO
    {
        public int ReferringOrganizationId { get; set; }
        public string ReferringOrganizationName { get; set; }
        public string Address { get; set; }
        public string ContactNo { get; set; }
        public string ContactPersons { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
