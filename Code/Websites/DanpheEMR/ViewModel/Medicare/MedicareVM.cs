using System;

namespace DanpheEMR.ViewModel.Medicare
{
    public class MedicareMemberDto
    {
        public int MedicareMemberId { get; set; }
        public int MedicareTypeId { get; set; }
        public int LedgerId { get; set; }
        public string FullName { get; set; }
        public string MedicareTypeName { get; set; }
        public string MedicareInstituteCode { get; set; }
        public string MemberNo { get; set; }
        public string HospitalNo { get; set; }
        public int PatientId { get; set; }
        public bool IsDependent { get; set; }
        public int? ParentMedicareMemberId { get; set; }
        public string Relation { get; set; }
        public string Remarks { get; set; }
        public string MedicareStartDate { get; set; }
        public int InsuranceProviderId { get; set; }
        public string InsurancePolicyNo { get; set; }
        public int DesignationId { get; set; }
        public int DepartmentId { get; set; }
        public string DateOfBirth { get; set; }
        public string InActiveDate { get; set; }
        public bool IsOpLimitExceeded { get; set; }
        public bool IsIpLimitExceeded { get; set; }
        public bool IsActive { get; set; }
    }
}
