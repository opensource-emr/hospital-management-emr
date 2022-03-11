using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.LabModels;

namespace DanpheEMR.DalLayer
{
    public class LabDbContext : DbContext
    {
        public DbSet<AdminParametersModel> AdminParameters { get; set; }
        public DbSet<LabRequisitionModel> Requisitions { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<LabTestComponentResult> LabTestComponentResults { get; set; }
        public DbSet<PatientModel> Patients { get; set; }
        public DbSet<LabReportTemplateModel> LabReportTemplates { get; set; }

        public DbSet<LabVendorsModel> LabVendors { get; set; }

        public DbSet<EmployeeModel> Employee { get; set; }
        public DbSet<EmployeePreferences> EmployeePreferences { get; set; }
        public DbSet<VisitModel> PatientVisits { get; set; }
        public DbSet<LabReportModel> LabReports { get; set; }

        public DbSet<BillItemPrice> BillItemPrice { get; set; }
        public DbSet<BillingTransactionItemModel> BillingTransactionItems { get; set; }
        public DbSet<ServiceDepartmentModel> ServiceDepartment { get; set; }
        public DbSet<AdmissionModel> Admissions { get; set; }
        public DbSet<LabBarCodeModel> LabBarCode { get; set; }
        public DbSet<DepartmentModel> Department { get; set; }
        public DbSet<LabTestComponentMapModel> LabTestComponentMap { get; set; }
        public DbSet<LabTestJSONComponentModel> LabTestComponents { get; set; }
        public DbSet<CoreCFGLookupModel> LabLookUps { get; set; }
        public DbSet<LabRunNumberSettingsModel> LabRunNumberSettings { get; set; }
        public DbSet<LabTestCategoryModel> LabTestCategory { get; set; }
        public DbSet<LabTestMasterSpecimen> LabTestSpecimen { get; set; }
        public DbSet<LabGovReportItemModel> LabGovReport { get; set; }
        public DbSet<LabGovReportMappingModel> LabGovReportMapping { get; set; }

        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<LabSMSModel> LabSms { get; set; }
        public DbSet<LabTypesModel> LabTypes { get; set; }

        public DbSet<MunicipalityModel> Municipalities { get; set; }

        public LabDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;

        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LabGovReportItemModel>().ToTable("Lab_Mst_Gov_Report_Items");
            modelBuilder.Entity<LabGovReportMappingModel>().ToTable("Lab_Gov_Report_Mapping");
            modelBuilder.Entity<AdminParametersModel>().ToTable("CORE_CFG_Parameters");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<LabSMSModel>().ToTable("LAB_Sms");

            modelBuilder.Entity<LabReportTemplateModel>().ToTable("Lab_ReportTemplate");

            modelBuilder.Entity<LabVendorsModel>().ToTable("Lab_MST_LabVendors");//sud: 22Apr'19

            modelBuilder.Entity<BillItemPrice>().ToTable("BIL_CFG_BillItemPrice");
            modelBuilder.Entity<BillingTransactionItemModel>().ToTable("BIL_TXN_BillingTransactionItems");

            modelBuilder.Entity<LabTestComponentResult>().ToTable("LAB_TXN_TestComponentResult");
            modelBuilder.Entity<LabTestComponentResult>()
                   .HasRequired<LabRequisitionModel>(a => a.LabRequisition)
                   .WithMany(a => a.LabTestComponentResults)
                    .HasForeignKey(s => s.RequisitionId);
            // this is used getting data from patient table while showing the report
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");

            modelBuilder.Entity<EmployeePreferences>().ToTable("EMP_EmployeePreferences");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<LabReportModel>().ToTable("LAB_TXN_LabReports");
            modelBuilder.Entity<ServiceDepartmentModel>().ToTable("BIL_MST_ServiceDepartment");

            modelBuilder.Entity<AdmissionModel>().ToTable("ADT_PatientAdmission");
            modelBuilder.Entity<LabBarCodeModel>().ToTable("LAB_BarCode");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<LabTestComponentMapModel>().ToTable("Lab_MAP_TestComponents");
            modelBuilder.Entity<LabTestJSONComponentModel>().ToTable("Lab_MST_Components");
            modelBuilder.Entity<CoreCFGLookupModel>().ToTable("CORE_CFG_LookUps");
            modelBuilder.Entity<LabRunNumberSettingsModel>().ToTable("Lab_MST_RunNumberSettings");
            modelBuilder.Entity<LabTestCategoryModel>().ToTable("LAB_TestCategory");
            modelBuilder.Entity<LabTestMasterSpecimen>().ToTable("LAB_MST_TestSpecimen");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<LabTypesModel>().ToTable("MST_LabTypes");
        }

        public void Attach(LabGovReportMappingModel dbComp)
        {
            throw new NotImplementedException();
        }

        #region sms applicable tests
        public DataTable GetAllSmsApplicableTests(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate)
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetAllSmsApplicableTests", paramList, this);
            return stockItems;
        }
        #endregion
    }
}
