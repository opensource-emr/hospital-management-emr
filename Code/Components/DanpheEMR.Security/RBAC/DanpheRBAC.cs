using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using DanpheEMR.Core.Caching;
using System.Data.Entity;
using System.Security.Cryptography;
using System.Text;

namespace DanpheEMR.Security
{

    //check performance difference between linq-in-memory join and chached join (RBAC.GetAll***)---IMPORTANT--sudarshan 7March17
    public class RBAC
    {
        private static string connStringName;
        private static int cacheExpiryMinutes;


        /// <summary>
        /// This is the Default public salt used for encreption and decreption 
        /// </summary>
        static string Salt = "Danphesalt";

        public RBAC(string connectionString, int cacheExpMinutes)
        {
            connStringName = connectionString;
            cacheExpiryMinutes = cacheExpMinutes;
        }

        //Returns all application List
        public static List<RbacApplication> GetAllApplications()
        {
            List<RbacApplication> retList = (List<RbacApplication>)DanpheCache.Get("RBAC-Apps-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.Applications.ToList();
                DanpheCache.Add("RBAC-Apps-All", retList, cacheExpiryMinutes);
            }
            return retList;
        }

        //This method return All Permissions without checking user and other thing
        //It checks cache if list is in chache then it takes from cache else get all permission from db        
        public static List<RbacPermission> GetAllPermissions()
        {
            List<RbacPermission> retList = (List<RbacPermission>)DanpheCache.Get("RBAC-Perms-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.Permissions.ToList();
                DanpheCache.Add("RBAC-Perms-All", retList, cacheExpiryMinutes);
            }
            return retList;

        }
        //This method returns List of Roles
        public static List<RbacRole> GetAllRoles()
        {
            List<RbacRole> retList = (List<RbacRole>)DanpheCache.Get("RBAC-Roles-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.Roles.ToList();
                DanpheCache.Add("RBAC-Roles-All", retList, cacheExpiryMinutes);
            }
            return retList;
        }
        //This method returns all users details
        public static List<RbacUser> GetAllUsers()
        {
            List<RbacUser> retList = (List<RbacUser>)DanpheCache.Get("RBAC-Users-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.Users.ToList();
                DanpheCache.Add("RBAC-Users-All", retList, cacheExpiryMinutes);
            }
            return retList;
        }
        //This method returns all Userand Role mapping
        public static List<UserRoleMap> GetAllUserRoleMaps()
        {
            List<UserRoleMap> retList = (List<UserRoleMap>)DanpheCache.Get("RBAC-UserRoleMaps-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.UserRoleMaps.ToList();
                DanpheCache.Add("RBAC-UserRoleMaps-All", retList, cacheExpiryMinutes);
            }

            return retList;
        }
        //Method return all rolepermission mapping list
        public static List<RolePermissionMap> GetAllRolePermissionMaps()
        {
            List<RolePermissionMap> retList = (List<RolePermissionMap>)DanpheCache.Get("RBAC-RolePermissionMaps-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.RolePermissionMaps.ToList();
                DanpheCache.Add("RBAC-RolePermissionMaps-All", retList, cacheExpiryMinutes);
            }
            return retList;
        }

        //This get all routes from db
        public static List<DanpheRoute> GetAllRoutes()
        {
            List<DanpheRoute> retList = (List<DanpheRoute>)DanpheCache.Get("RBAC-Routes-All");
            if (retList == null)
            {
                RbacDbContext dbContext = new RbacDbContext(connStringName);
                retList = dbContext.Routes.ToList();
                DanpheCache.Add("RBAC-Routes-All", retList, cacheExpiryMinutes);
            }
            return retList;

        }

