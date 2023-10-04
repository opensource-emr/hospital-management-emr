using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.MasterModels.ICDEmergencyGroup;
using DanpheEMR.ServerModel.MedicalRecords;
using DanpheEMR.ServerModel.ReportingModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public class MedicalRecordsDbContext: DbContext
    {
        private string connStr = null;
        public DbSet<DischargeTypeModel> DischargeType { get; set; }
        public DbSet<DeathTypeModel> DeathTypes { get; set; }
        public DbSet<DischargeConditionTypeModel> DischargeConditionTypes { get; set; }
        public DbSet<DeliveryTypeModel> DeliveryTypes { get; set; }
        public DbSet<OperationTypeModel> OperationTypes { get; set; }
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<ICD10CodeModel> ICD10Code { get; set; }
        public DbSet<LabRequisitionModel> LabRequisitions { get; set; }
        public DbSet<ImagingRequisitionModel> ImagingRequisitions { get; set; }
        public DbSet<LabTestModel> LabTests { get; set; }
        public DbSet<RadiologyImagingItemModel> ImagingItems { get; set; }
        public DbSet<BabyBirthConditionModel> BabyBirthConditions { get; set; }
        public DbSet<BabyBirthDetailsModel> BabyBirthDetails { get; set; }
        public DbSet<GravitaModel> Gravita { get; set; }
        public DbSet<MedicalRecordModel> MedicalRecords { get; set; }
        public DbSet<DeathDetailsModel> DeathDetails { get; set; }
        public DbSet<PatientModel> Patient { get; set; }
        public DbSet<VisitModel> PatientVisits { get; set; }
        public DbSet<PatientCertificateModel> PatientCertificate { get; set; }
        public DbSet<BillingFiscalYear> BillingFiscalYears { get; set; }
        public DbSet<CountryModel> Countries { get; set; }
        public DbSet<CountrySubDivisionModel> CountrySubdivisions { get; set; }
        public DbSet<MunicipalityModel> Municipality { get; set; }
        public DbSet<ICD10ReportingGroupModel> ICDReportingGroups { get; set; }
        public DbSet<ICD10DiseaseGroupModel> ICDDiseaseGroups { get; set; }
        public DbSet<FinalDiagnosisModel> FinalDiagnosis { get; set; }
        public DbSet<DepartmentModel> Department { get; set; }
        public DbSet<InpatientDiagnosisModel> InpatientDiagnosis { get; set; }
        public DbSet<ICDEmergencyReportingGroupModel> ICDEmergencyReportingGroup { get; set; }
        public DbSet<ICDEmergencyDiseaseGroupModel> ICDEmergencyDiseaseGroup { get; set; }
        public DbSet<EmergencyFinalDiagnosisModel> EmergencyFinalDiagnosis { get; set; }


        public MedicalRecordsDbContext(string conn) : base(conn)
        {
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
            this.connStr = conn;
        }

        #region Outpatient Morbidity Report
        public OutpatientMorbidityReportViewModel OutPatientMorbidityReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connStr);
            DataSet dsOutPatMorbRptData = DALFunctions.GetDatasetFromStoredProc("SP_Report_OutPateint_Morbidity", paramList, mrDbContext);
            OutpatientMorbidityReportViewModel obj = new OutpatientMorbidityReportViewModel();
            obj.ReportingGroupCount = JsonConvert.SerializeObject(dsOutPatMorbRptData.Tables[0]);
            obj.OtherICDCount = JsonConvert.SerializeObject(dsOutPatMorbRptData.Tables[1]);
            obj.TotalVisitCount = JsonConvert.SerializeObject(dsOutPatMorbRptData.Tables[2]);
            return obj;
        }
        #endregion Outpatient Morbidity Report

        #region Emergency Patient Morbidity Report
        public string EmergencyPatientMorbidityReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            MedicalRecordsDbContext mrDbContext = new MedicalRecordsDbContext(connStr);
            DataSet dsOutPatMorbRptData = DALFunctions.GetDatasetFromStoredProc("SP_Report_EmergencyPatient_Morbidity", paramList, mrDbContext);           
            var result = JsonConvert.SerializeObject(dsOutPatMorbRptData.Tables[0]);
          
            return result;
        }
        #endregion Outpatient Morbidity Report


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DischargeTypeModel>().ToTable("ADT_DischargeType");
            modelBuilder.Entity<DeathTypeModel>().ToTable("ADT_MST_DeathType");
            modelBuilder.Entity<DeliveryTypeModel>().ToTable("ADT_MST_DeliveryType");
            modelBuilder.Entity<DischargeConditionTypeModel>().ToTable("ADT_MST_DischargeConditionType");
            modelBuilder.Entity<OperationTypeModel>().ToTable("MR_MST_OperationType");
            modelBuilder.Entity<EmployeeModel>().ToTable("EMP_Employee");
            modelBuilder.Entity<ICD10CodeModel>().ToTable("MST_ICD10");
            modelBuilder.Entity<LabRequisitionModel>().ToTable("LAB_TestRequisition");
            modelBuilder.Entity<ImagingRequisitionModel>().ToTable("RAD_PatientImagingRequisition");
            modelBuilder.Entity<LabTestModel>().ToTable("LAB_LabTests");
            modelBuilder.Entity<RadiologyImagingItemModel>().ToTable("RAD_MST_ImagingItem");
            modelBuilder.Entity<BabyBirthConditionModel>().ToTable("ADT_MST_BabyBirthCondition");
            modelBuilder.Entity<BabyBirthDetailsModel>().ToTable("ADT_BabyBirthDetails");
            modelBuilder.Entity<GravitaModel>().ToTable("ADT_MST_Gravita");
            modelBuilder.Entity<MedicalRecordModel>().ToTable("MR_RecordSummary");
            modelBuilder.Entity<DeathDetailsModel>().ToTable("ADT_DeathDeatils");
            modelBuilder.Entity<PatientModel>().ToTable("PAT_Patient");
            modelBuilder.Entity<VisitModel>().ToTable("PAT_PatientVisits");
            modelBuilder.Entity<PatientCertificateModel>().ToTable("ADT_PatientCertificate");
            modelBuilder.Entity<BillingFiscalYear>().ToTable("BIL_CFG_FiscalYears");
            modelBuilder.Entity<CountrySubDivisionModel>().ToTable("MST_CountrySubDivision");
            modelBuilder.Entity<CountryModel>().ToTable("MST_Country");
            modelBuilder.Entity<MunicipalityModel>().ToTable("MST_Municipality");
            modelBuilder.Entity<ICD10ReportingGroupModel>().ToTable("ICD_ReportingGroup");
            modelBuilder.Entity<ICD10DiseaseGroupModel>().ToTable("ICD_DiseaseGroup");
            modelBuilder.Entity<FinalDiagnosisModel>().ToTable("MR_TXN_Outpatient_FinalDiagnosis");
            modelBuilder.Entity<DepartmentModel>().ToTable("MST_Department");
            modelBuilder.Entity<InpatientDiagnosisModel>().ToTable("MR_TXN_Inpatient_Diagnosis");
            modelBuilder.Entity<ICDEmergencyReportingGroupModel>().ToTable("ICD_Emergency_ReportingGroup");
            modelBuilder.Entity<ICDEmergencyDiseaseGroupModel>().ToTable("ICD_Emergency_DiseaseGroup");
            modelBuilder.Entity<EmergencyFinalDiagnosisModel>().ToTable("MR_TXN_Emergency_FinalDiagnosis");

        }
       
    }


}
