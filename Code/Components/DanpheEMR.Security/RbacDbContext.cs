using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using DanpheEMR.ServerModel;
using Audit.EntityFramework;

namespace DanpheEMR.Security
{
    public class RbacDbContext : AuditDbContext
    {
        public RbacDbContext(string connString)
            : base(connString)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        public DbSet<RbacApplication> Applications { get; set; }
        public DbSet<RbacPermission> Permissions { get; set; }
        public DbSet<RbacRole> Roles { get; set; }
        public DbSet<RbacUser> Users { get; set; }
       // public DbSet<RbacUser> UserProfile { get; set; }
        public DbSet<UserRoleMap> UserRoleMaps { get; set; }
        public DbSet<RolePermissionMap> RolePermissionMaps { get; set; }
        public DbSet<DanpheRoute> Routes { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<PHRMStoreModel> Store { get; set; }
        public DbSet<StoreVerificationMapModel> StoreVerificationMapModel { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RbacApplication>().ToTable("RBAC_Application");
            modelBuilder.Entity<RbacPermission>().ToTable("RBAC_Permission");
            modelBuilder.Entity<DanpheRoute>().ToTable("RBAC_RouteConfig");
            modelBuilder.Entity<RbacRole>().ToTable("RBAC_Role");
            modelBuilder.Entity<RolePermissionMap>().ToTable("RBAC_MAP_RolePermission");
            //modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");
            modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");
            modelBuilder.Entity<UserRoleMap>().ToTable("RBAC_MAP_UserRole");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<PHRMStoreModel>().ToTable("PHRM_MST_Store");
            modelBuilder.Entity<StoreVerificationMapModel>().ToTable("MST_MAP_StoreVerification");


            //application and permission mapping
            //modelBuilder.Entity<RbacPermission>()
            //    .HasRequired<RbacApplication>(p => p.Application)
            //    .WithMany(a => a.Permissions)
            //    .HasForeignKey(p => p.ApplicationId);
            //application and permission mapping



            //// Patient address mapping
            //modelBuilder.Entity<AddressModel>().ToTable("PAT_PatientAddress");
            //modelBuilder.Entity<AddressModel>()
            //       .HasRequired<PatientModel>(s => s.Patient) // Address entity requires Patient
            //       .WithMany(s => s.Addresses) // Patient entity includes many Addresses entities
            //        .HasForeignKey(s => s.PatientId);


            //modelBuilder.Entity<RbacPermission>()
            //    .HasMany(e => e.Roles)
            //    .WithMany(e => e.Permissions)
            //    .Map(m => m.ToTable("LNK_ROLE_PERMISSION").MapLeftKey("Permission_Id").MapRightKey("Role_Id"));

            //modelBuilder.Entity<RbacRole>()
            //    .HasMany(e => e.Users)
            //    .WithMany(e => e.Roles)
            //    .Map(m => m.ToTable("LNK_USER_ROLE").MapLeftKey("Role_Id").MapRightKey("User_Id"));
        }
    }
}
