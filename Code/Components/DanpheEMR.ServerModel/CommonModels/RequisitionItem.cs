using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.CommonModels
{
    interface IRequisitionItem
    {
        long? RequisitionId { get; set; }
        int PatientId { get; set; }
        int? RequestedByDr { get; set; }
        int? AssignedToDr { get; set; }
        int? ProviderId { get; set; }
        int? CreatedBy { get; set; }
        DateTime? CreatedOn { get; set; }
    }
}
