using System;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Services;
using DanpheEMR.Security;
using DanpheEMR.ViewModel;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class InventoryEmailController : Controller
    {

        public IEmailService _emailService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        public InventoryEmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("hello");
        }
        
        [HttpPost]
        public IActionResult Post([FromBody]EmailViewModel value)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var emailList = value.EmailAddress.Split(';');
                foreach (var email in emailList)
                {
                    value.EmailAddressList.Add(email);
                }
                responseData.Results = _emailService.SendEmail("info@hamshospital.org", value.EmailAddressList,"Procurement", value.Subject, value.Content, "");
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
