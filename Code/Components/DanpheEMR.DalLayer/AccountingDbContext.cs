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
using DanpheEMR.Security;
using DanpheEMR.ServerModel.IncentiveModels;
using DanpheEMR.ServerModel.AccountingModels;

namespace DanpheEMR.DalLayer
{
    public class AccountingDbContext : DbContext
    {
        public AccountingDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChartOfAccountModel>().ToTable("ACC_MST_ChartOfAccounts");
            modelBuilder.Entity<VoucherModel>().ToTable("ACC_MST_Vouchers");
            modelBuilder.Entity<VoucherHeadModel>().ToTable("ACC_MST_VoucherHead");
            //modelBuilder.Entity<AccountingReportModel>().ToTable("ACC_MST_AccountingReports");
            modelBuilder.Entity<LedgerGroupCategoryModel>().ToTable("ACC_MST_LedgerGroupCategory");
            modelBuilder.Entity<LedgerGroupModel>().ToTable("ACC_MST_LedgerGroup");
            modelBuilder.Entity<LedgerModel>().ToTable("ACC_Ledger");
            modelBuilder.Entity<TransactionModel>().ToTable("ACC_Transactions");
            modelBuilder.Entity<TransactionItemModel>().ToTable("ACC_TransactionItems");
            modelBuilder.Entity<TransactionItemDetailModel>().ToTable("ACC_TransactionItemDetail");
            modelBuilder.Entity<TransactionInventoryItemModel>().ToTable("ACC_TransactionInventoryItems");
            modelBuilder.Entity<FiscalYearModel>().ToTable("ACC_MST_FiscalYears");
            modelBuilder.Entity<TransactionCostCenterItemModel>().ToTable("ACC_TransactionCostCenterItems");
            modelBuilder.Entity<CostCenterItemModel>().ToTable("ACC_MST_CostCenterItems");
            modelBuilder.Entity<TransactionLinkModel>().ToTable("ACC_TXN_Link");
            modelBuilder.Entity<GroupMappingModel>().ToTable("ACC_MST_GroupMapping");
            modelBuilder.Entity<MappingDetailModel>().ToTable("ACC_MST_MappingDetail");
            modelBuilder.Entity<SyncBillingAccountingModel>().ToTable("BIL_SYNC_BillingAccounting");
            modelBuilder.Entity<MapTransactionItemCostCenterItemModel>().ToTable("ACC_Map_TxnItemCostCenterItem");
            modelBuilder.Entity<LedgerBalanceHistoryModel>().ToTable("ACC_LedgerBalanceHistory");
            //modelBuilder.Entity<AccountingInvoiceDataModel>().ToTable("ACC_InvoiceData");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<PHRMSupplierModel>().ToTable("PHRM_MST_Supplier");
            modelBuilder.Entity<LedgerMappingModel>().ToTable("ACC_Ledger_Mapping");
            modelBuilder.Entity<VendorMasterModel>().ToTable("INV_MST_Vendor");
            modelBuilder.Entity<VendorMasterModel>().ToTable("INV_MST_Vendor");
            modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<CfgParameterModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<ItemMasterModel>().ToTable("INV_MST_Item");
            modelBuilder.Entity<HospitalModel>().ToTable("ACC_MST_Hospital");
            modelBuilder.Entity<HospitalTransferRuleMappingModel>().ToTable("ACC_MST_Hospital_TransferRules_Mapping");
            modelBuilder.Entity<ReverseTransactionModel>().ToTable("ACC_ReverseTransaction");
            modelBuilder.Entity<AccountingBillLedgerMappingModel>().ToTable("ACC_Bill_LedgerMapping");
            modelBuilder.Entity<AccountingCodeDetailsModel>().ToTable("ACC_MST_CodeDetails");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<PaymentInfoModel>().ToTable("INCTV_TXN_PaymentInfo");
            modelBuilder.Entity<IncentiveFractionItemModel>().ToTable("INCTV_TXN_IncentiveFractionItem");
            modelBuilder.Entity<AccSectionModel>().ToTable("ACC_MST_SectionList");
            modelBuilder.Entity<ItemSubCategoryMasterModel>().ToTable("INV_MST_ItemSubCategory");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<FiscalYearLogModel>().ToTable("ACC_FiscalYear_Log");
            modelBuilder.Entity<EditVoucherLogModel>().ToTable("ACC_Log_EditVoucher");
            modelBuilder.Entity<PrimaryGroupModel>().ToTable("ACC_MST_PrimaryGroup");
            modelBuilder.Entity<AccountingTransactionHistoryModel>().ToTable("ACC_Transaction_History");
        }
        public DbSet<ChartOfAccountModel> ChartOfAccounts { get; set; }
        public DbSet<VoucherModel> Vouchers { get; set; }
        public DbSet<VoucherHeadModel> VoucherHeads { get; set; }
        // public DbSet<AccountingReportModel> AccountingReports { get; set; }
        public DbSet<LedgerGroupCategoryModel> LedgerGroupsCategory { get; set; }
        public DbSet<LedgerGroupModel> LedgerGroups { get; set; }
        public DbSet<LedgerModel> Ledgers { get; set; }

