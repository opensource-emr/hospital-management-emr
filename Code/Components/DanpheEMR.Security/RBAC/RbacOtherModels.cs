using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace DanpheEMR.Security
{
    public class RolePermissionMap
    {
        [Key]
        public int RolePermissionMapId { get; set; }
        public int RoleId { get; set; }
        public int PermissionId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public RbacPermission Permission { get; set; }
        public RbacRole Role { get; set; }
    }

    public class UserRoleMap
    {
        public int UserRoleMapId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public RbacUser User { get; set; }
        public RbacRole Role { get; set; }

    }

}
