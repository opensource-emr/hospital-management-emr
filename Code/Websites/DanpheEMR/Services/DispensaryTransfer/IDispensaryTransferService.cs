using DanpheEMR.Controllers.Dispensary;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.DispensaryTransfer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.DispensaryTransfer
{
    public interface IDispensaryTransferService
    {
        IList<PHRMStoreModel> GetAllStoresForTransfer();
        Task<IList<GetAllDispensaryStocksVm>> GetAllDispensaryStocks(int DispensaryId);
        Task<int> TransferStock(List<StockTransferModel> value , RbacUser currentUser );
        Task<int> ReturnToStore(List<StockTransferModel> value, RbacUser currentUser);
        Task<int> DispensaryToDispensaryTransfer(List<StockTransferModel> value, RbacUser currentUser);
        Task<IList<GetAllTransactionByStoreIdDTO>> GetAllTransactionByStoreId(int storeId);
    }
}
