using Audit.EntityFramework;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MedicareModels;
using System.Data.Entity;
using DanpheEMR.ServerModel.PatientModels;
using DanpheEMR.ServerModel.CommonModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.PharmacyModels;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.ServerModel.BillingModels.DischargeStatementModels;

namespace DanpheEMR.DalLayer
{
    public class DischargeDbContext : AuditDbContext
    {

        public DischargeDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
            this.AuditDisabled = true;
        }
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }
        public DbSet<BillItemRequisition> BillItemRequisitions { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillingDepositModel> BillingDeposits { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> RadiologyImagingRequisitions { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<VisitModel> Visit { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<BillInvoiceReturnModel> BillInvoiceReturns { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<PatientBedInfo> PatientBedInfos { get; set; }
        public DbSet<IRDLogModel> IRDLog { get; set; }
        public DbSet<BedModel> Beds { get; set; }
        public DbSet<EmpCashTransactionModel> EmpCashTransactions { get; set; }
        public DbSet<BillingTransactionCreditBillStatusModel> BillingTransactionCreditBillStatuses { get; set; }
        public DbSet<PatientSchemeMapModel> PatientSchemes { get; set; }
        public DbSet<MedicareMember> MedicareMembers { get; set; }
        public DbSet<MedicareMemberBalance> MedicareMemberBalances { get; set; }
        public DbSet<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
        public DbSet<PHRMPatient> PHRMPatient { get; set; }
        public DbSet<PHRMInvoiceTransactionModel> PHRMInvoiceTransaction { get; set; }
        public DbSet<PHRMInvoiceReturnItemsModel> PHRMInvoiceReturnItemsModel { get; set; }
        public DbSet<PHRMDepositModel> DepositModel { get; set; }
        public DbSet<PharmacyFiscalYear> PharmacyFiscalYears { get; set; }
        public DbSet<PHRMStoreStockModel> StoreStocks { get; set; }
        public DbSet<PHRMStockMaster> StockMasters { get; set; }
        public DbSet<PHRMStockTransactionModel> StockTransactions { get; set; }
        public DbSet<PHRMEmployeeCashTransaction> phrmEmployeeCashTransaction { get; set; }
        public DbSet<PaymentModes> PaymentModes { get; set; }
        public DbSet<DischargeStatementModel> DischargeStatements { get; set; }
        public DbSet<BillSettlementModel> BillSettlements { get; set; }
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<PHRMInvoiceReturnModel> PHRMInvoiceReturnModels { get; set; }
        public DbSet<DepositHeadModel> DepositHeadModels { get; set; }
        public DbSet<BillingSchemeModel> BillingSchemes { get; set; }
        public DbSet<PriceCategoryModel> PriceCategories { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillingTransactionItemModel>()
                  .HasRequired<BillingTransactionModel>(s => s.BillingTransaction)
                  .WithMany(s => s.BillingTransactionItems)
                   .HasForeignKey(s => s.BillingTransactionId);
            modelBuilder.Entity<BillServiceItemModel>().ToTable("BIL_MST_ServiceItem");
            modelBuilder.Entity<BillItemRequisition>().ToTable("BIL_BillItemRequisition");
            modelBuilder.Entity<BillingDepositModel>().ToTable("BIL_TXN_Deposit");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<BillInvoiceReturnModel>().ToTable("BIL_TXN_InvoiceReturn");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<PatientBedInfo>().ToTable("ADT_TXN_PatientBedInfo");
            modelBuilder.Entity<IRDLogModel>().ToTable("IRD_Log");
            modelBuilder.Entity<BedModel>().ToTable("ADT_Bed");
            modelBuilder.Entity<EmpCashTransactionModel>().ToTable("TXN_EmpCashTransaction");
            modelBuilder.Entity<BillingTransactionCreditBillStatusModel>().ToTable("BIL_TXN_CreditBillStatus");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<MedicareMember>().ToTable("INS_MedicareMember");
            modelBuilder.Entity<MedicareMemberBalance>().ToTable("INS_MedicareMemberBalance");
            modelBuilder.Entity<PHRMInvoiceTransactionItemsModel>().ToTable("PHRM_TXN_InvoiceItems");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<PHRMInvoiceTransactionModel>().ToTable("PHRM_TXN_Invoice");
            modelBuilder.Entity<PHRMDepositModel>().ToTable("PHRM_Deposit");
            modelBuilder.Entity<PharmacyFiscalYear>().ToTable("PHRM_CFG_FiscalYears");
            modelBuilder.Entity<PHRMStockTransactionModel>().ToTable("PHRM_TXN_StockTransaction");
            modelBuilder.Entity<PHRMEmployeeCashTransaction>().ToTable("PHRM_EmployeeCashTransaction");
            modelBuilder.Entity<PaymentModes>().ToTable("MST_PaymentModes");
            modelBuilder.Entity<DischargeStatementModel>().ToTable("BIL_TXN_DischargeStatement");
            modelBuilder.Entity<PHRMInvoiceReturnItemsModel>().ToTable("PHRM_TXN_InvoiceReturnItems");
            modelBuilder.Entity<PHRMStockMaster>().ToTable("PHRM_MST_Stock");
            modelBuilder.Entity<BillSettlementModel>().ToTable("BIL_TXN_Settlements");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<PHRMInvoiceReturnModel>().ToTable("PHRM_TXN_InvoiceReturn");
            modelBuilder.Entity<DepositHeadModel>().ToTable("BIL_MST_DepositHead");
            modelBuilder.Entity<BillingSchemeModel>().ToTable("BIL_CFG_Scheme");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");

            modelBuilder.Entity<PHRMStoreStockModel>()
                .ToTable("PHRM_TXN_StoreStock")
                .HasRequired(a => a.StockMaster)
                .WithMany(a => a.StoreStocks)
                .HasForeignKey(a => a.StockId);

            modelBuilder.Conventions.Remove<DecimalPropertyConvention>();
            modelBuilder.Conventions.Add(new DecimalPropertyConvention(16, 4));

        }

        public static object GetDischargeStatementInfo(int patientId, int dischargeStatementId,int patientVisitId, DischargeDbContext dischargeDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                            new SqlParameter("@PatientId", patientId),
                            new SqlParameter("@DischargeStatementId",dischargeStatementId), 
                            new SqlParameter("@PatientVisitId",patientVisitId), 
            };
            DataSet dischargeStatementDetail = DALFunctions.GetDatasetFromStoredProc("SP_BIL_DischargeStatement", paramList, dischargeDbContext);

            DataTable dtPatientInfo = dischargeStatementDetail.Tables[0];
            DataTable dtBillingInvoiceInfo = dischargeStatementDetail.Tables[1];
            DataTable dtBillingInvoiceItemInfo = dischargeStatementDetail.Tables[2];
            DataTable dtVisitInfo = dischargeStatementDetail.Tables[3];
            DataTable dtDepositInfo = dischargeStatementDetail.Tables[4];
            DataTable dtPharmacyItemInfo = dischargeStatementDetail.Tables[5];
            DataTable dtDischargeInfo = dischargeStatementDetail.Tables[6];
            DataTable dtBillingInvoiceSummary = dischargeStatementDetail.Tables[7];
            DataTable dtPharmacySummary = dischargeStatementDetail.Tables[8];


            var printInfoToReturn = new
            {
                PatientInfo = BilPrint_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                InvoiceInfo = BilPrint_InvoiceInfoVM.MapDataTableToSingleObject(dtBillingInvoiceInfo),
                InvoiceItems = BilPrint_InvoiceItemVM.MapDataTableToObjectList(dtBillingInvoiceItemInfo),
                VisitInfo = BilPrint_VisitInfoVM.MapDataTableToSingleObject(dtVisitInfo),
                DepositList = BilPrint_DepositListVM.MapDataTableToObjectList(dtDepositInfo),
                PharmacyInvoiceItems = BilPrint_PharmacyItemVM.MapDataTableToObjectList(dtPharmacyItemInfo),
                DischargeInfo = BilPrint_DischargeStatementVM.MapDataTableToSingleObject(dtDischargeInfo),
                BillingInvoiceSummary = BilPrint_BillingInvoiceSummary.MapDataTableToObjectList(dtBillingInvoiceSummary),
                PharmacySummary = BilPrint_PharmacyInvoiceSummary.MapDataTableToObjectList(dtPharmacySummary),
                IsInvoiceFound = dtBillingInvoiceInfo.Rows.Count > 0 ? true : false
            };
            return printInfoToReturn;
        }

        public object GetItemsForBillingDischargeSummaryReceipt(int patientId, int patientVisitId,int? dischargeStatementId, string billStatus)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@PatientId", patientId),
                new SqlParameter("@PatientVisitId", patientVisitId),
                new SqlParameter("@DischargeStatementId", dischargeStatementId),
                new SqlParameter("@BillStatus",billStatus)
            };
            DataSet estimatedDischargeSummary = DALFunctions.GetDatasetFromStoredProc("SP_BIL_GetItems_ForIPBillingDischargeSummaryReceipt", paramList, this);
            var EstimatedSummaryResult = new
            {
                PatientDetail = BilPrint_PatientInfoVM.MapDataTableToSingleObject(estimatedDischargeSummary.Tables[0]),
                BillItems = estimatedDischargeSummary.Tables[1],
                AdmissionInfo = BilPrint_AdmissionInfoVM.MapDataTableToSingleObject(estimatedDischargeSummary.Tables[2]),
                DepositInfo = BilPrint_DepositListVM.MapDataTableToObjectList(estimatedDischargeSummary.Tables[3]),
                DischargeInfo = BilPrint_DischargeStatementVM.MapDataTableToSingleObject(estimatedDischargeSummary.Tables[4]),

            };
            return EstimatedSummaryResult;
        }
    }

}
