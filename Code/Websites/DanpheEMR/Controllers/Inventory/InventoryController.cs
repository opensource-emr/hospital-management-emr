using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using System.IO;
using System.Data;
using DanpheEMR.Services;
using DanpheEMR.ServerModel.InventoryModels;
using Microsoft.AspNetCore.Hosting;
using DanpheEMR.ViewModel.Procurement;
using DanpheEMR.ViewModel;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class InventoryController : CommonController
    {
        private IVerificationService _verificationService;
        private IInventoryReceiptNumberService _receiptNumberService;
        private static IHostingEnvironment _environment;


        public InventoryController(IHostingEnvironment env, IOptions<MyConfiguration> _config, IVerificationService verificationService, IInventoryReceiptNumberService receiptNumberService) : base(_config)
        {
            _verificationService = verificationService;
            _receiptNumberService = receiptNumberService;
            _environment = env;
        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType,
            int purchaseOrderId,
            int RequisitionId,
            int vendorId,
            string status,
            int ItemId,
            int goodsReceiptId,
            DateTime CreatedOn,
            int ReqForQuotationDetailById,
            int QuotationItemById,
            int ReqForQuotationId,
            int DispatchId,
            DateTime FromDate,
            DateTime ToDate,
            int FiscYrId,
            int FixedAssetStockId,
            int fixedAssetStockId,
            int GoodsReceiptNo,
            int StoreId,
            string BatchNo,
            DateTime ExpiryDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
                MasterDbContext masterDbContext = new MasterDbContext(connString);
                responseData.Status = "OK";

                if (reqType == "VendorList")
                {
                    string returnValue = string.Empty;

                    List<VendorMasterModel> VendorList = inventoryDbContext.Vendors.ToList();
                    foreach (VendorMasterModel vendor in VendorList)
                    {
                        vendor.DefaultItem = DanpheJSONConvert.DeserializeObject<List<int>>(vendor.DefaultItemJSON);
                    }
                    responseData.Status = "OK";
                    responseData.Results = VendorList;
                }
                if (reqType == "TermsList")
                {
                    string returnValue = string.Empty;

                    List<InventoryTermsModel> TermsList = inventoryDbContext.InventoryTerms.ToList();

                    responseData.Status = "OK";
                    responseData.Results = TermsList;
                }
                #region GET: requisition item-wise list
                else if (reqType == "itemwiseRequistionList")
                {
                    var rItems = (from rItms in inventoryDbContext.RequisitionItems
                                  where (rItms.RequisitionItemStatus == "active" || rItms.RequisitionItemStatus == "partial")
                                  group rItms by new
                                  {
                                      rItms.ItemId,
                                      rItms.Item.ItemName
                                  } into p
                                  select new
                                  {
                                      ItemId = p.Key.ItemId,
                                      ItemName = p.Key.ItemName,
                                      Quantity = p.Sum(a => (double)(a.Quantity) - a.ReceivedQuantity)
                                  }).ToList();
                    var stks = (from stk in inventoryDbContext.StoreStocks
                                group stk by new
                                {
                                    stk.ItemId
                                } into q
                                select new
                                {
                                    ItemId = q.Key.ItemId,
                                    AvailableQuantity = q.Sum(a => a.AvailableQuantity)
                                }).ToList();
                    var reqstkItems = (from r in rItems
                                       join stk in stks on r.ItemId equals stk.ItemId into stkTemp
                                       from s in stkTemp.DefaultIfEmpty()
                                       select new
                                       {
                                           ItemId = r.ItemId,
                                           ItemName = r.ItemName,
                                           Quantity = r.Quantity,
                                           AvailableQuantity = (s != null) ? s.AvailableQuantity : 0
                                       }).OrderBy(a => a.ItemName).ToList();
                    responseData.Results = reqstkItems;
                }
                #endregion
                #region//Get All ItemName,ItemId from Stock & ItemRate as StandardRate from GoodsReceiptItems table
                //Get VAT against ItemId from ItemMaster table
                //which has Available Quantity >0 in Stock Table  for WriteOff functinality
                else if (reqType != null && reqType.ToLower() == "getavailableqtyitemlist")
                {
                    var requestDetails = (from stock in inventoryDbContext.StoreStocks
                                          join items in inventoryDbContext.Items on stock.ItemId equals items.ItemId
                                          join grItems in inventoryDbContext.GoodsReceiptItems on stock.ItemId equals grItems.ItemId
                                          where stock.AvailableQuantity > 0 && stock.StoreId == StoreId
                                          group items by new { items.ItemId, items.Code, items.ItemName, items.StandardRate, items.VAT, grItems.ItemRate, stock.AvailableQuantity } into itms
                                          select new
                                          {
                                              ItemId = itms.Key.ItemId,
                                              ItemName = itms.Key.ItemName,
                                              Rate = itms.Key.ItemRate,
                                              VAT = itms.Key.VAT,
                                              Code = itms.Key.Code,
                                              AvailableQuantity = itms.Key.AvailableQuantity,
                                          }
                                       ).OrderBy(a => a.ItemName).ToList();

                    responseData.Results = requestDetails;

                }
                #endregion
                #region //Get RequisitionItems by Requisition Id don't check any status this for View Purpose
                else if (reqType != null && reqType.ToLower() == "requisitionitemsforview")
                {
                    //this for get employee Name

                    var reqdetail = inventoryDbContext.Requisitions.Where(req => req.RequisitionId == RequisitionId).Select(req => new { req.RequisitionDate, req.RequisitionNo, req.IssueNo, req.RequisitionStatus, req.Remarks, req.VerificationId }).FirstOrDefault();

                    var requisitionItems = (from reqItems in inventoryDbContext.RequisitionItems
                                            join itm in inventoryDbContext.Items on reqItems.ItemId equals itm.ItemId
                                            join grplj in inventoryDbContext.GoodsReceiptItems on itm.ItemId equals grplj.ItemId into reqItemLJ
                                            where reqItems.RequisitionId == RequisitionId && (reqdetail.RequisitionStatus == "withdrawn" || reqdetail.RequisitionStatus == "cancelled" || reqItems.IsActive == true)
                                            from reqItm in reqItemLJ.DefaultIfEmpty()
                                                // join emp in masterDbContext.Employee on reqItems.CreatedBy equals emp.EmployeeId
                                            select new
                                            {
                                                reqItems.ItemId,
                                                reqItems.RequisitionItemId,
                                                reqItems.PendingQuantity,
                                                reqItems.Quantity,
                                                reqItems.Remark,
                                                reqItems.ReceivedQuantity,
                                                reqItems.CreatedBy,
                                                reqItems.CancelQuantity,
                                                reqItems.CancelBy,
                                                reqItems.FirstWeekQty,
                                                reqItems.SecondWeekQty,
                                                reqItems.ThirdWeekQty,
                                                reqItems.FourthWeekQty,
                                                reqItems.MINDate,
                                                reqItems.MINNo,
                                                reqItems.MSSNO,
                                                reqItems.CancelOn,
                                                reqItems.CancelRemarks,
                                                // CreatedByName= emp.FirstName +' '+emp.LastName,
                                                CreatedOn = reqdetail.RequisitionDate,
                                                reqItems.RequisitionItemStatus,
                                                itm.ItemName,
                                                itm.Code,
                                                reqItems.RequisitionId,
                                                reqdetail.IssueNo,
                                                reqdetail.RequisitionNo,
                                                ItemRate = (reqItm != null) ? reqItm.ItemRate : 0,
                                                reqItems.IsActive
                                            }
                                         ).ToList();
                    var employeeList = (from emp in inventoryDbContext.Employees select emp).ToList();

                    var requestDetails = (from reqItem in requisitionItems
                                          join emp in inventoryDbContext.Employees on reqItem.CreatedBy equals emp.EmployeeId
                                          join dispt in inventoryDbContext.DispatchItems on reqItem.RequisitionItemId equals dispt.RequisitionItemId into dispTemp
                                          from disp in dispTemp.DefaultIfEmpty()
                                          select new
                                          {
                                              reqItem.ItemId,
                                              PendingQuantity = reqItem.PendingQuantity,
                                              DispatchedQuantity = dispTemp.Where(a => a.RequisitionItemId == reqItem.RequisitionItemId).Select(x => x.DispatchedQuantity).LastOrDefault(),
                                              reqItem.Quantity,
                                              reqItem.Remark,
                                              ReceivedQuantity = disp == null ? 0 : (reqItem.Quantity - (decimal)Convert.ToDecimal(reqItem.PendingQuantity)),
                                              reqItem.CreatedBy,
                                              CreatedByName = emp.FullName,
                                              reqItem.CreatedOn,
                                              reqItem.RequisitionItemStatus,
                                              reqItem.ItemName,
                                              reqItem.CancelQuantity,
                                              CancelBy = reqItem.CancelBy != null ? VerificationBL.GetNameByEmployeeId(reqItem.CancelBy ?? 0, inventoryDbContext) : "",
                                              reqItem.CancelOn,
                                              reqItem.CancelRemarks,
                                              reqItem.Code,
                                              reqItem.FirstWeekQty,
                                              reqItem.SecondWeekQty,
                                              reqItem.ThirdWeekQty,
                                              reqItem.FourthWeekQty,
                                              reqItem.MINDate,
                                              reqItem.MINNo,
                                              reqItem.MSSNO,
                                              TotalAmount = reqItem.ItemRate * (decimal)(dispTemp.Where(a => a.RequisitionItemId == reqItem.RequisitionItemId).Select(x => x.DispatchedQuantity).LastOrDefault()),
                                              reqdetail.RequisitionNo,
                                              reqdetail.IssueNo,
                                              Remarks = reqdetail.Remarks, //this is the main remark against the whole requisition.
                                              reqItem.RequisitionId,
                                              ReceivedBy = disp == null ? "" : disp.ReceivedBy,
                                              DispatchRemarks = disp == null ? "" : disp.Remarks,
                                              DispatchedByName = disp == null ? "" : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName,
                                              RequisitionItemId = reqItem.RequisitionItemId,
                                              reqItem.IsActive
                                          }
                        ).ToList().GroupBy(a => a.ItemId).Select(g => new
                        {
                            ItemId = g.Key,
                            PendingQuantity = g.Select(a => a.PendingQuantity).FirstOrDefault(),
                            Quantity = g.Select(a => a.Quantity).FirstOrDefault(),
                            DispatchedQuantity = g.Select(a => a.DispatchedQuantity).FirstOrDefault(),
                            Remark = g.Select(a => a.Remark).FirstOrDefault(),
                            Remarks = g.Select(a => a.Remarks).FirstOrDefault(),
                            ReceivedQuantity = g.Select(a => a.ReceivedQuantity).FirstOrDefault(),
                            CancelQuantity = g.Select(a => a.CancelQuantity).FirstOrDefault(),
                            CreatedBy = g.Select(a => a.CreatedBy).FirstOrDefault(),
                            CancelBy = g.Select(a => a.CancelBy).FirstOrDefault(),
                            CancelOn = g.Select(a => a.CancelOn).FirstOrDefault(),
                            CancelRemarks = g.Select(a => a.CancelRemarks).FirstOrDefault(),
                            CreatedByName = g.Select(a => a.CreatedByName).FirstOrDefault(),
                            CreatedOn = g.Select(a => a.CreatedOn).FirstOrDefault(),
                            RequisitionItemStatus = g.Select(a => a.RequisitionItemStatus).FirstOrDefault(),
                            ItemName = g.Select(a => a.ItemName).FirstOrDefault(),
                            Code = g.Select(a => a.Code).FirstOrDefault(),
                            TotalAmount = g.Select(a => a.TotalAmount).LastOrDefault(),
                            RequisitionNo = g.Select(a => a.RequisitionNo).FirstOrDefault(),
                            IssueNo = g.Select(a => a.IssueNo).FirstOrDefault(),
                            RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                            ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                            FirstWeekQty = g.Select(a => a.FirstWeekQty).FirstOrDefault(),
                            SecondWeekQty = g.Select(a => a.SecondWeekQty).FirstOrDefault(),
                            ThirdWeekQty = g.Select(a => a.ThirdWeekQty).FirstOrDefault(),
                            FourthWeekQty = g.Select(a => a.FourthWeekQty).FirstOrDefault(),
                            MINDate = g.Select(a => a.MINDate).FirstOrDefault(),
                            MINNo = g.Select(a => a.MINNo).FirstOrDefault(),
                            MSSNO = g.Select(a => a.MSSNO).FirstOrDefault(),
                            DispatchRemarks = g.Select(a => a.DispatchRemarks).FirstOrDefault(),
                            DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault(),
                            RequisitionItemId = g.Select(a => a.RequisitionItemId).FirstOrDefault(),
                            IsActive = g.Select(a => a.IsActive).FirstOrDefault()
                        }).ToList();

                    var verifiers = (reqdetail.VerificationId != null) ? VerificationBL.GetVerifiersList(reqdetail.VerificationId ?? 0, inventoryDbContext) : null;
                    var dispatchers = VerificationBL.GetDispatchersList(RequisitionId, inventoryDbContext);
                    responseData.Results = new { requestDetails, Verifiers = verifiers, Dispatchers = dispatchers };
                }
                #endregion
                #region //Get dIspatch Details
                else if (reqType != null && reqType.ToLower() == "dispatchview")
                {
                    var DispatchList = InventoryBL.GetDispatchesFromRequisitionId(RequisitionId, inventoryDbContext);
                    responseData.Results = DispatchList;
                }
                #endregion

                #region //Get Cancel Details
                else if (reqType != null && reqType.ToLower() == "cancelview")
                {
                    var requisitionItems = (from reqItems in inventoryDbContext.RequisitionItems
                                            where reqItems.RequisitionId == RequisitionId && reqItems.CancelQuantity > 0
                                            select reqItems).ToList();
                    var employeeList = (from emp in inventoryDbContext.Employees select emp).ToList();

                    var requestDetails = (from reqItem in requisitionItems
                                          join emp in inventoryDbContext.Employees on reqItem.CancelBy equals emp.EmployeeId
                                          join itm in inventoryDbContext.Items on reqItem.ItemId equals itm.ItemId
                                          // join dispt in inventoryDbContext.DispatchItems on reqItem.RequisitionItemId equals dispt.RequisitionItemId into dispTemp
                                          // from disp in dispTemp.DefaultIfEmpty()
                                          select new
                                          {
                                              CreatedByName = emp.FullName,
                                              reqItem.CancelOn,
                                              // reqItem.CancelBy,
                                              // disp.CreatedOn,
                                              reqItem.RequisitionId,
                                              reqItem.ItemId,
                                              itm.ItemName
                                              // disp.DispatchId,
                                              // ReceivedBy = disp == null ? null : disp.ReceivedBy,
                                              // DispatchedByName = disp == null ? null : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName
                                          }
                        ).ToList().GroupBy(a => a.ItemId).Select(g => new
                        {
                            CancelByName = g.Select(a => a.CreatedByName).FirstOrDefault(),
                            CancelOn = g.Select(a => a.CancelOn).FirstOrDefault(),
                            RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                            ItemId = g.Select(a => a.ItemId).FirstOrDefault(),
                            ItemName = g.Select(a => a.ItemName).FirstOrDefault()
                            //  DispatchId = g.Select(a => a.DispatchId).FirstOrDefault(),
                            // ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                            //  DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault()
                        }).ToList();
                    responseData.Results = requestDetails;
                }
                #endregion

                #region //Get dIspatch Details
                else if (reqType != null && reqType.ToLower() == "dispatchviewbydispatchid")
                {
                    InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                    var dispatchDetails = invreportingDbContext.DispatchDetail(DispatchId);
                    responseData.Results = dispatchDetails;
                }
                #endregion


                #region // Get All Authorized purchase Order List from INV_TXN_PurchaseOrder where POStatus = active
                else if (reqType != null && reqType == "returnItemDetails")
                {
                    var returnList = inventoryDbContext.ReturnToVendorItems.ToList().Where(r => r.CreatedOn == CreatedOn && r.VendorId == vendorId);
                    var returnItemList = (from list in returnList
                                          join grItem in inventoryDbContext.GoodsReceipts on list.GoodsReceiptId equals grItem.GoodsReceiptID
                                          join vendor in inventoryDbContext.Vendors on list.VendorId equals vendor.VendorId
                                          join item in inventoryDbContext.Items on list.ItemId equals item.ItemId
                                          join emp in inventoryDbContext.Employees on list.CreatedBy equals emp.EmployeeId
                                          select new
                                          {
                                              ReturnToVendorItemId = list.ReturnToVendorItemId,
                                              VendorName = vendor.VendorName,
                                              ReturnQuantity = list.Quantity,
                                              ItemName = item.ItemName,
                                              ItemRate = list.ItemRate,
                                              TotalAmount = list.TotalAmount,
                                              ItemCode = item.Code,
                                              Remarks = list.Remark,
                                              GoodsReceiptId = list.GoodsReceiptId,
                                              CreatedOn = list.CreatedOn,
                                              SupplierBillNo = grItem.BillNo,
                                              VAT = list.VAT,
                                              CreatedByName = emp.FullName,
                                          }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = returnItemList;
                }
                #endregion

                #region // Get All Authorized purchase Order List from INV_TXN_PurchaseOrder where POStatus = active
                else if (reqType != null && reqType.ToLower() == "purchaseorderlist")
                {

                    //in status there is comma seperated values so we are splitting status by using  comma(,)
                    // this all we have do because we have to check multiple status at one call
                    //like when user select all we have to we get all PO by matching the status like complete,active,partial and initiated...
                    string[] poStatuses = status.Split(',');
                    var testdate = ToDate.AddDays(1);
                    //in this there is 2 join  ..
                    // first join to get vendors name and second one to check the status 
                    //and second join is with poStatus because it has all the status the need to be checked...
                    var POList = (from po in inventoryDbContext.PurchaseOrders
                                  join v in inventoryDbContext.Vendors on po.VendorId equals v.VendorId
                                  join stat in poStatuses on po.POStatus equals stat
                                  join pr in inventoryDbContext.PurchaseRequest on po.RequisitionId equals pr.PurchaseRequestId into prJ
                                  from prLJ in prJ.DefaultIfEmpty()
                                  join verif in inventoryDbContext.Verifications on po.VerificationId equals verif.VerificationId into verifJ
                                  from verifLJ in verifJ.DefaultIfEmpty()
                                  where po.PoDate > FromDate && po.CreatedOn < testdate && po.StoreId == StoreId
                                  orderby po.PoDate descending
                                  select new
                                  {
                                      PurchaseOrderId = po.PurchaseOrderId,
                                      PurchaseOrderNo = po.PONumber,
                                      VendorId = po.VendorId,
                                      PoDate = po.PoDate,
                                      POStatus = po.POStatus,
                                      SubTotal = po.SubTotal,
                                      TotalAmount = po.TotalAmount,
                                      VAT = po.VAT,
                                      VendorName = v.VendorName,
                                      VendorContact = v.ContactNo,
                                      PRNumber = prLJ.PRNumber,
                                      IsVerificationEnabled = po.IsVerificationEnabled,
                                      VerifierIds = po.VerifierIds,
                                      MaxVerificationLevel = 0,
                                      CurrentVerificationLevelCount = (verifLJ == null) ? 0 : verifLJ.CurrentVerificationLevelCount
                                  }).OrderByDescending(a => a.PurchaseOrderId).ToList();
                    responseData.Results = POList;
                }
                #endregion
                #region // Get all Purchase Order Items which are authorized and pending for Goods receipt 
                else if (reqType != null && reqType.ToLower() == "purchaseorderitemsbypoid")
                {
                    //Comment By Nagesh:- We maintain Ony 'partial','active' , 'complete','cancel' status for Purchase Order 
                    //we no need to maintain 'partial' status for PurchaseOrder
                    //We maintain 'initiated','partial','active','complete','cancel' status for Purchase Order Items
                    PurchaseOrderModel requestDetails = (from PO in inventoryDbContext.PurchaseOrders
                                                         where (PO.POStatus == "partial" || PO.POStatus == "active") && (PO.PurchaseOrderId == purchaseOrderId)
                                                         select PO)
                                          .Include(v => v.Vendor)
                                          .Include(POI => POI.PurchaseOrderItems.Select(i => i.Item))
                                          .FirstOrDefault();


                    string[] BadPOItemStatus = { "complete", "cancel", "cancelled", "withdrawn" };
                    requestDetails.PurchaseOrderItems = requestDetails.PurchaseOrderItems.Where(POI => BadPOItemStatus.Contains(POI.POItemStatus) == false || POI.IsActive == true).ToList();

                    responseData.Results = requestDetails;
                }
                #endregion
                #region//Get All Requisition Items and Related Stock records(by ItemId of RequisitionItems table) 
                //for Dispatch Items to department against Requisition Id
                else if (reqType != null && reqType.ToLower() == "requisitionbyid")
                {
                    RequisitionStockVM requisitionStockVM = new RequisitionStockVM();

                    //Getting Requisition and Requisition Items by Requisition Id
                    //Which RequisitionStatus and requisitionItemsStatus is not 'complete','cancel' and 'initiated'
                    var incompleteReqStatus = new string[3] { "active", "approved", "partial" };
                    RequisitionModel requisitionDetails = (
                                                            from requisition in inventoryDbContext.Requisitions
                                                            where requisition.RequisitionId == RequisitionId
                                                                && incompleteReqStatus.Contains(requisition.RequisitionStatus)
                                                            select requisition
                                                          ).Include(rItems => rItems.RequisitionItems.Select(i => i.Item))
                                                           .FirstOrDefault();


                    //This for remove complete, initiated and cancel Requisition Items from List
                    //added Decremental counter to avoid index-outofRange exception: since we're removing items from the list inside the loop of its own.
                    var completedStatus = new string[3] { "complete", "initiated", "cancel" };
                    requisitionDetails.RequisitionItems = requisitionDetails.RequisitionItems.Where(r => !completedStatus.Contains(r.RequisitionItemStatus)).ToList();

                    //This gets the stock record with Matching ItemId of Requisition Item table
                    foreach (var rItem in requisitionDetails.RequisitionItems)
                    {
                        rItem.AvailableQuantity = (
                                                        from stock in inventoryDbContext.StoreStocks
                                                        where stock.ItemId == rItem.ItemId
                                                            && stock.AvailableQuantity > 0
                                                            && stock.IsActive == true
                                                            && stock.StoreId == requisitionDetails.RequestToStoreId
                                                        group stock by stock.ItemId into stockG
                                                        select stockG.Sum(s => s.AvailableQuantity)
                                                    ).FirstOrDefault();
                    }


                    requisitionStockVM.requisition = requisitionDetails;
                    responseData.Results = requisitionStockVM;
                }
                #endregion

                #region Requisition-Items for View (in Internal-Requisition page)

                else if (reqType != null && reqType.ToLower() == "get-requisitionitems-for-view")
                {
                    //this stored proc returns two tables: 1. RequisitionItemsInfo and 2. Dispatch info.
                    DataSet dsReqDetails = DALFunctions.GetDatasetFromStoredProc("INV_TXN_VIEW_GetRequisitionItemsInfoForView",
                        new List<SqlParameter>() { new SqlParameter("@RequisitionId", RequisitionId) },
                        inventoryDbContext
                        );
                    var verificationId = inventoryDbContext.Requisitions.Where(R => R.RequisitionId == RequisitionId).Select(R => R.VerificationId).FirstOrDefault();
                    List<VerificationActor> verifiers = null;
                    if (verificationId != null)
                    {
                        verifiers = VerificationBL.GetVerifiersList(verificationId ?? 0, inventoryDbContext);
                    }
                    var dispatchers = VerificationBL.GetDispatchersList(RequisitionId, inventoryDbContext);
                    // return anynomous type and handle further in clilent side.. 
                    responseData.Results = new { RequisitionItemsInfo = dsReqDetails.Tables[0], DispatchInfo = dsReqDetails.Tables[1], Verifiers = verifiers, Dispatchers = dispatchers };

                }
                #endregion

                #region GET : Internal > Dispatch-All : get all requisition items by ItemId
                //getting requisition items by item id for DISPATCH-ALL
                else if (reqType != null && reqType.ToLower() == "requisitionbyitemid")
                {
                    RequisitionsStockVM reqItemStockVM = new RequisitionsStockVM();
                    List<RequisitionModel> requList = (from requisition in inventoryDbContext.Requisitions
                                                       where (requisition.RequisitionStatus == "partial" || requisition.RequisitionStatus == "active")
                                                       select requisition)
                                                                .Include(rItems => rItems.RequisitionItems.Select(i => i.Item))
                                                                .ToList();
                    List<DepartmentModel> deptList = (from dept in masterDbContext.Departments
                                                      select dept).ToList();
                    for (int i = 0; i < requList.Count; i++)
                    {
                        for (int j = requList[i].RequisitionItems.Count - 1; j >= 0; j--)
                        {
                            //removing requisition items with status as complete,initiated,cancel and one which ItemId doesnt match with the requested ItemId.
                            if (requList[i].RequisitionItems[j].RequisitionItemStatus == "complete"
                                || requList[i].RequisitionItems[j].RequisitionItemStatus == "initiated"
                                || requList[i].RequisitionItems[j].RequisitionItemStatus == "cancel")
                            {
                                requList[i].RequisitionItems.RemoveAt(j);
                            }
                        }
                    }
                    var reqList = (from req in requList
                                   join dept in deptList on req.DepartmentId equals dept.DepartmentId
                                   select new RequisiteDeptpair
                                   {
                                       req = req,
                                       dept = dept
                                   }).ToList();
                    if (reqList.Count > 0)
                    {
                        foreach (var r in reqList)
                        {
                            reqItemStockVM.reqDeptList.Add(r);
                        }
                    }
                    List<StoreStockModel> stocks = (from stock in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                                    where (stock.ItemId == ItemId && stock.AvailableQuantity > 0)
                                                    select stock)
                                                   .OrderBy(s => s.StockMaster.ExpiryDate).ToList();

                    responseData.Results = reqItemStockVM;
                }
                #endregion

                else if (reqType != null && reqType == "writeOffItemList")
                {
                    var writeOffItemList = (from writeOff in inventoryDbContext.WriteOffItems
                                            join item in inventoryDbContext.Items on writeOff.ItemId equals item.ItemId
                                            join unit in inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
                                            from unit in ps.DefaultIfEmpty()
                                            select new
                                            {
                                                ItemName = item.ItemName,
                                                BatchNO = writeOff.BatchNO,
                                                WriteOffQuantity = writeOff.WriteOffQuantity,
                                                WriteOffDate = writeOff.WriteOffDate,
                                                ItemRate = writeOff.ItemRate,
                                                TotalAmount = writeOff.TotalAmount,
                                                Remark = writeOff.Remark,
                                                unit.UOMName,
                                                Code = item.Code
                                            }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = writeOffItemList;
                }

                #region GET: Internal > ReturnVendorItemList
                else if (reqType != null && reqType == "returnVendorItemList")
                {
                    var returnVendorItemList = (from vendorItem in inventoryDbContext.ReturnToVendorItems
                                                let storeId = inventoryDbContext.ReturnToVendor.FirstOrDefault(a => a.ReturnToVendorId == vendorItem.ReturnToVendorId).StoreId
                                                where storeId == StoreId
                                                group vendorItem by vendorItem.CreatedOn into vi
                                                join vendor in inventoryDbContext.Vendors on vi.FirstOrDefault().VendorId equals vendor.VendorId
                                                orderby vi.FirstOrDefault().ReturnToVendorItemId descending
                                                select new
                                                {
                                                    CreatedOn = vi.Key,
                                                    VendorId = vendor.VendorId,
                                                    VendorName = vendor.VendorName,
                                                    CreditNoteNo = vi.FirstOrDefault().CreditNoteNo
                                                }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = returnVendorItemList;
                }


                #endregion
                #region///getting vendoe details according the vendorId
                else if (reqType == "VendorDetails")
                {
                    string returnValue = string.Empty;
                    List<VendorMasterModel> vendorDetails = new List<VendorMasterModel>();


                    vendorDetails = (from vendor in inventoryDbContext.Vendors
                                     where vendor.VendorId == vendorId
                                     select vendor).ToList();

                    responseData.Results = vendorDetails;
                }

                #endregion
                else if (reqType == "getvendordetails")
                {
                    List<VendorMasterModel> Vendors = new List<VendorMasterModel>();

                    Vendors = (from Vendor in inventoryDbContext.Vendors
                               select Vendor).ToList();


                    responseData.Results = Vendors;
                }

                #region //Get Requisition List
                else if (reqType != null && reqType == "requisitionList")
                {
                    // in this we have to bring the data from 2 diffferent dbcontext master and inventory ..but
                    // we can not use to different dbcontext in one linq query ....
                    //so what i have done is first brought all active requisition in RequisitionList and department in DepartmentList 
                    //and then applied join and the conditions using both the list in requestDetails
                    List<DepartmentModel> DepartmentList = (from dept in masterDbContext.Departments
                                                            select dept).ToList();
                    //in status there is comma seperated values so we are splitting status by using  comma(,)
                    // this all we have do because we have to check multiple status at one call
                    //like when user select all we have to we get all Requisition by matching the status like complete,active,partial and initiated...
                    string[] requisitionStatus = status.Split(',');

                    //in this there is 2 join  ..
                    // first join to check the status  and second one to get vendors name 
                    //and second join is with RequisitionStatus because it has all the status the need to be checked...


                    List<RequisitionModel> RequisitionList = (from requ in inventoryDbContext.Requisitions
                                                              join reqItem in inventoryDbContext.RequisitionItems on ItemId equals reqItem.ItemId
                                                              join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                                              where requ.RequisitionId == reqItem.RequisitionId
                                                              orderby requ.RequisitionDate descending
                                                              select requ).ToList();

                    var requestDetails = (from rep in RequisitionList
                                          join dep in DepartmentList on rep.DepartmentId equals dep.DepartmentId
                                          join reqItem in inventoryDbContext.RequisitionItems on ItemId equals reqItem.ItemId
                                          where reqItem.RequisitionId == rep.RequisitionId
                                          select new
                                          {
                                              RequistionId = rep.RequisitionId,
                                              RequisitionDate = rep.RequisitionDate,
                                              DepartmentId = rep.DepartmentId,
                                              RequisitionStatus = rep.RequisitionStatus,
                                              DepartmentName = dep.DepartmentName,
                                              Quantity = (double)(reqItem.Quantity) - reqItem.ReceivedQuantity
                                          }).ToList();

                    for (var i = 0; i < requestDetails.Count; i++)
                    {
                        if (requestDetails[i].Quantity == 0)
                        {
                            requestDetails.RemoveAt(i);
                            i--;
                        }
                    }

                    responseData.Results = requestDetails;
                }
                #endregion
                #region GET: Internal > Requisition : dept/requisition wise list
                else if (reqType != null && reqType == "deptwiseRequistionList")
                {
                    string[] requisitionStatus = status.Split(',');
                    //we need data from 2 different dbContext, we cannot use them together in one linq query
                    //therefore, first we get dept,requisition and then using both the list we get final result
                    List<DepartmentModel> DepartmentList = (from dept in masterDbContext.Departments
                                                            select dept).ToList();

                    List<RequisitionModel> RequisitionList = (from requ in inventoryDbContext.Requisitions
                                                              join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                                              orderby requ.RequisitionDate descending
                                                              select requ).ToList();

                    var requestDetails = (from req in RequisitionList
                                          join dep in DepartmentList on req.DepartmentId equals dep.DepartmentId
                                          select new
                                          {
                                              RequistionId = req.RequisitionId,
                                              RequisitionDate = req.RequisitionDate,
                                              RequisitionStatus = req.RequisitionStatus,
                                              DepartmentName = dep.DepartmentName
                                          }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = requestDetails;
                }
                else if (reqType != null && reqType == "deptDetail")
                {
                    DepartmentModel departmentDetails = (from req in inventoryDbContext.Requisitions
                                                         where (req.RequisitionId == RequisitionId)
                                                         join dept in inventoryDbContext.Departments on req.DepartmentId equals dept.DepartmentId
                                                         select dept).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = departmentDetails;

                }
                #endregion

                else if (reqType == "goodsreceipstocklist")
                {
                    var testdate = ToDate.AddDays(1);
                    var activeGRStatus = new string[2] { "active", "verified" };

                    var goodsreceiptStockList = (from gorecipt in inventoryDbContext.GoodsReceipts
                                                 join vend in inventoryDbContext.Vendors on gorecipt.VendorId equals vend.VendorId
                                                 join fisc in inventoryDbContext.FiscalYears on gorecipt.FiscalYearId equals fisc.FiscalYearId into gs
                                                 from fisc in gs.DefaultIfEmpty()
                                                 where gorecipt.GoodsArrivalDate > FromDate
                                                     && gorecipt.GoodsArrivalDate < testdate
                                                     && activeGRStatus.Contains(gorecipt.GRStatus)
                                                     && gorecipt.StoreId == StoreId
                                                 select new
                                                 {
                                                     gorecipt.GoodsArrivalDate,
                                                     gorecipt.GoodsReceiptDate,
                                                     gorecipt.VendorBillDate,
                                                     gorecipt.GoodsReceiptID,
                                                     gorecipt.GoodsArrivalNo,
                                                     gorecipt.GoodsReceiptNo,
                                                     gorecipt.PurchaseOrderId,
                                                     gorecipt.GRCategory,
                                                     gorecipt.BillNo,
                                                     gorecipt.TotalAmount,
                                                     gorecipt.PaymentMode,
                                                     gorecipt.CreatedOn,
                                                     gorecipt.ReceivedRemarks,
                                                     vend.VendorName,
                                                     vend.ContactNo,
                                                     gorecipt.GRStatus
                                                 }).ToList().OrderByDescending(a => a.GoodsReceiptID);

                    responseData.Status = "OK";
                    responseData.Results = goodsreceiptStockList;
                }
                #region GET: External > GoodsReceiptList : get list of goodsreceipt for grid
                else if (reqType == "goodsreceipt")
                {
                    var testdate = ToDate.AddDays(1);//to include ToDate, 1 day was added--rusha 07/15/2019
                    var goodsReceiptList = (from GR in inventoryDbContext.GoodsReceipts
                                            join V in inventoryDbContext.Vendors on GR.VendorId equals V.VendorId
                                            join FY in inventoryDbContext.FiscalYears on GR.FiscalYearId equals FY.FiscalYearId into FYG
                                            from FYLJ in FYG.DefaultIfEmpty()
                                            join PO in inventoryDbContext.PurchaseOrders on GR.PurchaseOrderId equals PO.PurchaseOrderId into POG
                                            from POLJ in POG.DefaultIfEmpty()
                                            join VRF in inventoryDbContext.Verifications on GR.VerificationId equals VRF.VerificationId into VRFG
                                            from VRFLj in VRFG.DefaultIfEmpty()
                                            where GR.GoodsArrivalDate > FromDate && GR.GoodsArrivalDate < testdate && GR.StoreId == StoreId
                                            orderby GR.GoodsReceiptID descending
                                            select new
                                            {
                                                BillNo = GR.BillNo,
                                                GoodsReceiptID = GR.GoodsReceiptID,
                                                GoodsArrivalNo = GR.GoodsArrivalNo,
                                                GoodsReceiptNo = GR.GoodsReceiptNo,
                                                GRCategory = GR.GRCategory,
                                                TotalAmount = GR.TotalAmount,
                                                Remarks = GR.Remarks,
                                                VendorName = V.VendorName,
                                                CreatedOn = GR.CreatedOn,
                                                GoodsArrivalDate = GR.GoodsArrivalDate,
                                                GoodsReceiptDate = GR.GoodsReceiptDate,
                                                VendorBillDate = GR.VendorBillDate,
                                                ReceivedDate = GR.ReceivedDate,
                                                PurchaseOrderId = GR.PurchaseOrderId,
                                                PurchaseOrderNo = POLJ.PONumber,
                                                ContactNo = V.ContactNo,
                                                IsCancel = GR.IsCancel,
                                                PaymentMode = GR.PaymentMode,//sud: 4May'20--needed to show this in frontend..
                                                CurrentFiscalYear = FYLJ != null ? FYLJ.FiscalYearFormatted : String.Empty,
                                                GRStatus = GR.GRStatus,
                                                IsVerificationEnabled = GR.IsVerificationEnabled,
                                                VerifierIds = GR.VerifierIds,
                                                StoreId = GR.StoreId,
                                                MaxVerificationLevel = 0,
                                                CurrentVerificationLevelCount = (VRFLj == null) ? 0 : VRFLj.CurrentVerificationLevel,
                                                IsDonation = GR.IsDonation
                                            }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = goodsReceiptList;
                }
                #endregion


                else if (reqType == "get-goods-receipt-groupby-vendor")
                {
                    var Sno = 0;
                    var goodReceiptList = inventoryDbContext.GoodsReceipts.Where(a => a.IsCancel == false).ToList().GroupJoin(inventoryDbContext.Vendors.ToList(), a => a.VendorId, b => b.VendorId, (a, b) =>
                           new
                           {
                               VendorId = a.VendorId,
                               SubTotal = a.SubTotal,
                               DiscountAmount = a.DiscountAmount,
                               VATAmount = a.VATAmount,
                               TotalAmount = a.TotalAmount,
                               InvoiceNo = a.BillNo,
                               GoodArrivalDate = a.GoodsArrivalDate,
                               GoodReceiptDate = a.GoodsReceiptDate,
                               PurchaseOrderId = a.PurchaseOrderId,
                               IsCancel = a.IsCancel,
                               ContactNo = b.Select(s => s.ContactNo).FirstOrDefault(),
                               CreditPeriod = a.CreditPeriod,
                               SupplierName = b.Select(s => s.VendorName).FirstOrDefault(),

                           }).ToList().GroupBy(a => a.VendorId).OrderByDescending(a => goodsReceiptId).Select(
                        a => new
                        {
                            Sno = ++Sno,
                            VendorId = a.Select(s => s.VendorId).FirstOrDefault(),
                            SubTotal = a.Sum(s => s.SubTotal),
                            DiscountAmount = a.Sum(s => s.DiscountAmount),
                            VATAmount = a.Sum(s => s.VATAmount),
                            TotalAmount = a.Sum(s => s.TotalAmount),
                            VendorName = a.Select(s => s.SupplierName).FirstOrDefault(),
                            InvoiceNo = a.Select(s => s.InvoiceNo).FirstOrDefault(),
                            GoodReceiptDate = a.Select(s => s.GoodReceiptDate).FirstOrDefault(),
                            PurchaseOrderId = a.Select(s => s.PurchaseOrderId).FirstOrDefault(),
                            ContactNo = a.Select(s => s.ContactNo).FirstOrDefault(),
                            CreditPeriod = a.Select(s => s.CreditPeriod),
                            IsCancel = a.Select(s => s.IsCancel).FirstOrDefault(),
                        }
                        );

                    responseData.Status = "OK";
                    responseData.Results = goodReceiptList;
                }
                else if (reqType == "getGrDetailByVendorId")
                {
                    var Sno = 0;
                    var vendorList = inventoryDbContext.GoodsReceipts.Where(a => a.IsCancel == false && a.VendorId == vendorId).ToList().GroupJoin(inventoryDbContext.Vendors.ToList(), a => a.VendorId, b => b.VendorId, (a, b) =>
                           new
                           {
                               Sno = ++Sno,
                               VendorId = a.VendorId,
                               SubTotal = a.SubTotal,
                               Discount = a.DiscountAmount,
                               VATTotal = a.VATAmount,
                               TotalAmount = a.TotalAmount,
                               GoodsReceiptID = a.GoodsReceiptID,
                               InvoiceNo = a.BillNo,
                               ContactNo = b.Select(s => s.ContactNo),
                               GoodReceiptDate = a.ReceivedDate,
                               VendorName = b.Select(s => s.VendorName).FirstOrDefault()
                           }).ToList();




                    responseData.Status = "OK";
                    responseData.Results = vendorList;
                }
                #region GET: External > GoodsReceiptDetails : get detail of goodsreceipt for id
                else if (reqType == "GRItemsDetailsByGRId")
                {
                    try
                    {
                        var gritems = (from gritms in inventoryDbContext.GoodsReceiptItems
                                       join itms in inventoryDbContext.Items on gritms.ItemId equals itms.ItemId into itmsGroup
                                       from itm in itmsGroup.DefaultIfEmpty()
                                       join uom in inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId
                                       join category in inventoryDbContext.ItemCategoryMaster on itm.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                                       from ctg in ctgGroup.DefaultIfEmpty()
                                       where gritms.GoodsReceiptId == goodsReceiptId
                                       select new
                                       {
                                           ItemId = itm.ItemId,
                                           ItemName = itm.ItemName,
                                           ItemCode = itm.Code,
                                           MSSNO = itm.MSSNO,
                                           UOMName = uom.UOMName,
                                           ItemCategory = gritms.ItemCategory,//sud:26Sept'21--Updated to make same as other api.
                                           ItemCategoryCode = (ctg == null) ? "" : ctg.CategoryCode,
                                           BatchNO = gritms.BatchNO,
                                           ExpiryDate = gritms.ExpiryDate,
                                           InvoiceQuantity = gritms.ReceivedQuantity + gritms.RejectedQuantity,
                                           ReceivedQuantity = gritms.ReceivedQuantity,
                                           RejectedQuantity = gritms.RejectedQuantity,
                                           FreeQuantity = gritms.FreeQuantity,
                                           ItemRate = gritms.ItemRate,
                                           VATAmount = gritms.VATAmount,
                                           CcAmount = gritms.CcAmount,
                                           DiscountAmount = gritms.DiscountAmount,
                                           SubTotal = gritms.SubTotal,
                                           TotalAmount = gritms.TotalAmount,
                                           OtherCharge = gritms.OtherCharge,
                                           GoodsReceiptId = gritms.GoodsReceiptId,
                                           GoodsReceiptItemId = gritms.GoodsReceiptItemId,
                                           IsTransferredToACC = gritms.IsTransferredToACC,
                                           ManufactureDate = gritms.ManufactureDate,
                                           SamplingDate = gritms.SamplingDate,
                                           NoOfBoxes = gritms.NoOfBoxes,
                                           SamplingQuantity = gritms.SamplingQuantity,
                                           IdentificationLabel = gritms.IdentificationLabel,
                                           GRItemSpecification = gritms.GRItemSpecification,
                                           Remarks = gritms.Remarks,
                                           RegisterPageNumber = itm.RegisterPageNumber
                                       }).OrderBy(g => g.GoodsReceiptItemId).ToList();//sud:28Sept'21--to show in the same order as entry.
                        var grdetails = (from gr in inventoryDbContext.GoodsReceipts
                                         join ven in inventoryDbContext.Vendors on gr.VendorId equals ven.VendorId
                                         from po in inventoryDbContext.PurchaseOrders.Where(p => p.PurchaseOrderId == gr.PurchaseOrderId).DefaultIfEmpty()
                                         from ganFy in inventoryDbContext.InventoryFiscalYears.Where(a => a.StartDate <= gr.GoodsArrivalDate && a.EndDate >= gr.GoodsArrivalDate).DefaultIfEmpty()
                                         from fyLj in inventoryDbContext.FiscalYears.Where(fy => fy.FiscalYearId == gr.FiscalYearId).DefaultIfEmpty()
                                         where gr.GoodsReceiptID == goodsReceiptId
                                         select new
                                         {
                                             GoodsReceiptID = gr.GoodsReceiptID,
                                             GoodsArrivalNo = gr.GoodsArrivalNo,
                                             DonationId = gr.DonationId,
                                             GoodsArrivalFiscalYearFormatted = ganFy.FiscalYearName,
                                             GoodsReceiptNo = gr.GoodsReceiptNo,
                                             PurchaseOrderId = gr.PurchaseOrderId,
                                             PurchaseOrderDate = (po != null) ? po.PoDate : null,
                                             GoodsArrivalDate = gr.GoodsArrivalDate,
                                             GoodsReceiptDate = gr.GoodsReceiptDate,
                                             IMIRNo = gr.IMIRNo,
                                             IMIRDate = gr.IMIRDate,
                                             ReceivedDate = gr.ReceivedDate,
                                             BillNo = gr.BillNo,
                                             TotalAmount = gr.TotalAmount,
                                             SubTotal = gr.SubTotal,
                                             DiscountAmount = gr.DiscountAmount,
                                             TDSAmount = gr.TDSAmount,
                                             TotalWithTDS = gr.TotalWithTDS,
                                             CcCharge = gr.CcCharge,
                                             VATTotal = gr.VATTotal,
                                             IsCancel = gr.IsCancel,
                                             Remarks = gr.ReceivedRemarks,
                                             MaterialCoaDate = gr.MaterialCoaDate,
                                             MaterialCoaNo = gr.MaterialCoaNo,
                                             VendorName = ven.VendorName,
                                             ContactAddress = ven.ContactAddress,
                                             VendorNo = ven.ContactNo,
                                             CreditPeriod = gr.CreditPeriod,
                                             PaymentMode = gr.PaymentMode,
                                             OtherCharges = gr.OtherCharges,
                                             InsuranceCharge = gr.InsuranceCharge,
                                             CarriageFreightCharge = gr.CarriageFreightCharge,
                                             PackingCharge = gr.PackingCharge,
                                             TransportCourierCharge = gr.TransportCourierCharge,
                                             OtherCharge = gr.OtherCharge,
                                             IsTransferredToACC = gr.IsTransferredToACC == null ? false : gr.IsTransferredToACC,
                                             CancelRemarks = gr.CancelRemarks,
                                             CreatedBy = gr.CreatedBy,
                                             CreatedOn = gr.CreatedOn,
                                             CurrentFiscalYear = (fyLj != null) ? fyLj.FiscalYearFormatted : "",
                                             IsVerificationEnabled = gr.IsVerificationEnabled,
                                             VerifierIds = gr.VerifierIds,
                                             GRStatus = gr.GRStatus,
                                             GRCategory = gr.GRCategory,
                                             VendorBillDate = gr.VendorBillDate
                                         }).FirstOrDefault();
                        var CreatedById = grdetails.CreatedBy;
                        var creator = (from emp in masterDbContext.Employees
                                       join r in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                                       from role in roleTemp.DefaultIfEmpty()
                                       where emp.EmployeeId == CreatedById
                                       select new
                                       {
                                           Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                           Role = role.EmployeeRoleName
                                       }).FirstOrDefault();
                        //TODO: Please recheck the condition for editing date in GR : Sanjit
                        var canUserEditDate = true;
                        var goodsreceiptDetails = new { grItems = gritems, grDetails = grdetails, creator = creator, canUserEditDate };
                        responseData.Status = "OK";
                        responseData.Results = goodsreceiptDetails;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Something Went Wrong. " + ex.Message;
                    }
                }
                #endregion
                #region GET: External > PurchaseOrderDetails : get detail of purchaseorder for id
                else if (reqType == "POItemsDetailsByPOId")
                {
                    var poitems = (from PO in inventoryDbContext.PurchaseOrders.Where(p => p.PurchaseOrderId == purchaseOrderId)
                                   from poitms in inventoryDbContext.PurchaseOrderItems
                                   join itms in inventoryDbContext.Items on poitms.ItemId equals itms.ItemId
                                   join uom in inventoryDbContext.UnitOfMeasurementMaster on itms.UnitOfMeasurementId equals uom.UOMId into uomJoin
                                   from uomLeftJoin in uomJoin.DefaultIfEmpty()
                                   where poitms.PurchaseOrderId == purchaseOrderId && PO.StoreId == StoreId && poitms.IsActive == true
                                   join category in inventoryDbContext.ItemCategoryMaster on itms.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                                   from ctg in ctgGroup.DefaultIfEmpty()
                                   select new
                                   {
                                       ItemName = itms.ItemName,
                                       ItemCategory = (ctg == null) ? "" : ctg.ItemCategoryName,
                                       ItemCategoryCode = (ctg == null) ? "" : ctg.CategoryCode,
                                       VendorItemCode=poitms.VendorItemCode,
                                       MSSNO = itms.MSSNO,
                                       HSNCODE = itms.HSNCODE,
                                       Quantity = poitms.Quantity,
                                       ReceivedQuantity = poitms.ReceivedQuantity,
                                       POItemStatus = poitms.POItemStatus,
                                       POItemSpecification = poitms.POItemSpecification,
                                       StandardRate = poitms.StandardRate,
                                       Code = itms.Code,
                                       VatPercentage = poitms.VatPercentage,
                                       VATAmount = poitms.VATAmount,
                                       UOMName = uomLeftJoin.UOMName,
                                       ItemTotalAmount = poitms.TotalAmount,
                                       Remark = poitms.Remark,
                                       DeliveryDays = poitms.DeliveryDays,
                                       AuthorizedBy = poitms.AuthorizedBy,
                                       PurchaseOrderItemId = poitms.PurchaseOrderItemId
                                   }).OrderBy(p => p.PurchaseOrderItemId).ToList();//sud:28Sept'21--to show in the same order as entry.
                    var podetails = (from po in inventoryDbContext.PurchaseOrders
                                     join cur in inventoryDbContext.CurrencyMaster on po.CurrencyId equals cur.CurrencyID
                                     join ven in inventoryDbContext.Vendors on po.VendorId equals ven.VendorId
                                     join verif in inventoryDbContext.Verifications on po.VerificationId equals verif.VerificationId into verifJ
                                     from verifLJ in verifJ.DefaultIfEmpty()
                                     join pr in inventoryDbContext.PurchaseRequest on po.RequisitionId equals pr.PurchaseRequestId into prG
                                     from prLj in prG.DefaultIfEmpty()
                                     where po.PurchaseOrderId == purchaseOrderId
                                     select new GetProcurementPOViewDto
                                     {
                                         PurchaseRequestId = (prLj == null) ? null : po.RequisitionId,
                                         PurchaseOrderId = po.PurchaseOrderId,
                                         PurchaseOrderNo = po.PONumber,
                                         VendorName = ven.VendorName,
                                         VendorPANNumber = ven.PanNo,
                                         VendorNo = ven.ContactNo,
                                         SARFNo = ven.SARFNo,
                                         VendorAddress = ven.ContactAddress,
                                         Email = ven.Email,
                                         BankDetails = ven.BankDetails,
                                         CurrencyID = po.CurrencyId,
                                         CurrencyCode = cur.CurrencyCode,
                                         ContactPerson = ven.ContactPerson,
                                         PoDate = po.PoDate,
                                         DeliveryDate = po.DeliveryDate,
                                         POStatus = po.POStatus,
                                         SubTotal = po.SubTotal,
                                         VATAmount = po.VAT,
                                         IsCancel = po.IsCancel,
                                         PerformanceInvoiceNo = po.PerformanceInvoiceNo,
                                         TotalAmount = po.TotalAmount,
                                         PORemark = po.PORemark,
                                         CreatedbyId = po.CreatedBy,
                                         Terms = po.TermsConditions,
                                         VendorEmail = ven.Email,
                                         IsVerificationEnabled = po.IsVerificationEnabled,
                                         CurrentVerificationLevelCount = (verifLJ == null) ? 0 : verifLJ.CurrentVerificationLevelCount,
                                         VerifierIds = po.VerifierIds,
                                         InvoiceHeaderId = po.InvoiceHeaderId,
                                         VerificationId = po.VerificationId,
                                         ReferenceNo=po.ReferenceNo,
                                         InvoicingAddress=po.InvoicingAddress,
                                         DeliveryAddress=po.DeliveryAddress,
                                         ContactPersonName=po.ContactPersonName,
                                         ContactPersonEmail=po.ContactPersonEmail
                                     }).FirstOrDefault();
                    if (podetails.PurchaseRequestId != null)
                    {
                        var prDetails = inventoryDbContext.PurchaseRequest.Where(pr => pr.PurchaseRequestId == podetails.PurchaseRequestId).Select(pr => new { pr.PRNumber, pr.RequestDate }).FirstOrDefault();
                        podetails.PRNumber = prDetails.PRNumber;
                        podetails.PRDate = prDetails.RequestDate.ToString("yyyy-MM-dd");
                    }
                    var creator = (from emp in masterDbContext.Employees
                                   join r in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                                   from role in roleTemp.DefaultIfEmpty()
                                   where emp.EmployeeId == podetails.CreatedbyId
                                   select new
                                   {
                                       Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                       Role = role.EmployeeRoleName
                                   }).FirstOrDefault();
                    var autho = poitems[0].AuthorizedBy;
                    var authorizer = (from emp in masterDbContext.Employees
                                      join r in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                                      from role in roleTemp.DefaultIfEmpty()
                                      where emp.EmployeeId == autho
                                      select new
                                      {
                                          Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                          Role = role.EmployeeRoleName
                                      }).FirstOrDefault();
                    // Verifiers Details -- using Common Method from Verification Service
                    var Verifiers = new List<VerificationViewModel>();
                    if (podetails.VerificationId != null)
                    {
                        Verifiers = _verificationService.GetVerificationViewModel(podetails.VerificationId.Value).OrderBy(a => a.CurrentVerificationLevel).ToList();
                    }

                    var purchaseorderDetails = new { poItems = poitems, poDetails = podetails, creator = creator, authorizer = authorizer, verifiers = Verifiers };

                    responseData.Status = "OK";
                    responseData.Results = purchaseorderDetails;
                }
                #endregion
                #region GET: EXTERNAL > PurchaseOrderItems : gets requisition order to fill the PO with require items and its quantity
                else if (reqType == "RequisitionforPO")
                {
                    var rItems = (from rItms in inventoryDbContext.RequisitionItems
                                  where (rItms.RequisitionItemStatus == "active" || rItms.RequisitionItemStatus == "partial")
                                  group rItms by new
                                  {
                                      rItms.ItemId,
                                      rItms.Item.ItemName,
                                      rItms.Item.StandardRate,
                                      rItms.Item.VAT
                                  } into p
                                  select new
                                  {
                                      ItemId = p.Key.ItemId,
                                      ItemName = p.Key.ItemName,
                                      Quantity = p.Sum(a => (double)(a.Quantity) - a.ReceivedQuantity),
                                      StandardRate = p.Key.StandardRate,
                                      VAT = p.Key.VAT
                                  }).ToList();

                    var stks = (from stk in inventoryDbContext.StoreStocks
                                group stk by new
                                {
                                    stk.ItemId
                                } into q
                                select new
                                {
                                    ItemId = q.Key.ItemId,
                                    AvailableQuantity = q.Sum(a => a.AvailableQuantity)
                                }).ToList();

                    var result = (from r in rItems
                                  join stk in stks on r.ItemId equals stk.ItemId into stkTemp
                                  from s in stkTemp.DefaultIfEmpty()
                                  select new
                                  {
                                      ItemId = r.ItemId,
                                      ItemName = r.ItemName,
                                      Quantity = r.Quantity - ((s != null) ? s.AvailableQuantity : 0),
                                      StandardRate = r.StandardRate,
                                      VAT = r.VAT
                                  }).OrderBy(a => a.ItemName).ToList();

                    responseData.Results = result;
                }
                #endregion
                #region GET: Stock > get list of stock (available quantity > 0)
                else if (reqType == "stockList")
                {
                    var stock = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                 join itm in inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                                 join SubCat in inventoryDbContext.ItemSubCategoryMaster on itm.SubCategoryId equals SubCat.SubCategoryId
                                 join uom in inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId into uomJoined
                                 from uomLeftJoined in uomJoined.DefaultIfEmpty()
                                 where stk.AvailableQuantity >= 0 && stk.StoreId == StoreId
                                 group new { stk, itm, uomLeftJoined, SubCat } by new { itm.ItemId, itm.ItemName, itm.MinStockQuantity, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate } into stocks
                                 select new
                                 {
                                     ItemId = stocks.Key.ItemId,
                                     ItemName = stocks.Key.ItemName,
                                     BatchNo = stocks.Key.BatchNo,
                                     ExpiryDate = stocks.Key.ExpiryDate,
                                     AvailQuantity = stocks.Sum(a => a.stk.AvailableQuantity),
                                     MinQuantity = stocks.Key.MinStockQuantity,
                                     ItemCode = stocks.Select(a => a.itm.Code).FirstOrDefault(),
                                     ItemType = stocks.Select(a => a.itm.ItemType).FirstOrDefault(),
                                     IsColdStorageApplicable = stocks.Select(a => a.itm.IsColdStorageApplicable).FirstOrDefault(),
                                     SubCategoryName = stocks.Select(a => a.SubCat.SubCategoryName).FirstOrDefault(),
                                     UnitOfMeasurementId = stocks.Select(a => a.uomLeftJoined.UOMId).FirstOrDefault(),
                                     UOMName = stocks.Select(a => a.uomLeftJoined.UOMName).FirstOrDefault()//sud: 19Feb'20-- added UOMName since it's needed in stock list page..
                                 }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = stock;
                }
                #endregion
                #region GET: Stock > get list of StockDetails by ItemId (available quantity > 0)
                else if (reqType == "stockDetails")
                {
                    var stockDetails = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                        join gritm in inventoryDbContext.GoodsReceiptItems on stk.StockId equals gritm.StockId into gritmGrouped
                                        from gritmLJ in gritmGrouped.DefaultIfEmpty()
                                        join gr in inventoryDbContext.GoodsReceipts on gritmLJ.GoodsReceiptId equals gr.GoodsReceiptID into grGrouped
                                        from grLJ in grGrouped.DefaultIfEmpty()
                                        where (stk.ItemId == ItemId && stk.AvailableQuantity > 0 && stk.StoreId == StoreId)
                                        select new
                                        {
                                            GoodsArrivalNo = (gritmLJ != null) ? grLJ.GoodsArrivalNo : (int?)null,
                                            GoodsArrivalDate = (gritmLJ != null) ? grLJ.GoodsArrivalDate : null,
                                            GoodsReceiptNo = (gritmLJ != null) ? grLJ.GoodsReceiptNo : null,
                                            GoodsReceiptDate = (gritmLJ != null) ? grLJ.GoodsReceiptDate : null,
                                            BatchNo = stk.StockMaster.BatchNo,
                                            AvailQuantity = stk.AvailableQuantity,
                                            ItemRate = stk.StockMaster.CostPrice,
                                            ExpiryDate = stk.StockMaster.ExpiryDate
                                        }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = stockDetails;
                }
                #endregion
                #region GET: Stock > get list of StockManage by ItemId
                else if (reqType == "stockManage")
                {

                    var stockManage = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                       join gri in inventoryDbContext.GoodsReceiptItems on stk.StockId equals gri.StockId into griJ
                                       from griLJ in griJ.DefaultIfEmpty()
                                       join gr in inventoryDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals gr.GoodsReceiptID into grJ
                                       from grLJ in grJ.DefaultIfEmpty()
                                       where (stk.ItemId == ItemId && stk.AvailableQuantity > 0 && stk.StoreId == StoreId)
                                       select new
                                       {
                                           StockId = stk.StockId,
                                           GoodsArrivalNo = grLJ == null ? 0 : grLJ.GoodsArrivalNo,
                                           GoodsArrivalDate = grLJ == null ? null : grLJ.GoodsArrivalDate,
                                           GoodsReceiptNo = grLJ == null ? null : grLJ.GoodsReceiptNo,
                                           GoodsReceiptDate = grLJ == null ? null : grLJ.GoodsReceiptDate,
                                           BatchNo = stk.StockMaster.BatchNo,
                                           ExpiryDate = stk.StockMaster.ExpiryDate,
                                           curQuantity = stk.AvailableQuantity,
                                           ModQuantity = stk.AvailableQuantity,
                                           ReceivedQty = griLJ == null ? 0 : griLJ.ReceivedQuantity + griLJ.FreeQuantity
                                       }).ToList();
                    //TODO: Remove the zero quantity query from here, as we are not using it anymore.
                    var stockZeroManage = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                           join gri in inventoryDbContext.GoodsReceiptItems on stk.StockId equals gri.StockId into griJ
                                           from griLJ in griJ.DefaultIfEmpty()
                                           join gr in inventoryDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals gr.GoodsReceiptID into grJ
                                           from grLJ in grJ.DefaultIfEmpty()
                                           where (stk.ItemId == ItemId && stk.AvailableQuantity == 0 && stk.StoreId == StoreId)
                                           select new
                                           {
                                               StockId = stk.StockId,
                                               GoodsArrivalNo = grLJ == null ? 0 : grLJ.GoodsArrivalNo,
                                               GoodsArrivalDate = grLJ == null ? null : grLJ.GoodsArrivalDate,
                                               GoodsReceiptNo = grLJ == null ? null : grLJ.GoodsReceiptNo,
                                               GoodsReceiptDate = grLJ == null ? null : grLJ.GoodsReceiptDate,
                                               BatchNo = stk.StockMaster.BatchNo,
                                               ExpiryDate = stk.StockMaster.ExpiryDate,
                                               curQuantity = stk.AvailableQuantity,
                                               ModQuantity = stk.AvailableQuantity,
                                               ReceivedQty = griLJ == null ? 0 : griLJ.ReceivedQuantity + griLJ.FreeQuantity
                                           }).ToList();
                    var stock = new { stockDetails = stockManage, zeroStockDetails = stockZeroManage };
                    responseData.Status = "OK";
                    responseData.Results = stock;
                }
                #endregion
                #region //Get Stock Record by ItemId and AvailableQuantity> 0 for WriteOff
                //Only need BatchNO, Sum(AvailableQuantity) 
                else if (reqType != null && reqType.ToLower() == "getbatchnobyitemid")
                {
                    var batchNOsByItemId = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                            where stk.AvailableQuantity > 0 && stk.ItemId == ItemId
                                            group stk by new { stk.StockMaster.BatchNo, stk.StockMaster.CostPrice } into stockItems
                                            select new
                                            {
                                                BatchNo = string.IsNullOrEmpty(stockItems.Key.BatchNo) ? "NA" : stockItems.Key.BatchNo,
                                                AvailableQuantity = stockItems.Sum(a => a.AvailableQuantity),
                                                ItemPrice = stockItems.Key.CostPrice
                                            }).ToList();

                    responseData.Results = batchNOsByItemId;
                }
                #endregion
                #region GET: External > PurchaseOrderList : get list of PO vendor-wise
                else if (reqType != null && reqType.ToLower() == "getpolistvendorwise")
                {

                    var result = (from po in inventoryDbContext.PurchaseOrders
                                  join ven in inventoryDbContext.Vendors on po.VendorId equals ven.VendorId
                                  where (po.POStatus == "active" || po.POStatus == "partial")
                                  group new { po, ven } by new
                                  {
                                      po.VendorId,
                                      ven.VendorName,
                                      ven.ContactAddress,
                                      ven.ContactNo
                                  } into v
                                  select new
                                  {
                                      vId = v.Key.VendorId,
                                      vName = v.Key.VendorName,
                                      vAddress = v.Key.ContactAddress,
                                      vContactNo = v.Key.ContactNo,
                                      POIds = v.Select(a => a.po.PurchaseOrderId).ToList(),
                                  }).ToList();
                    responseData.Results = result;
                }
                #endregion

                #region GET: Procurement > RequestForQuotationList : get list of po quotation-wise
                else if (reqType != null && reqType.ToLower() == "get-req-for-quotation-list")
                {
                    var result = (from Req in inventoryDbContext.ReqForQuotation
                                  join quotation in inventoryDbContext.Quotations on Req.ReqForQuotationId equals quotation.ReqForQuotationId into grouped
                                  from quotationGrouped in grouped.DefaultIfEmpty()
                                  where (Req.Status == "active" || Req.Status == "Finalised") && Req.StoreId == StoreId
                                  select new
                                  {
                                      RFQNo = Req.RequestForQuotationNo,
                                      RequestedOn = Req.RequestedOn,
                                      RequestedBy = Req.RequestedBy,
                                      RequestedCloseOn = Req.RequestedCloseOn,
                                      Subject = Req.Subject,
                                      Description = Req.Description,
                                      ReqForQuotationId = Req.ReqForQuotationId,
                                      Status = Req.Status,
                                      QuotationId = quotationGrouped != null ? quotationGrouped.QuotationId : null
                                  }).OrderByDescending(r => r.ReqForQuotationId).ToList();
                    responseData.Results = result;
                }
                #endregion
                else if (reqType != null && reqType.ToLower() == "get-req-for-quotation-details")
                {
                    if (ReqForQuotationDetailById != 0)
                    {
                        var reqQuotationItems = (from ReqItem in inventoryDbContext.ReqForQuotationItems
                                                 where ReqItem.ReqForQuotationId == ReqForQuotationDetailById
                                                 select new
                                                 {
                                                     Description = ReqItem.Description,
                                                     ReqForQuotationItemId = ReqItem.ReqForQuotationItemId,
                                                     CreatedBy = ReqItem.CreatedBy,
                                                     CreatedOn = ReqItem.CreatedOn,
                                                     ItemName = ReqItem.ItemName,
                                                     Quantity = ReqItem.Quantity,

                                                 }).ToList();
                        var reqQuotationVendors = (from ReqVendor in inventoryDbContext.ReqForQuotationVendors
                                                   join vendor in inventoryDbContext.Vendors on ReqVendor.VendorId equals vendor.VendorId
                                                   where ReqVendor.ReqForQuotationId == ReqForQuotationDetailById
                                                   select new
                                                   {
                                                       VendorId = vendor.VendorId,
                                                       VendorName = vendor.VendorName

                                                   }).ToList();
                        responseData.Results = new { RFQItems = reqQuotationItems, RFQVendors = reqQuotationVendors };
                    }

                }
                else if (reqType != null && reqType.ToLower() == "rfqitemslist")
                {
                    if (ReqForQuotationId != 0)
                    {

                        var result = (from ReqItem in inventoryDbContext.ReqForQuotationItems
                                      where ReqItem.ReqForQuotationId == ReqForQuotationId
                                      select new
                                      {
                                          Description = ReqItem.Description,
                                          ReqForQuotationItemId = ReqItem.ReqForQuotationItemId,
                                          CreatedBy = ReqItem.CreatedBy,
                                          CreatedOn = ReqItem.CreatedOn,
                                          ItemName = ReqItem.ItemName,
                                          Quantity = ReqItem.Quantity,
                                          Price = ReqItem.Price,
                                          ReqForQuotationId = ReqItem.ReqForQuotationId,
                                          ItemId = ReqItem.ItemId,

                                      }).ToList();
                        responseData.Results = result;
                    }

                }
                else if (reqType != null && reqType.ToLower() == "rfqvendorslist")
                {
                    if (ReqForQuotationId != 0)
                    {

                        var result = (from rfqVendor in inventoryDbContext.ReqForQuotationVendors
                                      join vendor in inventoryDbContext.Vendors on rfqVendor.VendorId equals vendor.VendorId
                                      //join quotationFiles in inventoryDbContext.quotationUploadedFiles on vendor.VendorId equals quotationFiles.VendorId
                                      where rfqVendor.ReqForQuotationId == ReqForQuotationId
                                      select new
                                      {
                                          VendorId = rfqVendor.VendorId,
                                          VendorName = vendor.VendorName

                                      }).ToList();
                        responseData.Results = result;
                    }

                }

                else if (reqType != null && reqType.ToLower() == "get-quotation-list")
                {
                    if (ReqForQuotationId != 0)
                    {

                        var result = (from quoList in inventoryDbContext.Quotations
                                      join req in inventoryDbContext.ReqForQuotation on quoList.ReqForQuotationId equals req.ReqForQuotationId
                                      where (quoList.ReqForQuotationId == ReqForQuotationId && quoList.Status == "selected")
                                      select new
                                      {
                                          QuotationId = quoList.QuotationId,
                                          VendorId = quoList.VendorId,
                                          VendorName = quoList.VendorName,
                                          CreatedOn = quoList.CreatedOn,
                                          Status = quoList.Status,
                                          Subject = req.Subject,


                                      }).ToList();
                        responseData.Results = result;
                    }
                }
                else if (reqType != null && reqType.ToLower() == "get-quotation-items")
                {
                    if (QuotationItemById != 0)
                    {
                        var result = (from qlItm in inventoryDbContext.QuotationItems
                                      where (qlItm.QuotationId == QuotationItemById)
                                      select new
                                      {
                                          UpLoadedOn = qlItm.UpLoadedOn,
                                          Description = qlItm.Description,
                                          Price = qlItm.Price,
                                          ItemName = qlItm.ItemName,
                                          ItemId = qlItm.ItemId,
                                          QuotationItemId = qlItm.QuotationItemId,

                                      }).ToList();
                        responseData.Results = result;
                    }
                }
                #region Get Requested Quotation List and details
                else if (reqType == "requestedQuotations")
                {
                    var result = (from req in inventoryDbContext.ReqForQuotation
                                  where (req.RequestedCloseOn == null && req.Status == "active")
                                  select new
                                  {
                                      ReqForQuotationId = req.ReqForQuotationId,
                                      Subject = req.Subject,
                                  }).ToList();
                    responseData.Results = result;
                }
                else if (reqType == "ReqForQuotationDetails")
                {
                    var currentDate = DateTime.Now;
                    var activeFiscalYear = inventoryDbContext.FiscalYears.Where(a => a.StartYear <= currentDate && a.EndYear >= currentDate).Select(a => a.FiscalYearFormatted).DefaultIfEmpty("").FirstOrDefault();
                    var Quote = (from RFQI in inventoryDbContext.ReqForQuotationItems
                                 join Quot in inventoryDbContext.Quotations on RFQI.ReqForQuotationId equals Quot.ReqForQuotationId
                                 join quotItem in inventoryDbContext.QuotationItems on ///we need two join conditions. (RFQI.itemid should also be joined with quotitem.ItemId)
                                    new { Quot.QuotationId, RFQI.ItemId } equals new { quotItem.QuotationId, quotItem.ItemId }
                                 join I in inventoryDbContext.Items on RFQI.ItemId equals I.ItemId
                                 join UOM in inventoryDbContext.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals UOM.UOMId
                                 where RFQI.ReqForQuotationId == ReqForQuotationDetailById
                                 select new
                                 {
                                     Quot.VendorId,
                                     Quot.ReqForQuotationId,
                                     Quot.VendorName,
                                     quotItem.ItemId,
                                     quotItem.ItemName,
                                     UOM.UOMName,
                                     quotItem.Price,
                                     RFQI.Quantity
                                 }).ToList();
                    var result = new
                    {
                        activeFiscalYear = activeFiscalYear,
                        vendorList = (from q in Quote
                                      join vend in inventoryDbContext.Vendors on q.VendorId equals vend.VendorId
                                      join curr in inventoryDbContext.CurrencyMaster on vend.DefaultCurrencyId equals curr.CurrencyID
                                      group new { q, curr } by new { q.VendorId } into x

                                      select new
                                      {
                                          x.Key.VendorId,
                                          ReqForQuotationId = x.Select(a => a.q.ReqForQuotationId).FirstOrDefault(),
                                          Currency = x.Select(a => a.curr.CurrencyCode).FirstOrDefault(),
                                          VendorName = x.Select(a => a.q.VendorName).FirstOrDefault()
                                      }).ToList(),
                        ItemList = (from q in Quote
                                    group new { q } by new
                                    {
                                        q.ItemId
                                    }
                                    into x
                                    select new
                                    {
                                        x.Key.ItemId,
                                        ItemName = x.Select(a => a.q.ItemName).FirstOrDefault(),
                                        RequestedQuantity = x.Select(a => a.q.Quantity).FirstOrDefault(),
                                        UOMName = x.Select(a => a.q.UOMName).FirstOrDefault(),
                                        Vendordetails = x.Select(a => new { a.q.VendorName, a.q.Price }).Distinct().ToList(),
                                    }).ToList(),
                        TotalAmount = (from q in Quote
                                       group new { q }
                                       by new { q.VendorId }
                                       into x
                                       select new
                                       {
                                           Vendor = x.Select(a => a.q.VendorName).FirstOrDefault(),
                                           Totalamount = x.Select(a => a.q.Price * a.q.Quantity).Sum(),
                                       }).ToList(),
                    };
                    responseData.Results = result;
                }
                #endregion

                else if (reqType != null && reqType.ToLower() == "get-quotation-by-status")
                {
                    if (ReqForQuotationId != 0)
                    {
                        var result = (from quo in inventoryDbContext.Quotations
                                      join req in inventoryDbContext.ReqForQuotation on quo.ReqForQuotationId equals req.ReqForQuotationId
                                      where quo.ReqForQuotationId == ReqForQuotationId && quo.Status == "selected"
                                      select new
                                      {
                                          QuotationId = quo.QuotationId,
                                          Status = quo.Status,
                                          Subject = req.Subject,
                                          RequestedBy = req.RequestedBy,
                                          VendorName = quo.VendorName,
                                          CreatedOn = quo.CreatedOn,
                                          IssuedDate = quo.IssuedDate

                                      }).FirstOrDefault();
                        responseData.Results = result;
                    }
                }
                else if (reqType == "getcreditnoteno")
                {
                    List<ReturnToVendorItemsModel> crNoRecords = (from inv in inventoryDbContext.ReturnToVendorItems
                                                                  select inv).ToList();
                    if (crNoRecords.Count == 0)
                    {
                        responseData.Results = 1;
                    }
                    else
                    {
                        var crNo = (from inv in crNoRecords.AsEnumerable() select inv.CreditNoteNo).ToList().Max();
                        responseData.Results = crNo + 1;
                    }

                    //responseData.Results = (CreditNoteNo > 0) ? CreditNoteNo + 1 : 1;
                    responseData.Status = "OK";
                }

                #region Get all PO Requisition
                else if (reqType == "PORequisition")
                {
                    var realToDate = ToDate.AddDays(1);
                    var purchaseRequests = inventoryDbContext.PurchaseRequest.Where(PR => PR.RequestDate > FromDate && PR.RequestDate < realToDate && PR.StoreId == StoreId).OrderByDescending(a => a.PurchaseRequestId).ToList();
                    purchaseRequests.ForEach(
                        PR =>
                        {
                            PR.RequestedByName = VerificationBL.GetNameByEmployeeId(PR.CreatedBy, inventoryDbContext);
                            PR.VendorName = VerificationBL.GetInventoryVendorNameById(inventoryDbContext, PR.VendorId ?? 0);
                            var param = VerificationBL.GetPurchaseRequestVerificationSetting(inventoryDbContext);
                            if (param != null)
                            {
                                PR.MaxVerificationLevel = param.VerificationLevel;
                                if (PR.VerificationId != null)
                                {
                                    PR.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDbContext, PR.VerificationId ?? 0);
                                }
                                else
                                {
                                    PR.CurrentVerificationLevelCount = 0;
                                }
                            }
                            else
                            {
                                PR.MaxVerificationLevel = 0;
                            }
                        }
                        );

                    responseData.Results = purchaseRequests;
                    responseData.Status = "OK";
                }
                #endregion
                #region Get PO Requisition by ID
                else if (reqType == "PORequisitionItemsById")
                {
                    var PurchaseRequest1 = (from PR in inventoryDbContext.PurchaseRequest.Where(p => p.PurchaseRequestId == RequisitionId && p.StoreId == StoreId)
                                            from POLJ in inventoryDbContext.PurchaseOrders.Where(a => a.RequisitionId == PR.PurchaseRequestId).DefaultIfEmpty()
                                            from GRLJ in inventoryDbContext.GoodsReceipts.Where(a => a.PurchaseOrderId == POLJ.PurchaseOrderId && a.PurchaseOrderId != null).DefaultIfEmpty()
                                            select new { PR, POLJ, GRLJ }
                                           ).ToList();

                    var PurchaseRequest = PurchaseRequest1.Select(a => new PurchaseRequestModel
                    {
                        PurchaseRequestId = a.PR.PurchaseRequestId,
                        PRNumber = a.PR.PRNumber,
                        VendorId = a.PR.VendorId,
                        RequestDate = a.PR.RequestDate,
                        RequestStatus = a.PR.RequestStatus,
                        VerificationId = a.PR.VerificationId,
                        Remarks = a.PR.Remarks,
                        CancelledBy = a.PR.CancelledBy,
                        CancelledOn = a.PR.CancelledOn,
                        CancelRemarks = a.PR.CancelRemarks,
                        IsActive = a.PR.IsActive,
                        IsPOCreated = a.PR.IsPOCreated,
                        CreatedBy = a.PR.CreatedBy,
                        CreatedOn = a.PR.CreatedOn,
                        ModifiedBy = a.PR.ModifiedBy,
                        ModifiedOn = a.PR.ModifiedOn,
                        PODate = a.POLJ?.PoDate,
                        PONumber = a.POLJ?.PurchaseOrderId,
                        SupplierInvoice = a.GRLJ?.BillNo,
                        //SupplierInvoiceDate = a.GRLJ?.GoodsReceiptDate,
                        SupplierInvoiceDate = a.GRLJ?.GoodsArrivalDate,
                        POCategory = a.PR.PRCategory,
                    }).FirstOrDefault();
                    PurchaseRequest.VendorName = inventoryDbContext.Vendors.Where(V => V.VendorId == PurchaseRequest.VendorId).Select(V => V.VendorName).FirstOrDefault();
                    PurchaseRequest.MaxVerificationLevel = VerificationBL.GetPurchaseRequestVerificationSetting(inventoryDbContext).VerificationLevel;
                    PurchaseRequest.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDbContext, PurchaseRequest.VerificationId ?? 0);
                    var ItemsRequesterVerifiersDetail = VerificationBL.GetInventoryPurchaseRequestDetails(RequisitionId, inventoryDbContext);
                    var combinedResult = new { PurchaseRequest, ItemsRequesterVerifiersDetail.RequestedItemList, ItemsRequesterVerifiersDetail.RequestingUser, ItemsRequesterVerifiersDetail.Verifiers };
                    responseData.Results = combinedResult;
                    responseData.Status = "OK";
                }
                #endregion
                #region Get Requisition by ReqiuisstionID
                else if (reqType == "Requisition")
                {

                    RequisitionModel requisition = inventoryDbContext.Requisitions.Where(R => R.RequisitionId == RequisitionId).Include(a => a.RequisitionItems).FirstOrDefault();

                    foreach (var reqItem in requisition.RequisitionItems)
                    {
                        var reqdetail = inventoryDbContext.Requisitions.Where(req => req.RequisitionId == reqItem.RequisitionId).Select(req => new { req.RequisitionDate, req.RequisitionNo, req.IssueNo }).FirstOrDefault();


                        var itemDetail = inventoryDbContext.Items.Where(item => item.ItemId == reqItem.ItemId).Select(item => new { item.ItemName, item.Code, item.UnitOfMeasurementId }).FirstOrDefault();
                        reqItem.ItemName = itemDetail.ItemName;
                        reqItem.Code = itemDetail.Code;
                        reqItem.RequisitionNo = reqdetail.RequisitionNo;
                        reqItem.IssueNo = reqdetail.IssueNo;
                        reqItem.Quantity = reqItem.Quantity;
                        reqItem.UOMName = inventoryDbContext.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetail.UnitOfMeasurementId).Select(uom => uom.UOMName).FirstOrDefault();

                    }

                    responseData.Results = requisition;
                    responseData.Status = "OK";
                }
                #endregion
                #region Get Store Name for DailyItemDispatch Report!!
                else if (reqType == "getInventoryStoreList")
                {
                    var inventoryStoreCategory = Enums.ENUM_StoreCategory.Store;
                    var inventoryStoreSubCategory = Enums.ENUM_StoreSubCategory.Inventory;
                    var substoreCategory = Enums.ENUM_StoreCategory.Substore;

                    List<PHRMStoreModel> StoreList = phrmdbcontext.PHRMStore
                                                    .Where(store => (store.Category == inventoryStoreCategory && store.SubCategory == inventoryStoreSubCategory) || store.Category == substoreCategory)
                                                    .ToList();
                    responseData.Status = "OK";
                    responseData.Results = StoreList;
                }
                #endregion                                
            }

            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }


        #region Get Item List
        [HttpGet("GetItemList")]
        public IActionResult GetItemList()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var ItemList = (from item in inventoryDbContext.Items
                                join subCat in inventoryDbContext.ItemSubCategoryMaster on item.SubCategoryId equals subCat.SubCategoryId
                                join unit in inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
                                from unit in ps.DefaultIfEmpty()
                                join store in inventoryDbContext.StoreMasters on item.StoreId equals store.StoreId into storeG
                                from storeLJ in storeG.DefaultIfEmpty()
                                select new
                                {
                                    item.ItemId,
                                    item.Code,
                                    item.CompanyId,
                                    item.ItemCategoryId,
                                    item.SubCategoryId,
                                    subCat.SubCategoryName,
                                    item.PackagingTypeId,
                                    item.UnitOfMeasurementId,
                                    item.ItemName,
                                    item.ItemType,
                                    item.Description,
                                    item.ReOrderQuantity,
                                    item.VAT,
                                    item.MinStockQuantity,
                                    item.BudgetedQuantity,
                                    item.StandardRate,
                                    item.UnitQuantity,
                                    item.CreatedBy,
                                    item.CreatedOn,
                                    item.IsActive,
                                    item.IsVATApplicable,
                                    unit.UOMName,
                                    item.MSSNO,
                                    item.HSNCODE,
                                    item.IsCssdApplicable,
                                    item.IsColdStorageApplicable,
                                    item.IsPatConsumptionApplicable,
                                    item.VendorId,
                                    item.StoreId,
                                    StoreName = storeLJ == null ? "Common" : storeLJ.Name,
                                    item.RegisterPageNumber
                                }).ToList();
                responseData.Results = ItemList;
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return Ok(responseData);
            }
        }

        [HttpGet("GetItemListByStoreId/{StoreId}")]
        public IActionResult GetItemListByStoreId(int StoreId)
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var ItemList = (from item in inventoryDbContext.Items
                                join subCat in inventoryDbContext.ItemSubCategoryMaster on item.SubCategoryId equals subCat.SubCategoryId
                                join unit in inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
                                from unit in ps.DefaultIfEmpty()
                                join store in inventoryDbContext.StoreMasters on item.StoreId equals store.StoreId into storeG
                                from storeLJ in storeG.DefaultIfEmpty()
                                where (item.StoreId == StoreId || item.StoreId == null) // storeId == null means common item for all the stores
                                select new
                                {
                                    item.ItemId,
                                    item.Code,
                                    item.CompanyId,
                                    item.ItemCategoryId,
                                    item.SubCategoryId,
                                    subCat.SubCategoryName,
                                    item.PackagingTypeId,
                                    item.UnitOfMeasurementId,
                                    item.ItemName,
                                    item.ItemType,
                                    item.Description,
                                    item.ReOrderQuantity,
                                    item.VAT,
                                    item.MinStockQuantity,
                                    item.BudgetedQuantity,
                                    item.StandardRate,
                                    item.UnitQuantity,
                                    item.CreatedBy,
                                    item.CreatedOn,
                                    item.IsActive,
                                    item.IsVATApplicable,
                                    unit.UOMName,
                                    item.MSSNO,
                                    item.HSNCODE,
                                    item.IsCssdApplicable,
                                    item.IsColdStorageApplicable,
                                    item.IsPatConsumptionApplicable,
                                    item.VendorId,
                                    item.StoreId,
                                    StoreName = storeLJ == null ? "Common" : storeLJ.Name,
                                    item.RegisterPageNumber
                                }).ToList();
                responseData.Results = ItemList;
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return Ok(responseData);
            }
        }
        #endregion


        #region Return to Vendor API for getting item data
        [HttpGet("GetItemListForReturnToVendor/{VendorId}/{GoodsReceiptNo}/{FiscalYearId}/{StoreId}")]
        public IActionResult GetItemListForReturnToVendor(int VendorId, int GoodsReceiptNo, int FiscalYearId, int StoreId)
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var itembatchList = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                     join itm in inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                                     join gritms in inventoryDbContext.GoodsReceiptItems on stk.StockId equals gritms.StockId
                                     join gr in inventoryDbContext.GoodsReceipts on gritms.GoodsReceiptId equals gr.GoodsReceiptID
                                     join vndr in inventoryDbContext.Vendors on gr.VendorId equals vndr.VendorId
                                     join fs in inventoryDbContext.FiscalYears on gr.FiscalYearId equals fs.FiscalYearId
                                     where stk.AvailableQuantity > 0 && vndr.VendorId == VendorId && gr.GoodsReceiptNo == GoodsReceiptNo && gr.FiscalYearId == FiscalYearId && gr.StoreId == StoreId
                                     group new { stk, itm, gritms, gr, vndr, fs } by new
                                     {
                                         itm.ItemId,
                                         itm.ItemName
                                     } into s
                                     select new ReturnToVendorItemsVM
                                     {
                                         ItemId = s.Key.ItemId,
                                         ItemName = s.Key.ItemName,
                                         FiscalYearFormatted = s.Select(stock => stock.fs.FiscalYearFormatted).FirstOrDefault(),
                                         BatchDetails = s.Select(a => new ReturnToVendorItemsVM.BatchDetail
                                         {
                                             BatchNo = a.stk.StockMaster.BatchNo,
                                             AvailQty = a.stk.AvailableQuantity,
                                             ItemRate = a.gritms.ItemRate,
                                             StockId = a.stk.StockId,
                                             GRId = a.gritms.GoodsReceiptItemId,
                                             GoodsReceiptId = a.gr.GoodsReceiptID,
                                             VAT = a.gritms.VAT ?? 0
                                         }).ToList(),
                                     }).ToList();
                var vendorDetail = (from vndr in inventoryDbContext.Vendors
                                    where vndr.VendorId == VendorId
                                    select new
                                    {
                                        ContactAddress = vndr.ContactAddress,
                                        ContactNo = vndr.ContactNo
                                    }).FirstOrDefault();
                responseData.Status = "OK";
                responseData.Results = new { vendorDetail = vendorDetail, itemBatchList = itembatchList }; ;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return Ok(responseData);
            }
        }
        #endregion

        [HttpGet("GetAttachedQuotationFilesByRFQId/{ReqForQuotationId}")]
        public async Task<IActionResult> GetAttachedQuotationFilesByRFQId([FromRoute] int ReqForQuotationId)
        {
            var db = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var result = await (from QUF in db.quotationUploadedFiles
                                    where QUF.RequestForQuotationId == ReqForQuotationId
                                    select new
                                    {
                                        VendorId = QUF.VendorId,
                                        Description = QUF.Description,
                                        FileBinaryData = QUF.FileBinaryData,
                                        FileExtention = QUF.FileExtention,
                                        FileName = QUF.FileName,
                                        FileNo = QUF.FileNo,
                                        FileType = QUF.FileType,
                                        QuotationUploadedFileId = QUF.QuotationUploadedFileId,
                                        UpLoadedBy = QUF.UpLoadedBy,
                                        UpLoadedOn = QUF.UpLoadedOn
                                    }).ToListAsync();
                responseData.Results = result;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("GetPreviousQuotationDetailsByVendorId/{ReqForQuotationId}/{VendorId}")]
        public async Task<IActionResult> GetPreviousQuotationDetailsByVendorId([FromRoute] int ReqForQuotationId, [FromRoute] int VendorId)
        {
            var db = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var result = await (from Q in db.Quotations
                                    join QI in db.QuotationItems on Q.QuotationId equals QI.QuotationId
                                    where Q.ReqForQuotationId == ReqForQuotationId && Q.VendorId == VendorId
                                    select new
                                    {
                                        VendorId = QI.VendorId,
                                        Description = QI.Description,
                                        Price = QI.Price,
                                        ItemName = QI.ItemName,
                                        ItemId = QI.ItemId,
                                        QuotationId = QI.QuotationId,
                                        QuotationItemId = QI.QuotationItemId,
                                    }).ToListAsync();
                responseData.Results = result;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message.ToString();
            }
            return Ok(responseData);
        }
        // GET api/values/5
        [HttpGet("~/api/Inventory/GetSubstoreRequistionList/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult GetSubstoreRequistionList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int StoreId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                //string[] requisitionStatus = Status.Split(',');
                var RequisitionList = (from requ in inventoryDbContext.Requisitions
                                           //join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                       join store in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals store.StoreId
                                       where requ.RequestToStoreId == StoreId & requ.RequisitionDate > FromDate & requ.RequisitionDate < RealToDate
                                       orderby requ.RequisitionId descending
                                       select new
                                       {
                                           RequisitionId = requ.RequisitionId,
                                           RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.RequisitionDate,
                                           RequisitionStatus = requ.RequisitionStatus,
                                           StoreName = store.Name,
                                           MaxVerificationLevel = store.MaxVerificationLevel,
                                           VerificationId = requ.VerificationId,
                                       }).AsNoTracking().ToList().Select(R => new RequisitionModel
                                       {
                                           RequisitionId = R.RequisitionId,
                                           RequisitionNo = R.RequisitionNo,
                                           RequisitionDate = R.RequisitionDate,
                                           RequisitionStatus = R.RequisitionStatus,
                                           RequestFromStoreId = StoreId,
                                           StoreName = R.StoreName,
                                           MaxVerificationLevel = R.MaxVerificationLevel,
                                           VerificationId = R.VerificationId,
                                       }).ToList();
                foreach (var Requisition in RequisitionList)
                {
                    Requisition.NewDispatchAvailable = InventoryBL.CheckIfNewDispatchAvailable(inventoryDbContext, Requisition.RequisitionId);
                    if (Requisition.VerificationId != null)
                    {
                        Requisition.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDbContext, Requisition.VerificationId ?? 0);
                    }
                }
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        [HttpGet("~/api/Inventory/GetAllSubstoreRequistionList/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult GetAllSubstoreRequistionList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int StoreId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);
            //string[] requisitionStatus = Status.Split(',');

            try
            {
                var RequisitionList = (from requ in inventoryDbContext.Requisitions.Where(R => R.RequestToStoreId == StoreId)
                                           //join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                       join store in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals store.StoreId
                                       where requ.RequisitionDate > FromDate & requ.RequisitionDate < RealToDate & requ.RequisitionStatus != "withdrawn"
                                       orderby requ.RequisitionId descending
                                       select new
                                       {
                                           RequisitionId = requ.RequisitionId,
                                           RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.RequisitionDate,
                                           RequisitionStatus = requ.RequisitionStatus,
                                           StoreId = requ.RequestFromStoreId,
                                           StoreName = store.Name,
                                           MaxVerificationLevel = store.MaxVerificationLevel,
                                           VerificationId = requ.VerificationId,
                                       }).AsNoTracking().ToList().Select(R => new RequisitionModel
                                       {
                                           RequisitionId = R.RequisitionId,
                                           RequisitionNo = R.RequisitionNo,

                                           RequisitionDate = R.RequisitionDate,
                                           RequisitionStatus = R.RequisitionStatus,
                                           RequestFromStoreId = R.StoreId,
                                           StoreName = R.StoreName,
                                           MaxVerificationLevel = R.MaxVerificationLevel,
                                           VerificationId = R.VerificationId,
                                       }).ToList();
                foreach (var Requisition in RequisitionList)
                {
                    if (Requisition.VerificationId != null)
                    {
                        Requisition.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDbContext, Requisition.VerificationId ?? 0);
                    }
                }
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Inventory/GetAllPOVerifiers")]
        public IActionResult GetAllPOVerifiers()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacDbContext db = new RbacDbContext(connString);
            try
            {
                List<POVerifier> VerifiersList = VerificationBL.GetAllPOVerifiers(db);
                if (VerifiersList != null || VerifiersList.Count() > 0)
                {
                    responseData.Status = "OK";
                    responseData.Results = VerifiersList;
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No Verifiers Found";
                }
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                return BadRequest(responseData);
            }
        }

        [HttpGet]
        [Route("~/api/Inventory/TrackRequisitionById/{RequisitionId}")]
        public IActionResult TrackRequisitionById(int RequisitionId)
        {
            var dbContext = new InventoryDbContext(connString);
            var rbacDbContext = new RbacDbContext(connString);
            var responseData = new DanpheHTTPResponse<TrackRequisitionViewModel>();

            try
            {
                var inventoryRequisitionVM = new TrackRequisitionViewModel();
                RequisitionModel requisition = dbContext.Requisitions.Find(RequisitionId);

                inventoryRequisitionVM.RequisitionId = RequisitionId;
                inventoryRequisitionVM.CreatedBy = dbContext.Employees.Find(requisition.CreatedBy).FullName;
                inventoryRequisitionVM.RequisitionDate = ((DateTime)requisition.RequisitionDate);
                inventoryRequisitionVM.Status = requisition.RequisitionStatus;
                inventoryRequisitionVM.MaxVerificationLevel = dbContext.StoreMasters.Find(requisition.RequestFromStoreId).MaxVerificationLevel;
                inventoryRequisitionVM.StoreId = requisition.RequestFromStoreId;
                inventoryRequisitionVM.StoreName = dbContext.StoreMasters.Find(requisition.RequestFromStoreId).Name;

                inventoryRequisitionVM.Verifiers = SubstoreBL.GetVerifiersByStoreId(requisition.RequestFromStoreId, rbacDbContext);


                if (requisition.VerificationId != null)
                {
                    var VerificationDetail = this._verificationService.GetVerificationViewModel((int)requisition.VerificationId);
                    foreach (var verifier in inventoryRequisitionVM.Verifiers)
                    {
                        var verificationDetail = VerificationDetail.FirstOrDefault(v => v.CurrentVerificationLevel == verifier.CurrentVerificationLevel);
                        if (verificationDetail != null)
                        {
                            verifier.VerificationId = verificationDetail.VerificationId;
                            verifier.VerificationStatus = verificationDetail.VerificationStatus;
                            verifier.VerifiedOn = verificationDetail.VerifiedOn;
                            verifier.VerifiedBy = verificationDetail.VerifiedBy;
                            verifier.VerificationRemarks = verificationDetail.VerificationRemarks;
                        }
                    }
                }

                inventoryRequisitionVM.Dispatchers = VerificationBL.GetDispatchersList(RequisitionId, dbContext);

                responseData.Status = "OK";
                responseData.Results = inventoryRequisitionVM;

            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong!";
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Inventory/GetPurchaseRequestItemsById/{PurchaseRequestId}")]
        public async Task<IActionResult> GetPurchaseRequestItemsById(int PurchaseRequestId)
        {
            var _context = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var purchaseRequestItems = await (from PRI in _context.PurchaseRequestItems
                                                  from STK in _context.StoreStocks.Where(s => s.ItemId == PRI.ItemId).DefaultIfEmpty()
                                                  where PRI.PurchaseRequestId == PurchaseRequestId && PRI.IsActive == true
                                                  group new { PRI, STK } by new { PRI.PurchaseRequestItemId, PRI.ItemId, PRI.VendorId, PRI.RequestedQuantity, PRI.PurchaseRequestId, PRI.Remarks } into PRIGrouped
                                                  select new
                                                  {
                                                      PRIGrouped.Key.PurchaseRequestItemId,
                                                      PRIGrouped.Key.ItemId,
                                                      PRIGrouped.Key.VendorId,
                                                      PRIGrouped.Key.RequestedQuantity,
                                                      PRIGrouped.Key.PurchaseRequestId,
                                                      PRIGrouped.Key.Remarks,
                                                      StockAvailableQuantity = PRIGrouped.Sum(a => (a.STK == null) ? 0 : a.STK.AvailableQuantity)
                                                  }).ToListAsync();
                var PRDetail = await _context.PurchaseRequest.Where(PR => PR.PurchaseRequestId == PurchaseRequestId).Select(PR => new { PR.RequestDate, PR.Remarks }).FirstOrDefaultAsync();

                if (purchaseRequestItems == null)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Purchase request record not found.";
                    return NotFound(responseData);
                }
                responseData.Status = "OK";
                responseData.Results = new { purchaseRequestItems, PRDetail.RequestDate, PRDetail.Remarks };
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Inventory/GetAllItemPriceHistory")]
        public async Task<IActionResult> GetAllItemPriceHistory()
        {
            var inventoryDb = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var itemPriceHistory = await (from GRI in inventoryDb.GoodsReceiptItems
                                              join GR in inventoryDb.GoodsReceipts on GRI.GoodsReceiptId equals GR.GoodsReceiptID
                                              join V in inventoryDb.Vendors on GR.VendorId equals V.VendorId
                                              select new
                                              {
                                                  GRI.ItemId,
                                                  GRI.ItemRate,
                                                  V.VendorName,
                                                  GR.GoodsReceiptDate
                                              }).OrderByDescending(GRI => GRI.GoodsReceiptDate).ToListAsync();
                if (itemPriceHistory == null || itemPriceHistory.Count() == 0)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No price history found.";
                }
                responseData.Results = itemPriceHistory;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Failed to obtain price history. Message: {ex.Message}";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Inventory/GetAllInventoryFiscalYears")]
        public async Task<IActionResult> GetAllInventoryFiscalYears()
        {
            var db = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var fiscalYearList = await db.InventoryFiscalYears.ToListAsync();
                if (fiscalYearList == null || fiscalYearList.Count() == 0)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No fiscal year found.";
                    return NotFound(responseData);
                }
                responseData.Results = fiscalYearList;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Failed to obtain fiscal years. Message: {ex.Message}";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpGet("GetAllGRVendorBillingHistory")]
        public async Task<IActionResult> GetAllGRVendorBillingHistory()
        {
            var inventoryDb = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                DateTime dateBefor1Yr = DateTime.Now.AddYears(-1);

                var GRVendorBH = await (from gr in inventoryDb.GoodsReceipts
                                        join v in inventoryDb.Vendors on gr.VendorId equals v.VendorId
                                        where gr.IsCancel == false
                                        && gr.GoodsReceiptDate > dateBefor1Yr // sud:24Jun'20-taking data of last 1 year.
                                        select new
                                        {
                                            gr.VendorId,
                                            gr.BillNo,
                                            gr.GoodsArrivalDate,
                                            gr.GoodsReceiptDate,
                                            v.VendorName,
                                            gr.GoodsReceiptNo,
                                            gr.GoodsArrivalNo
                                        }).OrderByDescending(a => a.GoodsReceiptDate).ToListAsync();


                if (GRVendorBH == null || GRVendorBH.Count() == 0)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No GR Vendor Billing history found.";
                }
                responseData.Results = GRVendorBH;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Failed to obtain GR Vendor Billing history. Details: s{ex.Message}";
            }
            return Ok(responseData);
        }


        [HttpGet]
        [Route("~/api/Inventory/GetFixedAssetDonation")]
        public IActionResult GetFixedAssetDonation()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();
            try
            {
                var fixedAssetDonation = (from assetdonation in inventoryDbContext.FixedAssetDonation
                                          select new
                                          {
                                              assetdonation.DonationId,
                                              assetdonation.Donation,

                                          }).ToList();
                resData.Status = "OK";
                resData.Results = fixedAssetDonation;
            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }

        [HttpGet]
        [Route("~/api/Inventory/GetAvailableQuantityByItemId/{ItemId}")]
        public IActionResult GetAvailableQuantityByItemId([FromRoute] int ItemId)
        {
            var dbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var AvailableQty = dbContext.StoreStocks.Where(stk => stk.ItemId == ItemId).Select(a => a.AvailableQuantity).DefaultIfEmpty(0).Sum();
                responseData.Status = "OK";
                responseData.Results = AvailableQty;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Inventory/GetActiveInventoryList/")]
        public IActionResult GetActiveInventoryList()
        {
            var dbContext = new PharmacyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var invCategory = Enums.ENUM_StoreCategory.Store;
                var inventoryList = dbContext.PHRMStore.Where(s => s.Category == invCategory && s.SubCategory == "inventory").ToList();
                responseData.Status = "OK";
                responseData.Results = inventoryList;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return NotFound(responseData);
            }
        }


        /*       else if (reqType == "getDispenaryList")
                    {
                        var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;
            var dispensaryList = phrmdbcontext.PHRMStore.Where(s => s.Category == dispensaryCategory).ToList();
            responseData.Status = "OK";
                        responseData.Results = dispensaryList;
                    }*/


        [HttpGet]
        [Route("~/api/Inventory/GetProcurementGRView/{GoodsReceiptId}")]
        public IActionResult GetProcurementGRView([FromRoute] int GoodsReceiptId)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var masterDbContext = new MasterDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                GetProcurementGRViewVm grViewInformation = InventoryBL.GetProcurementGRView(GoodsReceiptId, inventoryDb, masterDbContext, _verificationService);
                responseData.Status = "OK";
                responseData.Results = grViewInformation;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something Went Wrong. " + ex.Message;
            }
            return Ok(responseData);
        }


        [HttpGet]
        [Route("GetRFQDetailsById/{RFQId}")]
        public async Task<IActionResult> GetRFQDetailsById([FromRoute] int RFQId)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetRFQDetailsByIdVM rfqDetails = await inventoryDb.GetRFQDetails(RFQId);
                responseData.Status = "OK";
                responseData.Results = rfqDetails;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something Went Wrong. " + ex.Message;
            }
            return Ok(responseData);
        }

        [HttpGet("GetQuotationDetailsToAddPO/{RFQId}")]
        public async Task<IActionResult> GetQuotationDetailsToAddPO([FromRoute] int RFQId)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetQuotationDetailsToAddPOVm rfqDetails = await inventoryDb.GetQuotationDetailsToAddPO(RFQId);
                responseData.Status = "OK";
                responseData.Results = rfqDetails;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something Went Wrong. " + ex.Message;
            }
            return Ok(responseData);
        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                // string Str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                #region//this for saving the PO Requisition
                if (reqType != null && reqType == "PostPORequisition")
                {
                    string Str = this.ReadPostData();
                    PurchaseRequestModel reqFromClient = DanpheJSONConvert.DeserializeObject<PurchaseRequestModel>(Str);
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    if (reqFromClient != null && reqFromClient.PurchaseRequestItems != null && reqFromClient.PurchaseRequestItems.Count > 0)
                    {
                        reqFromClient.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext, reqFromClient.RequestDate).FiscalYearId;
                        reqFromClient.PRNumber = _receiptNumberService.GeneratePurchaseRequestNumber(reqFromClient.FiscalYearId, reqFromClient.PRGroupId);

                        reqFromClient.CreatedBy = currentUser.EmployeeId;
                        reqFromClient.CreatedOn = DateTime.Now;
                        inventoryDbContext.PurchaseRequest.Add(reqFromClient);
                        inventoryDbContext.SaveChanges();
                        var reqId = reqFromClient.PurchaseRequestId;
                        reqFromClient.PurchaseRequestItems.ForEach(item =>
                        {
                            item.CreatedOn = DateTime.Now;
                            item.PurchaseRequestId = reqId;
                            inventoryDbContext.SaveChanges();
                        });
                        var PRSettings = VerificationBL.GetPurchaseRequestVerificationSetting(inventoryDbContext);
                        if (PRSettings.EnableVerification == true && PRSettings.VerificationLevel > 0)
                        {
                            var NotificationDB = new NotiFicationDbContext(connString);
                            List<int> PRVerifiersRoleIds = new List<int>();
                            PRSettings.PermissionIds.ForEach(P => PRVerifiersRoleIds.AddRange(RBAC.GetAllRoleIdsByPermissionId(P)));
                            PRVerifiersRoleIds.ForEach(RoleId =>
                            {
                                InventoryBL.CreateNotificationForPRVerifiers(reqFromClient.PurchaseRequestId, RoleId, NotificationDB);

                            });
                        }
                        responseData.Results = reqFromClient.PurchaseRequestId;
                    }
                }
                #endregion
                #region cancel purchase order and post to inventory txn purchase order table
                else if (reqType == "cancel-purchase-order")
                {

                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    string POIdstr = this.ReadQueryStringData("purchaseOrderId");
                    int poId = int.Parse(POIdstr);
                    string CancelRemarks = this.ReadPostData();
                    bool flag = true;
                    flag = InventoryBL.CancelPurchaseOrderById(inventoryDbContext, poId, CancelRemarks, currentUser);
                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "Purchase Order Cancellation Failed !!!";
                        responseData.Status = "Failed";
                    }
                }
                #endregion


                //#region cancel goods receipt and post to inventory txn goods receipt table
                //else if (reqType == "cancel-goods-receipt")
                //{
                //    //sanjit: 25Mar'2020 This function has been migrated to a new HttpPost Request CancelGoodsReceipt()
                //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //    string Str = this.ReadPostData();
                //    int grId = int.Parse(Str);
                //    bool flag = true;
                //    var EmptyString = "";
                //    flag = InventoryBL.CancelGoodsReceipt(inventoryDbContext, grId, EmptyString, currentUser);
                //    if (flag)
                //    {
                //        responseData.Status = "OK";
                //        responseData.Results = 1;
                //    }
                //    else
                //    {
                //        responseData.ErrorMessage = "Goods Receipt Cancellation Failed !!!";
                //        responseData.Status = "Failed";
                //    }
                //}
                //#endregion
                if (reqType != null && reqType == "ReqForQuotation")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    string Str = this.ReadPostData();
                    RequestForQuotation reqForQuotation = DanpheJSONConvert.DeserializeObject<RequestForQuotation>(Str);
                    if (reqForQuotation != null && reqForQuotation.ReqForQuotationItems != null && reqForQuotation.ReqForQuotationVendors != null && reqForQuotation.ReqForQuotationItems.Count > 0)
                    {
                        reqForQuotation.ReqForQuotationItems.ForEach(item =>
                        {
                            item.CreatedOn = DateTime.Now;
                        });
                        reqForQuotation.ReqForQuotationVendors.ForEach(item =>
                        {
                            item.CreatedOn = DateTime.Now;
                            item.CreatedBy = currentUser.EmployeeId;
                        });
                        reqForQuotation.CreatedOn = DateTime.Now;
                        reqForQuotation.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext).FiscalYearId;
                        reqForQuotation.RequestForQuotationNo = _receiptNumberService.GenerateRequestForQuotationNumber(reqForQuotation.FiscalYearId, reqForQuotation.RFQGroupId);
                        inventoryDbContext.ReqForQuotation.Add(reqForQuotation);
                        inventoryDbContext.SaveChanges();
                    }
                }


                else if (reqType == "uploadQuotationFiles")
                {
                    var files = this.ReadFiles();
                    var quotationDetails = Request.Form["quotationFileDetails"];
                    QuotationUploadedFiles quotationFileData = DanpheJSONConvert.DeserializeObject<QuotationUploadedFiles>(quotationDetails);
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    foreach (var file in files)
                    {
                        if (file.Length > 0)
                        {
                            /////Converting Files to Byte there for we require MemoryStream object
                            using (var ms = new MemoryStream())
                            {
                                ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
                                string currentFileExtention = Path.GetExtension(file.FileName);
                                ////Copy Each file to MemoryStream
                                file.CopyTo(ms);
                                ////Convert File to Byte[]
                                var fileBytes = ms.ToArray();

                                var avilableMAXFileNo = (from dbFile in inventoryDbContext.quotationUploadedFiles
                                                         where dbFile.QuotationUploadedFileId == quotationFileData.QuotationUploadedFileId && dbFile.FileType == quotationFileData.FileType
                                                         select new { dbFile.FileNo }).ToList();
                                int max;
                                max = 0;
                                if (avilableMAXFileNo.Count > 0)
                                {
                                    max = avilableMAXFileNo.Max(x => x.FileNo);
                                }
                                else
                                {
                                    max = 0;
                                }
                                ///this is Current Insrting File MaX Number
                                var currentFileNo = (max + 1);
                                string currentfileName = "";
                                // this is Latest File NAme with FileNo in the Last Binding
                                currentfileName = quotationFileData.FileName + '_' + currentFileNo + currentFileExtention;

                                var quotationAddModel = new QuotationUploadedFiles();
                                quotationAddModel.FileBinaryData = fileBytes;
                                quotationAddModel.RequestForQuotationId = quotationFileData.RequestForQuotationId;
                                quotationAddModel.ROWGUID = Guid.NewGuid();
                                quotationAddModel.FileType = quotationFileData.FileType;
                                quotationAddModel.UpLoadedBy = currentUser.EmployeeId;
                                quotationAddModel.UpLoadedOn = DateTime.Now;
                                quotationAddModel.FileName = currentfileName;
                                quotationAddModel.FileNo = currentFileNo;
                                quotationAddModel.Description = quotationFileData.Description;
                                quotationAddModel.FileExtention = currentFileExtention;
                                quotationAddModel.VendorId = quotationFileData.VendorId;
                                inventoryDbContext.quotationUploadedFiles.Add(quotationAddModel);
                                inventoryDbContext.SaveChanges();
                            }
                        }
                    }
                }

                else if (reqType == "quotationDetails")
                {

                    using (var dbTransaction = inventoryDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var currentDate = DateTime.Now;
                            string Str = this.ReadPostData();
                            List<Quotation> quotationDataFromClient = DanpheJSONConvert.DeserializeObject<List<Quotation>>(Str);
                            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");



                            foreach (var quotation in quotationDataFromClient)
                            {
                                if (quotation.QuotationId == null)
                                {
                                    quotation.CreatedOn = currentDate;
                                    quotation.CreatedBy = currentUser.EmployeeId;
                                    quotation.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext, quotation.CreatedOn).FiscalYearId;
                                    //quotation.QuotationNo = _receiptNumberService.GenerateQuotationNumber(quotation.FiscalYearId, quotation.RFQGroupId);
                                    quotation.quotationItems.ForEach(item =>
                                    {
                                        item.VendorId = quotation.VendorId;
                                        item.QuotationId = quotation.QuotationId;
                                        item.UpLoadedOn = currentDate;
                                        item.UpLoadedBy = currentUser.EmployeeId;
                                    });
                                    inventoryDbContext.Quotations.Add(quotation);
                                    inventoryDbContext.SaveChanges();
                                }
                                else
                                {
                                    foreach (var qItems in quotation.quotationItems)
                                    {
                                        if (qItems.QuotationItemId > 0)
                                        {
                                            var quotationItems = inventoryDbContext.QuotationItems.Find(qItems.QuotationItemId);
                                            quotationItems.ModifiedBy = currentUser.EmployeeId;
                                            quotationItems.ModifiedOn = currentDate;
                                            quotationItems.Price = qItems.Price;
                                            inventoryDbContext.SaveChanges();
                                        }
                                    }
                                }

                            }
                            dbTransaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            throw ex;
                        }
                    }
                    responseData.Results = null;
                    responseData.Status = "OK";
                }

                #region Post(save) Dispatched Items to database
                else if (reqType != null && reqType.ToLower() == "dispatchitems")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    string Str = this.ReadPostData();
                    List<DispatchItemsModel> dispatchItems = DanpheJSONConvert.DeserializeObject<List<DispatchItemsModel>>(Str);

                    if (dispatchItems != null && dispatchItems.Count > 0)
                    {
                        int DispatchId = 0;
                        using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                DispatchId = InventoryBL.DispatchItemsTransaction(dispatchItems, _receiptNumberService, inventoryDbContext, currentUser);

                                dbContextTransaction.Commit();
                            }
                            catch (Exception ex)
                            {
                                //Rollback all transaction if exception occured
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }
                        if (DispatchId > 0)
                        {
                            responseData.Status = "OK";
                            responseData.Results = DispatchId;
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Dispatch Items is null";
                        responseData.Status = "Failed";
                    }
                }
                #endregion

                #region Post(Save) Write-Off items to database and Entry in Stock_transaction and update in Stock
                else if (reqType != null && reqType.ToLower() == "writeoffitems")
                {
                    string Str = this.ReadPostData();
                    List<WriteOffItemsModel> writeItemsFromClient = DanpheJSONConvert.DeserializeObject<List<WriteOffItemsModel>>(Str);
                    if (writeItemsFromClient != null)
                    {
                        Boolean flag = false;
                        var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        flag = InventoryBL.WriteOffItemsTransaction(writeItemsFromClient, inventoryDbContext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Write-Off Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion

                #region POST ReturnToVendorItems
                else if (reqType != null && reqType == "ReturnToVendor")
                {
                    string Str = this.ReadPostData();
                    //List<ReturnToVendorModel> retrnToVendor = DanpheJSONConvert.DeserializeObject<List<ReturnToVendorModel>>(Str);

                    ReturnToVendorModel retrnToVendor = DanpheJSONConvert.DeserializeObject<ReturnToVendorModel>(Str);
                    //List<ReturnToVendorItemsModel> retrnToVendor = DanpheJSONConvert.DeserializeObject<List<ReturnToVendorItemsModel>>(Str);

                    if (retrnToVendor != null)
                    {
                        var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        ////setting Flag for checking whole transaction of ReturnToVendorTransaction
                        Boolean flag = false;
                        flag = InventoryBL.ReturnToVendorTransaction(retrnToVendor, inventoryDbContext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Return to Supplier Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }

                }
                #endregion

                else if (reqType != null && reqType == "Requisition")
                {
                    string Str = this.ReadPostData();
                    RequisitionModel RequisitionFromClient = DanpheJSONConvert.
                        DeserializeObject<RequisitionModel>(Str);

                    List<RequisitionItemsModel> requisitionItems = new List<RequisitionItemsModel>();
                    RequisitionModel requisition = new RequisitionModel();
                    var currentDate = DateTime.Now;

                    //giving List Of RequisitionItems to requItemsFromClient because we have save the requisition and RequisitionItems One by one ..
                    //first the requisition is saved  after that we have to take the requisitionid and give the requisitionid  to the RequisitionItems ..and then we can save the RequisitionItems
                    requisitionItems = RequisitionFromClient.RequisitionItems;

                    //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
                    RequisitionFromClient.RequisitionItems = null;
                    requisition.IssueNo = RequisitionFromClient.IssueNo;
                    //asigining the value to POFromClient with POitems= null
                    requisition = RequisitionFromClient;
                    requisition.CreatedOn = currentDate;
                    //sanjit: 8 Apr'20: added to maintain history table.
                    //requisition.ModifiedBy = requisition.CreatedBy;
                    //requisition.ModifiedOn = requisition.CreatedOn;
                    if (requisition.RequisitionDate == null)
                    {
                        requisition.RequisitionDate = currentDate;
                    }
                    else
                    {
                        // generate the time part from current date time and subtract it from requisition date,
                        // in order to save both date and time part in requisition date field
                        var currDateTime = DateTime.Now;
                        var diff = currDateTime.Subtract(requisition.RequisitionDate.Value).Days;
                        requisition.RequisitionDate = currDateTime.AddDays(-diff);
                    }
                    requisition.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext, requisition.RequisitionDate).FiscalYearId;
                    requisition.RequisitionNo = _receiptNumberService.GenerateRequisitionNumber(requisition.FiscalYearId, requisition.ReqDisGroupId);
                    inventoryDbContext.Requisitions.Add(requisition);

                    //this is for requisition only
                    inventoryDbContext.SaveChanges();

                    //getting the lastest RequistionId 
                    int lastRequId = requisition.RequisitionId;
                    int lastRequNo = requisition.RequisitionNo;
                    int? issueNo = requisition.IssueNo;
                    //assiging the RequisitionId and CreatedOn i requisitionitem list
                    requisitionItems.ForEach(item =>
                    {
                        item.RequisitionId = lastRequId;
                        item.RequisitionNo = lastRequNo;
                        item.IssueNo = issueNo;
                        item.CreatedOn = DateTime.Now;
                        item.ModifiedBy = item.CreatedBy;
                        item.ModifiedOn = item.CreatedOn;
                        item.AuthorizedOn = DateTime.Now;
                        item.PendingQuantity = (double)item.Quantity;
                        item.CancelQuantity = (double)item.CancelQuantity;
                        inventoryDbContext.RequisitionItems.Add(item);

                    });
                    //this Save for requisitionItems
                    inventoryDbContext.SaveChanges();
                    responseData.Results = RequisitionFromClient.RequisitionId;

                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        [HttpPost]
        [Route("~/api/Inventory/WithdrawRequisitionById/{RequisitionId}")]
        public IActionResult WithdrawRequisitionById([FromRoute] int RequisitionId)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            InventoryDbContext db = new InventoryDbContext(connString);

            string RequisitionStatus = "withdrawn";
            string WithdrawRemarks = this.ReadPostData();
            bool flag = true;
            flag = InventoryBL.CancelSubstoreRequisition(db, RequisitionId, WithdrawRemarks, currentUser, null, RequisitionStatus); //since it is cancelled in substore level, verificationId is not created.
            if (flag)
            {
                responseData.Status = "OK";
                responseData.Results = 1;
            }
            else
            {
                responseData.ErrorMessage = "Requisition Cancellation Failed !!!";
                responseData.Status = "Failed";
            }

            return Ok(responseData);
        }

        [HttpPost]
        [Route("~/api/Inventory/CancelGoodsReceipt/{GoodsReceiptId}")]
        public IActionResult CancelGoodsReceipt([FromRoute] int GoodsReceiptId)
        {
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                //sanjit: 25Mar'2020 This function was migrated from reqtype='cancel-goods-receipt'.
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var inventoryDbContext = new InventoryDbContext(connString);
                string CancelRemarks = this.ReadPostData().ToString();

                InventoryBL.CancelGoodsReceipt(inventoryDbContext, GoodsReceiptId, CancelRemarks, currentUser);

                responseData.Status = "OK";
                responseData.Results = 1;
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = $"Goods Receipt Cancellation Failed. Details: {ex.Message}";
                responseData.Status = "Failed";
            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Inventory/WithdrawPurchaseRequestById/{PurchaseRequestId}")]
        public IActionResult WithdrawPurchaseRequestById(int PurchaseRequestId)
        {
            var context = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string RequestStatus = "withdrawn";
                string WithdrawRemarks = this.ReadPostData();
                var flag = InventoryBL.CancelPurchaseRequestById(context, PurchaseRequestId, WithdrawRemarks, currentUser, null, RequestStatus);
                responseData.Status = "OK";
                responseData.Results = PurchaseRequestId;
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong";
            }
            return Ok();
        }
        [HttpGet("GetStockListForDirectDispatch/{StoreId}")]
        public async Task<IActionResult> GetStockListForDirectDispatch([FromRoute] int StoreId)
        {
            var responseData = new DanpheHTTPResponse<object>();
            var db = new InventoryDbContext(connString);
            try
            {
                responseData.Results = await (from S in db.StoreStocks.Include(s => s.StockMaster)
                                              join I in db.Items on S.ItemId equals I.ItemId
                                              join U in db.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals U.UOMId into UJ
                                              from ULJ in UJ.DefaultIfEmpty()
                                              where S.StoreId == StoreId && S.IsActive == true && S.AvailableQuantity > 0
                                              group new { S, I, ULJ } by new { S.ItemId, S.StockMaster.BatchNo } into SG
                                              select new
                                              {
                                                  ItemId = SG.Key.ItemId,
                                                  ItemName = SG.Select(s => s.I.ItemName).FirstOrDefault(),
                                                  ItemCode = SG.Select(s => s.I.Code).FirstOrDefault(),
                                                  ItemUOM = SG.FirstOrDefault().ULJ == null ? "N/A" : SG.Select(s => s.ULJ.UOMName).FirstOrDefault(),
                                                  BatchNo = SG.Key.BatchNo,
                                                  AvailableQuantity = SG.Sum(s => s.S.AvailableQuantity)
                                              }).ToListAsync();
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = ex.Message.ToString();
                responseData.Status = "Failed";
            }

            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Inventory/PostDirectDispatch")]
        public IActionResult PostDirectDispatch([FromBody] List<DispatchItemsModel> dispatchItems)
        {
            var responseData = new DanpheHTTPResponse<object>();
            var inventoryDb = new InventoryDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                InventoryBL.DirectDispatch(dispatchItems, _receiptNumberService, inventoryDb, currentUser);
                responseData.Status = "OK";
                responseData.Results = dispatchItems[0].DispatchId;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.ToString();

            }
            return Ok(responseData);
        }
        [HttpPost("~/api/Inventory/PostPurchaseOrder")]
        public IActionResult PostPurchaseOrder([FromBody] PurchaseOrderModel poFromClient)
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var currentDate = DateTime.Now;
            try
            {
                if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
                {
                    poFromClient.PurchaseOrderItems.ForEach(item =>
                    {
                        item.PendingQuantity = item.Quantity - item.ReceivedQuantity;
                        item.CreatedOn = currentDate;
                        item.CreatedBy = currentUser.EmployeeId;
                        //remove it when Maker-Checker concept is added.
                        //and get the actual authorizedon value when it's authorized.<sudarshan:20Jun'17>
                        item.AuthorizedOn = currentDate;
                    });
                    poFromClient.CreatedOn = currentDate;
                    if (poFromClient.PoDate == null)
                    {
                        poFromClient.PoDate = currentDate;
                    }
                    //check if verification enabled
                    poFromClient.VerifierIds = (poFromClient.IsVerificationEnabled == true) ? InventoryBL.SerializeProcurementVerifiers(poFromClient.VerifierList) : "";
                    poFromClient.FiscalYearId = InventoryBL.GetFiscalYear(inventoryDbContext).FiscalYearId;
                    poFromClient.PONumber = _receiptNumberService.GeneratePurchaseOrderNumber(poFromClient.FiscalYearId, poFromClient.POGroupId);
                    poFromClient.CreatedBy = currentUser.EmployeeId;
                    inventoryDbContext.PurchaseOrders.Add(poFromClient);
                    inventoryDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = poFromClient.PurchaseOrderId;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            responseData.Status = "OK";
            try
            {
                InventoryDbContext inventorygDbContext = new InventoryDbContext(connString);
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");

                #region PUT Update Purchase Order and PUrchase order status after Goods Receipt Generation
                //
                if (reqType != null && reqType.ToLower() == "updatepoandpoitemstatus")
                {
                    PurchaseOrderModel PurchaseOrderFromClient = DanpheJSONConvert.
                       DeserializeObject<PurchaseOrderModel>(str);
                    // map all the entities we want to update.
                    // OwnedCollection for list, OwnedEntity for one-one navigational property
                    // test it thoroughly, also with sql-profiler on how it generates the code

                    //inventorygDbContext.UpdateGraph(PurchaseOrderFromClient,
                    //    map => map.
                    //    OwnedCollection(a => a.PurchaseOrderItems));

                    inventorygDbContext.PurchaseOrders.Attach(PurchaseOrderFromClient);
                    inventorygDbContext.Entry(PurchaseOrderFromClient).Property(x => x.POStatus).IsModified = true;

                    foreach (var POItem in PurchaseOrderFromClient.PurchaseOrderItems)
                    {
                        inventorygDbContext.PurchaseOrderItems.Attach(POItem);
                        inventorygDbContext.Entry(POItem).Property(x => x.ReceivedQuantity).IsModified = true;
                        inventorygDbContext.Entry(POItem).Property(x => x.PendingQuantity).IsModified = true;
                        inventorygDbContext.Entry(POItem).Property(x => x.POItemStatus).IsModified = true;
                    }

                    inventorygDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = "Purchase Order Status Changed successfully.";
                }
                #endregion

                #region PUT Update Requisition and Requisition status after Requisition dispatch
                //
                else if (reqType != null && reqType.ToLower() == "updaterequisitionstatus")
                {
                    RequisitionModel RequistionFromClient = DanpheJSONConvert.
                       DeserializeObject<RequisitionModel>(str);
                    // map all the entities we want to update.
                    // OwnedCollection for list, OwnedEntity for one-one navigational property
                    // test it thoroughly, also with sql-profiler on how it generates the code


                    RequistionFromClient.ModifiedOn = DateTime.Now;
                    RequistionFromClient.ModifiedBy = currentUser.EmployeeId;
                    inventorygDbContext.Requisitions.Attach(RequistionFromClient);
                    inventorygDbContext.Entry(RequistionFromClient).Property(x => x.RequisitionStatus).IsModified = true;
                    inventorygDbContext.Entry(RequistionFromClient).Property(x => x.ModifiedBy).IsModified = true;
                    inventorygDbContext.Entry(RequistionFromClient).Property(x => x.ModifiedOn).IsModified = true;

                    foreach (var ReqItem in RequistionFromClient.RequisitionItems)
                    {
                        ReqItem.ModifiedBy = RequistionFromClient.ModifiedBy;
                        ReqItem.ModifiedOn = RequistionFromClient.ModifiedOn;
                        inventorygDbContext.RequisitionItems.Attach(ReqItem);
                        inventorygDbContext.Entry(ReqItem).Property(x => x.ReceivedQuantity).IsModified = true;
                        inventorygDbContext.Entry(ReqItem).Property(x => x.PendingQuantity).IsModified = true;
                        inventorygDbContext.Entry(ReqItem).Property(x => x.RequisitionItemStatus).IsModified = true;
                        inventorygDbContext.Entry(ReqItem).Property(x => x.ModifiedBy).IsModified = true;
                        inventorygDbContext.Entry(ReqItem).Property(x => x.ModifiedOn).IsModified = true;
                    }

                    inventorygDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = "Requisition Status Changed successfully.";
                }
                #endregion
                #region PUT : Stock Manage
                else if (reqType == "stockManage")
                {
                    //TODO: All the logic removed as stockManage must be handled differently.
                    responseData.Status = "OK";
                }
                #endregion
                #region PUT: Update selected vendor for PO and request of Quotation
                else if (reqType == "SelectedVendorforPO")
                {
                    Quotation quotData = DanpheJSONConvert.DeserializeObject<Quotation>(str);
                    int reqId = (int)quotData.ReqForQuotationId;
                    int vendor = quotData.VendorId;
                    RequestForQuotation req = inventorygDbContext.ReqForQuotation.Where(a => a.ReqForQuotationId == reqId).FirstOrDefault<RequestForQuotation>();
                    if (req != null)
                    {
                        req.Status = "Finalised";
                        inventorygDbContext.Entry(req).State = EntityState.Modified;
                    }
                    Quotation quot = inventorygDbContext.Quotations.Where(a => (a.ReqForQuotationId == reqId && a.VendorId == vendor)).FirstOrDefault<Quotation>();
                    if (quot != null)
                    {
                        quot.Status = "selected";
                        quot.IssuedDate = quotData.IssuedDate;
                        inventorygDbContext.Entry(quot).State = EntityState.Modified;
                    }
                    inventorygDbContext.SaveChanges();
                    responseData.Status = "OK";

                }
                #endregion


                #region Put:Update Assets Check List 
                else if (reqType == "updateassetchecklist")
                {
                    string Str = this.ReadPostData();
                    FixedAssetConditionCheckListModel fixedAssetstock = JsonConvert.DeserializeObject<FixedAssetConditionCheckListModel>(str);
                    using (var dbTransaction = inventorygDbContext.Database.BeginTransaction())
                    {
                        try
                        {



                            inventorygDbContext.SaveChanges();
                            dbTransaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                        }

                    }
                }
                #endregion


                #region this for editing the PO and POitems
                else if (reqType != null && reqType == "UpdatePurchaseOrder")
                {
                    string Str = this.ReadPostData();
                    PurchaseOrderModel poFromClient = DanpheJSONConvert.DeserializeObject<PurchaseOrderModel>(Str);
                    if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
                    {
                        using (var dbTransaction = inventorygDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                //to assign POID if new item has been added.
                                var PoId = poFromClient.PurchaseOrderId;
                                //if any old item has been deleted, we need to compare POitemidlist
                                List<int> POItmIdList = inventorygDbContext.PurchaseOrderItems.Where(a => a.PurchaseOrderId == PoId).Select(a => a.PurchaseOrderItemId).ToList();
                                //check if verifiers are needed to be set again.
                                poFromClient.VerifierIds = (poFromClient.IsVerificationEnabled == true) ? InventoryBL.SerializeProcurementVerifiers(poFromClient.VerifierList) : "";
                                poFromClient.PurchaseOrderItems.ForEach(itm =>
                                {

                                    if (itm.PurchaseOrderItemId > 0) //old elememnt will have the purchaseOrderItemId
                                    {
                                        itm.PendingQuantity = itm.Quantity;
                                        itm.VATAmount = itm.VATAmount;
                                        inventorygDbContext.PurchaseOrderItems.Attach(itm);
                                        inventorygDbContext.Entry(itm).State = EntityState.Modified;
                                        inventorygDbContext.Entry(itm).Property(x => x.PurchaseOrderId).IsModified = false;
                                        inventorygDbContext.Entry(itm).Property(x => x.AuthorizedOn).IsModified = false;
                                        inventorygDbContext.Entry(itm).Property(x => x.AuthorizedBy).IsModified = false;
                                        inventorygDbContext.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                                        inventorygDbContext.Entry(itm).Property(x => x.CreatedBy).IsModified = false;
                                        inventorygDbContext.Entry(itm).Property(x => x.VATAmount).IsModified = true;
                                        inventorygDbContext.SaveChanges();
                                        //delete the present POitemid from the list, so later we can delete the remaining item in the list.
                                        POItmIdList = POItmIdList.Where(a => a != itm.PurchaseOrderItemId).ToList();
                                    }

                                    else //new items wont have PurchaseOrderItemId
                                    {
                                        //for adding new reqitm
                                        itm.CreatedOn = DateTime.Now;
                                        itm.CreatedBy = currentUser.EmployeeId;
                                        itm.PurchaseOrderId = PoId;
                                        itm.AuthorizedOn = DateTime.Now;
                                        itm.AuthorizedBy = currentUser.EmployeeId;
                                        itm.PendingQuantity = itm.Quantity;
                                        itm.POItemStatus = "active";
                                        inventorygDbContext.PurchaseOrderItems.Add(itm);
                                        inventorygDbContext.SaveChanges();
                                    }
                                });

                                inventorygDbContext.PurchaseOrders.Attach(poFromClient);
                                inventorygDbContext.Entry(poFromClient).State = EntityState.Modified;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.CreatedOn).IsModified = false;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.CreatedBy).IsModified = false;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.FiscalYearId).IsModified = false;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.PONumber).IsModified = false;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.POGroupId).IsModified = false;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.ModifiedOn).IsModified = true;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.ModifiedBy).IsModified = true;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.VerifierIds).IsModified = true;
                                inventorygDbContext.Entry(poFromClient).Property(x => x.RequisitionId).IsModified = false;
                                inventorygDbContext.SaveChanges();

                                //for deleting old element
                                if (POItmIdList.Any())
                                {
                                    foreach (int poitmid in POItmIdList)
                                    {
                                        var poitm = inventorygDbContext.PurchaseOrderItems.Find(poitmid);
                                        poitm.IsActive = false;
                                        poitm.POItemStatus = "cancelled";
                                        poitm.ModifiedBy = currentUser.EmployeeId;
                                        poitm.ModifiedOn = DateTime.Now;
                                    }
                                    inventorygDbContext.SaveChanges();
                                }
                                dbTransaction.Commit();
                                responseData.Results = poFromClient.PurchaseOrderId; ;
                            }
                            catch (Exception Ex)
                            {
                                dbTransaction.Rollback();
                                throw Ex;
                            }
                        }
                    }
                }
                #endregion
                #region//this for editing the PO Requisition
                else if (reqType != null && reqType == "UpdatePORequisition")
                {
                    string Str = this.ReadPostData();
                    PurchaseRequestModel purchaseRequestFromClient = DanpheJSONConvert.DeserializeObject<PurchaseRequestModel>(Str);
                    if (purchaseRequestFromClient != null && purchaseRequestFromClient.PurchaseRequestItems != null && purchaseRequestFromClient.PurchaseRequestItems.Count > 0)
                    {
                        purchaseRequestFromClient.ModifiedOn = DateTime.Now;
                        purchaseRequestFromClient.ModifiedBy = currentUser.EmployeeId;
                        var reqId = purchaseRequestFromClient.PurchaseRequestId;
                        //if any old item has been deleted, we need to compare requisitionitemidlist
                        List<int> ReqItmIdList = inventorygDbContext.PurchaseRequestItems.Where(a => a.PurchaseRequestId == reqId && a.IsActive == true).Select(a => a.PurchaseRequestItemId).ToList();
                        purchaseRequestFromClient.PurchaseRequestItems.ForEach(item =>
                        {
                            if (item.PurchaseRequestItemId > 0) //old elememnt will have the requisitionItemId
                            {
                                //for updating old element
                                item.ModifiedBy = currentUser.EmployeeId;
                                item.ModifiedOn = DateTime.Now;
                                inventorygDbContext.PurchaseRequestItems.Attach(item);
                                inventorygDbContext.Entry(item).Property(a => a.ItemId).IsModified = true;
                                inventorygDbContext.Entry(item).Property(a => a.VendorId).IsModified = true;
                                inventorygDbContext.Entry(item).Property(a => a.RequestedQuantity).IsModified = true;
                                inventorygDbContext.Entry(item).Property(a => a.Remarks).IsModified = true;
                                inventorygDbContext.Entry(item).Property(a => a.ModifiedBy).IsModified = true;
                                inventorygDbContext.Entry(item).Property(a => a.ModifiedBy).IsModified = true;
                                inventorygDbContext.SaveChanges();
                                //cancel the present POitemid from the list, so later we can delete the remaining item in the list.
                                ReqItmIdList = ReqItmIdList.Where(a => a != item.PurchaseRequestItemId).ToList();
                            }
                            else //new items wont have requisitionItemId
                            {
                                //for adding new reqitm
                                item.CreatedOn = DateTime.Now;
                                item.CreatedBy = currentUser.EmployeeId;
                                item.PurchaseRequestId = reqId;
                                item.RequestItemStatus = "active";
                                item.VendorId = purchaseRequestFromClient.VendorId;
                                inventorygDbContext.PurchaseRequestItems.Add(item);
                                inventorygDbContext.SaveChanges();
                            }
                        });
                        //for cancelling old element
                        if (ReqItmIdList.Any())
                        {
                            foreach (int reqitmid in ReqItmIdList)
                            {
                                var reqitm = inventorygDbContext.PurchaseRequestItems.Find(reqitmid);
                                reqitm.IsActive = false;
                                reqitm.CancelledBy = currentUser.EmployeeId;
                                reqitm.CancelledOn = DateTime.Now;
                                reqitm.RequestItemStatus = "withdrawn";
                                inventorygDbContext.PurchaseRequestItems.Attach(reqitm);
                                inventorygDbContext.Entry(reqitm).Property(a => a.IsActive).IsModified = true;
                                inventorygDbContext.Entry(reqitm).Property(a => a.CancelledOn).IsModified = true;
                                inventorygDbContext.Entry(reqitm).Property(a => a.CancelledBy).IsModified = true;
                                inventorygDbContext.Entry(reqitm).Property(a => a.RequestItemStatus).IsModified = true;
                                inventorygDbContext.SaveChanges();
                            }

                            inventorygDbContext.SaveChanges();
                        }
                        inventorygDbContext.PurchaseRequest.Attach(purchaseRequestFromClient);
                        inventorygDbContext.Entry(purchaseRequestFromClient).Property(a => a.RequestDate).IsModified = true;
                        inventorygDbContext.Entry(purchaseRequestFromClient).Property(a => a.VendorId).IsModified = true;
                        inventorygDbContext.Entry(purchaseRequestFromClient).Property(a => a.Remarks).IsModified = true;
                        inventorygDbContext.Entry(purchaseRequestFromClient).Property(a => a.ModifiedOn).IsModified = true;
                        inventorygDbContext.Entry(purchaseRequestFromClient).Property(a => a.ModifiedOn).IsModified = true;
                        inventorygDbContext.SaveChanges();
                        responseData.Results = purchaseRequestFromClient.PurchaseRequestId;
                    }
                }
                #endregion
                #region//this for updating the PO Requisition after PO creation
                else if (reqType != null && reqType == "UpdatePORequisitionAfterPOCreation")
                {
                    string Str = this.ReadPostData();
                    int? reqId = DanpheJSONConvert.DeserializeObject<int?>(Str);
                    if (reqId != null && reqId > 0)
                    {
                        var req = inventorygDbContext.PurchaseRequest.Where(P => P.PurchaseRequestId == reqId).Include(a => a.PurchaseRequestItems).FirstOrDefault();
                        req.IsPOCreated = true;
                        req.RequestStatus = "complete";
                        req.PurchaseRequestItems.ForEach(item => item.RequestItemStatus = "complete");
                        inventorygDbContext.SaveChanges();
                        responseData.Results = reqId;
                    }
                }
                #endregion
                #region Cancel remaning itms
                else if (reqType != null && reqType == "cancelRequisitionItems")
                {

                    RequisitionModel reqFromClientC = DanpheJSONConvert.DeserializeObject<RequisitionModel>(str);
                    if (reqFromClientC != null && reqFromClientC.RequisitionId != 0 && reqFromClientC.CancelledItems != null && reqFromClientC.CancelledItems.Count > 0)
                    {
                        try
                        {

                            //get list of all items inside current requisition and use it locally.
                            List<RequisitionItemsModel> reqItemsListFromDb = inventorygDbContext.RequisitionItems.Where(rqItm => rqItm.RequisitionId == reqFromClientC.RequisitionId).ToList();

                            //loop in the reqItems from client and update the values to reqItems from Db accordingly.
                            reqFromClientC.CancelledItems.ForEach(reqItmFromClient =>
                                                        {
                                                            RequisitionItemsModel currReqItmModel_Db = reqItemsListFromDb.Find(a => a.RequisitionItemId == reqItmFromClient.RequisitionItemId);
                                                            if (currReqItmModel_Db != null)
                                                            {
                                                                currReqItmModel_Db.CancelQuantity = reqItmFromClient.CancelQuantity;
                                                                currReqItmModel_Db.PendingQuantity = reqItmFromClient.PendingQuantity;//this comes as ZERO from client side in case of cancellation.
                                                                currReqItmModel_Db.ReceivedQuantity = reqItmFromClient.ReceivedQuantity;
                                                                currReqItmModel_Db.CancelRemarks = reqItmFromClient.CancelRemarks;
                                                                currReqItmModel_Db.CancelOn = DateTime.Now;
                                                                currReqItmModel_Db.CancelBy = currentUser.EmployeeId;//this is taken from server side.
                                                                currReqItmModel_Db.ModifiedOn = currReqItmModel_Db.CancelOn;
                                                                currReqItmModel_Db.ModifiedBy = currReqItmModel_Db.CancelBy;
                                                                if (reqItmFromClient.ReceivedQuantity == 0)
                                                                {
                                                                    currReqItmModel_Db.IsActive = false;
                                                                    currReqItmModel_Db.RequisitionItemStatus = "cancelled";//if not a single item has been dispatched, item status must be cancelled.
                                                                }
                                                                else
                                                                {
                                                                    currReqItmModel_Db.RequisitionItemStatus = "complete";//after cancelled, status becomes 'complete' so that it can't be dispatched later on.
                                                                }
                                                                inventorygDbContext.RequisitionItems.Attach(currReqItmModel_Db);

                                                                //inventorygDbContext.Entry(currreqModel).State = EntityState.Modified;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelQuantity).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.PendingQuantity).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.ReceivedQuantity).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelOn).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelBy).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelRemarks).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.ModifiedBy).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.ModifiedOn).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.IsActive).IsModified = true;
                                                                inventorygDbContext.Entry(currReqItmModel_Db).Property(a => a.RequisitionItemStatus).IsModified = true;
                                                            }
                                                        });

                            //if status of all items inside this requisition is 'complete' then update the status of requisition to 'complete', else do nothing.
                            if (reqItemsListFromDb.All(a => a.RequisitionItemStatus == "complete" || a.RequisitionItemStatus == "cancelled"))
                            {
                                RequisitionModel reqData = inventorygDbContext.Requisitions.Where(a => a.RequisitionId == reqFromClientC.RequisitionId).FirstOrDefault();
                                if (reqItemsListFromDb.All(a => a.RequisitionItemStatus == "cancelled"))
                                {
                                    reqData.RequisitionStatus = "cancelled";
                                    reqData.IsCancel = true;
                                }
                                else
                                {
                                    reqData.RequisitionStatus = "complete";
                                }
                                reqData.ModifiedBy = currentUser.EmployeeId;
                                reqData.ModifiedOn = DateTime.Now;
                                inventorygDbContext.Requisitions.Attach(reqData);
                                inventorygDbContext.Entry(reqData).Property(x => x.RequisitionStatus).IsModified = true;
                                inventorygDbContext.Entry(reqData).Property(x => x.IsCancel).IsModified = true;
                                inventorygDbContext.Entry(reqData).Property(x => x.ModifiedBy).IsModified = true;
                                inventorygDbContext.Entry(reqData).Property(x => x.ModifiedOn).IsModified = true;
                            }
                            inventorygDbContext.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        }
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.Results = null;
                        responseData.ErrorMessage = "Requisition details not found for cancellation.";
                    }
                }
                #endregion

                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Request Not Found!";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
