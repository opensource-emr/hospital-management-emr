using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Dispensary
{
    public class GetRequisitionViewVm
    {
        public GetRequisitionViewDto requisition { get; set; }
    }
    public class GetRequisitionViewDto
    {
        public int RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public string RequestedBy { get; set; }
        public string DispatchedBy { get; set; }
        public string ReceivedBy { get; set; }
        public IList<GetRequisitionItemViewDto> RequisitionItems { get; set; }
        public string RequestedStoreName { get; set; }

        public GetRequisitionViewDto()
        {
            RequisitionItems = new List<GetRequisitionItemViewDto>();
        }

    }
    public class GetRequisitionItemViewDto
    {
        public int? RequisitionId { get; set; }
        public int RequisitionItemId { get; set; }
        public string ItemName { get; set; }
        public double? RequestedQuantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public string RequestedItemStatus { get; set; }
        public string Remarks { get; set; }
        public string GenericName { get; set; }
        public string CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
    }
}
