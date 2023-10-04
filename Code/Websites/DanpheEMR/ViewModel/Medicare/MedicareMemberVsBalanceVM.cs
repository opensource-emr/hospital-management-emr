using System;

namespace DanpheEMR.ViewModel.Medicare
{
    public class MedicareMemberVsBalanceVM
    {
        public int MedicareMemberId {get; set;}
        public int MedicareTypeId {get; set;}
        public string FullName {get; set;}
        public string MedicareInstituteCode {get; set;}
        public string MemberNo {get; set;}
        public string HospitalNo {get; set;}
        public int PatientId {get; set;}
        public Boolean IsDependent {get; set;}
        public int? ParentMedicareMemberId {get; set;}
        public string Relation {get; set;}
        public DateTime MedicareStartDate {get; set;}
        public int? InsuranceProviderId {get; set;}
        public string InsurancePolicyNo {get; set;}
        public int? DesignationId {get; set;}
        public int? DepartmentId {get; set;}
        public DateTime DateOfBirth {get; set;}
        public DateTime? InActiveDate {get; set;}
        public Boolean IsOpLimitExceeded {get; set;}
        public Boolean IsIpLimitExceeded {get; set;}
        public Boolean IsActive {get; set;}
        public int? MedicareBalanceId {get; set;}
        public decimal OpBalance {get; set;}
        public decimal IpBalance {get; set;}
        public decimal OpUsedAmount {get; set;}
        public decimal IpUsedAmount { get; set; }
    }
}
