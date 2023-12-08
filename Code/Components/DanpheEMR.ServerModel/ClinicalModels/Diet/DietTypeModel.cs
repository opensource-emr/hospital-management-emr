using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ClinicalModels.Diet
{
    public class DietTypeModel
    {
        [Key]
        public int DietTypeId { get; set; }
        public string DietTypeCode { get; set; }
        public string DietTypeName { get; set; }
        public int DisplayOrder { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
