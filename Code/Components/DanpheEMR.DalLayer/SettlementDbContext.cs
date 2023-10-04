using Audit.EntityFramework;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.PharmacyModels;
using System.Data.Entity;

namespace DanpheEMR.DalLayer
{
    public class SettlementDbContext : AuditDbContext
    {
        public SettlementDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
            this.AuditDisabled = true;

        }
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillingDepositModel> BillingDeposits { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<VisitModel> PatientVisits { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<BillSettlementModel> BillSettlements { get; set; }
        public DbSet<CreditOrganizationModel> CreditOrganization { get; set; }
        public DbSet<EmpCashTransactionModel> EmpCashTransactions { get; set; }
        public DbSet<BillInvoiceReturnModel> BillInvoiceReturns { get; set; }
        public DbSet<PriceCategoryModel> PriceCategoryModels { get; set; }
        public DbSet<PaymentModes> PaymentModes { get; set; }
        public DbSet<BillingTransactionCreditBillStatusModel> BillingTransactionCreditBillStatuses { get; set; }

        public DbSet<PHRMInvoiceTransactionModel> PHRMInvoiceTransactionModels { get; set; }
        public DbSet<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
        public DbSet<PHRMTransactionCreditBillStatus> PHRMTransactionCreditBillStatuses { get; set; }
        public DbSet<PHRMInvoiceReturnModel> PHRMInvoiceReturnModels { get; set; }
        public DbSet<DepositHeadModel> DepositHeadModels { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillingDepositModel>().ToTable("BIL_TXN_Deposit");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<BillSettlementModel>().ToTable("BIL_TXN_Settlements");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<EmpCashTransactionModel>().ToTable("TXN_EmpCashTransaction");
            modelBuilder.Entity<BillInvoiceReturnModel>().ToTable("BIL_TXN_InvoiceReturn");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");
            modelBuilder.Entity<PaymentModes>().ToTable("MST_PaymentModes");
            modelBuilder.Entity<BillingTransactionCreditBillStatusModel>().ToTable("BIL_TXN_CreditBillStatus");
            modelBuilder.Entity<PHRMInvoiceTransactionModel>().ToTable("PHRM_TXN_Invoice");
            modelBuilder.Entity<PHRMInvoiceTransactionItemsModel>().ToTable("PHRM_TXN_InvoiceItems");
            modelBuilder.Entity<PHRMTransactionCreditBillStatus>().ToTable("PHRM_TXN_CreditBillStatus");
            modelBuilder.Entity<PHRMInvoiceReturnModel>().ToTable("PHRM_TXN_InvoiceReturn");
            modelBuilder.Entity<DepositHeadModel>().ToTable("BIL_MST_DepositHead");
        }
    }

}
