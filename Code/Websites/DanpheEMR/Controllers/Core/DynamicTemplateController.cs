using DanpheEMR.Core;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Core.DynamicTemplate;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.Services.DynamicTemplates;
using DanpheEMR.Services.DynamicTemplates.DTO;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Core
{
    public class DynamicTemplateController : CommonController
    {
        private readonly CoreDbContext _coreDbContext;
        private readonly IDynamicTemplateService _dynamicTemplateService;

        public DynamicTemplateController(IDynamicTemplateService dynamicTemplateService,IOptions<MyConfiguration> _config) : base(_config)
        {
            _coreDbContext = new CoreDbContext(connString);
            _dynamicTemplateService = dynamicTemplateService;
        }

        [HttpGet]
        [Route("TemplateTypes")]
        public IActionResult TemplateType()
        {

            Func<object> func = () => _dynamicTemplateService.GetTemplateTypes(_coreDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TemplatePrintHtml")]
        public IActionResult TemplatePrintHtml(int templateId)
        {
            Func<object> func = () => _dynamicTemplateService.GetTemplatePrintHtml(_coreDbContext, templateId);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Templates")]
        public IActionResult Templates(string templateTypeName)
        {
            Func<object> func = () => _dynamicTemplateService.GetTemplates(_coreDbContext, templateTypeName);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TemplateFields")]
        public IActionResult TemplateFields(int templateId)
        {
            Func<object> func = () => _dynamicTemplateService.GetTemplateFields(_coreDbContext, templateId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("FieldMaster")]
        public IActionResult FieldMaster(int? templateTypeId = null)
        {
            Func<object> func = () => _dynamicTemplateService.GetFieldMaster(_coreDbContext, templateTypeId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GetSelectedTemplateData")]
        public IActionResult GetSelectedTemplateData(int templateId)
        {
            Func<object> func = () => _dynamicTemplateService.GetSelectedTemplateData(_coreDbContext, templateId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("GetFieldMasterByTemplateId")]
        public IActionResult GetFieldMasterByTemplateId(int TemplateId)
        {
            Func<object> func = () => _dynamicTemplateService.GetFieldMasterByTemplateId(_coreDbContext, TemplateId);
            return InvokeHttpGetFunction(func);
        }


        [HttpPut]
        [Route("ActivateDeactivate")]
        public async Task<IActionResult> ActivateDeactivateTemplate(int templateId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<Task<object>> func = () => _dynamicTemplateService.ActivateDeactivateTemplateAsync(_coreDbContext, templateId, currentUser);
            return await InvokeHttpPutFunctionAsync(func);
        }

        [HttpPut]
        [Route("UpdateDynamicTemplate")]
        public async Task<IActionResult> UpdateDynamicTemplate()
        {
            string jsonTemplateData = this.ReadPostData();
            TemplateModel templates = DanpheJSONConvert.DeserializeObject<TemplateModel>(jsonTemplateData);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<Task<object>> func = () => _dynamicTemplateService.UpdateDynamicTemplate(_coreDbContext, currentUser, templates);
            return await InvokeHttpPutFunctionAsync(func);
        }


        [HttpPost]
        [Route("AddNewTemplate")]
        public IActionResult AddNewTemplate([FromBody] TemplateModel template)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _dynamicTemplateService.AddNewTemplate(_coreDbContext, currentUser, template);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("AddUpdateFieldMapping")]
        public IActionResult AddUpdateFieldMapping([FromBody] List<FieldMappings_DTO> fieldMappingsList)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _dynamicTemplateService.AddUpdateFieldMapping(_coreDbContext, currentUser, fieldMappingsList);
            return InvokeHttpPostFunction(func);
        }

    }

}
