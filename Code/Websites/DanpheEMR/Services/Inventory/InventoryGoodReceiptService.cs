using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel;
using System.Data.Entity;

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
                        
                    });
                    model.CreatedOn = DateTime.Now;
                    
                    db.GoodsReceipts.Add(model);
                 

                        //Save Goods Receipt to DB
                        
                        db.SaveChanges();

                    StockModel stockItem = new StockModel();
                    //If GR generated then save items in  Stock table
                    int SavedGoodsReceiptId = model.GoodsReceiptID;
                    if (SavedGoodsReceiptId > 0)
                    {
                        model.GoodsReceiptItem.ForEach(item =>
                        {
                            stockItem = new StockModel();
                            stockItem.GoodsReceiptItemId = item.GoodsReceiptItemId;
                            stockItem.ItemId = item.ItemId;
                            stockItem.BatchNO = item.BatchNO;
                            stockItem.ExpiryDate = item.ExpiryDate;
                            stockItem.ReceivedQuantity = item.ReceivedQuantity + item.FreeQuantity;
                            stockItem.AvailableQuantity = item.ReceivedQuantity + item.FreeQuantity;
                            stockItem.ReceiptDate = model.GoodsReceiptDate;
                            stockItem.CreatedBy = item.CreatedBy;
                            stockItem.CreatedOn = item.CreatedOn;
                            db.Stock.Add(stockItem);
                        });
                        //Save => Stock Items in stock table
                        db.SaveChanges();

                        PurchaseOrderModel poitems = db.PurchaseOrders.Where(a => a.PurchaseOrderId == model.PurchaseOrderId).FirstOrDefault();
                        if (poitems != null)
                        {
                            poitems.POStatus = "complete";
                            db.Entry(poitems).State = EntityState.Modified;
                            db.SaveChanges();
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
            catch(Exception Ex)
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
                    db.GoodsReceipts.Attach(GoodsReceipt);
                    db.Entry(GoodsReceipt).State = EntityState.Modified;
                    db.Entry(GoodsReceipt).Property(x => x.CreatedOn).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.CreatedBy).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.GoodsReceiptDate).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.VendorId).IsModified = false;
                    db.Entry(GoodsReceipt).Property(x => x.BillNo).IsModified = false;
                    db.SaveChanges();
                    GoodsReceipt.GoodsReceiptItem.ForEach(itm =>
                    {
                        db.GoodsReceiptItems.Attach(itm);
                        db.Entry(itm).State = EntityState.Modified;
                        db.Entry(itm).Property(x => x.GoodsReceiptId).IsModified = false;
                        db.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                        db.Entry(itm).Property(x => x.CreatedBy).IsModified = false;
                        db.SaveChanges();
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
