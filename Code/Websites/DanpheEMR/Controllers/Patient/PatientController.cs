using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using DanpheEMR.CommonTypes;
using RefactorThis.GraphDiff;//for entity-update.
using System.Data.Entity.Core.Objects;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.IO;
using DanpheEMR.Security;
using DanpheEMR.Enums;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//this is the cotroller
namespace DanpheEMR.Controllers
{
    public class PatientController : CommonController
    {
        //patient code will be incremented by below value.
        //default 0//MNK was using 1000.
        int patNoIncrementValue = 0;

        // GET: api/values

        public PatientController(IOptions<MyConfiguration> _config) : base(_config)
        {


        }

        // POST api/values
        /// <summary>
        /// Creates 16 Character UniqueCode based on EMPI logic
        /// </summary>
        /// <param name="obj">Current Patient Object</param>
        /// <returns></returns>
        private string CreateEmpi(PatientModel obj)
        {
            /* EMPI: 16Characters
              1 -3: district  4-9 : DOB(DDMMYY)  10-12: Name Initials(FML) - X if no middle name 13-16 : Random Number
              for eg: Name=Khadka Prasad Oli, District=Kailali, DOB=01-Dec-1990, EMPI= KAI011290KPO8972int districtId = obj.District;*/
            MasterDbContext mstDB = new MasterDbContext(connString);


            string CountrySubDivisionName = (from d in mstDB.CountrySubDivision
                                             where d.CountrySubDivisionId == obj.CountrySubDivisionId
                                             select d.CountrySubDivisionName).First();

            string strCountrySubDivision = CountrySubDivisionName.Substring(0, 3);
            string strFirstName = obj.FirstName.Substring(0, 1);

            //Use 'X' if middlename is not there.
            string strMiddleName = string.IsNullOrEmpty(obj.MiddleName) ? "X" : obj.MiddleName.Substring(0, 1);
            string strLastName = obj.LastName.Substring(0, 1);
            string strdateofbrith = obj.DateOfBirth.Value.ToString("ddMMyy");
            int randomnos = (new Random()).Next(1000, 10000);
            var empi = strCountrySubDivision +
                       strdateofbrith +
                       strFirstName +
                       strMiddleName +
                       strLastName +
                       randomnos;
            obj.EMPI = empi.ToUpper();
            return obj.EMPI;
        }

        ////modified: ashim:25'July2018 Updated as per HAMS requirement YYMM000001 and incremental
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

        //used to get dateofbirth from age.. 
        //Logic: set the DOB as 1st of january of the year calculated by subtracting the age from today.
        ///eg: if age=20, dob will be 1 st January of(2017-20) = 1st Jan 1997   and so on..
        private DateTime GetDobByAge(int age)
        {
            DateTime dob = new DateTime();
            int year = System.DateTime.Now.AddYears(-age).Year;
            dob = new DateTime(year, 1, 1);
            return dob;
        }

        //parameter name has to be same as what we're passing from client side.
        // sir textbox name should have same as the parameter?
        //no the paramter name, querystring parameters are passed as key-value format.

