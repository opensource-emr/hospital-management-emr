
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ReportingModels;
using System.Data.SqlClient;
using System.Data;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.SystemAdminModels;

namespace DanpheEMR.DalLayer
{
    public class ReportingDbContext : DbContext
    {
        private string connStr = null;
        public ReportingDbContext(string Conn) : base(Conn)
        {
            connStr = Conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        #region Doctor Report
        public DataTable DoctorReport(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            if (ProviderName != null)
            {
                SqlParameter providerParameter = new SqlParameter("@ProviderName", ProviderName);
                paramList.Add(providerParameter);
            }
            DataTable doctorReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DoctorReport", paramList, this);
            return doctorReportData;
        }
        #endregion

        #region Doctor Revenue Report        
        public DataTable DoctorRevenue(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            if (ProviderName != null)
            {
                SqlParameter providerParameter = new SqlParameter("@ProviderName", ProviderName);
                paramList.Add(providerParameter);
            }
            DataTable doctorRevenue = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DoctorRevenue", paramList, this);
            return doctorRevenue;
        }
        #endregion

        #region BilDenomination Report        
        public DataTable BilDenomination(DateTime FromDate, DateTime ToDate, int UserId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            if (UserId != 0)
            {
                SqlParameter providerParameter = new SqlParameter("@UserId", UserId);
                paramList.Add(providerParameter);
            }
            DataTable billdenomination = DALFunctions.GetDataTableFromStoredProc("SP_Report_Bill_BillDenomination", paramList, this);
            return billdenomination;
        }
        #endregion

        #region BilDenomination All Report        
        public DataTable BilDenominationAllList(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            //SqlParameter providerParameter = new SqlParameter();
            //paramList.Add(providerParameter);
            DataTable billdenomination = DALFunctions.GetDataTableFromStoredProc("SP_Report_Bill_BillDenominationAllList", paramList, this);
            return billdenomination;
        }

        #endregion
        #region Doctor Summary Report        
        public DataTable DoctorSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            if (ProviderId != 0)
            {
                SqlParameter providerParameter = new SqlParameter("@ProviderId", ProviderId);
                paramList.Add(providerParameter);
            }
            DataTable doctorSummary = DALFunctions.GetDataTableFromStoredProc("SP_Report_DOC_DoctorSummary", paramList, this);
            return doctorSummary;
        }
        #endregion

        #region Deposit Balance Report
        public DataTable DepositBalanceReport()
        {
            DataTable depositBalanceRptData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Deposit_Balance", this);
            return depositBalanceRptData;
        }
        #endregion        

