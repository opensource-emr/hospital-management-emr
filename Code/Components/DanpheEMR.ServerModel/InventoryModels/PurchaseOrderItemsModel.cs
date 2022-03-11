using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PurchaseOrderItemsModel
    {
        [Key]
        public int PurchaseOrderItemId { get; set; }
        public int ItemId { get; set; }
        public int PurchaseOrderId { get; set; }
        public double Quantity { get; set; }
        public decimal StandardRate { get; set; }
        public decimal TotalAmount { get; set; }
        public double ReceivedQuantity { get; set; }
        public double PendingQuantity { get; set; }
        public int DeliveryDays { get; set; }
        public string AuthorizedRemark { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string Remark { get; set; }
        public string POItemStatus { get; set; }
        public string POItemSpecification { get; set; }
        public decimal? VATAmount { get; set; }
        public double VatPercentage { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public PurchaseOrderModel PurchaseOrder { get; set; }
        public virtual ItemMasterModel Item { get; set; }
        [NotMapped]
        public String ItemName { get; set; }
        [NotMapped]
        public string Code { get; set; }
        [NotMapped]
        public string UOMName { get; set; }
        [NotMapped]
        public bool IsEdited { get; set; }
        public bool IsActive { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }

        public string ItemCategory { get; set; }//sud:18Sep'21: For Capital/Consumable combined..
        public string VendorItemCode { get; set; }
    }
}
