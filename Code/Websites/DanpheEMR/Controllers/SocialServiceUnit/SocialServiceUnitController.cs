using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using System.Xml;

using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.Threading.Tasks;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class SocialServiceUnitController : CommonController
    {


        double cacheExpMinutes;//= 5;//this should come from configuration later on.

        public SocialServiceUnitController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }

        [HttpGet]
        [Route("~/api/SocialServiceUnit/GetAllSsuPatients")]
        public async Task<IActionResult> GetAllSsuPatients(string search = "")
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            var ssuDbContext = new SocialServiceUnitDbContext(connString);
            
            try
            {
                if (search == null)
                {
                    search = "";
                }

                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                IEnumerable<RbacPermission> validPermissionList = RBAC.GetUserAllPermissions(currentUser.UserId).Where(x => x.ApplicationId == 9).AsEnumerable();
                RbacDbContext rbacDbContext = new RbacDbContext(connString);

                var rolePermissionList = rbacDbContext.RolePermissionMaps.Where(x => x.IsActive == true && x.Permission.ApplicationId == 9).AsEnumerable();

                var BtnPermissnList = await (from permissionrole in rbacDbContext.RolePermissionMaps
                                             join permission in rbacDbContext.Permissions on permissionrole.PermissionId equals permission.PermissionId
                                             where permission.ApplicationId == 9 && permissionrole.IsActive == true
                                             select new
                                             {
                                                 PermissionId = permission.PermissionId,
                                                 PermissionName = permission.PermissionName
                                             })
                                             .ToListAsync();

                string admitBtn = "";
                foreach (var item in BtnPermissnList)
                {

                    if (item.PermissionName == "admit-button")
                    {
                        admitBtn = "admit-button";
                    }
                };
                CoreDbContext coreDbContext = new CoreDbContext(connString);

                int minTimeBeforeCancel = 15;
                var timeFrmParam = (from param in coreDbContext.Parameters
                                    where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                    && param.ParameterGroupName.ToLower() == "adt"
                                    select param.ParameterValue).FirstOrDefault();

                if (!String.IsNullOrEmpty(timeFrmParam))
                { minTimeBeforeCancel = Int32.Parse(timeFrmParam); }

                DateTime currentDateTime = System.DateTime.Now;
                DateTime bufferTime = currentDateTime.AddMinutes(minTimeBeforeCancel);
                var allPats = (from pat in ssuDbContext.Patients.Include("Visits")
                               join cnty in ssuDbContext.Countries on pat.CountryId equals cnty.CountryId
                               join country in ssuDbContext.CountrySubdivisions
                               on pat.CountrySubDivisionId equals country.CountrySubDivisionId
                               where pat.IsSSUPatient == true && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + " " + pat.Address + " " + pat.PhoneNumber + " " + pat.Address + pat.FirstName + " " + pat.Address + pat.PatientCode).Contains(search))
                               select new
                               {
                                   PatientId = pat.PatientId,
                                   PatientCode = pat.PatientCode,
                                   ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                   FirstName = pat.FirstName,
                                   LastName = pat.LastName,
                                   MiddleName = pat.MiddleName,
                                   pat.FatherName,
                                   pat.MotherName,
                                   pat.EthnicGroup,
                                   pat.Race,
                                   pat.MaritalStatus,
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
                                   SSU_IsActive = pat.SSU_IsActive,
                                   IsActive = pat.IsActive,
                                   MunicipalityId = pat.MunicipalityId,
                                   MunicipalityName = (from mun in ssuDbContext.Municipalities
                                                       where pat.MunicipalityId == mun.MunicipalityId
                                                       select mun.MunicipalityName).FirstOrDefault(),
                                   SSU_Information = (from ssu in ssuDbContext.SSU_Information
                                                      where ssu.PatientId == pat.PatientId
                                                      select ssu).FirstOrDefault(),
                                   VisitDate = (pat.Visits.Count != 0) ? pat.Visits.OrderByDescending(a => a.VisitDate).FirstOrDefault().VisitDate.ToString() : "",
                                   ProviderId = (from visit in ssuDbContext.Visits
                                                 where visit.PatientId == pat.PatientId
                                                 select visit.ProviderId).FirstOrDefault(),//Ajay--> getting ProviderId for patient
                                   IsAdmitted = (from adm in ssuDbContext.Admissions
                                                 where adm.PatientId == pat.PatientId && adm.AdmissionStatus == "admitted"
                                                 select adm.AdmissionStatus).FirstOrDefault() == null ? false : true,
                                   AdmitButton = admitBtn,
                                   VisitType = (from vis in ssuDbContext.Visits
                                                where vis.PatientId == pat.PatientId && vis.VisitStatus != "cancel"
                                                select new
                                                {
                                                    VisitType = vis.VisitType,
                                                    PatVisitId = vis.PatientVisitId
                                                }).OrderByDescending(a => a.PatVisitId).Select(b => b.VisitType).FirstOrDefault(),
                                   BedReserved = (from bres in ssuDbContext.BedReservation
                                                  where bres.PatientId == pat.PatientId && bres.IsActive == true
                                                  && bres.AdmissionStartsOn > bufferTime
                                                  select bres.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
                                   IsPoliceCase = (from vis in ssuDbContext.Visits
                                                   where vis.PatientId == pat.PatientId
                                                   join er in ssuDbContext.EmergencyPatient on vis.PatientVisitId equals er.PatientVisitId into policecase
                                                   from polcase in policecase.DefaultIfEmpty()
                                                   select new
                                                   {
                                                       VisitDate = vis.VisitDate,
                                                       PatientVisitId = vis.PatientVisitId,
                                                       IsPoliceCase = polcase.IsPoliceCase.HasValue ? polcase.IsPoliceCase : false
                                                   }).OrderByDescending(a => a.VisitDate).Select(b => b.IsPoliceCase).FirstOrDefault(),

                                   WardBedInfo = (from adttxn in ssuDbContext.PatientBedInfos
                                                  where adttxn.PatientId == pat.PatientId
                                                  join vis in ssuDbContext.Visits on adttxn.StartedOn equals vis.CreatedOn
                                                  join bed in ssuDbContext.Beds on adttxn.BedId equals bed.BedId
                                                  join ward in ssuDbContext.Wards on adttxn.WardId equals ward.WardId
                                                  select new
                                                  {
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
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);

        }

        [HttpGet]
        [Route("~/api/SocialServiceUnit/get-all-patients-for-ssu")]
        public IActionResult GetAllPatientsForSSU(string searchText = "")
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            var ssuDbContext = new SocialServiceUnitDbContext(connString);

            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                IEnumerable<RbacPermission> validPermissionList = RBAC.GetUserAllPermissions(currentUser.UserId).Where(x => x.ApplicationId == 9).AsEnumerable();
                RbacDbContext rbacDbContext = new RbacDbContext(connString);

                if (string.IsNullOrEmpty(searchText))
                {
                    responseData.Results = new List<string>();//send empty string.
                }
                else
                {

                    var allPats = (from pat in ssuDbContext.Patients
                                   join country in ssuDbContext.CountrySubdivisions
                                         on pat.CountrySubDivisionId equals country.CountrySubDivisionId

                                   //left join SSU information. 
                                   from ssu in ssuDbContext.SSU_Information.Where(a => a.PatientId == pat.PatientId).DefaultIfEmpty()
                                   where pat.IsActive == true && (pat.IsOutdoorPat == null || pat.IsOutdoorPat == false)//exclude Inactive and OutDoor patients.

                                    && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + pat.PatientCode + pat.PhoneNumber).Contains(searchText))
                                   select new
                                   {
                                       PatientId = pat.PatientId,
                                       PatientCode = pat.PatientCode,
                                       ShortName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       pat.FatherName,
                                       pat.MotherName,
                                       pat.EthnicGroup,
                                       pat.Race,
                                       pat.MaritalStatus,
                                       pat.MembershipTypeId,
                                       Age = pat.Age,
                                       Gender = pat.Gender,
                                       PhoneNumber = pat.PhoneNumber,
                                       DateOfBirth = pat.DateOfBirth,
                                       Address = pat.Address,
                                       CreatedOn = pat.CreatedOn,
                                       CountryId = pat.CountryId,
                                       CountrySubDivisionId = pat.CountrySubDivisionId,
                                       CountrySubDivisionName = country.CountrySubDivisionName,
                                       pat.PANNumber,
                                       pat.IsOutdoorPat,
                                       pat.BloodGroup,
                                       SSU_Information = ssu,
                                       SSU_InfoId = ssu != null ? ssu.SSU_InfoId : 0,
                                   }).OrderByDescending(p => p.PatientId).ToList();

                    responseData.Results = allPats;
                }

                responseData.Status = "OK";

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);

        }

        [HttpPost]// POST api/values
        [Route("~/api/SocialServiceUnit/post-ssu-patient-information")]
        public IActionResult PostSsuPatientInformation()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                SocialServiceUnitDbContext dbContext = new SocialServiceUnitDbContext(base.connString);
                string dataString = this.ReadPostData();
                //string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                PatientModel patDetails = DanpheJSONConvert.DeserializeObject<PatientModel>(dataString);

                NewPatientUniqueNumbersVM newPatientNumber = SsuPatientBL.GetPatNumberNCodeForNewPatient(connString);

                patDetails.PatientNo = newPatientNumber.PatientNo;
                patDetails.PatientCode = newPatientNumber.PatientCode;

                if (patDetails.MembershipTypeId == null || patDetails.MembershipTypeId == 0)
                {
                    var membership = dbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                    patDetails.MembershipTypeId = membership.MembershipTypeId;
                }

                using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                {
                    try
                    {
                                                
                        dbContext.Patients.Add(patDetails);
                        dbContext.SaveChanges();

                        if(patDetails.IsSSUPatient == true && patDetails.SSU_Information != null )
                        {
                            SSU_InformationModel newSsuPat = new SSU_InformationModel();
                            newSsuPat = patDetails.SSU_Information;
                            newSsuPat.PatientId = patDetails.PatientId;
                            newSsuPat.CreatedBy = currentUser.EmployeeId;
                            newSsuPat.CreatedOn = DateTime.Now;

                            dbContext.SSU_Information.Add(newSsuPat);
                            dbContext.SaveChanges();
                        }
                        dbContextTransaction.Commit();
                        responseData.Results = patDetails;

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }


                }
                
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpPut]
        [Route("~/api/SocialServiceUnit/put-ssu-patient-information")]
        public IActionResult PutSsuPatientInformation()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                SocialServiceUnitDbContext dbContext = new SocialServiceUnitDbContext(base.connString);
                string dataString = this.ReadPostData();
                //string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                PatientModel patDetails = DanpheJSONConvert.DeserializeObject<PatientModel>(dataString);

               
                if (patDetails.MembershipTypeId == null || patDetails.MembershipTypeId == 0)
                {
                    var membership = dbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                    patDetails.MembershipTypeId = membership.MembershipTypeId;
                }

                using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                {
                    try                    
                    {
                        patDetails.ModifiedOn = DateTime.Now;
                        patDetails.ModifiedBy = currentUser.EmployeeId;

                        dbContext.Patients.Attach(patDetails);
                        //dbContext.Entry(patDetails).State = EntityState.Modified;
                        dbContext.Entry(patDetails).Property(x => x.FirstName).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.MiddleName).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.LastName).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.Age).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.Gender).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.PhoneNumber).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.MaritalStatus).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.FatherName).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.MotherName).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.CountryId).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.CountrySubDivisionId).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.Address).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.EthnicGroup).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.Race).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.MembershipTypeId).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.IsSSUPatient).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.SSU_IsActive).IsModified = true;
                        dbContext.Entry(patDetails).Property(x => x.DateOfBirth).IsModified = true;

                        dbContext.SaveChanges();

                        if (patDetails.IsSSUPatient == true && patDetails.SSU_Information != null && patDetails.SSU_Information.SSU_InfoId<=0)
                        {
                            SSU_InformationModel newSsuPat = new SSU_InformationModel();
                            newSsuPat = patDetails.SSU_Information;
                            newSsuPat.PatientId = patDetails.PatientId;
                            newSsuPat.CreatedBy = currentUser.EmployeeId;
                            newSsuPat.CreatedOn = DateTime.Now;

                            dbContext.SSU_Information.Add(newSsuPat);
                            dbContext.SaveChanges();
                        }
                        else if (patDetails.IsSSUPatient == true && patDetails.SSU_Information != null && patDetails.SSU_Information.SSU_InfoId > 0)
                        {
                            SSU_InformationModel SsuPat = new SSU_InformationModel();
                            SsuPat = patDetails.SSU_Information;
                            SsuPat.ModifiedOn = DateTime.Now;
                            SsuPat.ModifiedBy = currentUser.EmployeeId;

                            dbContext.SSU_Information.Attach(SsuPat);
                            dbContext.Entry(SsuPat).State = EntityState.Modified;
                            dbContext.Entry(SsuPat).Property(x => x.PatientId).IsModified = false;
                            dbContext.Entry(SsuPat).Property(x => x.CreatedOn).IsModified = false;
                            dbContext.Entry(SsuPat).Property(x => x.CreatedBy).IsModified = false;

                            dbContext.SaveChanges();
                        }
                        dbContextTransaction.Commit();
                        responseData.Results = patDetails;

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }


                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

        [HttpPut]
        [Route("~/api/SocialServiceUnit/put-activate-deactivate-ssu-patient")]
        public IActionResult PutActivateDeactivateSsuPatient()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                SocialServiceUnitDbContext dbContext = new SocialServiceUnitDbContext(base.connString);
                string dataString = this.ReadPostData();
                //string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                PatientModel patDetails = DanpheJSONConvert.DeserializeObject<PatientModel>(dataString);
                var pat = dbContext.Patients.Where(x => x.PatientId == patDetails.PatientId).FirstOrDefault();
                using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                {
                    try
                    {
                        pat.ModifiedOn = DateTime.Now;
                        pat.ModifiedBy = currentUser.EmployeeId;
                        pat.IsActive = patDetails.IsActive;
                        dbContext.SaveChanges();

                        dbContextTransaction.Commit();
                        responseData.Results = pat;

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }


                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details:" + ex.ToString();
            }
            return Ok(responseData);
        }

    }

    



}
