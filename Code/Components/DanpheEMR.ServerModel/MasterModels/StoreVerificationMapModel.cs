using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class StoreVerificationMapModel
    {
        [Key]
        public int StoreVerificationMapId { get; set; }
        public int StoreId { get; set; }
        public int MaxVerificationLevel { get; set; }
        public int VerificationLevel { get; set; }
        public int PermissionId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public Boolean IsActive { get; set; }
        [NotMapped]
        public string NewRoleName { get; set; }
        [NotMapped]
        public int RoleId { get; set; }
    }
}
