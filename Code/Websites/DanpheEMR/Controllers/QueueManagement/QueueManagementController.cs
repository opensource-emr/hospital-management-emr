using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Services.QueueManagement;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.QueueManagement
{
    [Route("api/[controller]")]
    public class QueueManagementController : CommonController
    {
        IQueueManagementService _queueManagementService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public QueueManagementController(IQueueManagementService queueManagementService,IOptions<MyConfiguration> _config) : base(_config)
        {
            _queueManagementService = queueManagementService;
        }
        // GET: api/<QueueManagementController>
        [Route("GetAllApptDepartment")]
        [HttpGet]
        public IActionResult GetAllApptDepartment()
        {
            try
            {
                responseData.Results = _queueManagementService.GetDepartment();
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [Route("GetAppointmentData")]
        [HttpGet]
        public IActionResult GetAppointmentData(int deptId, int doctorId,bool pendingOnly)
        {
            try
            {
                responseData.Results = _queueManagementService.GetAppointmentData(deptId, doctorId, pendingOnly);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }
        [Route("GetAllAppointmentApplicableDoctor")]
        [HttpGet]
        public IActionResult GetAllAppointmentApplicableDoctor()
        {
            try
            {
                responseData.Results = _queueManagementService.GetAllAppointmentApplicableDoctor();
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }
        // GET api/<QueueManagementController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<QueueManagementController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<QueueManagementController>/5
        [Route("updateQueueStatus")]
        [HttpPut]
        public IActionResult updateQueueStatus(string data, int visitId)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                responseData.Results = _queueManagementService.updateQueueStatus(data, visitId, currentUser);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<QueueManagementController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
