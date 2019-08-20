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
        public string TotalAdmittedPatient()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.TotalAdmittedPatient();
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
        //Daily Sales Report
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
        #region DistrictWise Report 
        //DistrictWise Report
        public string DistrictWiseAppointmentReport(DateTime FromDate, DateTime ToDate, string CountrySubDivisionName)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport departmentwiseappointment = reportingDbContext.DistrictWiseAppointmentReport(FromDate, ToDate, CountrySubDivisionName);
                responseData.Status = "OK";
                responseData.Results = departmentwiseappointment;
            }
            catch (Exception ex)
            {
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
        public string CategoryWiseLabReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DynamicReport> responseData1 = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport categorywiselabreport = reportingDbContext.CategoryWiseLabReport(FromDate, ToDate);
                responseData1.Status = "OK";
                responseData1.Results = categorywiselabreport;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData1.Status = "Failed";
                responseData1.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData1);
        }
        [DanpheViewFilter("reports-labmain-categorywiselabreport-view")]
        public IActionResult CategoryWiseLabReportView()
        {
            return View("CategoryWiseLabReport");
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
        [DanpheViewFilter("reports-doctorsmain-doctorwiseencounterpatientreport-view")]
        public IActionResult DoctorWisePatientReportView()
        {
            return View("DoctorWisePatientReport");
        }
        #endregion
        #region DepartmentWise Patient Report 
        //DistrictWise Report
        public string DepartmentWiseAppointmentReport(DateTime FromDate, DateTime ToDate, string DepartmentName)
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DynamicReport departmentwiseappointmentReport = reportingDbContext.DepartmentWiseAppointmentReport(FromDate, ToDate, DepartmentName);
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
        [DanpheViewFilter("reports-appointmentmain-departmentwiseappointmentreport-view")]
        public IActionResult DepartmentWiseAppointmentReportView()
        {
            return View("DepartmentWiseAppointmentReport");
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

        #region Appointment Type List
        public string GetAppointmentTypeList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                PatientDbContext patientDb = new PatientDbContext(connString);
                var patientdetail = patientDb.Appointments.Select(s=>s.AppointmentType).Distinct().ToList();

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
                     .Where(itm => itm.BillStatus == "provisional").Sum(itm => itm.TotalAmount);

                double? creditTotAmt = bilDbContext.BillingTransactions
                     .Where(txn => txn.BillStatus == "unpaid").Sum(txn => txn.TotalAmount);

                double? totalDeposit = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == "deposit").Sum(dep => dep.Amount);
                double? totalDeduct = bilDbContext.BillingDeposits.Where(dep => dep.DepositType.ToLower() == "depositdeduct").Sum(dep => dep.Amount);
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

        //public string PatientZoneMap()
        //{
        //    DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
        //    try
        //    {
        //        ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
        //        DynamicReport patZoneMap = reportingDbContext.Home_PatientZoneMap();
        //        responseData.Status = "OK";
        //        responseData.Results = patZoneMap;
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message;
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData);
        //}

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



    }
}
