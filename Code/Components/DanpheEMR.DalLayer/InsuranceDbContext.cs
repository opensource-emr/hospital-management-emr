using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using System.Data;
using System.Data.SqlClient;
using DanpheEMR.Security;
using Audit.EntityFramework;

namespace DanpheEMR.DalLayer
{
    public class InsuranceDbContext : AuditDbContext
    {
        public InsuranceDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
            this.AuditDisabled = true;
        }

        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<InsuranceModel> Insurances { get; set; }
        public DbSet<MembershipTypeModel> MembershipTypes { get; set; }
        public DbSet<PatientMembershipModel> PatientMemberships { get; set; }
       
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<VisitModel> Visit { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivisions { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<EmployeeRoleModel> EmployeeRole { get; set; }
        public DbSet<EmployeeTypeModel> EmployeeType { get; set; }
        public DbSet<BillingDeposit> BillingDeposits { get; set; }
        public DbSet<PatientBedInfo> PatientBedInfos { get; set; }
        public DbSet<BillSettlementModel> BillSettlements { get; set; }
        public DbSet<InsuranceProviderModel> InsuranceProviders { get; set; }
        public DbSet<BillItemPrice> BillItemPrice { get; set; } 
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; } 
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<PatientInsurancePackageTransactionModel> PatientInsurancePackageTransactions { get; set; }
        public DbSet<BillingPackageModel> BillingPackages { get; set; }
        public DbSet<CreditOrganizationModel> CreditOrganization { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> RadiologyImagingRequisitions { get; set; }
        public DbSet<BillInvoiceReturnModel> BillReturns { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<BillItemRequisition> BillItemRequisitions { get; set; }
        public DbSet<AppointmentModel> Appointments { get; set; }
        public DbSet<CfgParameterModel> CFGParameters { get; set; }
        public DbSet<BedModel> Beds { get; set; }
        public DbSet<WardModel> Wards { get; set; }
        public DbSet<BedFeature> BedFeatures { get; set; }
        public DbSet<LabVendorsModel> LabVendors { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<IRDLogModel> IRDLog { get; set; } 
        public DbSet<InsuranceBalanceHistoryModel> InsuranceBalanceHistories { get; set; }
        public DbSet<RadiologyImagingTypeModel> RadiologyImagingTypes { get; set; } //Krishna: 2nd'Jan 22
        public DbSet<RadiologyImagingItemModel> RadiologyImagingItems { get; set; } //Krishna: 2nd'Jan 22
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<MembershipTypeModel>().ToTable("PAT_CFG_MembershipType");
            modelBuilder.Entity<PatientMembershipModel>().ToTable("PAT_PatientMembership");
            // Patient and insurance mapping
            modelBuilder.Entity<InsuranceModel>().ToTable("PAT_PatientInsuranceInfo");
            modelBuilder.Entity<InsuranceModel>()
                   .HasRequired<PatientModel>(a => a.Patient) // Insurance entity requires Patient
                   .WithMany(a => a.Insurances) // Patient entity includes many Insurance entities
                    .HasForeignKey(s => s.PatientId);
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<BillingDeposit>().ToTable("BIL_TXN_Deposit");
            modelBuilder.Entity<PatientBedInfo>().ToTable("ADT_TXN_PatientBedInfo");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<BedModel>().ToTable("ADT_Bed");
            modelBuilder.Entity<InsuranceProviderModel>().ToTable("INS_CFG_InsuranceProviders");
            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice"); 
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<BillSettlementModel>().ToTable("BIL_TXN_Settlements");
            // Patient and visit mappings
            modelBuilder.Entity<VisitModel>()
                   .HasRequired<PatientModel>(a => a.Patient)
                   .WithMany(a => a.Visits)
                    .HasForeignKey(s => s.PatientId);

            //Admission and visit
            modelBuilder.Entity<AdmissionModel>()
                .HasKey(t => t.PatientVisitId);
            modelBuilder.Entity<VisitModel>()
                .HasOptional<AdmissionModel>(a => a.Admission)
                .WithRequired(a => a.Visit);

            //Billing mapping
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillingTransactionItemModel>()
                  .HasRequired<BillingTransactionModel>(s => s.BillingTransaction) // Address entity requires Patient
                  .WithMany(s => s.BillingTransactionItems) // Patient entity includes many Addresses entities
                   .HasForeignKey(s => s.BillingTransactionId);
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<PatientInsurancePackageTransactionModel>().ToTable("INS_TXN_PatientInsurancePackages");
            modelBuilder.Entity<BillingPackageModel>().ToTable("BIL_CFG_Packages");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<BillInvoiceReturnModel>().ToTable("BIL_TXN_InvoiceReturn");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<BillItemRequisition>().ToTable("BIL_BillItemRequisition");
            modelBuilder.Entity<AppointmentModel>().ToTable("PAT_Appointment");
            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<BedModel>().ToTable("ADT_Bed");
            modelBuilder.Entity<BedFeature>().ToTable("ADT_MST_BedFeature");
            modelBuilder.Entity<LabVendorsModel>().ToTable("Lab_MST_LabVendors");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<IRDLogModel>().ToTable("IRD_Log");
            modelBuilder.Entity<InsuranceBalanceHistoryModel>().ToTable("INS_InsuranceBalanceAmount_History");

            modelBuilder.Entity<EmployeeRoleModel>().ToTable("EMP_EmployeeRole");
            modelBuilder.Entity<EmployeeTypeModel>().ToTable("EMP_EmployeeType");

            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");

        }
    }
}
