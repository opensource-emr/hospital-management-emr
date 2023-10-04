using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMPurchaseOrderModel
    {
        [Key]
        public int PurchaseOrderId { get; set; }
        public int SupplierId { get; set; }
        public int FiscalYearId { get; set; }
        public int? PurchaseOrderNo { get; set; }
        public string ReferenceNo { get; set; }
        public DateTime? PODate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal CCChargeAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string DeliveryAddress { get; set; }
        public string InvoicingAddress { get; set; }
        public string Contact { get; set; }
        public int DeliveryDays { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string Remarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public int? TermsId { get; set; }
        public string TermsConditions { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? TaxableAmount { get; set; }
        public decimal? NonTaxableAmount { get; set; }
        public decimal? Adjustment { get; set; }
        public List<PHRMPurchaseOrderItemsModel> PHRMPurchaseOrderItems { get; set; }
        public int? VerificationId { get; set; }
        public string VerifierIds { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
    }
}
