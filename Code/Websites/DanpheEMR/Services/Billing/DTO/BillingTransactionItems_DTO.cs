using DanpheEMR.ServerModel;
using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingTransactionItems_DTO
    {
        public int BillingTransactionItemId { get; set; }
        public int? BillingTransactionId { get; set; }
        public int PatientId { get; set; }
        public int? PerformerId { get; set; }
        public string PerformerName { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public int ServiceItemId { get; set; }
        public int PriceCategoryId { get; set; }
        public string ItemCode { get; set; }
        public int? IntegrationItemId { get; set; }
        public string ProcedureCode { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
        public double SubTotal { get; set; }
        public double DiscountPercent { get; set; }
        public double DiscountPercentAgg { get; set; }
        public double DiscountAmount { get; set; }
        public double Tax { get; set; }
        public double TotalAmount { get; set; }
        public string BillStatus { get; set; }
        public Int64? RequisitionId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public DateTime? CounterDay { get; set; }
        public int CounterId { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool? ReturnStatus { get; set; }
        public double? ReturnQuantity { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public string Remarks { get; set; }
        public string CancelRemarks { get; set; }
        public decimal TaxPercent { get; set; }
        public DateTime? CancelledOn { get; set; }
        public int? CancelledBy { get; set; }
        public int? PrescriberId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? BillingPackageId { get; set; }
        public double TaxableAmount { get; set; }
        public decimal NonTaxableAmount { get; set; }
        public int? PaymentReceivedBy { get; set; }
        public int? PaidCounterId { get; set; }      
        public string BillingType { get; set; }
        public int? RequestingDeptId { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsCoPayment { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
        public int? PatientInsurancePackageId { get; set; }
        public virtual PatientModel Patient { get; set; }
        public virtual BillingTransactionModel BillingTransaction { get; set; }
        public virtual ServiceDepartmentModel ServiceDepartment { get; set; }
        public string VisitType { get; set; }
        public string PriceCategory { get; set; }
        public int? ProvisionalReceiptNo { get; set; }
        public int? ProvisionalFiscalYearId { get; set; }
        public bool IsInsurance { get; set; }
        public int DiscountSchemeId { get; set; }
        public string OrderStatus { get; set; }
        public string LabTypeName { get; set; }
        public int? ReferredById { get; set; }
        public int? DischargeStatementId { get; set; }
        public bool IsPriceChangeAllowed { get; set; }
        public string ProvFiscalYear { get; set; }
        public string RequestingUserName { get; set; }
        public string RequestingUserDept { get; set; }
    }
}
