using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class MembershipTypeModel
    {
        [Key]
        public int MembershipTypeId { get; set; }
        public string MembershipTypeName { get; set; }
        public string Description { get; set; }
        public double DiscountPercent { get; set; }
        public int? ExpiryMonths { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        public string CommunityName { get; set; }//sundeep:7Nov'19
    }

}
