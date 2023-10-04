using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MarketingReferralModel
{
    public class ReferralSchemeModel
    {
        [Key]
        public int ReferralSchemeId { get; set; }
        public string ReferralSchemeName { get; set; }
        public string Description { get; set; }
        public decimal ReferralPercentage { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy  { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
