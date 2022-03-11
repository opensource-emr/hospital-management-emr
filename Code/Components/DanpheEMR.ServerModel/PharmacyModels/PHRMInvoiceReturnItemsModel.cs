using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using Audit.EntityFramework;

namespace DanpheEMR.ServerModel
{
    [AuditInclude]
    public class PHRMInvoiceReturnItemsModel
    {
        [Key]
        public int InvoiceReturnItemId { get; set; }
        public int? InvoiceReturnId { get; set; }
        public int? InvoiceItemId { get; set; }
        public int? InvoiceId { get; set; }
        public int StoreId { get; set; }
        public string BatchNo { get; set; }
        public double? Quantity { get; set; }
        public decimal? MRP { get; set; }
        public decimal? Price { get; set; }
        public decimal? SubTotal { get; set; }
        public double? VATPercentage { get; set; }
        public double? DiscountPercentage { get; set; }
        public decimal? TotalDisAmt { get; set; }
        public decimal? PerItemDisAmt { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string Remark { get; set; }
        public int? CreatedBy { get; set; }
        public int? CounterId { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public int? ItemId { get; set; }
        public int? CreditNoteNumber { get; set; }
        [NotMapped]
        public string FiscalYear { get; set; }
        public int? FiscalYearId { get; set; }
        public double? ReturnedQty { get; set; }
        [NotMapped]
        public bool? IsInsert { get; set; }
        [NotMapped]
        public int? GRItemId { get; set; }

        [NotMapped]
        public string ItemName { get; set; }
        [NotMapped]
        public string GenericName { get; set; }
        [NotMapped]
        public double? SaledQty { get; set; }
        [NotMapped]
        public double? FreeQty { get; set; }

        [NotMapped]
        public DateTime? ExpiryDate { get; set; }
        public PHRMInvoiceReturnItemsModel() => IsInsert = true;//expression block constructor      
        [NotMapped]
        public string ShortName { get; set; }
        [NotMapped]
        public string PANNumber { get; set; }

    }
}
