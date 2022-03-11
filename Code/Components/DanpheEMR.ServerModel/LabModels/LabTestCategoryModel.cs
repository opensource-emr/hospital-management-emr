using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTestCategoryModel
    {
        [Key]
        public int TestCategoryId { get; set; }
        public string TestCategoryName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsDefault { get; set; }
        public int PermissionId { get; set; }
        public bool? IsActive { get; set; }
    }
}
