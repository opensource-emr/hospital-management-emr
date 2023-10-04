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


namespace DanpheEMR.Controllers
{

    public class SecuritySettingsController : CommonController
    {
        private readonly MasterDbContext _masterDbContext;
        private readonly RadiologyDbContext _radioDbContext;
        private readonly AdmissionDbContext _adtDbContext;
        private readonly RbacDbContext _rbacDbContext;
        private readonly BillingDbContext _billingDbContext;
        private object ipDataStr;

        public SecuritySettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _masterDbContext = new MasterDbContext(connString);
            _radioDbContext = new RadiologyDbContext(connString);
            _adtDbContext = new AdmissionDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);

        }

        #region Get APIs

        [HttpGet]
        [Route("Applications")]
        public IActionResult Applications()
        {
            // if (reqType == "get-security-application")
            Func<object> func = () => (from p in _rbacDbContext.Applications.Include(a=>a.Permissions)
                                       select new 
                                       {
                                           ApplicationCode = p.ApplicationCode,
                                           ApplicationId = p.ApplicationId,
                                           ApplicationName = p.ApplicationName,
                                           CreatedBy = p.CreatedBy,
                                           CreatedOn = p.CreatedOn,
                                           Description = p.Description,
                                           IsActive = p.IsActive,
                                           ModifiedBy = p.ModifiedBy,
                                           Permissions = p.Permissions,
                                           Roles = p.Roles,
                                           ModifiedOn = p.ModifiedOn,
                                       })
                                       .OrderBy(p => p.ApplicationName).ToList();

            return InvokeHttpGetFunction(func);
        }



        [HttpGet]
        [Route("Routes")]
        public IActionResult Routes()
        {
            // if (reqType == "get-security-route")
            Func<object> func = () => _rbacDbContext.Routes.ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Permissions")]
        public IActionResult Permissions()
        { //if (reqType == "get-security-permission")
            Func<object> func = () => (from p in _rbacDbContext.Permissions.Include("Application")
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
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Roles")]
        public IActionResult Roles()
        {
            // if (reqType == "get-security-role")
            Func<object> func = () => (from r in _rbacDbContext.Roles.Include("Route").Include("Application").Where(r => r.IsSysAdmin == false)
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
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Users")]
        public IActionResult Users()
        {
            //if (reqType == "get-security-user")
            Func<object> func = () => GetUsers();
            return InvokeHttpGetFunction(func);
        }

        private object GetUsers()
        {
            var allUsrs = (from r in _rbacDbContext.Users.Include("Employee")
                           select r).ToList();
            var retUserList = (from r in allUsrs
                               join dept in _masterDbContext.Departments on r.Employee.DepartmentId equals dept.DepartmentId
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
                                   NeedsPasswordUpdate = r.NeedsPasswordUpdate,
                                   DepartmentName = dept.DepartmentName

                               }).OrderBy(e => e.FirstName).ThenBy(e => e.LastName).ToList();

            return retUserList;
        }
        [HttpGet]
        [Route("RolePermissions")]
        public IActionResult RolePermissions(int roleId)
        {
            // if (reqType == "get-security-rolepermission")
            Func<object> func = () => (from r in _rbacDbContext.RolePermissionMaps.Include("Role").Include("Permission").Include("Application")
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
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("UserRoles")]
        public IActionResult UserRoles(int userId)
        {
            // if (reqType == "get-security-userrole")
            Func<object> func = () => (from r in _rbacDbContext.UserRoleMaps.Include("User").Include("Role")
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
            return InvokeHttpGetFunction(func);

        }

        #endregion


        #region Post APIs

        [HttpPost]
        [Route("User")]
        public IActionResult PostUser()
        {
            //if (reqType == "post-security-user")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => SaveUser(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        private object SaveUser(string ipDataStr)
        {
            RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(ipDataStr);
            user.Password = RBAC.EncryptPassword(user.Password);
            _rbacDbContext.Users.Add(user);
            _rbacDbContext.SaveChanges();

            var currEmployee = _rbacDbContext.Employees.Where(e => e.EmployeeId == user.EmployeeId).FirstOrDefault();

            var retUser = new
            {
                UserId = user.UserId,
                EmployeeId = user.EmployeeId,
                UserName = user.UserName,
                Email = user.Email,
                EmployeeName = currEmployee != null ? currEmployee.FullName : null,
                CreatedOn = user.CreatedOn,
                CreatedBy = user.CreatedBy,
                IsActive = user.IsActive
            };
            return retUser;
        }

        [HttpPost]
        [Route("Role")]
        public IActionResult PostRole()
        { // if (reqType == "post-security-role")
            string ipdatastr = this.ReadPostData();
            Func<object> func = () => SaveRole(ipdatastr);
            return InvokeHttpPostFunction(func);

        }
        private object SaveRole(string ipDataStr)
        {
            {
                RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(ipDataStr);
                _rbacDbContext.Roles.Add(role);
                _rbacDbContext.SaveChanges();
                return role;

            }
        }

        [HttpPost]
        [Route("RolePermissions")]
        public IActionResult PostRolePermissions(int roleId)
        {
            //if (reqType == "post-security-rolePermission")
            string ipDataStr = this.ReadPostData();
            Func<int> func = () => SaveRolePermissions(roleId, ipDataStr);
            return InvokeHttpPostFunction(func);
        }
        private int SaveRolePermissions(int roleId, string ipDataStr)
        {
            if (roleId == null)
            {
                throw new ArgumentNullException("{0} cannot be null", nameof(roleId));
            }


            //step:1--Remove all existing mappings of this role.
            List<RolePermissionMap> existingMapping = _rbacDbContext.RolePermissionMaps.Where(r => r.RoleId == roleId).ToList();
            if (existingMapping != null && existingMapping.Count > 0)
            {

                foreach (RolePermissionMap map in existingMapping)
                {
                    _rbacDbContext.RolePermissionMaps.Remove(map);
                }
                _rbacDbContext.SaveChanges();


            }
            //step:2 -- Add new rolePermissions to this role.

            List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(ipDataStr);
            rolePermissions.ForEach(roleP =>
            {
                _rbacDbContext.RolePermissionMaps.Add(roleP);
            });

            return _rbacDbContext.SaveChanges();
        }


        [HttpPost]
        [Route("UserRoles")]
        public IActionResult PostUserRoles()
        {
            //if (reqType == "post-security-userRole")
            string ipDataStr = this.ReadPostData();
            Func<int> func = () => SaveUserRoles(ipDataStr);
            return InvokeHttpPostFunction(func);

        }
        private int SaveUserRoles(string ipDataStr)
        {
            List<UserRoleMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(ipDataStr);
            rolePermissions.ForEach(userRole =>
            {
                _rbacDbContext.UserRoleMaps.Add(userRole);
            });

            return _rbacDbContext.SaveChanges();

        }



        #endregion


        #region Put APIs

        [HttpPut]
        [Route("User")]
        public IActionResult PutUser()
        {
            //if (reqType == "put-security-user")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => Updateuser(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        private object Updateuser(string ipDataStr)
        {
            RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(ipDataStr);
            _rbacDbContext.Users.Attach(user);
            _rbacDbContext.Entry(user).State = EntityState.Modified;
            _rbacDbContext.Entry(user).Property(x => x.CreatedOn).IsModified = false;
            _rbacDbContext.Entry(user).Property(x => x.CreatedBy).IsModified = false;
            _rbacDbContext.SaveChanges();
            return user;

        }



        [HttpPut]
        [Route("Role")]
        public IActionResult PutRole()
        { //if (reqType == "put-security-role")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateRole(ipDataStr);
            return InvokeHttpPutFunction(func);

        }
        private object UpdateRole(string ipDataStr)

        {
            RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(ipDataStr);
            _rbacDbContext.Roles.Attach(role);
            _rbacDbContext.Entry(role).State = EntityState.Modified;
            _rbacDbContext.Entry(role).Property(x => x.CreatedOn).IsModified = false;
            _rbacDbContext.Entry(role).Property(x => x.CreatedBy).IsModified = false;
            _rbacDbContext.SaveChanges();
            return role;

        }
        [HttpPut]
        [Route("RolePermissions")]
        public IActionResult PutRolePermissions()
        {
            // if (reqType == "put-security-rolePermission")
            string ipDataStr = this.ReadPostData();
            Func<int> func = () => UpdateRolePermissions(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        private int UpdateRolePermissions(string ipDataStr)
        {
            List<RolePermissionMap> rolePermissions = DanpheJSONConvert.DeserializeObject<List<RolePermissionMap>>(ipDataStr);
            rolePermissions.ForEach(roleP =>
            {
                _rbacDbContext.RolePermissionMaps.Attach(roleP);
                _rbacDbContext.Entry(roleP).State = EntityState.Modified;
                _rbacDbContext.Entry(roleP).Property(x => x.CreatedOn).IsModified = false;
                _rbacDbContext.Entry(roleP).Property(x => x.CreatedBy).IsModified = false;
            });
             return _rbacDbContext.SaveChanges();
            
        }

        [HttpPut]
        [Route("UserRoles")]
        public IActionResult PutUserRoles()
        {
            // if (reqType == "put-security-userRole")
            string ipDataStr = this.ReadPostData();
            Func<int> func = () => UpdateUserRoles(ipDataStr);
            return InvokeHttpPutFunction(func);

        }
        private int UpdateUserRoles(string ipDataStr)
        {
            List<UserRoleMap> userRoles = DanpheJSONConvert.DeserializeObject<List<UserRoleMap>>(ipDataStr);
            userRoles.ForEach(userRole =>
            {
                _rbacDbContext.UserRoleMaps.Attach(userRole);
                _rbacDbContext.Entry(userRole).State = EntityState.Modified;
                _rbacDbContext.Entry(userRole).Property(x => x.CreatedOn).IsModified = false;
                _rbacDbContext.Entry(userRole).Property(x => x.CreatedBy).IsModified = false;
            });
             return _rbacDbContext.SaveChanges();
            
        }
        [HttpPut]
        [Route("ResetPassword")]
        public IActionResult PutResetPassword()
        {
            // if (reqType == "put-security-reset-password")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateResetPassword(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        private object UpdateResetPassword(string ipDataStr)

        {
            RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(ipDataStr);
            //encrepting current entered password and updating in table
            user.Password = RBAC.EncryptPassword(user.Password);

            _rbacDbContext.Users.Attach(user);
            ///while password reset: we've to modify only below 4 fields of the user table.
            _rbacDbContext.Entry(user).Property(x => x.ModifiedBy).IsModified = true;
            _rbacDbContext.Entry(user).Property(x => x.ModifiedOn).IsModified = true;
            _rbacDbContext.Entry(user).Property(x => x.Password).IsModified = true;
            _rbacDbContext.Entry(user).Property(x => x.NeedsPasswordUpdate).IsModified = true;
            _rbacDbContext.SaveChanges();
            user.Password = " ";
            return user;
        }

        [HttpPut]
        [Route("UserIsActive")]
        public IActionResult PutUserIsActive()
        {
            //if (reqType == "put-security-user-isactive")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateUserIsActive(ipDataStr);
            return InvokeHttpPutFunction(func);
        }


        private object UpdateUserIsActive(string ipDataStr)
        {
            RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(ipDataStr);
            //encrepting current entered password and updating in table
            // user.Password = RBAC.EncryptPassword(user.Password);

            _rbacDbContext.Users.Attach(user);
            _rbacDbContext.Entry(user).Property(x => x.IsActive).IsModified = true;
            _rbacDbContext.SaveChanges();
            return user;


        }

        #endregion


        #region  ReqTypes (api/values)
        /* [HttpGet]
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
            *//* MasterDbContext masterDbContext = new MasterDbContext(connString);
             RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
             AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
             RbacDbContext rbacDbContext = new RbacDbContext(connString);
             BillingDbContext billingDbContext = new BillingDbContext(connString);
             *//*DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();*/
        /*if (reqType == "get-security-application")
                 {
                     var appList = rbacDbContext.Applications.Include("Permissions").OrderBy(p => p.ApplicationName).ToList();
                     responseData.Status = "OK";
                     responseData.Results = appList;
                 }
                 else */
        /* if (reqType == "get-security-route")
         {
             var routeList = rbacDbContext.Routes.ToList();
             responseData.Status = "OK";
             responseData.Results = routeList;
         }
         else */
        /* if (reqType == "get-security-permission")
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
         else */
        /*if (reqType == "get-security-role")
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
        else */
        /*if (reqType == "get-security-user")
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
        else*/

        /* if (reqType == "get-security-rolepermission")
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
         else */
        /* if (reqType == "get-security-userrole")
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
     return DanpheJSONConvert.SerializeObject(responseData, true);*//*
     }*/




        /*// POST api/values
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


                *//*                if (reqType == "post-security-user")
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

                                else*/

        /*if (reqType == "post-security-role")
        {
            RbacRole role = DanpheJSONConvert.DeserializeObject<RbacRole>(str);
            rbacDbContext.Roles.Add(role);
            rbacDbContext.SaveChanges();
            responseData.Results = role;
            responseData.Status = "OK";
        }
        else*//*

        if (reqType == "post-security-rolePermission")
        {

            if (roleId != null)
            {


                //step:1--Remove all existing mappings of this role.
                List<RolePermissionMap> existingMapping = rbacDbContext.RolePermissionMaps.Where(r => r.RoleId == roleId).ToList();
                if (existingMapping != null && existingMapping.Count > 0)
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
       *//* if (reqType == "put-security-user")
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
        else */

        /* if (reqType == "put-security-role")
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
         else*/
        /* if (reqType == "put-security-rolePermission")
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
         else */
        /*if (reqType == "put-security-userRole")
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
        else*/

        /* if (reqType == "put-security-reset-password")
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
         else*/
        /* if (reqType == "put-security-user-isactive")
         {
             RbacUser user = DanpheJSONConvert.DeserializeObject<RbacUser>(str);
             //encrepting current entered password and updating in table
             // user.Password = RBAC.EncryptPassword(user.Password);

             rbacDbContext.Users.Attach(user);

             rbacDbContext.Entry(user).Property(x => x.IsActive).IsModified = true;
             rbacDbContext.SaveChanges();
             responseData.Results = user;
             responseData.Status = "OK";

         }*//*

     }
     catch (Exception ex)
     {
         responseData.Status = "Failed";
         responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
     }
     return DanpheJSONConvert.SerializeObject(responseData, true);
 }
*/
        #endregion

      
    }
}