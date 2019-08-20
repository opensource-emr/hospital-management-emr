using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Utilities;

namespace DanpheEMR.Controllers
{
    public class DoctorsViewController : Controller
    {
        private readonly string config = null;
        public DoctorsViewController(IOptions<MyConfiguration> _config)
        {
            config = _config.Value.Connectionstring;
        }
        //Nagesh- Can't find DashboardStatistics view file
        public IActionResult DashBoardStatistics()
        {
            return View();
        }
        //Returns Doctors Dashboard
        public IActionResult DashboardMain()
        {
            try
            {
                return View("DashboardMain");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("doctors-outpatientdoctor-view")]
        public IActionResult DoctorDashboard()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return View("DoctorDashboard");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("doctors-patientoverview-view")]
        public IActionResult PatientOverview()
        {
            try
            {
                ViewData["ConnectionString"] = config;
                return View("PatientOverview");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("doctors-patientoverviewmain-view")]
        public IActionResult PatientOverviewMain()
        {
            try
            {
                return View("PatientOverviewMain");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [DanpheViewFilter("doctors-patientvisithistory-view")]
        public IActionResult PatientVisitHistory()
        {
            try
            {
                return View("PatientVisitHistory");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [DanpheViewFilter("opd-summary-view")]
        public IActionResult VisitSummary()
        {
            try
            {
                return View("VisitSummary");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}
