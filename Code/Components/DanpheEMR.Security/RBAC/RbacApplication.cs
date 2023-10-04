using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace DanpheEMR.Security
{
    public partial class RbacApplication
    {
        [Key]
        public int ApplicationId { get; set; }
        public string ApplicationCode { get; set; }
        public string ApplicationName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public List<RbacRole> Roles { get; set; }
        public List<RbacPermission> Permissions { get; set; }
    }
}