        public DbSet<TransactionModel> Transactions { get; set; }
        public DbSet<TransactionItemModel> TransactionItems { get; set; }
        public DbSet<TransactionItemDetailModel> TransactionItemDetails { get; set; }
        public DbSet<TransactionInventoryItemModel> TransactionInventoryItems { get; set; }
        public DbSet<FiscalYearModel> FiscalYears { get; set; }
        public DbSet<TransactionCostCenterItemModel> TransactionCostCenters { get; set; }
        public DbSet<CostCenterItemModel> CostCenterItems { get; set; }
        public DbSet<TransactionLinkModel> TransactionLinks { get; set; }
        public DbSet<GroupMappingModel> GroupMapping { get; set; }
        public DbSet<MappingDetailModel> MappingDetail { get; set; }
        public DbSet<SyncBillingAccountingModel> SyncBillingAccounting { get; set; }
        public DbSet<MapTransactionItemCostCenterItemModel> MapTxnItemCostCenterItem { get; set; }
        public DbSet<LedgerBalanceHistoryModel> LedgerBalanceHistory { get; set; }
        //public DbSet<AccountingInvoiceDataModel> AccountingInvoiceData { get; set; }
        public DbSet<PatientModel> PatientModel { get; set; }
        public DbSet<PHRMSupplierModel> PHRMSupplier { get; set; }
        public DbSet<LedgerMappingModel> LedgerMappings { get; set; }
        public DbSet<VendorMasterModel> InvVendors { get; set; }
        public DbSet<RbacUser> Users { get; set; }
        public DbSet<EmployeeModel> Emmployees { get; set; }
        public DbSet<CfgParameterModel> CFGParameters { get; set; }
        public DbSet<ItemMasterModel> InventoryItems { get; set; }
        public DbSet<HospitalModel> Hospitals { get; set; }
        public DbSet<HospitalTransferRuleMappingModel> HospitalTransferRuleMappings { get; set; }
        public DbSet<ReverseTransactionModel> ReverseTransaction { get; set; }
        public DbSet<AccountingBillLedgerMappingModel> AccountBuillLedgerMapping { get; set; }
        public DbSet<AccountingCodeDetailsModel> ACCCodeDetails { get; set; }

        public DbSet<CreditOrganizationModel> BillCreditOrganizations { get; set; }

