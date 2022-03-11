using DanpheEMR.Security;
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
        GoodsReceiptModel AddGoodsArrival(GoodsReceiptModel model);
        GoodsReceiptModel GetGoodsReceipt(int id);
        //this function add po and po items when directly crea gr        
        PurchaseOrderModel AddPOAndPOItemsByGRId(GoodsReceiptModel model);
        //this function exist to update the good receipt
        int UpdateGoodsReceipt(GoodsReceiptModel GoodsReceipt, RbacUser rbacUser);
        /// <summary>
        /// Registers the stock in inventory
        /// </summary>
        /// <param name="item">Good Receipt item to be registered</param>
        /// <param name="GRCategory">Registered item based on Whether the GR item is capital or Consumable goods</param>
        /// <returns>true if success and false if failed</returns>
        int? AddtoInventoryStock(GoodsReceiptItemsModel grItem, string GRCategory, int StoreId, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId);
        void ReceiveGoodsReceipt(int GRId, RbacUser currentUser, string ReceiveRemarks = "");
    }
}
