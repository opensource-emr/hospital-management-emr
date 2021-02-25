using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
    public class ADTInpatientCensusSummary
    {
        public string Ward { get; set; }
        public int NewAdmission { get; set; }
        public int TransIn { get; set; }
        public int TransOut { get; set; }
        public int Discharged { get; set; }
        public int InBed { get; set; }
        public int Total { get; set; }
    }
}
