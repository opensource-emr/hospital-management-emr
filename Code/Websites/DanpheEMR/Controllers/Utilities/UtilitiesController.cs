using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.Services.ClaimManagement;
using DanpheEMR.Services.ClaimManagement.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System;
using DanpheEMR.Services.Utilities.DTOs;
using DanpheEMR.Services.Utilities;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Authorization;

namespace DanpheEMR.Controllers.Utilities
{
    public class UtilitiesController : CommonController
    {
        private readonly IUtilitiesService _IUtilitiesService;
        private readonly UtilitiesDbContext _UtilitiesDbContext;
        public UtilitiesController(IUtilitiesService iUtilitiesService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _IUtilitiesService = iUtilitiesService;
            _UtilitiesDbContext = new UtilitiesDbContext(connString);
        }

        [HttpGet]
        [Route("SchemeRefund")]
        public IActionResult GetSchemeRefund(DateTime fromDate, DateTime toDate)
        {
            Func<object> func = () => _IUtilitiesService.GetSchemeRefundTransaction(_UtilitiesDbContext, fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SchemeRefundById")]
        public IActionResult GetSchemeRefundById(int receiptNo)
        {
            Func<object> func = () => _IUtilitiesService.GetSchemeRefundById(_UtilitiesDbContext, receiptNo);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("PatientSchemeRefunds")]
        public IActionResult GetPatientSchemeRefunds(int patientId)
        {
            Func<object> func = () => _IUtilitiesService.GetPatientSchemeRefunds(_UtilitiesDbContext, patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpPost]
        [Route("SchemeRefund")]
        public IActionResult SaveSchemeRefund([FromBody] SchemeRefund_DTO schemeRefund)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IUtilitiesService.SaveSchemeRefundTransaction(currentUser, schemeRefund, _UtilitiesDbContext);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ChangeVisitScheme")]
        public IActionResult SaveChangedVisitScheme([FromBody] VisitSchemeChangeHistory_DTO visitSchemeChangeHistory_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IUtilitiesService.SaveVisitSchemeChange(currentUser, visitSchemeChangeHistory_DTO, _UtilitiesDbContext);
            return InvokeHttpPostFunction(func);
        }
        [HttpPost]
        [Route("OrganizationDeposit")]
        public ActionResult OrganizationDeposit([FromBody] OrganizationDeposit_DTO organizationDeposit_DTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            // string ipDataString = this.ReadPostData();
            Func<object> func = () => _IUtilitiesService.SaveOrganizationDeposit(currentUser, organizationDeposit_DTO, _UtilitiesDbContext);
            return InvokeHttpPostFunction<object>(func);

        }
        [HttpGet]
        [Route("OrganizationDepositBalance")]
        public IActionResult GetOrganizationDepositBalance(int OrganizationId)
        {
            Func<object> func = () => _IUtilitiesService.GetOrganizationDepositBalance(_UtilitiesDbContext, OrganizationId);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("OrganizationDepositDetailById")]
        public IActionResult GetOrganizationDepositDetails(int DepositId)
        {
            Func<object> func = () => _IUtilitiesService.GetOrganizationDepositDetails(_UtilitiesDbContext, DepositId);
            return InvokeHttpGetFunction(func);
        }

    }
}
