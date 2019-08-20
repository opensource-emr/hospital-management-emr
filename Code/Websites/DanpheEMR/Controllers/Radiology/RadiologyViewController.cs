using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Utilities;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class RadiologyViewController : Controller
    {
        private readonly string config = null;
        public RadiologyViewController(IOptions<MyConfiguration> _config)
        {
            config = _config.Value.Connectionstring;
        }
        //public IActionResult GetView(string urlFullPath, string viewPath)
        //{
        //    //Get Valid Route List for logged in user
        //    List<DanpheRoute> validRouteList = HttpContext.Session.Get<List<DanpheRoute>>("validRouteList");
        //    if (validRouteList != null || validRouteList.Count > 0)
        //    {
        //        List<DanpheRoute> validRoutes = validRouteList.Where(a => a.UrlFullPath == urlFullPath).ToList();
        //        if (validRoutes != null && validRoutes.Count > 0)
        //        {
        //            //Return view for valid user
        //            return View(viewPath);
        //        }
        //        else
        //        {
        //            //Return content with message for unauthorized user
        //            return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
        //        }
        //    }
        //    else
        //    {
        //        //Return content with message for unauthorized user
        //        return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
        //    }
        //}

        public IActionResult Radiology()
        {
            try
            {
                //Nagesh - No need to load child routes from Here , We get child routes from security service at client side
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //List<DanpheRoute> childRoutes = RBAC.GetChildRoutesForUser(currentUser.UserId, urlFullPath: "Radiology");
                //ViewData["validroutes"] = childRoutes;
                //return this.GetView("Reports/RadiologyMain", "RadiologyMain");                
                return View("RadiologyMain");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult ImagingRequisition()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                //return this.GetView("Radiology/ImagingRequisition", "ImagingRequisition");
                return View("ImagingRequisition");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult ImagingRequisitionList()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                //return this.GetView("Radiology/ImagingRequisitionList", "ImagingRequisitionList");
                return View("ImagingRequisitionList");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult ImagingResult()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return View("ImagingResult");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult ImagingReportsList()
        {
            try
            {
                //return this.GetView("Radiology/ImagingReportsList", "ImagingReportsList");
                return View("ImagingReportsList");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}
