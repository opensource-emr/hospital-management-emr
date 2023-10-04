using DanpheEMR.ServerModel.PatientModels;
using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillCancellationReceipt_DTO
    {
        public int ProvisionalItemReturnId { get; set; }
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string PatientName { get; set; }
        public string ContactNo { get; set; }
        public DateTime? DateOfbirth { get; set; }
        public string Age { get; set; }
        public string Gender { get; set; }
        public string CountrySubdivisionName { get; set; }
        public string Address { get; set; }
        public string User { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public int CancellationReceiptNo { get; set; }
        public int ReferenceProvisionalReceiptNo { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CancelledQty { get; set; }
        public decimal Price { get; set; }
        public decimal CancelledSubtotal { get; set; }
        public decimal CancelledDiscountAmount { get; set; }
        public decimal CancelledTotalAmount { get; set; }
        public string CancellationRemarks { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPayCash { get; set; }
        public string ServiceDepartmentName { get; set; }
        public string SchemeName { get; set; }
    }
}
