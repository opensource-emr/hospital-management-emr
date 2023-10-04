using System;

namespace DanpheEMR.Controllers.Billing.Shared
{
    public class BillServiceItemSchemeSetting_DTO
    {
        public int ServiceItemSchemeSettingId { get; set; }
        public int SchemeId { get; set; }
        public int ServiceItemId { get; set; }

        public string ServiceItemCode { get; set; }

        public string ServiceItemName { set; get; }

        public int ServiceDepartmentId { set; get; }
        public decimal RegDiscountPercent { get; set; }
        public decimal OpBillDiscountPercent { get; set; }
        public decimal IpBillDiscountPercent { get; set; }
        public decimal AdmissionDiscountPercent { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public int CreatedBy { get; set; }             
        public bool itemIsSelected { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