        //don't get hidden routes if it's set to false.
        public static List<DanpheRoute> GetRoutesForUser(int userId, bool getHiearrchy)
        {
            List<DanpheRoute> allRoutes = new List<DanpheRoute>();

            List<RbacPermission> userAllPerms = GetUserAllPermissions(userId);
            allRoutes = (from route in RBAC.GetAllRoutes()
                         join perm in userAllPerms
                         on route.PermissionId equals perm.PermissionId
                         where route.IsActive == true
                         select route).Distinct().OrderBy(r => r.DisplaySeq).ToList();

            if (getHiearrchy)
            {
                //don't get hidden routes if it's set to false.
                List<DanpheRoute> parentRoutes = allRoutes.Where(a => a.ParentRouteId == null && a.DefaultShow == true).ToList();

                foreach (var route in parentRoutes)
                {
                    route.ChildRoutes = GetChildRouteHierarchy(allRoutes, route);
                }

                return parentRoutes;
            }
            else
            {
                return allRoutes.ToList();
            }
        }
        //don't get hidden routes if it's set to false.
        private static List<DanpheRoute> GetChildRouteHierarchy(List<DanpheRoute> searchList, DanpheRoute route)
        {
            //don't get hidden routes if it's set to false.
            List<DanpheRoute> childRoutes = searchList.Where(a => a.ParentRouteId == route.RouteId).Distinct().ToList();
            if (childRoutes == null || childRoutes.Count == 0)
            {
                return null;
            }

            foreach (var item in childRoutes)
            {
                item.ChildRoutes = GetChildRouteHierarchy(searchList, item);
            }

            return childRoutes;
        }
        public static bool IsValidUser(string userName, string password)
        {
            //username is not case-sensitive but password is
            List<RbacUser> allUsrs = RBAC.GetAllUsers();
            RbacUser usr = allUsrs.Where(a => a.UserName.ToLower() == userName.ToLower() && a.Password == a.Password)
                           .Select(a => a).FirstOrDefault();
            if (usr != null)
                return true;
            else
                return false;
        }
        public static RbacUser GetUser(string userName, string password)
        {
            //username is not case-sensitive but password is
            List<RbacUser> allUsrs = RBAC.GetAllUsers();
            RbacUser usr = allUsrs.Where(a => a.UserName.ToLower() == userName.ToLower() && a.Password == EncryptPassword(password))
                          .Select(a => a).FirstOrDefault();
            //sending a clone so that my current object won't be modified outside.
            if (usr != null)
                return (RbacUser)usr.Clone();
            //don't clone if user is null (nullreferenceException)
            else return usr;
        }
        public static RbacUser GetUser(int userId)
        {
            //username is not case-sensitive but password is
            List<RbacUser> allUsrs = RBAC.GetAllUsers();
            RbacUser usr = allUsrs.Where(a => a.UserId == userId)
                          .Select(a => a).FirstOrDefault();
            //sending a clone so that my current object won't be modified outside.
            if (usr != null)
                return (RbacUser)usr.Clone();
            //don't clone if user is null (nullreferenceException)
            else return usr;
        }
        public static bool UserHasPermission(int userId, string applicationCode, string permissionName)
        {
            RbacApplication currApplication = RBAC.GetAllApplications()
                                    .Where(a => a.ApplicationCode == applicationCode).FirstOrDefault();
            if (currApplication != null)
            {
                //filter from all permissions of current user.
                List<RbacPermission> userPerms = (from uPerm in RBAC.GetUserAllPermissions(userId)
                                                  where uPerm.PermissionName == permissionName
                                                  && uPerm.ApplicationId == currApplication.ApplicationId
                                                  select uPerm).ToList();
                if (userPerms != null && userPerms.Count > 0)
                {
                    return true;
                }
            }
            return false;
        }
        public static List<RbacPermission> GetUserAllPermissions(int userId)
        {
            List<RbacPermission> retList = (List<RbacPermission>)DanpheCache.Get("RBAC-UserPermissions-UserId" + userId);
            if (retList == null)
            {
                var isUsrSysAdmin = (from usRole in RBAC.GetAllUserRoleMaps()
                                     where usRole.UserId == userId
                                     join role in RBAC.GetAllRoles()
                                     on usRole.RoleId equals role.RoleId
                                     where role.IsSysAdmin == true
                                     select role).Count() > 0;
                //return all permissions if current user is systemadmin.
                if (isUsrSysAdmin)
                {
                    retList = RBAC.GetAllPermissions();
                }
                else
                {
                    retList = (from urole in RBAC.GetAllUserRoleMaps()
                               where urole.UserId == userId && urole.IsActive == true
                               join role in RBAC.GetAllRoles()
                               on urole.RoleId equals role.RoleId
                               join rolePmap in RBAC.GetAllRolePermissionMaps()
                               on urole.RoleId equals rolePmap.RoleId
                               join perm in RBAC.GetAllPermissions()
                                on rolePmap.PermissionId equals perm.PermissionId
                               where rolePmap.IsActive == true
                               join app in RBAC.GetAllApplications()
                               on perm.ApplicationId equals app.ApplicationId
                               where app.IsActive == true
                               select perm).ToList();
                }
                DanpheCache.Add("RBAC-UserPermissions-UserId" + userId, retList, cacheExpiryMinutes);
            }
            return retList;

        }

