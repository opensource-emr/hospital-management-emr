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
    public class DesignationController : Controller
    {

        public IDesignationService _designationService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public DesignationController( IDesignationService designationService) 
        {
            _designationService = designationService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {

            try
            {
                responseData.Results = _designationService.ListDesignation();
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
                responseData.Results = _designationService.GetDesignation(id);
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
        public IActionResult Post([FromBody]DesignationModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                value.CreatedBy = currentUser.EmployeeId;
                _designationService.AddDesignation(value);
                responseData.Results = _designationService.GetDesignation(value.DesignationId);
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
        public IActionResult Put(int id, [FromBody]DesignationModel value)
        {            
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                value.DesignationId = id;
                _designationService.UpdateDesignation(value);
                responseData.Results = _designationService.GetDesignation(id);
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
