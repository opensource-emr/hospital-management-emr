namespace DanpheEMR.Controllers.Nursing.DTOs
{
    public class AddChiefComplaint_DTO
    {
        public int InfoId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string KeyName { get; set; }
        public string Value { get; set; }
        public bool IsActive { get; set; }
    }
}
