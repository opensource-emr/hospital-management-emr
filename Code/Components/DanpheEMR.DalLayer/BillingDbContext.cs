using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using System.Data;
using System.Data.SqlClient;
using DanpheEMR.Security;

namespace DanpheEMR.DalLayer
{
    public class BillingDbContext : DbContext
    {
        public DbSet<BillingTransactionModel> BillingTransactions { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }

        //public DbSet<LabTest> LabTests { get; set; }
        public DbSet<BillItemPrice> BillItemPrice { get; set; }
        public DbSet<BillItemRequisition> BillItemRequisitions { get; set; }
        public DbSet<BillReturnRequestModel> BillReturnRequests { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<BillingDeposit> BillingDeposits { get; set; }
        public DbSet<BillingCounter> BillingCounter { get; set; }
        public DbSet<BillItemPriceHistory> BillItemPriceHistory { get; set; }
        public DbSet<BillingPackageModel> BillingPackages { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }//yub: 3rd Dec '18
        public DbSet<ImagingRequisitionModel> RadiologyImagingRequisitions { get; set; }//yub: 3rd Dec '18
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<VisitModel> Visit { get; set; }
        public DbSet<PatientMembershipModel> PatientMembership { get; set; }
        public DbSet<MembershipTypeModel> MembershipType { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        //start: ashim-5May for fiscalYear
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        //end: ashim-5May for fiscalYear
        //start: sud-5May for InvoiceReturn
        public DbSet<BillInvoiceReturnModel> BillReturns { get; set; }
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
        public DbSet<BillingHandoverModel> Handover { get; set; }
        public DbSet<BillingDenominationModel> Denomination { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<AdminParametersModel> AdminParameters { get; set; }


        public BillingDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            modelBuilder.Entity<BillingTransactionModel>().ToTable("BIL_TXN_BillingTransaction");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<PatientMembershipModel>().ToTable("PAT_PatientMembership");
            modelBuilder.Entity<MembershipTypeModel>().ToTable("PAT_CFG_MembershipType");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");
            //modelBuilder.Entity<LabTest>().ToTable("LAB_LabTests");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            //Billing mapping
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");
            modelBuilder.Entity<BillingTransactionItemModel>()
                  .HasRequired<BillingTransactionModel>(s => s.BillingTransaction) // Address entity requires Patient
                  .WithMany(s => s.BillingTransactionItems) // Patient entity includes many Addresses entities
                   .HasForeignKey(s => s.BillingTransactionId);
            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");

            modelBuilder.Entity<RadiologyImagingTypeModel>().ToTable("RAD_MST_ImagingType");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<BillItemRequisition>().ToTable("BIL_BillItemRequisition");
            modelBuilder.Entity<BillingDeposit>().ToTable("BIL_TXN_Deposit");
            modelBuilder.Entity<BillReturnRequestModel>().ToTable("BIL_TXN_BillingReturn");
            modelBuilder.Entity<BillingCounter>().ToTable("BIL_CFG_Counter");
            modelBuilder.Entity<BillingPackageModel>().ToTable("BIL_CFG_Packages");
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
            modelBuilder.Entity<BillingHandoverModel>().ToTable("BIL_MST_Handover");
            modelBuilder.Entity<BillingDenominationModel>().ToTable("BIL_TXN_Denomination");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<RbacUser>().ToTable("RBAC_User");

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
    }

}
