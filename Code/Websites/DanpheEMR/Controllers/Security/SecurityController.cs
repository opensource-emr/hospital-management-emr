using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;

namespace DanpheEMR.Controllers
{

    public class SecurityController : CommonController
    {

        private readonly string fileUploadLocation = null;
        public SecurityController(IOptions<MyConfiguration> _config) : base(_config)
        {
            fileUploadLocation = _config.Value.FileStorageRelativeLocation;
        }
        // GET: api/values
        [HttpGet]
        public string Get(int userId, string reqType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (reqType == "loggedInUser")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    MasterDbContext masterDbContext = new MasterDbContext(connString);
                    string userImgName = (from x in masterDbContext.Employees
                                          where x.EmployeeId == currentUser.EmployeeId
                                          select x.ImageName).FirstOrDefault();

                    EmployeeModel employee = (from x in masterDbContext.Employees
                                              where x.EmployeeId == currentUser.EmployeeId
                                              select x).FirstOrDefault();

                    string imgLocation = string.IsNullOrEmpty(userImgName) ? "" : fileUploadLocation + "UserProfile\\" + userImgName;

                    //start: to get default route for current user.
                    List<RbacRole> usrAllRoles = RBAC.GetUserAllRoles(currentUser.UserId);
                    RbacRole defRole = usrAllRoles != null && usrAllRoles.Count > 0 ? usrAllRoles.OrderBy(r => r.RolePriority).FirstOrDefault() : null;
                    int? defRouteId = defRole != null ? defRole.DefaultRouteId : 0;

                    string defaultRoutePath = null;

                    if (defRouteId.HasValue)
                    {
                        List<DanpheRoute> allRoutes = RBAC.GetAllRoutes();
                        DanpheRoute defRoute = allRoutes.Where(r => r.RouteId == defRouteId.Value).FirstOrDefault();
                        if (defRoute != null)
                        {
                            defaultRoutePath = defRoute.UrlFullPath;
                        }
                    }

                    //end: to get default route for current user.

                    //Ajay 07 Aug 2019
                    //getting LandingPageRouteId
                    var landingPageRouteId = (new RbacDbContext(connString)).Users
                        .Where(a => a.UserId == currentUser.UserId)
                        .Select(a => a.LandingPageRouteId).FirstOrDefault();

                    responseData.Results = new
                    {
                        UserId = currentUser.UserId,
                        UserName = currentUser.UserName,
                        EmployeeId = currentUser.EmployeeId,
                        Profile = new { ImageLocation = imgLocation },
                        NeedsPasswordUpdate = currentUser.NeedsPasswordUpdate,
                        DefaultPagePath = defaultRoutePath,
                        Employee = employee,
                        LandingPageRouteId = landingPageRouteId
                    };
                    responseData.Status = "OK";
                }
                else if (reqType != null && reqType.ToLower() == "routelist")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    if (currentUser != null)
                    {
                        var currentUserId = currentUser.UserId;
                        List<DanpheRoute> routeList = new List<DanpheRoute>();
                        //we need to get routes with defaultshow=false and no need of hierarchy.
                        routeList = RBAC.GetRoutesForUser(currentUser.UserId, getHiearrchy: false);
                        responseData.Results = routeList;
                        responseData.Status = "OK";
                        //set session of Valid routeList for loggedin user
                        HttpContext.Session.Set<List<DanpheRoute>>("validRouteList", routeList);
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "User is Not valid";
                    }

                }
                else if (reqType != null && reqType == "validallrouteList")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    if (currentUser != null)
                    {
                        var currentUserId = currentUser.UserId;
                        List<DanpheRoute> routeList = new List<DanpheRoute>();
                        routeList = RBAC.GetRoutesForUser(currentUser.UserId, getHiearrchy: true);

                        var filteredRoutes = routeList.Where(r => r.DefaultShow != false && r.IsActive == true).ToList();
                        filteredRoutes.ForEach(r =>
                        {
                            if (r.ChildRoutes != null)
                            {
                                r.ChildRoutesDefaultShowCount = r.ChildRoutes.Where(c => c.DefaultShow == true).Count();
                            }
                            else
                            {
                                r.ChildRoutesDefaultShowCount = 0;
                            }
                        });
                        responseData.Results = filteredRoutes;
                        responseData.Status = "OK";
                        HttpContext.Session.Set<List<DanpheRoute>>("validallrouteList", filteredRoutes);
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "User is Not valid";
                    }
                }
                else if (reqType != null && reqType == "userPermissionList")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    List<RbacPermission> userPermissions = new List<RbacPermission>();
                    if (currentUser != null)
                    {
                        int currentUserId = currentUser.UserId;
                        //get permissions of user
                        userPermissions = RBAC.GetUserAllPermissions(currentUserId);
                        //set session of valid user permission
                        HttpContext.Session.Set<List<RbacPermission>>("userAllPermissions", userPermissions);
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Invalid User.";
                    }

                    responseData.Results = userPermissions;
                }
                else if (reqType == "activeBillingCounter")
                {
                    string activeCounterId = HttpContext.Session.Get<string>("activeBillingCounter");
                    int actCounterId;
                    int.TryParse(activeCounterId, out actCounterId);
                    responseData.Results = actCounterId;
                    responseData.Status = "OK";
                }
                else if (reqType == "activePharmacyCounter")
                {
                    string activeCounterId = HttpContext.Session.Get<string>("activePharmacyCounter");
                    int actCounterId;
                    int.TryParse(activeCounterId, out actCounterId);
                    string activeCounterName = HttpContext.Session.Get<string>("activePharmacyCounterName");
                    PHRMCounter counter = new PHRMCounter();
                    counter.CounterId = actCounterId;
                    counter.CounterName = activeCounterName;
                    responseData.Results = counter;
                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            var routelist = DanpheJSONConvert.SerializeObject(responseData, true);
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut]
        public string Put(string reqType, int counterId, string counterName)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            if (reqType == "activateBillingCounter" && counterId != 0)
            {
                HttpContext.Session.Set<string>("activeBillingCounter", counterId.ToString());
                responseData.Status = "OK";
                responseData.Results = counterId;
            }

            else if (reqType == "activatePharmacyCounter" && counterId != 0)
            {
                HttpContext.Session.Set<string>("activePharmacyCounter", counterId.ToString());
                HttpContext.Session.Set<string>("activePharmacyCounterName", counterName.ToString());
                PHRMCounter counter = new PHRMCounter();
                counter.CounterId = counterId;
                counter.CounterName = counterName;
                responseData.Results = counter;
                responseData.Status = "OK";
                responseData.Results = counter;
            }
            else if (reqType == "deActivateBillingCounter")
            {
                HttpContext.Session.Remove("activeBillingCounter");
                responseData.Status = "OK";
            }

            else if (reqType == "deActivatePharmacyCounter")
            {
                HttpContext.Session.Remove("activePharmacyCounter");
                responseData.Status = "OK";
            }
            else
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Invalid request or invalid CounterId";
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }



        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

