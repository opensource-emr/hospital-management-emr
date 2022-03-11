using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel; //swapnil-2-april-2021
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ViewModel.FixedAsset; //swapnil-2-april-2021
namespace DanpheEMR.Controllers
{
    public class WardSupplyAssetsController : CommonController
    {
        bool realTimeRemoteSyncEnabled = false;
        public WardSupplyAssetsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }
        [HttpGet("~/api/WardSupplyAssets/GetFixedAssetStockBySubStoreId/{SubStoreId}")]
        public IActionResult GetFixedAssetStockBySubStoreId([FromRoute] int SubStoreId)
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var totalStock = (from fixedAssetStock in wardSupplyDbContext.FixedAssetStock
                              join gritem in wardSupplyDbContext.GoodsReceiptItems on fixedAssetStock.GoodsReceiptItemId equals gritem.GoodsReceiptItemId into griJ
                              from griLJ in griJ.DefaultIfEmpty()
                              join grlist in wardSupplyDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals grlist.GoodsReceiptID into grJ
                              from grLJ in grJ.DefaultIfEmpty()
                              join emp in wardSupplyDbContext.Employees on griLJ.CreatedBy equals emp.EmployeeId into empJ
                              from empLJ in empJ.DefaultIfEmpty()
                              from dontLj in wardSupplyDbContext.FixedAssetDonation.Where(d => d.DonationId == fixedAssetStock.DonationId).DefaultIfEmpty()
                              join item in wardSupplyDbContext.INVItemMaster on fixedAssetStock.ItemId equals item.ItemId
                              join vend in wardSupplyDbContext.Vendors on grLJ.VendorId equals vend.VendorId into vendJ
                              from vendLJ in vendJ.DefaultIfEmpty()
                              join store in wardSupplyDbContext.StoreModel on fixedAssetStock.StoreId equals store.StoreId
                              join assetHolder in wardSupplyDbContext.Employees on fixedAssetStock.AssetHolderId equals assetHolder.EmployeeId into ahJ
                              from assetHolderLeftJoined in ahJ.DefaultIfEmpty()
                              where fixedAssetStock.SubStoreId == SubStoreId
                              select new
                              {
                                  fixedAssetStock.FixedAssetStockId,
                                  fixedAssetStock.BarCodeNumber,
                                  fixedAssetStock.BatchNo,
                                  fixedAssetStock.WarrantyExpiryDate,
                                  fixedAssetStock.AssetsLocation,
                                  fixedAssetStock.IsBarCodeGenerated,
                                  fixedAssetStock.IsAssetDamaged,
                                  fixedAssetStock.CreatedBy,
                                  item.IsCssdApplicable,
                                  fixedAssetStock.CreatedOn,
                                  fixedAssetStock.ItemId,
                                  fixedAssetStock.IsActive,
                                  fixedAssetStock.ItemRate,
                                  fixedAssetStock.MRP,
                                  fixedAssetStock.DiscountAmount,
                                  fixedAssetStock.DiscountPercent,
                                  fixedAssetStock.VAT,
                                  fixedAssetStock.VATAmount,
                                  fixedAssetStock.CcAmount,
                                  fixedAssetStock.CcCharge,
                                  fixedAssetStock.OtherCharge,
                                  fixedAssetStock.ManufactureDate,
                                  fixedAssetStock.YearOfUse,
                                  fixedAssetStock.TotalLife,
                                  fixedAssetStock.Performance,
                                  fixedAssetStock.BuildingBlockNumber,
                                  fixedAssetStock.Floors,
                                  fixedAssetStock.RoomNumber,
                                  fixedAssetStock.RoomPosition,
                                  fixedAssetStock.SerialNo,
                                  fixedAssetStock.ModelNo,
                                  fixedAssetStock.ExpectedValueAfterUsefulLife,
                                  fixedAssetStock.IsMaintenanceRequired,
                                  fixedAssetStock.IsAssetDamageConfirmed,
                                  fixedAssetStock.IsAssetScraped,
                                  fixedAssetStock.ScrapAmount,
                                  fixedAssetStock.ScrapRemarks,
                                  fixedAssetStock.DonationId,
                                  fixedAssetStock.CssdStatus,
                                  item.ItemName,
                                  ItemCode = item.Code,
                                  VendorName = (vendLJ == null) ? "" : vendLJ.VendorName,
                                  ContactNo = (vendLJ == null) ? "" : vendLJ.ContactNo,
                                  ContactAddress = (vendLJ == null) ? "" : vendLJ.ContactAddress,
                                  Email = (vendLJ == null) ? "" : vendLJ.Email,
                                  VendorId = vendLJ == null ? 0 : vendLJ.VendorId,
                                  Name = vendLJ == null ? "" : vendLJ.Name,
                                  Name2 = vendLJ == null ? "" : vendLJ.Name2,
                                  PhoneNumber = vendLJ == null ? "" : vendLJ.PhoneNumber,
                                  PhoneNumber2 = vendLJ == null ? "" : vendLJ.PhoneNumber2,
                                  CompanyPosition = vendLJ == null ? "" : vendLJ.CompanyPosition,
                                  CompanyPosition2 = vendLJ == null ? "" : vendLJ.CompanyPosition2,
                                  CreatedByName = empLJ == null ? "" : empLJ.FullName,
                                  StoreId = fixedAssetStock.StoreId,
                                  SubStoreId = fixedAssetStock.SubStoreId,
                                  Donation = dontLj.Donation,
                                  AssetHolderId = fixedAssetStock.AssetHolderId,
                                  AssetHolderName = (assetHolderLeftJoined != null) ? assetHolderLeftJoined.FullName : "",
                              }).OrderByDescending(a => a.CreatedOn).ToList();

