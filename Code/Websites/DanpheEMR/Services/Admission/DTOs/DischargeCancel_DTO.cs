using System.ComponentModel.DataAnnotations.Schema;
using System;
using DanpheEMR.ServerModel;

namespace DanpheEMR.Services.Admission.DTOs
{
    public class DischargeCancel_DTO
    {
        public int? PatientVisitId { get; set; }
        public int? PatientAdmissionId { get; set; }
        public DateTime DischargedDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? DischargedBy { get; set; }
        public int? DischargeCancelledBy { get; set; }
        public int? BillingTransactionId { get; set; }
        public string DischargeCancelNote { get; set; }
        public int CounterId { get; set; }
        public int? NewBedId { get; set; }
        //public DischargeCancelModel DischargeCancel { get; set; }
    }
}
