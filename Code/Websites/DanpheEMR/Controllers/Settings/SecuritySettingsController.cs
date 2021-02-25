using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.Helpers;//for appointmenthelpers
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Core;
using Microsoft.AspNetCore.Http;

namespace DanpheEMR.Controllers
{

    public class SecuritySettingsController : CommonController
    {

        public SecuritySettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        [HttpGet]
        public string Get(string department,
            string servDeptName,
            string reqType,
            int providerId,
            int patientId,
            int employeeId,
            DateTime requestDate,
            int roleId,
            int userId,
            int bedId,
            int itemId,
            int serviceDeptId,
            string status,
            int templateId,
            bool ShowIsActive,
            bool showInactiveItems = false)
        {
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "get-security-application")
                {
                    var appList = rbacDbContext.Applications.Include("Permissions").OrderBy(p => p.ApplicationName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = appList;
                }
                else if (reqType == "get-security-route")
                {
                    var routeList = rbacDbContext.Routes.ToList();
                    responseData.Status = "OK";
                    responseData.Results = routeList;
                }
                else if (reqType == "get-security-permission")
                {
                    var permissionList = (from p in rbacDbContext.Permissions.Include("Application")
                                          select new
                                          {
                                              PermissionId = p.PermissionId,
                                              PermissionName = p.PermissionName,
                                              ApplicationId = p.ApplicationId,
                                              ApplicationName = p.Application.ApplicationName,
                                              CreatedBy = p.CreatedBy,
                                              IsActive = p.IsActive,
                                              CreatedOn = p.CreatedOn,
                                          })
                                          .OrderBy(p => p.ApplicationId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = permissionList;
                }
                else if (reqType == "get-security-role")
                {
                    var roleList = (from r in rbacDbContext.Roles.Include("Route").Include("Application").Where(r => r.IsSysAdmin == false)
                                    select new
                                    {
                                        RoleId = r.RoleId,
                                        RoleName = r.RoleName,
                                        RolePriority = r.RolePriority,
                                        RoleDescription = r.RoleDescription,
                                        RoleType = r.RoleType,
                                        ApplicationId = r.ApplicationId,
                                        ApplicationName = r.Application.ApplicationName,
                                        DefaultRouteId = r.DefaultRouteId,
                                        DefaultRouteName = r.Route.DisplayName,
                                        CreatedOn = r.CreatedOn,
                                        CreatedBy = r.CreatedBy
                                    }).OrderBy(r => r.RoleName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = roleList;
                }
                else if (reqType == "get-security-user")
                {


                    var allUsrs = (from r in rbacDbContext.Users.Include("Employee")
                                   select r).ToList();
                    //we cannot perform Linq to SQL for derived properties (eg: Employee.FullName) so doing that in-Memory.
                    var retUserList = (from r in allUsrs
                                       join dept in masterDbContext.Departments on r.Employee.DepartmentId equals dept.DepartmentId
                                       select new
                                       {
                                           UserId = r.UserId,
                                           EmployeeId = r.EmployeeId,
                                           UserName = r.UserName,
                                           Email = r.Email,
                                           EmployeeName = r.Employee.FullName,
                                           FirstName = r.Employee.FirstName,
                                           LastName = r.Employee.LastName,
                                           CreatedOn = r.CreatedOn,
                                           CreatedBy = r.CreatedBy,
                                           IsActive = r.IsActive,
                                           // Password=r.Password,
                                           // Password = RBAC.DecryptPassword(r.Password),
                                           NeedsPasswordUpdate = r.NeedsPasswordUpdate,
                                           DepartmentName = dept.DepartmentName

                                       }).OrderBy(e => e.FirstName).ThenBy(e=> e.LastName).ToList();

                    responseData.Status = "OK";
                    responseData.Results = retUserList;
                }
                else if (reqType == "get-security-rolepermission")
                {
                    var rolePermissionList = (from r in rbacDbContext.RolePermissionMaps.Include("Role").Include("Permission").Include("Application")
                                              where (r.RoleId == roleId)
                                              select new
                                              {
                                                  RolePermissionMapId = r.RolePermissionMapId,
                                                  RoleId = r.RoleId,
                                                  PermissionId = r.PermissionId,
                                                  RoleName = r.Role.RoleName,
                                                  PermissionName = r.Permission.PermissionName,
                                                  CreatedOn = r.CreatedOn,
                                                  CreatedBy = r.CreatedBy,
                                                  ApplicationId = r.Permission.ApplicationId,
                                                  ApplicationName = r.Permission.Application.ApplicationName,
                                                  IsActive = r.IsActive
                                              }).OrderBy(r => r.PermissionName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = rolePermissionList;
                }
                else if (reqType == "get-security-userrole")
                {
                    var rolePermissionList = (from r in rbacDbContext.UserRoleMaps.Include("User").Include("Role")
                                              where (r.UserId == userId)
                                              select new
                                              {
                                                  UserRoleMapId = r.UserRoleMapId,
                                                  RoleId = r.RoleId,
                                                  UserId = r.UserId,
                                                  UserName = r.User.UserName,
                                                  RoleName = r.Role.RoleName,
                                                  CreatedOn = r.CreatedOn,
                                                  CreatedBy = r.CreatedBy,
                                                  IsActive = r.IsActive
                                              }).OrderBy(r => r.RoleId).ToList();
                    responseData.Status = "OK";
                    responseData.Results = rolePermissionList;
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // POST api/values
        [HttpPost]
        public string Post(int? roleId)
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            LabDbContext labDbContext = new LabDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);

            try
            {
                string serviceDepartment = this.ReadQueryStringData("serviceDepartment");
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");


                if (reqType == "post-security-user")
                {
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    /// We  are Encrepting Current Enter Password of USer And Storing Encrepted Password In RBAC_User Table  ----Compulsory (IMP)                   
                    user.Password = RBAC.EncryptPassword(user.Password);
                    rbacDbContext.Users.Add(user);
                    rbacDbContext.SaveChanges();

                    var currEmployee = rbacDbContext.Employees.Where(e => e.EmployeeId == user.EmployeeId).FirstOrDefault();


                    var retUser = new
                    {
                        UserId = user.UserId,
                        EmployeeId = user.EmployeeId,
                        UserName = user.UserName,
                        Email = user.Email,
                        EmployeeName = currEmployee != null ? currEmployee.FullName : null,//to handle nullReference Exception.
                        CreatedOn = user.CreatedOn,
                        CreatedBy = user.CreatedBy,
                        IsActive = user.IsActive
                    };
                    responseData.Results = retUser;


                    responseData.Status = "OK";

                }

                else if (reqType == "post-security-role")
                {
                    RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(str);
                    rbacDbContext.Roles.Add(role);
                    rbacDbContext.SaveChanges();
                    responseData.Results = role;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-security-rolePermission")
                {

                    if (roleId != null)
                    {
                        

                        //step:1--Remove all existing mappings of this role.
                        List<RolePermissionMap> existingMapping = rbacDbContext.RolePermissionMaps.Where(r => r.RoleId == roleId).ToList();
                        if(existingMapping!=null && existingMapping.Count > 0)
                        {

                            foreach (RolePermissionMap map in existingMapping)
                            {
                                rbacDbContext.RolePermissionMaps.Remove(map);
                            }
                            rbacDbContext.SaveChanges();

                        }


                        //step:2 -- Add new rolePermissions to this role.

                        List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(str);
                        rolePermissions.ForEach(roleP =>
                        {
                            rbacDbContext.RolePermissionMaps.Add(roleP);
                        });

                        rbacDbContext.SaveChanges();
                        responseData.Status = "OK";
                    }                    
                }
                else if (reqType == "post-security-userRole")
                {
                    List<UserRoleMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(str);
                    rolePermissions.ForEach(userRole =>
                    {
                        rbacDbContext.UserRoleMaps.Add(userRole);
                    });

                    rbacDbContext.SaveChanges();
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

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string str = this.ReadPostData();
            MasterDbContext masterDBContext = new MasterDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                if (reqType == "put-security-user")
                {
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    rbacDbContext.Users.Attach(user);
                    rbacDbContext.Entry(user).State = EntityState.Modified;
                    rbacDbContext.Entry(user).Property(x => x.CreatedOn).IsModified = false;
                    rbacDbContext.Entry(user).Property(x => x.CreatedBy).IsModified = false;
                    rbacDbContext.SaveChanges();
                    responseData.Results = user;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-security-role")
                {
                    RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(str);
                    rbacDbContext.Roles.Attach(role);
                    rbacDbContext.Entry(role).State = EntityState.Modified;
                    rbacDbContext.Entry(role).Property(x => x.CreatedOn).IsModified = false;
                    rbacDbContext.Entry(role).Property(x => x.CreatedBy).IsModified = false;
                    rbacDbContext.SaveChanges();
                    responseData.Results = role;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-security-rolePermission")
                {
                    List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(str);
                    rolePermissions.ForEach(roleP =>
                    {
                        rbacDbContext.RolePermissionMaps.Attach(roleP);
                        rbacDbContext.Entry(roleP).State = EntityState.Modified;
                        rbacDbContext.Entry(roleP).Property(x => x.CreatedOn).IsModified = false;
                        rbacDbContext.Entry(roleP).Property(x => x.CreatedBy).IsModified = false;
                    });
                    rbacDbContext.SaveChanges();
                    responseData.Status = "OK";

                }
                else if (reqType == "put-security-userRole")
                {
                    List<UserRoleMap> userRoles = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(str);
                    userRoles.ForEach(userRole =>
                    {
                        rbacDbContext.UserRoleMaps.Attach(userRole);
                        rbacDbContext.Entry(userRole).State = EntityState.Modified;
                        rbacDbContext.Entry(userRole).Property(x => x.CreatedOn).IsModified = false;
                        rbacDbContext.Entry(userRole).Property(x => x.CreatedBy).IsModified = false;
                    });
                    rbacDbContext.SaveChanges();
                    responseData.Status = "OK";

                }
                else if (reqType == "put-security-reset-password")
                {
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    //encrepting current entered password and updating in table
                    user.Password = RBAC.EncryptPassword(user.Password);

                    rbacDbContext.Users.Attach(user);
                    ///while password reset: we've to modify only below 4 fields of the user table.
                    rbacDbContext.Entry(user).Property(x => x.ModifiedBy).IsModified = true;
                    rbacDbContext.Entry(user).Property(x => x.ModifiedOn).IsModified = true;
                    rbacDbContext.Entry(user).Property(x => x.Password).IsModified = true;
                    rbacDbContext.Entry(user).Property(x => x.NeedsPasswordUpdate).IsModified = true;

                    rbacDbContext.SaveChanges();
                    responseData.Results = user;
                    responseData.Status = "OK";

                }
                else if (reqType == "put-security-user-isactive")
                {
                    RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
                    //encrepting current entered password and updating in table
                    // user.Password = RBAC.EncryptPassword(user.Password);

                    rbacDbContext.Users.Attach(user);

                    rbacDbContext.Entry(user).Property(x => x.IsActive).IsModified = true;
                    rbacDbContext.SaveChanges();
                    responseData.Results = user;
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



        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

    }
}