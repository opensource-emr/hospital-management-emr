using DanpheEMR.ServerModel.PharmacyModels;
using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Pharmacy.DTOs.Provisional
{
    public class PHRMTransactionProvisional_DTO
    {
        public int InvoiceId { get; set; }
        public int PatientId { get; set; }
        public int CounterId { get; set; }
        public bool IsOutdoorPat { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string BilStatus { get; set; }
        public decimal CreditAmount { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreateOn { get; set; }
        public decimal Tender { get; set; }
        public decimal Change { get; set; }
        public int PrintCount { get; set; }
        public decimal Adjustment { get; set; }
        public int InvoicePrintId { get; set; }
        public bool IsReturn { get; set; }
        public int FiscalYearId { get; set; }
        public bool IsTransferredToACC { get; set; }
        public int? PrescriberId { get; set; }
        public string VisitType { get; set; }
        public decimal DepositDeductAmount { get; set; }
        public string PaymentMode { get; set; }
        public int? SettlementId { get; set; }
        public DateTime? PaidDate { get; set; }
        public DateTime? CreditDate { get; set; }
        public int? OrganizationId { get; set; }
        public int StoreId { get; set; }
        public int? ClaimCode { get; set; }
        public decimal DiscountPer { get; set; }
        public decimal ReceivedAmount { get; set; }
        public int? PatientVisitId { get; set; }
        public int SchemeId { get; set; }
        public bool IsCopayment { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
        public List<PHRMTransactionProvisionalItems_DTO> InvoiceItems { get; set; }
        public virtual List<PHRMEmployeeCashTransaction_DTO> PHRMEmployeeCashTransactions { get; set; }

    }
}
