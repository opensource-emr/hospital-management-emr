using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using RefactorThis.GraphDiff;//for entity-update.
using System.Collections.ObjectModel;
using System.Reflection;

namespace DanpheEMR.Controllers
{
    public class InventoryBL
    {

        #region Dispatch Items Complete Transaction 
        //This function is complete transaction after dispatch items. Transactions as below
        //1)Save Dispatched Items,                          2)Save Stock Transaction 
        //3) Update Stock model (available Quantity)        4) Update Requisition and Requisition Items (Status and ReceivedQty,PendingQty, etc)
        public static Boolean DispatchItemsTransaction(RequisitionStockVM requisitionStockVMFromClient, InventoryDbContext inventoryDbContext)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    //Save Dispatched Items 
                    AddDispatchItems(inventoryDbContext, requisitionStockVMFromClient.dispatchItems);
                    #region Logic for -Set ReferenceNo in StockTransaction Model from DispatchItems
                    //This for get ReferenceNO (DispatchItemsId from Dispatched Items) and save to StockTransaction                    
                    foreach (var stockTXN in requisitionStockVMFromClient.stockTransactions)
                    {
                        var ItemId = 0;
                        var DispatchId = 0;
                        var stockIdFromsTXN = stockTXN.StockId;

                        foreach (var stkItem in requisitionStockVMFromClient.stock)
                        {
                            if (stkItem.StockId == stockIdFromsTXN)
                            {
                                ItemId = stkItem.ItemId;
                            }
                        }
                        foreach (var dItem in requisitionStockVMFromClient.dispatchItems)
                        {
                            if (ItemId == dItem.ItemId)
                            {
                                DispatchId = dItem.DispatchItemsId;
                            }
                        }

                        stockTXN.ReferenceNo = DispatchId;

                    }
                    #endregion
                    //Save Stock Transaction record
                    AddStockTransaction(inventoryDbContext, requisitionStockVMFromClient.stockTransactions);
                    //Update Stock records
                    UpdateStock(inventoryDbContext, requisitionStockVMFromClient.stock);
                    //Update Requisition and Requisition Items after Dispatche Items
                    UpdateRequisitionWithRItems(inventoryDbContext, requisitionStockVMFromClient.requisition);

                    //Update Ward Inventory 
                    UpdateWardInventory(inventoryDbContext, requisitionStockVMFromClient.dispatchItems);
                    //Commit Transaction
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        #endregion

