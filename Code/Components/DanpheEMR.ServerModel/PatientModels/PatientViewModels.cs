using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientWithVisitInfoVM
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string Age { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; }
        public bool IsAdmitted { get; set; }
        public bool? IsOutdoorPat { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string PANNumber { get; set; }
        public List<VisitModel> LatestVisits { get; set; }//remove this if not needed
        public List<AdmissionModel> Admissions { get; set; }//remove this if not needed
        public string LatestVisitType { get; set; }//sud: 28Sept'18
        public string LatestVisitCode { get; set; }//sud: 28Sept'18
        public int? LatestVisitId { get; set; }//sud: 28Sept'18
        public DateTime? LatestVisitDate { get; set; }//sud: 29Sept'18
        public double Insurance { get; set; }
    }

    //sud:10Apr'19--to centralize new patient registration. needed below two fields.
    public class NewPatientUniqueNumbersVM
    {
        public int PatientNo { get; set; }
        public string PatientCode { get; set; }
    }



    public class GovInsurancePatientVM
    {
        public int PatientId { get; set; }
        public int? PatientNo { get; set; }
        public string PatientCode { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PatientNameLocal { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string ShortName { get; set; }
        public string PhoneNumber { get; set; }
        public int CountryId { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Age { get; set; }
        public string Address { get; set; }
        
        //public int MembershipTypeId { get; set; }

        //Insurance Information.
        public int InsuranceProviderId { get; set; }
        public string InsuranceName { get; set; }
        public string IMISCode { get; set; }
        public double InitialBalance { get; set; }
        public double CurrentBalance { get; set; }

        //Audit Information.
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
         
        public bool? Ins_HasInsurance { get; set; }
        public string Ins_NshiNumber { get; set; }
        public float? Ins_InsuranceBalance { get; set; }
        public int? Ins_InsuranceProviderId { get; set; }
        public bool? Ins_IsFamilyHead { get; set; }
        public string Ins_FamilyHeadNshi { get; set; }
        public string Ins_FamilyHeadName { get; set; }
        public bool? Ins_IsFirstServicePoint { get; set; }

        //Municipality Information
        public int? MunicipalityId { get; set; }
        public string MunicipalityName { get; set; }
    }

    public class BillingOpPatientVM
    {
        public int PatientId { get; set; }
        public int? PatientNo { get; set; }
        public string PatientCode { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PatientNameLocal { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string ShortName { get; set; }
        public string PhoneNumber { get; set; }
        public int CountryId { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Age { get; set; }
        public string Address { get; set; }

        //public int MembershipTypeId { get; set; }


        //Audit Information.
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public int? MunicipalityId { get; set; }
    }


}
