using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Billing.Shared;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.Billing;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.BillSettings.DTOs;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

namespace DanpheEMR.Controllers.Billing
{
    public class BillingMasterController : CommonController
    {
        private readonly BillingDbContext _billingDbContext;
        private readonly IBillingMasterService _billingMasterService;

        public BillingMasterController(IBillingMasterService billingMasterService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _billingDbContext = new BillingDbContext(connString);
            _billingMasterService = billingMasterService;
        }

        /// <param name="serviceBillingContext">ServiceBillingContext eg: registration, admission, op-billing, ip-billing,etc</param>
        [HttpGet]
        [Route("ServiceItems")]
        [Produces(typeof(DanpheHTTPResponse<List<ServiceItemDetails_DTO>>))]
        public async Task<IActionResult> GetServiceItems(string serviceBillingContext, int schemeId, int priceCategoryId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetServiceItems(priceCategoryId, schemeId, serviceBillingContext, _billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("Schemes")]
        [Produces(typeof(DanpheHTTPResponse<BillingScheme_DTO>))]
        public async Task<IActionResult> Schemes(string serviceBillingContext)
        {

            Func<Task<object>> func = () => _billingMasterService.GetSchemes(serviceBillingContext, _billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("PriceCategories")]
        [Produces(typeof(DanpheHTTPResponse<List<PriceCategoryModel>>))]
        public async Task<IActionResult> PriceCategories()
        {

            Func<Task<object>> func = () => _billingMasterService.GetPriceCategories(_billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("SchemePriceCategoriesMap")]
        public async Task<IActionResult> SchemePriceCategoriesMap()
        {

            Func<Task<object>> func = () => _billingMasterService.GetSchemePriceCategoriesMap(_billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("CreditOrganizations")]
        [Produces(typeof(DanpheHTTPResponse<List<CreditOrganizationModel>>))]
        public async Task<IActionResult> CreditOrganizations()
        {

            Func<Task<object>> func = () => _billingMasterService.GetCreditOrganizations(_billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("ServiceDepartments")]
        public async Task<IActionResult> ServiceDepartments()
        {

            Func<Task<object>> func = () => _billingMasterService.GetServiceDepartments(_billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }


        [HttpGet]
        [Route("ServiceItemSchemeSetting")]
        public async Task<IActionResult> ServiceItemsSchemeSetting(string serviceBillingContext, int schemeId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetServiceItemSchemeSettingsForCurrentBillingContext(serviceBillingContext, schemeId, _billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("AdditionalServiceItems")]
        public async Task<IActionResult> AdditionalServiceItems(string groupName, int priceCategoryId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetadditionalServiceItems(_billingDbContext, groupName, priceCategoryId);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("ServiceItemSettings")]
        public async Task<IActionResult> GetServiceItemSchemeSettings(int SchemeId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetServiceItemSchemeSettings(_billingDbContext, SchemeId);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("VistAdditionalServiceItems")]
        public async Task<IActionResult> VisitAdditionalServiceItems(string groupName)
        {
            Func<Task<object>> func = () => _billingMasterService.GetVisitAdditionalServiceItems(_billingDbContext, groupName);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("ServicePackages")]
        public async Task<IActionResult> ServicePackages(int schemeId, int priceCategoryId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetServicePackages(_billingDbContext, schemeId, priceCategoryId);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("Currencies")]
        [Produces(typeof(Currency_DTO))]
        public async Task<IActionResult> GetCurrencies()
        {
            Func<Task<object>> func = () => _billingMasterService.Getcurrencies(_billingDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("ServiceItemsByPriceCategory")]
        [Produces(typeof(PriceCategoryServiceItem_DTO))]
        public async Task<IActionResult> GetPricecCategoryServiceItems(int priceCategoryId)
        {
            Func<Task<object>> func = () => _billingMasterService.GetPriceCategoryServiceItems(_billingDbContext, priceCategoryId);
            return await InvokeHttpGetFunctionAsync(func);
        }



        [HttpPost]
        [Route("ServiceItemSetting")]
        public async Task<IActionResult> PostServiceItemSchemeSettings([FromBody] List<BillServiceItemSchemeSetting_DTO> billServiceItemSchemeSettingdto)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            Func<Task<object>> func = () => _billingMasterService.AddServiceItemSchemeSettings(_billingDbContext, billServiceItemSchemeSettingdto, currentUser);
            return await InvokeHttpGetFunctionAsync(func);
        }
    }
}
