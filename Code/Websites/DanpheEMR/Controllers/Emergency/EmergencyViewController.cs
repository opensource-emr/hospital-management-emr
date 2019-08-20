using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DanpheEMR.Controllers.Emergency
{
    
    public class EmergencyViewController : Controller
    {
        public IActionResult EmergencyMain()
        {
            try
            {
                return View("~/Views/EmergencyView/EmergencyMain.cshtml");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}