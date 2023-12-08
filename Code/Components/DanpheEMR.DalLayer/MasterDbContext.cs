using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.EmergencyModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.WardSupplyModels;

namespace DanpheEMR.DalLayer
{
    public class MasterDbContext : DbContext
    {
        public MasterDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

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
            modelBuilder.Entity<PHRMStoreModel>().ToTable("PHRM_MST_Store");
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
            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<IntegrationModel>().ToTable("ServiceDepartment_MST_IntegrationName");
            modelBuilder.Entity<EmailSendDetailModel>().ToTable("MSTEmailSendDetail");


            modelBuilder.Entity<BillServiceItemModel>().ToTable("BIL_MST_ServiceItem");
            modelBuilder.Entity<StoreVerificationMapModel>().ToTable("MST_MAP_StoreVerification");
            modelBuilder.Entity<CoreLookupDetail>().ToTable("CORE_LookupDetail");

            modelBuilder.Entity<BanksModel>().ToTable("MST_Bank");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");



            modelBuilder.Entity<ICD10ReportingGroupModel>().ToTable("ICD_ReportingGroup");
            modelBuilder.Entity<ICD10DiseaseGroupModel>().ToTable("ICD_DiseaseGroup");

            modelBuilder.Entity<PaymentModes>().ToTable("MST_PaymentModes"); //Krishna, 31 JAN, 22
            modelBuilder.Entity<CfgPaymentModesSettings>().ToTable("CFG_PaymentModeSettings"); //Krishna, 31 JAN, 22
            modelBuilder.Entity<PaymentPages>().ToTable("MST_PaymentPages"); //Krishna, 7th FEB, 22


            modelBuilder.Entity<PrintExportConfigModel>().ToTable("CFG_PrintExportSettings");

            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");
            modelBuilder.Entity<PHRMCreditOrganizationsModel>().ToTable("PHRM_MST_Credit_Organization");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<ServerModel.WardSupplyModels.WardSubStoresMAPModel>().ToTable("NUR_MAP_WardSubStoresMap");
            modelBuilder.Entity<BillMapPriceCategoryServiceItemModel>().ToTable("BIL_MAP_PriceCategoryServiceItem");

        }


        public DbSet<CountryModel> Country { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivision { get; set; }
        public DbSet<ICD10CodeModel> ICD10Code { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<BanksModel> Banks { get; set; }
        public DbSet<ReactionModel> Reactions { get; set; }
        public DbSet<RadiologyImagingTypeModel> ImagingTypes { get; set; }
        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<PHRMStoreModel> Store { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartments { get; set; }
        public DbSet<BedModel> Bed { get; set; }
        public DbSet<BedFeature> BedFeature { get; set; }
        public DbSet<BedFeaturesMap> BedFeaturesMap { get; set; }
        public DbSet<WardModel> Ward { get; set; }
        public DbSet<EmployeeRoleModel> EmployeeRole { get; set; }
        public DbSet<EmployeeTypeModel> EmployeeType { get; set; }
        //public DbSet<EmployeePreferences> EmployeePreferences { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<TaxModel> Taxes { get; set; }
        public DbSet<PHRMItemMasterModel> Medicines { get; set; }
        public DbSet<CfgParameterModel> CFGParameters { get; set; }
        public DbSet<IntegrationModel> IntegrationName { get; set; }
        public DbSet<EmailSendDetailModel> SendEmailDetails { get; set; }

        //sud:24-Oct-2019: Added billitemprice against the convention of Master, since it was neeed for employee settings controller.
        //and which was using Transaction of MasterDbContext. so couldn't use any other dbcontextes inside of transaction scope.
        public DbSet<BillServiceItemModel> BillingServiceItems { get; set; }
        public DbSet<StoreVerificationMapModel> StoreVerificationMapModel { get; set; }
        public DbSet<CoreLookupDetail> CoreLookupDetails { get; set; }
        public DbSet<MunicipalityModel> Municipalities { get; set; }

        public DbSet<ICD10ReportingGroupModel> ICD10ReportingGroups { get; set; }
        public DbSet<ICD10DiseaseGroupModel> ICD10DiseaseGroups { get; set; }
        public DbSet<PrintExportConfigModel> PrintExportConfig { get; set; }

        public DbSet<PaymentModes> PaymentModes { get; set; } //Krishna, 31 JAN, 22
        public DbSet<CfgPaymentModesSettings> CfgPaymentModesSettings { get; set; } //Krishna, 31 JAN, 22
        public DbSet<PaymentPages> PaymentPages { get; set; } //Krishna, 7th FEB,22
        public DbSet<PriceCategoryModel> PriceCategorys { get; set; }
        public DbSet<PHRMCreditOrganizationsModel> PharmacyCreditOrganizations { get; set; }
        public DbSet<CreditOrganizationModel> BillingCreditOrganization { get; set; }
        public DbSet<WardSubStoresMAPModel> WardSubStoresMapDetails { get; set; }
        public DbSet<BillMapPriceCategoryServiceItemModel> PriceCategoryServiceItems { get; set; }


    }
}