            responseData.Status = (totalStock == null) ? "Failed" : "OK";
            responseData.Results = totalStock;
            return Ok(responseData);
        }

        [HttpGet("~/api/WardSupplyAssets/GetCapitalGoodsItemList/")]
        public string GetCapitalGoodsItemList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                var ItemList = (from item in inventoryDbContext.Items
                                join subCat in inventoryDbContext.ItemSubCategoryMaster on item.SubCategoryId equals subCat.SubCategoryId
                                join unit in inventoryDbContext.UnitOfMeasurementMaster on item.UnitOfMeasurementId equals unit.UOMId into ps
                                from unit in ps.DefaultIfEmpty()
                                where item.ItemType == "Capital Goods"
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
                                    item.HSNCODE
                                }).ToList();
                responseData.Results = ItemList;
                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetRequistionList/{FromDate}/{ToDate}/{SubStoreId}")]
        public IActionResult GetSubstoreAssetRequistionList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int SubStoreId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var RequisitionList = (from requ in wardDbContext.WARDSupplyAssetRequisitionModels
                                       join store in wardDbContext.StoreModel on requ.StoreId equals store.StoreId
                                       join emp in wardDbContext.Employees on requ.CreatedBy equals emp.EmployeeId
                                       where requ.SubStoreId == SubStoreId & requ.RequisitionDate > FromDate & requ.RequisitionDate < RealToDate
                                       orderby requ.RequisitionId descending
                                       select new
                                       {
                                           RequisitionId = requ.RequisitionId,
                                           RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.RequisitionDate,
                                           RequisitionStatus = requ.RequisitionStatus,
                                           StoreId = requ.StoreId,
                                           StoreName = store.Name,
                                           SubStoreId = requ.SubStoreId,
                                           EmpFullName = emp.FullName
                                       }).ToList();
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetRequistionItemsById/{RequisitionId}")]
        public IActionResult GetSubstoreAssetRequistionItemsById([FromRoute] int RequisitionId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var warReqItems = (from req in wardDbContext.WARDSupplyAssetRequisitionModels
                                   join itmReq in wardDbContext.WARDSupplyAssetRequisitionItemsModels on req.RequisitionId equals itmReq.RequisitionId
                                   join itm in wardDbContext.INVItemMaster on itmReq.ItemId equals itm.ItemId
                                   join emp in wardDbContext.Employees on req.CreatedBy equals emp.EmployeeId
                                   join subStore in wardDbContext.StoreModel on req.SubStoreId equals subStore.StoreId
                                   where req.RequisitionId == RequisitionId
                                   select new
                                   {
                                       RequisitionItemId = itmReq.RequisitionItemId,
                                       RequisitionId = req.RequisitionId,
                                       ItemId = itm.ItemId,
                                       Quantity = itmReq.Quantity,
                                       PendingQuantity = itmReq.PendingQuantity,
                                       ReceivedQuantity = itmReq.ReceivedQuantity,
                                       ItemName = itm.ItemName,
                                       Code = itm.Code,
                                       RequisitionNo = req.RequisitionNo,
                                       RequisitionItemStatus = itmReq.RequisitionItemStatus,
                                       CreatedByName = emp.FullName,
                                       SubstoreName = subStore.Name
                                   }).ToList();
                responseData.Status = "OK";
                responseData.Results = warReqItems;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }


        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetRequistionListByStoreId/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult GetSubstoreAssetRequistionListByStoreId([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int StoreId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var RequisitionList = (from requ in wardDbContext.WARDSupplyAssetRequisitionModels
                                       join store in wardDbContext.StoreModel on requ.StoreId equals store.StoreId
                                       join subStore in wardDbContext.StoreModel on requ.SubStoreId equals subStore.StoreId
                                       join emp in wardDbContext.Employees on requ.CreatedBy equals emp.EmployeeId
                                       where requ.StoreId == StoreId & requ.RequisitionDate > FromDate & requ.RequisitionDate < RealToDate
                                       orderby requ.RequisitionId descending
                                       select new
                                       {
                                           RequisitionId = requ.RequisitionId,
                                           RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.RequisitionDate,
                                           RequisitionStatus = requ.RequisitionStatus,
                                           StoreId = requ.StoreId,
                                           StoreName = store.Name,
                                           SubStoreName = subStore.Name,
                                           SubStoreId = requ.SubStoreId,
                                           EmpFullName = emp.FullName
                                       }).ToList();
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }


        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetReturnList/{FromDate}/{ToDate}/{SubStoreId}")]
        public IActionResult GetSubstoreAssetReturnList([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int SubStoreId)
        {
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var RequisitionList = (from ret in wardDbContext.WARDSupplyAssetReturnModels //swapnil-2-april-2021
                                       join store in wardDbContext.StoreModel on ret.StoreId equals store.StoreId
                                       join emp in wardDbContext.Employees on ret.CreatedBy equals emp.EmployeeId
                                       where ret.SubStoreId == SubStoreId & ret.ReturnDate > FromDate & ret.ReturnDate < RealToDate
                                       orderby ret.ReturnId descending
                                       select new
                                       {
                                           ReturnId = ret.ReturnId,
                                           ReturnDate = ret.ReturnDate,
                                           Remarks = ret.Remarks,
                                           StoreId = ret.StoreId,
                                           StoreName = store.Name,
                                           SubStoreId = ret.SubStoreId,
                                           EmpFullName = emp.FullName
                                       }).ToList();
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        //Avanti-4-april-2021
        [HttpGet("~/api/WardSupplyAssets/dispatchview/{RequisitionId}")]
        public IActionResult dispatchview([FromRoute] int requisitionId, int storeId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var requestDetails = (from dis in wardDbContext.FixedAssetDispatchModels
                                      join Emp in wardDbContext.Employees on dis.RequisitionId equals Emp.EmployeeId
                                      join req in wardDbContext.WARDSupplyAssetRequisitionModels on dis.RequisitionId equals req.RequisitionId
                                      join store in wardDbContext.StoreModel on req.StoreId equals store.StoreId
                                      join subStore in wardDbContext.StoreModel on req.SubStoreId equals subStore.StoreId
                                      where dis.RequisitionId == requisitionId

                                      select new
                                      {
                                          RequisitionId = dis.RequisitionId,
                                          RequisitionNo = req.RequisitionNo,
                                          RequisitionDate = req.RequisitionDate,
                                          StoreId = req.StoreId,
                                          StoreName = store.Name,
                                          SubStoreName = subStore.Name,
                                          SubStoreId = req.SubStoreId,
                                          DispatchId = dis.DispatchId,
                                          Dispatchdate = dis.CreatedOn,
                                          DispatcheBy = Emp.FullName,
                                          ReceivedBy = dis.ReceivedBy,


                                          DispatchItems = (from disitem in wardDbContext.FixedAssetDispatchItemsModels


                                                           select new
                                                           {
                                                               ItemId = disitem.ItemId,
                                                               ItemName = disitem.ItemName,
                                                               RequisitionItemId = disitem.RequisitionItemId,
                                                               BatchNo = disitem.BatchNo,
                                                               BarCodeNumber = disitem.BarCodeNumber,
                                                           })

                                      }).OrderByDescending(p => p.Dispatchdate).ToList();
                responseData.Status = "OK";
                responseData.Results = requestDetails;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }

        [HttpGet("~/api/WardSupplyAssets/dispatchviewbyDispatchId/{DispatchId}")]
        public IActionResult dispatchviewbyDispatchId([FromRoute] int dispatchId, int storeId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var requestDetails = (from dis in wardDbContext.FixedAssetDispatchModels
                                      join disitm in wardDbContext.FixedAssetDispatchItemsModels on dis.DispatchId equals disitm.DispatchId
                                      join Emp in wardDbContext.Employees on dis.RequisitionId equals Emp.EmployeeId
                                      join req in wardDbContext.WARDSupplyAssetRequisitionModels on dis.RequisitionId equals req.RequisitionId
                                      join store in wardDbContext.StoreModel on req.StoreId equals store.StoreId
                                      join subStore in wardDbContext.StoreModel on req.SubStoreId equals subStore.StoreId
                                      where dispatchId == dis.DispatchId
                                      select new
                                      {
                                          RequisitionId = dis.RequisitionId,
                                          RequisitionNo = req.RequisitionNo,
                                          RequisitionDate = req.RequisitionDate,
                                          StoreId = req.StoreId,
                                          StoreName = store.Name,
                                          SubStoreName = subStore.Name,
                                          SubStoreId = req.SubStoreId,
                                          DispatchId = dis.DispatchId,
                                          Dispatchdate = dis.CreatedOn,
                                          DispatcheBy = Emp.FullName,
                                          ReceivedBy = dis.ReceivedBy,


                                          DispatchItems = (from disitem in wardDbContext.FixedAssetDispatchItemsModels
                                                           where dispatchId == disitem.DispatchId

                                                           select new
                                                           {
                                                               ItemId = disitem.ItemId,
                                                               ItemName = disitem.ItemName,
                                                               RequisitionItemId = disitem.RequisitionItemId,
                                                               BatchNo = disitem.BatchNo,
                                                               BarCodeNumber = disitem.BarCodeNumber
                                                           })

                                      }).OrderByDescending(p => p.Dispatchdate).ToList();
                responseData.Status = "OK";
                responseData.Results = requestDetails;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }

        //swapnil-2-april-2021
        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetReturnListByStoreId/{FromDate}/{ToDate}/{StoreId}")]
        public IActionResult GetSubstoreAssetReturnListByStoreId([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate, [FromRoute] int StoreId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            var RealToDate = ToDate.AddDays(1);

            try
            {
                var RequisitionList = (from requ in wardDbContext.WARDSupplyAssetReturnModels
                                       join store in wardDbContext.StoreModel on requ.StoreId equals store.StoreId
                                       join subStore in wardDbContext.StoreModel on requ.SubStoreId equals subStore.StoreId
                                       join emp in wardDbContext.Employees on requ.CreatedBy equals emp.EmployeeId
                                       where requ.StoreId == StoreId & requ.ReturnDate > FromDate & requ.ReturnDate < RealToDate
                                       orderby requ.ReturnId descending
                                       select new
                                       {
                                           ReturnId = requ.ReturnId,
                                           //RequisitionNo = requ.RequisitionNo,
                                           RequisitionDate = requ.ReturnDate,
                                           // RequisitionStatus = requ.ReturnStatus,
                                           StoreId = requ.StoreId,
                                           StoreName = store.Name,
                                           SubStoreName = subStore.Name,
                                           SubStoreId = requ.SubStoreId,
                                           EmpFullName = emp.FullName
                                       }).ToList();
                responseData.Status = "OK";
                responseData.Results = RequisitionList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        //swapnil-2-april-2021
        [HttpGet("~/api/WardSupplyAssets/GetSubstoreAssetReturnById/{ReturnId}")]
        public IActionResult GetSubstoreAssetReturnItemsById([FromRoute] int ReturnId)
        {
            WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                var warReqItems = (from req in wardDbContext.WARDSupplyAssetReturnModels
                                   join itmReq in wardDbContext.WARDSupplyAssetReturnItemsModels on req.ReturnId equals itmReq.ReturnId
                                   join itm in wardDbContext.INVItemMaster on itmReq.ItemId equals itm.ItemId
                                   join fixedAssetStock in wardDbContext.FixedAssetStock on itmReq.FixedAssetStockId equals fixedAssetStock.FixedAssetStockId
                                   join emp in wardDbContext.Employees on req.CreatedBy equals emp.EmployeeId
                                   where req.ReturnId == ReturnId
                                   select new
                                   {
                                       ReturnItemId = itmReq.ReturnItemId,
                                       ReturnId = req.ReturnId,
                                       ItemId = itm.ItemId,
                                       ItemName = itm.ItemName,
                                       BarCodeNumber = fixedAssetStock.BarCodeNumber,
                                       BatchNo = fixedAssetStock.BatchNo,
                                       Department = emp.Department,
                                       SerialNo = itmReq.SerialNo,
                                       Remark = itmReq.Remark,
                                   }).ToList();
                responseData.Status = "OK";
                responseData.Results = warReqItems;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Something went wrong...";
            }
            return Ok(responseData);
        }
        [HttpGet("~/api/WardSupplyAssets/GetFixedAssetStockByStoreId/{StoreId}")]
        public IActionResult GetFixedAssetStockByStoreId([FromRoute] int StoreId)
        {
            WardSupplyDbContext wardSupplyDbContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();



            var totalStock = (from fixedAssetStock in wardSupplyDbContext.FixedAssetStock
                              join gritem in wardSupplyDbContext.GoodsReceiptItems on fixedAssetStock.GoodsReceiptItemId equals gritem.GoodsReceiptItemId into griJ
                              from griLJ in griJ.DefaultIfEmpty()
                              join grlist in wardSupplyDbContext.GoodsReceipts on griLJ.GoodsReceiptId equals grlist.GoodsReceiptID into grJ
                              from grLJ in grJ.DefaultIfEmpty()
                              join emp in wardSupplyDbContext.Employees on griLJ.CreatedBy equals emp.EmployeeId into empJ
                              from empLJ in empJ.DefaultIfEmpty()
                              from dontLj in wardSupplyDbContext.FixedAssetDonation.Where(d => d.DonationId == fixedAssetStock.DonationId).DefaultIfEmpty()
                              join item in wardSupplyDbContext.INVItemMaster on fixedAssetStock.ItemId equals item.ItemId
                              join vend in wardSupplyDbContext.Vendors on grLJ.VendorId equals vend.VendorId into vendJ
                              from vendLJ in vendJ.DefaultIfEmpty()
                              join store in wardSupplyDbContext.StoreModel on fixedAssetStock.StoreId equals store.StoreId
                              join assetHolder in wardSupplyDbContext.Employees on fixedAssetStock.AssetHolderId equals assetHolder.EmployeeId into ahJ
                              from assetHolderLeftJoined in ahJ.DefaultIfEmpty()
                              where fixedAssetStock.StoreId == StoreId & fixedAssetStock.SubStoreId == null
                              select new
                              {
                                  fixedAssetStock.FixedAssetStockId,
                                  fixedAssetStock.BarCodeNumber,
                                  fixedAssetStock.BatchNo,
                                  fixedAssetStock.WarrantyExpiryDate,
                                  fixedAssetStock.AssetsLocation,
                                  fixedAssetStock.IsBarCodeGenerated,
                                  fixedAssetStock.IsAssetDamaged,
                                  fixedAssetStock.CreatedBy,
                                  fixedAssetStock.CreatedOn,
                                  fixedAssetStock.ItemId,
                                  fixedAssetStock.IsActive,
                                  fixedAssetStock.ItemRate,
                                  fixedAssetStock.MRP,
                                  fixedAssetStock.DiscountAmount,
                                  fixedAssetStock.DiscountPercent,
                                  fixedAssetStock.VAT,
                                  fixedAssetStock.VATAmount,
                                  fixedAssetStock.CcAmount,
                                  fixedAssetStock.CcCharge,
                                  fixedAssetStock.OtherCharge,
                                  fixedAssetStock.ManufactureDate,
                                  fixedAssetStock.YearOfUse,
                                  fixedAssetStock.TotalLife,
                                  fixedAssetStock.Performance,
                                  fixedAssetStock.BuildingBlockNumber,
                                  fixedAssetStock.Floors,
                                  fixedAssetStock.RoomNumber,
                                  fixedAssetStock.RoomPosition,
                                  fixedAssetStock.SerialNo,
                                  fixedAssetStock.ModelNo,
                                  fixedAssetStock.ExpectedValueAfterUsefulLife,
                                  fixedAssetStock.IsMaintenanceRequired,
                                  fixedAssetStock.IsAssetDamageConfirmed,
                                  fixedAssetStock.IsAssetScraped,
                                  fixedAssetStock.ScrapAmount,
                                  fixedAssetStock.ScrapRemarks,
                                  fixedAssetStock.DonationId,
                                  fixedAssetStock.CssdStatus,
                                  item.ItemName,
                                  ItemCode = item.Code,
                                  VendorName = (vendLJ == null) ? "" : vendLJ.VendorName,
                                  ContactNo = (vendLJ == null) ? "" : vendLJ.ContactNo,
                                  ContactAddress = (vendLJ == null) ? "" : vendLJ.ContactAddress,
                                  Email = (vendLJ == null) ? "" : vendLJ.Email,
                                  VendorId = vendLJ == null ? 0 : vendLJ.VendorId,
                                  Name = vendLJ == null ? "" : vendLJ.Name,
                                  Name2 = vendLJ == null ? "" : vendLJ.Name2,
                                  PhoneNumber = vendLJ == null ? "" : vendLJ.PhoneNumber,
                                  PhoneNumber2 = vendLJ == null ? "" : vendLJ.PhoneNumber2,
                                  CompanyPosition = vendLJ == null ? "" : vendLJ.CompanyPosition,
                                  CompanyPosition2 = vendLJ == null ? "" : vendLJ.CompanyPosition2,
                                  CreatedByName = empLJ == null ? "" : empLJ.FullName,
                                  StoreId = fixedAssetStock.StoreId,
                                  SubStoreId = fixedAssetStock.SubStoreId,
                                  Donation = dontLj.Donation,
                                  AssetHolderId = fixedAssetStock.AssetHolderId,
                                  AssetHolderName = (assetHolderLeftJoined != null) ? assetHolderLeftJoined.FullName : "",
                              }).OrderByDescending(a => a.CreatedOn).ToList();

            responseData.Status = (totalStock == null) ? "Failed" : "OK";
            responseData.Results = totalStock;
            return Ok(responseData);
        }


        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            try
            {
                // string Str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                WardSupplyDbContext wardDbContext = new WardSupplyDbContext(connString);
                InventoryDbContext invDbContext = new InventoryDbContext(connString); //swapnil-2-april-2021
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqType != null && reqType == "AssetRequisition")
                {
                    string Str = this.ReadPostData();
                    WARDSupplyAssetRequisitionModel RequisitionFromClient = DanpheJSONConvert.
                        DeserializeObject<WARDSupplyAssetRequisitionModel>(Str);

                    List<WARDSupplyAssetRequisitionItemsModel> requisitionItems = new List<WARDSupplyAssetRequisitionItemsModel>();
                    WARDSupplyAssetRequisitionModel requisition = new WARDSupplyAssetRequisitionModel();
                    using (var dbContextTransaction = wardDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //giving List Of RequisitionItems to requItemsFromClient because we have save the requisition and RequisitionItems One by one ..
                            //first the requisition is saved  after that we have to take the requisitionid and give the requisitionid  to the RequisitionItems ..and then we can save the RequisitionItems
                            requisitionItems = RequisitionFromClient.RequisitionItemsList;

                            //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
                            RequisitionFromClient.RequisitionItemsList = null;
                            var maxRequisitionList = wardDbContext.WARDSupplyAssetRequisitionModels.ToList();
                            if (maxRequisitionList.Count() == 0)
                            {
                                RequisitionFromClient.RequisitionNo = 1;
                            }
                            else
                            {
                                RequisitionFromClient.RequisitionNo = maxRequisitionList.OrderByDescending(a => a.RequisitionNo).First().RequisitionNo + 1;
                            }

                            requisition.IssueNo = RequisitionFromClient.IssueNo;
                            requisition = RequisitionFromClient;
                            requisition.CreatedOn = DateTime.Now;
                            requisition.CreatedBy = currentUser.EmployeeId;
                            if (requisition.RequisitionDate == null)
                            {
                                requisition.RequisitionDate = DateTime.Now;
                            }
                            else
                            {
                                var currDateTime = System.DateTime.Now;
                                var diff = currDateTime.Subtract(requisition.RequisitionDate).Days;
                                diff = diff * (-1);
                                requisition.RequisitionDate = currDateTime.AddDays(diff);
                            }
                            wardDbContext.WARDSupplyAssetRequisitionModels.Add(requisition);
                            wardDbContext.SaveChanges();

                            //getting the lastest RequistionId 
                            int lastRequId = requisition.RequisitionId;
                            int? lastRequNo = requisition.RequisitionNo;
                            int? issueNo = requisition.IssueNo;
                            requisitionItems.ForEach(item =>
                            {
                                item.RequisitionId = lastRequId;
                                item.IssueNo = issueNo;
                                item.CreatedOn = DateTime.Now;
                                item.CreatedBy = currentUser.EmployeeId;
                                item.PendingQuantity = item.Quantity.Value;
                                item.IsActive = true;
                                wardDbContext.WARDSupplyAssetRequisitionItemsModels.Add(item);

                            });
                            //this Save for requisitionItems
                            wardDbContext.SaveChanges();
                            dbContextTransaction.Commit();
                            responseData.Results = RequisitionFromClient.RequisitionId;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            responseData.Status = "Failed";
                        }
                    }
                }

                //swapnil-2-april-2021

                #region POST: Ward supply asset return
                else if (reqType != null && reqType == "AssetReturn")
                {

                    string Str = this.ReadPostData();
                    WARDSupplyAssetReturnModel ReturnFromClient = DanpheJSONConvert.
                        DeserializeObject<WARDSupplyAssetReturnModel>(Str);

                    List<WARDSupplyAssetReturnItemsModel> returnItems = new List<WARDSupplyAssetReturnItemsModel>();
                    WARDSupplyAssetReturnModel Return = new WARDSupplyAssetReturnModel();


                    using (var dbContextTransaction = wardDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            returnItems = ReturnFromClient.ReturnItemsList;

                            //removing the RequisitionItems from RequisitionFromClient because RequisitionItems will be saved later 
                            ReturnFromClient.ReturnItemsList = null;
                            var maxReturnList = wardDbContext.WARDSupplyAssetReturnModels.ToList();
                            Return.ReturnId = ReturnFromClient.ReturnId;
                            Return = ReturnFromClient;
                            Return.CreatedOn = DateTime.Now;
                            Return.CreatedBy = currentUser.EmployeeId;
                            Return.StoreId = ReturnFromClient.StoreId;
                            Return.SubStoreId = ReturnFromClient.SubStoreId;
                            Return.Remarks = ReturnFromClient.Remarks;
                            if (Return.ReturnDate == null)
                            {
                                Return.ReturnDate = DateTime.Now;
                            }
                            else
                            {
                                var currDateTime = System.DateTime.Now;
                                var diff = currDateTime.Subtract(Return.ReturnDate.Value).Days;
                                diff = diff * (-1);
                                Return.ReturnDate = currDateTime.AddDays(diff);
                            }
                            wardDbContext.WARDSupplyAssetReturnModels.Add(Return);
                            wardDbContext.SaveChanges();

                            //getting the lastest ReturnId 
                            int lastReturnId = Return.ReturnId;

                            returnItems.ForEach(item =>
                            {
                                item.ReturnId = lastReturnId;
                                item.CreatedOn = DateTime.Now;
                                item.CreatedBy = currentUser.EmployeeId;

                                wardDbContext.WARDSupplyAssetReturnItemsModels.Add(item);

                            });
                            //this Save for returnItems
                            wardDbContext.SaveChanges();
                            foreach (var item in returnItems)
                            {
                                FixedAssetStockModel stock = wardDbContext.FixedAssetStock.Where(a => a.FixedAssetStockId == item.FixedAssetStockId).FirstOrDefault();
                                stock.SubStoreId = null;
                                wardDbContext.Entry(stock).State = EntityState.Modified;
                                wardDbContext.SaveChanges();
                            }

                            foreach (var item in returnItems)
                            {
                                AssetLocationHistoryModel history = new AssetLocationHistoryModel();
                                history.FixedAssetStockId = item.FixedAssetStockId;
                                history.StartDate = item.CreatedOn;
                                history.OldStoreId = ReturnFromClient.StoreId;
                                history.OldSubStoreId = ReturnFromClient.SubStoreId;
                                history.CreatedBy = item.CreatedBy;
                                wardDbContext.AssetLocationHistory.Add(history);
                            }
                            wardDbContext.SaveChanges();
                            dbContextTransaction.Commit();
                            responseData.Results = ReturnFromClient.ReturnId;
                            responseData.Status = "OK";

                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            responseData.Status = "Failed";
                        }
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

        [HttpPut("SendStockToCssd")]
        public async Task<IActionResult> SendStockToCssd(int FixedAssetStockId)
        {
            var responseData = new DanpheHTTPResponse<object>();
            var wardSupplyDbContext = new WardSupplyDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                responseData.Results = await WardSupplyAssetsBL.SendAssetToCssd(FixedAssetStockId, wardSupplyDbContext, currentUser);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        //swapnil-2-april-2021
        [HttpGet]
        [Route("~/api/WardSupplyAssets/GetRequisitionDetailsForDispatch/{RequisitionId}")]
        public async Task<IActionResult> GetRequisitionDetailsForDispatch([FromRoute] int RequisitionId)
        {
            var wardSupplyContext = new WardSupplyDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                GetRequisitionDetailsForDispatchViewModel stockListVM = await wardSupplyContext.GetRequisitionDetailsForDispatch(RequisitionId);
                responseData.Status = "OK";
                responseData.Results = stockListVM;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        //swapnil-2-april-2021
        [HttpPost()]
        [Route("~/api/WardSupplyAssets/PostStoreDispatch")]
        public IActionResult PostStoreDispatch()
        {
            var wardSupplydbcontext = new WardSupplyDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string Str = this.ReadPostData();
                FixedAssetDispatchModel DispatchFromClient = DanpheJSONConvert.DeserializeObject<FixedAssetDispatchModel>(Str);
                List<FixedAssetDispatchItemsModel> dispatchItems = new List<FixedAssetDispatchItemsModel>();
                FixedAssetDispatchModel dispatch = new FixedAssetDispatchModel();
                List<WARDSupplyAssetRequisitionItemsModel> requisitionItems = new List<WARDSupplyAssetRequisitionItemsModel>();
                WARDSupplyAssetRequisitionModel requisition = new WARDSupplyAssetRequisitionModel();

                using (var dbContextTransaction = wardSupplydbcontext.Database.BeginTransaction())
                {
                    try
                    {
                        dispatchItems = DispatchFromClient.DispatchItems;
                        DispatchFromClient.DispatchItems = null;
                        //var id = wardSupplydbcontext.FixedAssetDispatchModels.Max(a => a.DispatchId);                       
                        dispatch.RequisitionId = DispatchFromClient.RequisitionId;
                        dispatch.Remark = DispatchFromClient.Remark;
                        dispatch.CreatedBy = currentUser.EmployeeId;
                        dispatch.CreatedOn = DateTime.Now;
                        dispatch.StoreId = DispatchFromClient.StoreId;
                        dispatch.SubStoreId = DispatchFromClient.SubStoreId;
                        dispatch.ReceivedBy = null;
                        wardSupplydbcontext.FixedAssetDispatchModels.Add(dispatch);
                        wardSupplydbcontext.SaveChanges();

                        foreach (var item in dispatchItems)
                        {
                            item.DispatchId = dispatch.DispatchId;
                            item.CreatedBy = currentUser.EmployeeId;
                            item.RequisitionId = dispatch.RequisitionId;
                            item.CreatedOn = DateTime.Now;
                            item.ExpiryDate = DateTime.Now;
                            item.MRP = 0;
                            wardSupplydbcontext.FixedAssetDispatchItemsModels.Add(item);
                        }
                        wardSupplydbcontext.SaveChanges();


                        //List<FixedAssetStockModel> stkList = new List<FixedAssetStockModel>();
                        foreach (var item in dispatchItems)
                        {
                            FixedAssetStockModel stkObj = new FixedAssetStockModel();
                            stkObj.FixedAssetStockId = item.FixedAssetStockId.Value;
                            stkObj.SubStoreId = dispatch.SubStoreId;
                            var temp = wardSupplydbcontext.FixedAssetStock.Attach(stkObj);
                            wardSupplydbcontext.Entry(temp).Property(x => x.SubStoreId).IsModified = true;
                            wardSupplydbcontext.SaveChanges();
                        }


                        var allUniqueRequisitionItemIds = dispatchItems.Select(d => d.RequisitionItemId).Distinct();
                        foreach (var requisitionItemId in allUniqueRequisitionItemIds)
                        {
                            WARDSupplyAssetRequisitionItemsModel requisitionItem = wardSupplydbcontext.WARDSupplyAssetRequisitionItemsModels.Find(requisitionItemId);
                            //received, pending, status, modifiedOn, modifiedby
                            requisitionItem.ReceivedQuantity = dispatchItems.Select(d => d.RequisitionItemId == requisitionItemId).Count() + requisitionItem.ReceivedQuantity.Value;
                            double pQty = requisitionItem.Quantity.Value - (requisitionItem.ReceivedQuantity.Value + requisitionItem.CancelQuantity.Value);
                            requisitionItem.PendingQuantity = (pQty <= 0) ? 0 : pQty;
                            requisitionItem.RequisitionItemStatus = (requisitionItem.PendingQuantity <= 0) ? "complete" : "partial";
                            requisitionItem.ModifiedBy = currentUser.EmployeeId;
                            requisitionItem.ModifiedOn = DateTime.Now;
                            var temp = wardSupplydbcontext.WARDSupplyAssetRequisitionItemsModels.Attach(requisitionItem);
                            wardSupplydbcontext.Entry(temp).Property(x => x.ReceivedQuantity).IsModified = true;
                            wardSupplydbcontext.Entry(temp).Property(x => x.PendingQuantity).IsModified = true;
                            wardSupplydbcontext.Entry(temp).Property(x => x.RequisitionItemStatus).IsModified = true;
                            wardSupplydbcontext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                            wardSupplydbcontext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;
                            wardSupplydbcontext.SaveChanges();
                        }

                        WARDSupplyAssetRequisitionModel requisitionModel = wardSupplydbcontext.WARDSupplyAssetRequisitionModels.Find(dispatch.RequisitionId);
                        var partialCount = wardSupplydbcontext.WARDSupplyAssetRequisitionItemsModels.Where(i => i.RequisitionItemStatus == "partial" || i.RequisitionItemStatus == "active").Count();
                        requisitionModel.RequisitionStatus = (partialCount > 0) ? "partial" : "complete";

                        var temp1 = wardSupplydbcontext.WARDSupplyAssetRequisitionModels.Attach(requisitionModel);
                        wardSupplydbcontext.Entry(temp1).Property(x => x.RequisitionStatus).IsModified = true;
                        wardSupplydbcontext.SaveChanges();

                        foreach (var item in dispatchItems)
                        {
                            AssetLocationHistoryModel history = new AssetLocationHistoryModel();
                            history.FixedAssetStockId = (int)item.FixedAssetStockId;
                            history.StartDate = item.CreatedOn;
                            history.OldStoreId = dispatch.StoreId;
                            history.CreatedBy = item.CreatedBy;
                            wardSupplydbcontext.AssetLocationHistory.Add(history);
                        }
                        wardSupplydbcontext.SaveChanges();
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
                responseData.ErrorMessage = "Failed to Post Asset Contract!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }
        [HttpPost]
        [Route("~/api/WardSupplyAssets/PostDirectDispatch")]
        public IActionResult PostDirectDispatch([FromBody] FixedAssetDispatchModel dispatchdataFromClient)
        {
            var responseData = new DanpheHTTPResponse<object>();
            var wardSupplydbcontext = new WardSupplyDbContext(connString);
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string Str = this.ReadPostData();

                WardSupplyAssetsBL.DirectDispatch(dispatchdataFromClient, wardSupplydbcontext, currentUser);
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
        [Route("~/api/WardSupply/GetFixedAssetDispatchListForItemReceive/{RequisitionId}")]
        public IActionResult GetFixedAssetDispatchListForItemReceive([FromRoute] int RequisitionId)
        {
            var wardSupplyContext = new WardSupplyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var RequisitionDetail = wardSupplyContext.WARDSupplyAssetRequisitionModels.Where(req => req.RequisitionId == RequisitionId)
                                                                .Select(req => new { req.RequisitionNo, req.RequisitionDate, req.RequisitionStatus })
                                                                .FirstOrDefault();

                IQueryable<FixedAssetDispatchItemsModel> dispatchList = wardSupplyContext.FixedAssetDispatchItemsModels.Where(item => item.RequisitionId == RequisitionId);
                if (dispatchList != null || dispatchList.Count() > 0)
                {
                    var groupOfDispatchItemById = dispatchList.GroupBy(item => item.DispatchId).ToList();
                    var employeDetail = wardSupplyContext.Employees.Where(e => e.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                    var DispatchDetail = groupOfDispatchItemById.Select(g => new
                    {
                        DispatchId = g.FirstOrDefault().DispatchId,
                        ReceivedBy = employeDetail.FullName,
                        ReceivedOn = g.FirstOrDefault().CreatedOn,
                        DispatchItems = (from dispatchItems in g.ToList()
                                         join RI in wardSupplyContext.WARDSupplyAssetRequisitionItemsModels on dispatchItems.RequisitionItemId equals RI.RequisitionItemId
                                         select new
                                         {
                                             DispatchItemsId = dispatchItems.DispatchItemId,
                                             ItemId = dispatchItems.ItemId,
                                             ItemName = dispatchItems.ItemName,
                                             BatchNo = dispatchItems.BatchNo,
                                             BarCodeNumber = dispatchItems.BarCodeNumber,
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
    }
}
