using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.SchedulingModels;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    public class SchedulingDbContext : DbContext
    {
        public SchedulingDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<EmpDayWiseAvailability> DayWiseAvailability { get; set; }
        public DbSet<EmployeeShifts> EmpShifts { get; set; }
        public DbSet<EmpSchedules> EmpSchedules { get; set; }
        public DbSet<ShiftsMasterModel> ShiftsMaster { get; set; }
        public DbSet<EmployeeShiftMap> EmpShiftMAP { get; set; }
        public DbSet<EmployeeRoleModel> EmpRole { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<EmpDayWiseAvailability>().ToTable("SCH_EmpDayWiseAvailability");
            modelBuilder.Entity<EmployeeShifts>().ToTable("SCH_EmployeeShifts");
            modelBuilder.Entity<EmpSchedules>().ToTable("SCH_EmployeeSchedules");
            modelBuilder.Entity<ShiftsMasterModel>().ToTable("SCH_MST_Shifts");
            modelBuilder.Entity<EmployeeShiftMap>().ToTable("SCH_MAP_EmployeeShift");
            modelBuilder.Entity<EmployeeRoleModel>().ToTable("EMP_EmployeeRole");
        }
    }
}