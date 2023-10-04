using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.ServerModel.WardSupplyModels;
using DanpheEMR.Services.Dispensary;
using DanpheEMR.Services.Inventory.DTO.InventoryRequisition;
using DanpheEMR.Services.Verification;
using DanpheEMR.Services.Verification.DTOs.Pharmacy;
using DanpheEMR.Services.WardSupply.Pharmacy.Requisiton;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Substore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    /// <summary> Implementation of all the Apis required for WardSupply Module </summary>
    public class WardSupplyController : CommonController
    {
        private readonly WardSupplyDbContext _wardSupplyDbContext;
        private readonly InventoryDbContext _inventoryDbContext;
        private readonly RbacDbContext _rbacDbContext;
        public WardSupplyController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _wardSupplyDbContext = new WardSupplyDbContext(connString);
            _inventoryDbContext = new InventoryDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
        }

        /// <summary> Provides the list of departments.</summary>
        [HttpGet("Departments")]
        [Produces(typeof(DanpheHTTPResponse<List<DepartmentModel>>))]
        public IActionResult GetDepartments()
        {
            // #region Get Departments
            //     if (reqType == "get-departments")
            //     {
            //         var departmentlist = wardSupplyDbContext.Departments.ToList().OrderBy(a => a.DepartmentName);
            //         responseData.Status = "OK";
            //         responseData.Results = departmentlist;

            //     }
            // #endregion
            Func<List<DepartmentModel>> func = () => _wardSupplyDbContext.Departments.OrderBy(e => e.DepartmentName).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of wards.</summary>
        /// <param name="StoreId">Id of the Store for which the wards are mapped.</param>
        [HttpGet("Wards")]
        [Produces(typeof(DanpheHTTPResponse<List<WardModel>>))]
        public IActionResult GetWards(int StoreId)
        {
            // #region GET: get ward list.
            //     if (reqType == "ward-list")
            //     {
            //         var wardList = wardSupplyDbContext.WardModel.Where(a => a.StoreId == StoreId).ToList();
            //         responseData.Status = "OK";
            //         responseData.Results = wardList;

            //     }
            // #endregion
            Func<List<WardModel>> func = () => _wardSupplyDbContext.WardModel.Where(a => a.StoreId == StoreId).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of only active substores.</summary>
        [HttpGet("ActiveSubstores")]
        [Produces(typeof(DanpheHTTPResponse<List<PHRMStoreModel>>))]
        public IActionResult GetActiveSubstores()
        {
            //  #region GET: get active store list.
            //     else if (reqType == "active-substore-list")
            //     {
            //         var substoreCategory = Enums.ENUM_StoreCategory.Substore;
            //         var storeList = wardSupplyDbContext.StoreModel.Where(a => a.Category == substoreCategory && a.IsActive == true).OrderBy(s => s.Name).ToList();
            //         responseData.Status = "OK";
            //         responseData.Results = storeList;

            //     }
            // #endregion 
            var substoreCategory = Enums.ENUM_StoreCategory.Substore;
            Func<List<PHRMStoreModel>> func = () => _wardSupplyDbContext.StoreModel
                            .Where(a => a.Category == substoreCategory && a.IsActive == true)
                            .OrderBy(s => s.Name)
                            .ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of requisition for a single substore.</summary>
        /// <param name="StoreId">Id of the Store for the requisition to be listed.</param>
        [HttpGet("Requisitions")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyRequisitionsDTO>>))]
        public IActionResult GetRequisitions(int StoreId)
        {
            //    #region GET: get ward requisition list.
            //     if (reqType == "get-all-requisition-list")
            //     {

            //         //string[] poSelectedStatus = status.Split(',');
            //         var wardReqList = (from wardReq in wardSupplyDbContext.PhrmSubstoreRequisitions
            //                            join emp in wardSupplyDbContext.Employees on wardReq.CreatedBy equals emp.EmployeeId
            //                            join store in wardSupplyDbContext.StoreModel on wardReq.StoreId equals store.StoreId
            //                            join D in wardSupplyDbContext.PHRMSubStoreDispatchItems on wardReq.RequisitionId equals D.RequisitionId into DGrouped
            //                            //join stats in poSelectedStatus on wardReq.RequisitionStatus equals stats
            //                            where wardReq.StoreId == StoreId
            //                            orderby wardReq.RequisitionId descending
            //                            select new
            //                            {
            //                                CreatedBy = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
            //                                Date = wardReq.CreatedOn,
            //                                Status = wardReq.RequisitionStatus,
            //                                RequisitionId = wardReq.RequisitionId,
            //                                IsNewDispatchAvailable = DGrouped.Any(d => d.ReceivedById == null),

            //                            }).ToList();
            //         responseData.Status = ENUM_DanpheHttpResponseText.OK;
            //         responseData.Results = wardReqList;

            //     }

            Func<List<WardSupplyRequisitionsDTO>> func = () =>
                                    (
                                        from wardReq in _wardSupplyDbContext.PHRMSubStoreRequisitions
                                        join emp in _wardSupplyDbContext.Employees on wardReq.CreatedBy equals emp.EmployeeId
                                        join store in _wardSupplyDbContext.StoreModel on wardReq.StoreId equals store.StoreId
                                        join D in _wardSupplyDbContext.PHRMSubStoreDispatchItems on wardReq.RequisitionId equals D.RequisitionId into DGrouped
                                        where wardReq.StoreId == StoreId
                                        orderby wardReq.RequisitionId descending
                                        select new WardSupplyRequisitionsDTO
                                        {
                                            RequisitionNo = wardReq.RequisitionNo,
                                            CreatedBy = emp.FullName,
                                            Date = wardReq.CreatedOn,
                                            Status = wardReq.RequisitionStatus,
                                            RequisitionId = wardReq.RequisitionId,
                                            IsNewDispatchAvailable = DGrouped.Any(d => d.ReceivedById == null),
                                        }
                                    ).ToList();
            return InvokeHttpGetFunction(func);
        }


        /// <summary> Provides the list of consumption details of a single substore.</summary>
        /// <param name="StoreId">Id of the Store for the consumption to be listed.</param>
        /// <param name="WardId"> Id of the Ward if filtering is to be done against ward for consumption </param>
        [HttpGet("ConsumptionDetails")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyRequisitionsDTO>>))]
        public IActionResult GetConsumptionDetails(int StoreId, int WardId)
        {
            //   #region GET: get Consumption list.
            //          if (reqType == "get-All-Comsumption-List-Details")
            //         {
            //             if (wardId == 0)
            //             {
            //                 var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
            //                                    join pat in wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
            //                                    join ward in wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
            //                                    where consump.StoreId == StoreId
            //                                    group new { consump, pat } by new
            //                                    {
            //                                        consump.PatientId,
            //                                        pat.FirstName,
            //                                        pat.MiddleName,
            //                                        pat.LastName,
            //                                        pat.Address,
            //                                        pat.PhoneNumber,
            //                                        pat.Gender,
            //                                        ward.WardName,
            //                                        consump.WardId,
            //                                        pat.Age
            //                                    } into t
            //                                    select new
            //                                    {
            //                                        WardId = t.Key.WardId,
            //                                        WardName = t.Key.WardName,
            //                                        Name = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
            //                                        Address = t.Key.Address,
            //                                        Gender = t.Key.Gender,
            //                                        PhoneNumber = t.Key.PhoneNumber,
            //                                        PatientId = t.Key.PatientId,
            //                                        Quantity = t.Sum(a => a.consump.Quantity),
            //                                        Age = t.Key.Age

            //                                    }).ToList();
            //                 responseData.Status = "OK";
            //                 responseData.Results = consumpList;
            //             }
            //             else
            //             {
            //                 var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
            //                                    join pat in wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
            //                                    join ward in wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
            //                                    where consump.WardId == wardId && consump.StoreId == StoreId
            //                                    group new { consump, pat } by new
            //                                    {
            //                                        consump.PatientId,
            //                                        pat.FirstName,
            //                                        pat.MiddleName,
            //                                        pat.LastName,
            //                                        pat.Address,
            //                                        pat.PhoneNumber,
            //                                        pat.Gender,
            //                                        ward.WardName,
            //                                        consump.WardId,
            //                                        pat.Age
            //                                    } into t
            //                                    select new
            //                                    {
            //                                        WardId = t.Key.WardId,
            //                                        WardName = t.Key.WardName,
            //                                        Name = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
            //                                        Address = t.Key.Address,
            //                                        Gender = t.Key.Gender,
            //                                        PhoneNumber = t.Key.PhoneNumber,
            //                                        PatientId = t.Key.PatientId,
            //                                        Quantity = t.Sum(a => a.consump.Quantity),
            //                                        Age = t.Key.Age

            //                                    }).ToList();
            //                 responseData.Status = "OK";
            //                 responseData.Results = consumpList;
            //             }

            //         }
            //         #endregion

            Func<List<WardSupplyConsumptionDetailsDTO>> func = () =>
                                   (
                                    from consump in _wardSupplyDbContext.WARDConsumptionModel
                                    join pat in _wardSupplyDbContext.Patients on consump.PatientId equals pat.PatientId
                                    join ward in _wardSupplyDbContext.WardModel on consump.WardId equals ward.WardId
                                    where (consump.WardId == WardId || WardId == 0) && consump.StoreId == StoreId
                                    group new { consump, pat } by new
                                    {
                                        consump.PatientId,
                                        pat.ShortName,
                                        pat.Address,
                                        pat.PhoneNumber,
                                        pat.Gender,
                                        ward.WardName,
                                        consump.WardId,
                                        pat.Age
                                    } into t
                                    select new WardSupplyConsumptionDetailsDTO
                                    {
                                        WardId = t.Key.WardId,
                                        WardName = t.Key.WardName,
                                        Name = t.Key.ShortName,
                                        Address = t.Key.Address,
                                        Gender = t.Key.Gender,
                                        PhoneNumber = t.Key.PhoneNumber,
                                        PatientId = t.Key.PatientId,
                                        Quantity = t.Sum(a => a.consump.Quantity),
                                        Age = t.Key.Age
                                    }
                                    ).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of internal consumption details of a single substore.</summary>
        /// <param name="ConsumptionId">Id of the Consumption for which the detail is to be generated. (Consumption List API provides ConsumptionId)</param>
        [HttpGet("InternalConsumptionDetailsById/{ConsumptionId}")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyRequisitionsDTO>>))]
        public IActionResult GetInternalConsumptionDetailsById(int ConsumptionId)
        {
            // if (reqType == "get-internal-consumption-details")
            //     {
            //         RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            //         var internalConsumptiondetails = (from internalconsumption in wardSupplyDbContext.WARDInternalConsumptionModel
            //                                           join internalconsumptionitem in wardSupplyDbContext.WARDInternalConsumptionItemsModel on internalconsumption.ConsumptionId equals internalconsumptionitem.ConsumptionId
            //                                           join department in wardSupplyDbContext.StoreModel on internalconsumption.SubStoreId equals department.StoreId
            //                                           join phrmitem in wardSupplyDbContext.PHRMItemMaster on internalconsumptionitem.ItemId equals phrmitem.ItemId
            //                                           join phrmgeneric in wardSupplyDbContext.PHRMGenericMaster on phrmitem.GenericId equals phrmgeneric.GenericId
            //                                           where internalconsumption.ConsumptionId == consumptionId
            //                                           select new
            //                                           {
            //                                               ConsumptionId = internalconsumption.ConsumptionId,
            //                                               ConsumptionItemId = internalconsumptionitem.ConsumptionItemId,
            //                                               ItemName = internalconsumptionitem.ItemName,
            //                                               ItemId = internalconsumptionitem.ItemId,
            //                                               SubStoreId = internalconsumptionitem.SubStoreId,
            //                                               BatchNo = internalconsumptionitem.BatchNo,
            //                                               ExpiryDate = internalconsumptionitem.ExpiryDate,
            //                                               SalePrice = internalconsumptionitem.SalePrice,
            //                                               Quantity = internalconsumptionitem.Quantity,
            //                                               TotalAmount = internalconsumptionitem.Subtotal,

            //                                               Remark = internalconsumption.Remark,
            //                                               User = currentUser.UserName,
            //                                               Department = department.Name,
            //                                               DepartmentId = department.StoreId,
            //                                               Date = internalconsumption.CreatedOn,
            //                                               GenericId = phrmgeneric.GenericId,
            //                                               GenericName = phrmgeneric.GenericName


            //                                           }).ToList();
            //         responseData.Status = ENUM_DanpheHttpResponseText.OK;
            //         responseData.Results = internalConsumptiondetails;
            //     }
            Func<List<WardSupplyInternalConsumptionDetailsDTO>> func = () =>
                                  (
                                    from internalconsumption in _wardSupplyDbContext.WARDInternalConsumptionModel
                                    join internalconsumptionitem in _wardSupplyDbContext.WARDInternalConsumptionItemsModel on internalconsumption.ConsumptionId equals internalconsumptionitem.ConsumptionId
                                    join department in _wardSupplyDbContext.StoreModel on internalconsumption.SubStoreId equals department.StoreId
                                    join phrmitem in _wardSupplyDbContext.PHRMItemMaster on internalconsumptionitem.ItemId equals phrmitem.ItemId
                                    join phrmgeneric in _wardSupplyDbContext.PHRMGenericMaster on phrmitem.GenericId equals phrmgeneric.GenericId
                                    join employee in _wardSupplyDbContext.Employees on internalconsumption.CreatedBy equals employee.EmployeeId
                                    where internalconsumption.ConsumptionId == ConsumptionId
                                    select new WardSupplyInternalConsumptionDetailsDTO
                                    {
                                        ConsumptionId = internalconsumption.ConsumptionId,
                                        ConsumptionItemId = internalconsumptionitem.ConsumptionItemId,
                                        ItemName = internalconsumptionitem.ItemName,
                                        ItemId = internalconsumptionitem.ItemId,
                                        SubStoreId = internalconsumptionitem.SubStoreId,
                                        BatchNo = internalconsumptionitem.BatchNo,
                                        ExpiryDate = internalconsumptionitem.ExpiryDate,
                                        SalePrice = internalconsumptionitem.SalePrice,
                                        Quantity = internalconsumptionitem.Quantity,
                                        TotalAmount = internalconsumptionitem.Subtotal,
                                        Remark = internalconsumption.Remark,
                                        User = employee.FullName,
                                        Department = department.Name,
                                        DepartmentId = department.StoreId,
                                        Date = internalconsumption.CreatedOn,
                                        GenericId = phrmgeneric.GenericId,
                                        GenericName = phrmgeneric.GenericName
                                    }
                                    ).ToList();
            return InvokeHttpGetFunction(func);
        }


        /// <summary> Provides the list of internal consumption briefly of a single substore.</summary>
        /// <param name="StoreId">Id of the Store for which the detail is to be generated.</param>
        [HttpGet("InternalConsumptions")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyInternalConsumptionListDTO>>))]
        public IActionResult GetInternalConsumptions(int StoreId)
        {
            //  #region GET: get Internal Consumption list 

            // if (reqType == "get-internal-consumption-list")
            // {
            //     var internalConsumptionList = (from consumptionList in wardSupplyDbContext.WARDInternalConsumptionModel
            //                                     join department in wardSupplyDbContext.StoreModel on consumptionList.SubStoreId equals department.StoreId
            //                                     where consumptionList.SubStoreId == StoreId
            //                                     select new
            //                                     {
            //                                         ConsumptionId = consumptionList.ConsumptionId,
            //                                         ConsumedDate = consumptionList.CreatedOn,
            //                                         SubStoreName = department.Name,
            //                                         ConsumedBy = consumptionList.ConsumedBy,
            //                                         Remark = consumptionList.Remark
            //                                     }).ToList();
            //     responseData.Status = ENUM_DanpheHttpResponseText.OK;
            //     responseData.Results = internalConsumptionList;
            // }
            // #endregion
            Func<List<WardSupplyInternalConsumptionListDTO>> func = () =>
                                  (
                                    from consumptionList in _wardSupplyDbContext.WARDInternalConsumptionModel
                                    join department in _wardSupplyDbContext.StoreModel on consumptionList.SubStoreId equals department.StoreId
                                    where consumptionList.SubStoreId == StoreId
                                    select new WardSupplyInternalConsumptionListDTO
                                    {
                                        ConsumptionId = consumptionList.ConsumptionId,
                                        ConsumedDate = consumptionList.CreatedOn,
                                        SubStoreName = department.Name,
                                        ConsumedBy = consumptionList.ConsumedBy,
                                        Remark = consumptionList.Remark
                                    }
                                ).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of internal consumption item level list of a single consumption entry.</summary>
        /// <param name="ConsumptionId">Id of the Consumption for which the detail is to be generated. (Consumption List API provides ConsumptionId)</param>
        [HttpGet("InternalConsumptionItemListById/{ConsumptionId}")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyInternalConsumptionItemListDTO>>))]
        public IActionResult GetInternalConsumptionItemList(int ConsumptionId)
        {
            // #region GET: get Internal Consumption Item list 

            // if (reqType == "get-internal-consumption-item-list")
            // {
            //     var inernalConsumptionItemList = (from consumptionItemList in wardSupplyDbContext.WARDInternalConsumptionItemsModel
            //                                       join item in wardSupplyDbContext.PHRMItemMaster on consumptionItemList.ItemId equals item.ItemId
            //                                       join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
            //                                       where consumptionItemList.ConsumptionId == consumptionId
            //                                       select new
            //                                       {
            //                                           ConsumptionItemId = consumptionItemList.ConsumptionItemId,
            //                                           GenericName = generic.GenericName,
            //                                           ItemName = consumptionItemList.ItemName,
            //                                           BatchNo = consumptionItemList.BatchNo,
            //                                           ConsumedQuantity = consumptionItemList.Quantity
            //                                       }).ToList();

            //     responseData.Status = "OK";
            //     responseData.Results = inernalConsumptionItemList;
            // }
            // #endregion

            Func<List<WardSupplyInternalConsumptionItemListDTO>> func = () =>
                                 (
                                    from consumptionItemList in _wardSupplyDbContext.WARDInternalConsumptionItemsModel
                                    join item in _wardSupplyDbContext.PHRMItemMaster on consumptionItemList.ItemId equals item.ItemId
                                    join generic in _wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                    where consumptionItemList.ConsumptionId == ConsumptionId
                                    select new WardSupplyInternalConsumptionItemListDTO
                                    {
                                        ConsumptionItemId = consumptionItemList.ConsumptionItemId,
                                        GenericName = generic.GenericName,
                                        ItemName = consumptionItemList.ItemName,
                                        BatchNo = consumptionItemList.BatchNo,
                                        ConsumedQuantity = consumptionItemList.Quantity
                                    }
                                ).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of inventory consumption list of a single substore.</summary>
        /// <param name="RequisitionId">Id of the Requisition for which the line item details are required.</param>
        [HttpGet("RequisitionItemsById/{RequisitionId}")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyRequisitionItemsByIdDTO>>))]
        public IActionResult GetRequisitionItemsById(int RequisitionId)
        {
            // #region ward request items by selected ward.
            // if (reqType == "get-ward-request-items")
            // {
            //     var warReqItems = (from itm in wardSupplyDbContext.WARDRequisitionItemsModel
            //                        join itmReq in wardSupplyDbContext.WARDRequisitionModel on itm.RequisitionId equals itmReq.RequisitionId
            //                        join itmName in wardSupplyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
            //                        join genericName in wardSupplyDbContext.PHRMGenericMaster on itmName.GenericId equals genericName.GenericId
            //                        where itm.RequisitionId == requisitionId
            //                        select new
            //                        {
            //                            RequisitionItemId = itm.RequisitionItemId,
            //                            RequisitionId = itm.RequisitionId,
            //                            ItemId = itm.ItemId,
            //                            Quantity = itm.Quantity,
            //                            DispatchedQty = itm.DispatchedQty,
            //                            ItemName = itmName.ItemName,
            //                            GenericName = genericName.GenericName,
            //                            enableItmSearch = false
            //                        }).ToList();
            //     responseData.Status = "OK";
            //     responseData.Results = warReqItems;
            // }
            // #endregion

            Func<List<WardSupplyRequisitionItemsByIdDTO>> func = () =>
                            (
                                from itm in _wardSupplyDbContext.WARDRequisitionItemsModel
                                join itmReq in _wardSupplyDbContext.WARDRequisitionModel on itm.RequisitionId equals itmReq.RequisitionId
                                join itmName in _wardSupplyDbContext.PHRMItemMaster on itm.ItemId equals itmName.ItemId
                                join genericName in _wardSupplyDbContext.PHRMGenericMaster on itmName.GenericId equals genericName.GenericId
                                where itm.RequisitionId == RequisitionId
                                select new WardSupplyRequisitionItemsByIdDTO
                                {
                                    RequisitionItemId = itm.RequisitionItemId,
                                    RequisitionId = itm.RequisitionId,
                                    ItemId = itm.ItemId,
                                    Quantity = itm.Quantity,
                                    DispatchedQty = itm.DispatchedQty,
                                    ItemName = itmName.ItemName,
                                    GenericName = genericName.GenericName,
                                    enableItmSearch = false
                                }
                            ).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of items consumed by a patient.</summary>
        /// <param name="PatientId">PatientId of the Patient who has consumed items.</param>
        /// <param name="StoreId">StoreId of the current active store.</param>
        /// <param name="WardId">WardId of the Ward in which the patient has consumed the items.</param>
        [HttpGet("PatientConsumptionItemList")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyPatientConsumptionItemDTO>>))]
        public IActionResult GetPatientConsumptionItemList(int PatientId, int StoreId, int WardId)
        {

            // #region consumption items by selected ward.
            // if (reqType == "get-consumption-items-list")
            // {
            //     RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            //     var consumpList = (from consump in wardSupplyDbContext.WARDConsumptionModel
            //                        join item in wardSupplyDbContext.PHRMItemMaster on consump.ItemId equals item.ItemId
            //                        join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
            //                        where consump.StoreId == StoreId && consump.WardId == WardId && consump.PatientId == PatientId
            //                        select new
            //                        {
            //                            ConsumptionId = consump.ConsumptionId,
            //                            ItemId = consump.ItemId,
            //                            ItemName = consump.ItemName,
            //                            GenericName = generic.GenericName,
            //                            Quantity = consump.Quantity,
            //                            BatchNo = consump.BatchNo,
            //                            ExpiryDate = consump.ExpiryDate,
            //                            SalePrice = consump.SalePrice,
            //                            TotalAmount = consump.SubTotal,
            //                            CreatedOn = consump.CreatedOn,
            //                            User = currentUser.UserName,
            //                            Remark = consump.Remark,
            //                            StoreId = consump.StoreId,
            //                            InvoiceItemId = consump.InvoiceItemId,
            //                            InvoiceId = consump.InvoiceId,
            //                            wardId = consump.WardId

            //                        }).ToList();
            //     responseData.Status = "OK";
            //     responseData.Results = consumpList;
            // }
            // #endregion

            Func<List<WardSupplyPatientConsumptionItemDTO>> func = () =>
                            (
                                from consump in _wardSupplyDbContext.WARDConsumptionModel
                                join emp in _wardSupplyDbContext.Employees on consump.CreatedBy equals emp.EmployeeId
                                join item in _wardSupplyDbContext.PHRMItemMaster on consump.ItemId equals item.ItemId
                                join generic in _wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                where consump.StoreId == StoreId && consump.WardId == WardId && consump.PatientId == PatientId
                                select new WardSupplyPatientConsumptionItemDTO
                                {
                                    ConsumptionId = consump.ConsumptionId,
                                    ItemId = consump.ItemId,
                                    ItemName = consump.ItemName,
                                    GenericName = generic.GenericName,
                                    Quantity = consump.Quantity,
                                    BatchNo = consump.BatchNo,
                                    ExpiryDate = consump.ExpiryDate,
                                    SalePrice = consump.SalePrice,
                                    TotalAmount = consump.SubTotal,
                                    CreatedOn = consump.CreatedOn,
                                    User = emp.FullName,
                                    Remark = consump.Remark,
                                    StoreId = consump.StoreId,
                                    InvoiceItemId = consump.InvoiceItemId,
                                    InvoiceId = consump.InvoiceId,
                                    wardId = consump.WardId
                                }).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of items consumed by the inventory along with username.</summary>
        /// <param name="StoreId">StoreId of the current active store.</param>
        /// <param name="UserName">UserName of the consumer to filter out the data.</param>
        [HttpGet("InventoryConsumptionItemList")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyInventoryConsumptionItemListDTO>>))]
        public IActionResult GetInventoryConsumptionItemList(int StoreId, string UserName)
        {
            // #region inventory consumption items by selected department and user.
            // if (reqType == "get-inventory-consumption-itemlist")
            // {

            //     var consumpList = (from consump in wardSupplyDbContext.WARDInventoryConsumptionModel
            //                        where consump.UsedBy == userName && consump.StoreId == StoreId
            //                        select new
            //                        {
            //                            ItemName = consump.ItemName,
            //                            Quantity = consump.Quantity,
            //                            UsedBy = consump.UsedBy
            //                        }).ToList();
            //     responseData.Status = "OK";
            //     responseData.Results = consumpList;
            // }
            // #endregion

            Func<List<WardSupplyInventoryConsumptionItemListDTO>> func = () =>
                            (
                                from consump in _wardSupplyDbContext.WARDInventoryConsumptionModel
                                where consump.UsedBy == UserName && consump.StoreId == StoreId
                                select new WardSupplyInventoryConsumptionItemListDTO
                                {
                                    ItemName = consump.ItemName,
                                    Quantity = consump.Quantity,
                                    UsedBy = consump.UsedBy
                                }
                            ).ToList();
            return InvokeHttpGetFunction(func);
        }


        /// <summary> Provides the list of not expired stocks from the selected store.</summary>
        /// <param name="StoreId">StoreId of the current active store.</param>
        [HttpGet("WardStock")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyWardStockDTO>>))]
        public IActionResult GetWardStock(int StoreId)
        {
            //    #region GET: Stock Details 
            //         else if (reqType == "get-all-Ward-Items-StockDetails")
            //     {
            //         var totalStock = (from wardstock in wardSupplyDbContext.StoreStock.Include(ss => ss.StockMaster)
            //                           join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
            //                           join uom in wardSupplyDbContext.PHRMUnitOfMeasurements on item.UOMId equals uom.UOMId
            //                           join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
            //                           where wardstock.StoreId == StoreId
            //                           group new { wardstock, item, uom, generic } by new { wardstock.ItemId, wardstock.StockId, uom.UOMName, wardstock.StockMaster.BatchNo, wardstock.SalePrice, wardstock.StockMaster.ExpiryDate } into x
            //                           select new
            //                           {
            //                               StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
            //                               ItemId = x.Key.ItemId,
            //                               StockId = x.Key.StockId,
            //                               ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
            //                               GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
            //                               BatchNo = x.Key.BatchNo,
            //                               AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
            //                               ExpiryDate = x.Key.ExpiryDate,
            //                               SalePrice = Math.Round(x.Key.SalePrice, 2),
            //                               Unit = x.Key.UOMName
            //                           }).Where(a => a.ExpiryDate >= DateTime.Now).ToList();

            //         responseData.Status = (totalStock == null) ? ENUM_DanpheHttpResponseText.Failed : ENUM_DanpheHttpResponseText.OK;
            //         responseData.Results = totalStock;
            //     }
            //     #endregion

            Func<List<WardSupplyWardStockDTO>> func = () =>
                            (
                                from wardstock in _wardSupplyDbContext.StoreStock.Include(ss => ss.StockMaster)
                                join item in _wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                                join uom in _wardSupplyDbContext.PHRMUnitOfMeasurements on item.UOMId equals uom.UOMId
                                join generic in _wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                                where wardstock.StoreId == StoreId
                                group new { wardstock, item, uom, generic } by new { wardstock.ItemId, wardstock.StockId, uom.UOMName, wardstock.StockMaster.BatchNo, wardstock.SalePrice, wardstock.StockMaster.ExpiryDate } into x
                                select new WardSupplyWardStockDTO
                                {
                                    StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
                                    ItemId = x.Key.ItemId,
                                    StockId = x.Key.StockId,
                                    ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                                    GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
                                    BatchNo = x.Key.BatchNo,
                                    AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                                    ExpiryDate = x.Key.ExpiryDate,
                                    SalePrice = x.Key.SalePrice,
                                    Unit = x.Key.UOMName
                                }
                            ).Where(a => a.ExpiryDate >= DateTime.Now && a.AvailableQuantity > 0).ToList();
            return InvokeHttpGetFunction(func);
        }

        /// <summary> Provides the list of only available stocks (can include expired stock) from the selected store.</summary>
        /// <param name="StoreId">StoreId of the current active store.</param>
        [HttpGet("AvailableWardStock")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyWardStockDTO>>))]
        public IActionResult GetAvailableWardStock(int StoreId)
        {
            //  #region GET: Available Stock Details 
            //         else if (reqType == "get-available-Ward-Items-StockDetails")
            //     {
            //         var totalStock = (from wardstock in wardSupplyDbContext.StoreStock.Include(ss => ss.StockMaster)
            //                           join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
            //                           join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
            //                           where wardstock.AvailableQuantity > 0 && wardstock.StoreId == StoreId
            //                           group new { wardstock, item, generic } by new { wardstock.ItemId, wardstock.StockId, wardstock.CostPrice, wardstock.StockMaster.BatchNo, wardstock.SalePrice, wardstock.StockMaster.ExpiryDate } into x
            //                           select new
            //                           {
            //                               ItemId = x.Key.ItemId,
            //                               StockId = x.Key.StockId,
            //                               StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
            //                               ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
            //                               GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
            //                               BatchNo = x.Key.BatchNo,
            //                               AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
            //                               ExpiryDate = x.Key.ExpiryDate,
            //                               SalePrice = Math.Round(x.Key.SalePrice, 2),
            //                               CostPrice = x.Key.CostPrice
            //                           }).ToList().OrderBy(a => a.ItemName);

            //         responseData.Status = (totalStock == null) ? ENUM_DanpheHttpResponseText.Failed : ENUM_DanpheHttpResponseText.OK;
            //         responseData.Results = totalStock;
            //     }
            //     #endregion

            Func<List<WardSupplyWardStockDTO>> func = () =>
                        (
                            from wardstock in _wardSupplyDbContext.StoreStock.Include(ss => ss.StockMaster)
                            join item in _wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                            join generic in _wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                            where wardstock.AvailableQuantity > 0 && wardstock.StoreId == StoreId
                            group new { wardstock, item, generic } by new { wardstock.ItemId, wardstock.StockId, wardstock.CostPrice, wardstock.StockMaster.BatchNo, wardstock.SalePrice, wardstock.StockMaster.ExpiryDate } into x
                            select new WardSupplyWardStockDTO
                            {
                                ItemId = x.Key.ItemId,
                                StockId = x.Key.StockId,
                                StoreId = x.Select(a => a.wardstock.StoreId).FirstOrDefault(),
                                ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                                GenericName = x.Select(a => a.generic.GenericName).FirstOrDefault(),
                                BatchNo = x.Key.BatchNo,
                                AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                                ExpiryDate = x.Key.ExpiryDate,
                                SalePrice = Math.Round(x.Key.SalePrice, 2),
                                CostPrice = x.Key.CostPrice
                            }
                        ).OrderBy(a => a.ItemName).ToList();
            return InvokeHttpGetFunction(func);
        }



        /// <summary> Provides the list of InPatients Available whose admission status is admitted</summary>
        [HttpGet("InPatientList")]
        [Produces(typeof(DanpheHTTPResponse<List<WardSupplyInPatientListDTO>>))]
        public IActionResult GetInPatientList()
        {

            //    #region GET InPatient List
            //         else if (reqType == "inpatient-list")
            //     {
            //         var InPatients = (from pat in wardSupplyDbContext.Patients
            //                           join vst in wardSupplyDbContext.Visits on pat.PatientId equals vst.PatientId
            //                           join adm in wardSupplyDbContext.Admissions on vst.PatientVisitId equals adm.PatientVisitId
            //                           join pbi in wardSupplyDbContext.PatientBedInfos on pat.PatientId equals pbi.PatientId
            //                           where adm.AdmissionStatus == "admitted"
            //                           select new
            //                           {
            //                               pat.PatientId,
            //                               pat.PatientCode,
            //                               pat.FirstName,
            //                               pat.MiddleName,
            //                               pat.LastName,
            //                               pat.Gender,
            //                               pat.DateOfBirth,
            //                               pat.Age,
            //                               pat.Address,
            //                               pat.PhoneNumber,
            //                               vst.VisitCode,
            //                               vst.PatientVisitId,
            //                               pbi.WardId,
            //                               ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
            //                           }).OrderByDescending(patient => patient.PatientId).ToList();
            //         responseData.Results = InPatients;
            //         responseData.Status = "OK";
            //     }
            //     #endregion

            Func<List<WardSupplyInPatientListDTO>> func = () =>
                        (
                            from pat in _wardSupplyDbContext.Patients
                            join vst in _wardSupplyDbContext.Visits on pat.PatientId equals vst.PatientId
                            join adm in _wardSupplyDbContext.Admissions on vst.PatientVisitId equals adm.PatientVisitId
                            join pbi in _wardSupplyDbContext.PatientBedInfos on pat.PatientId equals pbi.PatientId
                            where adm.AdmissionStatus == ENUM_AdmissionStatus.admitted
                            select new WardSupplyInPatientListDTO
                            {
                                PatientId = pat.PatientId,
                                PatientCode = pat.PatientCode,
                                FirstName = pat.FirstName,
                                MiddleName = pat.MiddleName,
                                LastName = pat.LastName,
                                Gender = pat.Gender,
                                DateOfBirth = pat.DateOfBirth,
                                Age = pat.Age,
                                Address = pat.Address,
                                PhoneNumber = pat.PhoneNumber,
                                VisitCode = vst.VisitCode,
                                PatientVisitId = vst.PatientVisitId,
                                WardId = pbi.WardId,
                                ShortName = pat.ShortName,
                            }
                         ).OrderByDescending(patient => patient.PatientId)
                         .ToList();
            return InvokeHttpGetFunction(func);
        }


        [HttpGet("GetInventoryItemsByStoreId/{StoreId}")]
        public IActionResult GetInventoryItemsByStoreId(int StoreId)
        {

            //var inTxns = new string[] { ENUM_INV_StockTransactionType.PurchaseItem, ENUM_INV_StockTransactionType.OpeningItem, ENUM_INV_StockTransactionType.StockManageItem };

            Func<object> func = () => (from wardstock in _wardSupplyDbContext.StoreStocks.Include(s => s.StockMaster)
                                           //let firstInTxn = _wardSupplyDbContext.StockTransactions.FirstOrDefault(a => a.StockId == wardstock.StockId && a.InQty > 0 && inTxns.Contains(a.TransactionType))
                                       join item in _wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                                       join uom in _wardSupplyDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals uom.UOMId
                                       //join mainStore in _wardSupplyDbContext.StoreModel on firstInTxn.StoreId equals mainStore.StoreId
                                       join subcategory in _wardSupplyDbContext.ItemSubCategory on item.SubCategoryId equals subcategory.SubCategoryId
                                       where wardstock.StoreId == StoreId && wardstock.AvailableQuantity > 0
                                       group new { wardstock, item, uom, subcategory } by new { item.ItemId, item.ItemName, item.ItemType, /*mainStore.StoreId, mainStore.Name,*/ item.Description, subcategory.SubCategoryName, subcategory.SubCategoryId } into t
                                       select new
                                       {
                                           ItemId = t.Key.ItemId,
                                           StockId = t.Select(a => a.wardstock.StockId).FirstOrDefault(),
                                           ItemName = t.Key.ItemName.Trim(),
                                           Description = t.Key.Description,
                                           AvailableQuantity = t.Sum(a => a.wardstock.AvailableQuantity),
                                           MinimumQuantity = t.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                                           ExpiryDate = t.Select(a => a.wardstock.StockMaster.ExpiryDate).FirstOrDefault(),
                                           Code = t.Select(a => a.item.Code).FirstOrDefault(),
                                           UOMName = t.Select(a => a.uom.UOMName).FirstOrDefault(),
                                           IsColdStorageApplicable = t.Select(a => a.item.IsColdStorageApplicable).FirstOrDefault(),
                                           MRP = t.Select(a => a.wardstock.StockMaster.MRP).FirstOrDefault(),
                                           BatchNo = t.Select(a => a.wardstock.StockMaster.BatchNo).FirstOrDefault(),
                                           ItemType = t.Key.ItemType,
                                           //StoreId = t.Key.StoreId,
                                           //StoreName = t.Key.Name,
                                           ItemRate = t.Select(s => s.wardstock.StockMaster.CostPrice).FirstOrDefault(),
                                           SubCategoryName = t.Key.SubCategoryName,
                                           SubCategoryId = t.Key.SubCategoryId

                                       }).OrderBy(a => a.ItemName).ToList();

            return InvokeHttpGetFunction(func);

        }

        [HttpGet("GetInventorySubStoreItemsByStoreIdForReturn/{StoreId}")]
        public async Task<IActionResult> GetInventorySubStoreItemsByStoreIdForReturn(int StoreId)
        {
            //List<string> inTransactionType = new List<string>() { ENUM_INV_StockTransactionType.OpeningItem, ENUM_INV_StockTransactionType.PurchaseItem };

            Func<object> func = () => (from S in _inventoryDbContext.StoreStocks.Include(s => s.StockMaster)
                                           // let storeIdOfInventoryThatPurchasedTheItem = _inventoryDbContext.StockTransactions.Where(t => t.StockId == S.StockId && inTransactionType.Contains(t.TransactionType)).Select(s => s.StoreId).FirstOrDefault()
                                       join I in _inventoryDbContext.Items on S.ItemId equals I.ItemId
                                       join C in _inventoryDbContext.ItemCategoryMaster on I.ItemCategoryId equals C.ItemCategoryId
                                       join U in _inventoryDbContext.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals U.UOMId into UJ
                                       from ULJ in UJ.DefaultIfEmpty()
                                       where S.StoreId == StoreId && S.IsActive == true && S.AvailableQuantity > 0 //stktxn.TransactionType.Contains(transactionType) 
                                       group new { S, I, C, ULJ } by new
                                       {
                                           S.ItemId,
                                           I.ItemName,
                                           S.StockMaster.ExpiryDate,
                                           I.Description,
                                           S.StockId,
                                           //StoreId = storeIdOfInventoryThatPurchasedTheItem,
                                           S.IsActive,
                                           S.StockMaster.BatchNo,
                                           C.ItemCategoryName,
                                           I.Code,
                                           I.IsFixedAssets
                                       } into SG
                                       select new
                                       {
                                           StockId = SG.Key.StockId,
                                           //StoreId = SG.Key.StoreId,
                                           ItemId = SG.Key.ItemId,
                                           IsActive = SG.Key.IsActive,
                                           ItemName = SG.Key.ItemName,
                                           Description = SG.Key.Description,
                                           ExpiryDate = SG.Key.ExpiryDate,
                                           ItemCategory = SG.Key.ItemCategoryName,
                                           ItemCode = SG.Key.Code,
                                           ItemUOM = SG.FirstOrDefault().ULJ == null ? "N/A" : SG.Select(s => s.ULJ.UOMName).FirstOrDefault(),
                                           BatchNo = SG.Key.BatchNo,
                                           AvailableQuantity = SG.Sum(s => s.S.AvailableQuantity),
                                           IsFixedAsset = SG.Key.IsFixedAssets,
                                           BarCodeList = (from fixedAssetStock in _inventoryDbContext.FixedAssetStock
                                                          where fixedAssetStock.ItemId == SG.Key.ItemId && fixedAssetStock.IsActive == true && (fixedAssetStock.SubStoreId == StoreId)
                                                          select new BarCodeNumberDTO
                                                          {
                                                              BarCodeNumber = fixedAssetStock.BarCodeNumber,
                                                              StockId = fixedAssetStock.FixedAssetStockId
                                                          }).ToList()
                                       }).ToList();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet("GetInventoryItemsForPatConsumptionByStoreId/{StoreId}")]
        public IActionResult GetInventoryItemsForPatConsumptionByStoreId(int StoreId)
        {
            Func<object> func = () => (from wardstock in _wardSupplyDbContext.StoreStocks
                                       join item in _wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                                       join uom in _wardSupplyDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals uom.UOMId
                                       where wardstock.StoreId == StoreId && item.IsPatConsumptionApplicable == true
                                       group new { wardstock, item, uom } by new { wardstock.ItemId, item.ItemName, item.ItemType, item.Description } into t
                                       select new
                                       {
                                           ItemId = t.Key.ItemId,
                                           StockId = t.Select(a => a.wardstock.StockId).FirstOrDefault(),
                                           ItemName = t.Key.ItemName,
                                           Description = t.Key.Description,
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

            return InvokeHttpGetFunction(func);

        }

        [HttpGet("GetInventoryPatConsumptionItemlistById/{ReceiptId}")]
        public IActionResult GetInventoryPatConsumptionItemlistById(int ReceiptId)
        {
            Func<object> func = () =>
            {
                var consumpList = (from consump in _wardSupplyDbContext.WARDInventoryConsumptionModel
                                   join itemMst in _wardSupplyDbContext.INVItemMaster on consump.ItemId equals itemMst.ItemId
                                   join uom in _wardSupplyDbContext.UnitOfMeasurementMaster on itemMst.UnitOfMeasurementId equals uom.UOMId
                                   where consump.ConsumptionReceiptId == ReceiptId
                                   select new
                                   {
                                       consump.ItemName,
                                       consump.Quantity,
                                       Unit = uom.UOMName,
                                       itemMst.Code
                                   }).ToList();

                var consumpRemarks = (from consump in _wardSupplyDbContext.WARDInventoryConsumptionModel
                                      join patconsume in _wardSupplyDbContext.PatientConsumptionReceipt on consump.ConsumptionReceiptId equals patconsume.ConsumptionReceiptId
                                      where consump.ConsumptionReceiptId == ReceiptId
                                      select patconsume.Remarks).FirstOrDefault();

                return new { ConsumeList = consumpList, ConsumeRemarks = consumpRemarks };
            };

            return InvokeHttpGetFunction(func);
        }

        [HttpGet("GetInventoryConsumptionList/{StoreId}/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryConsumptionList(int StoreId, DateTime FromDate, DateTime ToDate)
        {
            ToDate = ToDate.AddDays(1);
            Func<object> func = () => (from consump in _wardSupplyDbContext.WARDInventoryConsumptionModel
                                       join emp in _wardSupplyDbContext.Employees on consump.CreatedBy equals emp.EmployeeId
                                       join itmmst in _wardSupplyDbContext.INVItemMaster on consump.ItemId equals itmmst.ItemId
                                       join uom in _wardSupplyDbContext.UnitOfMeasurementMaster on itmmst.UnitOfMeasurementId equals uom.UOMId
                                       where consump.StoreId == StoreId && consump.ConsumptionReceiptId == null
                                       select new
                                       {
                                           ConsumptionDate = consump.ConsumptionDate,
                                           ItemName = consump.ItemName,
                                           Quantity = consump.Quantity,
                                           Unit = uom.UOMName,
                                           UsedBy = emp.FullName,
                                           Remark = consump.Remark
                                       }).Where(c => c.ConsumptionDate >= FromDate && c.ConsumptionDate < ToDate)
                                       .OrderByDescending(c => c.ConsumptionDate)
                                       .ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GetInventoryPatientConsumptionReceiptList/{StoreId}/{FromDate}/{ToDate}")]
        public IActionResult GetInventoryPatientConsumptionReceiptList(int StoreId, DateTime FromDate, DateTime ToDate)
        {

            ToDate = ToDate.AddDays(1);

            Func<object> func = () => (from receipt in _wardSupplyDbContext.PatientConsumptionReceipt
                                       join emp in _wardSupplyDbContext.Employees on receipt.CreatedBy equals emp.EmployeeId
                                       join pat in _wardSupplyDbContext.Patients on receipt.PatientId equals pat.PatientId
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
                                           HospitalNo = pat.PatientCode,
                                           Remarks = receipt.Remarks,
                                       }).Where(c => c.CreatedOn >= FromDate && c.CreatedOn < ToDate).OrderByDescending(c => c.CreatedOn).ToList();

            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("GetDispatchListForItemReceive/{RequisitionId}")]
        public IActionResult GetDispatchListForItemReceive([FromRoute] int RequisitionId)
        {
            Func<object> func = () =>
            {
                var RequisitionDetail = _inventoryDbContext.Requisitions.Where(req => req.RequisitionId == RequisitionId)
                                                                .Select(req => new { req.RequisitionNo, req.RequisitionDate, req.RequisitionStatus })
                                                                .FirstOrDefault();
                IQueryable<DispatchItemsModel> dispatchList = _inventoryDbContext.DispatchItems.Where(item => item.RequisitionId == RequisitionId);
                if (dispatchList == null || dispatchList.Count() == 0)
                {
                    throw new InvalidOperationException("No Dispatch Found that can be received.");
                }
                var groupOfDispatchItemById = dispatchList.GroupBy(item => item.DispatchId).ToList();
                var DispatchDetail = groupOfDispatchItemById.Select(g => new
                {
                    DispatchId = g.Key,
                    ReceivedBy = VerificationBL.GetNameByEmployeeId(g.FirstOrDefault().ReceivedById ?? 0, _inventoryDbContext),
                    ReceivedOn = g.FirstOrDefault().ReceivedOn,
                    ReceivedRemarks = g.FirstOrDefault().ReceivedRemarks,
                    DispatchItems = (from dispatchItems in g.ToList()
                                     join item in _inventoryDbContext.Items on dispatchItems.ItemId equals item.ItemId
                                     join RI in _inventoryDbContext.RequisitionItems on dispatchItems.RequisitionItemId equals RI.RequisitionItemId
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
                return new { RequisitionDetail, DispatchDetail };
            };

            return InvokeHttpGetFunction(func);
        }

        [HttpGet("WARDStockItemsReport/{itemId}/{storeId}")]
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

        [HttpGet("WARDRequisitionReport/{FromDate}/{ToDate}/{StoreId}")]
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


        [HttpGet("WARDBreakageReport/{FromDate}/{ToDate}/{StoreId}")]
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
        [HttpGet("WARDInternalConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
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

        [HttpGet("WARDConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
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

        [HttpGet("WARDTransferReport/{FromDate}/{ToDate}/{StoreId}")]
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


        [HttpGet("RequisitionDispatchReport/{FromDate}/{ToDate}/{StoreId}")]
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

        [HttpGet("Inventory/Reports/TransferReport/{FromDate}/{ToDate}/{StoreId}")]
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

        [HttpGet("ConsumptionReport/{FromDate}/{ToDate}/{StoreId}")]
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

        [HttpGet("GetSubstoreRequistionList")]
        public IActionResult GetSubstoreRequistionList(DateTime fromDate, DateTime toDate, int storeId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            Func<List<RequisitionModel>> func = () => GetSubStoreRequisitions(fromDate, toDate, storeId, currentUser, _inventoryDbContext);
            return InvokeHttpGetFunction(func);
        }

        private static List<RequisitionModel> GetSubStoreRequisitions(DateTime FromDate, DateTime ToDate, int StoreId, RbacUser user, InventoryDbContext inventoryDbContext)
        {
            var RequisitionList = (from requ in inventoryDbContext.Requisitions
                                   join sourceStore in inventoryDbContext.StoreMasters on requ.RequestFromStoreId equals sourceStore.StoreId
                                   join targetStore in inventoryDbContext.StoreMasters on requ.RequestToStoreId equals targetStore.StoreId
                                   where requ.RequestFromStoreId == StoreId & DbFunctions.TruncateTime(requ.RequisitionDate) >= DbFunctions.TruncateTime(FromDate) & DbFunctions.TruncateTime(requ.RequisitionDate) <= DbFunctions.TruncateTime(ToDate)
                                   orderby requ.RequisitionId descending
                                   select new
                                   {
                                       RequisitionId = requ.RequisitionId,
                                       RequisitionNo = requ.RequisitionNo,
                                       RequisitionDate = requ.RequisitionDate,
                                       RequisitionStatus = requ.RequisitionStatus,
                                       StoreName = targetStore.Name,
                                       VerificationId = requ.VerificationId,
                                       RequestToStoreId = requ.RequestToStoreId,
                                       EnableReceiveFeature = requ.EnableReceiveFeature,
                                       VerifierIds = requ.VerifierIds
                                   }).AsNoTracking().ToList().Select(R => new RequisitionModel
                                   {
                                       RequisitionId = R.RequisitionId,
                                       RequisitionNo = R.RequisitionNo,
                                       RequisitionDate = R.RequisitionDate,
                                       RequisitionStatus = R.RequisitionStatus,
                                       RequestFromStoreId = StoreId,
                                       RequestToStoreId = R.RequestToStoreId,
                                       StoreName = R.StoreName,
                                       VerificationId = R.VerificationId,
                                       EnableReceiveFeature = R.EnableReceiveFeature,
                                       VerifierIds = R.VerifierIds
                                   }).ToList();
            foreach (var Requisition in RequisitionList)
            {
                dynamic VerifierList = null;
                if (Requisition.VerifierIds != null)
                {
                    VerifierList = DanpheJSONConvert.DeserializeObject<List<dynamic>>(Requisition.VerifierIds);
                }
                Requisition.MaxVerificationLevel = VerifierList == null ? 0 : VerifierList.Count;
                Requisition.NewDispatchAvailable = InventoryBL.CheckIfNewDispatchAvailable(inventoryDbContext, Requisition.RequisitionId);
                Requisition.isVerificationAllowed = InventoryBL.IsUserAllowedToSeeRequisition(inventoryDbContext, user, Requisition, VerifierList);

                if (Requisition.VerificationId != null)
                {
                    Requisition.CurrentVerificationLevelCount = VerificationBL.GetNumberOfVerificationDone(inventoryDbContext, Requisition.VerificationId ?? 0);
                }
            }

            return RequisitionList;
        }

        [HttpGet("GetWardInventoryReturnList/{FromDate}/{ToDate}/{SubStoreId}")]
        public IActionResult GetSubstoreAssetReturnList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int SubStoreId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var wradInventoryReturnList = (from wardReturn in wardDbContext.WardReturn
                                               join mstStore in wardDbContext.StoreModel on wardReturn.TargetStoreId equals mstStore.StoreId
                                               join emp in wardDbContext.Employees on wardReturn.CreatedBy equals emp.EmployeeId
                                               where (wardReturn.ReturnDate >= FromDate && wardReturn.ReturnDate < RealToDate) && wardReturn.SourceStoreId == SubStoreId
                                               select new
                                               {
                                                   ReturnId = wardReturn.ReturnId,
                                                   StoreName = mstStore.Name,
                                                   ReturnDate = wardReturn.ReturnDate,
                                                   EmpFullName = emp.FullName,
                                                   Remarks = wardReturn.Remarks,
                                                   StoreId = wardReturn.TargetStoreId
                                               }).ToList();
                responseData.Status = "OK";
                responseData.Results = wradInventoryReturnList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }

        [HttpGet("GetWardInventoryReturnItemsByReturnId/{ReturnId}")]
        public IActionResult GetSubstoreAssetReturnItemsById([FromRoute] int ReturnId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {

                var retunDetails = (from wardReturn in wardDbContext.WardReturn
                                    join targetstore in wardDbContext.StoreModel on wardReturn.TargetStoreId equals targetstore.StoreId
                                    join sourcestore in wardDbContext.StoreModel on wardReturn.SourceStoreId equals sourcestore.StoreId
                                    join emp in wardDbContext.Employees on wardReturn.CreatedBy equals emp.EmployeeId
                                    where wardReturn.ReturnId == ReturnId
                                    select new
                                    {
                                        ReturnId = ReturnId,
                                        TargetStoreName = targetstore.Name,
                                        SourceStoreName = sourcestore.Name,
                                        ReturnDate = wardReturn.ReturnDate,
                                        Remarks = wardReturn.Remarks,
                                        EmpFullName = emp.FullName
                                    }).FirstOrDefault();

                var returnDetailItems = (from wardReturnItem in wardDbContext.WardReturnItems
                                         join mstItm in wardDbContext.INVItemMaster on wardReturnItem.ItemId equals mstItm.ItemId
                                         join mstItemCategory in wardDbContext.INVItemCategoryMaster on mstItm.ItemCategoryId equals mstItemCategory.ItemCategoryId
                                         join mapretitmfixedasset in wardDbContext.MAP_ReturnItems_FixedAssets on wardReturnItem.ReturnItemId equals mapretitmfixedasset.ReturnItemId
                                         into mapJ
                                         from mapLJ in mapJ.DefaultIfEmpty()
                                         join fixedAsset in wardDbContext.FixedAssetStock on mapLJ.FixedAssetStockId equals fixedAsset.FixedAssetStockId
                                         into fixedAssetJ
                                         from fixedAssetLJ in fixedAssetJ.DefaultIfEmpty()
                                         where wardReturnItem.ReturnId == ReturnId
                                         group new { wardReturnItem, fixedAssetLJ } by new
                                         {
                                             wardReturnItem.ReturnItemId,
                                             wardReturnItem.ReturnId,
                                             mstItm.ItemName,
                                             mstItm.Description,
                                             mstItemCategory.ItemCategoryName,
                                             wardReturnItem.BatchNo,
                                             wardReturnItem.ExpiryDate,
                                             wardReturnItem.ReturnQuantity,
                                             wardReturnItem.Remark,
                                             mstItm.Code
                                         } into grouped
                                         select new
                                         {
                                             ReturnId = grouped.Key.ReturnId,
                                             ItemName = grouped.Key.ItemName,
                                             Description = grouped.Key.Description,
                                             ItemCode = grouped.Key.Code,
                                             ItemCategoryName = grouped.Key.ItemCategoryName,
                                             ReturnQuantity = grouped.Key.ReturnQuantity,
                                             Remark = grouped.Key.Remark,
                                             BatchNo = grouped.Key.BatchNo,
                                             ExpiryDate = grouped.Key.ExpiryDate,
                                             BarCodeNumber = grouped.Select(x => x.fixedAssetLJ.BarCodeNumber).ToList()
                                         }).ToList();


                var results = new { returnDetail = retunDetails, returnItemDetails = returnDetailItems };
                responseData.Status = "OK";
                responseData.Results = results;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }

        [HttpPost("Consumption")]
        public IActionResult PostConsumption([FromBody] WARDConsumptionModel entity)
        {

            Func<int> func = () =>
            {
                _wardSupplyDbContext.WARDConsumptionModel.Add(entity);
                return _wardSupplyDbContext.SaveChanges();
            };
            return InvokeHttpPostFunction(func);
        }

        [HttpPost("InventoryConsumption")]
        public IActionResult PostInventoryConsumption()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string ipDataStr = this.ReadPostData();
            var consumptionItems = DanpheJSONConvert.DeserializeObject<List<WARDInventoryConsumptionModel>>(ipDataStr);


            Func<object> func = () =>
            {
                using (var transaction = _wardSupplyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var consumption in consumptionItems)
                        {
                            consumption.Quantity = consumption.ConsumeQuantity;
                            consumption.CreatedOn = DateTime.Now;
                            _wardSupplyDbContext.WARDInventoryConsumptionModel.Add(consumption);
                            _wardSupplyDbContext.SaveChanges();
                            WardSupplyBL.UpdateWardStockForConsumption(_wardSupplyDbContext, currentUser, consumption);
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
                return consumptionItems;

            };
            return InvokeHttpPostFunction(func);
        }

        [HttpPost("InternalConsumption")]
        public IActionResult PostInternalConsumption()
        {

            //#region POST: Ward Internal Consumption
            //if (reqType == "post-internal-consumption")
            //{
            //    WARDInternalConsumptionModel wardInternalconsumption = JsonConvert.DeserializeObject<WARDInternalConsumptionModel>(str);
            //    List<WARDStockModel> wardStockList = new List<WARDStockModel>();
            //    WARDStockModel wardStock = new WARDStockModel();
            //    using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            //    {
            //        try
            //        {
            //            wardInternalconsumption.CreatedOn = DateTime.Now;
            //            wardInternalconsumption.CreatedBy = currentUser.EmployeeId;
            //            wardSupplyDbContext.WARDInternalConsumptionModel.Add(wardInternalconsumption);
            //            wardSupplyDbContext.SaveChanges();

            //            wardInternalconsumption.WardInternalConsumptionItemsList.ForEach(consumption =>
            //            {
            //                consumption.ConsumptionId = wardInternalconsumption.ConsumptionId;
            //                consumption.CreatedBy = currentUser.EmployeeId;
            //                consumption.CreatedOn = DateTime.Now;
            //            });
            //            wardSupplyDbContext.WARDInternalConsumptionItemsModel.AddRange(wardInternalconsumption.WardInternalConsumptionItemsList);
            //            wardSupplyDbContext.SaveChanges();

            //            wardInternalconsumption.WardInternalConsumptionItemsList.ForEach(consumptionItem =>
            //            {
            //                var subStoreStockList = wardSupplyDbContext.StoreStock.Include(s => s.StockMaster)
            //                                .Where(s => s.StoreId == wardInternalconsumption.SubStoreId &&
            //                                        s.ItemId == consumptionItem.ItemId &&
            //                                        s.AvailableQuantity > 0 &&
            //                                        s.StockMaster.BatchNo == consumptionItem.BatchNo &&
            //                                        s.StockMaster.ExpiryDate == consumptionItem.ExpiryDate &&
            //                                        s.IsActive == true).ToList();

            //                if (subStoreStockList == null) throw new Exception($"Stock is not available for Item = {consumptionItem.ItemName}, BatchNo ={consumptionItem.BatchNo}");
            //                if (subStoreStockList.Sum(s => s.AvailableQuantity) < consumptionItem.Quantity) throw new Exception($"Stock is not available for Item with BatchNo = {consumptionItem.BatchNo} ,ItemName = {consumptionItem.ItemName},  Available Quantity = {subStoreStockList[0].AvailableQuantity}");

            //                double totalRemainingQty = consumptionItem.Quantity;
            //                foreach (var subStoreStock in subStoreStockList)
            //                {
            //                    var storeStockTxn = new PHRMStockTransactionModel(
            //                        storeStock: subStoreStock,
            //                        transactionType: ENUM_PHRM_StockTransactionType.PHRMSubStoreConsumption,
            //                        transactionDate: wardInternalconsumption.CreatedOn,
            //                        referenceNo: consumptionItem.ConsumptionItemId,
            //                        createdBy: currentUser.EmployeeId,
            //                        createdOn: DateTime.Now,
            //                        fiscalYearId: GetFiscalYear(wardSupplyDbContext)
            //                        );

            //                    if (subStoreStock.AvailableQuantity < totalRemainingQty)
            //                    {
            //                        totalRemainingQty -= subStoreStock.AvailableQuantity;
            //                        storeStockTxn.SetInOutQuantity(inQty: 0, outQty: subStoreStock.AvailableQuantity);
            //                        subStoreStock.UpdateAvailableQuantity(newQty: 0);
            //                    }
            //                    else
            //                    {
            //                        subStoreStock.UpdateAvailableQuantity(newQty: subStoreStock.AvailableQuantity - totalRemainingQty);
            //                        storeStockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
            //                        totalRemainingQty = 0;
            //                    }
            //                    wardSupplyDbContext.PHRMStockTransactions.Add(storeStockTxn);
            //                    wardSupplyDbContext.SaveChanges();

            //                    if (totalRemainingQty == 0)
            //                    {
            //                        break;
            //                    }
            //                }
            //            });

            //            dbContextTransaction.Commit();
            //            responseData.Status = ENUM_DanpheHttpResponseText.OK;
            //            responseData.Results = wardInternalconsumption.ConsumptionId;
            //        }
            //        catch (Exception ex)
            //        {
            //            dbContextTransaction.Rollback();
            //            responseData.Status = ENUM_DanpheHttpResponseText.Failed;
            //            responseData.ErrorMessage = "Falied to update stock details" + ex.ToString();
            //        }
            //    }
            //}
            //#endregion


            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string ipDataStr = this.ReadPostData();
            var wardInternalconsumption = DanpheJSONConvert.DeserializeObject<WARDInternalConsumptionModel>(ipDataStr);


            Func<object> func = () =>
            {
                List<WARDStockModel> wardStockList = new List<WARDStockModel>();
                WARDStockModel wardStock = new WARDStockModel();
                using (var dbContextTransaction = _wardSupplyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        wardInternalconsumption.CreatedOn = DateTime.Now;
                        wardInternalconsumption.CreatedBy = currentUser.EmployeeId;
                        _wardSupplyDbContext.WARDInternalConsumptionModel.Add(wardInternalconsumption);
                        _wardSupplyDbContext.SaveChanges();

                        wardInternalconsumption.WardInternalConsumptionItemsList.ForEach(consumption =>
                        {
                            consumption.ConsumptionId = wardInternalconsumption.ConsumptionId;
                            consumption.CreatedBy = currentUser.EmployeeId;
                            consumption.CreatedOn = DateTime.Now;
                        });
                        _wardSupplyDbContext.WARDInternalConsumptionItemsModel.AddRange(wardInternalconsumption.WardInternalConsumptionItemsList);
                        _wardSupplyDbContext.SaveChanges();

                        wardInternalconsumption.WardInternalConsumptionItemsList.ForEach(consumptionItem =>
                        {
                            var subStoreStockList = _wardSupplyDbContext.StoreStock.Include(s => s.StockMaster)
                                            .Where(s => s.StoreId == wardInternalconsumption.SubStoreId &&
                                                    s.ItemId == consumptionItem.ItemId &&
                                                    s.AvailableQuantity > 0 &&
                                                    s.StockMaster.BatchNo == consumptionItem.BatchNo &&
                                                    s.StockMaster.ExpiryDate == consumptionItem.ExpiryDate &&
                                                    s.IsActive == true).ToList();

                            if (subStoreStockList == null) throw new Exception($"Stock is not available for Item = {consumptionItem.ItemName}, BatchNo ={consumptionItem.BatchNo}");
                            if (subStoreStockList.Sum(s => s.AvailableQuantity) < consumptionItem.Quantity) throw new Exception($"Stock is not available for Item with BatchNo = {consumptionItem.BatchNo} ,ItemName = {consumptionItem.ItemName},  Available Quantity = {subStoreStockList[0].AvailableQuantity}");

                            double totalRemainingQty = consumptionItem.Quantity;
                            foreach (var subStoreStock in subStoreStockList)
                            {
                                var storeStockTxn = new PHRMStockTransactionModel(
                                    storeStock: subStoreStock,
                                    transactionType: ENUM_PHRM_StockTransactionType.PHRMSubStoreConsumption,
                                    transactionDate: wardInternalconsumption.CreatedOn,
                                    referenceNo: consumptionItem.ConsumptionItemId,
                                    createdBy: currentUser.EmployeeId,
                                    createdOn: DateTime.Now,
                                    fiscalYearId: GetFiscalYear(_wardSupplyDbContext)
                                    );

                                if (subStoreStock.AvailableQuantity < totalRemainingQty)
                                {
                                    totalRemainingQty -= subStoreStock.AvailableQuantity;
                                    storeStockTxn.SetInOutQuantity(inQty: 0, outQty: subStoreStock.AvailableQuantity);
                                    subStoreStock.UpdateAvailableQuantity(newQty: 0);
                                }
                                else
                                {
                                    subStoreStock.UpdateAvailableQuantity(newQty: subStoreStock.AvailableQuantity - totalRemainingQty);
                                    storeStockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                                    totalRemainingQty = 0;
                                }
                                _wardSupplyDbContext.PHRMStockTransactions.Add(storeStockTxn);
                                _wardSupplyDbContext.SaveChanges();

                                if (totalRemainingQty == 0)
                                {
                                    break;
                                }
                            }
                        });

                        dbContextTransaction.Commit();
                        return wardInternalconsumption.ConsumptionId;
                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw;
                    }
                }

            };
            return InvokeHttpPostFunction(func);
        }

        [HttpPost("TransferInventoryStock")]
        public IActionResult PostTransferInventoryStock()
        {
            //#region POST : update stock transaction, Post to Stock table and post to Transaction table                 
            //        else if (reqType == "transfer-inventory-stock")
            //{
            //    WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
            //    if (stockManageData != null)
            //    {
            //        Boolean flag = false;


            //        flag = WardSupplyBL.StockInventoryTransfer(stockManageData, wardSupplyDbContext, currentUser);
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


            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string str = this.ReadPostData();
            WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);

            Func<object> func = () =>
            {
                if (stockManageData == null) throw new InvalidOperationException("Invalid data.");
                return WardSupplyBL.StockInventoryTransfer(stockManageData, _wardSupplyDbContext, currentUser);
            };

            return InvokeHttpPostFunction(func);
        }

        [HttpPost("TransferBackToInventory")]
        public IActionResult PostTransferBackToInventory()
        {
            //#region POST : delete from stock table in wardsupply. add stock in inventory and update in stock transaction
            //if (reqType == "transfer-back-to-inventory")
            //{
            //    WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
            //    if (stockManageData != null)
            //    {
            //        Boolean flag = false;


            //        flag = WardSupplyBL.BackToInventoryTransfer(stockManageData, wardSupplyDbContext, currentUser);
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
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string str = this.ReadPostData();
            WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);

            Func<object> func = () =>
            {
                if (stockManageData == null) throw new InvalidOperationException("Invalid data.");
                return WardSupplyBL.BackToInventoryTransfer(stockManageData, _wardSupplyDbContext, currentUser);
            };

            return InvokeHttpPostFunction(func);

        }

        [HttpPost("BreakageStock")]
        public IActionResult PostBreakageStock()
        {
            //#region POST : update stock tranaction, Post to Stock table and Transaction Table
            //        else if (reqType == "breakage-stock")
            //{
            //    WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);
            //    if (stockManageData != null)
            //    {
            //        Boolean flag = false;

            //        flag = WardSupplyBL.StockBreakage(stockManageData, wardSupplyDbContext, currentUser);
            //        if (flag)
            //        {
            //            responseData.Status = "OK";
            //            responseData.Results = 1;
            //        }
            //        else
            //        {
            //            responseData.ErrorMessage = "Breakage item is null or failed to save";
            //            responseData.Status = "Failed";
            //        }
            //    }
            //}
            //#endregion
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string str = this.ReadPostData();
            WARDStockModel stockManageData = DanpheJSONConvert.DeserializeObject<WARDStockModel>(str);

            Func<object> func = () =>
            {
                if (stockManageData == null) throw new InvalidOperationException("Invalid data.");
                return WardSupplyBL.StockBreakage(stockManageData, _wardSupplyDbContext, currentUser);
            };

            return InvokeHttpPostFunction(func);

        }


        [HttpPost("PostInvPatientConsumption")]
        public IActionResult PostInvPatientConsumption()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                string str = this.ReadPostData();

                InvPatientConsumptionReceiptModel patConsumptionReceipt = JsonConvert.DeserializeObject<InvPatientConsumptionReceiptModel>(str);
                using (var transaction = wardSupplyDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        //DefaultIfEmpty(0)
                        int maxReceiptNo = wardSupplyDbContext.PatientConsumptionReceipt.Select(a => a.ConsumptionReceiptNo).DefaultIfEmpty(0).Max();
                        patConsumptionReceipt.ConsumptionReceiptNo = maxReceiptNo > 0 ? maxReceiptNo + 1 : 1;

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

        [HttpPost("ReturnStockToPharmacy/{ReceivedBy}")]
        public IActionResult ReturnStockToPharmacy(String ReceivedBy, [FromBody] List<WARDStockModel> data)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
                List<WARDStockModel> stockManageData = data;
                if (stockManageData != null)
                {
                    Boolean flag = false;

                    flag = WardSupplyBL.StockTransferToPharmacy(stockManageData, wardSupplyDbContext, phrmdbcontext, currentUser, ReceivedBy);
                    if (flag)
                    {
                        responseData.Status = ENUM_DanpheHttpResponseText.OK;
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "Failed to save. Check the items.";
                        responseData.Status = ENUM_DanpheHttpResponseText.Failed;
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
        [HttpPost("TransferStock/{ReceivedBy}")]
        public IActionResult TransferStock(String ReceivedBy, [FromBody] WARDStockModel data)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
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

        [HttpPost("WardInventoryReturn")]
        public string WardInventoryReturn()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string Str = this.ReadPostData();
            //WARDInventoryReturnModel ReturnFromClient = DanpheJSONConvert.DeserializeObject<WARDInventoryReturnModel>(Str);
            WARDInventoryReturnModel ReturnFromClient = DanpheJSONConvert.DeserializeObject<WARDInventoryReturnModel>(Str);
            var currentDateTime = DateTime.Now;
            var currentFiscalYearId = wardSupplyDbContext.InvFiscalYears.Where(f => f.StartDate <= currentDateTime && f.EndDate >= currentDateTime).Select(fy => fy.FiscalYearId).FirstOrDefault();

            using (var dbContextTransaction = wardSupplyDbContext.Database.BeginTransaction())
            {
                try
                {
                    // find the fixed assets stock to be returned
                    ReturnToInventory(wardSupplyDbContext, currentUser, ReturnFromClient, currentDateTime, currentFiscalYearId);

                    dbContextTransaction.Commit();
                    responseData.Status = "OK";
                    responseData.Results = ReturnFromClient;

                }
                catch (Exception ex)
                {

                    responseData.Status = "Failed";
                    responseData.ErrorMessage = ex.ToString();
                    dbContextTransaction.Rollback();

                }

            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        private static void ReturnToInventory(WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser, WARDInventoryReturnModel ReturnFromClient, DateTime currentDateTime, int currentFiscalYearId)
        {
            var fixedAssetStockIds = ReturnFromClient.ReturnItemsList.Where(a => a.IsFixedAsset)
                                                         .SelectMany
                                                         (
                                                             a => a.ReturnAssets.Select(b => b.FixedAssetStockId)
                                                         ).AsEnumerable();
            var fixedAssets = wardSupplyDbContext.FixedAssetStock
                                        .Include(a => a.AssetMovements)
                                        .Where(a => fixedAssetStockIds.Contains(a.FixedAssetStockId))
                                        .ToList();
            var returnModel = new WARDInventoryReturnModel
            {
                TargetStoreId = ReturnFromClient.TargetStoreId,
                SourceStoreId = ReturnFromClient.SourceStoreId,
                Remarks = ReturnFromClient.Remarks,
                ReturnDate = ReturnFromClient.ReturnDate == null ? DateTime.Now : ReturnFromClient.ReturnDate,
                CreatedBy = currentUser.EmployeeId,
                CreatedOn = currentDateTime

            };

            foreach (var item in ReturnFromClient.ReturnItemsList)
            {
                if (item.IsFixedAsset)
                {
                    item.ReturnAssets.ForEach(returningAsset =>
                    {
                        returningAsset.Asset = fixedAssets.FirstOrDefault(a => a.FixedAssetStockId == returningAsset.FixedAssetStockId);
                        returningAsset.Asset.Return(returnModel.TargetStoreId, currentUser.EmployeeId, currentDateTime);
                    });
                }

                item.CreatedOn = currentDateTime;
                item.CreatedBy = currentUser.EmployeeId;
                returnModel.ReturnItemsList.Add(item);
            }
            wardSupplyDbContext.WardReturn.Add(returnModel);
            wardSupplyDbContext.SaveChanges();

            PerformStockManipulation(wardSupplyDbContext, currentUser, ReturnFromClient, currentDateTime, currentFiscalYearId);
        }

        private static void PerformStockManipulation(WardSupplyDbContext wardSupplyDbContext, RbacUser currentUser, WARDInventoryReturnModel ReturnFromClient, DateTime currentDateTime, int currentFiscalYearId)
        {
            foreach (var item in ReturnFromClient.ReturnItemsList)
            {


                //Find the stock to be decreased for each returned item 
                var currentSubstoreStockList = wardSupplyDbContext.StoreStocks.Include(a => a.StockMaster).Where(s => s.ItemId == item.ItemId && s.StoreId == ReturnFromClient.SourceStoreId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == item.BatchNo && s.StockMaster.ExpiryDate == item.ExpiryDate && s.IsActive).ToList();
                // If no stock found, stop the process
                if (currentSubstoreStockList == null) throw new InvalidOperationException($"Stock is not available for ItemId = {item.ItemId}, BatchNo ={item.BatchNo}");
                // If total available quantity is less than the required/ returned quantity, then stop the process
                if (currentSubstoreStockList.Sum(s => s.AvailableQuantity) < item.ReturnQuantity) throw new InvalidOperationException($"Stock is not available for ItemId = {item.ItemId}, BatchNo ={item.BatchNo}");

                var totalReturningQty = item.ReturnQuantity;

                foreach (var subStoreStock in currentSubstoreStockList)
                {
                    //Find stock in Main Stocks
                    var mainStoreStock = wardSupplyDbContext.StoreStocks.Include(s => s.StockMaster).FirstOrDefault(s => s.StockId == subStoreStock.StockId && s.StoreId == ReturnFromClient.TargetStoreId);

                    if (subStoreStock.AvailableQuantity < totalReturningQty)
                    {
                        totalReturningQty -= subStoreStock.AvailableQuantity;

                        //Decrease Stock From Current Sub Store
                        subStoreStock.DecreaseStock(
                                quantity: subStoreStock.AvailableQuantity,
                                transactionType: ENUM_INV_StockTransactionType.ReturnedItem,
                                transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                                currentDate: currentDateTime,
                                referenceNo: item.ReturnItemId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscalYearId,
                                needConfirmation: true
                            );
                        if (mainStoreStock == null)
                        {
                            mainStoreStock = new StoreStockModel(
                                stockMaster: subStoreStock.StockMaster,
                                storeId: ReturnFromClient.TargetStoreId,
                                quantity: subStoreStock.AvailableQuantity,
                                transactionType: ENUM_INV_StockTransactionType.ReturnedItemReceivingSide,
                                transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                                currentDate: currentDateTime,
                                referenceNo: item.ReturnItemId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscalYearId,
                                needConfirmation: true
                                );
                        }
                        else
                        {
                            //Increase Stock TO Main Store
                            mainStoreStock.AddStock(
                                quantity: subStoreStock.AvailableQuantity,
                                transactionType: ENUM_INV_StockTransactionType.ReturnedItemReceivingSide,
                                transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                                currentDate: currentDateTime,
                                referenceNo: item.ReturnItemId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscalYearId,
                                needConfirmation: true
                                );
                        }
                        wardSupplyDbContext.SaveChanges();
                    }
                    else
                    {
                        subStoreStock.DecreaseStock(
                               quantity: totalReturningQty,
                               transactionType: ENUM_INV_StockTransactionType.ReturnedItem,
                               transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                               currentDate: currentDateTime,
                               referenceNo: item.ReturnItemId,
                               createdBy: currentUser.EmployeeId,
                               fiscalYearId: currentFiscalYearId
                           );
                        //Increase Stock TO Main Store

                        if (mainStoreStock == null)
                        {
                            mainStoreStock = new StoreStockModel(
                                stockMaster: subStoreStock.StockMaster,
                                storeId: ReturnFromClient.TargetStoreId,
                                quantity: totalReturningQty,
                                transactionType: ENUM_INV_StockTransactionType.ReturnedItemReceivingSide,
                                transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                                currentDate: currentDateTime,
                                referenceNo: item.ReturnItemId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscalYearId,
                                needConfirmation: true
                                );
                        }
                        else
                        {
                            //Increase Stock TO Main Store
                            mainStoreStock.AddStock(
                                quantity: totalReturningQty,
                                transactionType: ENUM_INV_StockTransactionType.ReturnedItemReceivingSide,
                                transactionDate: ReturnFromClient.ReturnDate ?? currentDateTime,
                                currentDate: currentDateTime,
                                referenceNo: item.ReturnItemId,
                                createdBy: currentUser.EmployeeId,
                                fiscalYearId: currentFiscalYearId,
                                needConfirmation: true
                                );
                        }
                        totalReturningQty = 0;
                    }
                    wardSupplyDbContext.SaveChanges();
                    if (totalReturningQty == 0)
                        break;
                }
            }
        }

        [HttpPut]
        [Route("UpdateDispatchedItemsReceiveStatus/{DispatchId}")]
        public async Task<IActionResult> UpdateDispatchedItemsReceiveStatus([FromRoute] int DispatchId, [FromBody] string ReceivedRemarks)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => WardSupplyBL.ReceiveDispatchedStocks(DispatchId, _inventoryDbContext, currentUser, ReceivedRemarks);
            return InvokeHttpPostFunction(func);
        }

        [HttpPut("InternalConsumption")]
        public IActionResult PutInternalConsumption()
        {
            string str = this.ReadPostData();
            List<WARDInternalConsumptionItemsModel> wardInternalconsumptionItems = JsonConvert.DeserializeObject<List<WARDInternalConsumptionItemsModel>>(str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
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
                        consmption.Subtotal = consmption.Quantity * consmption.SalePrice;
                        wardSupplyDbContext.WARDInternalConsumptionItemsModel.Attach(consmption);
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedBy).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedOn).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Subtotal).IsModified = true;

                        //updating invoice in PHRM_TXN_Invoice
                        //invoice.Quantity = consmption.Quantity;
                        //invoice.SubTotal = Convert.ToDecimal(invoice.Quantity) * invoice.SalePrice;
                        //invoice.TotalAmount = invoice.SubTotal - Convert.ToDecimal(invoice.DiscountPercentage / 100);
                        //wardSupplyDbContext.PHRMInvoiceTransactionItems.Attach(invoice);
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.Quantity).IsModified = true;
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.SubTotal).IsModified = true;
                        //wardSupplyDbContext.Entry(invoice).Property(a => a.TotalAmount).IsModified = true;
                        //wardSupplyDbContext.SaveChanges();
                        //updating record in list for updating stock available quantity
                        wardStock = wardSupplyDbContext.WARDStockModel.Where(a => a.ItemId == consmption.ItemId && a.BatchNo == consmption.BatchNo && a.ExpiryDate == consmption.ExpiryDate && a.SalePrice == consmption.SalePrice && a.StoreId == consmption.SubStoreId).FirstOrDefault();
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

        [HttpPut("UpdateRequisition")]
        public IActionResult UpdateRequisition([FromBody] InventoryRequisition_DTO requisitionDTO)
        {
            RequisitionModel requisition = JsonConvert.DeserializeObject<RequisitionModel>(DanpheJSONConvert.SerializeObject(requisitionDTO));
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
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
                    requisition.VerifierIds = SerializeVerifiers(requisitionDTO.VerifierList);

                    //update each item and add the new item against that requisition in INV_TXN_RequisitionItems table.
                    requisition.RequisitionItems.ForEach(item =>
                    {
                        if (item.RequisitionItemId > 0) //old elememnt will have the requisitionItemId
                        {
                            //for updating old element
                            item.ModifiedBy = currentUser.EmployeeId;
                            item.ModifiedOn = DateTime.Now;
                            item.PendingQuantity = item.Quantity - item.ReceivedQuantity;

                            //If the requisition is widthdrawn then PendingQuantity should be 0;
                            if (item.RequisitionItemStatus == "withdrawn")
                            {
                                item.PendingQuantity = 0;
                            }

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
                            dbContext.Entry(item).Property(a => a.PendingQuantity).IsModified = true;
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
                    dbContext.Entry(requisition).Property(a => a.VerifierIds).IsModified = true;
                    dbContext.Entry(requisition).Property(a => a.Remarks).IsModified = true;
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

        private static string SerializeVerifiers(List<Verifier_DTO> verifiers)
        {
            var VerifierList = new List<object>();
            verifiers.ForEach(verifier =>
            {
                VerifierList.Add(new { Id = verifier.Id, Type = verifier.Type });
            });
            return DanpheJSONConvert.SerializeObject(VerifierList).Replace(" ", String.Empty);
        }

        [HttpPut("PatientConsumption")]
        public IActionResult PutPatientConsumption()
        {
            string str = this.ReadPostData();
            List<WARDConsumptionModel> consumptionList = JsonConvert.DeserializeObject<List<WARDConsumptionModel>>(str);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
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
                        consmption.SubTotal = consmption.Quantity * consmption.SalePrice;
                        wardSupplyDbContext.WARDConsumptionModel.Attach(consmption);
                        wardSupplyDbContext.Entry(consmption).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.SubTotal).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedBy).IsModified = true;
                        wardSupplyDbContext.Entry(consmption).Property(a => a.ModifiedOn).IsModified = true;
                        wardSupplyDbContext.SaveChanges();

                        //updating invoice in PHRM_TXN_Invoice
                        invoice.Quantity = consmption.Quantity;
                        invoice.SubTotal = Convert.ToDecimal(invoice.Quantity) * invoice.SalePrice;
                        invoice.TotalAmount = invoice.SubTotal - Convert.ToDecimal(invoice.DiscountPercentage / 100);
                        wardSupplyDbContext.PHRMInvoiceTransactionItems.Attach(invoice);
                        wardSupplyDbContext.Entry(invoice).Property(a => a.Quantity).IsModified = true;
                        wardSupplyDbContext.Entry(invoice).Property(a => a.SubTotal).IsModified = true;
                        wardSupplyDbContext.Entry(invoice).Property(a => a.TotalAmount).IsModified = true;
                        wardSupplyDbContext.SaveChanges();
                        //updating record in list for updating stock available quantity
                        wardStock = wardSupplyDbContext.WARDStockModel.Where(a => a.ItemId == consmption.ItemId && a.BatchNo == consmption.BatchNo && a.ExpiryDate == consmption.ExpiryDate && a.SalePrice == (double)consmption.SalePrice && a.StoreId == consmption.StoreId).FirstOrDefault();
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

        [HttpPost("UpdateReconciledStockFromExcelFile")]
        public IActionResult UpdateReconciledStockFromExcelFile()
        {
            string Str = this.ReadPostData();
            List<SubstoreStockViewModel> stock = DanpheJSONConvert.DeserializeObject<List<SubstoreStockViewModel>>(Str);
            var responseData = new DanpheHTTPResponse<object>();
            var wardSupplyDbContext = new WardSupplyDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            try
            {
                WardSupplyBL.UpdateReconciledStockFromExcel(stock, currentUser, wardSupplyDbContext);
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

        [HttpGet("ExportStocksForReconciliationToExcel")]
        public IActionResult ExportStocksForReconciliationToExcel(int StoreId)
        {
            try
            {
                var wardSupplyDbContext = new WardSupplyDbContext(connString);
                var inTxns = new string[] { Enums.ENUM_INV_StockTransactionType.PurchaseItem, Enums.ENUM_INV_StockTransactionType.OpeningItem };
                var totalStock = (from wardstock in wardSupplyDbContext.StoreStocks.Include(s => s.StockMaster)
                                  let firstInTxn = wardSupplyDbContext.StockTransactions.FirstOrDefault(a => a.StockId == wardstock.StockId && a.InQty > 0 && inTxns.Contains(a.TransactionType))
                                  join item in wardSupplyDbContext.INVItemMaster on wardstock.ItemId equals item.ItemId
                                  join uom in wardSupplyDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals uom.UOMId
                                  join mainStore in wardSupplyDbContext.StoreModel on firstInTxn.StoreId equals mainStore.StoreId
                                  where wardstock.StoreId == StoreId && wardstock.AvailableQuantity > 0
                                  group new { wardstock, item, uom } by new { item.ItemId, item.ItemName, item.ItemType, mainStore.StoreId, mainStore.Name } into t
                                  select new SubstoreStockViewModel
                                  {
                                      ItemId = t.Key.ItemId,
                                      StockId = t.Select(a => a.wardstock.StockId).FirstOrDefault(),
                                      ItemName = t.Key.ItemName.Trim(),
                                      MinimumQuantity = t.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                                      ExpiryDate = t.Select(a => a.wardstock.StockMaster.ExpiryDate).FirstOrDefault(),
                                      Code = t.Select(a => a.item.Code).FirstOrDefault(),
                                      UOMName = t.Select(a => a.uom.UOMName).FirstOrDefault(),
                                      IsColdStorageApplicable = t.Select(a => a.item.IsColdStorageApplicable).FirstOrDefault(),
                                      MRP = t.Select(a => a.wardstock.StockMaster.MRP).FirstOrDefault(),
                                      BatchNo = t.Select(a => a.wardstock.StockMaster.BatchNo).FirstOrDefault(),
                                      ItemType = t.Key.ItemType,
                                      StoreId = t.Key.StoreId,
                                      StoreName = t.Key.Name,
                                      SubStoreId = t.Select(a => a.wardstock.StoreId).FirstOrDefault(),
                                      ItemRate = t.Select(s => s.wardstock.StockMaster.CostPrice).FirstOrDefault(),
                                      AvailableQuantity = t.Sum(a => a.wardstock.AvailableQuantity),
                                      NewAvailableQuantity = t.Sum(a => a.wardstock.AvailableQuantity)
                                  }).OrderBy(a => a.ItemName).ToList();

                string tempFIleName = "SubstoreStockReconciliation_" + DateTime.Now.ToString("yyyy-MM-dd h:mm tt");
                string tempFIleName1 = tempFIleName.Replace(" ", "-");
                string fileName = tempFIleName1.Replace(":", "-");

                #region Converting list into datatable
                DataTable dataTable = new DataTable(typeof(SubstoreStockViewModel).Name);
                //Get all the properties
                PropertyInfo[] Props = typeof(SubstoreStockViewModel).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                foreach (PropertyInfo prop in Props)
                {
                    //Setting column names as Property names
                    dataTable.Columns.Add(prop.Name);
                }
                foreach (SubstoreStockViewModel stock in totalStock)
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
                #endregion

                byte[] fileByteArray;

                #region Save Excel File with the protection
                using (ExcelEngine engine = new ExcelEngine())
                {
                    IApplication application = engine.Excel;
                    application.DefaultVersion = ExcelVersion.Xlsx;

                    IWorkbook workbook = application.Workbooks.Create(1);
                    IWorksheet sheet = workbook.Worksheets[0];

                    sheet.ImportDataTable(dt, true, 1, 1, true);

                    IListObject listObj = sheet.ListObjects.Create("SubstoreStockList", sheet.UsedRange);
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
                #endregion

                return File(fileByteArray, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName + ".xlsx");

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("GetPharmacyItemToRequest")]
        public IActionResult GetItemsForRequisition()
        {
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            var mainStoreId = phrmdbcontext.PHRMStore.Where(a => a.Category == ENUM_StoreCategory.Store && a.SubCategory == ENUM_StoreSubCategory.Pharmacy).Select(a => a.StoreId).FirstOrDefault();
            var ItemList = (from I in phrmdbcontext.PHRMItemMaster
                            join U in phrmdbcontext.PHRMUnitOfMeasurement on I.UOMId equals U.UOMId
                            join G in phrmdbcontext.PHRMGenericModel on I.GenericId equals G.GenericId
                            join Stk in phrmdbcontext.StoreStocks on I.ItemId equals Stk.ItemId
                            where Stk.IsActive == true && Stk.StoreId == mainStoreId
                            group new { I, U, G, Stk } by new { I.ItemId, I.ItemName, I.ItemCode, G.GenericName, U.UOMName } into IGrouped
                            select new
                            {
                                ItemId = IGrouped.Key.ItemId,
                                ItemName = IGrouped.Key.ItemName,
                                ItemCode = IGrouped.Key.ItemCode,
                                GenericName = IGrouped.Key.GenericName ?? "N/A",
                                UOMName = IGrouped.Key.UOMName ?? "N/A",
                                AvailableQuantity = (IGrouped.FirstOrDefault().Stk != null) ? IGrouped.Sum(a => a.Stk.AvailableQuantity) : 0,
                                IsActive = IGrouped.Select(a => a.I.IsActive).FirstOrDefault()

                            }).ToList();
            responseData.Status = ENUM_DanpheHttpResponseText.OK;
            responseData.Results = ItemList;
            return Ok(responseData);
        }
        [HttpGet("GetItemSubCategory")]
        public IActionResult GetItemSubCategory()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext dbContext = new WardSupplyDbContext(connString);
            var itemSubCategorylist = (from v in dbContext.ItemSubCategory
                                       select v).ToList();
            responseData.Status = ENUM_DanpheHttpResponseText.OK;
            responseData.Results = itemSubCategorylist;
            return Ok(responseData);
        }

        [HttpPost("PostPhrmSubStoreRequisition")]
        public IActionResult Post([FromBody] PharmacySubStoreRequisition_DTO requisitionDTO)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (requisitionDTO != null)
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    requisitionDTO.CreatedBy = currentUser.EmployeeId;
                    PHRMStoreRequisitionModel requisition = DanpheJSONConvert.DeserializeObject<PHRMStoreRequisitionModel>(DanpheJSONConvert.SerializeObject(requisitionDTO));
                    requisition.VerifierIds = SerializeVerifiers(requisitionDTO.VerifierList);
                    var dispensaryResponse = WardSupplyBL.PostPhrmSubStoreRequisition(requisition, wardSupplyDbContext);
                    responseData.Results = dispensaryResponse;
                    responseData.Status = ENUM_DanpheHttpResponseText.OK;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        public static int GetFiscalYear(WardSupplyDbContext wardSupplyDbContext)
        {
            return wardSupplyDbContext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= DateTime.Now && fsc.EndDate >= DateTime.Now).Select(f => f.FiscalYearId).FirstOrDefault();
        }

        [HttpGet]
        [Route("GetDispatchedItemToReceive")]
        public IActionResult DispatchItemToReceive(int requisitionId)
        {
            Func<RequisitionDispatchToReceive_DTO> func = () => GetDispatchItemToReceive(requisitionId);
            return InvokeHttpGetFunction(func);
        }

        private RequisitionDispatchToReceive_DTO GetDispatchItemToReceive(int RequisitionId)
        {
            var requisitionDetail = (from R in _wardSupplyDbContext.PHRMSubStoreRequisitions
                                     where R.RequisitionId == RequisitionId
                                     select new RequisitionDetail_DTO
                                     {
                                         RequisitionNo = R.RequisitionNo,
                                         RequisitionDate = R.RequisitionDate,
                                         RequisitionStatus = R.RequisitionStatus
                                     }).FirstOrDefault();

            var dispatchDetail = (from disitm in _wardSupplyDbContext.PHRMSubStoreDispatchItems
                                  join reqitem in _wardSupplyDbContext.PHRMSubStoreRequisitionItems on disitm.RequisitionItemId equals reqitem.RequisitionItemId
                                  join itm in _wardSupplyDbContext.PHRMItemMaster on disitm.ItemId equals itm.ItemId
                                  join gen in _wardSupplyDbContext.PHRMGenericMaster on itm.GenericId equals gen.GenericId
                                  join emp in _wardSupplyDbContext.Employees on disitm.ReceivedById equals emp.EmployeeId into empGroup
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
                                          RackNo = (from itemrack in _wardSupplyDbContext.PHRMRackItem.Where(ri => ri.ItemId == item.itm.ItemId && ri.StoreId == item.disitm.TargetStoreId)
                                                    join rack in _wardSupplyDbContext.PHRMRack on itemrack.RackId equals rack.RackId
                                                    select rack.RackNo).FirstOrDefault()
                                      }).ToList()
                                  }).OrderBy(a => a.DispatchId).ToList();
            return new RequisitionDispatchToReceive_DTO()
            {
                Requisition = requisitionDetail,
                Dispatch = dispatchDetail
            };
        }

        [HttpGet("GetPHRMSubStoreAvailableStockByStoreId/{StoreId}")]
        public IActionResult GetWardAvailableStock(int StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            var totalStock = (from wardstock in wardSupplyDbContext.StoreStock.Include(s => s.StockMaster)
                              join item in wardSupplyDbContext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                              join generic in wardSupplyDbContext.PHRMGenericMaster on item.GenericId equals generic.GenericId
                              where wardstock.StoreId == StoreId
                              group new { wardstock, item, generic } by new { wardstock.ItemId, wardstock.StockId, wardstock.StockMaster.BatchNo, wardstock.StockMaster.SalePrice, wardstock.StockMaster.ExpiryDate } into x
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
                                  SalePrice = Math.Round(x.Key.SalePrice, 2),
                                  //StockType = x.Select(a => a.wardstock.StockType).FirstOrDefault()
                              }).ToList();

            responseData.Status = (totalStock == null) ? ENUM_DanpheHttpResponseText.Failed : ENUM_DanpheHttpResponseText.OK;
            responseData.Results = totalStock;
            return Ok(responseData);
        }


        [HttpGet]
        [Route("Verifiers")]
        public IActionResult GetVerifiers()
        {
            Func<object> func = () => WardSupplyBL.GetVerifiers(_rbacDbContext);
            return InvokeHttpGetFunction(func);
        }

    }
}
