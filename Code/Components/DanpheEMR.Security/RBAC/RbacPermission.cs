using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace DanpheEMR.Security
{
    public partial class RbacPermission
    {
        [Key]
        public int PermissionId { get; set; }
        public string PermissionName { get; set; }
        public string Description { get; set; }
        public int? ApplicationId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public RbacApplication Application { get; set; }
        public List<RbacRole> Roles { get; set; }
        public RbacPermission()
        {
            Roles = new List<RbacRole>();
        }

    }
}
