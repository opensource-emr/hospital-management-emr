using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IInventoryCompanyService
    {
        List<InventoryCompanyModel> ListCompany();
        InventoryCompanyModel AddCompany(InventoryCompanyModel model);
        InventoryCompanyModel UpdateCompany(InventoryCompanyModel model);
        InventoryCompanyModel GetCompany(int id);
        void DeleteInventoryCompany(int id);
    }
}
