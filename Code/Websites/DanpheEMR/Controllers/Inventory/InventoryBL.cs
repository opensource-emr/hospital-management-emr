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

namespace DanpheEMR.Controllers
{
    public class InventoryBL
    {

        #region Dispatch Items Complete Transaction 
        //This function is complete transaction after dispatch items. Transactions as below
        //1)Save Dispatched Items,                          2)Save Stock Transaction 
        //3) Update Stock model (available Quantity)        4) Update Requisition and Requisition Items (Status and ReceivedQty,PendingQty, etc)
        public static int DispatchItemsTransaction(RequisitionStockVM requisitionStockVMFromClient, InventoryDbContext inventoryDbContext, RbacUser currentUser)
        {
            //DbContext Transaction has been moved to the outer function i.e. NormalDispatch and DirectDispatch
            ArrangeStockInFIFO(requisitionStockVMFromClient, inventoryDbContext, currentUser);

            //Save Dispatched Items 
            var DispatchId = AddDispatchItemsAndUpdateReqItemQty(inventoryDbContext, requisitionStockVMFromClient.dispatchItems, requisitionStockVMFromClient.requisition.RequisitionItems);

            UpdateRequisitionStatusAfterDispatch(inventoryDbContext, requisitionStockVMFromClient.requisition, currentUser);

            #region Logic for -Set ReferenceNo in StockTransaction Model from DispatchItems
            //This for get ReferenceNO (DispatchItemsId from Dispatched Items) and save to StockTransaction                    
            foreach (var stockTXN in requisitionStockVMFromClient.stockTransactions)
            {
                var DispatchItemId = 0;
                var ItemId = 0;
                var stockIdFromsTXN = stockTXN.StockId;

                foreach (var stkItem in requisitionStockVMFromClient.stock)
                {
                    if (stkItem.StockId == stockIdFromsTXN)
                    {
                        ItemId = stkItem.ItemId;
                        stockTXN.GoodsReceiptItemId = stkItem.GoodsReceiptItemId;
                    }
                }
                foreach (var dItem in requisitionStockVMFromClient.dispatchItems)
                {
                    if (ItemId == dItem.ItemId)
                    {
                        DispatchItemId = dItem.DispatchItemsId;
                    }
                }

                stockTXN.ReferenceNo = DispatchItemId;

            }
            #endregion
            //Save Stock Transaction record
            AddStockTransaction(inventoryDbContext, requisitionStockVMFromClient.stockTransactions);

            //Update Ward Inventory
            UpdateWardInventory(inventoryDbContext, requisitionStockVMFromClient.dispatchItems, currentUser);
            return DispatchId;
        }

