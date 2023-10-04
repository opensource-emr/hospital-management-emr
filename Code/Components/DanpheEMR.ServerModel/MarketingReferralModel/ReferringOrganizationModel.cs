using DanpheEMR.ServerModel.SSFModels.SSFResponse;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MarketingReferralModel
{
    public class ReferringOrganizationModel
    {
        [Key]
        public int ReferringOrganizationId { get; set; }
        public string ReferringOrganizationName { get; set; }
        public string Address { get; set; }
        public string ContactNo { get; set; }
        public string ContactPersons { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        
    }
}
