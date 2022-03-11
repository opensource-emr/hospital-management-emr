using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.Vaccination
{
    public class VaccPatientWithVisitInfoVM
    {
        //Sud: 2-Oct'21--To get single type of Object for Patient and VisitInfo combined.. 
        //there could be similar other vms in vaccination, need to review them  later..
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string DistrictName { get; set; }
        public string Address { get; set; }
        public string MotherName { get; set; }
        public int? VaccinationRegNo { get; set; }
        public string DepartmentName { get; set; }
        public int PatientVisitId { get; set; }

        public DateTime? VisitDateTime { get; set; }//this gives combined value taking Date from VisitDate field and TimeField from VisitTime field of visit table.
        public DateTime? VisitDate { get; set; }
        public TimeSpan? VisitTime { get; set; }
        public string EthnicGroup { get; set; }
        public string FatherName { get; set; }

        //Other informations required in Client Side..
        public int? CountryId { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public int? VaccinationFiscalYearId { get; set; }

        public string UserName { get; set; }

    }
}
