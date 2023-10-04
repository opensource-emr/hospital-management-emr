using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VaccinationPatientVM
    {
        public int PatientId{get;set;}
        public string PatientCode{get;set;}
        public string ShortName{get;set;}
        public DateTime DateOfBirth { get;set;}
        public string Age {
            get
            {
                var today = System.DateTime.Today;
                var daysDiff = ((today - this.DateOfBirth).Days)+1;
                var age = daysDiff;


                if (daysDiff > 28)
                {
                    if (daysDiff < 365)
                    {
                        age = (int)(daysDiff / 29);
                        this.AgeUnit = "M";
                        return age + "M";
                    }
                    age = (int)(daysDiff/365);
                    this.AgeUnit = "Y";
                    return age + "Y";
                }
                this.AgeUnit = "D";
                return age + "D";
            }
        }
        public string AgeUnit { get; set; }
        public string Gender { get;set;}
        public string FatherName { get;set;}
        public string MotherName { get;set;}
        public string EthnicGroup { get;set;}
        public string Address { get;set;}
        public string PhoneNumber { get;set;}
        public int? VaccinationRegNo { get;set;}
        public int? CountryId { get;set;}
        public int? CountrySubDivisionId { get;set;}
        public int? VaccinationFiscalYearId { get; set; }
        public int? MunicipalityId { get; set; }
    }

    public class DoseNumber
    {
        public int Id { get; set; }
        public string NumberInfo { get; set; }
    }
}
