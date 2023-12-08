using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.ServerModel.LabModels;
using DanpheEMR.Services.Verification;
using DanpheEMR.ViewModel.Substore;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class WardSupplyBL
    {
        protected readonly string connString = null;
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
                            SalePrice = (Math.Round(n.SalePrice, 2)),
                            n.BatchNo,
                            n.ExpiryDate
                        })
                        .Where(a =>
                        a.BatchNo == stock.BatchNo &&
                        a.ItemId == stock.ItemId &&
                        a.SalePrice == (Math.Round(stock.SalePrice, 2)) &&
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
            int dispatchId = (from D in wardSupplyDbContext.PHRMSubStoreDispatchItems
                              select D.DispatchId).DefaultIfEmpty(0).Max() ?? 0;
            dispatchId++;

            var mainStoreId = pharmacyDbContext.PHRMStore.Where(s => s.SubCategory == ENUM_StoreSubCategory.Pharmacy).Select(s => s.StoreId).FirstOrDefault();
            //Transaction Begins
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (stkTransfer != null)
                        foreach (var newTransferedStock in stkTransfer)
                        {
                            var newDispatchItem = new PHRMDispatchItemsModel()
                            {
                                ItemId = newTransferedStock.ItemId,
                                SourceStoreId = newTransferedStock.StoreId,
                                TargetStoreId = mainStoreId,
                                DispatchId = dispatchId,
                                CostPrice = newTransferedStock.CostPrice,
                                SalePrice = (decimal)newTransferedStock.SalePrice,
                                BatchNo = newTransferedStock.BatchNo,
                                DispatchedQuantity = (double)newTransferedStock.DispachedQuantity,
                                DispatchedDate = DateTime.Now,
                                ExpiryDate = newTransferedStock.ExpiryDate,
                                ItemRemarks = newTransferedStock.Remarks,
                                Remarks = newTransferedStock.Remarks,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now,

                            };
                            wardSupplyDbContext.PHRMSubStoreDispatchItems.Add(newDispatchItem);
                            wardSupplyDbContext.SaveChanges();

                            var currentSubStoreStockList = wardSupplyDbContext.StoreStock.Include(a => a.StockMaster).Where(s => s.ItemId == newTransferedStock.ItemId && s.StoreId == newTransferedStock.StoreId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == newTransferedStock.BatchNo && s.StockMaster.ExpiryDate == newTransferedStock.ExpiryDate && s.IsActive == true).ToList();

                            if (currentSubStoreStockList == null) throw new InvalidOperationException($"Stock is not available for ItemId = {newTransferedStock.ItemId}, BatchNo ={newTransferedStock.BatchNo}");

                            if (currentSubStoreStockList.Sum(s => s.AvailableQuantity) < newTransferedStock.DispachedQuantity) throw new InvalidOperationException($"Stock is not available for ItemId = {newTransferedStock.ItemId}, BatchNo ={newTransferedStock.BatchNo}");

                            double remainingQty = newTransferedStock.DispachedQuantity ?? 0;

                            foreach (var substoreStock in currentSubStoreStockList)
                            {
                                var subStoreStockTxn = new PHRMStockTransactionModel(
                                    storeStock: substoreStock,
                                    transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                    transactionDate: DateTime.Now,
                                    referenceNo: newDispatchItem.DispatchItemsId,
                                    createdBy: currentUser.EmployeeId,
                                    createdOn: DateTime.Now,
                                    fiscalYearId: WardSupplyBL.GetFiscalYear(wardSupplyDbContext)
                                    );

                                //Find stock in Main Stocks
                                var mainStoreStock = wardSupplyDbContext.StoreStock.Include(s => s.StockMaster).FirstOrDefault(s => s.StockId == substoreStock.StockId && s.StoreId == newDispatchItem.TargetStoreId);

                                if (mainStoreStock == null)
                                {
                                    mainStoreStock = new PHRMStoreStockModel(stockMaster: substoreStock.StockMaster, storeId: mainStoreId, quantity: 0, costPrice: substoreStock.StockMaster.CostPrice, salePrice: substoreStock.StockMaster.SalePrice);

                                    wardSupplyDbContext.StoreStock.Add(mainStoreStock);
                                    wardSupplyDbContext.SaveChanges();
                                }

                                var mainStoreStockTxn = new PHRMStockTransactionModel(
                                    storeStock: mainStoreStock,
                                    transactionType: ENUM_PHRM_StockTransactionType.TransferItem,
                                    transactionDate: DateTime.Now,
                                    referenceNo: newDispatchItem.DispatchItemsId,
                                    createdBy: currentUser.EmployeeId,
                                    createdOn: DateTime.Now,
                                    fiscalYearId: WardSupplyBL.GetFiscalYear(wardSupplyDbContext)
                                    );

                                if (substoreStock.AvailableQuantity < remainingQty)
                                {
                                    remainingQty -= substoreStock.AvailableQuantity;

                                    mainStoreStock.IncreaseUnconfirmedQty(inQty: substoreStock.AvailableQuantity, outQty: 0);
                                    mainStoreStockTxn.SetInOutQuantity(inQty: substoreStock.AvailableQuantity, outQty: 0);

                                    subStoreStockTxn.SetInOutQuantity(inQty: 0, outQty: substoreStock.AvailableQuantity);
                                    substoreStock.IncreaseUnconfirmedQty(inQty: 0, outQty: substoreStock.AvailableQuantity);
                                    substoreStock.UpdateAvailableQuantity(newQty: 0);
                                }
                                else
                                {
                                    substoreStock.UpdateAvailableQuantity(newQty: (substoreStock.AvailableQuantity - remainingQty));
                                    substoreStock.IncreaseUnconfirmedQty(inQty: 0, outQty: remainingQty);
                                    subStoreStockTxn.SetInOutQuantity(inQty: 0, outQty: remainingQty);

                                    mainStoreStock.IncreaseUnconfirmedQty(inQty: remainingQty, outQty: 0);
                                    mainStoreStockTxn.SetInOutQuantity(inQty: remainingQty, outQty: 0);
                                    remainingQty = 0;
                                }
                                wardSupplyDbContext.PHRMStockTransactions.Add(mainStoreStockTxn);
                                wardSupplyDbContext.PHRMStockTransactions.Add(subStoreStockTxn);
                                wardSupplyDbContext.SaveChanges();

                                if (remainingQty == 0)
                                {
                                    break; //it takes out of the foreach loop. 
                                }
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
            var currentDate = DateTime.Now;
            var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(stock => stock.ItemId == consumption.ItemId && stock.StoreId == consumption.StoreId && stock.AvailableQuantity > 0 && stock.IsActive == true).ToList();
            var totalConsumeQty = consumption.ConsumeQuantity;
            foreach (var stock in stockList)
            {
                if (stock.AvailableQuantity < totalConsumeQty)
                {
                    var consumeQty = stock.AvailableQuantity;
                    stock.DecreaseStock(
                        quantity: stock.AvailableQuantity,
                        transactionType: ENUM_INV_StockTransactionType.ConsumptionItem,
                        transactionDate: consumption.ConsumptionDate,
                        currentDate: currentDate,
                        referenceNo: consumption.ConsumptionId,
                        createdBy: currentUser.EmployeeId,
                        fiscalYearId: GetCurrentInvFiscalYear(db).FiscalYearId,
                        needConfirmation: false
                        );
                    totalConsumeQty -= consumeQty;
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
                        fiscalYearId: GetCurrentInvFiscalYear(db).FiscalYearId,
                        needConfirmation: false

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

        public async static Task<int> ReceiveDispatchedStocks(int DispatchId, InventoryDbContext db, RbacUser currentUser, string receivedRemarks)
        {
            // check if receive feature is enabled, to decide whether to increase in stock or increase unconfirmed quantity
            var isReceiveFeatureEnabled = db.CfgParameters
                                            .Where(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "EnableReceivedItemInSubstore")
                                            .Select(param => param.ParameterValue == "true" ? true : false)
                                            .FirstOrDefault();

            var DispatchDetails = await db.Dispatch.Include(d => d.DispatchItems).Where(itm => itm.DispatchId == DispatchId).FirstOrDefaultAsync();

            if (DispatchDetails == null)
            {
                throw new Exception("Dispatch Detail Not Found");
            }
            if (DispatchDetails.DispatchItems == null || DispatchDetails.DispatchItems.Count == 0)
            {
                throw new Exception("Items Not Found.");
            };
            var RequisitionDetails = db.Requisitions.FirstOrDefault(a => a.RequisitionId == DispatchDetails.RequisitionId);

            var dispatchTxnTypes = new List<string>() { ENUM_INV_StockTransactionType.DispatchedItem, ENUM_INV_StockTransactionType.DispatchedItemReceivingSide };

            foreach (var dispatchedItem in DispatchDetails.DispatchItems)
            {
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
                dispatchedItem.ReceivedById = currentUser.EmployeeId;
                dispatchedItem.ReceivedOn = DateTime.Now;
                dispatchedItem.ReceivedRemarks = receivedRemarks;
                db.Entry(dispatchedItem).Property(a => a.ReceivedById).IsModified = true;
                db.Entry(dispatchedItem).Property(a => a.ReceivedOn).IsModified = true;
                db.Entry(dispatchedItem).Property(a => a.ReceivedRemarks).IsModified = true;


                if (isReceiveFeatureEnabled)
                {
                    RequisitionDetails.EnableReceiveFeature = false;
                    db.Entry(RequisitionDetails).Property(a => a.EnableReceiveFeature).IsModified = true;
                }

            }
            DispatchDetails.ReceivedBy = currentUser.EmployeeId;
            DispatchDetails.ReceivedOn = DateTime.Now;
            DispatchDetails.ReceivedRemarks = receivedRemarks;
            db.Entry(DispatchDetails).Property(a => a.ReceivedBy).IsModified = true;
            db.Entry(DispatchDetails).Property(a => a.ReceivedOn).IsModified = true;
            db.Entry(DispatchDetails).Property(a => a.ReceivedRemarks).IsModified = true;

            await db.SaveChangesAsync();
            UpdateReceivedQuantityInRequisitionItems(DispatchId, db);
            return DispatchId;
        }

        private static void UpdateReceivedQuantityInRequisitionItems(int DispatchId, InventoryDbContext db)
        {
            var modifiedRequisitionItems = new List<RequisitionItemsModel>(); // to Collect modified items
            var dispatchItems = db.DispatchItems.Where(d => d.DispatchId == DispatchId).ToList();
            if (dispatchItems != null)
            {
                dispatchItems.ForEach(d =>
                {
                    var requisitionItem = db.RequisitionItems.Where(r => r.RequisitionId == d.RequisitionId && r.RequisitionItemId == d.RequisitionItemId).FirstOrDefault();
                    requisitionItem.ReceivedQuantity = (requisitionItem.ReceivedQuantity + d.DispatchedQuantity) ?? 0;
                    modifiedRequisitionItems.Add(requisitionItem); // Collect modified item
                });
            }
            // Perform a bulk update for all modified requisitionItem entities
            foreach (var requisitionItem in modifiedRequisitionItems)
            {
                db.Entry(requisitionItem).State = EntityState.Modified;
            }
            db.SaveChanges();
        }


        public static string UpdateReconciledStockFromExcel(List<SubstoreStockViewModel> stockList, RbacUser currentUser, WardSupplyDbContext wardDbContext)
        {
            var stockTransaction = new StockTransactionModel();
            var currentDate = DateTime.Now;
            SubstoreStockViewModel strstk = new SubstoreStockViewModel();
            using (var db = wardDbContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var stock in stockList)
                    {
                        double diffQty = stock.NewAvailableQuantity - stock.AvailableQuantity;
                        var stocks = wardDbContext.StoreStocks.Include(s => s.StockMaster)
                                        .FirstOrDefault(x => x.StockId == stock.StockId && x.ItemId == stock.ItemId && x.StoreId == stock.SubStoreId);
                        if (stocks != null)
                        {
                            if (diffQty == 0)
                            {
                                continue;
                            }
                            else if (diffQty > 0)
                            {
                                stocks.AddStock(
                                        quantity: diffQty,
                                        transactionType: ENUM_INV_StockTransactionType.StockManageItem,
                                        transactionDate: currentDate,
                                        currentDate: currentDate,
                                        referenceNo: null,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: GetCurrentInvFiscalYear(wardDbContext).FiscalYearId,
                                        needConfirmation: false
                                        );
                            }
                            else if (diffQty < 0)
                            {
                                stocks.DecreaseStock(
                                        quantity: Math.Abs(diffQty),
                                        transactionType: ENUM_INV_StockTransactionType.StockManageItem,
                                        transactionDate: currentDate,
                                        currentDate: currentDate,
                                        referenceNo: null,
                                        createdBy: currentUser.EmployeeId,
                                        fiscalYearId: GetCurrentInvFiscalYear(wardDbContext).FiscalYearId,
                                        needConfirmation: false
                                        );
                            }
                        }
                    }
                    wardDbContext.SaveChanges();
                    db.Commit();
                }
                catch (Exception ex)
                {
                    db.Rollback();
                    throw ex;
                }
            }
            return null;
        }

        public static int PostPhrmSubStoreRequisition(PHRMStoreRequisitionModel RequisitionFromClient, WardSupplyDbContext wardSupplyDbContext)
        {
            List<PHRMStoreRequisitionItemsModel> requisitionItems = new List<PHRMStoreRequisitionItemsModel>();
            PHRMStoreRequisitionModel requisition = new PHRMStoreRequisitionModel();
            requisitionItems = RequisitionFromClient.RequisitionItems;
            RequisitionFromClient.RequisitionItems = null;

            requisition = RequisitionFromClient;
            requisition.FiscalYearId = GetFiscalYear(wardSupplyDbContext);
            requisition.RequisitionNo = GetCurrentFiscalYearRequisitionNo(wardSupplyDbContext, requisition.FiscalYearId);
            if (requisition.VerifierIds != "[]")
            {
                requisition.RequisitionStatus = ENUM_PharmacyRequisitionStatus.Pending;
            }
            else
            {
                requisition.RequisitionStatus = ENUM_PharmacyRequisitionStatus.Active;
                requisition.VerifierIds = null;
            }

            wardSupplyDbContext.PHRMSubStoreRequisitions.Add(requisition);
            wardSupplyDbContext.SaveChanges();

            requisitionItems.ForEach(item =>
            {
                item.RequisitionId = requisition.RequisitionId;
                item.AuthorizedOn = DateTime.Now;
                item.PendingQuantity = (double)item.Quantity;
            });
            wardSupplyDbContext.PHRMSubStoreRequisitionItems.AddRange(requisitionItems);
            wardSupplyDbContext.SaveChanges();
            return requisition.RequisitionId;
        }
        //get the Requisition No according to current fiscal year.
        public static int GetCurrentFiscalYearRequisitionNo(WardSupplyDbContext dB, int fiscalYearId)
        {
            int requisitionNo = (from req in dB.PHRMSubStoreRequisitions
                                 where req.FiscalYearId == fiscalYearId
                                 select req.RequisitionNo).DefaultIfEmpty(0).Max();
            return requisitionNo + 1;
        }
        public static int GetFiscalYear(WardSupplyDbContext wardSupplyDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return wardSupplyDbContext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).Select(f => f.FiscalYearId).FirstOrDefault();
        }

        #region SubStore Verification Methods
        public static List<Verifier_DTO> GetVerifiers(RbacDbContext db)
        {
            var VerifiersList = db.Roles
                                    .Where(R => R.IsActive == true)
                                    .Select(R => new Verifier_DTO
                                    {
                                        Id = R.RoleId,
                                        Name = R.RoleName,
                                        Type = "role"
                                    }).ToList();
            VerifiersList.AddRange(db.Users.Where(U => U.IsActive == true)
                                    .Join(db.Employees, u => u.EmployeeId, e => e.EmployeeId,
                                    (u, e) => new { u, e })
                                    .Select(U => new Verifier_DTO
                                    {
                                        Id = U.u.UserId,
                                        Name = U.e.FullName,
                                        Type = "user"
                                    }).ToList());
            return VerifiersList;

        }
        #endregion

    }
}
