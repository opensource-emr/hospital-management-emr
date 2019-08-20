using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using System.Data.Entity;
using System.Configuration;
using Newtonsoft.Json;

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
                        a.WardId == stock.WardId).FirstOrDefault();

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
        
        public static Boolean StockTransfer(WARDStockModel stkTransferfromClient, WardSupplyDbContext wardSupplyDbContext , RbacUser currentUser)
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
                    selectedstockTxnItm.TransactionId = 0;
                    selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransferfromClient.DispachedQuantity));
                    selectedstockTxnItm.TransactionType = "WardtoWard";
                    selectedstockTxnItm.Remarks = stkTransferfromClient.Remarks;
                    selectedstockTxnItm.CreatedBy = currentUser.UserName;
                    selectedstockTxnItm.CreatedOn = DateTime.Now;
                    selectedstockTxnItm.IsWard = true;
                    wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                    wardSupplyDbContext.SaveChanges();

                    //add stock to new ward
                    stkTransferfromClient.WardId = stkTransferfromClient.newWardId;
                    stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                   where stock.WardId == stkTransferfromClient.WardId && stock.ItemId == stkTransferfromClient.ItemId && stock.BatchNo == stkTransferfromClient.BatchNo
                                   select stock
                                                 ).FirstOrDefault();
                    if(stockDetail != null)
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
                        stockTransaction.ReferenceNo = inventoryStock.GoodsReceiptItemId;
                        stockTransaction.CreatedBy = currentUser.EmployeeId;
                        stockTransaction.CreatedOn = DateTime.Now;
                        stockTransaction.TransactionType = "Sent From WardSupply";
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
        public static Boolean StockTransferToPharmacy (List<WARDStockModel> stkTransfer, WardSupplyDbContext wardSupplyDbContext , PharmacyDbContext pharmacyDbContext , RbacUser currentUser)
        {
            //Transaction Begins
            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    if(stkTransfer != null)
                    {
                        for(int i = 0; i < stkTransfer.Count; i++)
                        {
                            var stockId = stkTransfer[i].StockId;
                            WARDStockModel updatedStock = (from stock in wardSupplyDbContext.WARDStockModel
                                                          where stock.StockId == stockId
                                                           select stock
                                                  ).FirstOrDefault();
                            updatedStock.AvailableQuantity = (int)(Convert.ToDecimal(stkTransfer[i].AvailableQuantity)) - (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            wardSupplyDbContext.Entry(updatedStock).Property(a => a.AvailableQuantity).IsModified = true;
                            //transaction table
                            var selectedstockTxnItm = new WARDTransactionModel();
                            selectedstockTxnItm.WardId = updatedStock.WardId;
                            selectedstockTxnItm.ItemId = updatedStock.ItemId;
                            selectedstockTxnItm.StockId = updatedStock.StockId;
                            selectedstockTxnItm.TransactionId = 0;
                            selectedstockTxnItm.Quantity = (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            selectedstockTxnItm.TransactionType = "WardToPharmacy";
                            selectedstockTxnItm.Remarks = "Sent From Ward To Pharmacy";
                            selectedstockTxnItm.CreatedBy = currentUser.UserName;
                            selectedstockTxnItm.CreatedOn = DateTime.Now;
                            selectedstockTxnItm.IsWard = true;
                            wardSupplyDbContext.TransactionModel.Add(selectedstockTxnItm);
                            wardSupplyDbContext.SaveChanges();
                            //pharmacy stock changes
                            var itemId = stkTransfer[i].ItemId;
                            var batchNo = stkTransfer[i].BatchNo;
                            PHRMStockModel updatedPharmacyStock = (from stock in pharmacyDbContext.PHRMStock
                                                           where stock.ItemId == itemId && stock.BatchNo == batchNo
                                                                   select stock
                                                  ).FirstOrDefault();
                            updatedPharmacyStock.AvailableQuantity = (int)(Convert.ToDecimal(updatedPharmacyStock.AvailableQuantity)) + (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            pharmacyDbContext.Entry(updatedPharmacyStock).Property(a => a.AvailableQuantity).IsModified = true;
                            //Pharmacy Transaction Table
                            var phrmStockTxn = new PHRMStockTransactionItemsModel();
                            phrmStockTxn.ItemId = updatedPharmacyStock.ItemId;
                            phrmStockTxn.BatchNo = updatedPharmacyStock.BatchNo;
                            phrmStockTxn.ExpiryDate = stkTransfer[i].ExpiryDate;
                            phrmStockTxn.Quantity = (int)(Convert.ToDecimal(stkTransfer[i].DispachedQuantity));
                            phrmStockTxn.FreeQuantity = 0;
                            phrmStockTxn.Price = (int)(Convert.ToDecimal(stkTransfer[i].MRP));
                            phrmStockTxn.DiscountPercentage = 0;
                            phrmStockTxn.VATPercentage = 0;
                            phrmStockTxn.SubTotal = (int)(Convert.ToDecimal(phrmStockTxn.Quantity)) * (int)(Convert.ToDecimal(phrmStockTxn.Price));
                            phrmStockTxn.TotalAmount = phrmStockTxn.SubTotal;
                            phrmStockTxn.InOut = "in";
                            phrmStockTxn.CreatedBy = currentUser.UserId;
                            phrmStockTxn.CreatedOn = DateTime.Now;
                            phrmStockTxn.MRP = phrmStockTxn.Price;
                            phrmStockTxn.TransactionType = "WardToPharmacy";
                            pharmacyDbContext.PHRMStockTransactionModel.Add(phrmStockTxn);
                            pharmacyDbContext.SaveChanges();
                        }
                    }
                    dbContextTransaction.Commit();
                    return true;
                }
                catch(Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
    }
}
