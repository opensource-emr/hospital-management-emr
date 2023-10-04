using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MarketingReferralModel;
using System.Data.Entity;

namespace DanpheEMR.DalLayer
{
    public class MarketingReferralDbContext : DbContext
    {
        public MarketingReferralDbContext(string connString) : base(connString)
        {
        }
        public DbSet<BillingTransactionItemModel> BillingTransactionItem { get; set; }
        public DbSet<ReferralSchemeModel> ReferralScheme { get; set; }
        public DbSet<ReferringPartyModel> ReferringParty { get; set; }
        public DbSet<ReferringPartyGroupModel> ReferringPartyGroup { get; set; }
        public DbSet<ReferringOrganizationModel> ReferringOrganization { get; set; }
        public DbSet<ReferralComissionModel> ReferralComission { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<ReferralSchemeModel>().ToTable("MKT_MST_ReferralScheme");
            modelBuilder.Entity<ReferringPartyModel>().ToTable("MKT_CFG_ReferringParty");
            modelBuilder.Entity<ReferringPartyGroupModel>().ToTable("MKT_MST_ReferringPartyGroup");
            modelBuilder.Entity<ReferringOrganizationModel>().ToTable("MKT_MST_ReferringOrganization");
            modelBuilder.Entity<ReferralComissionModel>().ToTable("MKT_TXN_ReferralCommission");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
        }
    }
}
