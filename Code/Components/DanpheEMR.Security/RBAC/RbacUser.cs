using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using DanpheEMR.ServerModel;

namespace DanpheEMR.Security
{

    public partial class RbacUser : ICloneable
    {
        [Key]
        public int UserId { get; set; }
        public int EmployeeId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public List<RbacRole> Roles { get; set; }

        public bool? IsActive { get; set; }

        public bool? NeedsPasswordUpdate { get; set; }

        public RbacUser()
        {
            Roles = new List<RbacRole>();
        }

        public object Clone()
        {
            return this.MemberwiseClone();
        }

        public EmployeeModel Employee { get; set; }
        //Ajay 07Aug19 added landing page route
        public int? LandingPageRouteId { get; set; }
    }

}
