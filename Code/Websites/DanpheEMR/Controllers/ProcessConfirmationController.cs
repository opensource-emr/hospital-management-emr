using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Services.ProcessConfirmation;
using DanpheEMR.Services.ProcessConfirmation.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Security;

namespace DanpheEMR.Controllers
{

    public class ProcessConfirmationController : CommonController
    {
        private readonly IProcessConfirmationService _processConfirmationService;

        public ProcessConfirmationController(IOptions<MyConfiguration> _config, IProcessConfirmationService processConfirmationService) : base(_config)
        {
            _processConfirmationService = processConfirmationService;
        }

        [HttpPost]
        [Route("ConfirmProcess")]
        public IActionResult PostConfirmProcess([FromBody] ProcessConfirmationUserCredentials_DTO processConfirmationUserCredentials)
        {
            Func<object> func = () => _processConfirmationService.ConfirmProcess(processConfirmationUserCredentials);
            return InvokeHttpPostFunction(func);
        }
    }
}
