using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.MedicareModels
{
    public class MedicareMember
    {
        [Key]
        public int MedicareMemberId { get; set; }
        public int MedicareTypeId { get; set; }
        public string FullName { get; set; }
        public string MedicareInstituteCode { get; set; }
        public string MemberNo { get; set; }
        public string HospitalNo { get; set; }
        public int PatientId { get; set; }
        public bool IsDependent { get; set; }
        public int? ParentMedicareMemberId { get; set; }
        public string Relation { get; set; }
        public DateTime MedicareStartDate { get; set; }
        public int InsuranceProviderId { get; set; }
        public string InsurancePolicyNo { get; set; }
        public int DesignationId { get; set; }
        public int DepartmentId { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime? InActiveDate { get; set; }
        public bool IsOpLimitExceeded { get; set; }
        public bool IsIpLimitExceeded { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public string Remarks { get; set; }
    }
}
