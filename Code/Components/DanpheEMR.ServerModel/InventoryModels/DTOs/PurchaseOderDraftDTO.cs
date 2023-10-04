using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.DTOs
{
    public class PurchaseOderDraftDTO
    {
        [Key]
        public int DraftPurchaseOrderId { get; set; }
        public int DraftPurchaseOrderNo { get; set; }
        public int FiscalYearId { get; set; }
        public int VendorId { get; set; }
        public string Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string DeliveryAddress { get; set; }
        public int? CurrencyId { get; set; }
        public string Remarks { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public int? PODGroupId { get; set; }
        public string InvoicingAddress { get; set; }
        public string ContactPersonName { get; set; }
        public string ContactPersonEmail { get; set; }
        public string ReferenceNo { get; set; }
        public Boolean IsActive { get; set; }
        public int? DiscardedBy { get; set; }
        public DateTime? DiscardedOn { get; set; }
        public string DiscardRemarks { get; set; }
        public virtual List<PurchaseOrderDraftItemDTO> PurchaseOrderDraftItems { get;set;}
    }
}
