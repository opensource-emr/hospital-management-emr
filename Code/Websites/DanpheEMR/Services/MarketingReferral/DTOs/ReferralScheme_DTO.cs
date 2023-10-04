using System.ComponentModel.DataAnnotations;
using System;

namespace DanpheEMR.Services.MarketingReferral.DTOs
{
    public class ReferralScheme_DTO
    {
        public int ReferralSchemeId { get; set; }
        public string ReferralSchemeName { get; set; }
        public string Description { get; set; }
        public decimal ReferralPercentage { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }


    }
}
