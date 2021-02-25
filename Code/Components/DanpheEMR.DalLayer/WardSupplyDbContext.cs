using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using DanpheEMR.ServerModel.InventoryModels;
using System.Data;
using System.Data.SqlClient;

namespace DanpheEMR.DalLayer
{
    public class WardSupplyDbContext : DbContext
    {
        public WardSupplyDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");
            modelBuilder.Entity<PHRMStoreModel>().ToTable("PHRM_MST_Store");
            modelBuilder.Entity<WARDStockModel>().ToTable("WARD_Stock");
            modelBuilder.Entity<WARDRequisitionModel>().ToTable("WARD_Requisition");
            modelBuilder.Entity<WARDRequisitionItemsModel>().ToTable("WARD_RequisitionItems");
            modelBuilder.Entity<WARDDispatchModel>().ToTable("WARD_Dispatch");
            modelBuilder.Entity<WARDDispatchItemsModel>().ToTable("WARD_DispatchItems");
            modelBuilder.Entity<WARDConsumptionModel>().ToTable("WARD_Consumption");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<PHRMItemMasterModel>().ToTable("PHRM_MST_Item");
            modelBuilder.Entity<PHRMGenericModel>().ToTable("PHRM_MST_Generic");
            //Patient with Visit sanjit
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<PatientBedInfo>().ToTable("ADT_TXN_PatientBedInfo");
            modelBuilder.Entity<WARDTransactionModel>().ToTable("WARD_Transaction");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            //Consumption For Inventory
            modelBuilder.Entity<WARDInventoryConsumptionModel>().ToTable("WARD_INV_Consumption");
            modelBuilder.Entity<ItemMasterModel>().ToTable("INV_MST_Item");
            modelBuilder.Entity<UnitOfMeasurementMasterModel>().ToTable("INV_MST_UnitOfMeasurement");
            //Inventory Stock Table to send items back to Inventory
            modelBuilder.Entity<StockModel>().ToTable("INV_TXN_Stock");
            modelBuilder.Entity<StockTransactionModel>().ToTable("INV_TXN_StockTransaction");
            modelBuilder.Entity<WARDInternalConsumptionItemsModel>().ToTable("WARD_InternalConsumptionItems");
            modelBuilder.Entity<WARDInternalConsumptionModel>().ToTable("WARD_InternalConsumption");
            modelBuilder.Entity<WARDInventoryStockModel>().ToTable("WARD_INV_Stock");
            modelBuilder.Entity<WARDInventoryTransactionModel>().ToTable("WARD_INV_Transaction");
            modelBuilder.Entity<PHRMInvoiceTransactionItemsModel>().ToTable("PHRM_TXN_InvoiceItems");
            modelBuilder.Entity<PHRMStockTransactionItemsModel>().ToTable("PHRM_StockTxnItems");
            modelBuilder.Entity<VerificationModel>().ToTable("TXN_Verification");
            modelBuilder.Entity<InventoryFiscalYear>().ToTable("INV_CFG_FiscalYears");
            modelBuilder.Entity<RequisitionModel>().ToTable("INV_TXN_Requisition");
            modelBuilder.Entity<RequisitionItemsModel>().ToTable("INV_TXN_RequisitionItems");

        }
        public DbSet<WardModel> WardModel { get; set; }
        public DbSet<PHRMStoreModel> StoreModel { get; set; }
        public DbSet<WARDStockModel> WARDStockModel { get; set; }
        public DbSet<WARDRequisitionModel> WARDRequisitionModel { get; set; }
        public DbSet<WARDRequisitionItemsModel> WARDRequisitionItemsModel { get; set; }
        public DbSet<WARDDispatchModel> WARDDispatchModel { get; set; }
        public DbSet<WARDDispatchItemsModel> WARDDispatchItemsModel { get; set; }
        public DbSet<WARDConsumptionModel> WARDConsumptionModel { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<PHRMItemMasterModel> PHRMItemMaster { get; set; }
        public DbSet<PHRMGenericModel> PHRMGenericMaster { get; set; }//sanjit 6jan20
        public DbSet<AdmissionModel> Admissions { get; set; } //sanjit 17feb2019
        public DbSet<VisitModel> Visits { get; set; } //sanjit 17feb2019
        public DbSet<PatientBedInfo> PatientBedInfos { get; set; }
        public DbSet<WARDTransactionModel> TransactionModel { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<WARDInventoryConsumptionModel> WARDInventoryConsumptionModel { get; set; }
        public DbSet<ItemMasterModel> INVItemMaster { get; set; }
        public DbSet<UnitOfMeasurementMasterModel> UnitOfMeasurementMaster { get; set; }
        public DbSet<StockModel> INVStockMaster { get; set; }
        public DbSet<StockTransactionModel> INVStockTransaction { get; set; }
        public DbSet<WARDInternalConsumptionItemsModel> WARDInternalConsumptionItemsModel { get; set; }
        public DbSet<WARDInternalConsumptionModel> WARDInternalConsumptionModel { get; set; }
        public DbSet<WARDInventoryStockModel> WARDInventoryStockModel { get; set; }
        public DbSet<WARDInventoryTransactionModel> WARDInventoryTransactionModel { get; set; }
        public DbSet<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
        public DbSet<VerificationModel> VerificationModel { get; set; }
        public DbSet<InventoryFiscalYear> InvFiscalYears { get; set; }
        public DbSet<RequisitionModel> Requisitions { get; set; }
        public DbSet<RequisitionItemsModel> RequisitionItems { get; set; }
    }
}
