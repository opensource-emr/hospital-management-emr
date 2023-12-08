using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.Entity;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Linq;

namespace DanpheEMR.Controllers.Reporting
{
    //This Reporting controller provides controller and ControllerView functionality for reporting
    //We take it single file for Controller code and ControllerView Code
    //Cannot inherit this from CommonController since commoncontroller requires to be called as: api/Controller url.
    //and we're returning both views as well as data from this controller.
    [DanpheDataFilter()]
    public class ReportingController : Controller
    {
        private readonly string connString = null;
        public ReportingController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
        }

        #region Main Reporting
        [DanpheViewFilter("reports-view")]
        public IActionResult ReportingMain()
        {
            return View("ReportingMain");
        }
        #endregion  
        #region AdmissionMain Reporting
        [DanpheViewFilter("reports-admissionmain-view")]
        public IActionResult AdmissionMain()
        {
            return View("AdmissionMain");
        }
        #endregion    
        #region BillingMain Reporting
        [DanpheViewFilter("reports-billingmain-view")]
        public IActionResult BillingMain()
        {
            return View("BillingMain");
        }
        #endregion

        #region AppointmentMain Reporting
        [DanpheViewFilter("reports-appointmentmain-view")]
        public IActionResult AppointmentMain()
        {
            return View("AppointmentMain");
        }
        #endregion
        #region RadiologyMain Reporting
        [DanpheViewFilter("reports-radiologymain-view")]
        public IActionResult RadiologyMain()
        {
            return View("RadiologyMain");
        }
        #endregion
        #region LabMain Reporting
        [DanpheViewFilter("reports-labmain-view")]
        public IActionResult LabMain()
        {
            return View("LabMain");
        }
        #endregion
        #region Doctors Reporting
        [DanpheViewFilter("reports-doctorsmain-view")]
        public IActionResult DoctorsMain()
        {
            return View("DoctorsMain");
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
        [DanpheViewFilter("reports-billingmain-patientbillhistory-view")]
        public IActionResult PatientBillHistoryView()
        {
            return View("PatientBillHistory");
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
        [DanpheViewFilter("reports-billingmain-totaladmittedpatient-view")]
        public IActionResult TotalAdmittedPatientView()
        {
            return View("TotalAdmittedPatient");
        }
        #endregion
        #region Admission And Discharge List
        //Admission And Discharge List
        public string AdmissionAndDischargeList(DateTime FromDate, DateTime ToDate, int WardId, int DepartmentId, int BedFeatureId, string AdmissionStatus, string SearchText)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable adtlist = reportingDbContext.AdmissionAndDischargeList(FromDate, ToDate, WardId, DepartmentId, BedFeatureId, AdmissionStatus, SearchText);
                responseData.Status = "OK";
                responseData.Results = adtlist;
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

        #region Rank-Membershipwise Admitted Patient Report
        public string RankMembershipwiseAdmittedPatientReport(string fromDate, string toDate, string memberships, string ranks)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable adtlist = reportingDbContext.RankMembershipwiseAdmittedPatientReport(fromDate, toDate, memberships, ranks);
                responseData.Status = "OK";
                responseData.Results = adtlist;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
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

        public string AllWardCountDetail(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                DataSet ds = DALFunctions.GetDatasetFromStoredProc("SP_Report_ADT_PatientInOutReport",
                   new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate),
                   new SqlParameter("@ToDate", ToDate)},
                   reportingDbContext);

                var allWards = ds.Tables[0];
                var admissionAndTransferredIn = ds.Tables[1];
                var dischargedAndTransferredOut = ds.Tables[2];
                var currentInBed = ds.Tables[3];

                //Create dictionary
                Dictionary<string, ADTInpatientCensusSummary> allData = new Dictionary<string, ADTInpatientCensusSummary>();

                //Initialize all Keys, these Keys are WardName which are always Unique
                foreach (DataRow row in allWards.Rows)
                {
                    var wardName = row["WardName"].ToString();
                    var singleObj = new ADTInpatientCensusSummary();
                    singleObj.Ward = wardName;
                    allData[wardName] = singleObj;
                }

                //Loop through for Admission and TransferredIn count : Table 2
                foreach (DataRow row in admissionAndTransferredIn.Rows)
                {
                    var wardName = row["WardName"].ToString();
                    var action = row["Action"].ToString();
                    int totalCount = Convert.ToInt32(row["TotalCount"]);

                    if (action == "admission")
                    {
                        allData[wardName].NewAdmission = allData[wardName].NewAdmission + totalCount;
                    }
                    else if (action == "transfer")
                    {
                        allData[wardName].TransIn = allData[wardName].TransIn + totalCount;
                    }

                }

                //Loop through for Discharged and TransferredOut count : Table 3
                foreach (DataRow row in dischargedAndTransferredOut.Rows)
                {
                    var wardName = row["WardName"].ToString();
                    var action = row["OutAction"].ToString();
                    var totalCount = Convert.ToInt32(row["TotalCount"]);

                    if (action == "discharged")
                    {
                        allData[wardName].Discharged = allData[wardName].Discharged + totalCount;
                    }
                    else if (action == "transfer")
                    {
                        allData[wardName].TransOut = allData[wardName].TransOut + totalCount;
                    }

                }

                //Loop through for InBed count : Table 4
                foreach (DataRow row in currentInBed.Rows)
                {
                    var wardName = row["WardName"].ToString();
                    int totalCount = Convert.ToInt32(row["TotalCount"]);
                    allData[wardName].InBed = allData[wardName].InBed + totalCount;
                }

                var allWardDataCount = allData.Values.ToList();

                //Loop through all wards to get the Total Count
                foreach (var val in allWardDataCount)
                {
                    val.Total = val.InBed + val.NewAdmission + val.TransIn - val.TransOut - val.Discharged;
                }


                responseData.Status = "OK";
                responseData.Results = allWardDataCount;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        [DanpheViewFilter("reports-billingmain-dischargedpatient-view")]
        public IActionResult DischargedPatientView()
        {
            return View("DischargedPatient");
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
        [DanpheViewFilter("reports-admissionmain-transferredpatient-view")]
        public IActionResult TransferredPatientView()
        {
            return View("TransferredPatient");
        }
        #endregion
        #region Radiology Revenue Generated
        //Radiology Revenue Generated Report
        public string RevenueGenerated(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable revenuegenerated = reportingDbContext.RevenueGenerated(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = revenuegenerated;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-radiologymain-revenuegenerated-view")]
        public IActionResult RevenueGeneratedView()
        {
            return View("RevenueGenerated");
        }
        #endregion
        #region Daily Appointment Report
        //Daily Appointment Report
        public string DailyAppointmentReport(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentType)
        {
            //DanpheHTTPResponse<List<DailyAppointmentReport>> responseData = new DanpheHTTPResponse<List<DailyAppointmentReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dailyappointment = reportingDbContext.DailyAppointmentReport(FromDate, ToDate, Doctor_Name, AppointmentType);

                responseData.Status = "OK";
                responseData.Results = dailyappointment;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-appointmentmain-dailyappointmentreport-view")]
        public IActionResult DailyAppointmentReportView()
        {
            return View("DailyAppointmentReport");
        }
        #endregion

        #region Rankwise Daily Appointment Report
        //Rankwise Daily Appointment Report
        public string RankwiseDailyAppointmentReport(DateTime FromDate, DateTime ToDate, string Rank, string Membership, string AppointmentType)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable rankwisedailyappointment = reportingDbContext.RankwiseDailyAppointmentReport(FromDate, ToDate, Rank, Membership, AppointmentType);

                responseData.Status = "OK";
                responseData.Results = rankwisedailyappointment;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion


        #region Phone Book Appointment Report
        //Phone Book Appointment Report
        public string PhoneBookAppointmentReport(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentStatus)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable phonebookappointment = reportingDbContext.PhoneBookAppointmentReport(FromDate, ToDate, Doctor_Name, AppointmentStatus);

                responseData.Status = "OK";
                responseData.Results = phonebookappointment;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-appointmentmain-phonebookappointmentreport-view")]
        public IActionResult PhoneBookAppointmentReportView()
        {
            return View("PhoneBookAppointmentReport");
        }
        #endregion
        #region DiagnosisWise Patient Report
        //DiagnosisWise Patient Report
        public string DiagnosisWisePatientReport(DateTime FromDate, DateTime ToDate, string Diagnosis)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable diagnosiswisepatientreport = reportingDbContext.DiagnosisWisePatientReport(FromDate, ToDate, Diagnosis);

                responseData.Status = "OK";
                responseData.Results = diagnosiswisepatientreport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-admissionmain-diagnosiswisepatientreport-view")]
        public IActionResult DIagnosisWisePatientReportView()
        {
            return View("DiagnosisWisePatientReport");
        }
        #endregion


        #region DistrictWise Report 

        public string DistrictWiseAppointmentReport(DateTime FromDate, DateTime ToDate, string CountrySubDivisionName, string gender)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@CountrySubDivisionName", CountrySubDivisionName));
                paramsList.Add(new SqlParameter("@Gender", gender));

                DataTable dtDeptWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DistrictWiseAppointmentReport", paramsList, reportingDbContext);
                responseData.Status = "OK";
                responseData.Results = dtDeptWiseRpt;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        [DanpheViewFilter("reports-appointmentmain-districtwiseappointmentreport-view")]
        public IActionResult DistrictWiseAppointmentReportView()
        {
            return View("DistrictWiseAppointmentReport");
        }
        #endregion
        #region Category Wise Imaging Report

        public string CategoryWiseImagingReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport categorywiseimagingreport = reportingDbContext.CategoryWiseImagingReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = categorywiseimagingreport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-radiologymain-categorywiseimagingreport-view")]
        public IActionResult CategoryWiseImagingReportView()
        {
            return View("CategoryWiseImagingReport");
        }
        #endregion
        #region Category Wise Lab Report
        public string CategoryWiseLabReport(DateTime FromDate, DateTime ToDate, String orderStatus)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable categorywiselabreport = reportingDbContext.CategoryWiseLabReport(FromDate, ToDate, orderStatus);
                responseData.Status = "OK";
                responseData.Results = categorywiselabreport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        //public string CategoryWiseLabReport(DateTime FromDate, DateTime ToDate)
        //{
        //    DanpheHTTPResponse<DynamicReport> responseData1 = new DanpheHTTPResponse<DynamicReport>();
        //    try
        //    {
        //        ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
        //        DynamicReport categorywiselabreport = reportingDbContext.CategoryWiseLabReport(FromDate, ToDate);
        //        responseData1.Status = "OK";
        //        responseData1.Results = categorywiselabreport;
        //    }
        //    catch (Exception ex)
        //    {
        //        //Insert exception details into database table.
        //        responseData1.Status = "Failed";
        //        responseData1.ErrorMessage = ex.Message;
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData1);
        //}
        [DanpheViewFilter("reports-labmain-categorywiselabreport-view")]
        public IActionResult CategoryWiseLabReportView()
        {
            return View("CategoryWiseLabReport");
        }
        #endregion

        #region Category Wise Lab Report
        public string DoctorWisePatientCountLabReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable doctorwiselabreport = reportingDbContext.DoctorWisePatientCountLabReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = doctorwiselabreport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-labmain-categorywiselabreport-view")]
        public IActionResult DoctorWiseLabReportView()
        {
            return View("CategoryWiseLabReport");
        }
        #endregion

        #region Category wise total Item Count Lab Report
        public string CategoryWiseLabItemCountLabReport(DateTime FromDate, DateTime ToDate, String orderStatus)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable catWiseLabItemReport = reportingDbContext.CategoryWiseLabItemCountLabReport(FromDate, ToDate, orderStatus);
                responseData.Status = "OK";
                responseData.Results = catWiseLabItemReport;
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

        #region Item wise total Count Lab Report
        public string ItemWiseLabItemCountLabReport(DateTime FromDate, DateTime ToDate, int? categoryId, String orderStatus)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable itemWiseCountReport = reportingDbContext.ItemWiseLabItemCountLabReport(FromDate, ToDate, categoryId, orderStatus);
                responseData.Status = "OK";
                responseData.Results = itemWiseCountReport;
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

        #region Test Status Detail Report lab
        public string TestStatusDetailReport(DateTime FromDate, DateTime ToDate, String orderStatus)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDBContext = new ReportingDbContext(connString);
                DataTable statusWiseCountReport = reportingDBContext.TestStatusDetailReport(FromDate, ToDate, orderStatus);
                responseData.Status = "OK";
                responseData.Results = statusWiseCountReport;
            }
            catch (Exception ex)
            {
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
        [DanpheViewFilter("reports-billingmain-patientcensusreport-view")]
        public IActionResult PatientCensusReportView()
        {
            return View("PatientCensusReport");
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
        //[DanpheViewFilter("reports-appointmentmain-doctorwiseoutpatient-view")]
        public IActionResult DoctorOutPatientReportView()
        {
            return View("DoctorwiseOutPatient");
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
        [DanpheViewFilter("reports-billingmain-departmentsummaryreport-view")]
        public IActionResult DepartmentSummaryView()
        {
            return View("BillDepartmentSummary");
        }
        #endregion

        public string GeographicalStatReport(DateTime FromDate, DateTime ToDate, string CountrySubDivisionName,string MunicipalityName, string GeoStatType)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@CountrySubDivisionName", CountrySubDivisionName));
                paramsList.Add(new SqlParameter("@MunicipalityName", MunicipalityName));
                paramsList.Add(new SqlParameter("@GeoStatType", GeoStatType));


                DataTable geoStatReport = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_GeographicalStatReport", paramsList, reportingDbContext);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = geoStatReport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
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


        #region Sales/Purchase Trained Companion Graph in Pharmacy Dashboard  

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





        #region Total Revenue From Lab Report
        public string TotalRevenueFromLab(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable revenuelab = reportingDbContext.TotalRevenueFromLab(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = revenuelab;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-labmain-totalrevenuefromlab-view")]
        public IActionResult TotalRevenueFromLabView()
        {
            return View("TotalRevenueFromLab");
        }
        #endregion

        #region ItemWise From Lab Report
        public string ItemWiseFromLab(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable itemwiselab = reportingDbContext.ItemWiseFromLab(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = itemwiselab;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-lab-itemwiselabreport-view")]
        public IActionResult ItemWiseFromLabView()
        {
            return View("ItemWiseFromLab");
        }
        #endregion

        #region DoctorWise Patient Report 

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
        [DanpheViewFilter("reports-doctorsmain-doctorwiseencounterpatientreport-view")]
        public IActionResult DoctorWisePatientReportView()
        {
            return View("DoctorWisePatientReport");
        }
        #endregion
        #region DepartmentWise Patient Report 

        public string DepartmentWiseAppointmentReport(DateTime FromDate, DateTime ToDate, int DepartmentId, string gender)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@DepartmentId", DepartmentId));
                paramsList.Add(new SqlParameter("@Gender", gender));

                DataTable dtDeptWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DepartmentWiseAppointmentReport", paramsList, reportingDbContext);
                responseData.Status = "OK";
                responseData.Results = dtDeptWiseRpt;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        [DanpheViewFilter("reports-appointmentmain-departmentwiseappointmentreport-view")]
        public IActionResult DepartmentWiseAppointmentReportView()
        {
            return View("DepartmentWiseAppointmentReport");
        }
        #endregion
        #region Daily Visit Report
        public string DayAndMonthWiseVisitReport(DateTime FromDate, DateTime ToDate, int DepartmentId, string ReportType)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@DepartmentId", DepartmentId));
                paramsList.Add(new SqlParameter("@ReportType", ReportType));

                DataTable dtDeptWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DayAndMonthWiseVisitReport", paramsList, reportingDbContext);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dtDeptWiseRpt;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion
        #region DepartmentWise Stat Report 

        public string DepartmentWiseStatReport(DateTime FromDate, DateTime ToDate, int? DepartmentId, string gender)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@DepartmentId", DepartmentId));
                paramsList.Add(new SqlParameter("@Gender", gender));

                DataTable dtDeptWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DepartmentWiseStatReport", paramsList, reportingDbContext);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dtDeptWiseRpt;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }public string DoctorWiseStatisticReport(DateTime FromDate, DateTime ToDate, int? EmployeeId, string gender)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@EmployeeId", EmployeeId));
                paramsList.Add(new SqlParameter("@Gender", gender));

                DataTable dtDoctorWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Appointment_DoctorWiseStatReport", paramsList, reportingDbContext);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dtDoctorWiseRpt;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion

        #region Age Classified Stats Report 

        public string AgeClassifiedOPStatsReport(DateTime FromDate, DateTime ToDate, int? DepartmentId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramsList = new List<SqlParameter>();
                paramsList.Add(new SqlParameter("@FromDate", FromDate));
                paramsList.Add(new SqlParameter("@ToDate", ToDate));
                paramsList.Add(new SqlParameter("@DepartmentId", DepartmentId));

                DataTable dtDeptWiseRpt = DALFunctions.GetDataTableFromStoredProc("SP_Report_AgeClassifiedReport", paramsList, reportingDbContext);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dtDeptWiseRpt;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion

        #region Patient Wise Collection Report 

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


        [DanpheViewFilter("reports-billingmain-patientcreditsummary-view")]
        public IActionResult PatientCreditSummary()
        {
            return View("PatientCreditSummary");
        }
        #endregion

        #region Doctor Report 
        //Doctor Report
        public string DoctorReferral(DateTime FromDate, DateTime ToDate, string ProviderName)
        {

            //DanpheHTTPResponse<List<DoctorReferralReport>> responseData = new DanpheHTTPResponse<List<DoctorReferralReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                // DoctorReport doctorReport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);
                DataTable doctorreport = reportingDbContext.DoctorReferral(FromDate, ToDate, ProviderName);
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



            //return null;
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
        #region Diagnosis List
        public string GetDiagnosisList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                //MasterDbContext masterDb = new MasterDbContext(connString);
                AdmissionDbContext DischargeSummary = new AdmissionDbContext(connString);

                var diagnosisList = (from diagnosis in DischargeSummary.DischargeSummary
                                     group diagnosis by new { diagnosis.Diagnosis } into p

                                     select new { Diagnosis = p.Key.Diagnosis }).OrderBy(a => a.Diagnosis).Distinct().ToList();


                responseData.Status = "OK";
                responseData.Results = diagnosisList;
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
                     .Where(txn => txn.BillStatus == ENUM_BillingStatus.unpaid // "unpaid"
                     ).Sum(txn => txn.TotalAmount);

                decimal totalDeposit = bilDbContext.BillingDeposits.Where(dep => dep.TransactionType.ToLower() == ENUM_DepositTransactionType.Deposit.ToLower()).Sum(dep => dep.InAmount);
                decimal totalDeduct = bilDbContext.BillingDeposits.Where(dep => dep.TransactionType.ToLower() == ENUM_DepositTransactionType.DepositDeduct.ToLower()).Sum(dep => dep.OutAmount);
                //double? totalDeposit = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == "deposit").Sum(dep => dep.Amount);
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

        public string HomeInvDashboardStats(int SourceStoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.Home_DashinvboardStatistics(SourceStoreId);
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


        public string DepartmentWiseConsumerItems(int SourceStoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtDepartmentWiseConsumerItems = reportingDbContext.Home_Dashboard_DepartmentWiseConsumerItems(SourceStoreId);
                responseData.Status = "OK";
                responseData.Results = dtDepartmentWiseConsumerItems;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string SubCategoryWiseInventoryStockValue(int SourceStoreId)
        {

            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.Home_Dashboard_SubCategoryWiseInventoryStockValue(SourceStoreId);
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

        public string MonthlyWisePurchaseOrdervsGoodsReceiptValue(int SourceStoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.Home_Dashboard_MonthlyWisePurchaseOrdervsGoodsReceiptValue(SourceStoreId);
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
        //LAB Dashboard
        public string LabDashboard()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dsbStats = reportingDbContext.Lab_DashboardStatistics();
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

        public string CovidDetailsForLab(string testName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.CovidDetailsForLab(testName);
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


        //PatientRegistrationReport
        public string PatientRegistrationReport(DateTime FromDate, DateTime ToDate, string Gender, string Country)
        {
            //DanpheHTTPResponse<List<DailyAppointmentReport>> responseData = new DanpheHTTPResponse<List<DailyAppointmentReport>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable patientregreport = reportingDbContext.PatientRegistrationReport(FromDate, ToDate, Gender, Country);

                responseData.Status = "OK";
                responseData.Results = patientregreport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string PoliceCaseReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable policecasereport = reportingDbContext.PoliceCaseReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = policecasereport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #region Outpatient Morbidity Report List

        [HttpGet("Reporting/OutpatientMorbidityReport/{FromDate}/{ToDate}")]
        public string OutpatientMorbidityReport([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            //OutpatientMorbidityReportViewModel outpatientMorbidity = new OutpatientMorbidityReportViewModel();
            DanpheHTTPResponse<OutpatientMorbidityReportViewModel> responseData = new DanpheHTTPResponse<OutpatientMorbidityReportViewModel>();
            try
            {
                MedicalRecordsDbContext MrDbContext = new MedicalRecordsDbContext(connString);
                OutpatientMorbidityReportViewModel outpatientReportResult = MrDbContext.OutPatientMorbidityReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = outpatientReportResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Total Covid Tests Detail report lab
        public string TotalCovidTestsDetailReport(string testName, string ResultType, string CaseType, int CountrySubDivisionId, DateTime FromDate, DateTime ToDate, string gender)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.TotalCovidTestsDetailReport(testName, ResultType, CaseType, CountrySubDivisionId, FromDate, ToDate, gender);
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

        #region Covid Tests Cumulative Report
        public string CovidTestsCumulativeReport(string testName, int CountrySubDivisionId, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.CovidTestsCumulativeReport(testName, CountrySubDivisionId, FromDate, ToDate);
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

        #region HIV tests detail report
        public string GetHIVTestsDetailReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.GetHIVTestsDetailReport(FromDate, ToDate);
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

        #region Culture test detail report
        public string GetCultureTestsDetailReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.GetCultureTestsDetailReport(FromDate, ToDate);
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

        #region LabTypeWise total test count report
        public string GetLabTypeWiseTestCountReport(int testId, string orderStatus, int categoryId, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dbStats = reportingDbContext.GetLabTypeWiseTestCountreport(testId, orderStatus, categoryId, FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Edited Patient Detail Report
        public string EditedPatientDetailReport(int userId, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.GetEditedPatientDetailReport(userId, FromDate, ToDate);
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

        #region Film Type Radiology Report
        public string FilmTypeCountReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable result = reportingDbContext.GetFilmCountReport(FromDate, ToDate);
                responseData.Results = result;
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Lab Tests Incentive Report
        public string HospitalIncomeIncentiveReport(DateTime FromDate, DateTime ToDate, string ServiceDepartments)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable hospitalIncomeReport = reportingDbContext.HospitalIncomeIncentiveReport(FromDate, ToDate, ServiceDepartments);
                responseData.Status = "OK";
                responseData.Results = hospitalIncomeReport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        public string HospitalIncomeIncentiveReportServiceDepartmentWise(DateTime FromDate, DateTime ToDate, int ServiceDepartmentId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable hospitalIncomeServDeptWiseReport = reportingDbContext.HospitalIncomeIncentiveReportServiceDepartmentWise(FromDate, ToDate, ServiceDepartmentId);
                responseData.Status = "OK";
                responseData.Results = hospitalIncomeServDeptWiseReport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #region Emergency Patient Morbidity Report List

        [HttpGet("Reporting/EmergencyPatientMorbidityReport/{FromDate}/{ToDate}")]
        public string EmergencyPatientMorbidityReport([FromRoute] DateTime FromDate, [FromRoute] DateTime ToDate)
        {
            //OutpatientMorbidityReportViewModel outpatientMorbidity = new OutpatientMorbidityReportViewModel();
            DanpheHTTPResponse<string> responseData = new DanpheHTTPResponse<string>();
            try
            {
                MedicalRecordsDbContext MrDbContext = new MedicalRecordsDbContext(connString);
                var outpatientReportResult = MrDbContext.EmergencyPatientMorbidityReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = outpatientReportResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Get All Inventory Dashboard Statistics
        public string InventoryDashboardStatistics(int SourceStoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.InventoryDashboardStatistics(SourceStoreId);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Get All Storewise Dispatch Value 
        public string DepertmentwiseDispatchedValue(int SourceStoreId, DateTime? FromDate, DateTime? ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtDepartmentWiseConsumerItems = reportingDbContext.DepaartmentWiseDispatchedValue(SourceStoreId, FromDate, ToDate);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dtDepartmentWiseConsumerItems;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Get SubCategory Wise Inventory Stock Value
        public string GetSubCategoryWiseInventoryStockValue(int SourceStoreId)
        {

            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.SubCategoryWiseInventoryStockValue(SourceStoreId);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Get Monthly Wise PurchaseOrder ,GoodReceipt and Dispatch
        public string MonthlyWiseTransaction(int SourceStoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dsbStats = reportingDbContext.MonthlyWiseTransaction(SourceStoreId);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion


        #region This will give the Billing Dashboard Card Summary Data.
        public string BillingDashboardCardSummary()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataSet dsDashboardCardSummary = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Dashboard_CardSummary", null, reportingDbContext);
                DataTable dtPatientReport = dsDashboardCardSummary.Tables[0];
                DataTable dtIncomeReport = dsDashboardCardSummary.Tables[1];
                DataTable dtBillReturnReport = dsDashboardCardSummary.Tables[2];
                var dashboardCardSummary = new
                {
                    PatientReport = dtPatientReport,
                    IncomeReport = dtIncomeReport,
                    BillReturnReport = dtBillReturnReport,
                };
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dashboardCardSummary;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function gives the Billing Dashboard Rank Wise Patient Invoice Counts
        public string BillingDashboardRankWisePatientInvoiceCount(string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtRankWisePatientInvoiceCount = reportingDbContext.BillingDashboardRankWisePatientInvoiceCount(FromDate, ToDate);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtRankWisePatientInvoiceCount;

            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function gives BillingDashboard Membership Wise Patient Invoice Count
        public string BillingDashboardMembershipWisePatientInvoiceCount(string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtMemberhsipWisePatientInvoiceCount = reportingDbContext.BillingDashboardMembershipWisePatientInvoiceCount(FromDate, ToDate);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtMemberhsipWisePatientInvoiceCount;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard Membership Wise Test Count
        public string LabDashboardMembershipWiseTestCount(string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtLabDashboardMembershipWiseTestCount = reportingDbContext.LabDashboardMembershipWiseTestCount(FromDate, ToDate);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardMembershipWiseTestCount;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard Rank Wise Test Count
        public string LabDashboardRankWiseTestCount(string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtLabDashboardRankWiseTestCount = reportingDbContext.LabDashboardRankWiseTestCount(FromDate, ToDate);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardRankWiseTestCount;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Department Wise RankCount Report
        public string DepartmentWiseRankCountReport(DateTime FromDate, DateTime ToDate, string DepartmentIds, string RankNames)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable departmentWiseRankCountData = reportingDbContext.DepartmentWiseRankCountReport(FromDate, ToDate, DepartmentIds, RankNames);
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = departmentWiseRankCountData;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard Top 10 Trending Test Count
        public string LabDashboardTrendingTestCount(string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtLabDashboardTrendingTestCount = reportingDbContext.LabDashboardTrendingTestCount(FromDate, ToDate);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardTrendingTestCount;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion


        #region This function give LaboratoryDashboard Test Completed Today
        public string LabDashboardTestDoneToday()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtLabDashboardTestDoneToday = reportingDbContext.LabDashboardTestDoneToday();

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardTestDoneToday;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard Dengue Details
        public string LabDashboardDengueTestDetails()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dtLabDashboardDengueDetails = reportingDbContext.LabDashboardDengueTestDetails();

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardDengueDetails;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard For LabReq Detials
        public string LabDashboardLabReqDetails()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();

            try
            {


                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dtLabDashboardLabReqDetails = reportingDbContext.LabDashboardTestReqDetails();

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardLabReqDetails;

            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region This function give LaboratoryDashboard For NormalAbnormalDetails
        public string LabDashboardNormalAbnormalDetails(int labTestId)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();

            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport dtLabDashboardLabNormalAbnormalDetails = reportingDbContext.LabDashboardNormalAbnormalDetails(labTestId);

                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = dtLabDashboardLabNormalAbnormalDetails;

            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message;
            }

            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region  InPatient OutstandingReport
        public string InpatientOutstandingReport(string Operator, decimal? Amount)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable inpatientOutstandingReport = reportingDbContext.InpatientOutstandingReport(Operator, Amount);
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
                responseData.Results = inpatientOutstandingReport;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.Failed;
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion
    }
}

