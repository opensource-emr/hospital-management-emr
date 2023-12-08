using System;

namespace DanpheEMR.Services.SSF.DTO
{
    public class ClaimBookingRoot_DTO
    {
        public decimal bookedAmount { get; set; }
        public string Patient { get; set; }
        public string scheme { get; set; }
        public int? subProduct { get; set; }
        public int PatientId { get; set; }
        public string HospitalNo { get; set; }
        public string PolicyNo { get; set; }
        public Int64 LatestClaimCode { get; set; }
        public bool IsAccidentCase { get; set; }
        public string BillingInvoiceNo { get; set; }
        public string PharmacyInvoiceNo { get; set; }
        //public List<ClaimBooking_DTO> ClaimBookings { get; set; }

    }

    public class ClaimBooking_DTO
    {
        public string BillingInvoiceNo { get; set; }
        public string PharmacyInvoiceNo { get; set; }
    }

    public class ClaimBookingResponse
    {
        public string ResponseStatus { get; set; }
        public string ErrorMessage { get; set; }
    }
}
