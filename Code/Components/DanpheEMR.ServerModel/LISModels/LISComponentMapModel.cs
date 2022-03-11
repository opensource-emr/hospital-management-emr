using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LISComponentMapModel
    {
        [Key]
        public int LISComponentMapId { get; set; }
        public int LISComponentId { get; set; }
        public int ComponentId { get; set; }
        public int MachineId { get; set; }
        public bool IsActive { get; set; }
        public int ConversionFactor { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        [NotMapped]
        public string MachineName { get; set; }
        [NotMapped]
        public string ComponentName { get; set; }
        [NotMapped]
        public string LISComponentName { get; set; }
    }
}
