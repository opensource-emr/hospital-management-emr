using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.Helpers;//for appointmenthelpers
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel.LabModels;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Drawing;
using DanpheEMR.Controllers.Settings.DTO;
using DanpheEMR.ServerModel.AdmissionModels.Config;
using DanpheEMR.Services.Admission.DTOs;
using Google.Apis.Util;
using DocumentFormat.OpenXml.Wordprocessing;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.BillingModels;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Microsoft.EntityFrameworkCore.Storage;
using DanpheEMR.Services.ADTSettings.DTO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class ADTSettingsController : CommonController
    {

        private readonly MasterDbContext _masterDbContext;
        // private readonly RadiologyDbContext radiologyDbContext;
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly CoreDbContext _coreDbContext;
        private readonly BillingDbContext _billingDbContext;
        DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public ADTSettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _masterDbContext = new MasterDbContext(connString);
            //_radiologyDbContext = new RadiologyDbContext(connString);
            _coreDbContext = new CoreDbContext(connString);
            _admissionDbContext = new AdmissionDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);

        }


        [HttpGet]
        [Route("AutoBillingItems")]

        public IActionResult GetAutoBillingItems()
        {
            //if (reqType == "adt-get-auto-billing-items")
            Func<object> func = () => AutoBillingItems();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("AdtAutoBillingItems")]
        public IActionResult GetAdtAutoBillingItems()
        {
            Func<object> func = () => (from bill in _admissionDbContext.AdtAutoBillingItems
                                       join bed in _admissionDbContext.BedFeatures
                                       on bill.BedFeatureId equals bed.BedFeatureId
                                       join sch in _admissionDbContext.Schemes
                                       on bill.SchemeId equals sch.SchemeId
                                       join ser in _admissionDbContext.BillServiceItems
                                       on bill.ServiceItemId equals ser.ServiceItemId
                                       select new AdtGetAutoBillingItems_DTO
                                       {
                                           AdtAutoBillingItemId = bill.AdtAutoBillingItemId,
                                           BedFeatureName = bed.BedFeatureName,
                                           BedFeatureId = bed.BedFeatureId,
                                           SchemeName = sch.SchemeName,
                                           SchemeId = sch.SchemeId,
                                           ItemName = ser.ItemName,
                                           ServiceItemId = ser.ServiceItemId,
                                           MinimumChargeAmount = bill.MinimumChargeAmount,
                                           PercentageOfBedCharges = bill.PercentageOfBedCharges,
                                           UsePercentageOfBedCharges = bill.UsePercentageOfBedCharges,
                                           IsRepeatable = bill.IsRepeatable,
                                           IsActive = bill.IsActive

                                       }).OrderByDescending(b => b.AdtAutoBillingItemId).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Beds")]
        public IActionResult Beds()
        {

            //if (reqtype == "adt-bed")
            //{
            Func<object> func = () => (from i in _admissionDbContext.Beds.Include("Ward")
                                       join bedMap in _admissionDbContext.BedFeaturesMaps on i.BedId equals bedMap.BedId
                                       join bedFeature in _admissionDbContext.BedFeatures on bedMap.BedFeatureId equals bedFeature.BedFeatureId
                                       group new { bedFeature } by new
                                       {
                                           i
                                       } into g
                                       select new BedDisplayModel
                                       {
                                           WardName = g.Key.i.Ward.WardName,
                                           WardId = g.Key.i.Ward.WardId,
                                           BedCode = g.Key.i.BedCode,
                                           BedId = g.Key.i.BedId,
                                           BedNumber = g.Key.i.BedNumber,
                                           IsActive = g.Key.i.IsActive,
                                           IsOccupied = g.Key.i.IsOccupied,
                                           CreatedOn = g.Key.i.CreatedOn,
                                           CreatedBy = g.Key.i.CreatedBy,
                                           BedFeature = g.Select(a =>
                                              new BedFeatureModel()
                                              {
                                                  BedFeatureId = a.bedFeature.BedFeatureId,
                                                  BedFeatureName = a.bedFeature.BedFeatureName
                                              }).ToList()
                                       }).OrderBy(i => i.WardId).ThenBy(i => i.BedNumber).ToList();

            return InvokeHttpGetFunction(func);
        }



        [HttpGet]
        [Route("BedFeatures")]
        public IActionResult GetBedFeatures()
        {

            //        if (reqType == "get-adt-bedFeature")
            //{
            //var bedTypeList = adtDbContext.BedFeatures.ToList();

            Func<object> func = () => (from bed in _admissionDbContext.BedFeatures
                                       join item in _admissionDbContext.BillServiceItems on bed.BedFeatureId equals item.IntegrationItemId
                                       join srv in _admissionDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                       /*join priceCatServItem in _admissionDbContext.BillPriceCategoryServiceItems on item.ServiceItemId equals priceCatServItem.ServiceItemId*/
                                       where srv.IntegrationName.ToLower() == "bed charges"
                                       select new
                                       {
                                           BedFeatureId = bed.BedFeatureId,
                                           BedFeatureCode = bed.BedFeatureCode,
                                           BedFeatureName = bed.BedFeatureName,
                                           BedFeatureFullName = bed.BedFeatureFullName,
                                           IsActive = bed.IsActive
                                       }).OrderBy(e => e.BedFeatureName).ToList();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("BedFeaturesMap")]
        public IActionResult BedFeaturesMap(int bedId)
        {
            //if (reqType == "adt-map-bedFeatures")
            //    {

            Func<object> func = () => (from bedFeaturesMap in _admissionDbContext.BedFeaturesMaps
                                       join bedFeatures in _admissionDbContext.BedFeatures on bedFeaturesMap.BedFeatureId equals bedFeatures.BedFeatureId
                                       where bedFeaturesMap.BedId == bedId
                                       select bedFeaturesMap).Distinct().ToList();

            return InvokeHttpGetFunction(func);


        }
        [HttpGet]
        [Route("Wards")]
        public IActionResult Wards()
        {
            //if (reqType == "adt-ward")
            //{
            Func<object> func = () => _admissionDbContext.Wards.OrderBy(a => a.WardName).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("BedFeatureSchemePriceCataegoryMap")]
        public IActionResult BedFeatureSchemePriceCataegoryMap()
        {
            Func<object> func = () => (from map in _admissionDbContext.BedFeatureSchemePriceCategoryMaps
                                       join scheme in _admissionDbContext.Schemes on map.SchemeId equals scheme.SchemeId
                                       join bedfeature in _admissionDbContext.BedFeatures on map.BedFeatureId equals bedfeature.BedFeatureId
                                       join priceCategory in _admissionDbContext.PriceCategoryModels on map.PriceCategoryId equals priceCategory.PriceCategoryId
                                       select new AdtGetBedFeatureSchemePriceCategoryMap_DTO
                                       {
                                           BedFeatureSchemePriceCategoryMapId = map.BedFeatureSchemePriceCategoryMapId,
                                           BedFeatureName = bedfeature.BedFeatureName,
                                           BedFeatureId = bedfeature.BedFeatureId,
                                           SchemeId = scheme.SchemeId,
                                           SchemeName = scheme.SchemeName,
                                           PriceCategoryId = priceCategory.PriceCategoryId,
                                           PriceCategoryName = priceCategory.PriceCategoryName,
                                           IsActive = map.IsActive
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("MinimumDepositSettings")]
        public IActionResult GetMinimumDepositSettings()
        {
            Func<object> func = () => (from dep in _admissionDbContext.AdtDepositSettings
                                       join scheme in _admissionDbContext.Schemes on dep.SchemeId equals scheme.SchemeId
                                       join bedfeature in _admissionDbContext.BedFeatures on dep.BedFeatureId equals bedfeature.BedFeatureId
                                       join head in _admissionDbContext.DepositHeadModels on dep.DepositHeadId equals head.DepositHeadId
                                       select new AdtMinimumDepositSetting_DTO
                                       {
                                           AdtDepositSettingId = dep.AdtDepositSettingId,
                                           BedFeatureName = bedfeature.BedFeatureName,
                                           BedFeatureId = bedfeature.BedFeatureId,
                                           SchemeId = scheme.SchemeId,
                                           SchemeName = scheme.SchemeName,
                                           DepositHeadId = head.DepositHeadId,
                                           DepositHeadName = head.DepositHeadName,
                                           MinimumDepositAmount = dep.MinimumDepositAmount,
                                           IsOnlyMinimumDeposit = dep.IsOnlyMinimumDeposit,
                                           IsActive = dep.IsActive
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpPost]
        [Route("Bed")]
        public IActionResult PostBed()
        {
            //if (reqType == "adt-bed") //post
            //{
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => SaveBed(ipDataStr);
            return InvokeHttpPostFunction(func);


        }

        [HttpPost]
        [Route("BedFeaturesMap")]
        public IActionResult PostBedFeaturesMap()
        {

            //if (reqType == "adt-map-bedFeatures") //post
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => SaveBedFeaturesMap(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPost]
        [Route("Ward")]
        public IActionResult PostWard()
        {
            //if (reqType == "adt-ward")

            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            Func<object> func = () => AddWard(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }




        [HttpPost]
        [Route("AutoBillingItem")]
        public IActionResult AutoBillingItem()
        {
            //if (reqType == "adt-post-auto-billitems-param")
            //    {
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => AddAutoBillingItem(ipDataStr);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("AdtAutoBillingItem")]
        public IActionResult AdtAutoBillingItem([FromBody] Services.Admission.DTOs.AdtAutoBillingItem_DTO adtAutoBillingItemdto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddAdtAutoBillingItem(adtAutoBillingItemdto, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPost]
        [Route("BedFeature")]
        public IActionResult PostBedFeature([FromBody] Settings.DTO.BedFeature_DTO bedFeatureDTO)
        {
            //if (reqType == "post-adt-bedFeature")
            /* string ipDataStr = this.ReadPostData();*/
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => SaveBedFeature(bedFeatureDTO, currentUser);
            return InvokeHttpPostFunction(func);
        }
        [HttpPost]
        [Route("BedFeatureSchemePriceCategoryMap")]
        public IActionResult ADTBedFeatureSchemePriceCategory([FromBody] List<AdtBedFeatureSchemePriceCategory_DTO> adtBedFeatureSchemePriceCategory_dto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddAdtBedFeatureSchemePriceCategory(adtBedFeatureSchemePriceCategory_dto, currentUser);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("MinimumDepositSetting")]
        public IActionResult MinimumDepositSetting([FromBody] AdtSettingDeposit_DTO adtSettingDeposit_dto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddMinimumDepositSetting(adtSettingDeposit_dto, currentUser);
            return InvokeHttpPostFunction(func);

        }

        private object AddMinimumDepositSetting(AdtSettingDeposit_DTO adtSettingDeposit_dto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (adtSettingDeposit_dto == null)
                    {
                        throw new Exception("Cannot be saved with null Data ...");
                    }
                    AdtDepositSettingsModel depositSetting = new AdtDepositSettingsModel();
                    depositSetting.CreatedOn = DateTime.Now;
                    depositSetting.CreatedBy = currentUser.EmployeeId;
                    depositSetting.BedFeatureId = adtSettingDeposit_dto.BedFeatureId;
                    depositSetting.DepositHeadId = adtSettingDeposit_dto.DepositHeadId;
                    depositSetting.SchemeId = adtSettingDeposit_dto.SchemeId;
                    depositSetting.MinimumDepositAmount = adtSettingDeposit_dto.MinimumDepositAmount;
                    depositSetting.IsOnlyMinimumDeposit = adtSettingDeposit_dto.IsOnlyMinimumDeposit;
                    depositSetting.IsActive = true;

                    _admissionDbContext.AdtDepositSettings.Add(depositSetting);
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();

                    return depositSetting;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }

        [HttpPut]
        [Route("Bed")]
        public IActionResult PutBed()

        {
            //if (reqType == "adt-bed")
            //       {
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateBed(ipDataStr);
            return InvokeHttpPutFunction(func);

        }


        [HttpPut]
        [Route("BedFeatures")]
        public IActionResult PutBedFeatures([FromBody] Settings.DTO.BedFeature_DTO bedFeatureDTO)

        {
            //if (reqType == "put-adt-bedFeature")
            //{
            /*string ipDataStr = this.ReadPostData();*/
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateBedFeatures(bedFeatureDTO, currentUser);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("AdtAutoBillingItem")]
        public IActionResult PutAutoBillingItem([FromBody] Services.Admission.DTOs.AdtAutoBillingItem_DTO adtAutoBillingItemdto)

        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateAutoBillingItem(adtAutoBillingItemdto, currentUser);
            return InvokeHttpPutFunction(func);

        }


        [HttpPut]
        [Route("BedFeaturesMap")]
        public IActionResult PutBedFeaturesMap()

        {
            //if (reqType == "adt-map-bedFeatures") ///put
            //{
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateBedFeaturesMap(ipDataStr);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]

        [Route("Ward")]
        public IActionResult PutWard()

        {
            //if (reqType == "adt-ward")
            //{
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateWard(ipDataStr);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]

        [Route("AutoBillingItem")]
        public IActionResult PutBillingItem()

        {
            //if (reqType == "adt-put-auto-billing-items")
            //{
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateAutoBillingItem(ipDataStr);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("ActivateDeactivateAutoBillingItem")]
        public IActionResult ActiveBillingItem(int AdtAutoBillingItemId, bool IsActive)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateBillingItem(AdtAutoBillingItemId, IsActive, currentUser);
            return InvokeHttpPostFunction(func);


        }
        [HttpPut]
        [Route("ActivateDeactivateBedFeatureSchemePriceCategoryMap")]
        public IActionResult ActivateDeactivateBedFeatureSchemePriceCategoryMap(int BedFeatureSchemePricecategoryMapId)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateDeactivateBedFeatureSchemePriceCategoryMap(BedFeatureSchemePricecategoryMapId, currentUser);
            return InvokeHttpPostFunction(func);


        }

        private object ActivateDeactivateBedFeatureSchemePriceCategoryMap(int bedFeatureSchemePriceCategoryMapId, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var map = _admissionDbContext.BedFeatureSchemePriceCategoryMaps.Where(a => a.BedFeatureSchemePriceCategoryMapId == bedFeatureSchemePriceCategoryMapId).FirstOrDefault();
                    if (map == null)
                    {
                        throw new Exception("Mapping Data not found to update");
                    }
                    map.IsActive = !map.IsActive;
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return map;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        [HttpPut]
        [Route("BedFeatureSchemePriceCategoryMap")]
        public IActionResult BedFeatureSchemePriceCategoryMap([FromBody] AdtBedFeatureSchemePriceCategoryMap_DTO adtBedFeatureSchemePriceCategoryMap_dto)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBedFeatureSchemePriceCategoryMap(adtBedFeatureSchemePriceCategoryMap_dto, currentUser);
            return InvokeHttpPostFunction(func);


        }
        [HttpPut]
        [Route("MinimumDepositSetting")]
        public IActionResult UpdateMinimumDepositSetting([FromBody] AdtSettingDeposit_DTO adtSettingDeposit_dto)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateMinimumDepositSetting(adtSettingDeposit_dto, currentUser);
            return InvokeHttpPutFunction(func);


        }
        [HttpPut]
        [Route("ActivateDeactivateMinimumDepositSetting")]
        public IActionResult ActivateDeactivateMinimumDepositSetting(int AdtDepositSettingId)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateDeactivateMinimumDepositSetting(AdtDepositSettingId, currentUser);
            return InvokeHttpPostFunction(func);


        }

        private object ActivateDeactivateMinimumDepositSetting(int AdtDepositSettingId, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var map = _admissionDbContext.AdtDepositSettings.Where(a => a.AdtDepositSettingId == AdtDepositSettingId).FirstOrDefault();
                    if (map == null)
                    {
                        throw new Exception(" Data not found to update");
                    }
                    map.IsActive = !map.IsActive;
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return map;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object UpdateMinimumDepositSetting(AdtSettingDeposit_DTO adtSettingDeposit_dto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (adtSettingDeposit_dto == null)
                    {
                        throw new Exception(" cannot update with null data.");
                    }
                    var deposit = _admissionDbContext.AdtDepositSettings.Where(a => a.AdtDepositSettingId == adtSettingDeposit_dto.AdtDepositSettingId).FirstOrDefault();
                    if (deposit == null)
                    {
                        throw new Exception(" Data not found to update");
                    }
                    deposit.BedFeatureId = adtSettingDeposit_dto.BedFeatureId;
                    deposit.SchemeId = adtSettingDeposit_dto.SchemeId;
                    deposit.DepositHeadId = adtSettingDeposit_dto.DepositHeadId;
                    deposit.IsOnlyMinimumDeposit = adtSettingDeposit_dto.IsOnlyMinimumDeposit;
                    deposit.MinimumDepositAmount = adtSettingDeposit_dto.MinimumDepositAmount;
                    deposit.ModifiedBy = currentUser.EmployeeId;
                    deposit.ModifiedOn = DateTime.Now; _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return deposit;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object UpdateBedFeatureSchemePriceCategoryMap(AdtBedFeatureSchemePriceCategoryMap_DTO adtBedFeatureSchemePriceCategoryMap_dto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var map = _admissionDbContext.BedFeatureSchemePriceCategoryMaps.Where(a => a.BedFeatureSchemePriceCategoryMapId == adtBedFeatureSchemePriceCategoryMap_dto.BedFeatureSchemePriceCategoryMapId).FirstOrDefault();
                    if (map == null)
                    {
                        throw new Exception("Mapping Data not found to update");
                    }
                    map.BedFeatureId = adtBedFeatureSchemePriceCategoryMap_dto.BedFeatureId;
                    map.SchemeId = adtBedFeatureSchemePriceCategoryMap_dto.SchemeId;
                    map.PriceCategoryId = adtBedFeatureSchemePriceCategoryMap_dto.PriceCategoryId;
                    map.ModifiedBy = currentUser.EmployeeId;
                    map.ModifiedOn = DateTime.Now; _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return map;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object ActivateBillingItem(int AdtAutoBillingItemId, bool IsActive, RbacUser currentUser)
        {

            AdtAutoBillingItemModel rowToUpdate = _admissionDbContext.AdtAutoBillingItems.Where(a => a.AdtAutoBillingItemId == AdtAutoBillingItemId).FirstOrDefault();
            if (rowToUpdate != null)
            {
                rowToUpdate.IsActive = !rowToUpdate.IsActive;

                rowToUpdate.ModifiedBy = currentUser.EmployeeId;
                rowToUpdate.ModifiedOn = DateTime.Now;
                _admissionDbContext.Entry(rowToUpdate).Property(x => x.IsActive).IsModified = true;
                _admissionDbContext.Entry(rowToUpdate).Property(x => x.ModifiedBy).IsModified = true;
                _admissionDbContext.Entry(rowToUpdate).Property(x => x.ModifiedOn).IsModified = true;
                _admissionDbContext.SaveChanges();
                return rowToUpdate;
            }
            else
            {
                throw new Exception("Cannot find Auto billing item ");
            }

        }

        private void UpdateBedFeaturesWard(int bedId, int wardId, int? modifedBy)
        {
            try
            {
                AdmissionDbContext _admissiondbContext = new AdmissionDbContext(connString);
                List<BedFeaturesMap> featuresMapList = (from features in _admissiondbContext.BedFeaturesMaps
                                                        where features.BedId == bedId
                                                        select features).ToList();
                featuresMapList.ForEach(featuresMap =>
                {
                    featuresMap.WardId = wardId;
                    featuresMap.ModifiedBy = modifedBy;
                    featuresMap.ModifiedOn = DateTime.Now;
                    _admissiondbContext.Entry(featuresMap).State = EntityState.Modified;
                });
                _admissiondbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }
        private object AutoBillingItems()
        {
            var billItems = new BillingItemVM();
            var autoBillItems = new List<BillingItemVM>();
            var parameter = _coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
            if (parameter != null && parameter.ParameterValue != null)
            {
                ADTAutoAddItemParameterVM adtParameter = DanpheJSONConvert.DeserializeObject<ADTAutoAddItemParameterVM>(parameter.ParameterValue);
                return adtParameter;
            }
            else
            {
                throw new Exception("No data found.");
            }

        }
        private object SaveBed(string ipDataStr)
        {
            BedModel bed = DanpheJSONConvert.DeserializeObject<BedModel>(ipDataStr);
            List<BedModel> BedList = new List<BedModel>();
            string code = bed.BedCode;

            //for (int i = int32.pabed.BedNumFrm; i <= bed.BedNumTo; i++)
            //{
            BedModel bedToAdd = new BedModel();
            bed.CreatedOn = DateTime.Now;
            bed.BedCode = code + '-' + bed.BedNumber;
            bedToAdd.BedNumber = bed.BedNumber;
            bedToAdd.BedCode = bed.BedCode;
            bedToAdd.WardId = bed.WardId;
            bedToAdd.Ward = bed.Ward;
            bedToAdd.IsActive = bed.IsActive;
            bedToAdd.CreatedBy = bed.CreatedBy;
            bedToAdd.CreatedOn = bed.CreatedOn;
            bedToAdd.IsOccupied = bed.IsOccupied;
            _admissionDbContext.Beds.Add(bedToAdd);
            _admissionDbContext.SaveChanges();
            BedList.Add(bedToAdd);
            return bedToAdd;
            //}
        }

        private object SaveBedFeaturesMap(string ipDataStr, RbacUser currentUser)
        {
            BedFeaturesMap bedFeaturesMap = DanpheJSONConvert.DeserializeObject<BedFeaturesMap>(ipDataStr);
            bedFeaturesMap.CreatedOn = DateTime.Now;
            bedFeaturesMap.CreatedBy = currentUser.EmployeeId;
            _admissionDbContext.BedFeaturesMaps.Add(bedFeaturesMap);
            _admissionDbContext.SaveChanges();
            return bedFeaturesMap;
        }
        private object AddWard(string ipDataStr, RbacUser currentUser)
        {

            WardModel ward = DanpheJSONConvert.DeserializeObject<WardModel>(ipDataStr);
            ward.CreatedOn = DateTime.Now;
            if (CheckForWardDuplicate(_admissionDbContext, ward) == false)
            {
                _admissionDbContext.Wards.Add(ward);
                _admissionDbContext.SaveChanges();

                var wardPermission = new RbacPermission();
                wardPermission.PermissionName = "ward-" + ward.WardName;
                wardPermission.Description = "auto-generated after ward creation";
                wardPermission.ApplicationId = _rbacDbContext.Applications.Where(a => a.ApplicationName == "ADT Wards" && a.ApplicationCode == "ADTWARD").Select(a => a.ApplicationId).FirstOrDefault();
                wardPermission.CreatedBy = currentUser.EmployeeId;
                wardPermission.CreatedOn = DateTime.Now;
                wardPermission.IsActive = true;
                RBAC.CreatePermission(wardPermission, _rbacDbContext);

                return ward;
            }
            else
            {
                throw new Exception("This ward already exist.");
            }

        }
        private object AddAutoBillingItem(string ipDataStr)
        {
            ParameterModel parameter = DanpheJSONConvert.DeserializeObject<ParameterModel>(ipDataStr);
            parameter.ParameterGroupName = "ADT";
            parameter.ParameterName = "AutoAddBillingItems";
            parameter.ParameterValue = @"{""DoAutoAddBillingItems"":false,""DoAutoAddBedItem"":false,""ItemList"":[]}";
            parameter.ValueDataType = "JSON";
            parameter.Description = "These billing items are added when the patient gets admitted.";

            _coreDbContext.Parameters.Add(parameter);
            _coreDbContext.SaveChanges();

            return parameter;
        }
        private object AddAdtAutoBillingItem(AdtAutoBillingItem_DTO adtAutoBillingItemdto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    AdtAutoBillingItemModel autobillingItems = new AdtAutoBillingItemModel();
                    autobillingItems.CreatedOn = DateTime.Now;
                    autobillingItems.CreatedBy = currentUser.EmployeeId;
                    autobillingItems.BedFeatureId = adtAutoBillingItemdto.BedFeatureId;
                    autobillingItems.ServiceItemId = adtAutoBillingItemdto.ServiceItemId;
                    autobillingItems.SchemeId = adtAutoBillingItemdto.SchemeId;
                    autobillingItems.ServiceItemId = adtAutoBillingItemdto.ServiceItemId;
                    autobillingItems.MinimumChargeAmount = adtAutoBillingItemdto.MinimumChargeAmount;
                    autobillingItems.PercentageOfBedCharges = adtAutoBillingItemdto.PercentageOfBedCharges;
                    autobillingItems.UsePercentageOfBedCharges = adtAutoBillingItemdto.UsePercentageOfBedCharges;
                    autobillingItems.IsActive = true;
                    autobillingItems.IsRepeatable = adtAutoBillingItemdto.IsRepeatable;
                    _admissionDbContext.AdtAutoBillingItems.Add(autobillingItems);
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();

                    return autobillingItems;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }
        private object AddAdtBedFeatureSchemePriceCategory(List<AdtBedFeatureSchemePriceCategory_DTO> adtBedFeatureSchemePriceCategory_dto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<AdtBedFeatureSchemePriceCategoryMapModel> bedFeatureSchemePriceCategory = DanpheJSONConvert.DeserializeObject<List<AdtBedFeatureSchemePriceCategoryMapModel>>(DanpheJSONConvert.SerializeObject(adtBedFeatureSchemePriceCategory_dto));
                    bedFeatureSchemePriceCategory.ForEach(item =>
                    {
                        item.CreatedOn = DateTime.Now;
                        item.CreatedBy = currentUser.EmployeeId;
                        item.IsActive = true;
                    });
                    _admissionDbContext.BedFeatureSchemePriceCategoryMaps.AddRange(bedFeatureSchemePriceCategory);
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return bedFeatureSchemePriceCategory;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }
        private object SaveBedFeature(Settings.DTO.BedFeature_DTO bedFeatureDTO, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    /*BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(ipDataStr);*/
                    //BillItemPrice billItemPrice = new BillItemPrice();

                    BedFeature bedFeature = new BedFeature();
                    var departmentModel = _coreDbContext.ServiceDepartments.Where(d => d.IntegrationName == "Bed Charges").FirstOrDefault();

                    bedFeature.CreatedBy = currentUser.EmployeeId;
                    bedFeature.CreatedOn = DateTime.Now;
                    bedFeature.BedFeatureCode = bedFeatureDTO.BedFeatureCode;
                    bedFeature.BedFeatureName = bedFeatureDTO.BedFeatureName;
                    bedFeature.BedFeatureFullName = bedFeatureDTO.BedFeatureFullName;
                    bedFeature.BedPrice = bedFeatureDTO.BedPrice;
                    bedFeature.IsActive = bedFeatureDTO.IsActive;

                    _admissionDbContext.BedFeatures.Add(bedFeature);
                    _admissionDbContext.SaveChanges();

                    var serviceCategory = _billingDbContext.BillServiceCategories.Where(d => d.ServiceCategoryCode == "BEDCH").FirstOrDefault();
                    var serviceItem = new BillServiceItemModel();
                    serviceItem.ItemCode = bedFeature.BedFeatureCode;
                    serviceItem.ItemName = bedFeature.BedFeatureName;
                    serviceItem.IntegrationItemId = bedFeature.BedFeatureId;
                    serviceItem.IntegrationName = "Bed Charges";
                    serviceItem.IsTaxApplicable = bedFeature.TaxApplicable.HasValue ? bedFeature.TaxApplicable.Value : false;
                    serviceItem.ServiceDepartmentId = departmentModel.ServiceDepartmentId;
                    serviceItem.CreatedBy = currentUser.EmployeeId; ;
                    serviceItem.CreatedOn = DateTime.Now;
                    serviceItem.IsDoctorMandatory = false;
                    serviceItem.IsOT = false;
                    serviceItem.IsProc = false;
                    serviceItem.IsValidForReporting = false;
                    serviceItem.IsErLabApplicable = false;
                    serviceItem.IsActive = bedFeature.IsActive;
                    serviceItem.IsIncentiveApplicable = false;
                    _billingDbContext.BillServiceItems.Add(serviceItem);
                    _billingDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return bedFeature;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }
        private static bool CheckForWardDuplicate(AdmissionDbContext _admissionDbContext, WardModel ward, bool? isUpdate = false)
        {
            if (isUpdate == true)
                return _admissionDbContext.Wards.Where(wardinDB => wardinDB.WardId != ward.WardId && (wardinDB.WardName == ward.WardName || wardinDB.WardCode == ward.WardCode)).Any();
            return _admissionDbContext.Wards.Any(u => u.WardName == ward.WardName || u.WardCode == ward.WardCode);
        }
        private object UpdateBed(string ipDataStr)
        {
            BedModel bed = DanpheJSONConvert.DeserializeObject<BedModel>(ipDataStr);
            //  List<BedModel> bedList = new List<BedModel>();
            // BedModel bedModel = new BedModel(); 
            _admissionDbContext.Beds.Attach(bed);
            _admissionDbContext.Entry(bed).State = EntityState.Modified;
            _admissionDbContext.Entry(bed).Property(x => x.CreatedOn).IsModified = false;
            _admissionDbContext.Entry(bed).Property(x => x.CreatedBy).IsModified = false;
            bed.ModifiedOn = System.DateTime.Now;
            _admissionDbContext.SaveChanges();
            UpdateBedFeaturesWard(bed.BedId, bed.WardId, bed.ModifiedBy);
            // bedList.Add(bed);
            return bed;
        }
        private object UpdateBedFeatures(Settings.DTO.BedFeature_DTO bedFeatureDTO, RbacUser currentUser)

        {
            /*BedFeature bedFeature = DanpheJSONConvert.DeserializeObject<BedFeature>(ipDataStr);*/
            BedFeature bedFeature = _admissionDbContext.BedFeatures.Where(a => a.BedFeatureId == bedFeatureDTO.BedFeatureId).FirstOrDefault<BedFeature>();
            _admissionDbContext.BedFeatures.Attach(bedFeature);
            bedFeature.BedFeatureFullName = bedFeatureDTO.BedFeatureFullName;
            bedFeature.IsActive = bedFeatureDTO.IsActive;
            bedFeature.ModifiedOn = System.DateTime.Now;
            bedFeature.ModifiedBy = currentUser.EmployeeId;
            _admissionDbContext.SaveChanges();

            var departmentModel = _coreDbContext.ServiceDepartments.Where(d => d.IntegrationName == "Bed Charges").FirstOrDefault();
            //BillItemPrice billItemPrice = billingDbContext.BillItemPrice.Where(a => a.ItemName == departmentModel.ServiceDepartmentName).FirstOrDefault<BillItemPrice>();
            BillServiceItemModel billItemPrice = _billingDbContext.BillServiceItems.Where(a => a.IntegrationItemId == bedFeature.BedFeatureId && a.ServiceDepartmentId == departmentModel.ServiceDepartmentId).FirstOrDefault<BillServiceItemModel>();
            _billingDbContext.BillServiceItems.Attach(billItemPrice);

            /*_admissionDbContext.Entry(bedFeature).State = EntityState.Modified;
            _admissionDbContext.Entry(bedFeature).Property(x => x.CreatedOn).IsModified = false;
            _admissionDbContext.Entry(bedFeature).Property(x => x.CreatedBy).IsModified = false;*/

            // billItemPrice.ItemName = bedFeature.BedFeatureName;//shouldn't change itemname: sud-12Sept'19
            /*billItemPrice.IsTaxApplicable = bedFeature.TaxApplicable.HasValue ? bedFeature.TaxApplicable.Value : false;*/
            //billItemPrice.Price = bedFeature.BedPrice;
            billItemPrice.IsActive = bedFeature.IsActive;



            var result = new
            {
                BedFeature = bedFeature,
                BillItemPrice = billItemPrice
            };
            return result;
        }
        private object UpdateAutoBillingItem(AdtAutoBillingItem_DTO adtAutoBillingItemdto, RbacUser currentUser)
        {
            using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {

                    AdtAutoBillingItemModel autoBilling = _admissionDbContext.AdtAutoBillingItems.Where(a => a.AdtAutoBillingItemId == adtAutoBillingItemdto.AdtAutoBillingItemId).FirstOrDefault<AdtAutoBillingItemModel>();
                    _admissionDbContext.AdtAutoBillingItems.Attach(autoBilling);
                    autoBilling.BedFeatureId = adtAutoBillingItemdto.BedFeatureId;
                    autoBilling.SchemeId = adtAutoBillingItemdto.SchemeId;
                    autoBilling.ServiceItemId = adtAutoBillingItemdto.ServiceItemId;
                    autoBilling.MinimumChargeAmount = adtAutoBillingItemdto.MinimumChargeAmount;
                    autoBilling.UsePercentageOfBedCharges = adtAutoBillingItemdto.UsePercentageOfBedCharges;
                    autoBilling.PercentageOfBedCharges = adtAutoBillingItemdto.PercentageOfBedCharges;
                    autoBilling.IsRepeatable = adtAutoBillingItemdto.IsRepeatable;
                    autoBilling.IsActive = adtAutoBillingItemdto.IsActive;
                    autoBilling.ModifiedOn = System.DateTime.Now;
                    autoBilling.ModifiedBy = currentUser.EmployeeId;
                    _admissionDbContext.SaveChanges();
                    dbContextTransaction.Commit();


                    return autoBilling;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }
        private object UpdateBedFeaturesMap(string ipDataStr)
        {
            //List<BedFeaturesMap> bedFeaturesMap = DanpheJSONConvert.DeserializeObject<List<BedFeaturesMap>>(str);
            BedFeaturesMap bedFeaturesMap = DanpheJSONConvert.DeserializeObject<BedFeaturesMap>(ipDataStr);
            var BedFeatureMap = _admissionDbContext.BedFeaturesMaps.Where(x => x.BedId == bedFeaturesMap.BedId).FirstOrDefault();
            BedFeatureMap.WardId = bedFeaturesMap.WardId;
            BedFeatureMap.BedFeatureId = bedFeaturesMap.BedFeatureId;
            BedFeatureMap.ModifiedBy = bedFeaturesMap.ModifiedBy;
            BedFeatureMap.ModifiedOn = DateTime.Now;
            _admissionDbContext.Entry(BedFeatureMap).State = EntityState.Modified;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.CreatedOn).IsModified = false;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.CreatedBy).IsModified = false;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.WardId).IsModified = true;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.BedFeatureId).IsModified = true;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.ModifiedOn).IsModified = true;
            _admissionDbContext.Entry(BedFeatureMap).Property(x => x.ModifiedBy).IsModified = true;

            //});
            _admissionDbContext.SaveChanges();
            return bedFeaturesMap;
        }

        private object UpdateWard(string ipDataStr)

        {

            WardModel ward = DanpheJSONConvert.DeserializeObject<WardModel>(ipDataStr);
            if (CheckForWardDuplicate(_admissionDbContext, ward, true) == false)
            {
                var oldWardName = _admissionDbContext.Wards.AsNoTracking().FirstOrDefault(a => a.WardId == ward.WardId).WardName.ToString();
                var NewStoreName = ward.WardName;

                //change the permission first as well.
                if (oldWardName != NewStoreName)
                {
                    var wardPermission = _rbacDbContext.Permissions.FirstOrDefault(p => p.PermissionName == "ward-" + oldWardName);
                    wardPermission.PermissionName = "ward-" + ward.WardName;
                    wardPermission.IsActive = ward.IsActive;
                    _rbacDbContext.SaveChanges();
                }
                _admissionDbContext.Wards.Attach(ward);
                _admissionDbContext.Entry(ward).State = EntityState.Modified;
                _admissionDbContext.Entry(ward).Property(x => x.CreatedOn).IsModified = false;
                _admissionDbContext.Entry(ward).Property(x => x.CreatedBy).IsModified = false;
                ward.ModifiedOn = System.DateTime.Now;
                _admissionDbContext.SaveChanges();
            }
            return ward;
        }
        private object UpdateAutoBillingItem(string ipDataStr)

        {
            var parameter = _coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
            if (parameter != null)
            {
                parameter.ParameterValue = ipDataStr;
                _coreDbContext.Entry(parameter).State = EntityState.Modified;
                _coreDbContext.SaveChanges();
            }
            return parameter;
        }
    }
}