        public static List<RbacRole> GetUserAllRoles(int userid)
        {
            List<RbacRole> retList = new List<RbacRole>();
            List<RbacRole> allRoles = RBAC.GetAllRoles();
            List<UserRoleMap> allUsrRoleMap = RBAC.GetAllUserRoleMaps();

            //return only roles which are mapped to this user.
            retList = (from role in allRoles
                       join map in allUsrRoleMap
                       on role.RoleId equals map.RoleId
                       where map.UserId == userid
                       select role).Distinct().ToList();



            return retList;
        }


        public static RbacUser UpdateDefaultPasswordOfUser(string userName, string password, string confirmpassword)
        {


            RbacDbContext rbacDbcontxt = new RbacDbContext(connStringName);
            List<RbacUser> alluser = RBAC.GetAllUsers();
            RbacUser usr = alluser.Where(a => a.UserName.ToLower() == userName.ToLower() && a.Password == EncryptPassword(password))
                          .Select(a => a).FirstOrDefault();

            ////this condition is for that if user has enter wrong current password 
            if (usr == null)
            {
                return null;
            }
            else
            {
                usr.Password = EncryptPassword(confirmpassword);
                usr.ModifiedOn = DateTime.Now;
                usr.ModifiedBy = usr.EmployeeId;
                usr.NeedsPasswordUpdate = false;
                rbacDbcontxt.Entry(usr).State = EntityState.Modified;
                rbacDbcontxt.SaveChanges();

                return usr;
            }

        }
        /// <summary>
        /// this method is used for Current inputed password decryption
        /// </summary>

        public static string EncryptPassword(string Password)
        {
            string encryptedPwd = string.Empty;
            byte[] data = UTF8Encoding.UTF8.GetBytes(Password);
            using (MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider())
            {
                byte[] keys = md5.ComputeHash(UTF8Encoding.UTF8.GetBytes(Salt));
                using (TripleDESCryptoServiceProvider tripdes = new TripleDESCryptoServiceProvider() { Key = keys, Mode = CipherMode.ECB, Padding = PaddingMode.PKCS7 })
                {
                    ICryptoTransform transform = tripdes.CreateEncryptor();
                    byte[] results = transform.TransformFinalBlock(data, 0, data.Length);
                    encryptedPwd = Convert.ToBase64String(results, 0, results.Length);

                }
            }
            return encryptedPwd;
        }


        /// <summary>
        /// this method is used for Current inputed password decryption
        /// </summary>

        public static string DecryptPassword(string Password)
        {
            string decryptedPwd = string.Empty;

            byte[] data = Convert.FromBase64String(Password);

            using (MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider())
            {
                byte[] keys = md5.ComputeHash(UTF8Encoding.UTF8.GetBytes(Salt));
                using (TripleDESCryptoServiceProvider tripdes = new TripleDESCryptoServiceProvider() { Key = keys, Mode = CipherMode.ECB, Padding = PaddingMode.PKCS7 })
                {
                    ICryptoTransform transform = tripdes.CreateDecryptor();
                    byte[] results = transform.TransformFinalBlock(data, 0, data.Length);
                    decryptedPwd = UTF8Encoding.UTF8.GetString(results);
                }
            }
            return decryptedPwd;
        }

    }
}
