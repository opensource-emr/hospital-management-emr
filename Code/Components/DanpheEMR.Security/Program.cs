using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using System.Data.SqlClient;


namespace DanpheEMR.Security
{
    class Program
    {
        static string connStr = ConfigurationManager.ConnectionStrings["RBAC_Connection"].ConnectionString;

        public static void Main(string[] args)
        {
            TestRoutes();
             
        }


        static void TestRoutes()
        {

            RbacDbContext dbContext = new RbacDbContext(connStr);

            List<DanpheRoute> allUserRoutes = RBAC.GetRoutesForUser(11);

            //below works fine..
            //List<RbacUser> allUsers = dbContext.Users.ToList();
            //List<RbacApplication> applications = dbContext.Applications.ToList();
            //List<RbacPermission> permissions = dbContext.Permissions.ToList();
            //List<RbacRole> roles = dbContext.Roles.ToList();
            //List<DanpheRoute> routes = dbContext.Routes.ToList();
            //List<UserRoleMap> userrolemaps = dbContext.UserRoleMaps.ToList();
            //List<RolePermissionMap> rolePermMaps = dbContext.RolePermissionMaps.ToList();
        }

        public static List<DanpheRoute> GetAllRoutes()
        {
            List<DanpheRoute> retList = new List<DanpheRoute>();
            retList.Add(new DanpheRoute() { DisplayName = "Dashboard", RouteId = 1, ParentRouteId = null });
            retList.Add(new DanpheRoute() { DisplayName = "Appointment", RouteId = 1, ParentRouteId = null });
            retList.Add(new DanpheRoute() { DisplayName = "Clinical", RouteId = 1, ParentRouteId = null });


            return retList;
        }

    }
}
