using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class WavefrontModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public DateTime? Date { get; set; }
        public string Timepoint { get; set; }
        public string Coma { get; set; }
        public string SphAb { get; set; }
        public string HoRMS { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}


