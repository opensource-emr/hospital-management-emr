namespace DanpheEMR.Controllers.Nursing.DTOs
{
    public class AddFinalDiagnosis_DTO
    {
        public int FinalDiagnosisId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int ICD10ID { get; set; }
        public bool IsActive { get; set; }
        public string ReferredBy { get; set; }
    }
  
}
