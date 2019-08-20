using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class ClinicalModel
    {
        public VitalsModel Vitals { get; set; }
        public AllergyModel Allergy { get; set; }
        public HomeMedicationModel HomeMedication { get; set; }
        public ActiveMedicalProblem ActiveMedicals { get; set; }
    }
}
