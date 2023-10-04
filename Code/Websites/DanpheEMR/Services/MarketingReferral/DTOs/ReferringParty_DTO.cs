namespace DanpheEMR.Services.MarketingReferral.DTOs
{
    public class ReferringParty_DTO
    {
        public int ReferringPartyId { get; set; }
        public int ReferringPartyGroupId { get; set; }
        public int ReferringOrgId { get; set; }
        public string ReferringPartyName { get; set; }
        public string GroupName { get; set; }
        public string ReferringOrganizationName { get; set; }
        public string Address { get; set; }
        public string VehicleNumber { get; set; }
        public string ContactNumber { get; set; }
        public string AreaCode { get; set; }
        public string PANNumber { get; set; }
        public bool IsActive { get; set; }
    }
}
