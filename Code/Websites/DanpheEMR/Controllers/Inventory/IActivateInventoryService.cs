using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IActivateInventoryService
    {
        IList<ActivateInventoryDTO> GetAllInventories();
        PHRMStoreModel GetInventory(int id);
    }
}
