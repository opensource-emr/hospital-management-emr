using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using DanpheEMR.Security;
using System.Data;
using DanpheEMR.ServerModel;
using DanpheEMR.Enums;
using System.Data.SqlClient;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.BillingReports;

namespace DanpheEMR.Controllers.Reporting
{
    //This Reporting controller provides controller and ControllerView functionality for reporting
    //We take it single file for Controller code and ControllerView Code
    //Cannot inherit this from CommonController since commoncontroller requires to be called as: api/Controller url.
    //and we're returning both views as well as data from this controller.
    [DanpheDataFilter()]
    public class BillingReportsController : Controller
    {
        private readonly string connString = null;
        public BillingReportsController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
        }



        #region Patient wise Bill cancel  
        public string BillCancelSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            // DanpheHTTPResponse<List<BillCancelReport>> responseData = new DanpheHTTPResponse<List<BillCancelReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable billCancel = reportingDbContext.BIL_BillCancelSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = billCancel;


            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region CreditSettlementReport
        public string CreditSettlementReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtCreditSettlementReport = reportingDbContext.BIL_CreditSettlementReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtCreditSettlementReport;


            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region Credit SettlementReport View Detail
        public string CreditSettlementViewDetail(DateTime FromDate, DateTime ToDate, int PatientId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate)
               , new SqlParameter("@ToDate", ToDate)
               , new SqlParameter("@PatientId", PatientId)
            };

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataSet dsCreditSettlementViewDetail = DALFunctions.GetDatasetFromStoredProc("SP_BIL_GetSettlementDetailReportOfPatient", paramList, reportingDbContext);
                DataTable dtPatientInfo = dsCreditSettlementViewDetail.Tables[0];
                DataTable dtSettlement = dsCreditSettlementViewDetail.Tables[1];
                DataTable dtReturnedSettlement = dsCreditSettlementViewDetail.Tables[2];
                DataTable dtCashDiscount = dsCreditSettlementViewDetail.Tables[3];
                //DataTable dtDiscountReceived = dsCreditSettlementViewDetail.Tables[4];
                var settlementDetail = new
                {
                    PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                    Settlements = dtSettlement,
                    ReturnedSettlement = dtReturnedSettlement,
                    CashDiscount = dtCashDiscount,
                    //DiscountReceived = dtDiscountReceived

                };
                responseData.Status = "OK";
                responseData.Results = settlementDetail;


            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region Custom Report
        public string CustomReport(DateTime FromDate, DateTime ToDate, string ReportName)
        {

            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport CustomReportData = reportingDbContext.CustomReport(FromDate, ToDate, ReportName);
                responseData.Status = "OK";
                responseData.Results = CustomReportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region BilDenomination Reporting
        public string BilDenominationReport(DateTime FromDate, DateTime ToDate, int UserId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                if (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue))
                {

                    FromDate = System.DateTime.Today;
                    ToDate = DateTime.Now;
                }
                else if (FromDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MaxValue))
                {

                    ToDate = DateTime.Now;

                }
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // List<DoctorRevenue> doctorrevenueReport = reportingDbContext.DoctorRevenue(FromDate, ToDate, ProviderName);
                DataTable bilDenomination = reportingDbContext.BilDenomination(FromDate, ToDate, UserId);
                responseData.Status = "OK";
                responseData.Results = bilDenomination;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        public string BilDenominationReportAllList(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                if (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue))
                {

                    FromDate = System.DateTime.Today;
                    ToDate = DateTime.Now;
                }
                else if (FromDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MaxValue))
                {
                    ToDate = DateTime.Now;
                }
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable bilDenomination = reportingDbContext.BilDenominationAllList(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = bilDenomination;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Deposit Balance Report
        public string DepositBalance()
        {
            //DanpheHTTPResponse<List<DepositBalanceReport>> responseData = new DanpheHTTPResponse<List<DepositBalanceReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // DoctorReport doctorReport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                DataTable depositBalanceReport = reportingDbContext.DepositBalanceReport();
                // depositBalanceReport.DefaultView.Sort = "PatientId DESC";//sud:16Sept'10-For Code Conflict testing, remove it asap.
                //depositBalanceReport.DefaultView.Sort = "DepositId DESC";
                depositBalanceReport = depositBalanceReport.DefaultView.ToTable();
                responseData.Status = "OK";
                responseData.Results = depositBalanceReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion



        #region DepartmentRevenueReport
        public string DepartmentRevenueReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.DepartmentRevenueReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region Department Summary Report
        public string DepartmentSummaryReport(DateTime FromDate, DateTime ToDate, string billingType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate), new SqlParameter("@billingType", billingType)};

                DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentSummaryReport", paramList, reportingDbContext);
                var departmentSummaryRptData = dts.Tables[0];
                var depositInfo = dts.Tables[1];
                var settlementInfo = dts.Tables[2];

                var RptData = new { DepartmentSummary = departmentSummaryRptData, DepositInfo = depositInfo, SettlementInfo = settlementInfo };
                responseData.Status = "OK";
                responseData.Results = RptData;

            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region Department Item Summary report
        public string BillDeptItemSummary(DateTime FromDate, DateTime ToDate, string SrvDeptName)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.BillDeptItemSummary(FromDate, ToDate, SrvDeptName);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion




        #region Doctor Revenue Report
        //Doctor Revenue Report 
        // GET: /<controller>/
        public string DoctorRevenue(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                if (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue))
                {

                    FromDate = System.DateTime.Today;
                    ToDate = DateTime.Now;
                }
                else if (FromDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MaxValue))
                {

                    ToDate = DateTime.Now;

                }
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // List<DoctorRevenue> doctorrevenueReport = reportingDbContext.DoctorRevenue(FromDate, ToDate, ProviderName);
                DataTable doctorrevenueReport = reportingDbContext.DoctorRevenue(FromDate, ToDate, ProviderName);
                responseData.Status = "OK";
                responseData.Results = doctorrevenueReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion
        #region Doctor Report 
        //Doctor Report
        public string DoctorReport(DateTime FromDate, DateTime ToDate, string ProviderName)

        {

            //DanpheHTTPResponse<List<DoctorReport>> responseData = new DanpheHTTPResponse<List<DoctorReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // DoctorReport doctorReport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                DataTable doctorreport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                responseData.Status = "OK";
                responseData.Results = doctorreport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);



            //var dalObj = new ReportingDbContext(connString);
            //var doctorReport = dalObj.DoctorReport(FromDate, ToDate, ProviderName);

            //return doctorReport;
        }

        #endregion




        #region Daily Sales Report
        //Daily Sales Report
        public string DailySalesReport(DateTime FromDate, DateTime ToDate, int? CounterId, int? CreatedBy, bool IsInsurance = false)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? null: CreatedBy),
                             new SqlParameter("@IsInsurance", IsInsurance) };
                //we receive 3 tables in this dataset.
                //Table-1: Invoice/Receipt level details of Sales, Return and Deposits
                //Table-2: SettlementSummary for CashDiscount, CollectionFromReceivable, etc.. 
                //Table-3: Summary view of User's All collection components for given date range. 
                //Table-4: Summary of Other Payments (eg: Maternity for LPH)
                DataSet dsUsrCollnDetail = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DailySales", paramList, reportingDbContext);
                responseData.Status = "OK";

                //The return column name must be fixed in order for this to work. 
                var otherPayments = dsUsrCollnDetail.Tables[3].Rows.Count > 0 ? dsUsrCollnDetail.Tables[3].Rows[0]["OtherPaymentsGiven"] : 0;

                responseData.Results = new
                {
                    UserCollectionDetails = dsUsrCollnDetail.Tables[0],
                    SettlementSummary = BilRPT_UserColln_SettlementSummaryVM.MapDataTableToSingleObject(dsUsrCollnDetail.Tables[1]),
                    UserCollectionSummary = dsUsrCollnDetail.Tables[2],
                    Total_OtherPaymentsGiven = otherPayments
                };
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        public string DiscountReport(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy)
        {
            //DanpheHTTPResponse<List<DailySalesReport>> responseData = new DanpheHTTPResponse<List<DailySalesReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                if (CounterId == "0")
                {
                    CounterId = "";
                }
                DataTable discountReport = reportingDbContext.DiscountReport(FromDate, ToDate, CounterId, CreatedBy);
                responseData.Status = "OK";
                responseData.Results = discountReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #region Total Items Bill Report
        //Daily Sales Report
        public string TotalItemsBill(DateTime FromDate, DateTime ToDate, string billingType, string ServiceDepartmentName, string ItemName)
        {
            // DanpheHTTPResponse<List<TotalItemsBill>> responseData = new DanpheHTTPResponse<List<TotalItemsBill>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // DoctorReport doctorReport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                DataTable totalitembill = reportingDbContext.TotalItemsBill(FromDate, ToDate, billingType, ServiceDepartmentName, ItemName);
                responseData.Status = "OK";
                responseData.Results = totalitembill;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Sales Day Book
        //Sales Daybook report
        public string SalesDaybook(DateTime FromDate, DateTime ToDate, bool IsInsurance = false)
        {
            //DanpheHTTPResponse<List<SalesDaybook>> responseData = new DanpheHTTPResponse<List<SalesDaybook>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable salesdaybook = reportingDbContext.SalesDaybook(FromDate, ToDate, IsInsurance);
                responseData.Status = "OK";
                responseData.Results = salesdaybook;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion
        #region Department Sales Day Book
        //Department wise Sales Daybook report
        public string DepartmentSalesDaybook(DateTime FromDate, DateTime ToDate, bool IsInsurance = false)
        {
            //DanpheHTTPResponse<List<DepartmentSalesDaybook>> responseData = new DanpheHTTPResponse<List<DepartmentSalesDaybook>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.DepartmentSalesDaybook(FromDate, ToDate, IsInsurance);
                responseData.Status = "OK";
                responseData.Results = deptsalesdaybook;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Patient Neighbourhood Card Details Report
        //Patient Neighbourhood Card Details Report
        public string PatientNeighbourhoodCardDetail(DateTime FromDate, DateTime ToDate)
        {
            //DanpheHTTPResponse<List<PatientNeighbourhoodCardDetail>> responseData = new DanpheHTTPResponse<List<PatientNeighbourhoodCardDetail>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.PatientNeighbourhoodCardDetail(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = deptsalesdaybook;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Patient Neighbourhood Card Details Report
        //Patient Neighbourhood Card Details Report
        public string PackageSalesDetail(DateTime FromDate, DateTime ToDate)
        {
            //DanpheHTTPResponse<List<PatientNeighbourhoodCardDetail>> responseData = new DanpheHTTPResponse<List<PatientNeighbourhoodCardDetail>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.PackageSalesDetail(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = deptsalesdaybook;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Dialysis Patient Details Report
        //Dialysis Patient Details Report
        public string DialysisPatientDetail(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dialysispatient = reportingDbContext.DialysisPatientDetail(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dialysispatient;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region Patient Bill History
        //Department wise Sales Daybook report
        public string PatientBillHistory(DateTime? FromDate, DateTime? ToDate, string PatientCode)
        {
            DanpheHTTPResponse<PatientBillHistoryMaster> responseData = new DanpheHTTPResponse<PatientBillHistoryMaster>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                PatientBillHistoryMaster paitbillhistory = reportingDbContext.PatientBillHistory(FromDate, ToDate, PatientCode);
                responseData.Status = "OK";
                responseData.Results = paitbillhistory;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Total Admitted Patient
        //Total Admitted Patient
        public string TotalAdmittedPatient(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.TotalAdmittedPatient(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = deptsalesdaybook;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Total Discharged Patient
        //Total Discharged Patient Report
        public string DischargedPatient(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dischargepatient = reportingDbContext.DischargedPatient(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dischargepatient;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Tranferred Patient
        //Transferred Patient Report
        public string TransferredPatient(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable transferpatient = reportingDbContext.TransferredPatient(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = transferpatient;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion



        #region Income Segregation In Reporting  

        public string IncomeSegregationStaticReport(DateTime FromDate, DateTime ToDate, string billingType)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable incomesegregation = reportingDbContext.Get_Bill_IncomeSegregationStaticReport(FromDate, ToDate, billingType);
                responseData.Status = "OK";
                responseData.Results = incomesegregation;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }


        #endregion

        #region PatientCensusReport
        public string PatientCensusReport(DateTime FromDate, DateTime ToDate, int? ProviderId, int? DepartmentId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport patCensusReport = reportingDbContext.PatientCensusReport(FromDate, ToDate, ProviderId, DepartmentId);
                responseData.Status = "OK";
                responseData.Results = patCensusReport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion


        #region Doctorwise OutPatient Report
        public string DoctorwiseOutPatientReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DataTable reportData = repDbContext.DoctorWisePatientReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region Daily MIS Report
        public string DailyMISReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.DailyMISReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string DoctorPatientCount(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DataTable reportData = repDbContext.DoctorPatientCount(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region DepartmentSummaryReport
        public string BillDepartmentSummary(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.BillDepartmentSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region BillDocSummary
        public string BillDocSummary(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.BillDocSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region BillDocDeptSummary
        public string BillDocDeptSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.BillDocDeptSummary(FromDate, ToDate, ProviderId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region BillDocDeptItemSummary
        public string BillDocDeptItemSummary(DateTime FromDate, DateTime ToDate, int ProviderId, string SrvDeptName)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.BillDocDeptItemSummary(FromDate, ToDate, ProviderId, SrvDeptName);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Service Department Names (list of srvDeptNames from Function)
        public string LoadDeptListFromFN()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DataTable servDeptsName = repDbContext.LoadServDeptsNameFromFN();
                responseData.Status = "OK";
                responseData.Results = servDeptsName;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Doctorwise Income Summary OP-IP
        public string DoctorwiseIncomeSummaryOPIP(DateTime FromDate, DateTime ToDate, int? ProviderId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.DoctorwiseIncomeSummaryOpIpReport(FromDate, ToDate, ProviderId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region Sales/Purchase Trained Companion Graph in Pharmacy Dashboard  
        //DistrictWise Report
        public string SalesPurchaseTrainedCompanion(DateTime FromDate, DateTime ToDate, string Status, string ItemIdCommaSeprated)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport phrmGraph = reportingDbContext.GetSalesPurchaseTrainedCompanion(FromDate, ToDate, Status, ItemIdCommaSeprated);
                responseData.Status = "OK";
                responseData.Results = phrmGraph;


            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }


        #endregion




        #region DoctorWise Patient Report 
        //DistrictWise Report
        public string DoctorWisePatientReport(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport doctorwisePatientReport = reportingDbContext.DoctorWisePatientReport(FromDate, ToDate, ProviderName);
                responseData.Status = "OK";
                responseData.Results = doctorwisePatientReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region DepartmentWise Patient Report 
        //DistrictWise Report
        public string DepartmentWiseAppointmentReport(DateTime FromDate, DateTime ToDate, int DepartmentId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport departmentwiseappointmentReport = reportingDbContext.DepartmentWiseAppointmentReport(FromDate, ToDate, DepartmentId);
                responseData.Status = "OK";
                responseData.Results = departmentwiseappointmentReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region Patient Wise Collection Report 
        //DistrictWise Report
        public string PatientCreditBillSummary(DateTime FromDate, DateTime ToDate)
        {
            //DanpheHTTPResponse<List<PatientWiseCollectionReport>> responseData = new DanpheHTTPResponse<List<PatientWiseCollectionReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable patientwiseCollection = reportingDbContext.BIL_PatientCreditSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = patientwiseCollection;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }



        #endregion


        #region Doctor Summary Report
        // GET: /<controller>/
        //used in doctor's module.
        public string DoctorSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                if (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue))
                {

                    FromDate = System.DateTime.Today;
                    ToDate = DateTime.Now;
                }
                else if (FromDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate > ((DateTime)System.Data.SqlTypes.SqlDateTime.MaxValue))
                {

                    ToDate = DateTime.Now;

                }
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable doctorrSummary = reportingDbContext.DoctorSummary(FromDate, ToDate, ProviderId);
                responseData.Status = "OK";
                responseData.Results = doctorrSummary;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Doctor List
        public string GetDoctorList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MasterDbContext masterDb = new MasterDbContext(connString);

                List<EmployeeModel> docList = (from emp in masterDb.Employees
                                               join role in masterDb.EmployeeRole on emp.EmployeeRoleId equals role.EmployeeRoleId
                                               where role.EmployeeRoleName == "Doctor"
                                               select emp).OrderBy(a => a.FirstName).ToList();

                responseData.Status = "OK";
                responseData.Results = docList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Referral List
        public string GetReferralList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MasterDbContext masterDb = new MasterDbContext(connString);

                List<EmployeeModel> refList = (from e in masterDb.Employees
                                               where e.IsActive == true
                                               && (e.IsExternal ? true : (e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true))
                                               select e).ToList();

                responseData.Status = "OK";
                responseData.Results = refList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Appointment Type List
        public string GetAppointmentTypeList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                PatientDbContext patientDb = new PatientDbContext(connString);
                var patientdetail = patientDb.Appointments.Select(s => s.AppointmentType).Distinct().ToList();

                responseData.Status = "OK";
                responseData.Results = patientdetail;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Department List
        public string GetDepartmentList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MasterDbContext masterDb = new MasterDbContext(connString);

                List<DepartmentModel> docList = (from dep in masterDb.Departments
                                                 select dep).OrderBy(a => a.DepartmentName).ToList();

                responseData.Status = "OK";
                responseData.Results = docList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion



        #region EmployeeName List
        public string GetEmployeeList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MasterDbContext masterDb = new MasterDbContext(connString);
                List<EmployeeModel> empList = masterDb.Employees.ToList();

                responseData.Status = "OK";
                responseData.Results = empList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Service Department List
        public string GetServiceDeptList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                MasterDbContext masterDb = new MasterDbContext(connString);
                List<ServiceDepartmentModel> servDeptList = masterDb.ServiceDepartments.ToList();

                responseData.Status = "OK";
                responseData.Results = servDeptList;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region For various dashboards

        //Income segregation report
        public string IncomeSegregation(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport incomeSegregation = reportingDbContext.BIL_Daily_IncomeSegregation(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = incomeSegregation;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        //daily revenue report
        //we may reuse this for daily revenue trend between two dates. 
        //for which add fromdate and todate parameters in thisfxn, dbcontext fxn, and stored proc.--sudarshan
        public string DailyRevenueTrend()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dailyRevenue = reportingDbContext.BIL_Daily_RevenueTrend();
                responseData.Status = "OK";
                responseData.Results = dailyRevenue;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string MonthlyBillingTrend()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dailyRevenue = reportingDbContext.BIL_Monthly_BillingTrend();
                responseData.Status = "OK";
                responseData.Results = dailyRevenue;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string BILLDsbCntrUsrCollection(DateTime fromDate, DateTime toDate, int? counterId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport cntrDayData = reportingDbContext.BIL_Daily_CounterNUsersCollection(fromDate, toDate);
                responseData.Status = "OK";
                responseData.Results = cntrDayData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        //added: sud-31May'18 -- to display TotalProvisional, TotalCredit & TotalDepositBalances in billing dashboard
        public string BILLDsbOverallBillStatus()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                BillingDbContext bilDbContext = new BillingDbContext(connString);
                //added: sud: 31May'18-- to show in dashboard
                double? provisionalTot = bilDbContext.BillingTransactionItems
                     .Where(itm => itm.BillStatus == ENUM_BillingStatus.provisional // "provisional"
                     ).Sum(itm => itm.TotalAmount);

                double? creditTotAmt = bilDbContext.BillingTransactions
                     .Where(txn => txn.BillStatus == ENUM_BillingStatus.unpaid// "unpaid"
                     ).Sum(txn => txn.TotalAmount);

                double? totalDeposit = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == ENUM_BillDepositType.Deposit.ToLower()).Sum(dep => dep.Amount);
                double? totalDeduct = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == ENUM_BillDepositType.DepositDeduct.ToLower()).Sum(dep => dep.Amount);
                // double? totalDeposit = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == "deposit").Sum(dep => dep.Amount);
                //double? totalDeduct = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == "depositdeduct").Sum(dep => dep.Amount);

                //make values zero if null.
                totalDeposit = totalDeposit != null ? totalDeposit : 0;
                totalDeduct = totalDeduct != null ? totalDeduct : 0;

                var retObj = new
                {
                    TotalProvisional = provisionalTot,
                    TotalCredits = creditTotAmt,
                    DepositBalance = totalDeposit - totalDeduct
                };

                responseData.Results = retObj;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        public string HomeDashboardStats()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dsbStats = reportingDbContext.Home_DashboardStatistics();
                responseData.Status = "OK";
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string PatientZoneMap()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport patZoneMap = reportingDbContext.Home_PatientZoneMap();
                responseData.Status = "OK";
                responseData.Results = patZoneMap;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string DepartmentAppointmentsTotal()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport deptAppts = reportingDbContext.Home_DeptWise_TotalAppointmentCount();
                responseData.Status = "OK";
                responseData.Results = deptAppts;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string PatientGenderWise()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport patCounts = reportingDbContext.Patient_GenderWiseCount();
                responseData.Status = "OK";
                responseData.Results = patCounts;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string PatientAgeRangeNGenderWise()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport patCounts = reportingDbContext.Patient_AgeRangeNGenderWiseCount();
                responseData.Status = "OK";
                responseData.Results = patCounts;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        //
        public string ERDashboard()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dsbStats = reportingDbContext.Emergency_DashboardStatistics();
                responseData.Status = "OK";
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Discharged Patient Bill Breakup report
        public string DischargedPatientBillBreakup(int VisitId, int PatientId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                AdmissionDbContext admissionDbContext = new AdmissionDbContext(connString);
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                var result = (from addm in admissionDbContext.Admissions
                              where addm.PatientVisitId == VisitId
                              join visit in admissionDbContext.Visits
                              on addm.PatientVisitId equals visit.PatientVisitId
                              join pat in admissionDbContext.Patients
                              on addm.PatientId equals pat.PatientId

                              from addmInfo in admissionDbContext.PatientBedInfos
                              join ward in admissionDbContext.Wards
                              on addmInfo.WardId equals ward.WardId
                              join bed in admissionDbContext.Beds
                              on addmInfo.BedId equals bed.BedId
                              where addmInfo.PatientVisitId == VisitId
                              select new
                              {
                                  Patient = new
                                  {
                                      IPNumber = visit.VisitCode,
                                      PatName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                      Address = pat.Address,
                                      Age = pat.Age,
                                      Gender = pat.Gender,
                                      PatientCode = pat.PatientCode,
                                      InvoiceDateTime = System.DateTime.Now,
                                      AdmissionDate = addm.AdmissionDate,
                                      DischargeDate = addm.DischargeDate,
                                      AdmittedDoctor = from emp in admissionDbContext.Employees
                                                       where emp.EmployeeId == addm.AdmittingDoctorId
                                                       select emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                      Ward = ward.WardName + " " + ward.WardLocation,
                                      BedNo = bed.BedNumber
                                  }

                              }).FirstOrDefault();
                DataTable dischargeBill = reportingDbContext.BillDischargeBreakup(VisitId, PatientId);

                var resultData = new
                {
                    Patient = result,
                    ReportData = dischargeBill
                };
                responseData.Status = "OK";
                responseData.Results = resultData;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Return Bills Report
        public string ReturnBillReport(DateTime FromDate, DateTime ToDate)
        {

            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable discountReport = reportingDbContext.BIL_ReturnReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = discountReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region ReturnBillReportViewDetail
        public string ReturnBillReportViewDetail(int BillReturnId)
        {

            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable returnBillDetail = reportingDbContext.BIL_ReturnReportDetail(BillReturnId);
                responseData.Status = "OK";
                responseData.Results = returnBillDetail;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Referral Summary
        public string Bill_ReferralSummary(DateTime FromDate, DateTime ToDate, bool? isExternal)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.Bill_ReferralSummary(FromDate, ToDate, isExternal);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region BillDocDeptItemSummary
        public string Bill_ReferralItemSummary(DateTime FromDate, DateTime ToDate, int ReferrerId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.Bill_ReferralItemSumamry(FromDate, ToDate, ReferrerId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Incentive Docter Summary
        public string INCTV_DocterSummary(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.INCTV_DoctorSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Incentive Docter Item Summary
        public string INCTV_DocterItemSummary(DateTime FromDate, DateTime ToDate, int employeeId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.INCTV_SummaryItemReport(FromDate, ToDate, employeeId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Incentive Docter ItemGroup Summary
        public string INCTV_Doc_ItemGroupSummary(DateTime FromDate, DateTime ToDate, int employeeId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.INCTV_Doc_ItemGroupSummary(FromDate, ToDate, employeeId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Hand over Calculation
        public string BIL_TXN_GetHandoverCalculationDateWise(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.GetHandoverCalculationDateWise(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Incentive Docter Payment Summary
        public string INCTV_DocterPaymentSummary(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.INCTV_DoctorPaymentSummary(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Bill Item Summary Report
        public string RPT_Bil_ItemSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.RPT_Bil_ItemSummaryReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region EHS Bill Report
        //Daily Sales Report
        public string EHSBillReport(DateTime FromDate, DateTime ToDate, string billingType, string ServiceDepartmentName, string ItemName, int? AssignedToDoctorId, int? ReferredByDoctorId, int? UserId)
        {
            // DanpheHTTPResponse<List<TotalItemsBill>> responseData = new DanpheHTTPResponse<List<TotalItemsBill>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // DoctorReport doctorReport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                DataTable EHSbill = reportingDbContext.EHSBillReport(FromDate, ToDate, ServiceDepartmentName, ItemName, AssignedToDoctorId, ReferredByDoctorId, UserId);
                responseData.Status = "OK";
                responseData.Results = EHSbill;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region DEPOSIT Transactions Report 

        //Sud:10Sept'21--To get Deposit Transactions
        public string Billing_DepositTransationsReport(DateTime FromDate, DateTime ToDate, string patSearchText, int employeeId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramList = new List<SqlParameter>() {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate),
                    new SqlParameter("@PatSearchText",patSearchText),
                    new SqlParameter("@employeeId",employeeId)
                };

                DataTable dtDepositTxnsData = DALFunctions.GetDataTableFromStoredProc("SP_BIL_RPT_GetDepositTransations", paramList, reportingDbContext);

                responseData.Status = "OK";
                responseData.Results = dtDepositTxnsData;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }


            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion
        public string Billing_SchemeWiseDiscountReport(DateTime FromDate, DateTime ToDate, int MembershipTypeId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                DataTable schemeWiseDiscountReport = reportingDbContext.SchemeWiseDiscountReport(FromDate, ToDate, MembershipTypeId);
                responseData.Status = "OK";
                responseData.Results = schemeWiseDiscountReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public string Billing_DepartmentWiseDiscountSchemeReport(DateTime FromDate, DateTime ToDate, int? MembershipTypeId, int? ServiceDepartmentId, string PaymentMode)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                DataTable schemeWiseDiscountReport = reportingDbContext.DepartmentWiseDiscountSchemeReport(FromDate, ToDate, MembershipTypeId, ServiceDepartmentId, PaymentMode);
                responseData.Status = "OK";
                responseData.Results = schemeWiseDiscountReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public string Billing_ItemLevelDepartmentWiseDiscountSchemeReport(int? BillingTransactionId, int? MembershipTypeId, int? ServiceDepartmentId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                DataTable itemLevelSchemeWiseDiscountReport = reportingDbContext.ItemLevelDepartmentWiseDiscountSchemeReport(BillingTransactionId, MembershipTypeId, ServiceDepartmentId);
                responseData.Status = "OK";
                responseData.Results = itemLevelSchemeWiseDiscountReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }


        public string GetAllDepartmentList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                var result = (from dep in billingDbContext.ServiceDepartment
                              select new
                              {
                                  ServiceDepartmentId = dep.ServiceDepartmentId,
                                  ServiceDepartmentName = dep.ServiceDepartmentName
                              }).ToList();
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #region UserWiseCashCollectionReport
        public string UserWiseCashCollectionReport(DateTime FromDate, DateTime ToDate, int? UserId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext repDbContext = new ReportingDbContext(connString);
                DynamicReport reportData = repDbContext.UserWiseCashCollectionReport(FromDate, ToDate, UserId);
                responseData.Status = "OK";
                responseData.Results = reportData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion


    }
}
