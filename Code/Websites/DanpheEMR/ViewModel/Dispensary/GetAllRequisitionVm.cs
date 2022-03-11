using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Dispensary
{

    public class GetAllRequisitionVm
    {
        public IList<GetAllRequisitionDTO> requisitionList { get; set; }
    }

    public class GetAllRequisitionDTO
    {
        public int RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public string CreatedByName { get; set; }
        public bool CanDispatchItem { get; set; }
        public bool CanApproveTransfer { get; set; }
        public string RequistingStore { get; set; }
    }
}
