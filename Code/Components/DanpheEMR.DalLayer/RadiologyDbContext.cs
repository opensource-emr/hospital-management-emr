using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
namespace DanpheEMR.DalLayer
{
    public class RadiologyDbContext : DbContext
    {
        public DbSet<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public DbSet<ImagingReportModel> ImagingReports { get; set; }
        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<RadiologyImagingTypeModel> ImagingTypes { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<EmployeePreferences> EmployeePreferences { get; set; }
        public DbSet<RadiologyReportTemplateModel> RadiologyReportTemplate { get; set; }
       // public DbSet<ReportingDoctorModel> ReportingDoctors { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceSepartments { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<FilmTypeModel> FilmType { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivision { get; set; }
        public DbSet<MunicipalityModel> Muncipality { get; set; }

        //public DbSet<FilmTypeModel> FilmType { get; set; }
        public RadiologyDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<RadiologyReportTemplateModel>().ToTable("RAD_CFG_ReportTemplates");
            //modelBuilder.Entity<ReportingDoctorModel>().ToTable("RAD_ReportingDoctors");
            //modelBuilder.Entity<ImagingReportModel>().ToTable("RAD_PatientImagingReport");

            //One to Many relationship between Request and PatientVisit
            modelBuilder.Entity<ImagingRequisitionModel>()
                        .HasRequired<VisitModel>(i => i.Visit)
                        .WithMany(v => v.ImagingRequisitions)
                        .HasForeignKey(i => i.PatientVisitId);

            //One to Many Relationship between Report and PatientVisit
            modelBuilder.Entity<ImagingReportModel>()
                        .HasRequired<VisitModel>(i => i.Visit)
                        .WithMany(v => v.ImagingReports)
                        .HasForeignKey(i => i.PatientVisitId);


            //needs Review 16/01/2017 Ashim Batajoo 
            //(Problem occured while implementing WithOptionalPrincipal for One to One(Optional)
            //.WithOptionalPrincipal

            //One to One(Optional) Relationship between Request and Report
            modelBuilder.Entity<ImagingReportModel>().ToTable("RAD_PatientImagingReport");
            modelBuilder.Entity<ImagingReportModel>()
                .HasKey(t => t.ImagingRequisitionId);
            modelBuilder.Entity<ImagingRequisitionModel>()
                .HasOptional<ImagingReportModel>(a => a.ImagingReport)
                .WithRequired(a => a.ImagingRequisition);

            // Patient mapping
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            //Master Imaging Item Mapping
            modelBuilder.Entity <RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");

            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<EmployeePreferences>().ToTable("EMP_EmployeePreferences");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<FilmTypeModel>().ToTable("RAD_MST_FilmType");
        }



    }
}
