using DanpheEMR.ServerModel.PharmacyModels.Patient_Consumption;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyConsumption
{
    public class PatientConsumptionDTO
    {
        [Key]
        public int PatientConsumptionId { get; set; }
        public string BillingStatus { get; set; }
        public int? ConsumptionReceiptNo { get; set; }
        public List<PatientConsumptionItemDTO> PatientConsumptionItems { get; set; }
        public int PatientId { get; set; }
        public int? CounterId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Remark { get; set; }
        public decimal Tender { get; set; }
        public decimal Change { get; set; }
        public int FiscalYearId { get; set; }
        public int? PrescriberId { get; set; }
        public string VisitType { get; set; }
        public string PaymentMode { get; set; }
        public int? OrganizationId { get; set; }
        public int StoreId { get; set; }
        public long? ClaimCode { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal ReceivedAmount { get; set; }
        public int PatientVisitId { get; set; }
        public int SchemeId { get; set; }
        public List<PHRMDispensaryEmployeeCashTransaction_DTO> PHRMEmployeeCashTransactions { get; set; }
        public decimal DepositDeductAmount { get;set; }
        public bool IsCoPayment { get;set; }
        public decimal CoPaymentCreditAmount { get; set; }

    }
}