        #region Daily Sales Report
        public DynamicReport DailySalesReport(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy, bool? IsInsurance)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? string.Empty : CreatedBy),
                             new SqlParameter("@IsInsurance", IsInsurance) };

            DataSet dataSet = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DailySales", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (dataSet.Tables.Count > 0)
            {
                var data = new
                {
                    SalesData = dataSet.Tables[0],
                    SettlementData = dataSet.Tables[1]//sud:7Aug'18
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion

        public DataTable DiscountReport(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? string.Empty : CreatedBy) };
            DataTable discountReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Discount", paramList, this);
            return discountReportData;
        }

        #region Daily MIS Report
        public DynamicReport DailyMISReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataSet dataSet = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_DailyMISReport", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (dataSet.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = dataSet.Tables[0],
                    OPDData = dataSet.Tables[1],
                    HealthCardData = dataSet.Tables[2],
                    LabData = dataSet.Tables[3],
                    RadiologyData = dataSet.Tables[4],
                    HealthClinicData = dataSet.Tables[5],
                    OTData = dataSet.Tables[6],
                    LaborData = dataSet.Tables[7],
                    IPDData = dataSet.Tables[8],
                    OtherServiceDept = dataSet.Tables[9],
                    PharmacyData = dataSet.Tables[10]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
            //DataTable dailyMISData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_DailyMISReport", paramList, this);
            //return dailyMISData;
        }
        public DataTable DoctorPatientCount(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable drPatCount = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DailyMISDrPatientCount", paramList, this);
            return drPatCount;
        }
        #endregion
        #region BillDocSummaryReport
        public DynamicReport BillDocSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion


        #region BillDocDeptSummary
        public DynamicReport BillDocDeptSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@DoctorId", ProviderId)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorDeptSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion
        #region BillDocDeptItemSummary
        public DynamicReport BillDocDeptItemSummary(DateTime FromDate, DateTime ToDate, int ProviderId, string SrvDeptName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@DoctorId", ProviderId),
                new SqlParameter("@SrvDeptName", SrvDeptName)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorDeptItemsSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion

        #region Bill- Department Summary report
        public DynamicReport BillDepartmentSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion
        #region Department Revenue Report
        public DynamicReport DepartmentRevenueReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataSet dataSet = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentRevenue", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (dataSet.Tables.Count > 0)
            {
                var data = new
                {
                    ReportData = dataSet.Tables[0]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion
        #region BillDeptItemSummary
        public DynamicReport BillDeptItemSummary(DateTime FromDate, DateTime ToDate, string SrvDeptName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@SrvDeptName",SrvDeptName)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentItemSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion
        #region Service Department Names (list of srvDeptNames from Function)
        public DataTable LoadServDeptsNameFromFN()
        {
            DataTable servDeptsName = DALFunctions.GetDataTableFromStoredProc("SP_BILL_GetServiceDepartmentsName", this);
            return servDeptsName;
        }
        #endregion

        public DynamicReport CustomReport(DateTime FromDate, DateTime ToDate, string ReportName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@ReportName", ReportName) };
            DataSet customReportData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_CustomReport", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (customReportData.Tables.Count > 1)
            {
                var data = new
                {
                    PatientCount = customReportData.Tables[0],
                    Data = customReportData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }

        #region Doctorwise OutPatient Report
        public DataTable DoctorWisePatientReport(DateTime fromDate, DateTime toDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", fromDate), new SqlParameter("@ToDate", toDate) };
            DataTable reportTable = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DoctorWiseOutPatientReport", paramList, this);
            return reportTable;
        }
        #endregion

        #region DoctorwiseIncomeSummaryOpIpReport
        public DynamicReport DoctorwiseIncomeSummaryOpIpReport(DateTime fromDate, DateTime toDate, int? ProviderId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", fromDate),
                new SqlParameter("@ToDate", toDate),
                new SqlParameter("@ProviderId", ProviderId)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_DoctorWiseIncomeSummary_OPIP", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion

        #region Total Item Bill Report
        public DataTable TotalItemsBill(DateTime FromDate, DateTime ToDate, string BillStatus, string ServiceDepartmentName, string ItemName, bool IsInsurance)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                           new SqlParameter("@ToDate", ToDate),
                           new SqlParameter("@BillStatus", BillStatus == null ? string.Empty : BillStatus),
                           new SqlParameter("@ServiceDepartmentName", ServiceDepartmentName == null ? string.Empty : ServiceDepartmentName),
                           new SqlParameter("@ItemName", ItemName == null ? string.Empty : ItemName),
                           new SqlParameter("@IsInsurance", IsInsurance)};

            DataTable totalItemBillData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_TotalItemsBill", paramList, this);
            return totalItemBillData;
        }
        #endregion

        #region Daily Sales Book
        public DataTable SalesDaybook(DateTime FromDate, DateTime ToDate, bool IsInsurance)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate)
                , new SqlParameter("@ToDate", ToDate) , new SqlParameter("@IsInsurance", IsInsurance)};

            DataTable salesDaybookData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_SalesDaybook", paramList, this);
            return salesDaybookData;
        }
        #endregion

        #region PatientCensusReport
        public DynamicReport PatientCensusReport(DateTime FromDate, DateTime ToDate, int? ProviderId, int? DepartmentId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@ProviderId",ProviderId),
                new SqlParameter("@DepartmentId",DepartmentId)
            };
            DataSet patientCensusData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_PatientCensus", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (patientCensusData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = patientCensusData.Tables[0],
                    Summary = patientCensusData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion

        #region Department Sales Daybook
        public DataTable DepartmentSalesDaybook(DateTime FromDate, DateTime ToDate, bool IsInsurance)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@IsInsurance", IsInsurance) };

            DataTable deptSalesDaybookData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_DepartmentSalesDaybook", paramList, this);
            return deptSalesDaybookData;
        }
        #endregion

        #region Patient Neighbourhood Card Details Report
        public DataTable PatientNeighbourhoodCardDetail(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate) };
            DataTable patneighbourcardData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_PAT_NeighbourhoodCardDetail", paramList, this);
            return patneighbourcardData;
        }
        #endregion
        #region Package Sales Detail Report
        public DataTable PackageSalesDetail(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate) };
            DataTable patneighbourcardData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_PAT_PackageSalesDetail", paramList, this);
            return patneighbourcardData;
        }
        #endregion

        #region Dialysis Patient Details Report
        public DataTable DialysisPatientDetail(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
                };

            DataTable dialysispatientData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DialysisPatientDetail", paramList, this);
            return dialysispatientData;
        }
        #endregion

        #region Patient Bill History
        public PatientBillHistoryMaster PatientBillHistory(DateTime? FromDate, DateTime? ToDate, string PatientCode)
        {

            DataSet dsPatBillHistories = GetPatientBillHistory2(FromDate, ToDate, PatientCode, connStr);

            PatientBillHistoryMaster retVal = new PatientBillHistoryMaster();

            retVal.paidBill = ConvertDataTable<PaidBillHistory>(dsPatBillHistories.Tables[0]);
            retVal.unpaidBill = ConvertDataTable<UnpaidBillHistory>(dsPatBillHistories.Tables[1]);
            retVal.returnBill = ConvertDataTable<ReturnedBillHistory>(dsPatBillHistories.Tables[2]);
            retVal.deposits = ConvertDataTable<Deposit>(dsPatBillHistories.Tables[3]);
            retVal.cancelBill = ConvertDataTable<CancelBillHistory>(dsPatBillHistories.Tables[4]);
            return retVal;
        }

        private DataSet GetPatientBillHistory2(DateTime? FromDate, DateTime? ToDate, string PatientCode, string connString)
        {
            // creates resulting dataset
            var result = new DataSet();
            var context = new ReportingDbContext(connString);


            // creates a Command 
            var cmd = context.Database.Connection.CreateCommand();
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "SP_Report_BILL_PatientBillHistory";
            cmd.Parameters.Add(new SqlParameter("@FromDate", FromDate));
            cmd.Parameters.Add(new SqlParameter("@ToDate", ToDate));
            cmd.Parameters.Add(new SqlParameter("@PatientCode", PatientCode));



            try
            {
                // executes
                context.Database.Connection.Open();
                var reader = cmd.ExecuteReader();

                // loop through all resultsets (considering that it's possible to have more than one)
                do
                {
                    // loads the DataTable (schema will be fetch automatically)
                    var tb = new DataTable();
                    tb.Load(reader);
                    result.Tables.Add(tb);

                } while (!reader.IsClosed);

                return result;
            }
            finally
            {
                // closes the connection
                context.Database.Connection.Close();
            }
        }

        private static List<T> ConvertDataTable<T>(DataTable dt)
        {
            List<T> data = new List<T>();
            foreach (DataRow row in dt.Rows)
            {
                T item = GetItem<T>(row);
                data.Add(item);
            }
            return data;
        }
        private static T GetItem<T>(DataRow dr)
        {
            Type temp = typeof(T);
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in dr.Table.Columns)
            {
                foreach (PropertyInfo pro in temp.GetProperties())
                {
                    //If current value is DBNull.Value then set it to null (C# wala NULL)... 
                    if (pro.Name == column.ColumnName)
                        pro.SetValue(obj, dr[column.ColumnName] == DBNull.Value ? null : dr[column.ColumnName], null);
                    else
                        continue;
                }
            }
            return obj;
        }
        #endregion

        #region Daily Appointment Report
        public DataTable DailyAppointmentReport(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentType)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@Doctor_Name", Doctor_Name),
                new SqlParameter("@AppointmentType", AppointmentType)
            };
            DataTable dailyAppointmentRptData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DailyAppointmentReport", paramList, this);
            return dailyAppointmentRptData;
        }
        #endregion

        #region PhoneBook Appointment Report
        public DataTable PhoneBookAppointmentReport(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentStatus)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@Doctor_Name", Doctor_Name),
                new SqlParameter("@AppointmentStatus", AppointmentStatus)
            };
            DataTable phonebookAppointmentRptData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_PhoneBookAppointmentReport", paramList, this);
            return phonebookAppointmentRptData;
        }
        #endregion
        #region Diagnosis Wise Patient Report 
        public DataTable DiagnosisWisePatientReport(DateTime FromDate, DateTime ToDate, string Diagnosis)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@Diagnosis", Diagnosis)
            };
            DataTable diagnosiswisePtReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_ADT_DiagnosisWiseReport", paramList, this);
            return diagnosiswisePtReportData;
        }
        #endregion
        #region Get Billing IncomeSegregation Report
        public DataTable Get_Bill_IncomeSegregationStaticReport(DateTime FromDate, DateTime ToDate, bool IsInsurance)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate), new SqlParameter("@IsInsurance", IsInsurance)};
            DataTable incomeSegregationStaticRptData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_IncomeSegregation", paramList, this);
            return incomeSegregationStaticRptData;
        }
        #endregion

        #region Get Billing IncomeSegregation Report
        public DynamicReport GetSalesPurchaseTrainedCompanion(DateTime FromDate, DateTime ToDate, string Status, string ItemIdCommaSeprated)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            paramsList.Add(new SqlParameter("@Status", Status));
            paramsList.Add(new SqlParameter("@ItemIdCommaSeprated", ItemIdCommaSeprated));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet salesPurchase = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Pharmacy_SalesPurchaseGraph_DashboardStatistics", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            dReport.Schema = JsonConvert.SerializeObject(salesPurchase.Tables[0]);
            //wee need datetime in yyyy-MM-dd format.
            dReport.JsonData = salesPurchase.Tables.Count > 1 ? JsonConvert.SerializeObject(salesPurchase.Tables[1],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }) : null;

            return dReport;
        }
        #endregion

        #region DistrictWise Report
        public DynamicReport DistrictWiseAppointmentReport(DateTime FromDate, DateTime ToDate, string CountrySubDivisionName)
        {

            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            paramsList.Add(new SqlParameter("@CountrySubDivisionName", CountrySubDivisionName));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet distwiseappointmentdata = DALFunctions.GetDatasetFromStoredProc("SP_Report_Appointment_DistrictWiseAppointmentReport", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            dReport.Schema = JsonConvert.SerializeObject(distwiseappointmentdata.Tables[0]);
            dReport.JsonData = distwiseappointmentdata.Tables.Count > 1 ? JsonConvert.SerializeObject(distwiseappointmentdata.Tables[1],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }) : null;
            //return Data.ToList<PatientBillHistoryMaster>();
            return dReport;
        }
        #endregion

        #region Total Admitted Patients
        public DataTable TotalAdmittedPatient(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("SP_Report_ADT_TotalAdmittedPatient", paramList, this);
            return data;
        }
        #endregion

        #region Total Discharged Patients
        public DataTable DischargedPatient(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("SP_Report_ADT_DischargedPatient", paramList, this);
            return data;
        }
        #endregion

        #region Transferred Patients
        public DataTable TransferredPatient(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("sp_Report_TransferredPatient", paramList, this);
            return data;
        }
        #endregion

        #region Radiology Revenue Generated
        public DataTable RevenueGenerated(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> ipParam = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("SP_Report_Radiology_RevenueGenerated", ipParam, this);
            return data;
        }
        #endregion

        #region Category Wise Imaging Report
        public DynamicReport CategoryWiseImagingReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsCategoryWiseImagingReport = DALFunctions.GetDatasetFromStoredProc("SP_Report_Radiology_CategoryWiseImagingReport", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();
            dReport.Schema = JsonConvert.SerializeObject(dsCategoryWiseImagingReport.Tables[0]);
            //wee need datetime in yyyy-MM-dd format.
            if (dsCategoryWiseImagingReport.Tables.Count > 1)
            {
                dReport.JsonData = JsonConvert.SerializeObject(dsCategoryWiseImagingReport.Tables[1],
                                      new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            }


            return dReport;
        }
        #endregion

        #region Category Wise Lab Report

        public DataTable CategoryWiseLabReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable CategoryWiseLabData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Lab_CategoryWiseLabReport", paramList, this);
            return CategoryWiseLabData;
        }
        //public DynamicReport CategoryWiseLabReport(DateTime FromDate, DateTime ToDate)
        //{
        //    List<SqlParameter> paramsList = new List<SqlParameter>();
        //    paramsList.Add(new SqlParameter("@FromDate", FromDate));
        //    paramsList.Add(new SqlParameter("@ToDate", ToDate));
        //    //cmd.Parameters.Add();
        //    //cmd.Parameters.Add(new SqlParameter("@ToDate", ToDate));

        //    DataSet dsCategoryWiseLabReport = GetDatasetFromStoredProc2("SP_Report_Lab_CategoryWiseLabReport_old", paramsList, this.connStr);
        //    DynamicReport dReport = new DynamicReport();
        //    dReport.Schema = JsonConvert.SerializeObject(dsCategoryWiseLabReport.Tables[0]);
        //    //wee need datetime in yyyy-MM-dd format.
        //    //sud: 5June'18-- it was crashing when only one table comes from db.
        //    if (dsCategoryWiseLabReport.Tables.Count > 1)
        //    {
        //        dReport.JsonData = JsonConvert.SerializeObject(dsCategoryWiseLabReport.Tables[1],
        //                                            new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
        //    }


        //    return dReport;
        //}
        #endregion

        public DataTable DoctorWisePatientCountLabReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable DoctorWiseLabData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Lab_DoctorWisePatientCountLabReport", paramList, this);
            return DoctorWiseLabData;
        }


        #region Category wise total Item Count Lab Report
        public DataTable CategoryWiseLabItemCountLabReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable CategoryWiseLabItem = DALFunctions.GetDataTableFromStoredProc("SP_LAB_CategoryWiseLabTestTotalCount", paramList, this);
            return CategoryWiseLabItem;
        }
        #endregion   

        #region Item wise total Count Lab Report
        public DataTable ItemWiseLabItemCountLabReport(DateTime FromDate, DateTime ToDate, int? categoryId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate), new SqlParameter("@catId", categoryId) };
            DataTable ItemWiseData = DALFunctions.GetDataTableFromStoredProc("SP_LAB_TestWiseTotalCount", paramList, this);
            return ItemWiseData;
        }
        #endregion

        #region Test Status wise detail report
        public DataTable TestStatusDetailReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataTable TestStatusWiseData = DALFunctions.GetDataTableFromStoredProc("SP_LAB_Statuswise_Test_Detail", paramList, this);
            return TestStatusWiseData;
        }

        #endregion


        #region Doctor Wise patient report
        public DynamicReport DoctorWisePatientReport(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            paramsList.Add(new SqlParameter("@ProviderName", ProviderName));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsDoctorWisepatientRevenue = DALFunctions.GetDatasetFromStoredProc("SP_Report_Scheduling_DoctorWisePatientReport", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            dReport.Schema = JsonConvert.SerializeObject(dsDoctorWisepatientRevenue.Tables[0]);
            dReport.JsonData = dsDoctorWisepatientRevenue.Tables.Count > 1 ? JsonConvert.SerializeObject(dsDoctorWisepatientRevenue.Tables[1],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }) : null;
            //return Data.ToList<PatientBillHistoryMaster>();
            return dReport;
        }
        #endregion

        #region Department Wise Appointment report
        public DynamicReport DepartmentWiseAppointmentReport(DateTime FromDate, DateTime ToDate, string DepartmentName)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            paramsList.Add(new SqlParameter("@DepartmentName", DepartmentName));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet depatwiseappointmentdata = DALFunctions.GetDatasetFromStoredProc("SP_Report_Appointment_DepartmentWiseAppointmentReport", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            dReport.Schema = JsonConvert.SerializeObject(depatwiseappointmentdata.Tables[0]);
            dReport.JsonData = depatwiseappointmentdata.Tables.Count > 1 ? JsonConvert.SerializeObject(depatwiseappointmentdata.Tables[1],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }) : null;
            //return Data.ToList<PatientBillHistoryMaster>();
            return dReport;
        }
        #endregion

        #region Patient Wise Credit Report

        public DataTable BIL_PatientCreditSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
            DataTable patientCreditSummaryData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_PatientCreditSummary", paramList, this);
            return patientCreditSummaryData;
        }


        #endregion

        #region BIL Cancel Summary
        public DataTable BIL_BillCancelSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate)
               , new SqlParameter("@ToDate", ToDate)
            };
            DataTable billCancelSummaryData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_BillCancelReport", paramList, this);
            return billCancelSummaryData;
        }
        #endregion

        #region Bill Return Report

        public DataTable BIL_ReturnReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate)
               , new SqlParameter("@ToDate", ToDate)
            };
            DataTable returnBillData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_Invoice_Return", paramList, this);
            return returnBillData;

        }
        #endregion

        #region Doctor Referral Report
        public DataTable DoctorReferral(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                 new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate)
            };
            if (ProviderName != null)
            {
                SqlParameter providerParameter = new SqlParameter("@ProviderName", ProviderName);
                paramList.Add(providerParameter);
            }
            DataTable DoctorReferralData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DoctorReferrals", paramList, this);
            return DoctorReferralData;
        }
        #endregion

        //private DataSet GetTestWiseRevenue2(DateTime FromDate, DateTime ToDate, string connString)
        //{
        //    // creates resulting dataset
        //    var result = new DataSet();
        //    var context = new ReportingDbContext(connString);


        //    // creates a Command 
        //    var cmd = context.Database.Connection.CreateCommand();
        //    cmd.CommandType = CommandType.StoredProcedure;
        //    cmd.CommandText = "sp_Report_TestWiseRevenue";

        //    //List<SqlParameter> paramsList = new List<SqlParameter>();
        //    //paramsList.Add(new SqlParameter("@FromDate", FromDate));




        //    cmd.Parameters.Add(new SqlParameter("@FromDate", FromDate));
        //    cmd.Parameters.Add(new SqlParameter("@ToDate", ToDate));




        //    try
        //    {
        //        // executes
        //        context.Database.Connection.Open();
        //        var reader = cmd.ExecuteReader();

        //        // loop through all resultsets (considering that it's possible to have more than one)
        //        do
        //        {
        //            // loads the DataTable (schema will be fetch automatically)
        //            var tb = new DataTable();
        //            tb.Load(reader);
        //            result.Tables.Add(tb);

        //        } while (!reader.IsClosed);

        //        return result;
        //    }
        //    finally
        //    {
        //        // closes the connection
        //        context.Database.Connection.Close();
        //    }
        //}

        private DataSet GetDatasetFromStoredProc2(string storedProcName, List<SqlParameter> ipParams, string connString)
        {
            // creates resulting dataset
            var result = new DataSet();
            var context = new ReportingDbContext(connString);
            // creates a Command 
            var cmd = context.Database.Connection.CreateCommand();
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
                // executes
                context.Database.Connection.Open();
                var reader = cmd.ExecuteReader();

                // loop through all resultsets (considering that it's possible to have more than one)
                do
                {
                    // loads the DataTable (schema will be fetch automatically)
                    var tb = new DataTable();
                    tb.Load(reader);
                    result.Tables.Add(tb);

                } while (!reader.IsClosed);

                return result;
            }
            finally
            {
                // closes the connection
                context.Database.Connection.Close();
            }

        }

        #region Total Revenue From Lab
        public DataTable TotalRevenueFromLab(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate)
            };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("SP_Report_TotalRevenueFromLab", paramList, this);
            return data;
        }
        #endregion

        #region Item Wise From Lab
        public DataTable ItemWiseFromLab(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate)
            };
            DataTable data = DALFunctions.GetDataTableFromStoredProc("SP_Report_ItemwiseFromLab", paramList, this);
            return data;
        }
        #endregion

        #region For Dashboards
        public DynamicReport BIL_Daily_IncomeSegregation(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsIncomeSegReport = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_IncomeSegregation", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();

            //dReport.Schema = dReport.Schema = JsonConvert.SerializeObject(dsIncomeSegReport.Tables[0]); ;
            dReport.Schema = null;//we have only one table returning from the database.. 
            //wee need datetime in yyyy-MM-dd format.
            dReport.JsonData = JsonConvert.SerializeObject(dsIncomeSegReport.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });

            return dReport;
        }

        public DynamicReport BIL_Daily_RevenueTrend()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsDailyRev = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILDSB_DailyRevenueTrend", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            //wee need datetime in yyyy-MM-dd format.
            dReport.JsonData = JsonConvert.SerializeObject(dsDailyRev.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            return dReport;
        }

        public DynamicReport BIL_Monthly_BillingTrend()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsMthBillTrend = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILDSB_MonthlyBillingTrend", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            //wee need datetime in yyyy-MM-dd format.
            dReport.JsonData = JsonConvert.SerializeObject(dsMthBillTrend.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            return dReport;
        }

        public DynamicReport BIL_Daily_CounterNUsersCollection(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsCtrUsrs = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_CounterNUsersCollectionDaily", paramsList, reportingDbContext);

            if (dsCtrUsrs != null && dsCtrUsrs.Tables.Count > 0)
            {
                DynamicReport dReport = new DynamicReport();

                //return an anonymous type with counter and user collection..
                var dailyCollection = new { UserCollection = dsCtrUsrs.Tables[0], CounterCollection = dsCtrUsrs.Tables[1] };
                dReport.JsonData = JsonConvert.SerializeObject(dailyCollection,
                                                 new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
                return dReport;


            }
            return null;
        }

        public DynamicReport Home_DashboardStatistics()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsHomeDsbStats = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Home_DashboardStatistics", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();
            dReport.Schema = null;//we have only one table returning from the database.. 
            dReport.JsonData = JsonConvert.SerializeObject(dsHomeDsbStats.Tables[0]);
            return dReport;
        }

        public DynamicReport Home_PatientZoneMap()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsHomeDsbStats = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Home_PatientDistributionMap_Nepal", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            dReport.JsonData = JsonConvert.SerializeObject(dsHomeDsbStats.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            return dReport;
        }
        public DynamicReport Home_DeptWise_TotalAppointmentCount()
        {
            /////This TodaysDate is Required Because We Want Data of PerDay DepartmentWise Appointment Count
            var TodaysDate = DateTime.Now.Date;
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@TodaysDate", TodaysDate));
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsHomeDsbStats = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Home_DeptWiseAppointmentCount", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            dReport.JsonData = JsonConvert.SerializeObject(dsHomeDsbStats.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            return dReport;
        }

        public DynamicReport Patient_GenderWiseCount()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsPatCounts = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Patient_GenderWiseCount", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            dReport.JsonData = JsonConvert.SerializeObject(dsPatCounts.Tables[0]);
            return dReport;
        }

        public DynamicReport Patient_AgeRangeNGenderWiseCount()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsPatCounts = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Patient_AgeRangeNGender", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();
            dReport.Schema = null;//we have only one table returning from the database.. 
            dReport.JsonData = JsonConvert.SerializeObject(dsPatCounts.Tables[0]);
            return dReport;
        }

        public DynamicReport Lab_DashboardStatistics()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsLabDsbStats = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Lab_DashboardStatistics", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            //return an anonymous type - when mutliple table are received
            var labDashboard = new
            {
                LabelData = dsLabDsbStats.Tables[0],
                TestTrendsData = dsLabDsbStats.Tables[1],
                TestCompletedData = dsLabDsbStats.Tables[2]
            };
            dReport.Schema = null;
            dReport.JsonData = JsonConvert.SerializeObject(labDashboard);
            return dReport;
        }

        public DynamicReport Emergency_DashboardStatistics()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsLabDsbStats = DALFunctions.GetDatasetFromStoredProc("SP_DSB_Emergency_DashboardStatistics", paramsList, reportingDbContext);
            DynamicReport dReport = new DynamicReport();
            //return an anonymous type - when mutliple table are received
            var ERDashboard = new
            {
                LabelData = dsLabDsbStats.Tables[0]
            };
            dReport.Schema = null;
            dReport.JsonData = JsonConvert.SerializeObject(ERDashboard);
            return dReport;
        }

        #endregion

        #region IRD Related reporting methods

        //IRD Invoice Details 
        public List<InvoiceDetailsModel> InvoiceDetails(DateTime FromDate, DateTime ToDate)
        {
            var Data = Database.SqlQuery<InvoiceDetailsModel>("exec SP_IRD_InvoiceDetails @FromDate,@ToDate",
                new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate)).ToList();
            return Data.ToList<InvoiceDetailsModel>();
        }

        // IRD Pharmacy Invoice Details
        public List<PhrmInvoiceDetails> PhrmInvoiceDetails(DateTime FromDate, DateTime ToDate)
        {
            var Data = Database.SqlQuery<PhrmInvoiceDetails>("exec SP_IRD_PHRM_InvoiceDetails @FromDate,@ToDate",
                new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate)).ToList();
            return Data.ToList<PhrmInvoiceDetails>();

        }


        //IRD - SQL Audit details
        public List<SqlAuditModel> SqlAuditDetails(DateTime FromDate, DateTime ToDate, string LogType)
        {
            var data = Database.SqlQuery<SqlAuditModel>("exec SP_Danphe_SQLAudit @FromDate,@ToDate,@LogType",
                 new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate),
                 new SqlParameter("@LogType", LogType)
                 ).ToList();
            return data.ToList<SqlAuditModel>();
        }
        #endregion
        #region Patient Discharge bill breakup report        
        public DataTable BillDischargeBreakup(int PatientVisitId, int PatientId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@PatientVisitId",PatientVisitId),
                new SqlParameter("@PatientId",PatientId)
            };
            DataTable returnBillData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BIL_DischargeBreakup", paramList, this);
            return returnBillData;
        }
        #endregion
        #region AuditTrailList Details        
        public List<AuditTrailModel> AuditTrailList()
        {
            var data = Database.SqlQuery<AuditTrailModel>("exec SP_Danphe_Audit_List ").ToList();

            return data.ToList<AuditTrailModel>();
        }
        #endregion
        #region AuditTrail Details        
        public DataTable AuditTrails(DateTime FromDate, DateTime ToDate, string Table_Name, string UserName, string ActionName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@UserName", UserName),
                new SqlParameter("@Table_Name", Table_Name),
                new SqlParameter("@Action", ActionName)

            };
            DataTable returnAuditData = DALFunctions.GetDataTableFromStoredProc("SP_Danphe_Audit", paramList, this);
            return returnAuditData;
        }
        #endregion



        #region BillReferralSummaryReport
        public DynamicReport Bill_ReferralSummary(DateTime FromDate, DateTime ToDate, bool? isExternal)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@isExternal", isExternal)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_ReferralSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion



        #region Referral Item Summary
        public DynamicReport Bill_ReferralItemSumamry(DateTime FromDate, DateTime ToDate, int ReferrerId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@ReferrerId", ReferrerId)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_ReferralItemsSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData.Tables.Count > 1)
            {
                var data = new
                {
                    ReportData = rData.Tables[0],
                    Summary = rData.Tables[1]
                };
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(data);
            }
            return dReport;
        }
        #endregion


        #region IncentiveSummaryReport
        public DynamicReport INCTV_DoctorSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataTable rptDataTable = DALFunctions.GetDataTableFromStoredProc("SP_Report_INCTV_DoctorSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rptDataTable != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rptDataTable);
            }
            return dReport;
        }
        #endregion

        #region Incentive Item Summary Report
        public DynamicReport INCTV_SummaryItemReport(DateTime FromDate, DateTime ToDate, int employeeId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@employeeId", employeeId)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_INCTV_ReferralItemsSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rData);
            }
            return dReport;
        }
        #endregion

        #region Incentive Doc ItemGroup Summary
        public DynamicReport INCTV_Doc_ItemGroupSummary(DateTime FromDate, DateTime ToDate, int employeeId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@employeeId", employeeId)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_INCTV_Doc_ItemGroupSummary", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rData);
            }
            return dReport;
        }
        #endregion

        //PatientRegistrationReport
        public DataTable PatientRegistrationReport(DateTime FromDate, DateTime ToDate, string Gender, string Country)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@Gender", Gender),
                new SqlParameter("@Country", Country)
            };
            DataTable PatientRegRptdata = DALFunctions.GetDataTableFromStoredProc("SP_Report_Patient_RegistrationReport", paramList, this);
            return PatientRegRptdata;
        }

        //For handover Amount 
        #region 
        public DynamicReport GetHandoverCalculationDateWise(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_BIL_TXN_GetHandoverCalculationDateWise", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rData);
            }
            return dReport;
        }
        #endregion

        #region IncentivePaymentSummaryReport
        public DynamicReport INCTV_DoctorPaymentSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataTable rptDataTable = DALFunctions.GetDataTableFromStoredProc("SP_Report_INCTV_DoctorPayment", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rptDataTable != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rptDataTable);
            }
            return dReport;
        }
        #endregion

        #region Bill Item Summary Report
        public DynamicReport RPT_Bil_ItemSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_ItemSummaryReport", paramList, this);
            DynamicReport dReport = new DynamicReport();
            if (rData != null)
            {
                dReport.Schema = null;
                dReport.JsonData = JsonConvert.SerializeObject(rData);
            }
            return dReport;
        }
        #endregion


        public DataTable PoliceCaseReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
            };

            DataTable policecasedata = DALFunctions.GetDataTableFromStoredProc("SP_Report_PoliceCasePatient", paramList, this);
            return policecasedata;
        }
    }
}
