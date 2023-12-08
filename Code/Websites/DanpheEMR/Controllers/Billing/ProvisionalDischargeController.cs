using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.BillingModels.DischargeModel;
using DanpheEMR.Services.ProvisionalDischarge;
using DanpheEMR.Services.ProvisionalDischarge.DTO;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers.Billing
{
    public class ProvisionalDischargeController : CommonController
    {
        private readonly IProvisionalDischargeService _provisionalDischargeService;
        private readonly BillingDbContext _billingDbContext;

        public ProvisionalDischargeController(IOptions<MyConfiguration> _config, IProvisionalDischargeService provisionalDischargeService) : base(_config)
        {
            _provisionalDischargeService = provisionalDischargeService;
            _billingDbContext = new BillingDbContext(connString);
        }

        /// <summary>
        /// This API is responsibe to handle Provisional Discharge, Which have no impacts on Financials, It only releases the bed.
        /// </summary>
        /// <param name="provisionalDischarge"></param>
        /// <returns message="Provisional Discharge Successful"></returns>
        /// <exception cref="ArgumentNullException"></exception>
        [HttpPost]
        [Route("Discharge")]
        public IActionResult PostProvisionalDischarge([FromBody] ProvisionalDischarge_DTO provisionalDischarge)
        {
            if(provisionalDischarge == null)
            {
                throw new ArgumentNullException("Expected Data is not provided from Client!");
            }
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            using (var provisionalDischargeTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                Func<object> func = () => _provisionalDischargeService.PostProvisionalDischarge(_billingDbContext, provisionalDischarge, currentUser);
                return InvokeHttpPostFunctionSingleTransactionScope(func, provisionalDischargeTransactionScope);
            }
        }

        [HttpPost]
        [Route("PayProvisional")]
        public IActionResult PostPayProvisional()
        {
            string postDataString = this.ReadPostData();
            if(postDataString == null)
            {
                throw new ArgumentNullException();
            }
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            using (var provisionalclearanceTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                Func<object> func = () => _provisionalDischargeService.PostPayProvisional(_billingDbContext, postDataString, currentUser, connString);
                return InvokeHttpPostFunctionSingleTransactionScope(func, provisionalclearanceTransactionScope);
            }
        }

        [HttpPut]
        [Route("DiscardAllItems")]
        public IActionResult DiscardAllItems([FromBody] DiscardProvisionalItems_DTO discardProvisionalItems)
        {
            if (discardProvisionalItems == null)
            {
                throw new ArgumentNullException("Expected Data is not provided from Client!");
            }
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            using (var discardProvisionalItemsTransactionScope = _billingDbContext.Database.BeginTransaction())
            {
                Func<object> func = () => _provisionalDischargeService.DiscardProvisionalItems(_billingDbContext, discardProvisionalItems, currentUser);
                return InvokeHttpPostFunctionSingleTransactionScope(func, discardProvisionalItemsTransactionScope);
            }
        }

        [HttpGet]
        [Route("ProvisionalDischargeList")]
        public IActionResult GetProvisionalDischargeList()
        {
            Func<object> func = () => _provisionalDischargeService.GetProvisionalDischargeList(_billingDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ProvisionalDischargeItems")]
        public IActionResult GetProvisionalDischargeItems(int patientId, int schemeId, int patientVisitId)
        {
            Func<object> func = () => _provisionalDischargeService.GetProvisionalDischargeItems(_billingDbContext, patientId, schemeId, patientVisitId);
            return InvokeHttpGetFunction(func);
        }
    }
}
