using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
    public class OutpatientMorbidityReportViewModel
    {
        public string ReportingGroupCount { get; set; }
        public string OtherICDCount { get; set; } //  Count of ICD10 other than 232 ICDs provided by government 
        public string TotalVisitCount { get; set; }
        public string IcdVersion { get; set; }
    }
}
