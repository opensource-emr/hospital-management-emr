using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IDesignationService
    {
        List<DesignationModel> ListDesignation();
        DesignationModel AddDesignation(DesignationModel model);
        DesignationModel UpdateDesignation(DesignationModel model);
        DesignationModel GetDesignation(int id);
    }
}
