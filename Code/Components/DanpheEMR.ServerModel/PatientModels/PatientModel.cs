using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Audit.EntityFramework;

namespace DanpheEMR.ServerModel
{
    [AuditInclude]
    public class PatientModel
    {
        [Key]
        public int PatientId { get; set; }
        public int? PatientNo { get; set; }//sud:24May'18
        public string EMPI { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string FatherName { get; set; }
        public string MotherName { get; set; }
        //public string ShortName { get; set; }
        public string Gender { get; set; }
        public string Age { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public DateTime? DateOfBirth { get; set; }
        //public string WardName { get; set; }
        //public int BedId { get; set; }
        public string PreviousLastName { get; set; }
        public string MaritalStatus { get; set; }
        public string Race { get; set; }
        public string PhoneNumber { get; set; }
        public string LandLineNumber { get; set; }
        public string PassportNumber { get; set; }
        public string Email { get; set; }
        public string IDCardType { get; set; }
        public bool? PhoneAcceptsText { get; set; }
        public string IDCardNumber { get; set; }
        public string Occupation { get; set; }
        public string EthnicGroup { get; set; }
        public string BloodGroup { get; set; }
        public string EmployerInfo { get; set; }
        public int? CountryId { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public string PatientCode { get; set; }
        public bool? IsActive { get; set; }
        [NotMapped]
        public string TreatmentType { get; set; }
        public bool? IsOutdoorPat { get; set; }
        public int? DialysisCode { get; set; }
        public int? MunicipalityId { get; set; }

        [NotMapped]
        public string MunicipalityName { get; set; }
        //[NotMapped]
        //combination of firstname and last name for search purpose, it's not mapped with the database.
        public string ShortName
        {
            get; set;
            //get
            //{
            //    string midName = string.IsNullOrEmpty(this.MiddleName) ? "" : this.MiddleName + " ";

            //    return this.FirstName + " " + midName + this.LastName;
            //}
        }
        //added : sudarshan: since many patients may not know the exact dob, so.. 
        //nullable since it's optional.
        //modified :ashim: from string from int?, since we're storing the unit of age as well i.e Y,M,D. 

        //nullable since it's optional.
        public bool? IsDobVerified { get; set; }

        public string Address { get; set; }

        public List<AddressModel> Addresses { get; set; }
        public List<AllergyModel> Allergies { get; set; }
        public List<InsuranceModel> Insurances { get; set; }
        public List<KinModel> KinEmergencyContacts { get; set; }
        public List<VisitModel> Visits { get; set; }
        public List<AdmissionModel> Admissions { get; set; }

        public virtual GuarantorModel Guarantor { get; set; }

        //History of patient
        public List<ActiveMedicalProblem> Problems { get; set; }
        public List<PastMedicalProblem> PastMedicals { get; set; }
        public List<FamilyHistory> FamilyHistory { get; set; }
        public List<SurgicalHistory> SurgicalHistory { get; set; }
        public List<SocialHistory> SocialHistory { get; set; }
        public List<HomeMedicationModel> HomeMedication { get; set; }

        //public List<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        //public List<PHRMPrescriptionItemModel> MedicationPrescriptions { get; set; }
        public List<MedicationPrescriptionModel> MedicationPrescriptions { get; set; }//need to change to above later on.

        public List<ImagingReportModel> ImagingReports { get; set; }
        public List<ImagingRequisitionModel> ImagingItemRequisitions { get; set; }
        public List<LabRequisitionModel> LabRequisitions { get; set; }
        [NotMapped]
        public List<VitalsModel> Vitals { get; set; }
        public List<NotesModel> Notes { get; set; }
        //For patient Membership
        public int? MembershipTypeId { get; set; }
        //public PatientMembershipModel MembershipType { get; set; }
        public string PANNumber { get; set; }

        [NotMapped]
        public string CountrySubDivisionName { get; set; }

        [NotMapped]
        public string CountryName { get; set; }

        [NotMapped]
        public bool? HasFile { get; set; }

        public virtual CountrySubDivisionModel CountrySubDivision { get; set; }
        public List<PatientFilesModel> UploadedFiles { get; set; }

        [NotMapped]
        public PatientFilesModel ProfilePic { get; set; }//added:Yubaraj: 10July'18
        [NotMapped]
        public string WardName { get; set; }
        [NotMapped]
        public int BedNo { get; set; }
        public string PatientNameLocal { get; set; }

        [NotMapped]
        public string MembershipTypeName { get; set; }
        [NotMapped]
        public double MembershipDiscountPercent { get; set; }

        public bool? Ins_HasInsurance { get; set; }
        public string Ins_NshiNumber { get; set; }
        public double? Ins_InsuranceBalance { get; set; }

        //sud:1-Oct'21--Changing Claimcode from String to Int64-- to use Incremental logic (max+1)
        //need nullable since ClaimCode is Non-Mandatory for normal visits.
        public Int64? Ins_LatestClaimCode { get; set; }
        // Bikash 18th-Feb'21: SSU information added
        public bool? IsSSUPatient { get; set; }
        public bool? SSU_IsActive { get; set; }
        public bool? IsVaccinationPatient { get; set; }
        public bool? IsVaccinationActive { get; set; }
        public int? VaccinationRegNo { get; set; }
        public int? VaccinationFiscalYearId { get; set; }
        [NotMapped]
        public SSU_InformationModel SSU_Information { get; set; }
    }
}
