using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt
{
    public class PharmacyInvoiceReceipt_DTO
    {
        public int? InvoiceId { get; set; }
        public int? InvoiceReturnId { get; set; }
        public int? PatientVisitId { get; set; }
        public string ProviderName { get; set; }
        public string ProviderNMCNumber { get; set; }
        public int PrintCount { get; set; }
        public string CurrentFiscalYearName { get; set; }
        public DateTime ReceiptDate { get; set; }
        public DateTime? ReferenceInvoiceDate { get; set; }
        public int CreditNoteNo { get; set; }
        public int? ReceiptPrintNo { get; set; }
        public string ReferenceInvoiceNo { get; set; }
        public long? ClaimCode { get; set; }
        public string PolicyNo { get; set; }
        public string PaymentMode { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal CashAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal TaxableAmount { get; set; }
        public decimal NonTaxableAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Change { get; set; }
        public decimal Tender { get; set; }
        public string CreditOrganizationName { get; set; }
        public string Remarks { get; set; }
        public string BillingUser { get; set; }
        public bool IsReturned { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public PatientInfo_DTO PatientInfo { get; set; }
        public List<PaymentDetailsDTO> PaymentModeDetails { get; set; }
        public List<PharmacyInvoiceReceiptItem_DTO> InvoiceItems { get; set; }
    }
}
