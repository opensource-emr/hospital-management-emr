using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.FractionModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IFractionPercentService
    {
        List<FractionPercentVM> ListFractionApplicableItems();
        FractionPercentVM AddFractionPercent(FractionPercentModel model);
        FractionPercentVM UpdateFractionPercent(FractionPercentModel model);
        FractionPercentVM GetFractionPercent(int id);
        FractionPercentVM GetFractionPercentByBillPriceId(int id);

    }
}
