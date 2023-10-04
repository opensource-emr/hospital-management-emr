using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientVaccineDetailVM
    {
        public int PatientVaccineId { get; set; }
        public int VaccineId { get; set; }
        public int PatientId { get; set; }
        public int DoseNumber { get; set; }
        public string VaccineName { get; set; }
        public string DoseNumberStr { get; set; }
        public string EnteredBy { get; set; }
        public DateTime VaccineDate { get; set; }
        public string Remarks { get; set; }
    }
}
