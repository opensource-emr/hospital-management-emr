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

namespace DanpheEMR.Controllers.Dispensary
{
    [RequestFormSizeLimit(valueCountLimit: 1000000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class DispensaryRequisitionController : Controller
    {
        private IDispensaryRequisitionService _dispensaryRequisitionService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public DispensaryRequisitionController(IDispensaryRequisitionService dispensaryRequisitionService)
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

        [HttpGet("GetDispatchListForItemReceive/{RequisitionId}")]
        public async Task<IActionResult> GetDispatchListForItemReceive([FromRoute] int RequisitionId)
        {
            try
            {
                responseData.Results = await _dispensaryRequisitionService.GetDispatchListForItemReceiveAsync(RequisitionId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
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
