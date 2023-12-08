using Audit.EntityFramework;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.AdmissionModels.Config;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.BillingModels.Config;
using DanpheEMR.ServerModel.BillingModels.DischargeStatementModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.PatientModels;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;

namespace DanpheEMR.DalLayer
{
    public class BillingDbContext : AuditDbContext
    {
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }

        //public DbSet<LabTest> LabTests { get; set; }
        public DbSet<BillItemRequisition> BillItemRequisitions { get; set; }
        //public DbSet<BillReturnRequestModel> BillReturnRequests { get; set; }//removed: sud-1May'21
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillingDepositModel> BillingDeposits { get; set; }
        public DbSet<BillingCounter> BillingCounter { get; set; }
        public DbSet<BillItemPriceHistory> BillItemPriceHistory { get; set; }
        public DbSet<BillingPackageModel> BillingPackages { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }//yub: 3rd Dec '18
        public DbSet<ImagingRequisitionModel> RadiologyImagingRequisitions { get; set; }//yub: 3rd Dec '18
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<VisitModel> Visit { get; set; }
        //public DbSet<PatientMembershipModel> PatientMembership { get; set; }
        public DbSet<BillingSchemeModel> BillingSchemes { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        //start: ashim-5May for fiscalYear
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        //end: ashim-5May for fiscalYear
        //start: sud-5May for InvoiceReturn
        public DbSet<BillInvoiceReturnModel> BillInvoiceReturns { get; set; }
        //end: sud-5May for InvoiceReturn
        public DbSet<BillSettlementModel> BillSettlements { get; set; }
        public DbSet<SyncBillingAccountingModel> SyncBillingAccounting { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }//sud: 20Jun'18
        public DbSet<PatientBedInfo> PatientBedInfos { get; set; }//sud: 20Jun'18
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<IRDLogModel> IRDLog { get; set; }

        //dinesh 21st July'19  for provisional list
        public DbSet<RbacUser> User { get; set; }

        //sud: 9Sept'18
        public DbSet<History_BillingTransactionItem> History_BillingTxnItems { get; set; }

        public DbSet<WardModel> Wards { get; set; }
        public DbSet<BedModel> Beds { get; set; }
        public DbSet<BedFeature> BedFeatures { get; set; }
        public DbSet<BedFeaturesMap> BedFeaturesMaps { get; set; }

        //Insurance Part
        public DbSet<InsuranceModel> Insurances { get; set; }
        public DbSet<InsuranceProviderModel> InsuranceProviders { get; set; }
        public DbSet<PatientInsurancePackageTransactionModel> PatientInsurancePackageTransactions { get; set; }

        //credit Organization --yubraj 19th April 2019
        public DbSet<CreditOrganizationModel> CreditOrganization { get; set; }
        public DbSet<BanksModel> Banks { get; set; }
        public DbSet<BillingHandoverTransactionModel> HandoverTransaction { get; set; }
        //public DbSet<BillingHandoverModel> Handover { get; set; }
        //public DbSet<BillingDenominationModel> Denomination { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<EmpCashTransactionModel> EmpCashTransactions { get; set; }
        public DbSet<EmpDueAmountModel> EmpDueAmounts { get; set; }
        public DbSet<BillInvoiceReturnItemsModel> BillInvoiceReturnItems { get; set; }//sud-1May'21
        public DbSet<PrinterSettingsModel> PrinterSettings { get; set; }//pratik:24May'21
        public DbSet<DynamicReportNameModel> DynamicReportNameModels { get; set; }//aniket:28Jul'21
        public DbSet<ReportingItemsModel> ReportingItemsModels { get; set; }//aniket:28Jul'21
        public DbSet<ReportingItemBillingItemMapping> ReportingItemsAndBillingItemMappingModels { get; set; }//aniket:28Jul'21 

        public DbSet<RadiologyImagingTypeModel> RadiologyImagingTypes { get; set; } //Krishna: 2nd'Jan 22
        public DbSet<RadiologyImagingItemModel> RadiologyImagingItems { get; set; } //Krishna: 2nd'Jan 22
        public DbSet<LabVendorsModel> LabVendors { get; set; } //Krishna: 2nd'Jan 22
        public DbSet<MunicipalityModel> MunicipalityModels { get; set; } //Krishna: 18th,Jul,22
        public DbSet<BillMapPriceCategoryServiceItemModel> BillItemsPriceCategoryMaps { get; set; } //Krishna: 25th,Jul,22
        public DbSet<BillingTransactionCreditBillStatusModel> BillingTransactionCreditBillStatuses { get; set; } //Krishna: 22th,AUG,22

        public DbSet<PatientSchemeMapModel> PatientSchemeMaps { get; set; } //Krishna: 30th,Aug'22//Sud:22March'23--Updated for NewBillingStructure.
        public DbSet<BillMapPriceCategorySchemeModel> PriceCategorySchemesMaps { get; set; } //Krishna: 10th,Nov'22
        public DbSet<PriceCategoryModel> PriceCategoryModels { get; set; } //Krishna: 22nd,Nov'22
        public DbSet<MedicareMember> MedicareMembers { get; set; } //Krishna:8th,Jan'23
        public DbSet<MedicareMemberBalance> MedicareMemberBalances { get; set; } //Krishna:8th,Jan'23
        public DbSet<BillServiceItemModel> BillServiceItems { get; set; }
        public DbSet<BillServiceCategoryModel> BillServiceCategories { get; set; }
        public DbSet<BillServiceItemSchemeSettingModel> ServiceItemSchemeSettings { get; set; } //Krishna: 16thFeb'23
        public DbSet<CountryModel> Countries { get; set; } //Krishna: 16thFeb'23
        public DbSet<BillingAdditionalServiceItemModel> BillingAdditionalServiceItems { get; set; } //Krishna: 4thApril'23

        //For Pharmacy : 21Apr'23 : Rohit
        public DbSet<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
        public DbSet<PHRMInvoiceTransactionModel> PHRMInvoiceTransactionModels { get; set; }

        public DbSet<DepositHeadModel> DepositHeadModel { get; set; } //Bibek: 19thMarch'23
        public DbSet<AdtAutoBillingItemModel> AdtAutoBillingItems { get; set; }
        public DbSet<AdtDepositSettingsModel> AdtDepositSettings { get; set; }
        public DbSet<AdtBedFeatureSchemePriceCategoryMapModel> BedFeatureSchemePriceCategoryMaps { get; set; }
        public DbSet<BillingSubSchemeModel> BillingSubSchemes { get; set; }
        public DbSet<BillingCancellationModel> BillingCancellation { get; set; }
        public DbSet<BillingPackageServiceItemModel> BillingPackageServiceItems { get; set; }
        public DbSet<CurrencyModel> Currencies { get; set; }
        public DbSet<DischargeStatementModel> DischargeStatements { get; set; }


        public object ReportingItemsModel { get; set; }
        public BillingDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
            this.AuditDisabled = true;

        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BillingPackageServiceItemModel>()
                .Property(p => p.DiscountPercent)
                .HasPrecision(7, 4);

            modelBuilder.Entity<BillingPackageModel>()
                .Property(p => p.DiscountPercent)
                .HasPrecision(7, 4);

            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            //modelBuilder.Entity<PatientMembershipModel>().ToTable("PAT_PatientMembership");
            //modelBuilder.Entity<BillScheme>().ToTable("BIL_CFG_Scheme");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            //modelBuilder.Entity<LabTest>().ToTable("LAB_LabTests");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            //Reporting Items Mapping
            modelBuilder.Entity<ReportingItemsModel>().ToTable("MST_RPT_DynamicReportingItems");
            modelBuilder.Entity<DynamicReportNameModel>().ToTable("MST_RPT_DynamicReportName");
            modelBuilder.Entity<ReportingItemBillingItemMapping>().ToTable("BIL_MAP_ReportingItem_BillingItems");
            //Billing mapping
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillingTransactionItemModel>()
                  .HasRequired<BillingTransactionModel>(s => s.BillingTransaction) // Address entity requires Patient
                  .WithMany(s => s.BillingTransactionItems) // Patient entity includes many Addresses entities
                   .HasForeignKey(s => s.BillingTransactionId);

            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<BillItemRequisition>().ToTable("BIL_BillItemRequisition");
            modelBuilder.Entity<BillingDepositModel>().ToTable("BIL_TXN_Deposit");
            //modelBuilder.Entity<BillReturnRequestModel>().ToTable("BIL_TXN_BillingReturn");//table removed: sud-1May'21
            modelBuilder.Entity<BillingCounter>().ToTable("BIL_CFG_Counter");
            modelBuilder.Entity<BillingPackageModel>().ToTable("BIL_CFG_Packages");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            //start: ashim-5May for fiscalYear
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            //end: ashim-5May for fiscalYear
            //modelBuilder.Entity<BillItemRequisition>()
            //                 .HasRequired<EmployeeModel>(s => s.Employee) // Address entity requires Patient
            //                 .WithMany(s => ) // Patient entity includes many Addresses entities
            //                  .HasForeignKey(s => s.BillingTransactionId);

            //start: sud-5May for InvoiceReturn 
            modelBuilder.Entity<BillInvoiceReturnModel>().ToTable("BIL_TXN_InvoiceReturn");
            //end: sud-5May for InvoiceReturn
            //start: dinesh-6May for BillSettlement 
            modelBuilder.Entity<BillSettlementModel>().ToTable("BIL_TXN_Settlements");
            //end: din-6May for BillSettlement
            modelBuilder.Entity<SyncBillingAccountingModel>().ToTable("BIL_SYNC_BillingAccounting");
            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<PatientBedInfo>().ToTable("ADT_TXN_PatientBedInfo");//sud:20Jun'18
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<IRDLogModel>().ToTable("IRD_Log");
            modelBuilder.Entity<BillItemPriceHistory>().ToTable("BIL_CFG_BillItemPrice_History");//sud:21Aug'18--this table was somehow missing

            // modelBuilder.Entity<History_BillingTransactionItem>().ToTable("BIL_History_BillingTransactionItems");//sud:9Sept'18
            modelBuilder.Entity<BedFeature>().ToTable("ADT_MST_BedFeature");
            modelBuilder.Entity<BedFeaturesMap>().ToTable("ADT_MAP_BedFeaturesMap");
            modelBuilder.Entity<WardModel>().ToTable("ADT_MST_Ward");

            modelBuilder.Entity<BedModel>().ToTable("ADT_Bed");

            modelBuilder.Entity<InsuranceModel>().ToTable("PAT_PatientInsuranceInfo");
            modelBuilder.Entity<InsuranceProviderModel>().ToTable("INS_CFG_InsuranceProviders");
            modelBuilder.Entity<PatientInsurancePackageTransactionModel>().ToTable("INS_TXN_PatientInsurancePackages");
            modelBuilder.Entity<CreditOrganizationModel>().ToTable("BIL_MST_Credit_Organization");
            modelBuilder.Entity<BanksModel>().ToTable("MST_Bank");
            modelBuilder.Entity<BillingHandoverTransactionModel>().ToTable("BIL_TXN_CashHandover");//pratik: 25March'21
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");

            modelBuilder.Entity<EmpCashTransactionModel>().ToTable("TXN_EmpCashTransaction");
            modelBuilder.Entity<EmpDueAmountModel>().ToTable("TXN_EmpDueAmount");
            modelBuilder.Entity<BillInvoiceReturnItemsModel>().ToTable("BIL_TXN_InvoiceReturnItems");
            modelBuilder.Entity<PrinterSettingsModel>().ToTable("CFG_PrinterSettings");

            modelBuilder.Entity<LabVendorsModel>().ToTable("Lab_MST_LabVendors");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<BillMapPriceCategoryServiceItemModel>().ToTable("BIL_MAP_PriceCategoryServiceItem");
            modelBuilder.Entity<BillingTransactionCreditBillStatusModel>().ToTable("BIL_TXN_CreditBillStatus");
            modelBuilder.Entity<PatientSchemeMapModel>().ToTable("PAT_MAP_PatientSchemes");
            modelBuilder.Entity<BillMapPriceCategorySchemeModel>().ToTable("BIL_MAP_PriceCategoryVsScheme");
            modelBuilder.Entity<PriceCategoryModel>().ToTable("BIL_CFG_PriceCategory");

            modelBuilder.Entity<MedicareMember>().ToTable("INS_MedicareMember");
            modelBuilder.Entity<MedicareMemberBalance>().ToTable("INS_MedicareMemberBalance");

            modelBuilder.Entity<BillServiceItemModel>().ToTable("BIL_MST_ServiceItem");
            modelBuilder.Entity<BillingSchemeModel>().ToTable("BIL_CFG_Scheme");
            modelBuilder.Entity<BillServiceCategoryModel>().ToTable("BIL_MST_ServiceCategory");
            modelBuilder.Entity<BillServiceItemSchemeSettingModel>().ToTable("BIL_MAP_ServiceItemSchemeSetting");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<BillingAdditionalServiceItemModel>().ToTable("BIL_CFG_AdditionalServiceItem");
            modelBuilder.Entity<DischargeStatementModel>().ToTable("BIL_TXN_DischargeStatement");

            //For Pharmacy : 21Apr'23 : Rohit
            modelBuilder.Entity<PHRMInvoiceTransactionItemsModel>().ToTable("PHRM_TXN_InvoiceItems");
            modelBuilder.Entity<DepositHeadModel>().ToTable("BIL_MST_DepositHead");
            modelBuilder.Entity<PHRMInvoiceTransactionModel>().ToTable("PHRM_TXN_Invoice");
            modelBuilder.Entity<AdtAutoBillingItemModel>().ToTable("ADT_CFG_AutoBillingItem");
            modelBuilder.Entity<AdtDepositSettingsModel>().ToTable("ADT_CFG_DepositSettings");
            modelBuilder.Entity<AdtBedFeatureSchemePriceCategoryMapModel>().ToTable("ADT_MAP_BedFeatureSchemePriceCategory");
            modelBuilder.Entity<BillingSubSchemeModel>().ToTable("BIL_CFG_SubScheme");

            //For provisional bill cancellation 
            modelBuilder.Entity<BillingCancellationModel>().ToTable("BIL_TXN_ProvisionalItemReturn");
            modelBuilder.Entity<BillingPackageServiceItemModel>().ToTable("BIL_CFG_PackageServiceItems");
            modelBuilder.Entity<CurrencyModel>().ToTable("MST_Currency");

        }

        //Sud: 14sept'18 -- 
        public DataTable GetItemsForBillingReceipt(int patientId, int? billingTxnId, string billStatus)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@PatientId", patientId),
                            new SqlParameter("@BillTxnId", billingTxnId.HasValue ? billingTxnId.Value : (int?)null),
                            new SqlParameter("@BillStatus",billStatus) };
            DataTable discountReportData = DALFunctions.GetDataTableFromStoredProc("SP_BIL_GetItems_ForIPBillingReceipt", paramList, this);
            return discountReportData;
        }
        public DataTable GetIpBillingSummary(int patientId, int? patVisitId, string billStatus)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@PatientId", patientId),
                            new SqlParameter("@PatientVisitId", patVisitId.HasValue ? patVisitId.Value : (int?)null),
                            new SqlParameter("@BillStatus",billStatus) };
            DataTable discountReportData = DALFunctions.GetDataTableFromStoredProc("SP_BIL_GetIpBillingSummary", paramList, this);
            return discountReportData;
        }
    }

}
