using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Procurement
{
    public class GetProcurementPOViewDto
    {
        public int? PurchaseRequestId { get; set; }
        public int? PRNumber { get; set; }
        public string PRDate { get; set; }
        public int PurchaseOrderId { get; set; }
        public string VendorName { get; set; }
        public string VendorPANNumber { get; set; }//sud:18Sep'21--We need to show this in PO-View.
        public string VendorNo { get; set; }
        public string SARFNo { get; set; }
        public string VendorAddress { get; set; }
        public string Email { get; set; }
        public string BankDetails { get; set; }
        public int? CurrencyID { get; set; }
        public string CurrencyCode { get; set; }
        public string ContactPerson { get; set; }
        public DateTime? PoDate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public bool? IsCancel { get; set; }
        public string PerformanceInvoiceNo { get; set; }
        public decimal TotalAmount { get; set; }
        public string PORemark { get; set; }
        public int CreatedbyId { get; set; }
        public string Terms { get; set; }
        public string VendorEmail { get; set; }
        public bool? IsVerificationEnabled { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public string VerifierIds { get; set; }
        public int? InvoiceHeaderId { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public int? PurchaseOrderNo { get; set; }
        public int? VerificationId { get; set; }

        //Below field is For imark inventory purpose PO View 
        public string ReferenceNo { get; internal set; }
        public string InvoicingAddress { get; internal set; }
        public string DeliveryAddress { get; internal set; }
        public string ContactPersonName { get; internal set; }
        public string ContactPersonEmail { get; internal set; }
    }
}
