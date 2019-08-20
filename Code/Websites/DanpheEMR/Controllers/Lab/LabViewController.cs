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

namespace DanpheEMR.Controllers.Lab
{
    public class LabViewController : Controller
    {
        private readonly string config = null;
        public LabViewController(IOptions<MyConfiguration> _config)
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
        public IActionResult LabMain()
        {
            try
            {
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //List<DanpheRoute> childRoutes = RBAC.GetChildRoutesForUser(currentUser.UserId, urlFullPath: "Lab");
                //ViewData["validroutes"] = childRoutes;
                return this.GetView("Lab", "LabMain");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult ListLabRequisition()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);

                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/Requisition", "ListLabRequisition");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PendingLabResults()

        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/PendingLabResults", "PendingLabResults");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult SelectLabTests()
        {
            try
            {
                var dal = new DalLayer.MasterDbContext(config);

                ViewData["ConnectionString"] = config;
               // return this.GetView("Lab/PendingLabResults", "SelectLabTests");
                return View("SelectLabTests");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
       
        public IActionResult CollectSampleLabTests()
        {
            try
            {              
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/CollectSample", "CollectSampleLabTests");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult AddResult()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/AddResult", "AddResult");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PatientTemplateList()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/PatientTemplateList", "PatientTemplateList");
                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult ListPatientReport()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/ListPatientReport", "ListPatientReport");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult ViewAllReport()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return this.GetView("Lab/ViewAllReport", "ViewAllReport");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // GET: /<controller>/
        [DanpheViewFilter("lab-settings-view")]
        public IActionResult LabSettingsMain()
        {
            try
            {
                return View();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

       

    }
}
