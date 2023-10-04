using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class BillServiceItemSchemeSettingModel
    {
        [Key]
        public int ServiceItemSchemeSettingId { get; set; }
        public int SchemeId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal RegDiscountPercent { get; set; }
        public decimal OpBillDiscountPercent { get; set; }
        public decimal IpBillDiscountPercent { get; set; }
        public decimal AdmissionDiscountPercent { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
