using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PachymetryModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public DateTime? Date { get; set; }
        public string TimePointPre { get; set; }
        public string USMin{ get; set; }
        public string VisanteRST { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}


