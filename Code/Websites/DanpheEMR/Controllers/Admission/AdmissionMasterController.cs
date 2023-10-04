using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Services.Admission;
using DanpheEMR.Services.Admission.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Admission
{

    public class AdmissionMasterController : CommonController
    {
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly IAdmissionMasterService _admissionMasterService;

        public AdmissionMasterController(IAdmissionMasterService admissionMasterService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _admissionDbContext = new AdmissionDbContext(connString);
            _admissionMasterService = admissionMasterService;
        }

        [HttpGet]
        [Route("AdtAutoBillingItems")]
        [Produces(typeof(List<AdtAutoBillingItem_DTO>))]
        public async Task<IActionResult> GetAdtAutoBillingItems()
        {
            Func<Task<List<AdtAutoBillingItem_DTO>>> func = () => _admissionMasterService.GetAdtAutoBillingItems(_admissionDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("AdtDepositSettings")]
        [Produces(typeof(List<AdtDepositSetting_DTO>))]
        public async Task<IActionResult> GetAdtDepositSettings()
        {
            Func<Task<List<AdtDepositSetting_DTO>>> func = () => _admissionMasterService.GetAdtDepositSettings(_admissionDbContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("SchemeAdtAutoBillingItems")]
        [Produces(typeof(List<AdtAutoBillingItem_DTO>))]
        public async Task<IActionResult> GetSchemesAdtAutoBillingItems(int schemeId, int priceCategoryId, string serviceBillingContext)
        {
            Func<Task<List<AdtAutoBillingItem_DTO>>> func = () => _admissionMasterService.GetAdtAutoBillingItemForScheme(_admissionDbContext, schemeId, priceCategoryId, serviceBillingContext);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("SchemeAdtDepositSettings")]
        [Produces(typeof(List<AdtDepositSetting_DTO>))]
        public async Task<IActionResult> GetSchemesAdtDepositSettings(int schemeId)
        {
            Func<Task<List<AdtDepositSetting_DTO>>> func = () => _admissionMasterService.GetAdtDepositSettingsForScheme(_admissionDbContext, schemeId);
            return await InvokeHttpGetFunctionAsync(func);
        }

        [HttpGet]
        [Route("BedFeatureSchemePriceCategoryMap")]
        [Produces(typeof(List<AdtBedFeatureSchemePriceCategoryMap_DTO>))]
        public async Task<IActionResult> GetBedFeatureSchemePriceCategoryMap(int schemeId)
        {
            Func<Task<List<AdtBedFeatureSchemePriceCategoryMap_DTO>>> func = () => _admissionMasterService.GetBedFeatureSchemePriceCategoryMap(_admissionDbContext, schemeId);
            return await InvokeHttpGetFunctionAsync(func);
        }
    }
}
