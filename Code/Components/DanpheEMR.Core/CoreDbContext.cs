using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel;
using DanpheEMR.Core.DynTemplates;
using Audit.EntityFramework;

namespace DanpheEMR.Core
{
    public class CoreDbContext : AuditDbContext
    {
        public CoreDbContext(string connString)
            : base(connString)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        public DbSet<ParameterModel> Parameters { get; set; }
        public DbSet<LookupsModel> LookUps { get; set; }
        public DbSet<CountryModel> Countries { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivisions { get; set; }
        public DbSet<ICD10CodeModel> ICD10Codes { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<ReactionModel> Reactions { get; set; }
        public DbSet<RadiologyImagingTypeModel> ImagingTypes { get; set; }
        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartments { get; set; }
        public DbSet<BedModel> Beds { get; set; }
        public DbSet<BedFeature> BedFeatures { get; set; }
        public DbSet<BedFeaturesMap> BedFeaturesMaps { get; set; }
        public DbSet<WardModel> Wards { get; set; }
        public DbSet<EmployeeRoleModel> EmployeeRoles { get; set; }
        public DbSet<EmployeeTypeModel> EmployeeTypes { get; set; }
        public DbSet<EmployeePreferences> EmployeePreferences { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<TaxModel> Taxes { get; set; }
        public DbSet<PHRMItemMasterModel> Medicines { get; set; }

        //For DynamicTemplates configuration (merged from CLN-Psy)--sud: 18June'18
        public DbSet<Template> Templates { get; set; }
        public DbSet<Questionnaire> Questionnaires { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<LookupsModel>().ToTable("CORE_CFG_LookUps");

            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<ICD10CodeModel>().ToTable("MST_ICD10");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<ReactionModel>().ToTable("MST_Reactions");
            //RadiologyMasterTables
            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<BedFeature>().ToTable("ADT_MST_BedFeature");
            modelBuilder.Entity<BedFeaturesMap>().ToTable("ADT_MAP_BedFeaturesMap");
            modelBuilder.Entity<BedModel>().ToTable("ADT_MAP_WardBedType");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");

            modelBuilder.Entity<EmployeeRoleModel>().ToTable("EMP_EmployeeRole");
            modelBuilder.Entity<EmployeeTypeModel>().ToTable("EMP_EmployeeType");
            modelBuilder.Entity<EmployeePreferences>().ToTable("EMP_EmployeePreferences");
            modelBuilder.Entity<PHRMItemMasterModel>().ToTable("PHRM_MST_Item");
            modelBuilder.Entity<TaxModel>().ToTable("MST_Tax");

            //For DynamicTemplates configuration (merged from CLN-Psy)--sud: 18June'18
            modelBuilder.Entity<Template>().ToTable("CORE_DYNTMP_Template");
            modelBuilder.Entity<Questionnaire>().ToTable("CORE_DYNTMP_Questionnaire");
            modelBuilder.Entity<Question>().ToTable("CORE_DYNTMP_Question");
            modelBuilder.Entity<Option>().ToTable("CORE_DYNTMP_Option");
        }
    }
}
