using DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyProvisional
{
    public class PharmacyProvisionalSale_DTO
    {
        public PatientInfo_DTO PatientInfo { get; set; }
        public string ProviderNMCNumber { get; set; }
        public string ProviderName { get; set; }
        public string UserName { get; set; }
        public long? ClaimCode { get; set; }
        public string PolicyNo { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal CoPaymentCashAmount { get; set; }
        public decimal CoPaymentCreditAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime InvoiceDate { get; set; }
        public List<PharmacyProvisionalSaleItem_DTO> ProvisionalInvoiceItems { get; set; }
        public int ReceiptNo { get; set; }
    }
}
