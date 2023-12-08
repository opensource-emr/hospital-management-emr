using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using DanpheEMR.ServerModel.EmergencyModels;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.PatientModels;
using System.Data.SqlClient;
using System.Data;

namespace DanpheEMR.DalLayer
{
    public class EmergencyDbContext: DbContext
    {
        public DbSet<EmergencyPatientModel> EmergencyPatient { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<VisitModel> Visits { get; set; }
        public DbSet<CountryModel> Country { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivision { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        //public DbSet<DischargeSummaryModel> DischargeSummary { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillServiceItemModel> BillServiceItems { get; set; }
        public DbSet<BillingCounter> BillingCounter { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<EmergencyDischargeSummaryModel> DischargeSummary { get; set; }
        public DbSet<VitalsModel> Vitals { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public DbSet<BillingSchemeModel> Schemes { get; set; }
       // public DbSet<PatientMembershipModel> PatientMemberships { get; set; }
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<ModeOfArrival> ModeOfArrival { get; set; }
        public DbSet<EmergencyPatientCases> PatientCases { get; set; }
        public DbSet<UploadConsentForm> Consentform { get; set; }
        public DbSet<BillServiceItemSchemeSettingModel> ServiceItemSchemeSettings { get; set; }
        public DbSet<MunicipalityModel> Municipalities { get; set; }
        public DbSet<LabTestComponentResult> LabTestComponentResult { get; set; }
        public DbSet<BillMapPriceCategoryServiceItemModel> BillPriceCategoryServiceItems { get; set; }
        public DbSet<PatientSchemeMapModel> PatientSchemeMaps { get; set; }
        public DbSet<PriceCategoryModel> priceCategories { get; set; }
        public DbSet<EthnicGroupModel> Ethnicity { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }

        public EmergencyDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ModeOfArrival>().ToTable("ER_ModeOfArrival");
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<EmergencyPatientModel>().ToTable("ER_Patient");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            //modelBuilder.Entity<DischargeSummaryModel>().ToTable("ADT_DischargeSummary");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            // Patient and visit mappings
            modelBuilder.Entity<VisitModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Visits)
                    .HasForeignKey(s => s.PatientId);
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillServiceItemModel>().ToTable("BIL_MST_ServiceItem");
            modelBuilder.Entity<BillingCounter>().ToTable("BIL_CFG_Counter");
            modelBuilder.Entity<EmergencyDischargeSummaryModel>().ToTable("ER_DischargeSummary");
            modelBuilder.Entity<VitalsModel>().ToTable("CLN_PatientVitals");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<BillingSchemeModel>().ToTable("BIL_CFG_Scheme");
            //modelBuilder.Entity<PatientMembershipModel>().ToTable("PAT_PatientMembership");
            modelBuilder.Entity<EmergencyPatientCases>().ToTable("ER_Patient_Cases");
            modelBuilder.Entity<UploadConsentForm>().ToTable("ER_FileUploads");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<LabTestComponentResult>().ToTable("LAB_TXN_TestComponentResult");
            modelBuilder.Entity<BillMapPriceCategoryServiceItemModel>().ToTable("BIL_MAP_PriceCategoryServiceItem");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<BillServiceItemSchemeSettingModel>().ToTable("BIL_MAP_ServiceItemSchemeSetting");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");
            modelBuilder.Entity<EthnicGroupModel>().ToTable("MST_EthnicGroup");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
        }

        public DataTable GetDataTableFromStoredProc(int selectedCase)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@SelectedCase", selectedCase) };
            DataTable allERTriagedPatients = DALFunctions.GetDataTableFromStoredProc("SP_ER_GetERTriagedPatientList", paramList, this);
            return allERTriagedPatients;
        }
    }
}
