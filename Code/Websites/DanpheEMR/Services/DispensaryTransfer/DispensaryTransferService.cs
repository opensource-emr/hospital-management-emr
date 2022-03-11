using DanpheEMR.Controllers.Dispensary;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.DispensaryTransfer;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Enums;

namespace DanpheEMR.Services.DispensaryTransfer
{
    public class DispensaryTransferService : IDispensaryTransferService
    {
        #region DECLARATION
        private PharmacyDbContext db;
        private RbacDbContext _rbacDb;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public DispensaryTransferService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);
        }
        #endregion

        #region METHODS

        public async Task<IList<GetAllTransactionByStoreIdDTO>> GetAllTransactionByStoreId(int StoreId)
        {
            var transferRecords = await (from D in db.StoreDispatchItems
                                         join I in db.PHRMItemMaster on D.ItemId equals I.ItemId
                                         join Gen in db.PHRMGenericModel on I.GenericId equals Gen.GenericId into Gens
                                         from GenLJ in Gens.DefaultIfEmpty()
                                         join E in db.Employees on D.CreatedBy equals E.EmployeeId
                                         join DS in db.PHRMStore on D.TargetStoreId equals DS.StoreId
                                         join RE in db.Employees on D.ReceivedById equals RE.EmployeeId into REJ
                                         from RELJ in REJ.DefaultIfEmpty()
                                         where D.SourceStoreId == StoreId
                                         orderby D.DispatchId descending
                                         select new GetAllTransactionByStoreIdDTO
                                         {
                                             DispatchId = D.DispatchId,
                                             DispatchItemId = D.DispatchItemsId,
                                             ItemId = D.ItemId,
                                             ItemName = I.ItemName,
                                             GenericName = (GenLJ != null) ? GenLJ.GenericName : "N/A",
                                             BatchNo = D.BatchNo,
                                             ExpiryDate = D.ExpiryDate,
                                             TransferredQuantity = D.DispatchedQuantity,
                                             TransferredDate = D.DispatchedDate,
                                             TransferredBy = E.FullName,
                                             TransferredTo = DS.Name,
                                             ReceivedBy = (RELJ != null) ? RELJ.FullName : "Not Received",
                                             ItemRemarks = D.ItemRemarks
                                         }).ToListAsync();
            return transferRecords;
        }
        public IList<PHRMStoreModel> GetAllStoresForTransfer()
        {
            var dispensaryCategory = ENUM_StoreCategory.Dispensary;
            var storeCategory = ENUM_StoreCategory.Store;
            return db.PHRMStore.Where(d => d.IsActive == true && (d.Category == dispensaryCategory || (d.Category == storeCategory && d.SubCategory != "inventory"))).ToList();
        }

        public async Task<int> TransferStock(List<StockTransferModel> transferedStock, RbacUser currentUser)
        {
            //Check if target store id is store or dispensary. compare from ENUM
            var targetStoreId = transferedStock[0].TargetStoreId;
            var storeCategory = ENUM_StoreCategory.Store;
            bool IsTargetMainStore = db.PHRMStore.Where(s => s.StoreId == targetStoreId).Select(s => s.Category).FirstOrDefault() == storeCategory;

            //If target is store, then call ReturnToStore Method.
            if (IsTargetMainStore == true)
                return await ReturnToStore(transferedStock, currentUser);
            //If target is dispensary, then call DispensaryToDispensaryTransfer Method.
            else
                return await DispensaryToDispensaryTransfer(transferedStock, currentUser);

        }

        public async Task<int> ReturnToStore(List<StockTransferModel> transferedStock, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDateTime = DateTime.Now;
                    var currentFiscalYearId = db.PharmacyFiscalYears.Where(f => f.StartDate <= currentDateTime && f.EndDate >= currentDateTime).Select(fy => fy.FiscalYearId).FirstOrDefault();
                    //Add data in store dispatchItem table
                    int dispatchId = (from D in db.StoreDispatchItems
                                      select D.DispatchId).DefaultIfEmpty(0).Max() ?? 0;
                    dispatchId++;

                    foreach (var newTransferedStock in transferedStock)
                    {
                        var newDispatchItem = new PHRMDispatchItemsModel()
                        {
                            ItemId = newTransferedStock.ItemId,
                            SourceStoreId = newTransferedStock.SourceStoreId,
                            TargetStoreId = newTransferedStock.TargetStoreId,
                            DispatchId = dispatchId,
                            CostPrice = newTransferedStock.CostPrice,
                            MRP = newTransferedStock.MRP,
                            BatchNo = newTransferedStock.BatchNo,
                            DispatchedQuantity = newTransferedStock.TransferredQuantity,
                            DispatchedDate = newTransferedStock.TransferredDate ?? currentDateTime,
                            ExpiryDate = newTransferedStock.ExpiryDate,
                            ItemRemarks = newTransferedStock.ItemRemarks,
                            Remarks = newTransferedStock.Remarks,
                            CreatedBy = currentUser.EmployeeId,
                            CreatedOn = currentDateTime,

                        };
                        db.StoreDispatchItems.Add(newDispatchItem);
                        //Save Dispatch Items
                        await db.SaveChangesAsync();

                        //Find the stock to be decreased for each transferred item in DispensaryStock table.
                        var currentDispensaryStockList = await db.StoreStocks.Include(a => a.StockMaster).Where(s => s.ItemId == newTransferedStock.ItemId && s.StoreId == newTransferedStock.SourceStoreId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == newTransferedStock.BatchNo && s.StockMaster.ExpiryDate == newTransferedStock.ExpiryDate && s.IsActive == true).ToListAsync();
                        // If no stock found, stop the process
                        if (currentDispensaryStockList == null) throw new InvalidOperationException($"Stock is not available for ItemId = {newTransferedStock.ItemId}, BatchNo ={newTransferedStock.BatchNo}");
                        // If total available quantity is less than the required/ transferred quantity, then stop the process
                        if (currentDispensaryStockList.Sum(s => s.AvailableQuantity) < newTransferedStock.TransferredQuantity) throw new InvalidOperationException($"Stock is not available for ItemId = {newTransferedStock.ItemId}, BatchNo ={newTransferedStock.BatchNo}");

                        var remainingQty = newTransferedStock.TransferredQuantity;

                        foreach (var dispensaryStock in currentDispensaryStockList)
                        {
                            //Add Txn in Stock Transaction Table
                            var dispensaryStockTxn = new PHRMStockTransactionModel(
                                stock: dispensaryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                transactionDate: newTransferedStock.TransferredDate ?? currentDateTime,
                                referenceNo: newDispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDateTime,
                                fiscalYearId: currentFiscalYearId
                                );
                            //Find stock in Main Stocks
                            var mainStoreStock = await db.StoreStocks.Include(s => s.StockMaster).FirstOrDefaultAsync(s => s.StockId == dispensaryStock.StockId && s.StoreId == newDispatchItem.TargetStoreId);
                            if (mainStoreStock == null)
                            {
                                mainStoreStock = new PHRMStoreStockModel(stockMaster: dispensaryStock.StockMaster, storeId: newDispatchItem.TargetStoreId, quantity: 0);
                                db.StoreStocks.Add(mainStoreStock);
                                await db.SaveChangesAsync();
                            }

                            var mainStoreStockTxn = new PHRMStockTransactionModel(
                                stock: mainStoreStock,
                                transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                transactionDate: newTransferedStock.TransferredDate ?? currentDateTime,
                                referenceNo: newDispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDateTime,
                                fiscalYearId: currentFiscalYearId
                                );
                            if (dispensaryStock.AvailableQuantity < remainingQty)
                            {
                                remainingQty -= dispensaryStock.AvailableQuantity;

                                mainStoreStock.IncreaseUnconfirmedQty(inQty: dispensaryStock.AvailableQuantity, outQty: 0);
                                mainStoreStockTxn.SetInOutQuantity(inQty: dispensaryStock.AvailableQuantity, outQty: 0);

                                dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: dispensaryStock.AvailableQuantity);

                                dispensaryStock.IncreaseUnconfirmedQty(inQty: 0, outQty: dispensaryStock.AvailableQuantity);
                                dispensaryStock.UpdateAvailableQuantity(newQty: 0);
                            }
                            else
                            {
                                dispensaryStock.UpdateAvailableQuantity(newQty: dispensaryStock.AvailableQuantity - remainingQty);
                                dispensaryStock.IncreaseUnconfirmedQty(inQty: 0, outQty: remainingQty);
                                dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: remainingQty);

                                mainStoreStock.IncreaseUnconfirmedQty(inQty: remainingQty, outQty: 0);
                                mainStoreStockTxn.SetInOutQuantity(inQty: remainingQty, outQty: 0);
                                remainingQty = 0;
                            }
                            db.StockTransactions.Add(mainStoreStockTxn);
                            db.StockTransactions.Add(dispensaryStockTxn);
                            await db.SaveChangesAsync();

                            if (remainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. 
                            }
                        }
                    }
                    dbResource.Commit();
                }
                catch (Exception ex)
                {
                    dbResource.Rollback();
                    throw ex;
                }
            }
            return transferedStock[0].DispatchId ?? 1;
        }

        public async Task<int> DispensaryToDispensaryTransfer(List<StockTransferModel> transferStocks, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = db.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).Select(fy => fy.FiscalYearId).FirstOrDefault();
                    var newDispatchId = db.StoreDispatchItems.Select(s => s.DispatchId).DefaultIfEmpty(0).Max() ?? 0;
                    ++newDispatchId;
                    //Create a requisition requested by Target Dispensary to Main Store with requisition status : "pending" and all requisition item status: "pending"
                    var newRequisitionNo = (from R in db.StoreRequisition where R.FiscalYearId == currentFiscalYearId select R.RequisitionNo).DefaultIfEmpty(0).Max() + 1;

                    var newRequisition = new PHRMStoreRequisitionModel()
                    {
                        StoreId = transferStocks[0].TargetStoreId,
                        RequisitionDate = currentDate,
                        RequisitionNo = ++newRequisitionNo,
                        RequisitionStatus = "pending",
                        CreatedBy = currentUser.EmployeeId,
                        CreatedOn = currentDate,
                        FiscalYearId = currentFiscalYearId
                    };
                    db.StoreRequisition.Add(newRequisition);
                    await db.SaveChangesAsync();

                    foreach (var transferStock in transferStocks)
                    {
                        //add requisition item for each transfered stock
                        var newRequisitionItem = new PHRMStoreRequisitionItemsModel()
                        {
                            ItemId = transferStock.ItemId,
                            PendingQuantity = 0,
                            CreatedBy = currentUser.EmployeeId,
                            CreatedOn = currentDate,
                            Remark = transferStock.ItemRemarks,
                            Quantity = transferStock.TransferredQuantity,
                            ReceivedQuantity = transferStock.TransferredQuantity,
                            RequisitionItemStatus = "pending",
                            RequisitionId = newRequisition.RequisitionId,
                        };
                        db.StoreRequisitionItems.Add(newRequisitionItem);
                        await db.SaveChangesAsync();
                        //Register the record in dispatch table with SourceStore = Current Dispensary and TargetStore = Target Dispensary
                        var dispatchItem = new PHRMDispatchItemsModel()
                        {
                            DispatchId = newDispatchId,
                            RequisitionId = newRequisition.RequisitionId,
                            DispatchedDate = currentDate,
                            ItemId = transferStock.ItemId,
                            RequisitionItemId = newRequisitionItem.RequisitionItemId,
                            BatchNo = transferStock.BatchNo,
                            ExpiryDate = transferStock.ExpiryDate,
                            CostPrice = transferStock.CostPrice,
                            MRP = transferStock.MRP,
                            DispatchedQuantity = transferStock.TransferredQuantity,
                            SourceStoreId = transferStock.SourceStoreId,
                            TargetStoreId = transferStock.TargetStoreId,
                            ItemRemarks = transferStock.ItemRemarks,
                            Remarks = transferStock.Remarks,
                            ReceivedBy = transferStock.ReceivedBy,
                            CreatedBy = currentUser.EmployeeId,
                            CreatedOn = currentDate,
                        };
                        db.StoreDispatchItems.Add(dispatchItem);
                        await db.SaveChangesAsync();

                        //Decrease the stock from the current Source Dispensary.
                        var sourceDispesaryStockList = await db.StoreStocks.Include(s => s.StockMaster).Where(s => s.StoreId == dispatchItem.SourceStoreId && s.ItemId == dispatchItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == dispatchItem.BatchNo && s.StockMaster.ExpiryDate == dispatchItem.ExpiryDate && s.IsActive == true).ToListAsync();
                        //If no stock found, stop the process
                        if (sourceDispesaryStockList == null) throw new InvalidOperationException($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (sourceDispesaryStockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new InvalidOperationException($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                        var totalRemainingQty = dispatchItem.DispatchedQuantity;
                        foreach (var sourceDispensaryStock in sourceDispesaryStockList)
                        {
                            var sourceDispensaryStockTXN = new PHRMStockTransactionModel(
                                stock: sourceDispensaryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                transactionDate: dispatchItem.DispatchedDate ?? currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );
                            //Increase Stock in PHRM_DispensaryStock
                            //Find if the stock is available in dispensary
                            var targetDispensaryStock = await db.StoreStocks.Include(s => s.StockMaster).FirstOrDefaultAsync(s => s.StockId == sourceDispensaryStock.StockId && s.StoreId == dispatchItem.TargetStoreId && s.IsActive == true);
                            //If stock is not found, then add new stock
                            if (targetDispensaryStock == null)
                            {
                                targetDispensaryStock = new PHRMStoreStockModel(
                                    stockMaster: sourceDispensaryStock.StockMaster,
                                    storeId: dispatchItem.TargetStoreId,
                                    quantity: 0
                                    );
                                db.StoreStocks.Add(targetDispensaryStock);
                                await db.SaveChangesAsync();
                            }
                            //Add Txn in PHRM_StockTxnItems table
                            var targetDispensaryStockTXN = new PHRMStockTransactionModel(
                                stock: targetDispensaryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                transactionDate: dispatchItem.DispatchedDate ?? currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );

                            if (sourceDispensaryStock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= sourceDispensaryStock.AvailableQuantity;

                                targetDispensaryStock.IncreaseUnconfirmedQty(inQty: sourceDispensaryStock.AvailableQuantity, outQty: 0);
                                targetDispensaryStockTXN.SetInOutQuantity(inQty: sourceDispensaryStock.AvailableQuantity, outQty: 0);

                                sourceDispensaryStockTXN.SetInOutQuantity(inQty: 0, outQty: sourceDispensaryStock.AvailableQuantity);

                                sourceDispensaryStock.IncreaseUnconfirmedQty(inQty: 0, outQty: sourceDispensaryStock.AvailableQuantity);
                                sourceDispensaryStock.UpdateAvailableQuantity(newQty: 0);
                            }
                            else
                            {
                                sourceDispensaryStock.UpdateAvailableQuantity(newQty: sourceDispensaryStock.AvailableQuantity - totalRemainingQty);
                                sourceDispensaryStock.IncreaseUnconfirmedQty(inQty: 0, outQty: totalRemainingQty);
                                sourceDispensaryStockTXN.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);

                                targetDispensaryStock.IncreaseUnconfirmedQty(inQty: totalRemainingQty, outQty: 0);
                                targetDispensaryStockTXN.SetInOutQuantity(inQty: totalRemainingQty, outQty: 0);
                                totalRemainingQty = 0;
                            }

                            db.StockTransactions.Add(sourceDispensaryStockTXN);
                            db.StockTransactions.Add(targetDispensaryStockTXN);
                            await db.SaveChangesAsync();

                            if (totalRemainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    }

                    dbResource.Commit();
                    return newDispatchId;
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
        }

        public async Task<IList<GetAllDispensaryStocksVm>> GetAllDispensaryStocks(int DispensaryId)
        {
            var totalStock = await (from stk in db.StoreStocks
                                    join itm in db.PHRMItemMaster on stk.ItemId equals itm.ItemId
                                    join gen in db.PHRMGenericModel on itm.GenericId equals gen.GenericId into gens
                                    from genLj in gens.DefaultIfEmpty()
                                    where stk.AvailableQuantity > 0 && stk.StoreId == DispensaryId
                                    group new { stk, itm, genLj } by new { stk.ItemId, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate, stk.StockMaster.CostPrice, stk.StockMaster.MRP, itm.ItemName } into stkGrouped
                                    select new GetAllDispensaryStocksVm
                                    {
                                        ItemId = stkGrouped.Key.ItemId,
                                        GenericName = (stkGrouped.FirstOrDefault().genLj != null) ? stkGrouped.FirstOrDefault().genLj.GenericName : "N/A",
                                        ItemName = stkGrouped.Key.ItemName,
                                        BatchNo = stkGrouped.Key.BatchNo,
                                        ExpiryDate = stkGrouped.Key.ExpiryDate.Value,
                                        MRP = stkGrouped.Key.MRP,
                                        CostPrice = stkGrouped.Key.CostPrice,
                                        AvailableQuantity = stkGrouped.Sum(s => s.stk.AvailableQuantity),
                                        IsInsuranceApplicable = stkGrouped.FirstOrDefault().itm.IsInsuranceApplicable
                                    }).ToListAsync();
            return totalStock;
        }
        #endregion
    }

    #region VIEWMODELS
    public class GetAllTransactionByStoreIdDTO
    {
        public int? DispatchId { get; set; }
        public int DispatchItemId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double TransferredQuantity { get; set; }
        public DateTime? TransferredDate { get; set; }
        public string TransferredBy { get; set; }
        public string TransferredTo { get; set; }
        public string ReceivedBy { get; set; }
        public string ItemRemarks { get; set; }
        public string GenericName { get; set; }
    }
    public class GetAllDispensaryStocksVm
    {
        public int ItemId { get; set; }
        public string GenericName { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal MRP { get; set; }
        public decimal CostPrice { get; set; }
        public double AvailableQuantity { get; set; }
        public bool? IsInsuranceApplicable { get; set; }
    }

    #endregion

}
