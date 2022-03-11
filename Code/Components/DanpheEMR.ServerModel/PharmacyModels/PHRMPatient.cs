using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMPatient
    {
        [Key]
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Age { get; set; }
        public int? MembershipTypeId { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public int? PatientNo { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public bool? PhoneAcceptsText { get; set; }
        public bool? IsDobVerified { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public string PatientCode { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsOutdoorPat { get; set; }
        public string PANNumber { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public int? CountryId { get; set; }
        public bool? Ins_HasInsurance { get; set; }
        public string Ins_NshiNumber { get; set; }
        public double? Ins_InsuranceBalance { get; set; }

        //sud:1-Oct'21--Changing Claimcode from String to Int64-- to use Incremental logic (max+1)
        //need nullable since ClaimCode is Non-Mandatory for normal visits.
        public Int64? Ins_LatestClaimCode { get; set; }
        public string ShortName { get; set; }
        [NotMapped]
        public string CountrySubDivisionName { get; set; }
        [NotMapped]
        public int? ProviderId { get; set; }
        [NotMapped]
        public bool IsAdmitted { get; set; }
        public List<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
    }
}
