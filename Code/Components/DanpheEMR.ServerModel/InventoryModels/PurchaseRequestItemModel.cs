using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PurchaseRequestItemModel
    {
        [Key]
        public int PurchaseRequestItemId { get; set; }
        public int PurchaseRequestId { get; set; }
        public int ItemId { get; set; }
        public int? VendorId { get; set; }
        public double RequestedQuantity { get; set; }
        [NotMapped]
        public double? AvailableQuantity { get; set; }
        public string RequestItemStatus { get; set; }
        public string Remarks { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public String ItemName { get; set; }
        [NotMapped]
        public string Code { get; set; }
        [NotMapped]
        public string UOMName { get; set; }
        [NotMapped]
        public bool IsEdited { get; set; }

        public string SupplyRequiredBefore { get; set; }//Rajib: 11/25/2020 Tilaganga Hospital
        public DateTime? QuantityVerifiedOn { get; set; }//Rajib: 11/25/2020 Tilaganga Hospital
        [NotMapped]
        public string MSSNO { get; set; }
        [NotMapped]
        public double? POQuantity { get; set; }
        public string ItemCategory { get; set; }
        public double? PendingQuantity { get; set; }
        [NotMapped]
        public decimal? StandardRate { get; set; }
        [NotMapped]
        public DateTime? PoDate { get; set; }

        [NotMapped]
        public int? PONumber { get; set; }

        [NotMapped]
        public string SupplierInvoice { get; set; }

        [NotMapped]
        public DateTime? SupplierInvoiceDate { get; set; }

    }
}
