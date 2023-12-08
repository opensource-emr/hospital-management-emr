using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.SSFModels
{
    public class SSFClaimBookingModel
    {
        [Key]
        public int ClaimBookingId { get; set; }
        public int PatientId { get; set; }
        public string HospitalNo { get; set; }
        public string PolicyNo { get; set; }
        public Int64 LatestClaimCode { get; set; }
        public string ResponseData { get; set; }
        public string BillingInvoiceNo { get; set; }
        public string PharmacyInvoiceNo { get; set; }
        public DateTime BookingRequestDate { get; set; }
        public DateTime? BookingResponseDate { get; set; }
        public int BookedBy { get; set; }
        public int? ReBookedBy { get; set; }
        public DateTime? ReBookingDate { get; set; }
        public bool BookingStatus { get; set; }
        public bool IsClaimed { get; set; }
        public bool IsActive { get; set; }
    }
}
