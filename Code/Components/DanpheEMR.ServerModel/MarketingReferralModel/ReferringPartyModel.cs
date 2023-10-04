using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MarketingReferralModel
{
    public class ReferringPartyModel
    {
        [Key]
        public int ReferringPartyId { get; set; }
        public string ReferringPartyName { get; set; }
        public int ReferringPartyGroupId { get; set; }
        public int ReferringOrgId { get; set; }
        public string Address { get; set; }
        public string VehicleNumber { get; set; }
        public string ContactNumber { get; set; }
        public string AreaCode { get; set; }
        public string PANNumber { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }


    }
}
