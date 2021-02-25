using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;

namespace DanpheEMR.DalLayer
{
    public class OrdersDbContext : DbContext
    {

        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<PHRMItemMasterModel> PharmacyItems { get; set; }
        public DbSet<PHRMStockModel> PharmacyStocks { get; set; }
        public DbSet<PHRMGenericModel> PharmacyGenericItems { get; set; }
        public DbSet<EmployeePreferences> EmployeePreferences { get; set; }
        public DbSet<PHRMGenericDosageNFreqMap> GenericDosageMaps { get; set; }//sud: 15Jul'18

        public DbSet<BillItemPrice> BillItemPrice { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<BillingTransactionModel> BillingTransactionModels { get; set; }
        public DbSet<WardModel> Wards { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }

        public OrdersDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");

            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");

            modelBuilder.Entity<PHRMItemMasterModel>().ToTable("PHRM_MST_Item");
            modelBuilder.Entity<PHRMStockModel>().ToTable("PHRM_Stock");
            modelBuilder.Entity<PHRMGenericModel>().ToTable("PHRM_MST_Generic");

            modelBuilder.Entity<EmployeePreferences>().ToTable("EMP_EmployeePreferences");
            modelBuilder.Entity<PHRMGenericDosageNFreqMap>().ToTable("PHRM_MAP_GenericDosaseNFreq");//sud: 15Jul'18

            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
        }



    }
}
