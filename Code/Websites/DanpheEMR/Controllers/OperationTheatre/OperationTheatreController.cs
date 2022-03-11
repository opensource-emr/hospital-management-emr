using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;

namespace DanpheEMR.Controllers
{
    public class OperationTheatreController : CommonController
    {
        public OperationTheatreController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        [HttpGet]
        public string Get(string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            OtDbContext dbContext = new OtDbContext(connString);
            //responseData.Status = "OK";

            try
            {
                if (reqType == "getAllOtBookingInfo")
                {

                    var dateFilter = DateTime.Today;

                    var allOtInfo = (from book in dbContext.OtBookingList.Include("OtTeamDetails")
                                     join pat in dbContext.Patient on book.PatientId equals pat.PatientId
                                     where book.IsActive == true && book.BookedForDate >= dateFilter
                                     select new
                                     {
                                         book.OTBookingId,
                                         HospitalNumber = pat.PatientCode,
                                         book.PatientId,
                                         book.PatientVisitId,
                                         PatientName = pat.ShortName,
                                         Age = pat.Age,
                                         Gender = pat.Gender,
                                         BookedForDate = book.BookedForDate,
                                         Diagnosis = book.Diagnosis,
                                         SurgeryType = book.SurgeryType,
                                         ProcedureType = book.ProcedureType,
                                         Remarks = book.Remarks,
                                         DateOfBirth = pat.DateOfBirth,
                                         AnesthesiaType = book.AnesthesiaType,

                                         OtSurgeonList = (from team in dbContext.OtTeamDetails
                                                          join emp in dbContext.Employees on team.EmployeeId equals emp.EmployeeId
                                                          where team.OTBookingId == book.OTBookingId && team.RoleType == "Surgeon"
                                                          select new { emp.EmployeeId, emp.FullName }).ToList(),
                                         AnesthetistDoctor = (from team in dbContext.OtTeamDetails
                                                              join emp in dbContext.Employees on team.EmployeeId equals emp.EmployeeId
                                                              where team.OTBookingId == book.OTBookingId && team.RoleType == "AnestheticDoctor"
                                                              select new { emp.EmployeeId, emp.FullName }).FirstOrDefault(),
                                         AnesthetistAssistant = (from team in dbContext.OtTeamDetails
                                                                 join emp in dbContext.Employees on team.EmployeeId equals emp.EmployeeId
                                                                 where team.OTBookingId == book.OTBookingId && team.RoleType == "AnesthtistAssistant"
                                                                 select new { emp.EmployeeId, emp.FullName }).FirstOrDefault(),
                                         ScrubNurse = (from team in dbContext.OtTeamDetails
                                                       join emp in dbContext.Employees on team.EmployeeId equals emp.EmployeeId
                                                       where team.OTBookingId == book.OTBookingId && team.RoleType == "ScrubNurse"
                                                       select new { emp.EmployeeId, emp.FullName }).FirstOrDefault(),
                                         OtAssistantList = (from team in dbContext.OtTeamDetails
                                                            join emp in dbContext.Employees on team.EmployeeId equals emp.EmployeeId
                                                            where team.OTBookingId == book.OTBookingId && team.RoleType == "OtAssistant"
                                                            select new { emp.EmployeeId, emp.FullName }).ToList()

                                     }).ToList();

                    responseData.Results = allOtInfo;
                    responseData.Status = "OK";

                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details: " + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            OtDbContext dbContext = new OtDbContext(base.connString);
            RbacDbContext rabacDbContext = new RbacDbContext(connString);

            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                int patientId = ToInt(this.ReadQueryStringData("PatientId"));
                int patientVisitId = ToInt(this.ReadQueryStringData("PatientVisitId"));
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "addNewOtBookingDetails")
                {
                    OtBookingListModel otDetails = DanpheJSONConvert.DeserializeObject<OtBookingListModel>(str);
                    //OTTeamsModel teamInfo = DanpheJSONConvert.DeserializeObject<OTTeamsModel>(str);
                    //List<OTTeamsModel> finalTeam = new List<OTTeamsModel>();

                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                    {
                        try
                        {

                            otDetails.CreatedOn = DateTime.Now;
                            otDetails.CreatedBy = currentUser.EmployeeId;
                            //dbContext.OtTeamDetails.Add(otDetails.OtTeam);

                            dbContext.OtBookingList.Add(otDetails);

                            if (otDetails.OtTeam.Count > 0)
                            {
                                OTTeamsModel teaminfo = new OTTeamsModel();
                                foreach (var data in otDetails.OtTeam)
                                {
                                    teaminfo = data;
                                }
                                dbContext.OtTeamDetails.Add(teaminfo);
                            }
                            dbContext.SaveChanges();

                            dbContextTransaction.Commit();
                            responseData.Results = otDetails;
                            responseData.Status = "OK";

                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + "exception details: " + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPut]
        public string Put()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            responseData.Status = "OK";
            try
            {
                OtDbContext dbContext = new OtDbContext(connString);
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                //
                if (reqType != null && reqType.ToLower() == "updateotdetails")
                {
                    OtBookingListModel OTdetails = DanpheJSONConvert.
                       DeserializeObject<OtBookingListModel>(str);

                    dbContext.OtTeamDetails.RemoveRange(dbContext.OtTeamDetails.Where(ott => ott.OTBookingId == OTdetails.OTBookingId));

                    if (OTdetails.OtTeam.Count > 0)
                    {                     

                        foreach (var data in OTdetails.OtTeam)
                        {
                            OTTeamsModel teaminfo = new OTTeamsModel();
                            teaminfo = data;
                            teaminfo.OTBookingId = OTdetails.OTBookingId;
                            dbContext.OtTeamDetails.Add(teaminfo);
                        }
                        
                    }

                    dbContext.OtBookingList.Attach(OTdetails);

                    dbContext.Entry(OTdetails).Property(x => x.BookedForDate).IsModified = true;
                    dbContext.Entry(OTdetails).Property(x => x.Diagnosis).IsModified = true;
                    dbContext.Entry(OTdetails).Property(x => x.AnesthesiaType).IsModified = true;
                    dbContext.Entry(OTdetails).Property(x => x.SurgeryType).IsModified = true;
                    dbContext.Entry(OTdetails).Property(x => x.ProcedureType).IsModified = true;
                    dbContext.Entry(OTdetails).Property(x => x.Remarks).IsModified = true;
                    dbContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = "OT Details updated successfully.";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

    }
}
