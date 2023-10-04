using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using Microsoft.AspNetCore.Http;
using DanpheEMR.Utilities;
using DanpheEMR.Security;

//review:25Jan'17-sudarshan: check if ViewData["ConnectionString"] is needed or not in respective cshtml, remove from here if not needed.
namespace DanpheEMR.Controllers
{
    public class AppointmentViewController : Controller
    {
        private readonly string connString = null;
        public AppointmentViewController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;

        }      
        [DanpheViewFilter("appointment-visit-view")]
        public IActionResult Visit()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("Visit");              
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("appointment-createappointment-view")]
        public IActionResult CreateAppointment()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("CreateAppointment");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult CreateAdmission()
        {
            try
            {
                ViewData["ConnectionString"] = connString;                
                return View("CreateAdmission");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("appointment-view")]
        public IActionResult Appointment()
        {
            try
            {
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");              
                //List<DanpheRoute> childRoutes = RBAC.GetChildRoutesForUser(currentUser.UserId, urlFullPath: "Appointment");
                //ViewData["validroutes"] = childRoutes;                
                ViewData["ConnectionString"] = connString;
                return View("Appointment");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("appointment-listappointment-view")]
        public IActionResult ListAppointment()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("ListAppointment");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("appointment-listvisit-view")]
        public IActionResult ListVisit()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("ListVisit");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //removed viewfilter attribute since this is being loaded from shared-module and it shouldn't require extra permissions.
        //[DanpheViewFilter("appointment-printsticker-view")]
        public IActionResult PrintSticker()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("PrintSticker");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("appointment-patientsearch-view")]
        public IActionResult SearchPatient()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return View("SearchPatient");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}
