using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LASIKRSTModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string PachymetryMicrons { get; set; }
        public string PachymetryNotes { get; set; }
        public string FlapDepthMicrons { get; set; }
        public string FlapDepthNotes { get; set; }
        public string AblationDepthMicrons { get; set; }
        public string AblationDepthNotes { get; set; }
        public string PredictedRSTMicrons { get; set; }
        public string PredictedRSTNotes { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}


