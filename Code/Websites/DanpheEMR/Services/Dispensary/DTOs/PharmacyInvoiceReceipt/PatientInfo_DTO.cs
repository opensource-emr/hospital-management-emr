using System;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt
{
    public class PatientInfo_DTO
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public string Address { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Gender { get; set; }
        public string Age { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string PANNumber { get; set; }
    }
}
