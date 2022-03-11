using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class WardSupplyController : CommonController
    {

        bool realTimeRemoteSyncEnabled = false;
        public WardSupplyController(IOptions<MyConfiguration> _config) : base(_config)
        {

            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType, string status, int requisitionId, int wardId, int consumptionId, int patientId, int departmentId, string userName, int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            try
            {
                #region Get Departments
                if (reqType == "get-departments")
                {
                    var departmentlist = wardSupplyDbContext.Departments.ToList().OrderBy(a => a.DepartmentName);
                    responseData.Status = "OK";
                    responseData.Results = departmentlist;

                }
                #endregion
                #region GET: get ward list.
                if (reqType == "ward-list")
                {
                    var wardList = wardSupplyDbContext.WardModel.Where(a => a.StoreId == StoreId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardList;

                }
                #endregion
                #region GET: get active store list.
                else if (reqType == "active-substore-list")
                {
                    var substoreCategory = Enums.ENUM_StoreCategory.Substore;
                    var storeList = wardSupplyDbContext.StoreModel.Where(a => a.Category == substoreCategory && a.IsActive == true).OrderBy(s => s.Name).ToList();
                    responseData.Status = "OK";
                    responseData.Results = storeList;

                }
                #endregion 
                #region GET: get ward requisition list.
                else if (reqType == "get-all-requisition-list")
                {

                    string[] poSelectedStatus = status.Split(',');
                    var wardReqList = (from wardReq in wardSupplyDbContext.WARDRequisitionModel
                                       join emp in wardSupplyDbContext.Employees on wardReq.CreatedBy equals emp.EmployeeId
                                       join stats in poSelectedStatus on wardReq.Status equals stats
                                       where wardReq.StoreId == StoreId
                                       orderby wardReq.RequisitionId descending
                                       select new
                                       {
                                           CreatedBy = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                           Date = wardReq.CreatedOn,
                                           Status = wardReq.Status,
                                           RequisitionId = wardReq.RequisitionId
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardReqList;

                }
                #endregion
                #region GET: get Consumption list.
                else if (reqType == "get-All-Comsumption-List-Details")
                {
                    if (wardId == 0)
                    {
                        var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
                                           join pat in wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
                                           join ward in wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
                                           where consump.StoreId == StoreId
                                           group new { consump, pat } by new
                                           {
                                               consump.PatientId,
                                               pat.FirstName,
                                               pat.MiddleName,
                                               pat.LastName,
                                               pat.Address,
                                               pat.PhoneNumber,
                                               pat.Gender,
                                               ward.WardName,
                                               consump.WardId,
                                               pat.Age
                                           } into t
                                           select new
                                           {
                                               WardId = t.Key.WardId,
                                               WardName = t.Key.WardName,
                                               Name = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
                                               Address = t.Key.Address,
                                               Gender = t.Key.Gender,
                                               PhoneNumber = t.Key.PhoneNumber,
                                               PatientId = t.Key.PatientId,
                                               Quantity = t.Sum(a => a.consump.Quantity),
                                               Age = t.Key.Age

                                           }).ToList();
                        responseData.Status = "OK";
                        responseData.Results = consumpList;
                    }
                    else
                    {
                        var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
                                           join pat in wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
                                           join ward in wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
                                           where consump.WardId == wardId && consump.StoreId == StoreId
                                           group new { consump, pat } by new
                                           {
                                               consump.PatientId,
                                               pat.FirstName,
                                               pat.MiddleName,
                                               pat.LastName,
                                               pat.Address,
                                               pat.PhoneNumber,
                                               pat.Gender,
                                               ward.WardName,
                                               consump.WardId,
                                               pat.Age
                                           } into t
                                           select new
                                           {
                                               WardId = t.Key.WardId,
                                               WardName = t.Key.WardName,
                                               Name = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
                                               Address = t.Key.Address,
                                               Gender = t.Key.Gender,
                                               PhoneNumber = t.Key.PhoneNumber,
                                               PatientId = t.Key.PatientId,
                                               Quantity = t.Sum(a => a.consump.Quantity),
                                               Age = t.Key.Age

                                           }).ToList();
                        responseData.Status = "OK";
                        responseData.Results = consumpList;
                    }

                }
                #endregion
                #region GET: get Internal Consumption Details
                else if (reqType == "get-internal-consumption-details")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    var internalConsumptiondetails = (from internalconsumption in wardSupplyDbContext.WARDInternalConsumptionModel
                                                      join internalconsumptionitem in wardSupplyDbContext.WARDInternalConsumptionItemsModel on internalconsumption.ConsumptionId equals internalconsumptionitem.ConsumptionId
                                                      join department in wardSupplyDbContext.Departments on internalconsumption.DepartmentId equals department.DepartmentId
                                                      join phrmitem in wardSupplyDbContext.PHRMItemMaster on internalconsumptionitem.ItemId equals phrmitem.ItemId
                                                      join phrmgeneric in wardSupplyDbContext.PHRMGenericMaster on phrmitem.GenericId equals phrmgeneric.GenericId
                                                      where internalconsumption.ConsumptionId == consumptionId
                                                      select new
                                                      {
                                                          ConsumptionId = internalconsumption.ConsumptionId,
                                                          ConsumptionItemId = internalconsumptionitem.ConsumptionItemId,
                                                          ItemName = internalconsumptionitem.ItemName,
                                                          ItemId = internalconsumptionitem.ItemId,
                                                          SubStoreId = internalconsumptionitem.SubStoreId,
                                                          BatchNo = internalconsumptionitem.BatchNo,
                                                          ExpiryDate = internalconsumptionitem.ExpiryDate,
                                                          MRP = internalconsumptionitem.MRP,
                                                          Quantity = internalconsumptionitem.Quantity,
                                                          TotalAmount = internalconsumptionitem.Subtotal,

                                                          Remark = internalconsumption.Remark,
                                                          User = currentUser.UserName,
                                                          Department = department.DepartmentName,
                                                          DepartmentId = department.DepartmentId,
                                                          Date = internalconsumption.CreatedOn,
                                                          GenericId = phrmgeneric.GenericId,
                                                          GenericName = phrmgeneric.GenericName


                                                      }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = internalConsumptiondetails;
                }
                #endregion
                #region GET: get Internal Consumption list 

                else if (reqType == "get-internal-consumption-list")
                {
                    var internalConsumptionList = (from consumptionList in wardSupplyDbContext.WARDInternalConsumptionModel
                                                   join department in wardSupplyDbContext.Departments on consumptionList.DepartmentId equals department.DepartmentId
                                                   where consumptionList.SubStoreId == StoreId
                                                   select new
                                                   {
                                                       ConsumptionId = consumptionList.ConsumptionId,
                                                       ConsumedDate = consumptionList.CreatedOn,
                                                       DepartmentName = department.DepartmentName,
                                                       ConsumedBy = consumptionList.ConsumedBy,
                                                       Remark = consumptionList.Remark
                                                   }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = internalConsumptionList;
                }
                #endregion
                #region GET: get Internal Consumption Item list 

                else if (reqType == "get-internal-consumption-item-list")
                {
                    var inernalConsumptionItemList = (from consumptionItemList in wardSupplyDbContext.WARDInternalConsumptionItemsModel
                                                      join item in wardSupplyDbContext.PHRMItemMaster on consumptionItemList.ItemId equals item.ItemId
                                                      join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                                      where consumptionItemList.ConsumptionId == consumptionId
                                                      select new
                                                      {
                                                          ConsumptionItemId = consumptionItemList.ConsumptionItemId,
                                                          GenericName = generic.GenericName,
                                                          ItemName = consumptionItemList.ItemName,
                                                          BatchNo = consumptionItemList.BatchNo,
                                                          ConsumedQuantity = consumptionItemList.Quantity
                                                      }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = inernalConsumptionItemList;
                }
                #endregion

                #region GET: get Inventory Consumption list.
                else if (reqType == "get-inventory-conumption-list")
                {
                    var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
                                       where consump.StoreId == StoreId
                                       select new
                                       {
                                           ConsumedDate = consump.CreatedOn,
                                           ItemName = consump.ItemName,
                                           Quantity = consump.Quantity,
                                           UsedBy = consump.UsedBy,
                                           Remark = consump.Remark
                                       }).OrderByDescending(c => c.ConsumedDate).ToList();
                    responseData.Results = consumpList;

                    responseData.Status = "OK";

                }
                #endregion
                #region ward request items by selected ward.
                else if (reqType == "get-ward-request-items")
                {
                    var warReqItems = (from itm in wardSupplyDbContext.WARDRequisitionItemsModel
                                       join itmReq in wardSupplyDbContext.WARDRequisitionModel on itm.RequisitionId equals itmReq.RequisitionId
                                       join itmName in wardSupplyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                                       join genericName in wardSupplyDbContext.PHRMGenericMaster on itmName.GenericId equals genericName.GenericId
                                       where itm.RequisitionId == requisitionId
                                       select new
                                       {
                                           RequisitionItemId = itm.RequisitionItemId,
                                           RequisitionId = itm.RequisitionId,
                                           ItemId = itm.ItemId,
                                           Quantity = itm.Quantity,
                                           DispatchedQty = itm.DispatchedQty,
                                           ItemName = itmName.ItemName,
                                           GenericName = genericName.GenericName,
                                           enableItmSearch = false
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = warReqItems;
                }
                #endregion

                #region consumption items by selected ward.
                else if (reqType == "get-consumption-items-list")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
                                       join item in wardSupplyDbContext.PHRMItemMaster on consump.ItemId equals item.ItemId
                                       join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                       where consump.StoreId == StoreId && consump.WardId == wardId && consump.PatientId == patientId
                                       select new
                                       {
                                           ConsumptionId = consump.ConsumptionId,
                                           ItemId = consump.ItemId,
                                           ItemName = consump.ItemName,
                                           GenericName = generic.GenericName,
                                           Quantity = consump.Quantity,
                                           BatchNo = consump.BatchNo,
                                           ExpiryDate = consump.ExpiryDate,
                                           MRP = consump.MRP,
                                           TotalAmount = consump.SubTotal,
                                           CreatedOn = consump.CreatedOn,
                                           User = currentUser.UserName,
                                           Remark = consump.Remark,
                                           StoreId = consump.StoreId,
                                           InvoiceItemId = consump.InvoiceItemId,
                                           InvoiceId = consump.InvoiceId,
                                           wardId = consump.WardId

                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = consumpList;
                }
                #endregion

                #region inventory consumption items by selected department and user.
                else if (reqType == "get-inventory-consumption-itemlist")
                {

                    var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
                                       where consump.UsedBy == userName && consump.StoreId == StoreId
                                       select new
                                       {
                                           ItemName = consump.ItemName,
                                           Quantity = consump.Quantity,
                                           UsedBy = consump.UsedBy
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = consumpList;
                }
                #endregion

                #region GET: Stock Details 
                else if (reqType == "get-all-Ward-Items-StockDetails")
                {
                    var totalStock = (from wardstock in wardSupplyDbContext.WARDStockModel
                                      join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                                      join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                      where wardstock.StockType == "pharmacy" & wardstock.StoreId == StoreId
                                      group new { wardstock, item, generic } by new { wardstock.ItemId, wardstock.StockId, wardstock.BatchNo, wardstock.MRP, wardstock.ExpiryDate } into x
                                      select new
                                      {
                                          StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
                                          ItemId = x.Key.ItemId,
                                          StockId = x.Key.StockId,
                                          ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                                          GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
                                          BatchNo = x.Key.BatchNo,
                                          AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                                          ExpiryDate = x.Key.ExpiryDate,
                                          MRP = Math.Round(x.Key.MRP, 2),
                                          StockType = x.Select(a => a.wardstock.StockType).FirstOrDefault()
                                      })
                                      .Where(a => a.ExpiryDate >= DateTime.Now).ToList();

                    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                    responseData.Results = totalStock;
                }
                #endregion
                #region GET: Available Stock Details 
                else if (reqType == "get-available-Ward-Items-StockDetails")
                {
                    var totalStock = (from wardstock in wardSupplyDbContext.WARDStockModel
                                      join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                                      join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                      where wardstock.StockType == "pharmacy" && wardstock.AvailableQuantity > 0 && wardstock.StoreId == StoreId
                                      group new { wardstock, item, generic } by new { wardstock.ItemId, wardstock.StockId, wardstock.BatchNo, wardstock.MRP, wardstock.ExpiryDate } into x
                                      select new
                                      {
                                          ItemId = x.Key.ItemId,
                                          StockId = x.Key.StockId,
                                          StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
                                          ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                                          GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
                                          BatchNo = x.Key.BatchNo,
                                          AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                                          ExpiryDate = x.Key.ExpiryDate,
                                          MRP = Math.Round(x.Key.MRP, 2),
                                          StockType = x.Select(a => a.wardstock.StockType).FirstOrDefault()
                                      }).ToList().OrderBy(a => a.ItemName);

                    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                    responseData.Results = totalStock;
                }
                #endregion
                else if (reqType == "get-all-inventory-Items-StockDetails")
                {
                    var totalStock = (from wardstock in wardSupplyDbContext.WARDStockModel
                                      join department in wardSupplyDbContext.Departments on wardstock.DepartmentId equals department.DepartmentId
                                      join item in wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                                      where wardstock.StockType == "inventory"
                                      group wardstock by new { wardstock.ItemId, item.ItemName, wardstock.DepartmentId, department.DepartmentName, item.ItemType } into t
                                      select new
                                      {
                                          DepartmentId = t.Key.DepartmentId,
                                          DepartmentName = t.Key.DepartmentName,
                                          ItemId = t.Key.ItemId,
                                          StockId = t.Select(a => a.StockId).FirstOrDefault(),
                                          ItemName = t.Key.ItemName,
                                          Quantity = t.Sum(a => a.AvailableQuantity),
                                          ExpiryDate = t.Select(a => a.ExpiryDate).FirstOrDefault(),
                                          MRP = t.Select(a => a.MRP).FirstOrDefault(),
                                          BatchNo = t.Select(a => a.BatchNo).FirstOrDefault(),
                                          ItemType = t.Key.ItemType

                                      }).ToList();

                    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                    responseData.Results = totalStock;
                }

                #region GET Pharmacy Stock List
                else if (reqType == "phrm-stock")
                {
                    //var testdate = DateTime.Now.AddMonths(1);
                    ////To calculate stock and add batch and items
                    //var totalStock = phrmdbcontext.DispensaryStockTxns
                    //    .Select(n => new { n.ItemId, MRP = (Math.Round((double)n.MRP, 2)), n.Quantity, n.CostPrice, n.BatchNo, n.ExpiryDate, n.InOut })
                    //    .Where(a => a.ExpiryDate >= testdate).ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.MRP, a.ExpiryDate }).Select(g =>
                    //    new PHRMDispensaryStockTransactionModel
                    //    {
                    //        ItemId = g.Key.ItemId,
                    //        BatchNo = g.Key.BatchNo,
                    //        Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in").Sum(f => f.Quantity) - g.Where(w => w.InOut == "out")
                    //        .Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(f => f.Quantity),
                    //        ExpiryDate = g.Key.ExpiryDate,
                    //        MRP = Convert.ToDecimal(g.Key.MRP),
                    //        CostPrice = g.FirstOrDefault().CostPrice,
                    //    }
                    //).Where(a => a.Quantity > 0).GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId, (a, b) => new GoodReceiptItemsViewModel
                    //{
                    //    ItemId = a.ItemId,
                    //    BatchNo = a.BatchNo,
                    //    ExpiryDate = a.ExpiryDate.Value.Date,
                    //    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //    AvailableQuantity = a.Quantity,
                    //    MRP = a.MRP.Value,
                    //    GRItemPrice = a.CostPrice.Value,
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
                    //    GenericId = s.GoodReceiptItemsViewModel.GenericId,
                    //    GenericName = s.PHRMGenericModel.GenericName,
                    //    //CategoryName = s.PHRMCategory.CategoryName,
                    //    IsActive = true
                    //});

                    //responseData.Status = "OK";
                    //responseData.Results = totalStock;
                }
                #endregion

                #region GET Ward Stock List
                else if (reqType == "ward-stock")
                {
                    var wardStock = wardSupplyDbContext.WARDStockModel
                        .Select(n => new
                        {
                            n.StockId,
                            n.WardId,
                            n.DepartmentId,
                            n.ItemId,
                            n.AvailableQuantity,
                            MRP = (Math.Round(n.MRP, 2)),
                            n.BatchNo,
                            n.ExpiryDate
                        }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardStock;
                }
                #endregion

                #region GET InPatient List
                else if (reqType == "inpatient-list")
                {
                    var InPatients = (from pat in wardSupplyDbContext.Patients
                                      join vst in wardSupplyDbContext.Visits on pat.PatientId equals vst.PatientId
                                      join adm in wardSupplyDbContext.Admissions on vst.PatientVisitId equals adm.PatientVisitId
                                      join pbi in wardSupplyDbContext.PatientBedInfos on pat.PatientId equals pbi.PatientId
                                      where adm.AdmissionStatus == "admitted"
                                      select new
                                      {
                                          pat.PatientId,
                                          pat.PatientCode,
                                          pat.FirstName,
                                          pat.MiddleName,
                                          pat.LastName,
                                          pat.Gender,
                                          pat.DateOfBirth,
                                          pat.Age,
                                          pat.Address,
                                          pat.PhoneNumber,
                                          vst.VisitCode,
                                          vst.PatientVisitId,
                                          pbi.WardId,
                                          ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      }).OrderByDescending(patient => patient.PatientId).ToList();
                    responseData.Results = InPatients;
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
        [HttpGet("~/api/WardSupply/GetInventoryItemsByStoreId/{StoreId}")]
        public IActionResult GetInventoryItemsByStoreId(int StoreId)
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var totalStock = (from wardstock in wardSupplyDbContext.StoreStocks.Include(s => s.StockMaster)
                              join item in wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                              join uom in wardSupplyDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals uom.UOMId
                              join mainStore in wardSupplyDbContext.StoreModel on wardstock.StoreId equals mainStore.StoreId
                              where wardstock.StoreId == StoreId
                              group new { wardstock, item, uom } by new { wardstock.ItemId, item.ItemName, item.ItemType, wardstock.StoreId, mainStore.Name } into t
                              select new
                              {
                                  ItemId = t.Key.ItemId,
                                  StockId = t.Select(a => a.wardstock.StockId).FirstOrDefault(),
                                  ItemName = t.Key.ItemName,
                                  AvailableQuantity = t.Sum(a => a.wardstock.AvailableQuantity),
                                  MinimumQuantity = t.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                                  ExpiryDate = t.Select(a => a.wardstock.StockMaster.ExpiryDate).FirstOrDefault(),
                                  Code = t.Select(a => a.item.Code).FirstOrDefault(),
                                  UOMName = t.Select(a => a.uom.UOMName).FirstOrDefault(),
                                  IsColdStorageApplicable = t.Select(a => a.item.IsColdStorageApplicable).FirstOrDefault(),
                                  MRP = t.Select(a => a.wardstock.StockMaster.MRP).FirstOrDefault(),
                                  BatchNo = t.Select(a => a.wardstock.StockMaster.BatchNo).FirstOrDefault(),
                                  ItemType = t.Key.ItemType,
                                  StoreId = t.Key.StoreId,
                                  StoreName = t.Key.Name
                              }).ToList();

            responseData.Status = (totalStock == null) ? "Failed" : "OK";
            responseData.Results = totalStock;
            return Ok(responseData);
        }
        [HttpGet("~/api/WardSupply/GetInventoryItemsForPatConsumptionByStoreId/{StoreId}")]
        public IActionResult GetInventoryItemsForPatConsumptionByStoreId(int StoreId)
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var totalStock = (from wardstock in wardSupplyDbContext.StoreStocks
                              join item in wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                              join uom in wardSupplyDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals uom.UOMId
                              where wardstock.StoreId == StoreId && item.IsPatConsumptionApplicable == true
                              group new { wardstock, item, uom } by new { wardstock.ItemId, item.ItemName, item.ItemType } into t
                              select new
                              {
                                  ItemId = t.Key.ItemId,
                                  StockId = t.Select(a => a.wardstock.StockId).FirstOrDefault(),
                                  ItemName = t.Key.ItemName,
                                  Quantity = t.Sum(a => a.wardstock.AvailableQuantity),
                                  MinimumQuantity = t.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                                  ExpiryDate = t.Select(a => a.wardstock.StockMaster.ExpiryDate).FirstOrDefault(),
                                  Code = t.Select(a => a.item.Code).FirstOrDefault(),
                                  UOMName = t.Select(a => a.uom.UOMName).FirstOrDefault(),
                                  IsColdStorageApplicable = t.Select(a => a.item.IsColdStorageApplicable).FirstOrDefault(),
                                  MRP = t.Select(a => a.wardstock.StockMaster.MRP).FirstOrDefault(),
                                  BatchNo = t.Select(a => a.wardstock.StockMaster.BatchNo).FirstOrDefault(),
                                  ItemType = t.Key.ItemType
                              }).ToList();

            responseData.Status = (totalStock == null) ? "Failed" : "OK";
            responseData.Results = totalStock;
            return Ok(responseData);
        }

        [HttpGet("~/api/WardSupply/GetInventoryPatConsumptionItemlistById/{ReceiptId}")]
        public IActionResult GetInventoryPatConsumptionItemlistById(int ReceiptId)
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
                               join itemMst in wardSupplyDbContext.INVItemMaster on consump.ItemId equals itemMst.ItemId
                               join uom in wardSupplyDbContext.UnitOfMeasurementMaster on itemMst.UnitOfMeasurementId equals uom.UOMId

                               where consump.ConsumptionReceiptId == ReceiptId
                               select new
                               {
                                   consump.ItemName,
                                   consump.Quantity,
                                   Unit = uom.UOMName,
                                   itemMst.Code
                               }).ToList();
            responseData.Status = "OK";
            responseData.Results = consumpList;

            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/WardSupply/GetInventoryConsumptionList/{StoreId}/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryConsumptionList(int StoreId, DateTime FromDate, DateTime ToDate)
        {
            WardSupplyDbContext dbContext = new WardSupplyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            ToDate = ToDate.AddDays(1);

            try
            {
                var consumpList = (from consump in dbContext.WARDInventoryConsumptionModel
                                   join emp in dbContext.Employees on consump.CreatedBy equals emp.EmployeeId
                                   where consump.StoreId == StoreId && consump.ConsumptionReceiptId == null
                                   select new
                                   {
                                       ConsumptionDate = consump.ConsumptionDate,
                                       ItemName = consump.ItemName,
                                       Quantity = consump.Quantity,
                                       UsedBy = emp.FullName,
                                       Remark = consump.Remark
                                   }).Where(c => c.ConsumptionDate >= FromDate && c.ConsumptionDate < ToDate).OrderByDescending(c => c.ConsumptionDate).ToList();
                responseData.Results = consumpList;

                responseData.Status = "OK";
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                throw;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/WardSupply/GetInventoryPatientConsumptionReceiptList/{StoreId}/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryPatientConsumptionReceiptList(int StoreId, DateTime FromDate, DateTime ToDate)
        {
            WardSupplyDbContext dbContext = new WardSupplyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            ToDate = ToDate.AddDays(1);

            try
            {
                var consumpList = (from receipt in dbContext.PatientConsumptionReceipt
                                   join emp in dbContext.Employees on receipt.CreatedBy equals emp.EmployeeId
                                   join pat in dbContext.Patients on receipt.PatientId equals pat.PatientId
                                   where receipt.StoreId == StoreId
                                   select new
                                   {
                                       receipt.ConsumptionReceiptId,
                                       receipt.ConsumptionReceiptNo,
                                       receipt.ConsumptionDate,
                                       receipt.CreatedBy,
                                       receipt.CreatedOn,
                                       EnteredBy = emp.FullName,
                                       receipt.PatientId,
                                       PatientName = pat.ShortName,
                                       HospitalNo = pat.PatientCode

                                   }).Where(c => c.CreatedOn >= FromDate && c.CreatedOn < ToDate).OrderByDescending(c => c.CreatedOn).ToList();
                responseData.Results = consumpList;

                responseData.Status = "OK";
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                throw;
            }
            return Ok(responseData);
        }
        [HttpGet]
        [Route("~/api/WardSupply/GetDispatchListForItemReceive/{RequisitionId}")]
        public IActionResult GetDispatchListForItemReceive([FromRoute] int RequisitionId)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var RequisitionDetail = inventoryDb.Requisitions.Where(req => req.RequisitionId == RequisitionId)
                                                                .Select(req => new { req.RequisitionNo, req.RequisitionDate, req.RequisitionStatus })
                                                                .FirstOrDefault();
                IQueryable<DispatchItemsModel> dispatchList = inventoryDb.DispatchItems.Where(item => item.RequisitionId == RequisitionId);
                if (dispatchList != null || dispatchList.Count() > 0)
                {
                    var groupOfDispatchItemById = dispatchList.GroupBy(item => item.DispatchId).ToList();
                    var DispatchDetail = groupOfDispatchItemById.Select(g => new
                    {
                        DispatchId = g.Key,
                        ReceivedBy = VerificationBL.GetNameByEmployeeId(g.FirstOrDefault().ReceivedById ?? 0, inventoryDb),
                        ReceivedOn = g.FirstOrDefault().ReceivedOn,
                        ReceivedRemarks = g.FirstOrDefault().ReceivedRemarks,
                        DispatchItems = (from dispatchItems in g.ToList()
                                         join item in inventoryDb.Items on dispatchItems.ItemId equals item.ItemId
                                         join RI in inventoryDb.RequisitionItems on dispatchItems.RequisitionItemId equals RI.RequisitionItemId
                                         select new
                                         {
                                             DispatchItemsId = dispatchItems.DispatchItemsId,
                                             ItemId = dispatchItems.ItemId,
                                             ItemName = item.ItemName,
                                             RequestedQuantity = RI.Quantity,
                                             DispatchedQuantity = dispatchItems.DispatchedQuantity,
                                             PendingQuantity = RI.PendingQuantity
                                         })

                    }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = new { RequisitionDetail, DispatchDetail };
                    return Ok(responseData);
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "No Dispatch Record Found";
                    return NotFound(responseData);
                }
            }
            catch (Exception)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to obtain dispatch list";
                return BadRequest(responseData);
            }
        }

        //WARDSUPPLY REPORTS
        //Ward Stock Items Report
        [HttpGet("/api/WardSupply/WARDStockItemsReport/{itemId}/{storeId}")]
        public IActionResult WARDStockItemsReport(int itemId, int storeId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);

            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable stockItemsResult = wardreportingDbContext.WARDStockItemsReport(itemId, storeId);
                if (stockItemsResult.Rows.Count == 0) { responseData.Status = "Failed"; responseData.ErrorMessage = "No records found."; }
                else { responseData.Status = "OK"; responseData.Results = stockItemsResult; }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        //Ward Requisition Report
        [HttpGet("/api/WardSupply/WARDRequisitionReport/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult WARDRequisitionReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDRequisitionReport(FromDate, ToDate, StoreId);
                if (dtResult.Rows.Count == 0) { responseData.Status = "Failed"; responseData.ErrorMessage = "No records found."; }
                else { responseData.Status = "OK"; responseData.Results = dtResult; }
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }
            return Ok(responseData);

        }


        //Ward Breakage Report
        [HttpGet("/api/WardSupply/WARDBreakageReport/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult WARDBreakageReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDBreakageReport(FromDate, ToDate, StoreId);
                if (dtResult.Rows.Count == 0) { responseData.Status = "Failed"; responseData.ErrorMessage = "No records found."; }
                else { responseData.Status = "OK"; responseData.Results = dtResult; }
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }
            return Ok(responseData);

        }

        //ward Internal Consumption Report
        [HttpGet("/api/WardSupply/WARDInternalConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult WARDInternalConsumptionReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDInteranlConsumptionReport(FromDate, ToDate, StoreId);
                if (dtResult.Rows.Count == 0) { responseData.Status = "Failed"; responseData.ErrorMessage = "No records found."; }
                else { responseData.Status = "OK"; responseData.Results = dtResult; }
            }

            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        //Ward Consumption Report
        [HttpGet("/api/WardSupply/WARDConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult WARDConsumptionReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDConsumptionReport(FromDate, ToDate, StoreId);
                if (dtResult.Rows.Count == 0) { responseData.Status = "Failed"; responseData.ErrorMessage = "No records found."; }
                else { responseData.Status = "OK"; responseData.Results = dtResult; }
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }
            return Ok(responseData);

        }

        //Ward Transfer Report
        [HttpGet("/api/WardSupply/WARDTransferReport/{FromDate}/{ToDate}/{StoreId}")]
        public string WARDTransferReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDTransferReport(FromDate, ToDate, StoreId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }


        //////WARD INVENTORY REPORT
        //RequisitionDispatchReport
        [HttpGet("/api/WardSupply/Inventory/Reports/RequisitionDispatchReport/{FromDate}/{ToDate}/{StoreId}")]
        public string RequisitionDispatchReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.RequisitionDispatchReport(FromDate, ToDate, StoreId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        //TransferReport
        [HttpGet("/api/WardSupply/Inventory/Reports/TransferReport/{FromDate}/{ToDate}/{StoreId}")]
        public string TransferReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.TransferReport(FromDate, ToDate, StoreId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        //ConsumptionReport
        [HttpGet("/api/WardSupply/Inventory/Reports/ConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
        public string ConsumptionReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.ConsumptionReport(FromDate, ToDate, StoreId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        [HttpGet("GetSubstoreRequistionList/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult GetSubstoreRequistionList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int StoreId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var RequisitionList = (from requ in inventoryDbContext.Requisitions
                                       join sourceStore in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals sourceStore.StoreId
                                       join targetStore in inventoryDbContext.StoreMasters on requ.RequestToStoreId equals targetStore.StoreId
                                       where requ.RequestFromStoreId == StoreId & requ.RequisitionDate > FromDate & requ.RequisitionDate < RealToDate
                                       orderby requ.RequisitionId descending
                                       select new
                                       {
                                           RequisitionId = requ.RequisitionId,
                                           RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.RequisitionDate,
                                           RequisitionStatus = requ.RequisitionStatus,
                                           StoreName = targetStore.Name,
                                           MaxVerificationLevel = sourceStore.MaxVerificationLevel,
                                           VerificationId = requ.VerificationId,
                                           RequestToStoreId = requ.RequestToStoreId
                                       }).AsNoTracking().ToList().Select(R => new RequisitionModel
                                       {
                                           RequisitionId = R.RequisitionId,
                                           RequisitionNo = R.RequisitionNo,
                                           RequisitionDate = R.RequisitionDate,
                                           RequisitionStatus = R.RequisitionStatus,
                                           RequestFromStoreId = StoreId,
                                           RequestToStoreId = R.RequestToStoreId,
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
        // POST api/values
        [HttpPost]
        public string Post()
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();
            try
            {
                if (!String.IsNullOrEmpty(str))
                {
                    #region Post:Ward Request
                    if (reqType == "ward-requistion")
                    {
                        WARDRequisitionModel WardReq = DanpheJSONConvert.DeserializeObject<WARDRequisitionModel>(str);
                        WardReq.CreatedOn = DateTime.Now.Date;
                        WardReq.CreatedBy = currentUser.EmployeeId;
                        WardReq.Status = "pending";
                        wardSupplyDbContext.WARDRequisitionModel.Add(WardReq);
                        wardSupplyDbContext.SaveChanges();
                        responseData.Results = WardReq;
                        responseData.Status = "OK";
                    }
                    #endregion
                    #region POST: Consumption
                    else if (reqType == "post-consumption")
                    {
                        //PHRMInvoiceTransactionItemsModel invoice = new PHRMInvoiceTransactionItemsModel();
                        //List<WARDStockModel> wardStockList = new List<WARDStockModel>();
                        //WARDStockModel wardStock = new WARDStockModel();
                        //List<WARDConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDConsumptionModel>>(str);
                        //PHRMDispensaryStockTransactionModel phrmStockTxnItems = new PHRMDispensaryStockTransactionModel();
                        //WARDTransactionModel wardphrmTxn = new WARDTransactionModel();
                        //foreach (var consmption in consumptionList)
                        //{
                        //    //adding invoice in PHRM_TXN_Invoice
                        //    invoice.ItemId = consmption.ItemId;
                        //    invoice.ItemName = consmption.ItemName;
                        //    invoice.BatchNo = consmption.BatchNo;
                        //    invoice.Quantity = consmption.Quantity;
                        //    invoice.Price = consmption.MRP;
                        //    invoice.MRP = consmption.MRP;
                        //    invoice.SubTotal = consmption.SubTotal;
                        //    invoice.TotalAmount = consmption.SubTotal;
                        //    invoice.CreatedBy = consmption.CreatedBy;
                        //    invoice.CreatedOn = System.DateTime.Now;
                        //    invoice.CounterId = consmption.CounterId;
                        //    invoice.BilItemStatus = "wardconsumption";
                        //    invoice.ExpiryDate = consmption.ExpiryDate;
                        //    invoice.PatientId = consmption.PatientId;
                        //    invoice.VATPercentage = 0;
                        //    invoice.DiscountPercentage = 0;
                        //    invoice.FreeQuantity = 0;
                        //    phrmdbcontext.PHRMInvoiceTransactionItems.Add(invoice);
                        //    phrmdbcontext.SaveChanges();

                        //    //adding consumption in WARD_Consumption
                        //    consmption.InvoiceItemId = invoice.InvoiceItemId;
                        //    consmption.CreatedOn = System.DateTime.Now;
                        //    wardSupplyDbContext.WARDConsumptionModel.Add(consmption);
                        //    wardSupplyDbContext.SaveChanges();

                        //    //adding record in list for updating stock available quantity
                        //    wardStock = new WARDStockModel();
                        //    wardStock.ItemId = consmption.ItemId;
                        //    wardStock.MRP = (float)consmption.MRP;
                        //    wardStock.ExpiryDate = consmption.ExpiryDate;
                        //    wardStock.BatchNo = consmption.BatchNo;
                        //    wardStock.WardId = consmption.WardId;
                        //    wardStock.StoreId = consmption.StoreId;
                        //    wardStock.DispachedQuantity = consmption.Quantity;
                        //    wardStockList.Add(wardStock);

                        //    //adding record in the Ward_transaction
                        //    wardphrmTxn.Quantity = consmption.Quantity;
                        //    wardphrmTxn.ItemId = consmption.ItemId;
                        //    wardphrmTxn.StockId = consmption.StockId;
                        //    wardphrmTxn.StoreId = consmption.StoreId;
                        //    wardphrmTxn.WardId = consmption.WardId;
                        //    wardphrmTxn.Remarks = consmption.Remark;
                        //    wardphrmTxn.CreatedBy = currentUser.UserName;
                        //    wardphrmTxn.CreatedOn = DateTime.Now;
                        //    wardphrmTxn.TransactionType = "WardConsumption";
                        //    wardphrmTxn.InOut = "out";
                        //    wardphrmTxn.IsWard = true;
                        //    phrmdbcontext.WardTransactionModel.Add(wardphrmTxn);
                        //    phrmdbcontext.SaveChanges();
                        //}

                        //if (WardSupplyBL.UpdateWardSockQuantity(wardStockList, wardSupplyDbContext))
                        //{
                        //    responseData.Status = "OK";
                        //    responseData.Results = consumptionList;
                        //}
                        //else
                        //{
                        //    responseData.Status = "Failed";
                        //    responseData.ErrorMessage = "Falied to update stock details.";
                        //}
                    }
                    #endregion
                    #region POST: Ward Internal Consumption
                    else if (reqType == "post-internal-consumption")
                    {
                        WARDInternalConsumptionModel wardInternalconsumption = JsonConvert.DeserializeObject<WARDInternalConsumptionModel>(str);
                        List<WARDStockModel> wardStockList = new List<WARDStockModel>();
                        WARDStockModel wardStock = new WARDStockModel();
                        //PHRMDispensaryStockTransactionModel phrmStockTxnItems = new PHRMDispensaryStockTransactionModel();
                        //WARDTransactionModel wardtransactionmodel = new WARDTransactionModel();

                        //wardInternalconsumption.CreatedOn = DateTime.Now;
                        //wardSupplyDbContext.WARDInternalConsumptionModel.Add(wardInternalconsumption);
                        //wardSupplyDbContext.SaveChanges();

                        //foreach (var consmption in wardInternalconsumption.WardInternalConsumptionItemsList)
                        //{
                        //    consmption.CreatedOn = DateTime.Now;
                        //    consmption.ConsumptionId = wardInternalconsumption.ConsumptionId;
                        //    wardSupplyDbContext.WARDInternalConsumptionItemsModel.Add(consmption);
                        //    wardSupplyDbContext.SaveChanges();

                        //    //adding record in list for updating stock available quantity
                        //    wardStock = new WARDStockModel();
                        //    wardStock.ItemId = consmption.ItemId;
                        //    wardStock.MRP = (float)consmption.MRP;
                        //    wardStock.ExpiryDate = consmption.ExpiryDate;
                        //    wardStock.BatchNo = consmption.BatchNo;
                        //    wardStock.WardId = consmption.WardId;
                        //    wardStock.StoreId = consmption.SubStoreId;
                        //    wardStock.DispachedQuantity = consmption.Quantity;
                        //    wardStockList.Add(wardStock);
                        //    //internal consumption data push in transactionmodel
                        //    wardtransactionmodel.WardId = consmption.WardId;
                        //    wardtransactionmodel.StoreId = consmption.SubStoreId;
                        //    wardtransactionmodel.ItemId = consmption.ItemId;
                        //    wardtransactionmodel.Quantity = consmption.Quantity;
                        //    wardtransactionmodel.StockId = consmption.StockId;
                        //    wardtransactionmodel.IsWard = true;
                        //    wardtransactionmodel.Remarks = consmption.Remark;
                        //    wardtransactionmodel.ReceivedBy = wardInternalconsumption.ConsumedBy;
                        //    wardtransactionmodel.CreatedBy = currentUser.UserName;
                        //    wardtransactionmodel.CreatedOn = DateTime.Now;
                        //    wardtransactionmodel.TransactionType = "InternalConsumption";
                        //    wardtransactionmodel.InOut = "out";
                        //    wardtransactionmodel.IsWard = true;
                        //    wardSupplyDbContext.TransactionModel.Add(wardtransactionmodel);
                        //    wardSupplyDbContext.SaveChanges();

                        //    // //  //adding record in the phrm_stocktxnitems
                        //    // phrmStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        //    // phrmStockTxnItems.CreatedOn = DateTime.Now;
                        //    // phrmStockTxnItems.BatchNo = consmption.BatchNo;
                        //    // phrmStockTxnItems.ItemId = consmption.ItemId;
                        //    // phrmStockTxnItems.Price = consmption.MRP;
                        //    // phrmStockTxnItems.MRP = consmption.MRP;
                        //    // phrmStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
                        //    //// phrmStockTxnItems.ReferenceNo = consmption.InvoiceItemId;
                        //    // phrmStockTxnItems.GoodsReceiptItemId = null;
                        //    // phrmStockTxnItems.CCCharge = null;
                        //    // phrmStockTxnItems.Quantity = consmption.Quantity;
                        //    // phrmStockTxnItems.ExpiryDate = consmption.ExpiryDate;
                        //    // phrmStockTxnItems.FreeQuantity = 0;
                        //    // phrmStockTxnItems.DiscountPercentage = 0;
                        //    // phrmStockTxnItems.VATPercentage = 0;
                        //    // phrmStockTxnItems.InOut = "out";
                        //    // phrmStockTxnItems.TransactionType = "wardinternalconsumptionitems";
                        //    // phrmStockTxnItems.SubTotal = consmption.Subtotal;
                        //    // phrmStockTxnItems.TotalAmount = consmption.Subtotal;
                        //    // phrmdbcontext.PHRMStockTransactionModel.Add(phrmStockTxnItems);
                        //    // phrmdbcontext.SaveChanges();


                        //}

                        if (WardSupplyBL.UpdateWardSockQuantity(wardStockList, wardSupplyDbContext))
                        {
                            responseData.Status = "OK";
                            responseData.Results = wardInternalconsumption.ConsumptionId;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = "Falied to update stock details.";
                        }


                    }
                    #endregion
                    #region POST: Inventory Consumption
                    else if (reqType == "post-inventory-consumption")
                    {
                        List<WARDInventoryConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDInventoryConsumptionModel>>(str);
                        using (var transaction = wardSupplyDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                foreach (var consumption in consumptionList)
                                {
                                    //adding consumption in [WARD_INV_Consumption]
                                    consumption.Quantity = consumption.ConsumeQuantity;
                                    consumption.CreatedOn = DateTime.Now;
                                    wardSupplyDbContext.WARDInventoryConsumptionModel.Add(consumption);
                                    wardSupplyDbContext.SaveChanges();
                                    WardSupplyBL.UpdateWardStockForConsumption(wardSupplyDbContext, currentUser, consumption);
                                }
                                transaction.Commit();
                                responseData.Status = "OK";
                                responseData.Results = consumptionList;
                            }
                            catch (Exception ex)
                            {
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = ex.ToString();
                                transaction.Rollback();
                            }
                        }

                    }
                    #endregion
                    //#region POST : update stock transaction, Post to Stock table and post to Transaction table                 
                    //else if (reqType == "transfer-stock")
                    //{
                    //    WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
                    //    if (stockManageData != null)
                    //    {
                    //        Boolean flag = false;


                    //        flag = WardSupplyBL.StockTransfer(stockManageData, wardSupplyDbContext, currentUser);
                    //        if (flag)
                    //        {
                    //            responseData.Status = "OK";
                    //            responseData.Results = 1;
                    //        }
                    //        else
                    //        {
                    //            responseData.ErrorMessage = "Transfer Item is null or failed to Save";
                    //            responseData.Status = "Failed";
                    //        }
                    //    }
                    //}
                    //#endregion
                    #region POST : update stock transaction, Post to Stock table and post to Transaction table                 
                    else if (reqType == "transfer-inventory-stock")
                    {
                        WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
                        if (stockManageData != null)
                        {
                            Boolean flag = false;


                            flag = WardSupplyBL.StockInventoryTransfer(stockManageData, wardSupplyDbContext, currentUser);
                            if (flag)
                            {
                                responseData.Status = "OK";
                                responseData.Results = 1;
                            }
                            else
                            {
                                responseData.ErrorMessage = "Transfer Item is null or failed to Save";
                                responseData.Status = "Failed";
                            }
                        }
                    }
                    #endregion
                    #region POST : delete from stock table in wardsupply. add stock in inventory and update in stock transaction
                    else if (reqType == "transfer-back-to-inventory")
                    {
                        WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
                        if (stockManageData != null)
                        {
                            Boolean flag = false;


                            flag = WardSupplyBL.BackToInventoryTransfer(stockManageData, wardSupplyDbContext, currentUser);
                            if (flag)
                            {
                                responseData.Status = "OK";
                                responseData.Results = 1;
                            }
                            else
                            {
                                responseData.ErrorMessage = "Transfer Item is null or failed to Save";
                                responseData.Status = "Failed";
                            }
                        }
                    }
                    #endregion
                    #region POST : update stock tranaction, Post to Stock table and Transaction Table
                    else if (reqType == "breakage-stock")
                    {
                        WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
                        if (stockManageData != null)
                        {
                            Boolean flag = false;

                            flag = WardSupplyBL.StockBreakage(stockManageData, wardSupplyDbContext, currentUser);
                            if (flag)
                            {
                                responseData.Status = "OK";
                                responseData.Results = 1;
                            }
                            else
                            {
                                responseData.ErrorMessage = "Breakage item is null or failed to save";
                                responseData.Status = "Failed";
                            }
                        }
                    }
                    #endregion
                    //#region POST : Ward To Pharmacy Tranfer of Stock
                    //else if (reqType == "returnStockToPharmacy")
                    //{
                    //    List<WARDStockModel> stockManageData = DanpheJSONConvert.DeserializeObject<List<WARDStockModel>>(str);
                    //    if (stockManageData != null)
                    //    {
                    //        Boolean flag = false;

                    //        flag = WardSupplyBL.StockTransferToPharmacy(stockManageData, wardSupplyDbContext, phrmdbcontext, currentUser);
                    //        if (flag)
                    //        {
                    //            responseData.Status = "OK";
                    //            responseData.Results = 1;
                    //        }
                    //        else
                    //        {
                    //            responseData.ErrorMessage = "Failed to save. Check the items.";
                    //            responseData.Status = "Failed";
                    //        }
                    //    }
                    //}
                    //#endregion
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

        [HttpPost("PostInvPatientConsumption")]
        public IActionResult PostInvPatientConsumption()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string str = this.ReadPostData();

                InvPatientConsumptionReceiptModel patConsumptionReceipt = JsonConvert.DeserializeObject<InvPatientConsumptionReceiptModel>(str);
                using (var transaction = wardSupplyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        //DefaultIfEmpty(0)
                        int maxReceiptNo = wardSupplyDbContext.PatientConsumptionReceipt.Select(a => a.ConsumptionReceiptNo).DefaultIfEmpty(0).Max();
                        patConsumptionReceipt.ConsumptionReceiptNo = maxReceiptNo > 0 ? maxReceiptNo + 1 : 1;

                        patConsumptionReceipt.ConsumptionDate = DateTime.Now;

                        patConsumptionReceipt.CreatedOn = DateTime.Now;
                        patConsumptionReceipt.CreatedBy = currentUser.EmployeeId;

                        wardSupplyDbContext.PatientConsumptionReceipt.Add(patConsumptionReceipt);
                        wardSupplyDbContext.SaveChanges();

                        List<WARDInventoryConsumptionModel> consumptionList = patConsumptionReceipt.ConsumptionList;
                        foreach (var consumption in consumptionList)
                        {
                            //adding consumption in [WARD_INV_Consumption]
                            consumption.ConsumptionReceiptId = patConsumptionReceipt.ConsumptionReceiptId;
                            consumption.Quantity = consumption.ConsumeQuantity;
                            consumption.CreatedOn = DateTime.Now;
                            wardSupplyDbContext.WARDInventoryConsumptionModel.Add(consumption);
                            wardSupplyDbContext.SaveChanges();
                            WardSupplyBL.UpdateWardStockForConsumption(wardSupplyDbContext, currentUser, consumption);
                        }
                        transaction.Commit();
                        responseData.Status = "OK";
                        responseData.Results = consumptionList;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.ToString();
                        transaction.Rollback();
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }

        [HttpPost("~/api/RetrunStockToPharmacy/{ReceivedBy}")]
        public IActionResult RetrunStockToPharmacy(String ReceivedBy, [FromBody] List<WARDStockModel> data)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
                List<WARDStockModel> stockManageData = data;
                if (stockManageData != null)
                {
                    Boolean flag = false;

                    flag = WardSupplyBL.StockTransferToPharmacy(stockManageData, wardSupplyDbContext, phrmdbcontext, currentUser, ReceivedBy);
                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "Failed to save. Check the items.";
                        responseData.Status = "Failed";
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpPost("~/api/TransferStock/{ReceivedBy}")]
        public IActionResult TransferStock(String ReceivedBy, [FromBody] WARDStockModel data)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
                WARDStockModel stockManageData = data;
                if (stockManageData != null)
                {
                    Boolean flag = false;


                    flag = WardSupplyBL.StockTransfer(stockManageData, wardSupplyDbContext, currentUser, ReceivedBy);
                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "Transfer Item is null or failed to Save";
                        responseData.Status = "Failed";
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            string str = this.ReadPostData();
            try
            {
                if (!String.IsNullOrEmpty(str))
                {

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
        //Put method for item receive in Substore
        [HttpPut]
        [Route("~/api/WardSupply/UpdateDispatchedItemsReceiveStatus/{DispatchId}")]
        public async Task<IActionResult> UpdateDispatchedItemsReceiveStatus([FromRoute] int DispatchId, [FromBody] string ReceivedRemarks)
        {
            var inventoryDb = new InventoryDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                await WardSupplyBL.ReceiveDispatchedStocks(DispatchId, inventoryDb, currentUser, ReceivedRemarks);
                responseData.Status = "OK";
                responseData.Results = DispatchId;
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = $"Items Receive Failed, Message: {ex.Message.ToString()}";
                return BadRequest(responseData);
            }
        }
        // Put method Internal  Consumption Item List
        [HttpPut("~/api/WardSupply/put-intrenal-consumption")]
        public IActionResult PutIntrenalConsumptionData()
        {
            string str = this.ReadPostData();
            List<WARDInternalConsumptionItemsModel> wardInternalconsumptionItems = JsonConvert.DeserializeObject<List<WARDInternalConsumptionItemsModel>>(str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PHRMInvoiceTransactionItemsModel invoice = new PHRMInvoiceTransactionItemsModel();
            List<WARDStockModel> wardStockList = new List<WARDStockModel>();
            WARDStockModel wardStock = new WARDStockModel();
            WARDTransactionModel wardtransactionmodel = new WARDTransactionModel();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            //PHRMDispensaryStockTransactionModel phrmStockTxnItems = new PHRMDispensaryStockTransactionModel();
            WARDTransactionModel wardtxnmodel = new WARDTransactionModel();
            using (var dbTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {

                    foreach (var consmption in wardInternalconsumptionItems)
                    {

                        //we need the old consumption quantity value in order to update the stock i.e. to find out whether the stock is increased or decreased.
                        var oldQuantity = wardSupplyDbContext.WARDInternalConsumptionItemsModel.AsNoTracking().Where(a => a.ConsumptionItemId == consmption.ConsumptionItemId).FirstOrDefault().Quantity;
                        if (oldQuantity == consmption.Quantity) { continue; }
                        //updating record in list for updating WARD_InternalConsumptionItems
                        consmption.ModifiedBy = currentUser.EmployeeId;
                        consmption.ModifiedOn = DateTime.Now;
                        consmption.Subtotal = consmption.Quantity * consmption.MRP;
                        wardSupplyDbContext.WARDInternalConsumptionItemsModel.Attach(consmption);
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedBy).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedOn).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Subtotal).IsModified = true;

                        //updating invoice in PHRM_TXN_Invoice
                        //invoice.Quantity = consmption.Quantity;
                        //invoice.SubTotal = Convert.ToDecimal(invoice.Quantity) * invoice.MRP;
                        //invoice.TotalAmount = invoice.SubTotal - Convert.ToDecimal(invoice.DiscountPercentage / 100);
                        //wardSupplyDbContext.PHRMInvoiceTransactionItems.Attach(invoice);
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.Quantity).IsModified = true;
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.SubTotal).IsModified = true;
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.TotalAmount).IsModified = true;
                        //wardSupplyDbContext.SaveChanges();
                        //updating record in list for updating stock available quantity
                        wardStock = wardSupplyDbContext.WARDStockModel.Where(a => a.ItemId == consmption.ItemId && a.BatchNo == consmption.BatchNo && a.ExpiryDate == consmption.ExpiryDate && a.MRP == consmption.MRP && a.StoreId == consmption.SubStoreId).FirstOrDefault();
                        wardtxnmodel.StockId = wardStock.StockId;
                        wardtxnmodel.ItemId = consmption.ItemId;
                        wardtxnmodel.WardId = consmption.WardId;
                        wardtxnmodel.TransactionType = "WardConsumptionEdit";
                        wardtxnmodel.Remarks = consmption.Remark;
                        wardtxnmodel.IsWard = true;
                        wardtxnmodel.StoreId = consmption.SubStoreId;
                        wardtxnmodel.CreatedBy = currentUser.UserName;
                        wardtxnmodel.CreatedOn = DateTime.Now;
                        if (oldQuantity < consmption.Quantity)
                        {
                            //decrement in stock
                            if (wardStock.AvailableQuantity < (consmption.Quantity - (int)oldQuantity))
                            {
                                Exception ex = new Exception("There is not enough Stock available. Check Stock.");
                                throw ex;
                            }
                            wardStock.AvailableQuantity -= consmption.Quantity - (int)oldQuantity;
                            wardtxnmodel.InOut = "out";
                            wardtxnmodel.Quantity = consmption.Quantity - (int)oldQuantity;
                        }
                        else
                        {
                            //increment in stock
                            wardStock.AvailableQuantity += (int)oldQuantity - consmption.Quantity;
                            wardtxnmodel.InOut = "in";
                            wardtxnmodel.Quantity = (int)oldQuantity - consmption.Quantity;
                        }
                        wardSupplyDbContext.WARDStockModel.Attach(wardStock);
                        wardSupplyDbContext.Entry(wardStock).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.TransactionModel.Add(wardtxnmodel);
                        wardSupplyDbContext.SaveChanges();


                    }

                    dbTransaction.Commit();
                    responseData.Status = "OK";
                    responseData.Results = wardInternalconsumptionItems;
                }
                catch (Exception ex)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = ex.Message;
                    dbTransaction.Rollback();
                    return BadRequest(responseData);
                }
            }
            return Ok(responseData);
        }

        [HttpPut("~/api/WardSupply/UpdateRequisition")]
        public IActionResult UpdateRequisition()
        {
            string str = this.ReadPostData();
            RequisitionModel requisition = JsonConvert.DeserializeObject<RequisitionModel>(str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext dbContext = new WardSupplyDbContext(connString);
            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
            {
                try
                {
                    var reqId = requisition.RequisitionId;

                    //update the requisition in INV_TXN_Requisition table.
                    requisition.ModifiedOn = DateTime.Now;
                    requisition.ModifiedBy = currentUser.EmployeeId;

                    //update each item and add the new item against that requisition in INV_TXN_RequisitionItems table.
                    requisition.RequisitionItems.ForEach(item =>
                    {
                        if (item.RequisitionItemId > 0) //old elememnt will have the requisitionItemId
                        {
                            //for updating old element
                            item.ModifiedBy = currentUser.EmployeeId;
                            item.ModifiedOn = DateTime.Now;
                            item.PendingQuantity = item.Quantity - item.ReceivedQuantity;
                            dbContext.RequisitionItems.Attach(item);
                            dbContext.Entry(item).Property(a => a.Quantity).IsModified = true;
                            dbContext.Entry(item).Property(a => a.PendingQuantity).IsModified = true;
                            dbContext.Entry(item).Property(a => a.ModifiedBy).IsModified = true;
                            dbContext.Entry(item).Property(a => a.ModifiedOn).IsModified = true;
                            dbContext.Entry(item).Property(a => a.RequisitionNo).IsModified = true;
                            dbContext.Entry(item).Property(a => a.RequisitionItemStatus).IsModified = true;
                            dbContext.Entry(item).Property(a => a.CancelBy).IsModified = true;
                            dbContext.Entry(item).Property(a => a.CancelOn).IsModified = true;
                            dbContext.Entry(item).Property(a => a.CancelQuantity).IsModified = true;
                            dbContext.Entry(item).Property(a => a.IsActive).IsModified = true;
                            dbContext.Entry(item).Property(a => a.IssueNo).IsModified = true;
                            dbContext.Entry(item).Property(a => a.Remark).IsModified = true;
                            dbContext.SaveChanges();
                        }
                        else //new items wont have requisitionItemId
                        {
                            //for adding new reqitm
                            item.CreatedOn = DateTime.Now;
                            item.CreatedBy = currentUser.EmployeeId;
                            item.RequisitionId = reqId;
                            item.RequisitionNo = requisition.RequisitionNo;
                            item.RequisitionItemStatus = "active";
                            item.ModifiedBy = item.CreatedBy;
                            item.ModifiedOn = item.CreatedOn;
                            item.PendingQuantity = item.Quantity - item.ReceivedQuantity;
                            dbContext.RequisitionItems.Add(item);
                            dbContext.SaveChanges();
                        }
                    });

                    dbContext.Requisitions.Attach(requisition);
                    dbContext.Entry(requisition).Property(a => a.RequisitionDate).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.IssueNo).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.Remarks).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.ModifiedBy).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.ModifiedOn).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.RequestToStoreId).IsModified = true;
                    dbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    responseData.Status = "OK";
                    responseData.Results = requisition.RequisitionId;
                }

                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return Ok(responseData);
        }
        //put method Consumption Item List
        [HttpPut("~/api/WardSupply/put-consumption")]
        public IActionResult PutConsumptionData()
        {
            string str = this.ReadPostData();
            List<WARDConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDConsumptionModel>>(str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PHRMInvoiceTransactionItemsModel invoice = new PHRMInvoiceTransactionItemsModel();
            List<WARDStockModel> wardStockList = new List<WARDStockModel>();
            WARDStockModel wardStock = new WARDStockModel();
            WARDTransactionModel wardtxnmodel = new WARDTransactionModel();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);

            using (var dbTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var consmption in consumptionList)
                    {
                        invoice = wardSupplyDbContext.PHRMInvoiceTransactionItems.Find(consmption.InvoiceItemId);
                        //we need the old consumption quantity value in order to update the stock i.e. to find out whether the stock is increased or decreased.
                        var oldQuantity = invoice.Quantity;
                        if (oldQuantity == consmption.Quantity) { continue; }
                        //updating record in list for updating WARD_Consumption
                        consmption.ModifiedBy = currentUser.EmployeeId;
                        consmption.ModifiedOn = DateTime.Now;
                        consmption.SubTotal = consmption.Quantity * consmption.MRP;
                        wardSupplyDbContext.WARDConsumptionModel.Attach(consmption);
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.SubTotal).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedBy).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedOn).IsModified = true;
                        wardSupplyDbContext.SaveChanges();

                        //updating invoice in PHRM_TXN_Invoice
                        invoice.Quantity = consmption.Quantity;
                        invoice.SubTotal = Convert.ToDecimal(invoice.Quantity) * invoice.MRP;
                        invoice.TotalAmount = invoice.SubTotal - Convert.ToDecimal(invoice.DiscountPercentage / 100);
                        wardSupplyDbContext.PHRMInvoiceTransactionItems.Attach(invoice);
                        wardSupplyDbContext.Entry(invoice).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(invoice).Property(a => a.SubTotal).IsModified = true;
                        wardSupplyDbContext.Entry(invoice).Property(a => a.TotalAmount).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                        //updating record in list for updating stock available quantity
                        wardStock = wardSupplyDbContext.WARDStockModel.Where(a => a.ItemId == consmption.ItemId && a.BatchNo == consmption.BatchNo && a.ExpiryDate == consmption.ExpiryDate && a.MRP == (double)consmption.MRP && a.StoreId == consmption.StoreId).FirstOrDefault();
                        wardtxnmodel.StockId = wardStock.StockId;
                        wardtxnmodel.ItemId = consmption.ItemId;
                        wardtxnmodel.WardId = consmption.WardId;
                        wardtxnmodel.TransactionType = "WardConsumptionEdit";
                        wardtxnmodel.Remarks = "PatientConsumptionUpdated. Id:" + consmption.ConsumptionId;
                        wardtxnmodel.IsWard = true;
                        wardtxnmodel.StoreId = consmption.StoreId;
                        wardtxnmodel.CreatedBy = currentUser.UserName;
                        wardtxnmodel.CreatedOn = DateTime.Now;
                        if (oldQuantity < consmption.Quantity)
                        {
                            //decrement in stock
                            if (wardStock.AvailableQuantity < (consmption.Quantity - (int)oldQuantity))
                            {
                                Exception ex = new Exception("There is not enough Stock available.");
                                throw ex;
                            }
                            wardStock.AvailableQuantity -= consmption.Quantity - (int)oldQuantity;
                            wardtxnmodel.InOut = "out";
                            wardtxnmodel.Quantity = consmption.Quantity - (int)oldQuantity;
                        }
                        else
                        {
                            //increment in stock
                            wardStock.AvailableQuantity += (int)oldQuantity - consmption.Quantity;
                            wardtxnmodel.InOut = "in";
                            wardtxnmodel.Quantity = (int)oldQuantity - consmption.Quantity;
                        }
                        wardSupplyDbContext.WARDStockModel.Attach(wardStock);
                        wardSupplyDbContext.Entry(wardStock).Property(a => a.AvailableQuantity).IsModified = true;
                        wardSupplyDbContext.TransactionModel.Add(wardtxnmodel);
                        wardSupplyDbContext.SaveChanges();
                    }
                    dbTransaction.Commit();
                    responseData.Status = "OK";
                    responseData.Results = consumptionList;
                }
                catch (Exception ex)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = ex.Message;
                    dbTransaction.Rollback();
                    return BadRequest(responseData);
                }

            }
            return Ok(responseData);

        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
