using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class VerificationCoreCFGModel
    {
        public bool EnableVerificationStep { get; set; }
        public int? VerificationLevel { get; set; }
        public bool ShowVerifierSignature { get; set; }
        public string PreliminaryReportText { get; set; }
    }
}
