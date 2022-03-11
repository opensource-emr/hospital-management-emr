using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using DanpheEMR.Utilities;
using System.Reflection;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.NotificationModels;
using DanpheEMR.ViewModel.Procurement;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.Services;

namespace DanpheEMR.Controllers
{
    public class InventoryBL
    {

        #region Dispatch Items Complete Transaction 
        //This function is complete transaction after dispatch items. Transactions as below
        //1)Save Dispatched Items,                          2)Save Stock Transaction 
        //3) Update Stock model (available Quantity)        4) Update Requisition and Requisition Items (Status and ReceivedQty,PendingQty, etc)
        public static int DispatchItemsTransaction(List<DispatchItemsModel> dispatchItems, IInventoryReceiptNumberService receiptNumberService, InventoryDbContext inventoryDb, RbacUser currentUser)
        {
            var currentDate = DateTime.Now;
            var currentFiscYrId = GetFiscalYear(inventoryDb).FiscalYearId;

            var newDispatchId = receiptNumberService.GenerateDispatchNo(currentFiscYrId, dispatchItems.FirstOrDefault().ReqDisGroupId);

            // pre-load requisition items in bulk to reduce db connections
            var requisitionItemIds = dispatchItems.Select(d => d.RequisitionItemId).ToList();
            List<RequisitionItemsModel> requisitionItems = inventoryDb.RequisitionItems.Where(r => requisitionItemIds.Contains(r.RequisitionItemId)).ToList();

            foreach (var dispatchItem in dispatchItems)
            {
                dispatchItem.CreatedOn = DateTime.Now;
                dispatchItem.FiscalYearId = GetFiscalYear(inventoryDb).FiscalYearId;
                dispatchItem.DispatchId = newDispatchId;
                dispatchItem.DispatchNo = receiptNumberService.GenerateDispatchNo(dispatchItem.FiscalYearId, dispatchItem.ReqDisGroupId);
                inventoryDb.DispatchItems.Add(dispatchItem);

                // update requisition tables

                // find the requisition items and update the quantity and status.
                var requisitionItem = requisitionItems.FirstOrDefault(r => r.RequisitionItemId == dispatchItem.RequisitionItemId);
                requisitionItem.ReceivedQuantity = dispatchItem.DispatchedQuantity;
                requisitionItem.PendingQuantity = requisitionItem.PendingQuantity - requisitionItem.ReceivedQuantity;// Rohit partial dispatch
                requisitionItem.RequisitionItemStatus = (requisitionItem.PendingQuantity > 0) ? "partial" : "complete";
                requisitionItem.ModifiedBy = currentUser.EmployeeId;
                requisitionItem.ModifiedOn = currentDate;

            }
            //Save Dispatch Items
            inventoryDb.SaveChanges();

            // Find the stock from source store for each dispatched item
            // Apply FIFO Logic and decrement the stock, also increment the stock to the target store as well.
            foreach (var dispatchItem in dispatchItems)
            {
                var stockList = inventoryDb.StoreStocks
                                        .Include(s => s.StockMaster)
                                        .Where(s => s.StoreId == dispatchItem.SourceStoreId && s.ItemId == dispatchItem.ItemId && s.AvailableQuantity > 0 && s.IsActive == true)
                                        .OrderBy(s => s.StockMaster.ExpiryDate)
                                        .ToList();
                //If no stock found, stop the process
                if (stockList == null) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                //If total available quantity is less than the required/dispatched quantity, then stop the process
                if (stockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                var totalRemainingQty = dispatchItem.DispatchedQuantity;
                foreach (var mainStoreStock in stockList)
                {
                    //Increase Stock in PHRM_DispensaryStock
                    //Find if the stock is available in dispensary
                    var substoreStock = inventoryDb.StoreStocks
                                                    .FirstOrDefault(s => s.StockId == mainStoreStock.StockId && s.StoreId == dispatchItem.TargetStoreId && s.IsActive == true);
                    // check if receive feature is enabled, to decide whether to increase in stock or increase unconfirmed quantity
                    var isReceiveFeatureEnabled = inventoryDb.CfgParameters
                                                    .Where(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "EnableReceivedItemInSubstore")
                                                    .Select(param => param.ParameterValue == "true" ? true : false)
                                                    .FirstOrDefault();
                    //Add Txn in PHRM_StockTxnItems table



                    if (mainStoreStock.AvailableQuantity < totalRemainingQty)
                    {
                        var dispatchQtyForThisStock = mainStoreStock.AvailableQuantity;
                        totalRemainingQty -= mainStoreStock.AvailableQuantity;
                        //Decrease Stock From Main Store
                        mainStoreStock.DecreaseStock(
                                quantity: mainStoreStock.AvailableQuantity,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItem,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId
                            );
                        // Add Stock to Dispensary
                        if (substoreStock == null)
                        {
                            // add new stock
                            substoreStock = new StoreStockModel(
                                stockMaster: mainStoreStock.StockMaster,
                                storeId: dispatchItem.TargetStoreId,
                                quantity: dispatchQtyForThisStock,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId,
                                needConfirmation: isReceiveFeatureEnabled
                                );
                            inventoryDb.StoreStocks.Add(substoreStock);
                        }
                        else
                        {
                            // update old stock
                            substoreStock.AddStock(
                                quantity: dispatchQtyForThisStock,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId,
                                needConfirmation: isReceiveFeatureEnabled
                                );
                        }
                        inventoryDb.SaveChanges();
                    }
                    else
                    {
                        //Decrease Stock From Main Store
                        mainStoreStock.DecreaseStock(
                                quantity: totalRemainingQty,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItem,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId
                            );
                        // Add Stock to Dispensary
                        if (substoreStock == null)
                        {
                            // add new stock
                            substoreStock = new StoreStockModel(
                                stockMaster: mainStoreStock.StockMaster,
                                storeId: dispatchItem.TargetStoreId,
                                quantity: totalRemainingQty,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId,
                                needConfirmation: isReceiveFeatureEnabled
                                );
                            inventoryDb.StoreStocks.Add(substoreStock);
                        }
                        else
                        {
                            // update old stock
                            substoreStock.AddStock(
                                quantity: totalRemainingQty,
                                transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                transactionDate: dispatchItem.DispatchedDate,
                                currentDate: currentDate,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscYrId,
                                needConfirmation: isReceiveFeatureEnabled
                                );
                        }
                        totalRemainingQty = 0;
                        inventoryDb.SaveChanges();
                        break;
                    }
                }
            }

            var requisition = inventoryDb.Requisitions.Find(dispatchItems[0].RequisitionId);
            Boolean IsRequisitionComplete = requisitionItems.All(rItem => rItem.RequisitionItemStatus == "complete");
            requisition.RequisitionStatus = IsRequisitionComplete ? "complete" : "partial";
            requisition.ModifiedBy = currentUser.EmployeeId;
            requisition.ModifiedOn = currentDate;
            inventoryDb.SaveChanges();

            return newDispatchId;
        }

        public static bool IsItemReceiveFeatureEnabled(InventoryDbContext db)
        {
            var setting = db.CfgParameters
                    .Where(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "EnableReceivedItemInSubstore")
                    .Select(param => param.ParameterValue)
                    .FirstOrDefault();
            if (setting == "true") return true;
            return false;
        }
        #endregion

        #region Write-Off Items Transaction with Stock_Transaction Entry and Update in Stock also.
        //This function is Transaction and do followig things
        //1) Save WriteOff Items entry in WriteOff Table    2) WriteOff Items Entry in Stock_Transaction table
        //3) Update Stock Table Quantity
        public static Boolean WriteOffItemsTransaction(List<WriteOffItemsModel> writeOffItemsFromClient, InventoryDbContext db, RbacUser currentUser)
        {
            //Transaction Begin
            //We first Need to make Stock, Stock_Transaction Object with WriteOff data (which has client data)
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {

                    //Save WriteOffItems in database
                    AddWriteOffItems(db, writeOffItemsFromClient);

                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;

                    //This is WriteOff List for insert into writeOff table
                    List<WriteOffItemsModel> writeOffListForInsert = new List<WriteOffItemsModel>();
                    foreach (var writeoffItem in writeOffItemsFromClient)
                    {

                        var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(s => s.ItemId == writeoffItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == writeoffItem.BatchNO && s.IsActive == true && s.StoreId == writeoffItem.StoreId).ToList();
                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {writeoffItem.ItemId}, BatchNo ={writeoffItem.BatchNO}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < writeoffItem.WriteOffQuantity) throw new Exception($"Stock is not available for ItemId = {writeoffItem.ItemId}, BatchNo ={writeoffItem.BatchNO}");

                        //Run the fifo logic in stocklist based on Created On
                        double totalRemainingQty = writeoffItem.WriteOffQuantity.Value;
                        foreach (var stock in stockList)
                        {
                            if (stock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= stock.AvailableQuantity;
                                stock.DecreaseStock(
                                    quantity: stock.AvailableQuantity,
                                    transactionType: ENUM_INV_StockTransactionType.WriteOffItem,
                                    transactionDate: writeoffItem.WriteOffDate,
                                    currentDate: currentDate,
                                    referenceNo: writeoffItem.WriteOffId,
                                    createdBy: currentUser.EmployeeId,
                                    fiscalYearId: currentFiscalYearId
                                    );
                                db.SaveChanges();
                            }
                            else
                            {
                                stock.DecreaseStock(
                                   quantity: totalRemainingQty,
                                   transactionType: ENUM_INV_StockTransactionType.WriteOffItem,
                                   transactionDate: writeoffItem.WriteOffDate,
                                   currentDate: currentDate,
                                   referenceNo: writeoffItem.WriteOffId,
                                   createdBy: currentUser.EmployeeId,
                                   fiscalYearId: currentFiscalYearId
                                   );
                                db.SaveChanges();
                                totalRemainingQty = 0;
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    }

                    //Commit Transaction
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }


        #endregion

        #region ReturnToVendorItems Transaction
        //This is complete transaction for ReturnToVendorTransaction
        //1. Add ReturnToVendor 
        //2. Add ReturnToVendorItems
        //3. Add StockTransaction
        //4. Update StockUpdate (AvailableQuantity)
        public static Boolean ReturnToVendorTransaction(ReturnToVendorModel returnToVendor, InventoryDbContext db, RbacUser currentUser)
        {
            //Transaction Begin
            //We first Need to make Stock, Stock_Transaction Object with WriteOff data (which has client data)
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;

                    // Bikash:26June'20 : storing return-details (not return-item details) in return-to-vendor table
                    db.ReturnToVendor.Add(returnToVendor);
                    db.SaveChanges();

                    //Save ReturnToVendorItems in database
                    returnToVendor.itemsToReturn.ForEach(item => item.ReturnToVendorId = returnToVendor.ReturnToVendorId);
                    AddretrnToVndrItems(db, returnToVendor.itemsToReturn);

                    foreach (var returnItem in returnToVendor.itemsToReturn)
                    {

                        var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(s => s.ItemId == returnItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == returnItem.BatchNo && s.IsActive == true && s.StoreId == returnToVendor.StoreId).ToList();
                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {returnItem.ItemId}, BatchNo ={returnItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < returnItem.Quantity) throw new Exception($"Stock is not available for ItemId = {returnItem.ItemId}, BatchNo ={returnItem.BatchNo}");

                        //Run the fifo logic in stocklist based on Created On
                        double totalRemainingQty = returnItem.Quantity;
                        foreach (var stock in stockList)
                        {
                            if (stock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= stock.AvailableQuantity;
                                stock.DecreaseStock(
                                    quantity: stock.AvailableQuantity,
                                    transactionType: ENUM_INV_StockTransactionType.PurchaseReturnedItem,
                                    transactionDate: null,
                                    currentDate: currentDate,
                                    referenceNo: returnItem.ReturnToVendorItemId,
                                    createdBy: currentUser.EmployeeId,
                                    fiscalYearId: currentFiscalYearId
                                    );
                                db.SaveChanges();
                            }
                            else
                            {
                                stock.DecreaseStock(
                                   quantity: totalRemainingQty,
                                   transactionType: ENUM_INV_StockTransactionType.PurchaseReturnedItem,
                                   transactionDate: null,
                                   currentDate: currentDate,
                                   referenceNo: returnItem.ReturnToVendorItemId,
                                   createdBy: currentUser.EmployeeId,
                                   fiscalYearId: currentFiscalYearId
                                   );
                                db.SaveChanges();
                                totalRemainingQty = 0;
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    }

                    //Commit Transaction
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        #endregion

        #region Add WriteOff Items
        //Save all Write-Off items in database
        public static void AddWriteOffItems(InventoryDbContext inventoryDbContext, List<WriteOffItemsModel> writeOffItems)
        {
            try
            {
                foreach (var writeOfItem in writeOffItems)
                {
                    inventoryDbContext.WriteOffItems.Add(writeOfItem);
                }
                //Save Dispatch Items
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add ReturnToVendor Items
        //Save all Write-Off items in database
        public static void AddretrnToVndrItems(InventoryDbContext inventoryDbContext, List<ReturnToVendorItemsModel> rtvItems)
        {
            try
            {
                foreach (var rtvItem in rtvItems)
                {
                    rtvItem.CreatedOn = System.DateTime.Now;
                    inventoryDbContext.ReturnToVendorItems.Add(rtvItem);
                }
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal static void UpdateGRAfterVerification(InventoryDbContext db, GoodsReceiptModel goodsReceipt, int verificationId, RbacUser currentUser)
        {
            try
            {
                foreach (var GRItem in goodsReceipt.GoodsReceiptItem)
                {
                    //Since GR Item has GR Item Id as not null, front end sends new GR Item with GR Item Id as 0
                    //This was done to reduce the impact of changes as GR ITem server model changes may have other impacts
                    GRItem.ModifiedBy = currentUser.EmployeeId;
                    GRItem.ModifiedOn = DateTime.Now;
                    if (GRItem.GoodsReceiptItemId == 0)
                    {
                        db.GoodsReceiptItems.Add(GRItem);
                    }
                    else
                    {
                        db.GoodsReceiptItems.Attach(GRItem);
                        db.Entry(GRItem).Property(x => x.ReceivedQuantity).IsModified = true;
                        db.Entry(GRItem).Property(x => x.RejectedQuantity).IsModified = true;
                        db.Entry(GRItem).Property(x => x.DiscountAmount).IsModified = true;
                        db.Entry(GRItem).Property(x => x.CcAmount).IsModified = true;
                        db.Entry(GRItem).Property(x => x.VATAmount).IsModified = true;
                        db.Entry(GRItem).Property(x => x.SubTotal).IsModified = true;
                        db.Entry(GRItem).Property(x => x.TotalAmount).IsModified = true;
                        db.Entry(GRItem).Property(x => x.ModifiedBy).IsModified = true;
                        db.Entry(GRItem).Property(x => x.ModifiedOn).IsModified = true;
                        db.Entry(GRItem).Property(x => x.ManufactureDate).IsModified = true;
                        db.Entry(GRItem).Property(x => x.BatchNO).IsModified = true;
                        db.Entry(GRItem).Property(x => x.ExpiryDate).IsModified = true;
                        db.Entry(GRItem).Property(x => x.SampleRemoved).IsModified = true;
                        db.Entry(GRItem).Property(x => x.SamplingBoxes).IsModified = true;
                        db.Entry(GRItem).Property(x => x.SamplingQuantity).IsModified = true;
                        db.Entry(GRItem).Property(x => x.SamplingDate).IsModified = true;
                        db.Entry(GRItem).Property(x => x.NoOfBoxes).IsModified = true;
                        db.Entry(GRItem).Property(x => x.IsSamplingLabel).IsModified = true;
                        db.Entry(GRItem).Property(x => x.IdentificationLabel).IsModified = true;



                        //these are the extra cases to look at during verification.
                        if (GRItem.IsActive == false && GRItem.CancelledBy == null) //do not change this condition as it impacts verification.
                        {
                            GRItem.CancelledBy = currentUser.EmployeeId;
                            GRItem.CancelledOn = DateTime.Now;
                            db.Entry(GRItem).Property(x => x.CancelledOn).IsModified = true;
                            db.Entry(GRItem).Property(x => x.CancelledBy).IsModified = true;
                            db.Entry(GRItem).Property(GRI => GRI.IsActive).IsModified = true;
                        }
                    }
                    db.SaveChanges();
                }
                goodsReceipt.ModifiedBy = currentUser.EmployeeId;
                goodsReceipt.ModifiedOn = DateTime.Now;
                goodsReceipt.VerificationId = verificationId;
                db.GoodsReceipts.Attach(goodsReceipt);
                db.Entry(goodsReceipt).Property(x => x.GRStatus).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.GoodsReceiptNo).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.GoodsReceiptDate).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.IMIRNo).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.IMIRDate).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.FiscalYearId).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.ModifiedOn).IsModified = true;
                db.Entry(goodsReceipt).Property(x => x.ModifiedBy).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.VATTotal).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.SubTotal).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.TotalAmount).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.TotalWithTDS).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.TDSAmount).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.CcCharge).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.Discount).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.DiscountAmount).IsModified = true;
                db.Entry(goodsReceipt).Property(GR => GR.VerificationId).IsModified = true;

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Cancel purchase order
        public static Boolean CancelPurchaseOrderById(InventoryDbContext db, int poId, string CancelRemarks, RbacUser currentUser, string POStatus = "cancelled", int? VerificationId = null)
        {
            Boolean flag = true;
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    var po = (from p in db.PurchaseOrders
                              where p.PurchaseOrderId == poId
                              select p).FirstOrDefault();
                    po.IsCancel = true;
                    po.CancelledBy = currentUser.EmployeeId;
                    po.CancelledOn = DateTime.Now;
                    po.POStatus = POStatus;
                    po.CancelRemarks = CancelRemarks;
                    db.PurchaseOrders.Attach(po);
                    db.Entry(po).State = EntityState.Modified;
                    db.Entry(po).Property(x => x.IsCancel).IsModified = true;
                    db.Entry(po).Property(x => x.CancelledBy).IsModified = true;
                    db.Entry(po).Property(x => x.CancelledOn).IsModified = true;
                    db.Entry(po).Property(x => x.POStatus).IsModified = true;
                    db.Entry(po).Property(x => x.CancelRemarks).IsModified = true;
                    if (VerificationId != null && VerificationId > 0)
                    {
                        po.VerificationId = VerificationId;
                        db.Entry(po).Property(x => x.VerificationId).IsModified = true;
                    }
                    db.SaveChanges();
                    po.PurchaseOrderItems = db.PurchaseOrderItems.Where(POI => POI.PurchaseOrderId == po.PurchaseOrderId).ToList();
                    po.PurchaseOrderItems.ForEach(OI =>
                    {
                        OI.IsActive = false;
                        OI.POItemStatus = POStatus;
                        OI.CancelledBy = po.CancelledBy;
                        OI.CancelledOn = po.CancelledOn;
                        OI.CancelRemarks = CancelRemarks;
                    });
                    db.SaveChanges();
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    flag = false;
                    transaction.Rollback();
                    throw ex;
                }
            }
            return flag;
        }
        #endregion
        #region Cancel Requisition for inventory -> substores
        public static Boolean CancelSubstoreRequisition(InventoryDbContext context, int reqId, string cancelRemarks, RbacUser currentUser, int? VerificationId, string RequisitionStatus = "cancelled")
        {
            Boolean flag = true;
            using (var db = context.Database.BeginTransaction())
            {
                try
                {

                    var Requisition = (from req in context.Requisitions
                                       where req.RequisitionId == reqId
                                       select req).Include(a => a.RequisitionItems).FirstOrDefault();
                    Requisition.IsCancel = true;
                    Requisition.ModifiedBy = currentUser.EmployeeId;
                    Requisition.ModifiedOn = DateTime.Now;
                    Requisition.RequisitionStatus = RequisitionStatus;
                    Requisition.CancelRemarks = cancelRemarks;
                    Requisition.VerificationId = VerificationId;
                    context.Requisitions.Attach(Requisition);
                    context.Entry(Requisition).State = EntityState.Modified;
                    context.Entry(Requisition).Property(x => x.IsCancel).IsModified = true;
                    context.Entry(Requisition).Property(x => x.ModifiedBy).IsModified = true;
                    context.Entry(Requisition).Property(x => x.ModifiedOn).IsModified = true;
                    context.Entry(Requisition).Property(x => x.RequisitionStatus).IsModified = true;
                    context.Entry(Requisition).Property(x => x.CancelRemarks).IsModified = true;
                    context.Entry(Requisition).Property(x => x.VerificationId).IsModified = true;
                    context.SaveChanges();

                    Requisition.RequisitionItems.ForEach(RI =>
                    {
                        RI.IsActive = false;
                        RI.RequisitionItemStatus = RequisitionStatus;
                        RI.CancelBy = Requisition.ModifiedBy;
                        RI.CancelOn = Requisition.ModifiedOn;
                        RI.CancelQuantity = RI.PendingQuantity;
                        RI.ModifiedBy = Requisition.ModifiedBy;
                        RI.ModifiedOn = Requisition.ModifiedOn;
                        RI.CancelRemarks = cancelRemarks;
                    });
                    context.SaveChanges();

                    db.Commit();
                }
                catch (Exception ex)
                {
                    flag = false;
                    db.Rollback();
                    throw ex;
                }
            }

            return flag;
        }
        #endregion
        #region  Cancel Goods Receipt
        public static void CancelGoodsReceipt(InventoryDbContext inventoryDbContext, int grId, string CancelRemarks, RbacUser rbacUser, string GRStatus = "cancelled", int? VerificationId = null)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    var gr = (
                                from g in inventoryDbContext.GoodsReceipts
                                where g.GoodsReceiptID == grId
                                select g
                             ).FirstOrDefault();
                    gr.IsCancel = true;
                    gr.GRStatus = GRStatus;
                    gr.CancelledBy = rbacUser.EmployeeId;
                    gr.CancelledOn = DateTime.Now;
                    gr.CancelRemarks = CancelRemarks;

                    if (VerificationId != null && VerificationId > 0)
                    {
                        //Set IMIR No and Date once the verification is done.
                        gr.IMIRDate = DateTime.Now;
                        if (gr.IMIRNo == null)
                        {
                            gr.IMIRNo = VerificationBL.GetIMIRNo(inventoryDbContext, gr.IMIRDate);
                        }
                        gr.VerificationId = VerificationId;
                        inventoryDbContext.Entry(gr).Property(x => x.VerificationId).IsModified = true;
                    }
                    if (gr.FiscalYearId < 1)
                    {
                        gr.FiscalYearId = GetFiscalYear(inventoryDbContext).FiscalYearId;
                        inventoryDbContext.Entry(gr).Property(x => x.FiscalYearId).IsModified = true;
                    }

                    var gritms = inventoryDbContext.GoodsReceiptItems.Where(a => a.GoodsReceiptId == grId).ToList();
                    foreach (var gritem in gritms)
                    {
                        gritem.CancelledBy = rbacUser.EmployeeId;
                        gritem.CancelledOn = DateTime.Now;
                        /* if goods receipt is not receive, then there is no need to decrease the stock as the stock has not been created yet. */
                        if (gr.ReceivedBy != null)
                        {
                            DecreaseStockByGRItem(inventoryDbContext, rbacUser, gritem);
                        }
                    }
                    inventoryDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }

        }

        private static void DecreaseStockByGRItem(InventoryDbContext inventoryDbContext, RbacUser rbacUser, GoodsReceiptItemsModel gritem)
        {
            var currentDate = DateTime.Now;
            var currentFiscYearId = GetFiscalYear(inventoryDbContext).FiscalYearId;
            var purchaseTxnType = ENUM_INV_StockTransactionType.PurchaseItem;
            var stkTxns = (from s in inventoryDbContext.StockTransactions
                           where s.ReferenceNo == gritem.GoodsReceiptItemId && s.TransactionType == purchaseTxnType
                           select s).FirstOrDefault();
            var stk = inventoryDbContext.StoreStocks.Include(a => a.StockMaster).FirstOrDefault(s => s.StoreStockId == stkTxns.StoreStockId);
            if (gritem.ReceivedQuantity + gritem.FreeQuantity > stk.AvailableQuantity)
            {
                var ex = new Exception("Failed.Stock is not available.");
                throw ex;
            }
            stk.DecreaseStock(
                quantity: stk.AvailableQuantity,
                transactionType: ENUM_INV_StockTransactionType.CancelledGR,
                transactionDate: null,
                currentDate: currentDate,
                referenceNo: gritem.GoodsReceiptItemId,
                createdBy: rbacUser.EmployeeId,
                fiscalYearId: currentFiscYearId,
                needConfirmation: false
                );
            inventoryDbContext.SaveChanges();
        }
        #endregion

        #region Updating Requisitions with Requisition Items
        //this function is used in DISPATCH-ALL
        //here function updates only quantities and their status
        public static void UpdateRequisitionandRItems(InventoryDbContext inventoryDbContext, List<RequisitionModel> requisitions)
        {
            try
            {
                foreach (var req in requisitions)
                {
                    foreach (var rItems in req.RequisitionItems)
                    {
                        inventoryDbContext.RequisitionItems.Attach(rItems);
                        inventoryDbContext.Entry(rItems).Property(x => x.ReceivedQuantity).IsModified = true;
                        inventoryDbContext.Entry(rItems).Property(x => x.PendingQuantity).IsModified = true;
                        inventoryDbContext.Entry(rItems).Property(x => x.RequisitionItemStatus).IsModified = true;
                    }
                    inventoryDbContext.Requisitions.Attach(req);
                    inventoryDbContext.Entry(req).Property(x => x.RequisitionStatus).IsModified = true;
                }
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Method for Make Clone or Deep Copy WriteOff Items object from List
        //This is used for make separate copy of object (without reference)
        public static WriteOffItemsModel Clone(WriteOffItemsModel obj)
        {
            WriteOffItemsModel new_obj = new WriteOffItemsModel();
            foreach (PropertyInfo pi in obj.GetType().GetProperties())
            {
                if (pi.CanRead && pi.CanWrite && pi.PropertyType.IsSerializable)
                {
                    pi.SetValue(new_obj, pi.GetValue(obj, null), null);
                }
            }
            return new_obj;
        }
        #endregion

        #region Method for Make Clone or Deep Copy ReturnToVendor Items object from List
        //This is used for make separate copy of object (without reference)
        public static ReturnToVendorItemsModel rtvClone(ReturnToVendorItemsModel obj)
        {
            ReturnToVendorItemsModel new_obj = new ReturnToVendorItemsModel();
            foreach (PropertyInfo pi in obj.GetType().GetProperties())
            {
                if (pi.CanRead && pi.CanWrite && pi.PropertyType.IsSerializable)
                {
                    pi.SetValue(new_obj, pi.GetValue(obj, null), null);
                }
            }
            return new_obj;
        }
        #endregion

        #region Get Corresponding Dispatches  from RequisitionId
        public static List<DispatchListViewModel> GetDispatchesFromRequisitionId(int RequisitionId, InventoryDbContext inventoryDbContext)
        {

            var CreatedBy = inventoryDbContext.Requisitions.Where(R => R.RequisitionId == RequisitionId).Select(R => R.CreatedBy).FirstOrDefault();
            var CreatedByName = VerificationBL.GetNameByEmployeeId(CreatedBy, inventoryDbContext);

            IQueryable<DispatchItemsModel> dispatchList = inventoryDbContext.DispatchItems.Where(d => d.RequisitionId == RequisitionId);

            if (dispatchList != null || dispatchList.Count() != 0)
            {
                var groupOfDispatchItemsByDispatchId = dispatchList.GroupBy(d => d.DispatchId).ToList();

                var uniqueDispatches = groupOfDispatchItemsByDispatchId.Select(g => new
                {
                    DispatchId = g.Key,
                    RequisitionId = RequisitionId,
                    g.FirstOrDefault().CreatedOn,
                    g.FirstOrDefault().ReceivedBy,
                    g.FirstOrDefault().CreatedBy,
                    g.FirstOrDefault().Remarks,
                    isReceived = g.Any(a => a.ReceivedById != null)
                }).ToList();

                var result = (from uniqDispatch in uniqueDispatches
                              join dispatchemp in inventoryDbContext.Employees
                              on uniqDispatch.CreatedBy equals dispatchemp.EmployeeId
                              select new DispatchListViewModel
                              {
                                  DispatchId = uniqDispatch.DispatchId,
                                  RequisitionId = uniqDispatch.RequisitionId,
                                  CreatedOn = uniqDispatch.CreatedOn,
                                  ReceivedBy = uniqDispatch.ReceivedBy,
                                  Remarks = uniqDispatch.Remarks,
                                  DispatchedByName = dispatchemp.FullName,
                                  CreatedByName = CreatedByName,
                                  isReceived = uniqDispatch.isReceived
                              }).ToList<DispatchListViewModel>();

                return result;
            }
            else
            {
                return null;
            }
        }
        #endregion
        #region Update Purchase Request and Purchase Request Items
        //Update  records
        public static void UpdatePurchaseRequestWithItems(InventoryDbContext inventoryDbContext, PurchaseRequestModel requisition, int? VerificationId, RbacUser currentUser)
        {
            try
            {
                var checkStatus = true;
                foreach (var PRItems in requisition.PurchaseRequestItems)
                {
                    PRItems.ModifiedBy = currentUser.EmployeeId;
                    PRItems.ModifiedOn = DateTime.Now;
                    inventoryDbContext.PurchaseRequestItems.Attach(PRItems);
                    inventoryDbContext.Entry(PRItems).Property(x => x.RequestedQuantity).IsModified = true;
                    inventoryDbContext.Entry(PRItems).Property(x => x.RequestItemStatus).IsModified = true;
                    inventoryDbContext.Entry(PRItems).Property(x => x.ModifiedOn).IsModified = true;
                    inventoryDbContext.Entry(PRItems).Property(x => x.ModifiedBy).IsModified = true;
                    if (VerificationId > 0)
                    {
                        inventoryDbContext.Entry(PRItems).Property(x => x.RequestItemStatus).IsModified = true;
                        if (VerificationId > 0)
                        {
                            //these are the extra cases to look at during verification.
                            if (PRItems.IsActive == false && PRItems.CancelledBy == null) //do not change this condition as it impacts verification.
                            {
                                PRItems.CancelledBy = currentUser.EmployeeId;
                                PRItems.CancelledOn = DateTime.Now;
                                inventoryDbContext.Entry(PRItems).Property(x => x.CancelledOn).IsModified = true;
                                inventoryDbContext.Entry(PRItems).Property(x => x.CancelledBy).IsModified = true;
                            }
                            inventoryDbContext.Entry(PRItems).Property(x => x.RequestedQuantity).IsModified = true;
                            inventoryDbContext.Entry(PRItems).Property(x => x.IsActive).IsModified = true;
                        }
                    }
                    else
                    {
                        checkStatus = false;
                    }
                }
                if (checkStatus)
                {
                    requisition.ModifiedBy = currentUser.EmployeeId;
                    requisition.ModifiedOn = DateTime.Now;
                    inventoryDbContext.PurchaseRequest.Attach(requisition);
                    inventoryDbContext.Entry(requisition).Property(x => x.RequestStatus).IsModified = true;
                    inventoryDbContext.Entry(requisition).Property(x => x.ModifiedOn).IsModified = true;
                    inventoryDbContext.Entry(requisition).Property(x => x.ModifiedBy).IsModified = true;
                    if (VerificationId > 0)
                    {
                        requisition.VerificationId = VerificationId;
                        inventoryDbContext.Entry(requisition).Property(req => req.VerificationId).IsModified = true;
                    }
                }

                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Cancel Purchase Request for inventory -> Procurement
        public static Boolean CancelPurchaseRequestById(InventoryDbContext context, int PRId, string cancelRemarks, RbacUser currentUser, int? VerificationId, string RequisitionStatus = "cancelled")
        {
            Boolean flag = true;
            using (var db = context.Database.BeginTransaction())
            {
                try
                {

                    var PurchaseRequest = (from req in context.PurchaseRequest
                                           where req.PurchaseRequestId == PRId
                                           select req).Include(a => a.PurchaseRequestItems).FirstOrDefault();
                    PurchaseRequest.IsActive = false;
                    PurchaseRequest.CancelledBy = currentUser.EmployeeId;
                    PurchaseRequest.CancelledOn = DateTime.Now;
                    PurchaseRequest.RequestStatus = RequisitionStatus;
                    PurchaseRequest.CancelRemarks = cancelRemarks;
                    context.PurchaseRequest.Attach(PurchaseRequest);
                    context.Entry(PurchaseRequest).State = EntityState.Modified;
                    context.Entry(PurchaseRequest).Property(x => x.IsActive).IsModified = true;
                    context.Entry(PurchaseRequest).Property(x => x.ModifiedBy).IsModified = true;
                    context.Entry(PurchaseRequest).Property(x => x.ModifiedOn).IsModified = true;
                    context.Entry(PurchaseRequest).Property(x => x.RequestStatus).IsModified = true;
                    context.Entry(PurchaseRequest).Property(x => x.CancelRemarks).IsModified = true;
                    if (VerificationId != null && VerificationId > 0)
                    {
                        PurchaseRequest.VerificationId = VerificationId;
                        context.Entry(PurchaseRequest).Property(x => x.VerificationId).IsModified = true;
                    }
                    context.SaveChanges();

                    PurchaseRequest.PurchaseRequestItems.ForEach(RI =>
                    {
                        RI.IsActive = false;
                        RI.RequestItemStatus = RequisitionStatus;
                        RI.CancelledBy = PurchaseRequest.ModifiedBy;
                        RI.CancelledOn = PurchaseRequest.ModifiedOn;
                        RI.CancelRemarks = cancelRemarks;
                    });
                    context.SaveChanges();

                    db.Commit();
                }
                catch (Exception ex)
                {
                    flag = false;
                    db.Rollback();
                    throw ex;
                }
            }

            return flag;
        }
        /// <summary>
        /// 1. Created the new requisition.
        /// 2. Arrange the stock by FIFO(based on TransactionDate.) and update the stock and crete the stock Txns accordingly.
        /// 3. Dispatch the requested items.
        /// </summary>
        /// <param name="dispatchItems"></param>
        /// <param name="inventoryDb"></param>
        /// <param name="currentUser"></param>
        public static void DirectDispatch(List<DispatchItemsModel> dispatchItems, IInventoryReceiptNumberService _receiptNumberService, InventoryDbContext inventoryDb, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDb.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;

                    var currentFiscYrId = GetFiscalYear(inventoryDb).FiscalYearId;
                    bool isRequisitionCreated = CreateRequisitionForDirectDispatch(dispatchItems, inventoryDb, currentUser, currentFiscYrId);

                    var newDispatchId = _receiptNumberService.GenerateDispatchNo(currentFiscYrId, dispatchItems.FirstOrDefault().ReqDisGroupId);

                    foreach (var dispatchItem in dispatchItems)
                    {
                        dispatchItem.CreatedBy = currentUser.EmployeeId;
                        dispatchItem.CreatedOn = currentDate;
                        dispatchItem.DispatchId = newDispatchId;
                        dispatchItem.DispatchNo = newDispatchId;
                        dispatchItem.FiscalYearId = currentFiscYrId;
                        inventoryDb.DispatchItems.Add(dispatchItem);

                    }
                    //Save Dispatch Items
                    inventoryDb.SaveChanges();

                    // Find the stock from source store for each dispatched item
                    // Apply FIFO Logic and decrement the stock, also increment the stock to the target store as well.

                    foreach (var dispatchItem in dispatchItems)
                    {
                        var stockList = inventoryDb.StoreStocks
                                                .Include(s => s.StockMaster)
                                                .Where(s => s.StoreId == dispatchItem.SourceStoreId && s.ItemId == dispatchItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == dispatchItem.BatchNo && s.IsActive == true)
                                                .ToList();
                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                        var totalRemainingQty = dispatchItem.DispatchedQuantity;
                        foreach (var mainStoreStock in stockList)
                        {
                            //Find if the stock is available in substore
                            var substoreStock = inventoryDb.StoreStocks
                                                            .FirstOrDefault(s => s.StockId == mainStoreStock.StockId && s.StoreId == dispatchItem.TargetStoreId && s.IsActive == true);
                            // check if receive feature is enabled, to decide whether to increase in stock or increase unconfirmed quantity
                            var isReceiveFeatureEnabled = inventoryDb.CfgParameters
                                                            .Where(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "EnableReceivedItemInSubstore")
                                                            .Select(param => param.ParameterValue == "true" ? true : false)
                                                            .FirstOrDefault();
                            //Add Txn in PHRM_StockTxnItems table



                            if (mainStoreStock.AvailableQuantity < totalRemainingQty)
                            {
                                var dispatchQtyForThisStock = mainStoreStock.AvailableQuantity;

                                totalRemainingQty -= mainStoreStock.AvailableQuantity;

                                //Decrease Stock From Main Store
                                mainStoreStock.DecreaseStock(
                                        quantity: mainStoreStock.AvailableQuantity,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItem,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId
                                    );
                                // Add Stock to Dispensary
                                if (substoreStock == null)
                                {
                                    // add new stock
                                    substoreStock = new StoreStockModel(
                                        stockMaster: mainStoreStock.StockMaster,
                                        storeId: dispatchItem.TargetStoreId,
                                        quantity: dispatchQtyForThisStock,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId,
                                        needConfirmation: isReceiveFeatureEnabled
                                        );
                                    inventoryDb.StoreStocks.Add(substoreStock);
                                }
                                else
                                {
                                    // update old stock
                                    substoreStock.AddStock(
                                        quantity: dispatchQtyForThisStock,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId,
                                        needConfirmation: isReceiveFeatureEnabled
                                        );
                                }
                                inventoryDb.SaveChanges();
                            }
                            else
                            {
                                //Decrease Stock From Main Store
                                mainStoreStock.DecreaseStock(
                                        quantity: totalRemainingQty,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItem,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId
                                    );
                                // Add Stock to Dispensary
                                if (substoreStock == null)
                                {
                                    // add new stock
                                    substoreStock = new StoreStockModel(
                                        stockMaster: mainStoreStock.StockMaster,
                                        storeId: dispatchItem.TargetStoreId,
                                        quantity: totalRemainingQty,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId,
                                        needConfirmation: isReceiveFeatureEnabled
                                        );
                                    inventoryDb.StoreStocks.Add(substoreStock);
                                }
                                else
                                {
                                    // update old stock
                                    substoreStock.AddStock(
                                        quantity: totalRemainingQty,
                                        transactionType: ENUM_INV_StockTransactionType.DispatchedItemReceivingSide,
                                        transactionDate: dispatchItem.DispatchedDate,
                                        currentDate: currentDate,
                                        referenceNo: dispatchItem.DispatchItemsId,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: currentFiscYrId,
                                        needConfirmation: isReceiveFeatureEnabled
                                        );
                                }
                                totalRemainingQty = 0;
                                inventoryDb.SaveChanges();
                                break;
                            }
                        }
                    }
                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }

        }
        /// <summary>
        /// This function creates new requisition, returns true if created successfully, false if failed.
        /// </summary>
        /// <param name="requisition">It comes from client-side as a whole object</param>
        /// <param name="inventoryDb">Current Db Context</param>
        /// <param name="currentUser">Current Logged-in user</param>
        /// <returns> true if created successfully, false if failed </returns>
        public static bool CreateRequisitionForDirectDispatch(List<DispatchItemsModel> dispatchItems, InventoryDbContext inventoryDb, RbacUser currentUser, int fiscalYearId)
        {
            var currentDate = DateTime.Now;
            // Create a requisition from dispatchItem
            var requisition = new RequisitionModel()
            {
                RequisitionDate = dispatchItems[0].DispatchedDate,
                CreatedBy = currentUser.EmployeeId,
                CreatedOn = currentDate,
                RequisitionStatus = "complete",
                IssueNo = dispatchItems[0].IssueNo,
                RequestFromStoreId = dispatchItems[0].TargetStoreId,
                RequestToStoreId = dispatchItems[0].SourceStoreId,
                FiscalYearId = fiscalYearId,
                RequisitionNo = inventoryDb.Requisitions.Select(a => a.RequisitionNo).DefaultIfEmpty(0).Max() + 1,
                Remarks = dispatchItems[0].Remarks,
                MatIssueDate = dispatchItems[0].MatIssueDate,
                MatIssueTo = dispatchItems[0].MatIssueTo,
                ModifiedBy = currentUser.EmployeeId,
                ModifiedOn = currentDate
            };
            inventoryDb.Requisitions.Add(requisition);
            inventoryDb.SaveChanges();

            // Create requisition items from dispatchItems
            foreach (var dItem in dispatchItems)
            {
                var reqItem = new RequisitionItemsModel()
                {
                    ItemId = dItem.ItemId,
                    Quantity = (int)dItem.DispatchedQuantity,
                    ReceivedQuantity = dItem.DispatchedQuantity,
                    PendingQuantity = 0,
                    RequisitionId = requisition.RequisitionId,
                    RequisitionNo = requisition.RequisitionNo,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = currentDate,
                    RequisitionItemStatus = "complete",
                    Remark = dItem.ItemRemarks,
                    IssueNo = dItem.IssueNo,
                    ModifiedBy = currentUser.EmployeeId,
                    ModifiedOn = currentDate,
                    MatIssueDate = dItem.MatIssueDate,
                    MatIssueTo = dItem.MatIssueTo
                };
                inventoryDb.RequisitionItems.Add(reqItem);
                inventoryDb.SaveChanges();
                // Save Requisition Ids in dispatch items
                dItem.RequisitionId = requisition.RequisitionId;
                dItem.RequisitionItemId = reqItem.RequisitionItemId;
            }
            return true; //this value will be used in direct dispatch for further decision-making
        }

        public static bool CheckIfNewDispatchAvailable(InventoryDbContext db, int requisitionId)
        {
            try
            {
                return db.DispatchItems.Any(d => d.RequisitionId == requisitionId && d.ReceivedById == null);
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        #endregion


        public static InventoryFiscalYear GetFiscalYear(InventoryDbContext inventoryDbContext, DateTime? DecidingDate = null)
        {
            DecidingDate = (DecidingDate == null) ? DateTime.Now.Date : DecidingDate;
            return inventoryDbContext.InventoryFiscalYears.Where(fsc => fsc.StartDate <= DecidingDate && fsc.EndDate >= DecidingDate).FirstOrDefault();
        }
        public static void CreateNotificationForPRVerifiers(int PurchaseRequestId, int RoleId, NotiFicationDbContext notificationDB)
        {
            var notification = new NotificationViewModel();
            notification.Notification_ModuleName = "Inventory_Module";
            notification.Notification_Title = "New Purchase Request";
            notification.Notification_Details = "Click Here To Verify.";
            notification.RecipientId = RoleId;
            notification.RecipientType = "rbac-role";
            notification.ParentTableName = "INV_TXN_PurchaseRequest";
            notification.NotificationParentId = PurchaseRequestId;
            notification.IsRead = false;
            notification.IsArchived = false;
            notification.CreatedOn = DateTime.Now;
            notification.Sub_ModuleName = "PR_Verification";
            notificationDB.Notifications.Add(notification);
            notificationDB.SaveChanges();
        }
        #region Update Purchase Request and Purchase Request Items
        //Update  records
        public static void UpdatePurchaseOrderWithItems(InventoryDbContext db, PurchaseOrderModel purchaseOrder, int? VerificationId, RbacUser currentUser)
        {
            try
            {
                var checkStatus = true;
                foreach (var POItems in purchaseOrder.PurchaseOrderItems)
                {
                    POItems.ModifiedBy = currentUser.EmployeeId;
                    POItems.ModifiedOn = DateTime.Now;
                    POItems.PendingQuantity = POItems.Quantity;
                    db.PurchaseOrderItems.Attach(POItems);
                    db.Entry(POItems).Property(x => x.Quantity).IsModified = true;
                    db.Entry(POItems).Property(x => x.StandardRate).IsModified = true;
                    db.Entry(POItems).Property(x => x.TotalAmount).IsModified = true;
                    db.Entry(POItems).Property(x => x.VATAmount).IsModified = true;
                    db.Entry(POItems).Property(x => x.PendingQuantity).IsModified = true;
                    db.Entry(POItems).Property(x => x.POItemStatus).IsModified = true;
                    db.Entry(POItems).Property(x => x.ModifiedOn).IsModified = true;
                    db.Entry(POItems).Property(x => x.ModifiedBy).IsModified = true;
                    if (VerificationId > 0)
                    {
                        //these are the extra cases to look at during verification.
                        if (POItems.IsActive == false && POItems.CancelledBy == null) //do not change this condition as it impacts verification.
                        {
                            POItems.CancelledBy = currentUser.EmployeeId;
                            POItems.CancelledOn = DateTime.Now;
                            db.Entry(POItems).Property(x => x.CancelledOn).IsModified = true;
                            db.Entry(POItems).Property(x => x.CancelledBy).IsModified = true;
                        }
                        db.Entry(POItems).Property(x => x.Quantity).IsModified = true;
                        db.Entry(POItems).Property(x => x.IsActive).IsModified = true;
                    }
                    else
                    {
                        checkStatus = false;
                    }
                }
                if (checkStatus)
                {
                    purchaseOrder.ModifiedBy = currentUser.EmployeeId;
                    purchaseOrder.ModifiedOn = DateTime.Now;
                    db.PurchaseOrders.Attach(purchaseOrder);
                    db.Entry(purchaseOrder).Property(x => x.POStatus).IsModified = true;
                    db.Entry(purchaseOrder).Property(x => x.SubTotal).IsModified = true;
                    db.Entry(purchaseOrder).Property(x => x.TotalAmount).IsModified = true;
                    db.Entry(purchaseOrder).Property(x => x.VAT).IsModified = true;
                    db.Entry(purchaseOrder).Property(x => x.ModifiedOn).IsModified = true;
                    db.Entry(purchaseOrder).Property(x => x.ModifiedBy).IsModified = true;
                    if (VerificationId > 0)
                    {
                        purchaseOrder.VerificationId = VerificationId;
                        db.Entry(purchaseOrder).Property(req => req.VerificationId).IsModified = true;
                    }
                }

                db.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region SetPOVerifiers
        public static string SerializeProcurementVerifiers(List<POVerifier> VerifierListFromClient)
        {
            var VerifierList = new List<object>();
            VerifierListFromClient.ForEach(verifier =>
            {
                VerifierList.Add(new { Id = verifier.Id, Type = verifier.Type });
            });
            return DanpheJSONConvert.SerializeObject(VerifierList).Replace(" ", String.Empty);
        }
        #endregion
        #region Get Procurement GR View
        internal static GetProcurementGRViewVm GetProcurementGRView(int GoodsReceiptId, InventoryDbContext inventoryDb, MasterDbContext masterDbContext, IVerificationService verificationService)
        {
            // Take Only First Item from each group of gr items based on itemId, as breakage of item will only occur after GR Verification, but procurement has to see what procurement has entered in the first place.
            var grItemGrouped = inventoryDb.GoodsReceiptItems.Where(a => a.GoodsReceiptId == GoodsReceiptId).ToList();
            var gritems = (from gritms in grItemGrouped
                           join itms in inventoryDb.Items on gritms.ItemId equals itms.ItemId
                           join uom in inventoryDb.UnitOfMeasurementMaster on itms.UnitOfMeasurementId equals uom.UOMId
                           join category in inventoryDb.ItemCategoryMaster on itms.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                           from ctg in ctgGroup.DefaultIfEmpty()
                           where gritms.GoodsReceiptId == GoodsReceiptId
                           select new GrItemsDTO
                           {
                               ItemId = gritms.ItemId,
                               ItemName = itms.ItemName,
                               ItemCode = itms.Code,
                               MSSNO = itms.MSSNO,
                               UOMName = uom.UOMName,
                               ItemCategory = gritms.ItemCategory,//sud:26Sept'21--Updated to make same as other api.
                               ItemCategoryCode = (ctg == null) ? "" : ctg.CategoryCode,
                               BatchNo = gritms.BatchNO,
                               ExpiryDate = gritms.ExpiryDate,
                               InvoiceQuantity = gritms.ReceivedQuantity + gritms.RejectedQuantity,
                               ArrivalQuantity = gritms.ArrivalQuantity,
                               ReceivedQuantity = gritms.ReceivedQuantity,
                               RejectedQuantity = gritms.RejectedQuantity,
                               FreeQuantity = gritms.FreeQuantity,
                               GRItemRate = gritms.ItemRate,
                               VATPercentage = gritms.VAT,
                               VATAmount = gritms.VATAmount,
                               ItemSubTotal = gritms.SubTotal,
                               CcAmount = gritms.CcAmount,
                               CcChargePercent = gritms.CcCharge,
                               DiscountAmount = gritms.DiscountAmount,
                               DiscountPercent = gritms.DiscountPercent,
                               ItemTotalAmount = gritms.TotalAmount,
                               OtherCharge = gritms.OtherCharge,
                               GoodsReceiptId = gritms.GoodsReceiptId,
                               GoodsReceiptItemId = gritms.GoodsReceiptItemId,
                               IsTransferredToACC = gritms.IsTransferredToACC,
                               ManufactureDate = gritms.ManufactureDate,
                               SamplingDate = gritms.SamplingDate,
                               NoOfBoxes = gritms.NoOfBoxes,
                               SamplingQuantity = gritms.SamplingQuantity,
                               IdentificationLabel = gritms.IdentificationLabel,
                               GRItemSpecification = gritms.GRItemSpecification,
                               Remarks = gritms.Remarks,
                               RegisterPageNumber = itms.RegisterPageNumber,
                               StockId = gritms.StockId
                           }).OrderBy(g => g.GoodsReceiptItemId).ToList();//sud:28Sept'21--to show in the same order as entry.
            var grdetails = (from gr in inventoryDb.GoodsReceipts
                             join ven in inventoryDb.Vendors on gr.VendorId equals ven.VendorId
                             join verif in inventoryDb.Verifications on gr.VerificationId equals verif.VerificationId into verifJ
                             from verifLJ in verifJ.DefaultIfEmpty()
                             from po in inventoryDb.PurchaseOrders.Where(p => p.PurchaseOrderId == gr.PurchaseOrderId).DefaultIfEmpty()
                             from ganFy in inventoryDb.InventoryFiscalYears.Where(a => a.StartDate <= gr.GoodsArrivalDate && a.EndDate >= gr.GoodsArrivalDate).DefaultIfEmpty()
                             from fyLj in inventoryDb.FiscalYears.Where(fy => fy.FiscalYearId == gr.FiscalYearId).DefaultIfEmpty()
                             where gr.GoodsReceiptID == GoodsReceiptId
                             select new GrDTO
                             {
                                 GoodsReceiptID = gr.GoodsReceiptID,
                                 GoodsReceiptNo = gr.GoodsReceiptNo,
                                 GoodsArrivalNo = gr.GoodsArrivalNo,
                                 DonationId = gr.DonationId,
                                 GoodsArrivalFiscalYearFormatter = ganFy.FiscalYearName,
                                 PurchaseOrderId = gr.PurchaseOrderId,
                                 PurchaseOrderDate = (po != null) ? po.PoDate : null,
                                 PONumber = (po != null) ? po.PONumber : null,
                                 GoodsArrivalDate = gr.GoodsArrivalDate,
                                 GoodsReceiptDate = gr.GoodsReceiptDate,
                                 ReceivedDate = gr.ReceivedDate,
                                 BillNo = gr.BillNo,
                                 TotalAmount = gr.TotalAmount,
                                 SubTotal = gr.SubTotal,
                                 DiscountAmount = gr.DiscountAmount,
                                 TDSAmount = gr.TDSAmount,
                                 TotalWithTDS = gr.TotalWithTDS,
                                 CcCharge = gr.CcCharge,
                                 VATTotal = gr.VATTotal,
                                 IsCancel = gr.IsCancel,
                                 Remarks = gr.Remarks,
                                 MaterialCoaDate = gr.MaterialCoaDate,
                                 MaterialCoaNo = gr.MaterialCoaNo,
                                 VendorName = ven.VendorName,
                                 ContactAddress = ven.ContactAddress,
                                 VendorNo = ven.ContactNo,
                                 CreditPeriod = gr.CreditPeriod,
                                 PaymentMode = gr.PaymentMode,
                                 OtherCharges = gr.OtherCharges,
                                 InsuranceCharge = gr.InsuranceCharge,
                                 CarriageFreightCharge = gr.CarriageFreightCharge,
                                 PackingCharge = gr.PackingCharge,
                                 TransportCourierCharge = gr.TransportCourierCharge,
                                 OtherCharge = gr.OtherCharge,
                                 IsTransferredToACC = gr.IsTransferredToACC == null ? false : gr.IsTransferredToACC,
                                 CancelRemarks = gr.CancelRemarks,
                                 CreatedBy = gr.CreatedBy,
                                 CreatedOn = gr.CreatedOn,
                                 CurrentFiscalYear = (fyLj != null) ? fyLj.FiscalYearFormatted : "",
                                 IsVerificationEnabled = gr.IsVerificationEnabled,
                                 VerifierIds = gr.VerifierIds,
                                 IsSupplierApproved = gr.IsSupplierApproved ?? false,
                                 IsDeliveryTopClosed = gr.IsDeliveryTopClosed ?? false,
                                 IsBoxNumbered = gr.IsBoxNumbered ?? false,
                                 GRStatus = gr.GRStatus,
                                 GRCategory = gr.GRCategory,
                                 CurrentVerificationLevelCount = (verifLJ == null) ? 0 : verifLJ.CurrentVerificationLevelCount,
                                 VerificationId = gr.VerificationId
                             }).FirstOrDefault();
            var CreatedById = grdetails.CreatedBy;
            var creator = (from emp in masterDbContext.Employees
                           join r in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                           from role in roleTemp.DefaultIfEmpty()
                           where emp.EmployeeId == CreatedById
                           select new CreatedByUserDTO
                           {
                               Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                               Role = role.EmployeeRoleName
                           }).FirstOrDefault();

            // Verifiers Details -- using Common Method from Verification Service
            var Verifiers = new List<VerificationViewModel>();
            if (grdetails.VerificationId != null)
            {
                Verifiers = verificationService.GetVerificationViewModel(grdetails.VerificationId.Value).OrderBy(x => x.CurrentVerificationLevel).ToList();
            }
            //TODO: Sanjit: Please review the criteria to edit date later
            var canUserEditDate = false;
            var goodsreceiptDetails = new GetProcurementGRViewVm { grItems = gritems, grDetails = grdetails, creator = creator, canUserEditDate = canUserEditDate, verifier = Verifiers };
            return goodsreceiptDetails;

        }
        #endregion

        //Sud:25Sept'21--We need to change the logic after we bring StoreId and GroupId into the picture..
        //currently StoreId is there in Db but not in Model.
        public static string GetNewItemCode(InventoryDbContext inventoryDbContext, ItemMasterModel itemMaster)
        {
            ItemSubCategoryMasterModel subCat = inventoryDbContext.ItemSubCategoryMaster.Where(sub => sub.SubCategoryId == itemMaster.SubCategoryId).FirstOrDefault();


            if (subCat != null && subCat.SubCategoryId > 0)
            {
                //Note: we're using count logic for item code.. (different than that in GR, PO, etc)..
                int existingItmCount = inventoryDbContext.Items.Where(itm => itm.SubCategoryId == subCat.SubCategoryId).Count();

                string subCategoryCode = subCat.Code;

                int newCodeIntValue = existingItmCount + 1;//current count plus 1 is new code..
                string formattedCode = String.Format("{0:D3}", newCodeIntValue);//this addes upto 3 zero before the integer value.

                string finalItemCode = subCategoryCode + formattedCode;
                return finalItemCode;
            }


            return null;

        }

        //Sud:25Sept'21--We need to change the logic after we bring StoreId and GroupId into the picture..
        public static string GetNewVendorCode(InventoryDbContext inventoryDbContext)
        {

            //Note: we're using count logic for vendor code.. (different than that in GR, PO, etc)..
            int existingVendorCount = inventoryDbContext.Vendors.Count();

            int newCodeIntValue = existingVendorCount + 1;//current count plus 1 is new code..
            string formattedCode = String.Format("{0:D5}", newCodeIntValue);//this addes upto precedding zeroes to make the code 5 digits minumum...
            return formattedCode;
        }


    }
}

public class DispatchListViewModel
{
    public int DispatchId;
    public int RequisitionId;
    public DateTime? CreatedOn;
    public string ReceivedBy;
    public string Remarks;
    public string DispatchedByName;
    public string CreatedByName; //must change it to RequestedByName sanjit: 12APR'20
    public bool isReceived;
}