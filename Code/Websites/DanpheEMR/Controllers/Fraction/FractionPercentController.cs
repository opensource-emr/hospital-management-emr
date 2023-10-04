using System;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Services;
using DanpheEMR.Security;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class FractionPercentController : Controller
    {

        public IFractionPercentService _FractionPercentService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public FractionPercentController(IFractionPercentService FractionPercentService)
        {
            _FractionPercentService = FractionPercentService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {

            try
            {
                responseData.Results = _FractionPercentService.ListFractionApplicableItems();
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
        public IActionResult Get(int id)
        {
            try
            {
                responseData.Results = _FractionPercentService.GetFractionPercent(id);
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
        public IActionResult Post([FromBody]FractionPercentModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                value.CreatedBy = currentUser.EmployeeId;
                _FractionPercentService.AddFractionPercent(value);
                responseData.Results = _FractionPercentService.GetFractionPercent(value.PercentSettingId);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]FractionPercentModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                value.PercentSettingId = id;
                _FractionPercentService.UpdateFractionPercent(value);
                responseData.Results = _FractionPercentService.GetFractionPercent(id);
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpGet("~/api/FractionPercentByPriceId/{id}")]
        public IActionResult GetFractionPercentByBillPriceId(int id)
        {
            try
            {
                responseData.Results = _FractionPercentService.GetFractionPercentByBillPriceId(id);
                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }
    }
}
