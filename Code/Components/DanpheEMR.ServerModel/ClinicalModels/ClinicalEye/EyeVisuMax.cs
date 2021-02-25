using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EyeVisuMaxsModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public int? Thickness { get; set; }
        public int? Diameter { get; set; }
        public string Hinge { get; set; }
        public string Glass { get; set; }
        public string Sidecut { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}


