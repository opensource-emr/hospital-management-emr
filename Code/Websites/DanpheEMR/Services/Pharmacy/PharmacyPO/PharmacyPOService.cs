using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Pharmacy.PharmacyPO
{
    public class PharmacyPOService : IPharmacyPOService
    {
        #region DECLARATIONS
        private PharmacyDbContext db;
        private RbacDbContext _rbacDb;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public PharmacyPOService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);

        }
        #endregion

        #region METHODS

        public async Task<GetPharmacyPOEditVm> GetPurchaseOrderForEdit(int id)
        {
            var purchaseOrder = await (from PO in db.PHRMPurchaseOrder.Where(P => P.PurchaseOrderId == id)
                                       from S in db.PHRMSupplier.Where(S => S.SupplierId == PO.SupplierId).DefaultIfEmpty()
                                       select new GetPharmacyPOEditDTO
                                       {
                                           PurchaseOrderId = PO.PurchaseOrderId,
                                           PODate = PO.PODate,
                                           POStatus = PO.POStatus,
                                           SupplierId = S.SupplierId,
                                           SupplierName = S.SupplierName,
                                           TotalAmount = PO.TotalAmount,
                                           SubTotal = PO.SubTotal,
                                           VATAmount = PO.VATAmount,
                                           Remarks = PO.Remarks,
                                           CreatedOn = PO.CreatedOn,
                                           CreatedBy = PO.CreatedBy
                                       }).FirstOrDefaultAsync();

            purchaseOrder.PHRMPurchaseOrderItems = await (from POI in db.PHRMPurchaseOrderItems.Where(PI => PI.PurchaseOrderId == id)
                                                          from I in db.PHRMItemMaster.Where(I => I.ItemId == POI.ItemId)
                                                          select new GetPharmacyPOItemsDTO
                                                          {
                                                              PurchaseOrderItemId = POI.PurchaseOrderItemId,
                                                              ItemId = I.ItemId,
                                                              ItemName = I.ItemName,
                                                              Quantity = POI.Quantity,
                                                              StandaredPrice = POI.StandaredPrice,
                                                              PendingQuantity = POI.PendingQuantity,
                                                              VATAmount = POI.VATAmount,
                                                              TotalAmount = POI.TotalAmount,
                                                              DeliveryDays = POI.DeliveryDays,
                                                              POItemStatus = POI.POItemStatus,
                                                              IsCancel = POI.IsCancel,
                                                              CreatedOn = POI.CreatedOn,
                                                              CreatedBy = POI.CreatedBy,
                                                              AuthorizedBy = POI.AuthorizedBy,
                                                              AuthorizedOn = POI.AuthorizedOn
                                                          }).Where(a => a.IsCancel == false || a.IsCancel == null).ToListAsync();
            foreach (var item in purchaseOrder.PHRMPurchaseOrderItems)
            {
                var numerator = Convert.ToDouble(item.VATAmount * 100);
                var denominator = Convert.ToDouble(item.StandaredPrice) * item.Quantity;
                item.VatPercentage = (denominator == 0) ? 0 : numerator / denominator;
            }
            return new GetPharmacyPOEditVm { purchaseOrder = purchaseOrder };
        }

        public async Task<GetItemsForPOViewModel> GetAllAsync()
        {
            var itemList = await (from I in db.PHRMItemMaster.Where(I => I.IsActive == true)
                                  from U in db.PHRMUnitOfMeasurement.Where(U => U.UOMId == I.UOMId).DefaultIfEmpty()
                                  let GRI = db.PHRMGoodsReceiptItems.Where(GRI => I.ItemId == GRI.ItemId).OrderByDescending(GRI => GRI.GoodReceiptItemId).FirstOrDefault()
                                  select new GetItemForPODto
                                  {
                                      ItemId = I.ItemId,
                                      ItemName = I.ItemName,
                                      ItemCode = I.ItemCode,
                                      UOMName = (U != null) ? U.UOMName : "N/A",
                                      LastGRItemPrice = (GRI != null) ? GRI.GRItemPrice : 0,
                                      IsVATApplicable = I.IsVATApplicable,
                                      VATPercentage = I.PurchaseVATPercentage,
                                  }).ToListAsync();
            return new GetItemsForPOViewModel { ItemList = itemList };
        }

        public int UpdatePurchaseOrder(PHRMPurchaseOrderModel value, RbacUser currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var poId = value.PurchaseOrderId;
                    //update main purchse order table

                    value.PHRMPurchaseOrderItems = value.PHRMPurchaseOrderItems.Select(x =>
                    {
                        x.PurchaseOrderId = poId;
                        return x;
                    }).ToList();

                    var entity =  db.PHRMPurchaseOrder.Find(poId);

                    if (entity == null)
                    {
                        throw new Exception();
                    }
                    entity.SupplierId = value.SupplierId;
                    entity.PODate = value.PODate;
                    entity.POStatus = value.POStatus;
                    entity.TotalAmount = value.TotalAmount;
                    entity.VATAmount = value.VATAmount;
                    entity.SubTotal = value.SubTotal;
                    entity.DeliveryAddress = value.DeliveryAddress;
                    entity.Remarks = value.Remarks;
                    entity.CreatedBy = value.CreatedBy;
                    entity.CreatedOn = value.CreatedOn;
                    entity.ModifiedBy = currentUser.EmployeeId;
                    entity.ModifiedOn = currentDate;
                    entity.TermsId = value.TermsId;
                    entity.TermText = value.TermText;

                    // Find the poitemidlist to compare the cancelled items.
                    List<int> POItmIdList = db.PHRMPurchaseOrderItems.Where(a => a.PurchaseOrderId == poId).Select(a => a.PurchaseOrderItemId).ToList();

                    foreach (var item in value.PHRMPurchaseOrderItems)
                    {
                        if (item.PurchaseOrderItemId > 0)
                        {
                            var purchaseorderItem = db.PHRMPurchaseOrderItems.Find(item.PurchaseOrderItemId);
                            purchaseorderItem.ItemId = item.ItemId;
                            purchaseorderItem.PurchaseOrderId = item.PurchaseOrderId;
                            purchaseorderItem.Quantity = item.Quantity;
                            purchaseorderItem.StandaredPrice = item.StandaredPrice;
                            purchaseorderItem.ReceivedQuantity = item.ReceivedQuantity;
                            purchaseorderItem.PendingQuantity = item.PendingQuantity;
                            purchaseorderItem.SubTotal = item.SubTotal;
                            purchaseorderItem.TotalAmount = item.TotalAmount;
                            purchaseorderItem.VATAmount = item.VATAmount;
                            purchaseorderItem.DeliveryDays = item.DeliveryDays;
                            purchaseorderItem.AuthorizedRemark = item.AuthorizedRemark;
                            purchaseorderItem.Remarks = item.Remarks;
                            purchaseorderItem.POItemStatus = item.POItemStatus;
                            purchaseorderItem.AuthorizedBy = item.AuthorizedBy;
                            purchaseorderItem.AuthorizedOn = item.AuthorizedOn;
                            purchaseorderItem.CreatedBy = item.CreatedBy;
                            purchaseorderItem.CreatedOn = item.CreatedOn;
                            purchaseorderItem.IsCancel = item.IsCancel;
                            purchaseorderItem.ModifiedBy = currentUser.EmployeeId;
                            purchaseorderItem.ModifiedOn = currentDate;
                        }
                        else
                        {
                            var purchaseOrderItems = new PHRMPurchaseOrderItemsModel()
                            {
                                ItemId = item.ItemId,
                                PurchaseOrderId = poId,
                                Quantity = item.Quantity,
                                StandaredPrice = item.StandaredPrice,
                                ReceivedQuantity = item.ReceivedQuantity,
                                PendingQuantity = item.Quantity,
                                SubTotal = item.SubTotal,
                                TotalAmount = item.TotalAmount,
                                VATAmount = item.VATAmount,
                                DeliveryDays = item.DeliveryDays,
                                AuthorizedRemark = item.AuthorizedRemark,
                                Remarks = item.Remarks,
                                POItemStatus = "active",
                                AuthorizedBy = currentUser.EmployeeId,
                                AuthorizedOn = currentDate,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = currentDate,
                                IsCancel = item.IsCancel,
                                ModifiedBy = item.ModifiedBy,
                                ModifiedOn = item.ModifiedOn,
                            };

                            db.PHRMPurchaseOrderItems.Add(purchaseOrderItems);
                            db.SaveChanges();

                        }

                        //Find the itemIdlist that was Cancelled 
                        POItmIdList = POItmIdList.Where(a => a != item.PurchaseOrderItemId).ToList();
                    }
                    db.SaveChanges();

                    if (POItmIdList.Any())
                    {
                        foreach (int poitmid in POItmIdList)
                        {
                            var poitm = db.PHRMPurchaseOrderItems.Find(poitmid);
                            poitm.IsCancel = true;
                            poitm.POItemStatus = "cancelled";
                            poitm.ModifiedBy = currentUser.EmployeeId;
                            poitm.ModifiedOn = currentDate;
                        }
                        db.SaveChanges();
                    }

                    dbTransaction.Commit();
                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
            }
            return value.PurchaseOrderId;
        }

        #endregion



    }
}
