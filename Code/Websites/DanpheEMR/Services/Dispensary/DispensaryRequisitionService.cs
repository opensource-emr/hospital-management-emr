using DanpheEMR.Controllers;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ViewModel.Dispensary;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Dispensary
{
    public class DispensaryRequisitionService : IDispensaryRequisitionService
    {
        private PharmacyDbContext db;
        private readonly string connString = null;
        public DispensaryRequisitionService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);

        }

        public async Task<GetAllRequisitionVm> GetAllAsync(DateTime FromDate, DateTime ToDate)
        {
            var realToDate = ToDate.AddDays(1);
            return new GetAllRequisitionVm
            {
                requisitionList = await (from R in db.StoreRequisition
                                         join E in db.Employees on R.CreatedBy equals E.EmployeeId
                                         join S in db.PHRMStore on R.StoreId equals S.StoreId
                                         //where S.Category != "substore"
                                         /*orderby R.RequisitionNo descending*/
                                         select new GetAllRequisitionDTO
                                         {
                                             RequisitionId = R.RequisitionId,
                                             RequisitionNo = R.RequisitionNo,
                                             RequisitionDate = R.RequisitionDate,
                                             RequisitionStatus = R.RequisitionStatus,
                                             RequistingStore = S.Name,
                                             CreatedByName = E.Salutation + ". " + E.FirstName + " " + (string.IsNullOrEmpty(E.MiddleName) ? "" : E.MiddleName + " ") + E.LastName,
                                             CanDispatchItem = true,
                                             CanApproveTransfer = (R.RequisitionStatus == "pending" && R.VerifierIds == null) ? true : false    //If verifierIds is null then it comes from Dispendary Transfer
                                         }).Where(s => s.RequisitionDate > FromDate && s.RequisitionDate < realToDate).OrderByDescending(s => s.RequisitionDate).ThenBy(s => s.CanApproveTransfer == false).ThenBy(s => s.RequisitionStatus).ToListAsync()
            };
        }

        public async Task<GetAllRequisitionByDispensaryIdVm> GetAllByDispensaryIdAsync(int id, DateTime FromDate, DateTime ToDate)
        {
            // check if receive feature is enabled or not
            var IsReceiveFeatureEnabledStr = db.CFGParameters.Where(p => p.ParameterGroupName == "Pharmacy" && p.ParameterName == "EnableReceiveItemsInDispensary").Select(p => p.ParameterValue).FirstOrDefault();
            bool IsReceivedFeatureEnabled;
            var realToDate = ToDate.AddDays(1);
            bool.TryParse(IsReceiveFeatureEnabledStr, out IsReceivedFeatureEnabled);
            return new GetAllRequisitionByDispensaryIdVm
            {
                requisitionList = await (from R in db.StoreRequisition.Where(r => r.StoreId == id)
                                         join E in db.Employees on R.CreatedBy equals E.EmployeeId
                                         join S in db.PHRMStore on R.StoreId equals S.StoreId
                                         join D in db.StoreDispatchItems on R.RequisitionId equals D.RequisitionId into DGrouped
                                         orderby R.RequisitionDate descending
                                         select new GetAllRequisitionByDispensaryIdDTO
                                         {
                                             RequisitionId = R.RequisitionId,
                                             RequistionNo = R.RequisitionNo,
                                             RequisitionDate = R.RequisitionDate,
                                             RequisitionStatus = R.RequisitionStatus,
                                             CreatedByName = E.Salutation + ". " + E.FirstName + " " + (string.IsNullOrEmpty(E.MiddleName) ? "" : E.MiddleName + " ") + E.LastName,
                                             IsReceiveFeatureEnabed = IsReceivedFeatureEnabled,
                                             IsNewDispatchAvailable = DGrouped.Any(d => d.ReceivedById == null),
                                             RequestedStoreName = S.Name,

                                         }).Where(s => s.RequisitionDate > FromDate && s.RequisitionDate < realToDate).OrderByDescending(s => s.RequisitionDate).ThenBy(s => s.IsNewDispatchAvailable == false).ThenBy(s => s.RequisitionStatus).ToListAsync()
            };
        }
        public async Task<GetItemsForRequisitionVm> GetItemsForRequisition(bool IsInsurance)
        {
            var mainStoreId = db.PHRMStore.Where(a => a.Category == "store" && a.SubCategory == "pharmacy").Select(a => a.StoreId).FirstOrDefault();
            return new GetItemsForRequisitionVm
            {
                ItemList = await (from I in db.PHRMItemMaster
                                  from U in db.PHRMUnitOfMeasurement.Where(u => u.UOMId == I.UOMId).DefaultIfEmpty()
                                  from G in db.PHRMGenericModel.Where(G => G.GenericId == I.GenericId).DefaultIfEmpty()
                                  from Stk in db.StoreStocks.Where(s => s.ItemId == I.ItemId && s.IsActive == true && s.StoreId == mainStoreId).DefaultIfEmpty()
                                  where IsInsurance == false || (IsInsurance == true && I.IsInsuranceApplicable == true)
                                  group new { I, U, G, Stk } by new { I.ItemId, I.ItemName, I.ItemCode, G.GenericName, U.UOMName } into IGrouped
                                  select new GetItemsForRequisitionDto
                                  {
                                      ItemId = IGrouped.Key.ItemId,
                                      ItemName = IGrouped.Key.ItemName,
                                      ItemCode = IGrouped.Key.ItemCode,
                                      GenericName = IGrouped.Key.GenericName ?? "N/A",
                                      UOMName = IGrouped.Key.UOMName ?? "N/A",
                                      AvailableQuantity = (IGrouped.FirstOrDefault().Stk != null) ? IGrouped.Sum(a => a.Stk.AvailableQuantity) : 0,
                                      IsActive = IGrouped.Select(a => a.I.IsActive).FirstOrDefault()
                                  }).ToListAsync()
            };
        }

        public async Task<GetRequisitionViewVm> GetRequisitionViewByIdAsync(int id)
        {
            var requisition = await (from R in db.StoreRequisition.Where(R => R.RequisitionId == id)
                                     from C in db.Employees.Where(E => E.EmployeeId == R.CreatedBy)
                                     from DI in db.StoreDispatchItems.Where(D => D.RequisitionId == R.RequisitionId).DefaultIfEmpty()
                                     from DIEmployee in db.Employees.Where(E => E.EmployeeId == DI.CreatedBy).DefaultIfEmpty()
                                     from S in db.PHRMStore.Where(A => A.StoreId == R.StoreId).DefaultIfEmpty()
                                     select new GetRequisitionViewDto
                                     {
                                         RequisitionId = R.RequisitionId,
                                         RequisitionNo = R.RequisitionNo,
                                         RequisitionDate = R.RequisitionDate,
                                         RequisitionStatus = R.RequisitionStatus,
                                         RequestedBy = C.FullName,
                                         DispatchedBy = (DI != null) ? DIEmployee.FullName : "",
                                         ReceivedBy = (DI != null) ? DI.ReceivedBy : "",
                                         RequestedStoreName = S.Name
                                     }).FirstOrDefaultAsync();

            requisition.RequisitionItems = await (from RI in db.StoreRequisitionItems
                                                  join I in db.PHRMItemMaster on RI.ItemId equals I.ItemId
                                                  join G in db.PHRMGenericModel on I.GenericId equals G.GenericId
                                                  join CU in db.Employees on RI.CancelledBy equals CU.EmployeeId into CUs
                                                  from CULJ in CUs.DefaultIfEmpty()
                                                  join Dispatch in db.StoreDispatchItems on RI.RequisitionItemId equals Dispatch.RequisitionItemId into DispatchGrouped
                                                  from DispatchLJ in DispatchGrouped.DefaultIfEmpty()
                                                  where RI.RequisitionId == id
                                                  group new { RI, I, G, CULJ, DispatchLJ } by new
                                                  {
                                                      RI.RequisitionId,
                                                      RI.RequisitionItemId,
                                                      I.ItemName,
                                                      G.GenericName,
                                                      RI.Quantity,
                                                      RI.PendingQuantity,
                                                      RI.RequisitionItemStatus,
                                                      FullName = CULJ != null ? CULJ.FullName : null,
                                                      RI.CancelledOn,
                                                      RI.CancelRemarks
                                                  } into RequisitionView
                                                  select new GetRequisitionItemViewDto
                                                  {
                                                      RequisitionId = RequisitionView.Key.RequisitionId,
                                                      RequisitionItemId = RequisitionView.Key.RequisitionItemId,
                                                      ItemName = RequisitionView.Key.ItemName,
                                                      GenericName = RequisitionView.Key.GenericName,
                                                      Remarks = RequisitionView.Select(a => a.RI.Remark).FirstOrDefault(),
                                                      RequestedQuantity = RequisitionView.Key.Quantity,
                                                      PendingQuantity = RequisitionView.Key.PendingQuantity,
                                                      DispatchedQuantity = RequisitionView.Where(r => r.DispatchLJ.DispatchId != null).Sum(a => a.DispatchLJ.DispatchedQuantity),
                                                      ReceivedQuantity = RequisitionView.Where(r => r.DispatchLJ.ReceivedById != null).Sum(a => a.DispatchLJ.DispatchedQuantity),
                                                      RequestedItemStatus = RequisitionView.Key.RequisitionItemStatus,
                                                      CancelledBy = RequisitionView.Key.FullName,
                                                      CancelledOn = RequisitionView.Key.CancelledOn,
                                                      CancelRemarks = RequisitionView.Key.CancelRemarks
                                                  }).ToListAsync();

            return new GetRequisitionViewVm { requisition = requisition };

        }
        public async Task<RequisitionDispatchToReceive_DTO> GetRequisitionDispatchToReceiveAsync(int RequisitionId)
        {
            var requisitionDetail = await (from R in db.StoreRequisition
                                           where R.RequisitionId == RequisitionId
                                           select new RequisitionDetail_DTO
                                           {
                                               RequisitionNo = R.RequisitionNo,
                                               RequisitionDate = R.RequisitionDate,
                                               RequisitionStatus = R.RequisitionStatus
                                           }).FirstOrDefaultAsync();

            var dispatchDetail = await (from disitm in db.StoreDispatchItems
                                        join reqitem in db.StoreRequisitionItems on disitm.RequisitionItemId equals reqitem.RequisitionItemId
                                        join itm in db.PHRMItemMaster on disitm.ItemId equals itm.ItemId
                                        join gen in db.PHRMGenericModel on itm.GenericId equals gen.GenericId
                                        join emp in db.Employees on disitm.ReceivedById equals emp.EmployeeId into empGroup
                                        from employee in empGroup.DefaultIfEmpty()
                                        where disitm.RequisitionId == RequisitionId
                                        group new { disitm, reqitem, itm, gen, employee } by disitm.DispatchId into DGrouped
                                        select new DispatchDetail_DTO
                                        {
                                            DispatchId = DGrouped.Key,
                                            ReceivedBy = DGrouped.FirstOrDefault().employee.FullName,
                                            ReceivedOn = DGrouped.FirstOrDefault().disitm.ReceivedOn,
                                            ReceivedRemarks = DGrouped.FirstOrDefault().disitm.ReceivedRemarks,
                                            DispatchedRemarks = DGrouped.FirstOrDefault().disitm.Remarks,
                                            DispatchItems = DGrouped.Select(item => new DispatchItemDetail_DTO
                                            {
                                                ItemId = item.itm.ItemId,
                                                ItemName = item.itm.ItemName,
                                                GenericName = item.gen.GenericName,
                                                RequestedQuantity = item.reqitem.Quantity,
                                                DispatchItemsId = item.disitm.DispatchItemsId,
                                                BatchNo = item.disitm.BatchNo,
                                                ExpiryDate = item.disitm.ExpiryDate,
                                                DispatchedQuantity = item.disitm.DispatchedQuantity,
                                                PendingQuantity = item.disitm.PendingQuantity,
                                                ItemRemarks = item.disitm.ItemRemarks,
                                                RackNo = (from itemrack in db.PHRMRackItem.Where(ri => ri.ItemId == item.itm.ItemId && ri.StoreId == item.disitm.TargetStoreId)
                                                          join rack in db.PHRMRack on itemrack.RackId equals rack.RackId
                                                          select rack.RackNo).FirstOrDefault()
                                            }).ToList()
                                        }).OrderBy(a => a.DispatchId).ToListAsync();


            return new RequisitionDispatchToReceive_DTO()
            {
                Requisition = requisitionDetail,
                Dispatch = dispatchDetail
            };
        }
        public async Task<int> AddDispensaryRequisition(PHRMStoreRequisitionModel RequisitionFromClient)
        {
            List<PHRMStoreRequisitionItemsModel> requisitionItems = new List<PHRMStoreRequisitionItemsModel>();
            PHRMStoreRequisitionModel requisition = new PHRMStoreRequisitionModel();

            //giving List Of RequisitionItems to requItemsFromClient because we have save the requisition and RequisitionItems One by one ..
            //first the requisition is saved  after that we have to take the requisitionid and give the requisitionid  to the RequisitionItems ..and then we can save the RequisitionItems
            requisitionItems = RequisitionFromClient.RequisitionItems;

            //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
            RequisitionFromClient.RequisitionItems = null;

            //asigining the value to POFromClient with POitems= null
            requisition = RequisitionFromClient;
            //Get Current Fiscal Year Id and assign to requsition model FiscalYearId
            requisition.FiscalYearId = PharmacyBL.GetFiscalYear(db).FiscalYearId;
            //Get current Fiscal Years Requisition No.
            requisition.RequisitionNo = GetCurrentFiscalYearRequisitionNo(db, requisition.FiscalYearId);
            /* requisition.CreatedOn = DateTime.Now;
             requisition.RequisitionDate = DateTime.Now;*/

            db.StoreRequisition.Add(requisition);
            await db.SaveChangesAsync();

            //getting the lastest RequistionId 
            int lastRequId = requisition.RequisitionId;

            //assiging the RequisitionId and CreatedOn i requisitionitem list
            requisitionItems.ForEach(item =>
            {
                item.RequisitionId = lastRequId;
                item.CreatedOn = DateTime.Now;
                item.AuthorizedOn = DateTime.Now;
                item.PendingQuantity = (double)item.Quantity;
                db.StoreRequisitionItems.Add(item);

            });
            //this Save for requisitionItems
            await db.SaveChangesAsync();
            return lastRequId;
        }
        //get the Requisition No according to current fiscal year.
        public static int GetCurrentFiscalYearRequisitionNo(PharmacyDbContext dB, int fiscalYearId)
        {
            int requisitionNo = (from req in dB.StoreRequisition
                                 where req.FiscalYearId == fiscalYearId
                                 select req.RequisitionNo).DefaultIfEmpty(0).Max();
            return requisitionNo + 1;
        }

        public PHRMStoreRequisitionModel UpdateDispensaryRequisition(PHRMStoreRequisitionModel value)
        {
            throw new NotImplementedException();
        }

        public async Task<int> ReceiveDispatchedStocks(int dispatchId, string receivedRemarks, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    List<PHRMDispatchItemsModel> dispatchItemsToUpdate = await db.StoreDispatchItems.Where(itm => itm.DispatchId == dispatchId).ToListAsync();
                    if (dispatchItemsToUpdate == null || dispatchItemsToUpdate.Count == 0) { throw new Exception("Items Not Found."); };

                    //  Incoming Stock Transaction Types
                    IReadOnlyList<string> IncomingTxns = new List<string>() { ENUM_PHRM_StockTransactionType.TransferItem, ENUM_PHRM_StockTransactionType.DispatchedItem, ENUM_PHRM_StockTransactionType.DispatchedItemReceivingSide, ENUM_PHRM_StockTransactionType.SubStoreDispatchTo };

                    foreach (var dispatchedItem in dispatchItemsToUpdate)
                    {
                        // Find stock txns for each dispatched item to get the stock id.
                        var stockTxnList = await db.StockTransactions.Where(ST => ST.ReferenceNo == dispatchedItem.DispatchItemsId && ST.IsActive == true && IncomingTxns.Contains(ST.TransactionType)).ToListAsync();

                        //To check if the dispatched item is already received or not.
                        var findDispatchedItem = db.StoreDispatchItems.Where(a => a.DispatchItemsId == dispatchedItem.DispatchItemsId).FirstOrDefault();
                        if (findDispatchedItem.ReceivedById != null) throw new Exception("Stock is already received.");

                        foreach (var stkTxn in stockTxnList)
                        {
                            var stock = await db.StoreStocks.FirstOrDefaultAsync(s => s.StoreStockId == stkTxn.StoreStockId && s.IsActive == true);
                            if (stock.StoreId == dispatchedItem.SourceStoreId)
                            {
                                // Find source store stock and update the quantity.
                                stock.DecreaseUnconfirmedQty(inQty: 0, outQty: stkTxn.OutQty);
                            }
                            else
                            {
                                // Find target stock id and update the stock quantity

                                stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + stkTxn.InQty);
                                stock.DecreaseUnconfirmedQty(inQty: stkTxn.InQty, outQty: 0);
                            }
                            await db.SaveChangesAsync();
                        }
                        //Update the Received Status in Dispatched Items Row in Dispatch Table
                        dispatchedItem.ReceivedById = currentUser.EmployeeId;
                        dispatchedItem.ReceivedOn = currentDate;
                        dispatchedItem.ReceivedRemarks = receivedRemarks;
                        await db.SaveChangesAsync();
                    }
                    dbResource.Commit();
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
            return dispatchId;
        }

        public async Task<int> ApproveRequisition(int requisitionId, RbacUser currentUser)
        {
            var requisition = await db.StoreRequisition.FindAsync(requisitionId);
            if (requisition == null) throw new KeyNotFoundException();

            requisition.RequisitionStatus = "complete";
            requisition.ApprovedBy = currentUser.EmployeeId;
            requisition.ApprovedOn = DateTime.Now;
            await db.SaveChangesAsync();

            List<PHRMStoreRequisitionItemsModel> requisitionItems = await db.StoreRequisitionItems.Where(r => r.RequisitionId == requisitionId).ToListAsync();
            if (requisitionItems == null) throw new KeyNotFoundException();
            foreach (var item in requisitionItems)
            {
                item.RequisitionItemStatus = "complete";
                await db.SaveChangesAsync();
            }

            return requisitionId;
        }

        public async Task<bool> CancelRequisitionItems(CanceRequisitionItemsQueryModel value, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {

                    var currentDate = DateTime.Now;
                    // run a for loop for each requisitionitemid inside the query model
                    foreach (var reqItemId in value.RequisitionItemIdList)
                    {
                        // find the requisition item entity in db for each item id 
                        var requisitionItem = await db.StoreRequisitionItems.FindAsync(reqItemId);

                        //Update the pending quantity, status, cancelled by, cancelled on, cancel remarks, cancel quantity for each item
                        requisitionItem.CancelQuantity = requisitionItem.PendingQuantity;
                        requisitionItem.PendingQuantity = 0;
                        requisitionItem.RequisitionItemStatus = "cancelled";
                        requisitionItem.CancelledBy = currentUser.EmployeeId;
                        requisitionItem.CancelledOn = currentDate;
                        requisitionItem.CancelRemarks = value.CancelRemarks;
                        await db.SaveChangesAsync();

                    }
                    //Check if all the requisition items for that particular requisition id is either complete or cancelled.
                    var isRequisitionComplete = await db.StoreRequisitionItems.Where(s => s.RequisitionId == value.RequisitionId).AllAsync(r => r.RequisitionItemStatus == "complete" || r.RequisitionItemStatus == "cancelled");

                    //Check if all the requisition items for that particular requisition id is cancelled.
                    var isRequisitionCancelled = await db.StoreRequisitionItems.Where(s => s.RequisitionId == value.RequisitionId).AllAsync(r => r.RequisitionItemStatus == "cancelled");

                    // If complete or cancell, update the requisition status for that requisition to complete.
                    if (isRequisitionComplete)
                    {
                        var requisition = await db.StoreRequisition.FindAsync(value.RequisitionId);
                        requisition.RequisitionStatus = "complete";
                        await db.SaveChangesAsync();

                    }
                    // If cancelled, update the requisition status for that requisition to cancelled.
                    if (isRequisitionCancelled)
                    {
                        var requisition = await db.StoreRequisition.FindAsync(value.RequisitionId);
                        requisition.RequisitionStatus = "cancelled";
                        await db.SaveChangesAsync();

                    }
                    dbResource.Commit();

                    return true;
                }
                catch (Exception ex)
                {

                    dbResource.Rollback();
                    throw ex;
                }
            }

        }
    }

    #region ViewModels,DTOS
    public class CanceRequisitionItemsQueryModel
    {
        public int RequisitionId { get; set; }
        public IList<int> RequisitionItemIdList { get; set; }
        public string CancelRemarks { get; set; }
    }
    public class GetDispatchListForItemReceiveVm
    {
        public GetItemReceiveRequisitionDto RequisitionDetail { get; set; }
        public List<GetItemReceiveDispatchDto> DispatchDetail { get; set; }
    }
    public class GetItemReceiveRequisitionDto
    {
        public int RequisitionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
    }

    public class GetItemReceiveDispatchDto
    {
        public int? DispatchId { get; set; }
        public string ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        public string DispatchedRemarks { get; set; }
        public IEnumerable<GetReceiveRequisitionItemDto> RequisitionItems { get; set; }

    }

    public class GetReceiveRequisitionItemDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public double? RequestedQuantity { get; set; }
        /*public double? PendingQuantity { get; set; }*/
        public IEnumerable<GetReceiveDispatchItemDto> DispatchedItems { get; set; }
        public double? TotalDispatchedQuantity { get; set; }
    }

    public class GetReceiveDispatchItemDto
    {
        public int DispatchItemsId { get; set; }
        public string BatchNo { get; set; }
        public string RackNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double DispatchedQuantity { get; set; }
        public string ItemRemarks { get; set; }
        public double? PendingQuantity { get; set; }
    }
    #endregion

    public class RequisitionDetail_DTO
    {
        public int RequisitionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
    }

    public class DispatchDetail_DTO
    {
        public int? DispatchId { get; set; }
        public string ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        public string DispatchedRemarks { get; set; }
        public List<DispatchItemDetail_DTO> DispatchItems { get; set; }
    }

    public class DispatchItemDetail_DTO
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public double? RequestedQuantity { get; set; }
        public int DispatchItemsId { get; set; }
        public string BatchNo { get; set; }
        public string RackNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double DispatchedQuantity { get; set; }
        public string ItemRemarks { get; set; }
        public decimal PendingQuantity { get; set; }
    }

    public class RequisitionDispatchToReceive_DTO
    {
        public RequisitionDetail_DTO Requisition { get; set; }
        public List<DispatchDetail_DTO> Dispatch { get; set; }
    }
}
