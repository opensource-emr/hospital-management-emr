using System;

namespace DanpheEMR.Services.ProvisionalDischarge.DTO
{
    public class ProvisionalDischarge_DTO
    {
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public DateTime DischargeDate { get; set; }
        public string ProcedureType { get; set; }
        public int DiscountSchemeId { get; set; }
        public string Remarks { get; set; }
    }
}
