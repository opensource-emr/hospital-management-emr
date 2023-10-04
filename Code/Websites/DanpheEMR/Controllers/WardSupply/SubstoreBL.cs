using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace DanpheEMR.Controllers
{
    public class SubstoreBL
    {
        public static List<VerifiersPermissionViewModel> GetVerifiersByStoreId(int StoreId, RbacDbContext rbacDb)
        {
            var StoreVerifiers = GetStoreVerifiersListt(StoreId, rbacDb).ToList();
            var verifiersWithPermissionName = from SV in StoreVerifiers
                                              join P in rbacDb.Permissions on SV.PermissionId equals P.PermissionId
                                              select new VerifiersPermissionViewModel
                                              {
                                                  CurrentVerificationLevel = SV.VerificationLevel,
                                                  PermissionName = P.PermissionName,
                                                  PermissionId = P.PermissionId,
                                                  VerificationStatus = "pending"
                                              };
            return verifiersWithPermissionName.OrderBy(v => v.CurrentVerificationLevel).ToList();
        }

        private static IEnumerable<StoreVerificationMapModel> GetStoreVerifiersListt(int StoreId, RbacDbContext rbacDb)
        {
            return rbacDb.StoreVerificationMapModel.Where(svm => svm.StoreId == StoreId && svm.IsActive == true).AsEnumerable();
        }
        /// <summary>
        /// It give the list of permission id for a store.
        /// If CurrentVerificationLevel is mentioned, it will only give the permission id at that verification level.
        /// </summary>
        /// <param name="StoreId">Store Id of the Store for which we need verifier's permission id</param>
        /// <param name="rbacDb">RBACDbContext</param>
        /// <param name="CurrentVerificationLevel">(Optional)The verification level for which we need Permission Id</param>
        /// <returns>Returns the Permission Id of all the verifiers.If CurrentVerificationLevel is provided, then PermissionId of that level will be the output.</returns>
        public static IEnumerable<int> GetStoreVerifiersPermissionList(int StoreId, RbacDbContext rbacDb, int CurrentVerificationLevel = 0)
        {
            return rbacDb.StoreVerificationMapModel
                    .Where(svm => svm.StoreId == StoreId && svm.IsActive == true && (CurrentVerificationLevel == 0 || svm.VerificationLevel == CurrentVerificationLevel))
                    .Select(svm => svm.PermissionId).AsEnumerable();
        }
        public static string GetCurrentVerifiersPermissionName(int StoreId, int CurrentVerificationLevel, RbacDbContext rbacDb)
        {
            var CurrentVerifiersPermissionId = rbacDb.StoreVerificationMapModel
                                                     .Where(svm => svm.StoreId == StoreId && svm.IsActive == true && svm.VerificationLevel == CurrentVerificationLevel)
                                                     .Select(svm => svm.PermissionId).FirstOrDefault();
            return RBAC.GetPermissionNameById(rbacDb, CurrentVerifiersPermissionId);
        }



        /// <summary>
        /// Creates the store in the database
        /// </summary>
        /// <param name="storeModel">The store object to be created.</param>
        /// <param name="rbacDbContext">The dbContext in which the store is set</param>
        /// <returns>Newly Created Store</returns>
        public static PHRMStoreModel CreateStore(PHRMStoreModel storeModel, RbacDbContext rbacDbContext)
        {
            storeModel.CreatedOn = System.DateTime.Now;
            storeModel.Category = Enums.ENUM_StoreCategory.Substore;
            if (CheckForStoreDuplication(storeModel.Name, 0, rbacDbContext))
            {
                Exception ex = new Exception("Substore Already Exists.");
                throw ex;
            }
            rbacDbContext.Store.Add(storeModel);
            rbacDbContext.SaveChanges();

            return storeModel;
        }
        /// <summary>
        /// Checks the duplication of store.
        /// </summary>
        /// <param name="StoreName">Name of the Store</param>
        /// <param name="rbacDbContext">The db context for the request</param>
        /// <returns>true if duplicate store name found. else false</returns>
        public static Boolean CheckForStoreDuplication(string StoreName, int StoreId, RbacDbContext rbacDbContext)
        {
            var substoreCategory = Enums.ENUM_StoreCategory.Substore;
            var flag = rbacDbContext.Store.Where(a => a.Category == substoreCategory && a.Name == StoreName && (a.StoreId != StoreId || StoreId == 0)).ToList().Count();
            if (flag > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }


        /// <summary>
        /// Creates the permission for the store.
        /// </summary>
        /// <param name="StoreName">Expects the name of the store</param>
        /// <param name="currentUser">Expects the user creating the permission</param>
        /// <param name="rbacDbContext">The dbContext used for the request</param>
        /// <returns>Permission For Newly Created Store</returns>
        public static int CreatePermissionForStore(string StoreName, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            try
            {
                var storePermission = new RbacPermission();
                storePermission.PermissionName = StoreName;
                storePermission.Description = "auto-generated after store creation";
                storePermission.ApplicationId = rbacDbContext.Applications.Where(a => a.ApplicationName == "WardSupply" && a.ApplicationCode == "WARD").Select(a => a.ApplicationId).FirstOrDefault();
                storePermission.CreatedBy = currentUser.EmployeeId;
                storePermission.CreatedOn = DateTime.Now;
                storePermission.IsActive = true;
                return RBAC.CreatePermission(storePermission, rbacDbContext);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        /// <summary>
        /// Creates the permission for the store Verifier.
        /// </summary>
        /// <param name="ApplicationId">Expects the application id of the related module</param>
        /// <param name="CurrentVerifierLevel">Expects the level of the current verifier</param>
        /// <param name="StoreName">Expects the name of the store</param>
        /// <param name="currentUser">Expects the user creating the permission</param>
        /// <param name="rbacDbContext">The dbContext used for the request</param>
        public static int CreatePermissionForStoreVerifier(int ApplicationId, int CurrentVerifierLevel, string StoreName, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            try
            {
                var PermissionForVerifier = new RbacPermission();
                PermissionForVerifier.PermissionName = StoreName + "-verifier" + CurrentVerifierLevel;
                PermissionForVerifier.Description = "auto-generated for verifier after store creation";
                PermissionForVerifier.ApplicationId = ApplicationId;
                PermissionForVerifier.CreatedBy = currentUser.EmployeeId;
                PermissionForVerifier.CreatedOn = DateTime.Now;
                PermissionForVerifier.IsActive = true;
                return RBAC.CreatePermission(PermissionForVerifier, rbacDbContext);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        /// <summary>
        /// Creates the permission for the store.
        /// </summary>
        /// <param name="RoleName">Expects the name of the role</param>
        /// <param name="ApplicationId">Expects the application id of the module to be used for the role</param>
        /// <param name="currentUser">Expects the user creating the permission</param>
        /// <param name="Description">Expects the description of what the role does</param>
        /// <param name="rbacDbContext">The dbContext used for the request</param>
        public static int CreateRoleForStoreVerifier(string RoleName, int ApplicationId, RbacUser currentUser, string Description, RbacDbContext rbacDbContext)
        {
            try
            {
                //add new role for the new role name
                var newRole = new RbacRole();
                newRole.RoleName = RoleName;
                newRole.ApplicationId = ApplicationId;
                newRole.RoleDescription = Description;
                newRole.IsSysAdmin = false;
                newRole.IsActive = true;
                newRole.CreatedBy = currentUser.EmployeeId;
                newRole.CreatedOn = DateTime.Now;
                return RBAC.CreateRole(newRole, rbacDbContext);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        /// <summary>
        /// Creates the store and verification mapping in the table
        /// </summary>
        /// <param name="StoreId">The store id of the store</param>
        /// <param name="CurrentVerificationLevel">Current Verification Level of the Store</param>
        /// <param name="PermissionId">The permission id of the current level verifier</param>
        /// <param name="currentUser">The user creating the mapping</param>
        /// <param name="rbacDbContext">The Db Context for the request</param>
        public static void CreateStoreVerificationMap(int StoreId, int CurrentVerificationLevel, int MaxVerificationLevel, int PermissionId, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            //check first whether the mapping was done before and deactivated later
            var storeVerificationMap = rbacDbContext.StoreVerificationMapModel.FirstOrDefault(a => a.PermissionId == PermissionId && a.StoreId == StoreId && a.VerificationLevel == CurrentVerificationLevel && a.MaxVerificationLevel == MaxVerificationLevel && a.IsActive == false);
            if (storeVerificationMap != null)
            {
                storeVerificationMap.IsActive = true;
                storeVerificationMap.ModifiedBy = currentUser.EmployeeId;
                storeVerificationMap.ModifiedOn = DateTime.Now;
                rbacDbContext.SaveChanges();
            }
            else
            {
                storeVerificationMap = new StoreVerificationMapModel();
                storeVerificationMap.CreatedOn = DateTime.Now;
                storeVerificationMap.CreatedBy = currentUser.EmployeeId;
                storeVerificationMap.StoreId = StoreId;
                storeVerificationMap.VerificationLevel = CurrentVerificationLevel;
                storeVerificationMap.MaxVerificationLevel = MaxVerificationLevel;
                storeVerificationMap.PermissionId = PermissionId;
                storeVerificationMap.IsActive = true;
                rbacDbContext.StoreVerificationMapModel.Add(storeVerificationMap);
                rbacDbContext.SaveChanges();
            }

        }

        /// <summary>
        ///  Creates and maps the verifiers with the store
        /// </summary>
        /// <param name="storeVerificationMap">Store Verification Map object created from the front end</param>
        /// <param name="storeModel">Newly Created Store Model</param>
        /// <param name="CurrentVerificationLevel">Current Verification Level</param>
        /// <param name="MaxVerificationLevel">Max Verification Level</param>
        /// <param name="currentUser">The User creating the store</param>
        /// <param name="rbacDbContext">The Db Context for the request</param>
        public static void CreateAndMapVerifiersWithStore(StoreVerificationMapModel storeVerificationMap, PHRMStoreModel storeModel, int CurrentVerificationLevel, int MaxVerificationLevel, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            try
            {
                //set the necessar variables.
                var ApplicationId = rbacDbContext.Applications.Where(a => a.ApplicationName == "WardSupply" && a.ApplicationCode == "WARD").Select(a => a.ApplicationId).FirstOrDefault();

                var VerifierRoleId = storeVerificationMap.RoleId;
                var VerifierPermissionId = CreatePermissionForStoreVerifier(ApplicationId, CurrentVerificationLevel, storeModel.Name, currentUser, rbacDbContext);

                if (storeVerificationMap.NewRoleName != "")
                {
                    //add new role for the new role name
                    var newRoleDescription = "Role created during store creation.";
                    VerifierRoleId = CreateRoleForStoreVerifier(storeVerificationMap.NewRoleName, ApplicationId, currentUser, newRoleDescription, rbacDbContext);
                }
                //add the store verification mapping to database
                CreateStoreVerificationMap(storeModel.StoreId, CurrentVerificationLevel, MaxVerificationLevel, VerifierPermissionId, currentUser, rbacDbContext);

                //add mapping for role and permission.
                RBAC.MapRoleWithPermission(VerifierPermissionId, VerifierRoleId, currentUser, rbacDbContext);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }


        /// <summary>
        /// Activate/Deactivate the store and verifiers permission
        /// </summary>
        /// <param name="StoreId">Store Id of the store</param>
        /// <param name="Status">Active status to be set in permission</param>
        /// <param name="currentUser">The requesting user</param>
        /// <param name="rbacDbContext">The db context for the request</param>
        public static void ActivateDeactivateAllStorePermission(int StoreId, Boolean Status, RbacUser currentUser, RbacDbContext rbacDbContext)
        {

            var StorePermissionId = rbacDbContext.Store.Find(StoreId).PermissionId;
            var StorePermission = rbacDbContext.Permissions.Find(StorePermissionId);
            RBAC.ActivateDeactivatePermission(StorePermission, Status, currentUser, rbacDbContext);

            var VerifierPermissionIdList = SubstoreBL.GetStoreVerifiersPermissionList(StoreId, rbacDbContext).ToList();
            foreach (int verifierPermissionId in VerifierPermissionIdList)
            {
                var VerifierPermission = rbacDbContext.Permissions.Find(verifierPermissionId);
                RBAC.ActivateDeactivatePermission(VerifierPermission, Status, currentUser, rbacDbContext);
            }

            //var StoreVerificationMapList = rbacDbContext.StoreVerificationMapModel.Where(a => a.StoreId == StoreId).ToList();
            //foreach (var storeVerification in StoreVerificationMapList)
            //{
            //    storeVerification.IsActive = Status;
            //    storeVerification.ModifiedBy = currentUser.EmployeeId;
            //    storeVerification.ModifiedOn = DateTime.Now;
            //    rbacDbContext.SaveChanges();
            //}
        }
        public static void ActivateDeactivateStoreVerifierMap(StoreVerificationMapModel mapModel, Boolean Status, RbacUser currentUser, RbacDbContext rbacDbContext)
        {

            try
            {
                rbacDbContext.StoreVerificationMapModel.Attach(mapModel);
                rbacDbContext.Entry(mapModel).State = EntityState.Modified;
                rbacDbContext.Entry(mapModel).Property(x => x.IsActive).IsModified = true;
                rbacDbContext.Entry(mapModel).Property(x => x.ModifiedBy).IsModified = true;
                rbacDbContext.Entry(mapModel).Property(x => x.ModifiedOn).IsModified = true;
                mapModel.IsActive = Status;
                mapModel.ModifiedBy = currentUser.EmployeeId;
                mapModel.ModifiedOn = DateTime.Now;
                rbacDbContext.SaveChanges();

            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        /// <summary>
        /// Activate/Deactivate Store
        /// </summary>
        /// <param name="StoreId">Store Id of the store</param>
        /// <param name="currentUser">The requesting user</param>
        /// <param name="rbacDbContext">The db context for the request</param>
        /// <returns>New Active Status of the Store</returns>
        public static Boolean ActivateDeactivateStore(int StoreId, RbacUser currentUser, RbacDbContext rbacDbContext)
        {

            try
            {
                var store = rbacDbContext.Store.Find(StoreId);
                rbacDbContext.Store.Attach(store);
                rbacDbContext.Entry(store).State = EntityState.Modified;
                rbacDbContext.Entry(store).Property(x => x.CreatedOn).IsModified = false;
                rbacDbContext.Entry(store).Property(x => x.CreatedBy).IsModified = false;
                store.ModifiedOn = System.DateTime.Now;
                store.ModifiedBy = currentUser.EmployeeId;
                store.IsActive = !store.IsActive;
                rbacDbContext.SaveChanges();
                return store.IsActive;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        /// <summary>
        /// Update Permission Name of the Store
        /// </summary>
        /// <param name="UpdatedName">New Name of the store</param>
        /// <param name="PermissionId"></param>
        /// <param name="currentUser"></param>
        /// <param name="rbacDbContext"></param>
        public static void UpdateStorePermissionName(string UpdatedName, int PermissionId, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            var Permission = rbacDbContext.Permissions.Find(PermissionId);
            rbacDbContext.Permissions.Attach(Permission);
            rbacDbContext.Entry(Permission).State = EntityState.Modified;
            rbacDbContext.Entry(Permission).Property(x => x.PermissionName).IsModified = true;
            rbacDbContext.Entry(Permission).Property(x => x.ModifiedBy).IsModified = true;
            rbacDbContext.Entry(Permission).Property(x => x.ModifiedOn).IsModified = true;
            Permission.PermissionName = UpdatedName;
            Permission.ModifiedBy = currentUser.EmployeeId;
            Permission.ModifiedOn = DateTime.Now;
            rbacDbContext.SaveChanges();
        }
        /// <summary>
        /// Updates the Permission Name of the Store Verifiers and Deactivates the Permission of removed verification level and respective role permission map.
        /// </summary>
        /// <param name="Store"></param>
        /// <param name="currentUser"></param>
        /// <param name="rbacDbContext"></param>
        public static void UpdateStoreVerifierPermission(PHRMStoreModel Store, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            var StoreVerifierPermissionIdList = rbacDbContext.StoreVerificationMapModel.Where(a => a.StoreId == Store.StoreId && a.IsActive == true).OrderBy(a => a.VerificationLevel).Select(a => a.PermissionId).ToList();
            int CurrentVerificationLevel = 1;
            foreach (int StoreVerifierPermissionId in StoreVerifierPermissionIdList)
            {
                var StoreVerifierPermission = rbacDbContext.Permissions.Find(StoreVerifierPermissionId);

                rbacDbContext.Permissions.Attach(StoreVerifierPermission);
                rbacDbContext.Entry(StoreVerifierPermission).State = EntityState.Modified;
                rbacDbContext.Entry(StoreVerifierPermission).Property(x => x.PermissionName).IsModified = true;
                rbacDbContext.Entry(StoreVerifierPermission).Property(x => x.ModifiedBy).IsModified = true;
                rbacDbContext.Entry(StoreVerifierPermission).Property(x => x.ModifiedOn).IsModified = true;

                StoreVerifierPermission.PermissionName = Store.Name + "-verifier" + CurrentVerificationLevel;
                StoreVerifierPermission.ModifiedBy = currentUser.EmployeeId;
                StoreVerifierPermission.ModifiedOn = DateTime.Now;

                rbacDbContext.SaveChanges();

                CurrentVerificationLevel++;

            }
        }

        public static void UpdateRoleForVerifiers(PHRMStoreModel Store, RbacUser currentUser, RbacDbContext rbacDbContext)
        {
            //case 1: no changes
            //case 2: Role changed
            //in this case, deactivate the old role for previous permission. map new role for this permission.
            //case 3: entirely new role added.
            //in this case, create the new role and map it with this verifiers permission
            //case 4: entirely new Verification level added
            //in that case, create a new 


            //set the necessar variables.
            var ApplicationId = rbacDbContext.Applications.Where(a => a.ApplicationName == "WardSupply" && a.ApplicationCode == "WARD").Select(a => a.ApplicationId).FirstOrDefault();


            List<StoreVerificationMapModel> OldStoreVerifierList = rbacDbContext.StoreVerificationMapModel.Where(svm => svm.StoreId == Store.StoreId && svm.IsActive == true).OrderBy(a => a.VerificationLevel).ToList();
            int CurrentVerificationLevel = 1;
            foreach (StoreVerificationMapModel StoreVerifier in OldStoreVerifierList)
            {
                var StoreVerifierPermission = rbacDbContext.Permissions.Find(StoreVerifier.PermissionId);
                if (Store.MaxVerificationLevel == 0)
                {
                    RBAC.ActivateDeactivatePermission(StoreVerifierPermission, false, currentUser, rbacDbContext);
                    ActivateDeactivateStoreVerifierMap(StoreVerifier, false, currentUser, rbacDbContext);
                }
                else if (CurrentVerificationLevel <= Store.MaxVerificationLevel)
                {
                    var oldVerifierRolePermissionMap = rbacDbContext.RolePermissionMaps.FirstOrDefault(a => a.PermissionId == StoreVerifier.PermissionId && a.IsActive == true);
                    StoreVerificationMapModel newStoreVerifierMap = Store.StoreVerificationMapList.FirstOrDefault(svm => svm.VerificationLevel == CurrentVerificationLevel);
                    if (newStoreVerifierMap.NewRoleName != "")
                    {
                        //deactivate the old role
                        oldVerifierRolePermissionMap.IsActive = false;
                        oldVerifierRolePermissionMap.ModifiedBy = currentUser.EmployeeId;
                        oldVerifierRolePermissionMap.ModifiedOn = DateTime.Now;
                        rbacDbContext.SaveChanges();
                        //add new role for the new role name
                        var newRoleDescription = "Role created during store creation.";
                        var VerifierRoleId = CreateRoleForStoreVerifier(newStoreVerifierMap.NewRoleName, ApplicationId, currentUser, newRoleDescription, rbacDbContext);
                        // add mapping for role and permission.
                        RBAC.MapRoleWithPermission(StoreVerifier.PermissionId, VerifierRoleId, currentUser, rbacDbContext);
                    }
                    else if (oldVerifierRolePermissionMap.RoleId != newStoreVerifierMap.RoleId)
                    {
                        //deactivate the old role
                        oldVerifierRolePermissionMap.IsActive = false;
                        oldVerifierRolePermissionMap.ModifiedBy = currentUser.EmployeeId;
                        oldVerifierRolePermissionMap.ModifiedOn = DateTime.Now;
                        rbacDbContext.SaveChanges();
                        //map the new role id
                        RBAC.MapRoleWithPermission(StoreVerifier.PermissionId, newStoreVerifierMap.RoleId, currentUser, rbacDbContext);
                    }
                }
                else
                {
                    RBAC.ActivateDeactivatePermission(StoreVerifierPermission, false, currentUser, rbacDbContext);
                    ActivateDeactivateStoreVerifierMap(StoreVerifier, false, currentUser, rbacDbContext);
                }
                CurrentVerificationLevel++;
            }
        }
    }
}
