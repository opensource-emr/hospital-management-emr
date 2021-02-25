using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.Pharmacy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IInventoryGoodReceiptService
    {
        List<GoodsReceiptModel> ListGoodsReceipt();
        List<VendorMasterModel> GetVendorList();
        GoodsReceiptModel AddGoodsReceipt(GoodsReceiptModel model);
        GoodsReceiptModel GetGoodsReceipt(int id);
        //this function add po and po items when directly crea gr        
        PurchaseOrderModel AddPOAndPOItemsByGRId(GoodsReceiptModel model);
        //this function exist to update the good receipt
        int UpdateGoodsReceipt(GoodsReceiptModel GoodsReceipt);
        bool AddtoInventoryStock(GoodsReceiptItemsModel item);
    }
}
