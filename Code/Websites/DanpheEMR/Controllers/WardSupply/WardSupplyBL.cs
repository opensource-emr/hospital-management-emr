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
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.InventoryModels;

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
                    var inventoryStock = new StoreStockModel();
                    inventoryStock = (from stock in wardSupplyDbContext.StoreStocks.Include(s => s.StockMaster)
                                      where stock.ItemId == stkTransferfromClient.ItemId && stock.StockMaster.BatchNo == stkTransferfromClient.BatchNo
                                      select stock).FirstOrDefault();
                    if (inventoryStock != null)
                    {
                        inventoryStock.AddStock(
                            quantity: Convert.ToDouble(stkTransferfromClient.DispachedQuantity),
                            transactionType: ENUM_INV_StockTransactionType.TransferItem,
                            transactionDate: null,
                            currentDate: DateTime.Now,
                            referenceNo: null,
                            createdBy: currentUser.EmployeeId,
                            fiscalYearId: GetCurrentInvFiscalYear(wardSupplyDbContext).FiscalYearId,
                            needConfirmation: true
                            );
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
                        //for (int i = 0; i < stkTransfer.Count; i++)
                        //{
                        //    //for linq as Array will not be accessed in linq
                        //    var stockId = stkTransfer[i].StockId;
                        //    var storeId = stkTransfer[i].StoreId;
                        //    var itemId = stkTransfer[i].ItemId;
                        //    var expiryDate = stkTransfer[i].ExpiryDate;
                        //    var batchNo = stkTransfer[i].BatchNo;

                        //    WARDStockModel updatedStock = (from stock in wardSupplyDbContext.WARDStockModel
                        //                                   where stock.StockId == stockId && stock.StoreId == storeId
                        //                                   select stock
                        //                          ).FirstOrDefault();
                        //    updatedStock.AvailableQuantity = (int)(Convert.ToDecimal(stkTransfer[i].AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                        //    wardSupplyDbContext.Entry(updatedStock).Property(a => a.AvailableQuantity).IsModified = true;
                        //    //transaction table
                        //    var selectedstockTxnItm = new WARDTransactionModel();
                        //    selectedstockTxnItm.WardId = updatedStock.WardId;
                        //    selectedstockTxnItm.ItemId = updatedStock.ItemId;
                        //    selectedstockTxnItm.StockId = updatedStock.StockId;
                        //    selectedstockTxnItm.StoreId = updatedStock.StoreId;
                        //    selectedstockTxnItm.TransactionId = 0;
                        //    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                        //    selectedstockTxnItm.TransactionType = "WardToPharmacy";
                        //    selectedstockTxnItm.Remarks = "Sent From Ward To Pharmacy";
                        //    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                        //    selectedstockTxnItm.CreatedOn = DateTime.Now;
                        //    selectedstockTxnItm.IsWard = true;
                        //    selectedstockTxnItm.ReceivedBy = ReceivedBy;
                        //    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                        //    wardSupplyDbContext.SaveChanges();

                        //    //pharmacy store stock changes
                        //    var StoreStockEntry = pharmacyDbContext.StockTransactions.Where(a => a.ItemId == itemId && a.ExpiryDate == expiryDate && a.BatchNo == batchNo).FirstOrDefault();

                        //    StoreStockEntry.InOut = "in";
                        //    StoreStockEntry.Quantity = Convert.ToDouble(stkTransfer[i].DispachedQuantity);
                        //    var SubStoreName = pharmacyDbContext.PHRMStore.Where(a => a.StoreId == storeId).Select(a => a.Name).FirstOrDefault();
                        //    StoreStockEntry.TransactionType = "ReturnFromSubstore";
                        //    StoreStockEntry.ReferenceNo = stkTransfer[i].StockId;
                        //    pharmacyDbContext.StockTransactions.Add(StoreStockEntry);
                        //    pharmacyDbContext.SaveChanges();

                        //}
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
            var currentDate = DateTime.Now;
            var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(stock => stock.ItemId == consumption.ItemId && stock.StoreId == consumption.StoreId && stock.AvailableQuantity > 0 && stock.IsActive == true).ToList();
            var totalConsumeQty = consumption.ConsumeQuantity;
            foreach (var stock in stockList)
            {
                if (stock.AvailableQuantity < totalConsumeQty)
                {
                    stock.DecreaseStock(
                        quantity: stock.AvailableQuantity,
                        transactionType: ENUM_INV_StockTransactionType.ConsumptionItem,
                        transactionDate: consumption.ConsumptionDate,
                        currentDate: currentDate,
                        referenceNo: consumption.ConsumptionId,
                        createdBy: currentUser.EmployeeId,
                        fiscalYearId: GetCurrentInvFiscalYear(db).FiscalYearId
                        );
                    totalConsumeQty -= stock.AvailableQuantity;
                    db.SaveChanges();
                }
                else
                {
                    stock.DecreaseStock(
                        quantity: totalConsumeQty,
                        transactionType: ENUM_INV_StockTransactionType.ConsumptionItem,
                        transactionDate: consumption.ConsumptionDate,
                        currentDate: currentDate,
                        referenceNo: consumption.ConsumptionId,
                        createdBy: currentUser.EmployeeId,
                        fiscalYearId: GetCurrentInvFiscalYear(db).FiscalYearId
                        );
                    totalConsumeQty = 0;
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
            var dispatchTxnTypes = new List<string>() { ENUM_INV_StockTransactionType.DispatchedItem, ENUM_INV_StockTransactionType.DispatchedItemReceivingSide };
            foreach (var dispatchedItem in dispatchItemsToUpdate)
            {
                //TODO: Find stock txns for each dispatched item
                var stockTxnList = await db.StockTransactions.Where(ST => ST.ReferenceNo == dispatchedItem.DispatchItemsId && dispatchTxnTypes.Contains(ST.TransactionType)).ToListAsync();
                foreach (var stkTxn in stockTxnList)
                {

                    var stock = await db.StoreStocks.FindAsync(stkTxn.StoreStockId);
                    if (stock.StoreId == dispatchedItem.SourceStoreId)
                    {
                        // Find source store stock and update the quantity.
                        stock.ConfirmStockDispatched(quantity: stkTxn.OutQty);
                    }
                    else
                    {
                        // Find target stock id and update the stock quantity
                        stock.ConfirmStockReceived(quantity: stkTxn.InQty);
                    }
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
