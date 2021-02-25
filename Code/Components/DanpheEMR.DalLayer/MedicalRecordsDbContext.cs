using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class MedicalRecordsDbContext: DbContext
    {
        public DbSet<DischargeTypeModel> DischargeType { get; set; }
        public DbSet<DeathTypeModel> DeathTypes { get; set; }
        public DbSet<DischargeConditionTypeModel> DischargeConditionTypes { get; set; }
        public DbSet<DeliveryTypeModel> DeliveryTypes { get; set; }
        public DbSet<OperationTypeModel> OperationTypes { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<ICD10CodeModel> ICD10Code { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<BabyBirthConditionModel> BabyBirthConditions { get; set; }
        public DbSet<BabyBirthDetailsModel> BabyBirthDetails { get; set; }
        public DbSet<GravitaModel> Gravita { get; set; }
        public DbSet<MedicalRecordModel> MedicalRecords { get; set; }
        public DbSet<DeathDetailsModel> DeathDetails { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<PatientCertificateModel> PatientCertificate { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<CountryModel> Countries { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }

        public MedicalRecordsDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DischargeTypeModel>().ToTable("ADT_DischargeType");
            modelBuilder.Entity<DeathTypeModel>().ToTable("ADT_MST_DeathType");
            modelBuilder.Entity<DeliveryTypeModel>().ToTable("ADT_MST_DeliveryType");
            modelBuilder.Entity<DischargeConditionTypeModel>().ToTable("ADT_MST_DischargeConditionType");
            modelBuilder.Entity<OperationTypeModel>().ToTable("MR_MST_OperationType");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<ICD10CodeModel>().ToTable("MST_ICD10");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<BabyBirthConditionModel>().ToTable("ADT_MST_BabyBirthCondition");
            modelBuilder.Entity<BabyBirthDetailsModel>().ToTable("ADT_BabyBirthDetails");
            modelBuilder.Entity<GravitaModel>().ToTable("ADT_MST_Gravita");
            modelBuilder.Entity<MedicalRecordModel>().ToTable("MR_RecordSummary");
            modelBuilder.Entity<DeathDetailsModel>().ToTable("ADT_DeathDeatils");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<PatientCertificateModel>().ToTable("ADT_PatientCertificate");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
        }
    }
}
