using System;

namespace DanpheEMR.Services.ProvisionalDischarge.DTO
{
    public class ProvisionalDischargeList_DTO
    {
        public string IpNumber { get; set; }
        public string HospitalNumber { get; set; }
        public string PatientName { get; set; }
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Contacts { get; set; }
        public string WardBed { get; set; }
        public decimal DepositAmount { get; set; }
        public DateTime AdmittedOn { get; set; }
        public DateTime ProvisionalDischargedOn { get; set; }
        public string ProvisionalDischargedBy { get; set; }
        public string Remarks { get; set; }
        public int PatientId { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public int PatientVisitId { get; set; }
    }
}
