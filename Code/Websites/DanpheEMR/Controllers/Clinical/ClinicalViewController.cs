using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using Microsoft.AspNetCore.Http;
using DanpheEMR.Utilities;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class ClinicalViewController : Controller
    {

        private readonly string connString = null;
        public ClinicalViewController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;

        }
        public IActionResult GetView(string urlFullPath, string viewPath)
        {
            //Get Valid Route List for logged in user
            List<DanpheRoute> validRouteList = HttpContext.Session.Get<List<DanpheRoute>>("validRouteList");

            return View(viewPath);//temporary, remove it later.. sud-6feb

            //uncomment below and move to action filter
            //if (validRouteList != null || validRouteList.Count > 0)
            //{
            //    List<DanpheRoute> validRoutes = validRouteList.Where(a => a.UrlFullPath == urlFullPath).ToList();
            //    if (validRoutes != null && validRoutes.Count > 0)
            //    {
            //        //Return view for valid user
            //        return View(viewPath);
            //    }
            //    else
            //    {
            //        //Return content with message for unauthorized user
            //        return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
            //    }
            //}
            //else
            //{
            //    //Return content with message for unauthorized user
            //    return Content("<div>Page Not Found</div><router-outlet></router-outlet>");
            //}
        }
        public IActionResult Clinical()
        {
            try
            {
                //Nagesh - Need to remove check currentUser, ChildRoutes from this page because we are taking childroutes from SecurityService as locally
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //List<DanpheRoute> childRoutes = RBAC.GetChildRoutesForUser(currentUser.UserId, urlFullPath: "Doctors/PatientOverviewMain/Clinical");                
                //ViewData["validroutes"] = childRoutes;
                return this.GetView("Doctors/PatientOverviewMain/Clinical", "Clinical");               
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult Vitals()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/Vitals", "Vitals");                
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }
        public IActionResult InputOutputList()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/InputOutput", "InputOutputList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult AllergyList()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/Allergy", "AllergyList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult HomeMedication()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/HomeMedication", "HomeMedicationList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult MedicationPrescription()
        {
            try
            {
                ViewData["ConnectionString"] = connString;                
               return this.GetView("Doctors/PatientOverviewMain/Clinical/MedicationPrescription", "MedicationPrescription");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult ProblemsMain()
        {
            try
            {              
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain", "ProblemsMain");                
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }
        public IActionResult ActiveMedical()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain/ActiveMedical", "MedicalProblemList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult PastMedical()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain/PastMedical", "PastMedical");                
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

    
        public IActionResult History()
        {
            try
            {   
                return this.GetView("Doctors/PatientOverviewMain/Clinical/History", "History");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult FamilyHistory()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain/FamilyHistory", "FamilyHistoryList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult SurgicalHistoryList()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain/SurgicalHistory", "SurgicalHistoryList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult SocialHistoryList()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ProblemsMain/SocialHistory", "SocialHistoryList");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public IActionResult Notes()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/Notes", "Notes");                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult DoctorNotes()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/DoctorsNotes", "DoctorNotes");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public IActionResult Diagnosis()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                //return this.GetView("Doctors/PatientOverviewMain/Clinical/Notes", "Diagnosis");
                return View("Diagnosis");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

      //  [DanpheViewFilter("clinical-scan-image-view")]
        public IActionResult ScannedImages()
        {
            try
            {
                ViewData["ConnectionString"] = connString;
                return this.GetView("Doctors/PatientOverviewMain/Clinical/ScannedImages", "Scanned-Images");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
