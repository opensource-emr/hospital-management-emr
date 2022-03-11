using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetPharmacyPOEditVm
    {
        public GetPharmacyPOEditDTO purchaseOrder { get; set; }
    }

    public class GetPharmacyPOEditDTO
    {
        public int PurchaseOrderId { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string Remarks { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? PODate { get; set; }
        public string POStatus { get; set; }
        public IList<GetPharmacyPOItemsDTO> PHRMPurchaseOrderItems { get; set; }
        
        public GetPharmacyPOEditDTO()
        {
            PHRMPurchaseOrderItems = new List<GetPharmacyPOItemsDTO>();
        }

    }

    public class GetPharmacyPOItemsDTO
    {
        public int ItemId { get; set; }
        public int PurchaseOrderItemId { get; set; }
        public string ItemName { get; set; }
        public double Quantity { get; set; }
        public decimal StandaredPrice { get; set; }
        public double VatPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int DeliveryDays { get; set; }
        public bool? IsCancel { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public int? AuthorizedBy { get; set; }
        public DateTime? AuthorizedOn { get; set; }
        public string POItemStatus { get; set; }
        public double PendingQuantity { get; set; }
    }
}
