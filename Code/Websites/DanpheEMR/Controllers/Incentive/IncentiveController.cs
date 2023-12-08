using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel.IncentiveModels;
using DanpheEMR.ServerModel;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.Security;
using DanpheEMR.Enums;
using AutoMapper;

namespace DanpheEMR.Controllers
{
    public class IncentiveController : CommonController
    {
        private readonly IncentiveDbContext _incentiveDbContext;
        private readonly BillingDbContext _billingDbContext;
        public IncentiveController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _incentiveDbContext = new IncentiveDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
        }

        #region Get APIs

        [HttpGet]
        [Route("Profiles")]
        public IActionResult Profiles()
        {
            //if (reqType == "profileList")
            Func<object> func = () => (from p in _incentiveDbContext.Profile
                                       join c in _incentiveDbContext.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
                                       select new
                                       {
                                           p.ProfileId,
                                           p.ProfileName,
                                           p.PriceCategoryId,
                                           c.PriceCategoryName,
                                           p.TDSPercentage,
                                           p.IsActive,
                                           p.Description
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Categories")]
        public IActionResult Categories()
        {
            //if (reqType == "categoryList")
            Func<object> func = () => _incentiveDbContext.PriceCategories.Where(a => a.IsActive == true).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ProfileItems")]
        public IActionResult ProfileItems()
        {
            //else if (reqType == "getItemsforProfile")
            Func<object> func = () => (from itm in _billingDbContext.BillServiceItems
                                       join dep in _billingDbContext.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                       where
                                       //itm.IsFractionApplicable == true && 
                                       itm.IsActive == true
                                       select new
                                       {
                                           itm.ServiceItemId,
                                           itm.ItemName,
                                           dep.ServiceDepartmentName,
                                           dep.Department
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ProfileItemsMapping")]
        public IActionResult ProfileItemsMapping(int profileId)
        {
            //else if (reqType == "getProfileItemsMapping")
            Func<object> func = () => GetProfileItemsMapping(profileId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("EmployeesIncentiveInfo")]
        public IActionResult EmployeesIncentiveInfo()
        {
            //else if (reqType == "getEmployeeIncentiveInfo")
            Func<object> func = () => (from empInctvinfo in _incentiveDbContext.EmployeeIncentiveInfo
                                       join emp in _incentiveDbContext.Employee on empInctvinfo.EmployeeId equals emp.EmployeeId
                                       select new
                                       {
                                           empInctvinfo.EmployeeIncentiveInfoId,
                                           emp.EmployeeId,
                                           emp.FullName,
                                           empInctvinfo.TDSPercent,
                                           EmpTDSPercent = emp.TDSPercent,
                                           empInctvinfo.IsActive,
                                           empInctvinfo.CreatedBy,
                                           empInctvinfo.CreatedOn
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("IncentiveItems")]
        public IActionResult IncentiveItems(int priceCategoryId)
        {
            Func<object> func = () => GetIncentiveItems(priceCategoryId);
            return InvokeHttpGetFunction(func);
        }

        private object GetIncentiveItems(int priceCategoryId)
        {
            //else if (reqType == "getItemsForIncentive")
            var defaultPriceCategory = _billingDbContext.PriceCategoryModels.FirstOrDefault(a => a.IsDefault == true);
            if (priceCategoryId == 0 || priceCategoryId == null && defaultPriceCategory != null)
            {
                priceCategoryId = defaultPriceCategory.PriceCategoryId;
            }

            var incentiveItems = (from itm in _billingDbContext.BillServiceItems
                                      //join dep in _billingDbContext.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                  join srv in _billingDbContext.ServiceDepartment on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                  join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on itm.ServiceItemId equals priceCatServItem.ServiceItemId
                                  join priceCat in _billingDbContext.PriceCategoryModels on priceCatServItem.PriceCategoryId equals priceCat.PriceCategoryId
                                  where itm.IsActive == true && priceCatServItem.PriceCategoryId == priceCategoryId && itm.IsIncentiveApplicable == true
                                  select new
                                  {
                                      itm.ServiceItemId,
                                      itm.ItemName,
                                      priceCatServItem.Price,
                                      itm.ItemCode,
                                      srv.ServiceDepartmentName,
                                      srv.ServiceDepartmentShortName,
                                      priceCat.PriceCategoryName,
                                      Doctor = (from doc in _billingDbContext.Employee.DefaultIfEmpty()
                                                where doc.IsAppointmentApplicable == true && srv.IntegrationName == "OPD"
                                                && srv.ServiceDepartmentId == itm.ServiceDepartmentId
                                                select new
                                                {
                                                    DoctorId = doc != null ? doc.EmployeeId : 0,
                                                    DoctorName = doc != null ? doc.FullName : "",
                                                }).FirstOrDefault(),
                                  }).ToList().OrderBy(b => b.ServiceDepartmentName);
            return incentiveItems;

        }

        [HttpGet]
        [Route("EmployeeBillItems")]
        public IActionResult EmployeeBillItems(int employeeId)
        {
            //else if (reqType == "getEmployeeBillItemsList")
            Func<object> func = () => (from empInctvinfo in _incentiveDbContext.EmployeeIncentiveInfo
                                       join emp in _incentiveDbContext.Employee on empInctvinfo.EmployeeId equals emp.EmployeeId
                                       where empInctvinfo.EmployeeId == employeeId

                                       select new
                                       {
                                           empInctvinfo.EmployeeIncentiveInfoId,
                                           emp.EmployeeId,
                                           emp.FullName,
                                           empInctvinfo.TDSPercent,
                                           EmpTDSPercent = emp.TDSPercent,
                                           empInctvinfo.IsActive,
                                           EmployeeBillItemsMap = (from empBillItmMap in _incentiveDbContext.EmployeeBillItemsMap
                                                                   where empBillItmMap.EmployeeId == empInctvinfo.EmployeeId
                                                                   join bilItm in _incentiveDbContext.ServiceItems on empBillItmMap.ServiceItemId equals bilItm.ServiceItemId
                                                                   join servDep in _incentiveDbContext.ServiceDepartments on bilItm.ServiceDepartmentId equals servDep.ServiceDepartmentId
                                                                   join priceCat in _incentiveDbContext.PriceCategories on empBillItmMap.PriceCategoryId equals priceCat.PriceCategoryId
                                                                   where empBillItmMap.IsActive && bilItm.IsActive == true
                                                                   //&& bilItm.IsFractionApplicable == true
                                                                   select new
                                                                   {
                                                                       empBillItmMap.EmployeeBillItemsMapId,
                                                                       empBillItmMap.EmployeeId,
                                                                       empBillItmMap.PriceCategoryId,
                                                                       priceCat.PriceCategoryName,
                                                                       empBillItmMap.ServiceItemId,
                                                                       empBillItmMap.PerformerPercent,
                                                                       empBillItmMap.PrescriberPercent,
                                                                       ReferrerPercent = empBillItmMap.ReferrerPercent != null ? empBillItmMap.ReferrerPercent : 0,
                                                                       empBillItmMap.IsActive,
                                                                       empBillItmMap.HasGroupDistribution,
                                                                       empBillItmMap.BillingTypesApplicable,
                                                                       empBillItmMap.CreatedBy,
                                                                       empBillItmMap.CreatedOn,
                                                                       bilItm.ItemName,
                                                                       ServiceDepartmentId = servDep.ServiceDepartmentId,
                                                                       DepartmentName = servDep.ServiceDepartmentName,
                                                                       GroupDistribution = _incentiveDbContext.ItemGroupDistribution.Where(a => a.EmployeeBillItemsMapId == empBillItmMap.EmployeeBillItemsMapId).ToList(),
                                                                       GroupDistributionCount = _incentiveDbContext.ItemGroupDistribution.Where(a => a.EmployeeBillItemsMapId == empBillItmMap.EmployeeBillItemsMapId).ToList().Count()
                                                                   }).ToList()
                                       }).FirstOrDefault();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TransactionItems")]
        public IActionResult TransactionItems(DateTime fromDate, DateTime toDate)
        {
            //else if (reqType == "view-txn-items-list")
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_INCTV_GetBillingTxnItems_BetweenDate", new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) }, _incentiveDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TransactionInvoices")]
        public IActionResult TransactionInvoices(DateTime fromDate, DateTime toDate, int? employeeId = 0)
        {
            //else if (reqType == "view-txn-InvoiceLevel")
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_INCTV_ViewTxn_InvoiceLevel", new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate), new SqlParameter("@EmployeeId", employeeId), }, _incentiveDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TransactionInvoiceItems")]
        public IActionResult TransactionInvoiceItems(int BillingTransactionId)
        {
            //else if (reqType == "view-txn-InvoiceItemLevel")
            Func<object> func = () => GetTransactionInvoiceItems(BillingTransactionId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("FractionOfBillTransactionItems")]
        public IActionResult FractionOfBillTransactionItems(int billTxnItemId)
        {
            //else if (reqType == "get-fractionof-billtxnitem")
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_INCTV_GetFractionItems_ByTxnItemId", new List<SqlParameter>() { new SqlParameter("@BillingTansactionItemId", billTxnItemId) }, _incentiveDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("IncentiveApplicableDoctors")]
        public IActionResult IncentiveApplicableDoctors()
        {
            //else if (reqType == "incentive-applicable-docter-list")
            Func<object> func = () => (from emp in _incentiveDbContext.Employee
                                       where emp.IsActive == true && emp.IsIncentiveApplicable == true
                                       select emp).OrderBy(a => a.FirstName).ToList();
            return InvokeHttpGetFunction(func);
        }

        #endregion

        #region Post APIs

        [HttpPost]
        [Route("Profile")]
        public IActionResult AddProfile()
        {
            //if (reqType == "addProfile")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveProfile(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("MapProfileItems")]
        public IActionResult MapProfileItems()
        {
            //else if (reqType == "saveProfileItemMap")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveProfileItemsMap(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("MapEmployeeBillItems")]
        public IActionResult MapEmployeeBillItems()
        {
            //else if (reqType == "saveEmployeeBillItemsMap")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveEmployeeBillItemsMap(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ActivateDeactivateEmployeeSetup")]
        public IActionResult ActivateDeactivateEmployeeSetup()
        {
            //else if (reqType == "activateDeactivateEmployeeSetup")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => ActivateDeactivateEmployee(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("EmployeeBillItems")]
        public IActionResult EmployeeBillItem()
        {
            //else if (reqType == "updateEmployeeBillItem")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateEmployeeBillItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ProfileBillItemMap")]
        public IActionResult ProfileBillItemMap()
        {
            //else if (reqType == "updateProfileBillItemMap")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateProfileBillItemMap(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("RemoveBillItem")]
        public IActionResult RemoveBillItem()
        {
            //else if (reqType == "removeSelectedBillItem")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => RemoveSelectedBillItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("RemoveBillItemFromProfileMap")]
        public IActionResult RemoveBillItemFromProfileMap()
        {
            //else if (reqType == "removeSelectedBillItemFromProfileMap")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => RemoveSelectedBillItemFromProfileMap(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ItemsGroupDistribution")]
        public IActionResult ItemsGroupDistribution()
        {
            //else if (reqType == "saveItemGroupDistribution")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveItemsGroupDistribution(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("FractionItems")]
        public IActionResult FractionItems()
        {
            //else if (reqType == "save-fraction-items")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveFractionItems(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("Transactions")]
        public IActionResult Transactions(string fromDate, string toDate)
        {
            //else if (reqType == "load-uptodate-transactions")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UptodateTransactions(fromDate, toDate);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ActivateDeactivateProfile")]
        public IActionResult ActivateDeactivateProfile()
        {
            //else if (reqType == "activateDeactivateProfile")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateDeactivateProfileSetup(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        #endregion

        #region PUT APIs

        [HttpPut]
        [Route("Profile")]
        public IActionResult UpdateProfile()
        {
            //if (reqType == "updateProfile")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PutProfile(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillTransactionItems")]
        public IActionResult BillTransactionItems()
        {
            //else if (reqType == "update-billtxnItem")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillTransactionItems(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        #endregion



        private object GetProfileItemsMapping(int profileId)
        {
            //var itemsDetails = (from itm in _billingDbContext.BillServiceItems
            //                    join dep in _billingDbContext.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
            //                    join srv in _billingDbContext.ServiceDepartment on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
            //                    where
            //                    //itm.IsFractionApplicable == true &&
            //                    itm.IsActive == true
            //                    select new
            //                    {
            //                        itm.ServiceItemId,
            //                        itm.ItemName,
            //                        dep.ServiceDepartmentName,
            //                        Doctor = (from doc in _billingDbContext.Employee.DefaultIfEmpty()
            //                                  where doc.IsAppointmentApplicable == true && doc.EmployeeId == itm.IntegrationItemId && srv.IntegrationName == "OPD"
            //                                  && srv.ServiceDepartmentId == itm.ServiceDepartmentId
            //                                  select new
            //                                  {
            //                                      DoctorId = doc != null ? doc.EmployeeId : 0,
            //                                      DoctorName = doc != null ? doc.FullName : "",
            //                                  }).FirstOrDefault(),
            //                    }).ToList().OrderBy(b => b.ServiceDepartmentName);

            //var profileDetails = (from p in _incentiveDbContext.Profile
            //                      join c in _incentiveDbContext.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
            //                      where p.ProfileId == profileId
            //                      select new
            //                      {
            //                          p.ProfileId,
            //                          p.ProfileName,
            //                          c.PriceCategoryId,
            //                          c.PriceCategoryName,
            //                          MappedItems = _incentiveDbContext.ProfileItemMap.Where(a => a.ProfileId == p.ProfileId && a.IsActive == true).ToList()
            //                      }).FirstOrDefault();

            //var result = new { profileDetails, itemsDetails };
            var result = (from profile in _incentiveDbContext.Profile
                          join priceCat in _incentiveDbContext.PriceCategories on profile.PriceCategoryId equals priceCat.PriceCategoryId
                          where profile.ProfileId == profileId
                          select new
                          {
                              profile.ProfileId,
                              profile.ProfileName,
                              profile.PriceCategoryId,
                              priceCat.PriceCategoryName,
                              MappedItems = (from profileItems in _incentiveDbContext.ProfileItemMap.Where(p => p.ProfileId == profileId)
                                             join priceCategory in _incentiveDbContext.PriceCategories on profileItems.PriceCategoryId equals priceCategory.PriceCategoryId
                                             join servItm in _incentiveDbContext.ServiceItems on profileItems.ServiceItemId equals servItm.ServiceItemId
                                             join servDep in _incentiveDbContext.ServiceDepartments on servItm.ServiceDepartmentId equals servDep.ServiceDepartmentId
                                             select new
                                             {
                                                 BillItemProfileMapId = profileItems.BillItemProfileMapId,
                                                 ProfileId = profileItems.ProfileId,
                                                 ServiceItemId = profileItems.ServiceItemId,
                                                 PerformerPercent = profileItems.PerformerPercent,
                                                 PrescriberPercent = profileItems.PrescriberPercent,
                                                 PriceCategoryId = profileItems.PriceCategoryId,
                                                 PriceCategoryName = priceCategory.PriceCategoryName,
                                                 BillingTypesApplicable = profileItems.BillingTypesApplicable,
                                                 ReferrerPercent = profileItems.ReferrerPercent,
                                                 IsActive = profileItems.IsActive,
                                                 ItemName = servItm.ItemName,
                                                 ServiceDepartmentId = servDep.ServiceDepartmentId,
                                                 DepartmentName = servDep.ServiceDepartmentName
                                             }).ToList()
                          }).FirstOrDefault();
            return result;
        }
        private object GetTransactionInvoiceItems(int BillingTansactionId)
        {
            DataSet dsInvItmDetails = DALFunctions.GetDatasetFromStoredProc("SP_INCTV_ViewTxn_InvoiceItemLevel", new List<SqlParameter>() {
                    new SqlParameter("@BillingTansactionId",BillingTansactionId) }, _incentiveDbContext);

            DataTable dt0_TxnItmInfo = null;
            DataTable dt1_FractionInfo = null;

            if (dsInvItmDetails != null && dsInvItmDetails.Tables.Count > 1)
            {
                dt0_TxnItmInfo = dsInvItmDetails.Tables[0];
                dt1_FractionInfo = dsInvItmDetails.Tables[1];
                //create new dynamic object from here.. 
                return new { TxnItems = dt0_TxnItmInfo, FractionItems = dt1_FractionInfo };

            }
            else
            {
                throw new Exception("Couldn't find Details of this invoice.");
            }
        }



        private object SaveProfile(string ipDataStr, RbacUser currentUser)
        {
            ProfileModel profileMaster = DanpheJSONConvert.DeserializeObject<ProfileModel>(ipDataStr);
            Boolean flag = IncentiveBL.AddEmployeeProfile(profileMaster, _incentiveDbContext, currentUser.EmployeeId);
            if (flag)
            {
                return profileMaster;
            }
            else
            {
                throw new Exception("check console for error details.");
            }
        }
        private object SaveProfileItemsMap(string ipDataStr, RbacUser currentUser)
        {
            List<ProfileItemMap> profileItemMaps = DanpheJSONConvert.DeserializeObject<List<ProfileItemMap>>(ipDataStr);
            Boolean flag = false;
            flag = IncentiveBL.ProfileItemMapping(profileItemMaps, _incentiveDbContext, currentUser.EmployeeId);

            if (flag)
            {
                return 1;
            }
            else
            {
                throw new Exception("check console for error details.");
            }
        }
        private object SaveEmployeeBillItemsMap(string ipDataStr, RbacUser currentUser)
        {
            EmployeeIncentiveInfo EmployeeIncentiveInfo = DanpheJSONConvert.DeserializeObject<EmployeeIncentiveInfo>(ipDataStr);

            using (var dbContextTxn = _incentiveDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (EmployeeIncentiveInfo.EmployeeIncentiveInfoId != 0)
                    {
                        var empInctvInfo = _incentiveDbContext.EmployeeIncentiveInfo.Where(a => a.EmployeeIncentiveInfoId == EmployeeIncentiveInfo.EmployeeIncentiveInfoId).FirstOrDefault();
                        empInctvInfo.TDSPercent = EmployeeIncentiveInfo.TDSPercent;
                        empInctvInfo.IsActive = EmployeeIncentiveInfo.IsActive;
                        _incentiveDbContext.Entry(empInctvInfo).Property(x => x.TDSPercent).IsModified = true;
                        _incentiveDbContext.Entry(empInctvInfo).Property(x => x.IsActive).IsModified = true;

                        _incentiveDbContext.SaveChanges();
                        if (EmployeeIncentiveInfo.EmployeeBillItemsMap != null && EmployeeIncentiveInfo.EmployeeBillItemsMap.Count > 0)
                        {
                            IncentiveBL.EmployeeItemMapping(EmployeeIncentiveInfo.EmployeeBillItemsMap, _incentiveDbContext, currentUser.EmployeeId);
                        }
                    }
                    else
                    {
                        EmployeeIncentiveInfo.CreatedBy = currentUser.EmployeeId;
                        EmployeeIncentiveInfo.CreatedOn = DateTime.Now;
                        _incentiveDbContext.EmployeeIncentiveInfo.Add(EmployeeIncentiveInfo);
                        _incentiveDbContext.SaveChanges();
                        if (EmployeeIncentiveInfo.EmployeeBillItemsMap != null && EmployeeIncentiveInfo.EmployeeBillItemsMap.Count > 0)
                        {
                            IncentiveBL.EmployeeItemMapping(EmployeeIncentiveInfo.EmployeeBillItemsMap, _incentiveDbContext, currentUser.EmployeeId);
                        }
                    }

                    dbContextTxn.Commit();
                    return EmployeeIncentiveInfo;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        private object ActivateDeactivateEmployee(string ipDataStr)
        {
            EmployeeIncentiveInfo EmployeeIncentiveInfo = DanpheJSONConvert.DeserializeObject<EmployeeIncentiveInfo>(ipDataStr);

            using (var dbContextTxn = _incentiveDbContext.Database.BeginTransaction())
            {
                try
                {
                    var empInctvInfo = _incentiveDbContext.EmployeeIncentiveInfo.Where(a => a.EmployeeIncentiveInfoId == EmployeeIncentiveInfo.EmployeeIncentiveInfoId).FirstOrDefault();
                    empInctvInfo.IsActive = EmployeeIncentiveInfo.IsActive;
                    _incentiveDbContext.Entry(empInctvInfo).Property(x => x.IsActive).IsModified = true;
                    _incentiveDbContext.SaveChanges();

                    List<EmployeeBillItemsMap> EmployeeBillItemsMap = _incentiveDbContext.EmployeeBillItemsMap.Where(a => a.EmployeeId == EmployeeIncentiveInfo.EmployeeId).ToList();
                    EmployeeBillItemsMap.ForEach(a =>
                    {
                        a.IsActive = EmployeeIncentiveInfo.IsActive;
                        _incentiveDbContext.Entry(a).Property(x => x.IsActive).IsModified = true;
                        _incentiveDbContext.SaveChanges();

                        if (a.HasGroupDistribution == true)
                        {
                            List<ItemGroupDistribution> grpDist = _incentiveDbContext.ItemGroupDistribution.Where(b => b.EmployeeBillItemsMapId == a.EmployeeBillItemsMapId).ToList();
                            grpDist.ForEach(grp =>
                            {
                                grp.IsActive = a.IsActive;
                                _incentiveDbContext.Entry(grp).Property(x => x.IsActive).IsModified = true;
                                _incentiveDbContext.SaveChanges();
                            });
                        }

                    });
                    //IncentiveBL.EmployeeItemMapping(EmployeeBillItemsMap, incentiveDb, currentUser.EmployeeId);

                    dbContextTxn.Commit();
                    return EmployeeIncentiveInfo;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        private object UpdateEmployeeBillItem(string ipDataStr, RbacUser currentUser)
        {
            try
            {
                EmployeeBillItemsMap employeeBillItem = DanpheJSONConvert.DeserializeObject<EmployeeBillItemsMap>(ipDataStr);

                var empBillItmMap = _incentiveDbContext.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == employeeBillItem.EmployeeBillItemsMapId).FirstOrDefault();
                empBillItmMap.PerformerPercent = employeeBillItem.PerformerPercent;
                empBillItmMap.PrescriberPercent = employeeBillItem.PrescriberPercent;
                empBillItmMap.ReferrerPercent = employeeBillItem.ReferrerPercent;
                empBillItmMap.BillingTypesApplicable = employeeBillItem.BillingTypesApplicable;
                empBillItmMap.IsActive = employeeBillItem.IsActive;
                empBillItmMap.ModifiedBy = currentUser.EmployeeId;
                empBillItmMap.ModifiedOn = DateTime.Now;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.PerformerPercent).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.PrescriberPercent).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.ReferrerPercent).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.IsActive).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.ModifiedBy).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.ModifiedOn).IsModified = true;
                _incentiveDbContext.Entry(empBillItmMap).Property(x => x.BillingTypesApplicable).IsModified = true;
                _incentiveDbContext.SaveChanges();
                return employeeBillItem;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }
        private object UpdateProfileBillItemMap(string ipDataStr, RbacUser currentUser)
        {
            try
            {
                ProfileItemMap ProfileBillItemMap = DanpheJSONConvert.DeserializeObject<ProfileItemMap>(ipDataStr);

                var aa = _incentiveDbContext.ProfileItemMap.Where(a => a.BillItemProfileMapId == ProfileBillItemMap.BillItemProfileMapId).FirstOrDefault();
                aa.PerformerPercent = ProfileBillItemMap.PerformerPercent;
                aa.PrescriberPercent = ProfileBillItemMap.PrescriberPercent;
                aa.ReferrerPercent = ProfileBillItemMap.ReferrerPercent;
                aa.BillingTypesApplicable = ProfileBillItemMap.BillingTypesApplicable;
                aa.ModifiedBy = currentUser.EmployeeId;
                aa.ModifiedOn = DateTime.Now;

                _incentiveDbContext.Entry(aa).Property(x => x.PerformerPercent).IsModified = true;
                _incentiveDbContext.Entry(aa).Property(x => x.PrescriberPercent).IsModified = true;
                _incentiveDbContext.Entry(aa).Property(x => x.ReferrerPercent).IsModified = true;
                _incentiveDbContext.Entry(aa).Property(x => x.BillingTypesApplicable).IsModified = true;
                _incentiveDbContext.SaveChanges();
                return ProfileBillItemMap;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }
        private object RemoveSelectedBillItem(string ipDataStr, RbacUser currentUser)
        {
            using (var dbContextTxn = _incentiveDbContext.Database.BeginTransaction())
            {
                try
                {
                    EmployeeBillItemsMap employeeBillItem = DanpheJSONConvert.DeserializeObject<EmployeeBillItemsMap>(ipDataStr);

                    var empBillItmMap = _incentiveDbContext.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == employeeBillItem.EmployeeBillItemsMapId).FirstOrDefault();
                    empBillItmMap.IsActive = employeeBillItem.IsActive;
                    empBillItmMap.HasGroupDistribution = false;
                    empBillItmMap.ModifiedBy = currentUser.EmployeeId;
                    empBillItmMap.ModifiedOn = DateTime.Now;
                    _incentiveDbContext.Entry(empBillItmMap).Property(x => x.HasGroupDistribution).IsModified = true;
                    _incentiveDbContext.Entry(empBillItmMap).Property(x => x.IsActive).IsModified = true;
                    _incentiveDbContext.Entry(empBillItmMap).Property(x => x.ModifiedBy).IsModified = true;
                    _incentiveDbContext.Entry(empBillItmMap).Property(x => x.ModifiedOn).IsModified = true;
                    _incentiveDbContext.SaveChanges();

                    if (employeeBillItem.GroupDistribution.Count > 0)
                    {
                        foreach (var groupDist in employeeBillItem.GroupDistribution)
                        {
                            var aa = _incentiveDbContext.ItemGroupDistribution.Where(a => a.ItemGroupDistributionId == groupDist.ItemGroupDistributionId).FirstOrDefault();
                            _incentiveDbContext.ItemGroupDistribution.Remove(aa);
                            _incentiveDbContext.SaveChanges();
                        }
                    }
                    dbContextTxn.Commit();
                    return employeeBillItem;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
            }
        }
        private object RemoveSelectedBillItemFromProfileMap(string ipDataStr)
        {
            try
            {
                ProfileItemMap ProfileBillItemMap = DanpheJSONConvert.DeserializeObject<ProfileItemMap>(ipDataStr);

                var ItemToRemove = _incentiveDbContext.ProfileItemMap.Where(a => a.BillItemProfileMapId == ProfileBillItemMap.BillItemProfileMapId).FirstOrDefault();
                ItemToRemove.IsActive = false;
                _incentiveDbContext.Entry(ItemToRemove).Property(x => x.IsActive).IsModified = true;
                _incentiveDbContext.SaveChanges();
                return ProfileBillItemMap;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }
        private object SaveItemsGroupDistribution(string ipDataStr, RbacUser currentUser)
        {
            List<ItemGroupDistribution> itmGrpDistributionsFromClient = DanpheJSONConvert.DeserializeObject<List<ItemGroupDistribution>>(ipDataStr);
            using (var dbContextTxn = _incentiveDbContext.Database.BeginTransaction())
            {
                try
                {
                    int empBillItemMapId = itmGrpDistributionsFromClient[0].EmployeeBillItemsMapId;

                    var empBillItemMap = _incentiveDbContext.EmployeeBillItemsMap.Where(bilItmMap => bilItmMap.EmployeeBillItemsMapId == empBillItemMapId).FirstOrDefault();
                    var itemAllGrpDists_Server = _incentiveDbContext.ItemGroupDistribution.Where(itm => itm.EmployeeBillItemsMapId == empBillItemMap.EmployeeBillItemsMapId).ToList();
                    if (itemAllGrpDists_Server != null && itemAllGrpDists_Server.Count > 0)
                    {
                        //at first, remove all groupDistributions and set HasGroupDistribution=false for current empBillItemMapId.
                        empBillItemMap.HasGroupDistribution = false;
                        _incentiveDbContext.Entry(empBillItemMap).Property(x => x.HasGroupDistribution).IsModified = true;
                        itemAllGrpDists_Server.ForEach(itm =>
                        {
                            _incentiveDbContext.ItemGroupDistribution.Remove(itm);
                        });
                        _incentiveDbContext.SaveChanges();
                    }

                    if (itmGrpDistributionsFromClient != null && itmGrpDistributionsFromClient.Where(itm => itm.IsActive == true).Count() > 1)
                    {
                        foreach (ItemGroupDistribution groupDist in itmGrpDistributionsFromClient)
                        {
                            groupDist.EmployeeBillItemsMapId = empBillItemMap.EmployeeBillItemsMapId;
                            groupDist.CreatedOn = DateTime.Now;
                            groupDist.CreatedBy = currentUser.EmployeeId;
                            _incentiveDbContext.ItemGroupDistribution.Add(groupDist);
                        }

                        empBillItemMap.HasGroupDistribution = true;
                        _incentiveDbContext.Entry(empBillItemMap).Property(x => x.HasGroupDistribution).IsModified = true;
                        _incentiveDbContext.SaveChanges();
                    }
                    _incentiveDbContext.SaveChanges();

                    dbContextTxn.Commit();
                    return itmGrpDistributionsFromClient;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        private object SaveFractionItems(string ipDataStr, RbacUser currentUser)
        {
            List<IncentiveFractionItemModel> fractionItems = DanpheJSONConvert.DeserializeObject<List<IncentiveFractionItemModel>>(ipDataStr);
            if (fractionItems != null && fractionItems.Count > 0)
            {
                foreach (var item in fractionItems)
                {
                    if (item.InctvTxnItemId == 0 || item.InctvTxnItemId == null)
                    {
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = DateTime.Now;
                        _incentiveDbContext.IncentiveFractionItems.Add(item);
                    }
                    else
                    {
                        item.ModifiedBy = currentUser.EmployeeId;
                        item.ModifiedOn = DateTime.Now;
                        _incentiveDbContext.IncentiveFractionItems.Attach(item);
                        _incentiveDbContext.Entry(item).Property(x => x.IncentiveReceiverId).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.IncentiveReceiverName).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.FinalIncentivePercent).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.InitialIncentivePercent).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.IncentiveAmount).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.IncentiveType).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.TDSPercentage).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.TDSAmount).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.ModifiedBy).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.ModifiedOn).IsModified = true;
                        _incentiveDbContext.Entry(item).Property(x => x.IsActive).IsModified = true;
                    }
                }
                _incentiveDbContext.SaveChanges();
            }
            return fractionItems;
        }
        private object UptodateTransactions(string fromDate, string toDate)
        {
            List<SqlParameter> paramList_sales = new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) };

            DataTable retTable = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange", paramList_sales, _incentiveDbContext);
            List<SqlParameter> paramList_salesReturn = new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) };
            DataTable retTable_salesReturnCases = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange", paramList_salesReturn, _incentiveDbContext);
            return retTable;
        }
        private object ActivateDeactivateProfileSetup(string ipDataStr, RbacUser currentUser)
        {
            ProfileModel profile = DanpheJSONConvert.DeserializeObject<ProfileModel>(ipDataStr);

            try
            {
                var curProfile = _incentiveDbContext.Profile.Where(a => a.ProfileId == profile.ProfileId).FirstOrDefault();
                curProfile.IsActive = profile.IsActive;
                curProfile.ModifiedBy = currentUser.EmployeeId;
                curProfile.ModifiedOn = DateTime.Now;
                _incentiveDbContext.Entry(curProfile).Property(x => x.IsActive).IsModified = true;
                _incentiveDbContext.Entry(curProfile).Property(x => x.ModifiedBy).IsModified = true;
                _incentiveDbContext.Entry(curProfile).Property(x => x.ModifiedOn).IsModified = true;
                _incentiveDbContext.SaveChanges();
                return curProfile;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }


        private object PutProfile(string ipDataStr, RbacUser currentUser)
        {
            ProfileModel profileData = DanpheJSONConvert.DeserializeObject<ProfileModel>(ipDataStr);

            var profile = _incentiveDbContext.Profile.Where(a => a.ProfileId == profileData.ProfileId).FirstOrDefault();
            profile.ProfileName = profileData.ProfileName;
            profile.Description = profileData.Description;
            profile.ModifiedBy = currentUser.EmployeeId;
            profile.ModifiedOn = DateTime.Now;
            _incentiveDbContext.Entry(profile).Property(x => x.ProfileName).IsModified = true;
            _incentiveDbContext.Entry(profile).Property(x => x.Description).IsModified = true;
            _incentiveDbContext.Entry(profile).Property(x => x.ModifiedOn).IsModified = true;
            _incentiveDbContext.Entry(profile).Property(x => x.ModifiedBy).IsModified = true;
            _incentiveDbContext.SaveChanges();
            return profileData;
        }
        private object UpdateBillTransactionItems(string ipDataStr, RbacUser currentUser)
        {
            List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataStr);
            if (txnItems != null)
            {
                txnItems.ForEach(item =>
                {
                    item.ModifiedBy = currentUser.EmployeeId;
                    IncentiveBL.UpdateBillingTransactionItems(_billingDbContext, item);
                });
            }
            return txnItems;
        }



        /*#region reqType(Get)
        [HttpGet]
        public string Get(string reqType, int profileId, DateTime fromDate, DateTime toDate, int? BillingTansactionId, int? employeeId, int? billTxnItemId, int? accHospitalId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            IncentiveDbContext incentiveDb = new IncentiveDbContext(connString);
            BillingDbContext billingDb = new BillingDbContext(connString);


            try
            {
                List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);

                #region Get List of Profiles
                if (reqType == "profileList")
                {
                    var result = (from p in incentiveDb.Profile
                                  join c in incentiveDb.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
                                  select new
                                  {
                                      p.ProfileId,
                                      p.ProfileName,
                                      p.PriceCategoryId,
                                      c.PriceCategoryName,
                                      p.TDSPercentage,
                                      p.IsActive,
                                      p.Description
                                  }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region Get List of Category (IsActive == true)
                else if (reqType == "categoryList")
                {
                    var result = incentiveDb.PriceCategories.Where(a => a.IsActive == true).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region Get Employee Profile Map list
                else if (reqType == "empWithProfileMap")
                {
                    //Pratik: 9th Nov 2020: Table  INCTV_EMP_Profile_Map is removed from DB

                    //var result = (from e in empListFromCache
                    //              where incentiveDb.EMPProfileMap.Any(ep => ep.EmployeeId == e.EmployeeId)
                    //              select new
                    //              {
                    //                  e.EmployeeId,
                    //                  EmployeeName = e.FullName,
                    //                  ProfileNames = string.Join(",", (from ep in incentiveDb.EMPProfileMap
                    //                                                   join p in incentiveDb.Profile on ep.ProfileId equals p.ProfileId
                    //                                                   where ep.EmployeeId == e.EmployeeId
                    //                                                   select p.ProfileName)),
                    //                  Profiles = (from ep in incentiveDb.EMPProfileMap
                    //                              join p in incentiveDb.Profile on ep.ProfileId equals p.ProfileId
                    //                              join c in incentiveDb.PriceCategories on ep.PriceCategoryId equals c.PriceCategoryId
                    //                              where ep.EmployeeId == e.EmployeeId
                    //                              select new
                    //                              {
                    //                                  ep.EMPProfileMapId,
                    //                                  p.ProfileId,
                    //                                  p.ProfileName,
                    //                                  c.PriceCategoryId,
                    //                                  c.PriceCategoryName
                    //                              }).ToList()
                    //              }).ToList();
                    //var result = (from ep in incentiveDb.EMPProfileMap
                    //              join e in empListFromCache on ep.EmployeeId equals e.EmployeeId
                    //              select new
                    //              {
                    //                  ep.EMPProfileMapId,
                    //                  EmployeeName = e.Salutation + ". " + e.FirstName + " " + (string.IsNullOrEmpty(e.MiddleName) ? "" : e.MiddleName + " ") + e.LastName,
                    //                  Profiles = (from p in incentiveDb.Profile
                    //                              join c in incentiveDb.PriceCategory on p.PriceCategoryId equals c.PriceCategoryId
                    //                              where p.ProfileId == ep.ProfileId
                    //                              select new
                    //                              {
                    //                                  p.ProfileId,
                    //                                  p.ProfileName,
                    //                                  c.CategoryName
                    //                              }).ToList(),
                    //              }).ToList();

                    responseData.Status = "OK";
                    //responseData.Results = { 'Table  INCTV_EMP_Profile_Map is removed from DB'};
                }
                #endregion
                #region Get List of Employee not yet mapped with profile
                else if (reqType == "empWithoutProfileMap")
                {
                    //Pratik: 9th Nov 2020: Table  INCTV_EMP_Profile_Map is removed from DB

                    //var result = empListFromCache.Where(e => !incentiveDb.EMPProfileMap.Any(ep => ep.EmployeeId == e.EmployeeId))
                    //    .Select(a => new { a.EmployeeId, a.FullName }).ToList();

                    responseData.Status = "OK";
                    //responseData.Results = { Resust: "Table  INCTV_EMP_Profile_Map is removed from DB"};
                }
                #endregion
                #region Profile List for Employee Mapping
                else if (reqType == "profileListForMapping")
                {
                    var result = (from c in incentiveDb.PriceCategories
                                  select new
                                  {
                                      c.PriceCategoryId,
                                      c.PriceCategoryName,
                                      Profiles = incentiveDb.Profile.Where(a => a.PriceCategoryId == c.PriceCategoryId).Select(a => new { a.ProfileId, a.ProfileName }).ToList()
                                  }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region List of Profiles (IsActive == true)
                else if (reqType == "activeProfileList")
                {
                    var result = (from p in incentiveDb.Profile
                                  join c in incentiveDb.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
                                  where p.IsActive == true
                                  select new
                                  {
                                      p.ProfileId,
                                      p.ProfileName,
                                      p.PriceCategoryId,
                                      c.PriceCategoryName
                                  }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region List of Billing Items (isFractionApplicable == true && IsActive == true)
                else if (reqType == "getItemsforProfile")
                {
                    var result = (from itm in billingDb.BillItemPrice
                                  join dep in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                  where itm.IsFractionApplicable == true && itm.IsActive == true
                                  select new
                                  {
                                      itm.BillItemPriceId,
                                      itm.ItemName,
                                      dep.ServiceDepartmentName,
                                      dep.Department
                                  }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region Get Profile Items Mappings
                else if (reqType == "getProfileItemsMapping")
                {
                    var itemsDetails = (from itm in billingDb.BillItemPrice
                                        join dep in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                        join srv in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                        where itm.IsFractionApplicable == true && itm.IsActive == true
                                        select new
                                        {
                                            itm.BillItemPriceId,
                                            itm.ItemName,
                                            dep.ServiceDepartmentName,
                                            //pratik : 29jan'20: // to show Doctor name alongside OPD charges
                                            Doctor = (from doc in billingDb.Employee.DefaultIfEmpty()
                                                      where doc.IsAppointmentApplicable == true && doc.EmployeeId == itm.ItemId && srv.IntegrationName == "OPD"
                                                      && srv.ServiceDepartmentId == itm.ServiceDepartmentId
                                                      select new
                                                      {
                                                          //Temporary logic, correct it later on... 
                                                          DoctorId = doc != null ? doc.EmployeeId : 0,
                                                          DoctorName = doc != null ? doc.FullName : "",
                                                      }).FirstOrDefault(),
                                        }).ToList().OrderBy(b => b.ServiceDepartmentName);

                    var profileDetails = (from p in incentiveDb.Profile
                                          join c in incentiveDb.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
                                          where p.ProfileId == profileId
                                          select new
                                          {
                                              p.ProfileId,
                                              p.ProfileName,
                                              c.PriceCategoryId,
                                              c.PriceCategoryName,
                                              MappedItems = incentiveDb.ProfileItemMap.Where(a => a.ProfileId == p.ProfileId).ToList()
                                          }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = new { profileDetails, itemsDetails };
                }
                #endregion
                //pratik : 8May'20--
                #region Get Employee Items Mappings
                else if (reqType == "getEmployeeIncentiveInfo")
                {
                    var empIncentivInfo = (from empInctvinfo in incentiveDb.EmployeeIncentiveInfo
                                           join emp in incentiveDb.Employee on empInctvinfo.EmployeeId equals emp.EmployeeId
                                           select new
                                           {
                                               empInctvinfo.EmployeeIncentiveInfoId,
                                               emp.EmployeeId,
                                               emp.FullName,
                                               empInctvinfo.TDSPercent,
                                               EmpTDSPercent = emp.TDSPercent,
                                               empInctvinfo.IsActive,
                                               empInctvinfo.CreatedBy,
                                               empInctvinfo.CreatedOn,
                                               //EmployeeBillItemsMap = (from empBillItmMap in incentiveDb.EmployeeBillItemsMap
                                               //                        where empBillItmMap.EmployeeId == empInctvinfo.EmployeeId
                                               //                        select new
                                               //                        {
                                               //                            empBillItmMap.EmployeeBillItemsMapId,
                                               //                            empBillItmMap.EmployeeId,
                                               //                            empBillItmMap.PriceCategoryId,
                                               //                            empBillItmMap.BillItemPriceId,
                                               //                            empBillItmMap.AssignedToPercent,
                                               //                            empBillItmMap.ReferredByPercent,
                                               //                            empBillItmMap.HasGroupDistribution,
                                               //                            GroupDistribution = incentiveDb.ItemGroupDistribution.Where(a => a.EmployeeBillItemsMapId == empBillItmMap.EmployeeBillItemsMapId).ToList(),
                                               //                        }).ToList()
                                           }).ToList();



                    responseData.Status = "OK";
                    responseData.Results = empIncentivInfo;
                }
                else if (reqType == "getItemsForIncentive")
                {
                    var itemsDetails = (from itm in billingDb.BillItemPrice
                                        join dep in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                        join srv in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                        where itm.IsFractionApplicable == true && itm.IsActive == true
                                        select new
                                        {
                                            itm.BillItemPriceId,
                                            itm.ItemName,
                                            itm.Price,
                                            itm.ItemCode,
                                            dep.ServiceDepartmentName,
                                            dep.ServiceDepartmentShortName,
                                            //pratik : 29jan'20: // to show Doctor name alongside OPD charges
                                            Doctor = (from doc in billingDb.Employee.DefaultIfEmpty()
                                                      where doc.IsAppointmentApplicable == true && doc.EmployeeId == itm.ItemId && srv.IntegrationName == "OPD"
                                                      && srv.ServiceDepartmentId == itm.ServiceDepartmentId
                                                      select new
                                                      {
                                                          //Temporary logic, correct it later on... 
                                                          DoctorId = doc != null ? doc.EmployeeId : 0,
                                                          DoctorName = doc != null ? doc.FullName : "",
                                                      }).FirstOrDefault(),
                                        }).ToList().OrderBy(b => b.ServiceDepartmentName);



                    responseData.Status = "OK";
                    responseData.Results = itemsDetails;
                }
                #endregion
                else if (reqType == "getEmployeeBillItemsList")
                {
                    var empBillItemsList = (from empInctvinfo in incentiveDb.EmployeeIncentiveInfo
                                            join emp in incentiveDb.Employee on empInctvinfo.EmployeeId equals emp.EmployeeId
                                            where empInctvinfo.EmployeeId == employeeId

                                            select new
                                            {
                                                empInctvinfo.EmployeeIncentiveInfoId,
                                                emp.EmployeeId,
                                                emp.FullName,
                                                empInctvinfo.TDSPercent,
                                                EmpTDSPercent = emp.TDSPercent,
                                                empInctvinfo.IsActive,
                                                EmployeeBillItemsMap = (from empBillItmMap in incentiveDb.EmployeeBillItemsMap
                                                                        where empBillItmMap.EmployeeId == empInctvinfo.EmployeeId
                                                                        join bilItm in incentiveDb.BillItemPrice on empBillItmMap.BillItemPriceId equals bilItm.BillItemPriceId
                                                                        where empBillItmMap.IsActive && bilItm.IsActive == true && bilItm.IsFractionApplicable == true
                                                                        select new
                                                                        {
                                                                            empBillItmMap.EmployeeBillItemsMapId,
                                                                            empBillItmMap.EmployeeId,
                                                                            empBillItmMap.PriceCategoryId,
                                                                            empBillItmMap.BillItemPriceId,
                                                                            empBillItmMap.PerformerPercent,
                                                                            empBillItmMap.PrescriberPercent,
                                                                            ReferrerPercent = empBillItmMap.ReferrerPercent != null ? empBillItmMap.ReferrerPercent : 0,
                                                                            empBillItmMap.IsActive,
                                                                            empBillItmMap.HasGroupDistribution,
                                                                            empBillItmMap.BillingTypesApplicable,
                                                                            empBillItmMap.CreatedBy,
                                                                            empBillItmMap.CreatedOn,
                                                                            GroupDistribution = incentiveDb.ItemGroupDistribution.Where(a => a.EmployeeBillItemsMapId == empBillItmMap.EmployeeBillItemsMapId).ToList(),
                                                                        }).ToList()
                                            }).FirstOrDefault();



                    responseData.Status = "OK";
                    responseData.Results = empBillItemsList;
                }
                else if (reqType == "view-txn-items-list")
                {
                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_GetBillingTxnItems_BetweenDate", new List<SqlParameter>() {  new SqlParameter("@FromDate", fromDate),
                         new SqlParameter("@ToDate", toDate) }, incentiveDb);
                    responseData.Results = dt;
                    responseData.Status = "OK";
                }
                #region Get Incentive Setting by Employee ID
                else if (reqType == "getInctvSettingByEmpId")
                {
                    //var result = (from e in incentiveDb.EMPProfileMap
                    //              join p in incentiveDb.Profile on e.ProfileId equals p.ProfileId
                    //              join c in incentiveDb.PriceCategories on p.PriceCategoryId equals c.PriceCategoryId
                    //              where e.EmployeeId == employeeId
                    //              select new
                    //              {
                    //                  e.EmployeeId,
                    //                  p.ProfileName,
                    //                  c.PriceCategoryName,
                    //                  Items = incentiveDb.ProfileItemMap.Where(i => i.ProfileId == p.ProfileId)
                    //                  .Select(i => new { i.BillItemPriceId, i.AssignedToPercent, i.ReferredByPercent }).ToList()
                    //              }).ToList();

                    //List<int> itemIds = (from e in incentiveDb.EMPProfileMap
                    //                     join i in incentiveDb.ProfileItemMap on e.ProfileId equals i.ProfileId
                    //                     where e.EmployeeId == employeeId
                    //                     select i.BillItemPriceId).Distinct().ToList();

                    //var itemsDetails = (from itm in billingDb.BillItemPrice
                    //                    join dep in billingDb.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                    //                    where itemIds.Contains(itm.BillItemPriceId)
                    //                    select new
                    //                    {
                    //                        itm.BillItemPriceId,
                    //                        itm.ItemName,
                    //                        dep.ServiceDepartmentName
                    //                    }).ToList();

                    //responseData.Status = "OK";
                    //responseData.Results = new { Items = itemsDetails, PercentageDetails = result };
                }
                #endregion


                else if (reqType == "view-txn-InvoiceLevel")
                {
                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_ViewTxn_InvoiceLevel", new List<SqlParameter>() {  new SqlParameter("@FromDate", fromDate),
                         new SqlParameter("@ToDate", toDate), new SqlParameter("@EmployeeId", employeeId), }, incentiveDb);
                    responseData.Results = dt;
                    responseData.Status = "OK";
                }

                else if (reqType == "view-txn-InvoiceItemLevel")
                {
                    //sud:16Feb'20-- We're getting 2 tables from this stored prcedure and are returning them in separate Properties.
                    //Client side is working accordingly.
                    DataSet dsInvItmDetails = DALFunctions.GetDatasetFromStoredProc("SP_INCTV_ViewTxn_InvoiceItemLevel", new List<SqlParameter>() {
                        new SqlParameter("@BillingTansactionId",BillingTansactionId) }, incentiveDb);

                    DataTable dt0_TxnItmInfo = null;
                    DataTable dt1_FractionInfo = null;

                    if (dsInvItmDetails != null && dsInvItmDetails.Tables.Count > 1)
                    {
                        responseData.Status = "OK";
                        dt0_TxnItmInfo = dsInvItmDetails.Tables[0];
                        dt1_FractionInfo = dsInvItmDetails.Tables[1];
                        //create new dynamic object from here.. 
                        responseData.Results = new { TxnItems = dt0_TxnItmInfo, FractionItems = dt1_FractionInfo };

                    }
                    else
                    {
                        responseData.Results = null;
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Couldn't find Details of this invoice.";
                    }

                }

                else if (reqType == "get-fractionof-billtxnitem")
                {
                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_GetFractionItems_ByTxnItemId", new List<SqlParameter>() { new SqlParameter("@BillingTansactionItemId", billTxnItemId) }, incentiveDb);
                    responseData.Results = dt;
                    responseData.Status = "OK";

                }


                //else if (reqType == "GetEmpProfileMap")
                //{
                //    var result = (from empMap in incentiveDb.EMPProfileMap
                //                  join prof in incentiveDb.Profile on empMap.ProfileId equals prof.ProfileId
                //                  join pCat in incentiveDb.PriceCategories on prof.PriceCategoryId equals pCat.PriceCategoryId
                //                  join emp in incentiveDb.Employee on empMap.EmployeeId equals emp.EmployeeId

                //                  select new
                //                  {
                //                      emp.EmployeeId,
                //                      emp.FullName,
                //                      prof.ProfileId,
                //                      prof.ProfileName,
                //                      pCat.PriceCategoryName,
                //                      prof.TDSPercentage
                //                  }).ToList();


                //    responseData.Status = "OK";
                //    responseData.Results = result;
                //}
                else if (reqType == "GetEmpIncentiveInfo")
                {
                    var result = (from empInctvInfo in incentiveDb.EmployeeIncentiveInfo
                                  join emp in incentiveDb.Employee on empInctvInfo.EmployeeId equals emp.EmployeeId
                                  where empInctvInfo.IsActive == true
                                  select new
                                  {
                                      emp.EmployeeId,
                                      emp.FullName,
                                      empInctvInfo.TDSPercent
                                  }).ToList();


                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                //else if (reqType == "empBillItmMap")
                //{
                //    var result = (from empBillItmMap in incentiveDb.EmployeeBillItemsMap
                //                  join pCat in incentiveDb.PriceCategories on empBillItmMap.PriceCategoryId equals pCat.PriceCategoryId
                //                  join emp in incentiveDb.Employee on empBillItmMap.EmployeeId equals emp.EmployeeId
                //                  where empBillItmMap.IsActive == true
                //                  select new
                //                  {
                //                      emp.EmployeeId,
                //                      emp.FullName,
                //                      empBillItmMap.BillItemPriceId,
                //                      empBillItmMap.HasGroupDistribution,
                //                      empBillItmMap.PriceCategoryId,
                //                      pCat.PriceCategoryName,
                //                      empBillItmMap.AssignedToPercent,
                //                      empBillItmMap.ReferredByPercent,
                //                      GroupDistribution = incentiveDb.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == empBillItmMap.EmployeeBillItemsMapId).ToList()
                //                  }).ToList();


                //    responseData.Status = "OK";
                //    responseData.Results = result;
                //}
                else if (reqType == "acc-get-employee-ledger-list")
                {
                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@HospitalId", accHospitalId) };
                    //sud: 20Jun'20-- new param is added in below sp.. hence changed..
                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetAllEmployee_LedgerList", null, incentiveDb);
                    responseData.Results = dt;
                    responseData.Status = "OK";

                }
                else if (reqType == "incentive-applicable-docter-list")
                {

                    var docList = (from emp in incentiveDb.Employee
                                   where emp.IsActive == true && emp.IsIncentiveApplicable == true
                                   select emp).OrderBy(a => a.FirstName).ToList();

                    responseData.Status = "OK";
                    responseData.Results = docList;

                }



            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        #endregion

        #region reqType(Post)
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            IncentiveDbContext incentiveDb = new IncentiveDbContext(connString);
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                #region Add Profile
                if (reqType == "addProfile")
                {
                    ProfileModel profileMaster = DanpheJSONConvert.DeserializeObject<ProfileModel>(str);
                    Boolean flag = IncentiveBL.AddEmployeeProfile(profileMaster, incentiveDb, currentUser.EmployeeId);
                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = profileMaster;
                    }
                    else
                    {
                        responseData.ErrorMessage = "check console for error details.";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region Add Employee Profile Mapping
                else if (reqType == "addEmpProfileMap")
                {
                    //List<EmployeeProfileMap> employeeProfiles = DanpheJSONConvert.DeserializeObject<List<EmployeeProfileMap>>(str);
                    //Boolean flag = false;
                    //flag = IncentiveBL.EmployeeProfileMapping(employeeProfiles, incentiveDb);

                    //if (flag)
                    //{
                    //    responseData.Status = "OK";
                    //    responseData.Results = 1;
                    //}
                    //else
                    //{
                    //    responseData.ErrorMessage = "check console for error details.";
                    //    responseData.Status = "Failed";
                    //}
                }
                #endregion
                #region Save Profile Item Mapping
                else if (reqType == "saveProfileItemMap")
                {
                    List<ProfileItemMap> profileItemMaps = DanpheJSONConvert.DeserializeObject<List<ProfileItemMap>>(str);
                    Boolean flag = false;
                    flag = IncentiveBL.ProfileItemMapping(profileItemMaps, incentiveDb, currentUser.EmployeeId);

                    if (flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "check console for error details.";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region Employee BillItems Mapping
                else if (reqType == "saveEmployeeBillItemsMap")
                {
                    EmployeeIncentiveInfo EmployeeIncentiveInfo = DanpheJSONConvert.DeserializeObject<EmployeeIncentiveInfo>(str);

                    using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
                    {
                        try
                        {
                            //var id = EmployeeIncentiveInfo.EmployeeIncentiveInfoId;
                            if (EmployeeIncentiveInfo.EmployeeIncentiveInfoId != 0) // already exists
                            {
                                //incentiveDb.EmployeeIncentiveInfo.Attach(EmployeeIncentiveInfo);
                                var empInctvInfo = incentiveDb.EmployeeIncentiveInfo.Where(a => a.EmployeeIncentiveInfoId == EmployeeIncentiveInfo.EmployeeIncentiveInfoId).FirstOrDefault();
                                empInctvInfo.TDSPercent = EmployeeIncentiveInfo.TDSPercent;
                                empInctvInfo.IsActive = EmployeeIncentiveInfo.IsActive;
                                incentiveDb.Entry(empInctvInfo).Property(x => x.TDSPercent).IsModified = true;
                                incentiveDb.Entry(empInctvInfo).Property(x => x.IsActive).IsModified = true;

                                incentiveDb.SaveChanges();
                                if (EmployeeIncentiveInfo.EmployeeBillItemsMap != null && EmployeeIncentiveInfo.EmployeeBillItemsMap.Count > 0)
                                {
                                    IncentiveBL.EmployeeItemMapping(EmployeeIncentiveInfo.EmployeeBillItemsMap, incentiveDb, currentUser.EmployeeId);
                                }


                            }
                            else
                            {
                                EmployeeIncentiveInfo.CreatedBy = currentUser.EmployeeId;
                                EmployeeIncentiveInfo.CreatedOn = DateTime.Now;
                                incentiveDb.EmployeeIncentiveInfo.Add(EmployeeIncentiveInfo);  // doesn't exist.
                                incentiveDb.SaveChanges();
                                if (EmployeeIncentiveInfo.EmployeeBillItemsMap != null && EmployeeIncentiveInfo.EmployeeBillItemsMap.Count > 0)
                                {
                                    IncentiveBL.EmployeeItemMapping(EmployeeIncentiveInfo.EmployeeBillItemsMap, incentiveDb, currentUser.EmployeeId);
                                }

                            }

                            dbContextTxn.Commit();
                            responseData.Status = "OK";
                            responseData.Results = EmployeeIncentiveInfo;
                        }
                        catch (Exception ex)
                        {
                            dbContextTxn.Rollback();
                            throw ex;
                        }
                    }
                }
                #endregion
                #region Activate/Deactivate EmployeeIncentiveSetup
                else if (reqType == "activateDeactivateEmployeeSetup")
                {
                    EmployeeIncentiveInfo EmployeeIncentiveInfo = DanpheJSONConvert.DeserializeObject<EmployeeIncentiveInfo>(str);

                    using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
                    {
                        try
                        {
                            var empInctvInfo = incentiveDb.EmployeeIncentiveInfo.Where(a => a.EmployeeIncentiveInfoId == EmployeeIncentiveInfo.EmployeeIncentiveInfoId).FirstOrDefault();
                            empInctvInfo.IsActive = EmployeeIncentiveInfo.IsActive;
                            incentiveDb.Entry(empInctvInfo).Property(x => x.IsActive).IsModified = true;
                            incentiveDb.SaveChanges();

                            List<EmployeeBillItemsMap> EmployeeBillItemsMap = incentiveDb.EmployeeBillItemsMap.Where(a => a.EmployeeId == EmployeeIncentiveInfo.EmployeeId).ToList();
                            EmployeeBillItemsMap.ForEach(a =>
                            {
                                a.IsActive = EmployeeIncentiveInfo.IsActive;
                                incentiveDb.Entry(a).Property(x => x.IsActive).IsModified = true;
                                incentiveDb.SaveChanges();

                                if (a.HasGroupDistribution == true)
                                {
                                    List<ItemGroupDistribution> grpDist = incentiveDb.ItemGroupDistribution.Where(b => b.EmployeeBillItemsMapId == a.EmployeeBillItemsMapId).ToList();
                                    grpDist.ForEach(grp =>
                                    {
                                        grp.IsActive = a.IsActive;
                                        incentiveDb.Entry(grp).Property(x => x.IsActive).IsModified = true;
                                        incentiveDb.SaveChanges();
                                    });
                                }

                            });
                            //IncentiveBL.EmployeeItemMapping(EmployeeBillItemsMap, incentiveDb, currentUser.EmployeeId);

                            dbContextTxn.Commit();
                            responseData.Status = "OK";
                            responseData.Results = EmployeeIncentiveInfo;
                        }
                        catch (Exception ex)
                        {
                            dbContextTxn.Rollback();
                            throw ex;
                        }
                    }
                }
                #endregion


                #region Update BillItem
                else if (reqType == "updateEmployeeBillItem")
                {

                    try
                    {
                        EmployeeBillItemsMap employeeBillItem = DanpheJSONConvert.DeserializeObject<EmployeeBillItemsMap>(str);

                        var empBillItmMap = incentiveDb.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == employeeBillItem.EmployeeBillItemsMapId).FirstOrDefault();
                        empBillItmMap.PerformerPercent = employeeBillItem.PerformerPercent;
                        empBillItmMap.PrescriberPercent = employeeBillItem.PrescriberPercent;
                        empBillItmMap.ReferrerPercent = employeeBillItem.ReferrerPercent;
                        empBillItmMap.BillingTypesApplicable = employeeBillItem.BillingTypesApplicable;
                        empBillItmMap.IsActive = employeeBillItem.IsActive;
                        empBillItmMap.ModifiedBy = currentUser.EmployeeId;
                        empBillItmMap.ModifiedOn = DateTime.Now;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.PerformerPercent).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.PrescriberPercent).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.ReferrerPercent).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.IsActive).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedBy).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedOn).IsModified = true;
                        incentiveDb.Entry(empBillItmMap).Property(x => x.BillingTypesApplicable).IsModified = true;

                        incentiveDb.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = employeeBillItem;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                    }
                }
                #endregion
                #region Update Profile BillItem map
                else if (reqType == "updateProfileBillItemMap")
                {

                    try
                    {
                        ProfileItemMap ProfileBillItemMap = DanpheJSONConvert.DeserializeObject<ProfileItemMap>(str);

                        var aa = incentiveDb.ProfileItemMap.Where(a => a.BillItemProfileMapId == ProfileBillItemMap.BillItemProfileMapId).FirstOrDefault();
                        aa.PerformerPercent = ProfileBillItemMap.PerformerPercent;
                        aa.PrescriberPercent = ProfileBillItemMap.PrescriberPercent;
                        aa.ReferrerPercent = ProfileBillItemMap.ReferrerPercent;
                        aa.BillingTypesApplicable = ProfileBillItemMap.BillingTypesApplicable;
                        aa.ModifiedBy = currentUser.EmployeeId;
                        aa.ModifiedOn = DateTime.Now;

                        incentiveDb.Entry(aa).Property(x => x.PerformerPercent).IsModified = true;
                        incentiveDb.Entry(aa).Property(x => x.PrescriberPercent).IsModified = true;
                        incentiveDb.Entry(aa).Property(x => x.ReferrerPercent).IsModified = true;
                        incentiveDb.Entry(aa).Property(x => x.BillingTypesApplicable).IsModified = true;

                        incentiveDb.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ProfileBillItemMap;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                    }
                }
                #endregion
                #region Remove Selected BillItem
                else if (reqType == "removeSelectedBillItem")
                {

                    using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
                    {
                        try
                        {
                            EmployeeBillItemsMap employeeBillItem = DanpheJSONConvert.DeserializeObject<EmployeeBillItemsMap>(str);

                            var empBillItmMap = incentiveDb.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == employeeBillItem.EmployeeBillItemsMapId).FirstOrDefault();
                            empBillItmMap.IsActive = employeeBillItem.IsActive;
                            empBillItmMap.HasGroupDistribution = false;
                            empBillItmMap.ModifiedBy = currentUser.EmployeeId;
                            empBillItmMap.ModifiedOn = DateTime.Now;
                            incentiveDb.Entry(empBillItmMap).Property(x => x.HasGroupDistribution).IsModified = true;
                            incentiveDb.Entry(empBillItmMap).Property(x => x.IsActive).IsModified = true;
                            incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedBy).IsModified = true;
                            incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedOn).IsModified = true;
                            incentiveDb.SaveChanges();

                            if (employeeBillItem.GroupDistribution.Count > 0)
                            {
                                foreach (var groupDist in employeeBillItem.GroupDistribution)
                                {
                                    var aa = incentiveDb.ItemGroupDistribution.Where(a => a.ItemGroupDistributionId == groupDist.ItemGroupDistributionId).FirstOrDefault();
                                    incentiveDb.ItemGroupDistribution.Remove(aa);
                                    incentiveDb.SaveChanges();
                                }
                                //var id = employeeBillItem.EmployeeBillItemsMapId;
                                //incentiveDb.ItemGroupDistribution.RemoveAll(incentiveDb.ItemGroupDistribution.Any(e => e.EmployeeBillItemsMapId == id)
                            }
                            dbContextTxn.Commit();
                            responseData.Status = "OK";
                            responseData.Results = employeeBillItem;
                        }
                        catch (Exception ex)
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        }
                    }
                }
                #endregion
                #region Remove Selected BillItem from Profile map
                else if (reqType == "removeSelectedBillItemFromProfileMap")
                {
                    try
                    {
                        ProfileItemMap ProfileBillItemMap = DanpheJSONConvert.DeserializeObject<ProfileItemMap>(str);

                        var aa = incentiveDb.ProfileItemMap.Where(a => a.BillItemProfileMapId == ProfileBillItemMap.BillItemProfileMapId).FirstOrDefault();
                        incentiveDb.ProfileItemMap.Remove(aa);
                        incentiveDb.SaveChanges();

                        responseData.Status = "OK";
                        responseData.Results = ProfileBillItemMap;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                    }

                }
                #endregion
                #region Item Group Distribution
                else if (reqType == "saveItemGroupDistribution")
                {
                    List<ItemGroupDistribution> itmGrpDistributionsFromClient = DanpheJSONConvert.DeserializeObject<List<ItemGroupDistribution>>(str);
                    using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
                    {
                        try
                        {

                            //ItemGroupDistribution[0].EmployeeBillItemsMapId is never Zero, so we will always find an object agains this. 

                            int empBillItemMapId = itmGrpDistributionsFromClient[0].EmployeeBillItemsMapId;

                            var empBillItemMap = incentiveDb.EmployeeBillItemsMap.Where(bilItmMap => bilItmMap.EmployeeBillItemsMapId == empBillItemMapId).FirstOrDefault();
                            var itemAllGrpDists_Server = incentiveDb.ItemGroupDistribution.Where(itm => itm.EmployeeBillItemsMapId == empBillItemMap.EmployeeBillItemsMapId).ToList();
                            if (itemAllGrpDists_Server != null && itemAllGrpDists_Server.Count > 0)
                            {
                                //at first, remove all groupDistributions and set HasGroupDistribution=false for current empBillItemMapId.
                                empBillItemMap.HasGroupDistribution = false;
                                incentiveDb.Entry(empBillItemMap).Property(x => x.HasGroupDistribution).IsModified = true;
                                itemAllGrpDists_Server.ForEach(itm =>
                                {
                                    incentiveDb.ItemGroupDistribution.Remove(itm);
                                });
                                incentiveDb.SaveChanges();
                            }

                            //if only one then it must be for same employee, so no need to add..
                            if (itmGrpDistributionsFromClient != null && itmGrpDistributionsFromClient.Where(itm => itm.IsActive == true).Count() > 1)
                            {
                                foreach (ItemGroupDistribution groupDist in itmGrpDistributionsFromClient)
                                {
                                    groupDist.EmployeeBillItemsMapId = empBillItemMap.EmployeeBillItemsMapId;
                                    groupDist.CreatedOn = DateTime.Now;
                                    groupDist.CreatedBy = currentUser.EmployeeId;
                                    incentiveDb.ItemGroupDistribution.Add(groupDist);
                                }

                                empBillItemMap.HasGroupDistribution = true;
                                incentiveDb.Entry(empBillItemMap).Property(x => x.HasGroupDistribution).IsModified = true;

                                incentiveDb.SaveChanges();
                            }


                            incentiveDb.SaveChanges();

                            dbContextTxn.Commit();
                            responseData.Status = "OK";
                            responseData.Results = itmGrpDistributionsFromClient;
                        }
                        catch (Exception ex)
                        {
                            dbContextTxn.Rollback();
                            throw ex;
                        }
                    }

                }
                #endregion

                else if (reqType == "save-fraction-items")
                {
                    List<IncentiveFractionItemModel> fractionItems = DanpheJSONConvert.DeserializeObject<List<IncentiveFractionItemModel>>(str);
                    if (fractionItems != null && fractionItems.Count > 0)
                    {
                        foreach (var item in fractionItems)
                        {
                            if (item.InctvTxnItemId == 0 || item.InctvTxnItemId == null)
                            {
                                item.CreatedBy = currentUser.EmployeeId;
                                item.CreatedOn = DateTime.Now;
                                incentiveDb.IncentiveFractionItems.Add(item);
                            }
                            else
                            {
                                item.ModifiedBy = currentUser.EmployeeId;
                                item.ModifiedOn = DateTime.Now;
                                incentiveDb.IncentiveFractionItems.Attach(item);
                                incentiveDb.Entry(item).Property(x => x.IncentiveReceiverId).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.IncentiveReceiverName).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.FinalIncentivePercent).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.InitialIncentivePercent).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.IncentiveAmount).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.IncentiveType).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.TDSPercentage).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.TDSAmount).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.ModifiedBy).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.ModifiedOn).IsModified = true;
                                incentiveDb.Entry(item).Property(x => x.IsActive).IsModified = true;
                            }
                        }

                        incentiveDb.SaveChanges();
                    }

                    responseData.Status = "OK";
                    responseData.Results = fractionItems;
                }

                else if (reqType == "save-payment-info")
                {
                    PaymentInfoModel paymentInfo = DanpheJSONConvert.DeserializeObject<PaymentInfoModel>(str);
                    string idsToUpdt = this.ReadQueryStringData("fractionItenIdsToUpdate");
                    List<int> allFractionIdsToUpdate = DanpheJSONConvert.DeserializeObject<List<int>>(idsToUpdt);

                    using (var dbTransaction = incentiveDb.Database.BeginTransaction())
                    {
                        try
                        {
                            paymentInfo.CreatedOn = DateTime.Now;
                            paymentInfo.CreatedBy = currentUser.EmployeeId;
                            paymentInfo.IsActive = true;
                            incentiveDb.PaymentInfo.Add(paymentInfo);
                            incentiveDb.SaveChanges();

                            int paymentInfoId = paymentInfo.PaymentInfoId;

                            var allRowsToUpdate = (from fitem in incentiveDb.IncentiveFractionItems
                                                   where allFractionIdsToUpdate.Contains(fitem.InctvTxnItemId)
                                                   select fitem
                                                   ).ToList();

                            foreach (var itemToUpdate in allRowsToUpdate)
                            {
                                itemToUpdate.IsPaymentProcessed = true;
                                itemToUpdate.PaymentInfoId = paymentInfoId;
                                incentiveDb.Entry(itemToUpdate).Property(a => a.PaymentInfoId).IsModified = true;
                                incentiveDb.Entry(itemToUpdate).Property(a => a.IsPaymentProcessed).IsModified = true;
                            }

                            incentiveDb.SaveChanges();
                            dbTransaction.Commit();
                            responseData.Status = "OK";
                            responseData.Results = paymentInfo;
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            throw ex;
                        }
                    }


                }

                //sud:15Feb'20-This is for quick development, need to revise it soon
                else if (reqType == "load-uptodate-transactions")
                {
                    string fromDate = this.ReadQueryStringData("fromDate");
                    string toDate = this.ReadQueryStringData("toDate");
                    List<SqlParameter> paramList_sales = new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) };

                    DataTable retTable = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_InDateRange", paramList_sales, incentiveDb);
                    List<SqlParameter> paramList_salesReturn = new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) };
                    DataTable retTable_salesReturnCases = DALFunctions.GetDataTableFromStoredProc("SP_INCTV_BulkInsert_FractionItemsFromBillTxnItem_Return_InDateRange", paramList_salesReturn, incentiveDb);

                    responseData.Status = "OK";
                    responseData.Results = retTable;
                }

                else if (reqType == "activateDeactivateProfile")
                {
                    ProfileModel profile = DanpheJSONConvert.DeserializeObject<ProfileModel>(str);

                    try
                    {
                        var curProfile = incentiveDb.Profile.Where(a => a.ProfileId == profile.ProfileId).FirstOrDefault();
                        curProfile.IsActive = profile.IsActive;
                        curProfile.ModifiedBy = currentUser.EmployeeId;
                        curProfile.ModifiedOn = DateTime.Now;
                        incentiveDb.Entry(curProfile).Property(x => x.IsActive).IsModified = true;
                        incentiveDb.Entry(curProfile).Property(x => x.ModifiedBy).IsModified = true;
                        incentiveDb.Entry(curProfile).Property(x => x.ModifiedOn).IsModified = true;
                        incentiveDb.SaveChanges();

                        responseData.Status = "OK";
                        responseData.Results = curProfile;
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
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

        #endregion

        #region reqType(Put)

        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            IncentiveDbContext incentiveDb = new IncentiveDbContext(connString);
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            BillingDbContext billingDbContext = new BillingDbContext(connString);

            try
            {
                #region Update Shifts (Manage Shifts)
                if (reqType == "updateProfile")
                {
                    ProfileModel profileData = DanpheJSONConvert.DeserializeObject<ProfileModel>(str);
                    //incentiveDb.Profile.Attach(profileData);       
                   
                    var profile = incentiveDb.Profile.Where(a => a.ProfileId ==profileData.ProfileId).FirstOrDefault();
                    profile.ProfileName = profileData.ProfileName;
                    profile.Description = profileData.Description;
                    profile.ModifiedBy = currentUser.EmployeeId;
                    profile.ModifiedOn = DateTime.Now;
                    incentiveDb.Entry(profile).Property(x => x.ProfileName).IsModified = true;
                    //incentiveDb.Entry(profileData).Property(x => x.PriceCategoryId).IsModified = true;
                    //incentiveDb.Entry(profileData).Property(x => x.TDSPercentage).IsModified = true;
                    incentiveDb.Entry(profile).Property(x => x.Description).IsModified = true;
                    incentiveDb.Entry(profile).Property(x => x.ModifiedOn).IsModified = true;
                    incentiveDb.Entry(profile).Property(x => x.ModifiedBy).IsModified = true;

                    incentiveDb.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = profileData;
                }
                #endregion

                else if (reqType == "update-billtxnItem")
                {
                    List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);
                    if (txnItems != null)
                    {
                        txnItems.ForEach(item =>
                        {
                            item.ModifiedBy = currentUser.EmployeeId;
                            IncentiveBL.UpdateBillingTransactionItems(billingDbContext, item);
                        });
                    }

                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        #endregion*/
    }
}