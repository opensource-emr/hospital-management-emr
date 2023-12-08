using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class PostStoreDispatchViewModel
    {

        public int DispensaryId { get; set; }
        public int ItemId { get; set; }
        public int RequisitionId { get; set; }
        public int RequisitionItemId { get; set; }
        public double DispatchedQuantity { get; set; }
        public string ReceivedBy { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal PendingQuantity { get; set; }

    }

    public static class PostStoreDispatchFunc
    {
        public static async Task<int> PostStoreDispatch(this PharmacyDbContext db, IList<PostStoreDispatchViewModel> dispatchItems, RbacUser currentUser)
        {
            var dispatchId = await db.StoreDispatchItems.Select(a => a.DispatchId).DefaultIfEmpty(0).MaxAsync() + 1;
            var currentDate = DateTime.Now;
            var currentFiscalYearId = db.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault().FiscalYearId;
            var mainStoreObj = db.PHRMStore.Where(s => s.Category == ENUM_StoreCategory.Store && s.SubCategory == ENUM_StoreSubCategory.Pharmacy).FirstOrDefault();

            if (mainStoreObj == null)
            {
                throw new Exception("Main Store not found");
            }
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var dispatchItemList = new List<PHRMDispatchItemsModel>();
                    await SaveDispatchItems(db, dispatchItems, currentUser, dispatchId, currentDate, mainStoreObj.StoreId, dispatchItemList);
                    await SaveStockTransactionAndUpdateStock(db, currentUser, currentDate, currentFiscalYearId, dispatchItemList);
                    await UpdateRequisitionStatus(db, dispatchItems);


                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return dispatchId ?? 0;
        }
        //Here we have used StoreDispatch API for SubStoreDispatch (Copy of above method with some modification) : ROHIT/12Dec'22
        public static async Task<int> PostSubStoreDispatch(this PharmacyDbContext db, IList<PostStoreDispatchViewModel> dispatchItems, RbacUser currentUser)
        {
            var i = 0;
            var dispatchId = await db.StoreDispatchItems.Select(a => a.DispatchId).DefaultIfEmpty(0).MaxAsync() + 1;
            var currentDate = DateTime.Now;
            var currentFiscalYearId = db.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault().FiscalYearId;
            var mainStoreObj = db.PHRMStore.Where(s => s.Category == ENUM_StoreCategory.Store && s.SubCategory == ENUM_StoreSubCategory.Pharmacy).FirstOrDefault();

            if (mainStoreObj == null)
            {
                throw new Exception("Main Store not found");
            }
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var dispatchItemList = new List<PHRMDispatchItemsModel>();
                    await SaveDispatchItems(db, dispatchItems, currentUser, dispatchId, currentDate, mainStoreObj.StoreId, dispatchItemList);
                    await SaveStockTransactionAndUpdateStock(db, currentUser, currentDate, currentFiscalYearId, dispatchItemList);
                    await UpdateRequisitionStatus(db, dispatchItems);

                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return dispatchId ?? 0;
        }

        private static async Task SaveStockTransactionAndUpdateStock(PharmacyDbContext db, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId, List<PHRMDispatchItemsModel> dispatchItemList)
        {
            foreach (var dispatchItem in dispatchItemList)
            {
                //Find the stock from main store and decrease
                var stockList = await db.StoreStocks.Include(s => s.StockMaster)
                    .Where(s => s.StoreId == dispatchItem.SourceStoreId &&
                    s.ItemId == dispatchItem.ItemId &&
                    s.AvailableQuantity > 0 &&
                    s.StockMaster.BatchNo == dispatchItem.BatchNo &&
                    s.StockMaster.ExpiryDate == dispatchItem.ExpiryDate &&
                    s.StockMaster.SalePrice == dispatchItem.SalePrice &&
                    s.IsActive == true).ToListAsync();

                //If no stock found, stop the process
                if (stockList == null) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                //If total available quantity is less than the required/dispatched quantity, then stop the process
                if (stockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                var totalRemainingQty = dispatchItem.DispatchedQuantity;
                foreach (var stock in stockList)
                {
                    var stockTxn = new PHRMStockTransactionModel(
                        storeStock: stock,
                        transactionType: ENUM_PHRM_StockTransactionType.SubStoreDispatchFrom,
                        transactionDate: dispatchItem.DispatchedDate ?? currentDate,
                        referenceNo: dispatchItem.DispatchItemsId,
                        createdBy: currentUser.EmployeeId,
                        createdOn: currentDate,
                        fiscalYearId: currentFiscalYearId
                        );

                    //Increase Stock in Dispensary
                    //Find if the stock is available in dispensary
                    var dispensaryStock = await db.StoreStocks.FirstOrDefaultAsync(s => s.StockId == stock.StockId && s.StoreId == dispatchItem.TargetStoreId && s.IsActive == true);
                    // check if receive feature is enabled, to decide whether to increase in stock or increase unconfirmed quantity
                    var isReceiveFeatureEnabled = db.CFGParameters
                                                    .Where(param => param.ParameterGroupName == "Pharmacy" && param.ParameterName == "EnableReceiveItemsInDispensary")
                                                    .Select(param => param.ParameterValue == "true" ? true : false)
                                                    .FirstOrDefault();
                    //If stock is not found, then add new stock
                    if (dispensaryStock == null)
                    {
                        dispensaryStock = new PHRMStoreStockModel(
                            stockMaster: stock.StockMaster,
                            storeId: dispatchItem.TargetStoreId,
                            quantity: 0,
                            costPrice: stock.CostPrice,
                            salePrice: stock.SalePrice
                            );
                        db.StoreStocks.Add(dispensaryStock);
                        db.SaveChanges();
                    }
                    //Add Txn in PHRMStockTransactionModel table
                    var dispensaryStockTxn = new PHRMStockTransactionModel(
                        storeStock: dispensaryStock,
                        transactionType: ENUM_PHRM_StockTransactionType.SubStoreDispatchTo,
                        transactionDate: dispatchItem.DispatchedDate ?? currentDate,
                        referenceNo: dispatchItem.DispatchItemsId,
                        createdBy: currentUser.EmployeeId,
                        createdOn: currentDate,
                        fiscalYearId: currentFiscalYearId
                        );

                    if (stock.AvailableQuantity < totalRemainingQty)
                    {
                        totalRemainingQty -= stock.AvailableQuantity;
                        stockTxn.SetInOutQuantity(inQty: 0, outQty: stock.AvailableQuantity);
                        if (isReceiveFeatureEnabled == true)
                        {
                            stock.IncreaseUnconfirmedQty(inQty: 0, outQty: stock.AvailableQuantity);
                            dispensaryStock.IncreaseUnconfirmedQty(inQty: stock.AvailableQuantity, outQty: 0);
                        }
                        else
                        {
                            dispensaryStock.UpdateAvailableQuantity(dispensaryStock.AvailableQuantity + stock.AvailableQuantity);
                        }
                        dispensaryStockTxn.SetInOutQuantity(inQty: stock.AvailableQuantity, outQty: 0);
                        stock.UpdateAvailableQuantity(newQty: 0);

                    }
                    else
                    {
                        stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity - totalRemainingQty);
                        stockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                        if (isReceiveFeatureEnabled == true)
                        {
                            stock.IncreaseUnconfirmedQty(inQty: 0, outQty: totalRemainingQty);
                            dispensaryStock.IncreaseUnconfirmedQty(inQty: totalRemainingQty, outQty: 0);
                        }
                        else
                        {
                            dispensaryStock.UpdateAvailableQuantity(dispensaryStock.AvailableQuantity + totalRemainingQty);
                        }
                        dispensaryStockTxn.SetInOutQuantity(inQty: totalRemainingQty, outQty: 0);
                        totalRemainingQty = 0;
                    }

                    db.StockTransactions.Add(stockTxn);
                    db.StockTransactions.Add(dispensaryStockTxn);
                    if (totalRemainingQty == 0)
                    {
                        break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                    }
                }
            }
            await db.SaveChangesAsync();
        }


        private static async Task UpdateRequisitionStatus(PharmacyDbContext db, IList<PostStoreDispatchViewModel> dispatchItems)
        {
            var allUniqueRequisitionItemIds = dispatchItems.Select(d => d.RequisitionItemId).Distinct();
            foreach (var requisitionItemId in allUniqueRequisitionItemIds)
            {
                //find requisition item and update the status
                var requisitionItem = await db.StoreRequisitionItems.FindAsync(requisitionItemId);
                var dispatchDetails = db.StoreDispatchItems.Where(di => di.RequisitionItemId == requisitionItemId).ToList();
                requisitionItem.ReceivedQuantity = dispatchDetails != null ? dispatchDetails.Sum(a => a.DispatchedQuantity) : 0;

                var currentDispatchDetails = dispatchItems.Where(di => di.RequisitionItemId == requisitionItemId).ToList();
                requisitionItem.PendingQuantity = currentDispatchDetails != null ? requisitionItem.PendingQuantity - currentDispatchDetails.Sum(di => di.DispatchedQuantity) : requisitionItem.PendingQuantity;

                if (requisitionItem.PendingQuantity < 0)
                {
                    requisitionItem.PendingQuantity = 0;
                }
                requisitionItem.RequisitionItemStatus = (requisitionItem.PendingQuantity <= 0) ? "complete" : "partial";
                await db.SaveChangesAsync();
                //i++;
            }
            //update requisition status
            var requisitionId = dispatchItems[0].RequisitionId;
            var requisition = await db.StoreRequisition.FindAsync(requisitionId);
            var isRequisitionComplete = await db.StoreRequisitionItems.Where(r => r.RequisitionId == requisitionId).AllAsync(r => r.RequisitionItemStatus == "complete" || r.RequisitionItemStatus == "cancelled");
            requisition.RequisitionStatus = isRequisitionComplete ? "complete" : "partial";
            await db.SaveChangesAsync();
        }


        private static async Task SaveDispatchItems(PharmacyDbContext db, IList<PostStoreDispatchViewModel> dispatchItems, RbacUser currentUser, int? dispatchId, DateTime currentDate, int mainStoreId, List<PHRMDispatchItemsModel> dispatchItemList)
        {
            foreach (var dispatchItem in dispatchItems)
            {
                var newDispatchItem = new PHRMDispatchItemsModel()
                {
                    DispatchId = dispatchId,
                    BatchNo = dispatchItem.BatchNo,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = currentDate,
                    DispatchedDate = currentDate,
                    DispatchedQuantity = dispatchItem.DispatchedQuantity,
                    SourceStoreId = mainStoreId,
                    TargetStoreId = dispatchItem.DispensaryId, //Here we are treating DispensaryId as SubStoreId
                    ExpiryDate = dispatchItem.ExpiryDate,
                    ItemId = dispatchItem.ItemId,
                    ReceivedBy = dispatchItem.ReceivedBy,
                    RequisitionId = dispatchItem.RequisitionId,
                    RequisitionItemId = dispatchItem.RequisitionItemId,
                    CostPrice = (decimal)dispatchItem.CostPrice,
                    SalePrice = (decimal)dispatchItem.SalePrice,
                    PendingQuantity = dispatchItem.PendingQuantity <= 0 ? 0 : dispatchItem.PendingQuantity
                };
                dispatchItemList.Add(newDispatchItem);
            }
            db.StoreDispatchItems.AddRange(dispatchItemList);
            await db.SaveChangesAsync();
        }

    }

}
