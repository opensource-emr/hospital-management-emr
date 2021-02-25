using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using System.Data.Entity;
using System.Configuration;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class WardSupplyBL
    {
        public static Boolean UpdateWardSockQuantity(List<WARDStockModel> stockModelList, WardSupplyDbContext wardSupplyDbContext)
        {
            try
            {
                foreach (var stock in stockModelList)
                {
                    //getting previous records
                    var wardstock = wardSupplyDbContext.WARDStockModel
                        .Select(n => new
                        {
                            n.StockId,
                            n.StoreId,
                            n.WardId,
                            n.ItemId,
                            n.AvailableQuantity,
                            MRP = (Math.Round(n.MRP, 2)),
                            n.BatchNo,
                            n.ExpiryDate
                        })
                        .Where(a =>
                        a.BatchNo == stock.BatchNo &&
                        a.ItemId == stock.ItemId &&
                        a.MRP == (Math.Round(stock.MRP, 2)) &&
                        a.ExpiryDate == stock.ExpiryDate &&
                        a.StoreId == stock.StoreId).FirstOrDefault();

                    if (wardstock.AvailableQuantity > 0)
                    {
                        stock.StockId = wardstock.StockId;
                        stock.AvailableQuantity = wardstock.AvailableQuantity - (int)stock.DispachedQuantity;
                        wardSupplyDbContext.WARDStockModel.Attach(stock);
                        wardSupplyDbContext.Entry(stock).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                return false;
                throw ex;
            }
            return true;
        }

        public static Boolean StockTransfer(WARDStockModel stkTransferfromClient, WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser, String ReceivedBy)
        {
            //Transaction Begin
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status


                    var AvailableQuantity = (int)(Convert.ToDecimal(stkTransferfromClient.AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    WARDStockModel stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                                  where stock.StockId == stkTransferfromClient.StockId
                                                  select stock
                                                  ).FirstOrDefault();
                    stockDetail.AvailableQuantity = AvailableQuantity;

                    wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                    //add to transaction table
                    var selectedstockTxnItm = new WARDTransactionModel();
                    selectedstockTxnItm.WardId = stkTransferfromClient.WardId;
                    selectedstockTxnItm.newWardId = stkTransferfromClient.newWardId;
                    selectedstockTxnItm.ItemId = stkTransferfromClient.ItemId;
                    selectedstockTxnItm.StockId = stkTransferfromClient.StockId;
                    selectedstockTxnItm.StoreId = stkTransferfromClient.StoreId;
                    selectedstockTxnItm.TransactionId = 0;
                    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    selectedstockTxnItm.TransactionType = "WardtoWard";
                    selectedstockTxnItm.Remarks = stkTransferfromClient.Remarks;
                    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                    selectedstockTxnItm.CreatedOn = DateTime.Now;
                    selectedstockTxnItm.IsWard = true;
                    selectedstockTxnItm.ReceivedBy = ReceivedBy;
                    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                    wardSupplyDbContext.SaveChanges();

                    //add stock to new ward
                    stkTransferfromClient.WardId = stkTransferfromClient.newWardId;
                    stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                   where stock.WardId == stkTransferfromClient.WardId && stock.ItemId == stkTransferfromClient.ItemId && stock.BatchNo == stkTransferfromClient.BatchNo && stock.StoreId == stkTransferfromClient.StoreId
                                   select stock
                                                 ).FirstOrDefault();
                    if (stockDetail != null)
                    {
                        stockDetail.AvailableQuantity = stockDetail.AvailableQuantity + (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                    }
                    else
                    {
                        stkTransferfromClient.AvailableQuantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        wardSupplyDbContext.WARDStockModel.Add(stkTransferfromClient);
                        wardSupplyDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();//Commit Transaction
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
                //return false;
            }
        }

        public static Boolean StockInventoryTransfer(WARDStockModel stkTransferfromClient, WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status


                    var AvailableQuantity = (int)(Convert.ToDecimal(stkTransferfromClient.AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    WARDStockModel stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                                  where stock.StockId == stkTransferfromClient.StockId && stock.ItemId == stkTransferfromClient.ItemId && stock.DepartmentId == stkTransferfromClient.DepartmentId && stock.StockType == "inventory"
                                                  select stock
                                                  ).FirstOrDefault();
                    stockDetail.AvailableQuantity = AvailableQuantity;

                    wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                    //add to transaction table
                    var selectedstockTxnItm = new WARDTransactionModel();
                    selectedstockTxnItm.WardId = stkTransferfromClient.DepartmentId;
                    selectedstockTxnItm.newWardId = stkTransferfromClient.newWardId;
                    selectedstockTxnItm.ItemId = stkTransferfromClient.ItemId;
                    selectedstockTxnItm.StockId = stkTransferfromClient.StockId;
                    selectedstockTxnItm.TransactionId = 0;
                    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    selectedstockTxnItm.TransactionType = "Inventory-WardtoWard";
                    selectedstockTxnItm.Remarks = stkTransferfromClient.Remarks;
                    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                    selectedstockTxnItm.CreatedOn = DateTime.Now;
                    selectedstockTxnItm.IsWard = false;
                    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                    wardSupplyDbContext.SaveChanges();

                    //add stock to new ward
                    stkTransferfromClient.DepartmentId = stkTransferfromClient.newWardId;
                    stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                   where stock.DepartmentId == stkTransferfromClient.DepartmentId && stock.ItemId == stkTransferfromClient.ItemId && stock.StockType == "inventory"
                                   select stock).FirstOrDefault();
                    if (stockDetail != null)
                    {
                        stockDetail.AvailableQuantity = stockDetail.AvailableQuantity + (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                    }
                    else
                    {
                        stkTransferfromClient.AvailableQuantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        stkTransferfromClient.WardId = null;
                        stkTransferfromClient.StockType = "inventory";
                        wardSupplyDbContext.WARDStockModel.Add(stkTransferfromClient);
                        wardSupplyDbContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();//Commit Transaction
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
                //return false;
            }
        }
        public static Boolean BackToInventoryTransfer(WARDStockModel stkTransferfromClient, WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status


                    var AvailableQuantity = (int)(Convert.ToDecimal(stkTransferfromClient.AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    WARDStockModel stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                                  where stock.StockId == stkTransferfromClient.StockId && stock.ItemId == stkTransferfromClient.ItemId && stock.DepartmentId == stkTransferfromClient.DepartmentId && stock.StockType == "inventory"
                                                  select stock
                                                  ).FirstOrDefault();
                    stockDetail.AvailableQuantity = AvailableQuantity;

                    wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                    //add to transaction table
                    var selectedstockTxnItm = new WARDTransactionModel();
                    selectedstockTxnItm.WardId = stkTransferfromClient.DepartmentId;
                    selectedstockTxnItm.newWardId = stkTransferfromClient.newWardId;
                    selectedstockTxnItm.ItemId = stkTransferfromClient.ItemId;
                    selectedstockTxnItm.StockId = stkTransferfromClient.StockId;
                    selectedstockTxnItm.TransactionId = 0;
                    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    selectedstockTxnItm.TransactionType = "BackToInventory";
                    selectedstockTxnItm.Remarks = stkTransferfromClient.Remarks;
                    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                    selectedstockTxnItm.CreatedOn = DateTime.Now;
                    selectedstockTxnItm.IsWard = false;
                    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                    wardSupplyDbContext.SaveChanges();

                    //add stock to inventory
                    var inventoryStock = new StockModel();
                    inventoryStock = (from stock in wardSupplyDbContext.INVStockMaster
                                      where stock.ItemId == stkTransferfromClient.ItemId && stock.BatchNO == stkTransferfromClient.BatchNo
                                      select stock).FirstOrDefault();
                    if (inventoryStock != null)
                    {
                        inventoryStock.AvailableQuantity = inventoryStock.AvailableQuantity + (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        wardSupplyDbContext.Entry(inventoryStock).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                        var stockTransaction = new StockTransactionModel();
                        stockTransaction.StockId = inventoryStock.StockId;
                        stockTransaction.Quantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                        stockTransaction.InOut = "in";
                        stockTransaction.ItemId = inventoryStock.ItemId;
                        stockTransaction.Price = inventoryStock.Price;
                        stockTransaction.MRP = inventoryStock.MRP;
                        stockTransaction.ReferenceNo = inventoryStock.GoodsReceiptItemId;
                        stockTransaction.CreatedBy = currentUser.EmployeeId;
                        stockTransaction.CreatedOn = DateTime.Now;
                        stockTransaction.TransactionType = "Sent From WardSupply";
                        stockTransaction.TransactionDate = stockTransaction.CreatedOn;
                        //stockTransaction.FiscalYearId = InventoryBL.GetFiscalYear();
                        stockTransaction.IsActive = true;
                        wardSupplyDbContext.INVStockTransaction.Add(stockTransaction);
                        wardSupplyDbContext.SaveChanges();
                    }
                    //add to stock transaction in inventory
                    dbContextTransaction.Commit();//Commit Transaction
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
                //return false;
            }
        }
        public static Boolean StockBreakage(WARDStockModel stkBreakage, WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser)
        {
            //Transaction begins
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>();

                    var AvailableQuantity = (int)(Convert.ToDecimal(stkBreakage.AvailableQuantity)) - (int)(Convert.ToDecimal(stkBreakage.DispachedQuantity));
                    WARDStockModel stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                                  where stock.StockId == stkBreakage.StockId
                                                  select stock).FirstOrDefault();
                    stockDetail.AvailableQuantity = AvailableQuantity;
                    wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;
                    //add to transaction table
                    var selectedstockTxnItm = new WARDTransactionModel();
                    selectedstockTxnItm.WardId = stkBreakage.WardId;
                    selectedstockTxnItm.ItemId = stkBreakage.ItemId;
                    selectedstockTxnItm.StockId = stkBreakage.StockId;
                    selectedstockTxnItm.StoreId = stkBreakage.StoreId;
                    selectedstockTxnItm.TransactionId = 0;
                    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkBreakage.DispachedQuantity));
                    selectedstockTxnItm.TransactionType = "BreakageItem";
                    selectedstockTxnItm.Remarks = stkBreakage.Remarks;
                    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                    selectedstockTxnItm.CreatedOn = DateTime.Now;
                    selectedstockTxnItm.IsWard = true;
                    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                    wardSupplyDbContext.SaveChanges();

                    dbContextTransaction.Commit();//Commit Transaction
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
                //return false;
            }
        }
        public static Boolean StockTransferToPharmacy(List<WARDStockModel> stkTransfer, WardSupplyDbContext wardSupplyDbContext, PharmacyDbContext pharmacyDbContext, RbacUser currentUser, String ReceivedBy)
        {
            //Transaction Begins
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (stkTransfer != null)
                    {
                        for (int i = 0; i < stkTransfer.Count; i++)
                        {
                            //for linq as Array will not be accessed in linq
                            var stockId = stkTransfer[i].StockId;
                            var storeId = stkTransfer[i].StoreId;
                            var itemId = stkTransfer[i].ItemId;
                            var expiryDate = stkTransfer[i].ExpiryDate;
                            var batchNo = stkTransfer[i].BatchNo;

                            WARDStockModel updatedStock = (from stock in wardSupplyDbContext.WARDStockModel
                                                           where stock.StockId == stockId && stock.StoreId == storeId
                                                           select stock
                                                  ).FirstOrDefault();
                            updatedStock.AvailableQuantity = (int)(Convert.ToDecimal(stkTransfer[i].AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            wardSupplyDbContext.Entry(updatedStock).Property(a => a.AvailableQuantity).IsModified = true;
                            //transaction table
                            var selectedstockTxnItm = new WARDTransactionModel();
                            selectedstockTxnItm.WardId = updatedStock.WardId;
                            selectedstockTxnItm.ItemId = updatedStock.ItemId;
                            selectedstockTxnItm.StockId = updatedStock.StockId;
                            selectedstockTxnItm.StoreId = updatedStock.StoreId;
                            selectedstockTxnItm.TransactionId = 0;
                            selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            selectedstockTxnItm.TransactionType = "WardToPharmacy";
                            selectedstockTxnItm.Remarks = "Sent From Ward To Pharmacy";
                            selectedstockTxnItm.CreatedBy = currentUser.UserName;
                            selectedstockTxnItm.CreatedOn = DateTime.Now;
                            selectedstockTxnItm.IsWard = true;
                            selectedstockTxnItm.ReceivedBy = ReceivedBy;
                            wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                            wardSupplyDbContext.SaveChanges();

                            //pharmacy store stock changes
                            var StoreStockEntry = pharmacyDbContext.PHRMStoreStock.Where(a => a.ItemId == itemId && a.ExpiryDate == expiryDate && a.BatchNo == batchNo).FirstOrDefault();

                            StoreStockEntry.InOut = "in";
                            StoreStockEntry.Quantity = Convert.ToDouble(stkTransfer[i].DispachedQuantity);
                            var SubStoreName = pharmacyDbContext.PHRMStore.Where(a => a.StoreId == storeId).Select(a => a.Name).FirstOrDefault();
                            StoreStockEntry.TransactionType = "ReturnFromSubstore";
                            StoreStockEntry.Remark = "Returned from" + SubStoreName + ". ReferenceNo. is StockId of Ward.";
                            StoreStockEntry.ReferenceNo = stkTransfer[i].StockId;
                            pharmacyDbContext.PHRMStoreStock.Add(StoreStockEntry);
                            pharmacyDbContext.SaveChanges();

                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public static void UpdateWardStockForConsumption(WardSupplyDbContext db, RbacUser currentUser, WARDInventoryConsumptionModel consumption)
        {
            var stockList = db.WARDInventoryStockModel.Where(stock => stock.ItemId == consumption.ItemId && stock.StoreId == consumption.StoreId && stock.AvailableQuantity > 0).ToList();
            var tempConsumeQty = consumption.ConsumeQuantity;   
            foreach (var stock in stockList)
            {
                //insert stock txn as well.
                var stockTxn = new WARDInventoryTransactionModel();
                stockTxn.StoreId = consumption.StoreId;
                stockTxn.ItemId = consumption.ItemId;
                stockTxn.Remarks = $"Consumed By {consumption.UsedBy}";
                stockTxn.ReceivedBy = consumption.UsedBy;
                stockTxn.ReferenceNo = consumption.ConsumptionId;

                stockTxn.StockId = stock.StockId;
                stockTxn.MRP = stock.MRP;
                stockTxn.GoodsReceiptItemId = stock.GoodsReceiptItemId;
                stockTxn.Price = (decimal)(stock.Price);

                stockTxn.TransactionType = "consumption-items";
                stockTxn.InOut = "out";
                stockTxn.CreatedBy = currentUser.EmployeeId;
                stockTxn.CreatedOn = DateTime.Now;
                stockTxn.TransactionDate = stockTxn.CreatedOn;
                stockTxn.FiscalYearId = GetCurrentInvFiscalYear(db,consumption.ConsumptionDate).FiscalYearId;
                stockTxn.IsActive = true;
                if (stock.AvailableQuantity < tempConsumeQty)
                {
                    //case 1: stock does not contain quantity as consumed.
                    //decrease available quantity from temporary consume quantity
                    tempConsumeQty -= stock.AvailableQuantity;
                    //store the consumed quantity from this stock in the stock transaction;
                    stockTxn.Quantity = stock.AvailableQuantity;
                    //decrease all the available quantity from the stock
                    stock.AvailableQuantity = 0;
                    db.WARDInventoryTransactionModel.Add(stockTxn);

                }
                else
                {
                    //case 2: stock contains quantity as consumed.
                    //decrease consumed quantity from the stock
                    stock.AvailableQuantity -= tempConsumeQty;
                    //save the consumed quantity in transaction
                    stockTxn.Quantity = tempConsumeQty;
                    //decrease all the consume quantity
                    tempConsumeQty = 0;
                    //since this case must be achieved in order to successfully consume
                    //put a break and go to another consumption item
                    db.WARDInventoryTransactionModel.Add(stockTxn);
                    db.SaveChanges();
                    break;
                }
            }
        }
        public static InventoryFiscalYear GetCurrentInvFiscalYear(WardSupplyDbContext db, DateTime? DecidingDate = null)
        {
            DecidingDate = (DecidingDate == null) ? DateTime.Now.Date : DecidingDate;
            return db.InvFiscalYears.Where(fsc => fsc.StartDate <= DecidingDate && fsc.EndDate >= DecidingDate).FirstOrDefault();
        }

        public async static Task ReceiveDispatchedStocks(int DispatchId, InventoryDbContext db, RbacUser currentUser, string receivedRemarks)
        {

            List<DispatchItemsModel> dispatchItemsToUpdate = await db.DispatchItems.Where(itm => itm.DispatchId == DispatchId).ToListAsync();
            if (dispatchItemsToUpdate == null || dispatchItemsToUpdate.Count == 0) { throw new Exception("Items Not Found."); };
            foreach (var dispatchedItem in dispatchItemsToUpdate)
            {
                //TODO: Find stock txns for each dispatched item
                var stockTxnList = await db.WardInventoryTransactionModel.Where(ST => ST.ReferenceNo == dispatchedItem.DispatchItemsId && ST.TransactionType == "dispatched-items").ToListAsync(); ;
                foreach (var stkTxn in stockTxnList)
                {
                    var stock = await db.WardInventoryStockModel.FindAsync(stkTxn.StockId);
                    stock.AvailableQuantity += stock.UnConfirmedQty;
                    stock.UnConfirmedQty = 0;
                    await db.SaveChangesAsync();
                }
                //TODO: Update the Received Status in Dispatched Items Row in Dispatch Table
                dispatchedItem.ReceivedById = currentUser.EmployeeId;
                dispatchedItem.ReceivedOn = DateTime.Now;
                dispatchedItem.ReceivedRemarks = receivedRemarks;
                await db.SaveChangesAsync();
            }
        }
    }
}
