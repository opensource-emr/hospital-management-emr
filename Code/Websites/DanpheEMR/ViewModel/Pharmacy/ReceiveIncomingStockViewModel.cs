using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Enums;

namespace DanpheEMR.ViewModel.Pharmacy
{
    #region Output ViewModel
    public class ReceiveIncomingStockViewModel
    {
    }
    #endregion

    #region Methods
    public static class ReceiveIncomingStockFunc
    {
        public static async Task<int> ReceiveIncomingStockAsync(this PharmacyDbContext db, int DispatchId, string ReceivingRemarks, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    List<PHRMDispatchItemsModel> dispatchItemsToUpdate = await db.StoreDispatchItems.Where(itm => itm.DispatchId == DispatchId).ToListAsync();
                    if (dispatchItemsToUpdate == null || dispatchItemsToUpdate.Count == 0) { throw new Exception("Items Not Found."); };

                    IReadOnlyList<string> IncomingTxns = new List<string>() { ENUM_PHRM_StockTransactionType.TransferItem, ENUM_PHRM_StockTransactionType.DispatchedItem };

                    foreach (var dispatchedItem in dispatchItemsToUpdate)
                    {
                        // Find stock txns for each dispatched item to get the stock id.
                        IReadOnlyList<PHRMStockTransactionModel> StockTxns = await db.StockTransactions.Where(ST => ST.ReferenceNo == dispatchedItem.DispatchItemsId && IncomingTxns.Contains(ST.TransactionType) && ST.IsActive == true).ToListAsync();
                        foreach (var stockTxn in StockTxns)
                        {
                            // Find stock id and update the stock quantity
                            var stock = await db.StoreStocks.FirstOrDefaultAsync(s => s.StoreStockId == stockTxn.StoreStockId && s.IsActive == true);
                            if (stock.StoreId == dispatchedItem.SourceStoreId)
                            {
                                // Decrease Unconfirmed Qty out
                                stock.DecreaseUnconfirmedQty(0, stockTxn.OutQty);
                            }
                            else
                            {
                                // Decrease UnconfirmedQtyIn
                                stock.DecreaseUnconfirmedQty(stockTxn.InQty, 0);
                                // Increate Available Qty
                                stock.UpdateAvailableQuantity(stock.AvailableQuantity + stockTxn.InQty);
                            }
                            await db.SaveChangesAsync();
                        }
                        // Update the Received Status in Dispatched Items Row in Dispatch Table
                        dispatchedItem.ReceivedById = currentUser.EmployeeId;
                        dispatchedItem.ReceivedOn = currentDate;
                        dispatchedItem.ReceivedRemarks = ReceivingRemarks;
                        await db.SaveChangesAsync();
                    }
                    dbResource.Commit();
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
            return DispatchId;
        }
    }
    #endregion
}
