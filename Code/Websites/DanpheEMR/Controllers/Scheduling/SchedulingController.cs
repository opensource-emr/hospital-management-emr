using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.Utilities;
using DanpheEMR.ServerModel.SchedulingModels;
using System.Data.Entity;
using System.Data.SqlClient;
using DanpheEMR.Security;
using System.Data;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using Newtonsoft.Json.Linq;
using System.Xml;
using DanpheEMR.ServerModel;
using DanpheEMR.Core.Caching;

namespace DanpheEMR.Controllers
{
    public class SchedulingController : CommonController
    {
        public SchedulingController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        [HttpGet]
        public string Get(string reqType, string EmpIds, string dates)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            SchedulingDbContext schDbContext = new SchedulingDbContext(connString);
            MasterDbContext masterDb = new MasterDbContext(connString);

            try
            {
                List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);

                #region GET: List of Employees
                if (reqType == "employeelist")
                {
                    var result = (from e in empListFromCache
                                  join d in allDeptsFromCache on e.DepartmentId equals d.DepartmentId
                                  select new
                                  {
                                      e.EmployeeId,
                                      d.DepartmentId,
                                      d.DepartmentName,
                                      EmployeeName = e.Salutation + ". " + e.FirstName + " " + (string.IsNullOrEmpty(e.MiddleName) ? "" : e.MiddleName + " ") + e.LastName,
                                  }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region GET: Employee Schedules
                else if (reqType == "getEmpSchedule")
                {
                    string[] employeeIDs = EmpIds.Split(',');
                    string[] curDates = dates.Split(',');
                    List<object> res = new List<object>();

                    var abc = (from emp in empListFromCache
                               join dept in allDeptsFromCache on emp.DepartmentId equals dept.DepartmentId
                               join e in employeeIDs on emp.EmployeeId.ToString() equals e
                               select new
                               {
                                   emp.EmployeeId,
                                   EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                   DepartmentName = dept.DepartmentName,
                                   defSCH = (from daywise in schDbContext.DayWiseAvailability
                                             where daywise.EmployeeId == emp.EmployeeId
                                             select new
                                             {
                                                 daywise.DayName,
                                                 IsWorkingDay = daywise.IsWorking
                                             }).ToList(),
                                   loadSCH = (from em in schDbContext.Employee
                                              join sch in schDbContext.EmpSchedules on em.EmployeeId equals sch.EmployeeId into schTemp
                                              from s in schTemp.DefaultIfEmpty()
                                              join date in curDates on s.Date.ToString() equals date
                                              where em.EmployeeId == emp.EmployeeId
                                              select new
                                              {
                                                  Id = s.EmployeeSCHId,
                                                  TxnType = "Update",
                                                  Date = s.Date.Value,
                                                  s.DayName,
                                                  s.IsWorkingDay
                                              }).ToList(),
                               }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = abc;
                }
                #endregion
                #region GET: list of shifts master
                else if (reqType == "getShiftList")
                {
                    var shiftList = schDbContext.ShiftsMaster.OrderByDescending(a => a.IsDefault).ToList();

                    responseData.Status = "OK";
                    responseData.Results = shiftList;
                }
                #endregion
                #region GET: list of Employee working hours
                else if (reqType == "getEmpWHList")
                {
                    List<object> res = new List<object>();

                    var empDetails = (from emp in masterDb.Employees
                                      join dept in masterDb.Departments on emp.DepartmentId equals dept.DepartmentId
                                      join role in masterDb.EmployeeRole on emp.EmployeeRoleId equals role.EmployeeRoleId
                                      select new
                                      {
                                          emp.EmployeeId,
                                          EmployeeName = emp.Salutation + ". " + emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                          emp.DepartmentId,
                                          dept.DepartmentName,
                                          emp.EmployeeRoleId,
                                          role.EmployeeRoleName
                                      }).ToList();

                    var empWorkingHours = (from emp in empDetails
                                           join m in schDbContext.EmpShiftMAP on emp.EmployeeId equals m.EmployeeId into mTemp
                                           from map in mTemp.DefaultIfEmpty()
                                           join shift in schDbContext.ShiftsMaster on (map != null ? map.ShiftId : 0) equals shift.ShiftId
                                           where (map != null ? map.IsActive : false) == true
                                           group new { emp, map, shift } by new
                                           {
                                               emp.EmployeeId,
                                               emp.EmployeeName,
                                               emp.EmployeeRoleName,
                                               emp.DepartmentName
                                           } into WH
                                           select new
                                           {
                                               WH.Key.EmployeeId,
                                               WH.Key.EmployeeName,
                                               WH.Key.DepartmentName,
                                               WH.Key.EmployeeRoleName,
                                               NoOfShifts = WH.Select(a => a.map.ShiftId).Count(),
                                               Shifts = WH.Select(a => new
                                               {
                                                   a.map.EmployeeShiftMapId,
                                                   a.map.ShiftId,
                                                   a.shift.ShiftName,
                                                   a.shift.StartTime,
                                                   a.shift.EndTime,
                                                   a.shift.TotalHrs,
                                                   a.map.IsActive,
                                                   a.shift.IsDefault
                                                   //,IsEditable = (from m in schDbContext.EmpShiftMAP
                                                   //              where m.ShiftId == a.map.ShiftId
                                                   //              select new { m.ShiftId }).Count().Equals(1)
                                               }).OrderBy(z => z.StartTime).ToList(),
                                               TotalWorkingHrs = WH.Sum(a => a.shift.TotalHrs)
                                           }).ToList();

                    var empNOworkingHours = (from emp in empDetails
                                             where !schDbContext.EmpShiftMAP.Any(x => x.EmployeeId == emp.EmployeeId && x.IsActive == true)
                                             select new
                                             {
                                                 emp.EmployeeId,
                                                 emp.EmployeeName,
                                                 emp.EmployeeRoleName,
                                                 emp.DepartmentName,
                                                 NoOfShifts = 0,
                                                 TotalWorkingHrs = 0
                                             }).ToList();

                    foreach (var x in empWorkingHours)
                    {
                        res.Add(x);
                    }
                    foreach (var x in empNOworkingHours)
                    {
                        res.Add(x);
                    }

                    //var workingHours = (from map in schDbContext.EmpShiftMAP
                    //                    join e in schDbContext.Employee on map.EmployeeId equals e.EmployeeId
                    //                    join d in allDepts on e.DepartmentId equals d.DepartmentId
                    //                    join s in schDbContext.ShiftsMaster on map.ShiftId equals s.ShiftId
                    //                    join r in schDbContext.EmpRole on e.EmployeeRoleId equals r.EmployeeRoleId
                    //                    where map.IsActive == true
                    //                    group new { map, e, s } by new
                    //                    {
                    //                        e.EmployeeId,
                    //                        EmployeeName = e.Salutation + ". " + e.FirstName + " " + (string.IsNullOrEmpty(e.MiddleName) ? "" : e.MiddleName + " ") + e.LastName,
                    //                        d.DepartmentId,
                    //                        d.DepartmentName,
                    //                        r.EmployeeRoleName
                    //                    } into x
                    //                    select new
                    //                    {
                    //                        x.Key.EmployeeId,
                    //                        x.Key.EmployeeName,
                    //                        x.Key.DepartmentId,
                    //                        x.Key.DepartmentName,
                    //                        x.Key.EmployeeRoleName,
                    //                        NoOfShifts = x.Select(a => a.map.ShiftId).Count(),
                    //                        Shifts = x.Select(a => new
                    //                        {
                    //                            a.map.EmployeeShiftMapId,
                    //                            a.map.ShiftId,
                    //                            a.s.ShiftName,
                    //                            a.s.StartTime,
                    //                            a.s.EndTime,
                    //                            a.s.TotalHrs,
                    //                            a.map.IsActive,
                    //                            a.s.IsDefault
                    //                            //,IsEditable = (from m in schDbContext.EmpShiftMAP
                    //                            //              where m.ShiftId == a.map.ShiftId
                    //                            //              select new { m.ShiftId }).Count().Equals(1)
                    //                        }).OrderBy(z => z.StartTime).ToList(),
                    //                        TotalWorkingHrs = x.Sum(a => a.s.TotalHrs)
                    //                    }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = res;
                }
                #endregion
                #region GET: list of default shifts master
                else if (reqType == "getDefaultShifts")
                {
                    var defShifts = (from s in schDbContext.ShiftsMaster
                                     where s.IsDefault == true
                                     select s).OrderBy(x => x.StartTime).ToList();

                    responseData.Status = "OK";
                    responseData.Results = defShifts;
                }
                #endregion
                #region
                else if (reqType == "getEmployeeNoShift")
                {
                    //getting employee that doesnt have any active shift assigned to him/her (from EmployeeShiftMAP table)
                    var empList = (from e in empListFromCache
                                   where !schDbContext.EmpShiftMAP.Any(x => x.EmployeeId == e.EmployeeId && x.IsActive == true)
                                   select e).ToList();

                    responseData.Status = "OK";
                    responseData.Results = empList;
                }
                #endregion
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
            SchedulingDbContext schDbContext = new SchedulingDbContext(connString);
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();

            try
            {
                #region Employee Schedule manage : Insert/Update schedules
                if (reqType == "manageEmpSchedules")
                {
                    List<EmpSchedules> schedulesData = DanpheJSONConvert.DeserializeObject<List<EmpSchedules>>(str);

                    Boolean Flag = false;
                    Flag = SchedulingBL.ManageEmpSchedules(schedulesData, schDbContext);
                    if (Flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "check console for error details.";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region Add Shift (Manage Shifts)
                else if (reqType == "AddShift")
                {
                    ShiftsMasterModel shiftMaster = DanpheJSONConvert.DeserializeObject<ShiftsMasterModel>(str);
                    shiftMaster.CreatedOn = System.DateTime.Now;
                    schDbContext.ShiftsMaster.Add(shiftMaster);
                    schDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = shiftMaster;
                }
                #endregion
                #region Employee Working Hours manage Transaction
                else if (reqType == "EmpWokringHours")
                {
                    WorkingHoursTxnVM workHrsTxnData = DanpheJSONConvert.DeserializeObject<WorkingHoursTxnVM>(str);

                    Boolean Flag = false;
                    Flag = SchedulingBL.WorkingHrsTxn(workHrsTxnData, schDbContext);
                    if (Flag)
                    {
                        responseData.Status = "OK";
                        responseData.Results = 1;
                    }
                    else
                    {
                        responseData.ErrorMessage = "check console for error details.";
                        responseData.Status = "Failed";
                    }
                }
                #endregion
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
            SchedulingDbContext schDbContext = new SchedulingDbContext(connString);
            string reqType = this.ReadQueryStringData("reqType");
            string str = this.ReadPostData();

            try
            {
                #region Update Shifts (Manage Shifts)
                if (reqType == "UpdateShift")
                {
                    ShiftsMasterModel shiftData = DanpheJSONConvert.DeserializeObject<ShiftsMasterModel>(str);
                    shiftData.ModifiedOn = System.DateTime.Now;
                    schDbContext.ShiftsMaster.Attach(shiftData);
                    schDbContext.Entry(shiftData).State = EntityState.Modified;
                    schDbContext.Entry(shiftData).Property(x => x.CreatedOn).IsModified = false;
                    schDbContext.Entry(shiftData).Property(x => x.CreatedBy).IsModified = false;
                    schDbContext.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = shiftData;
                }
                #endregion
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {

        }
    }
}
