using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTypesModel
    {
        [Key]
        public int LabTypeId { get; set; }
        public string LabTypeName { get; set; }
        public string DisplayName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public int? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
        public bool IsDefault { get; set; }
    }
}
