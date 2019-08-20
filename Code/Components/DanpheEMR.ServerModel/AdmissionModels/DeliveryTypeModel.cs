using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DeliveryTypeModel
    {
        [Key]
        public int DeliveryTypeId { get; set; }
        public int DischargeConditionId { get; set; }
        public string DeliveryTypeName { get; set; }
    }
}