        #region DISPATCH ALL
        //This function is complete transaction for DISPATCH-ALL.
        //1)Save Dispatched Items,                          2)Save Stock Transaction 
        //3) Update Stock model (available Quantity)        4) Update Requisition and Requisition Items (Status and ReceivedQty,PendingQty)
        public static Boolean DispatchAllTransaction(RequisitionsStockVM requisitionStockVMFromClient, InventoryDbContext inventoryDbContext)
        {
            //Transaction Begin
            using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    //Save Dispatched Items 
                    AddDispatchItems(inventoryDbContext, requisitionStockVMFromClient.dispatchItems);
                    //This for get ReferenceNO (DispatchItemsId from Dispatched Items) and save to StockTransaction                    
                    foreach (var stockTXN in requisitionStockVMFromClient.stockTransactions)
                    {
                        var DispatchId = 0;
                        var ReqItemId = stockTXN.requisitionItemId;
                        foreach (var dItem in requisitionStockVMFromClient.dispatchItems)
                        {
                            if (ReqItemId == dItem.RequisitionItemId)
                            {
                                DispatchId = dItem.DispatchItemsId;
                            }
                        }
                        stockTXN.ReferenceNo = DispatchId;
                    }
                    //Save Stock Transaction record
                    AddStockTransaction(inventoryDbContext, requisitionStockVMFromClient.stockTransactions);
                    //Update Stock records
                    UpdateStock(inventoryDbContext, requisitionStockVMFromClient.stocks);
                    //Update Requisition and Requisition Items after Dispatche Items
                    UpdateRequisitionandRItems(inventoryDbContext, requisitionStockVMFromClient.requisitions);

                    //Commit Transaction
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
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
                        //StockTxnId,StockId,Quantity,InOut, ReferenceNo CreatedBy ,CreatedOn,TransactionType
                        stkTxnItem.StockId = woItem.StockId;
                        stkTxnItem.Quantity = (int)woItem.WriteOffQuantity;
                        stkTxnItem.InOut = "out";
                        stkTxnItem.ReferenceNo = woItem.WriteOffId;
                        stkTxnItem.CreatedBy = woItem.CreatedBy;
                        stkTxnItem.TransactionType = "writeoff";
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
        //1. Add ReturnToVendorItems
        //2. Add StockTransaction
        //3. Update StockUpdate (AvailableQuantity)
        public static Boolean ReturnToVendorTransaction(List<ReturnToVendorItemsModel> retrnToVendorItemsFromClient, InventoryDbContext inventoryDbContext)
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
                    List<ReturnToVendorItemsModel> retrnToVndrListForInsert = new List<ReturnToVendorItemsModel>();

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
                        stkTxnItem.InOut = "out";
                        stkTxnItem.ReferenceNo = rtvItem.ReturnToVendorItemId;
                        stkTxnItem.CreatedBy = rtvItem.CreatedBy;
                        stkTxnItem.TransactionType = "returntovendor";

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
        public static void AddDispatchItems(InventoryDbContext inventoryDbContext, List<DispatchItemsModel> dispatchItems)
        {
            try
            {
                foreach (var dispatchItem in dispatchItems)
                {
                    dispatchItem.CreatedOn = System.DateTime.Now;
                    inventoryDbContext.DispatchItems.Add(dispatchItem);
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
        public static void UpdateWardInventory(InventoryDbContext inventoryDbContext, List<DispatchItemsModel> dispatchItems)
        {
            try
            {
                if (dispatchItems != null)
                {
                    foreach (var stkItem in dispatchItems)
                    {

                        var wardItem = inventoryDbContext.WardStock.Where(i => i.ItemId == stkItem.ItemId && i.StockType=="inventory" && i.DepartmentId == stkItem.DepartmentId).FirstOrDefault();
                        if (wardItem != null)
                        {
                            wardItem.AvailableQuantity = wardItem.AvailableQuantity + Convert.ToInt32(stkItem.DispatchedQuantity);
                            inventoryDbContext.Entry(wardItem).State = EntityState.Modified;
                        }
                        else
                        {
                            var inventory = (from inv in inventoryDbContext.Stock
                                             join goods in inventoryDbContext.GoodsReceiptItems on inv.GoodsReceiptItemId equals goods.GoodsReceiptItemId
                                             where inv.ItemId == stkItem.ItemId
                                             select new
                                             {
                                                 BatchNo = inv.BatchNO,
                                                 MRP = goods.ItemRate,
                                                 inv.ExpiryDate
                                             }).FirstOrDefault();

                            
                            WARDStockModel wardStock = new WARDStockModel();
                            wardStock.ItemId = stkItem.ItemId;
                            wardStock.AvailableQuantity = Convert.ToInt32(stkItem.DispatchedQuantity);
                            wardStock.DepartmentId = stkItem.DepartmentId;
                            wardStock.StockType = "inventory";
                            if (inventory != null)
                            {
                                wardStock.BatchNo = inventory.BatchNo;
                                wardStock.MRP = Convert.ToDouble(inventory.MRP);
                                wardStock.ExpiryDate = inventory.ExpiryDate;

                            }
                            inventoryDbContext.WardStock.Add(wardStock);

                        }
                    }
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
        public static void UpdateRequisitionWithRItems(InventoryDbContext inventoryDbContext, RequisitionModel requisition)
        {
            try
            {
                var checkStatus = true;
                foreach (var rItems in requisition.RequisitionItems)
                {
                    inventoryDbContext.RequisitionItems.Attach(rItems);
                    inventoryDbContext.Entry(rItems).Property(x => x.ReceivedQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.PendingQuantity).IsModified = true;
                    if( rItems.ReceivedQuantity >= rItems.PendingQuantity)
                    {
                        inventoryDbContext.Entry(rItems).Property(x => x.RequisitionItemStatus).IsModified = true;
                    }
                    else
                    {
                        checkStatus = false;
                    }
                }
                if (checkStatus)
                {
                    inventoryDbContext.Requisitions.Attach(requisition);
                    inventoryDbContext.Entry(requisition).Property(x => x.RequisitionStatus).IsModified = true;
                }

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
    }
}