        [HttpGet]
        public string Get(int patientId, string reqType, string firstName, string lastName, string phoneNumber, string Age, string Gender,
            string patientCode, string search, string admitStatus, bool IsInsurance, string IMISCode)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//default status is OK
            try
            {
                PatientDbContext patDbContext = new PatientDbContext(connString);

                if (reqType == "getPatientByID" && patientId != 0)
                {
                    PatientModel returnPatient = new PatientModel();

                    returnPatient = (from pat in patDbContext.Patients
                                     where pat.PatientId == patientId
                                     select pat).Include(a => a.Addresses)
                                        .Include(a => a.Guarantor)
                                        .Include(a => a.Insurances)
                                        .Include(a => a.KinEmergencyContacts)
                                        .Include(a => a.CountrySubDivision)
                                        .Include(p => p.Admissions)
                                        .FirstOrDefault();

                    if (returnPatient != null && returnPatient.Addresses != null && returnPatient.Addresses.Count > 0)
                    {
                        // this is just used to show the name in the client ..
                        foreach (var add in returnPatient.Addresses)
                        {
                            add.CountryName = patDbContext.Countries.Where(c => c.CountryId == add.CountryId)
                                              .FirstOrDefault().CountryName;
                            add.CountrySubDivisionName = patDbContext.CountrySubdivisions.Where(c => c.CountrySubDivisionId == add.CountrySubDivisionId)
                                              .FirstOrDefault().CountrySubDivisionName;

                        }

                    }

                    if (returnPatient != null && returnPatient.Admissions != null && returnPatient.Admissions.Count > 0)
                    {
                        var activeAdmissions = returnPatient.Admissions.Where(adm => adm.AdmissionStatus != "discharged").ToList();
                        returnPatient.Admissions = activeAdmissions;
                    }
                    var membershipDetails = (from pat in patDbContext.Patients
                                             join memType in patDbContext.MembershipTypes
                                             on pat.MembershipTypeId equals memType.MembershipTypeId
                                             where pat.PatientId == patientId
                                             select new
                                             {
                                                 memType.MembershipTypeName,
                                                 memType.DiscountPercent
                                             }).FirstOrDefault();
                    returnPatient.MembershipTypeName = membershipDetails.MembershipTypeName;
                    returnPatient.MembershipDiscountPercent = membershipDetails.DiscountPercent;

                    responseData.Results = returnPatient;
                }

                else if (reqType == "getPatientByCode")
                {
                    if (string.IsNullOrEmpty(patientCode))
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Hospital No is invalid.";
                    }
                    else
                    {
                        PatientModel returnPatient = new PatientModel();

                        returnPatient = (from pat in patDbContext.Patients
                                         where pat.PatientCode == patientCode
                                         select pat)
                                            .FirstOrDefault();
                        responseData.Results = returnPatient;
                    }

                }
                else if (reqType == "getLightPatientByPatId")
                {
                    var result = (from pat in patDbContext.Patients
                                  where pat.PatientId == patientId
                                  select new
                                  {
                                      pat.PatientId,
                                      pat.PatientCode,
                                      ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      pat.FirstName,
                                      pat.MiddleName,
                                      pat.LastName,
                                      pat.Age,
                                      pat.Gender,
                                      pat.PhoneNumber,
                                      pat.DateOfBirth,
                                      pat.Address,
                                      pat.IsOutdoorPat,
                                      pat.CreatedOn,
                                      pat.CountrySubDivisionId,
                                      // pat.CountrySubDivisionName,
                                      pat.PANNumber
                                  }).FirstOrDefault();
                    responseData.Results = result;
                }
                //this is called while loading the patient list for first time.
                else if (reqType == "GetMatchingPatList")
                {

                    List<object> result = new List<object>();

                    result = (from pat in patDbContext.Patients
                                  //.Include("Insurances")
                              join membership in patDbContext.MembershipTypes on pat.MembershipTypeId equals membership.MembershipTypeId
                              //where (pat.FirstName.ToLower() == firstName.ToLower() && pat.LastName.ToLower() == lastName.ToLower())
                              //|| (pat.PhoneNumber == phoneNumber && pat.PhoneNumber != "0")
                              ////if current patient is coming from insurance, then match IMIS code of that patient
                              ////|| (IsInsurance ? (pat.Insurances.FirstOrDefault() != null ? pat.Insurances.FirstOrDefault().IMISCode == IMISCode : false) : false)
                              //|| (pat.FirstName.ToLower() == firstName.ToLower() && pat.LastName.ToLower() == lastName.ToLower()
                              //        && pat.PhoneNumber == phoneNumber && pat.PhoneNumber != "0")

                              where (pat.FirstName.ToLower() == firstName.ToLower() && pat.LastName.ToLower() == lastName.ToLower() && pat.Age.ToLower() == Age.ToLower() && pat.Gender.ToLower() == Gender.ToLower())
                              || (pat.PhoneNumber == phoneNumber && pat.PhoneNumber != "0" && pat.Gender.ToLower() == Gender.ToLower())
                              select new
                              {
                                  PatientId = pat.PatientId,
                                  FirstName = pat.FirstName,
                                  MiddleName = pat.MiddleName,
                                  LastName = pat.LastName,
                                  ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName, //short name is required to assign in patientService
                                  FullName = pat.FirstName + " " + pat.LastName, //This one for comparing the matching patient list only
                                  Gender = pat.Gender,
                                  PhoneNumber = pat.PhoneNumber,
                                  IsDobVerified = pat.IsDobVerified,
                                  DateOfBirth = pat.DateOfBirth,
                                  Age = pat.Age,
                                  CountryId = pat.CountryId,
                                  CountrySubDivisionId = pat.CountrySubDivisionId,
                                  MembershipTypeId = pat.MembershipTypeId,
                                  MembershipTypeName = membership.MembershipTypeName,
                                  MembershipDiscountPercent = membership.DiscountPercent,
                                  Address = pat.Address,
                                  PatientCode = pat.PatientCode,
                              }
                                   ).ToList<object>();
                    responseData.Results = result;
                }
                else if (reqType == "getPatientUplodedDocument")
                {
                    var result = (from patFile in patDbContext.PatientFiles
                                  join pat in patDbContext.Patients on patFile.PatientId equals pat.PatientId
                                  join emp in patDbContext.Employee on patFile.UploadedBy equals emp.EmployeeId
                                  where patFile.PatientId == patientId && patFile.FileType != "profile-pic"
                                  select new
                                  {
                                      PatientFileId = patFile.PatientFileId,
                                      PatientId = patFile.PatientId,
                                      ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      FileType = patFile.FileType,
                                      FileName = patFile.FileName,
                                      Description = patFile.Description,
                                      ROWGUID = patFile.ROWGUID,
                                      FileExtention = patFile.FileExtention,
                                      //FileBinaryData = patFile.FileBinaryData,
                                      patFile.UploadedOn,
                                      UploadedBy = emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                  }).ToList().OrderByDescending(k => k.UploadedOn);
                    responseData.Results = result;
                }
                //else if (reqType == "patientsWithVisitsInfo")
                //{
                //    var allPats = (from pat in patDbContext.Patients.Include("Visits").Include("Admissions")
                //                   join country in patDbContext.CountrySubdivisions
                //                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                //                   where pat.IsActive == true
                //                   select new PatientWithVisitInfoVM
                //                   {
                //                       PatientId = pat.PatientId,
                //                       PatientCode = pat.PatientCode,
                //                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                //                       FirstName = pat.FirstName,
                //                       LastName = pat.LastName,
                //                       MiddleName = pat.MiddleName,
                //                       Age = pat.Age,
                //                       Gender = pat.Gender,
                //                       PhoneNumber = pat.PhoneNumber,
                //                       DateOfBirth = pat.DateOfBirth,
                //                       Address = pat.Address,
                //                       IsOutdoorPat = pat.IsOutdoorPat,
                //                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                //                       CountrySubDivisionId = pat.CountrySubDivisionId,
                //                       CountrySubDivisionName = country.CountrySubDivisionName,
                //                       PANNumber = pat.PANNumber,
                //                       LatestVisits = pat.Visits.OrderByDescending(v => v.PatientVisitId).Take(5).ToList(),
                //                       Admissions = pat.Admissions.Where(adm => adm.AdmissionStatus != "discharged").ToList(),
                //                       IsAdmitted = (from adm in patDbContext.Admissions
                //                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                //                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //ram--> getting IsAdmitted status of patient
                //                   }).OrderByDescending(p => p.PatientId).ToList();

                //    foreach (var patWithVisit in allPats)
                //    {
                //        if (patWithVisit.LatestVisits != null && patWithVisit.LatestVisits.Count > 0)
                //        {
                //            VisitModel patLatestVisit = new VisitModel();
                //            //if patient is admitted, his latest visit will be the Latest Admission.
                //            if (patWithVisit.IsAdmitted)
                //            {
                //                patLatestVisit = (from vis in patWithVisit.LatestVisits
                //                                  join adm in patWithVisit.Admissions
                //                                  on vis.PatientVisitId equals adm.PatientVisitId
                //                                  select vis).FirstOrDefault();
                //            }
                //            else
                //            {
                //                //need visitcount-1 since index runs from 0, whereas count runs from 1.
                //                //we need to take visittype of latest visit.
                //                int visitsCount = patWithVisit.LatestVisits.Count;
                //                patLatestVisit = patWithVisit.LatestVisits.ElementAt(visitsCount - 1);
                //            }

                //            patWithVisit.LatestVisitType = patLatestVisit.VisitType;
                //            patWithVisit.LatestVisitCode = patLatestVisit.VisitCode;
                //            patWithVisit.LatestVisitId = patLatestVisit.PatientVisitId;
                //            patWithVisit.LatestVisitDate = patLatestVisit.VisitDate.Add((System.TimeSpan)patLatestVisit.VisitTime);
                //        }
                //        else
                //        {
                //            patWithVisit.LatestVisitType = "outpatient";//by default it'll be outpatient.
                //        }
                //    }

                //    responseData.Results = allPats;

                //}

