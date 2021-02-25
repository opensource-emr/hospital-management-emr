using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EmployeeModel
    {
        [Key]
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string ImageFullPath { get; set; }
        public string ImageName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public string ContactAddress { get; set; }
        public bool IsActive { get; set; }
        public string Salutation { get; set; }
        public int? DepartmentId { get; set; }//changed to nullable for mnk-uat:sudarshan-13July2017
        public int? EmployeeRoleId { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public int? EmployeeTypeId { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017

        public int? CreatedBy { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public DateTime? CreatedOn { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Gender { get; set; }

        public string FullName { get; set; }//this is combination of: Salutation+FName+MidName+LName, stored in database.

        //sud:4Sept: We've aded new column for FullName, so it'll come from database now. 
        //public string FullName
        //{
        //    get
        //    {
        //        //if designation is not empty, append it inside a bracket.
        //        string midName = string.IsNullOrEmpty(this.MiddleName) ? "" : this.MiddleName + " ";
        //        string salutaion = string.IsNullOrEmpty(this.Salutation) ? "" : this.Salutation + ". ";
        //        return salutaion + this.FirstName + " " + midName + this.LastName;
        //    }
        //}
        public Int16? Extension { get; set; }
        public Int16? SpeedDial { get; set; }
        public string OfficeHour { get; set; }
        public string RoomNo { get; set; }
        public string MedCertificationNo { get; set; }
        public string Signature { get; set; }
        public string LongSignature { get; set; }

        public virtual DepartmentModel Department { get; set; }
        public virtual EmployeeRoleModel EmployeeRole { get; set; }
        public virtual EmployeeTypeModel EmployeeType { get; set; }

        //added: sud:14Jun'18--
        public bool? IsAppointmentApplicable { get; set; }
        public string LabSignature { get; set; }

        public string RadiologySignature { get; set; }

        public string BloodGroup { get; set; }
        public string DriverLicenseNo { get; set; }
        public string NursingCertificationNo { get; set; }
        public string HealthProfessionalCertificationNo { get; set; }
        public int? DisplaySequence { get; set; }

        public string SignatoryImageName { get; set; }

        [NotMapped]
        public string SignatoryImageBase64 { get; set; }


        //public string ExtReferrerName { get; set; }//Pratik:2Sept'19--For External Referral
        public bool IsExternal { get; set; }//Pratik:2Sept'19--For External Referral


        [NotMapped]
        public List<BillItemPrice> ServiceItemsList { get; set; }

        [NotMapped]
        public int LedgerId { get; set; }
        [NotMapped]
        public string LedgerType { get; set; }

        public double? TDSPercent { get; set; }//pratik:14April'2020
        public bool? IsIncentiveApplicable { get; set; }//pratik:14April'2020
        public string PANNumber { get; set; }//pratik:14April'2020
    }
}
