using System;

namespace DanpheEMR.Services.Utilities.DTOs
{
    public class PatientSchemeRefundsList_DTO
    {
        public DateTime RefundedDate { get; set; }
        public string SchemeName { get; set; }
        public decimal RefundAmount { get; set; }
        public string FullName { get; set; }
        public string Remarks { get; set; }
    }
}
