using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
    public class InpatientServiceReportModel
    {
        public string InpatientOutcome { get; set; }
        public string GestationalWeek_Gravda { get; set; }
        public string GestationalWeek_MaternalAge { get; set; }
        public string FreeHealthServiceSummary { get; set; }
        public string FreeHealthServiceSummary_SSP { get; set; } // Free Health Service Summary and Social Service Programme
        public string DeathSummary { get; set; }
        public string SurgerySummary { get; set; }
    }
}
