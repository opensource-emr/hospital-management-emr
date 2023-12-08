using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Core.Parameters;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.EmergencyModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.IO;
using System.Linq;

namespace DanpheEMR.Controllers.Emergency
{

    public class EmergencyController : CommonController
    {
        private readonly EmergencyDbContext _emergencyDbContext;
        private readonly CoreDbContext _coreDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly VisitDbContext _visitDbContext;
        public EmergencyController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _emergencyDbContext = new EmergencyDbContext(connString);
            _coreDbContext = new CoreDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _visitDbContext = new VisitDbContext(connString);
        }

        [HttpGet]
        [Route("LatestEmergencyNumberAndModeOfArrival")]
        public IActionResult LatestEmergencyNumberAndModeOfArrival()
        {
            //  //if (reqType == "latestERNumAndModeOfArrival")        
            Func<object> func = () => GetLatestEmergencyNumberAndModeOfArrival();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("EmergencyPatients")]
        public IActionResult EmergencyPatients(int selectedCase)
        {
            // else if (reqType == "allERPatientList")       
            Func<object> func = () => GetEmergencyPatients(selectedCase);
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("TriagedPatients")]
        public IActionResult TriagedPatients(int selectedCase)
        {
            //  else if (reqType == "allTriagedPatientList")      
            Func<object> func = () => GetTriagedPatients(selectedCase);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("LamaPatients")]
        public IActionResult LamaPatients(int selectedCase)
        {
            //  else if (reqType == "allLamaPatientList")     
            Func<object> func = () => GetFinalizedListByStatus("lama", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("ExistingPatients")]
        public IActionResult ExistingPatients(string search)
        {
            //  else if (reqType == "allExistingPatients")    
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_Billing_PatientsListWithVisitinformation",
                new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, _emergencyDbContext);
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("TransferredPatients")]
        public IActionResult TransferredPatients(int selectedCase)
        {
            //  else if (reqType == "allTransferredPatientList")  
            Func<object> func = () => GetFinalizedListByStatus("transferred", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("DischargedPatients")]
        public IActionResult DischargedPatients(int selectedCase)
        {
            //  else if (reqType == "allDischargedPatientList")
            Func<object> func = () => GetFinalizedListByStatus("discharged", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("AdmittedPatients")]
        public IActionResult AdmittedPatients(int selectedCase)
        {
            //  else if (reqType == "allAdmittedPatientList")
            Func<object> func = () => GetFinalizedListByStatus("admitted", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("DeadPatients")]
        public IActionResult DeadPatients(int selectedCase)
        {
            //  else if (reqType == "allDeathPatientList")
            Func<object> func = () => GetFinalizedListByStatus("death", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("DischargeOnRequestPatients")]
        public IActionResult DischargeOnRequestPatients(int selectedCase)
        {
            //  else if (reqType == "allDorPatientList")
            Func<object> func = () => GetFinalizedListByStatus("dor", connString, selectedCase);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Countries")]
        public IActionResult Countries()
        {
            //   else if (reqType == "countryList")
            Func<object> func = () => (from country in _emergencyDbContext.Country
                                       where country.IsActive == true
                                       select country).ToList();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("CountrySubDivisions")]
        public IActionResult CountrySubDivisions(int countryId)
        {
            //  else if (reqType == "GetCountrySubDivision") 
            Func<object> func = () => GetCountrySubDivisions(countryId);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Doctors")]
        public IActionResult Doctors()
        {
            // else if (reqType == "doctor-list")
            Func<object> func = () => (from e in _emergencyDbContext.Employee
                                       where e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true
                                       select e).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("DischargeSummary")]
        public IActionResult DischargeSummary(int patientId, int visitId)
        {
            // else if (reqType == "GetDischargeSummary")
            Func<object> func = () => GetDischargeSummary(patientId, visitId);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("MatchingPatient")]
        public IActionResult FindMatchingPatient(string firstName, string lastName, DateTime dateOfBirth, string phoneNumber)
        {
            // else if (reqType == "findMatchingPatient")
            Func<object> func = () => GetMatchingPatient(firstName, lastName, dateOfBirth, phoneNumber);
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("ConsentForm")]
        public IActionResult ConsentFormhingPatient(int patientId)
        {
            // else if (reqType == "GetUploadedConsentForm")
            Func<object> func = () => GetConsentForm(patientId);
            return InvokeHttpGetFunction(func);

        }
        private object GetConsentForm(int patientId)
        {

            var allFileList = (from consentFile in _emergencyDbContext.Consentform
                               join pat in _emergencyDbContext.Patient on consentFile.PatientId equals pat.PatientId
                               join ER in _emergencyDbContext.EmergencyPatient on consentFile.ERPatientId equals ER.ERPatientId
                               where consentFile.ERPatientId == patientId && consentFile.IsActive == true
                               select new
                               {
                                   ERPatientId = ER.ERPatientId,
                                   FileId = consentFile.FileId,
                                   PatientId = consentFile.PatientId,
                                   ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                   FileType = consentFile.FileType,
                                   FileName = consentFile.FileName,
                                   DisplayName = consentFile.DisplayName,
                                   consentFile.ModifiedOn,
                               }).ToList();
            return allFileList;
        }
        private object GetMatchingPatient(string firstName, string lastName, DateTime dateOfBirth, string phoneNumber)
        {
            if (phoneNumber != null)
            {
                phoneNumber = phoneNumber.Trim();
            }

            var datePlusThree = dateOfBirth.AddYears(4);
            var dateMinusThree = dateOfBirth.AddYears(-4);

            List<object> result = new List<object>();

            var matchingResult = (from pat in _emergencyDbContext.Patient
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
                                      //MembershipTypeId = pat.MembershipTypeId,
                                      Address = pat.Address,
                                      PatientCode = pat.PatientCode,
                                  }
                           ).ToList<object>();
            return matchingResult;
        }
        private object GetDischargeSummary(int patientId, int visitId)
        {
            var DischargeSummaryVM = (from empat in _emergencyDbContext.EmergencyPatient
                                      where empat.PatientId == patientId && empat.PatientVisitId == visitId
                                      select new EmergencyDischargeSummaryVM
                                      {
                                          EmergencyPatient = empat,
                                          DischargeSummary = (from dischargeSum in _emergencyDbContext.DischargeSummary
                                                              where dischargeSum.PatientId == patientId && dischargeSum.PatientVisitId == visitId
                                                              select dischargeSum).FirstOrDefault(),
                                          Vitals = (from vitals in _emergencyDbContext.Vitals
                                                    where vitals.PatientVisitId == visitId
                                                    select vitals).OrderByDescending(v => v.PatientVitalId).FirstOrDefault(),
                                          VisitCode = (from visit in _emergencyDbContext.Visits
                                                       where visit.PatientId == patientId && visit.PatientVisitId == visitId
                                                       select visit.VisitCode).FirstOrDefault(),
                                          LabOrders = (from labReq in _emergencyDbContext.LabRequisitions
                                                       where labReq.PatientId == patientId && labReq.PatientVisitId == visitId
                                                       && (labReq.BillingStatus != "cancelled" || labReq.BillingStatus != "returned")
                                                       && (labReq.OrderStatus == "report-generated" || labReq.OrderStatus == "result-added")
                                                       select labReq.LabTestName).Distinct().ToList(),
                                          ImagingOrders = (from imagingReq in _emergencyDbContext.ImagingRequisitions
                                                           where imagingReq.PatientId == patientId && imagingReq.PatientVisitId == visitId
                                                           && (imagingReq.BillingStatus != "cancelled" || imagingReq.BillingStatus != "returned")
                                                           select imagingReq.ImagingItemName).ToList()
                                      }
                                    ).FirstOrDefault();

            DischargeSummaryVM.EmergencyPatient.PatientCode = (from pat in _emergencyDbContext.Patient
                                                               where pat.PatientId == patientId
                                                               select pat.PatientCode).FirstOrDefault();
            return DischargeSummaryVM;
        }
        private object GetCountrySubDivisions(int countryId)
        {
            List<CountrySubDivisionModel> CountrySubDivision = new List<CountrySubDivisionModel>();
            //if countryId == 0 then bring all the CountrySubDivision from the CountrySubDivision table 
            //else bring accroding to the countryId given
            if (countryId == 0)
            {
                //filtering isactive records only--needs revision: sud 12apr'18
                CountrySubDivision = (from s in _masterDbContext.CountrySubDivision
                                      where s.IsActive == true
                                      select s).ToList();
            }
            else
            {
                //filtering isactive records only--needs revision: sud 12apr'18
                CountrySubDivision = (from SubDivision in _masterDbContext.CountrySubDivision
                                      select SubDivision).Where(s => s.CountryId == countryId && s.IsActive == true).ToList();
            }
            return CountrySubDivision;
        }

        private object GetTriagedPatients(int selectedCase)
        {
            /*var criticalPat = GetTriagePatientsByTriageCode("critical", connString, selectedCase);
            var moderatePat = GetTriagePatientsByTriageCode("moderate", connString, selectedCase);
            var mildPat = GetTriagePatientsByTriageCode("mild", connString, selectedCase);
            var deathPat = GetTriagePatientsByTriageCode("death", connString, selectedCase);*/
            /*var allERTriagedPatients = deathPat.Union(criticalPat).Union(moderatePat).Union(mildPat);*/
            var allERTriagedPatients = _emergencyDbContext.GetDataTableFromStoredProc(selectedCase);
            return allERTriagedPatients;
        }
        private object GetEmergencyPatients(int selectedCase)
        {
            var ervitalB4triage = (from parValue in _coreDbContext.Parameters
                                   where parValue.ParameterGroupName.ToLower() == "emergency" && parValue.ParameterName == "ERAddVitalBeforeTriage"
                                   select parValue.ParameterValue).FirstOrDefault();

            var allERPatients = (from erpat in _emergencyDbContext.EmergencyPatient
                                 join pat in _emergencyDbContext.Patient on erpat.PatientId equals pat.PatientId
                                 join eth in _emergencyDbContext.Ethnicity on pat.EthnicGroup equals eth.EthnicGroup into EthnicityGroup
                                 from ethGroup in EthnicityGroup.DefaultIfEmpty()
                                 join moa in _emergencyDbContext.ModeOfArrival on erpat.ModeOfArrival equals moa.ModeOfArrivalId into ModeOfArr
                                 where erpat.IsActive == true && erpat.ERStatus.ToLower() == "new"
                                 from m in ModeOfArr.DefaultIfEmpty()
                                 join visit in _emergencyDbContext.Visits on erpat.PatientVisitId equals visit.PatientVisitId
                                 join patientSchemeMap in _emergencyDbContext.PatientSchemeMaps on new { visit.PatientId, visit.SchemeId } equals new { patientSchemeMap.PatientId, patientSchemeMap.SchemeId } into PatientSchemeMap
                                 from psm in PatientSchemeMap.DefaultIfEmpty()
                                 join scheme in _emergencyDbContext.Schemes on visit.SchemeId equals scheme.SchemeId
                                 join priceCat in _emergencyDbContext.priceCategories on visit.PriceCategoryId equals priceCat.PriceCategoryId
                                 select new
                                 {
                                     ERPatientId = erpat.ERPatientId,
                                     ERPatientNumber = erpat.ERPatientNumber,
                                     EthnicGroup = ethGroup != null ? ethGroup.EthnicGroup : null,
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
                                     MunicipalityName = (from pat in _emergencyDbContext.Patient
                                                         join mun in _emergencyDbContext.Municipalities on pat.MunicipalityId equals mun.MunicipalityId
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
                                     vitals = (from vit in _emergencyDbContext.Vitals
                                               where vit.PatientVisitId == erpat.PatientVisitId
                                               select vit
                                               ).OrderByDescending(d => d.VitalsTakenOn).FirstOrDefault(),
                                     FullName = (pat.FirstName.ToLower().Contains("unknown") ? pat.FirstName : pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName),
                                     CountryId = pat.CountryId,
                                     CountrySubDivisionId = pat.CountrySubDivisionId,
                                     PatientCases = (from patCase in _emergencyDbContext.PatientCases
                                                     where patCase.ERPatientId == erpat.ERPatientId && patCase.IsActive == true
                                                     select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault(),
                                     uploadedfiles = (from consent in _emergencyDbContext.Consentform
                                                      where consent.ERPatientId == erpat.ERPatientId
                                                      select consent
                                                     //{
                                                     //    ERPatientId=consent.ERPatientId,
                                                     //    PatientId = consent.PatientId,
                                                     //    fileId = consent.FileId,
                                                     //    fileName=consent.FileName,
                                                     //    fileType = consent.FileType,
                                                     ).OrderByDescending(d => d.ERPatientId).FirstOrDefault(),
                                     SchemeId = visit.SchemeId,
                                     PriceCategoryId = visit.PriceCategoryId,
                                     SchemeName = scheme.SchemeName,
                                     PriceCategoryName = priceCat.PriceCategoryName,
                                     WardNo = erpat.WardNo
                                 }).OrderByDescending(p => p.ERPatientId).ToList();

            if (selectedCase == 0)
            {
                allERPatients.ToList();
            }
            else
            {
                allERPatients = allERPatients.Where(p => (p.PatientCases == null) ? false : (p.PatientCases.MainCase == selectedCase)).ToList();
            }
            return allERPatients;

        }
        private object GetLatestEmergencyNumberAndModeOfArrival()
        {
            var latestPatientNum = GetLatestERPatientNum(connString);
            var allModeOfArrivals = _emergencyDbContext.ModeOfArrival.Where(m => m.IsActive == true).ToList();
            var data = new { LatestERPatientNumber = latestPatientNum, AllModeOfArrival = allModeOfArrivals };
            return data;
        }

        //// GET: api/values
        //[HttpGet]
        //public string Get(string reqType, int countryId, string caseId, int FileId,int id, int selectedCase, string search)
        //{

        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
        //        CoreDbContext coreDbContext = new CoreDbContext(connString);

        //if (reqType == "latestERNumAndModeOfArrival")
        //{
        //    var latestPatientNum = GetLatestERPatientNum(connString);
        //    var allModeOfArrivals = erDbContext.ModeOfArrival.Where(m => m.IsActive == true).ToList();
        //    responseData.Results = new { LatestERPatientNumber = latestPatientNum, AllModeOfArrival = allModeOfArrivals };
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allERPatientList")
        //{

        //    var ervitalB4triage = (from parValue in coreDbContext.Parameters
        //                           where parValue.ParameterGroupName.ToLower() == "emergency" && parValue.ParameterName == "ERAddVitalBeforeTriage"
        //                           select parValue.ParameterValue).FirstOrDefault();

        //    var allERPatients = (from erpat in erDbContext.EmergencyPatient
        //                         join pat in erDbContext.Patient on erpat.PatientId equals pat.PatientId
        //                         join moa in erDbContext.ModeOfArrival on erpat.ModeOfArrival equals moa.ModeOfArrivalId into ModeOfArr
        //                         where erpat.IsActive == true && erpat.ERStatus.ToLower() == "new"
        //                         from m in ModeOfArr.DefaultIfEmpty()
        //                         select new
        //                         {
        //                             ERPatientId = erpat.ERPatientId,
        //                             ERPatientNumber = erpat.ERPatientNumber,
        //                             PatientCode = pat.PatientCode,
        //                             PatientId = erpat.PatientId,
        //                             PatientVisitId = erpat.PatientVisitId,
        //                             VisitDateTime = erpat.VisitDateTime,
        //                             FirstName = pat.FirstName,
        //                             MiddleName = pat.MiddleName,
        //                             LastName = pat.LastName,
        //                             Gender = pat.Gender,
        //                             Age = pat.Age,
        //                             DateOfBirth = pat.DateOfBirth,
        //                             ContactNo = pat.PhoneNumber,
        //                             Address = pat.Address,
        //                             MunicipalityId = pat.MunicipalityId,
        //                             MunicipalityName = (from pat in erDbContext.Patient
        //                                                 join mun in erDbContext.Municipalities on pat.MunicipalityId equals mun.MunicipalityId
        //                                                 where pat.PatientId == erpat.PatientId
        //                                                 select mun.MunicipalityName).FirstOrDefault(),
        //                             ReferredBy = erpat.ReferredBy,
        //                             ReferredTo = erpat.ReferredTo,
        //                             Case = erpat.Case,
        //                             ConditionOnArrival = erpat.ConditionOnArrival,
        //                             ModeOfArrival = (int?)m.ModeOfArrivalId,
        //                             ModeOfArrivalName = m.ModeOfArrivalName,
        //                             CareOfPerson = erpat.CareOfPerson,
        //                             ERStatus = erpat.ERStatus,
        //                             TriageCode = erpat.TriageCode,
        //                             TriagedBy = erpat.TriagedBy,
        //                             TriagedOn = erpat.TriagedOn,
        //                             CreatedBy = erpat.CreatedBy,
        //                             CreatedOn = erpat.CreatedOn,
        //                             ModifiedBy = erpat.ModifiedBy,
        //                             ModifiedOn = erpat.ModifiedOn,
        //                             IsActive = erpat.IsActive,
        //                             IsPoliceCase = erpat.IsPoliceCase,
        //                             IsAddVitalBeforeTriage = ervitalB4triage,
        //                             OldPatientId = erpat.OldPatientId,
        //                             IsExistingPatient = erpat.IsExistingPatient,
        //                             vitals = (from vit in erDbContext.Vitals
        //                                       where vit.PatientVisitId == erpat.PatientVisitId
        //                                       select vit
        //                                       ).OrderByDescending(d => d.VitalsTakenOn).FirstOrDefault(),
        //                             FullName = (pat.FirstName.ToLower().Contains("unknown") ? pat.FirstName : pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName),
        //                             CountryId = pat.CountryId,
        //                             CountrySubDivisionId = pat.CountrySubDivisionId,
        //                             PatientCases = (from patCase in erDbContext.PatientCases
        //                                             where patCase.ERPatientId == erpat.ERPatientId && patCase.IsActive == true
        //                                             select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault(),
        //                             uploadedfiles = (from consent in erDbContext.Consentform
        //                                             where consent.ERPatientId == erpat.ERPatientId
        //                                             select consent
        //                                             //{
        //                                             //    ERPatientId=consent.ERPatientId,
        //                                             //    PatientId = consent.PatientId,
        //                                             //    fileId = consent.FileId,
        //                                             //    fileName=consent.FileName,
        //                                             //    fileType = consent.FileType,
        //                                             ).OrderByDescending(d => d.ERPatientId).FirstOrDefault(),
        //                         }).OrderByDescending(p => p.ERPatientId).ToList();

        //    if (selectedCase == 0)
        //    {
        //        allERPatients.ToList();
        //    }
        //    else
        //    {
        //        allERPatients = allERPatients.Where(p => (p.PatientCases == null) ? false : (p.PatientCases.MainCase == selectedCase)).ToList();
        //    }

        //    responseData.Results = allERPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allTriagedPatientList")
        //{

        //    var criticalPat = GetTriagePatientsByTriageCode("critical", connString, selectedCase);
        //    var moderatePat = GetTriagePatientsByTriageCode("moderate", connString, selectedCase);
        //    var mildPat = GetTriagePatientsByTriageCode("mild", connString, selectedCase);
        //    var deathPat = GetTriagePatientsByTriageCode("death", connString, selectedCase);

        //    var allERTriagedPatients = deathPat.Union(criticalPat).Union(moderatePat).Union(mildPat);

        //    responseData.Results = allERTriagedPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allExistingPatients")
        //{
        //    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_Billing_PatientsListWithVisitinformation",
        //    new List<SqlParameter>() { new SqlParameter("@SearchTxt", search) }, erDbContext);
        //    responseData.Results = dt;
        //    responseData.Status = "OK";
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
        //}
        //else if (reqType == "allLamaPatientList")--prem:31st jan No reference in frontend
        //{
        //    var allERlamaPatients = GetFinalizedListByStatus("lama", connString, selectedCase);

        //    responseData.Results = allERlamaPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allTransferredPatientList")
        //{
        //    var allERTransferredPatients = GetFinalizedListByStatus("transferred", connString, selectedCase);

        //    responseData.Results = allERTransferredPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allDischargedPatientList") DischargedPatients
        //{
        //    var allERDischargedPatients = GetFinalizedListByStatus("discharged", connString, selectedCase);

        //    responseData.Results = allERDischargedPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allAdmittedPatientList")
        //{
        //    var allAdmittedPatients = GetFinalizedListByStatus("admitted", connString, selectedCase);
        //    responseData.Results = allAdmittedPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allDeathPatientList")
        //{
        //    var allERDeathPatients = GetFinalizedListByStatus("death", connString, selectedCase);

        //    responseData.Results = allERDeathPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allDorPatientList") DischargeOnRequestPatients
        //{
        //    var allERDeathPatients = GetFinalizedListByStatus("dor", connString, selectedCase);

        //    responseData.Results = allERDeathPatients;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "countryList")
        //{
        //    var allCountries = (from country in erDbContext.Country
        //                        where country.IsActive == true
        //                        select country).ToList();
        //    responseData.Results = allCountries;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "GetCountrySubDivision") 
        //{

        //    MasterDbContext dbMaster = new MasterDbContext(connString);
        //    List<CountrySubDivisionModel> CountrySubDivision = new List<CountrySubDivisionModel>();
        //    //if countryId == 0 then bring all the CountrySubDivision from the CountrySubDivision table 
        //    //else bring accroding to the countryId given
        //    if (countryId == 0)
        //    {
        //        //filtering isactive records only--needs revision: sud 12apr'18
        //        CountrySubDivision = (from s in dbMaster.CountrySubDivision
        //                              where s.IsActive == true
        //                              select s).ToList();
        //    }
        //    else
        //    {
        //        //filtering isactive records only--needs revision: sud 12apr'18
        //        CountrySubDivision = (from SubDivision in dbMaster.CountrySubDivision
        //                              select SubDivision).Where(s => s.CountryId == countryId && s.IsActive == true).ToList();
        //    }

        //    responseData.Results = CountrySubDivision;
        //    responseData.Status = "OK";

        //}
        //else if (reqType == "doctor-list")
        //{
        //    //sud:9Aug'18--isappointmentapplicable field can be taken from employee now.. 
        //    var doctorList = (from e in erDbContext.Employee
        //                      where e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true
        //                      select e).ToList();
        //    responseData.Results = doctorList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "GetDischargeSummary")
        //{
        //    var patientId = Convert.ToInt32(this.ReadQueryStringData("patientId"));
        //    var visitId = Convert.ToInt32(this.ReadQueryStringData("visitId"));

        //    var DischargeSummaryVM = (from empat in erDbContext.EmergencyPatient
        //                              where empat.PatientId == patientId && empat.PatientVisitId == visitId
        //                              select new EmergencyDischargeSummaryVM
        //                              {
        //                                  EmergencyPatient = empat,
        //                                  DischargeSummary = (from dischargeSum in erDbContext.DischargeSummary
        //                                                      where dischargeSum.PatientId == patientId && dischargeSum.PatientVisitId == visitId
        //                                                      select dischargeSum).FirstOrDefault(),
        //                                  Vitals = (from vitals in erDbContext.Vitals
        //                                            where vitals.PatientVisitId == visitId
        //                                            select vitals).OrderByDescending(v => v.PatientVitalId).FirstOrDefault(),
        //                                  VisitCode = (from visit in erDbContext.Visits
        //                                               where visit.PatientId == patientId && visit.PatientVisitId == visitId
        //                                               select visit.VisitCode).FirstOrDefault(),
        //                                  LabOrders = (from labReq in erDbContext.LabRequisitions
        //                                               where labReq.PatientId == patientId && labReq.PatientVisitId == visitId
        //                                               && (labReq.BillingStatus != "cancelled" || labReq.BillingStatus != "returned")
        //                                               && (labReq.OrderStatus == "report-generated" || labReq.OrderStatus == "result-added")
        //                                               select labReq.LabTestName).Distinct().ToList(),
        //                                  ImagingOrders = (from imagingReq in erDbContext.ImagingRequisitions
        //                                                   where imagingReq.PatientId == patientId && imagingReq.PatientVisitId == visitId
        //                                                   && (imagingReq.BillingStatus != "cancelled" || imagingReq.BillingStatus != "returned")
        //                                                   select imagingReq.ImagingItemName).ToList()
        //                              }
        //                        ).FirstOrDefault();

        //    DischargeSummaryVM.EmergencyPatient.PatientCode = (from pat in erDbContext.Patient
        //                                                       where pat.PatientId == patientId
        //                                                       select pat.PatientCode).FirstOrDefault();

        //    responseData.Status = "OK";
        //    responseData.Results = DischargeSummaryVM;
        //}
        //else if (reqType == "findMatchingPatient")
        //{
        //    //firstName,lastName,dateOfBirth,phoneNumber
        //    var firstName = this.ReadQueryStringData("firstName");
        //    var lastName = this.ReadQueryStringData("lastName");
        //    var dateOfBirth = Convert.ToDateTime(this.ReadQueryStringData("dateOfBirth"));
        //    var phoneNumber = this.ReadQueryStringData("phoneNumber");
        //    phoneNumber = phoneNumber.Trim();
        //    var datePlusThree = dateOfBirth.AddYears(4);
        //    var dateMinusThree = dateOfBirth.AddYears(-4);

        //    List<object> result = new List<object>();

        //    result = (from pat in erDbContext.Patient
        //              where ((
        //              (pat.FirstName.ToLower() == firstName.ToLower()) && (pat.LastName.ToLower() == lastName.ToLower())
        //              && (pat.DateOfBirth.Value < datePlusThree) && (pat.DateOfBirth.Value > dateMinusThree)
        //              )
        //              || ((pat.PhoneNumber.Length > 0) ? (pat.PhoneNumber == phoneNumber) : false))
        //              select new
        //              {
        //                  PatientId = pat.PatientId,
        //                  FirstName = pat.FirstName,
        //                  MiddleName = pat.MiddleName,
        //                  LastName = pat.LastName,
        //                  ShortName = pat.ShortName, //short name is required to assign in patientService
        //                  FullName = pat.FirstName + " " + pat.LastName, //This one for comparing the matching patient list only
        //                  Gender = pat.Gender,
        //                  PhoneNumber = pat.PhoneNumber,
        //                  IsDobVerified = pat.IsDobVerified,
        //                  DateOfBirth = pat.DateOfBirth,
        //                  Age = pat.Age,
        //                  CountryId = pat.CountryId,
        //                  CountrySubDivisionId = pat.CountrySubDivisionId,
        //                  MembershipTypeId = pat.MembershipTypeId,
        //                  Address = pat.Address,
        //                  PatientCode = pat.PatientCode,
        //              }
        //                   ).ToList<object>();
        //    responseData.Results = result;
        //    responseData.Status = "OK";
        //}
        //        else if (reqType == "GetUploadedConsentForm")
        //        {
        //            try
        //            {
        //                var allFileList = (from consentFile in erDbContext.Consentform
        //                                   join pat in erDbContext.Patient on consentFile.PatientId equals pat.PatientId
        //                                   join ER in erDbContext.EmergencyPatient on consentFile.ERPatientId equals ER.ERPatientId
        //                                   where consentFile.ERPatientId == id && consentFile.IsActive == true
        //                                   select new
        //                                   {
        //                                       ERPatientId=ER.ERPatientId,
        //                                       FileId = consentFile.FileId,
        //                                       PatientId = consentFile.PatientId,
        //                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
        //                                       FileType = consentFile.FileType,
        //                                       FileName = consentFile.FileName,
        //                                       DisplayName = consentFile.DisplayName,
        //                                       consentFile.ModifiedOn,
        //                                   }).ToList();


        //                responseData.Results = allFileList;
        //                responseData.Status = "OK";
        //                //return Ok(responseData);
        //            }
        //            catch (Exception ex)
        //            {
        //                responseData.Status = "Failed";
        //                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                // return BadRequest(responseData);
        //            }
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

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

        [HttpPost]
        [Route("UploadPatientConsentForm")]
        public IActionResult UploadPatientConsentForm()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

                var files = this.ReadFiles();
                var reportDetails = Request.Form["reportDetails"];
                UploadConsentForm patFileData = DanpheJSONConvert.DeserializeObject<UploadConsentForm>(reportDetails);
                using (var emergencyDbContextTransaction = _emergencyDbContext.Database.BeginTransaction())
                {
                    var parm = _emergencyDbContext.AdminParameters.Where(a => a.ParameterGroupName == "Emergency" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault();
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

                                    _emergencyDbContext.Consentform.Add(patFileData);
                                }

                                _emergencyDbContext.SaveChanges();
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
        [Route("DischargeSummary")]
        public IActionResult DischargeSummary()
        {
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            //    else if (reqType == "addERDischargeSummary")
            Func<object> func = () => AddDischargeSummary(ipStr, currentUser);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("RegisterPatient")]
        public IActionResult RegisterPatient()
        {
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            //    if (reqType == "addNewERPatient")
            Func<object> func = () => AddPatient(currentUser, ipStr);
            return InvokeHttpPostFunction(func);

        }
        private object AddPatient(RbacUser currentUser, string ipStr)
        {
            using (var emergencyDbContextTransaction = _emergencyDbContext.Database.BeginTransaction())
            {
                try
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(ipStr);
                    bool selectedFromExistingPat = Convert.ToBoolean(this.ReadQueryStringData("selectedFromExisting"));
                    int latestEmergencyUniqueNumber = GetLatestERPatientNum(connString);

                    //sud:10Apr'19--To centralize patient number and Patient code logic.
                    //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);


                    //var maxPatNo = erDbContext.Patient.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                    //int patNum = maxPatNo.Value + 1;

                    //int patNum = newPatientNumber.PatientNo;
                    DepartmentModel dept = new DepartmentModel();

                    if (!String.IsNullOrEmpty(emergencyPatient.DefaultDepartmentName))
                    {
                        dept = _emergencyDbContext.Departments.Where(d => d.DepartmentName == emergencyPatient.DefaultDepartmentName).FirstOrDefault();
                    }


                    var membership = _emergencyDbContext.Schemes.Where(i => i.SchemeName == "General").FirstOrDefault();

                    PatientModel patient = new PatientModel();
                    bool notExistingInPatTable = !selectedFromExistingPat && (emergencyPatient.PatientId == null || emergencyPatient.PatientId == 0);

                    //Get Default ER doctor Name
                    ERParamClass erParam = new ERParamClass();
                    erParam.DepartmentName = "EMERGENCY/CASUALTY";
                    erParam.ERDutyDoctorFirstName = "Duty";

                    var ERParams = (from cfg in _emergencyDbContext.AdminParameters
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
                    DepartmentModel department = (from dpt in _emergencyDbContext.Departments
                                                  where dpt.DepartmentName == departmentName
                                                  select dpt).FirstOrDefault();

                    if (department != null)
                    {
                        EmployeeModel employee = (from emp in _emergencyDbContext.Employee
                                                  where emp.DepartmentId == department.DepartmentId
                                                  && emp.FirstName == erParam.ERDutyDoctorFirstName
                                                  && emp.IsActive == true
                                                  select emp).FirstOrDefault();
                        if (employee != null)
                        {
                            emergencyPatient.PerformerId = employee.EmployeeId;
                            emergencyPatient.PerformerName = employee.LongSignature;
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
                        //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);

                        patient.FirstName = emergencyPatient.FirstName;
                        patient.Age = emergencyPatient.Age;
                        patient.MiddleName = emergencyPatient.MiddleName;
                        patient.LastName = emergencyPatient.LastName;
                        patient.Gender = emergencyPatient.Gender;
                        patient.ShortName = emergencyPatient.FirstName + " " + (String.IsNullOrEmpty(emergencyPatient.MiddleName) ? " " : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName;
                        patient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
                        patient.PhoneNumber = emergencyPatient.ContactNo;
                        patient.Address = emergencyPatient.Address;
                        //patient.PatientNo = newPatientNumber.PatientNo;
                        //patient.PatientCode = GetPatientCode(patient.PatientNo.Value);

                        //sud:10Apr'19--To centralize patient number and Patient code logic.
                        //patient.PatientCode = newPatientNumber.PatientCode;
                        patient.CountryId = emergencyPatient.CountryId;
                        patient.CountrySubDivisionId = emergencyPatient.CountrySubDivisionId;
                        patient.CreatedBy = currentUser.EmployeeId;
                        patient.MunicipalityId = emergencyPatient.MunicipalityId;
                        patient.CreatedOn = DateTime.Now;
                        patient.IsActive = true;
                        patient.EMPI = PatientBL.CreateEmpi(patient, connString);//need to replace this also with a common logic.
                        patient.PatientScheme = emergencyPatient.PatientScheme;
                        // patient.MembershipTypeId = membership.SchemeId;
                        patient.EthnicGroup = emergencyPatient.EthnicGroup;

                        _emergencyDbContext.Patient.Add(patient);
                        //erDbContext.SaveChanges();
                        patient = CreatePatientWithUniquePatientNum(_emergencyDbContext, patient, connString);//Krishna, 19th,Jul'22, This function is responsible to handle the duplicate PatinetNum issue.


                        //PatientMembershipModel patMembership = new PatientMembershipModel();

                        //List<BillScheme> allMemberships = _emergencyDbContext.Schemes.ToList();
                        //BillScheme currPatMembershipModel = allMemberships.Where(a => a.SchemeId == patient.MembershipTypeId).FirstOrDefault();

                        //patMembership.PatientId = patient.PatientId;
                        //patMembership.MembershipTypeId = patient.MembershipTypeId.Value;
                        //patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                        //int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                        //patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                        //patMembership.CreatedBy = currentUser.EmployeeId;
                        //patMembership.CreatedOn = System.DateTime.Now;
                        //patMembership.IsActive = true;

                        //_emergencyDbContext.PatientMemberships.Add(patMembership);
                        //_emergencyDbContext.SaveChanges();
                    }

                    VisitModel patVisit = new VisitModel();
                    patVisit.PatientId = notExistingInPatTable ? patient.PatientId : (int)emergencyPatient.PatientId;
                    patVisit.PerformerName = emergencyPatient.PerformerName;
                    patVisit.PerformerId = emergencyPatient.PerformerId;
                    patVisit.SchemeId = emergencyPatient.SchemeId;
                    patVisit.PriceCategoryId = emergencyPatient.PriceCategoryId;
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
                    //patVisit.VisitCode = VisitBL.CreateNewPatientVisitCode("emergency", connString);
                    patVisit.IsActive = true;
                    if (dept != null && dept.DepartmentId > 0) { patVisit.DepartmentId = dept.DepartmentId; }
                    _emergencyDbContext.Visits.Add(patVisit);
                    //erDbContext.SaveChanges();
                    patVisit = CreatePatientVisitWithUniqueVisitCode(_emergencyDbContext, patVisit, connString); //Krishna, 19th,Jul, This function is responsible to handle the duplicate visitCode issue.

                    if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
                        && emergencyPatient.ModeOfArrivalName.Trim() != "")
                    {
                        var moaName = emergencyPatient.ModeOfArrivalName.Trim();
                        var existingMoa = (_emergencyDbContext.ModeOfArrival.Where(x => x.ModeOfArrivalName.ToLower() == moaName.ToLower())).FirstOrDefault();
                        if (existingMoa == null)
                        {
                            ModeOfArrival moa = new ModeOfArrival();
                            moa.IsActive = true;
                            moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
                            moa.CreatedBy = currentUser.EmployeeId;
                            moa.CreatedOn = System.DateTime.Now;
                            _emergencyDbContext.ModeOfArrival.Add(moa);
                            _emergencyDbContext.SaveChanges();
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
                    if (emergencyPatient.TriageCode != null && emergencyPatient.TriageCode.Trim() != "")
                    {
                        emergencyPatient.ERStatus = "triaged";
                        emergencyPatient.TriagedBy = currentUser.EmployeeId;
                        emergencyPatient.TriagedOn = System.DateTime.Now;
                    }
                    else
                    {
                        emergencyPatient.ERStatus = "new";
                    }

                    emergencyPatient.ERPatientNumber = latestEmergencyUniqueNumber;
                    emergencyPatient.IsExistingPatient = notExistingInPatTable ? false : true;
                    emergencyPatient.PatientCode = patient.PatientCode;
                    _emergencyDbContext.EmergencyPatient.Add(emergencyPatient);
                    _emergencyDbContext.SaveChanges();

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
                    _emergencyDbContext.PatientCases.Add(patCases);
                    _emergencyDbContext.SaveChanges();

                    BillingTransactionItemModel billItem = new BillingTransactionItemModel();
                    SaveBillingTransaction(currentUser, emergencyPatient, EnableProvRegistration, billItem);

                    SavePatientScheme(_emergencyDbContext, emergencyPatient, patVisit, billItem, currentUser.EmployeeId);

                    emergencyDbContextTransaction.Commit();
                    patVisit.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, patVisit.PatientVisitId, connString);
                    return emergencyPatient;
                }
                catch (Exception ex)
                {
                    emergencyDbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }

        private void SaveBillingTransaction(RbacUser currentUser, EmergencyPatientModel emergencyPatient, string EnableProvRegistration, BillingTransactionItemModel billItem)
        {
            if ((EnableProvRegistration != null) && (EnableProvRegistration == "1" || EnableProvRegistration.ToLower() == "true"))
            {

                billItem.PatientId = (int)emergencyPatient.PatientId;
                billItem.PatientVisitId = emergencyPatient.PatientVisitId;

                var ServiceDepartmentId = (from srvdpt in _emergencyDbContext.ServiceDepartment
                                           where srvdpt.ServiceDepartmentName.ToLower() == "emergency"
                                           select srvdpt.ServiceDepartmentId).FirstOrDefault();

                var emergencyRegistrationServiceItemParameter = (from coreCfg in _emergencyDbContext.AdminParameters
                                                                 where coreCfg.ParameterGroupName == "Emergency" && coreCfg.ParameterName == "ErRegistrationServiceItem"
                                                                 select coreCfg.ParameterValue).FirstOrDefault();
                if (emergencyRegistrationServiceItemParameter == null)
                {
                    throw new Exception("Emergency Registration ServiceItem not found.");
                }
                dynamic registrationServiceItem = JsonConvert.DeserializeObject(emergencyRegistrationServiceItemParameter);
                int ErRegistrationServiceItemId = registrationServiceItem.ErRegistrationServiceItemId;

                var emergencyServiceItem = (from blitm in _emergencyDbContext.BillServiceItems
                                            join priceCatServItem in _emergencyDbContext.BillPriceCategoryServiceItems on blitm.ServiceItemId equals priceCatServItem.ServiceItemId
                                            where blitm.ServiceItemId == ErRegistrationServiceItemId
                                            select new
                                            {
                                                blitm,
                                                Price = priceCatServItem.Price,
                                                ItemName = priceCatServItem.ItemLegalName
                                            }).FirstOrDefault();

                if (emergencyServiceItem != null)
                {
                    var department = (from dept in _emergencyDbContext.ServiceDepartment
                                      where dept.ServiceDepartmentId == emergencyServiceItem.blitm.ServiceDepartmentId
                                      select new
                                      {
                                          ServiceDepartmentId = dept.ServiceDepartmentId,
                                          ServiceDepartmentName = dept.ServiceDepartmentName
                                      }).FirstOrDefault();
                    if (department == null)
                    {
                        throw new Exception("Service Department not found.");
                    }
                    BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                    var ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                    billItem.ServiceDepartmentId = department.ServiceDepartmentId;
                    billItem.ServiceDepartmentName = department.ServiceDepartmentName;
                    billItem.ItemName = emergencyServiceItem.ItemName;
                    billItem.ServiceItemId = emergencyServiceItem.blitm.ServiceItemId;
                    billItem.IntegrationItemId = emergencyServiceItem.blitm.IntegrationItemId;
                    billItem.Price = (double)emergencyServiceItem.Price;
                    billItem.Quantity = 1;
                    billItem.SubTotal = (double)(emergencyServiceItem.Price * 1);
                    billItem.TotalAmount = billItem.SubTotal;
                    billItem.DiscountAmount = 0;
                    billItem.DiscountPercent = 0;
                    billItem.DiscountSchemeId = emergencyPatient.SchemeId;
                    billItem.PriceCategoryId = emergencyPatient.PriceCategoryId;
                    billItem.Tax = 0;
                    billItem.TaxableAmount = 0;
                    billItem.TaxPercent = 0;
                    billItem.DiscountPercentAgg = 0;
                    billItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
                    billItem.RequisitionDate = System.DateTime.Now;
                    billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
                    billItem.VisitType = ENUM_VisitType.outpatient;// "emergency";
                    billItem.CreatedBy = currentUser.EmployeeId;
                    billItem.CreatedOn = DateTime.Now;
                    billItem.CounterDay = DateTime.Today;
                    billItem.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                    billItem.ProvisionalReceiptNo = ProvisionalReceiptNo;
                    billItem.CounterId = (from counter in _emergencyDbContext.BillingCounter
                                          where counter.CounterType.ToLower() == "emergency"
                                          select counter.CounterId
                                          ).FirstOrDefault();
                    billItem.IsAutoBillingItem = false;
                    billItem.IsAutoCalculationStop = false;
                    BillingSchemeModel scheme = _emergencyDbContext.Schemes.FirstOrDefault(a => a.SchemeId == emergencyPatient.SchemeId);
                    if (scheme == null)
                    {
                        throw new Exception("Scheme Not Found.");
                    }
                    if (scheme.IsOpBillCreditApplicable == true && scheme.IsBillingCoPayment == true)
                    {
                        var ServiceItemSchemeSettings = (from mapSchemeItem in _emergencyDbContext.ServiceItemSchemeSettings
                                                         where mapSchemeItem.SchemeId == emergencyPatient.SchemeId && mapSchemeItem.ServiceItemId == emergencyServiceItem.blitm.ServiceItemId
                                                         select mapSchemeItem)
                                                         .FirstOrDefault();
                        if (ServiceItemSchemeSettings == null)
                        {
                            throw new Exception("ServiceItemSchemeSettings not found.");
                        }
                        billItem.IsCoPayment = true;
                        billItem.CoPaymentCashAmount = (decimal)(billItem.TotalAmount / 100) * ServiceItemSchemeSettings.CoPaymentCashPercent;
                        billItem.CoPaymentCreditAmount = (decimal)(billItem.TotalAmount / 100) * ServiceItemSchemeSettings.CoPaymentCreditPercent;
                    }

                    _emergencyDbContext.BillingTransactionItems.Add(billItem);
                    _emergencyDbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("Emergency Service Item Not Found.");
                }
            }
        }

        private static void SavePatientScheme(EmergencyDbContext _emergencyDbContext, EmergencyPatientModel emergencyPatient, VisitModel Visit, BillingTransactionItemModel billItem, int currentUserId)
        {
            /* var systemDefaultScheme = _emergencyDbContext.Schemes.FirstOrDefault(a => a.IsSystemDefault == true);*/

            /*if (emergencyPatient.PatientVisitId > 0 && emergencyPatient.SchemeId != systemDefaultScheme.SchemeId)*/
            if (emergencyPatient.PatientVisitId > 0)
            {
                PatientSchemeMapModel patientScheme = new PatientSchemeMapModel();
                var patientSchemeFromClient = emergencyPatient.PatientScheme;
                BillingSchemeModel scheme = _emergencyDbContext.Schemes.FirstOrDefault(a => a.SchemeId == emergencyPatient.SchemeId);
                if (scheme != null)
                {
                    patientScheme = _emergencyDbContext.PatientSchemeMaps.Where(a => a.PatientId == emergencyPatient.PatientId && a.SchemeId == scheme.SchemeId).FirstOrDefault();
                }
                if (patientScheme != null)
                {
                    patientScheme.LatestClaimCode = Visit.ClaimCode;
                    patientScheme.PolicyHolderEmployerID = patientSchemeFromClient.PolicyHolderEmployerID;
                    patientScheme.PolicyHolderEmployerName = patientSchemeFromClient.PolicyHolderEmployerName;
                    if (scheme.IsOpCreditLimited)
                    {
                        patientScheme.OpCreditLimit = patientScheme.OpCreditLimit - (decimal)billItem.TotalAmount;
                    }
                    if (scheme.IsGeneralCreditLimited)
                    {
                        patientScheme.GeneralCreditLimit = patientScheme.GeneralCreditLimit - (decimal)billItem.TotalAmount;
                    }
                    patientScheme.LatestPatientVisitId = Visit.PatientVisitId;
                    patientScheme.ModifiedOn = DateTime.Now;
                    patientScheme.ModifiedBy = currentUserId;

                    _emergencyDbContext.Entry(patientScheme).State = EntityState.Modified;

                    _emergencyDbContext.SaveChanges();
                }
                else
                {
                    patientScheme = patientSchemeFromClient;
                    if (scheme.IsGeneralCreditLimited)
                    {
                        patientScheme.OpCreditLimit = 0;
                        patientScheme.IpCreditLimit = 0;
                        patientScheme.GeneralCreditLimit = patientSchemeFromClient.GeneralCreditLimit - (decimal)billItem.TotalAmount;
                    }
                    else if (scheme.IsOpCreditLimited || scheme.IsIpCreditLimited)
                    {
                        patientScheme.OpCreditLimit = patientSchemeFromClient.OpCreditLimit - (decimal)billItem.TotalAmount;
                        patientScheme.IpCreditLimit = patientScheme.IpCreditLimit;
                        patientScheme.GeneralCreditLimit = 0;
                    }
                    else
                    {
                        patientScheme.OpCreditLimit = 0;
                        patientScheme.IpCreditLimit = 0;
                        patientScheme.GeneralCreditLimit = 0;
                    }
                    patientScheme.PatientId = emergencyPatient.PatientId.Value;
                    patientScheme.PatientCode = emergencyPatient.PatientCode;
                    patientScheme.PolicyNo = emergencyPatient.PatientScheme.PolicyNo != "" ? emergencyPatient.PatientScheme.PolicyNo : null;
                    patientScheme.LatestPatientVisitId = Visit.PatientVisitId;
                    patientScheme.SchemeId = emergencyPatient.SchemeId;
                    patientScheme.PriceCategoryId = emergencyPatient.PriceCategoryId;
                    patientScheme.CreatedOn = DateTime.Now;
                    patientScheme.CreatedBy = currentUserId;
                    patientScheme.IsActive = true;
                    patientScheme.LatestClaimCode = Visit.ClaimCode;
                    patientScheme.SubSchemeId = patientSchemeFromClient.SubSchemeId;

                    _emergencyDbContext.PatientSchemeMaps.Add(patientScheme);
                    _emergencyDbContext.SaveChanges();
                }
            }
        }
        private object AddDischargeSummary(string ipStr, RbacUser currentUser)
        {
            using (var emergencyDbContextTransaction = _emergencyDbContext.Database.BeginTransaction())
            {
                try
                {
                    EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(ipStr);
                    ERDischargeSummary.CreatedBy = currentUser.EmployeeId;
                    ERDischargeSummary.CreatedOn = System.DateTime.Now;
                    _emergencyDbContext.DischargeSummary.Add(ERDischargeSummary);
                    _emergencyDbContext.SaveChanges();

                    var ERPat = (from pat in _emergencyDbContext.EmergencyPatient
                                 where pat.PatientId == ERDischargeSummary.PatientId
                                 && pat.PatientVisitId == ERDischargeSummary.PatientVisitId
                                 select pat).FirstOrDefault();
                    ERPat.ERDischargeSummaryId = ERDischargeSummary.ERDischargeSummaryId;
                    if (ERPat.ERStatus != "finalized")
                    {
                        ERPat.FinalizedBy = currentUser.EmployeeId;
                        ERPat.ERStatus = "finalized";
                        ERPat.FinalizedStatus = "discharged";
                        ERPat.FinalizedOn = System.DateTime.Now;
                        _emergencyDbContext.Entry(ERPat).Property(p => p.FinalizedBy).IsModified = true;
                        _emergencyDbContext.Entry(ERPat).Property(p => p.ERStatus).IsModified = true;
                        _emergencyDbContext.Entry(ERPat).Property(p => p.FinalizedStatus).IsModified = true;
                        _emergencyDbContext.Entry(ERPat).Property(p => p.FinalizedOn).IsModified = true;
                    }

                    _emergencyDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = true;

                    _emergencyDbContext.SaveChanges();
                    emergencyDbContextTransaction.Commit();
                    return ERDischargeSummary;

                }
                catch (Exception ex)
                {
                    emergencyDbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }
        //[HttpPost]
        //public string Post(int id)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        string ipStr = this.ReadPostData();
        //        EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
        //        VisitDbContext visitDbContext = new VisitDbContext(connString);
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //if (reqType == "addNewERPatient")
        //{


        //    using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(ipStr);
        //            bool selectedFromExistingPat = Convert.ToBoolean(this.ReadQueryStringData("selectedFromExisting"));
        //            int latestEmergencyUniqueNumber = GetLatestERPatientNum(connString);

        //            //sud:10Apr'19--To centralize patient number and Patient code logic.
        //            //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);


        //            //var maxPatNo = erDbContext.Patient.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
        //            //int patNum = maxPatNo.Value + 1;

        //            //int patNum = newPatientNumber.PatientNo;
        //            DepartmentModel dept = new DepartmentModel();

        //            if (!String.IsNullOrEmpty(emergencyPatient.DefaultDepartmentName))
        //            {
        //                dept = erDbContext.Departments.Where(d => d.DepartmentName == emergencyPatient.DefaultDepartmentName).FirstOrDefault();
        //            }


        //            var membership = erDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();

        //            PatientModel patient = new PatientModel();
        //            bool notExistingInPatTable = !selectedFromExistingPat && (emergencyPatient.PatientId == null || emergencyPatient.PatientId == 0);

        //            //Get Default ER doctor Name
        //            ERParamClass erParam = new ERParamClass();
        //            erParam.DepartmentName = "EMERGENCY/CASUALTY";
        //            erParam.ERDutyDoctorFirstName = "Duty";

        //            var ERParams = (from cfg in erDbContext.AdminParameters
        //                                 where cfg.ParameterGroupName.ToLower() == "emergency"
        //                                 && (cfg.ParameterName == "ERDepartmentAndDutyDoctor" || cfg.ParameterName == "AddProvisionalToBillingOnRegistration")
        //                                 select cfg).ToList();

        //            string ERParamStr = ERParams.Where(p => p.ParameterName == "ERDepartmentAndDutyDoctor").Select(ep => ep.ParameterValue).FirstOrDefault();
        //            string EnableProvRegistration = ERParams.Where(p => p.ParameterName == "AddProvisionalToBillingOnRegistration").Select(ep => ep.ParameterValue).FirstOrDefault();

        //            if (ERParamStr != null)
        //            {
        //                erParam = DanpheJSONConvert.DeserializeObject<ERParamClass>(ERParamStr);
        //            }


        //            string departmentName = erParam.DepartmentName;
        //            DepartmentModel department = (from dpt in erDbContext.Departments
        //                                          where dpt.DepartmentName == departmentName
        //                                          select dpt).FirstOrDefault();

        //            if (department != null)
        //            {
        //                EmployeeModel employee = (from emp in erDbContext.Employee
        //                                          where emp.DepartmentId == department.DepartmentId
        //                                          && emp.FirstName == erParam.ERDutyDoctorFirstName
        //                                          && emp.IsActive == true
        //                                          select emp).FirstOrDefault();
        //                if (employee != null)
        //                {
        //                    emergencyPatient.PerformerId = employee.EmployeeId;
        //                    emergencyPatient.PerformerName = employee.LongSignature;
        //                }
        //            }


        //            if (notExistingInPatTable)
        //            {
        //                if (emergencyPatient.Gender == "Male")
        //                {
        //                    patient.Salutation = "Mr.";
        //                }
        //                else
        //                {
        //                    patient.Salutation = "Ms.";
        //                }
        //                //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);

        //                patient.FirstName = emergencyPatient.FirstName;
        //                patient.Age = emergencyPatient.Age;
        //                patient.MiddleName = emergencyPatient.MiddleName;
        //                patient.LastName = emergencyPatient.LastName;
        //                patient.Gender = emergencyPatient.Gender;
        //                patient.ShortName = emergencyPatient.FirstName + " " + (String.IsNullOrEmpty(emergencyPatient.MiddleName) ? " " : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName;
        //                patient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
        //                patient.PhoneNumber = emergencyPatient.ContactNo;
        //                patient.Address = emergencyPatient.Address;
        //                //patient.PatientNo = newPatientNumber.PatientNo;
        //                //patient.PatientCode = GetPatientCode(patient.PatientNo.Value);

        //                //sud:10Apr'19--To centralize patient number and Patient code logic.
        //                //patient.PatientCode = newPatientNumber.PatientCode;
        //                patient.CountryId = emergencyPatient.CountryId;
        //                patient.CountrySubDivisionId = emergencyPatient.CountrySubDivisionId;
        //                patient.CreatedBy = currentUser.EmployeeId;
        //                patient.MunicipalityId = emergencyPatient.MunicipalityId;
        //                patient.CreatedOn = DateTime.Now;
        //                patient.IsActive = true;
        //                patient.EMPI = PatientBL.CreateEmpi(patient, connString);//need to replace this also with a common logic.

        //                patient.MembershipTypeId = membership.MembershipTypeId;
        //                patient.EthnicGroup = emergencyPatient.EthnicGroup;

        //                erDbContext.Patient.Add(patient);
        //                //erDbContext.SaveChanges();
        //                patient = CreatePatientWithUniquePatientNum(erDbContext, patient, connString);//Krishna, 19th,Jul'22, This function is responsible to handle the duplicate PatinetNum issue.


        //                PatientMembershipModel patMembership = new PatientMembershipModel();

        //                List<MembershipTypeModel> allMemberships = erDbContext.MembershipTypes.ToList();
        //                MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == patient.MembershipTypeId).FirstOrDefault();


        //                patMembership.PatientId = patient.PatientId;
        //                patMembership.MembershipTypeId = patient.MembershipTypeId.Value;
        //                patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
        //                int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

        //                patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
        //                patMembership.CreatedBy = currentUser.EmployeeId;
        //                patMembership.CreatedOn = System.DateTime.Now;
        //                patMembership.IsActive = true;

        //                erDbContext.PatientMemberships.Add(patMembership);
        //                erDbContext.SaveChanges();
        //            }



        //            VisitModel patVisit = new VisitModel();
        //            patVisit.PatientId = notExistingInPatTable ? patient.PatientId : (int)emergencyPatient.PatientId;
        //            patVisit.PerformerName = emergencyPatient.PerformerName;
        //            patVisit.PerformerId = emergencyPatient.PerformerId;
        //            patVisit.VisitType = ENUM_VisitType.emergency;// "emergency";
        //            patVisit.VisitDate = DateTime.Now.Date;
        //            patVisit.VisitTime = DateTime.Now.TimeOfDay;
        //            patVisit.VisitDuration = 0;
        //            patVisit.IsVisitContinued = false;
        //            patVisit.IsSignedVisitSummary = false;
        //            patVisit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
        //            patVisit.AppointmentType = ENUM_AppointmentType.New;// "New";
        //            patVisit.BillingStatus = ENUM_BillingStatus.provisional;// "provisional";
        //            patVisit.CreatedBy = currentUser.EmployeeId;
        //            patVisit.CreatedOn = DateTime.Now;
        //            //patVisit.VisitCode = VisitBL.CreateNewPatientVisitCode("emergency", connString);
        //            patVisit.IsActive = true;
        //            if (dept != null && dept.DepartmentId > 0) { patVisit.DepartmentId = dept.DepartmentId; }
        //            erDbContext.Visits.Add(patVisit);
        //            //erDbContext.SaveChanges();
        //            patVisit = CreatePatientVisitWithUniqueVisitCode(erDbContext, patVisit, connString); //Krishna, 19th,Jul, This function is responsible to handle the duplicate visitCode issue.

        //            if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
        //                && emergencyPatient.ModeOfArrivalName.Trim() != "")
        //            {
        //                var moaName = emergencyPatient.ModeOfArrivalName.Trim();
        //                var existingMoa = (erDbContext.ModeOfArrival.Where(x => x.ModeOfArrivalName.ToLower() == moaName.ToLower())).FirstOrDefault();
        //                if (existingMoa == null)
        //                {
        //                    ModeOfArrival moa = new ModeOfArrival();
        //                    moa.IsActive = true;
        //                    moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
        //                    moa.CreatedBy = currentUser.EmployeeId;
        //                    moa.CreatedOn = System.DateTime.Now;
        //                    erDbContext.ModeOfArrival.Add(moa);
        //                    erDbContext.SaveChanges();
        //                    emergencyPatient.ModeOfArrival = moa.ModeOfArrivalId;
        //                }
        //                else { emergencyPatient.ModeOfArrival = existingMoa.ModeOfArrivalId; }


        //            }

        //            if (notExistingInPatTable)
        //            {
        //                emergencyPatient.PatientId = patient.PatientId;
        //            }
        //            emergencyPatient.PatientVisitId = patVisit.PatientVisitId;
        //            emergencyPatient.CreatedBy = currentUser.EmployeeId;
        //            emergencyPatient.CreatedOn = DateTime.Now;
        //            emergencyPatient.IsActive = true;
        //            emergencyPatient.VisitDateTime = DateTime.Now;
        //            if (emergencyPatient.TriageCode.Trim() != "")
        //            {
        //                emergencyPatient.ERStatus = "triaged";
        //                emergencyPatient.TriagedBy = currentUser.EmployeeId;
        //                emergencyPatient.TriagedOn = System.DateTime.Now;
        //            }
        //            else
        //            {
        //                emergencyPatient.ERStatus = "new";
        //            }
        //            emergencyPatient.ERPatientNumber = latestEmergencyUniqueNumber;
        //            emergencyPatient.IsExistingPatient = notExistingInPatTable ? false : true;
        //            erDbContext.EmergencyPatient.Add(emergencyPatient);
        //            erDbContext.SaveChanges();

        //            if (emergencyPatient.MainCase == null)
        //            {
        //                emergencyPatient.MainCase = 1;
        //            }

        //            EmergencyPatientCases patCases = new EmergencyPatientCases();
        //            patCases.ERPatientId = emergencyPatient.ERPatientId;
        //            patCases.MainCase = emergencyPatient.MainCase;
        //            patCases.SubCase = emergencyPatient.SubCase;
        //            patCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
        //            patCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
        //            patCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
        //            patCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
        //            patCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
        //            patCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
        //            patCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
        //            patCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
        //            patCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
        //            patCases.IsActive = true;
        //            patCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
        //            patCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
        //            patCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
        //            patCases.CreatedBy = currentUser.EmployeeId;
        //            patCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;
        //            patCases.CreatedOn = DateTime.Now;
        //            erDbContext.PatientCases.Add(patCases);
        //            erDbContext.SaveChanges();



        //            if ((EnableProvRegistration != null) && (EnableProvRegistration == "1" || EnableProvRegistration.ToLower() == "true"))
        //            {
        //                BillingTransactionItemModel billItem = new BillingTransactionItemModel();
        //                billItem.PatientId = (int)emergencyPatient.PatientId;
        //                billItem.PatientVisitId = emergencyPatient.PatientVisitId;
        //                billItem.ServiceDepartmentName = "EMERGENCY";

        //                var ServiceDepartmentId = (from srvdpt in erDbContext.ServiceDepartment
        //                                           where srvdpt.ServiceDepartmentName.ToLower() == "emergency"
        //                                           select srvdpt.ServiceDepartmentId).FirstOrDefault();

        //                billItem.ServiceDepartmentId = ServiceDepartmentId;

        //                billItem.ItemName = "EMERGENCY REGISTRATION";

        //                BillItemPrice BillItemPrice = (from blitm in erDbContext.BillItemPrice
        //                                               where blitm.ItemName.ToLower() == "emergency registration"
        //                                               && blitm.ServiceDepartmentId == ServiceDepartmentId
        //                                               select blitm).FirstOrDefault();
        //                billItem.ItemId = BillItemPrice.ItemId;
        //                billItem.Price = (double)BillItemPrice.Price;
        //                billItem.Quantity = 1;
        //                billItem.SubTotal = (double)BillItemPrice.Price;
        //                billItem.TotalAmount = (double)BillItemPrice.Price;
        //                billItem.DiscountAmount = 0;
        //                billItem.DiscountPercent = 0;
        //                billItem.Tax = 0;
        //                billItem.TaxableAmount = 0;
        //                billItem.TaxPercent = 0;
        //                billItem.DiscountPercentAgg = 0;
        //                billItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
        //                billItem.RequisitionDate = System.DateTime.Now;
        //                billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
        //                billItem.VisitType = ENUM_VisitType.outpatient;// "emergency";
        //                billItem.CreatedBy = currentUser.EmployeeId;
        //                billItem.CreatedOn = System.DateTime.Now;
        //                billItem.CounterDay = System.DateTime.Today;
        //                billItem.CounterId = (from counter in erDbContext.BillingCounter
        //                                      where counter.CounterType.ToLower() == "emergency"
        //                                      select counter.CounterId
        //                                      ).FirstOrDefault();
        //                erDbContext.BillingTransactionItems.Add(billItem);
        //                erDbContext.SaveChanges();
        //            }

        //            emergencyDbContextTransaction.Commit();
        //            patVisit.QueueNo = VisitBL.CreateNewPatientQueueNo(visitDbContext, patVisit.PatientVisitId, connString);
        //            responseData.Results = emergencyPatient;
        //            responseData.Status = "OK";
        //        }
        //        catch (Exception ex)
        //        {
        //            emergencyDbContextTransaction.Rollback();
        //            throw (ex);
        //        }
        //    }
        //}
        //        else if (reqType == "addERDischargeSummary")
        //        {


        //            using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(ipStr);
        //                    ERDischargeSummary.CreatedBy = currentUser.EmployeeId;
        //                    ERDischargeSummary.CreatedOn = System.DateTime.Now;
        //                    erDbContext.DischargeSummary.Add(ERDischargeSummary);
        //                    erDbContext.SaveChanges();

        //                    var ERPat = (from pat in erDbContext.EmergencyPatient
        //                                 where pat.PatientId == ERDischargeSummary.PatientId
        //                                 && pat.PatientVisitId == ERDischargeSummary.PatientVisitId
        //                                 select pat).FirstOrDefault();
        //                    ERPat.ERDischargeSummaryId = ERDischargeSummary.ERDischargeSummaryId;
        //                    if (ERPat.ERStatus != "finalized")
        //                    {
        //                        ERPat.FinalizedBy = currentUser.EmployeeId;
        //                        ERPat.ERStatus = "finalized";
        //                        ERPat.FinalizedStatus = "discharged";
        //                        ERPat.FinalizedOn = System.DateTime.Now;
        //                        erDbContext.Entry(ERPat).Property(p => p.FinalizedBy).IsModified = true;
        //                        erDbContext.Entry(ERPat).Property(p => p.ERStatus).IsModified = true;
        //                        erDbContext.Entry(ERPat).Property(p => p.FinalizedStatus).IsModified = true;
        //                        erDbContext.Entry(ERPat).Property(p => p.FinalizedOn).IsModified = true;
        //                    }

        //                    erDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = true;

        //                    erDbContext.SaveChanges();
        //                    emergencyDbContextTransaction.Commit();

        //                    responseData.Status = "OK";
        //                    responseData.Results = ERDischargeSummary;

        //                }
        //                catch (Exception ex)
        //                {
        //                    emergencyDbContextTransaction.Rollback();
        //                    throw (ex);
        //                }
        //            }

        //        }


        //        else
        //        {
        //            responseData.Status = "Failed";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);

        //}

        private VisitModel CreatePatientVisitWithUniqueVisitCode(EmergencyDbContext erDbContext, VisitModel patVisit, string connString)
        {
            try
            {

                patVisit.VisitCode = VisitBL.CreateNewPatientVisitCode("emergency", connString);
                erDbContext.SaveChanges();
            }
            catch (Exception ex)
            {

                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            CreatePatientVisitWithUniqueVisitCode(erDbContext, patVisit, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }
            return patVisit;
        }

        private PatientModel CreatePatientWithUniquePatientNum(EmergencyDbContext erDbContext, PatientModel patient, string connString)
        {
            try
            {
                NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                patient.PatientNo = newPatientNumber.PatientNo;
                patient.PatientCode = newPatientNumber.PatientCode;
                erDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            CreatePatientWithUniquePatientNum(erDbContext, patient, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }
            return patient;
        }

        [HttpPut]
        [Route("TriagedCode")]
        public IActionResult TriagedCode()
        {
            //  else if (reqType == "updateTriageCode")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => UpdateTriagedCode(currentUser, str);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("LeaveAgainstMedicalAdvice")]
        public IActionResult LeaveAgainstMedicalAdvice(string preferenceType, string ItemId)
        {
            //  else if (reqType == "updateLama") 
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => UpdateLeaveAgainstMedicalAdvice(str, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("UndoTriageOfPatient")]
        public IActionResult UndoTriageOfPatient(string preferenceType, string ItemId)
        {
            // else if (reqType == "undoTriageOfPatient")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => UndoTriageOfPatient(str, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("PerformerDetail")]
        public IActionResult UpdatePerformer()
        {
            // else if (reqType == "updateProviderData")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => updatePerformer(str, currentUser);
            return InvokeHttpPutFunction(func);

        }

        [HttpPut]
        [Route("ERDischargeSummary")]
        public IActionResult UpdateERDischargeSummary()
        {
            //else if (reqType == "updateERDischargeSummary")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => UpdateDischargeSummary(str, currentUser);
            return InvokeHttpPutFunction(func);

        }
        [HttpPut]
        [Route("Patient")]
        public IActionResult updatePatient()
        {
            //else if (reqType == "updateERDischargeSummary")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            Func<object> func = () => updateERPatient(str, currentUser);
            return InvokeHttpPutFunction(func);

        }
        private object UpdateDischargeSummary(string str, RbacUser currentUser)
        {
            EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(str);

            var ERPat = (from pat in _emergencyDbContext.DischargeSummary
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

            _emergencyDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = false;
            _emergencyDbContext.Entry(ERPat).Property(p => p.CreatedBy).IsModified = false;
            _emergencyDbContext.Entry(ERPat).Property(p => p.CreatedOn).IsModified = false;
            _emergencyDbContext.Entry(ERPat).Property(p => p.PatientId).IsModified = false;
            _emergencyDbContext.Entry(ERPat).Property(p => p.PatientVisitId).IsModified = false;

            _emergencyDbContext.SaveChanges();
            return ERPat;
        }
        private object updatePerformer(string str, RbacUser currentUser)
        {
            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

            EmergencyPatientModel patToUpdateDoctor = (from erpat in _emergencyDbContext.EmergencyPatient
                                                       where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                       && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                       select erpat
                                                 ).FirstOrDefault();

            VisitModel patVisitToUpdate = (from visit in _emergencyDbContext.Visits
                                           where visit.PatientVisitId == emergencyPatient.PatientVisitId
                                           && visit.PatientId == emergencyPatient.PatientId
                                           select visit).FirstOrDefault();

            patVisitToUpdate.PerformerId = emergencyPatient.PerformerId;
            patVisitToUpdate.PerformerName = emergencyPatient.PerformerName;
            patVisitToUpdate.ModifiedBy = currentUser.EmployeeId;
            patVisitToUpdate.ModifiedOn = System.DateTime.Now;



            patToUpdateDoctor.PerformerId = emergencyPatient.PerformerId;
            patToUpdateDoctor.PerformerName = emergencyPatient.PerformerName;
            patToUpdateDoctor.ModifiedBy = currentUser.EmployeeId;
            patToUpdateDoctor.ModifiedOn = System.DateTime.Now;


            _emergencyDbContext.Entry(patVisitToUpdate).Property(p => p.PerformerId).IsModified = true;
            _emergencyDbContext.Entry(patVisitToUpdate).Property(p => p.PerformerName).IsModified = true;
            _emergencyDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedOn).IsModified = true;
            _emergencyDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedBy).IsModified = true;

            _emergencyDbContext.Entry(patToUpdateDoctor).Property(p => p.PerformerId).IsModified = true;
            _emergencyDbContext.Entry(patToUpdateDoctor).Property(p => p.PerformerName).IsModified = true;
            _emergencyDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedOn).IsModified = true;
            _emergencyDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedBy).IsModified = true;
            _emergencyDbContext.SaveChanges();
            return patToUpdateDoctor;
        }
        private object UndoTriageOfPatient(string str, RbacUser currentUser)
        {
            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);
            EmergencyPatientModel patToUndoTriage = (from erpat in _emergencyDbContext.EmergencyPatient
                                                     where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                     && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                     select erpat
                                                     ).FirstOrDefault();

            patToUndoTriage.ERStatus = "new";
            patToUndoTriage.TriageCode = emergencyPatient.FinalizedRemarks;
            patToUndoTriage.TriagedOn = null;
            patToUndoTriage.ModifiedBy = currentUser.EmployeeId;
            patToUndoTriage.ModifiedOn = System.DateTime.Now;



            _emergencyDbContext.Entry(patToUndoTriage).Property(p => p.ERStatus).IsModified = true;
            _emergencyDbContext.Entry(patToUndoTriage).Property(p => p.TriageCode).IsModified = true;
            _emergencyDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedOn).IsModified = true;
            _emergencyDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedBy).IsModified = true;
            _emergencyDbContext.Entry(patToUndoTriage).Property(p => p.TriagedOn).IsModified = true;
            _emergencyDbContext.SaveChanges();
            return patToUndoTriage;
        }
        private object UpdateLeaveAgainstMedicalAdvice(string str, RbacUser currentUser)
        {
            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);
            string actionString = this.ReadQueryStringData("actionString");
            EmergencyPatientModel patToLeave = (from erpat in _emergencyDbContext.EmergencyPatient
                                                where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                select erpat
                                                 ).FirstOrDefault();

            patToLeave.ERStatus = "finalized";
            patToLeave.FinalizedRemarks = emergencyPatient.FinalizedRemarks;
            patToLeave.FinalizedStatus = actionString;
            patToLeave.FinalizedOn = System.DateTime.Now;
            patToLeave.FinalizedBy = currentUser.EmployeeId;


            _emergencyDbContext.Entry(patToLeave).Property(p => p.FinalizedBy).IsModified = true;
            _emergencyDbContext.Entry(patToLeave).Property(p => p.FinalizedOn).IsModified = true;
            _emergencyDbContext.Entry(patToLeave).Property(p => p.FinalizedRemarks).IsModified = true;
            _emergencyDbContext.Entry(patToLeave).Property(p => p.FinalizedStatus).IsModified = true;
            _emergencyDbContext.Entry(patToLeave).Property(p => p.ERStatus).IsModified = true;
            _emergencyDbContext.SaveChanges();
            return patToLeave;
        }
        private object UpdateTriagedCode(RbacUser currentUser, string str)
        {
            EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

            EmergencyPatientModel patToTriage = (from erpat in _emergencyDbContext.EmergencyPatient
                                                 where erpat.ERPatientId == emergencyPatient.ERPatientId
                                                 && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
                                                 select erpat
                                                 ).FirstOrDefault();

            patToTriage.TriageCode = emergencyPatient.TriageCode;
            patToTriage.TriagedBy = currentUser.EmployeeId;
            patToTriage.TriagedOn = System.DateTime.Now;
            patToTriage.ERStatus = "triaged";


            _emergencyDbContext.Entry(patToTriage).Property(p => p.TriageCode).IsModified = true;
            _emergencyDbContext.Entry(patToTriage).Property(p => p.TriagedBy).IsModified = true;
            _emergencyDbContext.Entry(patToTriage).Property(p => p.TriagedOn).IsModified = true;
            _emergencyDbContext.Entry(patToTriage).Property(p => p.ERStatus).IsModified = true;
            _emergencyDbContext.SaveChanges();
            return patToTriage;

        }

        private object updateERPatient(string str, RbacUser currentUser)
        {
            using (var emergencyDbContextTransaction = _emergencyDbContext.Database.BeginTransaction())
            {
                try
                {
                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

                    PatientModel patient = (from pat in _emergencyDbContext.Patient
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
                        _emergencyDbContext.Entry(patient).Property(a => a.FirstName).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.MiddleName).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.LastName).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.PhoneNumber).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.Age).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.Gender).IsModified = true;
                        _emergencyDbContext.Entry(patient).Property(a => a.DateOfBirth).IsModified = true;
                    }


                    _emergencyDbContext.Entry(patient).Property(a => a.CountryId).IsModified = true;
                    _emergencyDbContext.Entry(patient).Property(a => a.CountrySubDivisionId).IsModified = true;
                    _emergencyDbContext.Entry(patient).Property(a => a.Address).IsModified = true;
                    _emergencyDbContext.Entry(patient).Property(a => a.ModifiedBy).IsModified = true;
                    _emergencyDbContext.Entry(patient).Property(a => a.ModifiedOn).IsModified = true;


                    if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
                       && emergencyPatient.ModeOfArrivalName.Trim() != "")
                    {
                        ModeOfArrival moa = new ModeOfArrival();
                        moa.IsActive = true;
                        moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
                        moa.CreatedBy = currentUser.EmployeeId;
                        moa.CreatedOn = System.DateTime.Now;
                        _emergencyDbContext.ModeOfArrival.Add(moa);
                        _emergencyDbContext.SaveChanges();

                        emergencyPatient.ModeOfArrival = moa.ModeOfArrivalId;
                    }



                    EmergencyPatientModel erPatient = _emergencyDbContext.EmergencyPatient.Where(erpt => erpt.ERPatientId == emergencyPatient.ERPatientId).FirstOrDefault<EmergencyPatientModel>();

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
                    var prevPatCases = (from patCases in _emergencyDbContext.PatientCases
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

                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.ERPatientId).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.MainCase).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.SubCase).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingAddress).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingSite).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.DateTimeOfBite).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingAnimal).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.FirstAid).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.FirstAidOthers).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalOthers).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingSiteOthers).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingCountry).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingMunicipality).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
                            _emergencyDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalName).IsModified = true;

                            _emergencyDbContext.SaveChanges();

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
                            _emergencyDbContext.PatientCases.Add(patCases);
                            _emergencyDbContext.SaveChanges();
                        }
                    }

                    _emergencyDbContext.Entry(erPatient).Property(a => a.FirstName).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.MiddleName).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.LastName).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.Age).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.Gender).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.DateOfBirth).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ContactNo).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.CareOfPersonContactNumber).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.CareOfPerson).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ConditionOnArrival).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.Case).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.Address).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ReferredBy).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ReferredTo).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ModeOfArrival).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ModifiedBy).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.ModifiedOn).IsModified = true;
                    _emergencyDbContext.Entry(erPatient).Property(a => a.IsPoliceCase).IsModified = true;

                    _emergencyDbContext.SaveChanges();
                    emergencyDbContextTransaction.Commit();
                    emergencyPatient.FullName = (emergencyPatient.FirstName.ToLower().Contains("unknown") ? emergencyPatient.FirstName : emergencyPatient.FirstName + " " + (string.IsNullOrEmpty(emergencyPatient.MiddleName) ? "" : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName);
                    return emergencyPatient;
                }
                catch (Exception ex)
                {
                    emergencyDbContextTransaction.Rollback();
                    throw (ex);
                }

            }
        }
        //[HttpPut]
        //public string Put()
        //{

        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

        //    try
        //    {
        //        //update Sample in LAB_Requisition
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");
        //        EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //        if (reqType == "updateERPatient")
        //        {
        //            using (var emergencyDbContextTransaction = erDbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

        //                    PatientModel patient = (from pat in erDbContext.Patient
        //                                            where pat.PatientId == emergencyPatient.PatientId
        //                                            select pat).FirstOrDefault();

        //                    if (!emergencyPatient.IsExistingPatient)
        //                    {
        //                        patient.FirstName = emergencyPatient.FirstName;
        //                        patient.MiddleName = emergencyPatient.MiddleName;
        //                        patient.LastName = emergencyPatient.LastName;
        //                        patient.ShortName = emergencyPatient.FirstName + " " + (String.IsNullOrEmpty(emergencyPatient.MiddleName) ? " " : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName;
        //                        patient.PhoneNumber = emergencyPatient.ContactNo;
        //                        patient.Gender = emergencyPatient.Gender;
        //                        patient.Age = emergencyPatient.Age;
        //                        patient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
        //                    }


        //                    patient.CountryId = emergencyPatient.CountryId;
        //                    patient.CountrySubDivisionId = emergencyPatient.CountrySubDivisionId;
        //                    patient.Address = emergencyPatient.Address;
        //                    patient.ModifiedBy = currentUser.EmployeeId;
        //                    patient.ModifiedOn = System.DateTime.Now;

        //                    if (!emergencyPatient.IsExistingPatient)
        //                    {
        //                        erDbContext.Entry(patient).Property(a => a.FirstName).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.MiddleName).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.LastName).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.PhoneNumber).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.Age).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.Gender).IsModified = true;
        //                        erDbContext.Entry(patient).Property(a => a.DateOfBirth).IsModified = true;
        //                    }


        //                    erDbContext.Entry(patient).Property(a => a.CountryId).IsModified = true;
        //                    erDbContext.Entry(patient).Property(a => a.CountrySubDivisionId).IsModified = true;
        //                    erDbContext.Entry(patient).Property(a => a.Address).IsModified = true;
        //                    erDbContext.Entry(patient).Property(a => a.ModifiedBy).IsModified = true;
        //                    erDbContext.Entry(patient).Property(a => a.ModifiedOn).IsModified = true;


        //                    if (emergencyPatient.ModeOfArrival == null && emergencyPatient.ModeOfArrivalName != null
        //                       && emergencyPatient.ModeOfArrivalName.Trim() != "")
        //                    {
        //                        ModeOfArrival moa = new ModeOfArrival();
        //                        moa.IsActive = true;
        //                        moa.ModeOfArrivalName = emergencyPatient.ModeOfArrivalName.Trim();
        //                        moa.CreatedBy = currentUser.EmployeeId;
        //                        moa.CreatedOn = System.DateTime.Now;
        //                        erDbContext.ModeOfArrival.Add(moa);
        //                        erDbContext.SaveChanges();

        //                        emergencyPatient.ModeOfArrival = moa.ModeOfArrivalId;
        //                    }



        //                    EmergencyPatientModel erPatient = erDbContext.EmergencyPatient.Where(erpt => erpt.ERPatientId == emergencyPatient.ERPatientId).FirstOrDefault<EmergencyPatientModel>();

        //                    erPatient.FirstName = emergencyPatient.FirstName;
        //                    erPatient.Age = emergencyPatient.Age;
        //                    erPatient.MiddleName = emergencyPatient.MiddleName;
        //                    erPatient.LastName = emergencyPatient.LastName;
        //                    erPatient.Gender = emergencyPatient.Gender;
        //                    erPatient.DateOfBirth = emergencyPatient.DateOfBirth == null ? DateTime.Now.Date : emergencyPatient.DateOfBirth;
        //                    erPatient.ContactNo = emergencyPatient.ContactNo;
        //                    erPatient.CareOfPersonContactNumber = emergencyPatient.CareOfPersonContactNumber;
        //                    erPatient.CareOfPerson = emergencyPatient.CareOfPerson;
        //                    erPatient.ConditionOnArrival = emergencyPatient.ConditionOnArrival;
        //                    erPatient.Case = emergencyPatient.Case;
        //                    erPatient.ModeOfArrival = emergencyPatient.ModeOfArrival;
        //                    erPatient.Address = emergencyPatient.Address;
        //                    erPatient.ReferredBy = emergencyPatient.ReferredBy;
        //                    erPatient.ReferredTo = emergencyPatient.ReferredTo;
        //                    erPatient.ModifiedBy = currentUser.EmployeeId;
        //                    erPatient.IsPoliceCase = emergencyPatient.IsPoliceCase;
        //                    erPatient.ModifiedOn = System.DateTime.Now;
        //                    //if(emergencyPatient.ERPatientId == emergencyPatient.PatientCases.ERPatientId)
        //                    //{

        //                    //}
        //                    var prevPatCases = (from patCases in erDbContext.PatientCases
        //                                        where patCases.ERPatientId == emergencyPatient.ERPatientId
        //                                        select patCases).FirstOrDefault();

        //                    if (emergencyPatient.MainCase != 1)
        //                    {
        //                        if (prevPatCases != null)
        //                        {
        //                            prevPatCases.ERPatientId = emergencyPatient.ERPatientId;
        //                            prevPatCases.MainCase = emergencyPatient.MainCase;
        //                            prevPatCases.SubCase = emergencyPatient.SubCase;
        //                            prevPatCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
        //                            prevPatCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
        //                            prevPatCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
        //                            prevPatCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
        //                            prevPatCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
        //                            prevPatCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
        //                            prevPatCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
        //                            prevPatCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
        //                            prevPatCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
        //                            prevPatCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
        //                            prevPatCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
        //                            prevPatCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
        //                            prevPatCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;

        //                            erDbContext.Entry(prevPatCases).Property(a => a.ERPatientId).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.MainCase).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.SubCase).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingAddress).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingSite).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.DateTimeOfBite).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimal).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.FirstAid).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.FirstAidOthers).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalOthers).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingSiteOthers).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingCountry).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingMunicipality).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.OtherCaseDetails).IsModified = true;
        //                            erDbContext.Entry(prevPatCases).Property(a => a.BitingAnimalName).IsModified = true;

        //                            erDbContext.SaveChanges();

        //                        }
        //                        else
        //                        {
        //                            EmergencyPatientCases patCases = new EmergencyPatientCases();
        //                            patCases.ERPatientId = emergencyPatient.ERPatientId;
        //                            patCases.MainCase = emergencyPatient.MainCase;
        //                            patCases.SubCase = emergencyPatient.SubCase;
        //                            patCases.BitingAddress = emergencyPatient.PatientCases.BitingAddress;
        //                            patCases.OtherCaseDetails = emergencyPatient.PatientCases.OtherCaseDetails;
        //                            patCases.BitingSite = emergencyPatient.PatientCases.BitingSite;
        //                            patCases.DateTimeOfBite = emergencyPatient.PatientCases.DateTimeOfBite;
        //                            patCases.BitingAnimal = emergencyPatient.PatientCases.BitingAnimal;
        //                            patCases.FirstAid = emergencyPatient.PatientCases.FirstAid;
        //                            patCases.FirstAidOthers = emergencyPatient.PatientCases.FirstAidOthers;
        //                            patCases.BitingAnimalOthers = emergencyPatient.PatientCases.BitingAnimalOthers;
        //                            patCases.BitingSiteOthers = emergencyPatient.PatientCases.BitingSiteOthers;
        //                            patCases.IsActive = true;
        //                            patCases.BitingCountry = emergencyPatient.PatientCases.BitingCountry;
        //                            patCases.BitingMunicipality = emergencyPatient.PatientCases.BitingMunicipality;
        //                            patCases.OtherCaseDetails = emergencyPatient.OtherCaseDetails;
        //                            patCases.CreatedBy = currentUser.EmployeeId;
        //                            patCases.BitingAnimalName = emergencyPatient.PatientCases.BitingAnimalName;
        //                            patCases.CreatedOn = DateTime.Now;
        //                            erDbContext.PatientCases.Add(patCases);
        //                            erDbContext.SaveChanges();
        //                        }
        //                    }

        //                    erDbContext.Entry(erPatient).Property(a => a.FirstName).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.MiddleName).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.LastName).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.Age).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.Gender).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.DateOfBirth).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ContactNo).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.CareOfPersonContactNumber).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.CareOfPerson).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ConditionOnArrival).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.Case).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.Address).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ReferredBy).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ReferredTo).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ModeOfArrival).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ModifiedBy).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.ModifiedOn).IsModified = true;
        //                    erDbContext.Entry(erPatient).Property(a => a.IsPoliceCase).IsModified = true;

        //                    erDbContext.SaveChanges();
        //                    emergencyDbContextTransaction.Commit();
        //                    emergencyPatient.FullName = (emergencyPatient.FirstName.ToLower().Contains("unknown") ? emergencyPatient.FirstName : emergencyPatient.FirstName + " " + (string.IsNullOrEmpty(emergencyPatient.MiddleName) ? "" : emergencyPatient.MiddleName + " ") + emergencyPatient.LastName);
        //                    responseData.Results = emergencyPatient;
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    emergencyDbContextTransaction.Rollback();
        //                    throw (ex);
        //                }
        //            }
        //        }

        //else if (reqType == "updateTriageCode")
        //{
        //    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

        //    EmergencyPatientModel patToTriage = (from erpat in erDbContext.EmergencyPatient
        //                                         where erpat.ERPatientId == emergencyPatient.ERPatientId
        //                                         && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
        //                                         select erpat
        //                                         ).FirstOrDefault();

        //    patToTriage.TriageCode = emergencyPatient.TriageCode;
        //    patToTriage.TriagedBy = currentUser.EmployeeId;
        //    patToTriage.TriagedOn = System.DateTime.Now;
        //    patToTriage.ERStatus = "triaged";


        //    erDbContext.Entry(patToTriage).Property(p => p.TriageCode).IsModified = true;
        //    erDbContext.Entry(patToTriage).Property(p => p.TriagedBy).IsModified = true;
        //    erDbContext.Entry(patToTriage).Property(p => p.TriagedOn).IsModified = true;
        //    erDbContext.Entry(patToTriage).Property(p => p.ERStatus).IsModified = true;
        //    erDbContext.SaveChanges();

        //    responseData.Results = patToTriage;
        //    responseData.Status = "OK";
        //}

        //else if (reqType == "updateLama") 
        //{
        //    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);
        //    string actionString = this.ReadQueryStringData("actionString");
        //    EmergencyPatientModel patToLeave = (from erpat in erDbContext.EmergencyPatient
        //                                        where erpat.ERPatientId == emergencyPatient.ERPatientId
        //                                        && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
        //                                        select erpat
        //                                         ).FirstOrDefault();

        //    patToLeave.ERStatus = "finalized";
        //    patToLeave.FinalizedRemarks = emergencyPatient.FinalizedRemarks;
        //    patToLeave.FinalizedStatus = actionString;
        //    patToLeave.FinalizedOn = System.DateTime.Now;
        //    patToLeave.FinalizedBy = currentUser.EmployeeId;


        //    erDbContext.Entry(patToLeave).Property(p => p.FinalizedBy).IsModified = true;
        //    erDbContext.Entry(patToLeave).Property(p => p.FinalizedOn).IsModified = true;
        //    erDbContext.Entry(patToLeave).Property(p => p.FinalizedRemarks).IsModified = true;
        //    erDbContext.Entry(patToLeave).Property(p => p.FinalizedStatus).IsModified = true;
        //    erDbContext.Entry(patToLeave).Property(p => p.ERStatus).IsModified = true;
        //    erDbContext.SaveChanges();

        //    responseData.Results = patToLeave;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "undoTriageOfPatient")
        //{
        //    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

        //    EmergencyPatientModel patToUndoTriage = (from erpat in erDbContext.EmergencyPatient
        //                                             where erpat.ERPatientId == emergencyPatient.ERPatientId
        //                                             && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
        //                                             select erpat
        //                                         ).FirstOrDefault();

        //    patToUndoTriage.ERStatus = "new";
        //    patToUndoTriage.TriageCode = emergencyPatient.FinalizedRemarks;
        //    patToUndoTriage.TriagedOn = null;
        //    patToUndoTriage.ModifiedBy = currentUser.EmployeeId;
        //    patToUndoTriage.ModifiedOn = System.DateTime.Now;



        //    erDbContext.Entry(patToUndoTriage).Property(p => p.ERStatus).IsModified = true;
        //    erDbContext.Entry(patToUndoTriage).Property(p => p.TriageCode).IsModified = true;
        //    erDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedOn).IsModified = true;
        //    erDbContext.Entry(patToUndoTriage).Property(p => p.ModifiedBy).IsModified = true;
        //    erDbContext.Entry(patToUndoTriage).Property(p => p.TriagedOn).IsModified = true;
        //    erDbContext.SaveChanges();

        //    responseData.Results = patToUndoTriage;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "updateProviderData")
        //{
        //    EmergencyPatientModel emergencyPatient = DanpheJSONConvert.DeserializeObject<EmergencyPatientModel>(str);

        //    EmergencyPatientModel patToUpdateDoctor = (from erpat in erDbContext.EmergencyPatient
        //                                               where erpat.ERPatientId == emergencyPatient.ERPatientId
        //                                               && erpat.PatientId == emergencyPatient.PatientId && erpat.PatientVisitId == emergencyPatient.PatientVisitId
        //                                               select erpat
        //                                         ).FirstOrDefault();

        //    VisitModel patVisitToUpdate = (from visit in erDbContext.Visits
        //                                   where visit.PatientVisitId == emergencyPatient.PatientVisitId
        //                                   && visit.PatientId == emergencyPatient.PatientId
        //                                   select visit).FirstOrDefault();

        //    patVisitToUpdate.PerformerId = emergencyPatient.PerformerId;
        //    patVisitToUpdate.PerformerName = emergencyPatient.PerformerName;
        //    patVisitToUpdate.ModifiedBy = currentUser.EmployeeId;
        //    patVisitToUpdate.ModifiedOn = System.DateTime.Now;



        //    patToUpdateDoctor.PerformerId = emergencyPatient.PerformerId;
        //    patToUpdateDoctor.PerformerName = emergencyPatient.PerformerName;
        //    patToUpdateDoctor.ModifiedBy = currentUser.EmployeeId;
        //    patToUpdateDoctor.ModifiedOn = System.DateTime.Now;


        //    erDbContext.Entry(patVisitToUpdate).Property(p => p.PerformerId).IsModified = true;
        //    erDbContext.Entry(patVisitToUpdate).Property(p => p.PerformerName).IsModified = true;
        //    erDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedOn).IsModified = true;
        //    erDbContext.Entry(patVisitToUpdate).Property(p => p.ModifiedBy).IsModified = true;

        //    erDbContext.Entry(patToUpdateDoctor).Property(p => p.PerformerId).IsModified = true;
        //    erDbContext.Entry(patToUpdateDoctor).Property(p => p.PerformerName).IsModified = true;
        //    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedOn).IsModified = true;
        //    erDbContext.Entry(patToUpdateDoctor).Property(p => p.ModifiedBy).IsModified = true;

        //    erDbContext.SaveChanges();

        //    responseData.Results = patToUpdateDoctor;
        //    responseData.Status = "OK";
        //}
        //        else if (reqType == "updateERDischargeSummary")
        //        {
        //            EmergencyDischargeSummaryModel ERDischargeSummary = DanpheJSONConvert.DeserializeObject<EmergencyDischargeSummaryModel>(str);

        //            var ERPat = (from pat in erDbContext.DischargeSummary
        //                         where pat.ERDischargeSummaryId == ERDischargeSummary.ERDischargeSummaryId
        //                         select pat).FirstOrDefault();

        //            ERPat.ModifiedBy = currentUser.EmployeeId;
        //            ERPat.ModifiedOn = System.DateTime.Now;
        //            ERPat.Investigations = ERDischargeSummary.Investigations;
        //            ERPat.TreatmentInER = ERDischargeSummary.TreatmentInER;
        //            ERPat.ChiefComplaints = ERDischargeSummary.ChiefComplaints;
        //            ERPat.AdviceOnDischarge = ERDischargeSummary.AdviceOnDischarge;
        //            ERPat.OnExamination = ERDischargeSummary.OnExamination;
        //            ERPat.ProvisionalDiagnosis = ERDischargeSummary.ProvisionalDiagnosis;
        //            ERPat.DischargeType = ERDischargeSummary.DischargeType;
        //            ERPat.DoctorName = ERDischargeSummary.DoctorName;
        //            ERPat.MedicalOfficer = ERDischargeSummary.MedicalOfficer;

        //            erDbContext.Entry(ERPat).Property(p => p.ERDischargeSummaryId).IsModified = false;
        //            erDbContext.Entry(ERPat).Property(p => p.CreatedBy).IsModified = false;
        //            erDbContext.Entry(ERPat).Property(p => p.CreatedOn).IsModified = false;
        //            erDbContext.Entry(ERPat).Property(p => p.PatientId).IsModified = false;
        //            erDbContext.Entry(ERPat).Property(p => p.PatientVisitId).IsModified = false;

        //            erDbContext.SaveChanges();

        //            responseData.Status = "OK";
        //            responseData.Results = ERDischargeSummary;
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        [HttpPut]
        [Route("CosentForm")]
        public IActionResult UpdateConcentFile(int id)

        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => DeleteConsent(currentUser, id);
            return InvokeHttpPutFunction(func);


        }

        private object DeleteConsent(RbacUser currentUser, int id)
        {

            var selectedErPat = _emergencyDbContext.Consentform.Where(p => p.FileId == id).FirstOrDefault();
            if (selectedErPat != null)
            {
                selectedErPat.IsActive = false;
                selectedErPat.ModifiedBy = currentUser.EmployeeId;
                selectedErPat.ModifiedOn = System.DateTime.Now;
                _emergencyDbContext.Entry(selectedErPat).Property(a => a.IsActive).IsModified = true;
                _emergencyDbContext.Entry(selectedErPat).Property(a => a.ModifiedBy).IsModified = true;
                _emergencyDbContext.Entry(selectedErPat).Property(a => a.ModifiedOn).IsModified = true;
                _emergencyDbContext.SaveChanges();
                return selectedErPat;
            }
            else
            {
                return new ArgumentNullException("Invalid consent Details");
            }
        }
        private int GetLatestERPatientNum(string connString)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var allERPatList = (from erpat in erDbContext.EmergencyPatient
                                select erpat).ToList();
            int latestPatientNum = allERPatList.Count > 0 ? allERPatList.Max(val => val.ERPatientNumber) + 1 : 1;
            return latestPatientNum;
        }


        private int GetLatestERPatientID(string connString)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var allERPatList = (from erpat in erDbContext.EmergencyPatient
                                select erpat).ToList();
            int latestPatientNum = allERPatList.Count > 0 ? allERPatList.Max(val => val.ERPatientId) + 1 : 1;
            return latestPatientNum;
        }

        private Object GetFinalizedListByStatus(string status, string connString, int selectedCase)
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
                           AdmittingDoctorId = visit.PerformerId,
                           AdmittingDoctorName = visit.PerformerName,
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

        /*private List<EmergencyTriagedPatientVM> GetTriagePatientsByTriageCode(string triagedCode, string connString, int selectedCase)
        {
            EmergencyDbContext erDbContext = new EmergencyDbContext(connString);
            var triagedPatByTriageCode = (from erpat in erDbContext.EmergencyPatient
                                          join pat in erDbContext.Patient on erpat.PatientId equals pat.PatientId
                                          join moa in erDbContext.ModeOfArrival on erpat.ModeOfArrival equals moa.ModeOfArrivalId into ModeOfArr
                                          where erpat.IsActive == true && erpat.ERStatus.ToLower() == "triaged" && erpat.TriageCode == triagedCode  
                                          && string.IsNullOrEmpty(erpat.FinalizedStatus)
                                          from m in ModeOfArr.DefaultIfEmpty()
                                          join vis in erDbContext.Visits on erpat.PatientVisitId equals vis.PatientVisitId
                                          *//*join schemeMapPatient in erDbContext.PatientSchemeMaps on vis.PatientVisitId equals schemeMapPatient.LatestPatientVisitId*//*
                                          join schemeMapPatient in erDbContext.PatientSchemeMaps on new { PatientId = vis.PatientId, SchemeId = vis.SchemeId } equals new { PatientId = schemeMapPatient.PatientId, SchemeId = schemeMapPatient.SchemeId } into grp
                                          from patientSchemeMap in grp.DefaultIfEmpty()
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
                                              ProviderId = erpat.PerformerId,
                                              ProviderName = erpat.PerformerName,
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
                                                              select patCase).OrderByDescending(d => d.PatientCaseId).FirstOrDefault(),
                                              SchemeId = patientSchemeMap.SchemeId,
                                              PriceCategoryId = patientSchemeMap.PriceCategoryId
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
        }*/

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

