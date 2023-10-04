using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ServerModel.PharmacyModels.Patient_Consumption;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace DanpheEMR.DalLayer
{
    public class PatientConsumptionDbContext : DbContext
    {
        public PatientConsumptionDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PatientConsumptionModel>().ToTable("PHRM_TXN_PatientConsumption");
            modelBuilder.Entity<PatientConsumptionItemModel>().ToTable("PHRM_TXN_PatientConsumptionItem");
            modelBuilder.Entity<PatientConsumptionReturnItemModel>().ToTable("PHRM_TXN_PatientConsumptionReturnItem");
            modelBuilder.Entity<PharmacyFiscalYear>().ToTable("PHRM_CFG_FiscalYears");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<VisitModel>().ToTable("Pat_PatientVisits");
            modelBuilder.Entity<EmployeeModel>().ToTable("Emp_Employee");
            modelBuilder.Entity<PHRMStoreModel>().ToTable("PHRM_MST_Store");
            modelBuilder.Entity<PHRMInvoiceTransactionModel>().ToTable("PHRM_TXN_Invoice");
            modelBuilder.Entity<PHRMInvoiceTransactionItemsModel>().ToTable("PHRM_TXN_InvoiceItems");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");
            modelBuilder.Entity<PaymentModes>().ToTable("MST_PaymentModes");
            modelBuilder.Entity<PHRMEmployeeCashTransaction>().ToTable("PHRM_EmployeeCashTransaction");
            modelBuilder.Entity<BillingSchemeModel>().ToTable("BIL_CFG_Scheme");
            modelBuilder.Entity<PHRMStockTransactionModel>().ToTable("PHRM_TXN_StockTransaction");
            modelBuilder.Entity<PHRMStoreStockModel>().ToTable("PHRM_TXN_StoreStock");
            modelBuilder.Entity<PHRMStockMaster>().ToTable("PHRM_MST_Stock");
            modelBuilder.Entity<PHRM_MAP_ItemToRack>().ToTable("PHRM_MAP_ItemToRack");
            modelBuilder.Entity<PHRMRackModel>().ToTable("PHRM_MST_Rack");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<WardSubStoresMapModel>().ToTable("NUR_MAP_WardSubStoresMap");
            modelBuilder.Entity<BillingDepositModel>().ToTable("BIL_TXN_Deposit");
            modelBuilder.Entity<DepositHeadModel>().ToTable("BIL_MST_DepositHead");
            modelBuilder.Entity<PHRMTransactionCreditBillStatus>().ToTable("PHRM_TXN_CreditBillStatus");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<MedicareMember>().ToTable("INS_MedicareMember");
            modelBuilder.Entity<MedicareMemberBalance>().ToTable("INS_MedicareMemberBalance");

            modelBuilder.Conventions.Remove<DecimalPropertyConvention>();
            modelBuilder.Conventions.Add(new DecimalPropertyConvention(16, 4));
        }
        public DbSet<PatientConsumptionModel> PatientConsumption { get; set; }
        public DbSet<PatientConsumptionItemModel> PatientConsumptionItem { get; set; }
        public DbSet<PatientConsumptionReturnItemModel> PatientConsumptionReturnItem { get; set; }
        public DbSet<PharmacyFiscalYear> PharmacyFiscalYears { get; set; }
        public DbSet<VisitModel> PatientVisits { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubDivisions { get; set; }
        public DbSet<PHRMStoreModel> Stores { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<PHRMInvoiceTransactionModel> PHRMInvoiceTransaction { get; set; }
        public DbSet<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<PriceCategoryModel> PriceCategories { get; set; }
        public DbSet<PaymentModes> PaymentModeSubCategories { get; set; }
        public DbSet<PHRMEmployeeCashTransaction> PharmacyEmployeeCashTransactions { get; set; }
        public DbSet<BillingSchemeModel> Schemes { get; set; }
        public DbSet<PHRMStockTransactionModel> StockTransactions { get; set; }
        public DbSet<PHRMStoreStockModel> StoreStocks { get; set; }
        public DbSet<PHRMStockMaster> StockMaster { get; set; }
        public DbSet<PHRM_MAP_ItemToRack> PHRMRackItem { get; set; }
        public DbSet<PHRMRackModel> PHRMRack { get; set; }
        public DbSet<CreditOrganizationModel> BillingCreditOrganizations { get; set; }
        public DbSet<WardSubStoresMapModel> WardSubStoresMaps { get; set; }
        public DbSet<BillingDepositModel> Deposits { get; set; }
        public DbSet<DepositHeadModel> DepositHeadModels { get; set; }
        public DbSet<PHRMTransactionCreditBillStatus> PHRMTransactionCreditBillStatus { get; set; }
        public DbSet<PatientSchemeMapModel> PatientSchemeMapModels { get; set; }
        public DbSet<MedicareMember> MedicareMembers { get; set; }
        public DbSet<MedicareMemberBalance> MedicareMemberBalances { get; set; }

    }
}
