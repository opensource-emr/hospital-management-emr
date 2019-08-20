using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace DanpheEMR.Security
{

    public partial class RbacRole
    {
        [Key]
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string RoleDescription { get; set; }
        public int? ApplicationId { get; set; }
        public bool IsSysAdmin { get; set; }
        public bool IsActive { get; set; }
        public int? RolePriority { get; set; }
        [ForeignKey("Route")]
        public int? DefaultRouteId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        // public int RouteId { get; set; } 
        public RbacApplication Application { get; set; }
        public List<RbacPermission> Permissions { get; set; }
        public List<RbacUser> Users { get; set; }
        public DanpheRoute Route { get; set; }

        public RbacRole()
        {
            Permissions = new List<RbacPermission>();
            Users = new List<RbacUser>();
        }
    }
}
