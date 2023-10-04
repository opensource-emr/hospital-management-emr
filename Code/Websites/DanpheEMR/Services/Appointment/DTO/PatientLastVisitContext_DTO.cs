using System;

namespace DanpheEMR.Services.Appointment.DTO
{
    public class PatientLastVisitContext_DTO
    {
       public int PatientId { get; set; }
       public int PatientVisitId { get; set; }
       public string VisitCode { get; set; }
       public int SchemeId { get; set; }
       public int PriceCategoryId { get; set; }
        public DateTime VisitDate { get; set; }
       public string VisitType { get; set; }
       public int DepartmentId { get; set; }
       public int? PerformerId { get; set; }
       public bool IsCurrentlyAdmitted { get; set; }
       public DateTime? DischargeDate { get; set; }
    }
}
