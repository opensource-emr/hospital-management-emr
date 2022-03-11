using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.EmergencyModels
{
    public class EmergencyPatientCases
    {
        [Key]
        public int PatientCaseId { get; set; }
        public int? ERPatientId { get; set; }
        public int? MainCase { get; set; }
        public int? SubCase { get; set; }
        public string OtherCaseDetails { get; set; }
        public int? BitingSite { get; set; }
        public DateTime? DateTimeOfBite { get; set; }
        public int? BitingAnimal { get; set; }
        public int? FirstAid { get; set; }
        public string FirstAidOthers { get; set; }
        public string BitingAnimalOthers { get; set; }
        public string BitingSiteOthers { get; set; }
        public int BitingCountry { get; set; }
        public int BitingMunicipality { get; set; }
        public string BitingAddress { get; set; }
        public bool? IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string BitingAnimalName { get; set; }
    }
}
