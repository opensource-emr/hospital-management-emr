using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class QueueManagementDbContext : DbContext
    {
        public QueueManagementDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        public DbSet<DepartmentModel> Department { get; set; }
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<VisitModel>()
            .HasRequired<PatientModel>(a => a.Patient)
            .WithMany(a => a.Visits)
            .HasForeignKey(s => s.PatientId);
            modelBuilder.Entity<VisitModel>()
            .HasOptional<AdmissionModel>(a => a.Admission)
            .WithRequired(a => a.Visit);
        }
    }
}
