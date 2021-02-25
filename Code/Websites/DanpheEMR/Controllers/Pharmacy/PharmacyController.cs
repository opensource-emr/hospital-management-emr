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
using DanpheEMR.Security;
using System.Data;
using DanpheEMR.Core;
using System.Xml;
using DanpheEMR.ServerModel.PharmacyModels;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using DanpheEMR.ServerModel.NotificationModels;
using DanpheEMR.Enums;
using System.IO;
using DanpheEMR.ServerModel.CommonModels;
using Microsoft.AspNetCore.Hosting;
using DanpheEMR.ViewModel.Pharmacy;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class PharmacyController : CommonController
    {
        public static IHostingEnvironment _environment;
        bool realTimeRemoteSyncEnabled = false;
        public PharmacyController(IHostingEnvironment env, IOptions<MyConfiguration> _config) : base(_config)
        {

            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            _environment = env;
        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType, int supplierId, int itemTypeId, int companyId, int categoryId, string status, int purchaseOrderId, int goodsReceiptId, int itemId, string batchNo, int returnToSupplierId, int invoiceId, int writeOffId, int employeeId, int? patientId, int providerId, int visitId, bool IsOutdoorPat, int requisitionId, int dispatchId, DateTime currentDate, DateTime FromDate, DateTime ToDate, int FiscalYearId,
            int settlementId, int invoiceid, int gdprintId, int invoiceretid)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            //RbacDbContext rbacDbContext = new RbacDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            PatientDbContext patientDbContext = new PatientDbContext(connString);

            try
            {
                #region GET: list of suppliers
                if (reqType == "supplier")
                {
                    var supplierList = phrmdbcontext.PHRMSupplier.AsEnumerable().OrderBy(a => a.SupplierName)
                        .ToList().Where(x => x.IsActive == true);
                    responseData.Status = "OK";
                    responseData.Results = supplierList;
                }
                #endregion
                #region GET: setting-supplier manage
                if (reqType == "allSupplier")
                {
                    var supplierList = phrmdbcontext.PHRMSupplier.AsEnumerable()
                        .ToList();
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
                else if (reqType == "get-credit-organizations") //--shankar 21st may 2020
                {
                    var creditOrganizations = phrmdbcontext.CreditOrganizations.ToList();
                    responseData.Status = "OK";
                    responseData.Results = creditOrganizations;
                }
                else if (reqType == "allSaleRecord")
                {
                    var currentdate = currentDate;
                    var TomorrowDate = currentDate.AddDays(1);
                    var invData = phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.BilStatus == "paid" && (a.CreateOn >= currentdate || a.PaidDate >= currentdate)).ToList();
                    var invRetData = phrmdbcontext.PHRMInvoiceReturnModel.ToList();
                    var depositData = phrmdbcontext.DepositModel.ToList();
                    var settlementData = phrmdbcontext.PHRMSettlements.Where(a => a.CreatedOn >= currentdate).ToList();
                    #region Usewise Sales 
                    var getUserSales = invData.Where(a => (a.CreateOn > currentdate && a.CreateOn < TomorrowDate) && (a.IsReturn != true)). //&& (a.IsReturn == null)
                                          Select(st => new
                                          {
                                              CreatedBy = ((st.SettlementId != null) ? (settlementData.Where(s => s.SettlementId == st.SettlementId).Select(ss => ss.CreatedBy).FirstOrDefault()) : (st.CreatedBy)),
                                              TotalAmount = ((st.SettlementId != null) ? (decimal)(settlementData.Where(s => s.SettlementId == st.SettlementId).Select(ss => ss.PaidAmount).FirstOrDefault()) : (decimal)(st.PaidAmount))

                                          }).
                                           GroupBy(a => new { a.CreatedBy }).Select(g => new UserCollectionViewModel
                                           {
                                               UserId = g.Key.CreatedBy.Value,
                                               UserSale = g.Sum(s => s.TotalAmount)
                                           })
                                           .GroupJoin(masterDbContext.Employees.ToList(), a => a.UserId, b => b.EmployeeId, (a, b) => new UserCollectionViewModel
                                           {
                                               UserId = a.UserId,
                                               UserSale = a.UserSale,
                                               UserName = b.Select(s => s.FullName).FirstOrDefault(),

                                           });
                    var depositAmt = depositData.Where(a => a.CreatedOn > currentDate && a.CreatedOn < TomorrowDate)
                        .GroupBy(x => new { x.CreatedBy, x.DepositType })
                        .Select(g => new UserCollectionViewModel
                        {
                            UserId = g.Key.CreatedBy.Value,
                            DepositType = g.Key.DepositType,
                            UserSale = (decimal)g.Sum(s => s.DepositAmount)
                        }).ToList();
                    //to calculate return amount
                    var getUserSaleRet = invRetData.ToList().Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.InvoiceId != null && a.PaymentMode != "credit")
                        .GroupBy(a => new { a.CreatedBy })
                        .Select(g => new UserCollectionViewModel
                        {
                            UserId = g.Key.CreatedBy.Value,
                            UserSale = g.Sum(s => s.TotalAmount).Value
                        })
                        .GroupJoin(masterDbContext.Employees.ToList(), a => a.UserId, b => b.EmployeeId, (a, b) => new UserCollectionViewModel
                        {
                            UserId = a.UserId,
                            UserSale = a.UserSale,
                            UserName = b.Select(s => s.FullName).FirstOrDefault(),
                        });

                    var netSales = getUserSales.GroupJoin(getUserSaleRet, a => a.UserId, b => b.UserId, (a, b) => new UserCollectionViewModel
                    {
                        UserSale = a.UserSale - b.Select(s => s.UserSale).FirstOrDefault(),
                        UserId = a.UserId,
                        UserName = a.UserName,
                    });
                    netSales = netSales.GroupJoin(depositAmt, a => a.UserId, b => b.UserId, (a, b) => new UserCollectionViewModel
                    {
                        UserSale = a.UserSale + b.Where(x => x.DepositType == "deposit").Sum(x => x.UserSale) - b.Where(x => x.DepositType == "depositreturn").Sum(x => x.UserSale),
                        UserId = a.UserId,
                        UserName = a.UserName,
                    });
                    #endregion

                    #region Counter Sales
                    var getCounterSales = invData.Where(a => (a.CreateOn > currentdate) && (a.CreateOn < TomorrowDate && (a.IsReturn != true)) && (a.CounterId > 0)).
                         Select(st => new
                         {
                             CounterId = ((st.SettlementId != null) ? (settlementData.Where(s => s.SettlementId == st.SettlementId).Select(ss => ss.CounterId).FirstOrDefault()) : (st.CounterId)),
                             TotalAmount = ((st.SettlementId != null) ? (decimal)(settlementData.Where(s => s.SettlementId == st.SettlementId).Select(ss => ss.PaidAmount).FirstOrDefault()) : (decimal)(st.PaidAmount))

                         }).
                        GroupBy(a => new { a.CounterId }).Select(g => new CounterCollectionViewModel
                        {
                            CounterId = g.Key.CounterId.Value,
                            CounterSale = g.Sum(s => s.TotalAmount)
                        }).GroupJoin(phrmdbcontext.PHRMCounters.ToList(), a => a.CounterId, b => b.CounterId, (a, b) => new CounterCollectionViewModel
                        {
                            CounterId = a.CounterId,
                            CounterSale = a.CounterSale,
                            CounterName = b.Select(s => s.CounterName).FirstOrDefault(),

                        });
                    var depositByCounter = depositData.Where(a => a.CreatedOn > currentDate && a.CreatedOn < TomorrowDate)
                        .GroupBy(x => new { x.DepositType, x.CounterId })
                        .Select(g => new CounterCollectionViewModel
                        {
                            CounterId = g.Key.CounterId.Value,
                            DepositType = g.Key.DepositType,
                            CounterDeposit = (decimal)g.Sum(s => s.DepositAmount)
                        }).ToList();
                    //to calculate return amount
                    var getCounterSaleRet = invRetData.ToList().Where(a => (a.CreatedOn > currentdate) && (a.CreatedOn < TomorrowDate) && (a.CounterId != null) && a.InvoiceId != null && a.PaymentMode != "credit")
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
                    netCounterSales = netCounterSales.GroupJoin(depositByCounter, a => a.CounterId, b => b.CounterId, (a, b) => new CounterCollectionViewModel
                    {
                        CounterSale = a.CounterSale + b.Where(x => x.DepositType == "deposit").Sum(x => x.CounterDeposit) - b.Where(x => x.DepositType == "depositreturn").Sum(x => x.CounterDeposit),
                        CounterId = a.CounterId,
                        CounterName = a.CounterName,
                    });
                    #endregion

                    TotalCollectionViewModel allRecords = new TotalCollectionViewModel();

                    var GrossSale = invData.Where(a => a.CreateOn > currentdate && a.CreateOn < TomorrowDate || a.PaidDate > currentdate).
                                                                                Select(st => new
                                                                                {
                                                                                    TotalAmount = ((st.SettlementId != null) ? (decimal)(settlementData.Where(s => s.SettlementId == st.SettlementId
                                                                                ).Select(ss => ss.PaidAmount).FirstOrDefault()) : (decimal)(st.PaidAmount))
                                                                                }).Sum(s => s.TotalAmount);


                    allRecords.TotalReturn = invRetData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.InvoiceId != null && a.PaymentMode != "credit").Sum(s => s.PaidAmount) ?? 0.00m;
                    allRecords.CreditAmount = phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.CreateOn > currentdate && a.CreateOn < TomorrowDate && a.BilStatus == "unpaid").Sum(s => s.PaidAmount) ?? 0.00m;

                    allRecords.CreditReturn = invRetData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.PaymentMode == "credit").Sum(s => s.PaidAmount) ?? 0.00m;
                    allRecords.TotalDeposit = depositData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.DepositType == "deposit").Sum(s => s.DepositAmount);
                    allRecords.DepositReturned = depositData.Where(a => a.CreatedOn > currentdate && a.CreatedOn < TomorrowDate && a.DepositType == "depositreturn").Sum(s => s.DepositAmount);

                    allRecords.TotalSale = GrossSale + allRecords.CreditAmount + (decimal)allRecords.TotalDeposit;
                    allRecords.NetSale = allRecords.TotalSale - (decimal)allRecords.DepositReturned - allRecords.TotalReturn - allRecords.CreditAmount;


                    allRecords.UserCollection = netSales; // netSales;
                    allRecords.CounterCollection = netCounterSales; //  netCounterSales;
                    responseData.Status = "OK";
                    responseData.Results = allRecords;


                }

                else if (reqType == "phrm-pending-bills")
                {
                    decimal? provisionalTotal = phrmdbcontext.PHRMInvoiceTransactionItems
                        .Where(itm => itm.BilItemStatus == "provisional").Sum(itm => itm.TotalAmount);


                    var creditTotObj = (from inv in phrmdbcontext.PHRMInvoiceTransaction.Where(x => x.BilStatus == "unpaid")
                                        join invRet in phrmdbcontext.PHRMInvoiceReturnModel
                                        on
                                        inv.InvoiceId equals invRet.InvoiceId into returnsOfUnpaidInvoice
                                        from invoiceReturn in returnsOfUnpaidInvoice.DefaultIfEmpty()
                                        select new
                                        {
                                            invoiceId = inv.InvoiceId,
                                            paidTotal = inv.PaidAmount,
                                            returnTotal = invoiceReturn != null ? invoiceReturn.PaidAmount : 0.00m

                                        }).ToList();

                    var creditTotAmt = creditTotObj.GroupBy(x => x.invoiceId).Sum(g => g.FirstOrDefault().paidTotal) - creditTotObj.Sum(x => x.returnTotal);

                    //var creditTotObj = (from inv in phrmdbcontext.PHRMInvoiceTransaction
                    //                    join invRet in phrmdbcontext.PHRMInvoiceReturnModel on inv.InvoiceId equals invRet.InvoiceId into invRetJ
                    //                    where inv.BilStatus == "unpaid"
                    //                    select new
                    //                    {
                    //                        TotalAmount = inv.TotalAmount,
                    //                        TotalReturn = invRetJ.Sum(x => x.TotalAmount != null ? x.TotalAmount : 0)
                    //                    }).FirstOrDefault();


                    //decimal? creditTotAmt = phrmdbcontext.PHRMInvoiceTransaction.Where(txn => txn.BilStatus == "unpaid")
                    //    .GroupJoin(phrmdbcontext.PHRMInvoiceReturnModel, inv => inv.InvoiceId, invret => invret.InvoiceId, (inv, invret) => new { inv, invret })
                    //    .SelectMany(a => a.invret.DefaultIfEmpty(), (inv, invretLJ) => new { inv.inv, invretLJ })
                    //    .Select(x => new
                    //    {
                    //        TotalAmount = x.inv.TotalAmount,
                    //        TotalReturn = x.invretLJ != null ? x.invretLJ.TotalAmount : 0
                    //    })
                    //    .Sum(txn => txn.TotalAmount - txn.TotalReturn);

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
                #region GET: Item type list in setting-item manage
                else if (reqType == "GetItemType")
                {
                    var itmtypelist = (from itemtype in phrmdbcontext.PHRMItemType
                                       select new
                                       {
                                           ItemTypeId = itemtype.ItemTypeId,
                                           ItemTypeName = itemtype.ItemTypeName,
                                           IsActive = itemtype.IsActive
                                       }).ToList().OrderBy(a => a.ItemTypeId);
                    responseData.Status = "OK";
                    responseData.Results = itmtypelist;
                }
                #endregion
                #region GET: Packing type list in setting-PackingType manage
                else if (reqType == "GetPackingType")
                {
                    var packingtypelist = (from packingtype in phrmdbcontext.PHRMPackingType
                                           select new
                                           {
                                               PackingTypeId = packingtype.PackingTypeId,
                                               PackingName = packingtype.PackingName,
                                               PackingQuantity = packingtype.PackingQuantity,
                                               IsActive = packingtype.IsActive
                                           }).ToList().OrderBy(a => a.PackingTypeId);
                    responseData.Status = "OK";
                    responseData.Results = packingtypelist;
                }
                #endregion
                #region GET: setting-item manage : list of items
                else if (reqType == "item")
                {

                    ///get last price of item
                    var gritemList = phrmdbcontext.PHRMGoodsReceiptItems.AsEnumerable().GroupBy(a => new { a.ItemId }).
                 Select(gritem => new
                 {
                     gritem.Key.ItemId,
                     Price = gritem.Select(a => new { a.GRItemPrice, a.CreatedOn }).OrderByDescending(l => l.CreatedOn).FirstOrDefault().GRItemPrice
                 }).AsEnumerable().ToList();


                    var rackList = phrmdbcontext.PHRMRack.ToList();
                    var itemList = (from itm in phrmdbcontext.PHRMItemMaster.AsEnumerable()
                                        //adding left join for new items since they'll not be available in GR before entering them: sud-10Feb'20
                                    join grItm1 in gritemList.AsEnumerable() on itm.ItemId equals grItm1.ItemId into grItemsJoin
                                    from grItm2 in grItemsJoin.DefaultIfEmpty()
                                    join compny in phrmdbcontext.PHRMCompany.AsEnumerable() on itm.CompanyId equals compny.CompanyId
                                    join itmtype in phrmdbcontext.PHRMItemType.AsEnumerable() on itm.ItemTypeId equals itmtype.ItemTypeId
                                    join catType in phrmdbcontext.PHRMCategory.AsEnumerable() on itmtype.CategoryId equals catType.CategoryId
                                    join unit in phrmdbcontext.PHRMUnitOfMeasurement.AsEnumerable() on itm.UOMId equals unit.UOMId
                                    join generic in phrmdbcontext.PHRMGenericModel.AsEnumerable() on itm.GenericId equals generic.GenericId
                                    // join itmsmaster in phrmdbcontext.PHRMItemMaster.AsEnumerable() on itm.ItemId equals itmsmaster.ItemId

                                    join salesCat in phrmdbcontext.PHRMStoreSalesCategory.AsEnumerable() on itm.SalesCategoryId equals salesCat.SalesCategoryId
                                    //join rack in phrmdbcontext.PHRMRack.AsEnumerable() on itm.Rack equals rack.RackId
                                    //into items
                                    //from itemrack in items.DefaultIfEmpty().AsEnumerable()
                                    //NBB-removed supplier id from item master table
                                    //join suplier in phrmdbcontext.PHRMSupplier on itm.SupplierId equals suplier.SupplierId
                                    select new
                                    {
                                        ItemId = itm.ItemId,
                                        itm.ItemName,
                                        itm.IsNarcotic,
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
                                        itm.PackingTypeId,
                                        itm.IsInternationalBrand,
                                        itm.GenericId,
                                        itm.ABCCategory,
                                        itm.Dosage,
                                        GRItemPrice = gritemList.Any(a => a.ItemId == itm.ItemId) ? (from ti in gritemList where ti.ItemId == itm.ItemId select ti.Price).FirstOrDefault() : 0,
                                        generic.GenericName,
                                        catType.CategoryName,
                                        RackName = rackList.Any(r => r.RackId == itm.Rack) ? rackList.Where(r => r.RackId == itm.Rack).FirstOrDefault().Name : String.Empty,
                                        itm.StoreRackId,
                                        IsBatchApplicable = salesCat.IsBatchApplicable,
                                        isExpiryApplicable = salesCat.IsExpiryApplicable,
                                        salesCat.SalesCategoryId,
                                        itm.VED,
                                        itm.CCCharge

                                    }).ToList().OrderBy(a => a.ItemId);
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                #endregion
                #region GET: Store requisition- get items list
                else if (reqType == "get-items-store-requisition")
                {
                    var gritemList = phrmdbcontext.PHRMGoodsReceiptItems.GroupBy(a => new { a.ItemId, a.BatchNo }).
                     Select(gritem => new
                     {
                         gritem.Key.ItemId,
                         Price = gritem.OrderByDescending(a => a.CreatedOn).FirstOrDefault().GRItemPrice,
                         gritem.Key.BatchNo
                     }).AsQueryable();
                    var itemList = (from itm in phrmdbcontext.PHRMItemMaster
                                    join grItm1 in gritemList on itm.ItemId equals grItm1.ItemId into grItemsJoin
                                    from grItm2 in grItemsJoin.DefaultIfEmpty()
                                    select new
                                    {
                                        itm.ItemId,
                                        itm.ItemName,
                                        grItm2.BatchNo,
                                        Price = (grItm2 == null) ? 0 : grItm2.Price
                                    }).ToList();
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
                                             join term in phrmdbcontext.Terms on po.TermsId equals term.TermsId into termJ
                                             from termLJ in termJ.DefaultIfEmpty()
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
                                                 Pin = supp.Pin,
                                                 TermText = termLJ.Text
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
                                           Remarks = po.Remarks
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
                    AdmissionDbContext adtdbContext = new AdmissionDbContext(connString);

                    var WardName = (from ptinfo in adtdbContext.PatientBedInfos.AsEnumerable()
                                    join wd in adtdbContext.Wards.AsEnumerable() on ptinfo.WardId equals wd.WardId
                                    select new { ptinfo.PatientId, wd.WardName }).ToList().AsEnumerable();

                    var provisionalItems = (from pro in phrmdbcontext.DrugRequistion.AsEnumerable()
                                            join pat in phrmdbcontext.PHRMPatient.AsEnumerable() on pro.PatientId equals pat.PatientId
                                            where pro.Status == status
                                            select new
                                            {

                                                ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                ContactNo = pat.PhoneNumber,
                                                CreatedOn = pro.CreatedOn,
                                                Status = pro.Status,
                                                PatientId = pro.PatientId,
                                                RequisitionId = pro.RequisitionId,
                                                WardName = WardName.Where(w => w.PatientId == pat.PatientId).Select(s => s.WardName).FirstOrDefault()
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
                                       join store in phrmdbcontext.PHRMStore on wardReq.StoreId equals store.StoreId
                                       join emp in phrmdbcontext.Employees on wardReq.CreatedBy equals emp.EmployeeId
                                       join stats in poSelectedStatus on wardReq.Status equals stats
                                       orderby wardReq.RequisitionId descending
                                       select new
                                       {
                                           StoreName = store.Name,
                                           CreatedBy = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                           CreatedOn = wardReq.CreatedOn,
                                           Status = wardReq.Status,
                                           RequisitionId = wardReq.RequisitionId,
                                           StoreId = wardReq.StoreId
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
                                            join fy in phrmdbcontext.BillingFiscalYear on gr.FiscalYearId equals fy.FiscalYearId
                                            join rbac in phrmdbcontext.Users on gr.CreatedBy equals rbac.EmployeeId
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
                                                UserName = rbac.UserName,
                                                CurrentFiscalYear = fy.FiscalYearFormatted,
                                                IsTransferredToACC = (gr.IsTransferredToACC == null) ? false : true
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
                    var supplierName = phrmdbcontext.PHRMSupplier.Where(supplier => supplier.SupplierId == providerId).Select(s => s.SupplierName).FirstOrDefault().ToString();
                    var goodReciptList = phrmdbcontext.PHRMGoodsReceipt.Where(a => a.IsCancel != null && a.SupplierId == providerId)
                                                                       .Select(a =>
                                                                       new
                                                                       {
                                                                           SupplierId = a.SupplierId,
                                                                           InvoiceNo = a.InvoiceNo,
                                                                           GoodReceiptDate = a.GoodReceiptDate,
                                                                           SubTotal = a.SubTotal,
                                                                           DiscountAmount = a.DiscountAmount,
                                                                           VATAmount = a.VATAmount,
                                                                           TotalAmount = a.TotalAmount,
                                                                           GoodReceiptId = a.GoodReceiptId,
                                                                           CreditPeriod = a.CreditPeriod,
                                                                           SupplierName = supplierName
                                                                       }).ToList();




                    responseData.Status = "OK";
                    responseData.Results = goodReciptList;
                }
                #endregion
                #region GET: all the store from PHRM_MST_STORE table
                else if (reqType == "getMainStore")
                {
                    var test = phrmdbcontext.PHRMStore;
                    var storeList = phrmdbcontext.PHRMStore.FirstOrDefault(a => a.StoreId == 1);
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
                                           CCCharge = gritems.CCCharge,
                                           GrTotalDisAmt = gritems.GrTotalDisAmt,
                                           StripRate = gritems.StripRate

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
                                                 PHRMPurchaseOrderItems = po.PHRMPurchaseOrderItems.Where(a => a.Quantity != a.ReceivedQuantity).ToList(),
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

                    var goodReciptDetail = phrmdbcontext.PHRMGoodsReceipt.ToList();
                    var test = phrmdbcontext.PHRMStoreStock.ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.GoodsReceiptItemId }).
                        Select(stk =>
                                new PHRMStoreStockModel
                                {
                                    ItemId = stk.Key.ItemId,
                                    BatchNo = stk.Key.BatchNo,
                                    GoodsReceiptItemId = stk.Key.GoodsReceiptItemId,
                                    Quantity = (stk.Where(a => a.InOut == "in").Sum(a => a.Quantity) + stk.Where(a => a.InOut == "in").Sum(
                                        a => a.FreeQuantity) - stk.Where(a => a.InOut == "out").Sum(a => a.Quantity) - stk.Where(
                                            a => a.InOut == "out").Sum(a => a.FreeQuantity)).Value,
                                    FreeQuantity = (stk.Where(a => a.InOut == "in").Sum(
                                        a => a.FreeQuantity) - stk.Where(
                                            a => a.InOut == "out").Sum(a => a.FreeQuantity)).Value,
                                    MRP = stk.Select(a => a.MRP).LastOrDefault(),
                                    Price = stk.Select(a => a.Price).FirstOrDefault(),
                                    ExpiryDate = stk.Select(a => a.ExpiryDate).FirstOrDefault()

                                    // 

                                }).ToList().Where(a => a.Quantity > 0);

                    var itemListWithTotlAvailQty = (from strstk in test
                                                    join itm in phrmdbcontext.PHRMItemMaster on strstk.ItemId equals itm.ItemId
                                                    join gritms in phrmdbcontext.PHRMGoodsReceiptItems on strstk.GoodsReceiptItemId equals gritms.GoodReceiptItemId
                                                    join gr in phrmdbcontext.PHRMGoodsReceipt on gritms.GoodReceiptId equals gr.GoodReceiptId
                                                    join fis in phrmdbcontext.BillingFiscalYear on gr.FiscalYearId equals fis.FiscalYearId

                                                    group new { strstk, itm, fis, gr, gritms } by new
                                                    {
                                                        strstk.GoodsReceiptItemId,
                                                        strstk.ItemId,
                                                        strstk.BatchNo,
                                                        itm.ItemName,
                                                        strstk.Quantity,

                                                        gr.SupplierId,
                                                        fis.FiscalYearId,
                                                        gritms.GoodReceiptId,
                                                        gritms.ReceivedQuantity,
                                                        //gritm.Price,
                                                        strstk.FreeQuantity
                                                    } into p
                                                    select new
                                                    {
                                                        ItemId = p.Key.ItemId,
                                                        BatchNo = p.Key.BatchNo,
                                                        ItemName = p.Key.ItemName,
                                                        TotalAvailableQuantity = p.Key.Quantity,
                                                        FreeQuantity = p.Key.FreeQuantity,
                                                        BatchWiseAvailableQuantity = p.Key.Quantity,
                                                        ItemPrice = p.Select(a => a.strstk.Price).FirstOrDefault(),
                                                        ExpiryDate = p.Select(a => a.strstk.ExpiryDate).FirstOrDefault(),
                                                        DiscountPercentage = p.Select(a => a.gritms.DiscountPercentage).FirstOrDefault(),
                                                        VATPercentage = p.Select(a => a.gritms.VATPercentage).FirstOrDefault(),
                                                        MRP = p.Select(a => a.strstk.MRP).LastOrDefault(),
                                                        GoodsReceiptItemId = p.Key.GoodsReceiptItemId,
                                                        SupplierId = p.Key.SupplierId,
                                                        FiscalYearId = p.Key.FiscalYearId,
                                                        GoodreceiptId = p.Key.GoodReceiptId,
                                                        ReceivedQuantity = p.Key.ReceivedQuantity,
                                                        GoodReceiptPrintId = p.Select(a => a.gr.GoodReceiptPrintId).FirstOrDefault(),
                                                        GoodReceiptItemId = p.Select(a => a.gritms.GoodReceiptItemId).FirstOrDefault(),
                                                        CCCharge = p.Select(a => a.gritms.CCCharge).FirstOrDefault()

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
                #region Get Return To Supplier
                else if (reqType == "returnToSupplier")
                {
                    var test = phrmdbcontext.PHRMStoreStock.ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.GoodsReceiptItemId }).
                      Select(stk =>
                              new PHRMStoreStockModel
                              {
                                  ItemId = stk.Key.ItemId,
                                  BatchNo = stk.Key.BatchNo,
                                  GoodsReceiptItemId = stk.Key.GoodsReceiptItemId,
                                  Quantity = (stk.Where(a => a.InOut == "in").Sum(a => a.Quantity) + stk.Where(a => a.InOut == "in").Sum(
                                      a => a.FreeQuantity) - stk.Where(a => a.InOut == "out").Sum(a => a.Quantity) - stk.Where(
                                          a => a.InOut == "out").Sum(a => a.FreeQuantity)).Value,
                                  MRP = stk.Select(a => a.MRP).LastOrDefault(),
                                  Price = stk.Select(a => a.Price).FirstOrDefault(),
                                  ExpiryDate = stk.Select(a => a.ExpiryDate).FirstOrDefault()

                                  // 

                              }).ToList().Where(a => a.Quantity > 0);
                    var testdate = ToDate.AddDays(1);
                    var InvoiceIdStr = invoiceid.ToString();
                    var returnToSupplier = (from storestk in test
                                            join gritms in phrmdbcontext.PHRMGoodsReceiptItems on storestk.GoodsReceiptItemId equals gritms.GoodReceiptItemId

                                            join gr in phrmdbcontext.PHRMGoodsReceipt on gritms.GoodReceiptId equals gr.GoodReceiptId
                                            join supp in phrmdbcontext.PHRMSupplier on gr.SupplierId equals supp.SupplierId
                                            where (supp.SupplierId == supplierId || gr.GoodReceiptPrintId == gdprintId ||
                                              gr.InvoiceNo == InvoiceIdStr || gritms.BatchNo == batchNo || (gr.CreatedOn > FromDate && gr.CreatedOn < testdate))
                                            group new { supp, gr, gritms, storestk } by new
                                            {
                                                supp.SupplierName,
                                                gr.GoodReceiptPrintId,
                                                gr.SubTotal,
                                                gr.TotalAmount,
                                                gr.DiscountAmount,
                                                gr.VATAmount,
                                                gr.InvoiceNo,
                                                gr.GoodReceiptId
                                            } into p
                                            select new
                                            {
                                                SupplierName = p.Key.SupplierName,
                                                GoodReceiptPrintId = p.Key.GoodReceiptPrintId,
                                                TotalQty = p.Sum(a => a.storestk.InOut == "in" ? (Int32?)a.storestk.Quantity : 0),
                                                //Quantity = (p.Where(a => a.storestk.InOut == "in").Sum(a => a.storestk.Quantity) + p.Where(a => a.storestk.InOut == "in").Sum(
                                                //          a => a.storestk.FreeQuantity) - p.Where(a => a.storestk.InOut == "out").Sum(a => a.storestk.Quantity) - p.Where(
                                                //          a => a.storestk.InOut == "out").Sum(a => a.storestk.FreeQuantity)).Value,
                                                SubTotal = p.Key.SubTotal,
                                                DiscountAmount = p.Key.DiscountAmount,
                                                VATAmount = p.Key.VATAmount,
                                                TotalAmount = p.Key.TotalAmount,
                                                InvoiceNo = p.Key.InvoiceNo,
                                                GoodReceiptId = p.Key.GoodReceiptId


                                            }
                            ).ToList().OrderByDescending(a => a.GoodReceiptPrintId);

                    responseData.Status = "OK";
                    responseData.Results = returnToSupplier;
                }
                #endregion
                #region Get Return All Item To Supplier List
                else if (reqType == "returnItemsToSupplierList")
                {
                    var testdate = ToDate.AddDays(1);
                    var returnItemToSupplierList = (from retSupp in phrmdbcontext.PHRMReturnToSupplier
                                                    join supp in phrmdbcontext.PHRMSupplier on retSupp.SupplierId equals supp.SupplierId
                                                    join retSuppItm in phrmdbcontext.PHRMReturnToSupplierItem on retSupp.ReturnToSupplierId equals retSuppItm.ReturnToSupplierId
                                                    join rbac in phrmdbcontext.Users on retSupp.CreatedBy equals rbac.EmployeeId
                                                    join gr in phrmdbcontext.PHRMGoodsReceipt on retSupp.GoodReceiptId equals gr.GoodReceiptId
                                                    where (retSuppItm.Quantity != 0 && (retSuppItm.CreatedOn > FromDate && retSuppItm.CreatedOn < testdate))
                                                    group new { supp, retSuppItm, retSupp, rbac, gr } by new
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
                                                        Pin = p.Select(a => a.supp.Pin).FirstOrDefault(),
                                                        Remarks = p.Select(a => a.retSupp.Remarks).FirstOrDefault(),
                                                        ReturnStatus = p.Select(a => a.retSupp.ReturnStatus).FirstOrDefault(),
                                                        UserName = p.Select(a => a.rbac.UserName).FirstOrDefault(),
                                                        CreatedOn = p.Select(a => a.retSupp.CreatedOn).FirstOrDefault(),
                                                        GoodReceiptPrintId = p.Select(a => a.gr.GoodReceiptPrintId).FirstOrDefault()
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
                                        join itm in phrmdbcontext.PHRMItemMaster on writeOffItm.ItemId equals itm.ItemId
                                        group new { writeOff, writeOffItm, itm } by new
                                        {
                                            writeOff.WriteOffId

                                        } into p
                                        select new
                                        {
                                            ItemName = p.Select(a => a.itm.ItemName),
                                            WriteOffId = p.Key.WriteOffId,
                                            BatchNo = p.Select(a => a.writeOffItm.BatchNo),
                                            WriteOffDate = p.Select(a => a.writeOff.WriteOffDate).FirstOrDefault(),
                                            ItemPrice = p.Select(a => a.writeOffItm.ItemPrice),
                                            Quantity = p.Sum(a => a.writeOffItm.WriteOffQuantity),
                                            SubTotal = p.Select(a => a.writeOff.SubTotal).FirstOrDefault(),
                                            DiscountAmount = p.Select(a => a.writeOff.DiscountAmount).FirstOrDefault(),
                                            VATAmount = p.Select(a => a.writeOff.VATAmount).FirstOrDefault(),
                                            TotalAmount = p.Select(a => a.writeOff.TotalAmount).FirstOrDefault(),
                                            Remarks = p.Select(a => a.writeOff.WriteOffRemark).FirstOrDefault()

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
                #region Get Narcotics Stock Details List (sales)
                else if (reqType == "natcoticsstockDetails")
                {
                    var totalStock = (from itm in phrmdbcontext.DispensaryStock
                                      join mstitem in phrmdbcontext.PHRMItemMaster on itm.ItemId equals mstitem.ItemId
                                      where mstitem.IsNarcotic == true
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
                                          StockId = itm.StockId,
                                          ItemId = itm.ItemId,
                                          BatchNo = itm.BatchNo,
                                          ExpiryDate = itm.ExpiryDate,
                                          ItemName = mstitem.ItemName,
                                          AvailableQuantity = itm.AvailableQuantity,
                                          MRP = itm.MRP,
                                          Price = itm.Price,
                                          IsActive = mstitem.IsActive,
                                          DiscountPercentage = 0,
                                          GenericName = genr.GenericName,
                                          GenericId = genr.GenericId

                                      }).ToList().Where(a => a.AvailableQuantity > 0 && a.ExpiryDate > testdate && a.IsActive == true);


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
                #region Get GR for editing
                else if (reqType == "GRforEdit" && reqType.Length > 0)
                {
                    PHRMGoodsReceiptModel GoodReceipt = (from gr in phrmdbcontext.PHRMGoodsReceipt
                                                         where gr.GoodReceiptId == goodsReceiptId
                                                         select gr).FirstOrDefault();
                    GoodReceipt.GoodReceiptItem = (from gritems in phrmdbcontext.PHRMGoodsReceiptItems
                                                   where gritems.GoodReceiptId == goodsReceiptId
                                                   select gritems).ToList();
                    foreach (var gritm in GoodReceipt.GoodReceiptItem)
                    {
                        var StoreStockEntryCount = phrmdbcontext.PHRMStoreStock.Where(a => a.GoodsReceiptItemId == gritm.GoodReceiptItemId).Count();
                        if (StoreStockEntryCount > 1)
                        {
                            //Exception ex = new Exception(gritm.ItemName + " has either been transfered or modified already.");
                            //responseData.Results = gritm.ItemName;
                            //throw ex;
                            GoodReceipt.IsGRModified = true; // Bikash: 29June'20 - added to allow edit of GR details after modification (sale or transfer).
                        }

                    }
                    responseData.Status = "OK";
                    responseData.Results = GoodReceipt;
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
                                                         ReturnStatus = retSuppl.ReturnStatus,
                                                         CreatedBy = retSuppl.CreatedBy,
                                                         CreatedOn = retSuppl.CreatedOn,
                                                         GoodReceiptId = retSuppl.GoodReceiptId

                                                         //UserName= rbacDbContext.Users.Where(a=>a.EmployeeId == retSuppl.CreatedBy).Select
                                                         //UserName = rbacDbContext.Users.Where(a => a.EmployeeId == retSuppl.CreatedBy).Select(a => a.UserName).FirstOrDefault()
                                                         //UserName = (from rbac in rbacDbContext.Users
                                                         //            where rbac.EmployeeId == retSuppl.CreatedBy
                                                         //            select rbac.UserName).FirstOrDefault()
                                                         //Created
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
                    var WriteOff = (from writeOff in phrmdbcontext.PHRMWriteOff
                                    join emp in phrmdbcontext.Employees on writeOff.CreatedBy equals emp.EmployeeId
                                    where writeOff.WriteOffId == writeOffId
                                    select new
                                    {
                                        WriteOffId = writeOff.WriteOffId,
                                        CreatedOn = writeOff.CreatedOn,
                                        SubTotal = writeOff.SubTotal,
                                        DiscountAmount = writeOff.DiscountAmount,
                                        VATAmount = writeOff.VATAmount,
                                        TotalAmount = writeOff.TotalAmount,
                                        Remark = writeOff.WriteOffRemark,
                                        UserName = emp.FullName
                                    }
                              ).FirstOrDefault();
                    var WriteOffdata = new { WriteOffitemsdetails = WriteOffItemsByWriteOffIdList, WriteOffdetails = WriteOff };

                    responseData.Status = "OK";
                    responseData.Results = WriteOffdata;
                }
                #endregion
                #region Get all sale invoice list data
                else if (reqType == "getsaleinvoicelist")
                {
                    var testdate = ToDate.AddDays(1);//to include ToDate, 1 day was added--rusha 07/10/2019
                    var saleInvoiceList = (from inv in phrmdbcontext.PHRMInvoiceTransaction.AsEnumerable()
                                           where inv.CreateOn > FromDate && inv.CreateOn < testdate
                                           join pat in phrmdbcontext.PHRMPatient on inv.PatientId equals pat.PatientId
                                           join countryd in phrmdbcontext.CountrySubDivision on pat.CountrySubDivisionId equals countryd.CountrySubDivisionId
                                           join fs in phrmdbcontext.BillingFiscalYear on inv.FiscalYearId equals fs.FiscalYearId
                                           join rbac in phrmdbcontext.Users on inv.CreatedBy equals rbac.EmployeeId
                                           join depo in phrmdbcontext.DepositModel on inv.InvoiceId equals depo.TransactionId into t
                                           from rt in t.DefaultIfEmpty()
                                           orderby inv.InvoiceId descending
                                           select new
                                           {
                                               InvoiceId = inv.InvoiceId,
                                               InvoicePrintId = inv.InvoicePrintId,
                                               PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                               PatientCode = pat.PatientCode,
                                               SubTotal = inv.SubTotal,
                                               DiscountAmount = inv.DiscountAmount,
                                               VATAmount = inv.VATAmount,
                                               TotalAmount = inv.TotalAmount,
                                               PaidAmount = inv.PaidAmount,
                                               BilStatus = inv.BilStatus,
                                               TotalCredit = inv.CreditAmount,
                                               UserName = rbac.UserName,
                                               CreditOrganizationName = (inv.OrganizationId == null) ? null : phrmdbcontext.CreditOrganizations.Where(CO => CO.OrganizationId == inv.OrganizationId).Select(CO => CO.OrganizationName).FirstOrDefault(),
                                               CreatedBy = inv.CreatedBy,
                                               CreateOn = inv.CreateOn,
                                               IsOutdoorPat = pat.IsOutdoorPat,
                                               PatientType = (pat.IsOutdoorPat == null) ? "Indoor" : "Outdoor",
                                               inv.Adjustment,
                                               inv.Change,
                                               inv.PrintCount,
                                               ReceiptNo = inv.InvoiceId,
                                               ReceiptPrintNo = inv.InvoicePrintId,
                                               Remarks = inv.Remark,
                                               inv.Tender,
                                               inv.TotalQuantity,
                                               InvoiceItems = (from invitm in phrmdbcontext.PHRMInvoiceTransactionItems
                                                               where invitm.InvoiceId == inv.InvoiceId
                                                               group invitm by new { invitm.InvoiceId } into p
                                                               select new
                                                               {
                                                                   Quantity = p.Sum(a => a.Quantity),
                                                                   Rate = p.Select(a => a.MRP).FirstOrDefault()
                                                               }).ToList(),
                                               InvoiceRetItems = (from invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel
                                                                  where invretitm.InvoiceId == inv.InvoiceId
                                                                  group invretitm by new { invretitm.InvoiceId } into p
                                                                  select new
                                                                  {
                                                                      ReturnedQty = p.Sum(a => a.ReturnedQty)
                                                                  }).ToList(),
                                               PaymentMode = inv.PaymentMode,
                                               FiscalYear = fs.FiscalYearFormatted,  //PharmacyBL.GetFiscalYearFormattedName(phrmdbcontext, inv.FiscalYearId),
                                               DepositDeductAmount = (rt != null) ? rt.DepositAmount : 0,
                                               DepositBalance = (rt != null) ? rt.DepositBalance : 0,
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
                                           }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = saleInvoiceList;
                }
                #endregion

                #region Get all sale invoice list data
                else if (reqType == "getsalereturnlist")
                {


                    var testdate = ToDate.AddDays(1);
                    var saleReturnInvoiceList = (from inv in phrmdbcontext.PHRMInvoiceTransaction.AsEnumerable()
                                                 join invret in phrmdbcontext.PHRMInvoiceReturnModel on inv.InvoiceId equals invret.InvoiceId
                                                 //join invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel on inv.InvoiceId equals invretitm.InvoiceId
                                                 join pat in phrmdbcontext.PHRMPatient on inv.PatientId equals pat.PatientId
                                                 join countryd in phrmdbcontext.CountrySubDivision on pat.CountrySubDivisionId equals countryd.CountrySubDivisionId
                                                 join fs in phrmdbcontext.BillingFiscalYear on inv.FiscalYearId equals fs.FiscalYearId
                                                 join rbac in phrmdbcontext.Users on invret.CreatedBy equals rbac.EmployeeId
                                                 where inv.CreateOn > FromDate && inv.CreateOn < testdate
                                                 select new
                                                 {
                                                     InvoiceId = inv.InvoiceId,
                                                     InvoicePrintId = inv.InvoicePrintId,
                                                     PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                     PatientCode = pat.PatientCode,
                                                     SubTotal = invret.SubTotal,
                                                     DiscountAmount = invret.DiscountAmount,
                                                     VATAmount = invret.VATAmount,
                                                     TotalAmount = invret.TotalAmount,
                                                     PaidAmount = invret.PaidAmount,
                                                     BilStatus = inv.BilStatus,
                                                     TotalCredit = inv.CreditAmount,
                                                     InvoiceReturnId = invret.InvoiceReturnId,
                                                     CreatedBy = invret.CreatedBy,
                                                     CreateOn = invret.CreatedOn,
                                                     Remarks = invret.Remarks,
                                                     UserName = rbac.UserName,
                                                     CreditNoteId = invret.CreditNoteId,
                                                     IsOutdoorPat = pat.IsOutdoorPat,

                                                     invret.Adjustment,
                                                     invret.Change,
                                                     inv.PrintCount,
                                                     ReceiptNo = inv.InvoiceId,
                                                     ReceiptPrintNo = inv.InvoicePrintId,
                                                     PatientType = (pat.IsOutdoorPat == null) ? "Indoor" : "Outdoor",
                                                     invret.PaymentMode,
                                                     invret.Tender,
                                                     inv.TotalQuantity,
                                                     InvoiceItems = (from invitm in phrmdbcontext.PHRMInvoiceTransactionItems
                                                                     where invitm.InvoiceId == inv.InvoiceId
                                                                     group invitm by new { invitm.InvoiceId } into p
                                                                     select new
                                                                     {
                                                                         Quantity = p.Sum(a => a.Quantity),
                                                                         Rate = p.Select(a => a.MRP).FirstOrDefault()
                                                                     }).ToList(),
                                                     InvoiceRetItems = (from invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel
                                                                        where invretitm.InvoiceId == inv.InvoiceId
                                                                        group invretitm by new { invretitm.InvoiceId } into p
                                                                        select new
                                                                        {
                                                                            ReturnedQty = p.Sum(a => a.ReturnedQty),
                                                                        }).ToList(),
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
                                                 }).OrderByDescending(a => a.InvoiceReturnId).ToList();

                    responseData.Status = "OK";
                    responseData.Results = saleReturnInvoiceList;
                }
                #endregion



                #region Get sale invoice items details by Invoice id
                else if (reqType == "getsaleinvoiceitemsbyid" && invoiceid > 0)
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
                                                           Quantity = invitm.Quantity,
                                                           ItemName = invitm.ItemName,
                                                           BatchNo = invitm.BatchNo,
                                                           Price = invitm.Price,
                                                           MRP = invitm.MRP,
                                                           FreeQuantity = invitm.FreeQuantity,
                                                           SubTotal = invitm.SubTotal,
                                                           VATPercentage = invitm.VATPercentage,
                                                           DiscountPercentage = invitm.DiscountPercentage,
                                                           TotalAmount = invitm.TotalAmount,
                                                           BilItemStatus = invitm.BilItemStatus,
                                                           CreatedBy = invitm.CreatedBy,
                                                           CreatedOn = invitm.CreatedOn,
                                                           TotalDisAmt = invitm.TotalDisAmt
                                                       }).Where(q => q.Quantity > 0).OrderBy(x => x.ItemName).ToList();
                    responseData.Status = "OK";

                    responseData.Results = saleInvoiceItemsByInvoiceId;

                }
                #endregion
                #region Get sale invoice ret items details by Invoice id
                else if (reqType == "getsaleinvoiceretitemsbyid" && invoiceid > 0)
                {
                    //var test = phrmdbcontext.PHRMBillTransactionItems.Join(phrmdbcontext)
                    var saleInvoiceRetItemsByInvoiceId = (from invret in phrmdbcontext.PHRMInvoiceReturnModel
                                                          join invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel on invret.InvoiceReturnId equals invretitm.InvoiceReturnId
                                                          join invitm in phrmdbcontext.PHRMInvoiceTransactionItems on invretitm.InvoiceItemId equals invitm.InvoiceItemId
                                                          where invret.InvoiceId == invoiceid
                                                          select new
                                                          {
                                                              InvoiceId = invret.InvoiceId,
                                                              InvoiceReturnId = invret.InvoiceReturnId,
                                                              invret.CounterId,
                                                              InvoiceReturnItemId = invretitm.InvoiceReturnItemId,
                                                              ExpiryDate = invitm.ExpiryDate,
                                                              ItemId = invretitm.ItemId,
                                                              ItemName = invitm.ItemName,
                                                              BatchNo = invretitm.BatchNo,
                                                              ReturnedQty = invretitm.ReturnedQty,
                                                              Price = invretitm.Price,
                                                              MRP = invretitm.MRP,
                                                              SubTotal = invretitm.SubTotal,
                                                              VATPercentage = invretitm.VATPercentage,
                                                              DiscountPercentage = invretitm.DiscountPercentage,
                                                              DiscountAmount = invretitm.DiscountAmount,
                                                              TotalAmount = invretitm.TotalAmount,
                                                              Remark = invret.Remarks,
                                                              CreditNoteId = invret.CreditNoteId,
                                                              CreatedBy = invretitm.CreatedBy,
                                                              CreatedOn = invretitm.CreatedOn

                                                          }).ToList();
                    responseData.Status = "OK";

                    responseData.Results = saleInvoiceRetItemsByInvoiceId;

                }
                #endregion



                #region Get sale return invoice items details by InvoiceReturnId
                else if (reqType == "getsalereturninvoiceitemsbyid" && invoiceretid > 0)
                {
                    var saleretInvoiceItemsByInvoiceretId = (from invret in phrmdbcontext.PHRMInvoiceReturnModel
                                                             join invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel on invret.InvoiceReturnId equals invretitm.InvoiceReturnId
                                                             join invitm in phrmdbcontext.PHRMInvoiceTransactionItems on invretitm.InvoiceItemId equals invitm.InvoiceItemId
                                                             where invret.InvoiceReturnId == invoiceretid
                                                             select new
                                                             {
                                                                 InvoiceId = invret.InvoiceId,
                                                                 InvoiceReturnId = invret.InvoiceReturnId,
                                                                 invret.CounterId,
                                                                 InvoiceReturnItemId = invretitm.InvoiceReturnItemId,
                                                                 ExpiryDate = invitm.ExpiryDate,
                                                                 ItemId = invretitm.ItemId,
                                                                 ItemName = invitm.ItemName,
                                                                 BatchNo = invretitm.BatchNo,
                                                                 ReturnedQty = invretitm.ReturnedQty,
                                                                 Price = invretitm.Price,
                                                                 MRP = invretitm.MRP,
                                                                 SubTotal = invretitm.SubTotal,
                                                                 VATPercentage = invretitm.VATPercentage,
                                                                 DiscountPercentage = invretitm.DiscountPercentage,
                                                                 DiscountAmount = invretitm.DiscountAmount,
                                                                 TotalAmount = invretitm.TotalAmount,
                                                                 Remark = invret.Remarks,
                                                                 CreditNoteId = invret.CreditNoteId,
                                                                 CreatedBy = invretitm.CreatedBy,
                                                                 CreatedOn = invretitm.CreatedOn

                                                             }).ToList();
                    responseData.Status = "OK";

                    responseData.Results = saleretInvoiceItemsByInvoiceretId;

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
                                      //join invret in phrmdbcontext.PHRMInvoiceReturnModel on inv.InvoiceId equals invret.InvoiceId
                                  join fs in phrmdbcontext.BillingFiscalYear on inv.FiscalYearId equals fs.FiscalYearId
                                  join pat in phrmdbcontext.PHRMPatient
                                  on inv.PatientId equals pat.PatientId
                                  where inv.InvoicePrintId == invoiceId && inv.FiscalYearId == FiscalYearId// to make invoice id in invoice print ID 
                                  select new
                                  {
                                      invoiceHeader = new
                                      {
                                          InvoiceId = inv.InvoicePrintId,//to make invoice print id as id
                                          InvoiceDate = inv.CreateOn,
                                          PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                          PatientType = (pat.IsOutdoorPat == true) ? "Outdoor" : "Indoor",
                                          CreditAmount = inv.CreditAmount.ToString(),
                                          InvoiceBillStatus = inv.BilStatus,
                                          InvoiceTotalMoney = inv.PaidAmount.ToString(),
                                          IsReturn = inv.IsReturn,
                                          Tender = inv.Tender,
                                          SubTotal = inv.SubTotal,
                                          Change = inv.Change,
                                          Remarks = inv.Remark,
                                          PaidAmount = inv.PaidAmount,
                                          FiscalYear = fs.FiscalYearFormatted,
                                          ReceiptPrintNo = inv.InvoicePrintId,
                                          DiscountAmount = inv.DiscountAmount,
                                          //CreditNoteId = invret.CreditNoteId,
                                          BillingUser = phrmdbcontext.Employees.Where(a => a.EmployeeId == inv.CreatedBy).Select(a => a.FirstName).FirstOrDefault(),

                                      },
                                      patient = pat,
                                      //totalQty = phrmdbcontext.PHRMInvoiceTransactionItems.Where(a => a.InvoiceId == inv.InvoiceId).GroupJoin(phrmdbcontext.PHRMStockTransactionItems,
                                      //a => a.)


                                      invoiceItems = (from invitm in phrmdbcontext.PHRMInvoiceTransactionItems
                                                      join invretitm in phrmdbcontext.PHRMInvoiceReturnItemsModel on invitm.InvoiceItemId equals invretitm.InvoiceItemId into invretitmJ
                                                      from invretLJ in invretitmJ.DefaultIfEmpty()
                                                      where ((invitm.InvoiceId == inv.InvoiceId))
                                                      group new { invitm, invretLJ } by new
                                                      {

                                                          invitm.InvoiceId,
                                                          invitm.InvoiceItemId,
                                                          invitm.ItemId

                                                      } into p
                                                      select new
                                                      {
                                                          InvoiceId = p.Key.InvoiceId,
                                                          InvoiceItemId = p.Key.InvoiceItemId,
                                                          BatchNo = p.Select(a => a.invitm.BatchNo).FirstOrDefault(),
                                                          ExpiryDate = p.Select(a => a.invitm.ExpiryDate).FirstOrDefault(),
                                                          Quantity = p.Select(a => a.invitm.Quantity).FirstOrDefault(),
                                                          ReturnedQty = p.Sum(a => a.invretLJ.ReturnedQty),
                                                          MRP = p.Select(a => a.invitm.MRP).FirstOrDefault(),
                                                          Price = p.Select(a => a.invitm.Price).FirstOrDefault(),
                                                          SubTotal = p.Select(a => a.invitm.SubTotal).FirstOrDefault(),
                                                          VATPercentage = p.Select(a => a.invitm.VATPercentage).FirstOrDefault(),
                                                          DiscountPercentage = p.Select(a => a.invitm.DiscountPercentage).FirstOrDefault(),
                                                          TotalAmount = p.Select(a => a.invitm.TotalAmount).FirstOrDefault(),
                                                          ItemId = p.Key.ItemId,
                                                          ItemName = p.Select(a => a.invitm.ItemName).FirstOrDefault(),
                                                          FreeQuantity = p.Select(a => a.invitm.FreeQuantity).FirstOrDefault(),
                                                          CounterId = p.Select(a => a.invitm.CounterId).FirstOrDefault(),
                                                          CreatedBy = p.Select(a => a.invitm.CreatedBy).FirstOrDefault(),
                                                          CreatedOn = p.Select(a => a.invitm.CreatedOn).FirstOrDefault()
                                                      }).Where(a => a.Quantity > (a.ReturnedQty ?? 0)).OrderBy(a => a.ItemName).ToList(),

                                  }
                                //result.Join()

                                ).FirstOrDefault();
                    responseData.Status = (result == null) ? "Failed" : "OK";
                    responseData.Results = result;
                }
                #endregion
                else if (reqType == "GetRackByItem")
                {
                    var rackId = phrmdbcontext.PHRMItemMaster.Where(x => x.ItemId == itemId).Select(item => item.Rack).FirstOrDefault();

                    var RackName = phrmdbcontext.PHRMRack.Where(rack => rack.RackId == rackId).Select(rack => rack.Name).FirstOrDefault();
                    RackName = RackName == null ? "N/A" : RackName;

                    responseData.Status = "OK";
                    responseData.Results = RackName;

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
                    // try
                    //{
                    var visitDetails = (from patVisit in patientDbContext.Visits
                                        where patVisit.PatientId == pat.PatientId
                                        select new
                                        {
                                            patVisit.ProviderId,
                                            patVisit.PatientVisitId,
                                            IsAdmitted = (from adm in patientDbContext.Admissions
                                                          where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                          select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //Rajesh:18Aug19--> getting IsAdmitted status of patient                                   
                                        }
                                    ).OrderByDescending(p => p.PatientVisitId).FirstOrDefault();
                    pat.ProviderId = (visitDetails != null) ? visitDetails.ProviderId : null;
                    pat.IsAdmitted = (visitDetails != null) ? true : false;

                    // }
                    //catch
                    //{
                    //    pat.ProviderId = -1;
                    //    pat.IsAdmitted = false;
                    //}


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
                    foreach (var presItm in presItems)
                    {
                        presItm.ItemName = phrmdbcontext.PHRMItemMaster.Find(presItm.ItemId).ItemName;
                        var AvailableStockList = (from stk in phrmdbcontext.DispensaryStock
                                                  where stk.ItemId == presItm.ItemId && stk.AvailableQuantity > 0 && stk.ExpiryDate > DateTime.Now
                                                  select stk).ToList();
                        presItm.IsAvailable = (AvailableStockList.Count > 0) ? true : false;
                        //(phrmdbcontext.DispensaryStock.Where(a => a.ItemId == presItm.ItemId).Select(a => a.AvailableQuantity).FirstOrDefault() > 0) ? true : false;
                    }
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
                                      //join gri in phrmdbcontext.PHRMGoodsReceiptItems on stk.ItemId equals gri.ItemId into g
                                      //from gri in g.DefaultIfEmpty()
                                      //where stk.BatchNo == gri.BatchNo
                                      where stk.AvailableQuantity > 0           // filter AvailableQuantity greater than 0
                                      select new PHRMDispensaryStockViewModel
                                      {
                                          ItemId = stk.ItemId.Value,
                                          StockId = stk.StockId,
                                          BatchNo = stk.BatchNo,
                                          ExpiryDate = stk.ExpiryDate.Value,
                                          ItemName = itm.ItemName,
                                          AvailableQuantity = stk.AvailableQuantity.Value,
                                          MRP = stk.MRP.Value,
                                          Price = stk.Price.Value,
                                          GoodsReceiptItemId = 0 //To Group Join after this, we need the output of the two queries to be same.
                                      });

                    List<PHRMDispensaryStockViewModel> totalStockWithGRId = totalStock.GroupJoin(phrmdbcontext.PHRMGoodsReceiptItems, a => new { a.ItemId, a.BatchNo }, b => new
                    { b.ItemId, b.BatchNo }, (a, b) =>
                      new PHRMDispensaryStockViewModel
                      {
                          ItemId = a.ItemId,
                          StockId = a.StockId,
                          BatchNo = a.BatchNo,
                          ExpiryDate = a.ExpiryDate,
                          ItemName = a.ItemName,
                          AvailableQuantity = a.AvailableQuantity,
                          MRP = a.MRP,
                          Price = a.Price,
                          GoodsReceiptItemId = b.Select(s => s.GoodReceiptItemId).FirstOrDefault()
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

                    responseData.Status = (totalStockWithGRId == null) ? "Failed" : "OK";
                    responseData.Results = totalStockWithGRId;
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
                                          where bill.PatientId == patientId && (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption")//here PatientId comes as InputId from client.
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
                        CreditAmount = patCreditAmt,
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
                                                    join rbac in phrmdbcontext.Users on bill.CreatedBy equals rbac.EmployeeId
                                                    where (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption") && bill.Quantity != 0
                                                    //couldn't use Patient.ShortName directly since it's not mapped to DB and hence couldn't be used inside LINQ.
                                                    group bill by new { patient.PatientId, patient.PatientCode, patient.FirstName, patient.LastName, patient.MiddleName, patient.DateOfBirth, patient.Gender, bill.InvoiceId, patient.PhoneNumber, bill.CreatedBy } into p
                                                    select new
                                                    {
                                                        PatientId = p.Key.PatientId,
                                                        PatientCode = p.Key.PatientCode,
                                                        ShortName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + p.Key.LastName,
                                                        p.Key.DateOfBirth,
                                                        CreatedOn = p.Key.CreatedBy,
                                                        Gender = p.Key.Gender,
                                                        Address = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.Address),
                                                        CountrySubDivisionName = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId join subdiv in phrmdbcontext.CountrySubDivision on pat.CountrySubDivisionId equals subdiv.CountrySubDivisionId select subdiv.CountrySubDivisionName),
                                                        PhoneNumber = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.PhoneNumber),
                                                        PANNumber = (from pat in phrmdbcontext.PHRMPatient where pat.PatientId == p.Key.PatientId select pat.PANNumber),
                                                        //DateOfBirth = p.Max(a => a.DateOfBirth.Value),
                                                        LastCreditBillDate = p.Max(a => a.CreatedOn.Value),
                                                        TotalCredit = Math.Round(p.Sum(a => a.TotalAmount.Value), 0),
                                                        ContactNo = p.Key.PhoneNumber,
                                                        UserName = (from rbac in phrmdbcontext.Users where rbac.EmployeeId == p.Key.CreatedBy select rbac.UserName).FirstOrDefault()
                                                    }).OrderByDescending(b => b.LastCreditBillDate).ToList();

                    responseData.Status = "OK";
                    responseData.Results = allPatientCreditReceipts;
                }

                else if (reqType != null && reqType.ToLower() == "provisionalitemsbypatientid")
                {

                    var patCreditItems = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                          where (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption")
                                          && bill.PatientId == patientId && bill.Quantity > 0
                                          select bill).ToList();


                    foreach (var wardCreditItems in patCreditItems)
                    {
                        var User = phrmdbcontext.Users.Where(a => a.EmployeeId == wardCreditItems.CreatedBy).FirstOrDefault();
                        if (wardCreditItems.BilItemStatus == "wardconsumption")
                        {
                            var Consumption = phrmdbcontext.WardConsumption.Where(a => a.InvoiceItemId == wardCreditItems.InvoiceItemId).FirstOrDefault();
                            wardCreditItems.WardName = phrmdbcontext.WardModel.Find(Consumption.WardId).WardName;
                            wardCreditItems.WardUser = phrmdbcontext.Employees.Find(Consumption.CreatedBy).FullName;
                        }
                        else if (wardCreditItems.BilItemStatus == "provisional")
                        {
                            wardCreditItems.WardUser = User.UserName;
                            wardCreditItems.WardName = "Dispensary";
                            wardCreditItems.StockId = (from provItem in phrmdbcontext.PHRMInvoiceTransactionItems
                                                       where provItem.InvoiceItemId == wardCreditItems.InvoiceItemId
                                                       join dispenStock in phrmdbcontext.DispensaryStock
                                                       on new { provItem.ItemId, provItem.BatchNo, provItem.MRP, provItem.ExpiryDate } equals
                                                          new { dispenStock.ItemId, dispenStock.BatchNo, dispenStock.MRP, dispenStock.ExpiryDate }
                                                       select dispenStock.StockId).FirstOrDefault();

                        }


                    }
                    // 21th sep 2020:Ashish : replaced patCreditItems with ascending order list items.
                    var itemList = patCreditItems.OrderBy(s => s.ItemName).ToList();
                    patCreditItems = itemList;

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

                else if (reqType == "pending-bills-for-settlements")
                {
                    DataTable settlInfo = DanpheEMR.DalLayer.DALFunctions.GetDataTableFromStoredProc("SP_TXNS_PHRM_SettlementSummary", phrmdbcontext);
                    responseData.Results = settlInfo;
                    //var results = (from pat in phrmdbcontext.PHRMPatient
                    //               join intxn in phrmdbcontext.PHRMInvoiceTransaction on pat.PatientId equals intxn.PatientId
                    //               where intxn.BilStatus == "unpaid" && intxn.PaymentMode == "credit" && intxn.IsReturn !=true
                    //               group pat by new
                    //               {
                    //                   pat.PatientId,
                    //                   pat.PatientCode,
                    //                   pat.DateOfBirth,
                    //                   pat.Gender,
                    //                   pat.PhoneNumber,
                    //                   pat.FirstName,
                    //                   pat.MiddleName,
                    //                   pat.LastName
                    //               } into p
                    //               select new
                    //               {
                    //                   PatientCode = p.Key.PatientCode,
                    //                   PatientName = p.Key.FirstName + " " + (string.IsNullOrEmpty(p.Key.MiddleName) ? "" : p.Key.MiddleName + " ") + " " + p.Key.LastName,
                    //                   DateOfBirth = p.Key.DateOfBirth,
                    //                   Gender = p.Key.Gender,
                    //                   PatientId = p.Key.PatientId,
                    //                   PhoneNumber = p.Key.PhoneNumber,

                    //                   CreditTotal = (from cre in phrmdbcontext.PHRMInvoiceTransaction
                    //                                  where cre.PatientId == p.Key.PatientId && cre.BilStatus == "unpaid" && cre.PaymentMode == "credit" && cre.IsReturn != true
                    //                                  group cre by new { cre.PatientId } into c
                    //                                  select new
                    //                                  {
                    //                                      Creditdate = c.OrderByDescending(a => a.Creditdate).Select(a=>a.Creditdate).FirstOrDefault(),
                    //                                      CreditTotal = c.Sum(a => a.TotalAmount)

                    //                                  }).FirstOrDefault(),
                    //                   DepositBalance = phrmdbcontext.DepositModel.Where(a=>a.PatientId == p.Key.PatientId).OrderByDescending(a=>a.DepositId).Select(a=>a.DepositBalance).FirstOrDefault()
                    //               }).ToList();

                    responseData.Status = "OK";
                }
                else if (reqType != null && reqType == "unpaidInvoiceByPatientId" && patientId != null && patientId != 0)
                {
                    PHRMPatient currPatient = phrmdbcontext.PHRMPatient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in phrmdbcontext.PHRMPatient
                                             join countrySubdiv in phrmdbcontext.CountrySubDivision
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                    }

                    var patCreditInvoice = (from bill in phrmdbcontext.PHRMInvoiceTransaction.Include("InvoiceItems")
                                            where bill.BilStatus == "unpaid" && bill.IsReturn != true && bill.PatientId == patientId
                                            select bill).ToList<PHRMInvoiceTransactionModel>().OrderBy(b => b.InvoiceId);

                    var patCreditDetails = new { Patient = currPatient, CreditItems = patCreditInvoice };


                    responseData.Results = patCreditDetails;
                    responseData.Status = "OK";

                }
                else if (reqType != null && reqType == "patientPastBillSummary" && patientId != null && patientId != 0)
                {
                    var patientAllDepositTxns = (from bill in phrmdbcontext.DepositModel
                                                 where bill.PatientId == patientId// && bill.i == true//here PatientId comes as InputId from client.
                                                 group bill by new { bill.PatientId, bill.DepositType } into p
                                                 select new
                                                 {
                                                     DepositType = p.Key.DepositType,
                                                     SumAmount = p.Sum(a => a.DepositAmount)
                                                 }).ToList();
                    double? totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
                    currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "deposit").FirstOrDefault() != null)
                    {
                        totalDepositAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "deposit").FirstOrDefault().SumAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositdeduct").FirstOrDefault() != null)
                    {
                        totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositdeduct").FirstOrDefault().SumAmount;
                    }
                    if (patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositreturn").FirstOrDefault() != null)
                    {
                        totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.DepositType.ToLower() == "depositreturn").FirstOrDefault().SumAmount;
                    }
                    //below is the formula to calculate deposit balance.
                    currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

                    //Part-2: Get Total Provisional Items
                    //for this request type, patientid comes as inputid.

                    //Rajesh:- Getting InoviceId From TXN_Invoice table
                    //var patId = phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.PatientId == patientId).FirstOrDefault(); 

                    var patProvisional = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                              //sud: 4May'18 changed unpaid to provisional
                                          where bill.PatientId == patientId && (bill.BilItemStatus == "provisional" || bill.BilItemStatus == "wardconsumption") //here PatientId comes as InputId from client.
                                                                                                                                                                // && (bill.IsInsurance == false || bill.IsInsurance == null)
                                          group bill by new { bill.InvoiceId } into p
                                          select new
                                          {
                                              TotalProvisionalAmt = p.Sum(a => a.TotalAmount)
                                          }).FirstOrDefault();

                    var patProvisionalAmt = patProvisional != null ? patProvisional.TotalProvisionalAmt : 0;



                    var patCredits = (from bill in phrmdbcontext.PHRMInvoiceTransaction
                                      where bill.PatientId == patientId
                                      && bill.BilStatus == "unpaid"
                                      group bill by new { bill.PatientId } into p
                                      select new
                                      {
                                          TotalUnPaidAmt = p.Sum(a => a.TotalAmount)
                                      }).FirstOrDefault();

                    var patCreditAmt = patCredits != null ? patCredits.TotalUnPaidAmt : 0;

                    //Part-4: Get Total Paid Amount
                    var patPaid = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                   where bill.PatientId == patientId
                                   && bill.BilItemStatus == "paid"
                                   group bill by new { bill.PatientId } into p
                                   select new
                                   {
                                       TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                   }).FirstOrDefault();

                    var patPaidAmt = patPaid != null ? patPaid.TotalPaidAmt : 0;

                    //Part - 5: get Total Discount Amount
                    //var patDiscount = dbContext.BillingTransactionItems
                    //                .Where(b => b.PatientId == InputId && b.BillStatus == "unpaid" && b.ReturnStatus == false && b.IsInsurance == false)
                    //                 .Sum(b => b.DiscountAmount);

                    //double patDiscountAmt = patDiscount != null ? patDiscount.Value : 0;

                    var patDiscount = (from bill in phrmdbcontext.PHRMInvoiceTransaction
                                       where bill.PatientId == patientId
                                       && bill.BilStatus == "unpaid"
                                       // && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                       //  && (bill.IsInsurance == false || bill.IsInsurance == null)
                                       select bill.DiscountAmount).FirstOrDefault();

                    var patDiscountAmt = patDiscount != null ? patDiscount : 0;

                    //Part-6: get Total Cancelled Amount
                    var patCancel = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                         //sud: 4May'18 changed unpaid to provisional
                                     where bill.PatientId == patientId
                                     && bill.BilItemStatus == "cancel"
                                     //   && (bill.IsInsurance == false || bill.IsInsurance == null)
                                     group bill by new { bill.PatientId } into p
                                     select new
                                     {
                                         TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                     }).FirstOrDefault();

                    var patCancelAmt = patCancel != null ? patCancel.TotalPaidAmt : 0;

                    //Part-7: get Total Cancelled Amount
                    //var patReturn = dbContext.BillingTransactionItems
                    //                .Where(b => b.PatientId == InputId && b.ReturnStatus == true) //&& (b.BillStatus == "paid" || b.BillStatus == "unpaid") && b.IsInsurance == false)
                    //                 .Sum(b => b.TotalAmount);

                    var patReturn = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems
                                     where bill.PatientId == patientId
                                     //  && bill.ReturnStatus == true
                                     //  && (bill.IsInsurance == false || bill.IsInsurance == null)
                                     group bill by new { bill.PatientId } into p
                                     select new
                                     {
                                         TotalPaidAmt = p.Sum(a => a.TotalAmount)
                                     }).FirstOrDefault();
                    var patReturnAmt = patReturn != null ? patReturn.TotalPaidAmt : 0;

                    //Part-8 get Subtotal amount 
                    var patSubtotal = (from bill in phrmdbcontext.PHRMInvoiceTransaction
                                       where bill.PatientId == patientId
                                       && bill.BilStatus == "unpaid"
                                       // && (bill.ReturnStatus == false || bill.ReturnStatus == null)
                                       //  && (bill.IsInsurance == false || bill.IsInsurance == null)
                                       select bill.SubTotal).FirstOrDefault();

                    var patSubtotalAmt = patSubtotal != null ? patSubtotal : 0;

                    //Part-9: Return a single object with Both Balances (Deposit and Credit).
                    var patBillHistory = new
                    {
                        PatientId = patientId,
                        PaidAmount = patPaidAmt,
                        DiscountAmount = patDiscountAmt,
                        CancelAmount = patCancelAmt,
                        ReturnedAmount = patReturnAmt,
                        CreditAmount = patCreditAmt,
                        ProvisionalAmt = patProvisionalAmt,
                        TotalDue = patCreditAmt + patProvisionalAmt,
                        DepositBalance = currentDepositBalance,
                        //  BalanceAmount = currentDepositBalance - (patCreditAmt + patProvisionalAmt)
                        SubtotalAmount = patSubtotalAmt
                    };


                    responseData.Results = patBillHistory;
                    responseData.Status = "OK";
                }
                else if (reqType != null && reqType == "provisionalItemsByPatientIdForSettle" && patientId != null && patientId != 0)
                {
                    PHRMPatient currPatient = phrmdbcontext.PHRMPatient.Where(pat => pat.PatientId == patientId).FirstOrDefault();
                    if (currPatient != null)
                    {
                        string subDivName = (from pat in phrmdbcontext.PHRMPatient
                                             join countrySubdiv in phrmdbcontext.CountrySubDivision
                                             on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                             where pat.PatientId == currPatient.PatientId
                                             select countrySubdiv.CountrySubDivisionName
                                          ).FirstOrDefault();

                        currPatient.CountrySubDivisionName = subDivName;
                        //remove relational property of patient//sud: 12May'18
                        currPatient.PHRMInvoiceTransactionItems = null;
                    }

                    //for this request type, patientid comes as inputid.
                    var patCreditItems = (from bill in phrmdbcontext.PHRMInvoiceTransactionItems//.Include("ServiceDepartment")
                                          where bill.BilItemStatus == "provisional" && bill.PatientId == patientId
                                          select bill).ToList<PHRMInvoiceTransactionItemsModel>().OrderBy(b => b.InvoiceId);

                    //clear patient object from Items, not needed since we're returning patient object separately
                    if (patCreditItems != null)
                    {

                        var allEmployees = (from emp in phrmdbcontext.Employees
                                            join dep in phrmdbcontext.Departments
                                            on emp.DepartmentId equals dep.DepartmentId into empDpt
                                            from emp2 in empDpt.DefaultIfEmpty()
                                            select new
                                            {
                                                EmployeeId = emp.EmployeeId,
                                                EmployeeName = emp.FirstName,
                                                DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                                                DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                                            }).ToList();

                        BillingFiscalYear fiscYear = PharmacyBL.GetFiscalYear(connString);

                    }

                    //create new anonymous type with patient information + Credit Items information : Anish:4May'18
                    var patCreditDetails = new
                    {
                        Patient = currPatient,
                        CreditItems = patCreditItems.OrderBy(itm => itm.CreatedOn).ToList()
                    };


                    responseData.Results = patCreditDetails;
                }
                #region GET: requisition item-wise list
                else if (reqType == "itemwiseRequistionList")
                {
                    var rItems = (from rItms in phrmdbcontext.StoreRequisitionItems
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
                    var stks = (from stk in phrmdbcontext.PHRMStock
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
                #region GET: Internal > Requisition : dept/requisition wise list
                else if (reqType != null && reqType == "deptwiseRequistionList")
                {
                    string[] requisitionStatus = status.Split(',');
                    //we need data from 2 different dbContext, we cannot use them together in one linq query
                    //therefore, first we get dept,requisition and then using both the list we get final result
                    List<DepartmentModel> DepartmentList = (from dept in masterDbContext.Departments
                                                            select dept).ToList();

                    List<PHRMStoreRequisitionModel> RequisitionList = (from requ in phrmdbcontext.StoreRequisition
                                                                       join stat in requisitionStatus on requ.RequisitionStatus equals stat
                                                                       orderby requ.RequisitionDate descending
                                                                       select requ).ToList();

                    var requestDetails = (from req in RequisitionList
                                          join emp in phrmdbcontext.Employees on req.CreatedBy equals emp.EmployeeId
                                          select new
                                          {
                                              RequistionId = req.RequisitionId,
                                              RequisitionDate = req.RequisitionDate,
                                              RequisitionStatus = req.RequisitionStatus,
                                              CreatedByName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName
                                          }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = requestDetails;
                }
                #endregion
                #region //Get RequisitionItems by Requisition Id don't check any status this for View Purpose
                else if (reqType != null && reqType.ToLower() == "requisitionitemsforview")
                {
                    //this for get employee Name

                    var requistionDate = (from req in phrmdbcontext.StoreRequisition
                                          where req.RequisitionId == requisitionId
                                          select req.RequisitionDate).FirstOrDefault();
                    var requisitionItems = (from reqItems in phrmdbcontext.StoreRequisitionItems
                                            join itm in phrmdbcontext.PHRMItemMaster on reqItems.ItemId equals itm.ItemId
                                            //join emp in masterDbContext.Employees on reqItems.CreatedBy equals emp.EmployeeId
                                            where reqItems.RequisitionId == requisitionId
                                            select new
                                            {
                                                reqItems.ItemId,
                                                reqItems.RequisitionItemId,
                                                reqItems.PendingQuantity,
                                                reqItems.Quantity,
                                                reqItems.Remark,
                                                reqItems.ReceivedQuantity,
                                                reqItems.CreatedBy,
                                                //CreatedByName= emp.FirstName +' '+emp.LastName,
                                                CreatedOn = requistionDate,
                                                reqItems.RequisitionItemStatus,
                                                itm.ItemName,
                                                reqItems.RequisitionId
                                            }
                                         ).ToList();
                    var employeeList = (from emp in phrmdbcontext.Employees select emp).ToList();

                    var requestDetails = (from reqItem in requisitionItems
                                          join emp in phrmdbcontext.Employees on reqItem.CreatedBy equals emp.EmployeeId
                                          join dispJoined in phrmdbcontext.StoreDispatchItems on reqItem.RequisitionItemId equals dispJoined.RequisitionItemId into dispTemp
                                          //join dispt in phrmdbcontext.DispatchItems on reqItem.RequisitionItemId equals dispt.RequisitionItemId into dispTemp
                                          from disp in dispTemp.DefaultIfEmpty()
                                          select new
                                          {
                                              reqItem.ItemId,
                                              PendingQuantity = reqItem.PendingQuantity,
                                              reqItem.Quantity,
                                              reqItem.Remark,
                                              ReceivedQuantity = reqItem.ReceivedQuantity,
                                              reqItem.CreatedBy,
                                              CreatedByName = emp.FullName,
                                              reqItem.CreatedOn,
                                              reqItem.RequisitionItemStatus,
                                              reqItem.ItemName,
                                              reqItem.RequisitionId,
                                              ReceivedBy = disp == null ? "" : disp.ReceivedBy,
                                              //ReceivedBy = "",
                                              DispatchedByName = disp == null ? "" : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName
                                              ///DispatchedByName = ""
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
                            RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                            ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                            DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault()
                        }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = requestDetails;
                }
                #endregion
                #region//Get All Requisition Items and Related Stock records(by ItemId of RequisitionItems table) 
                //for Dispatch Items to department against Requisition Id
                else if (reqType != null && reqType.ToLower() == "requisitionbyid")
                {
                    PHRMRequisitionStockVM requisitionStockVM = new PHRMRequisitionStockVM();
                    //Getting Requisition and Requisition Items by Requisition Id
                    //Which RequisitionStatus and requisitionItemsStatus is not 'complete','cancel' and 'initiated'
                    List<PHRMStoreRequisitionModel> requisitionDetails = (from requisition in phrmdbcontext.StoreRequisition
                                                                          where (requisition.RequisitionStatus == "partial" ||
                                                                          requisition.RequisitionStatus == "active") && requisition.RequisitionId == requisitionId
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
                        var ItemId = requisitionDetails[0].RequisitionItems[j].ItemId;
                        requisitionDetails[0].RequisitionItems[j].StoreRackName = PharmacyBL.GetStoreRackNameByItemId(ItemId, phrmdbcontext);
                        List<PHRMStoreStockModel> stockItems = new List<PHRMStoreStockModel>();
                        stockItems = (from stock in phrmdbcontext.PHRMStoreStock
                                      where (stock.ItemId == ItemId && stock.Quantity > 0)
                                      select stock
                                              ).OrderByDescending(s => s.ExpiryDate).ToList();
                        requisitionStockVM.stockTransactions.AddRange(stockItems);
                    }

                    requisitionStockVM.requisition = requisitionDetails[0];
                    responseData.Status = "OK";
                    responseData.Results = requisitionStockVM;
                }
                #endregion
                #region //Get dIspatch Details
                else if (reqType != null && reqType.ToLower() == "dispatchview")
                {
                    var requisitionItems = (from reqItems in phrmdbcontext.StoreRequisitionItems
                                            where reqItems.RequisitionId == requisitionId
                                            select reqItems).ToList();
                    var employeeList = (from emp in phrmdbcontext.Employees select emp).ToList();

                    var requestDetails = (from reqItem in requisitionItems
                                          join emp in phrmdbcontext.Employees on reqItem.CreatedBy equals emp.EmployeeId
                                          join dispt in phrmdbcontext.StoreDispatchItems on reqItem.RequisitionItemId equals dispt.RequisitionItemId into dispTemp
                                          from disp in dispTemp.DefaultIfEmpty()
                                          select new
                                          {
                                              CreatedByName = emp.FullName,
                                              disp.CreatedOn,
                                              reqItem.RequisitionId,
                                              disp.DispatchId,
                                              ReceivedBy = disp == null ? null : disp.ReceivedBy,
                                              DispatchedByName = disp == null ? null : employeeList.Find(a => a.EmployeeId == disp.CreatedBy).FullName
                                          }
                        ).ToList().GroupBy(a => a.DispatchId).Select(g => new
                        {
                            CreatedByName = g.Select(a => a.CreatedByName).FirstOrDefault(),
                            CreatedOn = g.Select(a => a.CreatedOn).FirstOrDefault(),
                            RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                            DispatchId = g.Select(a => a.DispatchId).FirstOrDefault(),
                            ReceivedBy = g.Select(a => a.ReceivedBy).FirstOrDefault(),
                            DispatchedByName = g.Select(a => a.DispatchedByName).FirstOrDefault()
                        }).ToList();
                    responseData.Results = requestDetails;
                    responseData.Status = "OK";
                }
                #endregion
                #region //Get dIspatch Details
                else if (reqType != null && reqType.ToLower() == "dispatchviewbydispatchid")
                {
                    var dispatchDetails = (from disp in phrmdbcontext.StoreDispatchItems
                                           where dispatchId == disp.DispatchId
                                           join item in phrmdbcontext.PHRMItemMaster on disp.ItemId equals item.ItemId
                                           join reqitm in phrmdbcontext.StoreRequisitionItems on disp.RequisitionItemId equals reqitm.RequisitionItemId
                                           join emp in phrmdbcontext.Employees on disp.CreatedBy equals emp.EmployeeId
                                           select new
                                           {
                                               CreatedByName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                               disp.CreatedOn,
                                               RequisitionDate = reqitm.CreatedOn,
                                               StandardRate = 0,
                                               item.ItemName,
                                               disp.ItemId,
                                               disp.DispatchedQuantity,
                                               reqitm.RequisitionId,
                                               disp.DispatchId,
                                               ReceivedBy = disp == null ? null : disp.ReceivedBy
                                           }
                        ).ToList();
                    responseData.Results = dispatchDetails;
                    responseData.Status = "OK";
                }
                #endregion

                else if (reqType == "provisional-return-list")
                {
                    var testdate = ToDate.AddDays(1);
                    var result = (from retItm in phrmdbcontext.PHRMInvoiceReturnItemsModel
                                  join invItm in phrmdbcontext.PHRMInvoiceTransactionItems on retItm.InvoiceItemId equals invItm.InvoiceItemId
                                  join pat in phrmdbcontext.PHRMPatient on invItm.PatientId equals pat.PatientId
                                  where ((invItm.InvoiceId == null) && retItm.Quantity != 0 && (retItm.CreatedOn > FromDate && retItm.CreatedOn < testdate))
                                  group new { invItm, retItm, pat } by new
                                  {
                                      invItm.PatientId,
                                      pat.PatientCode,
                                      pat.FirstName,
                                      pat.MiddleName,
                                      pat.LastName,
                                      pat.PhoneNumber,
                                  } into t
                                  select new
                                  {
                                      PatientCode = t.Key.PatientCode,
                                      PatientId = t.Key.PatientId,
                                      ShortName = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
                                      Gender = t.Select(r => r.pat.Gender).FirstOrDefault(),
                                      DateOfBirth = t.Select(r => r.pat.DateOfBirth).FirstOrDefault(),
                                      ContactNo = t.Key.PhoneNumber,
                                      Address = t.Select(r => r.pat.Address).FirstOrDefault(),
                                      PhoneNumber = t.Select(r => r.pat.PhoneNumber).FirstOrDefault(),
                                      PANNumber = t.Select(r => r.pat.PANNumber).FirstOrDefault(),
                                      InvoiceItemId = t.Select(s => s.invItm.InvoiceItemId).FirstOrDefault(),
                                      LastCreditBillDate = t.Max(r => r.retItm.CreatedOn),
                                      TotalCredit = t.Sum(r => (double)r.retItm.Price * r.retItm.Quantity).Value
                                  }).OrderByDescending(b => b.LastCreditBillDate).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                else if (reqType == "provisional-return-duplicate-print")
                {
                    var result = (from invR in phrmdbcontext.PHRMInvoiceReturnItemsModel
                                  join invItm in phrmdbcontext.PHRMInvoiceTransactionItems on invR.InvoiceItemId equals invItm.InvoiceItemId
                                  join patient in phrmdbcontext.PHRMPatient on invItm.PatientId equals patient.PatientId
                                  where patient.PatientId == patientId

                                  select new
                                  {
                                      TotalAmount = (double)invR.Price * invR.Quantity,
                                      ItemName = invItm.ItemName,
                                      ReturnQty = invR.Quantity,
                                      CreatedOn = invR.CreatedOn
                                  }).OrderByDescending(b => b.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                else if (reqType == "settlements-duplicate-prints")
                {
                    DataTable settlInfo = DALFunctions.GetDataTableFromStoredProc("SP_TXNS_PHRM_SettlementDuplicatePrint", phrmdbcontext);
                    responseData.Results = settlInfo;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-settlements-duplicate-details")
                {
                    PHRMSettlementModel phrmsettlement = new PHRMSettlementModel();
                    try
                    {
                        PatientDbContext patDbContext = new PatientDbContext(connString);
                        phrmsettlement = phrmdbcontext.PHRMSettlements.Where(s => s.SettlementId == settlementId).FirstOrDefault();
                        var patient = patDbContext.Patients.Where(s => s.PatientId == phrmsettlement.PatientId).FirstOrDefault();
                        var items = phrmdbcontext.PHRMInvoiceTransaction.Where(inv => inv.SettlementId == phrmsettlement.SettlementId).ToList();
                        phrmsettlement.Patient = patient;
                        phrmsettlement.PHRMInvoiceTransactions = items;
                        responseData.Status = "OK";
                        responseData.Results = phrmsettlement;

                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.ToString();
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

        [HttpGet]
        [Route("~/api/Pharmacy/getGoodReceiptHistory")]
        public async Task<IActionResult> GetGoodReceiptHistory()
        {
            var pharmacyDbContext = new PharmacyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                //var today = DateTime.Today;
                //var lastmonth = new DateTime(today.Year, today.Month - 1, today.Day+1);
                var lastmonth = DateTime.Today.AddMonths(-1);


                var GRH = await (from gr in pharmacyDbContext.PHRMGoodsReceipt
                                 where gr.CreatedOn > lastmonth && gr.IsCancel == false
                                 select new
                                 {
                                     gr.GoodReceiptId,
                                     gr.SupplierId,
                                     gr.CreatedOn,
                                     gr.InvoiceNo,
                                     gr.SubTotal,
                                     items = pharmacyDbContext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == gr.GoodReceiptId).ToList()
                                 }).ToListAsync();

                responseData.Status = "Success";
                //if (GRH == null || GRH.Count() == 0)
                //{
                //    responseData.Status = "Failed";
                //    responseData.ErrorMessage = "No GR history found.";
                //    return NotFound(responseData);
                //}
                responseData.Results = GRH;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to obtain GR history.";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpGet]
        [Route("~/api/Pharmacy/GetInvoiceHeader/{Module}")]
        public IActionResult GetInvoieHeader([FromRoute] string Module)
        {

            var phrmDBContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var ILL = phrmDBContext.InvoiceHeader.Where(a => a.Module == Module).ToList();

                var location = (from dbc in phrmDBContext.CFGParameters
                                where dbc.ParameterGroupName.ToLower() == "common"
                                && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                                select dbc.ParameterValue).FirstOrDefault();

                var path = _environment.WebRootPath + location;

                if (ILL == null)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No Header Found !";
                    return NotFound(responseData);
                }
                else
                {
                    string fullPath;
                    foreach (var item in ILL)
                    {
                        fullPath = path + item.LogoFileName;

                        FileInfo fl = new FileInfo(fullPath);
                        if (fl.Exists)
                        {
                            item.FileBinaryData = System.IO.File.ReadAllBytes(@fullPath);
                        }

                    }
                }

                responseData.Results = ILL;
                responseData.Status = "OK";


            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                throw;
            }
            return Ok(responseData);
        }

        [HttpGet]
        [Route("~/api/Pharmacy/GetGRDetailsByGRId/{GoodsReceiptId}")]
        public async Task<IActionResult> GetGRDetailsByGRId([FromRoute] int GoodsReceiptId)
        {
            var phrmDBContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetGRDetailByGRIdViewModel goodsReceiptVM = await phrmDBContext.GetGRDetailByGRIdAsync(GoodsReceiptId);
                responseData.Status = "OK";
                responseData.Results = goodsReceiptVM;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                throw;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/Pharmacy/GetInvoiceReceiptByInvoiceId/{InvoiceId}")]
        public async Task<IActionResult> GetInvoiceReceiptByInvoiceId([FromRoute] int InvoiceId)
        {
            var phrmDBContext = new PharmacyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetInvoiceReceiptByInvoiceIdViewModel invoiceReceiptVM = await phrmDBContext.GetInvoiceReceiptByInvoiceIdAsync(InvoiceId);
                responseData.Status = "OK";
                responseData.Results = invoiceReceiptVM;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                throw;
            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/Pharmacy/postInvoiceHeader")]
        public IActionResult PostInvoiceHeader()
        {
            var pharmacyDbContext = new PharmacyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                // Read Files From Clent Side 
                var f = this.ReadFiles();
                var file = f[0];

                // Read File details from form model
                var FD = Request.Form["fileDetails"];
                InvoiceHeaderModel fileDetails = DanpheJSONConvert.DeserializeObject<InvoiceHeaderModel>(FD);

                using (var dbContextTransaction = pharmacyDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        fileDetails.CreatedBy = currentUser.EmployeeId;
                        fileDetails.CreatedOn = DateTime.Now;

                        pharmacyDbContext.InvoiceHeader.Add(fileDetails);
                        pharmacyDbContext.SaveChanges();

                        var location = (from dbc in pharmacyDbContext.CFGParameters
                                        where dbc.ParameterGroupName.ToLower() == "common"
                                        && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                                        select dbc.ParameterValue).FirstOrDefault();

                        var path = _environment.WebRootPath + location;

                        if (!Directory.Exists(path))
                        {
                            Directory.CreateDirectory(path);
                        }
                        var fullPath = path + fileDetails.LogoFileName;


                        // Converting Files to Byte there for we require MemoryStream object
                        using (var ms = new MemoryStream())
                        {
                            // Copy Each file to MemoryStream
                            file.CopyTo(ms);

                            // Convert File to Byte[]
                            byte[] imageBytes = ms.ToArray();

                            FileInfo fi = new FileInfo(fullPath);
                            fi.Directory.Create(); // If the directory already exists, this method does nothing.
                            System.IO.File.WriteAllBytes(fi.FullName, imageBytes);
                            ms.Dispose();
                        }

                        // After File Added Commit the Transaction
                        dbContextTransaction.Commit();

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }

                responseData.Results = null;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Posting Invoice Header.";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string reqType = this.ReadQueryStringData("reqType");
            int requisitionId = Convert.ToInt32(this.ReadQueryStringData("requisitionId"));
            int StoreId = Convert.ToInt32(this.ReadQueryStringData("storeId"));

            NotiFicationDbContext notificationDbContext = new NotiFicationDbContext(connString);
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string str = this.ReadPostData();
            try
            {
                phrmdbcontext = this.AddAuditField(phrmdbcontext);
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

                    NotificationViewModel notification = new NotificationViewModel();
                    notification.Notification_ModuleName = "Pharmacy_Module";
                    notification.Notification_Title = "New Medicine";
                    notification.Notification_Details = currentUser.UserName + " has added new item " + itemData.ItemName;
                    notification.RecipientId = rbacDbContext.Roles.Where(a => a.RoleName == "Pharmacy").Select(a => a.RoleId).FirstOrDefault();
                    notification.RecipientType = "rbac-role";
                    notification.ParentTableName = "PHRM_MST_Item";
                    notification.NotificationParentId = 0;
                    notification.IsArchived = false;
                    notification.IsRead = false;
                    notification.ReadBy = 0;
                    notification.CreatedOn = DateTime.Now;
                    notification.Sub_ModuleName = "Store Stock";
                    notificationDbContext.Notifications.Add(notification);
                    notificationDbContext.SaveChanges();



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
                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    CoreDbContext coreDbContext = new CoreDbContext(connString);

                    PHRMPatient patientData = DanpheJSONConvert.DeserializeObject<PHRMPatient>(str);
                    patientData.CountrySubDivisionId = 76; //this is hardcoded because there is no provision to enter in countrysubdivision id 
                    patientData.CountryId = 1;//this is hardcoded because there is no provision to enter in country id
                    patientData.PatientId = PharmacyBL.RegisterPatient(patientData, phrmdbcontext, patientDbContext, coreDbContext);
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
                        grViewModelData.goodReceipt.FiscalYearId = PharmacyBL.GetFiscalYearGoodsReceipt(phrmdbcontext, grViewModelData.goodReceipt.GoodReceiptDate).FiscalYearId;
                        grViewModelData.goodReceipt.GoodReceiptPrintId = PharmacyBL.GetGoodReceiptPrintNo(phrmdbcontext, grViewModelData.goodReceipt.FiscalYearId);

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
                #region POST : setting-packingtype manage
                else if (reqType == "packingtype")
                {
                    PHRMPackingTypeModel packingtypeData = DanpheJSONConvert.DeserializeObject<PHRMPackingTypeModel>(str);
                    packingtypeData.CreatedOn = System.DateTime.Now;
                    phrmdbcontext.PHRMPackingType.Add(packingtypeData);
                    phrmdbcontext.SaveChanges();
                    responseData.Results = packingtypeData;
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
                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    if (invoiceDataFromClient.SelectedPatient.PatientId == 0)
                    {
                        invoiceDataFromClient.PatientId = PharmacyBL.RegisterPatient(invoiceDataFromClient.SelectedPatient, phrmdbcontext, patientDbContext, coreDbContext);
                        //phrmdbcontext.SaveChanges();
                    }

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
                            // 27th Aug 2020:Vikas : replaced finalInvoiceData.InvoiceItems with ascending order list items.
                            var itemList = finalInvoiceData.InvoiceItems.OrderBy(s => s.ItemName).ToList();
                            finalInvoiceData.InvoiceItems = itemList;

                            responseData.Status = "OK";
                            responseData.Results = finalInvoiceData;

                            if (realTimeRemoteSyncEnabled)
                            {
                                if (invoiceDataFromClient.IsRealtime == null)
                                {
                                    PHRMInvoiceTransactionModel invoiceSale = phrmdbcontext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == finalInvoiceData.InvoiceId).FirstOrDefault();
                                    finalInvoiceData = invoiceSale;
                                }
                                if (finalInvoiceData.IsReturn == null)
                                {
                                    //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                    ///PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(finalInvoiceData, "phrm-invoice", phrmdbcontext);
                                    Task.Run(() => PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(finalInvoiceData, "phrm-invoice", phrmdbcontext));
                                }
                            }
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
                    PatientDbContext patientDbContext = new PatientDbContext(connString);
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    if (invoiceDataFromClient.SelectedPatient.PatientId == 0)
                    {
                        invoiceDataFromClient.PatientId = PharmacyBL.RegisterPatient(invoiceDataFromClient.SelectedPatient, phrmdbcontext, patientDbContext, coreDbContext);
                        //phrmdbcontext.SaveChanges();
                    }
                    if (invoiceDataFromClient != null)//check client data is null or not
                    {
                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        ////setting Flag for checking whole transaction 
                        /// Boolean flag = false;
                        // this helps invoice id to get started from one then increment by one
                        PHRMInvoiceTransactionModel finalInvoiceData = PharmacyBL.CreditInvoiceTransaction(invoiceDataFromClient, phrmdbcontext, currentUser, requisitionId);
                        if (finalInvoiceData != null)
                        {
                            // 9th sep 2020:Ashish : replaced finalInvoiceData.InvoiceItems with ascending order list items.
                            var itemList = finalInvoiceData.InvoiceItems.OrderBy(s => s.ItemName).ToList();
                            finalInvoiceData.InvoiceItems = itemList;
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
                        invoiceObjFromClient.BilStatus = invoiceObjFromClient.PaymentMode == "credit" ? "unpaid" : "paid";
                        if (invoiceObjFromClient.PaymentMode == "credit")
                        {
                            invoiceObjFromClient.Creditdate = DateTime.Now;
                        }
                        else
                        {
                            invoiceObjFromClient.Creditdate = null;
                        }

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
                                //Dinesh 30th January 2020 Previously the quantity was sent in the stocktxnItem Table and now  corrected to retQty
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
                        //post to deposit table

                        if (invoiceObjFromClient.DepositDeductAmount != null && invoiceObjFromClient.DepositDeductAmount > 0)
                        {
                            PHRMDepositModel dep = new PHRMDepositModel();
                            {
                                dep.DepositType = "depositdeduct";
                                dep.Remark = "deposit used for transactionid:" + invoiceObjFromClient.InvoiceId;
                                dep.DepositAmount = invoiceObjFromClient.DepositAmount;
                                dep.DepositBalance = invoiceObjFromClient.DepositBalance;
                                dep.TransactionId = invoiceObjFromClient.InvoiceId;
                                dep.FiscalYear = invoiceObjFromClient.FiscalYear;
                                dep.CounterId = invoiceObjFromClient.CounterId;
                                dep.CreatedBy = invoiceObjFromClient.CreatedBy;
                                dep.CreatedOn = DateTime.Now;
                                dep.PatientId = invoiceObjFromClient.PatientId;
                            };
                            phrmdbcontext.DepositModel.Add(dep);
                            phrmdbcontext.SaveChanges();
                        }
                        //# post to PHRMDispensaryStock tables. 
                        List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                        invoiceItemsFromClient.ForEach(
                            itm =>
                            {
                                //Dinesh : 1st Jan 2020  Provisional return issue fix with creating the invoice after taking stock id from the dispensorystock  
                                var StockId = phrmdbcontext.DispensaryStock.Where(x => x.ItemId == itm.ItemId && x.ExpiryDate == itm.ExpiryDate && x.BatchNo == itm.BatchNo).Select(s => s.StockId).FirstOrDefault();
                                PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                                tempdispensaryStkTxn.AvailableQuantity = itm.ReturnQty;
                                tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                                tempdispensaryStkTxn.MRP = itm.MRP;
                                tempdispensaryStkTxn.InOut = "in";
                                tempdispensaryStkTxn.ItemId = itm.ItemId;
                                tempdispensaryStkTxn.Price = itm.Price;
                                tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                                tempdispensaryStkTxn.StockId = StockId != 0 ? StockId : 0;
                                phrmDispensaryItems.Add(tempdispensaryStkTxn);
                            }
                            );
                        var addUpdateDispensaryReslt = PharmacyBL.AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                        if (addUpdateDispensaryReslt)
                        {
                            phrmdbcontext.SaveChanges();
                        }

                        invoiceObjFromClient.InvoiceItems = invoiceItemsFromClient;
                        if (invoiceObjFromClient != null)
                        {
                            // 27th Aug 2020:Vikas : replaced finalInvoiceData.InvoiceItems with ascending order list items.
                            var itemList = invoiceObjFromClient.InvoiceItems.OrderBy(s => s.ItemName).ToList();
                            invoiceObjFromClient.InvoiceItems = itemList;
                            responseData.Status = "OK";
                            responseData.Results = invoiceObjFromClient;

                            if (realTimeRemoteSyncEnabled)
                            {
                                if (invoiceObjFromClient.IsRealtime == null)
                                {
                                    PHRMInvoiceTransactionModel invoiceSale = phrmdbcontext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == invoiceObjFromClient.InvoiceId).FirstOrDefault();
                                    invoiceObjFromClient = invoiceSale;
                                }
                                if (invoiceObjFromClient.IsReturn == null)
                                {
                                    //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.

                                    Task.Run(() => PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceObjFromClient, "phrm-invoice", phrmdbcontext));
                                }
                            }
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
                                itemFromServer.TotalDisAmt = itm.TotalDisAmt;
                                itemFromServer.TotalAmount = itm.TotalAmount;
                                itemFromServer.BilItemStatus = "provisional";

                                phrmdbcontext.Entry(itemFromServer).State = EntityState.Modified;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.SubTotal).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.Quantity).IsModified = true;
                                phrmdbcontext.Entry(itemFromServer).Property(x => x.TotalDisAmt).IsModified = true;
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

                                decimal? disAmount = 0;
                                invReturn.InvoiceId = null;
                                invReturn.CounterId = invoiceItem.CounterId;
                                invReturn.InvoiceItemId = invoiceItem.InvoiceItemId;
                                invReturn.BatchNo = invoiceItem.BatchNo;
                                invReturn.CreatedBy = currentUser.EmployeeId;
                                invReturn.CreatedOn = DateTime.Now;
                                invReturn.DiscountPercentage = invoiceItem.DiscountPercentage.Value;
                                invReturn.ItemId = invoiceItem.ItemId;
                                invReturn.MRP = invoiceItem.MRP;
                                invReturn.Remark = "provisionalreturned";
                                invReturn.Price = invoiceItem.Price;
                                invReturn.Quantity = (invoiceItem.ReturnQty);
                                invReturn.SubTotal = invoiceItem.ReturnQty * invoiceItem.MRP;
                                disAmount = invReturn.SubTotal * Convert.ToDecimal(invoiceItem.DiscountPercentage) / 100;
                                invReturn.PerItemDisAmt = (decimal)(((invReturn.SubTotal * Convert.ToDecimal(invReturn.DiscountPercentage)) / 100) / (decimal)invoiceItem.ReturnQty);                    //cal per item discount       
                                invReturn.TotalDisAmt = Convert.ToDecimal(disAmount);
                                invReturn.TotalAmount = invReturn.SubTotal - disAmount;
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
                                //Dinesh : 1st Jan 2020  Provisional return issue fix after taking stock id from the dispensorystock  
                                var StockId = phrmdbcontext.DispensaryStock.Where(x => x.ItemId == itm.ItemId && x.ExpiryDate == itm.ExpiryDate && x.BatchNo == itm.BatchNo).Select(s => s.StockId).FirstOrDefault();
                                PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                                tempdispensaryStkTxn.AvailableQuantity = itm.ReturnQty;
                                tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                                tempdispensaryStkTxn.MRP = itm.MRP;
                                tempdispensaryStkTxn.InOut = "in";
                                tempdispensaryStkTxn.ItemId = itm.ItemId;
                                tempdispensaryStkTxn.Price = itm.Price;
                                tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                                tempdispensaryStkTxn.StockId = StockId != 0 ? StockId : 0;
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
                            // 9th sept 2020:Ashish : replaced finalInvoiceData.InvoiceItems with ascending order list items.
                            var itemList = invoiceObjFromClient.OrderBy(s => s.ItemName).ToList();
                            invoiceObjFromClient = itemList;
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
                else if (reqType == "post-credit-organizations")
                {
                    PHRMCreditOrganizationsModel org = DanpheJSONConvert.DeserializeObject<PHRMCreditOrganizationsModel>(str);
                    phrmdbcontext.CreditOrganizations.Add(org);

                    phrmdbcontext.SaveChanges();
                    responseData.Results = org;
                    responseData.Status = "OK";
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
                                tempdispensaryStkTxn.StockId = itm.StockId;
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
                        //POST to PHRM_TXN_InvoiceReturnItems table.
                        List<PHRMInvoiceReturnItemsModel> invRetItm = new List<PHRMInvoiceReturnItemsModel>();
                        PHRMInvoiceReturnModel retcustMod = new PHRMInvoiceReturnModel();
                        invoiceObjFromClient.ForEach(itm =>
                        {
                            PHRMInvoiceReturnItemsModel tempRetItm = new PHRMInvoiceReturnItemsModel();
                            tempRetItm.InvoiceItemId = itm.InvoiceItemId;
                            tempRetItm.Quantity = itm.Quantity;
                            tempRetItm.Price = itm.Price;
                            tempRetItm.SubTotal = itm.SubTotal;
                            tempRetItm.TotalAmount = itm.TotalAmount;
                            tempRetItm.Remark = "provisionalcancelled";
                            tempRetItm.VATPercentage = itm.VATPercentage;
                            tempRetItm.DiscountPercentage = itm.DiscountPercentage;
                            tempRetItm.CreatedBy = itm.CreatedBy;
                            tempRetItm.CreatedOn = itm.CreatedOn;
                            tempRetItm.BatchNo = itm.BatchNo;
                            tempRetItm.MRP = itm.MRP;
                            tempRetItm.CounterId = itm.CounterId;
                            invRetItm.Add(tempRetItm);
                        });
                        retcustMod.InvoiceReturnItems = invRetItm;
                        var flag = PharmacyBL.SaveReturnInvoiceItems(retcustMod, phrmdbcontext, currentUser);
                        if (invoiceObjFromClient != null && flag)
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
                    PHRMInvoiceReturnModel retCustModel = DanpheJSONConvert.DeserializeObject<PHRMInvoiceReturnModel>(str);

                    if (retCustModel.InvoiceReturnItems != null)
                    {
                        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        //flag check all transaction successfully completed or not
                        Boolean flag = false;
                        flag = PharmacyBL.ReturnFromCustomerTransaction(retCustModel, phrmdbcontext, currentUser);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = retCustModel;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Return invoice Items is null or failed to Save";
                            responseData.Status = "Failed";
                        }
                        var invoiceretId = retCustModel.InvoiceReturnItems.Select(a => a.InvoiceId).FirstOrDefault();
                        //sync to remote server once return invoice is created
                        if (realTimeRemoteSyncEnabled)
                        {
                            if (flag == true)
                            {
                                PHRMInvoiceTransactionModel invoiceReturn = phrmdbcontext.PHRMInvoiceTransaction.Where(p => p.InvoiceId == invoiceretId).FirstOrDefault();
                                //Sud:24Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                ///PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceReturn, "phrm-invoice-return", phrmdbcontext);
                                Task.Run(() => PharmacyBL.SyncPHRMBillInvoiceToRemoteServer(invoiceReturn, "phrm-invoice-return", phrmdbcontext));

                            }
                        }
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
                        using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
                        {
                            try
                            {
                                Boolean flag = false;
                                flag = PharmacyBL.TransferStoreStockToDispensary(storeStockData, phrmdbcontext, currentUser);
                                if (flag)
                                {
                                    dbContextTransaction.Commit();//Commit Transaction

                                    responseData.Status = "OK";
                                    responseData.Results = 1;
                                }
                                else
                                {
                                    dbContextTransaction.Rollback();//Rollback transaction

                                    responseData.ErrorMessage = "Transfer failed";
                                    responseData.Status = "Failed";
                                }
                            }
                            catch (Exception ex)
                            {
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
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
                //TODO: Confirm if this is in use or not, if not remove this request type
                //this has been migrated to its own API
                else if (reqType == "cancel-goods-receipt")
                {
                    string stringdata = this.ReadQueryStringData("currGr");
                    PHRMGoodsReceiptModel currentGR = DanpheJSONConvert.DeserializeObject<PHRMGoodsReceiptModel>(stringdata);
                    string goodReceiptIdStr = this.ReadQueryStringData("goodsReceiptId");
                    int goodReceiptId;
                    if (int.TryParse(goodReceiptIdStr, out goodReceiptId))
                    {
                        bool flag = true;
                        flag = PharmacyBL.CancelGoodsReceipt(phrmdbcontext, goodReceiptId, currentUser, currentGR);
                        if (flag)
                        {
                            responseData.Status = "OK";
                            responseData.Results = 1;
                        }
                        else
                        {
                            responseData.ErrorMessage = "Goods Receipt Cancelation Failed!!...Some Items Comsumed.";
                            responseData.Status = "Failed";
                        }
                    }
                    else
                    {
                        responseData.ErrorMessage = "Goods Receipt Cancelation Failed!! GoodsReceiptId is Invalid.";
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

                else if (reqType == "postSettlementInvoice")
                {
                    PHRMSettlementModel phrmsettlement = DanpheJSONConvert.DeserializeObject<PHRMSettlementModel>(str);
                    //  RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                    using (var dbTransaction = phrmdbcontext.Database.BeginTransaction())
                    {
                        try
                        {
                            var txns = phrmsettlement.PHRMInvoiceTransactions;
                            List<PHRMInvoiceTransactionModel> newTxnList = new List<PHRMInvoiceTransactionModel>();
                            foreach (PHRMInvoiceTransactionModel txn in txns)
                            {
                                PHRMInvoiceTransactionModel newTxn = PHRMInvoiceTransactionModel.GetCloneWithItems(txn);
                                newTxnList.Add(newTxn);
                            }
                            phrmsettlement.PHRMInvoiceTransactions = null;
                            phrmsettlement.SettlementReceiptNo = GetSettlementReceiptNo(phrmdbcontext);
                            phrmsettlement.CreatedOn = System.DateTime.Now;
                            phrmsettlement.SettlementDate = System.DateTime.Now;
                            phrmsettlement.FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId;
                            phrmsettlement.CreatedBy = currentUser.EmployeeId;

                            phrmdbcontext.PHRMSettlements.Add(phrmsettlement);
                            phrmdbcontext.SaveChanges();
                            if (newTxnList != null && newTxnList.Count > 0 || phrmsettlement.RefundableAmount > 0)
                            {
                                foreach (var txn in newTxnList)
                                {
                                    phrmdbcontext.PHRMInvoiceTransaction.Attach(txn);
                                    txn.SettlementId = phrmsettlement.SettlementId;
                                    txn.BilStatus = "paid";
                                    txn.PaidAmount = txn.TotalAmount;
                                    txn.PaidDate = phrmsettlement.SettlementDate;
                                    txn.Remark = phrmsettlement.Remarks;

                                    phrmdbcontext.Entry(txn).Property(b => b.BilStatus).IsModified = true;
                                    phrmdbcontext.Entry(txn).Property(b => b.PaymentMode).IsModified = true;
                                    phrmdbcontext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                                    phrmdbcontext.Entry(txn).Property(b => b.PaidAmount).IsModified = true;
                                    phrmdbcontext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                                    phrmdbcontext.Entry(txn).Property(b => b.Remark).IsModified = true;


                                    phrmdbcontext.SaveChanges();
                                }
                                if (phrmsettlement.DepositDeducted != null && phrmsettlement.DepositDeducted > 0)
                                {

                                    PHRMDepositModel depositModel = new PHRMDepositModel()
                                    {
                                        DepositAmount = phrmsettlement.DepositDeducted,
                                        DepositType = "depositdeduct",
                                        FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId,
                                        Remark = "Deposit used in Settlement Receipt No. SR" + phrmsettlement.SettlementReceiptNo + " on " + phrmsettlement.SettlementDate,
                                        CreatedBy = currentUser.EmployeeId,
                                        CreatedOn = DateTime.Now,
                                        CounterId = phrmsettlement.CounterId,
                                        SettlementId = phrmsettlement.SettlementId,
                                        PatientId = phrmsettlement.PatientId,
                                        DepositBalance = 0,
                                        ReceiptNo = PharmacyBL.GetDepositReceiptNo(connString),
                                        PaymentMode = "cash",
                                    };

                                    phrmdbcontext.DepositModel.Add(depositModel);
                                    phrmdbcontext.SaveChanges();
                                }
                            }

                            dbTransaction.Commit();

                            responseData.Status = "OK";
                            responseData.Results = phrmsettlement;

                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.ToString();
                        }
                    }
                }

                else if (reqType != null && reqType == "StoreRequisition")
                {
                    string Str = this.ReadPostData();
                    PHRMStoreRequisitionModel RequisitionFromClient = DanpheJSONConvert.
                        DeserializeObject<PHRMStoreRequisitionModel>(Str);

                    List<PHRMStoreRequisitionItemsModel> requisitionItems = new List<PHRMStoreRequisitionItemsModel>();
                    PHRMStoreRequisitionModel requisition = new PHRMStoreRequisitionModel();

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
                    phrmdbcontext.StoreRequisition.Add(requisition);

                    //this is for requisition only
                    phrmdbcontext.SaveChanges();

                    //getting the lastest RequistionId 
                    int lastRequId = requisition.RequisitionId;

                    //assiging the RequisitionId and CreatedOn i requisitionitem list
                    requisitionItems.ForEach(item =>
                    {
                        item.RequisitionId = lastRequId;
                        item.CreatedOn = DateTime.Now;
                        item.AuthorizedOn = DateTime.Now;
                        item.PendingQuantity = (double)item.Quantity;
                        phrmdbcontext.StoreRequisitionItems.Add(item);

                    });
                    //this Save for requisitionItems
                    phrmdbcontext.SaveChanges();
                    responseData.Results = RequisitionFromClient.RequisitionId;
                    responseData.Status = "OK";

                }

                #region Post(save) Dispatched Items to database
                else if (reqType != null && reqType.ToLower() == "storedispatchitems")
                {
                    string Str = this.ReadPostData();
                    PHRMRequisitionStockVM requisitionStockVMFromClient = DanpheJSONConvert.DeserializeObject<PHRMRequisitionStockVM>(Str);

                    if (requisitionStockVMFromClient.dispatchItems != null && requisitionStockVMFromClient.dispatchItems.Count > 0)
                    {
                        Boolean Flag = false;
                        Flag = PharmacyBL.DispatchItemsTransaction(requisitionStockVMFromClient, phrmdbcontext);
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

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT invoice header
        [HttpPut]
        [Route("~/api/Pharmacy/putInvoiceHeader")]
        public IActionResult PutInvoiceHeader()
        {
            var pharmacyDbContext = new PharmacyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                // Read Files From Clent Side 
                var f = this.ReadFiles();

                // Read File details from form model
                var FD = Request.Form["fileDetails"];
                InvoiceHeaderModel selectedInvoiceHeader = DanpheJSONConvert.DeserializeObject<InvoiceHeaderModel>(FD);

                selectedInvoiceHeader.ModifiedBy = currentUser.EmployeeId;
                selectedInvoiceHeader.ModifiedOn = DateTime.Now;

                pharmacyDbContext.InvoiceHeader.Attach(selectedInvoiceHeader);
                pharmacyDbContext.Entry(selectedInvoiceHeader).State = EntityState.Modified;
                pharmacyDbContext.Entry(selectedInvoiceHeader).Property(x => x.CreatedOn).IsModified = false;
                pharmacyDbContext.Entry(selectedInvoiceHeader).Property(x => x.CreatedBy).IsModified = false;
                pharmacyDbContext.SaveChanges();

                if (f.Count > 0)
                {
                    var file = f[0];

                    var location = (from dbc in pharmacyDbContext.CFGParameters
                                    where dbc.ParameterGroupName.ToLower() == "common"
                                    && dbc.ParameterName == "InvoiceHeaderLogoUploadLocation"
                                    select dbc.ParameterValue).FirstOrDefault();

                    var path = _environment.WebRootPath + location;
                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                    }
                    var fullPath = path + selectedInvoiceHeader.LogoFileName;


                    // Converting Files to Byte there for we require MemoryStream object
                    using (var ms = new MemoryStream())
                    {
                        file.CopyTo(ms); // Copy Each file to MemoryStream

                        byte[] imageBytes = ms.ToArray(); // Convert File to Byte[]

                        FileInfo fi = new FileInfo(fullPath);
                        fi.Directory.Create(); // If the directory already exists, this method does nothing.
                        System.IO.File.WriteAllBytes(fi.FullName, imageBytes);
                        ms.Dispose();
                    }
                }

                responseData.Results = selectedInvoiceHeader;
                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Updating Invoice Header.";
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put(int settlementId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string reqType = this.ReadQueryStringData("reqType");
            int invoiceNo = ToInt(this.ReadQueryStringData("invoiceNo"));
            int PrintCount = ToInt(this.ReadQueryStringData("PrintCount"));
            int itemId = ToInt(this.ReadQueryStringData("itemId"));

            string str = this.ReadPostData();
            try
            {
                phrmdbcontext = this.AddAuditField(phrmdbcontext);
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
                    #region PUT : setting-packingtype manage
                    else if (reqType == "packingtype")
                    {
                        PHRMPackingTypeModel packingtypeData = DanpheJSONConvert.DeserializeObject<PHRMPackingTypeModel>(str);
                        phrmdbcontext.PHRMPackingType.Attach(packingtypeData);
                        phrmdbcontext.Entry(packingtypeData).State = EntityState.Modified;
                        phrmdbcontext.Entry(packingtypeData).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(packingtypeData).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = packingtypeData;
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
                        //invoiceDeta.CreditAmount = invoiceDeta.CreditAmount - paidAmount;
                        // invoiceDeta.PaidAmount = invoiceDeta.PaidAmount + paidAmount ;
                        //modify invoice bill status and provisional amount details
                        phrmdbcontext.PHRMInvoiceTransaction.Attach(invoiceDeta);
                        //Use property level EntityState Modified -- sudarshan: 5Sept'18
                        phrmdbcontext.Entry(invoiceDeta).State = EntityState.Modified;
                        phrmdbcontext.SaveChanges();

                        responseData.Results = 1;
                        responseData.Status = "OK";
                    }
                    #endregion

                    #region: Update Print Count After Print
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
                        string dispRackIdstr = this.ReadQueryStringData("dispensaryRackId");
                        string storeRackIdstr = this.ReadQueryStringData("storeRackId");
                        int? dispensaryRackId = dispRackIdstr == "null" ? (int?)null : ToInt(dispRackIdstr);
                        int? storeRackId = storeRackIdstr == "null" ? (int?)null : ToInt(storeRackIdstr);

                        PHRMItemMasterModel dbphrmItem = phrmdbcontext.PHRMItemMaster
                                       .Where(a => a.ItemId == itemId).FirstOrDefault<PHRMItemMasterModel>();
                        if (dbphrmItem != null)
                        {
                            dbphrmItem.Rack = dispensaryRackId;
                            dbphrmItem.StoreRackId = storeRackId;
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
                    //Rajesh: 24Aug2019
                    else if (reqType == "updateSettlementPrintCount")
                    {
                        int settlmntId = settlementId;
                        var currSettlment = phrmdbcontext.PHRMSettlements.Where(s => s.SettlementId == settlmntId).FirstOrDefault();
                        if (currSettlment != null)
                        {
                            int? printCount = currSettlment.PrintCount.HasValue ? currSettlment.PrintCount : 0;
                            printCount += 1;
                            phrmdbcontext.PHRMSettlements.Attach(currSettlment);
                            currSettlment.PrintCount = printCount;
                            currSettlment.PrintedOn = System.DateTime.Now;
                            currSettlment.PrintedBy = currentUser.EmployeeId;
                            phrmdbcontext.Entry(currSettlment).Property(b => b.PrintCount).IsModified = true;
                            phrmdbcontext.SaveChanges();

                            responseData.Results = new { SettlementId = settlementId, PrintCount = printCount };
                        }
                    }
                    //PUT credit organizations
                    else if (reqType == "put-credit-organizations")
                    {
                        PHRMCreditOrganizationsModel creditOrganization = DanpheJSONConvert.DeserializeObject<PHRMCreditOrganizationsModel>(str);
                        phrmdbcontext.CreditOrganizations.Attach(creditOrganization);
                        phrmdbcontext.Entry(creditOrganization).State = EntityState.Modified;
                        phrmdbcontext.Entry(creditOrganization).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(creditOrganization).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.SaveChanges();
                        responseData.Results = creditOrganization;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "updateGoodReceipt")
                    {

                        PHRMGoodsReceiptModel goodsReceipt = DanpheJSONConvert.DeserializeObject<PHRMGoodsReceiptModel>(str);
                        goodsReceipt.FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId;
                        if (goodsReceipt != null && goodsReceipt.GoodReceiptItem != null && goodsReceipt.GoodReceiptItem.Count > 0)
                        {

                            using (var dbTransaction = phrmdbcontext.Database.BeginTransaction())
                            {
                                try
                                {
                                    //to assign POID if new item has been added.
                                    var GRId = goodsReceipt.GoodReceiptId;
                                    var storeId = goodsReceipt.StoreId;
                                    var storeName = goodsReceipt.StoreName;
                                    goodsReceipt.ModifiedBy = currentUser.EmployeeId;
                                    goodsReceipt.ModifiedOn = DateTime.Now;
                                    //if any old item has been deleted, we need to compare POitemidlist
                                    //List<int> GRItmList = phrmdbcontext.PurchaseOrderItems.Where(a => a.PurchaseOrderId == PoId).Select(a => a.PurchaseOrderItemId).ToList();

                                    phrmdbcontext.PHRMGoodsReceipt.Attach(goodsReceipt);
                                    phrmdbcontext.Entry(goodsReceipt).State = EntityState.Modified;
                                    phrmdbcontext.Entry(goodsReceipt).Property(x => x.CreatedOn).IsModified = false;
                                    phrmdbcontext.Entry(goodsReceipt).Property(x => x.CreatedBy).IsModified = false;
                                    phrmdbcontext.SaveChanges();
                                    goodsReceipt.GoodReceiptItem.ForEach(itm =>
                                    {

                                        if (itm.GoodReceiptItemId > 0) //old elememnt will have the purchaseOrderItemId
                                        {
                                            // Update: Bikash:30June'20 - if GR item are already posted to accounting , good receipt editing has been denied
                                            //If Post to accounting has not been done and stock has been transfered to dispencery or substore, then some field of GR is allowed for edit 
                                            PHRMGoodsReceiptItemsModel pmrmGRItem = phrmdbcontext.PHRMGoodsReceiptItems.FirstOrDefault(a => a.GoodReceiptItemId == itm.GoodReceiptItemId);

                                            if (pmrmGRItem != null && pmrmGRItem.IsTransferredToACC != true) // Update: Bikash:30June'20 - if any store stock transaction has been done and is not transfered to accounting, good receipt editing has been alllowed.
                                            {
                                                if (itm.ReceivedQuantity != 0)
                                                {
                                                    itm.GrPerItemDisAmt = (decimal)(((itm.SubTotal * Convert.ToDecimal(itm.DiscountPercentage)) / 100) / (decimal)itm.ReceivedQuantity); //cal per item discount          
                                                }
                                                phrmdbcontext.PHRMGoodsReceiptItems.Attach(itm);
                                                phrmdbcontext.Entry(itm).State = EntityState.Modified;
                                                phrmdbcontext.Entry(itm).Property(x => x.GoodReceiptId).IsModified = false;
                                                phrmdbcontext.Entry(itm).Property(x => x.CreatedOn).IsModified = false;
                                                phrmdbcontext.Entry(itm).Property(x => x.CreatedBy).IsModified = false;
                                                phrmdbcontext.SaveChanges();
                                                //update storestock along with goodreceipt
                                                List<PHRMStoreStockModel> StoreStockList = phrmdbcontext.PHRMStoreStock.Where(a => a.GoodsReceiptItemId == itm.GoodReceiptItemId).Select(a => a).ToList();

                                                //if (StoreStockList.Count == 1) //if any store stock transaction has been done , good receipt editing should be forbidden.
                                                //{ }

                                                PHRMStoreStockModel StoreStock = StoreStockList[0];//take the first element of the list
                                                StoreStock.ItemId = itm.ItemId;
                                                StoreStock.BatchNo = itm.BatchNo;
                                                StoreStock.ExpiryDate = itm.ExpiryDate;
                                                StoreStock.Quantity = itm.ReceivedQuantity;
                                                StoreStock.FreeQuantity = itm.FreeQuantity;
                                                StoreStock.Price = itm.GRItemPrice;
                                                StoreStock.DiscountPercentage = itm.DiscountPercentage;
                                                StoreStock.VATPercentage = itm.VATPercentage;
                                                StoreStock.SubTotal = itm.SubTotal;
                                                StoreStock.TotalAmount = itm.TotalAmount;
                                                StoreStock.MRP = itm.MRP;
                                                StoreStock.CCCharge = itm.CCCharge;
                                                StoreStock.StoreId = storeId;
                                                StoreStock.StoreName = storeName;
                                                StoreStock.ItemName = itm.ItemName;
                                                StoreStock.ModifiedBy = currentUser.EmployeeId;
                                                StoreStock.ModifiedOn = DateTime.Now;
                                                phrmdbcontext.PHRMStoreStock.Attach(StoreStock);
                                                phrmdbcontext.Entry(StoreStock).State = EntityState.Modified;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.InOut).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.ReferenceNo).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.ReferenceItemCreatedOn).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.TransactionType).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.CreatedBy).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.CreatedOn).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.GoodsReceiptItemId).IsModified = false;
                                                phrmdbcontext.Entry(StoreStock).Property(x => x.IsActive).IsModified = false;
                                                phrmdbcontext.SaveChanges();
                                            }
                                            else
                                            {
                                                Exception ex = new Exception(itm.ItemName + " has been already Posted to Accounting! Further editing is forbidden.");
                                                responseData.Results = itm.ItemName;
                                                throw ex;
                                            }
                                        }
                                    });
                                    dbTransaction.Commit();
                                    responseData.Results = goodsReceipt.GoodReceiptId; ;
                                }
                                catch (Exception Ex)
                                {
                                    dbTransaction.Rollback();
                                    throw Ex;
                                }
                            }

                            responseData.Results = goodsReceipt;
                            responseData.Status = "OK";
                        }
                    }

                    #region PUT : CC Charge value
                    else if (reqType == "cccharge")
                    {
                        CfgParameterModel parameter = DanpheJSONConvert.DeserializeObject<CfgParameterModel>(str);
                        MasterDbContext masterDBContext = new MasterDbContext(connString);


                        //  phrmdbcontext.SaveChanges();
                        var parmToUpdate = (from paramData in masterDBContext.CFGParameters
                                            where
                                            //paramData.ParameterId == parameter.ParameterId
                                            //no need of below comparision since parameter id is Primary Key and we can compare only to it.
                                            //&&
                                            paramData.ParameterName == "PharmacyCCCharge"
                                            && paramData.ParameterGroupName == "Pharmacy"
                                            select paramData
                                            ).FirstOrDefault();

                        parmToUpdate.ParameterValue = parameter.ParameterValue;
                        masterDBContext.CFGParameters.Attach(parmToUpdate);

                        masterDBContext.Entry(parmToUpdate).Property(p => p.ParameterValue).IsModified = true;

                        masterDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = parmToUpdate;
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
        [HttpPut]
        [Route("~/api/Pharmacy/UpdateStockMRP")]
        public IActionResult UpdateStockMRP()
        {
            var str = this.ReadPostData();
            var mrpUpdatedStock = DanpheJSONConvert.DeserializeObject<PHRMUpdatedStockVM>(str);
            var responseData = new DanpheHTTPResponse<object>();
            var db = new PharmacyDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                if (mrpUpdatedStock.LocationId == ENUM_StockLocation.Dispensary)
                {
                    PharmacyBL.UpdateMRPForDispensaryStock(mrpUpdatedStock, db);

                }
                else if (mrpUpdatedStock.LocationId == ENUM_StockLocation.Store)
                {
                    PharmacyBL.UpdateMRPForStoreStock(mrpUpdatedStock, db, currentUser);
                }
                else
                {
                    throw new Exception();
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Could not perform the request. {ex.Message}";
                return BadRequest(responseData);
            }
            PharmacyBL.UpdateMRPHistory(mrpUpdatedStock, db, currentUser);
            responseData.Results = mrpUpdatedStock;
            responseData.Status = "OK";
            return Ok(responseData);

        }
        [HttpPut]
        [Route("~/api/Pharmacy/UpdateStockExpiryDateandBatchNo")]
        public IActionResult UpdateStockExpiryDateandBatchNo()
        {
            var str = this.ReadPostData();
            var expbatchUpdatedStock = DanpheJSONConvert.DeserializeObject<PHRMUpdatedStockVM>(str);
            var responseData = new DanpheHTTPResponse<object>();
            var db = new PharmacyDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {

                if (expbatchUpdatedStock.LocationId == ENUM_StockLocation.Store)
                {
                    PharmacyBL.UpdateStockExpiryDateandBatchNoForStoreStock(expbatchUpdatedStock, db, currentUser);
                }
                else
                {
                    throw new Exception();
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Could not perform the request. {ex.Message}";
                return BadRequest(responseData);
            }
            PharmacyBL.PostExpiryDateandBatchNoHistory(expbatchUpdatedStock, db, currentUser);
            responseData.Results = expbatchUpdatedStock;
            responseData.Status = "OK";
            return Ok(responseData);

        }
        [HttpPut()]
        [Route("~/api/Pharmacy/cancelGoodsReceipt")]
        public IActionResult CancelGoodsReceipt(int GoodsReceiptId, string CancelRemarks)
        {
            PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                responseData.Results = phrmDbContext.CancelGoodsReceipt(GoodsReceiptId, CancelRemarks, currentUser);

                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.ErrorMessage = ex.Message;
                responseData.Status = "Failed";
            }
            return Ok(responseData);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        private int GetSettlementReceiptNo(PharmacyDbContext dbContext)
        {
            int? currSettlmntNo = dbContext.PHRMSettlements.Max(a => a.SettlementReceiptNo);
            if (!currSettlmntNo.HasValue)
            {
                currSettlmntNo = 0;
            }

            return currSettlmntNo.Value + 1;
        }
    }
}
