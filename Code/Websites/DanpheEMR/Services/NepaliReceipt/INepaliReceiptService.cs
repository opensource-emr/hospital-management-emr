using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface INepaliReceiptService
    {
        Task<DonationGRVm> GetDonationGRView(int GoodsReceiptId);
        NepaliRequisitionVm GetNepaliRequisitionView(int RequisitionId, string ModuleType);
        NepaliDispatchVm GetNepaliDispatchView(int DispatchId, string ModuleType);
    }
}
