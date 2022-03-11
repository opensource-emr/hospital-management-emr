using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Dispensary
{
    public class GetAllRequisitionByDispensaryIdVm
    {
        public IList<GetAllRequisitionByDispensaryIdDTO> requisitionList { get; set; }
    }
    public class GetAllRequisitionByDispensaryIdDTO
    {
        public int RequisitionId { get; set; }
        public int RequistionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public string CreatedByName { get; set; }
        public bool IsReceiveFeatureEnabed { get; set; }
        public bool IsNewDispatchAvailable { get; set; }
        public string RequestedStoreName { get; set; }
    }
}
