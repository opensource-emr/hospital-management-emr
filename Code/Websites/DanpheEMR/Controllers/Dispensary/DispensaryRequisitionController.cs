using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Services.Dispensary;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Routing;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Controllers.Dispensary
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class DispensaryRequisitionController : CommonController
    {
        private IDispensaryRequisitionService _dispensaryRequisitionService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public DispensaryRequisitionController(IOptions<MyConfiguration> _config, IDispensaryRequisitionService dispensaryRequisitionService) : base(_config)

        {
            _dispensaryRequisitionService = dispensaryRequisitionService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(DateTime FromDate, DateTime ToDate)
        {
            try
            {

                responseData.Results = await _dispensaryRequisitionService.GetAllAsync(FromDate, ToDate);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("Dispensary/{id}")]
        public async Task<IActionResult> GetByDispensaryIdAsync(int id, DateTime FromDate, DateTime ToDate)
        {
            try
            {
                responseData.Results = await _dispensaryRequisitionService.GetAllByDispensaryIdAsync(id, FromDate, ToDate);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequisitionViewByIdAsync(int id)
        {
            try
            {
                responseData.Results = await _dispensaryRequisitionService.GetRequisitionViewByIdAsync(id);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("GetItemsForRequisition/{IsInsurance}")]
        public async Task<IActionResult> GetItemsForRequisition(bool IsInsurance = false)
        {
            try
            {
                responseData.Results = await _dispensaryRequisitionService.GetItemsForRequisition(IsInsurance);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet]
        [Route("RequisitionDispatchToReceive")]
        public async Task<IActionResult> GetRequisitionDispatchToReceiveAsync(int RequisitionId)
        {
            Func<Task<RequisitionDispatchToReceive_DTO>> func = () => _dispensaryRequisitionService.GetRequisitionDispatchToReceiveAsync(RequisitionId);
            return await InvokeHttpGetFunctionAsync(func);
        }
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PHRMStoreRequisitionModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (value != null)
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    value.CreatedBy = currentUser.EmployeeId;
                    var dispensaryResponse = await _dispensaryRequisitionService.AddDispensaryRequisition(value);
                    responseData.Results = dispensaryResponse;
                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
        [HttpPut]
        public IActionResult UpdateDispensary([FromBody] PHRMStoreRequisitionModel value)
        {
            try
            {
                responseData.Results = _dispensaryRequisitionService.UpdateDispensaryRequisition(value);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        //Put method for item receive in Substore
        [HttpPut("ReceiveDispatchedItems/{DispatchId}")]
        public async Task<IActionResult> ReceiveDispatchedItems([FromRoute] int DispatchId, [FromBody] string ReceivedRemarks)
        {
            try
            {
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                responseData.Results = await _dispensaryRequisitionService.ReceiveDispatchedStocks(DispatchId, ReceivedRemarks, currentUser);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpPut("ApproveRequisition/{RequisitionId}")]
        public async Task<IActionResult> ApproveRequisition([FromRoute] int RequisitionId)
        {
            try
            {
                var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                responseData.Results = await _dispensaryRequisitionService.ApproveRequisition(RequisitionId, currentUser);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        [HttpPut("CancelRequisitionItems")]
        public async Task<IActionResult> CancelRequisitionItems([FromBody] CanceRequisitionItemsQueryModel value)
        {
            var currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                responseData.Results = await _dispensaryRequisitionService.CancelRequisitionItems(value, currentUser);
                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;

            }
            return Ok(responseData);
        }

    }
}
