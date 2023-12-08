using AutoMapper;
using DanpheEMR.Controllers.Settings.DTO;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.BillingModels.Config;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.BillSettings.DTOs;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Billing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Xml;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class BillSettingsController : CommonController
    {
        private readonly MasterDbContext _masterDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly BillingDbContext _billingDbContext;
        private readonly LabDbContext _labDbContext;
        private readonly RadiologyDbContext _radiologyDbContext;
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly IMapper _mapper;

        public BillSettingsController(IOptions<MyConfiguration> _config, IMapper mapper) : base(_config)
        {
            _masterDbContext = new MasterDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
            _labDbContext = new LabDbContext(connString);
            _radiologyDbContext = new RadiologyDbContext(connString);
            _admissionDbContext = new AdmissionDbContext(connString);
            _mapper = mapper;
        }

        #region Get APIs

        [HttpGet]
        [Route("ServiceDepartments")]
        public IActionResult ServiceDepartments()
        {
            //if (reqType == "get-service-departments")
            Func<object> func = () => (from s in _masterDbContext.ServiceDepartments.Include("Department")
                                       select new
                                       {
                                           ServiceDepartmentName = s.ServiceDepartmentName,
                                           ServiceDepartmentShortName = s.ServiceDepartmentShortName,
                                           ServiceDepartmentId = s.ServiceDepartmentId,
                                           DepartmentId = s.DepartmentId,
                                           DepartmentName = s.Department.DepartmentName,
                                           CreatedOn = s.CreatedOn,
                                           CreatedBy = s.CreatedBy,
                                           IntegrationName = s.IntegrationName,
                                           ParentServiceDepartmentId = s.ParentServiceDepartmentId,
                                           IsActive = s.IsActive
                                       }).OrderBy(d => d.DepartmentName).ThenBy(d => d.ServiceDepartmentName).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingItemList")]
        public IActionResult GetBillingItemList(bool showInactiveItems = false)
        {
            //if if (reqType == "get-billing-itemList")
            Func<object> func = () => GettingBillingItemList(showInactiveItems);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ServiceItemList")]
        public IActionResult ServiceItemList()
        {
            //if if (reqType == "get-billing-itemList")
            Func<object> func = () => GetServiceItemList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ServiceCategories")]
        public IActionResult ServiceCategories()
        {

            Func<object> func = () => GetServiceCategories();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReportingItemsList")]
        public IActionResult GetReportingItemsList()
        {
            // if (reqType != null && reqType == "get-reporting-items-List")
            Func<object> func = () => GettingReportingItemsList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("DynamicReportingNameList")]
        public IActionResult GetDynamicReportingNameList()
        {
            // if (reqType != null && reqType == "get-dynamic-reporting-name-List")
            Func<object> func = () => GettingDynamicReportingNameList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillItemPriceChangeHistory")]
        public IActionResult GetBillItemPriceChangeHistory(int serviceDeptId, int itemId)
        {
            //if (reqType != null && reqType == "get-billItemPriceChangeHistory")
            Func<object> func = () => GettingBillItemPriceChangeHistory(serviceDeptId, itemId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingPackageList")]
        public IActionResult GetBillingPackageList()
        {
            // if (reqType == "get-billing-packageList")
            Func<object> func = () => GettingBillingPackageList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingPackageServiceItemList")]
        public IActionResult GetBillingPackageServiceItemList(int BillingPackageId, int PriceCategoryId)
        {
            // if (reqType == "get-billing-packageList")
            Func<object> func = () => GettingBillingPackageServiceItemList(BillingPackageId, PriceCategoryId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("MembershipTypes")]
        public IActionResult GetMembershipTypes()
        {
            //if (reqType == "get-membership-types")
            Func<object> func = () => GettingMembershipTypes();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingSchemes")]
        public IActionResult GetBillingSchemes()
        {
            Func<object> func = () => GetBillingScheme();
            return InvokeHttpGetFunction(func);
        }
        private object GetBillingScheme()
        {
            var schemes = (from scheme in _billingDbContext.BillingSchemes
                           select scheme).OrderBy(m => m.SchemeName).ToList();
            foreach (var scheme in schemes)
            {
                scheme.BillingSubSchemes = _billingDbContext.BillingSubSchemes
                                                            .Where(subScheme => subScheme.SchemeId == scheme.SchemeId)
                                                            .ToList();
            }
            return schemes;
        }

        [HttpGet]
        [Route("BillingSubSchemesBySchemeId")]
        public IActionResult BillingSubSchemesBySchemeId(int SchemeId)
        {
            Func<object> func = () => GetBillingSubSchemesBySchemeId(SchemeId);
            return InvokeHttpGetFunction(func);
        }
        private object GetBillingSubSchemesBySchemeId(int SchemeId)
        {
            var schemes = (from ss in _billingDbContext.BillingSubSchemes
                           where ss.SchemeId == SchemeId
                           select ss).OrderBy(a => a.SubSchemeId).ToList();
            return schemes;
        }

        [HttpGet]
        [Route("BillingScheme")]
        public IActionResult GetBillingSchemeById( int SchemeId)
        {
            Func<object> func = () => GetBillingSchemebyId(SchemeId);
            return InvokeHttpGetFunction(func);
        }
        private object GetBillingSchemebyId( int SchemeId)
        {
      
            var Scheme = (from scheme in _billingDbContext.BillingSchemes.Where(m => m.SchemeId == SchemeId)
                           select scheme).FirstOrDefault();

            Scheme.BillingSubSchemes = _billingDbContext.BillingSubSchemes
                                                        .Where(subScheme => subScheme.SchemeId == Scheme.SchemeId)
                                                        .ToList();
            return Scheme;
        }
        
        [HttpGet]
        [Route("SchemesForBillingReport")]
        public IActionResult SchemesForBillingReport()
        {
            Func<object> func = () => GetSchemesForBillingReport();
            return InvokeHttpGetFunction(func);
        }
        private object GetSchemesForBillingReport()
        {
     
            var Scheme = (from scheme in _billingDbContext.BillingSchemes
                          where scheme.IsActive == true
                          select new
                          {
                              SchemeId = scheme.SchemeId,
                              SchemeName = scheme.SchemeName
                          }).ToList();
            return Scheme;
        }


        [HttpGet]
        [Route("CreditOrganizations")]
        public IActionResult GetCreditOrganizations()
        {
            // if (reqType == "get-credit-organization")
            Func<object> func = () => GettingCreditOrganizations();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingItems")]
        public IActionResult GetBillingItems(int itemId, string servDeptName)
        {
            // if (reqType == "get-billing-items-by-servdeptitemid" && itemId > 0)
            Func<object> func = () => GettingBillingItems(itemId, servDeptName);
            return InvokeHttpGetFunction(func);
        }
        
        [HttpGet]
        [Route("AdditionalServiceItems")]
        public IActionResult AdditionalServiceItems()
        {
            Func<object> func = () => GetAdditionalServiceItems();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingItemsByIntegrationName")]
        public IActionResult GetBillingItemsByIntegrationName(int itemId, string integrationName)
        {
            //if (reqType == "get-billing-items-by-integrationName-itemid" && itemId > 0)
            Func<object> func = () => GettingBillingItemsByIntegrationName(itemId, integrationName);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillItemsByServiceDepartmentName")]
        public IActionResult GetBillItemsByServiceDepartmentName(string servDeptName)
        {
            //if (reqType == "get-billing-items-by-servdeptname" && servDeptName.Length > 0)
            Func<object> func = () => GettingBillItemsByServiceDepartmentName(servDeptName);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillItemsByIntegrationName")]
        public IActionResult GetBillItemsByIntegrationName(string integrationName)
        {
            //if (reqType == "get-billing-items-by-integrationName" && !string.IsNullOrEmpty(integrationName))
            Func<object> func = () => GettingBillItemsByServiceIntegrationName(integrationName);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PrinterSettings")]
        public IActionResult GetPrinterSettings()
        {
            //if (reqType == "get-printer-settings")
            Func<object> func = () => GettingPrinterSettings();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("AllPrinterSettings")]
        public IActionResult GetAllPrinterSettings()
        {
            //if (reqType == "get-all-printer-settings")
            Func<object> func = () => GettingAllPrinterSettings();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingToReportingItemMapping")]
        public IActionResult GetBillingToReportingItemMapping(int reportingItemsId)
        {
            // if (reqType == "get-security-reportingItemBillItem")
            Func<object> func = () => GettingBillingToReportingItemMapping(reportingItemsId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BilCfgItemsVsPriceCategory")]
        public IActionResult GetBilCfgItemsVsPriceCategory(int BillItemPriceId)
        {
            //This API fetches BilCfgItemsVsPriceCateories of given BillItemPriceId
            Func<object> func = () => _billingDbContext.BillItemsPriceCategoryMaps.Where(a => a.ServiceItemId == BillItemPriceId).ToList();
            return InvokeHttpGetFunction(func);
        }




        [HttpGet]
        [Route("ServiceItemsVsPriceCategory")]
        public IActionResult GetServiceItemVsPriceCategory(int ServiceItemId)
        {
            Func<object> func = () => _billingDbContext.BillItemsPriceCategoryMaps.Where(pmc => pmc.ServiceItemId == ServiceItemId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SchemePriceCategoryMappedItems")]
        public IActionResult SchemePriceCategoryMappedItems()
        {
            Func<object> func = () => (from schemePriceMap in _billingDbContext.PriceCategorySchemesMaps
                                       join scheme in _billingDbContext.BillingSchemes on schemePriceMap.SchemeId equals scheme.SchemeId
                                       join priceCat in _billingDbContext.PriceCategoryModels on schemePriceMap.PriceCategoryId equals priceCat.PriceCategoryId
                                       select new BillMapPriceCategorySchemeDetailsDTO
                                       {
                                           PriceCategorySchemeMapId = schemePriceMap.PriceCategorySchemeMapId,
                                           SchemeId = schemePriceMap.SchemeId,
                                           SchemeName = scheme.SchemeName,
                                           PriceCategoryId = schemePriceMap.PriceCategoryId,
                                           PriceCategoryName = priceCat.PriceCategoryName,
                                           IsDefault = schemePriceMap.IsDefault,
                                           IsActive = schemePriceMap.IsActive
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }




        [HttpGet]
        [Route("DepositHeads")]
        public IActionResult DepositHeads()
        {
            Func<object> func = () => GetDepositHeads();
            return InvokeHttpGetFunction(func);
        }
        #endregion

        #region Post APIs

        [HttpPost]
        [Route("ServiceDepartment")]
        public IActionResult AddServiceDepartment()
        {
            // if (reqType == "post-service-department")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingServiceDepartment(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillingItem")]
        public IActionResult AddBillingItem()
        {
            //if (reqType == "post-billing-item")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingBillingItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ServiceItem")]
        public IActionResult ServiceItems([FromBody] ServiceItem_DTO serviceItemDto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddServiceItems(serviceItemDto, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ReportingItem")]
        public IActionResult AddReportingItem()
        {
            // if (reqType == "post-reportingItem")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingReportingItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillingToReportingItemMapping")]
        public IActionResult AddSecurityReportingItemBillItem()
        {
            //if (reqType == "post-security-reportingItemBillItem")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => AddingBillingToReportingItemMapping(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillingPackage")]
        public IActionResult AddBillingPackage([FromBody] BillingPackage_DTO billingPackage)
        {
            //if (reqType == "post-billing-package")
            /*string ipDataStr = this.ReadPostData();*/
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingBillingPackage(billingPackage, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("CreditOrganization")]
        public IActionResult AddCreditOrganization()
        {
            // if (reqType == "post-credit-organization")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => AddingCreditOrganization(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillScheme")]
        public IActionResult PostBillScheme()
        {
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddBillScheme(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("SchemePriceCategoryMap")]
        public IActionResult AddSchemePriceCategoryMap([FromBody] List<BillMapPriceCategorySchemeDTO> billMapPriceCategorySchemeDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveSchemePriceCategoryMap(billMapPriceCategorySchemeDTO, currentUser);
            return InvokeHttpPostFunction(func);
        }

        private object SaveSchemePriceCategoryMap(List<BillMapPriceCategorySchemeDTO> billMapPriceCategorySchemeDTO, RbacUser currentUser)
        {
            try
            {
                if (billMapPriceCategorySchemeDTO.Count > 0)
                {
                    using (var billSettingsTransaction = _billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            /* List<BillMapPriceCategorySchemeModel> billMapPriceCategorySchemeItemList = new List<BillMapPriceCategorySchemeModel>();*/
                            foreach (var item in billMapPriceCategorySchemeDTO)
                            {
                                BillMapPriceCategorySchemeModel billMapPriceCategorySchemeItem = new BillMapPriceCategorySchemeModel();
                                billMapPriceCategorySchemeItem.SchemeId = item.SchemeId;
                                billMapPriceCategorySchemeItem.PriceCategoryId = item.PriceCategoryId;
                                billMapPriceCategorySchemeItem.IsDefault = item.IsDefault;
                                billMapPriceCategorySchemeItem.IsActive = item.IsActive;
                                billMapPriceCategorySchemeItem.CreatedBy = currentUser.EmployeeId;
                                billMapPriceCategorySchemeItem.CreatedOn = DateTime.Now;
                                _billingDbContext.PriceCategorySchemesMaps.Add(billMapPriceCategorySchemeItem);
                                /*    billMapPriceCategorySchemeItemList.Add(billMapPriceCategorySchemeItem);*/
                            }
                            _billingDbContext.SaveChanges();
                            billSettingsTransaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            billSettingsTransaction.Rollback();
                            throw ex;
                        }
                    }
                }
                return Ok();
            }
            catch (Exception ex){
                throw ex;
            }
        }

        private object AddBillScheme(string ipDataStr, RbacUser currentUser)
        {
            using (var schemeTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                try
                {
                    BillingSchemeModel billingScheme = DanpheJSONConvert.DeserializeObject<BillingSchemeModel>(ipDataStr);
                    billingScheme.DefaultCreditOrganizationId = billingScheme.DefaultCreditOrganizationId == 0 ? null : billingScheme.DefaultCreditOrganizationId;
                    billingScheme.CreatedBy = currentUser.EmployeeId;
                    billingScheme.CreatedOn = DateTime.Now;
                    _billingDbContext.BillingSchemes.Add(billingScheme);
                    _billingDbContext.SaveChanges();
                    if (billingScheme.BillingSubSchemes.Count > 0 && billingScheme.HasSubScheme == true)
                    {
                        foreach (var subScheme in billingScheme.BillingSubSchemes)
                        {
                            subScheme.CreatedBy = currentUser.EmployeeId;
                            subScheme.CreatedOn = DateTime.Now;
                            subScheme.SchemeId = billingScheme.SchemeId;
                            _billingDbContext.BillingSubSchemes.Add(subScheme);
                        }
                        _billingDbContext.SaveChanges();
                    }
                    schemeTransactionScope.Commit();
                    return billingScheme;
                }
                catch (Exception ex)
                {
                    schemeTransactionScope.Rollback();
                    throw new Exception(ex.ToString());
                }
            }
        }

        [HttpPost]
        [Route("MembershipType")]
        public IActionResult AddMembershipType()
        {
            //if (reqType == "post-membership-type")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingMembershipType(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("PrinterSetting")]
        public IActionResult AddPrinterSetting()
        {
            //if (reqType == "post-printer-setting")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingPrinterSetting(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillItemsPriceCategoryMap")]
        public IActionResult AddBillItemsPriceCategoryMap()
        {
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingBillItemsPriceCategoryMap(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("BillServiceItemsPriceCategoryMap")]
        public IActionResult AddServiceBillItemsPriceCategoryMap([FromBody] PriceCategoryServiceItem_DTO servicePriceMap_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingBillServiceItemsPriceCategoryMap(servicePriceMap_DTO, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("AdditionalServiceItem")]
        public IActionResult AdditionalServiceItem([FromBody] AddUpdateAdditionalServiceItem_DTO additionalServiceItems_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddAdditionalServiceItem(additionalServiceItems_DTO, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPost]
        [Route("DepositHead")]
        public IActionResult DepositHead([FromBody] DepositHead_DTO depositHead_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddDepositHead(depositHead_DTO, currentUser);
            return InvokeHttpPostFunction(func);
        }

        #endregion

        #region PUT APIs

        [HttpPut]
        [Route("ServiceDepartment")]
        public IActionResult PutServiceDepartment()
        {
            // if (reqType == "put-service-department")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateServiceDepartment(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillingItem")]
        public IActionResult PutBillingItem()
        {
            // if (reqType == "put-billing-item")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillingItem(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ActivateDeactivateServiceItem")]
        public IActionResult ActivateDeactivateServiceItem([FromBody] ServiceItem_DTO serviceItem_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateActivateDeactivateServiceItem(serviceItem_DTO, currentUser);
            return InvokeHttpPutFunction(func);
        }




        [HttpPut]
        [Route("ServiceItem")]
        public IActionResult ServiceItem([FromBody] ServiceItem_DTO serviceItemDto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateServiceItem(serviceItemDto, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ReportingItem")]
        public IActionResult PutReportingItem()
        {
            //if (reqType == "put-reportingItem")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateReportingItem(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillingAndReportingItemMapping")]
        public IActionResult PutBillingAndReportingItemMapping()
        {
            //if (reqType == "put-security-reportingItemBillItem")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateBillingAndReportingItemMapping(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillingPackage")]
        public IActionResult PutBillingPackage([FromBody] BillingPackage_DTO billinPackage)
        {
            //if (reqType == "put-billing-package")
            /*tring ipDataStr = this.ReadPostData();*/
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillingPackage(billinPackage, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ActivateDeactivateBillingPackage")]
        public IActionResult ActivateDeactivateBillingPackage(int BillingPackageId)
        {
            //if (reqType == "put-billing-package")
            //string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateBillingPackageStatus(BillingPackageId);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("CreditOrganization")]
        public IActionResult PutCreditOrganization()
        {
            //if (reqType == "put-credit-organization")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateCreditOrganization(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("MembershipType")]
        public IActionResult PutMembershipType()
        {
            // if (reqType == "put-membership-type")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateMembershipType(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("BillingScheme")]
        public IActionResult PutBillScheme()
        {
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillScheme(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("AdditionalServiceItem")]
        public IActionResult PutAdditionalServiceItem([FromBody] AddUpdateAdditionalServiceItem_DTO additionalServiceItems_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateAdditionalServiceItem(additionalServiceItems_DTO, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ActivateDeactivateAdditionalServiceItem")]
        public IActionResult ActivateDeactivateAdditionalServiceItem(int additionalServiceItemId, bool isActive)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateActivateDeactivateAdditionalServiceItem(additionalServiceItemId, isActive, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("DepositHead")]
        public IActionResult UpdateDepositHead([FromBody] DepositHead_DTO depositHead_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateDepositHead(depositHead_DTO, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ActivateDeactivateDepositHead")]
        public IActionResult ActivateDeactivateDepositHead(int depositHeadId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateActivateDeactivateDepositHead(depositHeadId, currentUser);
            return InvokeHttpPutFunction(func);
        }
        private object UpdateBillScheme(string ipDataStr, RbacUser CurrentUser)
        {
            using (var schemeTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                BillingSchemeModel billScheme = DanpheJSONConvert.DeserializeObject<BillingSchemeModel>(ipDataStr);
                try
                {
                    if (billScheme != null)
                    {
                        var schemeDetails = _billingDbContext.BillingSchemes.AsNoTracking().Where(bs => bs.SchemeId == billScheme.SchemeId).FirstOrDefault();
                        if (schemeDetails != null)
                        {
                            schemeDetails = billScheme;
                            if (schemeDetails.BillingSubSchemes.Count > 0 && schemeDetails.HasSubScheme == true)
                            {
                                foreach (var subScheme in schemeDetails.BillingSubSchemes)
                                {
                                    if (subScheme.SubSchemeId == 0)
                                    {
                                        subScheme.CreatedBy = CurrentUser.EmployeeId;
                                        subScheme.CreatedOn = DateTime.Now;
                                        _billingDbContext.BillingSubSchemes.Add(subScheme);
                                    }
                                    else
                                    {
                                        var existingSubScheme = (from ss in _billingDbContext.BillingSubSchemes
                                                                 where ss.SubSchemeId == subScheme.SubSchemeId && ss.IsActive == true
                                                                 select ss).FirstOrDefault();
                                        if (existingSubScheme != null && existingSubScheme.SubSchemeName != subScheme.SubSchemeName)
                                        {
                                            existingSubScheme.SubSchemeName = subScheme.SubSchemeName;
                                            existingSubScheme.ModifiedBy = CurrentUser.EmployeeId;
                                            existingSubScheme.ModifiedOn = DateTime.Now;
                                            _billingDbContext.Entry(existingSubScheme).State = EntityState.Modified;
                                        }
                                    }
                                }
                            }
                            schemeDetails.ModifiedBy = CurrentUser.EmployeeId;
                            schemeDetails.ModifiedOn = DateTime.Now;
                            _billingDbContext.BillingSchemes.Attach(schemeDetails);
                            _billingDbContext.Entry(schemeDetails).State = EntityState.Modified;
                            _billingDbContext.Entry(schemeDetails).Property(x => x.ModifiedOn).IsModified = true;
                            _billingDbContext.Entry(schemeDetails).Property(x => x.Description).IsModified = true;
                            _billingDbContext.Entry(schemeDetails).Property(x => x.ModifiedBy).IsModified = true;
                            _billingDbContext.SaveChanges();
                        }
                    }
                    schemeTransactionScope.Commit();
                    return billScheme;
                }
                catch (Exception ex)
                {
                    schemeTransactionScope.Rollback();
                    throw new Exception(ex.ToString());
                }
            }
        }
        
        [HttpPut]
        [Route("ActivateDeactivateSubScheme")]
        public IActionResult ActivateDeactivateSubScheme(int SubSchemeId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillingSubSchemeStatus(SubSchemeId, currentUser);
            return InvokeHttpPutFunction(func);
        }
        private object UpdateBillingSubSchemeStatus(int SubSchemeId, RbacUser currentUser)
        {
            var subScheme = _billingDbContext.BillingSubSchemes.AsNoTracking().Where(ss => ss.SubSchemeId == SubSchemeId).FirstOrDefault();
            if(subScheme != null)
            {
            subScheme.IsActive = !subScheme.IsActive;
            subScheme.ModifiedBy = currentUser.EmployeeId;
            subScheme.ModifiedOn = DateTime.Now;
            _billingDbContext.Entry(subScheme).State = EntityState.Modified;
            _billingDbContext.SaveChanges();
            return subScheme.IsActive;
            }
            else
            {
                throw new Exception("SubScheme not found.");
            }
        }


        [HttpPut]
        [Route("PrinterSetting")]
        public IActionResult PutPrinterSettinge()
        {
            // if (reqType == "put-printer-setting")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdatePrinterSetting(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillItemsPriceCategoryMap")]
        public IActionResult PutBillItemsPriceCategoryMap(int PriceCategoryMapId)
        {
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillItemsPriceCategoryMap(ipDataStr, currentUser, PriceCategoryMapId);
            return InvokeHttpPostFunction(func);
        }


        [HttpPut]
        [Route("BillServiceItemsPriceCategoryMap")]
        public IActionResult BillServiceItemsPriceCategoryMap([FromBody] PriceCategoryServiceItem_DTO servicePriceMap_DTO, int PriceCategoryServiceItemMapId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateBillServiceItemsPriceCategoryMap(servicePriceMap_DTO, currentUser, PriceCategoryServiceItemMapId);
            return InvokeHttpPostFunction(func);
        }

        [HttpPut]
        [Route("SchemePriceCategoryMap")]
        public IActionResult SchemePriceCategoryMap([FromBody] BillMapPriceCategorySchemeDTO billMapPriceCategorySchemeDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateSchemePriceCategoryMap(billMapPriceCategorySchemeDTO, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPut]
        [Route("ActivateDeactivateSchemePriceCategoryMapItem")]
        public IActionResult ActivateDeactivateSchemePriceCategoryMapItem(int PriceCategorySchemeMapId, bool Status)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateDeactivateSchemePriceCategoryMapItem(PriceCategorySchemeMapId, Status, currentUser);
            return InvokeHttpPostFunction(func);
        }

        #endregion

        private object UpdateSchemePriceCategoryMap(BillMapPriceCategorySchemeDTO billMapPriceCategorySchemeDTO, RbacUser currentUser)
        {
            try
            {
                if (billMapPriceCategorySchemeDTO != null)
                {
                    using (var billSettingsTransaction = _billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var exixtingSchemePriceCategory = _billingDbContext.PriceCategorySchemesMaps
                                                              .Where(a => a.PriceCategorySchemeMapId == billMapPriceCategorySchemeDTO.PriceCategorySchemeMapId).FirstOrDefault();
                            if (exixtingSchemePriceCategory != null)
                            {
                                exixtingSchemePriceCategory.SchemeId = billMapPriceCategorySchemeDTO.SchemeId;
                                exixtingSchemePriceCategory.PriceCategoryId = billMapPriceCategorySchemeDTO.PriceCategoryId;
                                exixtingSchemePriceCategory.IsDefault = billMapPriceCategorySchemeDTO.IsDefault;
                                exixtingSchemePriceCategory.IsActive = billMapPriceCategorySchemeDTO.IsActive;
                                exixtingSchemePriceCategory.ModifiedBy = currentUser.EmployeeId;
                                exixtingSchemePriceCategory.ModifiedOn = DateTime.Now;
                            }
                            _billingDbContext.SaveChanges();
                            billSettingsTransaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            billSettingsTransaction.Rollback();
                            throw ex;
                        }
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object ActivateDeactivateSchemePriceCategoryMapItem(int PriceCategorySchemeMapId, bool Status, RbacUser currentUser)
        {
            try
            {
                if (PriceCategorySchemeMapId != 0)
                {
                    using (var billSettingsTransaction = _billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var existingSchemePriceCategoryMapItem = _billingDbContext.PriceCategorySchemesMaps
                                                                      .Where(a => a.PriceCategorySchemeMapId == PriceCategorySchemeMapId).FirstOrDefault();
                            existingSchemePriceCategoryMapItem.IsActive = Status;
                            existingSchemePriceCategoryMapItem.ModifiedBy = currentUser.EmployeeId;
                            existingSchemePriceCategoryMapItem.ModifiedOn = DateTime.Now;
                            _billingDbContext.SaveChanges();
                            billSettingsTransaction.Commit();

                        }
                        catch (Exception ex)
                        {
                            billSettingsTransaction.Rollback();
                            throw ex;
                        }
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        private object GettingBillingItemList(bool showInactiveItems)
        {
            var itemList = (from item in _billingDbContext.BillServiceItems
                            join srv in _billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                            join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on item.ServiceItemId equals priceCatServItem.ServiceItemId
                            where priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23
                            select new
                            {
                                ServiceItemId = item.ServiceItemId,
                                ServiceDepartmentId = srv.ServiceDepartmentId,
                                ServiceDepartmentName = srv.ServiceDepartmentName,
                                ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                SrvDeptIntegrationName = srv.IntegrationName,
                                ItemId = item.IntegrationItemId,
                                ItemName = item.ItemName,
                                //ProcedureCode = item.ProcedureCode,
                                Price = priceCatServItem.Price,
                                TaxApplicable = item.IsTaxApplicable,
                                Description = item.Description,
                                CreatedOn = item.CreatedOn,
                                CreatedBy = item.CreatedBy,
                                IsActive = item.IsActive == true ? item.IsActive : false,
                                DisplaySeq = item.DisplaySeq,
                                IsDoctorMandatory = item.IsDoctorMandatory == true ? item.IsDoctorMandatory : false,
                                AllowMultipleQty = item.AllowMultipleQty,
                                ItemCode = item.ItemCode,
                                //DiscountApplicable = item.DiscountApplicable,
                                //IsFractionApplicable = item.IsFractionApplicable.HasValue ? item.IsFractionApplicable : false,
                                //InsuranceApplicable = item.InsuranceApplicable,
                                //GovtInsurancePrice = item.GovtInsurancePrice,
                                //IsInsurancePackage = item.IsInsurancePackage,
                                //IsZeroPriceAllowed = item.IsZeroPriceAllowed,
                                IsErLabApplicable = item.IsErLabApplicable,
                                Doctor = (from doc in _billingDbContext.Employee.DefaultIfEmpty()
                                          where doc.IsAppointmentApplicable == true && doc.EmployeeId == item.IntegrationItemId && srv.ServiceDepartmentName == "OPD"
                                          && srv.ServiceDepartmentId == item.ServiceDepartmentId
                                          select new
                                          {
                                              DoctorId = doc != null ? doc.EmployeeId : 0,
                                              DoctorName = doc != null ? doc.FullName : "",
                                          }).FirstOrDefault(),
                                IsOT = item.IsOT,
                                IsProc = item.IsProc,
                                //IsNormalPriceApplicable = item.IsNormalPriceApplicable, 
                                //IsEHSPriceApplicable = item.IsEHSPriceApplicable, 
                                //IsForeignerPriceApplicable = item.IsForeignerPriceApplicable, 
                                //IsInsForeignerPriceApplicable = item.IsInsForeignerPriceApplicable, 
                                //IsSAARCPriceApplicable = item.IsSAARCPriceApplicable, 
                                //Category = item.Category,
                                //EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, 
                                //SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0,
                                //ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0, 
                                //InsForeignerPrice = item.InsForeignerPrice != null ? item.InsForeignerPrice : 0, 
                                //DefaultDoctorList = item.DefaultDoctorList,
                                //IsPriceChangeAllowed = item.IsPriceChangeAllowed 
                            }).OrderBy(b => b.ServiceDepartmentName).ToList();
            // bool showInactiveItems = false;

            var filteredItems = new object();
            if (showInactiveItems)
            {
                filteredItems = itemList.Where(itm => itm.IsActive == true).OrderBy(itm => itm.DisplaySeq);
            }
            else
            {
                filteredItems = itemList.OrderBy(itm => itm.DisplaySeq);
            }
            return filteredItems;
        }

        private object GetServiceItemList()
        {
            var itemList = (from item in _billingDbContext.BillServiceItems
                            join srv in _billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                           // join srvcat in _billingDbContext.BillServiceCategories on item.ServiceCategoryId equals srvcat.ServiceCategoryId
                            select new ServiceItemsViewModel
                            {
                                ServiceItemId = item.ServiceItemId,
                                ServiceDepartmentId = srv.ServiceDepartmentId,
                                ServiceDepartmentName = srv.ServiceDepartmentName,
                                IntegrationName = item.IntegrationName,
                                ItemCode = item.ItemCode,
                                ItemName = item.ItemName,
                                IntegrationItemId = item.IntegrationItemId,
                                IsTaxApplicable = item.IsTaxApplicable,
                                Description = item.Description,
                                DisplaySeq = item.DisplaySeq,
                                IsDoctorMandatory = item.IsDoctorMandatory,
                                IsOT = item.IsOT,
                                IsProc = item.IsProc,
                                ServiceCategoryId = item.ServiceCategoryId.HasValue ? item.ServiceCategoryId : 0,
                                AllowMultipleQty = item.AllowMultipleQty,
                                DefaultDoctorList = item.DefaultDoctorList,
                                IsValidForReporting = item.IsValidForReporting,
                                IsErLabApplicable = item.IsErLabApplicable,
                                CreatedBy = item.CreatedBy,
                                CreatedOn = item.CreatedOn,
                                IsActive = item.IsActive,
                                ServiceCategoryName = ""//srvcat.ServiceCategoryName,
                            }).OrderBy(b => b.ServiceDepartmentName).ToList();

            var filteredItems = new object();
                filteredItems = itemList.OrderBy(itm => itm.DisplaySeq);
            return filteredItems;
        }

        private object GetServiceCategories()
        {
            var ServiceCategories = (from serCat in _billingDbContext.BillServiceCategories
                                     where serCat.IsActive == true
                                     select new
                                     {
                                         ServiceCategoryId = serCat.ServiceCategoryId,
                                         ServiceCategoryName = serCat.ServiceCategoryName
                                     }).ToList();
            return ServiceCategories;
        }



        private object GettingReportingItemsList()
        {
            var list = _billingDbContext.ReportingItemsModels.ToList();
            if (list != null)
            {
                return list;
            }
            else
            {
                throw new Exception("failed to get billing item list");
            }
        }
        private object GettingDynamicReportingNameList()
        {
            var list = _billingDbContext.DynamicReportNameModels.ToList();
            if (list != null)
            {
                return list;
            }
            else
            {
                throw new Exception("failed to get dynamic reporting name list");
            }
        }
        private object GettingBillItemPriceChangeHistory(int serviceDeptId, int itemId)
        {
                var allUsers = _rbacDbContext.Users.ToList();
                //Union BillItemPrice table with BillItemPrice_History table and get price changed history
                var billItemList = (
                    from billItemPriceHistory in _billingDbContext.BillItemPriceHistory
                    where billItemPriceHistory.ItemId == itemId && billItemPriceHistory.ServiceDepartmentId == serviceDeptId
                    select new
                    {
                        price = billItemPriceHistory.Price,
                        createdOn = billItemPriceHistory.StartDate.HasValue ? billItemPriceHistory.StartDate.Value : DateTime.Now ,
                        createdBy = billItemPriceHistory.CreatedBy.HasValue ? billItemPriceHistory.CreatedBy.Value : 0
                    }).ToList()
                                    .Union(from billItemPrice in _billingDbContext.BillServiceItems
                                           join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                           where billItemPrice.IntegrationItemId == itemId && billItemPrice.ServiceDepartmentId == serviceDeptId && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23
                                           select new
                                           {
                                               price = (double?)priceCatServItem.Price,
                                               createdOn = billItemPrice.CreatedOn,
                                               createdBy = billItemPrice.CreatedBy
                                           }).OrderByDescending(b => b.createdOn).ToList();

            //Get list of final BillItemPrice change history with username by using join               
            var billItempriceChangeHistoryList = (from usrs in allUsers
                                                  join billItems in billItemList on usrs.EmployeeId equals billItems.createdBy
                                                  select new
                                                  {
                                                      price = billItems.price,
                                                      createdOn = billItems.createdOn,
                                                      userName = usrs.UserName
                                                  }).OrderByDescending(c => c.createdOn).ToList();
            //check list is empty or not
            if (billItempriceChangeHistoryList != null)
            {
                return billItempriceChangeHistoryList;
            }
            else
            {
                throw new Exception("failed to get requested Item price changed history");
            }
        }
        private object GettingBillingPackageList()
        {
            var BillingPackage = (from billPackage in _billingDbContext.BillingPackages
                              join priceCat in _billingDbContext.PriceCategoryModels on billPackage.PriceCategoryId equals priceCat.PriceCategoryId
                              select new BillingPackageList_DTO
                              {
                                  BillingPackageId = billPackage.BillingPackageId,
                                  BillingPackageName = billPackage.BillingPackageName,
                                  Description = billPackage.Description,
                                  TotalPrice = billPackage.TotalPrice,
                                  DiscountPercent = billPackage.DiscountPercent,
                                  PackageCode = billPackage.PackageCode,
                                  IsActive = billPackage.IsActive,
                                  LabTypeName = billPackage.LabTypeName,
                                  SchemeId = billPackage.SchemeId,
                                  PriceCategoryId = billPackage.PriceCategoryId,
                                  PriceCategoryName = priceCat.PriceCategoryName,
                                  IsEditable = billPackage.IsEditable
                              })
                              .OrderBy(c => c.BillingPackageName).ToList();
            return BillingPackage;
        }
        
        private object GettingBillingPackageServiceItemList(int BillingPackageId, int PriceCategoryId)
        {
            if (BillingPackageId == 0 || PriceCategoryId == 0)
            {
                throw new Exception("BillingPackageId or PriceCategoryId is Null.");
            }
            var BillingPackageServiceItemList = (from billPackageItem in _billingDbContext.BillingPackageServiceItems
                                            where billPackageItem.BillingPackageId == BillingPackageId && billPackageItem.IsActive
                                            join billMapPrice in _billingDbContext.BillItemsPriceCategoryMaps
                                                on new { billPackageItem.ServiceItemId, PriceCategoryId }
                                                equals new { billMapPrice.ServiceItemId, billMapPrice.PriceCategoryId }
                                            join billServiceitem in _billingDbContext.BillServiceItems
                                                on billPackageItem.ServiceItemId equals billServiceitem.ServiceItemId
                                            join emp in _billingDbContext.Employee
                                                on billPackageItem.PerformerId equals emp.EmployeeId into employeeGroup
                                            from emp in employeeGroup.DefaultIfEmpty()
                                            select new BillingPackageServiceItemList_DTO
                                            {
                                                PackageServiceItemId = billPackageItem.PackageServiceItemId,
                                                BillingPackageId = billPackageItem.BillingPackageId,
                                                ServiceItemId = billPackageItem.ServiceItemId,
                                                DiscountPercent = billPackageItem.DiscountPercent,
                                                Quantity = billPackageItem.Quantity,
                                                PerformerId = billPackageItem.PerformerId ?? 0,
                                                IsActive = billPackageItem.IsActive,
                                                Price = billMapPrice.Price,
                                                ItemCode = billServiceitem.ItemCode,
                                                ItemName = billServiceitem.ItemName,
                                                PerformerName = emp.FullName
                                            }).OrderByDescending(c => c.PackageServiceItemId).ToList();
            return BillingPackageServiceItemList;
        }

        private object GettingMembershipTypes()
        {
            var membershipTypes = (from type in _billingDbContext.BillingSchemes
                                   select type).OrderBy(m => m.SchemeName).ToList();
           return membershipTypes;
        }
        private object GettingCreditOrganizations()
        {
            var creditOrganization = _billingDbContext.CreditOrganization.OrderBy(c => c.OrganizationName).ToList();
            return creditOrganization;
        }
        private object GetAdditionalServiceItems()
        {
            List<GetAdditionalServiceItems_DTO> additionalServiceItems = (from additm in _billingDbContext.BillingAdditionalServiceItems
                                                                       join cat in _billingDbContext.PriceCategoryModels on additm.PriceCategoryId equals cat.PriceCategoryId
                                                                       select new GetAdditionalServiceItems_DTO
                                                                       {
                                                                           AdditionalServiceItemId = additm.AdditionalServiceItemId,
                                                                           GroupName = additm.GroupName,
                                                                           ItemName = additm.ItemName,
                                                                           UseItemSelfPrice = additm.UseItemSelfPrice,
                                                                           PercentageOfParentItemForSameDept = additm.PercentageOfParentItemForSameDept,
                                                                           PercentageOfParentItemForDiffDept = additm.PercentageOfParentItemForDiffDept,
                                                                           MinimumChargeAmount = additm.MinimumChargeAmount,
                                                                           IsPreAnaesthesia = additm.IsPreAnaesthesia,
                                                                           WithPreAnaesthesia = additm.WithPreAnaesthesia,
                                                                           IsOpServiceItem = additm.IsOpServiceItem,
                                                                           IsIpServiceItem = additm.IsIpServiceItem,
                                                                           IsActive = additm.IsActive,
                                                                           ServiceItemId = additm.ServiceItemId,
                                                                           PriceCategoryId = cat.PriceCategoryId,                                                                        
                                                                           PriceCategoryName = cat.PriceCategoryName,
                                                                       }).ToList();
            return additionalServiceItems;
        }

        private object GettingBillingItems(int itemId, string servDeptName)
        {
            var bilItemPriceDetail = (from item in _billingDbContext.BillServiceItems
                                      join srv in _billingDbContext.ServiceDepartment
                                      on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                      join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on item.ServiceItemId equals priceCatServItem.ServiceItemId
                                      where srv.ServiceDepartmentName == servDeptName && item.IntegrationItemId == itemId
                                      select new
                                      {
                                          item.ServiceItemId,
                                          item.CreatedBy,
                                          item.CreatedOn,
                                          item.Description,
                                         // item.DiscountApplicable,
                                          item.IsTaxApplicable,
                                          item.IsActive,
                                          item.IntegrationItemId,
                                          item.ItemName,
                                          item.ModifiedBy,
                                          item.ModifiedOn,
                                          priceCatServItem.Price,
                                          //item.ProcedureCode,
                                          item.ServiceDepartmentId,
                                          //item.SAARCCitizenPrice,
                                          //item.EHSPrice,
                                          //item.ForeignerPrice,
                                          //item.InsForeignerPrice,
                                          //item.IsSAARCPriceApplicable,
                                          //item.IsForeignerPriceApplicable,
                                          //item.IsInsForeignerPriceApplicable,
                                          //item.IsEHSPriceApplicable,
                                          ItemNamePrice = item.ItemName + " " + priceCatServItem.Price.ToString()
                                      }).FirstOrDefault();
            return bilItemPriceDetail;
        }
        private object GettingBillingItemsByIntegrationName(int itemId, string integrationName)
        {
            var bilItemPriceDetail = (from item in _billingDbContext.BillServiceItems
                                      join srv in _billingDbContext.ServiceDepartment
                                      on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                      join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on item.ServiceItemId equals priceCatServItem.ServiceItemId
                                      where srv.IntegrationName.ToLower() == integrationName.ToLower() && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23
                                      && item.IntegrationItemId == itemId
                                      select new
                                      {
                                          srv.ServiceDepartmentName,
                                          item.ServiceItemId,
                                          item.CreatedBy,
                                          item.CreatedOn,
                                          item.Description,
                                          //item.DiscountApplicable,
                                          item.IsTaxApplicable,
                                          item.IsActive,
                                          item.IntegrationItemId,
                                          item.ItemName,
                                          item.ModifiedBy,
                                          item.ModifiedOn,
                                          priceCatServItem.Price,
                                          //item.ProcedureCode,
                                          item.ServiceDepartmentId,
                                          //item.SAARCCitizenPrice,
                                          //item.EHSPrice,
                                          //item.ForeignerPrice,
                                          //item.InsForeignerPrice,
                                          //item.IsSAARCPriceApplicable,
                                          //item.IsForeignerPriceApplicable,
                                          //item.IsInsForeignerPriceApplicable,
                                          //item.IsEHSPriceApplicable,
                                          //item.IsZeroPriceAllowed,
                                          ItemNamePrice = item.ItemName + " " + priceCatServItem.Price.ToString()
                                      }).ToList();

            return bilItemPriceDetail;
        }
        private object GettingBillItemsByServiceDepartmentName(string servDeptName)
        {
            var itemList = (from item in _billingDbContext.BillServiceItems
                            join srv in _billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                            join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on item.ServiceItemId equals priceCatServItem.ServiceItemId
                            where srv.ServiceDepartmentName == servDeptName && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23
                            select new
                            {
                                ServiceDepartmentId = item.ServiceDepartmentId,
                                ItemName = item.ItemName,
                                ItemNamePrice = item.ItemName + " " + priceCatServItem.Price.ToString(),
                                Price = priceCatServItem.Price
                            }).Distinct().ToList();            
            return itemList;
        }
        private object GettingBillItemsByServiceIntegrationName(string integrationName)
        {
            var itemList = (from item in _billingDbContext.BillServiceItems
                            join srv in _billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                            join priceCatServItem in _billingDbContext.BillItemsPriceCategoryMaps on item.ServiceItemId equals priceCatServItem.ServiceItemId
                            where srv.IntegrationName.ToLower() == integrationName.ToLower() && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23
                            select new
                            {
                                ServiceDepartmentId = item.ServiceDepartmentId,
                                ServiceDepartmentName = srv.ServiceDepartmentName,
                                ItemName = item.ItemName,
                                ItemNamePrice = item.ItemName + " " + priceCatServItem.Price.ToString(),
                                Price = priceCatServItem.Price,
                                //EHSPrice = item.EHSPrice,
                                //SAARCCitizenPrice = item.SAARCCitizenPrice,
                                //ForeignerPrice = item.ForeignerPrice,
                                //InsForeignerPrice = item.InsForeignerPrice
                            }).Distinct().ToList();
            return itemList;
        }
        private object GettingPrinterSettings()
        {
            var printerSettings = (from print in _billingDbContext.PrinterSettings
                                   where print.IsActive == true
                                   select print).ToList();
            return printerSettings;
        }
        private object GettingAllPrinterSettings()
        {
            var printerSettings = (from print in _billingDbContext.PrinterSettings
                                   select print).ToList();
            return printerSettings;
        }
        private object GettingBillingToReportingItemMapping(int reportingItemsId)
        {
            var itemList = _billingDbContext.ReportingItemsAndBillingItemMappingModels
                        .Where(a => a.ReportingItemsId == reportingItemsId)
                        .OrderBy(a => a.ServiceItemId).ToList();
            return itemList;
        }



        private object GetDepositHeads()
        {
            List<DepositHead_DTO> depositHeads = (from dh in _billingDbContext.DepositHeadModel
                                                  select new DepositHead_DTO
                                                  {
                                                      DepositHeadId = dh.DepositHeadId,
                                                      DepositHeadName = dh.DepositHeadName,
                                                      DepositHeadCode = dh.DepositHeadCode,
                                                      IsDefault = dh.IsDefault,
                                                      IsActive = dh.IsActive,
                                                      Description = dh.Description,
                                                  }).ToList();
            return depositHeads;
        }

        private object AddingServiceDepartment(string ipDataStr, RbacUser currentUser)
        {
            ServiceDepartmentModel servdeptModel = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(ipDataStr);
            var isDeptExists = _billingDbContext.ServiceDepartment.Where(d => d.ServiceDepartmentName == servdeptModel.ServiceDepartmentName).ToList();
            if (isDeptExists.Count() != 0)
            {
                throw new Exception("The service Department name is already exist.");
            }
            else
            {
                servdeptModel.CreatedOn = System.DateTime.Now;
                if (servdeptModel.IntegrationName == "None")
                {
                    servdeptModel.IntegrationName = null;
                }
                _masterDbContext.ServiceDepartments.Add(servdeptModel);
                _masterDbContext.SaveChanges();

                if (servdeptModel.IntegrationName != null && servdeptModel.IntegrationName.ToLower() == "radiology")
                {
                    var imagingType = _masterDbContext.ImagingTypes.Where(a => a.ImagingTypeName.ToLower() == servdeptModel.ServiceDepartmentName.ToLower()).FirstOrDefault();
                    if (imagingType == null)
                    {
                        RadiologyImagingTypeModel imagingTypeModel = new RadiologyImagingTypeModel();
                        imagingTypeModel.ImagingTypeName = servdeptModel.ServiceDepartmentName;
                        imagingTypeModel.CreatedOn = System.DateTime.Now;
                        imagingTypeModel.CreatedBy = currentUser.EmployeeId;
                        imagingTypeModel.IsActive = true;

                        _masterDbContext.ImagingTypes.Add(imagingTypeModel);
                        _masterDbContext.SaveChanges();
                    }
                }
                return servdeptModel;
            }
        }
        private object AddingBillingItem(string ipDataStr, RbacUser currentUser)
        {

            BillServiceItemModel item = DanpheJSONConvert.DeserializeObject<BillServiceItemModel>(ipDataStr);
            List<BillMapPriceCategoryServiceItemModel> bilCfgItemsVsPriceCategoryMap = item.BilCfgItemsVsPriceCategoryMap;

            item.CreatedBy = currentUser.EmployeeId;
            item.CreatedOn = DateTime.Now;
            if (item.IntegrationItemId == 0)  
            {
                int maxItemId = 0;
                var allSrvDeptItems = _billingDbContext.BillServiceItems.Where(s => s.ServiceDepartmentId == item.ServiceDepartmentId).ToList();
                if (allSrvDeptItems != null && allSrvDeptItems.Count > 0)
                {
                    maxItemId = allSrvDeptItems.Max(t => t.IntegrationItemId);
                }

                item.IntegrationItemId = maxItemId + 1;
                //item.ProcedureCode = item.IntegrationItemId.ToString();
            }

            _billingDbContext.BillServiceItems.Add(item);
            _billingDbContext.SaveChanges();

            bilCfgItemsVsPriceCategoryMap.ForEach(a =>
            {
                a.CreatedOn = DateTime.Now;
                a.CreatedBy = currentUser.EmployeeId;
                a.ServiceItemId = item.ServiceItemId;
                a.ServiceDepartmentId = item.ServiceDepartmentId;
                a.IntegrationItemId = item.IntegrationItemId;
                a.IsActive = true;
            });
            _billingDbContext.BillItemsPriceCategoryMaps.AddRange(bilCfgItemsVsPriceCategoryMap);
            _billingDbContext.SaveChanges();
            return item;
        }


        private object AddServiceItems(ServiceItem_DTO serviceItemDto, RbacUser currentUser)
        {
            BillServiceItemModel billServiceItemDetails = JsonConvert.DeserializeObject<BillServiceItemModel>(JsonConvert.SerializeObject(serviceItemDto));
            billServiceItemDetails.CreatedOn = DateTime.Now;
            billServiceItemDetails.CreatedBy = currentUser.EmployeeId;
            billServiceItemDetails.IsActive = true;
            _billingDbContext.BillServiceItems.Add(billServiceItemDetails);
            _billingDbContext.SaveChanges();


            foreach (var item in serviceItemDto.BilCfgItemsVsPriceCategoryMap)
            {
                BillMapPriceCategoryServiceItemModel billServiceItem = new BillMapPriceCategoryServiceItemModel();

                billServiceItem.CreatedBy = currentUser.EmployeeId;
                billServiceItem.CreatedOn = DateTime.Now;
                //billServiceItem.IsCoPayment = false;
                billServiceItem.IsActive = true;
                billServiceItem.ServiceItemId = serviceItemDto.ServiceItemId;
                billServiceItem.ServiceDepartmentId = serviceItemDto.ServiceDepartmentId;
                billServiceItem.ServiceItemId = billServiceItemDetails.ServiceItemId;
                billServiceItem.IntegrationItemId = serviceItemDto.IntegrationItemId;
                billServiceItem.HasAdditionalBillingItems = item.HasAdditionalBillingItems;
                //billServiceItem.IsIncentiveApplicable = item.IsIncentiveApplicable;
                billServiceItem.IsDiscountApplicable = item.IsDiscountApplicable;
                billServiceItem.ItemLegalCode = item.ItemLegalCode;
                billServiceItem.ItemLegalName = item.ItemLegalName;
                billServiceItem.IsPriceChangeAllowed = item.IsPriceChangeAllowed;
                billServiceItem.IsZeroPriceAllowed = item.IsZeroPriceAllowed;
                billServiceItem.PriceCategoryId = item.PriceCategoryId;
                billServiceItem.Price = item.Price;

                _billingDbContext.BillItemsPriceCategoryMaps.Add(billServiceItem);
                _billingDbContext.SaveChanges();
            }
            return billServiceItemDetails.ServiceItemId;
        }



        private object AddingReportingItem(string ipDataStr, RbacUser currentUser)
        {
            ReportingItemsModel item = DanpheJSONConvert.DeserializeObject<ReportingItemsModel>(ipDataStr);

            item.CreatedBy = currentUser.EmployeeId;
            item.CreatedOn = DateTime.Now;
            _billingDbContext.ReportingItemsModels.Add(item);
            _billingDbContext.SaveChanges();
            return item;
        }

        private object AddAdditionalServiceItem(AddUpdateAdditionalServiceItem_DTO additionalServiceItems_DTO, RbacUser currentUser)
        {
            BillingAdditionalServiceItemModel item = new BillingAdditionalServiceItemModel();

            if (additionalServiceItems_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }
            else
            {
                item.CreatedBy = currentUser.EmployeeId;
                item.CreatedOn = DateTime.Now;
                item.GroupName = additionalServiceItems_DTO.GroupName;
                item.ServiceItemId = additionalServiceItems_DTO.ServiceItemId;
                item.PriceCategoryId = additionalServiceItems_DTO.PriceCategoryId;
                item.ItemName = additionalServiceItems_DTO.ItemName;
                item.UseItemSelfPrice = additionalServiceItems_DTO.UseItemSelfPrice;
                item.PercentageOfParentItemForDiffDept = additionalServiceItems_DTO.PercentageOfParentItemForDiffDept;
                item.PercentageOfParentItemForSameDept = additionalServiceItems_DTO.PercentageOfParentItemForSameDept;
                item.MinimumChargeAmount = additionalServiceItems_DTO.MinimumChargeAmount;
                item.IsActive = additionalServiceItems_DTO.IsActive;
                item.IsIpServiceItem = additionalServiceItems_DTO.IsIpServiceItem;
                item.IsPreAnaesthesia = additionalServiceItems_DTO.IsPreAnaesthesia;
                item.WithPreAnaesthesia = additionalServiceItems_DTO.WithPreAnaesthesia;
                item.IsOpServiceItem = additionalServiceItems_DTO.IsOpServiceItem;
                _billingDbContext.BillingAdditionalServiceItems.Add(item);
                _billingDbContext.SaveChanges();
                return item;
            }
        }

        private object AddDepositHead(DepositHead_DTO depositHead_DTO, RbacUser currentUser)
        {
            DepositHeadModel heads = new DepositHeadModel();

            if (depositHead_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }
            else
            {
                heads.CreatedBy = currentUser.EmployeeId;
                heads.CreatedOn = DateTime.Now;
                heads.DepositHeadCode = depositHead_DTO.DepositHeadCode;
                heads.DepositHeadName = depositHead_DTO.DepositHeadName;
                heads.IsDefault = depositHead_DTO.IsDefault;
                heads.Description = depositHead_DTO.Description;
                heads.IsActive = depositHead_DTO.IsActive;
                _billingDbContext.DepositHeadModel.Add(heads);
                _billingDbContext.SaveChanges();
                return Ok();
            }
        }

        private object AddingBillingToReportingItemMapping(string ipDataStr)
        {
            List<ReportingItemBillingItemMapping> mappingObject = DanpheJSONConvert.DeserializeObject<List<ReportingItemBillingItemMapping>>(ipDataStr);
            mappingObject.ForEach(mapping =>
            {
                _billingDbContext.ReportingItemsAndBillingItemMappingModels.Add(mapping);
            });

            _billingDbContext.SaveChanges();
            return mappingObject;
        }
        private object AddingBillingPackage(BillingPackage_DTO billingPackage, RbacUser currentUser)
        {
            using ( var billingPackageTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                
                try
                {
                    if (billingPackage == null)
                    {
                        throw new Exception("Billing Package is Null.");
                    }
                    if (billingPackage.BillingPackageServiceItemList.Count == 0)
                    {
                        throw new Exception("No Billing Package Items found.");
                    }

                    BillingPackageModel newBillingPackage = new BillingPackageModel();
                    newBillingPackage.BillingPackageName = billingPackage.BillingPackageName;
                    newBillingPackage.PackageCode = billingPackage.PackageCode;
                    newBillingPackage.Description = billingPackage.Description;
                    newBillingPackage.LabTypeName = billingPackage.LabTypeName;
                    newBillingPackage.SchemeId = billingPackage.SchemeId;
                    newBillingPackage.PriceCategoryId = billingPackage.PriceCategoryId;
                    newBillingPackage.IsEditable = billingPackage.IsEditable;
                    /*newBIllingPackage.InsuranceApplicable = billinPackage.InsuranceApplicable;*/
                    newBillingPackage.IsActive = billingPackage.IsActive;
                    newBillingPackage.TotalPrice = billingPackage.TotalPrice;
                    newBillingPackage.CreatedBy = currentUser.EmployeeId;
                    newBillingPackage.CreatedOn = DateTime.Now;
                    newBillingPackage.DiscountPercent = billingPackage.DiscountPercent;
                    _billingDbContext.BillingPackages.Add(newBillingPackage);
                    _billingDbContext.SaveChanges();
                    foreach (var item in billingPackage.BillingPackageServiceItemList)
                    {
                        BillingPackageServiceItemModel billingPackageServiceItem = new BillingPackageServiceItemModel();
                        billingPackageServiceItem.BillingPackageId = newBillingPackage.BillingPackageId;
                        billingPackageServiceItem.ServiceItemId = item.ServiceItemId;
                        billingPackageServiceItem.DiscountPercent = item.DiscountPercent;
                        billingPackageServiceItem.Quantity = item.Quantity;
                        billingPackageServiceItem.IsActive = item.IsActive;
                        billingPackageServiceItem.PerformerId = item.PerformerId;
                        billingPackageServiceItem.CreatedBy = currentUser.EmployeeId;
                        billingPackageServiceItem.CreatedOn = DateTime.Now;
                        _billingDbContext.BillingPackageServiceItems.Add(billingPackageServiceItem);
                    }
                    _billingDbContext.SaveChanges();
                    billingPackageTransactionScope.Commit();
                    return newBillingPackage.BillingPackageId;
                }
                catch (Exception ex)
                {
                    billingPackageTransactionScope.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
            }
            

            /*            _billingDbContext.BillingPackages.Add(package);
                        _billingDbContext.SaveChanges();*/
            /*package.BillingItemsXML = ConvertXMLToJson(package.BillingItemsXML);*/


        }
        private object AddingCreditOrganization(string ipDataStr)
        {
            CreditOrganizationModel org = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(ipDataStr);
            _billingDbContext.CreditOrganization.Add(org);
            _billingDbContext.SaveChanges();
            return org;
        }
        private object AddingMembershipType(string ipDataStr, RbacUser currentUser)
        {
            BillingSchemeModel scheme = DanpheJSONConvert.DeserializeObject<BillingSchemeModel>(ipDataStr);
            scheme.CreatedBy = currentUser.EmployeeId;
            scheme.CreatedOn = DateTime.Now;
            _billingDbContext.BillingSchemes.Add(scheme);
            _billingDbContext.SaveChanges();
            return scheme;
        }
        private object AddingPrinterSetting(string ipDataStr, RbacUser currentUser)
        {
            PrinterSettingsModel printerSetting = DanpheJSONConvert.DeserializeObject<PrinterSettingsModel>(ipDataStr);
            printerSetting.IsActive = true;
            printerSetting.CreatedBy = currentUser.EmployeeId;
            printerSetting.CreatedOn = DateTime.Now;
            _billingDbContext.PrinterSettings.Add(printerSetting);
            _billingDbContext.SaveChanges();
            return printerSetting;
        }
        private object AddingBillItemsPriceCategoryMap(string ipDataStr, RbacUser currentUser)
        {
            try
            {
                BillCfgItemsVsPriceCategoryDto billCfgItemsVsPriceCategoryDto = DanpheJSONConvert.DeserializeObject<BillCfgItemsVsPriceCategoryDto>(ipDataStr);

                var billCfgItem = _billingDbContext.BillServiceItems.Where(a => a.ServiceItemId == billCfgItemsVsPriceCategoryDto.BillCfgItemPriceId).FirstOrDefault();
                BillMapPriceCategoryServiceItemModel bilCfgItemsVsPriceCategoryMap = new BillMapPriceCategoryServiceItemModel();
                if (billCfgItem != null)
                {
                    bilCfgItemsVsPriceCategoryMap.ServiceItemId = billCfgItem.ServiceItemId;
                    bilCfgItemsVsPriceCategoryMap.ItemLegalName = billCfgItemsVsPriceCategoryDto.LegalName != null ? billCfgItemsVsPriceCategoryDto.LegalName : billCfgItem.ItemName;
                    bilCfgItemsVsPriceCategoryMap.PriceCategoryId = billCfgItemsVsPriceCategoryDto.PriceCategoryId;
                    //bilCfgItemsVsPriceCategoryMap.Discount = billCfgItemsVsPriceCategoryDto.Discount;
                    bilCfgItemsVsPriceCategoryMap.Price = billCfgItemsVsPriceCategoryDto.Price;
                    bilCfgItemsVsPriceCategoryMap.IsDiscountApplicable = billCfgItemsVsPriceCategoryDto.DiscountApplicable;
                    bilCfgItemsVsPriceCategoryMap.IntegrationItemId = billCfgItem.IntegrationItemId;
                    bilCfgItemsVsPriceCategoryMap.ServiceDepartmentId = billCfgItem.ServiceDepartmentId;
                    bilCfgItemsVsPriceCategoryMap.IsActive = true;
                    bilCfgItemsVsPriceCategoryMap.ItemLegalCode = billCfgItemsVsPriceCategoryDto.ItemLegalCode;
                    //bilCfgItemsVsPriceCategoryMap.IsCoPayment = billCfgItemsVsPriceCategoryDto.IsCoPayment;
                    //bilCfgItemsVsPriceCategoryMap.CoPaymentCashPercent = billCfgItemsVsPriceCategoryDto.CoPaymentCashPercent;
                    //bilCfgItemsVsPriceCategoryMap.CoPaymentCreditPercent = billCfgItemsVsPriceCategoryDto.CoPaymentCreditPercent;
                    bilCfgItemsVsPriceCategoryMap.CreatedBy = currentUser.EmployeeId;
                    bilCfgItemsVsPriceCategoryMap.CreatedOn = DateTime.Now;

                    _billingDbContext.BillItemsPriceCategoryMaps.Add(bilCfgItemsVsPriceCategoryMap);
                    _billingDbContext.SaveChanges();
                }
                return bilCfgItemsVsPriceCategoryMap;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }

        private object AddingBillServiceItemsPriceCategoryMap(PriceCategoryServiceItem_DTO serviceItem_DTO , RbacUser currentUser)
        {
            BillMapPriceCategoryServiceItemModel servicePrice = new BillMapPriceCategoryServiceItemModel();
            servicePrice.CreatedBy = currentUser.UserId;
            servicePrice.CreatedOn = DateTime.Now;

            servicePrice.HasAdditionalBillingItems = serviceItem_DTO.HasAdditionalBillingItems;
            servicePrice.IsDiscountApplicable = serviceItem_DTO.IsDiscountApplicable;
            //servicePrice.IsIncentiveApplicable= serviceItem_DTO.IsIncentiveApplicable;
            servicePrice.IsZeroPriceAllowed= serviceItem_DTO.IsZeroPriceAllowed;
            servicePrice.IsPriceChangeAllowed= serviceItem_DTO.IsPriceChangeAllowed;    
            servicePrice.ItemLegalName= serviceItem_DTO.ItemLegalName;
            servicePrice.ItemLegalCode= serviceItem_DTO.ItemLegalCode;
            servicePrice.Price = serviceItem_DTO.Price;
            servicePrice.PriceCategoryId= serviceItem_DTO.PriceCategoryId;
            servicePrice.ServiceItemId = serviceItem_DTO.ServiceItemId;
            servicePrice.ServiceDepartmentId = serviceItem_DTO.ServiceDepartmentId;
            servicePrice.IntegrationItemId= serviceItem_DTO.IntegrationItemId;
           _billingDbContext.BillItemsPriceCategoryMaps.Add(servicePrice);
            _billingDbContext.SaveChanges();

            return servicePrice;
        }


        private object UpdateServiceDepartment(string ipDataStr)
        {
            ServiceDepartmentModel clientServDept = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(ipDataStr);
            if (clientServDept.IntegrationName == "None")
            {
                clientServDept.IntegrationName = null;
            }
            _masterDbContext.ServiceDepartments.Attach(clientServDept);
            _masterDbContext.Entry(clientServDept).State = EntityState.Modified;
            _masterDbContext.Entry(clientServDept).Property(x => x.CreatedOn).IsModified = false;
            _masterDbContext.Entry(clientServDept).Property(x => x.CreatedBy).IsModified = false;
            clientServDept.ModifiedOn = System.DateTime.Now;
            _masterDbContext.SaveChanges();
            return clientServDept;
        }
        private object UpdateBillingItem(string ipDataStr, RbacUser currentUser)
        {
            BillServiceItemModel item = DanpheJSONConvert.DeserializeObject<BillServiceItemModel>(ipDataStr);
            _billingDbContext.BillServiceItems.Attach(item);
            _billingDbContext.Entry(item).State = EntityState.Modified;
            _billingDbContext.SaveChanges();

            string intgrationName = (from s in _billingDbContext.ServiceDepartment
                                     where s.ServiceDepartmentId == item.ServiceDepartmentId
                                     select s.IntegrationName).FirstOrDefault();

            if (!string.IsNullOrEmpty(intgrationName) &&
                (intgrationName.ToLower() == "lab" || intgrationName.ToLower() == "radiology" || intgrationName.ToLower() == "bed charges"))
            {
                UpdateDepartmentItems(intgrationName, item);
            }
            DeactivateOrActivateBilCfgItemsVsPriceCategoryMap(item.ServiceItemId, currentUser.EmployeeId);
            return item;

        }

        private object UpdateActivateDeactivateServiceItem(ServiceItem_DTO serviceItem_DTO, RbacUser currentUser)
        {    

            var billServiceDetailToUpdate=_billingDbContext.BillServiceItems.Where(a=>a.ServiceItemId==serviceItem_DTO.ServiceItemId).FirstOrDefault();
            billServiceDetailToUpdate.IsActive = serviceItem_DTO.IsActive;
                _billingDbContext.SaveChanges();

                return billServiceDetailToUpdate;
          
        }




        private object UpdateServiceItem(ServiceItem_DTO serviceItemDto, RbacUser currentUser)
        {
            if (serviceItemDto == null)
            {
                return new Exception("Provided data should not be null");
            }
            
                var ServiceItems = _billingDbContext.BillServiceItems.Where(x => x.ServiceItemId == serviceItemDto.ServiceItemId).FirstOrDefault();
            if (ServiceItems == null) return new Exception("No data found to update");
                
                    ServiceItems.ModifiedOn = DateTime.Now;
                    ServiceItems.ModifiedBy = currentUser.EmployeeId;
                    ServiceItems.IsActive = true;
                    ServiceItems.ItemCode = serviceItemDto.ItemCode;
                    ServiceItems.IntegrationName = serviceItemDto.IntegrationName;
                    ServiceItems.IsTaxApplicable = serviceItemDto.IsTaxApplicable;
                    ServiceItems.IsErLabApplicable = serviceItemDto.IsErLabApplicable;
                    ServiceItems.IsDoctorMandatory = serviceItemDto.IsDoctorMandatory;
                    ServiceItems.Description = serviceItemDto.Description;
                    ServiceItems.AllowMultipleQty = serviceItemDto.AllowMultipleQty;
                    ServiceItems.IsProc = serviceItemDto.IsProc;
                    ServiceItems.DefaultDoctorList = serviceItemDto.DefaultDoctorList;
                    ServiceItems.ServiceCategoryId = serviceItemDto.ServiceCategoryId;
                    ServiceItems.IsDoctorMandatory = serviceItemDto.IsDoctorMandatory;
                    ServiceItems.ItemName = serviceItemDto.ItemName;
                    ServiceItems.IsOT = serviceItemDto.IsOT;
                    ServiceItems.IsValidForReporting = serviceItemDto.IsValidForReporting;

                    _billingDbContext.SaveChanges();
                
            


            List<BillPriceCategoryServiceItemsDTO> serviceItemsPriceCategoryMap = serviceItemDto.BilCfgItemsVsPriceCategoryMap;
            if (serviceItemsPriceCategoryMap != null)
            {
                foreach (var item in serviceItemsPriceCategoryMap)
                {
                    var ServicePrice = _billingDbContext.BillItemsPriceCategoryMaps.Where(x => x.PriceCategoryServiceItemMapId == item.PriceCategoryServiceItemMapId).FirstOrDefault();

                    ServicePrice.ModifiedBy = currentUser.EmployeeId;
                    ServicePrice.ModifiedOn = DateTime.Now;
                    //ServicePrice.IsCoPayment = false;
                    ServicePrice.IsActive = true;
                    ServicePrice.ServiceItemId = ServiceItems.ServiceItemId;
                    ServicePrice.ServiceDepartmentId = ServiceItems.ServiceDepartmentId;
                    ServicePrice.IntegrationItemId = ServiceItems.IntegrationItemId;
                    ServicePrice.ItemLegalCode = item.ItemLegalCode;
                    ServicePrice.ItemLegalName = item.ItemLegalName;
                    ServicePrice.HasAdditionalBillingItems = item.HasAdditionalBillingItems;
                    ServicePrice.PriceCategoryId = item.PriceCategoryId;
                    ServicePrice.Price = item.Price;
                    ServicePrice.IsPriceChangeAllowed = item.IsPriceChangeAllowed;
                    ServicePrice.IsZeroPriceAllowed = item.IsZeroPriceAllowed;
                    //ServicePrice.IsIncentiveApplicable = item.IsIncentiveApplicable;
                    ServicePrice.IsDiscountApplicable = item.IsDiscountApplicable;
                    _billingDbContext.SaveChanges();
                }
            }
            return ServiceItems.ServiceItemId;
        }

        private object UpdateReportingItem(string ipDataStr)
        {
            ReportingItemsModel item = DanpheJSONConvert.DeserializeObject<ReportingItemsModel>(ipDataStr);
            _billingDbContext.ReportingItemsModels.Attach(item);
            _billingDbContext.Entry(item).State = EntityState.Modified;
            _billingDbContext.SaveChanges();
            return item;

        }
        private object UpdateBillingAndReportingItemMapping(string ipDataStr)
        {
            List<ReportingItemBillingItemMapping> mappingObject = DanpheJSONConvert.DeserializeObject<List<ReportingItemBillingItemMapping>>(ipDataStr);
            mappingObject.ForEach(mapping =>
            {
                _billingDbContext.ReportingItemsAndBillingItemMappingModels.Attach(mapping);
                _billingDbContext.Entry(mapping).State = EntityState.Modified;
            });
            _billingDbContext.SaveChanges();
            return mappingObject;
        }

        private object UpdateBillingPackage(BillingPackage_DTO billingPackage, RbacUser currentuser)
        {
            using (var billingPackageTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (billingPackage == null)
                    {
                        throw new Exception("Billing Package is Null.");
                    }

                    if (billingPackage.BillingPackageServiceItemList.Count == 0)
                    {
                        throw new Exception("No Billing Package Items found.");
                    }

                    var newBillingPackage = (from billPackage in _billingDbContext.BillingPackages
                                         where billPackage.BillingPackageId == billingPackage.BillingPackageId
                                         select billPackage).FirstOrDefault();
                    if(newBillingPackage == null)
                    {
                        throw new Exception("No Billing Package found.");
                    }
                    newBillingPackage.BillingPackageName = billingPackage.BillingPackageName;
                    newBillingPackage.PackageCode = billingPackage.PackageCode;
                    newBillingPackage.Description = billingPackage.Description;
                    newBillingPackage.LabTypeName = billingPackage.LabTypeName;
                    newBillingPackage.SchemeId = billingPackage.SchemeId;
                    newBillingPackage.PriceCategoryId = billingPackage.PriceCategoryId;
                    newBillingPackage.IsEditable = billingPackage.IsEditable;
                    newBillingPackage.IsActive = billingPackage.IsActive;
                    newBillingPackage.TotalPrice = billingPackage.TotalPrice;
                    newBillingPackage.ModifiedBy = currentuser.EmployeeId;
                    newBillingPackage.ModifiedOn = DateTime.Now;
                    newBillingPackage.DiscountPercent = billingPackage.DiscountPercent;
                    _billingDbContext.Entry(newBillingPackage).State = EntityState.Modified;
                    _billingDbContext.SaveChanges();

                    var existingBillingPackageServiceItemList = (from billPackageItem in _billingDbContext.BillingPackageServiceItems
                                                             where billPackageItem.BillingPackageId == newBillingPackage.BillingPackageId
                                                             select billPackageItem).ToList();
                    var NewItems = billingPackage.BillingPackageServiceItemList.Where(item => item.PackageServiceItemId == 0).ToList();
                    var ExistingList = existingBillingPackageServiceItemList.Where(oldItem => billingPackage.BillingPackageServiceItemList.Any(item => item.PackageServiceItemId == oldItem.PackageServiceItemId && oldItem.IsActive == true)).ToList();

                    var RemovedItems = existingBillingPackageServiceItemList.Where(oldItem => !billingPackage.BillingPackageServiceItemList.Any(newItem => newItem.PackageServiceItemId == oldItem.PackageServiceItemId)).ToList();

                    if (RemovedItems != null)
                    {
                        _billingDbContext.BillingPackageServiceItems.RemoveRange(RemovedItems);
                    }

                    foreach (var item in NewItems)
                    {
                        BillingPackageServiceItemModel newBillingPackageServiceItem = new BillingPackageServiceItemModel();
                        newBillingPackageServiceItem.BillingPackageId = newBillingPackage.BillingPackageId;
                        newBillingPackageServiceItem.ServiceItemId = item.ServiceItemId;
                        newBillingPackageServiceItem.DiscountPercent = item.DiscountPercent;
                        newBillingPackageServiceItem.Quantity = item.Quantity;
                        newBillingPackageServiceItem.IsActive = item.IsActive;
                        newBillingPackageServiceItem.PerformerId = item.PerformerId;
                        newBillingPackageServiceItem.CreatedBy = currentuser.EmployeeId;
                        newBillingPackageServiceItem.CreatedOn = DateTime.Now;
                        _billingDbContext.BillingPackageServiceItems.Add(newBillingPackageServiceItem);
                    }

                    ExistingList.ForEach(a =>
                    {
                        var packageServiceItem = billingPackage.BillingPackageServiceItemList.Find(p => p.PackageServiceItemId == a.PackageServiceItemId);
                        if(packageServiceItem != null)
                        {
                        a.DiscountPercent = packageServiceItem.DiscountPercent;
                        }
                        a.ModifiedBy = currentuser.EmployeeId;
                        a.ModifiedOn = DateTime.Now;
                        _billingDbContext.Entry(a).State = EntityState.Modified;
                    });

                    _billingDbContext.SaveChanges();
                    billingPackageTransactionScope.Commit();
                    return newBillingPackage.BillingPackageId;
                }
                catch (Exception ex)
                {
                    billingPackageTransactionScope.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
            }
        }
        
        private object UpdateBillingPackageStatus(int BillingPackageId)
        {
            BillingPackageModel BillingPackage = (from billPackage in _billingDbContext.BillingPackages
                                                  where billPackage.BillingPackageId == BillingPackageId
                                                  select billPackage).FirstOrDefault();
            if(BillingPackage == null)
            {
                throw new Exception("BillingPackage not found.");
            }
            BillingPackage.IsActive = !BillingPackage.IsActive;
            _billingDbContext.Entry(BillingPackage).State = EntityState.Modified;
            _billingDbContext.SaveChanges();
            return BillingPackage.IsActive;
        }
        private object UpdateCreditOrganization(string ipDataStr)
        {
            CreditOrganizationModel creditOrganization = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(ipDataStr);
            _billingDbContext.CreditOrganization.Attach(creditOrganization);
            _billingDbContext.Entry(creditOrganization).State = EntityState.Modified;
            _billingDbContext.Entry(creditOrganization).Property(x => x.CreatedOn).IsModified = false;
            _billingDbContext.Entry(creditOrganization).Property(x => x.CreatedBy).IsModified = false;
            _billingDbContext.SaveChanges();
            return creditOrganization;
        }
        private object UpdateMembershipType(string ipDataStr)
        {
            BillingSchemeModel scheme = DanpheJSONConvert.DeserializeObject<BillingSchemeModel>(ipDataStr);
            _billingDbContext.BillingSchemes.Attach(scheme);
            _billingDbContext.Entry(scheme).State = EntityState.Modified;
            _billingDbContext.Entry(scheme).Property(x => x.CreatedOn).IsModified = false;
            _billingDbContext.Entry(scheme).Property(x => x.CreatedBy).IsModified = false;
            _billingDbContext.SaveChanges();
            return scheme;
            
        }

        private object UpdateAdditionalServiceItem(AddUpdateAdditionalServiceItem_DTO additionalServiceItems_DTO, RbacUser currentUser)
        {

            if (additionalServiceItems_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }
            else
            {
                var serviceItems = _billingDbContext.BillingAdditionalServiceItems.Where(x => x.AdditionalServiceItemId == additionalServiceItems_DTO.AdditionalServiceItemId).FirstOrDefault();
                serviceItems.ModifiedOn = DateTime.Now;
                serviceItems.ModifiedBy = currentUser.EmployeeId;
                serviceItems.GroupName = additionalServiceItems_DTO.GroupName;
                serviceItems.ServiceItemId = additionalServiceItems_DTO.ServiceItemId;
                serviceItems.PriceCategoryId = additionalServiceItems_DTO.PriceCategoryId;
                serviceItems.ItemName = additionalServiceItems_DTO.ItemName;
                serviceItems.UseItemSelfPrice = additionalServiceItems_DTO.UseItemSelfPrice;
                serviceItems.PercentageOfParentItemForDiffDept = additionalServiceItems_DTO.PercentageOfParentItemForDiffDept;
                serviceItems.PercentageOfParentItemForSameDept = additionalServiceItems_DTO.PercentageOfParentItemForSameDept;
                serviceItems.MinimumChargeAmount = additionalServiceItems_DTO.MinimumChargeAmount;
                serviceItems.IsActive = additionalServiceItems_DTO.IsActive;
                serviceItems.IsIpServiceItem = additionalServiceItems_DTO.IsIpServiceItem;
                serviceItems.IsPreAnaesthesia = additionalServiceItems_DTO.IsPreAnaesthesia;
                serviceItems.WithPreAnaesthesia = additionalServiceItems_DTO.WithPreAnaesthesia;
                serviceItems.IsOpServiceItem = additionalServiceItems_DTO.IsOpServiceItem;
                _billingDbContext.SaveChanges();
                return serviceItems;
            }
        }

        private object UpdateDepositHead(DepositHead_DTO depositHead_DTO, RbacUser currentUser)
        {
            if (depositHead_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }
            else
            {
                var heads = _billingDbContext.DepositHeadModel
                    .FirstOrDefault(x => x.DepositHeadId == depositHead_DTO.DepositHeadId);
                if (heads != null)
                {
                    heads.ModifiedOn = DateTime.Now;
                    heads.ModifiedBy = currentUser.EmployeeId;
                    heads.DepositHeadCode = depositHead_DTO.DepositHeadCode;
                    heads.DepositHeadName = depositHead_DTO.DepositHeadName;
                    heads.IsActive = depositHead_DTO.IsActive;
                    heads.IsDefault = depositHead_DTO.IsDefault;
                    heads.Description = depositHead_DTO.Description;
                    _billingDbContext.SaveChanges();
                    return Ok();
                }
                else
                {
                    return new Exception("Deposit head not found for the given ID");
                }
            }
        }


        private object UpdateActivateDeactivateAdditionalServiceItem(int additionalServiceItemId, bool isActive, RbacUser currentUser)
        {
            var serviceItems = _billingDbContext.BillingAdditionalServiceItems.Where(x => x.AdditionalServiceItemId == additionalServiceItemId).FirstOrDefault();
            serviceItems.IsActive = isActive;
            _billingDbContext.SaveChanges();
            return serviceItems;
        }

        private object UpdateActivateDeactivateDepositHead(int depositHeadId, RbacUser currentUser)
        {
            var depositHead = _billingDbContext.DepositHeadModel.AsNoTracking().Where(x => x.DepositHeadId == depositHeadId).FirstOrDefault();
            if (depositHead != null)
            {
                depositHead.IsActive = !depositHead.IsActive;
                depositHead.ModifiedBy = currentUser.EmployeeId;
                depositHead.ModifiedOn = DateTime.Now;
                _billingDbContext.Entry(depositHead).State = EntityState.Modified;
                _billingDbContext.SaveChanges();
                return depositHead.IsActive;
            }
            else
            {
                throw new Exception("Deposit Head not found.");
            }
        }

        private object UpdatePrinterSetting(string ipDataStr, RbacUser currentUser)
        {
            PrinterSettingsModel printerSetting = DanpheJSONConvert.DeserializeObject<PrinterSettingsModel>(ipDataStr);

            printerSetting.ModifiedBy = currentUser.EmployeeId;
            printerSetting.ModifiedOn = DateTime.Now;

            _billingDbContext.PrinterSettings.Attach(printerSetting);
            _billingDbContext.Entry(printerSetting).Property(x => x.PrintingType).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.GroupName).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.PrinterDisplayName).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.PrinterName).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.ModelName).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.Width_Lines).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.Height_Lines).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.HeaderGap_Lines).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.FooterGap_Lines).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.mh).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.ml).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.ServerFolderPath).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.Remarks).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.IsActive).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.ModifiedBy).IsModified = true;
            _billingDbContext.Entry(printerSetting).Property(x => x.ModifiedOn).IsModified = true;
            _billingDbContext.SaveChanges();
            return printerSetting;

        }
        private object UpdateBillItemsPriceCategoryMap(string ipDataStr, RbacUser currentUser, int PriceCategoryMapId)
        {
            try
            {
                BillMapPriceCategoryServiceItemModel billItemsPriceCategoryMap = DanpheJSONConvert.DeserializeObject<BillMapPriceCategoryServiceItemModel>(ipDataStr);
                if (billItemsPriceCategoryMap.Price == null || billItemsPriceCategoryMap.Price <= 0)
                {
                    billItemsPriceCategoryMap.Price = 0;
                }
                //if (billItemsPriceCategoryMap.Discount == null || billItemsPriceCategoryMap.Discount <= 0)
                //{
                //    billItemsPriceCategoryMap.Discount = 0;
                //}
                if (billItemsPriceCategoryMap.ItemLegalName == null)
                {
                    billItemsPriceCategoryMap.ItemLegalName = _billingDbContext.BillServiceItems.Where(itms => itms.ServiceItemId == billItemsPriceCategoryMap.IntegrationItemId).Select(a => a.ItemName).FirstOrDefault();
                }

                BillMapPriceCategoryServiceItemModel billItemsPriceCategoryMapFromDb = _billingDbContext.BillItemsPriceCategoryMaps.Where(a => a.PriceCategoryServiceItemMapId == PriceCategoryMapId).FirstOrDefault();

                billItemsPriceCategoryMapFromDb.Price = billItemsPriceCategoryMap.Price;
                //billItemsPriceCategoryMapFromDb.Discount = billItemsPriceCategoryMap.Discount;
                billItemsPriceCategoryMapFromDb.ItemLegalName = billItemsPriceCategoryMap.ItemLegalName;
                billItemsPriceCategoryMapFromDb.ItemLegalCode = billItemsPriceCategoryMap.ItemLegalCode;
                billItemsPriceCategoryMapFromDb.IsDiscountApplicable = billItemsPriceCategoryMap.IsDiscountApplicable;
                billItemsPriceCategoryMapFromDb.IsActive = billItemsPriceCategoryMap.IsActive;
                //billItemsPriceCategoryMapFromDb.IsCoPayment = billItemsPriceCategoryMap.IsCoPayment;
                //billItemsPriceCategoryMapFromDb.CoPaymentCashPercent = billItemsPriceCategoryMap.CoPaymentCashPercent;
                //billItemsPriceCategoryMapFromDb.CoPaymentCreditPercent = billItemsPriceCategoryMap.CoPaymentCreditPercent;
                billItemsPriceCategoryMapFromDb.ModifiedBy = currentUser.EmployeeId;
                billItemsPriceCategoryMapFromDb.ModifiedOn = DateTime.Now;

                _billingDbContext.BillItemsPriceCategoryMaps.Attach(billItemsPriceCategoryMapFromDb);

                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.ItemLegalName).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.Price).IsModified = true;
                //_billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.Discount).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.ItemLegalCode).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.IsDiscountApplicable).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.IsActive).IsModified = true;
                //_billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.IsCoPayment).IsModified = true;
                //_billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.CoPaymentCashPercent).IsModified = true;
                //_billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.CoPaymentCreditPercent).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.ModifiedBy).IsModified = true;
                _billingDbContext.Entry(billItemsPriceCategoryMapFromDb).Property(p => p.ModifiedOn).IsModified = true;
                _billingDbContext.SaveChanges();

                return billItemsPriceCategoryMapFromDb;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + "Cannot Update. Exception details: " + ex.ToString());
            }
        }
        private object UpdateBillServiceItemsPriceCategoryMap(PriceCategoryServiceItem_DTO servicePriceMap_DTO, RbacUser currentUser, int PriceCategoryServiceItemMapId)
        {
            if (servicePriceMap_DTO == null)
            {
                return new Exception("Provided data should not be null");
            }

            var billServiceDetailToUpdate = _billingDbContext.BillItemsPriceCategoryMaps.Where(a => a.PriceCategoryServiceItemMapId == servicePriceMap_DTO.PriceCategoryServiceItemMapId).FirstOrDefault();

            billServiceDetailToUpdate.IsActive = servicePriceMap_DTO.IsActive;
            billServiceDetailToUpdate.ModifiedBy = currentUser.EmployeeId;
            billServiceDetailToUpdate.ModifiedOn = DateTime.Now;
            billServiceDetailToUpdate.Price = servicePriceMap_DTO.Price;
            billServiceDetailToUpdate.PriceCategoryId = servicePriceMap_DTO.PriceCategoryId;
            billServiceDetailToUpdate.IsDiscountApplicable = servicePriceMap_DTO.IsDiscountApplicable;
            //billServiceDetailToUpdate.IsIncentiveApplicable = servicePriceMap_DTO.IsIncentiveApplicable;
            billServiceDetailToUpdate.ItemLegalCode= servicePriceMap_DTO.ItemLegalCode;
            billServiceDetailToUpdate.ItemLegalName = servicePriceMap_DTO.ItemLegalName;
            billServiceDetailToUpdate.IsPriceChangeAllowed = servicePriceMap_DTO.IsPriceChangeAllowed;
            billServiceDetailToUpdate.IsZeroPriceAllowed = servicePriceMap_DTO.IsZeroPriceAllowed;
            billServiceDetailToUpdate.HasAdditionalBillingItems = servicePriceMap_DTO.HasAdditionalBillingItems;
            _billingDbContext.SaveChanges();
            return billServiceDetailToUpdate;
            
        }


        private void UpdateDepartmentItems(string intgrationName, BillServiceItemModel billItem)
        {
            if (billItem != null)
            {
                if (intgrationName.ToLower() == "lab")
                {
                    LabTestModel tst = _labDbContext.LabTests.Where(a => a.LabTestId == billItem.IntegrationItemId).FirstOrDefault();
                    if (tst != null)
                    {
                        tst.IsActive = billItem.IsActive;
                        _labDbContext.Entry(tst).Property(x => x.IsActive).IsModified = true;
                        _labDbContext.SaveChanges();
                    }
                }
                else if (intgrationName.ToLower() == "radiology")
                {
                    RadiologyImagingItemModel imgItm = _radiologyDbContext.ImagingItems.Where(a => a.ImagingItemId == billItem.IntegrationItemId).FirstOrDefault();
                    if (imgItm != null)
                    {
                        imgItm.IsActive = billItem.IsActive;
                        _radiologyDbContext.Entry(imgItm).Property(x => x.IsActive).IsModified = true;
                        _radiologyDbContext.SaveChanges();
                    }
                }
                else if (intgrationName.ToLower() == "bed charges")
                {
                    BedFeature bFeatureItm = _admissionDbContext.BedFeatures.Where(a => a.BedFeatureId == billItem.IntegrationItemId).FirstOrDefault();
                    if (bFeatureItm != null)
                    {
                        bFeatureItm.IsActive = billItem.IsActive;
                        //bFeatureItm.BedPrice = (double)billItem.Price; //Krishna 13thMarch'23 need to revise this logic later

                        _admissionDbContext.Entry(bFeatureItm).Property(x => x.IsActive).IsModified = true;
                        _admissionDbContext.Entry(bFeatureItm).Property(x => x.BedPrice).IsModified = true;
                        _admissionDbContext.SaveChanges();
                    }

                }

            }
        }
        private void DeactivateOrActivateBilCfgItemsVsPriceCategoryMap(int billItemPriceId, int currentUserEmployeeId)
        {
            var billCfgItemsVsPriceCategoryMap = _billingDbContext.BillItemsPriceCategoryMaps.Where(a => a.ServiceItemId == billItemPriceId).ToList();

            for (int i = 0; i < billCfgItemsVsPriceCategoryMap.Count; i++)
            {
                BillMapPriceCategoryServiceItemModel bilCfgItemsVsPriceCategories = new BillMapPriceCategoryServiceItemModel();
                bilCfgItemsVsPriceCategories = billCfgItemsVsPriceCategoryMap[i];
                bilCfgItemsVsPriceCategories.ModifiedBy = currentUserEmployeeId;
                bilCfgItemsVsPriceCategories.ModifiedOn = DateTime.Now;

                _billingDbContext.BillItemsPriceCategoryMaps.Attach(bilCfgItemsVsPriceCategories);

                _billingDbContext.Entry(bilCfgItemsVsPriceCategories).Property(p => p.ModifiedOn).IsModified = true;
                _billingDbContext.Entry(bilCfgItemsVsPriceCategories).Property(p => p.ModifiedBy).IsModified = true;
            }
            _billingDbContext.SaveChanges();
        }



        private void DeactivateOrActivateServiceItems(int ServiceItemId, int currentUserEmployeeId)
        {
            var billCfgItemsVsPriceCategoryMap = _billingDbContext.BillItemsPriceCategoryMaps.Where(a => a.ServiceItemId == ServiceItemId).ToList();
           
            for (int i = 0; i < billCfgItemsVsPriceCategoryMap.Count; i++)
            {
                BillMapPriceCategoryServiceItemModel bilCfgItemsVsPriceCategories = new BillMapPriceCategoryServiceItemModel();
                bilCfgItemsVsPriceCategories = billCfgItemsVsPriceCategoryMap[i];
                bilCfgItemsVsPriceCategories.ModifiedBy = currentUserEmployeeId;
                bilCfgItemsVsPriceCategories.ModifiedOn = DateTime.Now;

                _billingDbContext.BillItemsPriceCategoryMaps.Attach(bilCfgItemsVsPriceCategories);

                _billingDbContext.Entry(bilCfgItemsVsPriceCategories).Property(p => p.ModifiedOn).IsModified = true;
                _billingDbContext.Entry(bilCfgItemsVsPriceCategories).Property(p => p.ModifiedBy).IsModified = true;
            }
            _billingDbContext.SaveChanges();
        }



        private string ConvertXMLToJson(string itemXml)
        {
            //return empty json-array if input xml is empty or null
            if (string.IsNullOrEmpty(itemXml))
            {
                return "[]";
            }
            else
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(itemXml);
                return JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
            }
        }

        [HttpPut]
        [Route("BillSchemeActivation")]
        public IActionResult ActiveBillScheme(int SchemeId, bool IsActive)
        {

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ActivateBillScheme(SchemeId, IsActive, currentUser);
            return InvokeHttpPostFunction(func);


        }
        private object ActivateBillScheme(int SchemeId, bool IsActive, RbacUser currentUser)
        {

            BillingSchemeModel rowToUpdate = _billingDbContext.BillingSchemes.Where(a => a.SchemeId == SchemeId).FirstOrDefault();
            rowToUpdate.IsActive = IsActive;

            rowToUpdate.ModifiedBy = currentUser.EmployeeId;
            rowToUpdate.ModifiedOn = DateTime.Now;
            _billingDbContext.Entry(rowToUpdate).Property(x => x.IsActive).IsModified = true;
            _billingDbContext.Entry(rowToUpdate).Property(x => x.ModifiedBy).IsModified = true;
            _billingDbContext.Entry(rowToUpdate).Property(x => x.ModifiedOn).IsModified = true;
            _billingDbContext.SaveChanges();
            return rowToUpdate;
        }

        #region reqType(Get)
        /*[HttpGet]
        public string Get(string department,
            string servDeptName,
            string reqType,
            int providerId,
            int patientId,
            int employeeId,
            DateTime requestDate,
            int roleId,
            int userId,
            int bedId,
            int itemId,
            int serviceDeptId,
            string status,
            int templateId,
            bool ShowIsActive,
            string integrationName,
            int reportingItemsId,
            bool showInactiveItems = false)
        {
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "get-service-departments")
                {
                    var srvDeptList = (from s in masterDbContext.ServiceDepartments.Include("Department")
                                       select new
                                       {
                                           ServiceDepartmentName = s.ServiceDepartmentName,
                                           ServiceDepartmentShortName = s.ServiceDepartmentShortName,
                                           ServiceDepartmentId = s.ServiceDepartmentId,
                                           DepartmentId = s.DepartmentId,
                                           DepartmentName = s.Department.DepartmentName,
                                           CreatedOn = s.CreatedOn,
                                           CreatedBy = s.CreatedBy,
                                           IntegrationName = s.IntegrationName,
                                           ParentServiceDepartmentId = s.ParentServiceDepartmentId,
                                           IsActive = s.IsActive
                                       }).OrderBy(d => d.DepartmentName).ThenBy(d => d.ServiceDepartmentName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = srvDeptList;
                }

                else if (reqType == "get-billing-itemList")
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    select new
                                    {
                                        BillItemPriceId = item.BillItemPriceId,
                                        ServiceDepartmentId = srv.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ServiceDepartmentShortName = srv.ServiceDepartmentShortName,
                                        SrvDeptIntegrationName = srv.IntegrationName,
                                        ItemId = item.ItemId,
                                        ItemName = item.ItemName,
                                        ProcedureCode = item.ProcedureCode,
                                        Price = item.Price,
                                        TaxApplicable = item.TaxApplicable,
                                        DiscountApplicable = item.DiscountApplicable,
                                        Description = item.Description,
                                        CreatedOn = item.CreatedOn,
                                        CreatedBy = item.CreatedBy,
                                        IsActive = item.IsActive.HasValue ? item.IsActive : false,
                                        DisplaySeq = item.DisplaySeq,
                                        IsDoctorMandatory = item.IsDoctorMandatory.HasValue ? item.IsDoctorMandatory : false,
                                        AllowMultipleQty = item.AllowMultipleQty,
                                        ItemCode = item.ItemCode,
                                        IsFractionApplicable = item.IsFractionApplicable.HasValue ? item.IsFractionApplicable : false,
                                        InsuranceApplicable = item.InsuranceApplicable,
                                        GovtInsurancePrice = item.GovtInsurancePrice,
                                        IsInsurancePackage = item.IsInsurancePackage,
                                        IsZeroPriceAllowed = item.IsZeroPriceAllowed,
                                        IsErLabApplicable = item.IsErLabApplicable,
                                        Doctor = (from doc in billingDbContext.Employee.DefaultIfEmpty()
                                                  where doc.IsAppointmentApplicable == true && doc.EmployeeId == item.ItemId && srv.ServiceDepartmentName == "OPD"
                                                  && srv.ServiceDepartmentId == item.ServiceDepartmentId
                                                  select new
                                                  {
                                                      //Temporary logic, correct it later on... 
                                                      DoctorId = doc != null ? doc.EmployeeId : 0,
                                                      DoctorName = doc != null ? doc.FullName : "",
                                                  }).FirstOrDefault(),
                                        IsNormalPriceApplicable = item.IsNormalPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsEHSPriceApplicable = item.IsEHSPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsForeignerPriceApplicable = item.IsForeignerPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsInsForeignerPriceApplicable = item.IsInsForeignerPriceApplicable, //pratik:12Nov'19-For Price Categories
                                        IsSAARCPriceApplicable = item.IsSAARCPriceApplicable, //sud:19Apr'19-For Price Categories
                                        IsOT = item.IsOT,
                                        IsProc = item.IsProc,
                                        Category = item.Category,
                                        EHSPrice = item.EHSPrice != null ? item.EHSPrice : 0, //sud:19Apr'19-For Price Categories
                                        SAARCCitizenPrice = item.SAARCCitizenPrice != null ? item.SAARCCitizenPrice : 0, //sud:19Apr'19-For Price Categories
                                        ForeignerPrice = item.ForeignerPrice != null ? item.ForeignerPrice : 0, //sud:19Apr'19-For Price Categories
                                        InsForeignerPrice = item.InsForeignerPrice != null ? item.InsForeignerPrice : 0, //pratik:12Nov'19-For Price Categories
                                        DefaultDoctorList = item.DefaultDoctorList,
                                        IsPriceChangeAllowed = item.IsPriceChangeAllowed //Krishna: 2ndNov'22



                                    }).OrderBy(b => b.ServiceDepartmentName).ToList();

                    // bool showInactiveItems = false;

                    var filteredItems = new object();

                    if (showInactiveItems)
                    {
                        filteredItems = itemList.Where(itm => itm.IsActive == true).OrderBy(itm => itm.DisplaySeq);
                    }
                    else
                    {
                        filteredItems = itemList.OrderBy(itm => itm.DisplaySeq);
                    }

                    responseData.Status = "OK";
                    responseData.Results = filteredItems;
                }

                else if (reqType != null && reqType == "get-reporting-items-List")
                {
                    var list = billingDbContext.ReportingItemsModels.ToList();
                    if (list != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = list;
                    }
                }

                else if (reqType != null && reqType == "get-dynamic-reporting-name-List")
                {
                    var list = billingDbContext.DynamicReportNameModels.ToList();
                    if (list != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = list;
                    }
                }
                //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId

                else if (reqType != null && reqType == "get-billItemPriceChangeHistory")
                {
                    //Get all Users list
                    var allUsers = rbacDbContext.Users.ToList();
                    //Union BillItemPrice table with BillItemPrice_History table and get price changed history
                    var billItemList = (
                        from billItemPriceHistory in billingDbContext.BillItemPriceHistory
                        where billItemPriceHistory.ItemId == itemId && billItemPriceHistory.ServiceDepartmentId == serviceDeptId
                        select new
                        {
                            price = billItemPriceHistory.Price,
                            createdOn = billItemPriceHistory.StartDate,
                            createdBy = billItemPriceHistory.CreatedBy
                        }).ToList()
                                        .Union(from billItemPrice in billingDbContext.BillItemPrice
                                               where billItemPrice.ItemId == itemId && billItemPrice.ServiceDepartmentId == serviceDeptId
                                               select new
                                               {
                                                   price = billItemPrice.Price,
                                                   createdOn = billItemPrice.CreatedOn,
                                                   createdBy = billItemPrice.CreatedBy
                                               }).OrderByDescending(b => b.createdOn).ToList();

                    //Get list of final BillItemPrice change history with username by using join               
                    var billItempriceChangeHistoryList = (from usrs in allUsers
                                                          join billItems in billItemList on usrs.EmployeeId equals billItems.createdBy
                                                          select new
                                                          {
                                                              price = billItems.price,
                                                              createdOn = billItems.createdOn,
                                                              userName = usrs.UserName
                                                          }).OrderByDescending(c => c.createdOn).ToList();
                    //check list is empty or not
                    if (billItempriceChangeHistoryList != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = billItempriceChangeHistoryList;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Couldn't find your requested Item price changed history.";
                    }
                }

                else if (reqType == "get-billing-packageList")
                {
                    List<BillingPackageModel> packageList = billingDbContext.BillingPackages.OrderBy(p => p.BillingPackageName).ToList();
                    if (packageList.Count > 0)
                    {
                        foreach (var package in packageList)
                        {
                            package.BillingItemsXML = this.ConvertXMLToJson(package.BillingItemsXML);
                        }
                    }
                    responseData.Status = "OK";
                    responseData.Results = packageList;
                }

                else if (reqType == "get-membership-types")
                {
                    var membershipTypes = (from type in billingDbContext.MembershipType
                                           select type).OrderBy(m => m.MembershipTypeName).ToList();
                    responseData.Results = membershipTypes;
                    responseData.Status = "OK";
                }

                else if (reqType == "get-credit-organization") //--yubraj 19th April 2019
                {
                    var creditOrganization = billingDbContext.CreditOrganization.OrderBy(c => c.OrganizationName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = creditOrganization;
                }

                else if (reqType == "get-billing-items-by-servdeptitemid" && itemId > 0)
                {
                    var bilItemPriceDetail = (from item in billingDbContext.BillItemPrice
                                              join srv in billingDbContext.ServiceDepartment
                                              on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                              where srv.ServiceDepartmentName == servDeptName && item.ItemId == itemId
                                              select new
                                              {
                                                  item.BillItemPriceId,
                                                  item.CreatedBy,
                                                  item.CreatedOn,
                                                  item.Description,
                                                  item.DiscountApplicable,
                                                  item.TaxApplicable,
                                                  item.IsActive,
                                                  item.ItemId,
                                                  item.ItemName,
                                                  item.ModifiedBy,
                                                  item.ModifiedOn,
                                                  item.Price,
                                                  item.ProcedureCode,
                                                  item.ServiceDepartmentId,
                                                  item.SAARCCitizenPrice,
                                                  item.EHSPrice,
                                                  item.ForeignerPrice,
                                                  item.InsForeignerPrice,
                                                  item.IsSAARCPriceApplicable,
                                                  item.IsForeignerPriceApplicable,
                                                  item.IsInsForeignerPriceApplicable,
                                                  item.IsEHSPriceApplicable,
                                                  ItemNamePrice = item.ItemName + " " + item.Price.ToString()
                                              }).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = bilItemPriceDetail;
                }

                else if (reqType == "get-billing-items-by-integrationName-itemid" && itemId > 0)
                {
                    var bilItemPriceDetail = (from item in billingDbContext.BillItemPrice
                                              join srv in billingDbContext.ServiceDepartment
                                              on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                              where srv.IntegrationName.ToLower() == integrationName.ToLower()
                                              && item.ItemId == itemId
                                              select new
                                              {
                                                  srv.ServiceDepartmentName,
                                                  item.BillItemPriceId,
                                                  item.CreatedBy,
                                                  item.CreatedOn,
                                                  item.Description,
                                                  item.DiscountApplicable,
                                                  item.TaxApplicable,
                                                  item.IsActive,
                                                  item.ItemId,
                                                  item.ItemName,
                                                  item.ModifiedBy,
                                                  item.ModifiedOn,
                                                  item.Price,
                                                  item.ProcedureCode,
                                                  item.ServiceDepartmentId,
                                                  item.SAARCCitizenPrice,
                                                  item.EHSPrice,
                                                  item.ForeignerPrice,
                                                  item.InsForeignerPrice,
                                                  item.IsSAARCPriceApplicable,
                                                  item.IsForeignerPriceApplicable,
                                                  item.IsInsForeignerPriceApplicable,
                                                  item.IsEHSPriceApplicable,
                                                  item.IsZeroPriceAllowed,
                                                  ItemNamePrice = item.ItemName + " " + item.Price.ToString()
                                              }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = bilItemPriceDetail;
                }

                else if (reqType == "get-billing-items-by-servdeptname" && servDeptName.Length > 0)
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where srv.ServiceDepartmentName == servDeptName
                                    select new
                                    {
                                        ServiceDepartmentId = item.ServiceDepartmentId,
                                        ItemName = item.ItemName,
                                        ItemNamePrice = item.ItemName + " " + item.Price.ToString(),
                                        Price = item.Price
                                    }).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }

                else if (reqType == "get-billing-items-by-integrationName" && !string.IsNullOrEmpty(integrationName))
                {
                    var itemList = (from item in billingDbContext.BillItemPrice
                                    join srv in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srv.ServiceDepartmentId
                                    where srv.IntegrationName.ToLower() == integrationName.ToLower()
                                    select new
                                    {
                                        ServiceDepartmentId = item.ServiceDepartmentId,
                                        ServiceDepartmentName = srv.ServiceDepartmentName,
                                        ItemName = item.ItemName,
                                        ItemNamePrice = item.ItemName + " " + item.Price.ToString(),
                                        Price = item.Price,
                                        EHSPrice = item.EHSPrice,
                                        SAARCCitizenPrice = item.SAARCCitizenPrice,
                                        ForeignerPrice = item.ForeignerPrice,
                                        InsForeignerPrice = item.InsForeignerPrice
                                    }).Distinct().ToList();
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }

                else if (reqType == "get-printer-settings")
                {
                    var printerSettings = (from print in billingDbContext.PrinterSettings
                                           where print.IsActive == true
                                           select print).ToList();

                    responseData.Status = "OK";
                    responseData.Results = printerSettings;
                }

                else if (reqType == "get-all-printer-settings")
                {
                    var printerSettings = (from print in billingDbContext.PrinterSettings
                                               //where print.IsActive == true
                                           select print).ToList();

                    responseData.Status = "OK";
                    responseData.Results = printerSettings;
                }

                else if (reqType == "get-security-reportingItemBillItem")
                {
                    var itemList = billingDbContext.ReportingItemsAndBillingItemMappingModels
                        .Where(a => a.ReportingItemsId == reportingItemsId)
                        .OrderBy(a => a.BillItemPriceId).ToList();

                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType(Post)
        // POST api/values
        /*[HttpPost]
        public string Post()
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            LabDbContext labDbContext = new LabDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);

            try
            {
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "post-service-department")
                {

                    ServiceDepartmentModel servdeptModel = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                    var isDeptExists = billingDbContext.ServiceDepartment.Where(d => d.ServiceDepartmentName == servdeptModel.ServiceDepartmentName).ToList();
                    if (isDeptExists.Count() != 0)
                    {
                        responseData.Results = "The service Department name is already exist.";
                        responseData.Status = "Error";

                    }
                    else
                    {

                        servdeptModel.CreatedOn = System.DateTime.Now;
                        if (servdeptModel.IntegrationName == "None")
                        {
                            servdeptModel.IntegrationName = null;
                        }
                        masterDbContext.ServiceDepartments.Add(servdeptModel);
                        masterDbContext.SaveChanges();

                        if (servdeptModel.IntegrationName != null && servdeptModel.IntegrationName.ToLower() == "radiology")
                        {
                            var imagingType = masterDbContext.ImagingTypes.Where(a => a.ImagingTypeName.ToLower() == servdeptModel.ServiceDepartmentName.ToLower()).FirstOrDefault();
                            if (imagingType == null)
                            {
                                RadiologyImagingTypeModel imagingTypeModel = new RadiologyImagingTypeModel();
                                imagingTypeModel.ImagingTypeName = servdeptModel.ServiceDepartmentName;
                                imagingTypeModel.CreatedOn = System.DateTime.Now;
                                imagingTypeModel.CreatedBy = currentUser.EmployeeId;
                                imagingTypeModel.IsActive = true;

                                masterDbContext.ImagingTypes.Add(imagingTypeModel);
                                masterDbContext.SaveChanges();
                            }
                        }

                        responseData.Results = servdeptModel;
                        responseData.Status = "OK";
                    }
                }

                else


                if (reqType == "post-billing-item")
                {

                    BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);

                    //MapBillItemsAndPriceCategory mapBillItemsAndPriceCategory = DanpheJSONConvert.DeserializeObject<MapBillItemsAndPriceCategory>(str);
                    //BillItemPrice item = mapBillItemsAndPriceCategory.BillItemPrice;
                    List<BilCfgItemsVsPriceCategoryMap> bilCfgItemsVsPriceCategoryMap = item.BilCfgItemsVsPriceCategoryMap;

                    item.CreatedBy = currentUser.EmployeeId;
                    item.CreatedOn = DateTime.Now;


                    //getting max item id [we dont have item id other than lab, radiology, and bed charges] 
                    if (item.ItemId == 0)  //yubraj 1st Oct '18
                    {
                        int maxItemId = 0;
                        var allSrvDeptItems = billingDbContext.BillItemPrice.Where(s => s.ServiceDepartmentId == item.ServiceDepartmentId).ToList();
                        if (allSrvDeptItems != null && allSrvDeptItems.Count > 0)
                        {
                            maxItemId = allSrvDeptItems.Max(t => t.ItemId);
                        }

                        item.ItemId = maxItemId + 1;
                        item.ProcedureCode = item.ItemId.ToString();
                    }

                    billingDbContext.BillItemPrice.Add(item);
                    billingDbContext.SaveChanges();

                    bilCfgItemsVsPriceCategoryMap.ForEach(a =>
                    {
                        a.CreatedOn = DateTime.Now;
                        a.CreatedBy = currentUser.EmployeeId;
                        a.BillItemPriceId = item.BillItemPriceId;
                        a.ServiceDepartmentId = item.ServiceDepartmentId;
                        a.ItemId = item.ItemId;
                        a.IsActive = true;
                    });
                    billingDbContext.BillItemsPriceCategoryMaps.AddRange(bilCfgItemsVsPriceCategoryMap);
                    billingDbContext.SaveChanges();



                    responseData.Results = item;
                    responseData.Status = "OK";
                }
                else 


                if (reqType == "post-reportingItem")
                {

                    ReportingItemsModel item = DanpheJSONConvert.DeserializeObject<ReportingItemsModel>(str);

                    item.CreatedBy = currentUser.EmployeeId;
                    item.CreatedOn = DateTime.Now;
                    billingDbContext.ReportingItemsModels.Add(item);
                    billingDbContext.SaveChanges();
                    responseData.Results = item;
                    responseData.Status = "OK";
                }
                else 

                if (reqType == "post-security-reportingItemBillItem")
                {
                    List<ReportingItemBillingItemMapping> mappingObject = DanpheJSONConvert.DeserializeObject<List<ReportingItemBillingItemMapping>>(str);
                    mappingObject.ForEach(mapping =>
                    {
                        billingDbContext.ReportingItemsAndBillingItemMappingModels.Add(mapping);
                    });

                    billingDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else

                if (reqType == "post-billing-package")
                {
                    BillingPackageModel package = DanpheJSONConvert.DeserializeObject<BillingPackageModel>(str);
                    XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Items\":" + package.BillingItemsXML + "}", "root");
                    package.BillingItemsXML = xdoc.InnerXml;
                    billingDbContext.BillingPackages.Add(package);
                    billingDbContext.SaveChanges();
                    package.BillingItemsXML = ConvertXMLToJson(package.BillingItemsXML);
                    responseData.Results = package;
                    responseData.Status = "OK";
                }
                else 

                if (reqType == "post-credit-organization")
                {
                    CreditOrganizationModel org = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(str);
                    billingDbContext.CreditOrganization.Add(org);

                    billingDbContext.SaveChanges();
                    responseData.Results = org;
                    responseData.Status = "OK";
                }
                else 

                if (reqType == "post-membership-type")
                {
                    MembershipTypeModel mem = DanpheJSONConvert.DeserializeObject<MembershipTypeModel>(str);
                    mem.CreatedBy = currentUser.EmployeeId;
                    mem.CreatedOn = DateTime.Now;
                    billingDbContext.MembershipType.Add(mem);
                    billingDbContext.SaveChanges();
                    responseData.Results = mem;
                    responseData.Status = "OK";
                }
                else

                if (reqType == "post-printer-setting")
                {
                    PrinterSettingsModel printerSetting = DanpheJSONConvert.DeserializeObject<PrinterSettingsModel>(str);
                    printerSetting.IsActive = true;
                    printerSetting.CreatedBy = currentUser.EmployeeId;
                    printerSetting.CreatedOn = DateTime.Now;
                    billingDbContext.PrinterSettings.Add(printerSetting);
                    billingDbContext.SaveChanges();
                    responseData.Results = printerSetting;
                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }


            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType (Put)
        //PUT api/values/5
        /*[HttpPut]
        public string Put()
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string str = this.ReadPostData();
            MasterDbContext masterDBContext = new MasterDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
               if (reqType == "put-service-department")
               {
                   ////Correct implementation--2lines of code extra for each update statement..
                   ////we don't want to update the CreatedOn property in PUT, so excluding them.
                   ServiceDepartmentModel clientServDept = DanpheJSONConvert.DeserializeObject<ServiceDepartmentModel>(str);
                   if (clientServDept.IntegrationName == "None")
                   {
                       clientServDept.IntegrationName = null;
                   }
                   masterDBContext.ServiceDepartments.Attach(clientServDept);
                   masterDBContext.Entry(clientServDept).State = EntityState.Modified;
                   masterDBContext.Entry(clientServDept).Property(x => x.CreatedOn).IsModified = false;
                   masterDBContext.Entry(clientServDept).Property(x => x.CreatedBy).IsModified = false;
                   clientServDept.ModifiedOn = System.DateTime.Now;
                   masterDBContext.SaveChanges();
                   responseData.Results = clientServDept;
                   responseData.Status = "OK";
               }
               
               else if (reqType == "put-billing-item")
               {
                   BillItemPrice item = DanpheJSONConvert.DeserializeObject<BillItemPrice>(str);
                   billingDbContext.BillItemPrice.Attach(item);
                   billingDbContext.Entry(item).State = EntityState.Modified;
                   billingDbContext.SaveChanges();

                   //for Lab, Radiology and Bed Feature, we've to update few properties like: IsActive, Price in their respective module as well.
                   string intgrationName = (from s in billingDbContext.ServiceDepartment
                                            where s.ServiceDepartmentId == item.ServiceDepartmentId
                                            select s.IntegrationName).FirstOrDefault();

                   if (!string.IsNullOrEmpty(intgrationName) &&
                       (intgrationName.ToLower() == "lab" || intgrationName.ToLower() == "radiology" || intgrationName.ToLower() == "bed charges"))
                   {
                       UpdateDepartmentItems(intgrationName, item, connString);
                   }
                   DeactivateOrActivateBilCfgItemsVsPriceCategoryMap(billingDbContext, item.BillItemPriceId, currentUser.EmployeeId);




                   responseData.Results = item;
                   responseData.Status = "OK";
               }
               
               else if (reqType == "put-reportingItem")
               {
                   ReportingItemsModel item = DanpheJSONConvert.DeserializeObject<ReportingItemsModel>(str);
                   billingDbContext.ReportingItemsModels.Attach(item);
                   billingDbContext.Entry(item).State = EntityState.Modified;
                   billingDbContext.SaveChanges();
                   responseData.Results = item;
                   responseData.Status = "OK";
               }
               
               else if (reqType == "put-security-reportingItemBillItem")
               {
                   List<ReportingItemBillingItemMapping> mappingObject = DanpheJSONConvert.DeserializeObject<List<ReportingItemBillingItemMapping>>(str);
                   mappingObject.ForEach(mapping =>
                   {
                       billingDbContext.ReportingItemsAndBillingItemMappingModels.Attach(mapping);
                       billingDbContext.Entry(mapping).State = EntityState.Modified;
                   });
                   billingDbContext.SaveChanges();
                   responseData.Results = mappingObject;
                   responseData.Status = "OK";

               }
               
               else if (reqType == "put-billing-package")
               {
                   BillingPackageModel package = DanpheJSONConvert.DeserializeObject<BillingPackageModel>(str);
                   XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Items\":" + package.BillingItemsXML + "}", "root");
                   package.BillingItemsXML = xdoc.InnerXml;
                   billingDbContext.BillingPackages.Attach(package);
                   billingDbContext.Entry(package).State = EntityState.Modified;
                   billingDbContext.Entry(package).Property(x => x.CreatedOn).IsModified = false;
                   billingDbContext.Entry(package).Property(x => x.CreatedBy).IsModified = false;
                   billingDbContext.SaveChanges();
                   package.BillingItemsXML = ConvertXMLToJson(package.BillingItemsXML);
                   responseData.Results = package;
                   responseData.Status = "OK";
               }
               
               else if (reqType == "put-credit-organization")
               {
                   CreditOrganizationModel creditOrganization = DanpheJSONConvert.DeserializeObject<CreditOrganizationModel>(str);
                   billingDbContext.CreditOrganization.Attach(creditOrganization);
                   billingDbContext.Entry(creditOrganization).State = EntityState.Modified;
                   billingDbContext.Entry(creditOrganization).Property(x => x.CreatedOn).IsModified = false;
                   billingDbContext.Entry(creditOrganization).Property(x => x.CreatedBy).IsModified = false;
                   billingDbContext.SaveChanges();
                   responseData.Results = creditOrganization;
                   responseData.Status = "OK";
               }
               
               else if (reqType == "put-membership-type")
               {
                   MembershipTypeModel membership = DanpheJSONConvert.DeserializeObject<MembershipTypeModel>(str);
                   billingDbContext.MembershipType.Attach(membership);
                   billingDbContext.Entry(membership).State = EntityState.Modified;
                   billingDbContext.Entry(membership).Property(x => x.CreatedOn).IsModified = false;
                   billingDbContext.Entry(membership).Property(x => x.CreatedBy).IsModified = false;
                   billingDbContext.SaveChanges();
                   responseData.Results = membership;
                   responseData.Status = "OK";
               }

               else if (reqType == "put-printer-setting")
                {
                    PrinterSettingsModel printerSetting = DanpheJSONConvert.DeserializeObject<PrinterSettingsModel>(str);

                    printerSetting.ModifiedBy = currentUser.EmployeeId;
                    printerSetting.ModifiedOn = DateTime.Now;

                    billingDbContext.PrinterSettings.Attach(printerSetting);
                    //masterDBContext.Entry(clientEmployee).State = EntityState.Modified;
                    billingDbContext.Entry(printerSetting).Property(x => x.PrintingType).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.GroupName).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.PrinterDisplayName).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.PrinterName).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.ModelName).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.Width_Lines).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.Height_Lines).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.HeaderGap_Lines).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.FooterGap_Lines).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.mh).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.ml).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.ServerFolderPath).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.Remarks).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.IsActive).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.ModifiedBy).IsModified = true;
                    billingDbContext.Entry(printerSetting).Property(x => x.ModifiedOn).IsModified = true;

                    billingDbContext.SaveChanges();

                    responseData.Results = printerSetting;
                    responseData.Status = "OK";

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion
    }
}