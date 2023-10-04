using DanpheEMR.ServerModel;
using System.Collections.Generic;

namespace DanpheEMR.Services.Dispensary
{
    public interface IDispensaryService
    {
        IList<DispensaryDTO> GetAllDispensaries();
        IList<GetAllPharmacyStoresDto> GetAllPharmacyStores();
        PHRMStoreModel GetDispensary(int id);
        DispensaryDTO AddDispensary(PHRMStoreModel value);
        PHRMStoreModel UpdateDispensary(PHRMStoreModel value);
        int ActivateDeactivateDispensary(int id);
    }
}
