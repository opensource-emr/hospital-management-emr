using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;//for entity-update.
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel.EmergencyModels;
using DanpheEMR.ServerModel;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using Newtonsoft.Json.Linq;
using DanpheEMR.Enums;
using System.IO;
using Microsoft.AspNetCore.StaticFiles;
using System.Data;
using System.Data.SqlClient;

namespace DanpheEMR.Controllers.Emergency
{

    public class EmergencyController : CommonController
    {
        public EmergencyController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        // GET: api/values
        [HttpGet]
        public string Get(string reqType, int countryId, string caseId, int FileId,int id, int selectedCase, string search)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
                CoreDbContext coreDbContext = new CoreDbContext(connString);

                if (reqType == "latestERNumAndModeOfArrival")
                {
                    var latestPatientNum = GetLatestERPatientNum(connString);
                    var allModeOfArrivals = erDbContext.ModeOfArrival.Where(m => m.IsActive == true).ToList();
                    responseData.Results = new { LatestERPatientNumber = latestPatientNum, AllModeOfArrival = allModeOfArrivals };
                    responseData.Status = "OK";
                }
                else if (reqType == "allERPatientList")
                {

                    var ervitalB4triage = (from parValue in coreDbContext.Parameters
                                           where parValue.ParameterGroupName.ToLower() == "emergency" && parValue.ParameterName == "ERAddVitalBeforeTriage"
                                           select parValue.ParameterValue).FirstOrDefault();

                    var allERPatients = (from erpat in erDbContext.EmergencyPatient
                                         join pat in erDbContext.Patient on erpat.PatientId equals pat.PatientId
                                         join moa in erDbContext.ModeOfArrival on erpat.ModeOfArrival equals moa.ModeOfArrivalId into ModeOfArr
                                         where erpat.IsActive == true && erpat.ERStatus.ToLower() == "new"
                                         from m in ModeOfArr.DefaultIfEmpty()
                                         select new
                                         {
                                             ERPatientId = erpat.ERPatientId,
                                             ERPatientNumber = erpat.ERPatientNumber,
                                             PatientCode = pat.PatientCode,
                                             PatientId = erpat.PatientId,
                                             PatientVisitId = erpat.PatientVisitId,
                                             VisitDateTime = erpat.VisitDateTime,
                                             FirstName = pat.FirstName,
                                             MiddleName = pat.MiddleName,
                                             LastName = pat.LastName,
                                             Gender = pat.Gender,
                                             Age = pat.Age,
                                             DateOfBirth = pat.DateOfBirth,
                                             ContactNo = pat.PhoneNumber,
                                             Address = pat.Address,
                                             MunicipalityId = pat.MunicipalityId,
                                             MunicipalityName = (from pat in erDbContext.Patient
                                                                 join mun in erDbContext.Municipalities on pat.MunicipalityId equals mun.MunicipalityId
                                                                 where pat.PatientId == erpat.PatientId
                                                                 select mun.MunicipalityName).FirstOrDefault(),
                                             ReferredBy = erpat.ReferredBy,
                                             ReferredTo = erpat.ReferredTo,
                                             Case = erpat.Case,
                                             ConditionOnArrival = erpat.ConditionOnArrival,
                                             ModeOfArrival = (int?)m.ModeOfArrivalId,
                                             ModeOfArrivalName = m.ModeOfArrivalName,
                                             CareOfPerson = erpat.CareOfPerson,
                                             ERStatus = erpat.ERStatus,
                                             TriageCode = erpat.TriageCode,
                                             TriagedBy = erpat.TriagedBy,
                                             TriagedOn = erpat.TriagedOn,
                                             CreatedBy = erpat.CreatedBy,
                                             CreatedOn = erpat.CreatedOn,
                                             ModifiedBy = erpat.ModifiedBy,
                                             ModifiedOn = erpat.ModifiedOn,
                                             IsActive = erpat.IsActive,
                                             IsPoliceCase = erpat.IsPoliceCase,
                                             IsAddVitalBeforeTriage = ervitalB4triage,
                                             OldPatientId = erpat.OldPatientId,
                                             IsExistingPatient = erpat.IsExistingPatient,
                                             vitals = (from vit in erDbContext.Vitals
                                                       where vit.PatientVisitId == erpat.PatientVisitId
                                                       select vit
                                                       ).OrderByDescending(d => d.VitalsTakenOn).FirstOrDefault(),
                                             FullName = (pat.FirstName.ToLower().Contains("unknown") ? pat.FirstName : pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName),
                                             CountryId = pat.CountryId,
                                             CountrySubDivisionId = pat.CountrySubDivisionId,
                                             PatientCases = (from patCase in erDbContext.PatientCases
                                                             where patCase.ERPatientId == erpat.ERPatientId && patCase.IsActive == true
                                                             select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault(),
                                             uploadedfiles = (from consent in erDbContext.Consentform
                                                             where consent.ERPatientId == erpat.ERPatientId
                                                             select consent
                                                             //{
                                                             //    ERPatientId=consent.ERPatientId,
                                                             //    PatientId = consent.PatientId,
                                                             //    fileId = consent.FileId,
                                                             //    fileName=consent.FileName,
                                                             //    fileType = consent.FileType,
                                                             ).OrderByDescending(d => d.ERPatientId).FirstOrDefault(),
                                         }).OrderByDescending(p => p.ERPatientId).ToList();

                    if (selectedCase == 0)
                    {
                        allERPatients.ToList();
                    }
                    else
                    {
                        allERPatients = allERPatients.Where(p => (p.PatientCases == null) ? false : (p.PatientCases.MainCase == selectedCase)).ToList();
                    }

                    responseData.Results = allERPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allTriagedPatientList")
                {

                    var criticalPat = GetTriagePatientsByTriageCode("critical", connString, selectedCase);
                    var moderatePat = GetTriagePatientsByTriageCode("moderate", connString, selectedCase);
                    var mildPat = GetTriagePatientsByTriageCode("mild", connString, selectedCase);
                    var deathPat = GetTriagePatientsByTriageCode("death", connString, selectedCase);

                    var allERTriagedPatients = deathPat.Union(criticalPat).Union(moderatePat).Union(mildPat);

                    responseData.Results = allERTriagedPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allExistingPatients")
                {
                    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_Billing_PatientsListWithVisitinformation",
                    new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, erDbContext);
                    responseData.Results = dt;
                    responseData.Status = "OK";
                    //var allPats = (from pat in erDbContext.Patient
                    //               join country in erDbContext.CountrySubDivision
                    //               on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                    //               where !erDbContext.EmergencyPatient.Any(f => f.PatientId == pat.PatientId && f.ERStatus != "finalized") && pat.IsActive == true
                    //               select new
                    //               {
                    //                   PatientId = pat.PatientId,
                    //                   PatientCode = pat.PatientCode,
                    //                   ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                    //                   FirstName = pat.FirstName,
                    //                   LastName = pat.LastName,
                    //                   MiddleName = pat.MiddleName,
                    //                   Age = pat.Age,
                    //                   Gender = pat.Gender,
                    //                   PhoneNumber = pat.PhoneNumber,
                    //                   DateOfBirth = pat.DateOfBirth,
                    //                   Address = pat.Address,
                    //                   IsOutdoorPat = pat.IsOutdoorPat,
                    //                   CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                    //                   CountryId = pat.CountryId,
                    //                   CountrySubDivisionId = pat.CountrySubDivisionId,
                    //                   CountrySubDivisionName = country.CountrySubDivisionName,
                    //                   pat.MembershipTypeId,
                    //                   PANNumber = pat.PANNumber,
                    //                   pat.BloodGroup,
                    //                   IsAdmitted = (from adm in erDbContext.Admissions
                    //                                 where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                    //                                 select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //ram--> getting IsAdmitted status of patient
                    //               }).OrderByDescending(p => p.PatientId).ToList<object>();
                    //responseData.Results = allPats;
                    //responseData.Status = "OK";
                }
                else if (reqType == "allLamaPatientList")
                {
                    var allERlamaPatients = GetFinalizedListByStatus("lama", connString, selectedCase);

                    responseData.Results = allERlamaPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allTransferredPatientList")
                {
                    var allERTransferredPatients = GetFinalizedListByStatus("transferred", connString, selectedCase);

                    responseData.Results = allERTransferredPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allDischargedPatientList")
                {
                    var allERDischargedPatients = GetFinalizedListByStatus("discharged", connString, selectedCase);

                    responseData.Results = allERDischargedPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allAdmittedPatientList")
                {
                    var allAdmittedPatients = GetFinalizedListByStatus("admitted", connString, selectedCase);
                    responseData.Results = allAdmittedPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allDeathPatientList")
                {
                    var allERDeathPatients = GetFinalizedListByStatus("death", connString, selectedCase);

                    responseData.Results = allERDeathPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "allDorPatientList")
                {
                    var allERDeathPatients = GetFinalizedListByStatus("dor", connString, selectedCase);

                    responseData.Results = allERDeathPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "countryList")
                {
                    var allCountries = (from country in erDbContext.Country
                                        where country.IsActive == true
                                        select country).ToList();
                    responseData.Results = allCountries;
                    responseData.Status = "OK";
                }
                else if (reqType == "GetCountrySubDivision")
                {

                    MasterDbContext dbMaster = new MasterDbContext(connString);
                    List<CountrySubDivisionModel> CountrySubDivision = new List<CountrySubDivisionModel>();
                    //if countryId == 0 then bring all the CountrySubDivision from the CountrySubDivision table 
                    //else bring accroding to the countryId given
                    if (countryId == 0)
                    {
                        //filtering isactive records only--needs revision: sud 12apr'18
                        CountrySubDivision = (from s in dbMaster.CountrySubDivision
                                              where s.IsActive == true
                                              select s).ToList();
                    }
                    else
                    {
                        //filtering isactive records only--needs revision: sud 12apr'18
                        CountrySubDivision = (from SubDivision in dbMaster.CountrySubDivision
                                              select SubDivision).Where(s => s.CountryId == countryId && s.IsActive == true).ToList();
                    }

                    responseData.Results = CountrySubDivision;
                    responseData.Status = "OK";

                }
                else if (reqType == "doctor-list")
                {
                    //sud:9Aug'18--isappointmentapplicable field can be taken from employee now.. 
                    var doctorList = (from e in erDbContext.Employee
                                      where e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true
                                      select e).ToList();
                    responseData.Results = doctorList;
                    responseData.Status = "OK";
                }
                else if (reqType == "GetDischargeSummary")
                {
                    var patientId = Convert.ToInt32(this.ReadQueryStringData("patientId"));
                    var visitId = Convert.ToInt32(this.ReadQueryStringData("visitId"));

                    var DischargeSummaryVM = (from empat in erDbContext.EmergencyPatient
                                              where empat.PatientId == patientId && empat.PatientVisitId == visitId
                                              select new EmergencyDischargeSummaryVM
                                              {
                                                  EmergencyPatient = empat,
                                                  DischargeSummary = (from dischargeSum in erDbContext.DischargeSummary
                                                                      where dischargeSum.PatientId == patientId && dischargeSum.PatientVisitId == visitId
                                                                      select dischargeSum).FirstOrDefault(),
                                                  Vitals = (from vitals in erDbContext.Vitals
                                                            where vitals.PatientVisitId == visitId
                                                            select vitals).OrderByDescending(v => v.PatientVitalId).FirstOrDefault(),
                                                  VisitCode = (from visit in erDbContext.Visits
                                                               where visit.PatientId == patientId && visit.PatientVisitId == visitId
                                                               select visit.VisitCode).FirstOrDefault(),
                                                  LabOrders = (from labReq in erDbContext.LabRequisitions
                                                               where labReq.PatientId == patientId && labReq.PatientVisitId == visitId
                                                               && (labReq.BillingStatus != "cancelled" || labReq.BillingStatus != "returned")
                                                               && (labReq.OrderStatus == "report-generated" || labReq.OrderStatus == "result-added")
                                                               select labReq.LabTestName).Distinct().ToList(),
                                                  ImagingOrders = (from imagingReq in erDbContext.ImagingRequisitions
                                                                   where imagingReq.PatientId == patientId && imagingReq.PatientVisitId == visitId
                                                                   && (imagingReq.BillingStatus != "cancelled" || imagingReq.BillingStatus != "returned")
                                                                   select imagingReq.ImagingItemName).ToList()
                                              }
                                        ).FirstOrDefault();

                    DischargeSummaryVM.EmergencyPatient.PatientCode = (from pat in erDbContext.Patient
                                                                       where pat.PatientId == patientId
                                                                       select pat.PatientCode).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = DischargeSummaryVM;
                }
                else if (reqType == "findMatchingPatient")
                {
                    //firstName,lastName,dateOfBirth,phoneNumber
                    var firstName = this.ReadQueryStringData("firstName");
                    var lastName = this.ReadQueryStringData("lastName");
                    var dateOfBirth = Convert.ToDateTime(this.ReadQueryStringData("dateOfBirth"));
                    var phoneNumber = this.ReadQueryStringData("phoneNumber");
                    phoneNumber = phoneNumber.Trim();
                    var datePlusThree = dateOfBirth.AddYears(4);
                    var dateMinusThree = dateOfBirth.AddYears(-4);

                    List<object> result = new List<object>();

                    result = (from pat in erDbContext.Patient
                              where ((
                              (pat.FirstName.ToLower() == firstName.ToLower()) && (pat.LastName.ToLower() == lastName.ToLower())
                              && (pat.DateOfBirth.Value < datePlusThree) && (pat.DateOfBirth.Value > dateMinusThree)
                              )
                              || ((pat.PhoneNumber.Length > 0) ? (pat.PhoneNumber == phoneNumber) : false))
                              select new
                              {
                                  PatientId = pat.PatientId,
                                  FirstName = pat.FirstName,
                                  MiddleName = pat.MiddleName,
                                  LastName = pat.LastName,
                                  ShortName = pat.ShortName, //short name is required to assign in patientService
                                  FullName = pat.FirstName + " " + pat.LastName, //This one for comparing the matching patient list only
                                  Gender = pat.Gender,
                                  PhoneNumber = pat.PhoneNumber,
                                  IsDobVerified = pat.IsDobVerified,
                                  DateOfBirth = pat.DateOfBirth,
                                  Age = pat.Age,
                                  CountryId = pat.CountryId,
                                  CountrySubDivisionId = pat.CountrySubDivisionId,
                                  MembershipTypeId = pat.MembershipTypeId,
                                  Address = pat.Address,
                                  PatientCode = pat.PatientCode,
                              }
                                   ).ToList<object>();
                    responseData.Results = result;
                    responseData.Status = "OK";
                }
                else if (reqType == "GetUploadedConsentForm")
                {
                    try
                    {
                        var allFileList = (from consentFile in erDbContext.Consentform
                                           join pat in erDbContext.Patient on consentFile.PatientId equals pat.PatientId
                                           join ER in erDbContext.EmergencyPatient on consentFile.ERPatientId equals ER.ERPatientId
                                           where consentFile.ERPatientId == id && consentFile.IsActive == true
                                           select new
                                           {
                                               ERPatientId=ER.ERPatientId,
                                               FileId = consentFile.FileId,
                                               PatientId = consentFile.PatientId,
                                               ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                               FileType = consentFile.FileType,
                                               FileName = consentFile.FileName,
                                               DisplayName = consentFile.DisplayName,
                                               consentFile.ModifiedOn,
                                           }).ToList();


                        responseData.Results = allFileList;
                        responseData.Status = "OK";
                        //return Ok(responseData);
                    }
                    catch (Exception ex)
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        // return BadRequest(responseData);
                    }
                }
                else
                {
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpGet, DisableRequestSizeLimit]
        [Route("DownloadFile")]
        public IActionResult Download(int FileId)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parm = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Emergency" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault<ParameterModel>();
            var fileFullName = erDbContext.Consentform.Where(m => m.FileId == FileId).FirstOrDefault().FileName;
            var filePath = Path.Combine(parm.ParameterValue, fileFullName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }
            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                stream.CopyToAsync(memory);
                stream.Close();
                stream.Dispose();
            }
            memory.Position = 0;
            return File(memory, GetContentType(filePath), filePath);
        }
        [Route("UploadEmergencyPatConsentForm")]
        [HttpPost]
        public IActionResult UploadEmergencyPatConsentForm()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                var files = this.ReadFiles();
                var reportDetails = Request.Form["reportDetails"];
                UploadConsentForm patFileData = DanpheJSONConvert.DeserializeObject<UploadConsentForm>(reportDetails);
                using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
                {
                    var parm = erDbContext.AdminParameters.Where(a => a.ParameterGroupName == "Emergency" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault();
                    var currentTick = System.DateTime.Now.Ticks.ToString();

                    if (parm == null)
                    {
                        //throw new Exception("Please set parameter");
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Please set parameter";
                        return BadRequest(responseData);
                    }
                    try
                    {

                        foreach (var file in files)
                        {
                            if (file.Length > 0)
                            {
                                using (var ms = new MemoryStream())
                                {
                                    string currentFileExtention = Path.GetExtension(file.FileName);
                                    file.CopyTo(ms);
                                    var fileBytes = ms.ToArray();

                                    patFileData.FileType = currentFileExtention;
                                    patFileData.FileName = file.FileName + '_' + currentTick + currentFileExtention;
                                    patFileData.IsActive = true;
                                    patFileData.CreatedOn = DateTime.Now;
                                    patFileData.CreatedBy = currentUser.EmployeeId;

                                    string strPath = parm.ParameterValue + "/" + patFileData.FileName;

                                    if (!Directory.Exists(parm.ParameterValue))
                                    {
                                        Directory.CreateDirectory(parm.ParameterValue);
                                    }
                                    System.IO.File.WriteAllBytes(strPath, fileBytes);

                                    erDbContext.Consentform.Add(patFileData);
                                }

                                erDbContext.SaveChanges();
                            }
                        }
                        emergencyDbContextTransaction.Commit();

                        responseData.Results = null;
                        responseData.Status = "OK";
                        return Ok(responseData);

                    }
                    catch (Exception ex)
                    {
                        emergencyDbContextTransaction.Rollback();
                        throw (ex);
                    }
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }

        }

        [HttpPost]
        public string Post(int id)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string ipStr = this.ReadPostData();
                EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
                VisitDbContext visitDbContext = new VisitDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqType == "addNewERPatient")
                {


                    using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(ipStr);
                            bool selectedFromExistingPat = Convert.ToBoolean(this.ReadQueryStringData("selectedFromExisting"));
                            int latestEmergencyUniqueNumber = GetLatestERPatientNum(connString);

                            //sud:10Apr'19--To centralize patient number and Patient code logic.
                            NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);


                            //var maxPatNo = erDbContext.Patient.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                            //int patNum = maxPatNo.Value + 1;

                            //int patNum = newPatientNumber.PatientNo;
                            DepartmentModel dept = new DepartmentModel();

                            if (!String.IsNullOrEmpty(emergencyPatient.DefaultDepartmentName))
                            {
                                dept = erDbContext.Departments.Where(d => d.DepartmentName == emergencyPatient.DefaultDepartmentName).FirstOrDefault();
                            }


                            var membership = erDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();

                            PatientModel patient = new PatientModel();
                            bool notExistingInPatTable = !selectedFromExistingPat && (emergencyPatient.PatientId == null || emergencyPatient.PatientId == 0);

                            //Get Default ER doctor Name
                            ERParamClass erParam = new ERParamClass();
                            erParam.DepartmentName = "EMERGENCY/CASUALTY";
                            erParam.ERDutyDoctorFirstName = "Duty";

                            var ERParams = (from cfg in erDbContext.AdminParameters
                                                 where cfg.ParameterGroupName.ToLower() == "emergency"
                                                 && (cfg.ParameterName == "ERDepartmentAndDutyDoctor" || cfg.ParameterName == "AddProvisionalToBillingOnRegistration")
                                                 select cfg).ToList();

                            string ERParamStr = ERParams.Where(p => p.ParameterName == "ERDepartmentAndDutyDoctor").Select(ep => ep.ParameterValue).FirstOrDefault();
                            string EnableProvRegistration = ERParams.Where(p => p.ParameterName == "AddProvisionalToBillingOnRegistration").Select(ep => ep.ParameterValue).FirstOrDefault();

                            if (ERParamStr != null)
                            {
                                erParam = DanpheJSONConvert.DeserializeObject<ERParamClass>(ERParamStr);
                            }


                            string departmentName = erParam.DepartmentName;
                            DepartmentModel department = (from dpt in erDbContext.Departments
                                                          where dpt.DepartmentName == departmentName
                                                          select dpt).FirstOrDefault();

                            if (department != null)
                            {
                                EmployeeModel employee = (from emp in erDbContext.Employee
                                                          where emp.DepartmentId == department.DepartmentId
                                                          && emp.FirstName == erParam.ERDutyDoctorFirstName
                                                          && emp.IsActive == true
                                                          select emp).FirstOrDefault();
                                if (employee != null)
                                {
                                    emergencyPatient.ProviderId = employee.EmployeeId;
                                    emergencyPatient.ProviderName = employee.LongSignature;
                                }
                            }


                            if (notExistingInPatTable)
                            {
                                if (emergencyPatient.Gender == "Male")
                                {
                                    patient.Salutation = "Mr.";
                                }
                                else
                                {
                                    patient.Salutation = "Ms.";
                                }

                                patient.FirstName = emergencyPatient.FirstName;
                                patient.Age = emergencyPatient.Age;
                                patient.MiddleName = emergencyPatient.MiddleName;
                                patient.LastName = emergencyPatient.LastName;
                                patient.Gender = emergencyPatient.Gender;
                                patient.ShortName = emergencyPatient.FirstName + " " + (String.IsNullOrEmpty(emergencyPatient.MiddleName) ? " " : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName;
                                patient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
                                patient.PhoneNumber = emergencyPatient.ContactNo;
                                patient.Address = emergencyPatient.Address;
                                patient.PatientNo = newPatientNumber.PatientNo;
                                //patient.PatientCode = GetPatientCode(patient.PatientNo.Value);

                                //sud:10Apr'19--To centralize patient number and Patient code logic.
                                patient.PatientCode = newPatientNumber.PatientCode;
                                patient.CountryId = emergencyPatient.CountryId;
                                patient.CountrySubDivisionId = emergencyPatient.CountrySubDivisionId;
                                patient.CreatedBy = currentUser.EmployeeId;
                                patient.MunicipalityId = emergencyPatient.MunicipalityId;
                                patient.CreatedOn = DateTime.Now;
                                patient.IsActive = true;
                                patient.EMPI = PatientBL.CreateEmpi(patient, connString);//need to replace this also with a common logic.

                                patient.MembershipTypeId = membership.MembershipTypeId;

                                erDbContext.Patient.Add(patient);
                                erDbContext.SaveChanges();


                                PatientMembershipModel patMembership = new PatientMembershipModel();

                                List<MembershipTypeModel> allMemberships = erDbContext.MembershipTypes.ToList();
                                MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == patient.MembershipTypeId).FirstOrDefault();


                                patMembership.PatientId = patient.PatientId;
                                patMembership.MembershipTypeId = patient.MembershipTypeId.Value;
                                patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                                int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                                patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                                patMembership.CreatedBy = currentUser.EmployeeId;
                                patMembership.CreatedOn = System.DateTime.Now;
                                patMembership.IsActive = true;

                                erDbContext.PatientMemberships.Add(patMembership);
                                erDbContext.SaveChanges();
                            }



                            VisitModel patVisit = new VisitModel();
                            patVisit.PatientId = notExistingInPatTable ? patient.PatientId : (int)emergencyPatient.PatientId;
                            patVisit.ProviderName = emergencyPatient.ProviderName;
                            patVisit.ProviderId = emergencyPatient.ProviderId;
                            patVisit.VisitType = ENUM_VisitType.emergency;// "emergency";
                            patVisit.VisitDate = DateTime.Now.Date;
                            patVisit.VisitTime = DateTime.Now.TimeOfDay;
                            patVisit.VisitDuration = 0;
                            patVisit.IsVisitContinued = false;
                            patVisit.IsSignedVisitSummary = false;
                            patVisit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
                            patVisit.AppointmentType = ENUM_AppointmentType.New;// "New";
                            patVisit.BillingStatus = ENUM_BillingStatus.provisional;// "provisional";
                            patVisit.CreatedBy = currentUser.EmployeeId;
                            patVisit.CreatedOn = DateTime.Now;
                            patVisit.VisitCode = VisitBL.CreateNewPatientVisitCode("emergency", connString);
                            patVisit.IsActive = true;
                            if (dept != null && dept.DepartmentId > 0) { patVisit.DepartmentId = dept.DepartmentId; }
                            erDbContext.Visits.Add(patVisit);
                            erDbContext.SaveChanges();

                            if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
                                && emergencyPatient.ModeOfArrivalName.Trim() != "")
                            {
                                var moaName = emergencyPatient.ModeOfArrivalName.Trim();
                                var existingMoa = (erDbContext.ModeOfArrival.Where(x => x.ModeOfArrivalName.ToLower() == moaName.ToLower())).FirstOrDefault();
                                if (existingMoa == null)
                                {
                                    ModeOfArrival moa = new ModeOfArrival();
                                    moa.IsActive = true;
                                    moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
                                    moa.CreatedBy = currentUser.EmployeeId;
                                    moa.CreatedOn = System.DateTime.Now;
                                    erDbContext.ModeOfArrival.Add(moa);
                                    erDbContext.SaveChanges();
                                    emergencyPatient.ModeOfArrival = moa.ModeOfArrivalId;
                                }
                                else { emergencyPatient.ModeOfArrival = existingMoa.ModeOfArrivalId; }


                            }

                            if (notExistingInPatTable)
                            {
                                emergencyPatient.PatientId = patient.PatientId;
                            }
                            emergencyPatient.PatientVisitId = patVisit.PatientVisitId;
                            emergencyPatient.CreatedBy = currentUser.EmployeeId;
                            emergencyPatient.CreatedOn = DateTime.Now;
                            emergencyPatient.IsActive = true;
                            emergencyPatient.VisitDateTime = DateTime.Now;
                            emergencyPatient.ERStatus = "new";
                            emergencyPatient.ERPatientNumber = latestEmergencyUniqueNumber;
                            emergencyPatient.IsExistingPatient = notExistingInPatTable ? false : true;
                            erDbContext.EmergencyPatient.Add(emergencyPatient);
                            erDbContext.SaveChanges();

                            if (emergencyPatient.MainCase == null)
                            {
                                emergencyPatient.MainCase = 1;
                            }

                            EmergencyPatientCases patCases = new EmergencyPatientCases();
                            patCases.ERPatientId = emergencyPatient.ERPatientId;
                            patCases.MainCase = emergencyPatient.MainCase;
                            patCases.SubCase = emergencyPatient.SubCase;
                            patCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
                            patCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
                            patCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
                            patCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
                            patCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
                            patCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
                            patCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
                            patCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
                            patCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
                            patCases.IsActive = true;
                            patCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
                            patCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
                            patCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
                            patCases.CreatedBy = currentUser.EmployeeId;
                            patCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;
                            patCases.CreatedOn = DateTime.Now;
                            erDbContext.PatientCases.Add(patCases);
                            erDbContext.SaveChanges();



                            if ((EnableProvRegistration != null) && (EnableProvRegistration == "1" || EnableProvRegistration.ToLower() == "true"))
                            {
                                BillingTransactionItemModel billItem = new BillingTransactionItemModel();
                                billItem.PatientId = (int)emergencyPatient.PatientId;
                                billItem.PatientVisitId = emergencyPatient.PatientVisitId;
                                billItem.ServiceDepartmentName = "EMERGENCY";

                                var ServiceDepartmentId = (from srvdpt in erDbContext.ServiceDepartment
                                                           where srvdpt.ServiceDepartmentName.ToLower() == "emergency"
                                                           select srvdpt.ServiceDepartmentId).FirstOrDefault();

                                billItem.ServiceDepartmentId = ServiceDepartmentId;

                                billItem.ItemName = "EMERGENCY REGISTRATION";

                                BillItemPrice BillItemPrice = (from blitm in erDbContext.BillItemPrice
                                                               where blitm.ItemName.ToLower() == "emergency registration"
                                                               && blitm.ServiceDepartmentId == ServiceDepartmentId
                                                               select blitm).FirstOrDefault();
                                billItem.ItemId = BillItemPrice.ItemId;
                                billItem.Price = (double)BillItemPrice.Price;
                                billItem.Quantity = 1;
                                billItem.SubTotal = (double)BillItemPrice.Price;
                                billItem.TotalAmount = (double)BillItemPrice.Price;
                                billItem.DiscountAmount = 0;
                                billItem.DiscountPercent = 0;
                                billItem.Tax = 0;
                                billItem.TaxableAmount = 0;
                                billItem.TaxPercent = 0;
                                billItem.DiscountPercentAgg = 0;
                                billItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
                                billItem.RequisitionDate = System.DateTime.Now;
                                billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
                                billItem.VisitType = ENUM_VisitType.outpatient;// "emergency";
                                billItem.CreatedBy = currentUser.EmployeeId;
                                billItem.CreatedOn = System.DateTime.Now;
                                billItem.CounterDay = System.DateTime.Today;
                                billItem.CounterId = (from counter in erDbContext.BillingCounter
                                                      where counter.CounterType.ToLower() == "emergency"
                                                      select counter.CounterId
                                                      ).FirstOrDefault();
                                erDbContext.BillingTransactionItems.Add(billItem);
                                erDbContext.SaveChanges();
                            }
               
                            emergencyDbContextTransaction.Commit();
                            patVisit.QueueNo = VisitBL.CreateNewPatientQueueNo(visitDbContext, patVisit.PatientVisitId, connString);
                            responseData.Results = emergencyPatient;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            emergencyDbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }
                else if (reqType == "addERDischargeSummary")
                {


                    using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(ipStr);
                            ERDischargeSummary.CreatedBy = currentUser.EmployeeId;
                            ERDischargeSummary.CreatedOn = System.DateTime.Now;

                            erDbContext.DischargeSummary.Add(ERDischargeSummary);
                            erDbContext.SaveChanges();

                            var ERPat = (from pat in erDbContext.EmergencyPatient
                                         where pat.PatientId == ERDischargeSummary.PatientId
                                         && pat.PatientVisitId == ERDischargeSummary.PatientVisitId
                                         select pat).FirstOrDefault();
                            ERPat.ERDischargeSummaryId = ERDischargeSummary.ERDischargeSummaryId;

                            erDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = true;

                            erDbContext.SaveChanges();
                            emergencyDbContextTransaction.Commit();

                            responseData.Status = "OK";
                            responseData.Results = ERDischargeSummary;

                        }
                        catch (Exception ex)
                        {
                            emergencyDbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }

                }
              
               
                else
                {
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        
        [HttpPut]
        public string Put()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                //update Sample in LAB_Requisition
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "updateERPatient")
                {
                    using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

                            PatientModel patient = (from pat in erDbContext.Patient
                                                    where pat.PatientId == emergencyPatient.PatientId
                                                    select pat).FirstOrDefault();

                            if (!emergencyPatient.IsExistingPatient)
                            {
                                patient.FirstName = emergencyPatient.FirstName;
                                patient.MiddleName = emergencyPatient.MiddleName;
                                patient.LastName = emergencyPatient.LastName;
                                patient.ShortName = emergencyPatient.FirstName + " " + (String.IsNullOrEmpty(emergencyPatient.MiddleName) ? " " : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName;
                                patient.PhoneNumber = emergencyPatient.ContactNo;
                                patient.Gender = emergencyPatient.Gender;
                                patient.Age = emergencyPatient.Age;
                                patient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
                            }


                            patient.CountryId = emergencyPatient.CountryId;
                            patient.CountrySubDivisionId = emergencyPatient.CountrySubDivisionId;
                            patient.Address = emergencyPatient.Address;
                            patient.ModifiedBy = currentUser.EmployeeId;
                            patient.ModifiedOn = System.DateTime.Now;

                            if (!emergencyPatient.IsExistingPatient)
                            {
                                erDbContext.Entry(patient).Property(a => a.FirstName).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.MiddleName).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.LastName).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.PhoneNumber).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.Age).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.Gender).IsModified = true;
                                erDbContext.Entry(patient).Property(a => a.DateOfBirth).IsModified = true;
                            }


                            erDbContext.Entry(patient).Property(a => a.CountryId).IsModified = true;
                            erDbContext.Entry(patient).Property(a => a.CountrySubDivisionId).IsModified = true;
                            erDbContext.Entry(patient).Property(a => a.Address).IsModified = true;
                            erDbContext.Entry(patient).Property(a => a.ModifiedBy).IsModified = true;
                            erDbContext.Entry(patient).Property(a => a.ModifiedOn).IsModified = true;


                            if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
                               && emergencyPatient.ModeOfArrivalName.Trim() != "")
                            {
                                ModeOfArrival moa = new ModeOfArrival();
                                moa.IsActive = true;
                                moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
                                moa.CreatedBy = currentUser.EmployeeId;
                                moa.CreatedOn = System.DateTime.Now;
                                erDbContext.ModeOfArrival.Add(moa);
                                erDbContext.SaveChanges();

                                emergencyPatient.ModeOfArrival = moa.ModeOfArrivalId;
                            }



                            EmergencyPatientModel erPatient = erDbContext.EmergencyPatient.Where(erpt => erpt.ERPatientId == emergencyPatient.ERPatientId).FirstOrDefault<EmergencyPatientModel>();

                            erPatient.FirstName = emergencyPatient.FirstName;
                            erPatient.Age = emergencyPatient.Age;
                            erPatient.MiddleName = emergencyPatient.MiddleName;
                            erPatient.LastName = emergencyPatient.LastName;
                            erPatient.Gender = emergencyPatient.Gender;
                            erPatient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
                            erPatient.ContactNo = emergencyPatient.ContactNo;
                            erPatient.CareOfPersonContactNumber = emergencyPatient.CareOfPersonContactNumber;
                            erPatient.CareOfPerson = emergencyPatient.CareOfPerson;
                            erPatient.ConditionOnArrival = emergencyPatient.ConditionOnArrival;
                            erPatient.Case = emergencyPatient.Case;
                            erPatient.ModeOfArrival = emergencyPatient.ModeOfArrival;
                            erPatient.Address = emergencyPatient.Address;
                            erPatient.ReferredBy = emergencyPatient.ReferredBy;
                            erPatient.ReferredTo = emergencyPatient.ReferredTo;
                            erPatient.ModifiedBy = currentUser.EmployeeId;
                            erPatient.IsPoliceCase = emergencyPatient.IsPoliceCase;
                            erPatient.ModifiedOn = System.DateTime.Now;
                            //if(emergencyPatient.ERPatientId == emergencyPatient.PatientCases.ERPatientId)
                            //{

                            //}
                            var prevPatCases = (from patCases in erDbContext.PatientCases
                                                where patCases.ERPatientId == emergencyPatient.ERPatientId
                                                select patCases).FirstOrDefault();

                            if (emergencyPatient.MainCase != 1)
                            {
                                if (prevPatCases != null)
                                {
                                    prevPatCases.ERPatientId = emergencyPatient.ERPatientId;
                                    prevPatCases.MainCase = emergencyPatient.MainCase;
                                    prevPatCases.SubCase = emergencyPatient.SubCase;
                                    prevPatCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
                                    prevPatCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
                                    prevPatCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
                                    prevPatCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
                                    prevPatCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
                                    prevPatCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
                                    prevPatCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
                                    prevPatCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
                                    prevPatCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
                                    prevPatCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
                                    prevPatCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
                                    prevPatCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
                                    prevPatCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;

                                    erDbContext.Entry(prevPatCases).Property(a => a.ERPatientId).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.MainCase).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.SubCase).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingAddress).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingSite).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.DateTimeOfBite).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimal).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.FirstAid).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.FirstAidOthers).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalOthers).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingSiteOthers).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingCountry).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingMunicipality).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
                                    erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalName).IsModified = true;

                                    erDbContext.SaveChanges();

                                }
                                else
                                {
                                    EmergencyPatientCases patCases = new EmergencyPatientCases();
                                    patCases.ERPatientId = emergencyPatient.ERPatientId;
                                    patCases.MainCase = emergencyPatient.MainCase;
                                    patCases.SubCase = emergencyPatient.SubCase;
                                    patCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
                                    patCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
                                    patCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
                                    patCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
                                    patCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
                                    patCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
                                    patCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
                                    patCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
                                    patCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
                                    patCases.IsActive = true;
                                    patCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
                                    patCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
                                    patCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
                                    patCases.CreatedBy = currentUser.EmployeeId;
                                    patCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;
                                    patCases.CreatedOn = DateTime.Now;
                                    erDbContext.PatientCases.Add(patCases);
                                    erDbContext.SaveChanges();
                                }
                            }

                            erDbContext.Entry(erPatient).Property(a => a.FirstName).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.MiddleName).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.LastName).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.Age).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.Gender).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.DateOfBirth).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ContactNo).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.CareOfPersonContactNumber).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.CareOfPerson).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ConditionOnArrival).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.Case).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.Address).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ReferredBy).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ReferredTo).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ModeOfArrival).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ModifiedBy).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.ModifiedOn).IsModified = true;
                            erDbContext.Entry(erPatient).Property(a => a.IsPoliceCase).IsModified = true;

                            erDbContext.SaveChanges();
                            emergencyDbContextTransaction.Commit();
                            emergencyPatient.FullName = (emergencyPatient.FirstName.ToLower().Contains("unknown") ? emergencyPatient.FirstName : emergencyPatient.FirstName + " " + (string.IsNullOrEmpty(emergencyPatient.MiddleName) ? "" : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName);
                            responseData.Results = emergencyPatient;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            emergencyDbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }

                else if (reqType == "updateTriageCode")
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

                    EmergencyPatientModel patToTriage = (from erpat in erDbContext.EmergencyPatient
                                                         where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                         && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                         select erpat
                                                         ).FirstOrDefault();

                    patToTriage.TriageCode = emergencyPatient.TriageCode;
                    patToTriage.TriagedBy = currentUser.EmployeeId;
                    patToTriage.TriagedOn = System.DateTime.Now;
                    patToTriage.ERStatus = "triaged";


                    erDbContext.Entry(patToTriage).Property(p => p.TriageCode).IsModified = true;
                    erDbContext.Entry(patToTriage).Property(p => p.TriagedBy).IsModified = true;
                    erDbContext.Entry(patToTriage).Property(p => p.TriagedOn).IsModified = true;
                    erDbContext.Entry(patToTriage).Property(p => p.ERStatus).IsModified = true;
                    erDbContext.SaveChanges();

                    responseData.Results = patToTriage;
                    responseData.Status = "OK";
                }

                else if (reqType == "updateLama")
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);
                    string actionString = this.ReadQueryStringData("actionString");
                    EmergencyPatientModel patToLeave = (from erpat in erDbContext.EmergencyPatient
                                                        where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                        && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                        select erpat
                                                         ).FirstOrDefault();

                    patToLeave.ERStatus = "finalized";
                    patToLeave.FinalizedRemarks = emergencyPatient.FinalizedRemarks;
                    patToLeave.FinalizedStatus = actionString;
                    patToLeave.FinalizedOn = System.DateTime.Now;
                    patToLeave.FinalizedBy = currentUser.EmployeeId;


                    erDbContext.Entry(patToLeave).Property(p => p.FinalizedBy).IsModified = true;
                    erDbContext.Entry(patToLeave).Property(p => p.FinalizedOn).IsModified = true;
                    erDbContext.Entry(patToLeave).Property(p => p.FinalizedRemarks).IsModified = true;
                    erDbContext.Entry(patToLeave).Property(p => p.FinalizedStatus).IsModified = true;
                    erDbContext.Entry(patToLeave).Property(p => p.ERStatus).IsModified = true;
                    erDbContext.SaveChanges();

                    responseData.Results = patToLeave;
                    responseData.Status = "OK";
                }
                else if (reqType == "undoTriageOfPatient")
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

                    EmergencyPatientModel patToUndoTriage = (from erpat in erDbContext.EmergencyPatient
                                                             where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                             && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                             select erpat
                                                         ).FirstOrDefault();

                    patToUndoTriage.ERStatus = "new";
                    patToUndoTriage.TriageCode = emergencyPatient.FinalizedRemarks;
                    patToUndoTriage.TriagedOn = null;
                    patToUndoTriage.ModifiedBy = currentUser.EmployeeId;
                    patToUndoTriage.ModifiedOn = System.DateTime.Now;



                    erDbContext.Entry(patToUndoTriage).Property(p => p.ERStatus).IsModified = true;
                    erDbContext.Entry(patToUndoTriage).Property(p => p.TriageCode).IsModified = true;
                    erDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedOn).IsModified = true;
                    erDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedBy).IsModified = true;
                    erDbContext.Entry(patToUndoTriage).Property(p => p.TriagedOn).IsModified = true;
                    erDbContext.SaveChanges();

                    responseData.Results = patToUndoTriage;
                    responseData.Status = "OK";
                }
                else if (reqType == "updateProviderData")
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

                    EmergencyPatientModel patToUpdateDoctor = (from erpat in erDbContext.EmergencyPatient
                                                               where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                               && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                               select erpat
                                                         ).FirstOrDefault();

                    VisitModel patVisitToUpdate = (from visit in erDbContext.Visits
                                                   where visit.PatientVisitId == emergencyPatient.PatientVisitId
                                                   && visit.PatientId == emergencyPatient.PatientId
                                                   select visit).FirstOrDefault();

                    patVisitToUpdate.ProviderId = emergencyPatient.ProviderId;
                    patVisitToUpdate.ProviderName = emergencyPatient.ProviderName;
                    patVisitToUpdate.ModifiedBy = currentUser.EmployeeId;
                    patVisitToUpdate.ModifiedOn = System.DateTime.Now;



                    patToUpdateDoctor.ProviderId = emergencyPatient.ProviderId;
                    patToUpdateDoctor.ProviderName = emergencyPatient.ProviderName;
                    patToUpdateDoctor.ModifiedBy = currentUser.EmployeeId;
                    patToUpdateDoctor.ModifiedOn = System.DateTime.Now;


                    erDbContext.Entry(patVisitToUpdate).Property(p => p.ProviderId).IsModified = true;
                    erDbContext.Entry(patVisitToUpdate).Property(p => p.ProviderName).IsModified = true;
                    erDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedOn).IsModified = true;
                    erDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedBy).IsModified = true;

                    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ProviderId).IsModified = true;
                    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ProviderName).IsModified = true;
                    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedOn).IsModified = true;
                    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedBy).IsModified = true;

                    erDbContext.SaveChanges();

                    responseData.Results = patToUpdateDoctor;
                    responseData.Status = "OK";
                }
                else if (reqType == "updateERDischargeSummary")
                {
                    EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(str);

                    var ERPat = (from pat in erDbContext.DischargeSummary
                                 where pat.ERDischargeSummaryId == ERDischargeSummary.ERDischargeSummaryId
                                 select pat).FirstOrDefault();

                    ERPat.ModifiedBy = currentUser.EmployeeId;
                    ERPat.ModifiedOn = System.DateTime.Now;
                    ERPat.Investigations = ERDischargeSummary.Investigations;
                    ERPat.TreatmentInER = ERDischargeSummary.TreatmentInER;
                    ERPat.ChiefComplaints = ERDischargeSummary.ChiefComplaints;
                    ERPat.AdviceOnDischarge = ERDischargeSummary.AdviceOnDischarge;
                    ERPat.OnExamination = ERDischargeSummary.OnExamination;
                    ERPat.ProvisionalDiagnosis = ERDischargeSummary.ProvisionalDiagnosis;
                    ERPat.DischargeType = ERDischargeSummary.DischargeType;
                    ERPat.DoctorName = ERDischargeSummary.DoctorName;
                    ERPat.MedicalOfficer = ERDischargeSummary.MedicalOfficer;

                    erDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = false;
                    erDbContext.Entry(ERPat).Property(p => p.CreatedBy).IsModified = false;
                    erDbContext.Entry(ERPat).Property(p => p.CreatedOn).IsModified = false;
                    erDbContext.Entry(ERPat).Property(p => p.PatientId).IsModified = false;
                    erDbContext.Entry(ERPat).Property(p => p.PatientVisitId).IsModified = false;

                    erDbContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = ERDischargeSummary;
                }
                else
                {
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [Route("DeleteCosentForm")]
        [HttpDelete]

        public IActionResult DeleteFile(int id)
       
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {


                var selectedErPat = erDbContext.Consentform.Where(p => p.FileId == id).FirstOrDefault();
                if (selectedErPat != null)
                {
                    selectedErPat.IsActive = false;
                    selectedErPat.ModifiedOn = System.DateTime.Now;
                    erDbContext.Entry(selectedErPat).Property(a => a.IsActive).IsModified = true;
                    erDbContext.Entry(selectedErPat).Property(a => a.ModifiedBy).IsModified = true;
                    erDbContext.Entry(selectedErPat).Property(a => a.ModifiedOn).IsModified = true;
                    erDbContext.SaveChanges();
                    responseData.Results = selectedErPat;
                    responseData.Status =  "OK";
                }



            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return Ok(responseData);

        }

        public int GetLatestERPatientNum(string connString)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var allERPatList = (from erpat in erDbContext.EmergencyPatient
                                select erpat).ToList();
            int latestPatientNum = allERPatList.Count > 0 ? allERPatList.Max(val => val.ERPatientNumber) + 1 : 1;
            return latestPatientNum;
        }


        public int GetLatestERPatientID(string connString)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var allERPatList = (from erpat in erDbContext.EmergencyPatient
                                select erpat).ToList();
            int latestPatientNum = allERPatList.Count > 0 ? allERPatList.Max(val => val.ERPatientId) + 1 : 1;
            return latestPatientNum;
        }

        public Object GetFinalizedListByStatus(string status, string connString, int selectedCase)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var res = (from erpat in erDbContext.EmergencyPatient
                       join pat in erDbContext.Patient on erpat.PatientId equals pat.PatientId
                       join visit in erDbContext.Visits on erpat.PatientVisitId equals visit.PatientVisitId
                       //join dischargeSum in erDbContext.DischargeSummary on erpat.PatientVisitId equals dischargeSum.PatientVisitId 
                       where erpat.IsActive == true && erpat.ERStatus.ToLower() == "finalized"
                       && (!string.IsNullOrEmpty(erpat.FinalizedStatus) && erpat.FinalizedStatus == status)
                       select new
                       {
                           ERPatientId = erpat.ERPatientId,
                           ERPatientNumber = erpat.ERPatientNumber,
                           PatientId = erpat.PatientId,
                           PatientVisitId = erpat.PatientVisitId,
                           PatientCode = pat.PatientCode,
                           VisitCode = visit.VisitCode,
                           VisitDateTime = erpat.VisitDateTime,
                           AdmittingDoctorId = visit.ProviderId,
                           AdmittingDoctorName = visit.ProviderName,
                           FirstName = erpat.FirstName,
                           MiddleName = erpat.MiddleName,
                           LastName = erpat.LastName,
                           Gender = erpat.Gender,
                           Age = erpat.Age,
                           DateOfBirth = erpat.DateOfBirth,
                           ContactNo = erpat.ContactNo,
                           Address = erpat.Address,
                           ReferredBy = erpat.ReferredBy,
                           ReferredTo = erpat.ReferredTo,
                           Case = erpat.Case,
                           ConditionOnArrival = erpat.ConditionOnArrival,
                           ModeOfArrival = erpat.ModeOfArrival,
                           CareOfPerson = erpat.CareOfPerson,
                           ERStatus = erpat.ERStatus,
                           TriageCode = erpat.TriageCode,
                           TriagedBy = erpat.TriagedBy,
                           TriagedOn = erpat.TriagedOn,
                           CreatedBy = erpat.CreatedBy,
                           CreatedOn = erpat.CreatedOn,
                           ModifiedBy = erpat.ModifiedBy,
                           ModifiedOn = erpat.ModifiedOn,
                           IsActive = erpat.IsActive,
                           FinalizedStatus = erpat.FinalizedStatus,
                           FinalizedRemarks = erpat.FinalizedRemarks,
                           FinalizedBy = erpat.FinalizedBy,
                           FinalizedOn = erpat.FinalizedOn,
                           OldPatientId = erpat.OldPatientId,
                           IsExistingPatient = erpat.IsExistingPatient,
                           FullName = (pat.FirstName.ToLower().Contains("unknown") ? pat.FirstName : pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName),
                           CountryId = pat.CountryId,
                           CountrySubDivisionId = pat.CountrySubDivisionId,
                           //IsSubmitted = dischargeSum.IsSubmitted,
                           ERDischargeSummaryId = erpat.ERDischargeSummaryId,
                           FinalizedByName = (from emrPat in erDbContext.EmergencyPatient
                                              join employee in erDbContext.Employee
                                              on emrPat.TriagedBy equals employee.EmployeeId
                                              where emrPat.ERPatientId == erpat.ERPatientId && emrPat.ERStatus == "finalized"
                                              && (!string.IsNullOrEmpty(erpat.FinalizedStatus) && erpat.FinalizedStatus == status)
                                              select employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName).FirstOrDefault(),
                           PatientCases = (from patCase in erDbContext.PatientCases
                                           where patCase.ERPatientId == erpat.ERPatientId && patCase.IsActive == true
                                           select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault()
                       }).OrderByDescending(p => p.ERPatientId).ToList();

            if (selectedCase == 0)
            {
                res.ToList();
            }
            else
            {
                res = res.Where(p => (p.PatientCases == null) ? false : (p.PatientCases.MainCase == selectedCase)).ToList();
            }

            return res;
        }

        public List<EmergencyTriagedPatientVM> GetTriagePatientsByTriageCode(string triagedCode, string connString, int selectedCase)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var triagedPatByTriageCode = (from erpat in erDbContext.EmergencyPatient
                                          join pat in erDbContext.Patient on erpat.PatientId equals pat.PatientId
                                          join moa in erDbContext.ModeOfArrival on erpat.ModeOfArrival equals moa.ModeOfArrivalId into ModeOfArr
                                          where erpat.IsActive == true && erpat.ERStatus.ToLower() == "triaged" && erpat.TriageCode == triagedCode  
                                          && string.IsNullOrEmpty(erpat.FinalizedStatus)
                                          from m in ModeOfArr.DefaultIfEmpty()
                                          select new EmergencyTriagedPatientVM
                                          {
                                              ERPatientId = erpat.ERPatientId,
                                              ERPatientNumber = erpat.ERPatientNumber,
                                              PatientId = erpat.PatientId,
                                              PatientVisitId = erpat.PatientVisitId,
                                              PatientCode = pat.PatientCode,
                                              VisitDateTime = erpat.VisitDateTime,
                                              FirstName = erpat.FirstName,
                                              MiddleName = erpat.MiddleName,
                                              LastName = erpat.LastName,
                                              Gender = erpat.Gender,
                                              Age = erpat.Age,
                                              AgeSex = erpat.Age + "/" + erpat.Gender.Substring(0, 1),
                                              DateOfBirth = erpat.DateOfBirth,
                                              ContactNo = erpat.ContactNo,
                                              Address = erpat.Address,
                                              ReferredBy = erpat.ReferredBy,
                                              ReferredTo = erpat.ReferredTo,
                                              ProviderId = erpat.ProviderId,
                                              ProviderName = erpat.ProviderName,
                                              Case = erpat.Case,
                                              ConditionOnArrival = erpat.ConditionOnArrival,
                                              ModeOfArrivalName = m.ModeOfArrivalName,
                                              ModeOfArrival = m.ModeOfArrivalId,
                                              CareOfPerson = erpat.CareOfPerson,
                                              ERStatus = erpat.ERStatus,
                                              TriageCode = erpat.TriageCode,
                                              TriagedBy = erpat.TriagedBy,
                                              TriagedOn = erpat.TriagedOn,
                                              CreatedBy = erpat.CreatedBy,
                                              CreatedOn = erpat.CreatedOn,
                                              ModifiedBy = erpat.ModifiedBy,
                                              ModifiedOn = erpat.ModifiedOn,
                                              IsActive = erpat.IsActive,
                                              OldPatientId = erpat.OldPatientId,
                                              IsExistingPatient = erpat.IsExistingPatient,
                                              FullName = (pat.FirstName.ToLower().Contains("unknown") ? pat.FirstName : pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName),
                                              CountryId = pat.CountryId,
                                              CountrySubDivisionId = pat.CountrySubDivisionId,
                                              TriagedByName = (from emrPat in erDbContext.EmergencyPatient
                                                               join employee in erDbContext.Employee
                                                               on emrPat.TriagedBy equals employee.EmployeeId
                                                               where emrPat.ERPatientId == erpat.ERPatientId && emrPat.ERStatus == "triaged"
                                                               select employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName).FirstOrDefault(),
                                              PatientCases = (from patCase in erDbContext.PatientCases
                                                              where patCase.ERPatientId == erpat.ERPatientId && patCase.IsActive == true
                                                              select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault()
                                          }).OrderBy(p => p.ERPatientId).ToList();

            if (selectedCase == 0)
            {
                triagedPatByTriageCode.ToList();
            }
            else
            {
                triagedPatByTriageCode = triagedPatByTriageCode.Where(p => (p.PatientCases == null) ? false : (p.PatientCases.MainCase == selectedCase)).ToList();
            }


            return triagedPatByTriageCode;
        }

        //private string GetPatientCode(int patientNo)
        //{

        //    try
        //    {


        //        CoreDbContext coreDbContext = new CoreDbContext(connString);
        //        ParameterModel parameter = coreDbContext.Parameters
        //            .Where(a => a.ParameterName == "HospitalCode")
        //            .FirstOrDefault<ParameterModel>();
        //        if (parameter != null)
        //        {
        //            JObject paramValue = JObject.Parse(parameter.ParameterValue);
        //            //return (string)paramValue["HospitalCode"] + (patientNo + patNoIncrementValue);
        //            return (string)paramValue["HospitalCode"] + DateTime.Now.ToString("yy") + DateTime.Now.ToString("MM") + String.Format("{0:D6}", patientNo);
        //        }
        //        else
        //        {
        //            throw new Exception("Invalid Paramenter Hospital Code");
        //        }



        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message);
        //    }
        //}
        private string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;

            if (!provider.TryGetContentType(path, out contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
    }

}

