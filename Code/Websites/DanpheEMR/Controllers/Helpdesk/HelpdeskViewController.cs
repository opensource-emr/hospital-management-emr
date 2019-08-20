using System;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.Security;
using System.Collections.Generic;
using DanpheEMR.Utilities;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.HelpDesk
{
    public class HelpdeskViewController : Controller
    {
        private readonly string connString = null;
        public HelpdeskViewController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;

        }
        public IActionResult GetView(string urlFullPath, string viewPath)
        {
            //Get Valid Route List for logged in user
            List<DanpheRoute> validRouteList = HttpContext.Session.Get<List<DanpheRoute>>("validRouteList");
            if (validRouteList != null || validRouteList.Count > 0)
            {
                List<DanpheRoute> validRoutes = validRouteList.Where(a => a.UrlFullPath == urlFullPath).ToList();
                if (validRoutes != null && validRoutes.Count > 0)
                {
                    //Return view for valid user
                    return View(viewPath);
                }
                else
                {
                    //Return content with message for unauthorized user
                    return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
                }
            }
            else
            {
                //Return content with message for unauthorized user
                return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
            }
        }
        public IActionResult EmployeeInformation()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Helpdesk/EmployeeInformation", "EmployeeInformation");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult BedInformation()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Helpdesk/BedInformation", "BedInformation");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult WardInformation()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Helpdesk/WardInformation", "WardInformation");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult Helpdesk()
        {
            try
            {                
                ViewData["ConnectionString"] = connString;
                return this.GetView("Helpdesk", "Helpdesk");                                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
