using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LaserDataEntryModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string Profile { get; set; }
        public double? Sph { get; set; }
        public double? Cyf { get; set; }
        public int? Axis { get; set; }
        public string Zone { get; set; }
        public string Transmission { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}

