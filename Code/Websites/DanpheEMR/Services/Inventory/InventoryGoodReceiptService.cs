using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using DanpheEMR.Controllers;

namespace DanpheEMR.Services
{
    public class InventoryGoodReceiptService : IInventoryGoodReceiptService
    {
        public InventoryDbContext db;
        private readonly string connString = null;

        public InventoryGoodReceiptService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);
        }

        public List<GoodsReceiptModel> ListGoodsReceipt()
        {
            try
            {
                var query = db.GoodsReceipts.ToList();
                return query;
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        }

        public GoodsReceiptModel AddGoodsReceipt(GoodsReceiptModel model)
        {
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    model.GoodsReceiptItem.ForEach(item =>
                    {
                        item.CreatedOn = DateTime.Now;  //Assign Today's date as CreatedOn
                        item.CreatedBy = model.CreatedBy;
                        item.GRItemDate = model.GoodsReceiptDate;

                    });
                    model.CreatedOn = DateTime.Now;
                    //GoodsReceiptNo max+1 increment logic with fiscal year.
                    model.FiscalYearId = InventoryBL.GetFiscalYear(db, model.GoodsReceiptDate).FiscalYearId;
                    model.GoodsReceiptNo = InventoryBL.GetGoodReceiptNo(db, model.FiscalYearId);
                    //check if verification enabled
                    model.VerifierIds = (model.IsVerificationEnabled) ? InventoryBL.SerializeProcurementVerifiers(model.VerifierList) : "";
                    db.GoodsReceipts.Add(model);
                    //Save Goods Receipt to DB
                    db.SaveChanges();

                    //If GR generated then save items in  Stock table
                    int SavedGoodsReceiptId = model.GoodsReceiptID;
                    if (SavedGoodsReceiptId > 0)
                    {
                        var CheckForPOCompletion = true;
                        model.GoodsReceiptItem.ForEach(item =>
                        {

                            if (model.IsVerificationEnabled == false)
                                AddtoInventoryStock(item);
                            //for purchase order item
                            if (model.PurchaseOrderId != null)
                            {
                                var purchaseOrderItem = db.PurchaseOrderItems.Where(a => a.PurchaseOrderId == model.PurchaseOrderId && a.ItemId == item.ItemId).Select(a => a).FirstOrDefault();
                                purchaseOrderItem.ReceivedQuantity += item.ReceivedQuantity;
                                purchaseOrderItem.PendingQuantity = purchaseOrderItem.Quantity - purchaseOrderItem.ReceivedQuantity;
                                if (purchaseOrderItem.PendingQuantity <= 0)
                                {
                                    purchaseOrderItem.POItemStatus = "complete";
                                    purchaseOrderItem.PendingQuantity = 0;
                                }
                                else //if the item is received but ordered qunatity is not fulfilled , item status must be partial.
                                {
                                    if (purchaseOrderItem.ReceivedQuantity > 0)
                                    {
                                        purchaseOrderItem.POItemStatus = "partial";
                                    }
                                    CheckForPOCompletion = false;
                                }
                                db.PurchaseOrderItems.Attach(purchaseOrderItem);
                                db.Entry(purchaseOrderItem).State = EntityState.Modified;
                                db.Entry(purchaseOrderItem).Property(x => x.ReceivedQuantity).IsModified = true;
                                db.Entry(purchaseOrderItem).Property(x => x.PendingQuantity).IsModified = true;
                                db.Entry(purchaseOrderItem).Property(x => x.POItemStatus).IsModified = true;
                            }
                        });
                        //Save => Stock Items in stock table
                        db.SaveChanges();
                        if (CheckForPOCompletion)
                        {
                            PurchaseOrderModel poitems = db.PurchaseOrders.Where(a => a.PurchaseOrderId == model.PurchaseOrderId).FirstOrDefault();
                            if (poitems != null)
                            {
                                poitems.POStatus = "complete";
                                db.Entry(poitems).State = EntityState.Modified;
                                db.SaveChanges();
                            }
                        }
                        else //status must be partial if the ordered quantity is not fulfilled.
                        {
                            PurchaseOrderModel poitems = db.PurchaseOrders.Where(a => a.PurchaseOrderId == model.PurchaseOrderId).FirstOrDefault();
                            if (poitems != null)
                            {
                                poitems.POStatus = "partial";
                                db.Entry(poitems).State = EntityState.Modified;
                                db.SaveChanges();
                            }
                        }
                    }
                    transaction.Commit();
                }
                catch (Exception Ex)
                {
                    transaction.Rollback();
                    throw Ex;
                }
            }
            return model;
        }

        public bool AddtoInventoryStock(GoodsReceiptItemsModel item)
        {
            try
            {
                StockModel stockItem = new StockModel();
                stockItem.GoodsReceiptItemId = item.GoodsReceiptItemId;
                stockItem.ItemId = item.ItemId;
                stockItem.BatchNO = item.BatchNO;
                stockItem.ExpiryDate = item.ExpiryDate;
                stockItem.ReceivedQuantity = item.ReceivedQuantity + item.FreeQuantity;
                stockItem.AvailableQuantity = item.ReceivedQuantity + item.FreeQuantity;
                stockItem.TransactionDate = item.GRItemDate;
                stockItem.CreatedBy = item.CreatedBy;
                stockItem.CreatedOn = item.CreatedOn;
                stockItem.MRP = item.MRP;
                stockItem.Price = item.TotalAmount / Convert.ToDecimal(item.ReceivedQuantity + item.FreeQuantity);
                db.Stock.Add(stockItem);
                db.SaveChanges();
                var StockTxn = new StockTransactionModel();
                StockTxn.StockId = stockItem.StockId;
                StockTxn.Quantity = stockItem.ReceivedQuantity;
                StockTxn.InOut = "in";
                StockTxn.ReferenceNo = item.GoodsReceiptItemId;
                StockTxn.CreatedBy = item.CreatedBy;
                StockTxn.CreatedOn = item.CreatedOn;
                StockTxn.TransactionDate = item.GRItemDate;
                StockTxn.TransactionType = "goodreceipt-items";
                StockTxn.IsTransferredToACC = null;
                StockTxn.ItemId = stockItem.ItemId;
                StockTxn.MRP = stockItem.MRP;
                StockTxn.Price = stockItem.Price;
                StockTxn.FiscalYearId = InventoryBL.GetFiscalYear(db).FiscalYearId;
                StockTxn.IsActive = true;
                StockTxn.GoodsReceiptItemId = stockItem.GoodsReceiptItemId;
                db.StockTransactions.Add(StockTxn);
                db.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public GoodsReceiptModel GetGoodsReceipt(int id)
        {
            try
            {
                var result = db.GoodsReceipts.Where(x => x.GoodsReceiptID == id).FirstOrDefault();
                return result;
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        }

        public List<VendorMasterModel> GetVendorList()
        {
            try
            {
                var query = db.Vendors.ToList();
                return query;
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        }

        public PurchaseOrderModel AddPOAndPOItemsByGRId(GoodsReceiptModel model)
        {
            using (var transaction = db.Database.BeginTransaction())
            {
                PurchaseOrderModel po = new PurchaseOrderModel();
                try
                {
                    po.VendorId = model.VendorId;
                    po.PoDate = DateTime.Now;
                    po.POStatus = "complete";
                    po.SubTotal = model.SubTotal;
                    po.TotalAmount = model.TotalAmount;
                    po.VAT = model.VATTotal;
                    po.CreatedBy = model.CreatedBy.Value;
                    po.CreatedOn = DateTime.Now;
                    po.PurchaseOrderItems = new List<PurchaseOrderItemsModel>();
                    model.GoodsReceiptItem.ForEach(grItm =>
                    {
                        PurchaseOrderItemsModel poItem = new PurchaseOrderItemsModel();
                        poItem.ItemId = grItm.ItemId;
                        poItem.Quantity = grItm.ReceivedQuantity;
                        poItem.PurchaseOrderId = po.PurchaseOrderId;
                        poItem.StandardRate = grItm.ItemRate;
                        poItem.TotalAmount = grItm.TotalAmount;
                        poItem.ReceivedQuantity = grItm.ReceivedQuantity;
                        poItem.PendingQuantity = 0;
                        poItem.DeliveryDays = 0;
                        poItem.AuthorizedBy = po.CreatedBy;
                        poItem.AuthorizedOn = DateTime.Now;
                        poItem.AuthorizedRemark = "this is auto po creating on gr creation time";
                        poItem.CreatedBy = po.CreatedBy;
                        poItem.CreatedOn = DateTime.Now;
                        poItem.POItemStatus = "complete";
                        po.PurchaseOrderItems.Add(poItem);
                    });
                    db.PurchaseOrders.Add(po);
                    db.SaveChanges();
                    transaction.Commit();
                }
                catch (Exception Ex)
                {
                    transaction.Rollback();
                    throw Ex;
                }
                return po;
            }
        }
        public int UpdateGoodsReceipt(GoodsReceiptModel GoodsReceipt)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    GoodsReceipt.FiscalYearId = InventoryBL.GetFiscalYear(db, GoodsReceipt.GoodsReceiptDate).FiscalYearId;
                    db.GoodsReceipts.Attach(GoodsReceipt);
                    db.Entry(GoodsReceipt).State = EntityState.Modified;
                    db.Entry(GoodsReceipt).Property(x => x.GoodsReceiptDate).IsModified = true;
                    db.Entry(GoodsReceipt).Property(x => x.FiscalYearId).IsModified = true;
                    db.Entry(GoodsReceipt).Property(x => x.VendorId).IsModified = true;
                    db.Entry(GoodsReceipt).Property(x => x.BillNo).IsModified = true;
                    db.Entry(GoodsReceipt).Property(x => x.CreatedBy).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.CreatedOn).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.IsVerificationEnabled).IsModified = false;
                    db.SaveChanges();
                    var GRItems = db.GoodsReceiptItems.Where(gri => gri.GoodsReceiptId == GoodsReceipt.GoodsReceiptID).ToList();
                    GRItems.ForEach(itm =>
                    {
                        itm.GRItemDate = GoodsReceipt.GoodsReceiptDate;
                        //for INV_TXN_STOCK Table and INV_TXN_STOCKTRANSACTION
                        var stk = db.Stock.FirstOrDefault(a => a.GoodsReceiptItemId == itm.GoodsReceiptItemId);
                        if (stk != null)
                        {
                            stk.TransactionDate = itm.GRItemDate;
                        }
                        var stkTxn = db.StockTransactions.FirstOrDefault(a => a.GoodsReceiptItemId == itm.GoodsReceiptItemId && a.TransactionType == "goodreceipt-items");
                        if (stkTxn != null)
                        {
                            stkTxn.TransactionDate = itm.GRItemDate;
                        }
                        db.SaveChanges();
                        //    var stktxn = new StockTransactionModel();
                        //    var OldReceivedQuantity = stk.ReceivedQuantity;
                        //    stk.ReceivedQuantity = itm.ReceivedQuantity + itm.FreeQuantity;
                        //    stk.ReceiptDate = GoodsReceipt.GoodsReceiptDate;
                        //    stk.BatchNO = itm.BatchNO;
                        //    stk.ExpiryDate = itm.ExpiryDate;
                        //    stk.ItemId = itm.ItemId;
                        //    //for stk txn
                        //    stktxn.StockId = stk.StockId;
                        //    stktxn.ReferenceNo = itm.GoodsReceiptId;
                        //    stktxn.CreatedBy = itm.ModifiedBy;
                        //    stktxn.CreatedOn = DateTime.Now;
                        //    stktxn.TransactionType = "edit-gr";
                        //    stktxn.IsTransferredToACC = null;
                        //    if (stk.ReceivedQuantity > OldReceivedQuantity)
                        //    {
                        //        stk.AvailableQuantity += (stk.ReceivedQuantity - OldReceivedQuantity);
                        //        //for stock txn
                        //        stktxn.InOut = "in";
                        //        stktxn.Quantity = stk.ReceivedQuantity - OldReceivedQuantity;
                        //    }
                        //    else if (stk.ReceivedQuantity < OldReceivedQuantity)
                        //    {
                        //        stk.AvailableQuantity -= (OldReceivedQuantity - stk.ReceivedQuantity);
                        //        if (stk.AvailableQuantity < 0)
                        //        {
                        //            Exception ex = new Exception("Current Available Quantity is " + stk.AvailableQuantity + ".It can not be less than 0.");
                        //            throw ex;
                        //        }
                        //        //for stock txn
                        //        stktxn.InOut = "out";
                        //        stktxn.Quantity = OldReceivedQuantity - stk.ReceivedQuantity;
                        //    }
                        //    db.Stock.Attach(stk);
                        //    db.Entry(stk).State = EntityState.Modified;
                        //    db.Entry(stk).Property(x => x.GoodsReceiptItemId).IsModified = false;
                        //    db.Entry(stk).Property(x => x.CreatedBy).IsModified = false;
                        //    db.Entry(stk).Property(x => x.CreatedOn).IsModified = false;
                        //    db.SaveChanges();
                        //    db.StockTransactions.Add(stktxn);
                        //    db.SaveChanges();
                    });
                    dbTransaction.Commit();
                    return GoodsReceipt.GoodsReceiptID;
                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
            }

        }
    }
}
