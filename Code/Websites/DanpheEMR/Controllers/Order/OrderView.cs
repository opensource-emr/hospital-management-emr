using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Utilities;


namespace DanpheEMR.Controllers.Order
{
    public class OrderView : Controller
    {
        private readonly string config = null;
        public OrderView(IOptions<MyConfiguration> _config)
        {
            config = _config.Value.Connectionstring;

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
        // GET: /<controller>/
        public IActionResult OrderRequisitions()
        {
            try
            {

                ViewData["ConnectionString"] = config;
                return this.GetView("Doctors/PatientOverviewMain/Orders/OrderRequisition", "OrderRequisitions");               
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult PrintMedications()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return View("PrintMedications");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult OrderMain()
        {
            try
            {

                ViewData["ConnectionString"] = config;
                return View ("OrderMain");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
