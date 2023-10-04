using System;

namespace DanpheEMR.Services.Inventory.DTO.RequisitionDispatch
{
    public class RequisitionDispatchItem_DTO
    {
        public String ItemName { get; set; }
        public String BarCodeNumber { get; set; }
        public String Specification { get; set; }
        public String Code { get; set; }
        public int Quantity { get; set; }
        public int DispatchedQuantity { get; set; }
        public int ReceivedQuantity { get; set; }
        public int PendingQuantity { get; set; }
        public String RequisitionItemStatus { get; set; }
        public String ItemRemarks { get; set; }
    }
}
