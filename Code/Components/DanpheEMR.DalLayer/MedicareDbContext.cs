using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.AccountingModels;
using DanpheEMR.ServerModel.MedicareModels;
using System.Data.Entity;

namespace DanpheEMR.DalLayer
{
    public class MedicareDbContext: DbContext
    {
        public MedicareDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        public DbSet<MedicareMember> MedicareMembers { get; set; }
        public DbSet<MedicareTypes> MedicareTypes { get; set; }
        public DbSet<MedicareInstitutes> MedicareInstitutes { get; set; }
        public DbSet<MedicareMemberBalance> MedicareMemberBalance { get; set; }
        public DbSet<EmployeeRoleModel> EmployeeRole { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<InsuranceProviderModel> InsuranceProvider { get; set; }
        public DbSet<SubLedgerModel> SubLedger { get; set; }
        public DbSet<HospitalModel> Hospital { get; set; }
        public DbSet<LedgerMappingModel> LedgerMapping { get; set; }
        public DbSet<SubLedgerBalanceHistory> SubLedgerBalanceHistory { get; set; }
        public DbSet<FiscalYearModel> FiscalYears { get; set; }


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MedicareMember>().ToTable("INS_MedicareMember");
            modelBuilder.Entity<MedicareTypes>().ToTable("INS_MST_MedicareType");
            modelBuilder.Entity<MedicareInstitutes>().ToTable("INS_MST_MedicareInstitute");
            modelBuilder.Entity<MedicareMemberBalance>().ToTable("INS_MedicareMemberBalance");
            modelBuilder.Entity<EmployeeRoleModel>().ToTable("EMP_EmployeeRole");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<InsuranceProviderModel>().ToTable("INS_CFG_InsuranceProviders");
            modelBuilder.Entity<SubLedgerModel>().ToTable("ACC_MST_SubLedger");
            modelBuilder.Entity<HospitalModel>().ToTable("ACC_MST_Hospital");
            modelBuilder.Entity<LedgerMappingModel>().ToTable("ACC_Ledger_Mapping");
            modelBuilder.Entity<SubLedgerBalanceHistory>().ToTable("ACC_SubLedgerBalanceHistory");
            modelBuilder.Entity<FiscalYearModel>().ToTable("ACC_MST_FiscalYears");
        }
    }
}
