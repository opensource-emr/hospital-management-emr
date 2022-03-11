using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryReportModel;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace DanpheEMR.Controllers
{
    public class VerificationBL
    {
        private static string VerificationStatus { get; set; } //sanjit: 14 April: This property is created in order to retrieve the verification status for a the level in which the verification is already done.
        public static List<RequisitionModel> GetInventoryRequisitionListBasedOnUser(DateTime FromDate, DateTime ToDate, InventoryDbContext inventoryDb, RbacDbContext rbacDb, RbacUser user)
        {
            try
            {
                var realToDate = ToDate.AddDays(1);
                //Step 1: Take all the active requisition in memory.
                var requisitionList = inventoryDb.Requisitions.Where(req => req.RequisitionDate > FromDate && req.RequisitionDate < realToDate && req.RequisitionStatus != "withdrawn").OrderByDescending(req => req.RequisitionId).ToList();
                foreach (var req in requisitionList)
                {
                    SetDataForInventoryRequisition(inventoryDb, rbacDb, req);
                }
                //Step 3: filter the requisition List based on Permission Id.
                requisitionList = FilterRequisitionListByUserPermission(user, requisitionList);
                CheckForVerificationPermission(inventoryDb, rbacDb, user, requisitionList);
                return requisitionList;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        private static void CheckForVerificationPermission(InventoryDbContext inventoryDb, RbacDbContext rbacDb, RbacUser user, List<RequisitionModel> requisitionList)
        {
            requisitionList.ForEach(req =>
            {
                req.isVerificationAllowed = false;
                req.VerificationStatus = "pending";
                // Verification should not be allowed in the level in which verification has already been done.
                if (req.CurrentVerificationLevelCount <= req.MaxVerificationLevel)
                {
                    //Algorithm for allowing verification sanjit: 6 April,2020
                    //1. Find out the permissions of store verifiers , i.e. req.PermissionIdList
                    //2. Find out the permission to which our user has access to. At this point, we should only view these requisition in the requisition list.
                    //3. Find the level associated with that permission.
                    //4. Find out if verification already exists at this level. If Not, verification is allowed.
                    for (int i = 0; i < req.PermissionIdList.Count(); i++)
                    {
                        if (RBAC.UserHasPermissionId(user.UserId, req.PermissionIdList[i]) == true)
                        {
                            var authorizedPermissionId = req.PermissionIdList[i];
                            req.CurrentVerificationLevel = rbacDb.StoreVerificationMapModel.Where(svm => svm.StoreId == req.RequestFromStoreId && svm.PermissionId == authorizedPermissionId)
                                                                                        .Select(svm => svm.VerificationLevel).FirstOrDefault();
                            req.isVerificationAllowed = !CheckForVerificationExistAtThisLevel(inventoryDb, req.CurrentVerificationLevel, req.VerificationId);
                            if (req.isVerificationAllowed == true)
                            {
                                break;
                            }
                            req.VerificationStatus = VerificationStatus;
                        }

                    }
                }
            });
        }
        /// <summary>
        /// 1. Checks if verification exists, if not returns false, allow verification.
        /// 2. Checks if status is rejected, if yes, returns true, disable verification.
        /// 3. Checks for level matched, if not, do this process for parent verification id, if yes, returns true, disable verification.
        /// </summary>
        /// <param name="inventoryDb"></param>
        /// <param name="VerificationLevel"></param>
        /// <param name="VerificationId"></param>
        /// <returns></returns>
        private static bool CheckForVerificationExistAtThisLevel(InventoryDbContext inventoryDb, int VerificationLevel, int? VerificationId)
        {
            if (VerificationLevel > 0 && VerificationId != null & VerificationId > 0)
            {
                var verification = inventoryDb.Verifications.Where(v => v.VerificationId == VerificationId)
                                                            .Select(v => new { v.CurrentVerificationLevel, v.ParentVerificationId, v.VerificationStatus })
                                                            .FirstOrDefault();

                if (verification.VerificationStatus != "rejected" && verification.CurrentVerificationLevel != VerificationLevel)
                {
                    if (verification.ParentVerificationId > 0)
                    {
                        //call this function again;
                        //because it is possible that requisition at this level has been verified in the past.
                        return CheckForVerificationExistAtThisLevel(inventoryDb, VerificationLevel, verification.ParentVerificationId);
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    VerificationStatus = verification.VerificationStatus;
                    return true;
                }
            }
            else
            {
                return false;
            }
        }

        public static void UpdateRequisitionAfterApproved(InventoryDbContext inventoryDbContext, RequisitionModel requisition, int VerificationId, RbacUser currentUser)
        {
            try
            {
                foreach (var rItems in requisition.RequisitionItems)
                {
                    rItems.ModifiedBy = currentUser.EmployeeId;
                    rItems.ModifiedOn = DateTime.Now;
                    inventoryDbContext.RequisitionItems.Attach(rItems);
                    inventoryDbContext.Entry(rItems).Property(x => x.PendingQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.CancelQuantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.ModifiedOn).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.ModifiedBy).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.RequisitionItemStatus).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.Quantity).IsModified = true;
                    inventoryDbContext.Entry(rItems).Property(x => x.IsActive).IsModified = true;
                    //these are the extra cases to look at during item cancel.
                    if (rItems.IsActive == false && rItems.CancelBy == null)
                    {
                        rItems.CancelQuantity = rItems.PendingQuantity;
                        rItems.CancelBy = currentUser.EmployeeId;
                        rItems.CancelOn = DateTime.Now;
                        inventoryDbContext.Entry(rItems).Property(x => x.CancelQuantity).IsModified = true;
                        inventoryDbContext.Entry(rItems).Property(x => x.CancelBy).IsModified = true;
                        inventoryDbContext.Entry(rItems).Property(x => x.CancelOn).IsModified = true;
                    }
                }

                requisition.VerificationId = VerificationId;
                requisition.ModifiedBy = currentUser.EmployeeId;
                requisition.ModifiedOn = DateTime.Now;
                inventoryDbContext.Requisitions.Attach(requisition);
                inventoryDbContext.Entry(requisition).Property(x => x.RequisitionStatus).IsModified = true;
                inventoryDbContext.Entry(requisition).Property(x => x.ModifiedOn).IsModified = true;
                inventoryDbContext.Entry(requisition).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(requisition).Property(req => req.VerificationId).IsModified = true;

                inventoryDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static List<RequisitionModel> FilterRequisitionListByUserPermission(RbacUser user, List<RequisitionModel> requisitionList)
        {
            requisitionList = requisitionList.Where(req => req.PermissionIdList
                                             .Any(p => RBAC.UserHasPermissionId(user.UserId, p) == true) == true)
                                             .ToList();
            return requisitionList;
        }
        private static void SetDataForInventoryRequisition(InventoryDbContext inventoryDb, RbacDbContext rbacDb, RequisitionModel req)
        {
            //set current verification level in the requisition level
            if (req.VerificationId == null || req.VerificationId == 0)
            {
                req.CurrentVerificationLevel = 0;
                req.CurrentVerificationLevelCount = 0;
            }
            else
            {
                req.CurrentVerificationLevelCount = GetNumberOfVerificationDone(inventoryDb, req.VerificationId ?? 0);
            }
            //set store Name and Max Verification Level for displaying purpose
            var storeDetails = inventoryDb.StoreMasters
                                .Where(store => store.StoreId == req.RequestFromStoreId)
                                .Select(store => new { store.Name, store.MaxVerificationLevel }).FirstOrDefault();
            req.StoreName = storeDetails.Name;
            req.MaxVerificationLevel = storeDetails.MaxVerificationLevel;

            //Step 2: set permission id so that we can filter which requisition to show.
            req.PermissionIdList = SubstoreBL.GetStoreVerifiersPermissionList(req.RequestFromStoreId, rbacDb).ToList();
            //req.NextVerifiersPermissionName = SubstoreBL.GetCurrentVerifiersPermissionName(req.StoreId, req.CurrentVerificationLevel + 1, rbacDb);
        }
        public static InventoryRequisitionViewModel GetInventoryRequisitionDetails(int RequisitionId, InventoryDbContext inventoryDb)
        {
            try
            {
                var requisitionVM = new InventoryRequisitionViewModel();
                requisitionVM.RequisitionItemList = inventoryDb.RequisitionItems.Where(RI => RI.RequisitionId == RequisitionId && RI.RequisitionItemStatus != "withdrawn").ToList();
                foreach (var item in requisitionVM.RequisitionItemList)
                {
                    var itemDetails = inventoryDb.Items.Where(itm => itm.ItemId == item.ItemId)
                                                        .Select(itm => new { itm.ItemName, itm.Code, itm.UnitOfMeasurementId }).FirstOrDefault();
                    var itemUOMName = inventoryDb.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetails.UnitOfMeasurementId)
                                                                            .Select(uom => uom.UOMName).FirstOrDefault();
                    item.ItemName = itemDetails.ItemName;
                    item.Code = itemDetails.Code;
                    item.UOMName = itemUOMName;
                    item.IsEdited = false;
                }


                var requisition = inventoryDb.Requisitions.Where(req => req.RequisitionId == RequisitionId)
                                                            .Select(req => new { req.CreatedBy, req.CreatedOn, req.VerificationId })
                                                            .FirstOrDefault();
                requisitionVM.RequestingUser.Name = GetNameByEmployeeId(requisition.CreatedBy, inventoryDb);
                requisitionVM.RequestingUser.Date = requisition.CreatedOn;
                if (requisition.VerificationId != null)
                {
                    int VerificationId = requisition.VerificationId ?? 0;
                    requisitionVM.Verifiers = GetVerifiersList(VerificationId, inventoryDb);
                }
                requisitionVM.Dispatchers = GetDispatchersList(RequisitionId, inventoryDb);
                return requisitionVM;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public static List<DispatchVerificationActor> GetDispatchersList(int RequisitionId, InventoryDbContext inventoryDb)
        {
            List<DispatchListViewModel> dispatchDetails = InventoryBL.GetDispatchesFromRequisitionId(RequisitionId, inventoryDb);
            var dispatchers = new List<DispatchVerificationActor>();
            if (dispatchDetails != null && dispatchDetails.Count() > 0)
            {
                dispatchers = dispatchDetails.Select(D => new DispatchVerificationActor
                {
                    DispatchId = D.DispatchId,
                    Date = D.CreatedOn ?? default(DateTime),
                    Remarks = D.Remarks,
                    Name = D.DispatchedByName,
                    isReceived = D.isReceived
                }).ToList();
            }

            return dispatchers;
        }
        public static List<PurchaseRequestModel> GetInventoryPurchaseRequestsBasedOnUser(DateTime FromDate, DateTime ToDate, InventoryDbContext inventoryDb, RbacDbContext rbacDb, RbacUser user)
        {
            try
            {
                var PRVerificationSettingsParsed = GetPurchaseRequestVerificationSetting(inventoryDb);
                if (PRVerificationSettingsParsed != null)
                {
                    if (PRVerificationSettingsParsed.VerificationLevel > 0)
                    {
                        var realToDate = ToDate.AddDays(1);
                        //Step 1: Take all the active requisition in memory.
                        var PurchaseRequests = inventoryDb.PurchaseRequest.Where(PR => PR.RequestDate > FromDate && PR.RequestDate < realToDate && PR.RequestStatus != "withdrawn").OrderByDescending(req => req.PurchaseRequestId).ToList();
                        foreach (var purchaseReq in PurchaseRequests)
                        {
                            //set current verification level in the requisition level
                            if (purchaseReq.VerificationId == null || purchaseReq.VerificationId == 0)
                            {
                                purchaseReq.CurrentVerificationLevel = 0;
                                purchaseReq.CurrentVerificationLevelCount = 0;
                            }
                            else
                            {
                                purchaseReq.CurrentVerificationLevelCount = GetNumberOfVerificationDone(inventoryDb, purchaseReq.VerificationId ?? 0);
                            }
                            //set store Name and Max Verification Level for displaying purpose

                            purchaseReq.MaxVerificationLevel = PRVerificationSettingsParsed.VerificationLevel;
                            purchaseReq.PermissionIdList = PRVerificationSettingsParsed.PermissionIds;
                            purchaseReq.RequestedByName = VerificationBL.GetNameByEmployeeId(purchaseReq.CreatedBy, inventoryDb);
                            purchaseReq.RequestFromStoreName = inventoryDb.StoreMasters.Find(purchaseReq.StoreId).Name;
                            purchaseReq.VendorName = GetInventoryVendorNameById(inventoryDb, purchaseReq.VendorId ?? 0);
                            if (purchaseReq.VerificationId != null)
                            {
                                purchaseReq.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDb, purchaseReq.VerificationId ?? 0);
                            }
                            else
                            {
                                purchaseReq.CurrentVerificationLevelCount = 0;
                            }



                        }
                        //Step 3: filter the requisition List based on Permission Id.
                        PurchaseRequests = PurchaseRequests.Where(req => req.PermissionIdList
                                                     .Any(p => RBAC.UserHasPermissionId(user.UserId, p) == true) == true)
                                                     .ToList();
                        PurchaseRequests.ForEach(req =>
                        {
                            req.isVerificationAllowed = false;
                            req.VerificationStatus = "pending";
                            // Verification should not be allowed in the level in which verification has already been done.
                            if (req.CurrentVerificationLevelCount <= req.MaxVerificationLevel)
                            {
                                //Algorithm for allowing verification sanjit: 6 April,2020
                                //1. Find out the permissions of store verifiers , i.e. req.PermissionIdList
                                //2. Find out the permission to which our user has access to. At this point, we should only view these requisition in the requisition list.
                                //3. Find the level associated with that permission.
                                //4. Find out if verification already exists at this level. If Not, verification is allowed.
                                for (int i = 0; i < req.PermissionIdList.Count(); i++)
                                {
                                    if (RBAC.UserHasPermissionId(user.UserId, req.PermissionIdList[i]) == true)
                                    {
                                        var authorizedPermissionId = req.PermissionIdList[i];
                                        req.CurrentVerificationLevel = i + 1;
                                        req.isVerificationAllowed = !CheckForVerificationExistAtThisLevel(inventoryDb, req.CurrentVerificationLevel, req.VerificationId);
                                        if (req.isVerificationAllowed == true)
                                        {
                                            if (req.IsPOCreated == true) { req.isVerificationAllowed = false; }
                                            break;
                                        }
                                        req.VerificationStatus = VerificationStatus;
                                    }

                                }
                            }
                        });
                        return PurchaseRequests;
                    }
                    else { return null; }
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public static VER_INV_PurchaseRequestParameterModel GetPurchaseRequestVerificationSetting(InventoryDbContext inventoryDb)
        {
            var PRVerificationSettings = inventoryDb.CfgParameters
                                       .Where(a => a.ParameterGroupName == "Inventory" && a.ParameterName == "PurchaseRequestVerificationSettings")
                                       .Select(Param => Param.ParameterValue).FirstOrDefault();
            return DanpheJSONConvert.DeserializeObject<VER_INV_PurchaseRequestParameterModel>(PRVerificationSettings); ;
        }
        public static InventoryPurchaseRequestViewModel GetInventoryPurchaseRequestDetails(int PurchaseRequestId, InventoryDbContext inventoryDb)
        {
            try
            {
                var requisitionVM = new InventoryPurchaseRequestViewModel();
                requisitionVM.RequestedItemList = inventoryDb.PurchaseRequestItems.Where(RI => RI.PurchaseRequestId == PurchaseRequestId).ToList();
                foreach (var item in requisitionVM.RequestedItemList)
                {
                    var itemDetails = inventoryDb.Items.Where(itm => itm.ItemId == item.ItemId)
                                                        .Select(itm => new { itm.ItemName, itm.Code, itm.UnitOfMeasurementId, itm.MSSNO }).FirstOrDefault();
                    var itemUOMName = inventoryDb.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetails.UnitOfMeasurementId)
                                                                            .Select(uom => uom.UOMName).FirstOrDefault();
                    item.ItemName = itemDetails.ItemName;
                    item.Code = itemDetails.Code;
                    item.UOMName = itemUOMName;
                    item.MSSNO = itemDetails.MSSNO;
                    item.IsEdited = false;
                    item.AvailableQuantity = inventoryDb.StoreStocks.Where(stk => stk.ItemId == item.ItemId).Sum(stk => (double?)stk.AvailableQuantity);
                    item.POQuantity = inventoryDb.PurchaseOrders.Where(a => a.RequisitionId == item.PurchaseRequestId)
                                                            .Join(inventoryDb.PurchaseOrderItems, po => new { item.ItemId, po.PurchaseOrderId }, poI => new { poI.ItemId, poI.PurchaseOrderId }, (po, poI) => poI.Quantity)
                                                            .FirstOrDefault();
                }


                var requisition = inventoryDb.PurchaseRequest.Where(req => req.PurchaseRequestId == PurchaseRequestId)
                                                            .Select(req => new { req.CreatedBy, req.CreatedOn, req.VerificationId })
                                                            .FirstOrDefault();
                requisitionVM.RequestingUser.Name = GetNameByEmployeeId(requisition.CreatedBy, inventoryDb);
                requisitionVM.RequestingUser.Date = requisition.CreatedOn;
                if (requisition.VerificationId != null)
                {
                    int VerificationId = requisition.VerificationId ?? 0;
                    requisitionVM.Verifiers = GetVerifiersList(VerificationId, inventoryDb);
                }
                return requisitionVM;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public static int? GetIMIRNo(InventoryDbContext inventoryDbContext, DateTime? DecidingDate = null)
        {
            DecidingDate = (DecidingDate == null) ? DateTime.Now.Date : DecidingDate;
            var selectedFiscalYear = inventoryDbContext.InventoryFiscalYears.Where(fsc => fsc.StartDate <= DecidingDate && fsc.EndDate >= DecidingDate).FirstOrDefault();

            int imirNo = (from invtxn in inventoryDbContext.GoodsReceipts
                          where selectedFiscalYear.StartDate <= invtxn.IMIRDate && selectedFiscalYear.EndDate >= invtxn.IMIRDate
                          select invtxn.IMIRNo ?? 0).DefaultIfEmpty(0).Max();
            return imirNo + 1;
        }
        public static string GetInventoryVendorNameById(InventoryDbContext inventoryDb, int VendorId)
        {
            return inventoryDb.Vendors.Where(V => V.VendorId == VendorId).Select(V => V.VendorName).FirstOrDefault();
        }
        public static string GetNameByEmployeeId(int EmployeeId, InventoryDbContext db)
        {
            try
            {
                var empId = db.Employees.Where(emp => emp.EmployeeId == EmployeeId)
                                           .Select(emp => emp.FullName).FirstOrDefault();
                return empId;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public static List<VerificationActor> GetVerifiersList(int VerificationId, InventoryDbContext dbContext)
        {
            var VerificationList = new List<VerificationActor>();

            var verificationModel = dbContext.Verifications.Find(VerificationId);
            var verification = new VerificationActor();
            verification.Name = GetNameByEmployeeId(verificationModel.VerifiedBy, dbContext);
            verification.Date = verificationModel.VerifiedOn;
            verification.Status = verificationModel.VerificationStatus;
            verification.Remarks = verificationModel.VerificationRemarks;
            if (verificationModel.ParentVerificationId != null)
            {
                VerificationList = GetVerifiersList(verificationModel.ParentVerificationId ?? 0, dbContext);
            }
            VerificationList.Add(verification);
            return VerificationList;
        }
        public static int GetNumberOfVerificationDone(InventoryDbContext inventoryDb, int VerificationId)
        {
            return inventoryDb.Verifications.Where(V => V.VerificationId == VerificationId).Select(V => V.CurrentVerificationLevelCount).FirstOrDefault();
        }
        public static List<POVerifier> GetAllPOVerifiers(RbacDbContext db)
        {
            var VerifiersList = db.Roles
                                    .Where(R => R.IsActive == true)
                                    .Select(R => new POVerifier
                                    {
                                        Id = R.RoleId,
                                        Name = R.RoleName,
                                        Type = "role"
                                    }).ToList();
            VerifiersList.AddRange(db.Users.Where(U => U.IsActive == true)
                                    .Join(db.Employees, u => u.EmployeeId, e => e.EmployeeId,
                                    (u, e) => new { u, e })
                                    .Select(U => new POVerifier
                                    {
                                        Id = U.u.UserId,
                                        Name = U.e.FullName,
                                        Type = "user"
                                    }).ToList());
            return VerifiersList;

        }
        public static List<PurchaseOrderModel> GetInventoryPurchaseOrdersBasedOnUser(DateTime FromDate, DateTime ToDate, InventoryDbContext db, RbacDbContext rbac, RbacUser user)
        {
            var realToDate = ToDate.AddDays(1);
            var PurchaseOrderList = db.PurchaseOrders.Where(PO => PO.CreatedOn >= FromDate && PO.CreatedOn < realToDate && PO.IsVerificationEnabled == true && PO.POStatus != "withdrawn").OrderByDescending(a => a.PurchaseOrderId).ToList();
            var FilteredPurchaseOrderList = new List<PurchaseOrderModel>();
            //puchase order ko veriferIds field cha, role and userId check, cha bhane, show purchase order
            foreach (var purchaseOrder in PurchaseOrderList)
            {
                purchaseOrder.IsVerificationAllowed = false;
                purchaseOrder.VerificationStatus = "pending";
                purchaseOrder.CurrentVerificationLevel = 0;
                purchaseOrder.CurrentVerificationLevelCount = (purchaseOrder.VerificationId == null) ? 0 : GetNumberOfVerificationDone(db, purchaseOrder.VerificationId ?? 0);
                purchaseOrder.OrderFromStoreName = db.StoreMasters.Find(purchaseOrder.StoreId).Name;

                var VerifierIdsParsed = DanpheJSONConvert.DeserializeObject<List<dynamic>>(purchaseOrder.VerifierIds);

                if (IsUserAllowedToSeePo(db, user, purchaseOrder, VerifierIdsParsed))
                {
                    purchaseOrder.VendorName = GetInventoryVendorNameById(db, purchaseOrder.VendorId);
                    FilteredPurchaseOrderList.Add(purchaseOrder);
                }
            }
            return FilteredPurchaseOrderList;
        }
        private static Boolean IsUserAllowedToSeePo(InventoryDbContext db, RbacUser user, PurchaseOrderModel purchaseOrder, List<dynamic> VerifierIdsParsed)
        {
            bool isUserAllowToSeePO = false;
            for (int i = 0; i < VerifierIdsParsed.Count(); i++)
            {
                dynamic VerifierId = DanpheJSONConvert.DeserializeObject<int>(Convert.ToString(VerifierIdsParsed[i].Id));
                var VerifierType = VerifierIdsParsed[i].Type;
                if ((RBAC.UserIsSuperAdmin(user.UserId) || (VerifierType == "role" && RBAC.UserHasRoleId(user.UserId, VerifierId)) || (VerifierType == "user" && user.UserId == VerifierId)))
                {
                    isUserAllowToSeePO = true;
                    purchaseOrder.CurrentVerificationLevel = i + 1;
                    purchaseOrder.IsVerificationAllowed = !CheckForVerificationExistAtThisLevel(db, purchaseOrder.CurrentVerificationLevel, purchaseOrder.VerificationId);
                    purchaseOrder.MaxVerificationLevel = VerifierIdsParsed.Count();
                    if (purchaseOrder.IsVerificationAllowed == true)
                    {
                        break;
                    }
                    purchaseOrder.VerificationStatus = VerificationStatus;
                }
            }
            return isUserAllowToSeePO;
        }
        public static InventoryPurchaseOrderViewModel GetInventoryPurchaseOrderDetails(int PurchaseOrderId, InventoryDbContext db)
        {
            try
            {
                var PurchaseOrderVM = new InventoryPurchaseOrderViewModel();
                PurchaseOrderVM.OrderedItemList = db.PurchaseOrderItems.Where(OI => OI.PurchaseOrderId == PurchaseOrderId).ToList();
                foreach (var item in PurchaseOrderVM.OrderedItemList)
                {
                    var itemDetails = db.Items.Where(itm => itm.ItemId == item.ItemId)
                                                        .Select(itm => new { itm.ItemName, itm.Code, itm.UnitOfMeasurementId }).FirstOrDefault();
                    var itemUOMName = db.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetails.UnitOfMeasurementId)
                                                                            .Select(uom => uom.UOMName).FirstOrDefault();
                    item.ItemName = itemDetails.ItemName;
                    item.Code = itemDetails.Code;
                    item.UOMName = itemUOMName;
                    item.IsEdited = false;
                }


                var requisition = db.PurchaseOrders.Where(req => req.PurchaseOrderId == PurchaseOrderId)
                                                            .Select(req => new { req.CreatedBy, req.CreatedOn, req.VerificationId })
                                                            .FirstOrDefault();
                PurchaseOrderVM.OrderingUser.Name = GetNameByEmployeeId(requisition.CreatedBy, db);
                PurchaseOrderVM.OrderingUser.Date = requisition.CreatedOn ?? DateTime.Now;
                if (requisition.VerificationId != null)
                {
                    int VerificationId = requisition.VerificationId ?? 0;
                    PurchaseOrderVM.Verifiers = GetVerifiersList(VerificationId, db);
                }
                return PurchaseOrderVM;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public static QuotationRatesVm GetQuotationRatesDetails(int PurchaseOrderId, InventoryDbContext db)
        {
            var quotationsAgainstPO = (from POI in db.PurchaseOrderItems
                                       from QCI in db.QuotationItems.Where(qi => qi.ItemId == POI.ItemId).DefaultIfEmpty()
                                       from QC in db.Quotations.Where(q => q.QuotationId == QCI.QuotationId).DefaultIfEmpty()
                                       where POI.PurchaseOrderId == PurchaseOrderId
                                       select new
                                       {
                                           ItemId = POI.ItemId,
                                           ItemName = (QCI != null) ? QCI.ItemName : "",
                                           VendorId = (QC != null) ? QC.VendorId : default(int?),
                                           VendorName = (QC != null) ? QC.VendorName : "",
                                           Price = (QCI != null) ? QCI.Price : default(int?),
                                           Status = (QC != null) ? QC.Status : ""
                                       }).ToList();
            var itemNameList = quotationsAgainstPO.Select(a => a.ItemName).Distinct().ToList();
            var quotationRates = quotationsAgainstPO.Where(q => q.VendorId != null).GroupBy(q => q.VendorId)
                                        .Select(q => new QuotationRatesDto()
                                        {
                                            VendorId = q.Key,
                                            VendorName = q.FirstOrDefault().VendorName,
                                            ItemDetails = q.Select(i => new QuotationRatesComparisionDTO()
                                            {
                                                ItemId = i.ItemId,
                                                ItemName = i.ItemName,
                                                Price = i.Price,
                                                Status = i.Status
                                            }).ToList()
                                        }).ToList();
            return new QuotationRatesVm()
            {
                ItemNameList = itemNameList,
                QuotationRates = quotationRates
            };
        }


        #region Inventory Goods Receipt Verification Methods

        public static List<GoodsReceiptModel> GetInventoryGRBasedOnUser(DateTime FromDate, DateTime ToDate, InventoryDbContext db, RbacDbContext rbac, RbacUser user)
        {
            var realToDate = ToDate.AddDays(1);
            var GoodsReceiptList = db.GoodsReceipts.Where(PO => PO.CreatedOn >= FromDate && PO.CreatedOn < realToDate && PO.IsVerificationEnabled == true).OrderByDescending(a => a.GoodsReceiptID).ToList();
            var FilteredGoodsReceiptList = new List<GoodsReceiptModel>();
            //puchase order ko veriferIds field cha, role and userId check, cha bhane, show purchase order
            foreach (var gR in GoodsReceiptList)
            {
                var FiscalYear = db.InventoryFiscalYears.FirstOrDefault(a => a.FiscalYearId == gR.FiscalYearId);
                gR.FiscalYear = (FiscalYear != null) ? FiscalYear.FiscalYearName : "";
                gR.GoodsReceiptDate = gR.GoodsReceiptDate != null ? gR.GoodsReceiptDate : null;
                gR.GoodsArrivalFiscalYearFormatted = db.InventoryFiscalYears.Where(f => f.StartDate <= gR.GoodsArrivalDate && f.EndDate >= gR.GoodsArrivalDate).Select(f => f.FiscalYearName).FirstOrDefault();
                gR.IsVerificationAllowed = false;
                gR.VerificationStatus = "pending";
                gR.CurrentVerificationLevel = 0;
                gR.CurrentVerificationLevelCount = (gR.VerificationId == null) ? 0 : GetNumberOfVerificationDone(db, gR.VerificationId ?? 0);

                var VerifierIdsParsed = DanpheJSONConvert.DeserializeObject<List<dynamic>>(gR.VerifierIds);

                if (IsUserAllowedToSeeGR(db, user, gR, VerifierIdsParsed))
                {
                    gR.VendorName = GetInventoryVendorNameById(db, gR.VendorId);
                    FilteredGoodsReceiptList.Add(gR);
                }
            }
            return FilteredGoodsReceiptList;
        }
        private static Boolean IsUserAllowedToSeeGR(InventoryDbContext db, RbacUser user, GoodsReceiptModel gR, List<dynamic> VerifierIdsParsed)
        {
            bool isUserAllowToSeePO = false;
            for (int i = 0; i < VerifierIdsParsed.Count(); i++)
            {
                dynamic VerifierId = DanpheJSONConvert.DeserializeObject<int>(Convert.ToString(VerifierIdsParsed[i].Id));
                var VerifierType = VerifierIdsParsed[i].Type;
                if ((RBAC.UserIsSuperAdmin(user.UserId) || (VerifierType == "role" && RBAC.UserHasRoleId(user.UserId, VerifierId)) || (VerifierType == "user" && user.UserId == VerifierId)))
                {
                    isUserAllowToSeePO = true;
                    gR.CurrentVerificationLevel = i + 1;
                    gR.IsVerificationAllowed = !CheckForVerificationExistAtThisLevel(db, gR.CurrentVerificationLevel, gR.VerificationId);
                    gR.MaxVerificationLevel = VerifierIdsParsed.Count();
                    if (gR.IsVerificationAllowed == true)
                    {
                        break;
                    }
                    gR.VerificationStatus = VerificationStatus;
                }
            }
            return isUserAllowToSeePO;
        }
        public static InventoryGoodsReceiptViewModel GetInventoryGRDetails(int GoodsReceiptId, InventoryDbContext db)
        {
            try
            {
                var GoodsReceiptVM = new InventoryGoodsReceiptViewModel();
                GoodsReceiptVM.ReceivedItemList = db.GoodsReceiptItems.Where(OI => OI.GoodsReceiptId == GoodsReceiptId).ToList();
                foreach (var item in GoodsReceiptVM.ReceivedItemList)
                {
                    var itemDetails = db.Items.Where(itm => itm.ItemId == item.ItemId)
                                                        .Select(itm => new { itm.ItemName, itm.MSSNO, itm.Code, itm.UnitOfMeasurementId }).FirstOrDefault();
                    var itemUOMName = db.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetails.UnitOfMeasurementId)
                                                                            .Select(uom => uom.UOMName).FirstOrDefault();
                    item.ItemName = itemDetails.ItemName;
                    item.Code = itemDetails.Code;
                    item.MSSNO = itemDetails.MSSNO;
                    item.UOMName = itemUOMName;
                    item.IsEdited = false;
                }


                var goodsReceipt = db.GoodsReceipts.Where(gr => gr.GoodsReceiptID == GoodsReceiptId)
                                    .Join(db.Vendors, a => a.VendorId, b => b.VendorId, (gr, vendor) => new { gr, vendor })
                                    .GroupJoin(db.PurchaseOrders, a => a.gr.PurchaseOrderId, b => b.PurchaseOrderId, (grMain, po) => new { grMain.gr, grMain.vendor, po })
                                    .SelectMany(a => a.po.DefaultIfEmpty(), (grMain, poLJ) => new { grMain.gr, grMain.vendor, po = poLJ })
                                    .Select(a => new
                                    {
                                        a.gr.CreatedBy,
                                        a.gr.CreatedOn,
                                        a.gr.VerificationId,
                                        a.gr.MaterialCoaDate,
                                        a.gr.MaterialCoaNo,
                                        a.vendor.VendorName,
                                        a.vendor.ContactAddress,
                                        a.vendor.ContactNo,
                                        PurchaseOrderId = a.po != null ? a.po.PurchaseOrderId : 0,
                                        PoDate = a.po != null ? a.po.PoDate : null,
                                    }).FirstOrDefault();
                GoodsReceiptVM.ReceivingUser.Name = GetNameByEmployeeId(goodsReceipt.CreatedBy ?? 0, db);
                GoodsReceiptVM.ReceivingUser.Date = goodsReceipt.CreatedOn ?? DateTime.Now;
                if (goodsReceipt.VerificationId != null)
                {
                    GoodsReceiptVM.Verifiers = GetVerifiersList(goodsReceipt.VerificationId ?? 0, db);
                }
                GoodsReceiptVM.OrderDetails = new VER_PODetailModel
                {
                    PurchaseOrderId = goodsReceipt.PurchaseOrderId,
                    PoDate = goodsReceipt.PoDate,
                    VendorName = goodsReceipt.VendorName,
                    ContactNo = goodsReceipt.ContactNo,
                    ContactAddress = goodsReceipt.ContactAddress
                };
                return GoodsReceiptVM;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion
    }
}
