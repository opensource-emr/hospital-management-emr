using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class HospitalTransferRuleMappingModel
    {
        [Key]
        public int HospitalTransferRulesMapId { get; set; }
        public int HospitalId { get; set; }
        public int TransferRuleId { get; set; }
        public bool IsActive { get; set; }
    }
}
