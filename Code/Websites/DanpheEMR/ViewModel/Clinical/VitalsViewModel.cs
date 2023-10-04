using DanpheEMR.ServerModel;
using Microsoft.Isam.Esent.Interop;
using System;

namespace DanpheEMR.ViewModel.Clinical
{
    public class VitalsViewModel
    {
        //need to remove unused properties
        //prem/sud/dev: 3th feb 2023:ViewModel model is created to avoid circular dependency on patient visit model from vitals model. All other properties are same as vitals model
        public int PatientVitalId { get; set; }
        public int PatientVisitId { get; set; }

        public double? Height { get; set; }
        public string HeightUnit { get; set; }
        public double? Weight { get; set; }
        public string WeightUnit { get; set; }
        public double? BMI { get; set; }
        public double? Temperature { get; set; }
        public string TemperatureUnit { get; set; }
        public int? Pulse { get; set; }
        public int? BPSystolic { get; set; }
        public int? BPDiastolic { get; set; }
        public string RespiratoryRatePerMin { get; set; }
        public double? SpO2 { get; set; }
        public string OxygenDeliveryMethod { get; set; }
        public int? PainScale { get; set; }
        public string BodyPart { get; set; }
        public string Advice { get; set; }
        public string FreeNotes { get; set; }
        public string DiagnosisType { get; set; }
        public string Diagnosis { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime VitalsTakenOn { get; set; }
    }
}
