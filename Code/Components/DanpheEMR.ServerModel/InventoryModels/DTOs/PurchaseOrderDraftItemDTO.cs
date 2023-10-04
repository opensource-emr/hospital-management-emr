using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.DTOs
{
    public class PurchaseOrderDraftItemDTO
    {
        [Key]
        public int DraftPurchaseOrderItemId { get; set; }
        public int DraftPurchaseOrderId { get; set; }
        public string ItemCategory { get; set; }
        public int ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal ItemRate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public string ItemSpecification { get; set; }
        public string VendorItemCode { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public  int? ModifiedBy { get; set; }
        public Boolean IsActive { get; set; }
        public Boolean IsDiscarded { get; set; }
    }
}
