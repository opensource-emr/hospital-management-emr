using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientClinicalDetailVM
    {
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int NotesId { get; set; }
        public List<PastMedicalProblem> PastMedicals { get; set; }
        public List<SurgicalHistory> SurgicalHistory { get; set; }
        public List<SocialHistory> SocialHistory { get; set; }
        public List<FamilyHistory> FamilyHistory { get; set; }
        public List<AllergyModel> Allergies { get; set; }
        public List<VitalsModel> Vitals { get; set; }
        //Medication remaining
    }
    
}
