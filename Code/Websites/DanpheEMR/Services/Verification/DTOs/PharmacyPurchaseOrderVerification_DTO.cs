using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace DanpheEMR.Services.Verification.DTOs
{
    public class PharmacyPurchaseOrderVerification_DTO
    {
        public int PurchaseOrderId { get; set; }
        public int PurchaseOrderNo { get; set; }
        public string StoreName { get; set; }
        public string SupplierName { get; set; }
        public DateTime? PODate { get; set; }
        public string POStatus { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public int MaxVerificationLevel { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public bool IsVerificationAllowed { get; internal set; }
        public int SupplierId { get; set; }
        public int FiscalYearId { get; set; }
        public string ReferenceNo { get; set; }
        public string DeliveryAddress { get; set; }
        public string InvoicingAddress { get; set; }
        public string Contact { get; set; }
        public int DeliveryDays { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string Remarks { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? VerificationId { get; set; }
        public string VerifierIds { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public string VerificationStatus { get; set; }

    }
}
