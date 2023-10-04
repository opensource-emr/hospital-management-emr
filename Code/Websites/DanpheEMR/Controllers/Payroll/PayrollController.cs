using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DanpheEMR.Controllers
{
    [Route("api/Payroll")]
    public class PayrollController : CommonController
    {
        public PayrollController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        [HttpGet]
        public string Get(string reqType, int Year, int Month,int currentYear,int CurrEmpId, string LeaveCategoryIds, string status,int empId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PayrollDbContext payrollDbContext = new PayrollDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            try
            {
                if (reqType == "get-emp-list")
                {
                    if (CurrEmpId != 0)
                    {

                        if (Year != 0 && Month != 0)
                        {
                            var results = (from emp in payrollDbContext.Employee
                                           where emp.EmployeeId == CurrEmpId
                                           select new
                                           {
                                               EmployeeId = emp.EmployeeId,
                                               EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,

                                               empAttend = (from att in payrollDbContext.dailyMusters
                                                                // where att.EmployeeId == emp.EmployeeId
                                                            where att.Year == Year && att.Month == Month && att.EmployeeId == emp.EmployeeId
                                                            select new
                                                            {
                                                                Present = att.Present,
                                                                AttStatus = att.AttStatus,
                                                                ColorCode = att.ColorCode,
                                                                Month = att.Month,
                                                                Year = att.Year,
                                                                Day = att.Day,
                                                                EmployeeId = att.EmployeeId,
                                                                DailyMusterId = att.DailyMusterId,
                                                            }).ToList(),
                                           }).ToList();


                            responseData.Status = "OK";
                            responseData.Results = results;
                        }
                    }
                    else
                    {
                        if (Year != 0 && Month != 0)
                        {
                            var results = (from emp in payrollDbContext.Employee
                                           select new
                                           {
                                               EmployeeId = emp.EmployeeId,
                                               EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,

                                               empAttend = (from att in payrollDbContext.dailyMusters
                                                                // where att.EmployeeId == emp.EmployeeId
                                                            where att.Year == Year && att.Month == Month && att.EmployeeId == emp.EmployeeId
                                                            select new
                                                            {
                                                                Present = att.Present,
                                                                AttStatus = att.AttStatus,
                                                                ColorCode = att.ColorCode,
                                                                //Title = att.Title,
                                                                Month = att.Month,
                                                                Year = att.Year,
                                                                Day = att.Day,
                                                                EmployeeId = att.EmployeeId,
                                                                DailyMusterId = att.DailyMusterId,
                                                            }).ToList(),
                                           }).ToList();
                            responseData.Status = "OK";
                            responseData.Results = results;
                        }
                    }

                }

                else if (reqType == "get-leave-rule-list")
                {
                    if (currentYear != 0)
                    {
                        var result = (from lr in payrollDbContext.leaveRuleModels
                                      join lc in payrollDbContext.leaveCategories on lr.LeaveCategoryId equals lc.LeaveCategoryId
                                      where lr.Year == currentYear
                                      select new
                                      {
                                          LeaveCategoryName = lc.LeaveCategoryName,
                                          Days = lr.Days,
                                          CreatedBy = lr.CreatedBy,
                                          ApprovedBy = lr.ApprovedBy,
                                          PayPercent = lr.PayPercent,
                                          CreatedOn = lr.CreatedOn,
                                          LeaveRuleId = lr.LeaveRuleId,
                                          IsActive = lr.IsActive,
                                          IsApproved = lr.IsApproved,
                                          LeaveCategoryId = lr.LeaveCategoryId,
                                          Year = lr.Year,

                                      }).ToList().OrderByDescending(a => a.CreatedOn);
                        responseData.Status = "OK";
                        responseData.Results = result;
                    }
                }
                else if (reqType == "get-leave-category-list")
                {
                    List<int> items = LeaveCategoryIds.Split(',').Select(int.Parse).ToList();
                    var results = (from lc in payrollDbContext.leaveCategories
                                   where !items.Contains(lc.LeaveCategoryId)
                                   select new
                                   {
                                       LeaveCategoryId = lc.LeaveCategoryId,
                                       LeaveCategoryName = lc.LeaveCategoryName,
                                       Description = lc.Description,
                                       CategoryCode = lc.CategoryCode
                                   }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = results;
                }
                else if (reqType == "leaveCategoriesList")
                {
                    var leaveCategories = payrollDbContext.leaveCategories.ToList();
                    responseData.Status = "OK";
                    responseData.Results = leaveCategories;
                }
                else if (reqType == "WeekendHolidaysDetails")
                {
                    var result = payrollDbContext.WeekendHolidays.Where(a => a.Year == Year).Select(a => a).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                else if (reqType == "get-holiday-list")
                {
                    var result = payrollDbContext.HolidayList.ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                else if (reqType == "get-weekend-policy")
                {
                    var weekPolicy = (from wp in payrollDbContext.WeekendHolidays
                                      where wp.Value != null
                                      select new
                                      {
                                          DayName = wp.DayName,
                                          Description = wp.Description,
                                          Year = wp.Year,
                                          WeekendHolidayId = wp.WeekendHolidayId,
                                          Value = wp.Value,
                                      }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = weekPolicy;
                }
                else if (reqType == "getEmployeeLeaves")
                {
                    string[] RequestStatuses = status.Split(',');
                    var EmpLeaves = (from req in payrollDbContext.employeeLeaveModels
                                     join emp in payrollDbContext.Employee on req.EmployeeId equals emp.EmployeeId
                                     join leave in payrollDbContext.leaveRuleModels on req.LeaveRuleId equals leave.LeaveRuleId
                                     join stat in RequestStatuses
                                     on req.LeaveStatus equals stat
                                     join leaveCat in payrollDbContext.leaveCategories on leave.LeaveCategoryId equals leaveCat.LeaveCategoryId
                                     where leave.Year == currentYear
                                     select new
                                     {
                                         EmployeeId = req.EmployeeId,
                                         EmpName = emp.FirstName + " " + emp.LastName,
                                         EmployeeLeaveId = req.EmpLeaveId,
                                         leavetype = leaveCat.LeaveCategoryName,
                                         leaveCategoryCode = leaveCat.CategoryCode,
                                         RequestedLeaveDate = req.Date,
                                         RequestedTo = payrollDbContext.Employee.Where(a => a.EmployeeId == req.RequestedTo).Select(a => a.FirstName + " " + a.LastName).FirstOrDefault(),
                                         ApprovedDate = req.ApprovedOn,
                                         ApprovedBy = req.ApprovedBy,
                                         LeaveStatus = req.LeaveStatus,
                                         CancelledDate = req.CancelledOn,
                                         CancelledBy = req.CancelledBy
                                     }).OrderByDescending(a => a.EmployeeLeaveId).ToList();
                    responseData.Results = EmpLeaves;
                    responseData.Status = "OK";
                }
                else if (reqType == "get-employeeList")
                {
                    var EmpList = (from emp in payrollDbContext.Employee

                                   select new
                                   {
                                       emp.EmployeeId,
                                       emp.Salutation,
                                       emp.FirstName,
                                       emp.LastName,
                                       EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,

                                   }).ToList();
                    responseData.Results = EmpList;
                    responseData.Status = "OK";
                }
                else if (reqType == "leave-list")
                {
                    var leavelist = (from leave in payrollDbContext.leaveRuleModels
                                     join leaveCat in payrollDbContext.leaveCategories on leave.LeaveCategoryId equals leaveCat.LeaveCategoryId
                                     where leave.IsActive == true && leave.IsApproved == true
                                     select new
                                     {
                                         leave.LeaveRuleId,
                                         leave.LeaveCategoryId,
                                         leave.Days,
                                         leaveCat.CategoryCode,
                                         leaveCat.LeaveCategoryName,
                                         leave.Year,
                                         leave.PayPercent
                                     }).ToList();
                    responseData.Results = leavelist;
                    responseData.Status = "OK";
                }

                else if (reqType == "get-employee-leave-details")
                {

                    var result = (from emp in payrollDbContext.Employee
                                  join levemp in payrollDbContext.employeeLeaveModels on emp.EmployeeId equals levemp.EmployeeId
                                  join levRul in payrollDbContext.leaveRuleModels on levemp.LeaveRuleId equals levRul.LeaveRuleId
                                  join levCat in payrollDbContext.leaveCategories on levRul.LeaveCategoryId equals levCat.LeaveCategoryId
                                  where levemp.Date.Year == Year && levRul.IsActive == true
                                  group new { emp, levemp, levRul, levCat } by new
                                  {
                                      EmployeeId = levemp.EmployeeId,
                                      EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                      levCat.CategoryCode
                                  } into p
                                  select new
                                  {
                                      EmployeeId = p.Key.EmployeeId,
                                      EmployeeName = p.Key.EmployeeName,
                                      TotalLeave = p.Select(l => l.levemp.EmployeeId).Count(),
                                      CategoryCode = p.Key.CategoryCode

                                  }).ToList();

                    //var empLeaveModel = (from emplev in payrollDbContext.employeeLeaveModels.AsEnumerable()
                    //                     select new
                    //                     {
                    //                         EmployeeId = emplev.EmployeeId,
                    //                         LeaveRuleId=emplev.LeaveRuleId

                    //                     }).ToList();
                    //var res = (from emp in payrollDbContext.Employee.AsEnumerable()
                    //           join el in payrollDbContext.employeeLeaveModels on emp.EmployeeId equals el.EmployeeId
                    //           //  into emGroup
                    //           //from e in emGroup.DefaultIfEmpty()
                    //           join lr in payrollDbContext.leaveRuleModels.AsEnumerable() on el.LeaveRuleId equals lr.LeaveRuleId into rulGroup
                    //           from LvR in rulGroup.DefaultIfEmpty()
                    //           join levCat in payrollDbContext.leaveCategories.AsEnumerable() on LvR.LeaveCategoryId equals levCat.LeaveCategoryId into levCgroup
                    //           from lvC in levCgroup.DefaultIfEmpty()
                    //           //group new { emp, e, LvR, lvC } by new
                    //           //{
                    //           //    emplevId = e.EmployeeId,
                    //           //    EmployeeId = emp.EmployeeId,
                    //           //    EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                    //           //    CategoryCode = lvC.CategoryCode,
                    //           //    TotalLeave= 
                    //           //} into p
                    //           select new
                    //           {
                    //               EmployeeId =emp.EmployeeId,
                    //               EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                    //               CategoryCode =lvC.CategoryCode,
                    //              // TotalLeave= empLeaveModel.Where(e=>e.EmployeeId==el.EmployeeId).Select(e =>e.EmployeeId).Count(),
                    //               TotalLeave =  empLeaveModel.Where(e => e.EmployeeId == el.EmployeeId && el.LeaveRuleId == LvR.LeaveRuleId).Select(e => e.EmployeeId).Count()
                    //           }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                }

                else if (reqType == "emp-by-id")
                {

                    var empDetails = (from emp in payrollDbContext.Employee.AsEnumerable()
                                      where emp.EmployeeId == empId
                                      select new
                                      {
                                          EmployeeId = emp.EmployeeId,
                                          EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                          DateOfBirth = emp.DateOfBirth,
                                          Email = emp.Email,
                                          ContactNumber = emp.ContactNumber,
                                          emp.ContactAddress,
                                          Gender = emp.Gender
                                      }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = empDetails;

                }
                else if (reqType== "leave-details-by-empid")
                {
                    var empLeaveModel = (from emplev in payrollDbContext.employeeLeaveModels
                                         join lr in payrollDbContext.leaveRuleModels on emplev.LeaveRuleId equals lr.LeaveRuleId
                                         join lc in payrollDbContext.leaveCategories on lr.LeaveCategoryId equals lc.LeaveCategoryId
                                         where emplev.EmployeeId == empId && emplev.Date.Year == Year
                                         select new
                                         {
                                             EmployeeId = emplev.EmployeeId,
                                             Date = emplev.Date,
                                             Category = lc.LeaveCategoryName,
                                             Description = lc.Description

                                         }).ToList();

                    var result = (from lev in empLeaveModel
                                  select new
                                  {
                                      Date = lev.Date,
                                      TotalLeave = empLeaveModel.Where(e => e.EmployeeId == lev.EmployeeId && e.Date.Year == Year).Select(e => e.EmployeeId).Count(),
                                      Category = empLeaveModel.Where(e => e.EmployeeId == lev.EmployeeId && e.Date.Year == Year).Select(e => new { e.Category, e.Date, e.Description }).ToList(),

                                  }).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                                             
                //else if (reqType == "CSVRecords")
                //{

                //    var results = (from DRecord in payrollDbContext.attendanceDailyTimeRecords
                //                   select new
                //                   {
                //                       DRecord.EmployeeId,
                //                       DRecord.EmployeeName,
                //                       DRecord.RecordDateTime,
                //                   }).ToList();
                //    responseData.Results = results;
                //    responseData.Status = "OK";
                //}

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
            PayrollDbContext payrollDbContext = new PayrollDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();

            try
            {

                if (reqType == "post-attendance-daily-time-record")
                {
                    List<AttendanceDailyTimeRecord> attendanceDailyTimeRecords = DanpheJSONConvert.DeserializeObject<List<AttendanceDailyTimeRecord>>(str);

                    if (attendanceDailyTimeRecords != null)
                    {

                        foreach (var attend in attendanceDailyTimeRecords)
                        {
                            payrollDbContext.attendanceDailyTimeRecords.Add(attend);
                            payrollDbContext.SaveChanges();
                        }

                        var results = (from DRecord in payrollDbContext.attendanceDailyTimeRecords
                                       select new
                                       {
                                           DRecord.EmployeeId,
                                           DRecord.EmployeeName,
                                           DRecord.RecordDateTime,
                                       }).ToList();
                        responseData.Results = results;
                        responseData.Status = "OK";
                    }


                }
                else if (reqType == "post-csv-data-to-daily-muster")
                {
                    List<DailyMuster> dailyMusters = DanpheJSONConvert.DeserializeObject<List<DailyMuster>>(str);

                    foreach (var dm in dailyMusters)
                    {
                        var results = (from att in payrollDbContext.dailyMusters
                                       where att.EmployeeId == dm.EmployeeId
                                       select att).FirstOrDefault();
                        //&& results.Day != dm.Day && results.EmployeeId != dm.EmployeeId
                        if (results != null)
                        {
                            results.EmployeeId = dm.EmployeeId;
                            results.Day = dm.Day;
                            results.Month = dm.Month;
                            results.Year = dm.Year;
                            results.TimeIn = dm.TimeIn;
                            results.TimeOut = dm.TimeOut;
                            results.AttStatus = dm.AttStatus;
                            results.Present = dm.Present;
                            //results.Title = dm.Title;
                            payrollDbContext.Entry(results).State = EntityState.Modified;
                            payrollDbContext.SaveChanges();
                        }
                        else
                        {
                            payrollDbContext.dailyMusters.Add(dm);
                        }
                    }
                    payrollDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "PostWeekendHolidays")
                {
                    List<WeekendHolidays> weekendHolidaysList = DanpheJSONConvert.DeserializeObject<List<WeekendHolidays>>(str);
                    if (weekendHolidaysList != null)
                    {
                        foreach (var weekendHolidays in weekendHolidaysList)
                        {
                            if (payrollDbContext.WeekendHolidays.Any(a => a.DayName == weekendHolidays.DayName && a.Year == weekendHolidays.Year))
                            {
                                WeekendHolidays weekend = payrollDbContext.WeekendHolidays.Where(r => r.DayName == weekendHolidays.DayName && r.Year == weekendHolidays.Year).FirstOrDefault<WeekendHolidays>();

                                weekend.ModifiedBy = currentUser.EmployeeId;
                                weekend.Description = weekendHolidays.Description;
                                weekend.Value = weekendHolidays.Value;
                                weekend.ModifiedOn = DateTime.Now;
                                payrollDbContext.Entry(weekend).State = EntityState.Modified;
                                payrollDbContext.SaveChanges();
                            }
                            else
                            {
                                weekendHolidays.IsApproved = true;
                                weekendHolidays.CreatedBy = currentUser.EmployeeId;
                                payrollDbContext.WeekendHolidays.Add(weekendHolidays);
                                payrollDbContext.SaveChanges();
                            }
                        }

                    }
                    responseData.Status = "OK";
                }
                else if (reqType == "post-holiday-details")
                {
                    HolidayModel holidayModel = DanpheJSONConvert.DeserializeObject<HolidayModel>(str);
                    if (holidayModel != null)
                    {
                        holidayModel.CreatedOn = DateTime.Now;
                        holidayModel.ApprovedBy = holidayModel.CreatedBy;
                        payrollDbContext.HolidayList.Add(holidayModel);
                        payrollDbContext.SaveChanges();
                    }
                    responseData.Status = "OK";

                }
                else if (reqType == "post-leave-rules")
                {
                    LeaveRuleModel leaveRuleModel = DanpheJSONConvert.DeserializeObject<LeaveRuleModel>(str);
                    if (leaveRuleModel != null)

                    {
                        LeaveRuleModel leaveRuleModelDB = payrollDbContext.leaveRuleModels.Where(r => r.LeaveCategoryId == leaveRuleModel.LeaveCategoryId
                        && r.Year == leaveRuleModel.Year).FirstOrDefault<LeaveRuleModel>();
                        if (leaveRuleModelDB == null)
                        {
                            leaveRuleModel.CreatedBy = currentUser.EmployeeId;
                            leaveRuleModel.CreatedOn = DateTime.Now;
                            leaveRuleModel.ApprovedBy = currentUser.EmployeeId;
                            payrollDbContext.leaveRuleModels.Add(leaveRuleModel);
                            payrollDbContext.SaveChanges();
                            responseData.Status = "OK";
                        }
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = "Already CategoryName is add for this year...";
                        }


                    }
                }
                else if (reqType == "AddLeaveCategory")
                {
                    LeaveCategory leave = DanpheJSONConvert.DeserializeObject<LeaveCategory>(str);
                    if (payrollDbContext.leaveCategories.Any(r => r.LeaveCategoryName == leave.LeaveCategoryName || r.CategoryCode == leave.CategoryCode))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        leave.CreatedOn = System.DateTime.Now;
                        payrollDbContext.leaveCategories.Add(leave);
                        payrollDbContext.SaveChanges();
                        responseData.Results = leave;
                        responseData.Status = "OK";
                    }
                }
                else if(reqType == "post-emp-leave-requests")
                {

                    List<EmployeeLeaveModel>  leaveList = DanpheJSONConvert.DeserializeObject<List<EmployeeLeaveModel>>(str);
                    if (leaveList.Count > 0)
                    {
                        foreach (var request in leaveList)
                        {
                            request.CreatedOn = System.DateTime.Now;
                            request.LeaveStatus = "pending";
                            request.CreatedBy = currentUser.EmployeeId;
                            payrollDbContext.employeeLeaveModels.Add(request);
                            payrollDbContext.SaveChanges();
                            responseData.Results = request;
                            responseData.Status = "OK";
                        }
                    }
                    else
                    {
                        responseData.Status = "Failed";
                    }
                }
                else if (reqType == "post-holiday-list-to-daily-muster")
                {
                    List<DailyMuster> dailyMusters = DanpheJSONConvert.DeserializeObject<List<DailyMuster>>(str);

                    foreach (var dm in dailyMusters)
                    {
                        var results = (from att in payrollDbContext.dailyMusters
                                       where att.EmployeeId == dm.EmployeeId
                                       select att).FirstOrDefault();
                        //&& results.Day != dm.Day && results.EmployeeId != dm.EmployeeId
                        if (results != null)
                        {
                            results.EmployeeId = dm.EmployeeId;
                            results.Day = dm.Day;
                            results.Month = dm.Month;
                            results.Year = dm.Year;
                            results.TimeIn = dm.TimeIn;
                            results.TimeOut = dm.TimeOut;
                            results.AttStatus = dm.AttStatus;
                            results.Present = dm.Present;
                            //  results.Title = dm.Title;
                            payrollDbContext.Entry(results).State = EntityState.Modified;
                            payrollDbContext.SaveChanges();
                        }
                        else
                        {
                            payrollDbContext.dailyMusters.Add(dm);
                        }
                    }
                    payrollDbContext.SaveChanges();
                    responseData.Status = "OK";
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
            PayrollDbContext payrollDbContext = new PayrollDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();
            try
            {
                if (reqType == "put-changed-attendance")
                {
                    DailyMuster dailyMuster = DanpheJSONConvert.DeserializeObject<DailyMuster>(str);
                    DailyMuster dailyMusterDB = payrollDbContext.dailyMusters
                     .Where(r => r.EmployeeId == dailyMuster.EmployeeId &&
                     r.Day == dailyMuster.Day && r.Month == dailyMuster.Month
                     && r.Year == dailyMuster.Year).FirstOrDefault<DailyMuster>();

                    if (dailyMusterDB != null)
                    {

                        dailyMusterDB.AttStatus = dailyMuster.AttStatus;
                        dailyMusterDB.Present = dailyMuster.Present;
                        dailyMusterDB.ColorCode = dailyMuster.ColorCode;
                        payrollDbContext.Entry(dailyMusterDB).State = EntityState.Modified;
                    }
                    else
                    {
                        payrollDbContext.dailyMusters.Add(dailyMuster);
                    }
                    payrollDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "put-leave-rules")
                {
                    LeaveRuleModel leaveRuleModel = DanpheJSONConvert.DeserializeObject<LeaveRuleModel>(str);

                    LeaveRuleModel leaveRuleModelDB = payrollDbContext.leaveRuleModels.Where(r => r.LeaveRuleId == leaveRuleModel.LeaveRuleId).FirstOrDefault<LeaveRuleModel>();

                    leaveRuleModelDB.IsActive = leaveRuleModel.IsActive;
                    leaveRuleModelDB.ModifiedBy = currentUser.EmployeeId;
                    leaveRuleModelDB.PayPercent = leaveRuleModel.PayPercent;
                    leaveRuleModelDB.Days = leaveRuleModel.Days;
                    // leaveRuleModelDB.LeaveCategoryId = leaveRuleModel.LeaveCategoryId;
                    leaveRuleModelDB.IsApproved = leaveRuleModel.IsApproved;
                    leaveRuleModelDB.ModifiedOn = DateTime.Now;
                    payrollDbContext.Entry(leaveRuleModelDB).Property(a => a.CreatedOn).IsModified = false;
                    payrollDbContext.Entry(leaveRuleModelDB).Property(a => a.CreatedBy).IsModified = false;
                    payrollDbContext.Entry(leaveRuleModelDB).State = EntityState.Modified;
                    payrollDbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "PutLeaveCategory")
                {
                    LeaveCategory leave = DanpheJSONConvert.DeserializeObject<LeaveCategory>(str);
                    var led = payrollDbContext.leaveCategories.Where(s => s.LeaveCategoryId == leave.LeaveCategoryId).FirstOrDefault();
                    if (payrollDbContext.leaveCategories.Any(r => (r.LeaveCategoryName == leave.LeaveCategoryName || r.CategoryCode == leave.CategoryCode) && r.LeaveCategoryId != leave.LeaveCategoryId))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        if (led != null)
                        {
                            led.IsActive = leave.IsActive;
                            led.LeaveCategoryName = leave.LeaveCategoryName;
                            led.CategoryCode = leave.CategoryCode;
                            led.Description = leave.Description;
                            payrollDbContext.leaveCategories.Attach(led);
                            payrollDbContext.Entry(led).Property(x => x.IsActive).IsModified = true;
                            payrollDbContext.Entry(led).Property(x => x.CategoryCode).IsModified = true;
                            payrollDbContext.Entry(led).Property(x => x.LeaveCategoryName).IsModified = true;
                            payrollDbContext.Entry(led).Property(x => x.Description).IsModified = true;
                            payrollDbContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = led;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
