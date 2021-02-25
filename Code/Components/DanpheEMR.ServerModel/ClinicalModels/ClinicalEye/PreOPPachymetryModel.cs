using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PreOPPachymetryModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string Profile { get; set; }
        public int PentMin { get; set; }
        public int PentCentral { get; set; }
        public int USMin { get; set; }
        public int VisanteMin { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}

