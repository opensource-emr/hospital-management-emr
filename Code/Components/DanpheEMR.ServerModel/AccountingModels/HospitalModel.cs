using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class HospitalModel
    {
        [Key]
        public int HospitalId { get; set; }
        public string HospitalShortName { get; set; }
        public string HospitalLongName { get; set; }
        public bool IsActive { get; set; }
    }
}