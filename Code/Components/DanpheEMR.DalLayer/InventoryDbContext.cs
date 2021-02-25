using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using DanpheEMR.ServerModel.InventoryModels;


namespace DanpheEMR.DalLayer
{
    public class InventoryDbContext : DbContext
    {
        public InventoryDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<PurchaseOrderModel>().ToTable("INV_TXN_PurchaseOrder");
            modelBuilder.Entity<ItemMasterModel>().ToTable("INV_MST_Item");
            modelBuilder.Entity<VendorMasterModel>().ToTable("INV_MST_Vendor");
            modelBuilder.Entity<PurchaseOrderItemsModel>().ToTable("INV_TXN_PurchaseOrderItems");
            modelBuilder.Entity<GoodsReceiptModel>().ToTable("INV_TXN_GoodsReceipt");
            modelBuilder.Entity<GoodsReceiptItemsModel>().ToTable("INV_TXN_GoodsReceiptItems");
            modelBuilder.Entity<StockModel>().ToTable("INV_TXN_Stock");
            modelBuilder.Entity<StockTransactionModel>().ToTable("INV_TXN_StockTransaction");
            modelBuilder.Entity<RequisitionModel>().ToTable("INV_TXN_Requisition");
            modelBuilder.Entity<RequisitionItemsModel>().ToTable("INV_TXN_RequisitionItems");
            modelBuilder.Entity<DispatchItemsModel>().ToTable("INV_TXN_DispatchItems");
            modelBuilder.Entity<WriteOffItemsModel>().ToTable("INV_TXN_WriteOffItems");
            modelBuilder.Entity<CurrencyMasterModel>().ToTable("INV_MST_Currency");
            modelBuilder.Entity<ItemCategoryMasterModel>().ToTable("INV_MST_ItemCategory");
            modelBuilder.Entity<UnitOfMeasurementMasterModel>().ToTable("INV_MST_UnitOfMeasurement");
            modelBuilder.Entity<PackagingTypeMasterModel>().ToTable("INV_MST_PackagingType");
            modelBuilder.Entity<AccountHeadMasterModel>().ToTable("INV_MST_AccountHead");
            modelBuilder.Entity<ReturnToVendorItemsModel>().ToTable("INV_TXN_ReturnToVendorItems");
            modelBuilder.Entity<ReturnToVendorModel>().ToTable("INV_TXN_ReturnToVendor");
            modelBuilder.Entity<InventoryCompanyModel>().ToTable("INV_MST_Company");
            modelBuilder.Entity<InventoryTermsModel>().ToTable("INV_MST_Terms");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<RequestForQuotation>().ToTable("INV_RequestForQuotation");
            modelBuilder.Entity<RequestForQuotationItem>().ToTable("INV_RequestForQuotationItems");
            modelBuilder.Entity<Quotation>().ToTable("INV_Quotation");
            modelBuilder.Entity<WARDStockModel>().ToTable("WARD_Stock");
            modelBuilder.Entity<QuotationItems>().ToTable("INV_QuotationItems");
            modelBuilder.Entity<QuotationUploadedFiles>().ToTable("INV_QuotationUploadedFiles");

            modelBuilder.Entity<ItemSubCategoryMasterModel>().ToTable("INV_MST_ItemSubCategory");
            modelBuilder.Entity<PurchaseRequestModel>().ToTable("INV_TXN_PurchaseRequest");
            modelBuilder.Entity<PurchaseRequestItemModel>().ToTable("INV_TXN_PurchaseRequestItems");
            modelBuilder.Entity<PHRMStoreModel>().ToTable("PHRM_MST_Store"); //it was supposed to be exclusive to pharmacy, but later on used in both pharmacy and inventory
            modelBuilder.Entity<WARDInventoryStockModel>().ToTable("WARD_INV_Stock");
            modelBuilder.Entity<WARDInventoryTransactionModel>().ToTable("WARD_INV_Transaction");
            modelBuilder.Entity<VerificationModel>().ToTable("TXN_Verification");
            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<InventoryFiscalYear>().ToTable("INV_CFG_FiscalYears");
            modelBuilder.Entity<InventoryFiscalYearStock>().ToTable("INV_FiscalYearStock");
        }
        public DbSet<PurchaseOrderModel> PurchaseOrders { get; set; }
        public DbSet<ItemMasterModel> Items { get; set; }
        public DbSet<VendorMasterModel> Vendors { get; set; }
        public DbSet<StockTransactionModel> StockTransactions { get; set; }
        public DbSet<PurchaseOrderItemsModel> PurchaseOrderItems { get; set; }
        public DbSet<GoodsReceiptModel> GoodsReceipts { get; set; }
        public DbSet<GoodsReceiptItemsModel> GoodsReceiptItems { get; set; }
        public DbSet<StockModel> Stock { get; set; }
        public DbSet<DispatchItemsModel> DispatchItems { get; set; }
        public DbSet<RequisitionModel> Requisitions { get; set; }
        public DbSet<RequisitionItemsModel> RequisitionItems { get; set; }
        public DbSet<WriteOffItemsModel> WriteOffItems { get; set; }
        public DbSet<CurrencyMasterModel> CurrencyMaster { get; set; }
        public DbSet<ItemCategoryMasterModel> ItemCategoryMaster { get; set; }
        public DbSet<UnitOfMeasurementMasterModel> UnitOfMeasurementMaster { get; set; }
        public DbSet<PackagingTypeMasterModel> PackagingTypeMaster { get; set; }
        public DbSet<AccountHeadMasterModel> AccountHeadMaster { get; set; }
        public DbSet<ReturnToVendorItemsModel> ReturnToVendorItems { get; set; }
        public DbSet<ReturnToVendorModel> ReturnToVendor { get; set; }
        public DbSet<InventoryCompanyModel> InventoryCompany { get; set; }
        public DbSet<InventoryTermsModel> InventoryTerms { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<RequestForQuotation> ReqForQuotation { get; set; }
        public DbSet<RequestForQuotationItem> ReqForQuotationItems { get; set; }
        public DbSet<QuotationItems> QuotationItems { get; set; }
        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<QuotationUploadedFiles> quotationUploadedFiles { get; set; }
        public DbSet<WARDStockModel> WardStock { get; set; }
        public DbSet<ItemSubCategoryMasterModel> ItemSubCategoryMaster { get; set; }
        public DbSet<PurchaseRequestModel> PurchaseRequest { get; set; }
        public DbSet<PurchaseRequestItemModel> PurchaseRequestItems { get; set; }
        public DbSet<PHRMStoreModel> StoreMasterModel { get; set; }
        public DbSet<WARDInventoryStockModel> WardInventoryStockModel { get; set; }
        public DbSet<WARDInventoryTransactionModel> WardInventoryTransactionModel { get; set; }
        public DbSet<VerificationModel> Verifications { get; set; }
        public DbSet<CfgParameterModel> CfgParameters { get; set; }
        public DbSet<BillingFiscalYear> FiscalYears { get; set; }
        public DbSet<InventoryFiscalYear> InventoryFiscalYears { get; set; }
        public DbSet<InventoryFiscalYearStock> InventoryFiscalYearStocks { get; set; }

    }
}
