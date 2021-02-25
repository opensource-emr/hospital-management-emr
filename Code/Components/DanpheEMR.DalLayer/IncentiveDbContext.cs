using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.IncentiveModels;
using DanpheEMR.ServerModel;

namespace DanpheEMR.DalLayer
{
    public class IncentiveDbContext : DbContext
    {
        public IncentiveDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        public DbSet<ProfileModel> Profile { get; set; }
        public DbSet<PriceCategoryModel> PriceCategories { get; set; }//this is coming from Billing's -> model
        //public DbSet<EmployeeProfileMap> EMPProfileMap { get; set; }
        public DbSet<ProfileItemMap> ProfileItemMap { get; set; }
        public DbSet<IncentiveFractionItemModel> IncentiveFractionItems { get; set; }
        public DbSet<PaymentInfoModel> PaymentInfo { get; set; }
        public DbSet<LedgerGroupModel> LedgerGroups { get; set; }
        public DbSet<LedgerModel> Ledgers { get; set; }
        public DbSet<LedgerMappingModel> LedgerMappings { get; set; }

        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<EmployeeBillItemsMap> EmployeeBillItemsMap { get; set; }
        public DbSet<ItemGroupDistribution> ItemGroupDistribution { get; set; }
        public DbSet<EmployeeIncentiveInfo> EmployeeIncentiveInfo { get; set; }

        public DbSet<BillItemPrice> BillItemPrice { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProfileModel>().ToTable("INCTV_MST_Profile");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");//pratik:18Nov'19--changed the db-table mapping. 
            //modelBuilder.Entity<EmployeeProfileMap>().ToTable("INCTV_EMP_Profile_Map");
            modelBuilder.Entity<ProfileItemMap>().ToTable("INCTV_BillItems_Profile_Map");
            modelBuilder.Entity<IncentiveFractionItemModel>().ToTable("INCTV_TXN_IncentiveFractionItem");
            modelBuilder.Entity<PaymentInfoModel>().ToTable("INCTV_TXN_PaymentInfo");

            modelBuilder.Entity<LedgerGroupModel>().ToTable("ACC_MST_LedgerGroup");
            modelBuilder.Entity<LedgerModel>().ToTable("ACC_Ledger");
            modelBuilder.Entity<LedgerMappingModel>().ToTable("ACC_Ledger_Mapping");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<EmployeeBillItemsMap>().ToTable("INCTV_MAP_EmployeeBillItemsMap");
            modelBuilder.Entity<ItemGroupDistribution>().ToTable("INCTV_CFG_ItemGroupDistribution");
            modelBuilder.Entity<EmployeeIncentiveInfo>().ToTable("INCTV_EmployeeIncentiveInfo");

            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");
        }
    }
}
