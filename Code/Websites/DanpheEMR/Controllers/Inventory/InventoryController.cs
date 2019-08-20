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
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using RefactorThis.GraphDiff;//for entity-update.
using System.Collections.ObjectModel;
using DanpheEMR.Security;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class InventoryController : CommonController
    {

        public InventoryController(IOptions<MyConfiguration> _config) : base(_config)
        {

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
            int ReqForQuotationItemById,
            int QuotationItemById,
            int ReqForQuotationId,
            DateTime FromDate,
            DateTime ToDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                MasterDbContext masterDbContext = new MasterDbContext(connString);
                responseData.Status = "OK";
                #region Get All Items from ItemMaster table
                if (reqType == "ItemList")
                {
                    string returnValue = string.Empty;

                    List<ItemMasterModel> ItemList = new List<ItemMasterModel>();

                    ItemList = (from item in inventoryDbContext.Items
                                select item).ToList();
                    responseData.Results = ItemList;
                }
                if (reqType == "VendorList")
                {
                    string returnValue = string.Empty;

                    List<VendorMasterModel> VendorList = inventoryDbContext.Vendors.ToList();

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
                #endregion
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
                                      Quantity = p.Sum(a => (double)Math.Ceiling(a.Quantity) - a.ReceivedQuantity)
                                  }).ToList();
                    var stks = (from stk in inventoryDbContext.Stock
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

                    //var inventoryitem = (from req in inventoryDbContext.RequisitionItems.Include("Items")
                    //                     where (req.RequisitionItemStatus == "active" || req.RequisitionItemStatus == "partial")
                    //                     group req by new
                    //                     {
                    //                         req.Item.ItemId,
                    //                         req.Item.ItemName
                    //                     } into p
                    //                     select new
                    //                     {
                    //                         ItemId = p.Key.ItemId,
                    //                         Quantity = p.Sum(a => (double)Math.Ceiling(a.Quantity) - a.ReceivedQuantity),
                    //                         ItemName = p.Key.ItemName
                    //                     }).OrderByDescending(a => a.ItemName).ToList();
                    //responseData.Results = inventoryitem;
                }
                #endregion
                #region//Get All ItemName,ItemId from Stock & ItemRate as StandardRate from GoodsReceiptItems table
                //Get VAT against ItemId from ItemMaster table
                //which has Available Quantity >0 in Stock Table  for WriteOff functinality
                else if (reqType != null && reqType.ToLower() == "getavailableqtyitemlist")
                {
                    var requestDetails = (from stock in inventoryDbContext.Stock
                                          join items in inventoryDbContext.Items on stock.ItemId equals items.ItemId
                                          join grItems in inventoryDbContext.GoodsReceiptItems on stock.ItemId equals grItems.ItemId
                                          where stock.AvailableQuantity > 0
                                          group items by new { items.ItemId, items.ItemName, items.StandardRate, items.VAT, grItems.ItemRate } into itms
                                          select new
                                          {
                                              ItemId = itms.Key.ItemId,
                                              ItemName = itms.Key.ItemName,
                                              //StandardRate=itms.Key.StandardRate,
                                              //StandardRate = itms.Key.ItemRate,
                                              VAT = itms.Key.VAT

                                          }
                                       ).ToList();

                    responseData.Results = requestDetails;

                }
                #endregion
                #region //Get RequisitionItems by Requisition Id don't check any status this for View Purpose
                else if (reqType != null && reqType.ToLower() == "requisitionitemsforview")
                {
                    //this for get employee Name

                    var requistionDate = (from req in inventoryDbContext.Requisitions
                                         where req.RequisitionId == RequisitionId
                                         select req.RequisitionDate).FirstOrDefault();
                    var requisitionItems = (from reqItems in inventoryDbContext.RequisitionItems
                                            join itm in inventoryDbContext.Items on reqItems.ItemId equals itm.ItemId
                                            // join emp in masterDbContext.Employee on reqItems.CreatedBy equals emp.EmployeeId
                                            where reqItems.RequisitionId == RequisitionId
                                            select new
                                            {
                                                reqItems.ItemId,
                                                reqItems.RequisitionItemId,
                                                reqItems.PendingQuantity,
                                                reqItems.Quantity,
                                                reqItems.Remark,
                                                reqItems.ReceivedQuantity,
                                                reqItems.CreatedBy,
                                                // CreatedByName= emp.FirstName +' '+emp.LastName,
                                                CreatedOn = requistionDate,
                                                reqItems.RequisitionItemStatus,
                                                itm.ItemName,
                                                itm.Code,
                                                reqItems.RequisitionId
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
                                              reqItem.Quantity,
                                              reqItem.Remark,
                                              ReceivedQuantity = disp == null ? 0 : (reqItem.Quantity - (decimal)Convert.ToDecimal(reqItem.PendingQuantity)),
                                              reqItem.CreatedBy,
                                              CreatedByName = emp.FullName,
                                              reqItem.CreatedOn,
                                              reqItem.RequisitionItemStatus,
                                              reqItem.ItemName,
                                              reqItem.Code,
                                              reqItem.RequisitionId,
                                              ReceivedBy = disp == null ? "" : disp.ReceivedBy,
                                              DispatchedByName = disp == null ? "" : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName
                                          }
                        ).ToList().GroupBy(a => a.ItemId).Select(g => new
                        {
                            ItemId = g.Key,
                            PendingQuantity = g.Select(a => a.PendingQuantity).FirstOrDefault(),
                            Quantity = g.Select(a => a.Quantity).FirstOrDefault(),
                            Remark = g.Select(a => a.Remark).FirstOrDefault(),
                            ReceivedQuantity = g.Select(a => a.ReceivedQuantity).FirstOrDefault(),
                            CreatedBy = g.Select(a => a.CreatedBy).FirstOrDefault(),
                            CreatedByName = g.Select(a => a.CreatedByName).FirstOrDefault(),
                            CreatedOn = g.Select(a => a.CreatedOn).FirstOrDefault(),
                            RequisitionItemStatus = g.Select(a => a.RequisitionItemStatus).FirstOrDefault(),
                            ItemName = g.Select(a => a.ItemName).FirstOrDefault(),
                            Code = g.Select(a=>a.Code).FirstOrDefault(),
                            RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                            ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                            DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault()
                        }).ToList();
                    // List<RequisitionItemsModel> requisitionItems = new List<RequisitionItemsModel>();
                    // requisitionItems = (from reqItems in inventoryDbContext.RequisitionItems
                    //                     where reqItems.RequisitionId==RequisitionId
                    //                     select reqItems
                    //                     ).ToList();
                    //responseData.Results = requisitionItems;
                    responseData.Results = requestDetails;
                }
                #endregion

                #region // Get All Authorized purchase Order List from INV_TXN_PurchaseOrder where POStatus = active
                else if (reqType != null && reqType == "returnItemDetails")
                {
                    var returnList = inventoryDbContext.ReturnToVendorItems.Where(r => r.CreatedOn == CreatedOn && r.VendorId == vendorId).ToList();
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
                    var requestDetails = (from po in inventoryDbContext.PurchaseOrders
                                          join v in inventoryDbContext.Vendors on po.VendorId equals v.VendorId
                                          join stat in poStatuses
                                          on po.POStatus equals stat
                                          where po.CreatedOn > FromDate && po.CreatedOn < testdate
                                          orderby po.PoDate descending
                                          select new
                                          {
                                              PurchaseOrderId = po.PurchaseOrderId,
                                              VendorId = po.VendorId,
                                              PoDate = po.PoDate,
                                              POStatus = po.POStatus,
                                              SubTotal = po.SubTotal,
                                              TotalAmount = po.TotalAmount,
                                              VAT = po.VAT,
                                              VendorName = v.VendorName,
                                              VendorContact = v.ContactNo

                                          }
                                          ).ToList();


                    responseData.Results = requestDetails;
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


                    for (int i = requestDetails.PurchaseOrderItems.Count - 1; i >= 0; i--)
                    {
                        if (requestDetails.PurchaseOrderItems[i].POItemStatus == "complete"
                            || requestDetails.PurchaseOrderItems[i].POItemStatus == "initiated"
                            || requestDetails.PurchaseOrderItems[i].POItemStatus == "cancel")
                        { requestDetails.PurchaseOrderItems.RemoveAt(i); }
                    }
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
                    List<RequisitionModel> requisitionDetails = (from requisition in inventoryDbContext.Requisitions
                                                                 where (requisition.RequisitionStatus == "partial" ||
                                                                 requisition.RequisitionStatus == "active") && requisition.RequisitionId == RequisitionId
                                                                 select requisition)
                                                                .Include(rItems => rItems.RequisitionItems.Select(i => i.Item))
                                                                .ToList();


                    //This for remove complete, initiated and cancel Requisition Items from List
                    //added Decremental counter to avoid index-outofRange exception: since we're removing items from the list inside the loop of its own.
                    for (int i = requisitionDetails[0].RequisitionItems.Count - 1; i >= 0; i--)
                    {
                        if (requisitionDetails[0].RequisitionItems[i].RequisitionItemStatus == "complete"
                            || requisitionDetails[0].RequisitionItems[i].RequisitionItemStatus == "initiated"
                            || requisitionDetails[0].RequisitionItems[i].RequisitionItemStatus == "cancel")
                        { requisitionDetails[0].RequisitionItems.RemoveAt(i); }
                    }

                    //This for Get  Stock record with Matching ItemId of Requisition Item table
                    for (int j = 0; j < requisitionDetails[0].RequisitionItems.Count; j++)
                    {
                        var itemId = requisitionDetails[0].RequisitionItems[j].ItemId;

                        List<StockModel> stockItems = new List<StockModel>();
                        stockItems = (from stock in inventoryDbContext.Stock
                                      where (stock.ItemId == itemId && stock.AvailableQuantity > 0)
                                      select stock
                                              ).OrderByDescending(s => s.ExpiryDate).ToList();
                        if (stockItems.Count > 0)
                        {
                            foreach (var i in stockItems)
                            {
                                requisitionStockVM.stock.Add(i);
                            }
                        }

                    }


                    requisitionStockVM.requisition = requisitionDetails[0];
                    responseData.Results = requisitionStockVM;
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
                    List<StockModel> stocks = (from stock in inventoryDbContext.Stock
                                               where (stock.ItemId == ItemId && stock.AvailableQuantity > 0)
                                               select stock)
                                                   .OrderBy(s => s.ExpiryDate).ToList();
                    if (stocks.Count > 0)
                    {
                        foreach (var i in stocks)
                        {
                            reqItemStockVM.stocks.Add(i);
                        }
                    }
                    responseData.Results = reqItemStockVM;
                }
                #endregion

                else if (reqType != null && reqType == "writeOffItemList")
                {
                    var writeOffItemList = (from writeOff in inventoryDbContext.WriteOffItems
                                            join item in inventoryDbContext.Items on writeOff.ItemId equals item.ItemId
                                            select new
                                            {
                                                ItemName = item.ItemName,
                                                BatchNO = writeOff.BatchNO,
                                                WriteOffQuantity = writeOff.WriteOffQuantity,
                                                WriteOffDate = writeOff.WriteOffDate,
                                                ItemRate = writeOff.ItemRate,
                                                TotalAmount = writeOff.TotalAmount,
                                                Remark = writeOff.Remark
                                            }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = writeOffItemList;
                }

                #region GET: Internal > ReturnVendorItemList
                else if (reqType != null && reqType == "returnVendorItemList")
                {
                    var returnVendorItemList = (from vendorItem in inventoryDbContext.ReturnToVendorItems
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
                                              Quantity = (double)Math.Ceiling(reqItem.Quantity) - reqItem.ReceivedQuantity
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
                #region GET: External > GoodsReceiptList : get list of goodsreceipt for grid
                else if (reqType == "goodsreceipt")
                {
                    var Sno = 0;
                    var testdate = ToDate.AddDays(1);//to include ToDate, 1 day was added--rusha 07/15/2019
                    var goodsReceiptList = inventoryDbContext.GoodsReceipts.Where(a => a.IsCancel == false).ToList().GroupJoin(inventoryDbContext.Vendors.ToList(), a => a.VendorId, b => b.VendorId, (a, b) =>
                           new
                           {
                               GoodsReceiptID = a.GoodsReceiptID,
                               PurchaseOrderId = a.PurchaseOrderId,
                               GoodsReceiptDate = a.GoodsReceiptDate,
                               TotalAmount = a.TotalAmount,
                               Remarks = a.Remarks,
                               VendorName = b.Select(s => s.VendorName).FirstOrDefault(),
                               ContactNo = b.Select(s => s.ContactNo),
                           }).ToList().GroupBy(a => a.GoodsReceiptID).OrderByDescending(a => goodsReceiptId).Select(
                         a => new
                         {
                             Sno = ++Sno,
                             GoodsReceiptID = a.Select(s => s.GoodsReceiptID).FirstOrDefault(),
                             TotalAmount = a.Sum(s => s.TotalAmount),
                             Remarks = a.Select(s => s.Remarks),
                             VendorName = a.Select(s => s.VendorName).FirstOrDefault(),
                             GoodReceiptDate = a.Select(s => s.GoodsReceiptDate).FirstOrDefault(),
                             PurchaseOrderId = a.Select(s => s.PurchaseOrderId).FirstOrDefault(),
                             ContactNo = a.Select(s => s.ContactNo).FirstOrDefault(),
                         }
                        );
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
                    //sanjit: if any changes is made here, it also affect goods-receipt-add.component.ts->ShowGoodsReceiptDetails() function.  So please make the respective change.
                    var gritems = (from gritms in inventoryDbContext.GoodsReceiptItems
                                   join itms in inventoryDbContext.Items on gritms.ItemId equals itms.ItemId into itmsGroup
                                   from itm in itmsGroup.DefaultIfEmpty()
                                   join category in inventoryDbContext.ItemCategoryMaster on itm.ItemCategoryId equals category.ItemCategoryId into ctgGroup
                                   from ctg in ctgGroup.DefaultIfEmpty()
                                   where gritms.GoodsReceiptId == goodsReceiptId
                                   select new
                                   {
                                       ItemName = itm.ItemName,
                                       ItemCode = itm.Code,
                                       ItemCategory = ctg.ItemCategoryName,
                                       BatchNo = gritms.BatchNO,
                                       ExpiryDate = gritms.ExpiryDate,
                                       ReveivedQuantity = gritms.ReceivedQuantity,
                                       FreeQuantity = gritms.FreeQuantity,
                                       GRItemRate = gritms.ItemRate,
                                       VATAmount = gritms.VATAmount,
                                       CcAmount = gritms.CcAmount,
                                       DiscountAmount = gritms.DiscountAmount,
                                       ItemTotalAmount = gritms.TotalAmount,
                                       OtherCharge = gritms.OtherCharge,
                                       GoodsReceiptId = gritms.GoodsReceiptId,
                                       GoodsReceiptItemId = gritms.GoodsReceiptItemId
                                   }
                                               ).ToList();
                    var grdetails = (from gr in inventoryDbContext.GoodsReceipts
                                     join ven in inventoryDbContext.Vendors on gr.VendorId equals ven.VendorId
                                     where gr.GoodsReceiptID == goodsReceiptId
                                     select new
                                     {
                                         GoodsReceiptID = gr.GoodsReceiptID,
                                         PurchaseOrderId = gr.PurchaseOrderId,
                                         GoodsReceiptDate = gr.GoodsReceiptDate,
                                         ReceivedDate = gr.ReceivedDate,
                                         BillNo = gr.BillNo,
                                         TotalAmount = gr.TotalAmount,
                                         SubTotal = gr.SubTotal,
                                         DiscountAmount = gr.DiscountAmount,
                                         TDSAmount = gr.TDSAmount,
                                         TotalWithTDS = gr.TotalWithTDS,
                                         CcCharge = gr.CcCharge,
                                         VATTotal = gr.VATTotal,
                                         Remarks = gr.Remarks,
                                         VendorName = ven.VendorName,
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
                                         CreatedBy = gr.CreatedBy
                                     }
                                            ).ToList();
                    var CreatedById = grdetails[0].CreatedBy;
                    var creator = (from emp in masterDbContext.Employees
                                   join r in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals r.EmployeeRoleId into roleTemp
                                   from role in roleTemp.DefaultIfEmpty()
                                   where emp.EmployeeId == CreatedById
                                   select new
                                   {
                                       Name = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                       Role = role.EmployeeRoleName
                                   }).FirstOrDefault();
                    var goodsreceiptDetails = new { grItems = gritems, grDetails = grdetails, creator = creator };
                    responseData.Status = "OK";
                    responseData.Results = goodsreceiptDetails;
                }
                #endregion
                #region GET: External > PurchaseOrderDetails : get detail of purchaseorder for id
                else if (reqType == "POItemsDetailsByPOId")
                {
                    var poitems = (from poitms in inventoryDbContext.PurchaseOrderItems
                                   join itms in inventoryDbContext.Items on poitms.ItemId equals itms.ItemId
                                   where poitms.PurchaseOrderId == purchaseOrderId
                                   select new
                                   {
                                       ItemName = itms.ItemName,
                                       Quantity = poitms.Quantity,
                                       ReceivedQuantity = poitms.ReceivedQuantity,
                                       POItemStatus = poitms.POItemStatus,
                                       StandardRate = poitms.StandardRate,
                                       ItemTotalAmount = poitms.TotalAmount,
                                       ItemRemark = poitms.Remark,
                                       DeliveryDays = poitms.DeliveryDays,
                                       AuthorizedBy = poitms.AuthorizedBy,
                                       PurchaseOrderItemId = poitms.PurchaseOrderItemId
                                   }).ToList();
                    var podetails = (from po in inventoryDbContext.PurchaseOrders
                                     join ven in inventoryDbContext.Vendors on po.VendorId equals ven.VendorId
                                     where po.PurchaseOrderId == purchaseOrderId
                                     select new
                                     {
                                         PurchaseOrderId = po.PurchaseOrderId,
                                         VendorName = ven.VendorName,
                                         VendorNo = ven.ContactNo,
                                         VendorAddress = ven.ContactAddress,
                                         PoDate = po.PoDate,
                                         POStatus = po.POStatus,
                                         SubTotal = po.SubTotal,
                                         VATAmount = po.VAT,
                                         TotalAmount = po.TotalAmount,
                                         PORemark = po.PORemark,
                                         CreatedbyId = po.CreatedBy,
                                         Terms = po.TermsConditions,
                                         VendorEmail = ven.Email
                                     }).FirstOrDefault();
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

                    var purchaseorderDetails = new { poItems = poitems, poDetails = podetails, creator = creator, authorizer = authorizer };

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
                                      Quantity = p.Sum(a => (double)Math.Ceiling(a.Quantity) - a.ReceivedQuantity),
                                      StandardRate = p.Key.StandardRate,
                                      VAT = p.Key.VAT
                                  }).ToList();

                    var stks = (from stk in inventoryDbContext.Stock
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
                    var stock = (from stk in inventoryDbContext.Stock
                                 join itm in inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                                 where stk.AvailableQuantity > 0
                                 group new { stk, itm } by new { stk.ItemId, itm.ItemName, itm.MinStockQuantity } into stocks
                                 select new
                                 {
                                     ItemId = stocks.Key.ItemId,
                                     ItemName = stocks.Key.ItemName,
                                     AvailQuantity = stocks.Sum(a => a.stk.AvailableQuantity),
                                     MinQuantity = stocks.Sum(a => a.itm.MinStockQuantity)
                                 }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = stock;
                }
                #endregion
                #region GET: Stock > get list of StockDetails by ItemId (available quantity > 0)
                else if (reqType == "stockDetails")
                {
                    var stockDetails = (from stk in inventoryDbContext.Stock
                                        join gritm in inventoryDbContext.GoodsReceiptItems on stk.GoodsReceiptItemId equals gritm.GoodsReceiptItemId
                                        where (stk.ItemId == ItemId && stk.AvailableQuantity > 0)
                                        select new
                                        {
                                            BatchNo = stk.BatchNO,
                                            AvailQuantity = stk.AvailableQuantity,
                                            ItemRate = gritm.ItemRate,
                                            ExpiryDate = stk.ExpiryDate
                                        }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = stockDetails;
                }
                #endregion
                #region GET: Stock > get list of StockManage by ItemId
                else if (reqType == "stockManage")
                {
                    var stockManage = (from stk in inventoryDbContext.Stock
                                       where (stk.ItemId == ItemId && stk.AvailableQuantity > 0)
                                       select new
                                       {
                                           StockId = stk.StockId,
                                           BatchNo = stk.BatchNO,
                                           curQuantity = stk.AvailableQuantity,
                                           ModQuantity = stk.AvailableQuantity,
                                           ReceivedQty = stk.ReceivedQuantity
                                       }).ToList();
                    var stockZeroManage = (from stk in inventoryDbContext.Stock
                                           where (stk.ItemId == ItemId && stk.AvailableQuantity == 0)
                                           select new
                                           {
                                               StockId = stk.StockId,
                                               BatchNo = stk.BatchNO,
                                               curQuantity = stk.AvailableQuantity,
                                               ModQuantity = stk.AvailableQuantity,
                                               ReceivedQty = stk.ReceivedQuantity
                                           }).ToList();
                    var stock = new { stockDetails = stockManage, zeroStockDetails = stockZeroManage };
                    responseData.Status = "OK";
                    responseData.Results = stock;
                }
                #endregion
                #region GET: Internal -> get itemlist by vendor id for ReturnToVendor
                else if (reqType == "itemListbyVendorId")
                {
                    var itembatchList = (from stk in inventoryDbContext.Stock
                                         join itm in inventoryDbContext.Items on stk.ItemId equals itm.ItemId
                                         join gritms in inventoryDbContext.GoodsReceiptItems on stk.GoodsReceiptItemId equals gritms.GoodsReceiptItemId
                                         join gr in inventoryDbContext.GoodsReceipts on gritms.GoodsReceiptId equals gr.GoodsReceiptID
                                         join vndr in inventoryDbContext.Vendors on gr.VendorId equals vndr.VendorId
                                         where (vndr.VendorId == vendorId && stk.AvailableQuantity > 0)
                                         group new { stk, itm, gritms, gr, vndr } by new
                                         {
                                             itm.ItemId,
                                             itm.ItemName,
                                             itm.VAT
                                         } into s
                                         select new ReturnToVendorItemsVM
                                         {
                                             ItemId = s.Key.ItemId,
                                             ItemName = s.Key.ItemName,
                                             VAT = s.Key.VAT,
                                             BatchDetails = s.Select(a => new ReturnToVendorItemsVM.BatchDetail
                                             {
                                                 BatchNo = a.stk.BatchNO,
                                                 AvailQty = a.stk.AvailableQuantity,
                                                 ItemRate = a.gritms.ItemRate,
                                                 StockId = a.stk.StockId,
                                                 GRId = a.gritms.GoodsReceiptItemId,
                                                 GoodsReceiptId = a.gr.GoodsReceiptID
                                             }).ToList(),
                                         }).ToList();
                    var vendorDetail = (from vndr in inventoryDbContext.Vendors
                                        where vndr.VendorId == vendorId
                                        select new
                                        {
                                            ContactAddress = vndr.ContactAddress,
                                            ContactNo = vndr.ContactNo
                                        }).FirstOrDefault();

                    var result = new { vendorDetail = vendorDetail, itemBatchList = itembatchList };
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region //Get Stock Record by ItemId and AvailableQuantity> 0 for WriteOff
                //Only need BatchNO, Sum(AvailableQuantity) 
                else if (reqType != null && reqType.ToLower() == "getbatchnobyitemid")
                {
                    var batchNOsByItemId = (from stk in inventoryDbContext.Stock
                                            join gritms in inventoryDbContext.GoodsReceiptItems on stk.GoodsReceiptItemId equals gritms.GoodsReceiptItemId
                                            where stk.AvailableQuantity > 0 && stk.ItemId == ItemId
                                            group stk by new { stk.BatchNO, gritms.ItemRate } into stockItems
                                            select new
                                            {
                                                //BatchNo = stockItems.Key.BatchNO == null || stockItems.Key.BatchNO==string.Empty ? "NA" : stockItems.Key.BatchNO,                                                                                                                                             
                                                BatchNo = string.IsNullOrEmpty(stockItems.Key.BatchNO) ? "NA" : stockItems.Key.BatchNO,
                                                AvailableQuantity = stockItems.Sum(a => a.AvailableQuantity),
                                                ItemPrice = stockItems.Key.ItemRate
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
                                      //  join quolist in inventoryDbContext.Quotations on Req.
                                  where (Req.Status == "active" || Req.Status == "Finalised")
                                  select new
                                  {
                                      RequestedOn = Req.RequestedOn,
                                      RequestedBy = Req.RequestedBy,
                                      RequestedCloseOn = Req.RequestedCloseOn,
                                      Subject = Req.Subject,
                                      Description = Req.Description,
                                      ReqForQuotationId = Req.ReqForQuotationId,
                                      Status = Req.Status,


                                  }).ToList();
                    responseData.Results = result;
                }
                #endregion
                else if (reqType != null && reqType.ToLower() == "get-req-for-quotation-items")
                {
                    if (ReqForQuotationItemById != 0)
                    {
                        var result = (from ReqItem in inventoryDbContext.ReqForQuotationItems
                                          //join Req in inventoryDbContext.ReqForQuotations on ReqItem.ReqForQuotationId equals Req.ReqForQuotationId
                                      where ReqItem.ReqForQuotationId == ReqForQuotationItemById
                                      select new
                                      {
                                          Description = ReqItem.Description,
                                          ReqForQuotationItemId = ReqItem.ReqForQuotationItemId,
                                          CreatedBy = ReqItem.CreatedBy,
                                          CreatedOn = ReqItem.CreatedOn,
                                          ItemName = ReqItem.ItemName,
                                          Quantity = ReqItem.Quantity,

                                      }).ToList();
                        responseData.Results = result;
                    }

                }
                else if (reqType != null && reqType.ToLower() == "rfqitemslist")
                {
                    var result = (from ReqItem in inventoryDbContext.ReqForQuotationItems
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

                else if (reqType != null && reqType.ToLower() == "get-quotation-list")
                {
                    if (ReqForQuotationId != 0)
                    {

                        var result = (from quoList in inventoryDbContext.Quotations
                                      join req in inventoryDbContext.ReqForQuotation on quoList.ReqForQuotationId equals req.ReqForQuotationId
                                      where (quoList.ReqForQuotationId == ReqForQuotationId && quoList.Status == "active")
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

                else if (reqType != null && reqType.ToLower() == "get-view-files-list")
                {
                    if (vendorId != 0)
                    {
                        var result = (from quoFiles in inventoryDbContext.quotationUploadedFiles
                                      where (quoFiles.VendorId == vendorId)
                                      select new
                                      {
                                          VendorId = quoFiles.VendorId,
                                          Description = quoFiles.Description,
                                          FileBinaryData = quoFiles.FileBinaryData,
                                          FileExtention = quoFiles.FileExtention,
                                          FileName = quoFiles.FileName,
                                          FileNo = quoFiles.FileNo,
                                          FileType = quoFiles.FileType,
                                          QuotationUploadedFileId = quoFiles.QuotationUploadedFileId,
                                          UpLoadedBy = quoFiles.UpLoadedBy,
                                          UpLoadedOn = quoFiles.UpLoadedOn,

                                      }).ToList();
                        responseData.Results = result;
                    }
                }

                else if (reqType != null && reqType.ToLower() == "get-quotation-items-list")
                {
                    if (vendorId != 0)
                    {
                        var result = (from quoItm in inventoryDbContext.QuotationItems
                                      where (quoItm.VendorId == vendorId)
                                      select new
                                      {
                                          VendorId = quoItm.VendorId,
                                          Description = quoItm.Description,
                                          Price = quoItm.Price,
                                          ItemName = quoItm.ItemName,
                                          ItemId = quoItm.ItemId,
                                          QuotationId = quoItm.QuotationId,
                                          QuotationItemId = quoItm.QuotationItemId,

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
                    var Quote = (from Quot in inventoryDbContext.Quotations
                                 join quotItem in inventoryDbContext.QuotationItems on Quot.QuotationId equals quotItem.QuotationId
                                 where Quot.ReqForQuotationId == ReqForQuotationItemById
                                 select new
                                 {
                                     Quot.VendorId,
                                     Quot.ReqForQuotationId,
                                     Quot.VendorName,
                                     quotItem.ItemId,
                                     quotItem.ItemName,
                                     quotItem.Price
                                 }
                                 ).ToList();
                    var result = new
                    {
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
                                        Vendordetails = x.Select(a => new { a.q.VendorName, a.q.Price }).ToList(),
                                    }).ToList(),
                        TotalAmount = (from q in Quote
                                       group new { q }
                                       by new { q.VendorId }
                                       into x
                                       select new
                                       {
                                           Vendor = x.Select(a => a.q.VendorName).FirstOrDefault(),
                                           Totalamount = x.Select(a => a.q.Price).Sum(),
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

                                      }).ToList();
                        responseData.Results = result;
                    }
                }

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
                #region//this for saving the PO and POitems
                if (reqType != null && reqType == "PurchaseOrder")
                {
                    string Str = this.ReadPostData();
                    PurchaseOrderModel poFromClient = DanpheJSONConvert.DeserializeObject<PurchaseOrderModel>(Str);
                    if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
                    {
                        poFromClient.PurchaseOrderItems.ForEach(item =>
                        {
                            item.CreatedOn = DateTime.Now;
                            //remove it when Maker-Checker concept is added.
                            //and get the actual authorizedon value when it's authorized.<sudarshan:20Jun'17>
                            item.AuthorizedOn = DateTime.Now;
                        });
                        poFromClient.CreatedOn = DateTime.Now;
                        if (poFromClient.PoDate == null)
                        {
                            poFromClient.PoDate = DateTime.Now;
                        }
                        inventoryDbContext.PurchaseOrders.Add(poFromClient);
                        inventoryDbContext.SaveChanges();
                        responseData.Results = poFromClient.PurchaseOrderId;
                    }
                }
                #endregion

                #region this for editing the PO and POitems
                if (reqType != null && reqType == "UpdatePurchaseOrder")
                {
                    string Str = this.ReadPostData();
                    PurchaseOrderModel poFromClient = DanpheJSONConvert.DeserializeObject<PurchaseOrderModel>(Str);
                    if (poFromClient != null && poFromClient.PurchaseOrderItems != null && poFromClient.PurchaseOrderItems.Count > 0)
                    {
                        using (var dbTransaction = inventoryDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                inventoryDbContext.PurchaseOrders.Attach(poFromClient);
                                inventoryDbContext.Entry(poFromClient).State = EntityState.Modified;
                                inventoryDbContext.Entry(poFromClient).Property(x => x.CreatedOn).IsModified = false;
                                inventoryDbContext.Entry(poFromClient).Property(x => x.CreatedBy).IsModified = false;
                                inventoryDbContext.Entry(poFromClient).Property(x => x.VendorId).IsModified = false;
                                inventoryDbContext.SaveChanges();
                                poFromClient.PurchaseOrderItems.ForEach(itm =>
                                {
                                    inventoryDbContext.PurchaseOrderItems.Attach(itm);
                                    inventoryDbContext.Entry(itm).State = EntityState.Modified;
                                    inventoryDbContext.Entry(itm).Property(x => x.PurchaseOrderId).IsModified = false;
                                    inventoryDbContext.Entry(itm).Property(x => x.AuthorizedOn).IsModified = false;
                                    inventoryDbContext.Entry(itm).Property(x => x.AuthorizedBy).IsModified = false;
                                    inventoryDbContext.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                                    inventoryDbContext.Entry(itm).Property(x => x.CreatedBy).IsModified = false;
                                    inventoryDbContext.SaveChanges();
                                });
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
                if (reqType != null && reqType == "ReqForQuotation")
                {
                    string Str = this.ReadPostData();
                    RequestForQuotation reqForQuotation = DanpheJSONConvert.DeserializeObject<RequestForQuotation>(Str);
                    if (reqForQuotation != null && reqForQuotation.ReqForQuotationItems != null && reqForQuotation.ReqForQuotationItems.Count > 0)
                    {
                        reqForQuotation.ReqForQuotationItems.ForEach(item =>
                        {
                            item.CreatedOn = DateTime.Now;
                        });
                        reqForQuotation.CreatedOn = DateTime.Now;
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

                    string Str = this.ReadPostData();
                    Quotation quotationDataFromClient = DanpheJSONConvert.DeserializeObject<Quotation>(Str);
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");



                    if (quotationDataFromClient.QuotationId == 0)
                    {
                        quotationDataFromClient.quotationItems.ForEach(item =>
                        {
                            item.UpLoadedOn = DateTime.Now;
                            item.UpLoadedBy = currentUser.EmployeeId;


                        });
                        quotationDataFromClient.CreatedOn = DateTime.Now;
                        quotationDataFromClient.CreatedBy = currentUser.EmployeeId;
                        inventoryDbContext.Quotations.Add(quotationDataFromClient);
                        inventoryDbContext.SaveChanges();
                    }
                    else
                    {
                        var qlItmAdded = quotationDataFromClient.quotationItems.Where(a => a.IsAdded == false && a.IsDeleted == null).ToList();

                        foreach (var itm in qlItmAdded)
                        {
                            var quoItem = (from quo in inventoryDbContext.QuotationItems
                                           where quo.QuotationItemId == itm.QuotationItemId
                                           select quo).FirstOrDefault();
                            if (quoItem != null)
                            {
                                quoItem.Price = itm.Price;
                                quoItem.Description = itm.Description;
                                quoItem.ItemName = itm.ItemName;
                                quoItem.ModifiedBy = currentUser.EmployeeId;
                                quoItem.ModifiedOn = DateTime.Now;
                                inventoryDbContext.Entry(quoItem).State = EntityState.Modified;
                            }
                        }
                        inventoryDbContext.SaveChanges();


                        var insertQItemList = quotationDataFromClient.quotationItems.Where(i => i.IsAdded == null && i.IsDeleted == null).ToList();
                        insertQItemList.ForEach(item =>
                        {
                            item.UpLoadedOn = DateTime.Now;
                            item.UpLoadedBy = currentUser.EmployeeId;
                            inventoryDbContext.QuotationItems.Add(item);
                        });
                        inventoryDbContext.SaveChanges();


                    }
                    responseData.Results = null;
                    responseData.Status = "OK";
                }

                #region POST Goods Receipt and Goods Receipt Items with Stock Entry and PO,POItems status updation
                else if
                    (reqType != null && reqType.ToLower() == "goodsreceipt")

                {
                    string Str = this.ReadPostData();
                    GoodsReceiptModel GoodsReceiptFromClient = DanpheJSONConvert.
                        DeserializeObject<GoodsReceiptModel>(Str);

                    GoodsReceiptFromClient.GoodsReceiptItem.ForEach(item =>
                    {
                        item.CreatedOn = DateTime.Now;  //Assign Today's date as CreatedOn
                        inventoryDbContext.GoodsReceiptItems.Add(item);

                    });
                    GoodsReceiptFromClient.CreatedOn = DateTime.Now;
                    inventoryDbContext.GoodsReceipts.Add(GoodsReceiptFromClient);

                    //Save Goods Receipt to DB
                    inventoryDbContext.SaveChanges();


                    StockModel stockItem = new StockModel();
                    //If GR generated then save items in  Stock table
                    int SavedGoodsReceiptId = GoodsReceiptFromClient.GoodsReceiptID;
                    if (SavedGoodsReceiptId > 0)
                    {

                        GoodsReceiptFromClient.GoodsReceiptItem.ForEach(item =>
                        {
                            stockItem = new StockModel();
                            stockItem.GoodsReceiptItemId = item.GoodsReceiptItemId;
                            stockItem.ItemId = item.ItemId;
                            stockItem.BatchNO = item.BatchNO;
                            stockItem.ExpiryDate = item.ExpiryDate;
                            stockItem.ReceivedQuantity = item.ReceivedQuantity;
                            stockItem.AvailableQuantity = item.ReceivedQuantity;
                            stockItem.ReceiptDate = GoodsReceiptFromClient.GoodsReceiptDate;
                            stockItem.CreatedBy = item.CreatedBy;
                            stockItem.CreatedOn = item.CreatedOn;
                            inventoryDbContext.Stock.Add(stockItem);
                        });
                        //Save => Stock Items in stock table
                        inventoryDbContext.SaveChanges();
                    }
                    responseData.Results = stockItem.StockId;
                    // responseData.Results = GoodsReceiptFromClient.GoodsReceiptID;
                }
                #endregion

                #region Post(save) Dispatched Items to database
                else if (reqType != null && reqType.ToLower() == "dispatchitems")
                {
                    string Str = this.ReadPostData();
                    RequisitionStockVM requisitionStockVMFromClient = DanpheJSONConvert.DeserializeObject<RequisitionStockVM>(Str);

                    if (requisitionStockVMFromClient.dispatchItems != null && requisitionStockVMFromClient.dispatchItems.Count > 0)
                    {
                        Boolean Flag = false;
                        Flag = InventoryBL.DispatchItemsTransaction(requisitionStockVMFromClient, inventoryDbContext);
                        if (Flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Dispatch Items is null";
                        responseData.Status = "Failed";
                    }
                }
                #endregion

                #region Post(save) Dispatched Items to database (DISPATCH-ALL)
                else if (reqType != null && reqType.ToLower() == "dispatchallitems")
                {
                    string Str = this.ReadPostData();
                    RequisitionsStockVM requisitionsStockVMFromClient = DanpheJSONConvert.DeserializeObject<RequisitionsStockVM>(Str);

                    if (requisitionsStockVMFromClient.dispatchItems != null && requisitionsStockVMFromClient.dispatchItems.Count > 0)
                    {
                        Boolean Flag = false;
                        Flag = InventoryBL.DispatchAllTransaction(requisitionsStockVMFromClient, inventoryDbContext);
                        if (Flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
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
                        flag = InventoryBL.WriteOffItemsTransaction(writeItemsFromClient, inventoryDbContext);
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
                    List<ReturnToVendorItemsModel> retrnToVendor = DanpheJSONConvert.DeserializeObject<List<ReturnToVendorItemsModel>>(Str);

                    if (retrnToVendor != null)
                    {
                        ////setting Flag for checking whole transaction of ReturnToVendorTransaction
                        Boolean flag = false;
                        flag = InventoryBL.ReturnToVendorTransaction(retrnToVendor, inventoryDbContext);
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

                    //giving List Of RequisitionItems to requItemsFromClient because we have save the requisition and RequisitionItems One by one ..
                    //first the requisition is saved  after that we have to take the requisitionid and give the requisitionid  to the RequisitionItems ..and then we can save the RequisitionItems
                    requisitionItems = RequisitionFromClient.RequisitionItems;

                    //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
                    RequisitionFromClient.RequisitionItems = null;

                    //asigining the value to POFromClient with POitems= null
                    requisition = RequisitionFromClient;
                    requisition.CreatedOn = DateTime.Now;
                    if (requisition.RequisitionDate == null)
                    {
                        requisition.RequisitionDate = DateTime.Now;
                    }
                    inventoryDbContext.Requisitions.Add(requisition);

                    //this is for requisition only
                    inventoryDbContext.SaveChanges();

                    //getting the lastest RequistionId 
                    int lastRequId = requisition.RequisitionId;

                    //assiging the RequisitionId and CreatedOn i requisitionitem list
                    requisitionItems.ForEach(item =>
                    {
                        item.RequisitionId = lastRequId;
                        item.CreatedOn = DateTime.Now;
                        item.AuthorizedOn = DateTime.Now;
                        item.PendingQuantity = (double)item.Quantity;
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


        // PUT api/values/5
        [HttpPut]
        public string Put()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
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
                #region PUT : Stock Manage
                else if (reqType == "stockManage")
                {
                    List<StockModel> stkData = DanpheJSONConvert.DeserializeObject<List<StockModel>>(str);
                    //stkData.ForEach(a=> a)

                    stkData.ForEach(item =>
                    {
                        inventorygDbContext.Stock.Attach(item);
                        inventorygDbContext.Entry(item).Property(x => x.AvailableQuantity).IsModified = true;
                    });
                    inventorygDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                #endregion
                #region PUT: Update selected vendor for PO and request of Quotation
                else if (reqType == "SelectedVendorforPO")
                {
                    Quotation quotData = DanpheJSONConvert.DeserializeObject<Quotation>(str);
                    int reqId = quotData.ReqForQuotationId;
                    int vendor = quotData.VendorId;
                    RequestForQuotation req = inventorygDbContext.ReqForQuotation.Where(a => a.ReqForQuotationId == reqId).FirstOrDefault<RequestForQuotation>();
                    if (req != null)
                    {
                        req.Status = "Finalised";
                        req.RequestedCloseOn = DateTime.Now;
                        inventorygDbContext.Entry(req).State = EntityState.Modified;
                    }
                    Quotation quot = inventorygDbContext.Quotations.Where(a => (a.ReqForQuotationId == reqId && a.VendorId == vendor)).FirstOrDefault<Quotation>();
                    if (quot != null)
                    {
                        quot.Status = "selected";
                        inventorygDbContext.Entry(quot).State = EntityState.Modified;
                    }
                    inventorygDbContext.SaveChanges();
                    responseData.Status = "OK";

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

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
