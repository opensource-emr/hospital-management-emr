using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TrackRequisitionViewModel
    {
        public int RequisitionId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime RequisitionDate { get; set; }
        public int MaxVerificationLevel { get; set; }
        public string Status { get; set; }
        public List<VerifiersPermissionViewModel> Verifiers { get; set; }
        public List<DispatchVerificationActor> Dispatchers { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
    }
}
