using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.EmergencyModels
{
    public class EmergencyDischargeSummaryVM
    {
        public EmergencyPatientModel EmergencyPatient { get; set; }
        public VitalsModel Vitals { get; set; }
        public EmergencyDischargeSummaryModel DischargeSummary { get; set; }

        public string VisitCode { get; set; }

        public List<string> LabOrders { get; set; }
        public List<string>  ImagingOrders { get; set; }
    }
}
