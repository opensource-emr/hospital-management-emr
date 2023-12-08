using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.WardSupply.Inventory.Requisition.DTOs
{
    public class SubStoreRequisition_DTO
    {
        public DateTime CreatedOn { get; set; }
        public int RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public int? DispatchNo { get; set; }
        public string CreatedByName { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public string RequisitionStatus { get; set; }
        public bool IsDirectDispatched { get; set; }
        public int? VerificationId { get; set; }
        public List<SubStoreRequisitionItems_DTO> RequisitionItems { get; set; }
    }
}
