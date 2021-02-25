using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMStoreModel
    {
        [Key]
        public int StoreId { get; set; }
        public int ParentStoreId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Address { get; set; }
        public string ContactNo { get; set; }
        public string Email { get; set; }
        public string StoreLabel { get; set; }
        public string StoreDescription { get; set; }
        public int PermissionId { get; set; }
        public int MaxVerificationLevel { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public Boolean IsActive { get; set; }
        [NotMapped]
        public List<StoreVerificationMapModel> StoreVerificationMapList { get; set; }
    }
}