using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.LabModels;

namespace DanpheEMR.DalLayer
{
    public class LISDbContext : DbContext
    {
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<LabRequisitionModel> Requisitions { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<LabTestComponentResult> LabTestComponentResults { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<LabReportModel> LabReports { get; set; }
        public DbSet<LabBarCodeModel> LabBarCode { get; set; }
        public DbSet<LabTestComponentMapModel> LabTestComponentMap { get; set; }
        public DbSet<LabTestJSONComponentModel> LabTestComponents { get; set; }
        public DbSet<LISComponentMapModel> LISComponentMap { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<LISSyncedComponentDetail> LISSyncedComponentDetails { get; set; }

        public LISDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<LISComponentMapModel>().ToTable("LAB_LIS_ComponentMap");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests"); modelBuilder.Entity<LabTestComponentResult>().ToTable("LAB_TXN_TestComponentResult");
            modelBuilder.Entity<LabTestComponentResult>()
                   .HasRequired<LabRequisitionModel>(a => a.LabRequisition)
                   .WithMany(a => a.LabTestComponentResults)
                    .HasForeignKey(s => s.RequisitionId);
            // this is used getting data from patient table while showing the report
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<LabBarCodeModel>().ToTable("LAB_BarCode");
            modelBuilder.Entity<LabTestComponentMapModel>().ToTable("Lab_MAP_TestComponents");
            modelBuilder.Entity<LabTestJSONComponentModel>().ToTable("Lab_MST_Components");
            modelBuilder.Entity<LabReportModel>().ToTable("LAB_TXN_LabReports");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<LISSyncedComponentDetail>().ToTable("LAB_LIS_SyncedComponent_Detail");
        }
    }
}