        private static void UpdateRequisitionStatusAfterDispatch(InventoryDbContext inventoryDbContext, RequisitionModel requisition, RbacUser currentUser)
        {
            Boolean IsRequisitionComplete = requisition.RequisitionItems.All(rItem => rItem.RequisitionItemStatus == "complete");
            requisition.RequisitionStatus = IsRequisitionComplete ? "complete" : "partial";
            //Update Requisition and Requisition Items after Dispatche Items
            UpdateRequisitionWithRItems(inventoryDbContext, requisition, 0, currentUser);
        }
        private static void ArrangeStockInFIFO(RequisitionStockVM requisitionStockVMFromClient, InventoryDbContext inventoryDbContext, RbacUser currentUser)
        {
            //set requisition items in dispatch items variable
            requisitionStockVMFromClient.dispatchItems.ForEach(dItem =>
            {
                var totalRemainingQty = dItem.DispatchedQuantity;
                dItem.RequisitionId = requisitionStockVMFromClient.requisition.RequisitionId;
                dItem.Remarks = requisitionStockVMFromClient.requisition.Remarks;
                dItem.ReceivedBy = requisitionStockVMFromClient.requisition.ReceivedBy;
                dItem.RequisitionItemId = requisitionStockVMFromClient.requisition.RequisitionItems.FirstOrDefault(ritem => ritem.ItemId == dItem.ItemId).RequisitionItemId;
                var stockList = inventoryDbContext.Stock.Where(stock => stock.ItemId == dItem.ItemId && stock.AvailableQuantity > 0).OrderBy(stock => stock.TransactionDate).ToList();
                if (stockList.Count > 0)
                {
                    foreach (var stock in stockList)
                    {
                        var stockTxn = new StockTransactionModel();
                        stockTxn.StockId = stock.StockId;
                        stockTxn.InOut = "out";
                        stockTxn.ItemId = stock.ItemId;
                        stockTxn.TransactionType = "dispatched-items";
                        stockTxn.CreatedBy = currentUser.EmployeeId;
                        stockTxn.CreatedOn = DateTime.Now;
                        stockTxn.MRP = stock.MRP;
                        stockTxn.Price = stock.Price;
                        stockTxn.TransactionDate = stockTxn.CreatedOn;
                        stockTxn.FiscalYearId = GetFiscalYear(inventoryDbContext).FiscalYearId;
                        stockTxn.IsActive = true;
                        stockTxn.GoodsReceiptItemId = stock.GoodsReceiptItemId;
                        if (stock.AvailableQuantity < totalRemainingQty)
                        {
                            totalRemainingQty -= stock.AvailableQuantity;
                            stockTxn.Quantity = stock.AvailableQuantity;
                            stock.AvailableQuantity = 0;
                        }
                        else
                        {
                            stock.AvailableQuantity -= totalRemainingQty;
                            stockTxn.Quantity = totalRemainingQty;
                            totalRemainingQty = 0;
                        }
                        requisitionStockVMFromClient.stock.Add(stock);
                        requisitionStockVMFromClient.stockTransactions.Add(stockTxn);
                        if (totalRemainingQty == 0)
                        {
                            break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                        }
                    }
                }
                //all the modification in the stock will be updated once SaveChanges() is called, but SaveChanges() in done in next function to optimize the cost of operation.
            });
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
        public static Boolean WriteOffItemsTransaction(List<WriteOffItemsModel> writeOffItemsFromClient, InventoryDbContext inventoryDbContext)
        {
            //Transaction Begin
            //We first Need to make Stock, Stock_Transaction Object with WriteOff data (which has client data)
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    //This is updated list of stock records after write off items
                    List<StockModel> stockListForUpdate = new List<StockModel>();
                    //This is transaction list of write off items
                    List<StockTransactionModel> stockTxnListForInsert = new List<StockTransactionModel>();
                    //This is WriteOff List for insert into writeOff table
                    List<WriteOffItemsModel> writeOffListForInsert = new List<WriteOffItemsModel>();
                    var createdOn = DateTime.Now;

                    for (int i = 0; i < writeOffItemsFromClient.Count; i++)
                    {

                        List<StockModel> currStockList = new List<StockModel>();
                        currStockList = GetStockItemsByItemIdBatchNO(writeOffItemsFromClient[i].ItemId, writeOffItemsFromClient[i].BatchNO, inventoryDbContext);
                        if (currStockList.Count > 0)
                        {
                            foreach (var currStkItm in currStockList)
                            {
                                if (writeOffItemsFromClient[i].WriteOffQuantity > 0)
                                {
                                    //When stockItem availableQuantity is > WriteOffQuantity
                                    if (currStkItm.AvailableQuantity > writeOffItemsFromClient[i].WriteOffQuantity)
                                    {
                                        WriteOffItemsModel woItemsClone = new WriteOffItemsModel();
                                        //Clone WriteList item 
                                        woItemsClone = Clone(writeOffItemsFromClient[i]);
                                        currStkItm.AvailableQuantity = currStkItm.AvailableQuantity - woItemsClone.WriteOffQuantity.Value;
                                        //Push Updated StockItem into StockList for Update Stock                                
                                        stockListForUpdate.Add(currStkItm);
                                        woItemsClone.StockId = currStkItm.StockId;
                                        woItemsClone.GoodsReceiptItemId = currStkItm.GoodsReceiptItemId;
                                        woItemsClone.WriteOffQuantity = woItemsClone.WriteOffQuantity.Value;
                                        woItemsClone.Remark = woItemsClone.Remark.ToString();
                                        woItemsClone.CreatedOn = createdOn;
                                        //Push Updated WriteOff Item Into WriteOffItemList for Save
                                        writeOffListForInsert.Add(woItemsClone);
                                        //updated Current WriteOff Item Quantity as 0                                             
                                        writeOffItemsFromClient[i].WriteOffQuantity = 0;
                                    }
                                    else if (currStkItm.AvailableQuantity < writeOffItemsFromClient[i].WriteOffQuantity)
                                    {
                                        //when curStkItm.AvailableQuantity< woitm.WriteOffQuantity

                                        WriteOffItemsModel woItemsClone = new WriteOffItemsModel();
                                        woItemsClone = Clone(writeOffItemsFromClient[i]);
                                        woItemsClone.StockId = currStkItm.StockId;
                                        woItemsClone.WriteOffQuantity = currStkItm.AvailableQuantity;
                                        //double and decimal can't multiply so, need explicitly typecasting
                                        woItemsClone.TotalAmount = (decimal)currStkItm.AvailableQuantity * woItemsClone.ItemRate.Value;
                                        woItemsClone.GoodsReceiptItemId = currStkItm.GoodsReceiptItemId;
                                        //Push Updated WriteOff Item Into WriteOffItemList for Save
                                        writeOffListForInsert.Add(woItemsClone);
                                        currStkItm.AvailableQuantity = 0;
                                        //Push Updated StockItem into StockList for Update Stock                                
                                        stockListForUpdate.Add(currStkItm);
                                        writeOffItemsFromClient[i].WriteOffQuantity = writeOffItemsFromClient[i].WriteOffQuantity - currStkItm.AvailableQuantity;
                                    }
                                }
                            }
                        }
                    }
                    //Save WriteOffItems in database
                    AddWriteOffItems(inventoryDbContext, writeOffListForInsert);

                    //Make Fill data into Stock_transaction object for save into INV_TXN_StockTransaction table
                    foreach (var woItem in writeOffListForInsert)
                    {
                        StockTransactionModel stkTxnItem = new StockTransactionModel();
                        stkTxnItem.StockId = woItem.StockId;
                        stkTxnItem.Quantity = (int)woItem.WriteOffQuantity;
                        stkTxnItem.InOut = "out";
                        stkTxnItem.ReferenceNo = woItem.WriteOffId;
                        stkTxnItem.CreatedBy = woItem.CreatedBy;
                        stkTxnItem.CreatedOn = woItem.CreatedOn;
                        stkTxnItem.TransactionType = "writeoff-items";
                        stkTxnItem.ItemId = woItem.ItemId;
                        stkTxnItem.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext).FiscalYearId;
                        stkTxnItem.TransactionDate = stkTxnItem.CreatedOn;
                        stkTxnItem.IsActive = true;
                        var stockData = inventoryDbContext.Stock.Where(S => S.StockId == woItem.StockId).Select(S => new { S.MRP, S.Price, S.GoodsReceiptItemId }).FirstOrDefault();
                        stkTxnItem.MRP = stockData.MRP;
                        stkTxnItem.Price = stockData.Price;
                        stkTxnItem.GoodsReceiptItemId = stockData.GoodsReceiptItemId;

                        //Push current StkTxnItem into StkTxnItemList for Save to database
                        stockTxnListForInsert.Add(stkTxnItem);
                    }

                    //Save Stock Transaction record
                    AddStockTransaction(inventoryDbContext, stockTxnListForInsert);
                    //Update Stock records
                    UpdateStock(inventoryDbContext, stockListForUpdate);
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
        public static Boolean ReturnToVendorTransaction(ReturnToVendorModel returnToVendor, InventoryDbContext inventoryDbContext)
        {
            //Transaction Begin
            //We first Need to make Stock, Stock_Transaction Object with WriteOff data (which has client data)
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<ReturnToVendorItemsModel> retrnToVendorItemsFromClient = returnToVendor.itemsToReturn;
                    //This is updated list of stock records after write off items
                    List<StockModel> stockListForUpdate = new List<StockModel>();
                    //This is transaction list of write off items
                    List<StockTransactionModel> stockTxnListForInsert = new List<StockTransactionModel>();
                    //This is WriteOff List for insert into writeOff table
                    List<ReturnToVendorItemsModel> retrnToVndrListForInsert = new List<ReturnToVendorItemsModel>();




                    // Bikash:26June'20 : storing return-details (not return-item details) in return-to-vendor table
                    inventoryDbContext.ReturnToVendor.Add(returnToVendor);
                    inventoryDbContext.SaveChanges();
                    var ReturnToVendorId = returnToVendor.ReturnToVendorId;

                    //Stock data
                    foreach (var rtvItm in retrnToVendorItemsFromClient)
                    {
                        StockModel curStock = new StockModel();

                        curStock = GetStockbyStockId(rtvItm.StockId, inventoryDbContext);
                        //curStock.StockId = rtvItm.StockId;
                        curStock.AvailableQuantity = curStock.AvailableQuantity - rtvItm.Quantity;

                        stockListForUpdate.Add(curStock);
                    }

                    //ReturnToVendorItems data
                    foreach (var retItm in retrnToVendorItemsFromClient)
                    {
                        retItm.ReturnToVendorId = ReturnToVendorId;

                        ReturnToVendorItemsModel retVendor = new ReturnToVendorItemsModel();

                        retVendor = rtvClone(retItm);

                        retrnToVndrListForInsert.Add(retVendor);
                    }

                    //Save ReturnToVendorItems in database
                    AddretrnToVndrItems(inventoryDbContext, retrnToVndrListForInsert);

                    //stocktxn data
                    foreach (var rtvItem in retrnToVndrListForInsert)
                    {
                        StockTransactionModel stkTxnItem = new StockTransactionModel();

                        stkTxnItem.StockId = rtvItem.StockId;
                        stkTxnItem.Quantity = (int)rtvItem.Quantity;
                        stkTxnItem.ItemId = rtvItem.ItemId;
                        stkTxnItem.InOut = "out";
                        stkTxnItem.ReferenceNo = rtvItem.ReturnToVendorItemId;
                        stkTxnItem.CreatedBy = rtvItem.CreatedBy;
                        stkTxnItem.CreatedOn = rtvItem.CreatedOn;
                        stkTxnItem.TransactionType = "returntovendor-items";
                        stkTxnItem.TransactionDate = stkTxnItem.CreatedOn;
                        stkTxnItem.FiscalYearId = GetFiscalYear(inventoryDbContext).FiscalYearId;
                        stkTxnItem.IsActive = true;
                        var stockData = inventoryDbContext.Stock.Where(S => S.StockId == rtvItem.StockId).Select(S => new { S.MRP, S.Price, S.GoodsReceiptItemId }).FirstOrDefault();
                        stkTxnItem.MRP = stockData.MRP;
                        stkTxnItem.Price = stockData.Price;
                        stkTxnItem.GoodsReceiptItemId = stockData.GoodsReceiptItemId;
                        stockTxnListForInsert.Add(stkTxnItem);
                    }

                    //Save Stock Transaction record
                    AddStockTransaction(inventoryDbContext, stockTxnListForInsert);
                    //Update Stock records
                    UpdateStockAvailQty(inventoryDbContext, stockListForUpdate);
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

        #region Add DispatchItems
        //Save all Disaptch Items in database
        //dispatchItems and requisitionItems is parsed by reference. After this, each of them will have dispatchItemId assigned to them.
        public static int AddDispatchItemsAndUpdateReqItemQty(InventoryDbContext inventoryDbContext, List<DispatchItemsModel> dispatchItems, List<RequisitionItemsModel> requisitionItems)
        {
            try
            {
                int dispatchId;
                //var test= inventoryDbContext.DispatchItems.Last().DispatchId;
                int? maxDispatchId = inventoryDbContext.DispatchItems.Max(a => a.DispatchId);
                if (maxDispatchId == null || maxDispatchId == 0)
                {
                    dispatchId = 1;
                }
                else
                {
                    dispatchId = (int)maxDispatchId + 1;
                }

                foreach (var dispatchItem in dispatchItems)
                {
                    dispatchItem.CreatedOn = DateTime.Now;
                    dispatchItem.DispatchId = dispatchId;
                    inventoryDbContext.DispatchItems.Add(dispatchItem);

                    var requisitionItem = requisitionItems.Find(a => a.RequisitionItemId == dispatchItem.RequisitionItemId);
                    requisitionItem.ReceivedQuantity += dispatchItem.DispatchedQuantity;
                    requisitionItem.PendingQuantity = requisitionItem.Quantity - requisitionItem.ReceivedQuantity;
                    requisitionItem.RequisitionItemStatus = (requisitionItem.PendingQuantity > 0) ? "partial" : "complete";

                }
                //Save Dispatch Items
                inventoryDbContext.SaveChanges();
                return dispatchId;
            }
            catch (Exception ex)
            {
                throw ex;
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
                    GRItem.ModifiedBy = currentUser.EmployeeId;
                    GRItem.ModifiedOn = DateTime.Now;
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
                goodsReceipt.ModifiedBy = currentUser.EmployeeId;
                goodsReceipt.ModifiedOn = DateTime.Now;
                goodsReceipt.VerificationId = verificationId;
                db.GoodsReceipts.Attach(goodsReceipt);
                db.Entry(goodsReceipt).Property(x => x.GRStatus).IsModified = true;
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
        public static Boolean CancelGoodsReceipt(InventoryDbContext inventoryDbContext, int grId, string CancelRemarks, RbacUser rbacUser, string GRStatus = "cancelled", int? VerificationId = null)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    Boolean flag = true;
                    if (flag == true)
                    {
                        var gr = (from g in inventoryDbContext.GoodsReceipts
                                  where g.GoodsReceiptID == grId
                                  select g).FirstOrDefault();
                        gr.IsCancel = true;
                        gr.GRStatus = GRStatus;
                        //sud:15-Oct-2020: Updating GrCancel properties.
                        gr.CancelledBy = rbacUser.EmployeeId;
                        gr.CancelledOn = DateTime.Now;
                        //commented as per requirement
                        //gr.Remarks = "Cancelled"; //sanjit:25Mar'2020:the remark should not be updated instead isCancel field should be used. And a cancelRemark field is there.
                        gr.CancelRemarks = CancelRemarks;
                        if (VerificationId != null && VerificationId > 0)
                        {
                            gr.VerificationId = VerificationId;
                            inventoryDbContext.Entry(gr).Property(x => x.VerificationId).IsModified = true;
                        }
                        inventoryDbContext.GoodsReceipts.Attach(gr);
                        inventoryDbContext.Entry(gr).State = EntityState.Modified;
                        inventoryDbContext.Entry(gr).Property(x => x.IsCancel).IsModified = true;
                        inventoryDbContext.Entry(gr).Property(x => x.CancelRemarks).IsModified = true;
                        inventoryDbContext.Entry(gr).Property(x => x.GRStatus).IsModified = true;
                        //sud:15-Oct-2020: Updating GrCancel properties.
                        inventoryDbContext.Entry(gr).Property(x => x.CancelledOn).IsModified = true;
                        inventoryDbContext.Entry(gr).Property(x => x.CancelledBy).IsModified = true;
                        inventoryDbContext.SaveChanges();

                        var gritms = inventoryDbContext.GoodsReceiptItems.Where(a => a.GoodsReceiptId == grId).ToList();
                        foreach (var gritem in gritms)
                        {
                            gritem.CancelledBy = rbacUser.EmployeeId;
                            gritem.CancelledOn = DateTime.Now;
                            //sanjit: if this method is called from verification, this means stock is not yet registered.
                            if (VerificationId == null)
                            {
                                var stk = (from s in inventoryDbContext.Stock
                                           where s.GoodsReceiptItemId == gritem.GoodsReceiptItemId
                                           select s).FirstOrDefault();
                                if (gritem.ReceivedQuantity + gritem.FreeQuantity > stk.AvailableQuantity)
                                {
                                    var ex = new Exception("Failed.Stock is not available.");
                                    throw ex;
                                }
                                //Add the cancel gr as cancelled in stock transaction
                                var StockTxn = new StockTransactionModel();
                                StockTxn.StockId = stk.StockId;
                                StockTxn.Quantity = gritem.ReceivedQuantity + gritem.FreeQuantity;
                                StockTxn.InOut = "out";
                                StockTxn.ReferenceNo = gritem.GoodsReceiptItemId;
                                StockTxn.CreatedBy = rbacUser.EmployeeId;
                                StockTxn.CreatedOn = DateTime.Now;
                                StockTxn.ItemId = gritem.ItemId;
                                StockTxn.TransactionType = "cancel-gr-items";
                                StockTxn.IsTransferredToACC = null;
                                StockTxn.MRP = stk.MRP;
                                StockTxn.Price = stk.Price;
                                StockTxn.GoodsReceiptItemId = stk.GoodsReceiptItemId;
                                StockTxn.TransactionDate = StockTxn.CreatedOn;
                                StockTxn.FiscalYearId = GetFiscalYear(inventoryDbContext).FiscalYearId;
                                StockTxn.IsActive = true;
                                inventoryDbContext.StockTransactions.Add(StockTxn);
                                inventoryDbContext.SaveChanges();

                                stk.AvailableQuantity = 0;
                                inventoryDbContext.Stock.Attach(stk);
                                inventoryDbContext.Entry(stk).State = EntityState.Modified;
                                inventoryDbContext.Entry(stk).Property(x => x.AvailableQuantity).IsModified = true;
                                inventoryDbContext.SaveChanges();
                            }
                        }
                    }
                    else
                    {
                        flag = false;
                    }
                    dbContextTransaction.Commit();
                    return flag;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    return false;
                }
            }

        }
        #endregion
        #region Add Stock Transaction
        //All the stock transaction save to database
        public static void AddStockTransaction(InventoryDbContext inventoryDbContext, List<StockTransactionModel> stockTransactions)
        {
            try
            {
                foreach (var stockTransactinItem in stockTransactions)
                {
                    stockTransactinItem.CreatedOn = System.DateTime.Now;
                    stockTransactinItem.FiscalYearId = GetFiscalYear(inventoryDbContext, (DateTime)stockTransactinItem.CreatedOn).FiscalYearId;
                    stockTransactinItem.TransactionDate = stockTransactinItem.CreatedOn;
                    stockTransactinItem.IsActive = true;
                    inventoryDbContext.StockTransactions.Add(stockTransactinItem);
                }
                //Save Stock Transactions
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update Ward Inventory
        public static void UpdateWardInventory(InventoryDbContext db, List<DispatchItemsModel> dispatchItems, RbacUser currentUser, string ReceivedRemarks = "")
        {
            try
            {
                bool isItemReceiveFeatureEnabled = IsItemReceiveFeatureEnabled(db);
                if (dispatchItems != null)
                {
                    foreach (var dispatchItem in dispatchItems)
                    {
                        var invDispatchStockTxnList = db.StockTransactions.Where(stockTxn => stockTxn.ReferenceNo == dispatchItem.DispatchItemsId && stockTxn.TransactionType == "dispatched-items").ToList();
                        foreach (var invDispatchStockTxn in invDispatchStockTxnList)
                        {
                            WARDInventoryTransactionModel wardTxn = new WARDInventoryTransactionModel();
                            var GrItemIdInContext = (int)invDispatchStockTxn.GoodsReceiptItemId;
                            if (db.WardInventoryStockModel.Any(stock => stock.GoodsReceiptItemId == GrItemIdInContext && stock.StoreId == dispatchItem.StoreId))
                            {
                                var existingStock = db.WardInventoryStockModel.FirstOrDefault(stock => stock.GoodsReceiptItemId == GrItemIdInContext && stock.StoreId == dispatchItem.StoreId);
                                //Check if item receive is enabled, if yes: do not increase the stock directly but instead increase unconfirmed qty
                                if (isItemReceiveFeatureEnabled)
                                    existingStock.UnConfirmedQty += (double)invDispatchStockTxn.Quantity;
                                else
                                    existingStock.AvailableQuantity += (double)(invDispatchStockTxn.Quantity);
                                db.SaveChanges();
                                wardTxn.StockId = existingStock.StockId;
                                wardTxn.GoodsReceiptItemId = existingStock.GoodsReceiptItemId;
                            }
                            else
                            {
                                WARDInventoryStockModel wardStock = new WARDInventoryStockModel();
                                wardStock.CreatedBy = currentUser.EmployeeId;
                                wardStock.CreatedOn = DateTime.Now;
                                wardStock.ItemId = invDispatchStockTxn.ItemId;
                                wardStock.StoreId = dispatchItem.StoreId;
                                wardStock.Price = invDispatchStockTxn.Price;
                                wardStock.GoodsReceiptItemId = GrItemIdInContext;
                                //Check if item receive is enabled, if yes: do not increase the stock directly but instead increase unconfirmed qty
                                if (isItemReceiveFeatureEnabled)
                                    wardStock.UnConfirmedQty = (double)invDispatchStockTxn.Quantity;
                                else
                                    wardStock.AvailableQuantity = (double)invDispatchStockTxn.Quantity;
                                wardStock.DepartmentId = dispatchItem.DepartmentId;
                                wardStock.MRP = Convert.ToDecimal(invDispatchStockTxn.MRP);
                                var invStockDetail = db.Stock.Where(stk => stk.StockId == invDispatchStockTxn.StockId).Select(stk => new { stk.BatchNO, stk.ExpiryDate }).FirstOrDefault();
                                wardStock.BatchNo = invStockDetail.BatchNO;
                                wardStock.ExpiryDate = invStockDetail.ExpiryDate;
                                db.WardInventoryStockModel.Add(wardStock);
                                db.SaveChanges();
                                wardTxn.StockId = wardStock.StockId;
                                wardTxn.GoodsReceiptItemId = wardStock.GoodsReceiptItemId;
                            }
                            //add ward transaction
                            wardTxn.StoreId = dispatchItem.StoreId;
                            wardTxn.ItemId = dispatchItem.ItemId;
                            wardTxn.Quantity = Convert.ToDouble(invDispatchStockTxn.Quantity);
                            wardTxn.TransactionType = "dispatched-items";
                            wardTxn.Remarks = "Received From Main Store";
                            wardTxn.ReceivedBy = dispatchItem.ReceivedBy;
                            wardTxn.CreatedBy = currentUser.EmployeeId;
                            wardTxn.CreatedOn = DateTime.Now;
                            wardTxn.ReferenceNo = dispatchItem.DispatchItemsId;
                            wardTxn.InOut = "in";
                            wardTxn.Price = Convert.ToDecimal(invDispatchStockTxn.Price);
                            wardTxn.MRP = Convert.ToDecimal(invDispatchStockTxn.MRP);
                            wardTxn.TransactionDate = wardTxn.CreatedOn;
                            wardTxn.FiscalYearId = GetFiscalYear(db).FiscalYearId;
                            wardTxn.IsActive = true;
                            db.WardInventoryTransactionModel.Add(wardTxn);
                            db.SaveChanges();
                        }
                        if (isItemReceiveFeatureEnabled == false)
                        {
                            dispatchItem.ReceivedById = currentUser.EmployeeId;
                            dispatchItem.ReceivedOn = DateTime.Now;
                            dispatchItem.ReceivedRemarks = ReceivedRemarks;
                            db.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion
        #region Update Stock
        //Update Stock records
        public static void UpdateStock(InventoryDbContext inventoryDbContext, List<StockModel> Stock)
        {
            try
            {
                foreach (var stkItem in Stock)
                {
                    inventoryDbContext.Entry(stkItem).State = EntityState.Modified;
                }
                //Update Stock records
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update Stock (updating only available quantity)
        //this is used for ReturnToVendor
        //here we are updating only stock's available quantity
        public static void UpdateStockAvailQty(InventoryDbContext inventoryDbContext, List<StockModel> Stock)
        {
            try
            {
                foreach (var stkItem in Stock)
                {
                    inventoryDbContext.Stock.Attach(stkItem);
                    inventoryDbContext.Entry(stkItem).Property(x => x.AvailableQuantity).IsModified = true;
                }
                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update Requisition and Requisition Items
        //Update Stock records
        public static void UpdateRequisitionWithRItems(InventoryDbContext inventoryDbContext, RequisitionModel requisition, int? VerificationId, RbacUser currentUser)
        {
            try
            {
                foreach (var rItems in requisition.RequisitionItems)
                {
                    rItems.ModifiedBy = currentUser.EmployeeId;
                    rItems.ModifiedOn = DateTime.Now;
                    inventoryDbContext.RequisitionItems.Attach(rItems);
                    inventoryDbContext.Entry(rItems).Property(x => x.ReceivedQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.PendingQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.CancelQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.ModifiedOn).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.ModifiedBy).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.RequisitionItemStatus).IsModified = true;
                }
                requisition.ModifiedBy = currentUser.EmployeeId;
                requisition.ModifiedOn = DateTime.Now;
                inventoryDbContext.Requisitions.Attach(requisition);
                inventoryDbContext.Entry(requisition).Property(x => x.RequisitionStatus).IsModified = true;
                inventoryDbContext.Entry(requisition).Property(x => x.ModifiedOn).IsModified = true;
                inventoryDbContext.Entry(requisition).Property(x => x.ModifiedBy).IsModified = true;

                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
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

        #region Get Stock Records Against ItemId && BatchNO
        //This is Used for WriteOff or may be for other purpose
        public static List<StockModel> GetStockItemsByItemIdBatchNO(int ItemId, string BatchNO, InventoryDbContext inventoryDBContext)
        {
            try
            {
                if (BatchNO == "NA")
                {
                    BatchNO = string.Empty;
                }
                List<StockModel> stockItems = (from stock in inventoryDBContext.Stock
                                               where stock.ItemId == ItemId && stock.BatchNO == BatchNO
                                               select stock
                                               ).ToList();
                return stockItems;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region GET: stock record against StockId
        //this is used for ReturnToVendor
        public static StockModel GetStockbyStockId(int stockId, InventoryDbContext inventoryDBContext)
        {
            try
            {
                StockModel stockItem = (from stock in inventoryDBContext.Stock
                                        where stock.StockId == stockId
                                        select stock
                                       ).FirstOrDefault();
                return stockItem;
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
        /// <param name="requisitionStockVMFromClient"></param>
        /// <param name="inventoryDb"></param>
        /// <param name="currentUser"></param>
        internal static void DirectDispatch(RequisitionStockVM requisitionStockVMFromClient, InventoryDbContext inventoryDb, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDb.Database.BeginTransaction())
            {
                try
                {
                    bool isRequisitionCreated = CreateRequisition(requisitionStockVMFromClient.requisition, inventoryDb, currentUser);
                    if (isRequisitionCreated == true)
                    {
                        InventoryBL.DispatchItemsTransaction(requisitionStockVMFromClient, inventoryDb, currentUser);
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
        public static bool CreateRequisition(RequisitionModel requisition, InventoryDbContext inventoryDb, RbacUser currentUser)
        {
            List<RequisitionItemsModel> requisitionItems = new List<RequisitionItemsModel>();

            //giving List Of RequisitionItems to requItemsFromClient because we have save the requisition and RequisitionItems One by one ..
            //first the requisition is saved  after that we have to take the requisitionid and give the requisitionid  to the RequisitionItems ..and then we can save the RequisitionItems
            requisitionItems = requisition.RequisitionItems;

            //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
            requisition.RequisitionItems = null;
            var maxRequisitionList = inventoryDb.Requisitions.ToList();
            if (maxRequisitionList.Count() == 0)
            {
                requisition.RequisitionNo = 1;
            }
            else
                requisition.RequisitionNo = maxRequisitionList.Max(a => a.RequisitionNo) + 1;

            requisition.IssueNo = requisition.IssueNo;
            //asigining the value to POFromClient with POitems= null
            requisition.CreatedBy = currentUser.EmployeeId;
            requisition.CreatedOn = DateTime.Now;
            //sanjit: 8 Apr'20: added to maintain history table.
            requisition.ModifiedBy = currentUser.EmployeeId;
            requisition.ModifiedOn = requisition.CreatedOn; //to make the modifiedOn date same as createdOn Date so that records don't mismatch by milliseconds
            if (requisition.RequisitionDate == null)
            {
                requisition.RequisitionDate = DateTime.Now;
            }
            inventoryDb.Requisitions.Add(requisition);

            //this is for requisition only
            inventoryDb.SaveChanges();

            //getting the lastest RequistionId 
            int lastRequId = requisition.RequisitionId;
            int lastRequNo = requisition.RequisitionNo;
            int? issueNo = requisition.IssueNo;
            //assiging the RequisitionId and CreatedOn i requisitionitem list
            requisitionItems.ForEach(reqItem =>
            {
                reqItem.RequisitionId = lastRequId;
                reqItem.RequisitionNo = lastRequNo;
                reqItem.IssueNo = issueNo;
                reqItem.CreatedBy = currentUser.EmployeeId;
                reqItem.CreatedOn = DateTime.Now;
                reqItem.ModifiedBy = reqItem.CreatedBy;
                reqItem.ModifiedOn = reqItem.CreatedOn;
                reqItem.AuthorizedOn = DateTime.Now;
                reqItem.PendingQuantity = (double)reqItem.Quantity;
                reqItem.CancelQuantity = 0;
                inventoryDb.RequisitionItems.Add(reqItem);

            });
            //this Save for requisitionItems
            inventoryDb.SaveChanges();
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

        public static int GetGoodReceiptNo(InventoryDbContext inventoryDbContext, int fiscalYearId)
        {

            int goodreceiptnumber = (from invtxn in inventoryDbContext.GoodsReceipts
                                     where invtxn.FiscalYearId == fiscalYearId
                                     select invtxn.GoodsReceiptNo).DefaultIfEmpty(0).Max();
            return goodreceiptnumber + 1;
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
                    db.PurchaseOrderItems.Attach(POItems);
                    db.Entry(POItems).Property(x => x.Quantity).IsModified = true;
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