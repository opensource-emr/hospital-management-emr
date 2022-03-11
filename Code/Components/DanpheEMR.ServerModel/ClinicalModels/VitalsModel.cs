using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VitalsModel
    {
        [Key]
        public int PatientVitalId { get; set; }
        public int PatientVisitId { get; set; }

        //assign default value to this property, don't set it from anywhere else.. 

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
        public VisitModel Visit { get; set; }
        public string Advice { get; set; }
        public string FreeNotes { get; set; }
        public string DiagnosisType { get; set; }
        public string Diagnosis { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime VitalsTakenOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        //public virtual PatientModel Patient { get; set; }

        public int? Nadi { get; set; }
        public string Mala { get; set; }
        public string Mutra { get; set; }
        public string Jivha { get; set; }
        public string Shabda { get; set; }
        public string Sparsha { get; set; }
        public string Drik { get; set; }
        public string Akriti { get; set; }
        public string LungField { get; set; }
        public string HeartSounds { get; set; }
        public string PA_Tenderness { get; set; }
        public string Organomegaly { get; set; }
        public string CNS_Consiousness { get; set; }
        public string Power { get; set; }
        public string Reflexes { get; set; }
        public string Tone { get; set; }
        public string Others { get; set; }
    }
    }