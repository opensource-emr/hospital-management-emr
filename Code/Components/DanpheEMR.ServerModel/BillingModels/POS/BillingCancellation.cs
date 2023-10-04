using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BillingCancellationModel
    {
        [Key]
        public int ProvisionalItemReturnId { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int ReferenceProvisionalReceiptNo { get; set; }
        public int CancellationReceiptNo { get; set; }
        public int CancellationFiscalYearId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string BillingType { get; set; }
        public string VisitType { get; set; }
        public int ServiceItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public int IntegrationItemId { get; set; }
        public decimal Price { get; set; }
        public int CancelledQty { get; set; }
        public decimal CancelledSubtotal { get; set; }
        public decimal CancelledDiscountPercent { get; set; }
        public decimal CancelledDiscountAmount { get; set; }
        public decimal CancelledTotalAmount { get; set; }
        public int? PerformerId { get; set; }
        public int? PrescriberId { get; set; }
        public int CancelledCounterId { get; set; }
        public string CancellationRemarks { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }




    }
}
