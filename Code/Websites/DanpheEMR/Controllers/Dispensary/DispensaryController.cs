using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services;
using DanpheEMR.Services.Dispensary;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;

namespace DanpheEMR.Controllers.Dispensary
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class DispensaryController : CommonController
    {
        private IDispensaryService _dispensaryService;
        private readonly IOptions<MyConfiguration> configuration;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public DispensaryController(IOptions<MyConfiguration> configuration, IDispensaryService dispensaryService) : base(configuration)
        {
            _dispensaryService = dispensaryService;
            this.configuration = configuration;
        }
        [HttpGet]
        [Route("Dispensaries")]
        public IActionResult Dispensaries()
        {
            Func<object> func = () => _dispensaryService.GetAllDispensaries();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PharmacyStores")]
        public IActionResult GetAllPharmacyStores()
        {
            Func<object> func = () => _dispensaryService.GetAllPharmacyStores();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("GetDispensary")]
        public IActionResult GetDispensary(int dispensaryId)
        {
            Func<object> func = () => _dispensaryService.GetDispensary(dispensaryId);
            return InvokeHttpGetFunction(func);
        }

        [HttpPost]
        [Route("NewDispensary")]
        public IActionResult AddDispensary([FromBody] PHRMStoreModel value)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (value != null)
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                value.CreatedBy = currentUser.EmployeeId;
                value.Category = Enums.ENUM_StoreCategory.Dispensary;
                Func<object> func = () => _dispensaryService.AddDispensary(value);
                return InvokeHttpPostFunction(func);
            }
            else
            {
                throw new ArgumentNullException();
            }
        }

        [HttpPut]
        [Route("PutDispensary")]
        public IActionResult UpdateDispensary([FromBody] PHRMStoreModel value)
        {
            Func<object> func = () => _dispensaryService.UpdateDispensary(value);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("ActivateDeactivate")]
        public IActionResult ActivateDeactivateDispensary(int dispensaryId)
        {
            Func<object> func = () => _dispensaryService.ActivateDeactivateDispensary(dispensaryId);
            return InvokeHttpPutFunction(func);
        }

        [HttpGet("TestFileUpload")]
        public IActionResult TestFileUpload()
        {
            var googleDriveServce = new GoogleDriveFileUploadService(configuration);
            var response = googleDriveServce.UploadNewFile("SomeLabReport");
            return Ok(response);
        }
        [HttpGet("TestFileUpdate/{FileId}")]
        public IActionResult TestFileUpload(string FileId)
        {
            var googleDriveServce = new GoogleDriveFileUploadService(configuration);
            var response = googleDriveServce.UpdateFileById(FileId, "SomeLabReport");
            return Ok(response);
        }

    }
}
