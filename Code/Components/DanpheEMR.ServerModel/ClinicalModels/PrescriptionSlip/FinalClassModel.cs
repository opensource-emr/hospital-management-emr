using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FinalClassModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string SphOD { get; set; }
        public string SphOS { get; set; }
        public string CylOD { get; set; }
        public string CylOS { get; set; }
        public string AxisOD { get; set; }
        public string AxisOS { get; set; }
        public string VaOD { get; set; }
        public string VaOS { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}