using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Controllers
{
    public class AssetDepreciationDiscardingController : CommonController
    {
        public AssetDepreciationDiscardingController(IOptions<MyConfiguration> _config) : base(_config)
        {
        }

        [HttpGet ("{StoreId}")]
        public IActionResult GetAssetsDepreciationList([FromRoute] int StoreId)
        {
            var invDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();

            try
            {

                var results = (from fixasststock in invDbContext.FixedAssetStock
                               join emp in invDbContext.Employees on fixasststock.CreatedBy equals emp.EmployeeId
                               join item in invDbContext.Items on fixasststock.ItemId equals item.ItemId
                               join gritem in invDbContext.GoodsReceiptItems on fixasststock.GoodsReceiptItemId equals gritem.GoodsReceiptItemId
                               join grlist in invDbContext.GoodsReceipts on gritem.GoodsReceiptId equals grlist.GoodsReceiptID
                               join vend in invDbContext.Vendors on grlist.VendorId equals vend.VendorId into gs
                               from vend in gs.DefaultIfEmpty()
                               where fixasststock.IsActive == true && fixasststock.StoreId == StoreId
                               select new
                               {
                                   fixasststock.FixedAssetStockId,
                                   fixasststock.BarCodeNumber,
                                   fixasststock.AssetCode,
                                   fixasststock.BatchNo,
                                   fixasststock.WarrantyExpiryDate,
                                   fixasststock.AssetsLocation,
                                   fixasststock.IsBarCodeGenerated,
                                   fixasststock.IsAssetDamaged,
                                   fixasststock.CreatedBy,
                                   fixasststock.CreatedOn,
                                   fixasststock.ItemId,
                                   fixasststock.IsActive,
                                   fixasststock.ItemRate,
                                   fixasststock.MRP,
                                   fixasststock.DiscountAmount,
                                   fixasststock.DiscountPercent,
                                   fixasststock.VAT,
                                   fixasststock.VATAmount,
                                   fixasststock.CcAmount,
                                   fixasststock.CcCharge,
                                   fixasststock.OtherCharge,
                                   fixasststock.ManufactureDate,
                                   fixasststock.YearOfUse,
                                   fixasststock.TotalLife,
                                   fixasststock.Performance,
                                   fixasststock.ExpectedValueAfterUsefulLife,
                                   fixasststock.IsAssetScraped,
                                   //FiscalYear = afy.FiscalYearName,
                                   //deprn.Rate,
                                   //deprn.DepreciationAmount,
                                   //DepreciationMethod = adm.Method,
                                   item.ItemName,
                                   ItemCode = item.Code,
                                   vend.VendorName,
                                   CreatedByName = emp.FullName,
                                   //depreciation = invDbContext.FixedAssetDepreciation.Where(d => d.FixedAssetStockId == fixasststock.FixedAssetStockId).DefaultIfEmpty().OrderByDescending(s => s.CreatedOn).Take(1)
                               }).OrderByDescending(a => a.CreatedOn).ToList();

                resData.Results = results;
                resData.Status = "OK";

            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }


        [HttpGet("depreciationDetailsById/{fixedAssetStockId}")]
        public IActionResult GetAssetDepreciationDetails([FromRoute] int fixedAssetStockId)
        {
            var invDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();

            try
            {
                var results = (from deprn in invDbContext.FixedAssetDepreciation
                               join meth in invDbContext.FixedAssetDepreciationMethod on deprn.AssetDeprnMethodId equals meth.AssetDeprnMethodId
                               join fy in invDbContext.InventoryFiscalYears on deprn.FiscalYearId equals fy.FiscalYearId
                               where deprn.FixedAssetStockId == fixedAssetStockId
                               select new
                               {
                                   deprn.AssetDepreciationId,
                                   deprn.FixedAssetStockId,
                                   deprn.FiscalYearId,
                                   deprn.Rate,
                                   deprn.AssetDeprnMethodId,
                                   deprn.StartDate,
                                   deprn.EndDate,
                                   deprn.DepreciationAmount,
                                   fy.FiscalYearName,
                                   meth.Method,
                               }).OrderByDescending(a => a.FiscalYearId).ToList();

                resData.Results = results;
                resData.Status = "OK";

            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }

        [HttpGet ("GetAssetDepreciationMethods")]
        public IActionResult GetAssetDepreciationMethods()
        {
            var invDbContext = new InventoryDbContext(connString);
            var resData = new DanpheHTTPResponse<object>();

            try
            {
                var results = (from method in invDbContext.FixedAssetDepreciationMethod
                               where method.IsActive == true
                               select method).ToList();

                resData.Results = results;
                resData.Status = "OK";

            }
            catch (Exception ex)
            {
                resData.Status = "Failed";
                resData.ErrorMessage = ex.ToString();
                return BadRequest(resData);
            }
            return Ok(resData);
        }


        [HttpPost ("PostAssetDepreciation")]
        public IActionResult PostAssetDepreciationDetails()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                string Str = this.ReadPostData();
                FixedAssetDepreciationModel deprnDetails = DanpheJSONConvert.DeserializeObject<FixedAssetDepreciationModel>(Str);


                using (var dbContextTransaction = inventoryDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        deprnDetails.CreatedBy = currentUser.EmployeeId;
                        deprnDetails.CreatedOn = DateTime.Now;

                        inventoryDbContext.FixedAssetDepreciation.Add(deprnDetails);
                        inventoryDbContext.SaveChanges();


                        // After File Added Commit the Transaction
                        dbContextTransaction.Commit();

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        responseData.ErrorMessage = "Failed to Post Asset Depreciation Details!" + ex.ToString();
                    }
                }

                responseData.Results = null;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Post Asset Depreciation Details!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }


        [HttpPut ("PutAssetDepreciation")]
        public IActionResult PutAssetDepreciation()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetDepreciationModel deprnDetails = DanpheJSONConvert.DeserializeObject<FixedAssetDepreciationModel>(Str);



                deprnDetails.ModifiedBy = currentUser.EmployeeId;
                deprnDetails.ModifiedOn = DateTime.Now;

                var temp = inventoryDbContext.FixedAssetDepreciation.Attach(deprnDetails);
                inventoryDbContext.Entry(temp).Property(x => x.AssetDeprnMethodId).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.FiscalYearId).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.DepreciationAmount).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.Rate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.StartDate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.EndDate).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedBy).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ModifiedOn).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = deprnDetails;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Update Asset Depreciation!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }

        [HttpPut ("UpdateAssetScrapDetails")]
        public IActionResult UpdateAssetScrapDetails()
        {
            var inventoryDbContext = new InventoryDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                var Str = this.ReadPostData();
                FixedAssetStockModel details = DanpheJSONConvert.DeserializeObject<FixedAssetStockModel>(Str);

                details.ModifiedBy = currentUser.EmployeeId;
                details.ModifiedOn = DateTime.Now;

                var temp = inventoryDbContext.FixedAssetStock.Attach(details);
                inventoryDbContext.Entry(temp).Property(x => x.ScrapAmount).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ScrapRemarks).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.ScrapCancelRemarks).IsModified = true;
                inventoryDbContext.Entry(temp).Property(x => x.IsAssetScraped).IsModified = true;

                //inventoryDbContext.Entry(temp).State = EntityState.Modified;


                inventoryDbContext.SaveChanges();
                responseData.Results = details;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Failed to Update Asset Scrap Details!" + ex.ToString();
                return BadRequest(responseData);
            }
            return Ok(responseData);
        }





    }
}
