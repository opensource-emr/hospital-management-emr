using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DischargeTypeModel
    {
        [Key]
        public int DischargeTypeId { get; set; }
        public string DischargeTypeName { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

        [NotMapped]
        public List<DeathTypeModel> DeathTypes { get; set; }
        [NotMapped]
        public List<DischargeConditionTypeModel> DischargeConditionTypes { get; set; }
    }
}
