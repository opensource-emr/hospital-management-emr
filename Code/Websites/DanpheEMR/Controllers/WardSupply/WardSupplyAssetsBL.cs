using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class WardSupplyAssetsBL
    {
        /// <summary>
        /// Send the selected asset to cssd (sterilization) temporarily
        /// </summary>
        /// <param name="FixedAssetStockId">FixedAssetStockId of the asset to be sent.</param>
        /// <param name="wardSupplyDbContext">Instance of WardsupplyDbContext</param>
        /// <param name="currentUser">Active User</param>
        /// <returns></returns>
        public static async Task<int> SendAssetToCssd(int FixedAssetStockId, WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser)
        {
            var currentDate = DateTime.Now;

            //find the stock in fixed asset stock table and update cssd status as pending
            var selectedAsset = await wardSupplyDbContext.FixedAssetStock.FindAsync(FixedAssetStockId);
            selectedAsset.CssdStatus = "pending";

            //create a new row to add in cssd txn table with pending cssd status and add it in db
            var newCssdItem = new CssdItemTransactionModel()
            {
                FixedAssetStockId = FixedAssetStockId,
                ItemId = selectedAsset.ItemId,
                StoreId = selectedAsset.SubStoreId ?? selectedAsset.StoreId,
                CssdStatus = "pending",
                CreatedBy = currentUser.EmployeeId,
                CreatedOn = currentDate,
                RequestedBy = currentUser.EmployeeId,
                RequestedOn = currentDate,
                RequestRemarks = "",
            };
            wardSupplyDbContext.CssdItemTransactions.Add(newCssdItem);
            await wardSupplyDbContext.SaveChangesAsync();
            return FixedAssetStockId;
        }
        internal static void DirectDispatch(FixedAssetDispatchModel RequisitionFromClient, WardSupplyDbContext wardSupplyDb, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = wardSupplyDb.Database.BeginTransaction())
            {
                try
                {
                    bool isRequisitionCreated = CreateRequisition(RequisitionFromClient, wardSupplyDb, currentUser);
                    if (isRequisitionCreated == true)
                    {
                        WardSupplyAssetsBL.DispatchItemsTransaction(RequisitionFromClient, wardSupplyDb, currentUser);
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
        public static bool CreateRequisition(FixedAssetDispatchModel RequisitionFromClient, WardSupplyDbContext wardDbContext, RbacUser currentUser)
        {

            List<WARDSupplyAssetRequisitionItemsModel> requisitionItems = new List<WARDSupplyAssetRequisitionItemsModel>();
            WARDSupplyAssetRequisitionModel requisition = new WARDSupplyAssetRequisitionModel();

             int ? RequisitionNo = 0;
            var maxRequisitionList = wardDbContext.WARDSupplyAssetRequisitionModels.ToList();
            if (maxRequisitionList.Count() == 0)
            {
                RequisitionNo = 1;
            }
            else
            {
                RequisitionNo = maxRequisitionList.OrderByDescending(a => a.RequisitionNo).First().RequisitionNo + 1;
            }
            
            requisition.CreatedOn = DateTime.Now;
            requisition.CreatedBy = currentUser.EmployeeId;
            requisition.IsDirectDispatch = true;
            requisition.RequisitionStatus = "complete";
            requisition.StoreId = RequisitionFromClient.StoreId;
            requisition.SubStoreId = RequisitionFromClient.SubStoreId;
            requisition.Remarks = RequisitionFromClient.Remark;
            requisition.IsDirectDispatch = true;
            requisition.IssueNo = 0;
            requisition.RequisitionNo = RequisitionNo;
             requisition.RequisitionDate = DateTime.Now;
            requisition.IsCancel = false;
            wardDbContext.WARDSupplyAssetRequisitionModels.Add(requisition);
           
            wardDbContext.SaveChanges();

            //getting the lastest RequistionId 
            int lastRequId = requisition.RequisitionId;
            int? lastRequNo = requisition.RequisitionNo;
            int? issueNo = requisition.IssueNo;
            RequisitionFromClient.RequisitionId = lastRequId;

            var allUniqueItemIds = RequisitionFromClient.DispatchItems.Select(d => d.ItemId).Distinct();
            foreach (var ItemId in allUniqueItemIds)
            {
                WARDSupplyAssetRequisitionItemsModel requisitionItem = new WARDSupplyAssetRequisitionItemsModel();
                //received, pending, status, modifiedOn, modifiedby
                requisitionItem.ItemId = ItemId;
                requisitionItem.RequisitionId = lastRequId;
                requisitionItem.Remark = RequisitionFromClient.Remark;
                requisitionItem.IssueNo = issueNo;              
                var dispatchitemslist = RequisitionFromClient.DispatchItems.Where(s => s.ItemId == ItemId).ToList();
                requisitionItem.ReceivedQuantity = dispatchitemslist.Count;
                requisitionItem.PendingQuantity = 0;
                requisitionItem.RequisitionItemStatus = "complete";
                requisitionItem.CreatedBy = currentUser.EmployeeId;
                requisitionItem.CreatedOn = DateTime.Now;
                requisitionItem.IsActive = true;
                requisitionItem.Quantity = dispatchitemslist.Count;
                wardDbContext.WARDSupplyAssetRequisitionItemsModels.Add(requisitionItem);               
                wardDbContext.SaveChanges();
                //bellow code for add reqsitmsid
                for (int i = 0; i < RequisitionFromClient.DispatchItems.Count(); i++)
                {
                    if (RequisitionFromClient.DispatchItems[i].ItemId == requisitionItem.ItemId)
                    {
                        RequisitionFromClient.DispatchItems[i].RequisitionItemId = requisitionItem.RequisitionItemId;
                    }
                }

            }
            //this Save for requisitionItems
            wardDbContext.SaveChanges();
                      
            return true; //this value will be used in direct dispatch for further decision-making
        }
        internal static void DispatchItemsTransaction(FixedAssetDispatchModel RequisitionFromClient, WardSupplyDbContext wardSupplyDb, RbacUser currentUser)
        {
            List<FixedAssetDispatchItemsModel> dispatchItems = new List<FixedAssetDispatchItemsModel>();
            FixedAssetDispatchModel dispatch = new FixedAssetDispatchModel();
            List<WARDSupplyAssetRequisitionItemsModel> requisitionItems = new List<WARDSupplyAssetRequisitionItemsModel>();
            WARDSupplyAssetRequisitionModel requisition = new WARDSupplyAssetRequisitionModel();

            try
            {
                dispatchItems = RequisitionFromClient.DispatchItems;
                RequisitionFromClient.DispatchItems = null;
                dispatch.RequisitionId = RequisitionFromClient.RequisitionId;
                dispatch.Remark = RequisitionFromClient.Remark;
                dispatch.CreatedBy = currentUser.EmployeeId;
                dispatch.CreatedOn = DateTime.Now;
                dispatch.StoreId = RequisitionFromClient.StoreId;
                dispatch.SubStoreId = RequisitionFromClient.SubStoreId;
                dispatch.ReceivedBy = RequisitionFromClient.ReceivedBy;               
                wardSupplyDb.FixedAssetDispatchModels.Add(dispatch);
                wardSupplyDb.SaveChanges();

                foreach (var item in dispatchItems)
                {
                    item.DispatchId = dispatch.DispatchId;                    
                    item.CreatedBy = currentUser.EmployeeId;
                    item.Remark = dispatch.Remark;
                    item.CreatedOn = DateTime.Now;
                    item.ExpiryDate = DateTime.Now;
                    item.MRP = 0;
                    wardSupplyDb.FixedAssetDispatchItemsModels.Add(item);
                }
                wardSupplyDb.SaveChanges();

                //List<FixedAssetStockModel> stkList = new List<FixedAssetStockModel>();
                foreach (var item in dispatchItems)
                {
                    FixedAssetStockModel stkObj = new FixedAssetStockModel();
                    stkObj.FixedAssetStockId = item.FixedAssetStockId.Value;
                    stkObj.SubStoreId = dispatch.SubStoreId;
                    var temp = wardSupplyDb.FixedAssetStock.Attach(stkObj);
                    wardSupplyDb.Entry(temp).Property(x => x.SubStoreId).IsModified = true;
                    wardSupplyDb.SaveChanges();
                }                
            }
            catch (Exception ex)
            {

                throw ex;
            }           
        }
    }
}
