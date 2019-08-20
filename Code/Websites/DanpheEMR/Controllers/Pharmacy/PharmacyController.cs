using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.Utilities;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using System.Data.SqlClient;
using DanpheEMR.Security;
using System.Data;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using Newtonsoft.Json.Linq;
using System.Xml;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ServerModel.ReportingModels;
using System.Net;
using System.Collections.Specialized;
using System.Text;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class PharmacyController : CommonController
    {
        
        public PharmacyController(IOptions<MyConfiguration> _config) : base(_config)
        {
        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType, int supplierId, int itemTypeId, int companyId, int categoryId, string status, int purchaseOrderId, int goodsReceiptId, int itemId, string batchNo, int returnToSupplierId, int invoiceId, int writeOffId, int employeeId, int? patientId, int providerId, int visitId, bool IsOutdoorPat, int requisitionId, DateTime currentDate, DateTime FromDate, DateTime ToDate, int FiscalYearId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            PatientDbContext patientDbContext = new PatientDbContext(connString);

            try
            {
                #region GET: setting-supplier manage : list of suppliers
                if (reqType == "supplier")
                {
                    var test = phrmdbcontext.PHRMInvoiceTransactionItems;
                    var supplierList = phrmdbcontext.PHRMSupplier.AsEnumerable()
                        .ToList().Where(x => x.IsActive == true);
                    responseData.Status = "OK";
                    responseData.Results = supplierList;
                }
                #endregion

                else if (reqType == "getCounter")
                {
                    var getCounter = (from counter in phrmdbcontext.PHRMCounters
                                      select counter
                                      ).ToList<PHRMCounter>().OrderBy(b => b.CounterId);
                    responseData.Status = "OK";
                    responseData.Results = getCounter;
                }

                else if (reqType == "allSaleRecord")
                {
                    var currentdate = currentDate;
                    var TomorrowDate = currentDate.AddDays(1);
                    var invData = phrmdbcontext.PHRMInvoiceTransaction.ToList();
                    var invRetData = phrmdbcontext.PHRMInvoiceReturnItemsModel.ToList();
                    var depositData = phrmdbcontext.DepositModel.ToList();
                    #region Usewise Sales
                    var getUserSales = invData.Where(a => a.CreateOn > currentdate && a.CreateOn < TomorrowDate).
                        GroupBy(a => new { a.CreatedBy }).Select(g => new UserCollectionViewModel
                        {
                            UserId = g.Key.CreatedBy.Value,
                            UserSale = g.Sum(s => s.TotalAmount).Value
                        }).GroupJoin(masterDbContext.Employees.ToList(), a => a.UserId, b => b.EmployeeId, (a, b) => new UserCollectionViewModel
                        {
                            UserId = a.UserId,
                            UserSale = a.UserSale,
                            UserName = b.Select(s => s.FullName).FirstOrDefault(),

                        });
                    //to calculate return amount
                    var getUserSaleRet = invRetData.ToList().Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.InvoiceId != null)
                        .GroupBy(a => new { a.CreatedBy }).Select(g => new UserCollectionViewModel
                        {
                            UserId = g.Key.CreatedBy.Value,
                            UserSale = g.Sum(s => s.TotalAmount).Value
                        }).GroupJoin(masterDbContext.Employees.ToList(), a => a.UserId, b => b.EmployeeId, (a, b) => new UserCollectionViewModel
                        {
                            UserId = a.UserId,
                            UserSale = a.UserSale,
                            UserName = b.Select(s => s.FullName).FirstOrDefault(),

                        }
                        );
                    var netSales = getUserSales.GroupJoin(getUserSaleRet, a => a.UserId, b => b.UserId, (a, b) => new UserCollectionViewModel
                    {
                        UserSale = a.UserSale - b.Select(s => s.UserSale).FirstOrDefault(),
                        UserId = a.UserId,
                        UserName = a.UserName,
                    });
                    #endregion

                    #region Counter Sales
                    var getCounterSales = invData.Where(a => (a.CreateOn > currentdate) && (a.CreateOn < TomorrowDate) && (a.CounterId != null)).
                        GroupBy(a => new { a.CounterId }).Select(g => new CounterCollectionViewModel
                        {
                            CounterId = g.Key.CounterId.Value,
                            CounterSale = g.Sum(s => s.TotalAmount).Value
                        }).GroupJoin(phrmdbcontext.PHRMCounters.ToList(), a => a.CounterId, b => b.CounterId, (a, b) => new CounterCollectionViewModel
                        {
                            CounterId = a.CounterId,
                            CounterSale = a.CounterSale,
                            CounterName = b.Select(s => s.CounterName).FirstOrDefault(),

                        });
                    //to calculate return amount
                    var getCounterSaleRet = invRetData.ToList().Where(a => (a.CreatedOn > currentdate) && (a.CreatedOn < TomorrowDate) && (a.CounterId != null) && a.InvoiceId != null)
                        .GroupBy(a => new { a.CounterId }).Select(g => new CounterCollectionViewModel
                        {
                            CounterId = g.Key.CounterId.Value,
                            CounterSale = g.Sum(s => s.TotalAmount).Value
                        }).GroupJoin(phrmdbcontext.PHRMCounters.ToList(), a => a.CounterId, b => b.CounterId, (a, b) => new CounterCollectionViewModel
                        {
                            CounterId = a.CounterId,
                            CounterSale = a.CounterSale,
                            CounterName = b.Select(s => s.CounterName).FirstOrDefault(),
                        }
                        );
                    var netCounterSales = getCounterSales.GroupJoin(getCounterSaleRet, a => a.CounterId, b => b.CounterId, (a, b) => new CounterCollectionViewModel
                    {
                        CounterSale = a.CounterSale - b.Select(s => s.CounterSale).FirstOrDefault(),
                        CounterId = a.CounterId,
                        CounterName = a.CounterName,
                    });
                    #endregion

                    TotalCollectionViewModel allRecords = new TotalCollectionViewModel();

                    allRecords.TotalSale = invData.Where(a => a.CreateOn > currentdate && a.CreateOn < TomorrowDate).Sum(s => s.TotalAmount).Value;
                    allRecords.TotalReturn = invRetData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.InvoiceId != null).Sum(s => s.TotalAmount).Value;
                    allRecords.NetSale = allRecords.TotalSale - allRecords.TotalReturn;
                    allRecords.TotalDeposit = depositData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.DepositType == "deposit").Sum(s => s.DepositAmount).Value;
                    allRecords.DepositReturned = depositData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.DepositType == "depositreturn").Sum(s => s.DepositAmount).Value;

                    allRecords.UserCollection = netSales;
                    allRecords.CounterCollection = netCounterSales;
                    responseData.Status = "OK";
                    responseData.Results = allRecords;

                }
                else if (reqType == "phrm-pending-bills")
                {
                    decimal? provisionalTotal = phrmdbcontext.PHRMInvoiceTransactionItems
                        .Where(itm => itm.BilItemStatus == "provisional").Sum(itm => itm.TotalAmount);
                    decimal? creditTotAmt = phrmdbcontext.PHRMInvoiceTransaction
                    .Where(txn => txn.BilStatus == "unpaid").Sum(txn => txn.TotalAmount);

                    var retObject = new
                    {
                        TotalProvisional = provisionalTotal,
                        TotalCredits = creditTotAmt

                    };

                    responseData.Results = retObject;
                    responseData.Status = "OK";
                }
                else if (reqType == "counterSales")
                {
                    var getCounterSales = (from counter in phrmdbcontext.PHRMCounters
                                           select counter
                                      ).ToList<PHRMCounter>().OrderBy(b => b.CounterId);
                    responseData.Status = "OK";
                    responseData.Results = getCounterSales;
                }
                #region getting Supplier details according the supplierId
                else if (reqType == "SupplierDetails")
                {
                    List<PHRMSupplierModel> supplierDetails = new List<PHRMSupplierModel>();
                    supplierDetails = (from supplier in phrmdbcontext.PHRMSupplier
                                       where supplier.SupplierId == supplierId
                                       select supplier).ToList();
                    responseData.Status = "OK";
                    responseData.Results = supplierDetails;
                }
                #endregion
                #region GET: itemtypelist in setting-itemtype manage and in create new order
                else if (reqType == "itemtype")
                {
                    var itemtypeList = (from itmtype in phrmdbcontext.PHRMItemType
                                        join categry in phrmdbcontext.PHRMCategory on itmtype.CategoryId equals categry.CategoryId
                                        select new
                                        {
                                            ItemTypeId = itmtype.ItemTypeId,
                                            CategoryId = itmtype.CategoryId,
                                            ItemTypeName = itmtype.ItemTypeName,
                                            CategoryName = categry.CategoryName,
                                            Description = itmtype.Description,
                                            IsActive = itmtype.IsActive
                                        }).ToList().OrderBy(a => a.ItemTypeId);
                    responseData.Status = "OK";
                    responseData.Results = itemtypeList;
                }
                #endregion
                #region GET: setting-item manage : list of items
                else if (reqType == "item")
                {
                    var itemList = (from itm in phrmdbcontext.PHRMItemMaster
                                    join compny in phrmdbcontext.PHRMCompany on itm.CompanyId equals compny.CompanyId
                                    join itmtype in phrmdbcontext.PHRMItemType on itm.ItemTypeId equals itmtype.ItemTypeId
                                    join catType in phrmdbcontext.PHRMCategory on itmtype.CategoryId equals catType.CategoryId
                                    join unit in phrmdbcontext.PHRMUnitOfMeasurement on itm.UOMId equals unit.UOMId
                                    join generic in phrmdbcontext.PHRMGenericModel on itm.GenericId equals generic.GenericId
                                    join itmsmaster in phrmdbcontext.PHRMItemMaster on itm.ItemId equals itmsmaster.ItemId
                                    join rack in phrmdbcontext.PHRMRack on itmsmaster.Rack equals rack.RackId
                                    into items
                                    from itemrack in items.DefaultIfEmpty()
                                        //NBB-removed supplier id from item master table
                                        //join suplier in phrmdbcontext.PHRMSupplier on itm.SupplierId equals suplier.SupplierId
                                    select new
                                    {
                                        itm.ItemId,
                                        itm.ItemName,
                                        itm.ItemCode,
                                        itm.CompanyId,
                                        compny.CompanyName,
                                        itm.ItemTypeId,
                                        itmtype.ItemTypeName,
                                        itm.UOMId,
                                        unit.UOMName,
                                        itm.ReOrderQuantity,
                                        itm.MinStockQuantity,
                                        itm.BudgetedQuantity,
                                        itm.VATPercentage,
                                        itm.IsVATApplicable,
                                        itm.IsActive,
                                        itm.IsInternationalBrand,
                                        itm.GenericId,
                                        itm.ABCCategory,
                                        itm.Dosage,
                                        generic.GenericName,
                                        catType.CategoryName,
                                        RackName = itemrack.Name
                                    }).ToList().OrderBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                #endregion
                #region GET: setting-tax manage : list of tax
                else if (reqType == "tax")
                {
                    var taxList = phrmdbcontext.PHRMTAX.ToList();
                    responseData.Status = "OK";
                    responseData.Results = taxList;
                }
                #endregion
                #region Get ItemList by ItemType
                else if (reqType == "GetAllItems")
                {
                    var itemList = phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive).ToList();

                    //var itemList1 = phrmdbcontext.PHRMItemMaster.Where(a=>a.IsActive && !a.IsVATApplicable);
                    //var itmList = (from ItemList in phrmdbcontext.PHRMItemMaster
                    //               join itemtype in phrmdbcontext.PHRMItemType on ItemList.ItemTypeId equals itemtype.ItemTypeId
                    //               where ItemList.IsActive == true && ItemList.ItemTypeId == itemTypeId ////tis and condition is for selecting itemlist on the basis of ItemType selected by End-User  
                    //               select new
                    //               {
                    //                   ItemId = ItemList.ItemId,
                    //                   ItemName = ItemList.ItemName,
                    //                   CompanyId = ItemList.CompanyId,
                    //                   MinStockQuantity = ItemList.MinStockQuantity,
                    //                   ReOrderQuantity = ItemList.ReOrderQuantity,
                    //                   SellingPrice = ItemList.SellingPrice,
                    //                   StandardPrice = ItemList.StandardPrice,
                    //                   //SupplierId = ItemList.SupplierId,
                    //                   UOMId = ItemList.UOMId,
                    //                   VATPercentage = ItemList.VATPercentage,
                    //                   BudgetedQuantity = ItemList.BudgetedQuantity,
                    //                   ItemCode = ItemList.ItemCode,
                    //                   IsVATApplicable = ItemList.IsVATApplicable
                    //               }).ToList().OrderBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                #endregion
                #region Get: All Item List
                else if (reqType == "GetItemListByItemTypeId")
                {
                    var itmList = (from ItemList in phrmdbcontext.PHRMItemMaster
                                   join itemtype in phrmdbcontext.PHRMItemType on ItemList.ItemTypeId equals itemtype.ItemTypeId
                                   where ItemList.IsActive == true && ItemList.ItemTypeId == itemTypeId ////tis and condition is for selecting itemlist on the basis of ItemType selected by End-User  
                                   select new
                                   {
                                       ItemId = ItemList.ItemId,
                                       ItemName = ItemList.ItemName,
                                       CompanyId = ItemList.CompanyId,
                                       MinStockQuantity = ItemList.MinStockQuantity,
                                       ReOrderQuantity = ItemList.ReOrderQuantity,
                                       //SupplierId = ItemList.SupplierId,
                                       UOMId = ItemList.UOMId,
                                       VATPercentage = ItemList.VATPercentage,
                                       BudgetedQuantity = ItemList.BudgetedQuantity,
                                       ItemCode = ItemList.ItemCode,
                                       IsVATApplicable = ItemList.IsVATApplicable
                                   }).ToList().OrderBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itmList;
                }
                #endregion
                #region GET: setting-company manage : list of companies
                else if (reqType == "company")
                {
                    var companyList = phrmdbcontext.PHRMCompany.ToList();
                    responseData.Status = "OK";
                    responseData.Results = companyList;
                }
                #endregion

                #region GET: setting-category manage : list of categories
                else if (reqType == "category")
                {
                    var categoryList = phrmdbcontext.PHRMCategory.ToList();
                    responseData.Status = "OK";
                    responseData.Results = categoryList;
                }
                #endregion
                #region GET: setting-unitofmeasurement manage : list of unit of measurements
                else if (reqType == "unitofmeasurement")
                {
                    var unitofmeasurementList = phrmdbcontext.PHRMUnitOfMeasurement.ToList();
                    responseData.Status = "OK";
                    responseData.Results = unitofmeasurementList;
                }
                #endregion
                #region GET: Order->OrderList: Getting List of All Purchase Order Generated Against Supplier
                else if (reqType == "getPHRMOrderList")
                {
                    //in status there is comma seperated values so we are splitting status by using  comma(,)
                    // this all we have do because we have to check multiple status at one call
                    //like when user select all we have to we get all PO by matching the status like complete,active,partial and initiated...
                    string[] poSelectedStatus = status.Split(',');

                    var purchaseOrderList = (from po in phrmdbcontext.PHRMPurchaseOrder
                                             join supp in phrmdbcontext.PHRMSupplier on po.SupplierId equals supp.SupplierId
                                             join stats in poSelectedStatus on po.POStatus equals stats
                                             orderby po.PODate descending
                                             select new
                                             {
                                                 PurchaseOrderId = po.PurchaseOrderId,
                                                 SupplierId = po.SupplierId,
                                                 PODate = po.PODate,
                                                 POStatus = po.POStatus,
                                                 SubTotal = po.SubTotal,
                                                 TotalAmount = po.TotalAmount,
                                                 VATAmount = po.VATAmount,
                                                 SupplierName = supp.SupplierName,
                                                 ContactNo = supp.ContactNo,
                                                 ContactAddress = supp.ContactAddress,
                                                 Email = supp.Email,
                                                 City = supp.City,
                                                 Pin = supp.Pin
                                             }
                                            ).ToList();

                    responseData.Status = "OK";
                    responseData.Results = purchaseOrderList;
                }
                #endregion               
                #region GET: Order->OrderList: Getting POItemsList By POId
                else if (reqType == "getPHRMPOItemsByPOId")
                {
                    var poItemsList = (from poitem in phrmdbcontext.PHRMPurchaseOrderItems
                                       join itms in phrmdbcontext.PHRMItemMaster on poitem.ItemId equals itms.ItemId
                                       join po in phrmdbcontext.PHRMPurchaseOrder on poitem.PurchaseOrderId equals po.PurchaseOrderId
                                       join supplier in phrmdbcontext.PHRMSupplier on po.SupplierId equals supplier.SupplierId
                                       /// join company in phrmdbcontext.PHRMCompany on itms.CompanyId equals company.CompanyId
                                       /// join UOM in phrmdbcontext.PHRMUnitOfMeasurement on itms.UOMId equals UOM.UOMId

                                       where poitem.PurchaseOrderId == purchaseOrderId
                                       select new
                                       {
                                           ItemName = itms.ItemName,
                                           ItemId = itms.ItemId,
                                           VatPercentage = itms.VATPercentage,
                                           Quantity = poitem.Quantity,

                                           StandaredPrice = poitem.StandaredPrice,
                                           SubTotal = poitem.SubTotal,
                                           VATAmount = poitem.VATAmount,
                                           TotalAmount = poitem.TotalAmount,
                                           Remarks = poitem.Remarks,
                                           PurchaseOrderId = poitem.PurchaseOrderId,
                                           POItemStatus = poitem.POItemStatus,
                                           DeliveryDays = poitem.DeliveryDays,
                                           ReceivedQuantity = poitem.ReceivedQuantity,
                                           PendingQuantity = poitem.PendingQuantity,
                                           //PODate = po.PODate,
                                           SupplierId = supplier.SupplierId,
                                           SupplierName = supplier.SupplierName,
                                           Pin = supplier.Pin,
                                           Email = supplier.Email,
                                           ContactNo = supplier.ContactNo,
                                           ContactAddress = supplier.ContactAddress,
                                           City = supplier.City,
                                           /// CompanyName = company.CompanyName,
                                           /// UOMName = UOM.UOMName

                                       }
                                ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = poItemsList;
                }
                #endregion

                #region Get nusring drugs request details.
                else if (reqType == "get-provisional-items")
                {
                    var provisionalItems = (from pro in phrmdbcontext.DrugRequistion
                                            join pat in phrmdbcontext.PHRMPatient on pro.PatientId equals pat.PatientId
                                            where pro.Status == status
                                            select new
                                            {

                                                ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                ContactNo = pat.PhoneNumber,
                                                CreatedOn = pro.CreatedOn,
                                                Status = pro.Status,
                                                PatientId = pro.PatientId,
                                                RequisitionId = pro.RequisitionId,

                                            }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = provisionalItems;

                }
                else if (reqType == "get-all-provisional-items")
                {
                    var provisionalItems = (from pro in phrmdbcontext.DrugRequistion
                                            join pat in phrmdbcontext.PHRMPatient on pro.PatientId equals pat.PatientId
                                            orderby pro.RequisitionId descending
                                            select new
                                            {

                                                ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                ContactNo = pat.PhoneNumber,
                                                CreatedOn = pro.CreatedOn,
                                                Status = pro.Status,
                                                PatientId = pro.PatientId,
                                                RequisitionId = pro.RequisitionId,

                                            }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = provisionalItems;

                }
                #endregion

                #region ward requests by wards
                else if (reqType == "get-ward-requested-items")
                {

                    string[] poSelectedStatus = status.Split(',');
                    var wardReqList = (from wardReq in phrmdbcontext.WardRequisition
                                       join ward in phrmdbcontext.WardModel on wardReq.WardId equals ward.WardId
                                       join emp in phrmdbcontext.Employees on wardReq.CreatedBy equals emp.EmployeeId
                                       join stats in poSelectedStatus on wardReq.Status equals stats
                                       orderby wardReq.RequisitionId descending
                                       select new
                                       {
                                           WardName = ward.WardName,
                                           CreatedBy = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                           CreatedOn = wardReq.CreatedOn,
                                           Status = wardReq.Status,
                                           RequisitionId = wardReq.RequisitionId
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardReqList;
                }
                #endregion

                #region drugs request items by selected patient.
                else if (reqType == "get-drugs-request-items")
                {
                    var drugsItem = (from itm in phrmdbcontext.DrugRequistionItem
                                     join itmReq in phrmdbcontext.DrugRequistion on itm.RequisitionId equals itmReq.RequisitionId
                                     join itmName in phrmdbcontext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                                     where itm.RequisitionId == requisitionId
                                     select new
                                     {
                                         RequisitionItemId = itm.RequisitionItemId,
                                         RequisitionId = itm.RequisitionId,
                                         ItemId = itm.ItemId,
                                         Quantity = itm.Quantity,
                                         ItemName = itmName.ItemName,
                                         PatientId = itmReq.PatientId,
                                     }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = drugsItem;
                }
                #endregion
                #region get requsted drug-list by patientId and VisitId (used in Emergency) 
                else if (reqType == "get-all-drugs-order")
                {
                    var drugsItem = (from itm in phrmdbcontext.DrugRequistionItem
                                     join itmReq in phrmdbcontext.DrugRequistion on itm.RequisitionId equals itmReq.RequisitionId
                                     join itmName in phrmdbcontext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                                     where itmReq.PatientId == patientId && itmReq.VisitId == visitId
                                     select new
                                     {
                                         RequisitionItemId = itm.RequisitionItemId,
                                         RequisitionId = itm.RequisitionId,
                                         ItemId = itm.ItemId,
                                         Quantity = itm.Quantity,
                                         ItemName = itmName.ItemName,
                                         PatientId = itmReq.PatientId,
                                         PatientVisitId = itmReq.VisitId,
                                         Status = itmReq.Status,
                                         RequestedOn = itmReq.CreatedOn
                                     }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = drugsItem;
                }
                #endregion
                else if (reqType == "get-drugs-dispatch-items")
                {
                    var itm = (from phrmItm in phrmdbcontext.DrugRequistion
                               where phrmItm.RequisitionId == requisitionId
                               select phrmItm).FirstOrDefault();

                    if (itm.ReferenceId is null)
                    {
                        responseData.Results = null;
                    }
                    else
                    {
                        List<int> items = itm.ReferenceId.Split(',').Select(int.Parse).ToList();

                        var drugsItem = (from drugItems in phrmdbcontext.PHRMInvoiceTransactionItems
                                         join itmName in phrmdbcontext.PHRMItemMaster on drugItems.ItemId equals itmName.ItemId
                                         where items.Contains(drugItems.InvoiceItemId)
                                         select new
                                         {
                                             ItemId = drugItems.ItemId,
                                             Quantity = drugItems.Quantity,
                                             ItemName = itmName.ItemName,
                                         }).ToList();
                        responseData.Results = drugsItem;
                    }
                    responseData.Status = "OK";
                }

                #region GET: order-goods receipt grid : gets list of goodsreceipt
                else if (reqType == "goodsreceipt")
                {
                    var goodsReceiptList = (from gr in phrmdbcontext.PHRMGoodsReceipt
                                            join supp in phrmdbcontext.PHRMSupplier on gr.SupplierId equals supp.SupplierId
                                            orderby gr.CreatedOn descending
                                            // where gr.IsCancel==IsCancel
                                            select new
                                            {
                                                GoodReceiptId = gr.GoodReceiptId,
                                                GoodReceiptPrintId = gr.GoodReceiptPrintId,
                                                PurchaseOrderId = gr.PurchaseOrderId,
                                                InvoiceNo = gr.InvoiceNo,
                                                GoodReceiptDate = gr.GoodReceiptDate,
                                                CreatedOn = gr.CreatedOn,             //once GoodReceiptDate is been used replaced createdOn by GoodReceiptDate
                                                SubTotal = gr.SubTotal,
                                                DiscountAmount = gr.DiscountAmount,
                                                VATAmount = gr.VATAmount,
                                                TotalAmount = gr.TotalAmount,
                                                Remarks = gr.Remarks,
                                                SupplierName = supp.SupplierName,
                                                ContactNo = supp.ContactNo,
                                                City = supp.City,
                                                Pin = supp.Pin,
                                                ContactAddress = supp.ContactAddress,
                                                Email = supp.Email,
                                                IsCancel = gr.IsCancel,
                                                SupplierId = supp.SupplierId,
                                            }
                                            ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = goodsReceiptList;
                }
                #endregion
                #region GET: good receipt group by supplierID
                else if (reqType == "get-goods-receipt-groupby-supplier")
                {
                    var goodReceiptList = phrmdbcontext.PHRMGoodsReceipt.Where(a => a.IsCancel != null).ToList().GroupJoin(phrmdbcontext.PHRMSupplier.ToList(), a => a.SupplierId, b => b.SupplierId, (a, b) =>
                           new
                           {
                               SupplierId = a.SupplierId,
                               SubTotal = a.SubTotal,
                               DiscountAmount = a.DiscountAmount,
                               VATAmount = a.VATAmount,
                               TotalAmount = a.TotalAmount,
                               InvoiceNo = a.InvoiceNo,
                               GoodReceiptDate = a.GoodReceiptDate,
                               PurchaseOrderId = a.PurchaseOrderId,
                               IsCancel = a.IsCancel,
                               ContactNo = b.Select(s => s.ContactNo).FirstOrDefault(),
                               GoodReceiptPrintId = a.GoodReceiptPrintId,
                               Pin = b.Select(s => s.Pin).FirstOrDefault(),
                               CreditPeriod = a.CreditPeriod,
                               SupplierName = b.Select(s => s.SupplierName).FirstOrDefault(),

                           }).ToList().GroupBy(a => a.SupplierId).OrderByDescending(a => goodsReceiptId).Select(
                        a => new
                        {
                            SupplierId = a.Select(s => s.SupplierId).FirstOrDefault(),
                            SubTotal = a.Sum(s => s.SubTotal),
                            DiscountAmount = a.Sum(s => s.DiscountAmount),
                            VATAmount = a.Sum(s => s.VATAmount),
                            TotalAmount = a.Sum(s => s.TotalAmount),
                            SupplierName = a.Select(s => s.SupplierName).FirstOrDefault(),
                            InvoiceNo = a.Select(s => s.InvoiceNo).FirstOrDefault(),
                            GoodReceiptDate = a.Select(s => s.GoodReceiptDate).FirstOrDefault(),
                            PurchaseOrderId = a.Select(s => s.PurchaseOrderId).FirstOrDefault(),
                            ContactNo = a.Select(s => s.ContactNo).FirstOrDefault(),
                            GoodReceiptPrintId = a.Select(s => s.GoodReceiptPrintId).FirstOrDefault(),
                            Pin = a.Select(s => s.Pin).FirstOrDefault(),
                            CreditPeriod = a.Select(s => s.CreditPeriod),
                            IsCancel = a.Select(s => s.IsCancel).FirstOrDefault(),
                        }
                        );

                    responseData.Status = "OK";
                    responseData.Results = goodReceiptList;
                }
                #endregion
                #region GET: good receipt of  unique supplier
                else if (reqType == "get-goods-receipt-by-SupplierID")
                {
                    var goodReciptList = phrmdbcontext.PHRMGoodsReceipt.Where(a => a.IsCancel != null && a.SupplierId == providerId).ToList().GroupJoin(phrmdbcontext.PHRMSupplier.ToList(), a => a.SupplierId, b => b.SupplierId, (a, b) =>
                           new
                           {
                               SupplierId = a.SupplierId,
                               SubTotal = a.SubTotal,
                               DiscountAmount = a.DiscountAmount,
                               VATAmount = a.VATAmount,
                               TotalAmount = a.TotalAmount,
                               GoodReceiptId = a.GoodReceiptId,
                               CreditPeriod = a.CreditPeriod,
                               SupplierName = b.Select(s => s.SupplierName).FirstOrDefault()
                           }).ToList();




                    responseData.Status = "OK";
                    responseData.Results = goodReciptList;
                }
                #endregion
                #region GET: all the store from PHRM_MST_STORE table
                else if (reqType == "getStoreList")
                {
                    var test = phrmdbcontext.PHRMStore;
                    var storeList = phrmdbcontext.PHRMStore.AsEnumerable()
                        .ToList();
                    responseData.Status = "OK";
                    responseData.Results = storeList;
                }
                #endregion
                #region Get: all the dispensary list from PHRM_MST_DISPENSARY
                else if (reqType == "getDispenaryList")
                {
                    var test = phrmdbcontext.PHRMDispensary;
                    var dispensaryList = phrmdbcontext.PHRMDispensary.AsEnumerable()
                        .ToList();
                    responseData.Status = "OK";
                    responseData.Results = dispensaryList;
                }
                #endregion
                #region GET: order-goods receipt items-view : gets list of GoodsReceiptItems by GoodReceiptId
                else if (reqType == "GRItemsViewByGRId")
                {
                    var grItemsList = (from gritems in phrmdbcontext.PHRMGoodsReceiptItems
                                       where gritems.GoodReceiptId == goodsReceiptId
                                       select new
                                       {
                                           GoodReceiptId = gritems.GoodReceiptId,
                                           ItemName = gritems.ItemName,

                                           CompanyName = gritems.CompanyName,
                                           BatchNo = gritems.BatchNo,
                                           // ManufactureDate = gritems.ManufactureDate,
                                           ExpiryDate = gritems.ExpiryDate,
                                           ReceivedQuantity = gritems.ReceivedQuantity,
                                           FreeQuantity = gritems.FreeQuantity,
                                           RejectedQuantity = gritems.RejectedQuantity,
                                           SellingPrice = gritems.SellingPrice,
                                           GRItemPrice = gritems.GRItemPrice,
                                           SubTotal = gritems.SubTotal,
                                           VATPercentage = gritems.VATPercentage,
                                           DiscountPercentage = gritems.DiscountPercentage,
                                           TotalAmount = gritems.TotalAmount,
                                           MRP = gritems.MRP,
                                           CCCharge = gritems.CCCharge

                                       }
                                ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = grItemsList;
                }
                #endregion
                #region GET: Get List Of POItems whose status is Active or Partial
                else if (reqType == "getPHRMPOItemsForGR")
                {

                    var POAndPOItemsForGR = (from po in phrmdbcontext.PHRMPurchaseOrder
                                             join poitm in phrmdbcontext.PHRMPurchaseOrderItems on po.PurchaseOrderId equals poitm.PurchaseOrderId
                                             join itms in phrmdbcontext.PHRMItemMaster on poitm.ItemId equals itms.ItemId
                                             join supplier in phrmdbcontext.PHRMSupplier on po.SupplierId equals supplier.SupplierId
                                             join company in phrmdbcontext.PHRMCompany on itms.CompanyId equals company.CompanyId
                                             join UOM in phrmdbcontext.PHRMUnitOfMeasurement on itms.UOMId equals UOM.UOMId
                                             where poitm.PurchaseOrderId == purchaseOrderId
                                             select new
                                             {
                                                 PHRMPurchaseOrder = po,
                                                 PHRMPurchaseOrderItems = po.PHRMPurchaseOrderItems,
                                                 PHRMSupplier = supplier,
                                                 PHRMItemMaster = itms,

                                                 CompanyName = company.CompanyName,
                                                 UOMName = UOM.UOMName

                                             }
                                          ).ToList();

                    responseData.Status = "OK";
                    responseData.Results = POAndPOItemsForGR;
                }
                #endregion
                #region GET: Get Prescription List
                else if (reqType == "getprescriptionlist")
                {
                    List<EmployeeModel> employeeList = (from emp in masterDbContext.Employees select emp).ToList();
                    var presList = (from pres in phrmdbcontext.PHRMPrescriptionItems.AsEnumerable()
                                    where pres.OrderStatus == "active"
                                    join pat in phrmdbcontext.PHRMPatient.AsEnumerable() on pres.PatientId equals pat.PatientId
                                    join emp in employeeList.AsEnumerable() on pres.CreatedBy equals emp.EmployeeId
                                    group new { pres, pat, emp } by new
                                    {
                                        // pres.ProviderId,
                                        pres.PatientId,
                                        pat.PatientCode,
                                        pat.FirstName,
                                        pat.MiddleName,
                                        pat.LastName,
                                        eFirstName = emp.FirstName,
                                        eMiddleName = emp.MiddleName,
                                        eLastName = emp.LastName,
                                        ProviderId = pres.CreatedBy,

                                    }
                                    into t
                                    select new
                                    {
                                        PatientCode = t.Key.PatientCode,
                                        PatientId = t.Key.PatientId,
                                        PatientName = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
                                        ProviderId = t.Key.ProviderId,
                                        ProviderFullName = t.Key.eFirstName + " " + (string.IsNullOrEmpty(t.Key.eMiddleName) ? "" : t.Key.eMiddleName + " ") + t.Key.eLastName,
                                        CreatedOn = t.Max(r => r.pres.CreatedOn)
                                    }
                                    ).OrderByDescending(a => a.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = presList;
                }
                #endregion               
                #region  Get List of Item for Return to Supplier Functionality whose available quantity is greater then zero
                else if (reqType == "PHRMItemListWithTotalAvailableQuantity")
                {
                    ///GET List of All Item Group by ItemName with Sum of Available Qty of Each Item 
                    ///
                    //var storestock = phrmdbcontext.PHRMStoreStock.GroupBy(a => new { a.ItemId, a.ItemName }).Select(
                    //    s => new PHRMStoreStockModel
                    //    {
                    //        ItemId = s.Key.ItemId,
                    //        ItemName = s.Key.ItemName,
                    //        GoodsReceiptItemId = s.Select(a => a.GoodsReceiptItemId).FirstOrDefault(),
                    //        Quantity = (s.Where(a => a.InOut == "in").Sum(a => a.Quantity) + s.Where(a => a.InOut == "in").Sum(a => a.FreeQuantity) -
                    //        s.Where(a => a.InOut == "out").Sum(a => a.Quantity) + s.Where(a => a.InOut == "out").Sum(a => a.FreeQuantity)).Value

                    //    }).ToList();

                    //var test = phrmdbcontext.PHRMStoreStock.GroupJoin(phrmdbcontext.PHRMStoreStock, a=>a.GoodsReceiptItemId,b=>b.GoodsReceiptItemId)
                    var goodReciptDetail = phrmdbcontext.PHRMGoodsReceipt.ToList();

                    var itemListWithTotlAvailQty = (from gritm in phrmdbcontext.PHRMGoodsReceiptItems
                                                    join itm in phrmdbcontext.PHRMItemMaster on gritm.ItemId equals itm.ItemId
                                                    join stk in phrmdbcontext.PHRMStoreStock on gritm.GoodReceiptItemId equals stk.GoodsReceiptItemId
                                                    group new { gritm, itm, stk } by new
                                                    {
                                                        // gritm.GoodReceiptId,
                                                        gritm.ItemId,
                                                        itm.ItemName,
                                                        stk.InOut,
                                                        stk.Quantity,
                                                        //stk.FreeQuantity
                                                    } into p
                                                    select new
                                                    {
                                                        ItemId = p.Key.ItemId,
                                                        ItemName = p.Key.ItemName,
                                                        TotalAvailableQuantity = p.Key.Quantity,
                                                        //FreeQuantity= p.Key.FreeQuantity,
                                                        //goodsReceiptId=p.Key.GoodReceiptId,
                                                        //TotalAvailableQuantity = p.Where(a=>a.stk.InOut=="in").Sum(a=>a.stk.FreeQuantity)+ p.Where(a => a.stk.InOut == "in").Sum(a => a.stk.Quantity)-
                                                        //                        p.Where(a=>a.stk.InOut=="out").Sum(a=>a.stk.FreeQuantity)-p.Where(a=>a.stk.InOut=="out").Sum(a=>a.stk.Quantity)
                                                    }
                                                       ).ToList();


                    responseData.Status = "OK";
                    responseData.Results = itemListWithTotlAvailQty;
                }
                #endregion
                #region Get List Of BatchNumbers By Passing ItemId For Return To Supplier Functionality 
                else if (reqType == "getBatchNoByItemId")
                {
                    var BatchNoListByItemId = (from gritm in phrmdbcontext.PHRMGoodsReceiptItems
                                               join itm in phrmdbcontext.PHRMItemMaster on gritm.ItemId equals itm.ItemId
                                               where gritm.ItemId == itemId
                                               select new
                                               {
                                                   ItemId = gritm.ItemId,
                                                   BatchNo = gritm.BatchNo,
                                                   BatchWiseAvailableQuantity = gritm.AvailableQuantity

                                               }
                                          ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = BatchNoListByItemId;
                }
                #endregion
                #region Get Item Details By BatchNo 
                else if (reqType == "getItemDetailsByBatchNo")
                {
                    var bat = batchNo;
                    var itm1 = itemId;
                    var totalStock = phrmdbcontext.PHRMStoreStock.Where(a => a.ItemId == itemId && a.BatchNo == batchNo).ToList();
                    var btchqty = totalStock.Where(a => a.InOut == "in").Sum(a => a.FreeQuantity)
                                                   + totalStock.Where(a => a.InOut == "in").Sum(a => a.Quantity) -
                                                   totalStock.Where(a => a.InOut == "out").Sum(a => a.Quantity);
                    var ItemDetailsByBatchNo = (from gritm in phrmdbcontext.PHRMGoodsReceiptItems
                                                join itm in phrmdbcontext.PHRMItemMaster on gritm.ItemId equals itm.ItemId
                                                where gritm.BatchNo == batchNo && gritm.ItemId == itemId
                                                select new
                                                {
                                                    GoodReceiptItemId = gritm.GoodReceiptItemId,
                                                    // BatchWiseAvailableQuantity = gritm.AvailableQuantity,
                                                    BatchWiseAvailableQuantity = btchqty,
                                                    ItemPrice = gritm.GRItemPrice,
                                                    VATPercentage = gritm.VATPercentage,
                                                    DiscountPercentage = gritm.DiscountPercentage,
                                                    ExpiryDate = gritm.ExpiryDate,
                                                    // ManufactureDate = gritm.ManufactureDate,
                                                    MRP = gritm.MRP,
                                                    ItemId = itemId
                                                }
                                     ).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = ItemDetailsByBatchNo;
                }
                #endregion
                #region Get Return All Item To Supplier List
                else if (reqType == "returnItemsToSupplierList")
                {
                    var returnItemToSupplierList = (from retSupp in phrmdbcontext.PHRMReturnToSupplier
                                                    join supp in phrmdbcontext.PHRMSupplier on retSupp.SupplierId equals supp.SupplierId
                                                    join retSuppItm in phrmdbcontext.PHRMReturnToSupplierItem on retSupp.ReturnToSupplierId equals retSuppItm.ReturnToSupplierId
                                                    group new { supp, retSuppItm, retSupp } by new
                                                    {
                                                        supp.SupplierName,
                                                        retSupp.ReturnToSupplierId,
                                                        retSupp.CreditNotePrintId,

                                                    } into p
                                                    select new
                                                    {
                                                        CreditNotePrintId = p.Key.CreditNotePrintId,
                                                        SupplierName = p.Key.SupplierName,
                                                        ReturnToSupplierId = p.Key.ReturnToSupplierId,
                                                        ReturnDate = p.Select(a => a.retSupp.ReturnDate).FirstOrDefault(),
                                                        CreditNoteNo = p.Select(a => a.retSupp.CreditNoteId).FirstOrDefault(),
                                                        Quantity = p.Sum(a => a.retSuppItm.Quantity),
                                                        FreeQuantity = p.Select(a => a.retSuppItm.FreeQuantity),
                                                        SubTotal = p.Select(a => a.retSupp.SubTotal).FirstOrDefault(),
                                                        DiscountAmount = p.Select(a => a.retSupp.DiscountAmount).FirstOrDefault(),
                                                        VATAmount = p.Select(a => a.retSupp.VATAmount).FirstOrDefault(),
                                                        TotalAmount = p.Select(a => a.retSupp.TotalAmount).FirstOrDefault(),
                                                        Email = p.Select(a => a.supp.Email).FirstOrDefault(),
                                                        ContactNo = p.Select(a => a.supp.ContactNo).FirstOrDefault(),
                                                        ContactAddress = p.Select(a => a.supp.ContactAddress).FirstOrDefault(),
                                                        City = p.Select(a => a.supp.City).FirstOrDefault(),
                                                        Pin = p.Select(a => a.supp.Pin).FirstOrDefault()
                                                    }
                            ).ToList().OrderByDescending(a => a.ReturnToSupplierId);
                    responseData.Status = "OK";
                    responseData.Results = returnItemToSupplierList;
                }
                #endregion
                #region Get Write-Off List With SUM of WriteOff Qty 
                else if (reqType == "getWriteOffList")
                {
                    var writeOffList = (from writeOff in phrmdbcontext.PHRMWriteOff
                                        join writeOffItm in phrmdbcontext.PHRMWriteOffItem on writeOff.WriteOffId equals writeOffItm.WriteOffId
                                        group new { writeOff, writeOffItm } by new
                                        {
                                            writeOff.WriteOffId

                                        } into p
                                        select new
                                        {
                                            WriteOffId = p.Key.WriteOffId,
                                            WriteOffDate = p.Select(a => a.writeOff.WriteOffDate).FirstOrDefault(),
                                            Quantity = p.Sum(a => a.writeOffItm.WriteOffQuantity),
                                            SubTotal = p.Select(a => a.writeOff.SubTotal).FirstOrDefault(),
                                            DiscountAmount = p.Select(a => a.writeOff.DiscountAmount).FirstOrDefault(),
                                            VATAmount = p.Select(a => a.writeOff.VATAmount).FirstOrDefault(),
                                            TotalAmount = p.Select(a => a.writeOff.TotalAmount).FirstOrDefault()

                                        }
                           ).ToList().OrderByDescending(a => a.WriteOffId);

                    responseData.Status = "OK";
                    responseData.Results = writeOffList;
                }
                #endregion
                #region Get All Generic Name List
                else if (reqType == "getGenericList")
                {
                    //var test = phrmdbcontext.PHRMInvoiceTransactionItems.ToList();
                    // DataTable invoiceTransaction = test;
                    //List<PHRMGenericModel> genericList = new List<PHRMGenericModel>();
                    var genericList = (from generics in phrmdbcontext.PHRMGenericModel
                                       select generics).ToList();
                    responseData.Status = "OK";
                    responseData.Results = genericList;
                }
                #endregion

                #region Get All Generic Sale List
                else if (reqType == "PHRMDailySalesSummaryReport")
                {
                    var test = phrmdbcontext.PHRMInvoiceTransactionItems.ToList().OrderByDescending(a => a.CreatedOn);

                    responseData.Status = "OK";
                    responseData.Results = test;
                }
                #endregion

                #region Get Stock Details List
                else if (reqType == "stockDetails")
                {
                    //To calculate stock and add batch and items
                    //var totalStock = phrmdbcontext.PHRMStockTransactionModel.Where(a => a.ExpiryDate >= DateTime.Now).ToList().GroupBy(a => new { a.ItemId, a.BatchNo }).Select(g => new PHRMStockTransactionItemsModel
                    //{
                    //    ItemId = g.Key.ItemId,
                    //    BatchNo = g.Key.BatchNo,
                    //    //InOut = g.Key.InOut,
                    //    Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out").Sum(o => o.Quantity),
                    //    FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                    //    ExpiryDate = g.FirstOrDefault().ExpiryDate,
                    //    MRP = g.FirstOrDefault().MRP,
                    //    Price = g.FirstOrDefault().Price,


                    //}
                    //).Where(a => a.Quantity > 0).GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId, (a, b) =>
                    //new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId.Value,
                    //    BatchNo = a.BatchNo,
                    //    ExpiryDate = a.ExpiryDate.Value.Date,
                    //    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //    AvailableQuantity = a.Quantity,
                    //    MRP = a.MRP.Value,
                    //    GRItemPrice = a.Price.Value,
                    //    GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    //    IsActive = true

                    //}
                    //).OrderBy(expDate => expDate.ExpiryDate).ToList().Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    //{ GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    //.Select(s => new GoodReceiptItemsViewModel
                    //{

                    //    ItemId = s.GoodReceiptItemsViewModel.ItemId,
                    //    BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                    //    ExpiryDate = s.GoodReceiptItemsViewModel.ExpiryDate.Date,
                    //    ItemName = s.GoodReceiptItemsViewModel.ItemName,
                    //    AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,
                    //    MRP = s.GoodReceiptItemsViewModel.MRP,
                    //    GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                    //    CategoryName = s.PHRMCategory.CategoryName,
                    //    IsActive = true
                    //});



                    var totalStock = (from itm in phrmdbcontext.DispensaryStock
                                      join mstitem in phrmdbcontext.PHRMItemMaster on itm.ItemId equals mstitem.ItemId
                                      select new
                                      {
                                          ItemId = itm.ItemId,
                                          BatchNo = itm.BatchNo,
                                          ExpiryDate = itm.ExpiryDate,
                                          ItemName = mstitem.ItemName,
                                          AvailableQuantity = itm.AvailableQuantity,
                                          MRP = itm.MRP,
                                          IsActive = true,
                                          DiscountPercentage = 0

                                      }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = totalStock;

                }
                #endregion
                #region Get ItemTypeList with All child ItemsList
                else if (reqType == "itemtypeListWithItems")
                {
                    var testdate = DateTime.Now;
                    //To calculate stock and add batch and items
                    //var totalStock = phrmdbcontext.PHRMStockTransactionModel.Where(a => a.ExpiryDate >= testdate).ToList().GroupBy(a => new { a.ItemId, a.BatchNo }).Select(g =>
                    //   new PHRMStockTransactionItemsModel
                    //   {
                    //       ItemId = g.Key.ItemId,
                    //       BatchNo = g.Key.BatchNo,
                    //       MRP = g.Select(s => s.MRP).FirstOrDefault(),
                    //       Price = g.Select(s => s.Price).FirstOrDefault(),
                    //       ExpiryDate = g.Select(s => s.ExpiryDate).FirstOrDefault(),
                    //       //GoodsReceiptItemId = g.Select(s => s.GoodsReceiptItemId).FirstOrDefault(),
                    //       //InOut = g.Key.InOut,
                    //       Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out")
                    //       .Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(f => f.FreeQuantity).Value,
                    //       //  FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),

                    //   }
                    //).Where(a => a.Quantity > 0).GroupJoin(phrmdbcontext.PHRMItemMaster.ToList(), a => a.ItemId, b => b.ItemId, (a, b) => new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId.Value,
                    //    BatchNo = a.BatchNo,
                    //    ExpiryDate = a.ExpiryDate.Value.Date,
                    //    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //    AvailableQuantity = a.Quantity,
                    //    MRP = a.MRP.Value,
                    //    //GRItemPrice = a.Price.Value,
                    //    //GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    //    //GoodReceiptItemId = a.GoodsReceiptItemId.Value,
                    //    IsActive = b.Select(s => s.IsActive).FirstOrDefault()

                    //}
                    //).Where(a => a.IsActive == true).OrderBy(expDate => expDate.ExpiryDate).ToList().GroupJoin(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) =>
                    //    new GoodReceiptItemsViewModel
                    //    {
                    //        ItemId = a.ItemId,
                    //        BatchNo = a.BatchNo,
                    //        ExpiryDate = a.ExpiryDate.Date,
                    //        ItemName = a.ItemName,
                    //        AvailableQuantity = a.AvailableQuantity,
                    //        MRP = a.MRP,
                    //        //GRItemPrice = a.GRItemPrice,
                    //        //GenericId = a.GenericId,
                    //        //GenericName = b.Select(s => s.GenericName).FirstOrDefault(),
                    //        //CategoryId = b.Select(s => s.CategoryId.Value).FirstOrDefault(),
                    //        IsActive = true,
                    //        //GoodReceiptItemId = a.GoodReceiptItemId,


                    //    }).ToList();
                    //.GroupJoin(phrmdbcontext.PHRMCategory.ToList(), a=>a.CategoryId, b=>b.CategoryId, (a,b)=> new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId,
                    //    BatchNo = a.BatchNo,
                    //    ExpiryDate = a.ExpiryDate.Date,
                    //    ItemName = a.ItemName,
                    //    AvailableQuantity = a.AvailableQuantity,
                    //    MRP = a.MRP,
                    //    GRItemPrice = a.GRItemPrice,
                    //    GenericId = a.GenericId,
                    //    GenericName = a.GenericName,
                    //    CategoryId = a.CategoryId,
                    //    CategoryName= b.Select(s=>s.CategoryName).FirstOrDefault(),
                    //    IsActive = true,
                    //    GoodReceiptItemId= a.GoodReceiptItemId,
                    //}).ToList();
                    var genricList = (from gen in phrmdbcontext.PHRMGenericModel select gen).ToList();

                    var totalStock = (from itm in phrmdbcontext.DispensaryStock.AsEnumerable()
                                      join mstitem in phrmdbcontext.PHRMItemMaster on itm.ItemId equals mstitem.ItemId
                                      join genr in genricList on mstitem.GenericId equals genr.GenericId
                                      select new
                                      {
                                          ItemId = itm.ItemId,
                                          BatchNo = itm.BatchNo,
                                          ExpiryDate = itm.ExpiryDate,
                                          ItemName = mstitem.ItemName,
                                          AvailableQuantity = itm.AvailableQuantity,
                                          MRP = itm.MRP,
                                          IsActive = true,
                                          DiscountPercentage = 0,
                                          GenericName = genr.GenericName,
                                          GenericId = genr.GenericId

                                      }).ToList().Where(a => a.AvailableQuantity > 0 && a.ExpiryDate > testdate);


                    //var xx = totalStock.Where(a => a.ItemName == null);
                    responseData.Status = "OK";
                    responseData.Results = totalStock;


                }
                #endregion
                #region Get GRItems with all details by ItemId
                else if (reqType == "getGRItemsByItemId" && reqType.Length > 0)
                {
                    var itemIdtest = itemId;
                    List<PHRMGoodsReceiptItemsModel> grItemsList =
                       (from grItems in phrmdbcontext.PHRMGoodsReceiptItems
                        where grItems.ItemId == itemId && grItems.AvailableQuantity > 0
                        orderby grItems.ExpiryDate descending
                        select grItems)
                              .ToList();

                    responseData.Status = "OK";
                    responseData.Results = grItemsList;
                }
                #endregion
                #region Get Return To Supplier All Items By ReturnToSupplierId
                else if (reqType == "getReturnToSupplierItemsByReturnToSupplierId")
                {
                    var returnToSupplierItemsList = (from retSuppItm in phrmdbcontext.PHRMReturnToSupplierItem
                                                     join retSuppl in phrmdbcontext.PHRMReturnToSupplier on retSuppItm.ReturnToSupplierId equals retSuppl.ReturnToSupplierId
                                                     join itm in phrmdbcontext.PHRMItemMaster on retSuppItm.ItemId equals itm.ItemId
                                                     where retSuppItm.ReturnToSupplierId == returnToSupplierId
                                                     select new
                                                     {
                                                         ItemName = itm.ItemName,
                                                         ReturnToSupplierId = retSuppItm.ReturnToSupplierId,
                                                         BatchNo = retSuppItm.BatchNo,
                                                         Quantity = retSuppItm.Quantity,
                                                         FreeQuantity = retSuppItm.FreeQuantity,
                                                         FreeAmount = retSuppItm.FreeAmount,
                                                         ExpiryDate = retSuppItm.ExpiryDate,
                                                         MRP = retSuppItm.MRP,
                                                         ItemPrice = retSuppItm.ItemPrice,
                                                         SubTotal = retSuppItm.SubTotal,
                                                         DiscountPercentage = retSuppItm.DiscountPercentage,
                                                         VATPercentage = retSuppItm.VATPercentage,
                                                         TotalAmount = retSuppItm.TotalAmount,
                                                         //TotalAmt= retSuppl.TotalAmount,
                                                         //DiscAmt= retSuppl.DiscountAmount,
                                                         //CreditNoteId= retSuppl.CreditNotePrintId,
                                                         //vatAmt= retSuppl.VATAmount,
                                                         //Remarks = retSuppl.Remarks,
                                                         //CreditNoteDate= retSuppl.CreatedOn,


                                                     }
                                                 ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = returnToSupplierItemsList;
                }
                #endregion

                #region Get WriteOff Items by WriteOffId
                else if (reqType == "getWriteOffItemsByWriteOffId")
                {
                    var WriteOffItemsByWriteOffIdList = (from writeOffItm in phrmdbcontext.PHRMWriteOffItem
                                                         join writeOff in phrmdbcontext.PHRMWriteOff on writeOffItm.WriteOffId equals writeOff.WriteOffId
                                                         join itm in phrmdbcontext.PHRMItemMaster on writeOffItm.ItemId equals itm.ItemId
                                                         where writeOffItm.WriteOffId == writeOffId
                                                         select new
                                                         {
                                                             ItemName = itm.ItemName,
                                                             WriteOffId = writeOffItm.WriteOffId,
                                                             BatchNo = writeOffItm.BatchNo,
                                                             WriteOffQuantity = writeOffItm.WriteOffQuantity,
                                                             ItemPrice = writeOffItm.ItemPrice,
                                                             SubTotal = writeOffItm.SubTotal,
                                                             DiscountPercentage = writeOffItm.DiscountPercentage,
                                                             VATPercentage = writeOffItm.VATPercentage,
                                                             TotalAmount = writeOffItm.TotalAmount
                                                         }
                              ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = WriteOffItemsByWriteOffIdList;
                }
                #endregion
                #region Get all sale invoice list data
                else if (reqType == "getsaleinvoicelist")
                {
                    var testdate = ToDate.AddDays(1);//to include ToDate, 1 day was added--rusha 07/10/2019
                    var saleInvoiceList = (from inv in phrmdbcontext.PHRMInvoiceTransaction.AsEnumerable()
                                           where inv.IsReturn != true && inv.CreateOn > FromDate && inv.CreateOn < testdate
                                           join pat in phrmdbcontext.PHRMPatient on inv.PatientId equals pat.PatientId
                                           join countryd in phrmdbcontext.CountrySubDivision on pat.CountrySubDivisionId equals countryd.CountrySubDivisionId
                                           join fs in phrmdbcontext.BillingFiscalYear on inv.FiscalYearId equals fs.FiscalYearId
                                           select new
                                           {
                                               InvoiceId = inv.InvoiceId,
                                               InvoicePrintId = inv.InvoicePrintId,
                                               PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                               SubTotal = inv.SubTotal,
                                               DiscountAmount = inv.DiscountAmount,
                                               VATAmount = inv.VATAmount,
                                               TotalAmount = inv.TotalAmount,
                                               PaidAmount = inv.PaidAmount,
                                               BilStatus = inv.BilStatus,
                                               TotalCredit = inv.CreditAmount,
                                               CreatedBy = inv.CreatedBy,
                                               CreateOn = inv.CreateOn,
                                               IsOutdoorPat = pat.IsOutdoorPat,
                                               inv.Adjustment,
                                               inv.Change,
                                               inv.PrintCount,
                                               ReceiptNo = inv.InvoiceId,
                                               ReceiptPrintNo = inv.InvoicePrintId,
                                               Remarks = inv.Remark,
                                               inv.Tender,
                                               inv.TotalQuantity,
                                               PaymentMode = inv.PaymentMode,
                                               FiscalYear = fs.FiscalYearFormatted,  //PharmacyBL.GetFiscalYearFormattedName(phrmdbcontext, inv.FiscalYearId),
                                               Patient = new
                                               {
                                                   pat.PatientId,
                                                   pat.FirstName,
                                                   pat.MiddleName,
                                                   pat.LastName,
                                                   ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                   pat.PhoneNumber,
                                                   countryd.CountrySubDivisionName,
                                                   pat.Age,
                                                   pat.PANNumber,
                                                   pat.Address,
                                                   pat.DateOfBirth,
                                                   pat.Gender,
                                                   pat.PatientCode,
                                                }
                                           }).ToList().OrderByDescending(a => a.CreateOn);
                    responseData.Status = "OK";
                    responseData.Results = saleInvoiceList;
                }
                #endregion

                #region Get all sale invoice list data
                else if (reqType == "getsalereturnlist")
                {
                    var returnSaleList = (from inv in phrmdbcontext.PHRMInvoiceTransaction
                                          join invRetItm in phrmdbcontext.PHRMInvoiceReturnItemsModel
                                          on inv.InvoiceId equals invRetItm.InvoiceId
                                          where inv.IsReturn == true
                                          select new
                                          {
                                              inv.InvoiceId,
                                              invRetItm.CreatedBy,
                                              invRetItm.CreatedOn
                                          }).GroupBy(p => p.InvoiceId)
                                           .Select(g => g.FirstOrDefault()).ToList();

                    var saleReturnInvoiceList = (from inv in phrmdbcontext.PHRMInvoiceTransaction.AsEnumerable()
                                                 join pat in phrmdbcontext.PHRMPatient on inv.PatientId equals pat.PatientId
                                                 join countryd in phrmdbcontext.CountrySubDivision on pat.CountrySubDivisionId equals countryd.CountrySubDivisionId
                                                 join fs in phrmdbcontext.BillingFiscalYear on inv.FiscalYearId equals fs.FiscalYearId
                                                 where inv.IsReturn == true
                                                 select new
                                                 {
                                                     InvoiceId = inv.InvoiceId,
                                                     InvoicePrintId = inv.InvoicePrintId,
                                                     PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                     SubTotal = inv.SubTotal,
                                                     DiscountAmount = inv.DiscountAmount,
                                                     VATAmount = inv.VATAmount,
                                                     TotalAmount = inv.TotalAmount,
                                                     PaidAmount = inv.PaidAmount,
                                                     BilStatus = inv.BilStatus,
                                                     TotalCredit = inv.CreditAmount,
                                                     CreatedBy = (from i in returnSaleList
                                                                  where i.InvoiceId == inv.InvoiceId
                                                                  select i.CreatedBy).FirstOrDefault(),
                                                     CreateOn = (from i in returnSaleList
                                                                 where i.InvoiceId == inv.InvoiceId
                                                                 select i.CreatedOn).FirstOrDefault(),
                                                     IsOutdoorPat = pat.IsOutdoorPat,
                                                     inv.Adjustment,
                                                     inv.Change,
                                                     inv.PrintCount,
                                                     ReceiptNo = inv.InvoiceId,
                                                     ReceiptPrintNo = inv.InvoicePrintId,
                                                     Remarks = inv.Remark,
                                                     inv.Tender,
                                                     inv.TotalQuantity,
                                                     FiscalYear = fs.FiscalYearFormatted,//PharmacyBL.GetFiscalYearFormattedName(phrmdbcontext, inv.FiscalYearId),
                                                     Patient = new
                                                     {
                                                         pat.PatientId,
                                                         pat.FirstName,
                                                         pat.MiddleName,
                                                         pat.LastName,
                                                         ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                         pat.PhoneNumber,
                                                         countryd.CountrySubDivisionName,
                                                         pat.Age,
                                                         pat.PANNumber,
                                                         pat.Address,
                                                         pat.DateOfBirth,
                                                         pat.Gender,
                                                         pat.PatientCode
                                                     },
                                                 }).ToList().OrderByDescending(a => a.CreateOn);
                    responseData.Status = "OK";
                    responseData.Results = saleReturnInvoiceList;
                }
                #endregion



                #region Get sale invoice items details by Invoice id
                else if (reqType == "getsaleinvoiceitemsbyid" && invoiceId > 0)
                {
                    //var test = phrmdbcontext.PHRMBillTransactionItems.Join(phrmdbcontext)
                    var saleInvoiceItemsByInvoiceId = (from invitm in phrmdbcontext.PHRMInvoiceTransactionItems
                                                           // join company in phrmdbcontext.PHRMCompany on invitm.CompanyId equals company.CompanyId
                                                       where invitm.InvoiceId == invoiceId
                                                       select new
                                                       {
                                                           InvoiceItemId = invitm.InvoiceItemId,
                                                           InvoiceId = invitm.InvoiceId,
                                                           invitm.CounterId,
                                                           ExpiryDate = invitm.ExpiryDate,
                                                           //ExpiryDate = (from stkTxnItm in phrmdbcontext.PHRMStockTransactionItems
                                                           //              where stkTxnItm.TransactionType == "sale"
                                                           //              && stkTxnItm.ReferenceNo == invitm.InvoiceId && stkTxnItm.BatchNo == invitm.BatchNo
                                                           //              select stkTxnItm.ExpiryDate).FirstOrDefault(),
                                                           ItemId = invitm.ItemId,
                                                           ItemName = invitm.ItemName,
                                                           BatchNo = invitm.BatchNo,
                                                           Quantity = invitm.Quantity,
                                                           Price = invitm.Price,
                                                           MRP = invitm.MRP,
                                                           FreeQuantity = invitm.FreeQuantity,
                                                           SubTotal = invitm.SubTotal,
                                                           VATPercentage = invitm.VATPercentage,
                                                           DiscountPercentage = invitm.DiscountPercentage,
                                                           TotalAmount = invitm.TotalAmount,
                                                           BilItemStatus = invitm.BilItemStatus,
                                                           Remark = invitm.Remark,
                                                           CreatedBy = invitm.CreatedBy,
                                                           CreatedOn = invitm.CreatedOn
                                                       }).Where(q => q.Quantity > 0).ToList();
                    responseData.Status = "OK";

                    responseData.Results = saleInvoiceItemsByInvoiceId;

                }
                #endregion
                #region Get Stock Manage by Item Id
                else if (reqType == "stockManage" && itemId > 0)
                {
                    var stkManage = (from gritm in phrmdbcontext.PHRMGoodsReceiptItems
                                     where (gritm.ItemId == itemId && gritm.AvailableQuantity > 0)
                                     select new
                                     {
                                         GoodReceiptItemId = gritm.GoodReceiptItemId,
                                         ItemId = gritm.ItemId,
                                         ItemName = gritm.ItemName,
                                         BatchNo = gritm.BatchNo,
                                         GRItemPrice = gritm.GRItemPrice,
                                         ExpiryDate = gritm.ExpiryDate,
                                         //ManufactureDate = gritm.ManufactureDate,
                                         curtQuantity = gritm.AvailableQuantity,
                                         modQuantity = gritm.AvailableQuantity,
                                         ReceivedQuantity = gritm.ReceivedQuantity,
                                     }
                               ).ToList();

                    var stkZeroManage = (from gritm in phrmdbcontext.PHRMGoodsReceiptItems
                                         where (gritm.ItemId == itemId && gritm.AvailableQuantity == 0)
                                         select new
                                         {
                                             GoodReceiptItemId = gritm.GoodReceiptItemId,
                                             ItemId = gritm.ItemId,
                                             ItemName = gritm.ItemName,
                                             BatchNo = gritm.BatchNo,
                                             GRItemPrice = gritm.GRItemPrice,
                                             ExpiryDate = gritm.ExpiryDate,
                                             // ManufactureDate = gritm.ManufactureDate,
                                             curtQuantity = gritm.AvailableQuantity,
                                             modQuantity = gritm.AvailableQuantity,
                                             ReceivedQuantity = gritm.ReceivedQuantity,
                                         }
                               ).ToList();

                    var finalStkManage = new { stockDetails = stkManage, zeroStockDetails = stkZeroManage };

                    responseData.Status = "OK";
                    responseData.Results = finalStkManage;
                }
                #endregion


                #region Get Invoice Items with details for ReturnFromCustomer functionality                                 
                else if (reqType == "getReturnFromCustDataModelByInvId" && invoiceId > 0)
                {
                    // we have to keep total quantity as well, Currently null is passed in Total Quantity.



                    var result = (from inv in phrmdbcontext.PHRMInvoiceTransaction
                                  join pat in phrmdbcontext.PHRMPatient
                                  on inv.PatientId equals pat.PatientId
                                  where inv.InvoicePrintId == invoiceId && inv.FiscalYearId == FiscalYearId// to make invoice id in invoice print ID 
                                  select new
                                  {
                                      invoiceHeader = new
                                      {
                                          InvoiceId = inv.InvoicePrintId,//to make invoice print id as id
                                          InvoiceDate = inv.CreateOn.ToString(),
                                          PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                          PatientType = (inv.IsOutdoorPat == true) ? "Outdoor" : "Indoor",
                                          CreditAmount = inv.CreditAmount.ToString(),
                                          InvoiceBillStatus = inv.BilStatus,
                                          InvoiceTotalMoney = inv.PaidAmount.ToString(),
                                          IsReturn = inv.IsReturn
                                      },
                                      patient = pat,
                                      //totalQty = phrmdbcontext.PHRMInvoiceTransactionItems.Where(a => a.InvoiceId == inv.InvoiceId).GroupJoin(phrmdbcontext.PHRMStockTransactionItems,
                                      //a => a.)
                                      invoiceItems = (from invitm in phrmdbcontext.PHRMInvoiceTransactionItems
                                                      where invitm.InvoiceId == inv.InvoiceId && invitm.Quantity > 0
                                                      select new
                                                      {
                                                          invitm.InvoiceId,
                                                          invitm.InvoiceItemId,
                                                          invitm.BatchNo,
                                                          //ExpiryDate = (from stkTxnItm in phrmdbcontext.PHRMStockTransactionItems
                                                          //              where stkTxnItm.ReferenceNo == invoiceId && stkTxnItm.BatchNo == invitm.BatchNo
                                                          //              && stkTxnItm.ItemId == invitm.ItemId && stkTxnItm.Quantity == invitm.Quantity && stkTxnItm.TransactionType == "sale"
                                                          //              select stkTxnItm.ExpiryDate).FirstOrDefault(),
                                                          invitm.ExpiryDate,
                                                          invitm.Quantity,
                                                          invitm.MRP,
                                                          invitm.Price,
                                                          invitm.SubTotal,
                                                          invitm.VATPercentage,
                                                          invitm.DiscountPercentage,
                                                          invitm.TotalAmount,
                                                          invitm.ItemId,
                                                          invitm.ItemName,
                                                          invitm.FreeQuantity,
                                                          invitm.CounterId

                                                      }).ToList()
                                  }
                                //result.Join()

                                ).FirstOrDefault();
                    responseData.Status = (result == null) ? "Failed" : "OK";
                    responseData.Results = result;
                }
                #endregion
                else if (reqType == "GetRackByItem")
                {
                    var itemRack = phrmdbcontext.PHRMItemMaster.Where(x => x.ItemId == itemId).FirstOrDefault();

                    var Rack = (from item in phrmdbcontext.PHRMItemMaster
                                where item.ItemId == itemId
                                join rack in phrmdbcontext.PHRMRack on item.Rack equals rack.RackId
                                into rackitems
                                from itemrack in rackitems.DefaultIfEmpty()
                                select new
                                {
                                    itemrack.Name
                                }).FirstOrDefault();

                    var rackNo = Rack.Name == null ? "N/A" : Rack.Name;
                    responseData.Status = "OK";
                    responseData.Results = rackNo;

                }
                else if (reqType == "employeePreference")
                {
                    var preferenceValue = (from preference in phrmdbcontext.EmployeePreferences
                                           where preference.EmployeeId == employeeId &&
                                           preference.PreferenceName == "Medicationpreferences" &&
                                           preference.IsActive == true
                                           select preference.PreferenceValue).FirstOrDefault();
                    if (preferenceValue != null)
                    {
                        XmlDocument prefXmlDocument = new XmlDocument();
                        prefXmlDocument.LoadXml(preferenceValue);
                        // selecting the node of xml Document with tag LabTestId
                        XmlNodeList nodes = prefXmlDocument.SelectNodes("MedicineId");

                        var itemList = (from itm in phrmdbcontext.PHRMItemMaster
                                        join compny in phrmdbcontext.PHRMCompany on itm.CompanyId equals compny.CompanyId
                                        //join suplier in phrmdbcontext.PHRMSupplier on itm.SupplierId equals suplier.SupplierId
                                        join itmtype in phrmdbcontext.PHRMItemType on itm.ItemTypeId equals itmtype.ItemTypeId
                                        join unit in phrmdbcontext.PHRMUnitOfMeasurement on itm.UOMId equals unit.UOMId
                                        where preferenceValue.Contains(itm.ItemId.ToString())
                                        select new
                                        {
                                            ItemId = itm.ItemId,
                                            ItemName = itm.ItemName,
                                            ItemCode = itm.ItemCode,
                                            CompanyId = itm.CompanyId,
                                            CompanyName = compny.CompanyName,
                                            //SupplierId = itm.SupplierId,
                                            //SupplierName = suplier.SupplierName,
                                            ItemTypeId = itm.ItemTypeId,
                                            ItemTypeName = itmtype.ItemTypeName,
                                            UOMId = itm.UOMId,
                                            UOMName = unit.UOMName,
                                            ReOrderQuantity = itm.ReOrderQuantity,
                                            MinStockQuantity = itm.MinStockQuantity,
                                            BudgetedQuantity = itm.BudgetedQuantity,
                                            VATPercentage = itm.VATPercentage,
                                            IsVATApplicable = itm.IsVATApplicable,
                                            IsActive = itm.IsActive
                                        }).ToList().OrderBy(a => a.ItemId);
                        responseData.Status = "OK";
                        responseData.Results = itemList;
                    }
                }
                #region GET: Patient- single Patient by Patient Id
                else if (reqType == "getPatientByPatId" && patientId > 0)
                {
                    PHRMPatient pat = (from patient in phrmdbcontext.PHRMPatient
                                       where patient.PatientId == patientId
                                       select patient).FirstOrDefault();
                    pat.CountrySubDivisionName = (from country in phrmdbcontext.CountrySubDivision
                                                  where pat.CountrySubDivisionId == country.CountrySubDivisionId
                                                  select country.CountrySubDivisionName).FirstOrDefault();

                  var visitDetails = (from patVisit in patientDbContext.Visits
                                      where patVisit.PatientId == pat.PatientId
                                      select new
                                      { patVisit.ProviderId, patVisit.PatientVisitId }
                                      ).OrderByDescending(p => p.PatientVisitId).FirstOrDefault();
                    pat.ProviderId = (visitDetails!= null) ? visitDetails.ProviderId : null;

                    if (pat.PatientId > 0)
                    {
                        responseData.Results = pat;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "No patient by Patient Id";
                    }
                }
                #endregion
                #region GET: Prescription Items by ProviderId, PatientId 
                else if (reqType == "getPrescriptionItems" && patientId > 0 && providerId > 0)
                {
                    var presItems = (from pres in phrmdbcontext.PHRMPrescriptionItems
                                     where pres.PatientId == patientId && pres.ProviderId == providerId && pres.OrderStatus != "final"
                                     select pres).ToList().OrderByDescending(a => a.CreatedOn);
                    responseData.Results = presItems;
                    responseData.Status = "OK";

                }
                #endregion
                #region GET: Sales Report according to items
                else if (reqType == "getSalesReport")
                {
                    if (IsOutdoorPat)
                    {
                        var invList = (from pat in masterDbContext.Patient
                                       where pat.IsOutdoorPat == IsOutdoorPat
                                       select pat
                                            ).ToList();
                        responseData.Results = invList;
                    }
                    else
                    {
                        var invList = (from pat in masterDbContext.Patient
                                       where (pat.IsOutdoorPat == IsOutdoorPat || pat.IsOutdoorPat == null)
                                       select pat
                                            ).ToList();
                        responseData.Results = invList;
                    }

                    responseData.Status = "OK";


                }
                #endregion
                #region GET: Sample
                else if (reqType == "getInOutPatientDetails")
                {
                    var test = phrmdbcontext.PHRMInvoiceTransactionItems.ToList();
                    if (IsOutdoorPat)
                    {
                        var invList = (from pat in masterDbContext.Patient
                                       where pat.IsOutdoorPat == IsOutdoorPat
                                       select pat
                                            ).ToList();
                        responseData.Results = invList;
                    }
                    else
                    {
                        var invList = (from pat in masterDbContext.Patient
                                       where (pat.IsOutdoorPat == IsOutdoorPat || pat.IsOutdoorPat == null)
                                       select pat
                                            ).ToList();
                        responseData.Results = invList;
                    }

                    responseData.Status = "OK";


                }
                #endregion
                #region GET: Stock Transaction Item List 
                else if (reqType == "getStockTxnItemList")
                {
                    //var result = (from stktxnitm in phrmdbcontext.PHRMStockTransactionModel
                    //              join itm in phrmdbcontext.PHRMItemMaster
                    //              on stktxnitm.ItemId equals itm.ItemId
                    //              select new
                    //              {
                    //                  stktxnitm.StockTxnItemId,
                    //                  stktxnitm.ItemId,
                    //                  itm.ItemName,
                    //                  stktxnitm.BatchNo,
                    //                  stktxnitm.Quantity,
                    //                  stktxnitm.Price,
                    //                  stktxnitm.MRP,
                    //                  stktxnitm.SubTotal,
                    //                  stktxnitm.TotalAmount,
                    //                  stktxnitm.InOut,
                    //                  stktxnitm.CreatedOn,
                    //                  stktxnitm.CreatedBy,
                    //                  stktxnitm.VATPercentage,
                    //                  stktxnitm.DiscountPercentage,
                    //                  stktxnitm.ExpiryDate
                    //              }).ToList();

                    var result = (from stktxnitm in phrmdbcontext.DispensaryStock
                                  join itm in phrmdbcontext.PHRMItemMaster
                                  on stktxnitm.ItemId equals itm.ItemId
                                  select new
                                  {
                                      StockId = stktxnitm.StockId,
                                      ItemID = stktxnitm.ItemId,
                                      ItemName = itm.ItemName,
                                      BatchNo = stktxnitm.BatchNo,
                                      Quantity = stktxnitm.AvailableQuantity,
                                      Price = stktxnitm.Price,
                                      MRP = stktxnitm.MRP,
                                      ExpiryDate = stktxnitm.ExpiryDate
                                  }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion

                #region GET: Stock Details with 0, null or >0 Quantity
                //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
                //items with 0 quantity or more than 0 showing in list
                else if (reqType == "allItemsStockDetails")
                {
                    var totalStock = (from stk in phrmdbcontext.DispensaryStock
                                      join itm in phrmdbcontext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                                      join gri in phrmdbcontext.PHRMGoodsReceiptItems on stk.ItemId equals gri.ItemId where stk.BatchNo==gri.BatchNo
                                      select new
                                      {
                                          ItemId = stk.ItemId,
                                          BatchNo = stk.BatchNo,
                                          ExpiryDate = stk.ExpiryDate,
                                          ItemName = itm.ItemName,
                                          AvailableQuantity = stk.AvailableQuantity,
                                          MRP = stk.MRP,
                                          Price = stk.Price,
                                          GoodsReceiptItemId = gri.GoodReceiptItemId,
                                          IsActive = true

                                      }).ToList();
                    //  var totalStock = phrmdbcontext.PHRMStockTransactionModel.Where(a => a.ExpiryDate >= DateTime.Now).ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.ExpiryDate, a.MRP, a.GoodsReceiptItemId, a.Price }).Select(g =>
                    //       new PHRMStockTransactionItemsModel
                    //       {
                    //           ItemId = g.Key.ItemId,
                    //           BatchNo = g.Key.BatchNo,
                    //         //InOut = g.Key.InOut,
                    //         Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in")
                    //           .Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out").Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(o => o.FreeQuantity).Value,
                    //           FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                    //           ExpiryDate = g.Key.ExpiryDate,
                    //           MRP = g.Key.MRP,
                    //           GoodsReceiptItemId = g.Key.GoodsReceiptItemId,
                    //           Price = g.Key.Price
                    //         //ExpiryDate = g.FirstOrDefault().ExpiryDate,
                    //         //MRP = g.FirstOrDefault().MRP,
                    //         //Price = g.FirstOrDefault().Price,
                    //     }
                    //).GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId, (a, b) =>
                    //new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId.Value,
                    //    BatchNo = a.BatchNo,
                    //    ExpiryDate = a.ExpiryDate.Value.Date,
                    //    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //    AvailableQuantity = a.Quantity,
                    //    MRP = a.MRP.Value,
                    //    GoodReceiptItemId = a.GoodsReceiptItemId,
                    //    Price = a.Price,
                    //    //GRItemPrice = a.Price.Value,
                    //    GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    //    IsActive = true
                    //}
                    //).OrderBy(name => name.ItemName).ToList().Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    //{ GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    //.Select(s => new GoodReceiptItemsViewModel
                    //{

                    //    ItemId = s.GoodReceiptItemsViewModel.ItemId,
                    //    BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                    //    ExpiryDate = s.GoodReceiptItemsViewModel.ExpiryDate.Date,
                    //    ItemName = s.GoodReceiptItemsViewModel.ItemName,
                    //    AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,
                    //    MRP = s.GoodReceiptItemsViewModel.MRP,
                    //    Price = s.GoodReceiptItemsViewModel.Price,
                    //    GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                    //    //CategoryName = s.PHRMCategory.CategoryName,
                    //    VATPercentage = s.GoodReceiptItemsViewModel.VATPercentage,
                    //    GoodReceiptItemId = s.GoodReceiptItemsViewModel.GoodReceiptItemId,
                    //    IsActive = true
                    //});

                    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                    responseData.Results = totalStock;
                }
                #endregion
                #region GET: Stock Details with 0, null or >0 Quantity
                //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
                //items with 0 quantity or more than 0 showing in list
                else if (reqType == "allItemsStock")
                {
                    var totalStock = (from stk in phrmdbcontext.DispensaryStock
                                      join itm in phrmdbcontext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                                      select new
                                      {

                                          ItemId = stk.ItemId,
                                          ItemName = itm.ItemName,
                                          AvailableQuantity = stk.AvailableQuantity,
                                          MRP = stk.MRP,
                                          IsActive = true

                                      }).ToList();
                    //  var totalStock = phrmdbcontext.PHRMStockTransactionModel.Where(a => a.ExpiryDate >= DateTime.Now).ToList().GroupBy(a => new { a.ItemId }).Select(g =>
                    //      new PHRMStockTransactionItemsModel
                    //      {
                    //          ItemId = g.Key.ItemId,
                    //          MRP = g.LastOrDefault().MRP,
                    //          Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in")
                    //          .Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out").Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(o => o.FreeQuantity).Value,
                    //          FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                    //      }
                    //).GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId, (a, b) =>
                    //new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId.Value,
                    //    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //    AvailableQuantity = a.Quantity,
                    //    MRP = a.MRP.Value,
                    //    //Price = a.Price.Value,
                    //    //GRItemPrice = a.Price.Value,
                    //    GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    //    IsActive = true
                    //}
                    //).OrderBy(name => name.ItemName).ToList().Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    //{ GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    //.Select(s => new GoodReceiptItemsViewModel
                    //{

                    //    ItemId = s.GoodReceiptItemsViewModel.ItemId,
                    //    //BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                    //    //ExpiryDate = s.GoodReceiptItemsViewModel.ExpiryDate.Date,
                    //    ItemName = s.GoodReceiptItemsViewModel.ItemName,
                    //    AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,

                    //    MRP = s.GoodReceiptItemsViewModel.MRP,
                    //    //Price = s.GoodReceiptItemsViewModel.Price,
                    //    //GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                    //    //CategoryName = s.PHRMCategory.CategoryName,
                    //    //VATPercentage = s.GoodReceiptItemsViewModel.VATPercentage,
                    //    IsActive = true
                    //});

                    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                    responseData.Results = totalStock.Where(a => a.AvailableQuantity != 0);
                }
                #endregion
                #region GET: patientSummery
                else if (reqType != null && reqType == "patientSummary" && patientId != null && patientId != 0)
                {
                    //get all deposit related transactions of this patient. and sum them acc to DepositType groups.
                    var patientAllDepositTxns = (from bill in phrmdbcontext.DepositModel
                                                 where bill.PatientId == patientId//here PatientId comes as InputId from client.
                                                 group bill by new { bill.PatientId, bill.DepositType } into p
                                                 select new
                                                 {
                                                     DepositType = p.Key.DepositType,
                                                     DepositAmount = p.Sum(a => a.DepositAmount)
                                                 }).ToList();
                    //separate sum of each deposit types and calculate deposit balance.
                    double? totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
                    currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

                    if (patientAllDepositTxns.Where(bil => bil.DepositType == "deposit").FirstOrDefault() != null)
                    {
                        totalDepositAmt = patientAllDepositTxns.Where(bil => bil.DepositType == "deposit").FirstOrDefault().DepositAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositdeduct").FirstOrDefault() != null)
                    {
                        totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.DepositType == "depositdeduct").FirstOrDefault().DepositAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType == "depositreturn").FirstOrDefault() != null)
                    {
                        totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.DepositType == "depositreturn").FirstOrDefault().DepositAmount;
                    }
                    //below is the formula to calculate deposit balance.
                    currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

                    //Part-2: Get Total Provisional Items
                    //for this request type, patientid comes as inputid.
                    var patProvisional = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                              //sud: 4May'18 changed unpaid to provisional
                                          where bill.PatientId == patientId && bill.BilItemStatus == "provisional" //here PatientId comes as InputId from client.
                                          group bill by new { bill.PatientId } into p
                                          select new
                                          {
                                              TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                          }).FirstOrDefault();

                    var patProvisionalAmt = patProvisional != null ? (double)patProvisional.TotalProvisionalAmt : 0;



                    //Part-3: Return a single object with Both Balances (Deposit and Credit).
                    //exclude returned invoices from credit total
                    var patCredits = phrmdbcontext.PHRMInvoiceTransaction
                                    .Where(b => b.PatientId == patientId && b.BilStatus != "paid" && b.IsReturn != true)
                                     .Sum(b => b.TotalAmount);

                    double patCreditAmt = patCredits != null ? (double)patCredits.Value : 0;


                    //Part-4: Return a single object with Both Balances (Deposit and Credit).
                    var patSummery = new
                    {
                        PatientId = patientId,
                        ProvisionalAmt = patProvisionalAmt,
                        TotalDue = patCreditAmt + patProvisionalAmt,
                        DepositBalance = currentDepositBalance,
                        BalanceAmount = currentDepositBalance - (patCreditAmt + patProvisionalAmt)
                    };

                    responseData.Status = "OK";
                    responseData.Results = patSummery;
                }
                #endregion
                // get rack list
                else if (reqType == "getRackList")
                {
                    var rackList = (from rk in phrmdbcontext.PHRMRack
                                    select rk
                                  ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = rackList;
                }
                else if (reqType == "getsalescategorylist")
                { 
                    var salescategoryList = (from scl in phrmdbcontext.PHRMStoreSalesCategory
                                    select scl
                                  ).ToList();
                    responseData.Status = "OK";
                    responseData.Results = salescategoryList;
                }
                else if (reqType == "getStoreItemList")
                {
                    List<PHRMStoreStockModel> storeItemList = (from storeItem in phrmdbcontext.PHRMStoreStock
                                                               select storeItem).ToList();
                    responseData.Status = "OK";
                    responseData.Results = storeItemList;
                }
                #region //1. List out all the patient with the provisional amount 

                else if (reqType != null && reqType.ToLower() == "listpatientunpaidtotal")
                {
                    // var patientList = patientDbContext.Patients;
                    var allPatientCreditReceipts = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                                    join patient in phrmdbcontext.PHRMPatient
                                                    on bill.PatientId equals patient.PatientId
                                                    where (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption") && bill.Quantity != 0
                                                    //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                    group bill by new { patient.PatientId, patient.PatientCode, patient.FirstName, patient.LastName, patient.MiddleName, patient.DateOfBirth, patient.Gender } into p
                                                    select new
                                                    {
                                                        PatientId = p.Key.PatientId,
                                                        PatientCode = p.Key.PatientCode,
                                                        ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                        p.Key.DateOfBirth,
                                                        Gender = p.Key.Gender,
                                                        Address = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.Address),
                                                        PhoneNumber = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.PhoneNumber),
                                                        PANNumber = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.PANNumber),
                                                        //DateOfBirth = p.Max(a => a.DateOfBirth.Value),
                                                        LastCreditBillDate = p.Max(a => a.CreatedOn.Value),
                                                        TotalCredit = Math.Round(p.Sum(a => a.TotalAmount.Value), 2)
                                                    }).OrderByDescending(b => b.LastCreditBillDate).ToList();

                    responseData.Status = "OK";
                    responseData.Results = allPatientCreditReceipts;
                }

                else if (reqType != null && reqType.ToLower() == "provisionalitemsbypatientid")
                {

                    var patCreditItems = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                          where (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption") && bill.PatientId == patientId
                                          select bill).ToList();


                    responseData.Results = patCreditItems;
                    responseData.Status = "OK";

                }
                #endregion
                #region get patient deposit
                else if (reqType != null && reqType == "patAllDeposits" && patientId != null && patientId != 0)
                {
                    var PatientDeposit = (from data in phrmdbcontext.DepositModel
                                          where data.PatientId == patientId
                                          group data by new { data.PatientId, data.DepositType } into p
                                          select new
                                          {
                                              DepositType = p.Key.DepositType,
                                              DepositAmount = p.Sum(a => a.DepositAmount),
                                          }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = PatientDeposit;
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

        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string reqType = this.ReadQueryStringData("reqType");
            int requisitionId = Convert.ToInt32(this.ReadQueryStringData("requisitionId"));
            int StoreId = Convert.ToInt32(this.ReadQueryStringData("storeId"));

            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string str = this.ReadPostData();
            try
            {

                var test = phrmdbcontext.PHRMBillTransactionItems;
                #region POST : setting-supplier manage
                if (reqType == "supplier")
                {
                    PHRMSupplierModel supplierData = DanpheJSONConvert.DeserializeObject<PHRMSupplierModel>(str);
                    supplierData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMSupplier.Add(supplierData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = supplierData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST : setting-company manage
                else if (reqType == "company")
                {
                    PHRMCompanyModel companyData = DanpheJSONConvert.DeserializeObject<PHRMCompanyModel>(str);
                    companyData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMCompany.Add(companyData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = companyData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST : setting-dispensary manage
                else if (reqType == "dispensary")
                {
                    PHRMDispensaryModel dispensaryData = DanpheJSONConvert.DeserializeObject<PHRMDispensaryModel>(str);
                    dispensaryData.CreatedOn = System.DateTime.Now;
                    dispensaryData.CreatedBy = currentUser.EmployeeId;
                    phrmdbcontext.PHRMDispensary.Add(dispensaryData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = dispensaryData;
                    responseData.Status = "OK";
                }
                #endregion

                #region POST : sales-category details
                else if (reqType == "postsalescategorydetail")
                {
                    PHRMStoreSalesCategoryModel salescategoryData = DanpheJSONConvert.DeserializeObject<PHRMStoreSalesCategoryModel>(str);
                    salescategoryData.CreatedOn = System.DateTime.Now;
                    salescategoryData.CreatedBy = currentUser.EmployeeId;
                    phrmdbcontext.PHRMStoreSalesCategory.Add(salescategoryData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = salescategoryData;
                    responseData.Status = "OK";
                }
                #endregion

                #region POST : setting-category manage
                else if (reqType == "category")
                {
                    PHRMCategoryModel categoryData = DanpheJSONConvert.DeserializeObject<PHRMCategoryModel>(str);
                    categoryData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMCategory.Add(categoryData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = categoryData;
                    responseData.Status = "OK";
                }

                #endregion
                #region POST : Send SMS
                else if (reqType == "sendsms")
                {

                    using (var client = new WebClient())
                    {
                        var values = new NameValueCollection();
                        values["from"] = "Demo";
                        values["token"] = "1eZClpxXFuZXd7PJ0xmv";
                        values["to"] = "9843284915";
                        values["text"] = "Hello Brother!!! This is sparrow";
                        var response = client.UploadValues("http://api.sparrowsms.com/v2/sms/", "Post", values);
                        var responseString = Encoding.Default.GetString(response);
                        return responseString;
                    }
                }

                #endregion
                #region POST : setting-item manage
                else if (reqType == "item")
                {
                    PHRMItemMasterModel itemData = DanpheJSONConvert.DeserializeObject<PHRMItemMasterModel>(str);
                    itemData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMItemMaster.Add(itemData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = itemData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST : setting-tax manage
                else if (reqType == "tax")
                {
                    PHRMTAXModel taxData = DanpheJSONConvert.DeserializeObject<PHRMTAXModel>(str);
                    taxData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMTAX.Add(taxData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = taxData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST : Generic Name manage
                else if (reqType == "genericName")
                {
                    PHRMGenericModel genericData = DanpheJSONConvert.DeserializeObject<PHRMGenericModel>(str);
                    genericData.CreatedOn = System.DateTime.Now;
                    int genId = phrmdbcontext.PHRMGenericModel.OrderByDescending(a => a.GenericId).First().GenericId;
                    genericData.GenericId = genId + 1;
                    genericData.CategoryId = 109;
                    genericData.CreatedBy = currentUser.EmployeeId;
                    phrmdbcontext.PHRMGenericModel.Add(genericData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = genericData;
                    responseData.Status = "OK";
                }
                #endregion

                #region Post:Drugs Request
                else if (reqType == "drug-requistion")
                {

                    PHRMDrugsRequistionModel drugReq = DanpheJSONConvert.DeserializeObject<PHRMDrugsRequistionModel>(str);
                    drugReq.CreatedOn = System.DateTime.Now;
                    drugReq.CreatedBy = currentUser.EmployeeId;
                    drugReq.Status = "pending";
                    phrmdbcontext.DrugRequistion.Add(drugReq);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = drugReq;
                    responseData.Status = "OK";
                }

                #endregion
                #region Post : drugs request Item from the nursing dept.
                else if (reqType == "post-provisional-item")
                {
                    List<PHRMDrugsRequistionItemsModel> provisionlaItem = DanpheJSONConvert.DeserializeObject<List<PHRMDrugsRequistionItemsModel>>(str);

                    if (provisionlaItem != null) //check client data is null or not
                    {
                        List<PHRMDrugsRequistionItemsModel> finalInvoiceData = PharmacyBL.ProvisionalItem(provisionlaItem, phrmdbcontext, currentUser);

                        if (finalInvoiceData != null)
                        {

                            for (int i = 0; i < finalInvoiceData.Count; i++)
                            {
                                PHRMDrugsRequistionModel drugReqData = new PHRMDrugsRequistionModel();

                                drugReqData.RequisitionId = finalInvoiceData[i].RequisitionId;
                                drugReqData.PatientId = finalInvoiceData[i].PatientId;
                                var requisitionItemId = finalInvoiceData[i].RequisitionItemId;
                                var newDrugReq = phrmdbcontext.DrugRequistion.Where(itm => itm.RequisitionId == drugReqData.RequisitionId).FirstOrDefault();

                                newDrugReq.Status = "Complete";
                                phrmdbcontext.DrugRequistion.Attach(newDrugReq);
                                phrmdbcontext.Entry(newDrugReq).State = EntityState.Modified;
                                phrmdbcontext.Entry(newDrugReq).Property(x => x.Status).IsModified = true;
                                phrmdbcontext.SaveChanges();


                            }
                            responseData.Status = "OK";
                            responseData.Results = finalInvoiceData;

                        }
                        else
                        {
                            responseData.ErrorMessage = "Nursing Drugs Details is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Nursing Drugs Details is null.";
                        responseData.Status = "Failed";
                    }

                }
                #endregion

                #region Post:Drugs Request Item
                else if (reqType == "drug-requistion-item")
                {
                    PHRMDrugsRequistionModel drugReq = DanpheJSONConvert.DeserializeObject<PHRMDrugsRequistionModel>(str);
                    drugReq.CreatedOn = System.DateTime.Now;
                    drugReq.CreatedBy = currentUser.EmployeeId;
                    phrmdbcontext.DrugRequistion.Add(drugReq);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = drugReq;
                    responseData.Status = "OK";


                }
                #endregion

                #region Post : ward request Item from the wardSupply dept.
                else if (reqType == "post-ward-requesition-item")
                {
                    WARDDispatchModel wardDispatchItems = DanpheJSONConvert.DeserializeObject<WARDDispatchModel>(str);

                    if (wardDispatchItems != null)//check client data is null or not
                    {
                        WARDDispatchModel finalInvoiceData = PharmacyBL.WardRequisitionItemsDispatch(wardDispatchItems, phrmdbcontext, currentUser, requisitionId);
                        if (finalInvoiceData != null)
                        {

                            responseData.Status = "OK";
                            responseData.Results = finalInvoiceData;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Requistiion details are null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Ward Requisition details is null.";
                        responseData.Status = "Failed";
                    }

                }
                #endregion
                //#region POST : NarcoticRecord Name manage
                //else if (reqType == "NarcoticName")
                //{
                //    //to insert records for narcotics drugs and their respective patient and doctor
                //    PHRMNarcoticRecord narcoticData = DanpheJSONConvert.DeserializeObject<PHRMNarcoticRecord>(str);
                //    narcoticData.CreatedOn = System.DateTime.Now;
                //    narcoticData.CreatedBy = currentUser.EmployeeId;
                //    phrmdbcontext.PHRMNarcoticRecord.Add(narcoticData);
                //    phrmdbcontext.SaveChanges();
                //    responseData.Results = narcoticData;
                //    responseData.Status = "OK";
                //}
                //#endregion
                //Patient
                //We register Outdoor patient information using this method in pharmacy
                #region POST: Patient Registration
                else if (reqType == "outdoorPatRegistration")
                {
                    PHRMPatient patientData = DanpheJSONConvert.DeserializeObject<PHRMPatient>(str);
                    patientData.CreatedOn = System.DateTime.Now;
                    patientData.CountrySubDivisionId = 76; //this is hardcoded because there is no provision to enter in countrysubdivision id 
                    patientData.CountryId = 1;//this is hardcoded because there is no provision to enter in country id
                    phrmdbcontext.PHRMPatient.Add(patientData);
                    phrmdbcontext.SaveChanges();
                    patientData.PatientCode = this.GetPatientCode(patientData.PatientId);
                    patientData.PatientNo = this.GetPatientNo(patientData.PatientId);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = patientData;
                    responseData.Status = "OK";
                }
                #endregion
                #region creating New Order (saving the PO and POitems)
                else if (reqType != null && reqType == "PurchaseOrder")
                {
                    PHRMPurchaseOrderModel poFromClient = DanpheJSONConvert.DeserializeObject<PHRMPurchaseOrderModel>(str);
                    if (poFromClient != null && poFromClient.PHRMPurchaseOrderItems != null && poFromClient.PHRMPurchaseOrderItems.Count > 0)
                    {
                        ////setting Flag for checking whole transaction 
                        Boolean flag = false;
                        flag = PharmacyBL.PostPOWithPOItems(poFromClient, phrmdbcontext);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "PO and PO Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }

                    }

                }
                #endregion

                #region ////POST New GOOD Receipt Request To Db with Entry in GR, GRItems, Stock, StockIn, StockItem 
                else if (reqType != null && reqType == "postGoodReceipt")
                {

                    PHRMGoodsReceiptViewModel grViewModelData = DanpheJSONConvert.DeserializeObject<PHRMGoodsReceiptViewModel>(str);

                    if (grViewModelData != null)
                    {
                        var maxGoodReceipt = phrmdbcontext.PHRMGoodsReceipt.ToList();
                        if (maxGoodReceipt.Count() == 0)
                        {
                            grViewModelData.goodReceipt.GoodReceiptPrintId = 1;

                        }
                        else
                            grViewModelData.goodReceipt.GoodReceiptPrintId = maxGoodReceipt.OrderByDescending(a => a.GoodReceiptPrintId).First().GoodReceiptPrintId + 1;


                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        ////setting Flag for checking whole transaction of GoodsReceipts
                        Boolean flag = false;
                        flag = PharmacyBL.GoodReceiptTransaction(grViewModelData, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Goods Related Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }

                }
                #endregion
                #region POST : setting-unitofmeasurement manage
                else if (reqType == "unitofmeasurement")
                {
                    PHRMUnitOfMeasurementModel uomData = DanpheJSONConvert.DeserializeObject<PHRMUnitOfMeasurementModel>(str);
                    uomData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMUnitOfMeasurement.Add(uomData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = uomData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST : setting-itemtype manage
                else if (reqType == "itemtype")
                {
                    PHRMItemTypeModel itemtypeData = DanpheJSONConvert.DeserializeObject<PHRMItemTypeModel>(str);
                    itemtypeData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMItemType.Add(itemtypeData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = itemtypeData;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST: Prescription
                //reqType == "postprescription" might be removed, not needed after integration with clinical-orders.
                else if (reqType == "postprescription")
                {
                    PHRMPrescriptionModel prescriptionData = DanpheJSONConvert.DeserializeObject<PHRMPrescriptionModel>(str);
                    phrmdbcontext.PHRMPrescription.Add(prescriptionData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = prescriptionData;
                    responseData.Status = "OK";
                }
                else if (reqType == "postprescriptionitem")
                {
                    List<PHRMPrescriptionItemModel> prescItems = DanpheJSONConvert.DeserializeObject<List<PHRMPrescriptionItemModel>>(str);
                    if (prescItems != null && prescItems.Count > 0)
                    {
                        foreach (var prItm in prescItems)
                        {
                            prItm.CreatedOn = System.DateTime.Now;
                            prItm.Quantity = prItm.Frequency.Value * prItm.HowManyDays.Value;
                            phrmdbcontext.PHRMPrescriptionItems.Add(prItm);

                        }

                    }

                    phrmdbcontext.SaveChanges();
                    responseData.Results = prescItems;
                    responseData.Status = "OK";
                }
                #endregion
                #region POST: Invoice with Invoice details- single transaction
                //Save Invoice details(sale) with Invoice Items
                //This Post for Invoice table,InvoiceItems table,StockTransaction table, 
                //Update on GRItems, update stock
                else if (reqType == "postinvoice")
                {
                    PHRMInvoiceTransactionModel invoiceDataFromClient = DanpheJSONConvert.DeserializeObject<PHRMInvoiceTransactionModel>(str);
                    if (invoiceDataFromClient != null)//check client data is null or not
                    {
                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        ////setting Flag for checking whole transaction 
                        /// Boolean flag = false;
                        // this helps invoice id to get started from one then increment by one
                        //var maxInvoice = phrmdbcontext.PHRMInvoiceTransaction.ToList();
                        //if (maxInvoice.Count() == 0)
                        //{
                        //    invoiceDataFromClient.InvoicePrintId = 1;
                        //}
                        //else
                            //  invoiceDataFromClient.InvoicePrintId = maxInvoice.OrderByDescending(a => a.InvoicePrintId).First().InvoicePrintId + 1;

                        invoiceDataFromClient.InvoicePrintId = PharmacyBL.GetInvoiceNumber(phrmdbcontext);


                        PHRMInvoiceTransactionModel finalInvoiceData = PharmacyBL.InvoiceTransaction(invoiceDataFromClient, phrmdbcontext, currentUser);

                        if (finalInvoiceData.DepositDeductAmount != null && finalInvoiceData.DepositDeductAmount > 0)
                        {
                            PHRMDepositModel dep = new PHRMDepositModel()
                            {
                                DepositType = "depositdeduct",
                                Remark = "deposit used for transactionid:" + finalInvoiceData.InvoiceId,
                                DepositAmount = finalInvoiceData.DepositAmount,
                                DepositBalance = finalInvoiceData.DepositBalance,
                                TransactionId = finalInvoiceData.InvoiceId,
                                FiscalYearId = finalInvoiceData.FiscalYearId,
                                CounterId = finalInvoiceData.CounterId,
                                CreatedBy = finalInvoiceData.CreatedBy,
                                CreatedOn = DateTime.Now,
                                PatientId = finalInvoiceData.PatientId,
                            };

                            phrmdbcontext.DepositModel.Add(dep);
                            phrmdbcontext.SaveChanges();
                        }

                        if (finalInvoiceData != null)
                        {
                            responseData.Status = "OK";
                            responseData.Results = finalInvoiceData;

                          
                        }
                        else
                        {
                            responseData.ErrorMessage = "Invoice details is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Invoice details is null.";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region POST: Credit Invoice with Invoice details- single transaction
                //Save Invoice Item Items
                //This Post for InvoiceItems table,StockTransaction table, 
                //Update on GRItems, update stock
                else if (reqType == "postCreditItems")
                {
                    PHRMInvoiceTransactionModel invoiceDataFromClient = DanpheJSONConvert.DeserializeObject<PHRMInvoiceTransactionModel>(str);
                    if (invoiceDataFromClient != null)//check client data is null or not
                    {
                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        ////setting Flag for checking whole transaction 
                        /// Boolean flag = false;
                        // this helps invoice id to get started from one then increment by one
                        PHRMInvoiceTransactionModel finalInvoiceData = PharmacyBL.CreditInvoiceTransaction(invoiceDataFromClient, phrmdbcontext, currentUser, requisitionId);
                        if (finalInvoiceData != null)
                        {
                            responseData.Status = "OK";
                            responseData.Results = finalInvoiceData;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Invoice details is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Invoice details is null.";
                        responseData.Status = "Failed";
                    }
                }

                else if (reqType == "addInvoiceForCrItems")
                {
                    PHRMInvoiceTransactionModel invoiceObjFromClient = DanpheJSONConvert.DeserializeObject<PHRMInvoiceTransactionModel>(str);

                    try
                    {
                        List<PHRMInvoiceTransactionItemsModel> invoiceItemsFromClient = invoiceObjFromClient.InvoiceItems;
                        invoiceObjFromClient.InvoiceItems = null;

                        //Make a Service later--Abhishek 5 Sep18
                        invoiceObjFromClient.IsOutdoorPat = null;
                        invoiceObjFromClient.PatientId = phrmdbcontext.PHRMInvoiceTransactionItems.Find(invoiceItemsFromClient[0].InvoiceItemId).PatientId.Value;
                        invoiceObjFromClient.CreateOn = DateTime.Now;
                        invoiceObjFromClient.CreatedBy = currentUser.EmployeeId;
                        //add fiscal year scope here.. MaxInvoiceNumber from CurrentFiscal Year..
                        invoiceObjFromClient.InvoicePrintId = PharmacyBL.GetInvoiceNumber(phrmdbcontext);
                        invoiceObjFromClient.FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId;
                        phrmdbcontext.PHRMInvoiceTransaction.Add(invoiceObjFromClient);
                        phrmdbcontext.SaveChanges();
                        PHRMInvoiceTransactionItemsModel itemFromServer = new PHRMInvoiceTransactionItemsModel();
                        foreach (PHRMInvoiceTransactionItemsModel itmFromClient in invoiceItemsFromClient)
                        {


                            itemFromServer = phrmdbcontext.PHRMInvoiceTransactionItems
                                                                      .Where(itm => itm.InvoiceItemId == itmFromClient.InvoiceItemId).FirstOrDefault();
                            if (itemFromServer != null)
                            {
                                phrmdbcontext.PHRMInvoiceTransactionItems.Attach(itemFromServer);


                                itemFromServer.InvoiceId = invoiceObjFromClient.InvoiceId;
                                itemFromServer.Quantity = itmFromClient.Quantity;
                                itemFromServer.SubTotal = itmFromClient.SubTotal;
                                itemFromServer.TotalAmount = itmFromClient.TotalAmount;
                                itemFromServer.BilItemStatus = "paid";


                                phrmdbcontext.Entry(itemFromServer).State = EntityState.Modified;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.InvoiceId).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.BilItemStatus).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.Quantity).IsModified = true;


                                //to uodate client side
                                itmFromClient.BilItemStatus = "paid";
                                itmFromClient.InvoiceId = itemFromServer.InvoiceId;

                            }


                        }
                        PHRMStockTransactionItemsModel stkTxnItm = new PHRMStockTransactionItemsModel();
                        foreach (var invoiceItem in invoiceItemsFromClient)
                        {
                            if (invoiceItem.ReturnQty != 0)
                            {
                                stkTxnItm.BatchNo = invoiceItem.BatchNo;
                                stkTxnItm.CreatedBy = currentUser.EmployeeId;
                                stkTxnItm.CreatedOn = DateTime.Now;
                                stkTxnItm.DiscountPercentage = invoiceItem.DiscountPercentage.Value;
                                stkTxnItm.FreeQuantity = invoiceItem.FreeQuantity;
                                stkTxnItm.GoodsReceiptItemId = invoiceItem.GoodReceiptItemId;
                                stkTxnItm.InOut = "in";
                                stkTxnItm.ItemId = invoiceItem.ItemId;
                                stkTxnItm.MRP = invoiceItem.MRP;
                                stkTxnItm.Price = invoiceItem.Price;
                                stkTxnItm.Quantity = invoiceItem.Quantity.Value;
                                stkTxnItm.ReferenceItemCreatedOn = DateTime.Now;
                                stkTxnItm.ReferenceNo = invoiceItem.InvoiceItemId;
                                stkTxnItm.SubTotal = invoiceItem.SubTotal.Value;
                                stkTxnItm.TotalAmount = invoiceItem.TotalAmount.Value;
                                stkTxnItm.TransactionType = "provisionalsalereturn";//status for provisional sales return
                                stkTxnItm.VATPercentage = invoiceItem.VATPercentage.Value;
                                stkTxnItm.ExpiryDate = invoiceItem.ExpiryDate;
                                phrmdbcontext.PHRMStockTransactionModel.Add(stkTxnItm);
                            }
                            phrmdbcontext.SaveChanges();
                        }

                        invoiceObjFromClient.InvoiceItems = invoiceItemsFromClient;
                        if (invoiceObjFromClient != null)
                        {
                            responseData.Status = "OK";
                            responseData.Results = invoiceObjFromClient;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Invoice details is null or failed to Save";
                            responseData.Status = "Failed";
                        }



                    }

                    catch (Exception)
                    {
                        throw;
                    }

                }
                #endregion
                else if (reqType == "updateInvoiceForCrItems")
                {
                    List<PHRMInvoiceTransactionItemsModel> invoiceObjFromClient = DanpheJSONConvert.DeserializeObject<List<PHRMInvoiceTransactionItemsModel>>(str);
                    try
                    {
                        List<PHRMInvoiceTransactionItemsModel> invoiceItemsFromClient = invoiceObjFromClient;
                        PHRMInvoiceTransactionItemsModel itemFromServer = new PHRMInvoiceTransactionItemsModel();
                        foreach (PHRMInvoiceTransactionItemsModel itm in invoiceItemsFromClient)
                        {
                            itemFromServer = phrmdbcontext.PHRMInvoiceTransactionItems.Where(a => a.InvoiceItemId == itm.InvoiceItemId).FirstOrDefault();
                            if (itemFromServer != null)
                            {
                                phrmdbcontext.PHRMInvoiceTransactionItems.Attach(itemFromServer);
                                itemFromServer.Quantity = itm.Quantity;
                                itemFromServer.SubTotal = itm.SubTotal;
                                itemFromServer.TotalAmount = itm.TotalAmount;
                                itemFromServer.BilItemStatus = "provisional";

                                phrmdbcontext.Entry(itemFromServer).State = EntityState.Modified;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.SubTotal).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.Quantity).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.TotalAmount).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.BilItemStatus).IsModified = true;

                            }
                        }
                        var currFiscalYear = PharmacyBL.GetFiscalYear(phrmdbcontext);
                        int? maxCreditNoteNum = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                        if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                        {
                            maxCreditNoteNum = 0;
                        }
                        PHRMInvoiceReturnItemsModel invReturn = new PHRMInvoiceReturnItemsModel();
                        foreach (var invoiceItem in invoiceItemsFromClient)
                        {
                            if (invoiceItem.ReturnQty != 0)
                            {
                                invReturn.InvoiceId = null;
                                invReturn.CounterId = invoiceItem.CounterId;
                                invReturn.InvoiceItemId = invoiceItem.InvoiceItemId;
                                invReturn.BatchNo = invoiceItem.BatchNo;
                                invReturn.CreatedBy = currentUser.EmployeeId;
                                invReturn.CreatedOn = DateTime.Now;
                                invReturn.DiscountPercentage = invoiceItem.DiscountPercentage.Value;
                                invReturn.ItemId = invoiceItem.ItemId;
                                invReturn.MRP = invoiceItem.MRP;
                                invReturn.Price = invoiceItem.Price;
                                invReturn.Quantity = (invoiceItem.ReturnQty);
                                invReturn.SubTotal = invoiceItem.SubTotal.Value;
                                invReturn.TotalAmount = invoiceItem.TotalAmount.Value;
                                invReturn.VATPercentage = invoiceItem.VATPercentage.Value;
                                invReturn.ExpiryDate = invoiceItem.ExpiryDate;
                                invReturn.FiscalYearId = currFiscalYear.FiscalYearId;
                                invReturn.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                                phrmdbcontext.PHRMInvoiceReturnItemsModel.Add(invReturn);
                            }
                            phrmdbcontext.SaveChanges();
                        }

                        //# post to PHRMDispensaryStock tables.
                        List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                        invoiceItemsFromClient.ForEach(
                            itm =>
                            {
                                PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                                tempdispensaryStkTxn.AvailableQuantity = itm.ReturnQty;
                                tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                                tempdispensaryStkTxn.MRP = itm.MRP;
                                tempdispensaryStkTxn.InOut = "in";
                                tempdispensaryStkTxn.ItemId = itm.ItemId;
                                tempdispensaryStkTxn.Price = itm.Price;
                                tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                                phrmDispensaryItems.Add(tempdispensaryStkTxn);
                            }
                            );
                        var addUpdateDispensaryReslt = PharmacyBL.AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                        if (addUpdateDispensaryReslt)
                        {
                            phrmdbcontext.SaveChanges();
                        }
                        PHRMStockTransactionItemsModel stkTxnItm = new PHRMStockTransactionItemsModel();

                        foreach (var invoiceItem in invoiceItemsFromClient)
                        {
                            //stkTxnItm = phrmdbcontext.PHRMInvoiceTransactionItems.Where(a => a.InvoiceItemId == itm.InvoiceItemId).FirstOrDefault();

                            if (invoiceItem.ReturnQty != 0)
                            {
                                stkTxnItm.BatchNo = invoiceItem.BatchNo;
                                stkTxnItm.CreatedBy = currentUser.EmployeeId;
                                stkTxnItm.CreatedOn = DateTime.Now;
                                stkTxnItm.DiscountPercentage = invoiceItem.DiscountPercentage.Value;
                                stkTxnItm.FreeQuantity = invoiceItem.FreeQuantity;
                                stkTxnItm.GoodsReceiptItemId = invoiceItem.GoodReceiptItemId;
                                stkTxnItm.InOut = "in";
                                stkTxnItm.ItemId = invoiceItem.ItemId;
                                stkTxnItm.MRP = invoiceItem.MRP;
                                stkTxnItm.Price = invoiceItem.Price;
                                stkTxnItm.Quantity = invoiceItem.ReturnQty;
                                stkTxnItm.ReferenceItemCreatedOn = DateTime.Now;
                                stkTxnItm.ReferenceNo = invoiceItem.InvoiceItemId;
                                stkTxnItm.SubTotal = invoiceItem.SubTotal.Value;
                                stkTxnItm.TotalAmount = invoiceItem.TotalAmount.Value;
                                stkTxnItm.TransactionType = "provisionalsalereturn";//status for provisional sales return  
                                stkTxnItm.VATPercentage = invoiceItem.VATPercentage.Value;
                                stkTxnItm.ExpiryDate = invoiceItem.ExpiryDate;
                                phrmdbcontext.PHRMStockTransactionModel.Add(stkTxnItm);
                            }
                            phrmdbcontext.SaveChanges();
                        }

                        // invoiceObjFromClient.InvoiceItems = invoiceItemsFromClient;
                        if (invoiceObjFromClient != null)
                        {
                            responseData.Status = "OK";
                            responseData.Results = invoiceObjFromClient;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Invoice details is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }

                    catch (Exception)
                    {
                        throw;
                    }

                }
                else if (reqType == "cancelCreditItems")
                {
                    List<PHRMInvoiceTransactionItemsModel> invoiceObjFromClient = DanpheJSONConvert.DeserializeObject<List<PHRMInvoiceTransactionItemsModel>>(str);

                    try
                    {
                        PHRMInvoiceTransactionItemsModel itemFromServer = new PHRMInvoiceTransactionItemsModel();
                        foreach (PHRMInvoiceTransactionItemsModel itmFromClient in invoiceObjFromClient)
                        {

                            itemFromServer = phrmdbcontext.PHRMInvoiceTransactionItems
                                                                      .Where(itm => itm.InvoiceItemId == itmFromClient.InvoiceItemId).FirstOrDefault();
                            if (itemFromServer != null)
                            {
                                phrmdbcontext.PHRMInvoiceTransactionItems.Attach(itemFromServer);

                                itemFromServer.Quantity = itmFromClient.Quantity;
                                itemFromServer.SubTotal = itmFromClient.SubTotal;
                                itemFromServer.TotalAmount = itmFromClient.TotalAmount;
                                itemFromServer.BilItemStatus = "provisionalcancel";

                                phrmdbcontext.Entry(itemFromServer).State = EntityState.Modified;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.BilItemStatus).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.Quantity).IsModified = true;
                                //to update client side
                                itmFromClient.BilItemStatus = "provisionalcancel";
                                itmFromClient.InvoiceId = itemFromServer.InvoiceId;
                                phrmdbcontext.SaveChanges();
                            }
                        }

                        //# post to PHRMDispensaryStock tables.
                        List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                        invoiceObjFromClient.ForEach(
                            itm =>
                            {
                                PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                                tempdispensaryStkTxn.AvailableQuantity = itm.DispatchQty;
                                tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                                tempdispensaryStkTxn.MRP = itm.MRP;
                                tempdispensaryStkTxn.InOut = "in";
                                tempdispensaryStkTxn.ItemId = itm.ItemId;
                                tempdispensaryStkTxn.Price = itm.Price;
                                tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                                phrmDispensaryItems.Add(tempdispensaryStkTxn);
                            }
                            );
                        var addUpdateDispensaryReslt = PharmacyBL.AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                        if (addUpdateDispensaryReslt)
                        {
                            phrmdbcontext.SaveChanges();
                        }
                        PHRMStockTransactionItemsModel stkTxnItm = new PHRMStockTransactionItemsModel();
                        foreach (var invoiceItem in invoiceObjFromClient)
                        {
                            stkTxnItm = phrmdbcontext.PHRMStockTransactionModel.Where(itm => itm.ReferenceNo == invoiceItem.InvoiceItemId).FirstOrDefault();

                            phrmdbcontext.PHRMStockTransactionModel.Attach(stkTxnItm);

                            stkTxnItm.CreatedBy = currentUser.EmployeeId;
                            stkTxnItm.CreatedOn = DateTime.Now;
                            stkTxnItm.InOut = "in";
                            stkTxnItm.TransactionType = "provisionalcancel";

                            phrmdbcontext.Entry(stkTxnItm).State = EntityState.Modified;
                            phrmdbcontext.Entry(stkTxnItm).Property(x => x.InOut).IsModified = true;
                            phrmdbcontext.Entry(stkTxnItm).Property(x => x.TransactionType).IsModified = true;
                            phrmdbcontext.Entry(stkTxnItm).Property(x => x.CreatedOn).IsModified = true;
                            phrmdbcontext.Entry(stkTxnItm).Property(x => x.CreatedBy).IsModified = true;

                            phrmdbcontext.SaveChanges();

                        }
                        if (invoiceObjFromClient != null)
                        {
                            responseData.Status = "OK";
                            responseData.Results = invoiceObjFromClient;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Invoice details is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }

                    catch (Exception ex)
                    {
                        throw ex;
                    }

                }


                #region post Return Items to Supplier or Vendor
                else if (reqType != null && reqType == "postReturnToSupplierItems")
                {

                    PHRMReturnToSupplierModel retSupplModel = DanpheJSONConvert.DeserializeObject<PHRMReturnToSupplierModel>(str);

                    if (retSupplModel != null)
                    {
                        var maxretSupp = phrmdbcontext.PHRMReturnToSupplier.ToList();
                        if (maxretSupp.Count() == 0)
                        {
                            retSupplModel.CreditNotePrintId = 1;

                        }
                        else
                            retSupplModel.CreditNotePrintId = maxretSupp.OrderByDescending(a => a.CreditNotePrintId).First().CreditNotePrintId + 1;

                        ////setting Flag for checking whole transaction of Return Items To Supplier
                        Boolean flag = false;
                        flag = PharmacyBL.ReturnItemsToSupplierTransaction(retSupplModel, phrmdbcontext);
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
                #region Save WriteOff and WriteOffItems
                else if (reqType != null && reqType == "postWriteOffItems")
                {
                    PHRMWriteOffModel writeOffModel = DanpheJSONConvert.DeserializeObject<PHRMWriteOffModel>(str);

                    if (writeOffModel != null)
                    {
                        ////setting Flag for checking whole transaction of Return Items To Supplier
                        Boolean flag = false;
                        flag = PharmacyBL.WriteOffItemTransaction(writeOffModel, phrmdbcontext);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Write Off Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion
                #region Return invoice items from customer      
                else if (reqType != null && reqType == "returnfromcustomer")
                {

                    List<PHRMInvoiceReturnItemsModel> clientData = DanpheJSONConvert.DeserializeObject<List<PHRMInvoiceReturnItemsModel>>(str);

                    if (clientData != null)
                    {
                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        //flag check all transaction successfully completed or not
                        Boolean flag = false;
                        flag = PharmacyBL.ReturnFromCustomerTransaction(clientData, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Return invoice Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                        var invoiceretId = clientData.Select(a => a.InvoiceId).FirstOrDefault();
                       
                    }
                }
                #endregion
                #region POST : update stockManage transaction, Post to StockManage table and post to stockTxnItem table                 
                else if (reqType == "manage-stock-detail")
                {
                    PHRMStockManageModel stockManageData = DanpheJSONConvert.DeserializeObject<PHRMStockManageModel>(str);
                    if (stockManageData != null)
                    {
                        Boolean flag = false;
                        flag = PharmacyBL.StockManageTransaction(stockManageData, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Write Off Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion
                #region POST : update storeManage transaction, Post to StoreStock table           
                else if (reqType == "manage-store-detail")
                {
                    PHRMStoreStockModel storeManageData = DanpheJSONConvert.DeserializeObject<PHRMStoreStockModel>(str);
                    if (storeManageData != null)
                    {
                        Boolean flag = false;
                        flag = PharmacyBL.StoreManageTransaction(storeManageData, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Write Off Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion
                #region POST: transfer to Dispensary, update Store Stock
                else if (reqType == "transfer-to-dispensary")
                {
                    PHRMStoreStockModel storeStockData = DanpheJSONConvert.DeserializeObject<PHRMStoreStockModel>(str);
                    if (storeStockData != null)
                    {
                        Boolean flag = false;
                        flag = PharmacyBL.TransferStoreStockToDispensary(storeStockData, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Transfer failed";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion
                #region POST: transfer to Store, update Dispensary Stock
                else if (reqType == "transfer-to-store")
                {
                    PHRMStockTransactionItemsModel dispensaryStockData = DanpheJSONConvert.DeserializeObject<PHRMStockTransactionItemsModel>(str);
                    if (dispensaryStockData != null)
                    {
                        Boolean flag = false;
                        flag = PharmacyBL.TransferDispensaryStockToStore(dispensaryStockData, StoreId, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Transfer failed";
                            responseData.Status = "Failed";
                        }
                    }
                }
                #endregion
                #region cancel goods receipt and post to stock transaction items table
                else if (reqType == "cancel-goods-receipt")
                {

                    int goodReceiptId = int.Parse(str);
                    bool flag = true;
                    flag = PharmacyBL.CancelGoodsReceipt(phrmdbcontext, goodReceiptId, currentUser);
                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "Goods Receipt Cancelation Failed!!";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region post deposit data
                else if (reqType == "depositData")
                {
                    PHRMDepositModel deposit = DanpheJSONConvert.DeserializeObject<PHRMDepositModel>(str);
                    deposit.DepositId = 0;
                    deposit.CreatedOn = System.DateTime.Now;
                    deposit.CreatedBy = currentUser.EmployeeId;
                    BillingFiscalYear fiscYear = PharmacyBL.GetFiscalYear(connString);
                    deposit.FiscalYearId = fiscYear.FiscalYearId;
                    if (deposit.DepositType != "depositdeduct")
                        deposit.ReceiptNo = PharmacyBL.GetDepositReceiptNo(connString);
                    deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                    EmployeeModel currentEmp = phrmdbcontext.Employees.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                    deposit.PhrmUser = currentEmp.FirstName + " " + currentEmp.LastName;
                    phrmdbcontext.DepositModel.Add(deposit);
                    phrmdbcontext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = deposit;
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

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string reqType = this.ReadQueryStringData("reqType");
            int invoiceNo = ToInt(this.ReadQueryStringData("invoiceNo"));
            int PrintCount = ToInt(this.ReadQueryStringData("PrintCount"));
            int itemId = ToInt(this.ReadQueryStringData("itemId"));
            int rackId = ToInt(this.ReadQueryStringData("rackId"));

            string str = this.ReadPostData();
            try
            {
                if (!String.IsNullOrEmpty(str))
                {
                    #region PUT : setting-supplier manage
                    if (reqType == "supplier")
                    {
                        PHRMSupplierModel supplierData = DanpheJSONConvert.DeserializeObject<PHRMSupplierModel>(str);
                        phrmdbcontext.PHRMSupplier.Attach(supplierData);
                        phrmdbcontext.Entry(supplierData).State = EntityState.Modified;
                        phrmdbcontext.Entry(supplierData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(supplierData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = supplierData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-company manage
                    else if (reqType == "company")
                    {
                        PHRMCompanyModel companyData = DanpheJSONConvert.DeserializeObject<PHRMCompanyModel>(str);
                        phrmdbcontext.PHRMCompany.Attach(companyData);
                        phrmdbcontext.Entry(companyData).State = EntityState.Modified;
                        phrmdbcontext.Entry(companyData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(companyData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = companyData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-dispensary manage
                    else if (reqType == "dispensary")
                    {
                        PHRMDispensaryModel dispensaryData = DanpheJSONConvert.DeserializeObject<PHRMDispensaryModel>(str);
                        phrmdbcontext.PHRMDispensary.Attach(dispensaryData);
                        phrmdbcontext.Entry(dispensaryData).State = EntityState.Modified;
                        phrmdbcontext.Entry(dispensaryData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(dispensaryData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = dispensaryData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-category manage
                    else if (reqType == "category")
                    {
                        PHRMCategoryModel categoryData = DanpheJSONConvert.DeserializeObject<PHRMCategoryModel>(str);
                        phrmdbcontext.PHRMCategory.Attach(categoryData);
                        phrmdbcontext.Entry(categoryData).State = EntityState.Modified;
                        phrmdbcontext.Entry(categoryData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(categoryData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = categoryData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-unitofmeasurement manage
                    else if (reqType == "unitofmeasurement")
                    {
                        PHRMUnitOfMeasurementModel uomData = DanpheJSONConvert.DeserializeObject<PHRMUnitOfMeasurementModel>(str);
                        phrmdbcontext.PHRMUnitOfMeasurement.Attach(uomData);
                        phrmdbcontext.Entry(uomData).State = EntityState.Modified;
                        phrmdbcontext.Entry(uomData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(uomData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = uomData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-itemtype manage
                    else if (reqType == "itemtype")
                    {
                        PHRMItemTypeModel itemtypeData = DanpheJSONConvert.DeserializeObject<PHRMItemTypeModel>(str);
                        phrmdbcontext.PHRMItemType.Attach(itemtypeData);
                        phrmdbcontext.Entry(itemtypeData).State = EntityState.Modified;
                        phrmdbcontext.Entry(itemtypeData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(itemtypeData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = itemtypeData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-item manage
                    else if (reqType == "item")
                    {
                        PHRMItemMasterModel itemData = DanpheJSONConvert.DeserializeObject<PHRMItemMasterModel>(str);
                        phrmdbcontext.PHRMItemMaster.Attach(itemData);
                        phrmdbcontext.Entry(itemData).State = EntityState.Modified;
                        phrmdbcontext.Entry(itemData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(itemData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = itemData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT : setting-tax manage
                    else if (reqType == "tax")
                    {
                        PHRMTAXModel taxData = DanpheJSONConvert.DeserializeObject<PHRMTAXModel>(str);
                        phrmdbcontext.PHRMTAX.Attach(taxData);
                        phrmdbcontext.Entry(taxData).State = EntityState.Modified;
                        phrmdbcontext.Entry(taxData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(taxData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = taxData;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT: Generic Name
                    else if (reqType == "genericName")
                    {
                        PHRMGenericModel genericData = DanpheJSONConvert.DeserializeObject<PHRMGenericModel>(str);
                        phrmdbcontext.PHRMGenericModel.Attach(genericData);
                        phrmdbcontext.Entry(genericData).State = EntityState.Modified;
                        phrmdbcontext.Entry(genericData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(genericData).Property(x => x.CreatedBy).IsModified = false;
                        genericData.ModifiedOn = System.DateTime.Now;
                        genericData.ModifiedBy = currentUser.EmployeeId;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = genericData;
                        responseData.Status = "OK";
                    }
                    #endregion

                    #region PUT : sale-Invoice Items provisional Bill Payment
                    else if (reqType == "InvItemsCreditPay")
                    {
                        List<PHRMInvoiceTransactionItemsModel> invItmsData = DanpheJSONConvert.DeserializeObject<List<PHRMInvoiceTransactionItemsModel>>(str);
                        decimal? paidAmount = 0;
                        int invoiceId = invItmsData[0].InvoiceId.Value;//Invoice id for update provisional amount and status
                        invItmsData.ForEach(
                            invItm =>
                            {
                                phrmdbcontext.PHRMInvoiceTransactionItems.Attach(invItm);
                                phrmdbcontext.Entry(invItm).State = EntityState.Modified;
                                phrmdbcontext.Entry(invItm).Property(x => x.BilItemStatus).IsModified = true;
                                phrmdbcontext.Entry(invItm).Property(x => x.BatchNo).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.CompanyId).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.CreatedBy).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.CreatedOn).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.DiscountPercentage).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.FreeQuantity).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.GrItemPrice).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.InvoiceId).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.ItemId).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.ItemName).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.MRP).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.Price).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.Quantity).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.Remark).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.SubTotal).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.TotalAmount).IsModified = false;
                                phrmdbcontext.Entry(invItm).Property(x => x.VATPercentage).IsModified = false;
                                paidAmount = paidAmount + invItm.TotalAmount; //addition of paidAmount for Invoice provisional Amount Updation
                            }
                            );
                        phrmdbcontext.SaveChanges();//save changes of items status updation

                        //get paid invoice items count , if all items bill status is paid then  need to update invoice bill status also
                        var unpaidBillStatusCount = (from invItms in phrmdbcontext.PHRMInvoiceTransactionItems
                                                     where invItms.BilItemStatus != "paid" && invItms.InvoiceId == invoiceId
                                                     select invItms).ToList().Count;

                        //get Invoice details by invoice id for updation status and provisional amount
                        PHRMInvoiceTransactionModel invoiceDeta = (from inv in phrmdbcontext.PHRMInvoiceTransaction
                                                                   where inv.InvoiceId == invoiceId
                                                                   select inv).FirstOrDefault();
                        invoiceDeta.BilStatus = (unpaidBillStatusCount > 0) ? "unpaid" : "paid";
                        invoiceDeta.CreditAmount = invoiceDeta.CreditAmount - paidAmount;
                        invoiceDeta.PaidAmount = invoiceDeta.PaidAmount + paidAmount;
                        //modify invoice bill status and provisional amount details
                        phrmdbcontext.PHRMInvoiceTransaction.Attach(invoiceDeta);
                        //Use property level EntityState Modified -- sudarshan: 5Sept'18
                        phrmdbcontext.Entry(invoiceDeta).State = EntityState.Modified;
                        phrmdbcontext.SaveChanges();

                        responseData.Results = 1;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region PUT: Setting- Stock Txn Items Price manage                    
                    else if (reqType == "put-stockTxnItemMRP")
                    {
                        //PHRMStockTransactionItemsModel itm = DanpheJSONConvert.DeserializeObject<PHRMStockTransactionItemsModel>(str);
                        //PHRMStockTransactionItemsModel res = (from stkItm in phrmdbcontext.PHRMStockTransactionModel
                        //                                      where stkItm.StockTxnItemId == itm.StockTxnItemId
                        //                                      select stkItm).FirstOrDefault();
                        PHRMDispensaryStockModel itm = DanpheJSONConvert.DeserializeObject<PHRMDispensaryStockModel>(str);
                        var res = (from stkItm in phrmdbcontext.DispensaryStock
                                   where stkItm.StockId == itm.StockId
                                   select stkItm).FirstOrDefault();
                        if (res.StockId > 0)
                        {

                            res.MRP = itm.MRP;
                            phrmdbcontext.DispensaryStock.Attach(res);
                            phrmdbcontext.Entry(res).State = EntityState.Modified;
                            phrmdbcontext.Entry(res).Property(x => x.MRP).IsModified = true;
                            phrmdbcontext.SaveChanges();
                            responseData.Results = res;
                            responseData.Status = "OK";
                        }

                        else
                        {
                            responseData.Results = itm;
                            responseData.Status = "Failed";
                        }

                    }

                    else if (reqType == "UpdatePrintCountafterPrint")
                    {
                        PHRMInvoiceTransactionModel dbPhrmBillPrintReq = phrmdbcontext.PHRMInvoiceTransaction
                                       .Where(a => a.InvoiceId == invoiceNo).FirstOrDefault<PHRMInvoiceTransactionModel>();
                        if (dbPhrmBillPrintReq != null)
                        {
                            dbPhrmBillPrintReq.PrintCount = PrintCount;
                            phrmdbcontext.Entry(dbPhrmBillPrintReq).State = EntityState.Modified;
                        }

                        phrmdbcontext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = "Print count updated successfully.";
                    }
                    #endregion

                    else if (reqType == "add-Item-to-rack")
                    {
                        PHRMItemMasterModel dbphrmItem = phrmdbcontext.PHRMItemMaster
                                       .Where(a => a.ItemId == itemId).FirstOrDefault<PHRMItemMasterModel>();
                        if (dbphrmItem != null)
                        {
                            dbphrmItem.Rack = rackId;
                            phrmdbcontext.Entry(dbphrmItem).State = EntityState.Modified;
                        }

                        phrmdbcontext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = "Print count updated successfully.";
                    }
                    #region Update Deposit PrintCount
                    else if (reqType == "updateDepositPrint")
                    {
                        PHRMDepositModel depositModel = DanpheJSONConvert.DeserializeObject<PHRMDepositModel>(str);
                        PHRMDepositModel data = (from depositData in phrmdbcontext.DepositModel
                                                 where depositModel.DepositId == depositData.DepositId
                                                 select depositData).FirstOrDefault();
                        if (data.DepositId > 0)
                        {
                            data.PrintCount = data.PrintCount == 0 ? 1 : data.PrintCount == null ? 1 : data.PrintCount + 1;
                            phrmdbcontext.DepositModel.Attach(data);
                            phrmdbcontext.Entry(data).State = EntityState.Modified;
                            phrmdbcontext.Entry(data).Property(x => x.PrintCount).IsModified = true;
                            phrmdbcontext.SaveChanges();
                            responseData.Results = data;
                            responseData.Status = "OK";
                        }
                        else
                        {
                            responseData.Results = "";
                            responseData.Status = "failed";
                        }
                    }
                    #endregion
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Client Object is empty";
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
        public int GetPatientNo(int patientId)
        {
            try
            {
                if (patientId != 0)
                {
                    int newPatNo = 0;

                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                    newPatNo = maxPatNo.Value + 1;

                    return newPatNo;
                }
                else
                    throw new Exception("Invalid PatientId");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public string GetPatientCode(int patientId)
        {
            try
            {
                if (patientId != 0)
                {
                    NewPatientUniqueNumbersVM retValue = new NewPatientUniqueNumbersVM();
                    int newPatNo = 0;
                    string newPatCode = "";

                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                    newPatNo = maxPatNo.Value + 1;


                    string patCodeFormat = "YYMM-PatNum";//this is default value.
                    string hospitalCode = "";//default empty


                    CoreDbContext coreDbContext = new CoreDbContext(connString);

                    List<ParameterModel> allParams = coreDbContext.Parameters.ToList();


                    ParameterModel patCodeFormatParam = allParams
                       .Where(a => a.ParameterGroupName == "Patient" && a.ParameterName == "PatientCodeFormat")
                       .FirstOrDefault<ParameterModel>();
                    if (patCodeFormatParam != null)
                    {
                        patCodeFormat = patCodeFormatParam.ParameterValue;
                    }


                    ParameterModel hospCodeParam = allParams
                        .Where(a => a.ParameterName == "HospitalCode")
                        .FirstOrDefault<ParameterModel>();
                    if (hospCodeParam != null)
                    {
                        hospitalCode = hospCodeParam.ParameterValue;
                    }



                    if (patCodeFormat == "YYMM-PatNum")
                    {
                        newPatCode = DateTime.Now.ToString("yy") + DateTime.Now.ToString("MM") + String.Format("{0:D6}", newPatNo);
                    }
                    else if (patCodeFormat == "HospCode-PatNum")
                    {
                        newPatCode = hospitalCode + newPatNo;
                    }
                    else if (patCodeFormat == "PatNum")
                    {
                        newPatCode = newPatNo.ToString();
                    }

                    return newPatCode;
                }
                else
                    throw new Exception("Invalid PatientId");


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
