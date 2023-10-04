using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Inventory.InventoryDonation
{
    public interface IDonationService
    {
        List<VendorMasterModel> GetVendorsThatReceiveDonation();

        List<DonationVM> GetAllDonation(DateTime fromDate, DateTime toDate, int StoreId);
        DonationVM GetDonationById(int DonationId);
        DonationDetailsVM GetDonationViewById(int DonationId);

        int SaveDonation(DonationModel donation);

        int UpdateDonation(DonationModel donation, int DonationId,int currentUser);
        bool CancelDonation(int DonationId,int currentUser,string Remarks);
    }
}