                else if (reqType == "patientsWithVisitsInfo")//sud: need to replace existing one with this one .. 14Mar'19
                {

                    // START : Vikas: 2nd Jan 2020 : modify logic for real time search.                    
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    search = search == null ? string.Empty : search.ToLower();
                    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                                   join country in patDbContext.CountrySubdivisions
                                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                                   join countryMain in patDbContext.Countries on country.CountryId equals countryMain.CountryId
                                   join memType in patDbContext.MembershipTypes
                                   on pat.MembershipTypeId equals memType.MembershipTypeId
                                   where pat.IsActive == true && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + " " + pat.Address + " " + pat.PhoneNumber + " " + pat.Address + pat.FirstName + " " + pat.Address + pat.PatientCode).ToLower().Contains(search))
                                   select new
                                   {
                                       PatientId = pat.PatientId,
                                       PatientCode = pat.PatientCode,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       Age = pat.Age,
                                       CountryName = countryMain.CountryName,
                                       Gender = pat.Gender,
                                       PhoneNumber = pat.PhoneNumber,
                                       DateOfBirth = pat.DateOfBirth,
                                       Address = pat.Address,
                                       IsOutdoorPat = pat.IsOutdoorPat,
                                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                                       CountryId = pat.CountryId,
                                       CountrySubDivisionId = pat.CountrySubDivisionId,
                                       CountrySubDivisionName = country.CountrySubDivisionName,
                                       pat.MembershipTypeId,
                                       MembershipTypeName = memType.MembershipTypeName,
                                       MembershipDiscountPercent = memType.DiscountPercent,
                                       PANNumber = pat.PANNumber,
                                       pat.BloodGroup,
                                       DialysisCode = pat.DialysisCode,
                                       IsAdmitted = (from adm in patDbContext.Admissions
                                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true,   //ram--> getting IsAdmitted status of patient                                   
                                                                                                                            //Insurance Details
                                       Insurance = (from ins in patDbContext.Insurances
                                                    join insProvider in patDbContext.InsuranceProviders on ins.InsuranceProviderId equals insProvider.InsuranceProviderId
                                                    where insProvider.InsuranceProviderName == "Government Insurance" && ins.PatientId == pat.PatientId
                                                    select ins.CurrentBalance
                                                    ).FirstOrDefault(),
                                   }).OrderByDescending(p => p.PatientId).AsQueryable();

                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "BillingSearchPatient") == true && search == "")
                    {
                        allPats = allPats.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }
                    var finalResults = allPats.ToList();
                    responseData.Results = finalResults;

                    // END : Vikas: 2nd Jan 2020 : modify logic for real time search.

                    //if (search == null)
                    //{  // Vikas: 17th June 2019 :added real time search.
                    //    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                    //                   join country in patDbContext.CountrySubdivisions
                    //                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId

                    //                   join memType in patDbContext.MembershipTypes
                    //                   on pat.MembershipTypeId equals memType.MembershipTypeId
                    //                   where pat.IsActive == true
                    //                   select new
                    //                   {
                    //                       PatientId = pat.PatientId,
                    //                       PatientCode = pat.PatientCode,
                    //                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                    //                       FirstName = pat.FirstName,
                    //                       LastName = pat.LastName,
                    //                       MiddleName = pat.MiddleName,
                    //                       Age = pat.Age,
                    //                       Gender = pat.Gender,
                    //                       PhoneNumber = pat.PhoneNumber,
                    //                       DateOfBirth = pat.DateOfBirth,
                    //                       Address = pat.Address,
                    //                       IsOutdoorPat = pat.IsOutdoorPat,
                    //                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                    //                       CountryId = pat.CountryId,
                    //                       CountrySubDivisionId = pat.CountrySubDivisionId,
                    //                       CountrySubDivisionName = country.CountrySubDivisionName,
                    //                       pat.MembershipTypeId,
                    //                       MembershipTypeName = memType.MembershipTypeName,
                    //                       MembershipDiscountPercent = memType.DiscountPercent,
                    //                       PANNumber = pat.PANNumber,
                    //                       DialysisCode = pat.DialysisCode,
                    //                       pat.BloodGroup,
                    //                       IsAdmitted = (from adm in patDbContext.Admissions
                    //                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                    //                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //ram--> getting IsAdmitted status of patient                                   

                    //                       //Insurance Details
                    //                       ,
                    //                       Insurance = (from ins in patDbContext.Insurances
                    //                                    join insProvider in patDbContext.InsuranceProviders on ins.InsuranceProviderId equals insProvider.InsuranceProviderId
                    //                                    where insProvider.InsuranceProviderName == "Government Insurance" && ins.PatientId == pat.PatientId
                    //                                    select ins.CurrentBalance
                    //                                    ).FirstOrDefault(),
                    //                   }).OrderByDescending(p => p.PatientId).Take(200).ToList();


                    //    responseData.Results = allPats;
                    //}
                    //else
                    //{

                    //    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                    //                   join country in patDbContext.CountrySubdivisions
                    //                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                    //                   join memType in patDbContext.MembershipTypes
                    //                   on pat.MembershipTypeId equals memType.MembershipTypeId
                    //                   where pat.IsActive == true && pat.IsActive == true && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + " " + pat.Address + " " + pat.PhoneNumber + " " + pat.Address + pat.FirstName + " " + pat.Address + pat.PatientCode).Contains(search))
                    //                   select new
                    //                   {
                    //                       PatientId = pat.PatientId,
                    //                       PatientCode = pat.PatientCode,
                    //                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                    //                       FirstName = pat.FirstName,
                    //                       LastName = pat.LastName,
                    //                       MiddleName = pat.MiddleName,
                    //                       Age = pat.Age,
                    //                       Gender = pat.Gender,
                    //                       PhoneNumber = pat.PhoneNumber,
                    //                       DateOfBirth = pat.DateOfBirth,
                    //                       Address = pat.Address,
                    //                       IsOutdoorPat = pat.IsOutdoorPat,
                    //                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                    //                       CountryId = pat.CountryId,
                    //                       CountrySubDivisionId = pat.CountrySubDivisionId,
                    //                       CountrySubDivisionName = country.CountrySubDivisionName,
                    //                       pat.MembershipTypeId,
                    //                       MembershipTypeName = memType.MembershipTypeName,
                    //                       MembershipDiscountPercent = memType.DiscountPercent,
                    //                       PANNumber = pat.PANNumber,
                    //                       pat.BloodGroup,
                    //                       DialysisCode = pat.DialysisCode,
                    //                       IsAdmitted = (from adm in patDbContext.Admissions
                    //                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                    //                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //ram--> getting IsAdmitted status of patient                                   

                    //                       //Insurance Details
                    //                       ,
                    //                       Insurance = (from ins in patDbContext.Insurances
                    //                                    join insProvider in patDbContext.InsuranceProviders on ins.InsuranceProviderId equals insProvider.InsuranceProviderId
                    //                                    where insProvider.InsuranceProviderName == "Government Insurance" && ins.PatientId == pat.PatientId
                    //                                    select ins.CurrentBalance
                    //                                    ).FirstOrDefault(),
                    //                   }).OrderByDescending(p => p.PatientId).AsQueryable();

                    //    var isSearchApply = true;

                    //    if (isSearchApply == true)
                    //    {
                    //        allPats = allPats.Take(200);
                    //    }
                    //    var data = allPats.ToList();

                    //    //if (admitStatus == "IP")
                    //    //{                           
                    //    //    responseData.Results = allPats.Where(p=>p.IsAdmitted==true).ToList();
                    //    //}
                    //    //else if (admitStatus == "OP")
                    //    //{                           
                    //    //    responseData.Results = allPats.Where(p => p.IsAdmitted == false).ToList();
                    //    //}
                    //    //else {
                    //    responseData.Results = allPats;
                    //    //}
                    //    // allPats.Select(p=>p.IsAdmitted==true).
                    //}
                }
                else if (reqType == "profile-pic")
                {
                    var location = (from dbc in patDbContext.CFGParameters
                                    where dbc.ParameterGroupName.ToLower() == "patient" && dbc.ParameterName == "PatientProfilePicImageUploadLocation"
                                    select dbc.ParameterValue
                                ).FirstOrDefault();

                    PatientFilesModel retFile = patDbContext.PatientFiles
                                               .Where(f => f.PatientId == patientId && f.IsActive == true
                                               && f.FileType == "profile-pic")
                                               .FirstOrDefault();

                    var fileFullPath = location + retFile.FileName;

                    if (retFile != null)
                    {
                        byte[] imageArray = System.IO.File.ReadAllBytes(@fileFullPath);
                        retFile.FileBase64String = Convert.ToBase64String(imageArray);
                    }
                    responseData.Results = retFile;
                    responseData.Status = "OK";

                }
                else if (reqType == "insurance-providers")
                {
                    //declaring variable insuraceProviders of type List<InsuranceProviderModel> and assigning data from the server to it.
                    var insuranceProviders = (from insu in patDbContext.InsuranceProviders
                                              select new
                                              {
                                                  insu.InsuranceProviderId,
                                                  insu.InsuranceProviderName
                                              }).ToList();
                    //assigning result to our response model object and sending it to client side.
                    responseData.Results = insuranceProviders;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-dialysis-code")
                {
                    var lastDialysisCode = (from pat in patDbContext.Patients
                                            select pat.DialysisCode).ToList().Max();
                    if (lastDialysisCode == null)
                    {
                        lastDialysisCode = 0;
                    }
                    responseData.Results = lastDialysisCode;
                    responseData.Status = "OK";
                }
                else if (reqType == "loadHealthCardStatus")
                {
                    BillingDbContext billingDb = new BillingDbContext(connString);
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "BillItemHealthCard").FirstOrDefault();
                    if (parameter != null && parameter.ParameterValue != null)
                    {
                        //JObject paramValue = JObject.Parse(parameter.ParameterValue);
                        //var result = JsonConvert.DeserializeObject<any>(parameter.ParameterValue);

                        //dynamic result = JValue.Parse(parameter.ParameterValue);

                    }
                    var billStatus = billingDb.BillingTransactionItems
                                                       .Where(bItm => bItm.PatientId == patientId && bItm.ItemName == "Health Card"
                                                       && bItm.BillStatus != ENUM_BillingStatus.cancel //"cancel" 
                                                       && ((!bItm.ReturnStatus.HasValue || bItm.ReturnStatus == false)))
                                                       .FirstOrDefault();

                    var CardStatus = patDbContext.PATHealthCard.Where(a => a.PatientId == patientId).FirstOrDefault();
                    //we need to send back some information even when billing is not done or even when card is not printed.//sud:23Aug'18
                    var res = new
                    {
                        BillStatus = billStatus != null ? billStatus.BillStatus : ENUM_BillingStatus.unpaid,// "unpaid",
                        PaidDate = billStatus != null ? billStatus.PaidDate : null,
                        BillingDate = billStatus != null ? billStatus.CreatedOn : null,
                        IsPrinted = CardStatus != null ? true : false,
                        PrintedOn = CardStatus != null ? CardStatus.CreatedOn : null
                    };
                    responseData.Results = res;

                    responseData.Status = "OK";
                }
                else if (reqType == "membership-types")
                {
                    var membershipTypes = (from type in patDbContext.MembershipTypes
                                           where type.IsActive == true
                                           select new
                                           {
                                               type.MembershipTypeId,
                                               MembershipType = type.MembershipTypeName,
                                               MembershipTypeName = type.MembershipTypeName + " (" + type.DiscountPercent + " % off)",
                                               //sud:7Aug'19--use Formatted for autocomplete. remove above row later on.
                                               MembershipTypeFormatted = type.MembershipTypeName + " (" + type.DiscountPercent + " % off)",
                                               type.DiscountPercent
                                           });
                    responseData.Results = membershipTypes;
                    responseData.Status = "OK";
                }
                //ashim: 04Sep2018 : Used only in Lab/LabRequests
                else if (reqType == "inpatient-list")
                {
                    var InPatients = (from pat in patDbContext.Patients

                                      join vst in patDbContext.Visits on pat.PatientId equals vst.PatientId
                                      join adm in patDbContext.Admissions on vst.PatientVisitId equals adm.PatientVisitId
                                      where adm.AdmissionStatus == "admitted"
                                      select new
                                      {
                                          pat.PatientId,
                                          pat.PatientCode,
                                          pat.FirstName,
                                          pat.MiddleName,
                                          pat.LastName,
                                          pat.Gender,
                                          pat.DateOfBirth,
                                          pat.Age,
                                          pat.Address,
                                          pat.PhoneNumber,
                                          vst.VisitCode,
                                          vst.PatientVisitId,
                                          ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      }).OrderByDescending(patient => patient.PatientId).ToList();
                    responseData.Results = InPatients;
                    responseData.Status = "OK";
                }
                else if (reqType == "phrm-sale-patient")
                {
                    var salesphrmpatient = (from pat in patDbContext.Patients
                                            where pat.IsActive == true
                                            select new
                                            {
                                                PatientId = pat.PatientId,
                                                PatientCode = pat.PatientCode,
                                                IsOutdoorPatient = pat.IsOutdoorPat,
                                                ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                            }).OrderByDescending(p => p.PatientId).ToList();
                    responseData.Results = salesphrmpatient;

                }
                else if (reqType == "patient-search-by-text") // Vikas: 17th June 2019 :added real time search.
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    IEnumerable<RbacPermission> validPermissionList = RBAC.GetUserAllPermissions(currentUser.UserId).Where(x => x.ApplicationId == 9).AsEnumerable();
                    RbacDbContext rbacDbContext = new RbacDbContext(connString);

                    var rolePermissionList = rbacDbContext.RolePermissionMaps.Where(x => x.IsActive == true && x.Permission.ApplicationId == 9).AsEnumerable();

                    var BtnPermissnList = (from permissionrole in rbacDbContext.RolePermissionMaps
                                           join permission in rbacDbContext.Permissions on permissionrole.PermissionId equals permission.PermissionId
                                           where permission.ApplicationId == 9 && permissionrole.IsActive == true
                                           select new
                                           {
                                               PermissionId = permission.PermissionId,
                                               PermissionName = permission.PermissionName
                                           }).ToList().AsEnumerable();

                    string admitBtn = "";
                    foreach (var item in BtnPermissnList)
                    {

                        if (item.PermissionName == "admit-button")
                        {
                            admitBtn = "admit-button";
                        }
                    };
                    CoreDbContext coreDbContext = new CoreDbContext(connString);
                    search = search == null ? string.Empty : search.ToLower();

                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in coreDbContext.Parameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();

                    if (!String.IsNullOrEmpty(timeFrmParam))
                    { minTimeBeforeCancel = Int32.Parse(timeFrmParam); }

                    DateTime currentDateTime = System.DateTime.Now;
                    DateTime bufferTime = currentDateTime.AddMinutes(minTimeBeforeCancel);

                    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                                   join cnty in patDbContext.Countries on pat.CountryId equals cnty.CountryId
                                   join country in patDbContext.CountrySubdivisions
                                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                                   where pat.IsActive == true && pat.IsActive == true && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + " " + pat.Address + " " + pat.PhoneNumber + " " + pat.Address + pat.FirstName + " " + pat.Address + pat.PatientCode).Contains(search))
                                   select new
                                   {
                                       PatientId = pat.PatientId,
                                       PatientCode = pat.PatientCode,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       Age = pat.Age,
                                       Gender = pat.Gender,
                                       PhoneNumber = pat.PhoneNumber,
                                       DateOfBirth = pat.DateOfBirth,
                                       Address = pat.Address,
                                       IsOutdoorPat = pat.IsOutdoorPat,
                                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                                       CountryId = pat.CountryId,
                                       CountryName = cnty.CountryName,
                                       CountrySubDivisionId = pat.CountrySubDivisionId,
                                       CountrySubDivisionName = country.CountrySubDivisionName,
                                       pat.MembershipTypeId,
                                       PANNumber = pat.PANNumber,
                                       pat.BloodGroup,
                                       VisitDate = (pat.Visits.Count != 0) ? pat.Visits.OrderByDescending(a => a.VisitDate).FirstOrDefault().VisitDate.ToString() : "",
                                       ProviderId = (from visit in patDbContext.Visits
                                                     where visit.PatientId == pat.PatientId
                                                     select visit.ProviderId).FirstOrDefault(),//Ajay--> getting ProviderId for patient
                                       IsAdmitted = (from adm in patDbContext.Admissions
                                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true,
                                       AdmitButton = admitBtn,
                                       VisitType = (from vis in patDbContext.Visits
                                                    where vis.PatientId == pat.PatientId && vis.VisitStatus != "cancel"
                                                    select new
                                                    {
                                                        VisitType = vis.VisitType,
                                                        PatVisitId = vis.PatientVisitId
                                                    }).OrderByDescending(a => a.PatVisitId).Select(b=>b.VisitType).FirstOrDefault(),
                                       BedReserved = (from bres in patDbContext.BedReservation
                                                      where bres.PatientId == pat.PatientId && bres.IsActive == true
                                                      && bres.AdmissionStartsOn > bufferTime
                                                      select bres.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
                                       IsPoliceCase = (from vis in patDbContext.Visits where vis.PatientId == pat.PatientId
                                                       join er in patDbContext.EmergencyPatient on vis.PatientVisitId equals er.PatientVisitId into policecase
                                                       from polcase in policecase.DefaultIfEmpty()
                                                       select new
                                                       {
                                                           VisitDate = vis.VisitDate,
                                                           PatientVisitId = vis.PatientVisitId,
                                                           IsPoliceCase = polcase.IsPoliceCase.HasValue ? polcase.IsPoliceCase : false
                                                       }).OrderByDescending(a => a.VisitDate).Select(b => b.IsPoliceCase).FirstOrDefault(),

                                       WardBedInfo = (from adttxn in patDbContext.PatientBedInfos where adttxn.PatientId == pat.PatientId
                                                       join vis in patDbContext.Visits on adttxn.StartedOn equals vis.CreatedOn 
                                                       join bed in patDbContext.Beds on adttxn.BedId equals bed.BedId
                                                       join ward in patDbContext.Wards on adttxn.WardId equals ward.WardId
                                                       select new { 
                                                            WardName = ward.WardName,
                                                            BedCode = bed.BedCode,
                                                            Date = adttxn.StartedOn
                                                       }).OrderByDescending(a => a.Date).FirstOrDefault()
                                   }).OrderByDescending(p => p.PatientId).AsQueryable();


                    if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "PatientSearchPatient") == true && search == "")
                    {
                        allPats = allPats.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
                    }
                    var finalResults = allPats.ToList();
                    responseData.Results = finalResults;


                    //if (string.IsNullOrEmpty(search))
                    //{
                    //    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                    //                   join country in patDbContext.CountrySubdivisions
                    //                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                    //                   where pat.IsActive == true
                    //                   select new
                    //                   {
                    //                       PatientId = pat.PatientId,
                    //                       PatientCode = pat.PatientCode,
                    //                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                    //                       FirstName = pat.FirstName,
                    //                       LastName = pat.LastName,
                    //                       MiddleName = pat.MiddleName,
                    //                       Age = pat.Age,
                    //                       Gender = pat.Gender,
                    //                       PhoneNumber = pat.PhoneNumber,
                    //                       DateOfBirth = pat.DateOfBirth,
                    //                       Address = pat.Address,
                    //                       IsOutdoorPat = pat.IsOutdoorPat,
                    //                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                    //                       CountryId = pat.CountryId,
                    //                       CountrySubDivisionId = pat.CountrySubDivisionId,
                    //                       CountrySubDivisionName = country.CountrySubDivisionName,
                    //                       pat.MembershipTypeId,
                    //                       PANNumber = pat.PANNumber,
                    //                       pat.BloodGroup,
                    //                       //ProviderId = (from visit in patDbContext.Visits
                    //                       //              where visit.PatientId == pat.PatientId
                    //                       //              select visit.ProviderId).FirstOrDefault(),//Ajay--> getting ProviderId for patient
                    //                       ProviderId = pat.Visits.Select(v => v.ProviderId).FirstOrDefault(),
                    //                       IsAdmitted = (from adm in patDbContext.Admissions
                    //                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                    //                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true

                    //                   }).OrderByDescending(p => p.PatientId).Take(200).ToList<object>();
                    //    responseData.Results = allPats;
                    //}
                    //else
                    //{
                    //    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                    //                   join country in patDbContext.CountrySubdivisions
                    //                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                    //                   where pat.IsActive == true && pat.IsActive == true && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + " " + pat.Address + " " + pat.PhoneNumber + " " + pat.Address + pat.FirstName + " " + pat.Address + pat.PatientCode).Contains(search))
                    //                   select new
                    //                   {
                    //                       PatientId = pat.PatientId,
                    //                       PatientCode = pat.PatientCode,
                    //                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                    //                       FirstName = pat.FirstName,
                    //                       LastName = pat.LastName,
                    //                       MiddleName = pat.MiddleName,
                    //                       Age = pat.Age,
                    //                       Gender = pat.Gender,
                    //                       PhoneNumber = pat.PhoneNumber,
                    //                       DateOfBirth = pat.DateOfBirth,
                    //                       Address = pat.Address,
                    //                       IsOutdoorPat = pat.IsOutdoorPat,
                    //                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                    //                       CountryId = pat.CountryId,
                    //                       CountrySubDivisionId = pat.CountrySubDivisionId,
                    //                       CountrySubDivisionName = country.CountrySubDivisionName,
                    //                       pat.MembershipTypeId,
                    //                       PANNumber = pat.PANNumber,
                    //                       pat.BloodGroup,
                    //                       ProviderId = (from visit in patDbContext.Visits
                    //                                     where visit.PatientId == pat.PatientId
                    //                                     select visit.ProviderId).FirstOrDefault(),//Ajay--> getting ProviderId for patient
                    //                       IsAdmitted = (from adm in patDbContext.Admissions
                    //                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                    //                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true

                    //                   }).OrderByDescending(p => p.PatientId).ToList<object>();
                    //    responseData.Results = allPats;
                    //}

                }
                else//this is default call.. 
                {
                    var allPats = (from pat in patDbContext.Patients.Include("Visits")
                                   join cnty in patDbContext.Countries on pat.CountryId equals cnty.CountryId
                                   join country in patDbContext.CountrySubdivisions
                                   on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                                   where pat.IsActive == true
                                   select new
                                   {
                                       PatientId = pat.PatientId,
                                       PatientCode = pat.PatientCode,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       Age = pat.Age,
                                       Gender = pat.Gender,
                                       PhoneNumber = pat.PhoneNumber,
                                       DateOfBirth = pat.DateOfBirth,
                                       Address = pat.Address,
                                       IsOutdoorPat = pat.IsOutdoorPat,
                                       CreatedOn = pat.CreatedOn,//for issued-date:healthcard-anish
                                       CountryId = pat.CountryId,
                                       CountryName = cnty.CountryName,
                                       CountrySubDivisionId = pat.CountrySubDivisionId,
                                       CountrySubDivisionName = country.CountrySubDivisionName,
                                       pat.MembershipTypeId,
                                       PANNumber = pat.PANNumber,
                                       pat.BloodGroup,
                                       ProviderId = (from visit in patDbContext.Visits
                                                     where visit.PatientId == pat.PatientId
                                                     select visit.ProviderId).FirstOrDefault(),//Ajay--> getting ProviderId for patient
                                       IsAdmitted = (from adm in patDbContext.Admissions
                                                     where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                     select adm.AdmissionStatus).FirstOrDefault() == null ? false : true   //ram--> getting IsAdmitted status of patient
                                   }).OrderByDescending(p => p.PatientId).ToList<object>();
                    responseData.Results = allPats;

                }



            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentSessionUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                PatientDbContext patDbContext = new PatientDbContext(connString);
                patDbContext = this.AddAuditField(patDbContext);

                string reqType = this.ReadQueryStringData("reqType");
                if (reqType == "patient")
                {
                    string str = this.ReadPostData();
                    PatientModel clientPatModel = JsonConvert.DeserializeObject<PatientModel>(str);

                    clientPatModel.EMPI = CreateEmpi(clientPatModel);
                    clientPatModel.CreatedOn = DateTime.Now;
                    //CreatedBy Must be added to this table PAT_Patient
                    //clientPatModel.CreatedBy =

                    //sud:10Apr'19--To centralize patient number and Patient code logic.
                    NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);



                    //clientPatModel.PatientNo = GetNewPatientNo(patDbContext);
                    //clientPatModel.PatientCode = GetPatientCode(clientPatModel.PatientNo.Value);

                    clientPatModel.PatientNo = newPatientNumber.PatientNo;
                    clientPatModel.PatientCode = newPatientNumber.PatientCode;
                    if (clientPatModel.MembershipTypeId == null)
                    {
                        var membership = patDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                        clientPatModel.MembershipTypeId = membership.MembershipTypeId;
                    }
                    patDbContext.Patients.Add(clientPatModel);
                    patDbContext.SaveChanges();


                    //clientPatModel.PatientCode = this.GetPatientCode(clientPatModel.PatientId);
                    //dbContext.SaveChanges();

                    PatientMembershipModel patMembership = new PatientMembershipModel();

                    List<MembershipTypeModel> allMemberships = patDbContext.MembershipTypes.ToList();
                    MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == clientPatModel.MembershipTypeId).FirstOrDefault();

                    patMembership.PatientId = clientPatModel.PatientId;
                    patMembership.MembershipTypeId = currPatMembershipModel.MembershipTypeId;
                    patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                    int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                    patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                    patMembership.CreatedBy = clientPatModel.CreatedBy;
                    patMembership.CreatedOn = System.DateTime.Now;
                    patMembership.IsActive = true;

                    patDbContext.PatientMemberships.Add(patMembership);
                    patDbContext.SaveChanges();


                    if (clientPatModel.HasFile == true && clientPatModel.ProfilePic != null)
                    {

                        this.AddProfilePic(patDbContext, clientPatModel.PatientId, clientPatModel.ProfilePic);

                        //put your file adding logic here. 
                    }

                    //patient Code


                    responseData.Results = new PatientModel() { PatientCode = clientPatModel.PatientCode, PatientId = clientPatModel.PatientId };
                    responseData.Status = "OK";
                }
                else if (reqType == "upload")
                {
                    /////Read Files From Clent Side 
                    var files = this.ReadFiles();
                    ///Read patient Files Model Other Data
                    var reportDetails = Request.Form["reportDetails"];
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    PatientFilesModel patFileData = DanpheJSONConvert.DeserializeObject<PatientFilesModel>(reportDetails);
                    ////We Do Process in Transaction because Now Situation that 
                    /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
                    using (var dbContextTransaction = patDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            foreach (var file in files)
                            {
                                if (file.Length > 0)
                                {
                                    /////Converting Files to Byte there for we require MemoryStream object
                                    using (var ms = new MemoryStream())
                                    {
                                        ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
                                        string currentFileExtention = Path.GetExtension(file.FileName);
                                        ////Copy Each file to MemoryStream
                                        file.CopyTo(ms);
                                        ////Convert File to Byte[]
                                        var fileBytes = ms.ToArray();
                                        ///Based on Patient ID and File Type We have to check what is the MAXIMUM File NO 
                                        var avilableMAXFileNo = (from dbFile in patDbContext.PatientFiles
                                                                 where dbFile.PatientId == patFileData.PatientId && dbFile.FileType == patFileData.FileType
                                                                 select new { dbFile.FileNo }).ToList();
                                        int max;
                                        if (avilableMAXFileNo.Count > 0)
                                        {
                                            max = avilableMAXFileNo.Max(x => x.FileNo);
                                        }
                                        else
                                        {
                                            max = 0;
                                        }
                                        ///this is Current Insrting File MaX Number
                                        var currentFileNo = (max + 1);
                                        string currentfileName = "";
                                        // this is Latest File NAme with FileNo in the Last Binding
                                        currentfileName = patFileData.FileName + '_' + currentFileNo + currentFileExtention;

                                        var tempModel = new PatientFilesModel();
                                        //tempModel.FileBinaryData = fileBytes;
                                        tempModel.PatientId = patFileData.PatientId;
                                        tempModel.ROWGUID = Guid.NewGuid();
                                        tempModel.FileType = patFileData.FileType;
                                        tempModel.UploadedBy = currentUser.EmployeeId;
                                        tempModel.UploadedOn = DateTime.Now;
                                        tempModel.Description = patFileData.Description;
                                        tempModel.FileName = currentfileName;
                                        tempModel.FileNo = currentFileNo;
                                        tempModel.Title = patFileData.Title;
                                        tempModel.FileExtention = currentFileExtention;
                                        patDbContext.PatientFiles.Add(tempModel);
                                        patDbContext.SaveChanges();
                                    }
                                }
                            }
                            ///After All Files Added Commit the Transaction
                            dbContextTransaction.Commit();

                            responseData.Results = null;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            responseData.Results = null;
                            responseData.Status = "Failed";
                            throw ex;
                        }
                    }
                }
                else if (reqType == "profile-pic")
                {
                    /////Read Files From Clent Side 
                    //var files = this.ReadFiles();
                    ///Read patient Files Model Other Data
                    string fileInfoStr = this.ReadPostData();
                    PatientFilesModel patFileData = DanpheJSONConvert.DeserializeObject<PatientFilesModel>(fileInfoStr);

                    /////Creating Patient DbContect Object
                    PatientDbContext dbContext = new PatientDbContext(connString);

                    var binaryString = patFileData.FileBase64String;

                    PatientFilesModel retModel = AddProfilePic(dbContext, patFileData.PatientId, patFileData);

                    //if(patFileData.PatientId==0 || patFileData.PatientId = null)
                    //{
                    //    responseData.ErrorMessage = "Couldnot upload files";
                    //    responseData.Status = "Failed";
                    //}

                    if (retModel != null && retModel.PatientFileId > 0)
                    {
                        responseData.Results = retModel;
                        responseData.Status = "OK";
                        //this is success.
                    }
                    else
                    {
                        responseData.ErrorMessage = "Couldnot upload files";
                        responseData.Status = "Failed";
                    }

                }
                else if (reqType == "postHealthCard")
                {
                    string str = this.ReadPostData();
                    HealthCardInfoModel healthCard = DanpheJSONConvert.DeserializeObject<HealthCardInfoModel>(str);
                    healthCard.CreatedOn = System.DateTime.Now;

                    patDbContext.PATHealthCard.Add(healthCard);
                    patDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "postNeighbourhoodCard")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    string str = this.ReadPostData();
                    NeighbourhoodCardModel neighbourCard = DanpheJSONConvert.DeserializeObject<NeighbourhoodCardModel>(str);
                    neighbourCard.CreatedOn = System.DateTime.Now;
                    neighbourCard.CreatedBy = currentUser.EmployeeId;
                    patDbContext.PATNeighbourhoodCard.Add(neighbourCard);
                    patDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "gov-insurance-patient")
                {
                    string str = this.ReadPostData();
                    GovInsurancePatientVM govInsClientPatObj = JsonConvert.DeserializeObject<GovInsurancePatientVM>(str);

                    PatientModel govInsNewPatient = DanpheEMR.Controllers.PatientBL.GetPatientModelFromPatientVM(govInsClientPatObj, connString, patDbContext);
                    InsuranceModel patInsInfo = DanpheEMR.Controllers.PatientBL.GetInsuranceModelFromInsPatientVM(govInsClientPatObj);
                    patInsInfo.CreatedBy = currentSessionUser.EmployeeId;

                    govInsNewPatient.Insurances = new List<InsuranceModel>();
                    govInsNewPatient.Insurances.Add(patInsInfo);

                    govInsNewPatient.CreatedBy = currentSessionUser.EmployeeId;
                    govInsNewPatient.CreatedOn = DateTime.Now;

                    patDbContext.Patients.Add(govInsNewPatient);
                    patDbContext.SaveChanges();

                    PatientMembershipModel patMembership = new PatientMembershipModel();

                    List<MembershipTypeModel> allMemberships = patDbContext.MembershipTypes.ToList();
                    MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == govInsNewPatient.MembershipTypeId).FirstOrDefault();


                    patMembership.PatientId = govInsNewPatient.PatientId;
                    patMembership.MembershipTypeId = govInsNewPatient.MembershipTypeId.Value;
                    patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                    int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                    patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                    patMembership.CreatedBy = currentSessionUser.EmployeeId;
                    patMembership.CreatedOn = System.DateTime.Now;
                    patMembership.IsActive = true;

                    patDbContext.PatientMemberships.Add(patMembership);
                    patDbContext.SaveChanges();

                    responseData.Results = govInsNewPatient;
                    responseData.Status = "OK";
                }
                else if (reqType == "billing-out-patient")
                {
                    string str = this.ReadPostData();

                    BillingOpPatientVM billingOutPatVM = JsonConvert.DeserializeObject<BillingOpPatientVM>(str);

                    PatientModel newPatient = DanpheEMR.Controllers.PatientBL.GetPatientModelFromPatientVM(billingOutPatVM, connString, patDbContext);

                    newPatient.CreatedBy = currentSessionUser.EmployeeId;
                    newPatient.CreatedOn = DateTime.Now;

                    patDbContext.Patients.Add(newPatient);
                    patDbContext.SaveChanges();

                    PatientMembershipModel patMembership = new PatientMembershipModel();

                    List<MembershipTypeModel> allMemberships = patDbContext.MembershipTypes.ToList();
                    MembershipTypeModel currPatMembershipModel = allMemberships.Where(a => a.MembershipTypeId == newPatient.MembershipTypeId).FirstOrDefault();


                    patMembership.PatientId = newPatient.PatientId;
                    patMembership.MembershipTypeId = newPatient.MembershipTypeId.Value;
                    patMembership.StartDate = System.DateTime.Now;//set today's datetime as start date.
                    int expMths = currPatMembershipModel.ExpiryMonths != null ? currPatMembershipModel.ExpiryMonths.Value : 0;

                    patMembership.EndDate = System.DateTime.Now.AddMonths(expMths);//add membership type's expiry date to current date for expiryDate.
                    patMembership.CreatedBy = currentSessionUser.EmployeeId;
                    patMembership.CreatedOn = System.DateTime.Now;
                    patMembership.IsActive = true;

                    patDbContext.PatientMemberships.Add(patMembership);
                    patDbContext.SaveChanges();

                    responseData.Results = newPatient;
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid input request.";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            //returning the whole object.. correction -> return only necessary fields after patient creation..
            //other fields will already be there. 
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        //sudarshan-1feb'17-- update logic creation-- thorough testing needed.
        [HttpPut]
        public string Put(string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentSessionUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                PatientDbContext patDbContext = new PatientDbContext(connString);
                patDbContext = this.AddAuditField(patDbContext);

                if (reqType == "update-gov-insurance-patient")
                {
                    string str = this.ReadPostData();
                    GovInsurancePatientVM insPatObjFromClient = JsonConvert.DeserializeObject<GovInsurancePatientVM>(str);

                    if (insPatObjFromClient != null && insPatObjFromClient.PatientId != 0)
                    {
                        PatientModel patFromDb = patDbContext.Patients.Include("Insurances")
                            .Where(p => p.PatientId == insPatObjFromClient.PatientId).FirstOrDefault();
                        //if insurance info is not found then add new, else update that.
                        if (patFromDb.Insurances == null || patFromDb.Insurances.Count == 0)
                        {
                            InsuranceModel insInfo = PatientBL.GetInsuranceModelFromInsPatientVM(insPatObjFromClient);
                            patFromDb.Insurances = new List<InsuranceModel>();
                            patFromDb.Insurances.Add(insInfo);
                        }
                        else
                        {
                            InsuranceModel patInsInfo = patFromDb.Insurances[0];
                            patInsInfo.IMISCode = insPatObjFromClient.IMISCode;
                            patInsInfo.InsuranceProviderId = insPatObjFromClient.InsuranceProviderId;
                            patInsInfo.InsuranceName = insPatObjFromClient.InsuranceName;
                            //update only current balance, don't update initial balance.
                            patInsInfo.CurrentBalance = insPatObjFromClient.CurrentBalance;
                            patInsInfo.ModifiedOn = DateTime.Now;
                            patInsInfo.ModifiedBy = currentSessionUser.EmployeeId;

                            //not sure if we've to allow to update imis code..
                            patDbContext.Entry(patInsInfo).Property(a => a.IMISCode).IsModified = true;
                            patDbContext.Entry(patInsInfo).Property(a => a.InsuranceProviderId).IsModified = true;
                            patDbContext.Entry(patInsInfo).Property(a => a.InsuranceName).IsModified = true;
                            patDbContext.Entry(patInsInfo).Property(a => a.CurrentBalance).IsModified = true;
                            patDbContext.Entry(patInsInfo).Property(a => a.ModifiedOn).IsModified = true;
                            patDbContext.Entry(patInsInfo).Property(a => a.ModifiedBy).IsModified = true;

                        }

                        patDbContext.SaveChanges();

                    }

                    responseData.Status = "OK";
                    responseData.Results = "Patient Information updated successfully.";
                }
                else
                {

                    string str = this.ReadPostData();

                    PatientModel objFromClient = JsonConvert.DeserializeObject<PatientModel>(str);
                    // map all the entities we want to update.
                    // OwnedCollection for list, OwnedEntity for one-one navigational property
                    // test it thoroughly, also with sql-profiler on how it generates the code

                    //sud: 15Aug'18--need to update modifiedon field when anything is changed.
                    if (objFromClient != null)
                    {
                        objFromClient.ModifiedOn = DateTime.Now;
                    }

                    objFromClient = patDbContext.UpdateGraph(objFromClient,
                        map => map.OwnedCollection(a => a.Addresses)
                        .OwnedCollection(a => a.KinEmergencyContacts)
                        .OwnedCollection(a => a.Insurances)
                        .OwnedEntity(a => a.Guarantor));

                    //exclude those properties which we don't want graphdiff to update/modify.. 
                    patDbContext.Entry(objFromClient).Property(u => u.CreatedBy).IsModified = false;
                    patDbContext.Entry(objFromClient).Property(u => u.CreatedOn).IsModified = false;
                    patDbContext.Entry(objFromClient).Property(u => u.PatientCode).IsModified = false;
                    patDbContext.Entry(objFromClient).Property(u => u.PatientNo).IsModified = false;//sud: 15Aug'18
                    patDbContext.SaveChanges();
                }
                responseData.Status = "OK";
                responseData.Results = "Patient information updated successfully.";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        ////returns patientNumber for new patient (logic: maxPatientNo+1 )
        //private int GetNewPatientNo(PatientDbContext patDbContext)
        //{
        //    var maxPatNo = patDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
        //    //DefaultIfEmpty().Max(p => p == null ? 0 : p.X)
        //    return maxPatNo.Value + 1;

        //}

        private PatientFilesModel AddProfilePic(PatientDbContext patDbContext, int patientId, PatientFilesModel ipFileInfo)
        {

            PatientFilesModel returnModel = new PatientFilesModel();



            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            if (ipFileInfo.FileBase64String != null)
            {
                string base64String = ipFileInfo.FileBase64String;
                byte[] imageData = Convert.FromBase64String(base64String);
                var location = (from dbc in patDbContext.CFGParameters
                                where dbc.ParameterGroupName.ToLower() == "patient" && dbc.ParameterName == "PatientProfilePicImageUploadLocation"
                                select dbc.ParameterValue
                                ).FirstOrDefault();
                string currentfileName = "";
                // this is Latest File NAme with FileNo in the Last Binding                
                currentfileName = patientId.ToString() + '-' + System.DateTime.Now.ToString().Replace(" ", "").Replace("/", "").Replace(":", "-") + "-pp" + ".jpg";
                var fullPath = location + currentfileName;
                byte[] imageBytes = Convert.FromBase64String(ipFileInfo.FileBase64String);

                PatientFilesModel tempModel = new PatientFilesModel();
                //tempModel.FileBinaryData = fileBytes;
                //tempModel.FileBinaryData = imageData;
                tempModel.PatientId = patientId;
                tempModel.ROWGUID = Guid.NewGuid();
                tempModel.FileType = ipFileInfo.FileType;
                tempModel.UploadedBy = currentUser.EmployeeId;
                tempModel.UploadedOn = DateTime.Now;
                tempModel.Description = ipFileInfo.Description;
                tempModel.FileName = currentfileName;
                tempModel.Title = ipFileInfo.Title;
                tempModel.FileExtention = ".jpg";
                tempModel.IsActive = true;
                patDbContext.PatientFiles.Add(tempModel);
                patDbContext.SaveChanges();

                tempModel.FileBase64String = Convert.ToBase64String(imageBytes);


                System.IO.File.WriteAllBytes(@fullPath, imageBytes);


                returnModel = tempModel;
            }


            //set earlier profile pics to isactive false.
            if (returnModel.PatientFileId != 0)
            {

                var existingProfilePics = patDbContext.PatientFiles.Where(f => f.PatientId == patientId
                               && f.FileType == "profile-pic" && f.IsActive == true
                               && f.PatientFileId != returnModel.PatientFileId).ToList();
                if (existingProfilePics != null && existingProfilePics.Count > 0)
                {
                    foreach (var item in existingProfilePics)
                    {
                        patDbContext.PatientFiles.Attach(item);
                        item.IsActive = false;
                        patDbContext.Entry(item).Property(f => f.IsActive).IsModified = true;
                        patDbContext.SaveChanges();
                    }
                }
            }


            return returnModel;
        }

    }




}
