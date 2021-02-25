using System;
using System.Collections.Generic;

namespace DanpheEMR.ServerModel
{
    public class InventoryRequisitionViewModel
    {
        public List<RequisitionItemsModel> RequisitionItemList { get; set; }
        public VerificationActor RequestingUser { get; set; }
        public List<VerificationActor> Verifiers { get; set; }
        public List<DispatchVerificationActor> Dispatchers { get; set; }

        public InventoryRequisitionViewModel()
        {
            RequestingUser = new VerificationActor();
        }
    }
    public class InventoryPurchaseRequestViewModel
    {
        public List<PurchaseRequestItemModel> RequestedItemList { get; set; }
        public VerificationActor RequestingUser { get; set; }
        public List<VerificationActor> Verifiers { get; set; }

        public InventoryPurchaseRequestViewModel()
        {
            RequestingUser = new VerificationActor();
        }
    }
    public class InventoryPurchaseOrderViewModel
    {
        public List<PurchaseOrderItemsModel> OrderedItemList { get; set; }
        public VerificationActor OrderingUser { get; set; }
        public List<VerificationActor> Verifiers { get; set; }

        public InventoryPurchaseOrderViewModel()
        {
            OrderingUser = new VerificationActor();
        }
    }
    public class InventoryGoodsReceiptViewModel
    {
        public List<GoodsReceiptItemsModel> ReceivedItemList { get; set; }
        public VerificationActor ReceivingUser { get; set; }
        public List<VerificationActor> Verifiers { get; set; }
        public VER_PODetailModel OrderDetails { get; set; }
        public InventoryGoodsReceiptViewModel()
        {
            ReceivingUser = new VerificationActor();
        }
    }

    public class VER_PODetailModel
    {
        public int? PurchaseOrderId { get; set; }
        public DateTime? PoDate { get; set; }
        public string VendorName { get; set; }
        public string ContactAddress { get; set; }
        public string ContactNo { get; set; }
    }

    public class VerificationActor
    {
        public string Name { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
        public DateTime Date { get; set; }
    }
    public class DispatchVerificationActor: VerificationActor
    {
        public int DispatchId { get; set; }
        public bool isReceived { get; set; }
    }
}
