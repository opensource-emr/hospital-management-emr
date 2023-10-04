namespace DanpheEMR.Services.Utilities.DTOs
{
    public class SchemeRefund_DTO
    {
        public int SchemeId { get; set; }
        public int PatientId { get; set; }
        public string InpatientNumber { get; set; }
        public decimal RefundAmount { get; set; }
        public string Remarks { get; set; }
        public int CounterId { get; set; }
    }
}
