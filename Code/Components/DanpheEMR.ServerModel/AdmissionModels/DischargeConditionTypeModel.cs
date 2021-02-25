using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DischargeConditionTypeModel
    {
        [Key]
        public int DischargeConditionId { get; set; }
        public int DischargeTypeId { get; set; }
        public string Condition { get; set; }

        [NotMapped]
        public List<DeliveryTypeModel> CurrentConditionTypes { get; set; }
    }
}
