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
using System.Linq;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class WardSupplyController : CommonController
    {
        
        public WardSupplyController(IOptions<MyConfiguration> _config) : base(_config)
        {
            
        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType, string status, int requisitionId, int wardId, int consumptionId, int patientId,int departmentId,string userName)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            try
            {
                #region Get Departments
                if (reqType == "get-departments")
                {
                    var departmentlist = wardSupplyDbContext.Departments.ToList();
                    responseData.Status = "OK";
                    responseData.Results = departmentlist;

                }
                #endregion
                #region GET: get ward list.
                if (reqType == "ward-list")
                {
                    var wardList = wardSupplyDbContext.WardModel.ToList();
                    responseData.Status = "OK";
                    responseData.Results = wardList;

                }
                #endregion
                #region GET: get ward requisition list.
                else if (reqType == "get-all-ward-requisition-list")
                {

                    string[] poSelectedStatus = status.Split(',');
                    var wardReqList = (from wardReq in wardSupplyDbContext.WARDRequisitionModel
                                       join ward in wardSupplyDbContext.WardModel on wardReq.WardId equals ward.WardId
                                       join emp in wardSupplyDbContext.Employees on wardReq.CreatedBy equals emp.EmployeeId
                                       join stats in poSelectedStatus on wardReq.Status equals stats
                                       where wardReq.WardId == wardId
                                       orderby wardReq.RequisitionId descending
                                       select new
                                       {
                                           WardName = ward.WardName,
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
                    var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
                                       join pat in wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
                                       join ward in wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
                                       where consump.WardId == wardId
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
                #endregion
                #region GET: get Inventory Consumption list.
                else if (reqType == "get-inventory-conumption-list")
                {
                    var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
                                       where consump.DepartmentId == departmentId
                                       group consump by consump.UsedBy into t
                                       select new
                                       {
                                           DepartmentName = t.Select(a => a.DepartmentName).FirstOrDefault(),
                                           UsedBy = t.Select(a => a.UsedBy).FirstOrDefault()
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = consumpList;

                }
                #endregion
                #region ward request items by selected ward.
                else if (reqType == "get-ward-request-items")
                {
                    var warReqItems = (from itm in wardSupplyDbContext.WARDRequisitionItemsModel
                                       join itmReq in wardSupplyDbContext.WARDRequisitionModel on itm.RequisitionId equals itmReq.RequisitionId
                                       join itmName in wardSupplyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                                       where itm.RequisitionId == requisitionId
                                       select new
                                       {
                                           RequisitionItemId = itm.RequisitionItemId,
                                           RequisitionId = itm.RequisitionId,
                                           ItemId = itm.ItemId,
                                           Quantity = itm.Quantity,
                                           ItemName = itmName.ItemName,
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = warReqItems;
                }
                #endregion

                #region consumption items by selected ward.
                else if (reqType == "get-consumption-items-list")
                {

                    var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
                                       where consump.PatientId == patientId && consump.WardId == wardId
                                       select new
                                       {
                                           ItemName = consump.ItemName,
                                           Quantity = consump.Quantity
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = consumpList;
                }
                #endregion
                #region inventory consumption items by selected department and user.
                else if (reqType == "get-inventory-consumption-itemlist")
                {

                    var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
                                       where consump.UsedBy == userName && consump.DepartmentId == departmentId
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
                                      join ward in wardSupplyDbContext.WardModel on wardstock.WardId equals ward.WardId
                                      join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                                      where wardstock.StockType== "pharmacy"
                                      group wardstock by new { wardstock.ItemId, wardstock.StockId, wardstock.BatchNo, wardstock.MRP, wardstock.ExpiryDate } into x
                                      select new
                                      {
                                          WardId = x.Select(a => a.WardId).FirstOrDefault(),
                                          WardName = wardSupplyDbContext.WardModel.Where(a => a.WardId == x.Select(b => b.WardId).FirstOrDefault()).Select(b => b.WardName).FirstOrDefault(),
                                          ItemId = x.Key.ItemId,
                                          StockId = x.Key.StockId,
                                          ItemName = wardSupplyDbContext.PHRMItemMaster.Where(a => a.ItemId == x.Key.ItemId).Select(a => a.ItemName).FirstOrDefault(),
                                          BatchNo = x.Key.BatchNo,
                                          AvailableQuantity = x.Sum(a => a.AvailableQuantity),
                                          ExpiryDate = x.Key.ExpiryDate,
                                          MRP = Math.Round(x.Key.MRP, 2)
                                      })
                                      .Where(a => a.ExpiryDate >= DateTime.Now).ToList();

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
                                      group wardstock by new { wardstock.ItemId, item.ItemName, wardstock.DepartmentId, department.DepartmentName,item.ItemType } into t
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
                    var testdate = DateTime.Now.AddMonths(1);
                    //To calculate stock and add batch and items
                    var totalStock = phrmdbcontext.PHRMStockTransactionModel
                        .Select(n => new { n.ItemId, MRP = (Math.Round((double)n.MRP, 2)), n.Quantity, n.Price, n.BatchNo, n.ExpiryDate, n.InOut, n.FreeQuantity })
                        .Where(a => a.ExpiryDate >= testdate).ToList().GroupBy(a => new { a.ItemId, a.BatchNo, a.MRP, a.ExpiryDate }).Select(g =>
                        new PHRMStockTransactionItemsModel
                        {
                            ItemId = g.Key.ItemId,
                            BatchNo = g.Key.BatchNo,
                            //InOut = g.Key.InOut,
                            Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) + g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out")
                            .Sum(o => o.Quantity) - g.Where(w => w.InOut == "out").Sum(f => f.FreeQuantity).Value,
                            FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                            ExpiryDate = g.Key.ExpiryDate,
                            MRP = Convert.ToDecimal(g.Key.MRP),
                            Price = g.FirstOrDefault().Price,
                        }
                    ).Where(a => a.Quantity > 0).GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId, (a, b) => new GoodReceiptItemsViewModel
                    {
                        ItemId = a.ItemId.Value,
                        BatchNo = a.BatchNo,
                        ExpiryDate = a.ExpiryDate.Value.Date,
                        ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                        AvailableQuantity = a.Quantity,
                        MRP = a.MRP.Value,
                        GRItemPrice = a.Price.Value,
                        GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                        IsActive = true
                    }
                    ).OrderBy(expDate => expDate.ExpiryDate).ToList().Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    { GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    .Select(s => new GoodReceiptItemsViewModel
                    {
                        ItemId = s.GoodReceiptItemsViewModel.ItemId,
                        BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                        ExpiryDate = s.GoodReceiptItemsViewModel.ExpiryDate.Date,
                        ItemName = s.GoodReceiptItemsViewModel.ItemName,
                        AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,
                        MRP = s.GoodReceiptItemsViewModel.MRP,
                        GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                        GenericId = s.GoodReceiptItemsViewModel.GenericId,
                        GenericName = s.PHRMGenericModel.GenericName,
                        //CategoryName = s.PHRMCategory.CategoryName,
                        IsActive = true
                    });

                    responseData.Status = "OK";
                    responseData.Results = totalStock;
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
                        PHRMInvoiceTransactionItemsModel invoice = new PHRMInvoiceTransactionItemsModel();
                        List<WARDStockModel> wardStockList = new List<WARDStockModel>();
                        WARDStockModel wardStock = new WARDStockModel();
                        List<WARDConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDConsumptionModel>>(str);
                        PHRMStockTransactionItemsModel phrmStockTxnItems = new PHRMStockTransactionItemsModel();
                        foreach (var consmption in consumptionList)
                        {
                            //adding invoice in PHRM_TXN_Invoice
                            invoice.ItemId = consmption.ItemId;
                            invoice.ItemName = consmption.ItemName;
                            invoice.BatchNo = consmption.BatchNo;
                            invoice.Quantity = consmption.Quantity;
                            invoice.Price = consmption.MRP;
                            invoice.MRP = consmption.MRP;
                            invoice.SubTotal = consmption.SubTotal;
                            invoice.TotalAmount = consmption.SubTotal;
                            invoice.CreatedBy = consmption.CreatedBy;
                            invoice.CreatedOn = System.DateTime.Now;
                            invoice.CounterId = consmption.CounterId;
                            invoice.BilItemStatus = "wardconsumption";
                            invoice.ExpiryDate = consmption.ExpiryDate;
                            invoice.PatientId = consmption.PatientId;
                            invoice.VATPercentage = 0;
                            invoice.DiscountPercentage = 0;
                            invoice.FreeQuantity = 0;
                            phrmdbcontext.PHRMInvoiceTransactionItems.Add(invoice);
                            phrmdbcontext.SaveChanges();

                            //adding consumption in WARD_Consumption
                            consmption.InvoiceItemId = invoice.InvoiceItemId;
                            consmption.CreatedOn = System.DateTime.Now;
                            wardSupplyDbContext.WARDConsumptionModel.Add(consmption);
                            wardSupplyDbContext.SaveChanges();

                            //adding record in list for updating stock available quantity
                            wardStock = new WARDStockModel();
                            wardStock.ItemId = consmption.ItemId;
                            wardStock.MRP = (float)consmption.MRP;
                            wardStock.ExpiryDate = consmption.ExpiryDate;
                            wardStock.BatchNo = consmption.BatchNo;
                            wardStock.WardId = consmption.WardId;
                            wardStock.DispachedQuantity = consmption.Quantity;
                            wardStockList.Add(wardStock);

                            //adding record in the PHRM_StockTxnItems
                            phrmStockTxnItems.CreatedBy = currentUser.EmployeeId;
                            phrmStockTxnItems.CreatedOn = DateTime.Now;
                            phrmStockTxnItems.BatchNo = consmption.BatchNo;
                            phrmStockTxnItems.ItemId = consmption.ItemId;
                            phrmStockTxnItems.Price = consmption.MRP;
                            phrmStockTxnItems.MRP = consmption.MRP;
                            phrmStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
                            phrmStockTxnItems.ReferenceNo = consmption.InvoiceItemId;
                            phrmStockTxnItems.GoodsReceiptItemId = null;
                            phrmStockTxnItems.CCCharge = null;
                            phrmStockTxnItems.Quantity = consmption.Quantity;
                            phrmStockTxnItems.ExpiryDate = consmption.ExpiryDate;
                            phrmStockTxnItems.FreeQuantity = 0;
                            phrmStockTxnItems.DiscountPercentage = 0;
                            phrmStockTxnItems.VATPercentage = 0;
                            phrmStockTxnItems.InOut = "out";
                            phrmStockTxnItems.TransactionType = "wardsupply";
                            phrmStockTxnItems.SubTotal = consmption.SubTotal;
                            phrmStockTxnItems.TotalAmount = consmption.SubTotal;
                            phrmdbcontext.PHRMStockTransactionModel.Add(phrmStockTxnItems);
                            phrmdbcontext.SaveChanges();
                        }

                        if (WardSupplyBL.UpdateWardSockQuantity(wardStockList, wardSupplyDbContext))
                        {
                            responseData.Status = "OK";
                            responseData.Results = consumptionList;
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
                        PHRMInvoiceTransactionItemsModel invoice = new PHRMInvoiceTransactionItemsModel();
                        List<WARDStockModel> wardStockList = new List<WARDStockModel>();
                        WARDStockModel wardStock = new WARDStockModel();
                        List<WARDInventoryConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDInventoryConsumptionModel>>(str);
                        PHRMStockTransactionItemsModel phrmStockTxnItems = new PHRMStockTransactionItemsModel();
                        foreach (var consmption in consumptionList)
                        {
                            

                            //adding record in list for updating stock available quantity
                            var AvailableQuantity = consmption.Quantity - consmption.ConsumeQuantity;
                            WARDStockModel stockDetail = (from stock in wardSupplyDbContext.WARDStockModel
                                                          where stock.ItemId == consmption.ItemId & stock.StockType == "inventory" && stock.DepartmentId == consmption.DepartmentId
                                                          select stock
                                                          ).FirstOrDefault();
                            stockDetail.AvailableQuantity = AvailableQuantity;
                            wardSupplyDbContext.Entry(stockDetail).Property(a => a.AvailableQuantity).IsModified = true;

                            //adding consumption in [WARD_INV_Consumption]
                            AvailableQuantity = consmption.ConsumeQuantity;
                            consmption.Quantity = AvailableQuantity;
                            consmption.CreatedOn = System.DateTime.Now;
                            wardSupplyDbContext.WARDInventoryConsumptionModel.Add(consmption);
                            wardSupplyDbContext.SaveChanges();
                        }
                            responseData.Status = "OK";
                            responseData.Results = consumptionList;
                    }
                    #endregion
                    #region POST : update stock transaction, Post to Stock table and post to Transaction table                 
                    else if (reqType == "transfer-stock")
                    {
                        WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
                        if (stockManageData != null)
                        {
                            Boolean flag = false;


                            flag = WardSupplyBL.StockTransfer(stockManageData, wardSupplyDbContext, currentUser);
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
                    #region POST : Ward To Pharmacy Tranfer of Stock
                    else if (reqType == "returnStockToPharmacy")
                    {
                        List<WARDStockModel> stockManageData = DanpheJSONConvert.DeserializeObject<List<WARDStockModel>>(str);
                        if (stockManageData != null)
                        {
                            Boolean flag = false;

                            flag = WardSupplyBL.StockTransferToPharmacy(stockManageData, wardSupplyDbContext, phrmdbcontext, currentUser);
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

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        //WARDSUPPLY REPORTS
        //Ward Stock Items Report
        [HttpGet("/api/WardSupply/WARDStockItemsReport/{itemId}")]
        public string WARDStockItemsReport(int itemId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);

            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable stockItemsResult = wardreportingDbContext.WARDStockItemsReport(itemId);
                responseData.Status = "OK";
                responseData.Results = stockItemsResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        //Ward Requisition Report
        [HttpGet("/api/WardSupply/WARDRequisitionReport/{FromDate}/{ToDate}")]
        public string WARDRequisitionReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDRequisitionReport(FromDate, ToDate);
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


        //Ward Breakage Report
        [HttpGet("/api/WardSupply/WARDBreakageReport/{FromDate}/{ToDate}")]
        public string WARDBreakageReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDBreakageReport(FromDate, ToDate);
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


        //Ward Consumption Report
        [HttpGet("/api/WardSupply/WARDConsumptionReport/{FromDate}/{ToDate}")]
        public string WARDConsumptionReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDConsumptionReport(FromDate, ToDate);
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

        //Ward Transfer Report
        [HttpGet("/api/WardSupply/WARDTransferReport/{FromDate}/{ToDate}/{Status}")]
        public string WARDTransferReport(DateTime FromDate, DateTime ToDate, int Status)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.WARDTransferReport(FromDate, ToDate, Status);
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
        [HttpGet("/api/WardSupply/Inventory/Reports/RequisitionDispatchReport/{FromDate}/{ToDate}")]
        public string RequisitionDispatchReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.RequisitionDispatchReport(FromDate, ToDate);
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
        [HttpGet("/api/WardSupply/Inventory/Reports/TransferReport/{FromDate}/{ToDate}")]
        public string TransferReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.TransferReport(FromDate, ToDate);
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
        [HttpGet("/api/WardSupply/Inventory/Reports/ConsumptionReport/{FromDate}/{ToDate}")]
        public string ConsumptionReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                WardReportingDbContext wardreportingDbContext = new WardReportingDbContext(connString);
                DataTable dtResult = wardreportingDbContext.ConsumptionReport(FromDate, ToDate);
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
    }
}
