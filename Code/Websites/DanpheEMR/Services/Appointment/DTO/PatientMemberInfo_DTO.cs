using Org.BouncyCastle.Asn1.X9;
using System;

namespace DanpheEMR.Services.Appointment.DTO
{
    public class PatientMemberInfo_DTO
    {
        public int PatientSchemeId { get; set; }
        public int PatientId { get; set; }
        public int SchemeId { get; set; }
        public string PatientCode { get; set; }
        public string MemberNo { get; set; }
        public string PolicyHolderUid { get; set; }
        public decimal OpCreditLimit { get; set; }
        public decimal IpCreditLimit { get; set; }
        public string PolicyHolderEmployerName { get; set; }
        public Int64? LatestClaimCode { get; set; }
        public string PolicyHolderEmployerId { get; set; }
        public int LatestPatientVisitId { get; set; }
        public decimal GeneralCreditLimit { get; set; }
        public bool IsGeneralCreditLimit { get; set; }
    }
}
