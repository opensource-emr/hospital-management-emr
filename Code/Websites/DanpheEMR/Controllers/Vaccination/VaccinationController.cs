using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.Vaccination;
using DanpheEMR.Services.Vaccination;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    [Route("api/[controller]")]
    public class VaccinationController : CommonController
    {
        IVaccinationService _vaccinationService;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public VaccinationController(IVaccinationService vaccinationService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _vaccinationService = vaccinationService;
        }

        [Route("GetAllVaccinationPatient")]
        [HttpGet]
        public IActionResult GetAllVaccinationPatient()
        {
            try
            {
                responseData.Results = _vaccinationService.GetAllVaccinationPatient();
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


        [Route("GetVaccinationPatientDetailById")]
        [HttpGet]
        public IActionResult GetVaccinationPatientDetailById(int id)
        {
            try
            {
                responseData.Results = _vaccinationService.GetVaccinationPatientByPatientId(id);
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

        [Route("GetAllVaccinesOfPatientByPatientId")]
        [HttpGet]
        public IActionResult GetAllVaccinesOfPatientByPatientId(int id)
        {
            try
            {
                responseData.Results = _vaccinationService.GetAllVaccinesOfPatientByPatientId(id);
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

        [Route("GetAllVaccineWiseDoseMapped")]
        [HttpGet]
        public IActionResult GetAllVaccineWiseDoseMapped(bool doseNeeded)
        {
            try
            {
                responseData.Results = _vaccinationService.GetAllVaccinesAndDosesList(true);
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

        [Route("GetVaccinationIntegratedreport")]
        [HttpGet]
        public IActionResult GetVaccinationIntegratedreport(DateTime from, DateTime to, string gender, string vaccStr)
        {
            try
            {
                List<int> vaccineList = DanpheJSONConvert.DeserializeObject<List<int>>(vaccStr);
                responseData.Results = _vaccinationService.GetIntegratedVaccineReport(from, to, gender, vaccineList);
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

        [Route("GetAllBabyPatient")]
        [HttpGet]
        public IActionResult GetAllBabyPatient(string search)
        {
            try
            {
                responseData.Results = _vaccinationService.GetAllBabyPatient(search);
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

        [Route("GetLatestVaccRegNumber")]
        [HttpGet]
        public IActionResult GetLatestVaccineRegistrationNum(int fiscalYearId = 0)
        {
            try
            {
                responseData.Results = _vaccinationService.GetLatestVaccRegNumber(fiscalYearId);
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                //+ " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }

        }

        [Route("GetExistingVaccRegistrationData")]
        [HttpGet]
        public IActionResult GetExistingVaccRegistrationData(int fiscalYearId, int regNumber)
        {
            try
            {
                responseData.Results = _vaccinationService.GetEistingPatientWithVaccRegNumber(fiscalYearId, regNumber);
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

        [HttpGet("GetCastEthnicGroupList")]
        public IActionResult GetCastEthnicGroupList()
        {
            try
            {
                responseData.Results = _vaccinationService.GetCastEthnicGroupList();
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



        [Route("AddVaccinationPatient")]
        [HttpPost]
        public IActionResult AddVaccPatient([FromBody] PatientModel pat)
        {
            if (String.IsNullOrEmpty(pat.ShortName))
            {
                throw new Exception("No Name Given");
            }
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (pat.PatientId > 0)
                {
                    pat.ModifiedBy = currentUser.EmployeeId;
                    pat.ModifiedOn = System.DateTime.Now;
                }
                else
                {
                    pat.CreatedBy = currentUser.EmployeeId;
                    pat.CreatedOn = System.DateTime.Now;
                }
                PatientModel tempPat = _vaccinationService.AddUpdateVaccinationPatient(pat);

                //Need to get visitid from 1st Visit obj of Patient-- Comes incase of add, not in update..
                int currVisitId = tempPat.Visits != null && tempPat.Visits.Count > 0 ? tempPat.Visits[0].PatientVisitId : 0;

                responseData.Results = new { PatientId = tempPat.PatientId, PatientVisitId = currVisitId };

                //responseData.Results = tempPat.PatientId;
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }

        }

        [Route("AddPatientVaccineationDetail")]
        [HttpPost]
        public IActionResult AddPatientVaccineationDetail([FromBody] PatientVaccineDetailModel model)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (model.PatientVaccineId > 0)
                {
                    model.ModifiedBy = currentUser.EmployeeId;
                    model.ModifiedOn = System.DateTime.Now;
                }
                else
                {
                    model.CreatedBy = currentUser.EmployeeId;
                    model.CreatedOn = System.DateTime.Now;
                }
                _vaccinationService.AddUpdatePatienVaccinationDetail(model);
                responseData.Results = new { };
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

        [Route("UpdateVaccRegnumberOfPatient")]
        [HttpPut]
        public IActionResult UpdateVaccinationRegnumberOfPatient(int patId, int regNum, int fiscalYearId)
        {
            try
            {
                if ((patId == 0) || (regNum == 0)) { throw new Exception("Select Patient and Registration number correctly"); }
                _vaccinationService.UpdatePatienVaccRegNumber(patId, regNum, fiscalYearId);
                responseData.Results = new { };
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



        [Route("GetPatientAndVisitInfo")]
        [HttpGet]
        public IActionResult GetPatientAndVisitInfo(int patientVisitId)
        {
            try
            {
                responseData.Results = _vaccinationService.GetVaccPatientWithVisitInfoByVisitId(patientVisitId);
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


        [Route("PostFollowupVisit")]
        [HttpPost]
        public IActionResult PostFollowupVisit([FromBody] VisitModel vis)
        {
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                VaccPatientWithVisitInfoVM retObj = _vaccinationService.PostFollowupVisit(vis, connString, currentUser);

                responseData.Results = retObj;
                responseData.Status = "OK";
                return Ok(responseData);

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
                return BadRequest(responseData);
            }

        }



        [Route("GetDailyAppointmentReport")]
        [HttpGet]
        public IActionResult GetDailyAppointmentReport(DateTime fromDate, DateTime toDate, string appointmentType)
        {
            try
            {
                responseData.Results = _vaccinationService.GetDailyAppointmentReport(fromDate, toDate, appointmentType);
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
    }
}
