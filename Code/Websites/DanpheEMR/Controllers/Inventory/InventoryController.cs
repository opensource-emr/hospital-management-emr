using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.ServerModel.InventoryModels.DTOs;
using DanpheEMR.Services;
using DanpheEMR.Services.Inventory.DTO.InventoryRequisition;
using DanpheEMR.Services.Inventory.DTO.RequisitionDispatch;
using DanpheEMR.Services.Verification;
using DanpheEMR.Services.WardSupply.Inventory.Requisition.DTOs;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel;
using DanpheEMR.ViewModel.Inventory;
using DanpheEMR.ViewModel.Procurement;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Org.BouncyCastle.Ocsp;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class InventoryController : CommonController
    {
        private IVerificationService _verificationService;
        private IInventoryReceiptNumberService _receiptNumberService;
        private IInventoryGoodReceiptService _inventoryGoodReceiptService;
        private readonly InventoryDbContext _inventoryDbContext;
        private readonly PharmacyDbContext _phrmdbcontext;
        private readonly MasterDbContext _masterDbContext;


        public InventoryController(IOptions<MyConfiguration> _config, IVerificationService verificationService, IInventoryReceiptNumberService receiptNumberService, IInventoryGoodReceiptService inventoryGoodReceiptService) : base(_config)
        {
            _verificationService = verificationService;
            _receiptNumberService = receiptNumberService;
            _inventoryGoodReceiptService = inventoryGoodReceiptService;
            _inventoryDbContext = new InventoryDbContext(connString); ;
            _phrmdbcontext = new PharmacyDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
        }

        [HttpGet]
        [Route("Vendors")]
        public IActionResult GetVendorList()
        {
            //if (reqType == "VendorList")
            Func<object> func = () => GetVendorsList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetVendorsList()
        {
            string returnValue = string.Empty;
            List<VendorMasterModel> VendorList = _inventoryDbContext.Vendors.ToList();
            foreach (VendorMasterModel vendor in VendorList)
            {
                vendor.DefaultItem = DanpheJSONConvert.DeserializeObject<List<int>>(vendor.DefaultItemJSON);
            }
            return VendorList;
        }


        [HttpGet]
        [Route("TermsList")]
        public IActionResult GetTermsList()
        {
            // if (reqType == "TermsList")
            Func<object> func = () => (_inventoryDbContext.InventoryTerms.ToList());
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("ItemWiseRequistion")]
        public IActionResult GetItemwiseRequistion()
        {
            //else if (reqType == "itemwiseRequistionList")
            Func<object> func = () => GetItemwiseRequistionList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetItemwiseRequistionList()
        {
            var rItems = (from rItms in _inventoryDbContext.RequisitionItems
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
            var stks = (from stk in _inventoryDbContext.StoreStocks
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
            return reqstkItems;
        }

        //Get VAT against ItemId from ItemMaster table
        //which has Available Quantity >0 in Stock Table  for WriteOff functinality

        [HttpGet]
        [Route("AvailableItemQty")]
        public IActionResult GetAvailableItemQty(int storeId)
        {
            // else if (reqType != null && reqType.ToLower() == "getavailableqtyitemlist")
            Func<object> func = () => (from stock in _inventoryDbContext.StoreStocks
                                       join items in _inventoryDbContext.Items on stock.ItemId equals items.ItemId
                                       join grItems in _inventoryDbContext.GoodsReceiptItems on stock.ItemId equals grItems.ItemId
                                       where stock.AvailableQuantity > 0 && stock.StoreId == storeId
                                       group items by new { items.ItemId, items.Code, items.ItemName, items.Description, items.StandardRate, items.VAT, grItems.ItemRate, stock.AvailableQuantity } into itms
                                       select new
                                       {
                                           ItemId = itms.Key.ItemId,
                                           ItemName = itms.Key.ItemName,
                                           Description = itms.Key.Description,
                                           Rate = itms.Key.ItemRate,
                                           VAT = itms.Key.VAT,
                                           Code = itms.Key.Code,
                                           AvailableQuantity = itms.Key.AvailableQuantity
                                       }
                               ).OrderBy(a => a.ItemName).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        //Get RequisitionItems by Requisition Id don't check any status this for View Purpose

        [HttpGet]
        [Route("RequisitionItemsForView")]
        public IActionResult GetRequisitionItemForView(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "requisitionitemsforview")
            Func<object> func = () => GetRequisitionItemsForViewing(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRequisitionItemsForViewing(int requisitionId)
        {

            var requisition = (from req in _inventoryDbContext.Requisitions.Where(req => req.RequisitionId == requisitionId)
                               join emp in _inventoryDbContext.Employees on req.CreatedBy equals emp.EmployeeId
                               join dis in _inventoryDbContext.Dispatch on req.RequisitionId equals dis.RequisitionId into dispGroup
                               from dispatch in dispGroup.DefaultIfEmpty()
                               join dispEmp in _inventoryDbContext.Employees on dispatch.CreatedBy equals dispEmp.EmployeeId into DispEmpGroup
                               from dispatchEmp in DispEmpGroup.DefaultIfEmpty()
                               select new SubStoreRequisition_DTO
                               {
                                   CreatedOn = req.CreatedOn,
                                   RequisitionNo = req.RequisitionNo,
                                   IssueNo = req.IssueNo,
                                   DispatchNo = dispatch.DispatchNo,
                                   CreatedByName = emp.FullName,
                                   ReceivedBy = dispatchEmp != null ? dispatchEmp.FullName : null,
                                   Remarks = req.Remarks,
                                   IsDirectDispatched = req.IsDirectDispatched,
                                   RequisitionStatus = req.RequisitionStatus,
                                   VerificationId = req.VerificationId,
                               }).FirstOrDefault();


            var requisitionItems = (from reqitm in _inventoryDbContext.RequisitionItems.Where(reqitm => reqitm.RequisitionId == requisitionId)
                                    join emp in _inventoryDbContext.Employees on reqitm.CancelBy equals emp.EmployeeId into cancelledByGroup
                                    from cancelledDetails in cancelledByGroup.DefaultIfEmpty()
                                    join itm in _inventoryDbContext.Items on reqitm.ItemId equals itm.ItemId
                                    join dispitmGrouped in (
                                                    from dispitm in _inventoryDbContext.DispatchItems.Where(disitm => disitm.RequisitionId == requisitionId)
                                                    group dispitm by new { dispitm.ItemId, dispitm.RequisitionItemId, dispitm.ReceivedById } into grouped
                                                    select new
                                                    {
                                                        grouped.Key.ItemId,
                                                        grouped.Key.RequisitionItemId,
                                                        grouped.Key.ReceivedById,
                                                        DispatchedQuantity = grouped.Sum(x => x.DispatchedQuantity)
                                                    }
                                                ) on new { reqitm.RequisitionItemId, reqitm.ItemId } equals new { dispitmGrouped.RequisitionItemId, dispitmGrouped.ItemId } into dispitmGroupedJoin
                                    from dispitm in dispitmGroupedJoin.DefaultIfEmpty()
                                    join disEmp in _inventoryDbContext.Employees on dispitm.ReceivedById equals disEmp.EmployeeId into disEmpGroupedJoin
                                    from dispatchingEmployee in disEmpGroupedJoin.DefaultIfEmpty()
                                    select new SubStoreRequisitionItems_DTO
                                    {
                                        RequisitionId = reqitm.RequisitionId,
                                        RequisitionItemId = reqitm.RequisitionItemId,
                                        RequisitionNo = reqitm.RequisitionNo,
                                        RequisitionItemStatus = reqitm.RequisitionItemStatus,
                                        Remark = reqitm.Remark,
                                        CreatedBy = reqitm.CreatedBy,
                                        CreatedOn = reqitm.CreatedOn,
                                        Quantity = reqitm.Quantity,
                                        PendingQuantity = reqitm.PendingQuantity,
                                        ReceivedQuantity = dispitm != null ? dispitm.DispatchedQuantity : 0,
                                        DispatchedQuantity = dispitm != null ? dispitm.DispatchedQuantity : 0,
                                        CancelQuantity = reqitm.CancelQuantity ?? 0,
                                        CancelBy = reqitm.CancelBy,
                                        CancelOn = reqitm.CancelOn,
                                        CancelRemarks = reqitm.CancelRemarks,
                                        CancelledByName = cancelledDetails != null ? cancelledDetails.FullName : null,
                                        ItemName = itm.ItemName,
                                        ItemCategory = reqitm.ItemCategory,
                                        Code = itm.Code,
                                        IsActive = reqitm.IsActive,
                                        ReceivedBy = dispatchingEmployee != null ? dispatchingEmployee.FullName : null
                                    }).ToList();


            requisition.RequisitionItems = requisitionItems;

            var verifiers = (requisition.VerificationId != null) ? VerificationBL.GetVerifiersList(requisition.VerificationId ?? 0, _inventoryDbContext) : null;
            var dispatchers = VerificationBL.GetDispatchersList(requisitionId, _inventoryDbContext);
            return new
            {
                Requisition = requisition,
                Verifiers = verifiers,
                Dispatchers = dispatchers
            };
        }

        [HttpGet]
        [Route("DispatchView")]
        public IActionResult GetDispatchView(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "dispatchview")
            Func<object> func = () => (InventoryBL.GetDispatchesFromRequisitionId(requisitionId, _inventoryDbContext));
            return InvokeHttpGetFunction<object>(func);

        }

        [HttpGet]
        [Route("CancelledRequisitionDetail")]
        public IActionResult CancelledRequisitionDetail(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "cancelview")
            Func<object> func = () => GetCancelledRequisition(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetCancelledRequisition(int requisitionId)
        {
            var requisitionItems = (from reqItems in _inventoryDbContext.RequisitionItems
                                    where reqItems.RequisitionId == requisitionId && reqItems.CancelQuantity > 0
                                    select reqItems).ToList();
            var employeeList = (from emp in _inventoryDbContext.Employees select emp).ToList();

            var requestDetails = (from reqItem in requisitionItems
                                  join emp in _inventoryDbContext.Employees on reqItem.CancelBy equals emp.EmployeeId
                                  join itm in _inventoryDbContext.Items on reqItem.ItemId equals itm.ItemId
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
            return requestDetails;

        }

        [HttpGet]
        [Route("DispatchViewByDispatchIdReqIdCreatedOn")]
        public IActionResult DispatchViewByDispatchIdRequestIdCreatedOn(int dispatchId, int requisitionId, DateTime? createdOn)
        {
            //else if (reqType != null && reqType.ToLower() == "dispatchviewbydispatchid")
            Func<object> func = () => DispatchViewDetailByDispatchId(dispatchId, requisitionId, createdOn);
            return InvokeHttpGetFunction<object>(func);
        }
        private object DispatchViewDetailByDispatchId(int DispatchId, int RequisitionId, DateTime? CreatedOn)
        {
            InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
            var fiscalyearId = InventoryBL.GetFiscalYear(_inventoryDbContext, CreatedOn).FiscalYearId; //Rohit: To get fiscalyearId
            var dispatchDetails = invreportingDbContext.DispatchDetail(DispatchId, fiscalyearId, RequisitionId);
            DataTable requisitionDispatch = dispatchDetails.Tables[0];
            DataTable requisitionDispatchItems = dispatchDetails.Tables[1];
            return new
            {
                RequisitionDispatch = RequisitionDispatchDTO.MapDataTableToSingleObject(requisitionDispatch),
                RequisitionDispatchItems = requisitionDispatchItems,

            };
        }

        [HttpGet]
        [Route("ReturnItemDetails")]
        public IActionResult GetReturnItemDetails(DateTime createdOn, int vendorId)
        {
            //else if (reqType != null && reqType == "returnItemDetails")
            Func<object> func = () => GetReturnItemDetail(createdOn, vendorId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetReturnItemDetail(DateTime createdOn, int vendorId)
        {
            var returnList = _inventoryDbContext.ReturnToVendorItems.ToList().Where(r => r.CreatedOn == createdOn && r.VendorId == vendorId);
            var returnItemList = (from list in returnList
                                  join grItem in _inventoryDbContext.GoodsReceipts on list.GoodsReceiptId equals grItem.GoodsReceiptID
                                  join vendor in _inventoryDbContext.Vendors on list.VendorId equals vendor.VendorId
                                  join item in _inventoryDbContext.Items on list.ItemId equals item.ItemId
                                  join emp in _inventoryDbContext.Employees on list.CreatedBy equals emp.EmployeeId
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
                                      VATAmount = list.VATAmount,
                                      SubTotal = list.SubTotal,
                                      DiscountAmount = list.DiscountAmount,
                                      CCAmount = list.CCAmount,
                                      CreatedByName = emp.FullName,
                                  }).ToList();
            return returnItemList;

        }


        [HttpGet]
        [Route("PurchaseOrders")]
        public IActionResult GetPurchaseOrderList(DateTime fromDate, DateTime toDate, string status, int storeId)
        {
            //else if (reqType != null && reqType.ToLower() == "purchaseorderlist")
            Func<object> func = () => GetPurchaseOrdersList(fromDate, toDate, status, storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetPurchaseOrdersList(DateTime fromDate, DateTime toDate, string status, int storeId)
        {
            string[] poStatuses = status.Split(',');
            // var testdate = toDate.AddDays(1);
            var POList = (from po in _inventoryDbContext.PurchaseOrders
                          join v in _inventoryDbContext.Vendors on po.VendorId equals v.VendorId
                          join stat in poStatuses on po.POStatus equals stat
                          join pr in _inventoryDbContext.PurchaseRequest on po.RequisitionId equals pr.PurchaseRequestId into prJ
                          from prLJ in prJ.DefaultIfEmpty()
                          join verif in _inventoryDbContext.Verifications on po.VerificationId equals verif.VerificationId into verifJ
                          from verifLJ in verifJ.DefaultIfEmpty()
                          where (DbFunctions.TruncateTime(po.PoDate) >= fromDate && DbFunctions.TruncateTime(po.PoDate) <= toDate)
                          && po.StoreId == storeId
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
            return POList;

        }


        [HttpGet]
        [Route("PurchaseOrderItemByPOId")]
        public IActionResult GetPurchaseOrderItemByPOId(int purchaseOrderId)
        {
            //else if (reqType != null && reqType.ToLower() == "purchaseorderitemsbypoid")
            Func<object> func = () => PurchaseOrderItemDetailByPOId(purchaseOrderId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object PurchaseOrderItemDetailByPOId(int purchaseOrderId)
        {
            PurchaseOrderModel requestDetails = (from PO in _inventoryDbContext.PurchaseOrders
                                                 where (PO.POStatus == "partial" || PO.POStatus == "active") && (PO.PurchaseOrderId == purchaseOrderId)
                                                 select PO)
                                  .Include(v => v.Vendor)
                                  .Include(POI => POI.PurchaseOrderItems.Select(i => i.Item))
                                  .FirstOrDefault();
            string[] BadPOItemStatus = { "complete", "cancel", "cancelled", "withdrawn" };
            requestDetails.PurchaseOrderItems = requestDetails.PurchaseOrderItems.Where(POI => BadPOItemStatus.Contains(POI.POItemStatus) == false || POI.IsActive == true).ToList();

            return requestDetails;

        }

        //for Dispatch Items to department against Requisition Id
        [HttpGet]
        [Route("RequisitionByRequisitionId")]
        public IActionResult GetRequisitionById(int requisitionId)
        {
            //else if (reqType != null && reqType.ToLower() == "requisitionbyid")
            Func<object> func = () => GetRequisitionDetailById(requisitionId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetRequisitionDetailById(int requisitionId)
        {
            RequisitionStockVM requisitionStockVM = new RequisitionStockVM();

            //Getting Requisition and Requisition Items by Requisition Id
            //Which RequisitionStatus and requisitionItemsStatus is not 'complete','cancel' and 'initiated'
            var incompleteReqStatus = new string[3] { "active", "approved", "partial" };
            RequisitionModel requisitionDetails = (
                                                    from requisition in _inventoryDbContext.Requisitions
                                                    where requisition.RequisitionId == requisitionId
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
                if ((bool)rItem.Item.IsFixedAssets)
                {
                    rItem.BarCodeList = (from fixedAssetStock in _inventoryDbContext.FixedAssetStock
                                         where fixedAssetStock.ItemId == rItem.ItemId && fixedAssetStock.IsActive == true && fixedAssetStock.StoreId == requisitionDetails.RequestToStoreId && fixedAssetStock.SubStoreId == null
                                         select new BarCodeNumberDTO
                                         {
                                             BarCodeNumber = fixedAssetStock.BarCodeNumber,
                                             StockId = fixedAssetStock.FixedAssetStockId
                                         }).ToList();
                    rItem.AvailableQuantity = rItem.BarCodeList.Count();
                }
                else
                {
                    rItem.AvailableQuantity = (from stock in _inventoryDbContext.StoreStocks
                                               where stock.ItemId == rItem.ItemId
                                                && stock.AvailableQuantity > 0
                                                && stock.IsActive == true
                                                && stock.StoreId == requisitionDetails.RequestToStoreId
                                               group stock by stock.ItemId into stockG
                                               select stockG.Sum(s => s.AvailableQuantity)
                                                ).FirstOrDefault();
                }
            }


            requisitionStockVM.requisition = requisitionDetails;
            return requisitionStockVM;
        }

        [HttpGet]
        [Route("RequisitionItemForView")]
        public IActionResult GetRequisitionItemView(int requisitionId)
        {// else if (reqType != null && reqType.ToLower() == "get-requisitionitems-for-view")
            Func<object> func = () => GetRequisitionItemForViewing(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRequisitionItemForViewing(int requisitionId)
        {
            //this stored proc returns two tables: 1. RequisitionItemsInfo and 2. Dispatch info.
            DataSet dsReqDetails = DALFunctions.GetDatasetFromStoredProc("INV_TXN_VIEW_GetRequisitionItemsInfoForView",
                new List<SqlParameter>() { new SqlParameter("@RequisitionId", requisitionId) },
                _inventoryDbContext
                );
            var verificationId = _inventoryDbContext.Requisitions.Where(R => R.RequisitionId == requisitionId).Select(R => R.VerificationId).FirstOrDefault();
            List<VerificationActor> verifiers = null;
            if (verificationId != null)
            {
                verifiers = VerificationBL.GetVerifiersList(verificationId ?? 0, _inventoryDbContext);
            }
            var dispatchers = VerificationBL.GetDispatchersList(requisitionId, _inventoryDbContext);
            // return anynomous type and handle further in clilent side.. 
            var retItem = new
            {
                RequisitionItemsInfo = dsReqDetails.Tables[0],
                DispatchInfo = dsReqDetails.Tables[1],
                Verifiers = verifiers,
                Dispatchers = dispatchers
            };
            return retItem;
        }


        //getting requisition items by item id for DISPATCH-ALL
        [HttpGet]
        [Route("RequisitionByItemId")]
        public IActionResult GetRequisitionByItemId(int itemId)
        {
            //else if (reqType != null && reqType.ToLower() == "requisitionbyitemid")
            Func<object> func = () => GetRequisitionDetailByItemId(itemId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRequisitionDetailByItemId(int itemId)
        {
            RequisitionsStockVM reqItemStockVM = new RequisitionsStockVM();
            List<RequisitionModel> requList = (from requisition in _inventoryDbContext.Requisitions
                                               where (requisition.RequisitionStatus == "partial" || requisition.RequisitionStatus == "active")
                                               select requisition)
                                                        .Include(rItems => rItems.RequisitionItems.Select(i => i.Item))
                                                        .ToList();
            List<DepartmentModel> deptList = (from dept in _masterDbContext.Departments
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
            List<StoreStockModel> stocks = (from stock in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                            where (stock.ItemId == itemId && stock.AvailableQuantity > 0)
                                            select stock)
                                           .OrderBy(s => s.StockMaster.ExpiryDate).ToList();

            return reqItemStockVM;
        }

        [HttpGet]
        [Route("WriteOffItems")]
        public IActionResult GetWriteOffItems()
        {
            //else if (reqType != null && reqType == "writeOffItemList")
            Func<object> func = () => GetWriteOffItemsList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetWriteOffItemsList()
        {
            var writeOffItemList = (from writeOff in _inventoryDbContext.WriteOffItems
                                    join item in _inventoryDbContext.Items on writeOff.ItemId equals item.ItemId
                                    join unit in _inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
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
            return writeOffItemList;
        }



        [HttpGet]
        [Route("ReturnVendorItems")]
        public IActionResult GetReturnVendorItems(int storeId)
        {
            //else if (reqType != null && reqType == "returnVendorItemList")
            Func<object> func = () => GetReturnVendorItemsDetail(storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetReturnVendorItemsDetail(int storeId)
        {
            var returnVendorItemList = (from vendorItem in _inventoryDbContext.ReturnToVendorItems
                                        let StoreId = _inventoryDbContext.ReturnToVendor.FirstOrDefault(a => a.ReturnToVendorId == vendorItem.ReturnToVendorId).StoreId
                                        where StoreId == storeId
                                        group vendorItem by vendorItem.CreatedOn into vi
                                        join vendor in _inventoryDbContext.Vendors on vi.FirstOrDefault().VendorId equals vendor.VendorId
                                        orderby vi.FirstOrDefault().ReturnToVendorItemId descending
                                        select new
                                        {
                                            CreatedOn = vi.Key,
                                            VendorId = vendor.VendorId,
                                            VendorName = vendor.VendorName,
                                            CreditNoteNo = vi.FirstOrDefault().CreditNoteNo
                                        }).ToList();

            return returnVendorItemList;
        }


        [HttpGet]
        [Route("VendorDetailsByVendorId")]
        public IActionResult GetVendorDetailsByVendorId(int vendorId)
        {
            //  else if (reqType == "VendorDetails")
            Func<object> func = () => GetVendorDetailByVendorId(vendorId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetVendorDetailByVendorId(int vendorId)
        {
            string returnValue = string.Empty;
            List<VendorMasterModel> vendorDetails = new List<VendorMasterModel>();
            vendorDetails = (from vendor in _inventoryDbContext.Vendors
                             where vendor.VendorId == vendorId
                             select vendor).ToList();

            return vendorDetails;

        }

        [HttpGet]
        [Route("VendorsDetail")]
        public IActionResult GetVendorsDetail()
        {
            //else if (reqType == "getvendordetails")
            Func<object> func = () => GetVendors();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetVendors()
        {
            List<VendorMasterModel> Vendors = new List<VendorMasterModel>();

            Vendors = (from Vendor in _inventoryDbContext.Vendors
                       select Vendor).ToList();


            return Vendors;


        }

        [HttpGet]
        [Route("Requisitions")]
        public IActionResult GetRequisitionList(string status, int itemId)
        {
            //else if (reqType != null && reqType == "requisitionList")
            Func<object> func = () => GetRequisitionDetailList(status, itemId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRequisitionDetailList(string status, int itemId)
        {
            // in this we have to bring the data from 2 diffferent dbcontext master and inventory ..but
            // we can not use to different dbcontext in one linq query ....
            //so what i have done is first brought all active requisition in RequisitionList and department in DepartmentList 
            //and then applied join and the conditions using both the list in requestDetails
            List<DepartmentModel> DepartmentList = (from dept in _masterDbContext.Departments
                                                    select dept).ToList();
            //in status there is comma seperated values so we are splitting status by using  comma(,)
            // this all we have do because we have to check multiple status at one call
            //like when user select all we have to we get all Requisition by matching the status like complete,active,partial and initiated...
            string[] requisitionStatus = status.Split(',');

            //in this there is 2 join  ..
            // first join to check the status  and second one to get vendors name 
            //and second join is with RequisitionStatus because it has all the status the need to be checked...


            List<RequisitionModel> RequisitionList = (from requ in _inventoryDbContext.Requisitions
                                                      join reqItem in _inventoryDbContext.RequisitionItems on itemId equals reqItem.ItemId
                                                      join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                                      where requ.RequisitionId == reqItem.RequisitionId
                                                      orderby requ.RequisitionDate descending
                                                      select requ).ToList();

            var requestDetails = (from rep in RequisitionList
                                  join dep in DepartmentList on rep.DepartmentId equals dep.DepartmentId
                                  join reqItem in _inventoryDbContext.RequisitionItems on itemId equals reqItem.ItemId
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

            return requestDetails;
        }

        [HttpGet]
        [Route("DeptWiseRequistions")]
        public IActionResult GetDeptWiseRequistionsList(string status)
        {
            //else if (reqType != null && reqType == "deptwiseRequistionList")
            Func<object> func = () => GetDeptWiseRequistions(status);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetDeptWiseRequistions(string status)
        {
            string[] requisitionStatus = status.Split(',');
            //we need data from 2 different dbContext, we cannot use them together in one linq query
            //therefore, first we get dept,requisition and then using both the list we get final result
            List<DepartmentModel> DepartmentList = (from dept in _masterDbContext.Departments
                                                    select dept).ToList();

            List<RequisitionModel> RequisitionList = (from requ in _inventoryDbContext.Requisitions
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
            return requestDetails;
        }

        [HttpGet]
        [Route("Department")]
        public IActionResult DepartmentByRequisitionId(int requisitionId)
        {
            //else if (reqType != null && reqType == "deptDetail")
            Func<object> func = () => GetDepartmentByRequisitionId(requisitionId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetDepartmentByRequisitionId(int requisitionId)
        {
            DepartmentModel departmentDetails = (from req in _inventoryDbContext.Requisitions
                                                 where (req.RequisitionId == requisitionId)
                                                 join dept in _inventoryDbContext.Departments on req.DepartmentId equals dept.DepartmentId
                                                 select dept).FirstOrDefault();

            return departmentDetails;

        }


        [HttpGet]
        [Route("GoodsReceipStocks")]
        public IActionResult GetGoodsReceipStocks(DateTime fromDate, DateTime toDate, int storeId)
        {
            //else if (reqType == "goodsreceipstocklist")
            Func<object> func = () => GoodsReceipStockByStoreIdAndDateRange(fromDate, toDate, storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GoodsReceipStockByStoreIdAndDateRange(DateTime fromDate, DateTime toDate, int storeId)
        {
            //var testdate = toDate.AddDays(1);
            var activeGRStatus = new string[2] { "active", "verified" };
            var goodsreceiptStockList = (from gorecipt in _inventoryDbContext.GoodsReceipts.Include(gri => gri.GoodsReceiptItem)
                                         join vend in _inventoryDbContext.Vendors on gorecipt.VendorId equals vend.VendorId
                                         join fisc in _inventoryDbContext.FiscalYears on gorecipt.FiscalYearId equals fisc.FiscalYearId into gs
                                         from fisc in gs.DefaultIfEmpty()
                                         where (DbFunctions.TruncateTime(gorecipt.GoodsArrivalDate) >= fromDate && DbFunctions.TruncateTime(gorecipt.GoodsArrivalDate) <= toDate)
                                         && activeGRStatus.Contains(gorecipt.GRStatus)
                                         && gorecipt.StoreId == storeId
                                         select new
                                         {
                                             gorecipt.GoodsArrivalDate,
                                             gorecipt.GoodsReceiptDate,
                                             gorecipt.VendorBillDate,
                                             gorecipt.GoodsReceiptID,
                                             gorecipt.GoodsArrivalNo,
                                             gorecipt.GoodsReceiptNo,
                                             gorecipt.PurchaseOrderId,
                                             gorecipt.BillNo,
                                             gorecipt.TotalAmount,
                                             gorecipt.PaymentMode,
                                             gorecipt.CreatedOn,
                                             gorecipt.ReceivedRemarks,
                                             vend.VendorName,
                                             vend.ContactNo,
                                             gorecipt.GRStatus,
                                             IsQuantityAvailableToDispatchFromGR = _inventoryDbContext.StoreStocks.Where(stk => gorecipt.GoodsReceiptItem.Select(itm => itm.StoreStockId).ToList().Contains(stk.StoreStockId)).Sum(stk => stk.AvailableQuantity) > 0 ? true : false
                                         }).ToList().OrderByDescending(a => a.GoodsReceiptID);

            return goodsreceiptStockList;
        }

        [HttpGet]
        [Route("GoodsReceipt")]
        public IActionResult GetGoodsReceipt(DateTime fromDate, DateTime toDate, int storeId)
        {
            //else if (reqType == "goodsreceipt")
            Func<object> func = () => GetGoodsReceiptList(fromDate, toDate, storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGoodsReceiptList(DateTime fromDate, DateTime toDate, int storeId)
        {

            //var testdate = toDate.AddDays(1);//to include ToDate, 1 day was added--rusha 07/15/2019
            var goodsReceiptList = (from GR in _inventoryDbContext.GoodsReceipts
                                    join V in _inventoryDbContext.Vendors on GR.VendorId equals V.VendorId
                                    join FY in _inventoryDbContext.FiscalYears on GR.FiscalYearId equals FY.FiscalYearId into FYG
                                    from FYLJ in FYG.DefaultIfEmpty()
                                    join PO in _inventoryDbContext.PurchaseOrders on GR.PurchaseOrderId equals PO.PurchaseOrderId into POG
                                    from POLJ in POG.DefaultIfEmpty()
                                    join VRF in _inventoryDbContext.Verifications on GR.VerificationId equals VRF.VerificationId into VRFG
                                    from VRFLj in VRFG.DefaultIfEmpty()
                                    where (DbFunctions.TruncateTime(GR.GoodsArrivalDate) >= fromDate && DbFunctions.TruncateTime(GR.GoodsArrivalDate) <= toDate) && GR.StoreId == storeId
                                    orderby GR.GoodsReceiptID descending
                                    select new
                                    {
                                        BillNo = GR.BillNo,
                                        GoodsReceiptID = GR.GoodsReceiptID,
                                        GoodsArrivalNo = GR.GoodsArrivalNo,
                                        GoodsReceiptNo = GR.GoodsReceiptNo,
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

            return goodsReceiptList;
        }


        [HttpGet]
        [Route("GoodsReceiptMasterList")]
        public IActionResult GetGoodsReceiptMaster(int storeId)
        {
            //else if (reqType == "getGoodsReceiptMasterList")
            Func<object> func = () => GetGoodsReceiptMasterList(storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGoodsReceiptMasterList(int storeId)
        {
            var fiscalyearId = InventoryBL.GetFiscalYear(_inventoryDbContext, DateTime.Now).FiscalYearId;
            var goodsReceipt = _inventoryGoodReceiptService.ListGoodsReceipt().Where(gr => gr.StoreId == storeId && gr.FiscalYearId == fiscalyearId);
            return goodsReceipt;
        }

        [HttpGet]
        [Route("GoodsReceiptByEachVendor")]
        public IActionResult GetGoodsReceiptByVendor()
        {
            //else if (reqType == "get-goods-receipt-groupby-vendor")
            Func<object> func = () => GetGoodsReceiptByEachVendorList();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGoodsReceiptByEachVendorList()
        {
            var Sno = 0;
            var goodReceiptList = _inventoryDbContext.GoodsReceipts.Where(a => a.IsCancel == false).ToList().GroupJoin(_inventoryDbContext.Vendors.ToList(), a => a.VendorId, b => b.VendorId, (a, b) =>
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
                       GoodsReceiptId = a.GoodsReceiptID
                   }).ToList().OrderByDescending(a => a.GoodsReceiptId).GroupBy(a => a.VendorId).Select(
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
                    GoodsReceiptId = a.Select(s => s.GoodsReceiptId).FirstOrDefault()

                }
                );


            return goodReceiptList;
        }

        [HttpGet]
        [Route("GoodsReceiptByVendorId")]
        public IActionResult GetGrByVendorId(int vendorId)
        {
            //else if (reqType == "getGrDetailByVendorId")
            Func<object> func = () => GetGrDetailByVendorId(vendorId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetGrDetailByVendorId(int vendorId)
        {
            var Sno = 0;
            var vendorList = _inventoryDbContext.GoodsReceipts.Where(a => a.IsCancel == false && a.VendorId == vendorId).ToList().GroupJoin(_inventoryDbContext.Vendors.ToList(), a => a.VendorId, b => b.VendorId, (a, b) =>
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

            return vendorList;
        }


        [HttpGet]
        [Route("GoodsReceiptByGRId")]
        public IActionResult GRItemsByGRId(int goodsReceiptId)
        {
            //else if (reqType == "GRItemsDetailsByGRId")
            Func<object> func = () => GetGRItemsDetailsByGRId(goodsReceiptId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGRItemsDetailsByGRId(int goodsReceiptId)
        {
            var gritems = (from gritms in _inventoryDbContext.GoodsReceiptItems
                           join itms in _inventoryDbContext.Items on gritms.ItemId equals itms.ItemId into itmsGroup
                           from itm in itmsGroup.DefaultIfEmpty()
                           join uom in _inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId
                           join category in _inventoryDbContext.ItemCategoryMaster on itm.ItemCategoryId equals category.ItemCategoryId into ctgGroup
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
                               RegisterPageNumber = itm.RegisterPageNumber,
                               GRItemCharges = (from GRItemCharges in _inventoryDbContext.GRItemCharges
                                                join chargeMaster in _inventoryDbContext.OtherCharges on GRItemCharges.ChargeId equals chargeMaster.ChargeId
                                                where GRItemCharges.GoodsReceiptItemId == gritms.GoodsReceiptItemId
                                                select new GRItemChargesDTO
                                                {
                                                    Id = GRItemCharges.Id,
                                                    ChargeName = chargeMaster.ChargeName,
                                                    TotalAmount = GRItemCharges.TotalAmount
                                                }).ToList(),
                           }).OrderBy(g => g.GoodsReceiptItemId).ToList();//sud:28Sept'21--to show in the same order as entry.
            var grdetails = (from gr in _inventoryDbContext.GoodsReceipts
                             join ven in _inventoryDbContext.Vendors on gr.VendorId equals ven.VendorId
                             from po in _inventoryDbContext.PurchaseOrders.Where(p => p.PurchaseOrderId == gr.PurchaseOrderId).DefaultIfEmpty()
                             from ganFy in _inventoryDbContext.InventoryFiscalYears.Where(a => a.StartDate <= gr.GoodsArrivalDate && a.EndDate >= gr.GoodsArrivalDate).DefaultIfEmpty()
                             from fyLj in _inventoryDbContext.FiscalYears.Where(fy => fy.FiscalYearId == gr.FiscalYearId).DefaultIfEmpty()
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
                                 VerificationId = gr.VerificationId,
                                 GRStatus = gr.GRStatus,
                                 VendorBillDate = gr.VendorBillDate,
                                 GRCharges = (from grOtherCharges in _inventoryDbContext.GRCharges
                                              join chargeMaster in _inventoryDbContext.OtherCharges on grOtherCharges.ChargeId equals chargeMaster.ChargeId
                                              where grOtherCharges.GoodsReceiptID == goodsReceiptId
                                              select new GRChargesDTO
                                              {
                                                  Id = grOtherCharges.Id,
                                                  ChargeName = chargeMaster.ChargeName,
                                                  TotalAmount = grOtherCharges.TotalAmount,
                                              }).ToList(),
                             }).FirstOrDefault();
            var CreatedById = grdetails.CreatedBy;
            var creator = (from emp in _masterDbContext.Employees
                           join r in _masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                           from role in roleTemp.DefaultIfEmpty()
                           where emp.EmployeeId == CreatedById
                           select new
                           {
                               Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                               Role = role.EmployeeRoleName
                           }).FirstOrDefault();
            var Verifiers = new List<VerificationViewModel>();
            if (grdetails.VerificationId != null)
            {
                Verifiers = _verificationService.GetVerificationViewModel(grdetails.VerificationId.Value).OrderBy(x => x.CurrentVerificationLevel).ToList();
            }

            //TODO: Please recheck the condition for editing date in GR : Sanjit
            var canUserEditDate = true;
            var goodsreceiptDetails = new { grItems = gritems, grDetails = grdetails, creator = creator, canUserEditDate, verifier = Verifiers };
            return goodsreceiptDetails;
        }

        [HttpGet]
        [Route("PurchaseOrderItem")]
        public IActionResult GetPOItemDetailByPOId(int purchaseOrderId, int storeId)
        {
            //else if (reqType == "POItemsDetailsByPOId")
            Func<object> func = () => GetPOItemsDetailByPOId(purchaseOrderId, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetPOItemsDetailByPOId(int purchaseOrderId, int storeId)
        {
            var poitems = (from PO in _inventoryDbContext.PurchaseOrders.Where(p => p.PurchaseOrderId == purchaseOrderId)
                           from poitms in _inventoryDbContext.PurchaseOrderItems
                           join itms in _inventoryDbContext.Items on poitms.ItemId equals itms.ItemId
                           join uom in _inventoryDbContext.UnitOfMeasurementMaster on itms.UnitOfMeasurementId equals uom.UOMId into uomJoin
                           from uomLeftJoin in uomJoin.DefaultIfEmpty()
                           where poitms.PurchaseOrderId == purchaseOrderId && PO.StoreId == storeId
                           join category in _inventoryDbContext.ItemCategoryMaster on itms.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                           from ctg in ctgGroup.DefaultIfEmpty()
                           select new
                           {
                               ItemName = itms.ItemName,
                               ItemCategory = (ctg == null) ? "" : ctg.ItemCategoryName,
                               ItemCategoryCode = (ctg == null) ? "" : ctg.CategoryCode,
                               VendorItemCode = poitms.VendorItemCode,
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
            var podetails = (from po in _inventoryDbContext.PurchaseOrders
                             join cur in _inventoryDbContext.CurrencyMaster on po.CurrencyId equals cur.CurrencyID
                             join ven in _inventoryDbContext.Vendors on po.VendorId equals ven.VendorId
                             join verif in _inventoryDbContext.Verifications on po.VerificationId equals verif.VerificationId into verifJ
                             from verifLJ in verifJ.DefaultIfEmpty()
                             join pr in _inventoryDbContext.PurchaseRequest on po.RequisitionId equals pr.PurchaseRequestId into prG
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
                                 ReferenceNo = po.ReferenceNo,
                                 InvoicingAddress = po.InvoicingAddress,
                                 DeliveryAddress = po.DeliveryAddress,
                                 ContactPersonName = po.ContactPersonName,
                                 ContactPersonEmail = po.ContactPersonEmail,
                                 PaymentMode = po.PaymentMode,
                             }).FirstOrDefault();
            if (podetails.PurchaseRequestId != null)
            {
                var prDetails = _inventoryDbContext.PurchaseRequest.Where(pr => pr.PurchaseRequestId == podetails.PurchaseRequestId).Select(pr => new { pr.PRNumber, pr.RequestDate }).FirstOrDefault();
                podetails.PRNumber = prDetails.PRNumber;
                podetails.PRDate = prDetails.RequestDate.ToString("yyyy-MM-dd");
            }
            var creator = (from emp in _masterDbContext.Employees
                           join r in _masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                           from role in roleTemp.DefaultIfEmpty()
                           where emp.EmployeeId == podetails.CreatedbyId
                           select new
                           {
                               Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                               Role = role.EmployeeRoleName
                           }).FirstOrDefault();
            var autho = poitems[0].AuthorizedBy;
            var authorizer = (from emp in _masterDbContext.Employees
                              join r in _masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
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

            return purchaseorderDetails;
        }

        [HttpGet]
        [Route("RequisitionsforPO")]
        public IActionResult GetRequisitionforPO()
        {
            //else if (reqType == "RequisitionforPO")
            Func<object> func = () => GetRequisitionsforPO();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetRequisitionsforPO()
        {
            var rItems = (from rItms in _inventoryDbContext.RequisitionItems
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

            var stks = (from stk in _inventoryDbContext.StoreStocks
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
            return result;

        }

        [HttpGet]
        [Route("Stocks")]
        public IActionResult GetStockList(int storeId)
        {
            // else if (reqType == "stockList-overall")
            Func<object> func = () => GetStocksList(storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetStocksList(int storeId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@StoreId", storeId) };
            DataTable stockList = DALFunctions.GetDataTableFromStoredProc("SP_InventoryOverAllStockList", paramList, _inventoryDbContext);
            return stockList;
        }

        [HttpGet]
        [Route("StocksForManage")]
        public IActionResult GetStockListForManage(int storeId)
        {
            //else if (reqType == "stockListForManage")
            Func<object> func = () => GetStocksListForManage(storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetStocksListForManage(int storeId)
        {

            var stock = (from stk in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                         join grItems in _inventoryDbContext.GoodsReceiptItems on stk.StockId equals grItems.StockId into ps
                         from grItems in ps.DefaultIfEmpty()
                         join itm in _inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                         join SubCat in _inventoryDbContext.ItemSubCategoryMaster on itm.SubCategoryId equals SubCat.SubCategoryId
                         join uom in _inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId into uomJoined
                         from uomLeftJoined in uomJoined.DefaultIfEmpty()
                         where stk.AvailableQuantity >= 0 && stk.StoreId == storeId
                         group new { stk, itm, uomLeftJoined, grItems, SubCat } by new { itm.ItemId, itm.ItemName, itm.MinStockQuantity, stk.StockMaster.CostPrice, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate, stk.StockId, stk.StoreId } into stocks
                         select new
                         {
                             StockId = stocks.Key.StockId,
                             ItemId = stocks.Key.ItemId,
                             ItemName = stocks.Key.ItemName.Trim(),
                             BatchNo = stocks.Key.BatchNo,
                             ExpiryDate = stocks.Key.ExpiryDate,
                             AvailQuantity = Math.Round(stocks.Sum(a => a.stk.AvailableQuantity), 4),
                             CostPrice = stocks.Key.CostPrice,
                             GRDate = stocks.Select(gr => gr.grItems.CreatedOn).FirstOrDefault(),
                             MinQuantity = stocks.Key.MinStockQuantity,
                             Code = stocks.Select(a => a.SubCat.Code).FirstOrDefault(),
                             ItemCode = stocks.Select(a => a.itm.Code).FirstOrDefault(),
                             ItemType = stocks.Select(a => a.itm.ItemType).FirstOrDefault(),
                             IsColdStorageApplicable = stocks.Select(a => a.itm.IsColdStorageApplicable).FirstOrDefault(),
                             SubCategoryName = stocks.Select(a => a.SubCat.SubCategoryName).FirstOrDefault(),
                             UnitOfMeasurementId = stocks.Select(a => a.uomLeftJoined.UOMId).FirstOrDefault(),
                             IsFixedAssets = stocks.Select(a => a.itm.IsFixedAssets).FirstOrDefault(),
                             UOMName = stocks.Select(a => a.uomLeftJoined.UOMName).FirstOrDefault(),//sud: 19Feb'20-- added UOMName since it's needed in stock list page..
                             StoreId = stocks.Key.StoreId
                         }).ToList().OrderBy(x => x.ItemName).ThenBy(x => x.AvailQuantity);

            return stock;
        }

        [HttpGet]
        [Route("StocksForDonation")]
        public IActionResult GetStocksForDonation(int storeId)
        {
            // else if (reqType == "stockListForDonation")
            Func<object> func = () => GetStocksListForDonation(storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetStocksListForDonation(int storeId)
        {
            var stock = (from stk in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                         join grItems in _inventoryDbContext.GoodsReceiptItems on stk.StockId equals grItems.StockId into ps
                         from grItems in ps.DefaultIfEmpty()
                         join itm in _inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                         join SubCat in _inventoryDbContext.ItemSubCategoryMaster on itm.SubCategoryId equals SubCat.SubCategoryId
                         join uom in _inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId into uomJoined
                         from uomLeftJoined in uomJoined.DefaultIfEmpty()
                         where stk.AvailableQuantity >= 0 && stk.StoreId == storeId
                         group new { stk, itm, uomLeftJoined, grItems, SubCat } by new { itm.ItemId, itm.ItemName, itm.Description, itm.MinStockQuantity, stk.StockMaster.CostPrice, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate, stk.StockId, stk.StoreId } into stocks
                         select new
                         {
                             StockId = stocks.Key.StockId,
                             ItemId = stocks.Key.ItemId,
                             Description = stocks.Key.Description,
                             ItemName = stocks.Key.ItemName.Trim(),
                             BatchNo = stocks.Key.BatchNo,
                             ExpiryDate = stocks.Key.ExpiryDate,
                             AvailQuantity = stocks.Sum(a => a.stk.AvailableQuantity),
                             CostPrice = stocks.Key.CostPrice,
                             GRDate = stocks.Select(gr => gr.grItems.CreatedOn).FirstOrDefault(),
                             MinQuantity = stocks.Key.MinStockQuantity,
                             Code = stocks.Select(a => a.SubCat.Code).FirstOrDefault(),
                             ItemCode = stocks.Select(a => a.itm.Code).FirstOrDefault(),
                             ItemType = stocks.Select(a => a.itm.ItemType).FirstOrDefault(),
                             IsColdStorageApplicable = stocks.Select(a => a.itm.IsColdStorageApplicable).FirstOrDefault(),
                             SubCategoryName = stocks.Select(a => a.SubCat.SubCategoryName).FirstOrDefault(),
                             UnitOfMeasurementId = stocks.Select(a => a.uomLeftJoined.UOMId).FirstOrDefault(),
                             IsFixedAssets = stocks.Select(a => a.itm.IsFixedAssets).FirstOrDefault(),
                             UOMName = stocks.Select(a => a.uomLeftJoined.UOMName).FirstOrDefault(),//sud: 19Feb'20-- added UOMName since it's needed in stock list page..
                             StoreId = stocks.Key.StoreId
                         }).ToList().OrderBy(x => x.ItemName);

            return stock;
        }

        [HttpGet]
        [Route("StocksByItemIdAndStoreId")]
        public IActionResult GetStocks(int itemId, int storeId)
        {
            //  else if (reqType == "stockDetails")
            Func<object> func = () => GetStocksByItemIdAndStoreId(itemId, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetStocksByItemIdAndStoreId(int itemId, int storeId)
        {
            var stockDetails = (from stk in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                join gritm in _inventoryDbContext.GoodsReceiptItems on stk.StockId equals gritm.StockId into gritmGrouped
                                from gritmLJ in gritmGrouped.DefaultIfEmpty()
                                join gr in _inventoryDbContext.GoodsReceipts on gritmLJ.GoodsReceiptId equals gr.GoodsReceiptID into grGrouped
                                from grLJ in grGrouped.DefaultIfEmpty()
                                where (stk.ItemId == itemId && stk.AvailableQuantity >= 0 && stk.StoreId == storeId)
                                select new
                                {
                                    GoodsArrivalNo = (gritmLJ != null) ? grLJ.GoodsArrivalNo : (int?)null,
                                    GoodsArrivalDate = (gritmLJ != null) ? grLJ.GoodsArrivalDate : null,
                                    GoodsReceiptNo = (gritmLJ != null) ? grLJ.GoodsReceiptNo : null,
                                    GoodsReceiptDate = (gritmLJ != null) ? grLJ.GoodsReceiptDate : null,
                                    BatchNo = stk.StockMaster.BatchNo,
                                    AvailQuantity = stk.AvailableQuantity,
                                    ItemRate = stk.StockMaster.CostPrice,
                                    ExpiryDate = stk.StockMaster.ExpiryDate,
                                    CostPrice = stk.StockMaster.CostPrice,
                                    Remarks = grLJ.GoodsReceiptNo == null ? "opening-item" : null
                                }).ToList();

            return stockDetails;
        }

        [HttpGet]
        [Route("StocksManageByItemIdStoreId")]
        public IActionResult GetStocksManageByItemIdStoreId(int itemId, int storeId)
        {
            //else if (reqType == "stockManage")
            Func<object> func = () => GetStocksManageListByItemIdStoreId(itemId, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetStocksManageListByItemIdStoreId(int itemId, int storeId)
        {
            var stockManage = (from stk in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                               join gri in _inventoryDbContext.GoodsReceiptItems on stk.StockId equals gri.StockId into griJ
                               from griLJ in griJ.DefaultIfEmpty()
                               join gr in _inventoryDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals gr.GoodsReceiptID into grJ
                               from grLJ in grJ.DefaultIfEmpty()
                               where (stk.ItemId == itemId && stk.AvailableQuantity >= 0 && stk.StoreId == storeId)
                               select new
                               {
                                   ItemId = stk.ItemId,
                                   StockId = stk.StockId,
                                   GoodsArrivalNo = grLJ == null ? 0 : grLJ.GoodsArrivalNo,
                                   GoodsArrivalDate = grLJ == null ? null : grLJ.GoodsArrivalDate,
                                   GoodsReceiptNo = grLJ == null ? null : grLJ.GoodsReceiptNo,
                                   GoodsReceiptDate = grLJ == null ? null : grLJ.GoodsReceiptDate,
                                   BatchNo = stk.StockMaster.BatchNo,
                                   ExpiryDate = stk.StockMaster.ExpiryDate,
                                   curQuantity = stk.AvailableQuantity,
                                   ModQuantity = stk.AvailableQuantity,
                                   ReceivedQty = griLJ == null ? 0 : griLJ.ReceivedQuantity + griLJ.FreeQuantity,
                                   CostPrice = stk.StockMaster.CostPrice,
                                   StoreId = stk.StoreId,
                                   Remarks = grLJ.GoodsReceiptNo == null ? "opening-item" : null
                               }).ToList();
            return stockManage;

        }

        [HttpGet]
        [Route("BatchNumbers")]
        public IActionResult GetBatchNumbers(int itemId)
        {
            // else if (reqType != null && reqType.ToLower() == "getbatchnobyitemid")
            Func<object> func = () => GetBatchNumbersByItemId(itemId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetBatchNumbersByItemId(int itemId)
        {
            var batchNOsByItemId = (from stk in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                    where stk.AvailableQuantity > 0 && stk.ItemId == itemId
                                    group stk by new { stk.StockMaster.BatchNo, stk.StockMaster.CostPrice } into stockItems
                                    select new
                                    {
                                        BatchNo = string.IsNullOrEmpty(stockItems.Key.BatchNo) ? "NA" : stockItems.Key.BatchNo,
                                        AvailableQuantity = stockItems.Sum(a => a.AvailableQuantity),
                                        ItemPrice = stockItems.Key.CostPrice
                                    }).ToList();

            return batchNOsByItemId;

        }

        [HttpGet]
        [Route("VendorWisePurchaseOrders")]
        public IActionResult GetVendorWisePurchaseOrders()
        {
            //else if (reqType != null && reqType.ToLower() == "getpolistvendorwise")
            Func<object> func = () => GetVendorWisePurchaseOrdersList();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetVendorWisePurchaseOrdersList()
        {

            var result = (from po in _inventoryDbContext.PurchaseOrders
                          join ven in _inventoryDbContext.Vendors on po.VendorId equals ven.VendorId
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
            return result;
        }

        [HttpGet]
        [Route("RequestForQuotations")]
        public IActionResult GetRequestForQuotations(int storeId)
        {
            //else if (reqType != null && reqType.ToLower() == "get-req-for-quotation-list")
            Func<object> func = () => GetRequestForQuotationsList(storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetRequestForQuotationsList(int storeId)
        {
            var result = (from Req in _inventoryDbContext.ReqForQuotation
                          join quotation in _inventoryDbContext.Quotations on Req.ReqForQuotationId equals quotation.ReqForQuotationId into grouped
                          from quotationGrouped in grouped.DefaultIfEmpty()
                          where (Req.Status == "active" || Req.Status == "Finalised") && Req.StoreId == storeId
                          group new { Req, quotationGrouped } by new { Req.ReqForQuotationId } into grouped
                          select new
                          {
                              RFQNo = grouped.FirstOrDefault().Req.RequestForQuotationNo,
                              RequestedOn = grouped.FirstOrDefault().Req.RequestedOn,
                              RequestedBy = grouped.FirstOrDefault().Req.RequestedBy,
                              RequestedCloseOn = grouped.FirstOrDefault().Req.RequestedCloseOn,
                              Subject = grouped.FirstOrDefault().Req.Subject,
                              Description = grouped.FirstOrDefault().Req.Description,
                              ReqForQuotationId = grouped.FirstOrDefault().Req.ReqForQuotationId,
                              Status = grouped.FirstOrDefault().Req.Status,
                              QuotationId = grouped.FirstOrDefault().quotationGrouped != null ? grouped.FirstOrDefault().quotationGrouped.QuotationId : null
                          }).ToList().OrderByDescending(r => r.ReqForQuotationId);

            return result;
        }

        [HttpGet]
        [Route("RequestForQuotationDetails")]
        public IActionResult GetRequestForQuotationDetails(int reqForQuotationId)
        {
            // else if (reqType != null && reqType.ToLower() == "get-req-for-quotation-details")
            Func<object> func = () => GetReqForQuotationDetailsById(reqForQuotationId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetReqForQuotationDetailsById(int reqForQuotationId)
        {
            var reqQuotationItems = (from ReqItem in _inventoryDbContext.ReqForQuotationItems
                                     where ReqItem.ReqForQuotationId == reqForQuotationId
                                     select new
                                     {
                                         Description = ReqItem.Description,
                                         ReqForQuotationItemId = ReqItem.ReqForQuotationItemId,
                                         CreatedBy = ReqItem.CreatedBy,
                                         CreatedOn = ReqItem.CreatedOn,
                                         ItemName = ReqItem.ItemName,
                                         Quantity = ReqItem.Quantity,

                                     }).ToList();
            var reqQuotationVendors = (from ReqVendor in _inventoryDbContext.ReqForQuotationVendors
                                       join vendor in _inventoryDbContext.Vendors on ReqVendor.VendorId equals vendor.VendorId
                                       where ReqVendor.ReqForQuotationId == reqForQuotationId
                                       select new
                                       {
                                           VendorId = vendor.VendorId,
                                           VendorName = vendor.VendorName

                                       }).ToList();
            var Results = new { RFQItems = reqQuotationItems, RFQVendors = reqQuotationVendors };
            return Results;



        }

        [HttpGet]
        [Route("RequestForQuotationItems")]
        public IActionResult GetRequestForQuotationItems(int reqForQuotationId)
        {
            //else if (reqType != null && reqType.ToLower() == "rfqitemslist")
            Func<object> func = () => GeRequestForQuotationItemsList(reqForQuotationId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GeRequestForQuotationItemsList(int reqForQuotationId)
        {
            if (reqForQuotationId != 0)
            {

                var result = (from ReqItem in _inventoryDbContext.ReqForQuotationItems
                              where ReqItem.ReqForQuotationId == reqForQuotationId
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
                return result;
            }
            return null;
        }

        [HttpGet]
        [Route("RequestForQuotationVendors")]
        public IActionResult GetRequestForQuotationVendors(int reqForQuotationId)
        {
            //else if (reqType != null && reqType.ToLower() == "rfqvendorslist")
            Func<object> func = () => GetRequestForQuotationVendorsList(reqForQuotationId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetRequestForQuotationVendorsList(int reqForQuotationId)
        {
            if (reqForQuotationId != 0)
            {

                var result = (from rfqVendor in _inventoryDbContext.ReqForQuotationVendors
                              join vendor in _inventoryDbContext.Vendors on rfqVendor.VendorId equals vendor.VendorId
                              //join quotationFiles in inventoryDbContext.quotationUploadedFiles on vendor.VendorId equals quotationFiles.VendorId
                              where rfqVendor.ReqForQuotationId == reqForQuotationId
                              select new
                              {
                                  VendorId = rfqVendor.VendorId,
                                  VendorName = vendor.VendorName

                              }).ToList();
                return result;
            }
            return null;
        }

        [HttpGet]
        [Route("Quotations")]
        public IActionResult GetQuotations(int reqForQuotationId)
        {
            // else if (reqType != null && reqType.ToLower() == "get-quotation-list")

            Func<object> func = () => GetQuotationsByQuotationId(reqForQuotationId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetQuotationsByQuotationId(int reqForQuotationId)
        {
            if (reqForQuotationId != 0)
            {

                var result = (from quoList in _inventoryDbContext.Quotations
                              join req in _inventoryDbContext.ReqForQuotation on quoList.ReqForQuotationId equals req.ReqForQuotationId
                              where (quoList.ReqForQuotationId == reqForQuotationId && quoList.Status == "selected")
                              select new
                              {
                                  QuotationId = quoList.QuotationId,
                                  VendorId = quoList.VendorId,
                                  VendorName = quoList.VendorName,
                                  CreatedOn = quoList.CreatedOn,
                                  Status = quoList.Status,
                                  Subject = req.Subject,
                              }).ToList();
                return result;
            }
            return null;
        }

        [HttpGet]
        [Route("QuotationItems")]
        public IActionResult GetQuotationItems(int quotationId)
        {
            //else if (reqType != null && reqType.ToLower() == "get-quotation-items")
            Func<object> func = () => GetQuotationItemsList(quotationId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetQuotationItemsList(int quotationId)
        {
            if (quotationId != 0)
            {
                var result = (from qlItm in _inventoryDbContext.QuotationItems
                              where (qlItm.QuotationId == quotationId)
                              select new
                              {
                                  UpLoadedOn = qlItm.UpLoadedOn,
                                  Description = qlItm.Description,
                                  Price = qlItm.Price,
                                  ItemName = qlItm.ItemName,
                                  ItemId = qlItm.ItemId,
                                  QuotationItemId = qlItm.QuotationItemId,

                              }).ToList();
                return result;
            }
            return null;
        }

        [HttpGet]
        [Route("RequestedQuotations")]
        public IActionResult GetRequestedQuotations()
        {
            //else if (reqType == "requestedQuotations")
            Func<object> func = () => GetRequestedQuotationsList();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetRequestedQuotationsList()
        {
            var result = (from req in _inventoryDbContext.ReqForQuotation
                          where (req.RequestedCloseOn == null && req.Status == "active")
                          select new
                          {
                              ReqForQuotationId = req.ReqForQuotationId,
                              Subject = req.Subject,
                          }).ToList();
            return result;
        }

        [HttpGet]
        [Route("QuotationDetails")]
        public IActionResult GetReqForQuotationDetails(int reqForQuotationId)
        {
            //else if (reqType == "ReqForQuotationDetails")

            Func<object> func = () => GetReqForQuotationDetailsList(reqForQuotationId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetReqForQuotationDetailsList(int reqForQuotationId)
        {
            var currentDate = DateTime.Now;
            var activeFiscalYear = _inventoryDbContext.FiscalYears.Where(a => a.StartYear <= currentDate && a.EndYear >= currentDate).Select(a => a.FiscalYearFormatted).DefaultIfEmpty("").FirstOrDefault();
            var Quote = (from RFQI in _inventoryDbContext.ReqForQuotationItems
                         join Quot in _inventoryDbContext.Quotations on RFQI.ReqForQuotationId equals Quot.ReqForQuotationId
                         join quotItem in _inventoryDbContext.QuotationItems on ///we need two join conditions. (RFQI.itemid should also be joined with quotitem.ItemId)
                         new { Quot.QuotationId, RFQI.ItemId } equals new { quotItem.QuotationId, quotItem.ItemId }
                         join I in _inventoryDbContext.Items on RFQI.ItemId equals I.ItemId
                         join UOM in _inventoryDbContext.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals UOM.UOMId
                         where RFQI.ReqForQuotationId == reqForQuotationId
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
                              join vend in _inventoryDbContext.Vendors on q.VendorId equals vend.VendorId
                              join curr in _inventoryDbContext.CurrencyMaster on vend.DefaultCurrencyId equals curr.CurrencyID
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
            return result;
        }

        [HttpGet]
        [Route("QuotationByStatus")]
        public IActionResult GetQuotationByStatus(int reqForQuotationId, int storeId)
        {
            //else if (reqType != null && reqType.ToLower() == "get-quotation-by-status")
            Func<object> func = () => GetQuotationDetailByStatus(reqForQuotationId, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetQuotationDetailByStatus(int reqForQuotationId, int storeId)
        {

            if (reqForQuotationId != 0)
            {
                var result = (from quo in _inventoryDbContext.Quotations
                              join req in _inventoryDbContext.ReqForQuotation on quo.ReqForQuotationId equals req.ReqForQuotationId
                              where quo.ReqForQuotationId == reqForQuotationId && quo.Status == "selected"
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
                return result;
            }
            return null;
        }

        [HttpGet]
        [Route("CreditNoteNo")]
        public IActionResult GetCreditNoteNo()
        {
            //else if (reqType == "getcreditnoteno")
            Func<object> func = () => GetCreditNoteNumber();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetCreditNoteNumber()
        {
            List<ReturnToVendorItemsModel> crNoRecords = (from inv in _inventoryDbContext.ReturnToVendorItems
                                                          select inv).ToList();
            if (crNoRecords.Count == 0)
            {
                return 1;
            }
            else
            {
                var crNo = (from inv in crNoRecords.AsEnumerable() select inv.CreditNoteNo).ToList().Max();
                return (crNo + 1);
            }
        }

        [HttpGet]
        [Route("PurchaseOrderRequisition")]
        public IActionResult GetPurchaseOrderRequisition(DateTime fromDate, DateTime toDate, int storeId)
        {
            //else if (reqType == "PORequisition")
            Func<object> func = () => GetPurchaseOrderRequisitionList(fromDate, toDate, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetPurchaseOrderRequisitionList(DateTime fromDate, DateTime toDate, int storeId)
        {
            //var realToDate = toDate.AddDays(1);
            var purchaseRequests = _inventoryDbContext.PurchaseRequest.Where(PR => DbFunctions.TruncateTime(PR.CreatedOn) >= fromDate && DbFunctions.TruncateTime(PR.CreatedOn) <= toDate && PR.StoreId == storeId).OrderByDescending(a => a.PurchaseRequestId).ToList();
            purchaseRequests.ForEach(
                PR =>
                {
                    PR.RequestedByName = VerificationBL.GetNameByEmployeeId(PR.CreatedBy, _inventoryDbContext);
                    PR.VendorName = VerificationBL.GetInventoryVendorNameById(_inventoryDbContext, PR.VendorId ?? 0);
                    var param = VerificationBL.GetPurchaseRequestVerificationSetting(_inventoryDbContext);
                    if (param != null)
                    {
                        PR.MaxVerificationLevel = param.VerificationLevel;
                        if (PR.VerificationId != null)
                        {
                            PR.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(_inventoryDbContext, PR.VerificationId ?? 0);
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

            return purchaseRequests;
        }

        [HttpGet]
        [Route("PORequisitionByRequisitionIdStoreId")]
        public IActionResult GetPORequisitionByRequisitionIdStoreId(int requisitionId, int storeId)
        {
            // else if (reqType == "PORequisitionItemsById")
            Func<object> func = () => GetPORequisitionDetailByRequisitionIdStoreId(requisitionId, storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetPORequisitionDetailByRequisitionIdStoreId(int requisitionId, int storeId)
        {
            var PurchaseRequest1 = (from PR in _inventoryDbContext.PurchaseRequest.Where(p => p.PurchaseRequestId == requisitionId && p.StoreId == storeId)
                                    from POLJ in _inventoryDbContext.PurchaseOrders.Where(a => a.RequisitionId == PR.PurchaseRequestId).DefaultIfEmpty()
                                    from GRLJ in _inventoryDbContext.GoodsReceipts.Where(a => a.PurchaseOrderId == POLJ.PurchaseOrderId && a.PurchaseOrderId != null).DefaultIfEmpty()
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
                PoDate = a.POLJ?.PoDate,
                PONumber = a.POLJ?.PurchaseOrderId,
                SupplierInvoice = a.GRLJ?.BillNo,
                //SupplierInvoiceDate = a.GRLJ?.GoodsReceiptDate,
                SupplierInvoiceDate = a.GRLJ?.GoodsArrivalDate,
                POCategory = a.PR.PRCategory,
            }).FirstOrDefault();
            PurchaseRequest.VendorName = _inventoryDbContext.Vendors.Where(V => V.VendorId == PurchaseRequest.VendorId).Select(V => V.VendorName).FirstOrDefault();
            PurchaseRequest.MaxVerificationLevel = VerificationBL.GetPurchaseRequestVerificationSetting(_inventoryDbContext).VerificationLevel;
            PurchaseRequest.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(_inventoryDbContext, PurchaseRequest.VerificationId ?? 0);
            var ItemsRequesterVerifiersDetail = VerificationBL.GetInventoryPurchaseRequestDetails(requisitionId, _inventoryDbContext, storeId);
            var combinedResult = new { PurchaseRequest, ItemsRequesterVerifiersDetail.RequestedItemList, ItemsRequesterVerifiersDetail.RequestingUser, ItemsRequesterVerifiersDetail.Verifiers };
            return combinedResult;

        }

        [HttpGet]
        [Route("RequisitionsByRequisitionId")]
        public IActionResult GetRequisitions(int requisitionId)
        {
            //else if (reqType == "Requisition")
            Func<object> func = () => GetRequisitionsList(requisitionId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetRequisitionsList(int requisitionId)
        {

            RequisitionModel requisition = _inventoryDbContext.Requisitions.Where(R => R.RequisitionId == requisitionId).Include(a => a.RequisitionItems).FirstOrDefault();

            foreach (var reqItem in requisition.RequisitionItems)
            {
                var reqdetail = _inventoryDbContext.Requisitions.Where(req => req.RequisitionId == reqItem.RequisitionId).Select(req => new { req.RequisitionDate, req.RequisitionNo, req.IssueNo }).FirstOrDefault();


                var itemDetail = _inventoryDbContext.Items.Where(item => item.ItemId == reqItem.ItemId).Select(item => new { item.ItemName, item.Code, item.UnitOfMeasurementId }).FirstOrDefault();
                reqItem.ItemName = itemDetail.ItemName;
                reqItem.Code = itemDetail.Code;
                reqItem.RequisitionNo = reqdetail.RequisitionNo;
                reqItem.IssueNo = reqdetail.IssueNo;
                reqItem.Quantity = reqItem.Quantity;
                reqItem.UOMName = _inventoryDbContext.UnitOfMeasurementMaster.Where(uom => uom.UOMId == itemDetail.UnitOfMeasurementId).Select(uom => uom.UOMName).FirstOrDefault();

            }

            return requisition;
        }

        [HttpGet]
        [Route("InventoryStores")]
        public IActionResult GetInventoryStoreList()
        {
            //else if (reqType == "getInventoryStoreList")
            Func<object> func = () => GetInventoryStores();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetInventoryStores()
        {
            var inventoryStoreCategory = Enums.ENUM_StoreCategory.Store;
            var inventoryStoreSubCategory = Enums.ENUM_StoreSubCategory.Inventory;
            var substoreCategory = Enums.ENUM_StoreCategory.Substore;

            List<PHRMStoreModel> StoreList = _phrmdbcontext.PHRMStore
                                            .Where(store => (store.Category == inventoryStoreCategory && store.SubCategory == inventoryStoreSubCategory) || store.Category == substoreCategory)
                                            .ToList();
            return StoreList;
        }

        [HttpGet]
        [Route("SubCategories")]
        public IActionResult GetSubCategory()
        {
            //else if (reqType == "getSubCategory")
            Func<object> func = () => GetSubCategories();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetSubCategories()
        {
            var itemsubcategorylist = (from item in _inventoryDbContext.ItemSubCategoryMaster
                                       select new
                                       {
                                           item.SubCategoryName,
                                           item.SubCategoryId
                                       }
                                       ).ToList().Distinct();

            return itemsubcategorylist;
        }

        [HttpGet]
        [Route("GRItemsDetails")]
        public IActionResult GRItemsDetailsByGRId(int goodsReceiptId, int storeId)
        {
            //else if (reqType == "GRItemsDetailsWithAvailableByGRId")
            Func<object> func = () => GetGRItemsDetailsByGRId(goodsReceiptId, storeId);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetGRItemsDetailsByGRId(int goodsReceiptId, int storeId)
        {
            var grDetails = (from gri in _inventoryDbContext.GoodsReceiptItems
                             join itm in _inventoryDbContext.Items on gri.ItemId equals itm.ItemId
                             join uom in _inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId
                             where gri.GoodsReceiptId == goodsReceiptId && gri.StoreStockId != null
                             select new
                             {
                                 gri.GoodsReceiptId,
                                 gri.ItemCategory,
                                 gri.ItemId,
                                 selectedItem = itm,
                                 ItemUOM = uom.UOMName,
                                 AvailableQuantity = _inventoryDbContext.StoreStocks.Where(a => a.StoreStockId == gri.StoreStockId).Sum(gri => gri.AvailableQuantity),
                                 StoreStockId = gri.StoreStockId
                             }
                           ).Where(itm => itm.AvailableQuantity > 0).ToList();
            return grDetails;
        }

        [HttpGet]
        [Route("Items")]
        public IActionResult GetItemList()
        {
            Func<object> func = () => GetItems();
            return InvokeHttpGetFunction<object>(func);

        }

        private object GetItems()
        {
            DataTable items = DALFunctions.GetDataTableFromStoredProc("SP_INV_GetInventoryItemWithStockDetails", _inventoryDbContext);
            return items;
        }

        [HttpGet]
        [Route("AvailableQuantityByItemIdAndStoreId")]
        public IActionResult AvailableQuantityByItemIdAndStoreId(int itemId, int storeId)
        {
            Func<object> func = () => GetAvailableQuantityByItemIdAndStoreId(itemId, storeId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetAvailableQuantityByItemIdAndStoreId(int itemId, int storeId)
        {
            var availableItemDetails = (from S in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                        where (S.StoreId == storeId && S.ItemId == itemId)
                                        group new { S } by new
                                        {
                                            S.ItemId,
                                            S.StoreId
                                        } into SG
                                        select new
                                        {
                                            ItemId = SG.Key.ItemId,
                                            AvailableQuantity = SG.Sum(s => s.S != null ? s.S.AvailableQuantity : 0),
                                            StoreId = SG.Key.StoreId,
                                        }).FirstOrDefault();
            return availableItemDetails;
        }

        [HttpGet]
        [Route("ItemsByStoreId")]
        public IActionResult GetItemListByStoreId(int storeId)
        {

            Func<object> func = () => GetItemsListByStoreId(storeId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetItemsListByStoreId(int storeId)
        {

            var ItemList = (from item in _inventoryDbContext.Items
                            join subCat in _inventoryDbContext.ItemSubCategoryMaster on item.SubCategoryId equals subCat.SubCategoryId
                            join unit in _inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
                            from unit in ps.DefaultIfEmpty()
                            join store in _inventoryDbContext.StoreMasters on item.StoreId equals store.StoreId into storeG
                            from storeLJ in storeG.DefaultIfEmpty()
                            where (item.StoreId == storeId || item.StoreId == null) // storeId == null means common item for all the stores
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
                                item.RegisterPageNumber,
                                item.IsFixedAssets
                            }).ToList();
            return ItemList;
        }

        [HttpGet]
        [Route("ItemsForReturnToVendor")]
        public IActionResult GetItemListForReturnToVendor(int vendorId, int goodsReceiptNo, int fiscalYearId, int storeId)
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
                                     where stk.AvailableQuantity > 0 && vndr.VendorId == vendorId && gr.GoodsReceiptNo == goodsReceiptNo && gr.FiscalYearId == fiscalYearId && stk.StoreId == storeId
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
                                             GoodReceiptNo = a.gr.GoodsReceiptNo
                                         }).ToList(),
                                     }).ToList();
                var vendorDetail = (from vndr in inventoryDbContext.Vendors
                                    where vndr.VendorId == vendorId
                                    select new
                                    {
                                        ContactAddress = vndr.ContactAddress,
                                        ContactNo = vndr.ContactNo
                                    }).FirstOrDefault();
                responseData.Status = "OK";
                responseData.Results = new { vendorDetail = vendorDetail, itemBatchList = itembatchList };
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return Ok(responseData);
            }
        }


        [HttpGet]
        [Route("AttachedQuotationFiles")]
        public IActionResult GetAttachedQuotationFiles(int reqForQuotationId)
        {
            InventoryDbContext db = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                var result = (from QUF in db.quotationUploadedFiles
                              where QUF.RequestForQuotationId == reqForQuotationId
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
                              }).ToList();
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

        [HttpGet]
        [Route("GetPreviousQuotationDetailsByVendorId")]
        public IActionResult GetPreviousQuotationDetailsByVendorId(int reqForQuotationId, int vendorId)
        {
            InventoryDbContext db = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var result = (from Q in db.Quotations
                              join QI in db.QuotationItems on Q.QuotationId equals QI.QuotationId
                              where Q.ReqForQuotationId == reqForQuotationId && Q.VendorId == vendorId
                              select new
                              {
                                  VendorId = QI.VendorId,
                                  Description = QI.Description,
                                  Price = QI.Price,
                                  ItemName = QI.ItemName,
                                  ItemId = QI.ItemId,
                                  QuotationId = QI.QuotationId,
                                  QuotationItemId = QI.QuotationItemId,
                              }).ToList();
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
        [HttpGet]
        [Route("SubstoreRequistionList")]
        public IActionResult GetSubstoreRequistionList(DateTime fromDate, DateTime toDate, int storeId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            // var RealToDate = toDate.AddDays(1);

            try
            {
                //string[] requisitionStatus = Status.Split(',');
                var RequisitionList = (from requ in inventoryDbContext.Requisitions
                                           //join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                       join store in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals store.StoreId
                                       where (DbFunctions.TruncateTime(requ.RequisitionDate) >= fromDate && DbFunctions.TruncateTime(requ.RequisitionDate) <= toDate) &&
                                       requ.RequestToStoreId == storeId
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
                                           RequestFromStoreId = storeId,
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
        [HttpGet]
        [Route("SubstoreRequistions")]
        public IActionResult GetAllSubstoreRequistionList(DateTime fromDate, DateTime toDate, int storeId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            //var RealToDate = toDate.AddDays(1);
            //string[] requisitionStatus = Status.Split(',');

            try
            {
                var RequisitionList = (from requ in inventoryDbContext.Requisitions.Where(R => R.RequestToStoreId == storeId)
                                           //join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                       join store in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals store.StoreId
                                       where (DbFunctions.TruncateTime(requ.RequisitionDate) >= fromDate && DbFunctions.TruncateTime(requ.RequisitionDate) <= toDate)
                                      & requ.RequisitionStatus != "withdrawn" && requ.RequisitionStatus != "pending"
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
                                           VerifierIds = requ.VerifierIds
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
                                           VerifierIds = R.VerifierIds
                                       }).ToList();
                foreach (var Requisition in RequisitionList)
                {
                    Requisition.MaxVerificationLevel = Requisition.VerifierIds != null ? DanpheJSONConvert.DeserializeObject<List<dynamic>>(Requisition.VerifierIds).Count() : 0;
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
        [Route("POVerifiers")]
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
        [Route("TrackRequisition")]
        public IActionResult TrackRequisitionByRequisitionId(int requisitionId)
        {
            InventoryDbContext dbContext = new InventoryDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var inventoryRequisitionVM = new TrackRequisitionViewModel();
                RequisitionModel requisition = dbContext.Requisitions.Find(requisitionId);

                inventoryRequisitionVM.RequisitionId = requisitionId;
                inventoryRequisitionVM.CreatedBy = dbContext.Employees.Find(requisition.CreatedBy).FullName;
                inventoryRequisitionVM.RequisitionDate = ((DateTime)requisition.RequisitionDate);
                inventoryRequisitionVM.Status = requisition.RequisitionStatus;
                inventoryRequisitionVM.MaxVerificationLevel = requisition.VerifierIds != null ? DanpheJSONConvert.DeserializeObject<List<Verifier_DTO>>(requisition.VerifierIds).Count() : 0;
                inventoryRequisitionVM.StoreId = requisition.RequestFromStoreId;
                inventoryRequisitionVM.StoreName = dbContext.StoreMasters.Find(requisition.RequestFromStoreId).Name;

                // inventoryRequisitionVM.Verifiers = SubstoreBL.GetVerifiersByStoreId(requisition.RequestFromStoreId, rbacDbContext);


                if (requisition.VerificationId != null)
                {
                    inventoryRequisitionVM.Verifiers = GetInventoryRequisitionVerifiers(requisition.VerificationId ?? 0, _inventoryDbContext);

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

                inventoryRequisitionVM.Dispatchers = VerificationBL.GetDispatchersList(requisitionId, dbContext);

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


        private List<VerifiersPermissionViewModel> GetInventoryRequisitionVerifiers(int VerificationId, InventoryDbContext inventoryDb)
        {
            var Verifiers = new List<VerifiersPermissionViewModel>();
            var verifier = new VerifiersPermissionViewModel();
            if (VerificationId > 0)
            {
                var verificationModel = inventoryDb.Verifications.Find(VerificationId);

                var employeeDetail = inventoryDb.Employees.Include(e => e.EmployeeRole).FirstOrDefault(a => a.EmployeeId == verificationModel.VerifiedBy);
                if (employeeDetail != null && verificationModel != null)
                {
                    verifier.VerifiedBy = employeeDetail;
                    verifier.VerifiedOn = verificationModel.VerifiedOn;
                    verifier.VerificationRemarks = verificationModel.VerificationRemarks;
                    verifier.CurrentVerificationLevel = verificationModel.CurrentVerificationLevel;
                    if (verificationModel.ParentVerificationId != null)
                    {
                        Verifiers = GetInventoryRequisitionVerifiers((int)verificationModel.ParentVerificationId, inventoryDb);
                    }
                    Verifiers.Add(verifier);
                }
            }
            return Verifiers;
        }
        [HttpGet]
        [Route("PurchaseRequestItems")]
        public IActionResult GetPurchaseRequestItemsById(int purchaseRequestId)
        {
            InventoryDbContext _context = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                var purchaseRequestItems = (from PRI in _context.PurchaseRequestItems
                                            from STK in _context.StoreStocks.Where(s => s.ItemId == PRI.ItemId).DefaultIfEmpty()
                                            where PRI.PurchaseRequestId == purchaseRequestId && PRI.IsActive == true
                                            group new { PRI, STK } by new { PRI.PurchaseRequestItemId, PRI.ItemId, PRI.VendorId, PRI.RequestedQuantity, PRI.PurchaseRequestId, PRI.Remarks, PRI.ItemCategory } into PRIGrouped
                                            select new
                                            {
                                                PRIGrouped.Key.PurchaseRequestItemId,
                                                PRIGrouped.Key.ItemId,
                                                PRIGrouped.Key.ItemCategory,
                                                PRIGrouped.Key.VendorId,
                                                PRIGrouped.Key.RequestedQuantity,
                                                PRIGrouped.Key.PurchaseRequestId,
                                                PRIGrouped.Key.Remarks,
                                                StockAvailableQuantity = PRIGrouped.Sum(a => (a.STK == null) ? 0 : a.STK.AvailableQuantity)
                                            }).ToList();
                var PRDetail = _context.PurchaseRequest.Where(PR => PR.PurchaseRequestId == purchaseRequestId).Select(PR => new { PR.RequestDate, PR.Remarks }).FirstOrDefault();

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
        [Route("ItemPriceHistory")]
        public IActionResult GetAllItemPriceHistory()
        {
            Func<object> func = () => GetItemsPriceHistory();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetItemsPriceHistory()
        {
            var itemPriceHistory = (from GRI in _inventoryDbContext.GoodsReceiptItems
                                    join GR in _inventoryDbContext.GoodsReceipts on GRI.GoodsReceiptId equals GR.GoodsReceiptID
                                    join V in _inventoryDbContext.Vendors on GR.VendorId equals V.VendorId
                                    select new
                                    {
                                        GRI.ItemId,
                                        GRI.ItemRate,
                                        V.VendorName,
                                        GR.GoodsReceiptDate
                                    }).OrderByDescending(GRI => GRI.GoodsReceiptDate).ToList();
            if (itemPriceHistory == null || itemPriceHistory.Count() == 0)
            {
                return null;
            }
            return itemPriceHistory;
        }


        [HttpGet]
        [Route("InventoryFiscalYears")]
        public IActionResult GetAllInventoryFiscalYears()
        {

            Func<object> func = () => GetInventoryFiscalYearsDetail();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetInventoryFiscalYearsDetail()
        {
            var fiscalYearList = _inventoryDbContext.InventoryFiscalYears.ToList();
            if (fiscalYearList == null || fiscalYearList.Count() == 0)
            {
                return null;

            }
            return fiscalYearList;
        }

        [HttpGet]
        [Route("GRVendorsBillingHistory")]
        public IActionResult GetAllGRVendorBillingHistory()
        {
            Func<object> func = () => GetAllGRVendorBillingHistoryDetail();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetAllGRVendorBillingHistoryDetail()
        {
            DateTime dateBefor1Yr = DateTime.Now.AddYears(-1);

            var GRVendorBH = (from gr in _inventoryDbContext.GoodsReceipts
                              join v in _inventoryDbContext.Vendors on gr.VendorId equals v.VendorId
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
                              }).OrderByDescending(a => a.GoodsReceiptDate).ToList();


            if (GRVendorBH == null || GRVendorBH.Count() == 0)
            {
                return null;
            }
            return GRVendorBH;

        }


        [HttpGet]
        [Route("FixedAssetDonations")]
        public IActionResult GetFixedAssetDonation()
        {
            Func<object> func = () => GetFixedAssetDonationDetail();
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetFixedAssetDonationDetail()
        {
            var fixedAssetDonation = (from assetdonation in _inventoryDbContext.FixedAssetDonation
                                      select new
                                      {
                                          assetdonation.DonationId,
                                          assetdonation.Donation,

                                      }).ToList();

            return fixedAssetDonation;
        }

        [HttpGet]
        [Route("AvailableQuantity")]
        public IActionResult GetAvailableQuantity(int itemId, int storeId)
        {
            var dbContext = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                var AvailableQty = dbContext.StoreStocks.Where(stk => stk.ItemId == itemId && stk.StoreId == storeId).Select(a => a.AvailableQuantity).DefaultIfEmpty(0).Sum();
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
        [Route("ActiveInventories")]
        public IActionResult GetActiveInventoryList()
        {
            PharmacyDbContext dbContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                var invCategory = Enums.ENUM_StoreCategory.Store;
                var inventoryList = dbContext.PHRMStore.Where(s => s.Category == invCategory && s.SubCategory == "inventory" && s.IsActive == true).ToList();
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

        [HttpGet]
        [Route("ProcurementGRView")]
        public IActionResult GetProcurementGRView(int goodsReceiptId)
        {
            InventoryDbContext inventoryDb = new InventoryDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                GetProcurementGRViewVm grViewInformation = InventoryBL.GetProcurementGRView(goodsReceiptId, inventoryDb, masterDbContext, _verificationService);
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
        [Route("RequestForQuotation")]
        public async Task<IActionResult> GetRFQDetailsById(int reqForQuotationId)
        {
            InventoryDbContext inventoryDb = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetRFQDetailsByIdVM rfqDetails = await inventoryDb.GetRFQDetails(reqForQuotationId);
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

        [HttpGet]
        [Route("QuotationDetailsToAddPO")]
        public async Task<IActionResult> GetQuotationDetailsToAddPO(int reqForQuotationId)
        {
            InventoryDbContext inventoryDb = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetQuotationDetailsToAddPOVm rfqDetails = await inventoryDb.GetQuotationDetailsToAddPO(reqForQuotationId);
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
        [HttpPost]
        [Route("PORequisition")]
        public IActionResult PORequisition()
        {
            //if (reqType != null && reqType == "PostPORequisition")
            Func<object> func = () => PostPORequisition();
            return InvokeHttpPostFunction<object>(func);

        }
        private object PostPORequisition()
        {
            string Str = this.ReadPostData();
            PurchaseRequestModel reqFromClient = DanpheJSONConvert.DeserializeObject<PurchaseRequestModel>(Str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            if (reqFromClient != null && reqFromClient.PurchaseRequestItems != null && reqFromClient.PurchaseRequestItems.Count > 0)
            {
                reqFromClient.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext, reqFromClient.RequestDate).FiscalYearId;
                reqFromClient.PRNumber = _receiptNumberService.GeneratePurchaseRequestNumber(reqFromClient.FiscalYearId, reqFromClient.PRGroupId);

                reqFromClient.CreatedBy = currentUser.EmployeeId;
                reqFromClient.CreatedOn = DateTime.Now;
                _inventoryDbContext.PurchaseRequest.Add(reqFromClient);
                _inventoryDbContext.SaveChanges();
                var reqId = reqFromClient.PurchaseRequestId;
                reqFromClient.PurchaseRequestItems.ForEach(item =>
                {
                    item.CreatedOn = DateTime.Now;
                    item.PurchaseRequestId = reqId;
                    item.PendingQuantity = item.RequestedQuantity;
                    _inventoryDbContext.SaveChanges();
                });
                var PRSettings = VerificationBL.GetPurchaseRequestVerificationSetting(_inventoryDbContext);
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
                return reqFromClient.PurchaseRequestId;
            }
            return null;
        }

        [HttpPost]
        [Route("CancelPurchaseOrder")]
        public IActionResult PurchaseOrderCancel(int purchaseOrderId, string cancelRemarks)
        {
            //else if (reqType == "cancel-purchase-order")
            Func<object> func = () => CancelPurchaseOrder(purchaseOrderId, cancelRemarks);
            return InvokeHttpPostFunction<object>(func);

        }
        private object CancelPurchaseOrder(int purchaseOrderId, string cancelRemarks)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            bool flag = true;
            flag = InventoryBL.CancelPurchaseOrderById(_inventoryDbContext, purchaseOrderId, cancelRemarks, currentUser);
            if (flag)
            {

                return 1;
            }
            else
            {
                return null;
            }
        }


        [HttpPost]
        [Route("ReqForQuotation")]
        public IActionResult PostReqForQuotation()
        {
            //if (reqType != null && reqType == "ReqForQuotation")
            Func<object> func = () => PostRequestForQuotation();
            return InvokeHttpPostFunction<object>(func);

        }
        private object PostRequestForQuotation()
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
                reqForQuotation.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext).FiscalYearId;
                reqForQuotation.RequestForQuotationNo = _receiptNumberService.GenerateRequestForQuotationNumber(reqForQuotation.FiscalYearId, reqForQuotation.RFQGroupId);
                _inventoryDbContext.ReqForQuotation.Add(reqForQuotation);
                _inventoryDbContext.SaveChanges();
                return null;
            }
            return null;
        }

        [HttpPost]
        [Route("UploadQuotationFiles")]
        public IActionResult UploadQuotationFiles()
        {
            // else if (reqType == "uploadQuotationFiles")
            Func<object> func = () => PostQuotationFiles();
            return InvokeHttpPostFunction<object>(func);

        }
        private object PostQuotationFiles()
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

                        var avilableMAXFileNo = (from dbFile in _inventoryDbContext.quotationUploadedFiles
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
                        _inventoryDbContext.quotationUploadedFiles.Add(quotationAddModel);
                        _inventoryDbContext.SaveChanges();

                    }

                }
            }
            return null;
        }

        [HttpPost]
        [Route("PostQuotations")]
        public IActionResult PostQuotations()
        {
            //else if (reqType == "quotationDetails")
            Func<object> func = () => PostQuotationsDetails();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostQuotationsDetails()
        {
            using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
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
                            quotation.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext, quotation.CreatedOn).FiscalYearId;
                            //quotation.QuotationNo = _receiptNumberService.GenerateQuotationNumber(quotation.FiscalYearId, quotation.RFQGroupId);
                            quotation.quotationItems.ForEach(item =>
                            {
                                item.VendorId = quotation.VendorId;
                                item.QuotationId = quotation.QuotationId;
                                item.UpLoadedOn = currentDate;
                                item.UpLoadedBy = currentUser.EmployeeId;
                            });
                            _inventoryDbContext.Quotations.Add(quotation);
                            _inventoryDbContext.SaveChanges();
                        }
                        else
                        {
                            foreach (var qItems in quotation.quotationItems)
                            {
                                if (qItems.QuotationItemId > 0)
                                {
                                    var quotationItems = _inventoryDbContext.QuotationItems.Find(qItems.QuotationItemId);
                                    quotationItems.ModifiedBy = currentUser.EmployeeId;
                                    quotationItems.ModifiedOn = currentDate;
                                    quotationItems.Price = qItems.Price;
                                    _inventoryDbContext.SaveChanges();
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
            return null;
        }

        [HttpPost]
        [Route("Dispatch")]
        public IActionResult Dispatch()
        {
            //else if (reqType != null && reqType.ToLower() == "dispatchitems")
            Func<object> func = () => PostDispatch();
            return InvokeHttpPostFunction<object>(func);
        }
        private object PostDispatch()
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string Str = this.ReadPostData();

            DispatchModel dispatch = DanpheJSONConvert.DeserializeObject<DispatchModel>(Str);
            if (dispatch.DispatchItems != null && dispatch.DispatchItems.Count > 0)
            {
                int DispatchId = 0;
                using (var dbContextTransaction = _inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        DispatchId = InventoryBL.DispatchItemsTransaction(dispatch, _receiptNumberService, _inventoryDbContext, currentUser);

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

                    return DispatchId;
                }
                return null;
            }
            else
            {
                return null;
            }

        }

        [HttpPost]
        [Route("WriteOffItem")]
        public IActionResult PostWriteoffItem()
        {
            //else if (reqType != null && reqType.ToLower() == "writeoffitems")
            Func<object> func = () => PostWriteOffItem();
            return InvokeHttpPostFunction<object>(func);

        }
        private object PostWriteOffItem()
        {
            string Str = this.ReadPostData();
            List<WriteOffItemsModel> writeItemsFromClient = DanpheJSONConvert.DeserializeObject<List<WriteOffItemsModel>>(Str);
            if (writeItemsFromClient != null)
            {
                Boolean flag = false;
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                flag = InventoryBL.WriteOffItemsTransaction(writeItemsFromClient, _inventoryDbContext, currentUser);
                if (flag)
                {

                    return 1;
                }
                else
                {
                    return 0;
                }
            }

            return 0;

        }

        [HttpPost]
        [Route("ReturnToVendor")]
        public IActionResult PostReturnToVendor()
        {
            //else if (reqType != null && reqType == "ReturnToVendor")
            Func<object> func = () => PostReturnToVendorDetail();
            return InvokeHttpPostFunction<object>(func);

        }
        private object PostReturnToVendorDetail()
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
                flag = InventoryBL.ReturnToVendorTransaction(retrnToVendor, _inventoryDbContext, currentUser);
                if (flag)
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
            return 0;

        }

        [HttpPost]
        [Route("Requisition")]
        public IActionResult PostRequisition([FromBody] InventoryRequisition_DTO requisitionDTO)
        {
            //else if (reqType != null && reqType == "Requisition")
            Func<object> func = () => PostRequisitionDetail(requisitionDTO);
            return InvokeHttpPostFunction(func);

        }
        private object PostRequisitionDetail(InventoryRequisition_DTO requisitionDTO)
        {
            string Str = this.ReadPostData();
            RequisitionModel RequisitionFromClient = DanpheJSONConvert.DeserializeObject<RequisitionModel>(Str);

            using (var dbContextTransaction = _inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    var currentDate = DateTime.Now;
                    RequisitionModel requisition = DanpheJSONConvert.DeserializeObject<RequisitionModel>(DanpheJSONConvert.SerializeObject(requisitionDTO));
                    requisition.CreatedOn = currentDate;
                    requisition.CreatedBy = currentUser.EmployeeId;
                    requisition.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext, requisition.RequisitionDate).FiscalYearId;
                    requisition.RequisitionNo = _receiptNumberService.GenerateRequisitionNumber(requisition.FiscalYearId, requisition.ReqDisGroupId);
                    requisition.VerifierIds = SerializeVerifiers(requisitionDTO.VerifierList);
                    if (requisition.VerifierIds != "[]" && requisition.IsVerificationEnabled)
                    {
                        requisition.RequisitionStatus = ENUM_InventoryRequisitionStatus.Pending;
                    }
                    else
                    {
                        requisition.RequisitionStatus = ENUM_InventoryRequisitionStatus.Active;
                        requisition.VerifierIds = null;
                    }

                    if (requisition.RequisitionDate == null)
                    {
                        requisition.RequisitionDate = currentDate;
                    }
                    else
                    {
                        // generate the time part from current date time and subtract it from requisition date, in order to save both date and time part in requisition date field
                        var currDateTime = DateTime.Now;
                        var diff = currDateTime.Subtract(requisition.RequisitionDate.Value).Days;
                        requisition.RequisitionDate = currDateTime.AddDays(-diff);
                    }
                    requisition.RequisitionItems.ForEach(item =>
                    {
                        item.RequisitionNo = requisition.RequisitionNo;
                        item.IssueNo = requisition.IssueNo;
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = currentDate;
                        item.PendingQuantity = item.Quantity;
                        item.AuthorizedOn = currentDate;
                    });
                    _inventoryDbContext.Requisitions.Add(requisition);
                    _inventoryDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return requisition.RequisitionId;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private static string SerializeVerifiers(List<Verifier_DTO> verifiers)
        {
            if (verifiers != null && verifiers.Count() > 0)
            {
                var VerifierList = new List<object>();
                verifiers.ForEach(verifier =>
                {
                    VerifierList.Add(new { Id = verifier.Id, Type = verifier.Type });
                });
                return DanpheJSONConvert.SerializeObject(VerifierList).Replace(" ", String.Empty);
            }
            return null;
        }

        [HttpPost]
        [Route("WithdrawRequisition")]
        public IActionResult PostWithdrawRequisition(int requisitionId, string withdrawRemarks)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            InventoryDbContext db = new InventoryDbContext(connString);

            string RequisitionStatus = "withdrawn";
            /* string WithdrawRemarks = this.ReadPostData();*/
            bool flag = true;
            flag = InventoryBL.CancelSubstoreRequisition(db, requisitionId, withdrawRemarks, currentUser, null, RequisitionStatus); //since it is cancelled in substore level, verificationId is not created.
            if (flag)
            {
                responseData.Status = "OK";
                responseData.Results = flag;
            }
            else
            {
                responseData.ErrorMessage = "Requisition Cancellation Failed !!!";
                responseData.Status = "Failed";
            }

            return Ok(responseData);
        }

        [HttpPost]
        [Route("CancelGoodsReceipt")]
        public IActionResult CancelGoodsReceipt(int goodsReceiptId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //sanjit: 25Mar'2020 This function was migrated from reqtype='cancel-goods-receipt'.
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                string CancelRemarks = this.ReadPostData().ToString();

                InventoryBL.CancelGoodsReceipt(inventoryDbContext, goodsReceiptId, CancelRemarks, currentUser);

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
        [Route("WithdrawPurchaseRequest")]
        public IActionResult WithdrawPurchaseRequestById(int purchaseRequestId)
        {
            var context = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string RequestStatus = "withdrawn";
                string WithdrawRemarks = this.ReadPostData();
                var flag = InventoryBL.CancelPurchaseRequestById(context, purchaseRequestId, WithdrawRemarks, currentUser, null, RequestStatus);
                responseData.Status = "OK";
                responseData.Results = purchaseRequestId;
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong";
            }
            return Ok();
        }
        [HttpGet]
        [Route("StockListForDirectDispatch")]
        public IActionResult StockListForDirectDispatch(int storeId)
        {
            Func<object> func = () => GetStockListForDirectDispatch(storeId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetStockListForDirectDispatch(int storeId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                 new SqlParameter("@StoreId", storeId)
            };
            DataTable stocks = DALFunctions.GetDataTableFromStoredProc("SP_INV_GetStockListForDispatch", paramList, _inventoryDbContext);
            return stocks;
        }

        [HttpPost]
        [Route("DirectDispatch")]
        public IActionResult PostDirectDispatch([FromBody] DispatchModel dispatch, string fromRoute)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            InventoryDbContext inventoryDb = new InventoryDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                InventoryBL.DirectDispatch(dispatch, _receiptNumberService, inventoryDb, currentUser, fromRoute);
                responseData.Status = "OK";
                responseData.Results = new { DispatchId = dispatch.DispatchId, RequisitionId = dispatch.RequisitionId };
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.ToString();

            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("PurchaseOrder")]
        public IActionResult PostPurchaseOrder([FromBody] PurchaseOrderModel poFromClient)
        {
            Func<object> func = () => SavePurchaseOrder(poFromClient);
            return InvokeHttpPostFunction<object>(func);
        }

        private object SavePurchaseOrder(PurchaseOrderModel poFromClient)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            var currentDate = DateTime.Now;
            using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
                    {
                        SavePurchaseOrderDetails(poFromClient, currentUser, currentDate);

                        //Update PO Draft status if the PO is created from PO Draft.
                        /*                        UpdatePurchaseOrderDraftStatus(poFromClient, currentUser, currentDate);
                        */
                        dbTransaction.Commit();
                        return poFromClient.PurchaseOrderId;
                    }
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw ex;
                }

            }
            throw new Exception("Failed to save purchase order");
        }

        private void SavePurchaseOrderDetails(PurchaseOrderModel poFromClient, RbacUser currentUser, DateTime currentDate)
        {
            poFromClient.PurchaseOrderItems.ForEach(item =>
            {
                item.PendingQuantity = item.Quantity - item.ReceivedQuantity;
                item.CreatedOn = currentDate;
                item.CreatedBy = currentUser.EmployeeId;
                item.AuthorizedOn = currentDate;
                TimeSpan deliveryTimeSpan = (TimeSpan)(poFromClient.DeliveryDate - poFromClient.PoDate);
                item.DeliveryDays = deliveryTimeSpan.Days;

            });
            poFromClient.CreatedOn = currentDate;
            poFromClient.PoDate = poFromClient.PoDate == null ? currentDate : poFromClient.PoDate;
            //check if verification enabled
            poFromClient.VerifierIds = (poFromClient.IsVerificationEnabled == true) ? InventoryBL.SerializeProcurementVerifiers(poFromClient.VerifierList) : "";
            poFromClient.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext).FiscalYearId;
            poFromClient.PONumber = _receiptNumberService.GeneratePurchaseOrderNumber(poFromClient.FiscalYearId, poFromClient.POGroupId);
            poFromClient.CreatedBy = currentUser.EmployeeId;
            _inventoryDbContext.PurchaseOrders.Add(poFromClient);
            _inventoryDbContext.SaveChanges();
        }

        /* public void UpdatePurchaseOrderDraftStatus(PurchaseOrderModel poFromClient, RbacUser currentUser, DateTime currentDate)
         {
             var PurchaseOrderDraftItemIds = poFromClient.PurchaseOrderItems.Select(a => a.DraftPurchaseOrderItemId).ToList();
             if (PurchaseOrderDraftItemIds != null)
             {
                 var PurchaseOrderDraftItems = _inventoryDbContext.PurchaseOrderDraftItems
                                                                  .Where(poditm => PurchaseOrderDraftItemIds.Contains(poditm.DraftPurchaseOrderItemId) && poditm.IsActive && poditm.PendingQuantity > 0)
                                                                  .ToList();
                 if (PurchaseOrderDraftItems.Count() > 0)
                 {
                     var PurchaseOrderDraftId = PurchaseOrderDraftItems.FirstOrDefault().DraftPurchaseOrderId;
                     PurchaseOrderDraftItems.ForEach(poditm =>
                     {
                         poFromClient.PurchaseOrderItems.ForEach(poitm =>
                         {
                             if (poditm.DraftPurchaseOrderItemId == poitm.DraftPurchaseOrderItemId)
                             {
                                 poditm.PendingQuantity = poditm.PendingQuantity - (decimal)poitm.Quantity;
                             }
                         });
                     });

                     var purchaseOrderDraft = _inventoryDbContext.PurchaseOrderDrafts.Include(pod => pod.PurchaseOrderDraftItems).Where(pod => pod.DraftPurchaseOrderId == PurchaseOrderDraftId).FirstOrDefault();
                     if (purchaseOrderDraft != null)
                     {
                         if (purchaseOrderDraft.PurchaseOrderDraftItems.Any(poditm => poditm.PendingQuantity > 0))
                         {
                             purchaseOrderDraft.Status = "InProgress";
                         }
                         else
                         {
                             purchaseOrderDraft.Status = "Completed";
                         }
                     }
                     _inventoryDbContext.SaveChanges();
                 }
             }

         }*/

        [HttpPost]
        [Route("ReconciledStockFromExcelFile")]
        public IActionResult UpdateReconciledStockFromExcelFile()
        {
            string Str = this.ReadPostData();
            List<InventoryStockModel> stock = DanpheJSONConvert.DeserializeObject<List<InventoryStockModel>>(Str);
            var responseData = new DanpheHTTPResponse<object>();
            var inventoryDb = new InventoryDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                InventoryBL.UpdateReconciledStockFromExcel(stock, currentUser, inventoryDb);
                responseData.Status = "OK";
                responseData.Results = null;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.ToString();

            }
            return Ok(responseData);
        }

        [HttpGet]
        [Route("ExportStocksForReconciliationToExcel")]
        public IActionResult ExportStocksForReconciliationToExcel(int storeId)
        {
            try
            {
                var inventoryDbContext = new InventoryDbContext(connString);

                var tempStocks = (from stk in inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                  join grItems in inventoryDbContext.GoodsReceiptItems on stk.StockId equals grItems.StockId into ps
                                  from grItems in ps.DefaultIfEmpty()
                                  join itm in inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                                  join SubCat in inventoryDbContext.ItemSubCategoryMaster on itm.SubCategoryId equals SubCat.SubCategoryId
                                  join uom in inventoryDbContext.UnitOfMeasurementMaster on itm.UnitOfMeasurementId equals uom.UOMId into uomJoined
                                  from uomLeftJoined in uomJoined.DefaultIfEmpty()
                                  where stk.AvailableQuantity >= 0 && stk.StoreId == storeId
                                  group new { stk, itm, uomLeftJoined, grItems, SubCat } by new { itm.ItemId, itm.ItemName, itm.MinStockQuantity, stk.StockMaster.CostPrice, stk.StockMaster.BatchNo, stk.StockMaster.ExpiryDate, stk.StockId, stk.StoreId } into stocks
                                  select new InventoryStockModel
                                  {
                                      StockId = stocks.Key.StockId,
                                      ItemId = stocks.Key.ItemId,
                                      ItemName = stocks.Key.ItemName.Trim(),
                                      BatchNo = stocks.Key.BatchNo,
                                      AvailQuantity = Math.Round(stocks.Sum(a => a.stk.AvailableQuantity), 4),
                                      NewQuantity = stocks.Sum(a => a.stk.AvailableQuantity),
                                      CostPrice = stocks.Key.CostPrice,
                                      ItemCode = stocks.Select(a => a.itm.Code).FirstOrDefault(),
                                      ItemType = stocks.Select(a => a.itm.ItemType).FirstOrDefault(),
                                      SubCategoryName = stocks.Select(a => a.SubCat.SubCategoryName).FirstOrDefault(),
                                      UnitOfMeasurementId = stocks.Select(a => a.uomLeftJoined.UOMId).FirstOrDefault(),
                                      UOMName = stocks.Select(a => a.uomLeftJoined.UOMName).FirstOrDefault(),//sud: 19Feb'20-- added UOMName since it's needed in stock list page..
                                      StoreId = stocks.Key.StoreId
                                  }).OrderBy(x => x.ItemName).ThenBy(x => x.AvailQuantity);

                string tempFIleName = "StockReconciliation_" + DateTime.Now.ToString("yyyy-MM-dd h:mm tt");
                string tempFIleName1 = tempFIleName.Replace(" ", "-");
                string fileName = tempFIleName1.Replace(":", "-");


                DataTable dataTable = new DataTable(typeof(InventoryStockModel).Name);
                //Get all the properties
                PropertyInfo[] Props = typeof(InventoryStockModel).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                foreach (PropertyInfo prop in Props)
                {
                    //Setting column names as Property names
                    dataTable.Columns.Add(prop.Name);
                }
                foreach (InventoryStockModel stock in tempStocks)
                {
                    var values = new object[Props.Length];
                    for (int i = 0; i < Props.Length; i++)
                    {
                        //inserting property values to datatable rows
                        values[i] = Props[i].GetValue(stock, null);
                    }
                    dataTable.Rows.Add(values);
                }
                DataTable dt = dataTable;


                byte[] fileByteArray;

                using (ExcelEngine engine = new ExcelEngine())
                {
                    IApplication application = engine.Excel;
                    application.DefaultVersion = ExcelVersion.Xlsx;

                    IWorkbook workbook = application.Workbooks.Create(1);
                    IWorksheet sheet = workbook.Worksheets[0];

                    sheet.ImportDataTable(dt, true, 1, 1, true);

                    IListObject listObj = sheet.ListObjects.Create("InventoryStockList", sheet.UsedRange);
                    listObj.BuiltInTableStyle = TableBuiltInStyles.TableStyleLight14;
                    sheet.UsedRange.AutofitColumns();

                    int colcount = sheet.Columns.Count();
                    int rowcount = sheet.Rows.Count();

                    sheet.Protect("", ExcelSheetProtection.All);
                    int av = 64 + colcount;
                    for (int i = colcount - 1; i < colcount; i++)
                    {
                        for (int j = 1; j < rowcount - 1; j++)
                        {
                            string value = Convert.ToChar(av) + j.ToString();
                            sheet[value].CellStyle.Locked = false;
                        }
                        av++;
                    }

                    using (var memoryStream = new MemoryStream())
                    {
                        workbook.SaveAs(memoryStream);
                        fileByteArray = memoryStream.ToArray();
                    }

                }
                return File(fileByteArray, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName + ".xlsx");

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpPut]
        [Route("PurchaseOrderAndPOItemStatus")]
        public IActionResult UpdatePO()
        {
            //if (reqType != null && reqType.ToLower() == "updatepoandpoitemstatus")
            Func<object> func = () => UpdatePOAndItemStatus();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdatePOAndItemStatus()
        {
            string str = this.ReadPostData();
            PurchaseOrderModel PurchaseOrderFromClient = DanpheJSONConvert.
                            DeserializeObject<PurchaseOrderModel>(str);
            // map all the entities we want to update.
            // OwnedCollection for list, OwnedEntity for one-one navigational property
            // test it thoroughly, also with sql-profiler on how it generates the code

            //inventorygDbContext.UpdateGraph(PurchaseOrderFromClient,
            //    map => map.
            //    OwnedCollection(a => a.PurchaseOrderItems));

            _inventoryDbContext.PurchaseOrders.Attach(PurchaseOrderFromClient);
            _inventoryDbContext.Entry(PurchaseOrderFromClient).Property(x => x.POStatus).IsModified = true;

            foreach (var POItem in PurchaseOrderFromClient.PurchaseOrderItems)
            {
                _inventoryDbContext.PurchaseOrderItems.Attach(POItem);
                _inventoryDbContext.Entry(POItem).Property(x => x.ReceivedQuantity).IsModified = true;
                _inventoryDbContext.Entry(POItem).Property(x => x.PendingQuantity).IsModified = true;
                _inventoryDbContext.Entry(POItem).Property(x => x.POItemStatus).IsModified = true;
            }

            _inventoryDbContext.SaveChanges();
            return null;

        }

        [HttpPut]
        [Route("RequisitionStatus")]
        public IActionResult UpdateRequisitionStatus()
        {
            //else if (reqType != null && reqType.ToLower() == "updaterequisitionstatus")
            Func<object> func = () => UpdateRequisitionStatusData();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdateRequisitionStatusData()
        {
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            RequisitionModel RequistionFromClient = DanpheJSONConvert.
                             DeserializeObject<RequisitionModel>(str);
            // map all the entities we want to update.
            // OwnedCollection for list, OwnedEntity for one-one navigational property
            // test it thoroughly, also with sql-profiler on how it generates the code


            RequistionFromClient.ModifiedOn = DateTime.Now;
            RequistionFromClient.ModifiedBy = currentUser.EmployeeId;
            _inventoryDbContext.Requisitions.Attach(RequistionFromClient);
            _inventoryDbContext.Entry(RequistionFromClient).Property(x => x.RequisitionStatus).IsModified = true;
            _inventoryDbContext.Entry(RequistionFromClient).Property(x => x.ModifiedBy).IsModified = true;
            _inventoryDbContext.Entry(RequistionFromClient).Property(x => x.ModifiedOn).IsModified = true;

            foreach (var ReqItem in RequistionFromClient.RequisitionItems)
            {
                ReqItem.ModifiedBy = RequistionFromClient.ModifiedBy;
                ReqItem.ModifiedOn = RequistionFromClient.ModifiedOn;
                _inventoryDbContext.RequisitionItems.Attach(ReqItem);
                _inventoryDbContext.Entry(ReqItem).Property(x => x.ReceivedQuantity).IsModified = true;
                _inventoryDbContext.Entry(ReqItem).Property(x => x.PendingQuantity).IsModified = true;
                _inventoryDbContext.Entry(ReqItem).Property(x => x.RequisitionItemStatus).IsModified = true;
                _inventoryDbContext.Entry(ReqItem).Property(x => x.ModifiedBy).IsModified = true;
                _inventoryDbContext.Entry(ReqItem).Property(x => x.ModifiedOn).IsModified = true;
            }
            _inventoryDbContext.SaveChanges();
            return null;
        }

        [HttpPut]
        [Route("StockManage")]
        public IActionResult UpdateStockManage()
        {
            //else if (reqType == "stockManage")
            Func<object> func = () => UpdateStockManageDetail();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdateStockManageDetail()
        {
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            List<InventoryStockManage> inventoryStockManage = DanpheJSONConvert.DeserializeObject<List<InventoryStockManage>>(str);

            InventoryBL.ManageInventoryStock(inventoryStockManage, currentUser, _inventoryDbContext);
            return null;
        }

        [HttpPut]
        [Route("VendorForPO")]
        public IActionResult UpdateVendorForPO()
        {
            // else if (reqType == "SelectedVendorforPO")
            Func<object> func = () => UpdateVendorForPurchaseOrder();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdateVendorForPurchaseOrder()
        {
            string str = this.ReadPostData();
            Quotation quotData = DanpheJSONConvert.DeserializeObject<Quotation>(str);
            int reqId = (int)quotData.ReqForQuotationId;
            int vendor = quotData.VendorId;
            RequestForQuotation req = _inventoryDbContext.ReqForQuotation.Where(a => a.ReqForQuotationId == reqId).FirstOrDefault<RequestForQuotation>();
            if (req != null)
            {
                req.Status = "Finalised";
                _inventoryDbContext.Entry(req).State = EntityState.Modified;
            }
            Quotation quot = _inventoryDbContext.Quotations.Where(a => (a.ReqForQuotationId == reqId && a.VendorId == vendor)).FirstOrDefault<Quotation>();
            if (quot != null)
            {
                quot.Status = "selected";
                quot.IssuedDate = quotData.IssuedDate;
                _inventoryDbContext.Entry(quot).State = EntityState.Modified;
            }
            _inventoryDbContext.SaveChanges();
            return null;
        }

        [HttpPut]
        [Route("AssetCheckList")]
        public IActionResult UpdateAssetCheckList()
        {
            //else if (reqType == "updateassetchecklist")
            Func<object> func = () => UpdateAssetCheckListDetail();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdateAssetCheckListDetail()
        {
            string Str = this.ReadPostData();
            FixedAssetConditionCheckListModel fixedAssetstock = JsonConvert.DeserializeObject<FixedAssetConditionCheckListModel>(Str);
            using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    _inventoryDbContext.SaveChanges();
                    dbTransaction.Commit();

                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                }

            }
            return null;
        }

        [HttpPut]
        [Route("PurchaseOrder")]
        public IActionResult UpdatePurchaseOrder()
        {
            //else if (reqType != null && reqType == "UpdatePurchaseOrder")
            Func<object> func = () => UpdatePurchaseOrderList();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdatePurchaseOrderList()
        {
            string Str = this.ReadPostData();
            PurchaseOrderModel poFromClient = DanpheJSONConvert.DeserializeObject<PurchaseOrderModel>(Str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
            {
                using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        //to assign POID if new item has been added.
                        var PoId = poFromClient.PurchaseOrderId;
                        //if any old item has been deleted, we need to compare POitemidlist
                        List<int> POItmIdList = _inventoryDbContext.PurchaseOrderItems.Where(a => a.PurchaseOrderId == PoId).Select(a => a.PurchaseOrderItemId).ToList();
                        //check if verifiers are needed to be set again.
                        poFromClient.VerifierIds = (poFromClient.IsVerificationEnabled == true) ? InventoryBL.SerializeProcurementVerifiers(poFromClient.VerifierList) : "";
                        if (poFromClient.VerifierIds != "")
                        {
                            poFromClient.POStatus = "pending";
                        }
                        else
                        {
                            poFromClient.POStatus = "active";
                        }
                        poFromClient.PurchaseOrderItems.ForEach(itm =>
                        {
                            if (itm.PurchaseOrderItemId > 0) //old elememnt will have the purchaseOrderItemId
                            {
                                itm.PendingQuantity = itm.Quantity;
                                itm.VATAmount = itm.VATAmount;
                                TimeSpan deliveryTimeSpan = (TimeSpan)(poFromClient.DeliveryDate - poFromClient.PoDate);
                                itm.DeliveryDays = deliveryTimeSpan.Days;
                                _inventoryDbContext.PurchaseOrderItems.Attach(itm);
                                _inventoryDbContext.Entry(itm).State = EntityState.Modified;
                                _inventoryDbContext.Entry(itm).Property(x => x.PurchaseOrderId).IsModified = false;
                                _inventoryDbContext.Entry(itm).Property(x => x.AuthorizedOn).IsModified = false;
                                _inventoryDbContext.Entry(itm).Property(x => x.AuthorizedBy).IsModified = false;
                                _inventoryDbContext.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                                _inventoryDbContext.Entry(itm).Property(x => x.CreatedBy).IsModified = false;
                                _inventoryDbContext.Entry(itm).Property(x => x.VATAmount).IsModified = true;
                                _inventoryDbContext.SaveChanges();
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

                                _inventoryDbContext.PurchaseOrderItems.Add(itm);
                                _inventoryDbContext.SaveChanges();
                            }
                        });

                        _inventoryDbContext.PurchaseOrders.Attach(poFromClient);
                        _inventoryDbContext.Entry(poFromClient).State = EntityState.Modified;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.CreatedOn).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.CreatedBy).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.FiscalYearId).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.PONumber).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.POGroupId).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.ModifiedOn).IsModified = true;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.ModifiedBy).IsModified = true;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.VerifierIds).IsModified = true;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.RequisitionId).IsModified = false;
                        _inventoryDbContext.Entry(poFromClient).Property(x => x.POStatus).IsModified = true;
                        _inventoryDbContext.SaveChanges();

                        //for deleting old element
                        if (POItmIdList.Any())
                        {
                            foreach (int poitmid in POItmIdList)
                            {
                                var poitm = _inventoryDbContext.PurchaseOrderItems.Find(poitmid);
                                poitm.IsActive = false;
                                poitm.POItemStatus = "cancelled";
                                poitm.ModifiedBy = currentUser.EmployeeId;
                                poitm.ModifiedOn = DateTime.Now;
                            }
                            _inventoryDbContext.SaveChanges();
                        }
                        dbTransaction.Commit();
                        return poFromClient.PurchaseOrderId;
                    }
                    catch (Exception Ex)
                    {
                        dbTransaction.Rollback();
                        throw Ex;
                    }
                }
            }
            return null;
        }

        [HttpPut]
        [Route("PORequisition")]
        public IActionResult UpdatePORequisitionData()
        {
            // else if (reqType != null && reqType == "UpdatePORequisition")
            Func<object> func = () => UpdatePORequisitionDetail();
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdatePORequisitionDetail()
        {
            string Str = this.ReadPostData();
            PurchaseRequestModel purchaseRequestFromClient = DanpheJSONConvert.DeserializeObject<PurchaseRequestModel>(Str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            if (purchaseRequestFromClient != null && purchaseRequestFromClient.PurchaseRequestItems != null && purchaseRequestFromClient.PurchaseRequestItems.Count > 0)
            {
                purchaseRequestFromClient.ModifiedOn = DateTime.Now;
                purchaseRequestFromClient.ModifiedBy = currentUser.EmployeeId;
                var reqId = purchaseRequestFromClient.PurchaseRequestId;
                //if any old item has been deleted, we need to compare requisitionitemidlist
                List<int> ReqItmIdList = _inventoryDbContext.PurchaseRequestItems.Where(a => a.PurchaseRequestId == reqId && a.IsActive == true).Select(a => a.PurchaseRequestItemId).ToList();
                purchaseRequestFromClient.PurchaseRequestItems.ForEach(item =>
                {
                    if (item.PurchaseRequestItemId > 0) //old elememnt will have the requisitionItemId
                    {
                        //for updating old element
                        item.ModifiedBy = currentUser.EmployeeId;
                        item.ModifiedOn = DateTime.Now;
                        _inventoryDbContext.PurchaseRequestItems.Attach(item);
                        _inventoryDbContext.Entry(item).Property(a => a.ItemId).IsModified = true;
                        _inventoryDbContext.Entry(item).Property(a => a.VendorId).IsModified = true;
                        _inventoryDbContext.Entry(item).Property(a => a.RequestedQuantity).IsModified = true;
                        _inventoryDbContext.Entry(item).Property(a => a.Remarks).IsModified = true;
                        _inventoryDbContext.Entry(item).Property(a => a.ModifiedBy).IsModified = true;
                        _inventoryDbContext.Entry(item).Property(a => a.ModifiedBy).IsModified = true;
                        _inventoryDbContext.SaveChanges();
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
                        _inventoryDbContext.PurchaseRequestItems.Add(item);
                        _inventoryDbContext.SaveChanges();
                    }
                });
                //for cancelling old element
                if (ReqItmIdList.Any())
                {
                    foreach (int reqitmid in ReqItmIdList)
                    {
                        var reqitm = _inventoryDbContext.PurchaseRequestItems.Find(reqitmid);
                        reqitm.IsActive = false;
                        reqitm.CancelledBy = currentUser.EmployeeId;
                        reqitm.CancelledOn = DateTime.Now;
                        reqitm.RequestItemStatus = "withdrawn";
                        _inventoryDbContext.PurchaseRequestItems.Attach(reqitm);
                        _inventoryDbContext.Entry(reqitm).Property(a => a.IsActive).IsModified = true;
                        _inventoryDbContext.Entry(reqitm).Property(a => a.CancelledOn).IsModified = true;
                        _inventoryDbContext.Entry(reqitm).Property(a => a.CancelledBy).IsModified = true;
                        _inventoryDbContext.Entry(reqitm).Property(a => a.RequestItemStatus).IsModified = true;
                        _inventoryDbContext.SaveChanges();
                    }

                    _inventoryDbContext.SaveChanges();
                }
                _inventoryDbContext.PurchaseRequest.Attach(purchaseRequestFromClient);
                _inventoryDbContext.Entry(purchaseRequestFromClient).Property(a => a.RequestDate).IsModified = true;
                _inventoryDbContext.Entry(purchaseRequestFromClient).Property(a => a.VendorId).IsModified = true;
                _inventoryDbContext.Entry(purchaseRequestFromClient).Property(a => a.Remarks).IsModified = true;
                _inventoryDbContext.Entry(purchaseRequestFromClient).Property(a => a.ModifiedOn).IsModified = true;
                _inventoryDbContext.Entry(purchaseRequestFromClient).Property(a => a.ModifiedOn).IsModified = true;
                _inventoryDbContext.SaveChanges();
                return purchaseRequestFromClient.PurchaseRequestId;
            }
            return null;

        }

        [HttpPut]
        [Route("PORequisitionAfterPOCreation")]
        public IActionResult UpdatePORequisition()
        {
            // else if (reqType != null && reqType == "UpdatePORequisitionAfterPOCreation")
            Func<object> func = () => UpdatePORequisitionAfterPOCreation();
            return InvokeHttpPutFunction<object>(func);
        }
        private object UpdatePORequisitionAfterPOCreation()
        {
            string Str = this.ReadPostData();
            int? reqId = DanpheJSONConvert.DeserializeObject<int?>(Str);


            if (reqId != null && reqId > 0)
            {
                var req = _inventoryDbContext.PurchaseRequest.Where(P => P.PurchaseRequestId == reqId).Include(a => a.PurchaseRequestItems).FirstOrDefault();

                var purchaseOrder = _inventoryDbContext.PurchaseOrders.Include(po => po.PurchaseOrderItems).Where(po => po.RequisitionId == reqId).OrderByDescending(po => po.CreatedOn).FirstOrDefault();

                purchaseOrder.PurchaseOrderItems.ForEach(poi =>
                {
                    req.PurchaseRequestItems.ForEach(pri =>
                    {
                        if (pri.RequestItemStatus != "complete")
                            if (pri.ItemId == poi.ItemId)
                            {
                                if (pri.PendingQuantity > poi.Quantity)
                                {
                                    pri.RequestItemStatus = "partial";
                                }
                                else
                                {
                                    pri.RequestItemStatus = "complete";
                                }
                                if (pri.PendingQuantity - poi.Quantity > 0)
                                {
                                    pri.PendingQuantity = pri.PendingQuantity - poi.Quantity;
                                }
                                else
                                {
                                    pri.PendingQuantity = 0;

                                }
                            }

                    });

                });

                if (req.PurchaseRequestItems.Where(pri => pri.RequestItemStatus != "complete").Any(pri => pri.RequestItemStatus == "partial" || pri.RequestItemStatus == "active"))
                {
                    req.RequestStatus = "partial";
                }
                else
                {
                    req.RequestStatus = "complete";
                }
                req.IsPOCreated = true;
                _inventoryDbContext.SaveChanges();
                return reqId;
            }
            return null;
        }

        [HttpPut]
        [Route("CancelRequisitionItem")]
        public IActionResult CancelRequisition()
        {
            //else if (reqType != null && reqType == "cancelRequisitionItems")
            Func<object> func = () => CancelRequisitionItem();
            return InvokeHttpPutFunction<object>(func);

        }
        private object CancelRequisitionItem()
        {
            string Str = this.ReadPostData();
            RequisitionModel reqFromClientC = DanpheJSONConvert.DeserializeObject<RequisitionModel>(Str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            if (reqFromClientC != null && reqFromClientC.RequisitionId != 0 && reqFromClientC.CancelledItems != null && reqFromClientC.CancelledItems.Count > 0)
            {
                //get list of all items inside current requisition and use it locally.
                List<RequisitionItemsModel> reqItemsListFromDb = _inventoryDbContext.RequisitionItems.Where(rqItm => rqItm.RequisitionId == reqFromClientC.RequisitionId).ToList();

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
                        _inventoryDbContext.RequisitionItems.Attach(currReqItmModel_Db);

                        //inventorygDbContext.Entry(currreqModel).State = EntityState.Modified;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelQuantity).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.PendingQuantity).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.ReceivedQuantity).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelOn).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelBy).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.CancelRemarks).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.ModifiedBy).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.ModifiedOn).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.IsActive).IsModified = true;
                        _inventoryDbContext.Entry(currReqItmModel_Db).Property(a => a.RequisitionItemStatus).IsModified = true;
                    }
                });

                //if status of all items inside this requisition is 'complete' then update the status of requisition to 'complete', else do nothing.
                if (reqItemsListFromDb.All(a => a.RequisitionItemStatus == "complete" || a.RequisitionItemStatus == "cancelled"))
                {
                    RequisitionModel reqData = _inventoryDbContext.Requisitions.Where(a => a.RequisitionId == reqFromClientC.RequisitionId).FirstOrDefault();
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
                    _inventoryDbContext.Requisitions.Attach(reqData);
                    _inventoryDbContext.Entry(reqData).Property(x => x.RequisitionStatus).IsModified = true;
                    _inventoryDbContext.Entry(reqData).Property(x => x.IsCancel).IsModified = true;
                    _inventoryDbContext.Entry(reqData).Property(x => x.ModifiedBy).IsModified = true;
                    _inventoryDbContext.Entry(reqData).Property(x => x.ModifiedOn).IsModified = true;
                }
                _inventoryDbContext.SaveChanges();

            }
            return null;
        }

        [HttpGet]
        [Route("ReturnFromSubtore")]
        public IActionResult ReturnFromSubstore(DateTime fromDate, DateTime toDate, int targetstoreid, int? sourcesubstoreid)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {

                var itemReturn = (from Ret in inventoryDbContext.SubstoreReturn
                                  join items in
                                  inventoryDbContext.SubstoreReturnItems on Ret.ReturnId equals items.ReturnId
                                  join sourcestore in inventoryDbContext.StoreMasters on Ret.SourceStoreId equals sourcestore.StoreId
                                  join item in inventoryDbContext.Items on items.ItemId equals item.ItemId
                                  join emp in inventoryDbContext.Employees on Ret.CreatedBy equals emp.EmployeeId
                                  where Ret.TargetStoreId == targetstoreid && DbFunctions.TruncateTime(Ret.ReturnDate) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(Ret.ReturnDate) <= DbFunctions.TruncateTime(toDate)//&& (Ret.SourceStoreId == sourcesubstoreid || sourcesubstoreid == null)
                                  select new
                                  {
                                      ReturnId = Ret.ReturnId,
                                      CreatedOn = Ret.ReturnDate,
                                      CreatedBy = Ret.CreatedBy,
                                      SourceStore = sourcestore.Name,
                                      Item = item.ItemName,
                                      ReturnedQuantity = items.ReturnQuantity,
                                      SourceStoreId = Ret.SourceStoreId,
                                      EmployeeName = emp.FullName,
                                      BatchNo = (items.BatchNo != null) ? items.BatchNo : "N/A",
                                      ReceivedByName = (Ret.ReceivedBy == null) ? "Not Received" : inventoryDbContext.Employees.FirstOrDefault(e => e.EmployeeId == Ret.ReceivedBy).FullName,
                                      Status = (Ret.ReceivedBy == null) ? "Pending" : "Received",
                                      ReceivedOn = Ret.ReceivedOn,
                                      ReceivedRemarks = Ret.ReceivedRemarks

                                  }).OrderByDescending(a => a.ReturnId).ToList();

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = itemReturn;
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = ex.Message.ToString();
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
            }

            return Ok(responseData);

        }



        [HttpGet]
        [Route("AllSubstore")]
        public IActionResult GetAllSubstore()
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var stores = (from store in inventoryDbContext.StoreMasters
                              select new
                              {
                                  StoreId = store.StoreId,
                                  StoreName = store.Name
                              }).ToList();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = stores;
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = ex.Message.ToString();
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
            }

            return Ok(responseData);

        }

        //Put method for item return from Substore
        [HttpPut]
        [Route("ReceiveDispatchedItems")]
        public async Task<IActionResult> UpdateReceiveDispatchedItems(int returnId, string receivedRemarks)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var ReturnItemId = (from ret in inventoryDb.SubstoreReturnItems
                                    where ret.ReturnId == returnId
                                    select ret.ReturnItemId).FirstOrDefault();
                List<ReturnFromSubstore> returnItemsToUpdate = await inventoryDb.SubstoreReturn.Where(itm => itm.ReturnId == returnId).ToListAsync();
                if (returnItemsToUpdate == null || returnItemsToUpdate.Count == 0) { throw new Exception("Items Not Found."); };

                var receiveTxnTypes = new List<string>() { ENUM_INV_StockTransactionType.ReturnedItem, ENUM_INV_StockTransactionType.ReturnedItemReceivingSide };

                foreach (var returnedItem in returnItemsToUpdate)
                {
                    //TODO: Find stock txns for each dispatched item
                    var stockTxnList = await inventoryDb.StockTransactions.Where(ST => ST.ReferenceNo == ReturnItemId && receiveTxnTypes.Contains(ST.TransactionType)).ToListAsync();
                    foreach (var stkTxn in stockTxnList)
                    {

                        var stock = await inventoryDb.StoreStocks.FindAsync(stkTxn.StoreStockId);
                        if (stock.StoreId == returnedItem.SourceStoreId)
                        {
                            stock.ConfirmStockDecrease(quantity: stkTxn.OutQty);
                        }
                        else
                        {
                            stock.ConfirmStockReceived(stkTxn.InQty);
                            stock.ConfirmStockDecrease(stkTxn.InQty);


                        }
                        await inventoryDb.SaveChangesAsync();
                    }
                    //TODO: Update the Received Status in Dispatched Items Row in Dispatch Table
                    returnedItem.ReceivedBy = currentUser.EmployeeId;
                    returnedItem.ReceivedByName = inventoryDb.Employees.FirstOrDefault(e => e.EmployeeId == returnedItem.ReceivedBy).FullName;
                    returnedItem.ReceivedOn = DateTime.Now;
                    returnedItem.ReceivedRemarks = receivedRemarks;
                    await inventoryDb.SaveChangesAsync();
                }
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = returnId;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = $"Items Receive Failed, Message: {ex.Message.ToString()}";
                return BadRequest(responseData);
            }
        }
        [HttpGet]
        [Route("AllInventoryStores")]
        public IActionResult GetInventoryStoresList()
        {
            Func<object> func = () => GetAllInventoryStores();
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetAllInventoryStores()
        {
            var stores = (from store in _inventoryDbContext.StoreMasters.Where(s => s.IsActive == true && (s.SubCategory == ENUM_StoreSubCategory.Inventory || s.Category == ENUM_StoreCategory.Substore))
                          select new
                          {
                              StoreId = store.StoreId,
                              StoreName = store.Name
                          }).ToList();
            return stores;
        }
        [HttpPost]
        [Route("PurchaseOrderDraft")]
        public IActionResult PostPODraft([FromBody] PurchaseOderDraftDTO poDraftFromClient)
        {
            Func<object> func = () => PostPurchaseOrderDraft(poDraftFromClient);
            return InvokeHttpGetFunction<object>(func);
        }
        private object PostPurchaseOrderDraft(PurchaseOderDraftDTO reqFromClient)
        {
            using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
            {
                try
                {
                    var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    var currentDate = DateTime.Now;


                    if (reqFromClient != null && reqFromClient.PurchaseOrderDraftItems != null && reqFromClient.PurchaseOrderDraftItems.Count > 0)
                    {
                        reqFromClient.PurchaseOrderDraftItems.ForEach(item =>
                        {
                            item.CreatedOn = currentDate;
                            item.CreatedBy = currentUser.EmployeeId;
                        });
                        reqFromClient.CreatedOn = currentDate;
                        reqFromClient.CreatedBy = currentUser.EmployeeId;
                        reqFromClient.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext).FiscalYearId;
                        reqFromClient.DraftPurchaseOrderNo = _receiptNumberService.GeneratePurchaseOrderDraftNumber(reqFromClient.FiscalYearId, reqFromClient.PODGroupId);
                        PurchaseOrderDraftModel purchaseOrderDraft = JsonConvert.DeserializeObject<PurchaseOrderDraftModel>(JsonConvert.SerializeObject(reqFromClient));
                        _inventoryDbContext.PurchaseOrderDrafts.Add(purchaseOrderDraft);
                        _inventoryDbContext.SaveChanges();
                        dbTransaction.Commit();
                        return purchaseOrderDraft.DraftPurchaseOrderId;
                    }
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw ex;
                }

            }
            throw new Exception("Failed to save purchase order draft.");

        }
        [HttpGet]
        [Route("PurchaseOrderDrafts")]
        public IActionResult GetPurchaseOrderDraftList(string status)
        {
            Func<object> func = () => GetPODrafts(status);
            return InvokeHttpGetFunction<object>(func);
        }
        private object GetPODrafts(string status)
        {
            var PODrafts = (from draft in _inventoryDbContext.PurchaseOrderDrafts
                            join ven in _inventoryDbContext.Vendors on draft.VendorId equals ven.VendorId into vendorTemp
                            from vendor in vendorTemp.DefaultIfEmpty()
                            join emp in _inventoryDbContext.Employees on draft.CreatedBy equals emp.EmployeeId
                            where draft.Status == status
                            select new
                            {
                                VendorName = vendor.VendorName,
                                VendorCode = vendor.VendorCode,
                                VendorContact = vendor.ContactNo,
                                CreatedOn = draft.CreatedOn,
                                DraftCreatedBy = emp.FullName,
                                LastUpdateOn = (draft.ModifiedOn == null) ? null : draft.ModifiedOn,
                                LastUpdateBy = (draft.ModifiedBy == null) ? "" : _inventoryDbContext.Employees.FirstOrDefault(e => e.EmployeeId == draft.ModifiedBy).FullName,
                                TotalAmount = draft.TotalAmount,
                                DraftPurchaseOrderId = draft.DraftPurchaseOrderId,
                                Status = draft.Status,
                                DiscardedOn = draft.DiscardedOn
                            }).OrderByDescending(b => b.LastUpdateOn != null ? b.LastUpdateOn : b.DiscardedOn != null ? b.DiscardedOn : b.CreatedOn).ToList();
            return PODrafts;
        }
        [HttpGet]
        [Route("PurchaseOrderDraftItem")]
        public IActionResult GetPODraftByPODId(int purchaseOrderDraftId)
        {
            Func<object> func = () => GetPODraftDetailByPOId(purchaseOrderDraftId);
            return InvokeHttpGetFunction<object>(func);

        }
        private object GetPODraftDetailByPOId(int purchaseOrderDraftId)
        {
            var poDraftItems = (from POD in _inventoryDbContext.PurchaseOrderDrafts.Where(p => p.DraftPurchaseOrderId == purchaseOrderDraftId)
                                from poditms in _inventoryDbContext.PurchaseOrderDraftItems
                                join itms in _inventoryDbContext.Items on poditms.ItemId equals itms.ItemId
                                join uom in _inventoryDbContext.UnitOfMeasurementMaster on itms.UnitOfMeasurementId equals uom.UOMId into uomJoin
                                from uomLeftJoin in uomJoin.DefaultIfEmpty()
                                where poditms.DraftPurchaseOrderId == purchaseOrderDraftId
                                join category in _inventoryDbContext.ItemCategoryMaster on itms.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                                from ctg in ctgGroup.DefaultIfEmpty()
                                select new
                                {
                                    ItemName = itms.ItemName,
                                    ItemCategory = (ctg == null) ? "" : ctg.ItemCategoryName,
                                    ItemCategoryCode = (ctg == null) ? "" : ctg.CategoryCode,
                                    VendorItemCode = poditms.VendorItemCode,
                                    MSSNO = itms.MSSNO,
                                    HSNCODE = itms.HSNCODE,
                                    Quantity = poditms.Quantity,
                                    PODItemStatus = POD.Status,
                                    PODItemSpecification = poditms.ItemSpecification,
                                    ItemRate = poditms.ItemRate,
                                    Code = itms.Code,
                                    VATPercentage = poditms.VATPercentage,
                                    VATAmount = poditms.VATAmount,
                                    UOMName = uomLeftJoin.UOMName,
                                    TotalAmount = poditms.TotalAmount,
                                    Remarks = poditms.Remarks,
                                    DraftPurchaseOrderItemId = poditms.DraftPurchaseOrderItemId,
                                    DraftPurchaseOrderId = poditms.DraftPurchaseOrderId,
                                    CreatedBy = poditms.CreatedBy,
                                    CreatedOn = poditms.CreatedOn,
                                    ItemId = itms.ItemId,
                                    IsActive = poditms.IsActive,
                                    IsDiscarded = poditms.IsDiscarded
                                }).OrderBy(p => p.DraftPurchaseOrderItemId).ToList();
            var poDraftdetails = (from pod in _inventoryDbContext.PurchaseOrderDrafts
                                  join ven in _inventoryDbContext.Vendors on pod.VendorId equals ven.VendorId
                                  join cur in _inventoryDbContext.CurrencyMaster on pod.CurrencyId equals cur.CurrencyID
                                  join emp in _inventoryDbContext.Employees on pod.CreatedBy equals emp.EmployeeId
                                  where pod.DraftPurchaseOrderId == purchaseOrderDraftId
                                  select new
                                  {
                                      DraftPurchaseOrderId = pod.DraftPurchaseOrderId,
                                      DraftPurchaseOrderNo = pod.DraftPurchaseOrderNo,
                                      VendorName = ven.VendorName,
                                      VendorPANNumber = ven.PanNo,
                                      VendorContact = ven.ContactNo,
                                      VendorAddress = ven.ContactAddress,
                                      VendorEmail = ven.Email,
                                      BankDetails = ven.BankDetails,
                                      CreatedOn = pod.CreatedOn,
                                      DeliveryDate = pod.DeliveryDate,
                                      Status = pod.Status,
                                      SubTotal = pod.SubTotal,
                                      VATAmount = pod.VATAmount,
                                      TotalAmount = pod.TotalAmount,
                                      Remarks = pod.Remarks,
                                      CreatedBy = pod.CreatedBy,
                                      InvoicingAddress = pod.InvoicingAddress,
                                      DeliveryAddress = pod.DeliveryAddress,
                                      ContactPersonName = pod.ContactPersonName,
                                      ContactPersonEmail = pod.ContactPersonEmail,
                                      ReferenceNo = pod.ReferenceNo,
                                      DraftCreatedBy = emp.FullName,
                                      CurrencyId = cur.CurrencyID,
                                      CurrencyCode = cur.CurrencyCode,
                                      VendorId = pod.VendorId,

                                  }).FirstOrDefault();
            var purchaseorderDraftDetails = new { poDraftItems = poDraftItems, poDraftDetails = poDraftdetails };
            return purchaseorderDraftDetails;
        }
        [HttpPost]
        [Route("DiscardPurchaseOrder")]
        public IActionResult DiscardDraftPurchaseOrder(int draftPurchaseOrderId, string DiscardRemarks)
        {
            Func<object> func = () => DiscardDraftPurchaseOrderById(draftPurchaseOrderId, DiscardRemarks);
            return InvokeHttpPostFunction<object>(func);

        }
        private object DiscardDraftPurchaseOrderById(int draftPurchaseOrderId, string DiscardRemarks)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            bool flag = true;
            flag = InventoryBL.CancelPurchaseOrderDraftById(_inventoryDbContext, draftPurchaseOrderId, DiscardRemarks, currentUser);
            if (flag)
            {

                return 1;
            }
            else
            {
                return null;
            }
        }
        [HttpPut]
        [Route("PurchaseOrderDraft")]
        public IActionResult UpdatePODraft([FromBody] PurchaseOderDraftDTO poDraftFromClient)
        {
            Func<object> func = () => UpdatePurchaseOrderDraft(poDraftFromClient);
            return InvokeHttpPutFunction<object>(func);

        }
        private object UpdatePurchaseOrderDraft(PurchaseOderDraftDTO draft)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            draft.PurchaseOrderDraftItems.ForEach(
                item =>
                {
                    if (item.DraftPurchaseOrderId == 0)
                    {
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = DateTime.Now;
                    }
                });
            PurchaseOrderDraftModel poDraftFromClient = JsonConvert.DeserializeObject<PurchaseOrderDraftModel>(JsonConvert.SerializeObject(draft));
            poDraftFromClient.FiscalYearId = InventoryBL.GetFiscalYear(_inventoryDbContext).FiscalYearId;

            if (poDraftFromClient != null && poDraftFromClient.PurchaseOrderDraftItems != null && poDraftFromClient.PurchaseOrderDraftItems.Count > 0)
            {
                using (var dbTransaction = _inventoryDbContext.Database.BeginTransaction())
                {
                    var PurchaseOrderDraftId = poDraftFromClient.DraftPurchaseOrderId;
                    List<int> PODraftItmIdList = _inventoryDbContext.PurchaseOrderDraftItems.Where(a => a.DraftPurchaseOrderId == PurchaseOrderDraftId).Select(a => a.DraftPurchaseOrderItemId).ToList();
                    poDraftFromClient.ModifiedBy = currentUser.EmployeeId;
                    poDraftFromClient.ModifiedOn = DateTime.Now;

                    poDraftFromClient.PurchaseOrderDraftItems.ForEach(itm =>
                                        {
                                            if (itm.DraftPurchaseOrderId > 0)
                                            {
                                                itm.ModifiedOn = DateTime.Now;
                                                itm.ModifiedBy = currentUser.EmployeeId;
                                                PODraftItmIdList = PODraftItmIdList.Where(a => a != itm.DraftPurchaseOrderItemId).ToList();
                                                _inventoryDbContext.PurchaseOrderDraftItems.Attach(itm);
                                                _inventoryDbContext.Entry(itm).State = EntityState.Modified;
                                                _inventoryDbContext.Entry(itm).Property(x => x.ModifiedOn).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.ModifiedBy).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.ItemId).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.Quantity).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.ItemRate).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.ItemCategory).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.SubTotal).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.Remarks).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.VATAmount).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.VATPercentage).IsModified = true;
                                                _inventoryDbContext.Entry(itm).Property(x => x.TotalAmount).IsModified = true;
                                                _inventoryDbContext.SaveChanges();
                                            }
                                            else //new items wont have PurchaseOrderDraftItemId
                                            {
                                                //for adding new Draft items
                                                itm.DraftPurchaseOrderId = poDraftFromClient.DraftPurchaseOrderId;
                                                _inventoryDbContext.PurchaseOrderDraftItems.Add(itm);
                                                _inventoryDbContext.SaveChanges();
                                            }
                                        });
                    _inventoryDbContext.PurchaseOrderDrafts.Attach(poDraftFromClient);
                    _inventoryDbContext.Entry(poDraftFromClient).State = EntityState.Modified;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.ModifiedBy).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.ModifiedOn).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.VATAmount).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.TotalAmount).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.VendorId).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.CurrencyId).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.ContactPersonEmail).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.ContactPersonName).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.InvoicingAddress).IsModified = true;
                    _inventoryDbContext.Entry(poDraftFromClient).Property(x => x.SubTotal).IsModified = true;

                    _inventoryDbContext.SaveChanges();
                    //for deleting old element
                    if (PODraftItmIdList.Any())
                    {
                        foreach (int poitmid in PODraftItmIdList)
                        {
                            var poitm = _inventoryDbContext.PurchaseOrderDraftItems.Find(poitmid);
                            if (poitm != null && poitm.IsActive)
                            {
                                poitm.IsActive = false;
                                poitm.ModifiedBy = currentUser.EmployeeId;
                                poitm.ModifiedOn = DateTime.Now;
                            }
                        }
                        _inventoryDbContext.SaveChanges();
                    }
                    dbTransaction.Commit();
                    return poDraftFromClient.DraftPurchaseOrderId;
                }
            }
            throw new Exception("Updation Failed!");
        }
    }
}

