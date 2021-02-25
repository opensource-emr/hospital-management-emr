using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class AblationProfileModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string Profile { get; set; }
        public string DZPFactor { get; set; }
        public Boolean isSXDone { get; set; }
        public Boolean isPTKPerformed { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }
        public string Notes { get; set; }
    }
}