        public DbSet<PaymentInfoModel> PaymentInfo { get; set; }
        public DbSet<IncentiveFractionItemModel> IncentiveFractionItems { get; set; }
        public DbSet<AccSectionModel> Section { get; set; }
        public DbSet<ItemSubCategoryMasterModel> ItemSubCategoryMaster { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<FiscalYearLogModel> FiscalYearLog { get; set; }
        public DbSet<EditVoucherLogModel> EditVoucherLog { get; set; }
        public DbSet<AccountingTransactionHistoryModel> AccountingTransactionHistory { get; set; }
        public DbSet<PrimaryGroupModel> PrimaryGroup { get; set; }


        #region Get inventory Goods Receipt for transfer to accounting group by Date Wise
        public DataTable INVGoodsReceiptData()
        {
            try
            {
                DataTable invGRDT = DALFunctions.GetDataTableFromStoredProc("[SP_ACC_GetINVGoodsReceiptData]", this);
                return invGRDT;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update pharmacy invoice, writeoff, returnto supplier, etc after transfered to accounting and undo transaction from accounting
        //using stored procedure we are updatintg       
        public void UpdateIsTransferToACC(string referenceIds, string transactionType,List<AccountingReferenceTypeViewModel> referenceIdList)//,string ReferenceIdsOne
        {
            var refIdOneStr = "";
            if (referenceIdList.Count > 0)
            {
                var matchedRefList= referenceIdList.Find(r => r.Type == transactionType);
                refIdOneStr = (matchedRefList != null) ? matchedRefList.ReferenceIdsOne : null;                
            }
                                
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@ReferenceIds", referenceIds),
                 new SqlParameter("@TransactionType", transactionType),
                  new SqlParameter("@IsReverseTransaction", false),
                  new SqlParameter("@ReferenceIdsOne", refIdOneStr),
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            ExecuteStoreProc("SP_UpdateIsTransferToACC", paramList, this);
        }
        public bool UndoTxnUpdateIsTransferToACC(string referenceIds, string transactionType, int currHospitalId, bool IsReverseTransaction , string txnDate , List<AccountingReferenceTypeViewModel> referenceIdList)
        { 
            var refIdOneStr = "";
            if (referenceIdList.Count > 0)
            {
                var matchedRefList = referenceIdList.Find(r => r.Type == transactionType);
                refIdOneStr = (matchedRefList != null) ? matchedRefList.ReferenceIds : null;
            }

            //IsReverseTransaction = false
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@ReferenceIds", referenceIds),
                 new SqlParameter("@TransactionType", transactionType),
                   new SqlParameter("@IsReverseTransaction", IsReverseTransaction),
                   new SqlParameter("@TransactionDate",txnDate),
                   new SqlParameter("@ReferenceIdsOne", refIdOneStr),
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            return ExecuteStoreProc("SP_UpdateIsTransferToACC", paramList, this);
        }
        public static bool ExecuteStoreProc(string storedProcName, List<SqlParameter> ipParams, DbContext dbContext)
        {
            // creates resulting dataset
            var result = new DataSet();
            // creates a Command 
            var cmd = dbContext.Database.Connection.CreateCommand();
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = storedProcName;

            if (ipParams != null && ipParams.Count > 0)
            {
                foreach (var param in ipParams)
                {
                    cmd.Parameters.Add(param);
                }
            }

            try
            {
                var dntransact = dbContext.Database.Connection.State;
                var retValRes = 0;
                if (dntransact == ConnectionState.Closed)
                {
                    dbContext.Database.Connection.Open();
                    retValRes = cmd.ExecuteNonQuery();
                }
                else
                {
                    retValRes = cmd.ExecuteNonQuery();
                }
                // executes
                //dbContext.Database.Connection.Open();
                //var retValRes = cmd.ExecuteNonQuery();                
            }
            finally
            {
                // closes the connection
                dbContext.Database.Connection.Close();
            }
            return true;

        }
        #endregion  Update pharmacy invoice, writeoff, returnto supplier, etc after transfered to accounting and undo transaction from accounting

        #region Get Billing TxnItems datewise for transfer to accounting 
        public DataTable BilTxnItemsDateWise(DateTime SelectedDate, int currHospitalId)
        {
            List<SqlParameter> spParam = new List<SqlParameter>();
            spParam.Add(new SqlParameter("@TransactionDate", SelectedDate.Date));
            spParam.Add(new SqlParameter("@HospitalId", currHospitalId));

            DataTable BillingTxn = DALFunctions.GetDataTableFromStoredProc("SP_ACC_Bill_GetBillingDataForAccTransfer", spParam, this);
            return BillingTxn;
        }

        #endregion

        #region Get incetives TxnItems datewise for transfer to accounting 
        public DataSet InvTxnsDateWise(DateTime SelectedDate, int currHospitalId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@TransactionDate", SelectedDate.Date),
                    new SqlParameter("@HospitalId", currHospitalId)
                };
            DataSet txn = DALFunctions.GetDatasetFromStoredProc("SP_ACC_GetInventoryTransactions", paramList, this);
            return txn;
        }
        #endregion

        #region Daily Transaction Report Details        
        public DataSet DailyTransactionReportDetails(string VoucherNumber, int currHospitalId)
        {
            List<SqlParameter> spParam = new List<SqlParameter>();
            spParam.Add(new SqlParameter("@VoucherNumber", VoucherNumber));
            spParam.Add(new SqlParameter("@HospitalId", currHospitalId));

            DataSet dailytxnDetails = DALFunctions.GetDatasetFromStoredProc("SP_ACC_DailyTransactionReportDetails", spParam, this);
            return dailytxnDetails;
        }
        #endregion

        #region Reopen fiscal year action will Open fiscal year (IsClosed=false)
        /// <summary>
        /// Update IsClosed Status for fiscalYear
        /// add log into fiscalYear log table as reopened 
        /// update ACC_Ledger table Opening balance        
        /// </summary>
        /// <param name="FiscalYearId"></param>
        /// <param name="EmployeeId"></param>
        /// <param name="currHospitalId"></param>
        /// <returns></returns>
        public DataTable ReOpenFiscalYear(int FiscalYearId,int EmployeeId, int currHospitalId, string Remark)
        {
            List<SqlParameter> spParam = new List<SqlParameter>();         
            spParam.Add(new SqlParameter("@FiscalYearId", FiscalYearId));
            spParam.Add(new SqlParameter("@EmployeeId", EmployeeId));
            spParam.Add(new SqlParameter("@HospitalId", currHospitalId));
            spParam.Add(new SqlParameter("@Remark", Remark));

            DataTable reopenedFiscalYear = DALFunctions.GetDataTableFromStoredProc("SP_ACC_ReopenFiscalYear", spParam, this);
            return reopenedFiscalYear;
        }

        #endregion
    }
}
