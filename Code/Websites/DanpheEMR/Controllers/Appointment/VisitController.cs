using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using DanpheEMR.CommonTypes;
using DanpheEMR.Security;
using DanpheEMR.Core;
using DanpheEMR.Controllers.Billing;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.Enums;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using Org.BouncyCastle.Asn1.Ocsp;
using DanpheEMR.ServerModel.BillingModels;
//using Microsoft.EntityFrameworkCore;
using DanpheEMR.ServerModel.AppointmentModels;
using DanpheEMR.Services.SSF;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Rank = DanpheEMR.ServerModel.AppointmentModels.Rank;
using Newtonsoft.Json.Linq;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.Appointment.DTO;
using DanpheEMR.ServerModel.InsuranceModels;
using DanpheEMR.Services.Visits.DTO;
using DanpheEMR.ServerModel.PatientModels;
using System.Data.Entity.Migrations;
using DocumentFormat.OpenXml.Bibliography;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//test for checkin
namespace DanpheEMR.Controllers
{

    public class VisitController : CommonController
    {
        bool realTimeRemoteSyncEnabled = false;
        bool RealTimeSSFClaimBooking = false;
        private DanpheHTTPResponse<object> _objResponseData;
        private readonly VisitDbContext _visitDbContext;
        private readonly CoreDbContext _coreDbContext;
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly BillingDbContext _billingDbContext;
        private readonly PatientDbContext _patDbContext;
        private readonly SSFDbContext _ssfDbContext;

        public VisitController(IOptions<MyConfiguration> _config) : base(_config)
        {
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            RealTimeSSFClaimBooking = _config.Value.RealTimeSSFClaimBooking;
            _visitDbContext = new VisitDbContext(connString);
            _coreDbContext = new CoreDbContext(connString);
            _objResponseData = new DanpheHTTPResponse<object>();
            _objResponseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;//this is for default
            _admissionDbContext = new AdmissionDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
            _patDbContext = new PatientDbContext(connString);
            _ssfDbContext = new SSFDbContext(connString);
        }

        //[HttpGet]
        //[Route("PatientVisitList")]
        //public ActionResult PatientVisitList(string search, DateTime fromDate, DateTime toDate)
        //{
        //    //if (reqType == "pastVisitList")
        //    //{
        //    Func<object> func = () => GetPatientVisitList(search, fromDate, toDate);
        //    return InvokeHttpGetFunction<object>(func);
        //}

        [HttpGet]
        [Route("CheckExistingAppointment")]
        public ActionResult CheckExistingAppointment(DateTime requestDate, int departmentId, int patientId, int inputProviderId)
        {
            //else if (reqType == "CheckIfApptExistForDepartmentOnDate")
            //{
            Func<object> func = () => CheckExistingAppointmentOnDate(requestDate, departmentId, patientId, inputProviderId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("VisitsByClaimCode")]
        public ActionResult VisitsByClaimCode(Int64? claimCode)
        {
            // else if (reqType == "existingClaimCode-VisitList")
            //{
            Func<object> func = () => (from visit in _visitDbContext.Visits.Include("Patient")
                                       select visit)
                           .Where(v => (v.BillingStatus != ENUM_BillingStatus.returned && v.BillingStatus != ENUM_BillingStatus.cancel) && v.ClaimCode == claimCode)
                           .OrderByDescending(v => v.PatientVisitId).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientVisitStickerInfo")]
        public ActionResult PatientVisitStickerInfo(int visitId)
        {
            //else if (reqType != null && reqType == "getVisitInfoforStickerPrint")
            //{
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_VIS_GetVisitStickerSettingsAndData",
            new List<SqlParameter>() { new SqlParameter("@PatientVisitId", visitId) }, _visitDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DepartmentOfIpdVisit")]
        public ActionResult DepartmentOfIpdVisit(int visitId)
        {
            //else if (reqType != null && reqType == "get-requesting-department")
            //{
            Func<object> func = () => (from visit in _visitDbContext.Visits
                                       where visit.PatientVisitId == visitId
                                       select new
                                       {
                                           visit.DepartmentId
                                       }).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientVisitHistory")]
        public ActionResult PatientVisitHistory(int patientId)
        {
            //else if (reqType == "patient-visitHistory")
            //{
            Func<object> func = () => (from visit in _visitDbContext.Visits
                                       where visit.PatientId == patientId && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                       select visit).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientTodaysVisits")]
        public ActionResult PatientTodaysVisits(int patientId)
        {
            //else if (reqType == "patient-visitHistory-today")
            //{
            Func<object> func = () => (from visit in _visitDbContext.Visits
                                       where visit.PatientId == patientId
                                     //DbFunctions.TruncateTime(defaultLastDateToShow)
                                     && DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(DateTime.Now)
                                       && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                       select visit).ToList();
            return InvokeHttpGetFunction<object>(func);
        }
        
        [HttpGet]
        [Route("PatientVisitsWithDoctors")]
        public ActionResult PatientVisitsWithDoctors(int patientId)
        {
            //else if (reqType == "patient-visit-providerWise")
            //{
            Func<object> func = () => GetPatientVisitsWithDoctors(patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientCurrentVisitContext")]
        public ActionResult PatientCurrentVisitContext(int patientId, int visitId)
        {
            //else if (reqType == "patientCurrentVisitContext")
            //{
            Func<object> func = () => GetCurrentVisitContext(patientId, visitId);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("PatientVisitContextForProvisionalPayment")]
        public ActionResult PatientVisitContextForProvisionalPayment(int patientId, int visitId)
        {
            Func<object> func = () => GetPatientVisitContextForProvisionalPayment(patientId, visitId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DoctorNewOpdBillingItems")]
        public ActionResult DoctorNewOpdBillingItems()
        {
            //else if (reqType == "get-doc-opd-prices")
            //{
            Func<object> func = () => GetDoctorNewOpdBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DepartmentNewOpdBillingItems")]
        public ActionResult DepartmentNewOpdBillingItems()
        {
            //else if (reqType == "get-dept-opd-items")
            //{
            Func<object> func = () => GetDepartmentNewOpdBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DoctorFollowupBillingItems")]
        public ActionResult DoctorFollowupBillingItems()
        {
            //else if (reqType == "get-doc-followup-items")
            //{
            Func<object> func = () => GetDoctorFollowupBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DepartmentFollowupBillingItems")]
        public ActionResult DepartmentFollowupBillingItems()
        {
            //else if (reqType == "get-dept-followup-items")
            //{
            Func<object> func = () => GetDepartmentFollowupBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DepartmentOldPatientBillingItems")]
        public ActionResult DepartmentOldPatientBillingItems()
        {
            //else if (reqType == "get-dept-oldpatient-opd-items")
            //{
            Func<object> func = () => GetDepartmentOldPatientBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DoctorOldPatientBillingItems")]
        public ActionResult DoctorOldPatientBillingItems()
        {
            //else if (reqType == "get-doc-oldpatient-opd-items")
            //{
            Func<object> func = () => GetDoctorOldPatientBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("DoctorOpdReferralBillingItems")]
        public ActionResult DoctorOpdReferralBillingItems()
        {
            //else if (reqType == "get-doc-opd-prices")
            //{
            Func<object> func = () => GetDoctorOpdReferralBillingItems();
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("AppointmentApplicableDoctors")]
        public ActionResult AppointmentApplicableDoctors()
        {
            //else if (reqType == "get-visit-doctors")
            //{
            Func<object> func = () => (from emp in _visitDbContext.Employees
                                       where emp.IsActive == true && emp.IsAppointmentApplicable == true//sud:26Feb'19--get only active and AppointmentApplicable doctors.
                                       join dept in _visitDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                       select new
                                       {
                                           DepartmentId = dept.DepartmentId,
                                           DepartmentName = dept.DepartmentName,
                                           PerformerId = emp.EmployeeId,
                                           PerformerName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,

                                       }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("VisitsSignedByDoctor")]
        public ActionResult VisitsSignedByDoctor(int patientId)
        {
            //else if (reqType == "patVisitList")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => (from visit in _visitDbContext.Visits
                                       where visit.PatientId == patientId
                                       && visit.PerformerId == currentUser.EmployeeId
                                       && visit.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                       && visit.IsSignedVisitSummary == true
                                       select new
                                       {
                                           PatientVisitId = visit.PatientVisitId,
                                           PatientVisitCode = visit.VisitCode,
                                           VisitDateTime = visit.VisitDate,
                                           IsSignedVisitSummary = visit.IsSignedVisitSummary
                                       }).OrderByDescending(v => v.VisitDateTime).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientHealthCardWithBillInfo")]
        public ActionResult PatientHealthCardWithBillInfo(int patientId)
        {
            //else if (reqType == "getPatHealthCardStatus")
            //{
            Func<object> func = () => GetPatientHealthCardWithBillInfo(patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ListVisits")]
        public ActionResult ListVisits(string search, int dayslimit, Boolean SearchPatientUsingHospitalNo, Boolean SearchPatientUsingIdCardNo)
        {
            //else if (reqType == "list-visit")
            //{
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_APPT_GetVisitListOfValidDays",
                new List<SqlParameter>() { new SqlParameter("@SearchTxt", search),
                      new SqlParameter("@RowCounts", 200),
                      new SqlParameter("@DaysLimit",dayslimit),
                      new SqlParameter("@SearchUsingHospitalNo",SearchPatientUsingHospitalNo),
                      new SqlParameter("@SearchUsingIdCardNo", SearchPatientUsingIdCardNo)
        }, _visitDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("VisitsByStatus")]
        public ActionResult VisitsByStatus(string status, string search, int dayslimit)
        {
            //default else part of previous Get API
            Func<object> func = () => GetVistByStatus(search, status, dayslimit);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("GetMemberInformationByScheme")]
        public ActionResult MemberInformationByScheme(int schemeId, int patientId)
        {
            Func<object> func = () => GetMemberInformationByScheme(schemeId, patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("GetPatientCreditLimitsByScheme")]
        public ActionResult PatientCreditLimitsByScheme(int schemeId, int patientId, string serviceBillingContext)
        {
            Func<object> func = () => GetPatientCreditLimitsByScheme(schemeId, patientId, serviceBillingContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("GetLatestClaimCode")]
        public ActionResult GetLatestClaimCodeForAutoClaimCodeGeneration(int schemeId)
        {
            Func<object> func = () => GetLatestClaimCode(schemeId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetLatestClaimCode(int schemeId)
        {
            NewClaimCode_DTO newClaimObj = VisitBL.GetLatestClaimCode(_visitDbContext, schemeId);
            return newClaimObj;
        }

        #region Post APIs
        [HttpPost]
        [Route("NewVisit")]
        public ActionResult NewVisit()
        {
            //if (!string.IsNullOrEmpty(reqType) && reqType == "patientVisitCreate")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CreatePatientVisit(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("VisitFromOnlineAppointment")]
        public ActionResult VisitFromOnlineAppointment()
        {
            //if (reqType == "visitCreateForOnlineAppointment")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CreateVisitForOnlineAppointment(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("VisitFromBilling")]
        public ActionResult VisitFromBilling()
        {
            //else if (!string.IsNullOrEmpty(reqType) && reqType == "billing-visits")
            //{
            string str = this.ReadPostData();
            Func<object> func = () => CreateVisitFromBilling(str);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("VisitForFreeReferral")]
        public ActionResult VisitForFreeReferral()
        {
            //else if (!string.IsNullOrEmpty(reqType) && reqType == "free-referral-visit")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CreateVisitForFreeReferral(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("VisitForFreeFollowup")]
        public ActionResult VisitForFreeFollowup()
        {
            //else if (!string.IsNullOrEmpty(reqType) && reqType == "free-followup-visit")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CreateVisitForFreeFollowUp(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("VisitForPaidFollowup")]
        public ActionResult VisitForPaidFollowup()
        {
            //else if (!string.IsNullOrEmpty(reqType) && reqType == "paid-followup-visit")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => VisitCreateForPaidFollowUp(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("DefaultVisitCreate")]
        public ActionResult DefaultVisitCreate()
        {
            //else 
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => DefaultVisitCreate(str, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }


        #endregion Post APIs

        #region Put APIs
        [HttpPut]
        [Route("UpdateBillStatus")]
        public ActionResult UpdateBillStatus()
        {
            //if (reqType == "updateBillStatus")
            //{
            string str = this.ReadPostData();
            string billingStatus = this.ReadQueryStringData("billingStatus");
            Func<object> func = () => UpdateBillingStatus(str, billingStatus);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("UpdateSignedStatus")]
        public ActionResult UpdateSignedStatus()
        {
            //else if (reqType == "updateIsSignedPatientData")
            //{
            int patientVisitId = ToInt(this.ReadQueryStringData("visitId"));
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateSignedStatusOfPatientVisit(patientVisitId, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion Put APIs


        private void GenerateVisitCodeAndSave(VisitDbContext visitDbContext, VisitModel vis, string connString)
        {
            try
            {
                vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                visitDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GenerateVisitCodeAndSave(visitDbContext, vis, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }
        }


        //update IsContinuedStatus in case of referral  and followup
        private void UpdateIsContinuedStatus(int? patientVisitId,
            string appointmentType,
            bool status, int? currentEmployeeId, VisitDbContext dbContext)
        {
            VisitModel dbVisit = dbContext.Visits
                        .Where(v => v.PatientVisitId == patientVisitId)
                        .FirstOrDefault<VisitModel>();
            if (dbVisit != null)
            {
                dbVisit.ModifiedOn = DateTime.Now;
                dbVisit.ModifiedBy = currentEmployeeId;
                //updated: sud-14aug-- visit-continued is set to true for both referral as well as followup.
                if (appointmentType.ToLower() == "referral" || appointmentType.ToLower() == "followup")
                {
                    dbVisit.IsVisitContinued = status;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;

                }
                else if (appointmentType.ToLower() == "transfer")
                {
                    dbVisit.IsVisitContinued = status;
                    dbVisit.IsActive = false;
                    dbContext.Entry(dbVisit).Property(b => b.IsVisitContinued).IsModified = true;
                    dbContext.Entry(dbVisit).Property(b => b.IsActive).IsModified = true;
                }
                dbContext.Entry(dbVisit).Property(b => b.ModifiedOn).IsModified = true;
                dbContext.Entry(dbVisit).Property(b => b.ModifiedBy).IsModified = true;
                dbContext.SaveChanges();
            }
            else
                throw new Exception("Cannot update IsContinuedStatus of ParentVisit.");


        }
        /**Modified: Ashim: 23Aug2018
         * It is called by /Appointment/Visit
         * Handles logic to Post New Patient (if patientId=0), Post Visit, and Post BillingTransaction and Update IsContinuedVisit status.
         * 
         * */
        private object CreatePatientVisit(string strLocal, RbacUser currentUser)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            try
            {
                //VisitDbContext visitDbContext = new VisitDbContext(base.connString);
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                QuickVisitVM quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);

                //check for clashing visit
                if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit.PerformerId, quickVisit.Visit.VisitDate))
                {
                    throw new Exception("Patient already has visit with this provider today.");
                }
                else
                {
                    using (var visitDbTransaction = _visitDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            quickVisit.Patient = AddPatientForVisit(_visitDbContext, quickVisit.Patient, currentUser.EmployeeId);
                            AddPatientCareTaker(_visitDbContext, quickVisit.CareTaker, quickVisit.Patient.PatientId);
                            quickVisit.Visit = AddVisit(_visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId, quickVisit.Patient);
                            string department = GetDepartmentName();
                            if (department != null && quickVisit.Visit.DepartmentName.ToLower() == department.ToLower())
                            {
                                AddEmergencyPatient(_visitDbContext, quickVisit.Visit, currentUser.EmployeeId, quickVisit.Patient);
                            }
                            
                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(_visitDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            VisitBL.SavePatientScheme(_visitDbContext, quickVisit, currentUser, RealTimeSSFClaimBooking, _ssfDbContext);
                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, _visitDbContext);
                            }

                            var scheme = _visitDbContext.BillingSchemes.Where(a => a.SchemeId == quickVisit.Visit.SchemeId).FirstOrDefault();
                            if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                            {
                                VisitBL.UpdateMedicareMemberBalance(_visitDbContext, quickVisit, currentUser.EmployeeId);

                            }

                            visitDbTransaction.Commit();

                            //pratik: 5march'20 ---to generate queue no for every new visit
                            quickVisit.Visit.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, quickVisit.Visit.PatientVisitId, connString);
                        }
                        catch (Exception ex)
                        {
                            visitDbTransaction.Rollback();
                            throw new Exception(ex.Message + " exception details:" + ex.ToString());
                        }
                    }
                }
                return quickVisit;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
        }
        private void AddEmergencyPatient(VisitDbContext visitDbContext, VisitModel currVisit, int currentUserId, PatientModel patient)
        {
            int patientNumber = GetLatestERPatientNum(visitDbContext);
            var emergencyPatientObj = new EmergencyPatientModel
            {
                ERPatientNumber = patientNumber,
                PatientId = patient.PatientId,
                PatientVisitId = currVisit.PatientVisitId,
                VisitDateTime = DateTime.Now,
                FirstName = patient.FirstName,
                MiddleName = patient.MiddleName,
                LastName = patient.LastName,
                Gender = patient.Gender,
                Age = patient.Age,
                DateOfBirth = patient.DateOfBirth,
                ContactNo = patient.PhoneNumber,
                PerformerId = currVisit.PerformerId,
                PerformerName = currVisit.PerformerName,
                Address = patient.Address,
                ERStatus = ENUM_ERStatus.New,
                CreatedBy = currentUserId,
                CreatedOn = DateTime.Now,
                IsActive = true,
                IsExistingPatient = true,
                IsPoliceCase = false,
                OldPatientId = "true"
            };

            visitDbContext.EmergencyPatients.Add(emergencyPatientObj);
            visitDbContext.SaveChanges();

        }

        private int GetLatestERPatientNum(VisitDbContext visitDbContext)
        {
            var allERPatList = (from erpat in visitDbContext.EmergencyPatients
                                select erpat).ToList();
            int latestPatientNum = allERPatList.Count > 0 ? allERPatList.Max(val => val.ERPatientNumber) + 1 : 1;
            return latestPatientNum;

        }
        private string GetDepartmentName()
        {
            try
            {
                using (CoreDbContext coreDbContext = new CoreDbContext(connString))
                {
                    var parameter = coreDbContext.Parameters
                       .FirstOrDefault(a => a.ParameterName == "ERDepartmentName" && a.ParameterGroupName == "Common");
                    if (parameter != null)
                    {
                        string department = parameter.ParameterValue;
                        if (!string.IsNullOrEmpty(department))
                        {
                            return department;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
            }
            return null;
        }
        private object CreateVisitForOnlineAppointment(string strLocal, RbacUser currentUser)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            try
            {
                //VisitDbContext visitDbContext = new VisitDbContext(base.connString);
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                QuickVisitVM quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);

                //check for clashing visit
                if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit.PerformerId, quickVisit.Visit.VisitDate))
                {

                    throw new Exception("Patient already has visit with this provider today.");
                }
                else
                {
                    using (var visitDbTransaction = _visitDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            quickVisit.Patient = AddPatientForVisit(_visitDbContext, quickVisit.Patient, currentUser.EmployeeId);
                            quickVisit.Visit = AddVisit(_visitDbContext, quickVisit.Patient.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId, quickVisit.Patient);
                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(_visitDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            VisitBL.SavePatientScheme(_visitDbContext, quickVisit, currentUser, RealTimeSSFClaimBooking, _ssfDbContext);
                            visitDbTransaction.Commit();
                            quickVisit.Visit.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, quickVisit.Visit.PatientVisitId, connString);
                        }
                        catch (Exception ex)
                        {
                            //responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                            //responseData.Status = "Failed";
                            visitDbTransaction.Rollback();
                            throw new Exception(ex.Message + " exception details:" + ex.ToString());

                        }
                    }
                }
                return quickVisit;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
        }

        //Adding appointment for patient visit      
        private PatientModel AddPatientForVisit(VisitDbContext visitDbContext, PatientModel clientPat, int currentUserId)
        {
            try
            {
                //Krishna/Sud:16March'23--Below logic should be moved elsewhere.. PolicyNo Shouldn't decide PatientId at any cost...

                ////PatientDbContext patDbContext = new PatientDbContext(connString);
                //if (clientPat.PatientScheme.PolicyNo != null)
                //{
                //    var ssfPatientScheme = visitDbContext.PatientSchemes.Where(a => a.PolicyNo == clientPat.PatientScheme.PolicyNo).FirstOrDefault();
                //    if (ssfPatientScheme != null)
                //    {
                //        clientPat.PatientId = (int)ssfPatientScheme.PatientId;
                //        clientPat.PatientCode = ssfPatientScheme.PatientCode;
                //    }
                //}

                //create patient and save if not registered. else get patient details from id.
                if (clientPat.PatientId == 0)
                {
                    clientPat.EMPI = PatientBL.CreateEmpi(clientPat, connString);
                    //sud:10Apr'19--To centralize patient number and Patient code logic.
                    //NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                    //clientPat.PatientNo = newPatientNumber.PatientNo;
                    //clientPat.PatientCode = newPatientNumber.PatientCode;

                    //clientPat.PatientNo = PatientBL.GetNewPatientNo(connString);
                    //clientPat.PatientCode = PatientBL.GetPatientCode(clientPat.PatientNo.Value, connString);

                    //clientPat.CreatedOn = DateTime.Now;
                    //clientPat.CreatedBy = currentUserId;
                    //visitDbContext.Patients.Add(clientPat);
                    //this save is used to get patientid and using that patientid we are creating patientcode
                    //visitDbContext.SaveChanges();
                    clientPat.CreatedBy = currentUserId;
                    clientPat.CreatedOn = DateTime.Now;

                    clientPat = CreateOPBillingPatient(visitDbContext, clientPat, connString); //Krishna,18th,Jul'22 , This function will register a patient(handling duplictae PatientNo i.e. It will be recursive until the unique
                }
                else if (clientPat.PatientId > 0)
                {
                    visitDbContext.Patients.Attach(clientPat);
                    visitDbContext.Entry(clientPat).Property(x => x.Address).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.MunicipalityId).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.PhoneNumber).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.Rank).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.Posting).IsModified = true;
                    //visitDbContext.Entry(clientPat).Property(x => x.MembershipTypeId).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.DependentId).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.IDCardNumber).IsModified = true;
                    visitDbContext.Entry(clientPat).Property(x => x.EthnicGroup).IsModified = true;
                    clientPat.ModifiedOn = System.DateTime.Now;
                    clientPat.ModifiedBy = currentUserId;
                    visitDbContext.SaveChanges();
                }
                return clientPat;

            }
            catch (Exception ex) { throw ex; }
        }

        private PatientModel CreateOPBillingPatient(VisitDbContext visitDbContext, PatientModel clientPat, string connString)
        {
            try
            {
                NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);
                clientPat.PatientNo = newPatientNumber.PatientNo;
                clientPat.PatientCode = newPatientNumber.PatientCode;
                visitDbContext.Patients.Add(clientPat);
                visitDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is System.Data.Entity.Infrastructure.DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {
                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            CreateOPBillingPatient(visitDbContext, clientPat, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }

            return clientPat;
        }
        private void AddPatientCareTaker(VisitDbContext visitDbContext, PatientCareTaker_DTO patientCareTaker, int patientId)
        {
            if (patientCareTaker != null)
            {
                var careTakerInfo = visitDbContext.Guarantor.Where(x=>x.PatientId==patientId).FirstOrDefault();
                if (careTakerInfo != null)
                {
                    careTakerInfo.GuarantorName = patientCareTaker.CareTakerName;
                    careTakerInfo.PatientRelationship = patientCareTaker.RelationWithPatient;
                    careTakerInfo.GuarantorPhoneNumber = patientCareTaker.CareTakerContact;

                    visitDbContext.Entry(careTakerInfo).State = EntityState.Modified;                    
                }
                else
                {
                    var newCareTakerInfo = new GuarantorModel
                    {
                       PatientId =patientId,
                        GuarantorName = patientCareTaker.CareTakerName,
                        PatientRelationship = patientCareTaker.RelationWithPatient,
                        GuarantorPhoneNumber = patientCareTaker.CareTakerContact,
                    };

                    visitDbContext.Guarantor.Add(newCareTakerInfo);
                }

                visitDbContext.SaveChanges();
            }
        }


        //Adding visit for patient visit   
        private VisitModel AddVisit(VisitDbContext visitDbContext, int currPatientId, VisitModel currVisit, BillingTransactionModel billTxn, int currentUserId, PatientModel patient)
        {
            try
            {
                var schemeObj = new BillingSchemeModel();

                if (billTxn != null)
                {
                    schemeObj = _visitDbContext.BillingSchemes.Where(a => a.SchemeId == currVisit.SchemeId).FirstOrDefault();
                }

                //Krishna, 22Jan'23, this will generate ClaimCode..
                var creditOrganization = visitDbContext.CreditOrganizations.FirstOrDefault(a => a.OrganizationId == billTxn.OrganizationId);

                var INSParameter = _visitDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Insurance" && a.ParameterName == "ClaimCodeAutoGenerateSettings").FirstOrDefault().ParameterValue;
                var claimcodeParameter = Newtonsoft.Json.Linq.JObject.Parse(INSParameter);
                var EnableAutoGenerate = Convert.ToBoolean(claimcodeParameter["EnableAutoGenerate"]);
                int SchemeId = Convert.ToInt32(claimcodeParameter["SchemeId"]);

                if (creditOrganization != null && creditOrganization.IsClaimCodeAutoGenerate && EnableAutoGenerate && SchemeId == currVisit.SchemeId)
                {
                    NewClaimCode_DTO newClaimObj = VisitBL.GetLatestClaimCode(_visitDbContext, currVisit.SchemeId);
                    currVisit.ClaimCode = newClaimObj.NewClaimCode;
                }
                else
                {
                    if(creditOrganization != null && creditOrganization.IsClaimManagementApplicable && creditOrganization.IsClaimCodeCompulsory && creditOrganization.IsClaimCodeAutoGenerate && patient.PatientScheme.LatestClaimCode == null)
                    {
                        currVisit.ClaimCode = GenerateClaimCode(visitDbContext, currPatientId, patient);
                    }

                    if (creditOrganization != null && creditOrganization.IsClaimManagementApplicable && creditOrganization.IsClaimCodeCompulsory && !creditOrganization.IsClaimCodeAutoGenerate && patient.PatientScheme.LatestClaimCode != null)
                    {
                        currVisit.ClaimCode = patient.PatientScheme.LatestClaimCode;
                    }

                    if (creditOrganization != null && creditOrganization.IsClaimManagementApplicable && !creditOrganization.IsClaimCodeCompulsory && !creditOrganization.IsClaimCodeAutoGenerate && patient.PatientScheme.LatestClaimCode != null)
                    {
                        currVisit.ClaimCode = patient.PatientScheme.LatestClaimCode;
                    }
                }

                currVisit.CreatedBy = currentUserId;
                currVisit.CreatedOn = DateTime.Now;
                currVisit.VisitType = currVisit.VisitType;
                currVisit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
                currVisit.SubSchemeId = patient.PatientScheme.SubSchemeId;
                if (billTxn != null && billTxn.PaymentMode == ENUM_BillPaymentMode.credit)
                {
                    currVisit.BillingStatus = ENUM_BillingStatus.unpaid;
                }
                else
                {
                    currVisit.BillingStatus = ENUM_BillingStatus.paid;// "paid";
                }
                currVisit.PatientId = currPatientId;
                visitDbContext.Visits.Add(currVisit);
                GeneratePatientVisitCodeAndSave(visitDbContext, currVisit, connString);
                return currVisit;

            }
            catch (Exception ex) { throw ex; }
        }

        private static Int64? GenerateClaimCode(VisitDbContext visitDbContext, int currPatientId, PatientModel patient)
        {
            // logic to find the last visit of the patient
            //var previousVisitContext = visitDbContext.Visits.Where(a => a.PatientId == currPatientId).OrderByDescending(a => a.PatientVisitId).FirstOrDefault();
            //if (previousVisitContext != null)
            //{
            //    //if (DateTime.Now.Date == previousVisitContext.CreatedOn.Date && (patient.PatientScheme.PolicyNo != null && VisitBL.IsClaimed(visitDbContext, patient.PatientScheme.LatestClaimCode, currPatientId) == false))
            //    //{
            //    //    return patient.PatientScheme.LatestClaimCode;
            //    //}
            //    //else
            //    //{
            //    //    Random generator = new Random();
            //    //    String r = generator.Next(1, 10000).ToString("D4");
            //    //    return Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
            //    //}
            //    Random generator = new Random();
            //    String r = generator.Next(1, 10000).ToString("D4");
            //    return Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
            //}
            //else
            //{
            //    Random generator = new Random();
            //    String r = generator.Next(1, 10000).ToString("D4");
            //    return Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
            //}

            Random generator = new Random();
            String r = generator.Next(1, 10000).ToString("D4");
            return Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
        }

        private void GeneratePatientVisitCodeAndSave(VisitDbContext visitDbContext, VisitModel currVisit, string connString)
        {
            try
            {
                if (currVisit.VisitType == ENUM_VisitType.outpatient)
                    currVisit.VisitCode = VisitBL.CreateNewPatientVisitCode(currVisit.VisitType, connString);//"V" + (newVisit.PatientVisitId + 100000);
                else
                    currVisit.VisitCode = VisitBL.CreateNewPatientVisitCode(currVisit.VisitType, connString); //"H" + (newVisit.PatientVisitId + 100000);
                visitDbContext.SaveChanges();
            }
            catch (Exception ex)
            {

                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GeneratePatientVisitCodeAndSave(visitDbContext, currVisit, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }
        }


        [HttpGet]
        [Route("GetDependentIdDetails")]
        public async Task<IActionResult> GetDependentIdDetails(string dependentId)
        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var patientsUnderDependents = await visitDbContext.Patients.Where(a => a.DependentId == dependentId).ToListAsync();
                var dependent = await visitDbContext.Patients.Where(a => a.IDCardNumber == dependentId).FirstOrDefaultAsync();

                var result = new
                {
                    patientsUnderDependents,
                    dependent
                };

                responseData.Results = result;
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.ErrorMessage = ex.Message.ToString();
            }
            return Ok(responseData);
        }

        [HttpPut]
        [Route("UpdateDendentId")]
        public async Task<IActionResult> UpdateDendentId(string dependentId, int patientId)
        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var count = await visitDbContext.Patients.Where(a => a.DependentId == dependentId).ToListAsync();
                if (count.Count() >= 3)
                {
                    responseData.ErrorMessage = "Unable to update Dependent Id because It already exisits " + count.Count() + " times in your system.";
                    responseData.Status = "Failed";
                }
                else
                {
                    var result = await visitDbContext.Patients.Where(a => a.PatientId == patientId).FirstOrDefaultAsync();
                    result.DependentId = dependentId;
                    visitDbContext.SaveChanges();
                    responseData.Results = result;
                    responseData.Status = "OK";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message.ToString();
            }
            return Ok(responseData);
        }
        //Adding billing for patient Visit
        private BillingTransactionModel AddBillingTransactionForPatientVisit(VisitDbContext
            visitDbContext,
            BillingTransactionModel
            clientTransaction,
            int PatientId,
            VisitModel currVisit,
            int currentUserId)
        {
            try
            {
                if (clientTransaction.BillingTransactionItems != null && clientTransaction.BillingTransactionItems.Count > 0)
                {
                    BillingFiscalYear fiscYr = BillingBL.GetFiscalYear(connString);
                    clientTransaction.FiscalYearId = fiscYr.FiscalYearId;
                    clientTransaction.FiscalYear = fiscYr.FiscalYearFormatted;
                    clientTransaction.ClaimCode = currVisit.ClaimCode; // assigning ClaimCode for invoices
                    if (clientTransaction.IsInsuranceBilling == true)
                        clientTransaction.InvoiceCode = "INS";
                    else
                        clientTransaction.InvoiceCode = "BL";
                    //clientTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);

                    clientTransaction.CreatedOn = DateTime.Now;
                    clientTransaction.CreatedBy = currentUserId;
                    clientTransaction.PatientId = PatientId;
                    clientTransaction.PatientVisitId = currVisit.PatientVisitId;
                    if (clientTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
                    {
                        clientTransaction.PaidAmount = clientTransaction.TotalAmount;
                        clientTransaction.PaidCounterId = clientTransaction.CounterId;
                        clientTransaction.PaidDate = clientTransaction.CreatedOn;
                        clientTransaction.PaymentReceivedBy = currentUserId;
                        clientTransaction.ReceivedAmount = (decimal)clientTransaction.ReceivedAmount;

                    }


                    ////get all ServiceDepts related to Visit/Appointment etc.. 
                    //List<ServiceDepartmentModel> visitServiceDepts = visitDbContext.ServiceDepartments
                    //    .Where(s => (!string.IsNullOrEmpty(s.IntegrationName)) && s.IntegrationName.ToLower() == "opd").ToList();


                    clientTransaction.BillingTransactionItems.ForEach(txnItem =>
                    {
                        txnItem.CreatedOn = clientTransaction.CreatedOn;
                        txnItem.CreatedBy = clientTransaction.CreatedBy;
                        txnItem.PatientId = clientTransaction.PatientId;
                        txnItem.PatientVisitId = clientTransaction.PatientVisitId;
                        txnItem.RequisitionDate = clientTransaction.CreatedOn;
                        txnItem.VisitType = currVisit.VisitType;
                        txnItem.PerformerId = txnItem.PerformerId > 0 ? txnItem.PerformerId : null;
                        txnItem.PrescriberId = txnItem.PrescriberId > 0 ? txnItem.PrescriberId : null;
                        //if (txnItem.ItemName == "consultation charges")
                        //   
                        //if (txnItem.ItemName != "Health Card")
                        //    txnItem.RequisitionId = clientTransaction.PatientVisitId;
                        txnItem.CounterDay = clientTransaction.CreatedOn;
                        txnItem.CounterId = clientTransaction.CounterId;



                        ServiceDepartmentModel srvDept = visitDbContext.ServiceDepartments.Where(s => s.ServiceDepartmentName == txnItem.ServiceDepartmentName).FirstOrDefault();

                        if (srvDept != null)
                        {
                            txnItem.ServiceDepartmentId = srvDept.ServiceDepartmentId;

                            //If integrationName is opd then we should add requisition id as patientvisitid.
                            if ((!string.IsNullOrEmpty(srvDept.IntegrationName)) && srvDept.IntegrationName.ToLower() == "opd")
                            {
                                txnItem.RequisitionId = clientTransaction.PatientVisitId;
                            }
                        }

                        if (clientTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
                        {
                            txnItem.PaidCounterId = clientTransaction.PaidCounterId;
                            txnItem.PaidDate = clientTransaction.PaidDate;
                            txnItem.PaymentReceivedBy = clientTransaction.PaymentReceivedBy;
                        }
                        else
                        {
                            txnItem.BillStatus = ENUM_BillingStatus.unpaid;
                        }
                        VisitBL.UpdateRequisitionItemsBillStatus(visitDbContext, txnItem.ServiceDepartmentName, "paid", currentUserId, txnItem.RequisitionId, DateTime.Now);
                    });

                    //sud:4May'21--below code is not used anywhere
                    //if (clientTransaction.IsInsuranceBilling == true)
                    //{
                    //    BillingBL.UpdateInsuranceCurrentBalance(connString,
                    //        clientTransaction.PatientId,
                    //        clientTransaction.InsuranceProviderId ?? default(int),
                    //        currentUserId, clientTransaction.TotalAmount ?? default(int), true);

                    //}

                    visitDbContext.AuditDisabled = false;
                    visitDbContext.BillingTransactions.Add(clientTransaction);
                    GenerateInvoiceNoAndSaveInvoice(visitDbContext, clientTransaction, connString); //to avoid duplicate invoiceNo..
                                                                                                    //visitDbContext.SaveChanges();


                    if (clientTransaction.PaymentMode == ENUM_BillPaymentMode.credit)
                    {
                        BillingTransactionCreditBillStatusModel billingTransactionCreditBillStatus = new BillingTransactionCreditBillStatusModel();

                        billingTransactionCreditBillStatus.BillingTransactionId = clientTransaction.BillingTransactionId;
                        billingTransactionCreditBillStatus.FiscalYearId = clientTransaction.FiscalYearId;
                        billingTransactionCreditBillStatus.InvoiceNoFormatted = $"{clientTransaction.FiscalYear}-{clientTransaction.InvoiceCode}{clientTransaction.InvoiceNo}";
                        billingTransactionCreditBillStatus.InvoiceDate = (DateTime)clientTransaction.CreatedOn;
                        billingTransactionCreditBillStatus.PatientVisitId = (int)clientTransaction.PatientVisitId;
                        billingTransactionCreditBillStatus.SchemeId = clientTransaction.SchemeId;
                        billingTransactionCreditBillStatus.LiableParty = clientTransaction.OrganizationId is null ? "SELF" : "Organization";
                        billingTransactionCreditBillStatus.PatientId = clientTransaction.PatientId;
                        billingTransactionCreditBillStatus.CreditOrganizationId = (int)clientTransaction.OrganizationId;
                        billingTransactionCreditBillStatus.MemberNo = clientTransaction.MemberNo;
                        billingTransactionCreditBillStatus.SalesTotalBillAmount = (decimal)clientTransaction.TotalAmount;
                        //billingTransactionCreditBillStatus.SalesCreditAmount = (decimal)billingTransaction.TotalAmount;
                        billingTransactionCreditBillStatus.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
                        billingTransactionCreditBillStatus.ReturnTotalBillAmount = 0; //This will come if bill is returned
                                                                                      //billingTransactionCreditBillStatus.ReturnCreditAmount = 0; //This will come if bill is returned
                        billingTransactionCreditBillStatus.CoPayReceivedAmount = clientTransaction.ReceivedAmount;
                        billingTransactionCreditBillStatus.CoPayReturnAmount = 0;
                        billingTransactionCreditBillStatus.NetReceivableAmount = billingTransactionCreditBillStatus.SalesTotalBillAmount - billingTransactionCreditBillStatus.CoPayReceivedAmount - (billingTransactionCreditBillStatus.ReturnTotalBillAmount - billingTransactionCreditBillStatus.CoPayReturnAmount);
                        billingTransactionCreditBillStatus.CreatedBy = clientTransaction.CreatedBy;
                        billingTransactionCreditBillStatus.NonClaimableAmount = 0;
                        billingTransactionCreditBillStatus.IsClaimable = true;
                        billingTransactionCreditBillStatus.ClaimCode = clientTransaction.ClaimCode;
                        billingTransactionCreditBillStatus.CreatedOn = (DateTime)clientTransaction.CreatedOn;
                        billingTransactionCreditBillStatus.IsActive = true;

                        visitDbContext.BillingTransactionCreditBillStatuses.Add(billingTransactionCreditBillStatus);
                        visitDbContext.SaveChanges();
                    }

                    //Yubraj: 28th June '19 //to get Billing UserName 
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    visitDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                    visitDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);
                    clientTransaction.BillingUserName = currentUser.UserName;

                    if (clientTransaction.BillStatus == ENUM_BillingStatus.paid || clientTransaction.IsCoPayment == true)
                    { //add to Empcashtransactions if the billstatus is paid, not needed for unpaid(credit).
                        List<EmpCashTransactionModel> empCashTransactionModel = new List<EmpCashTransactionModel>();
                        for (int i = 0; i < clientTransaction.EmployeeCashTransaction.Count; i++)
                        {
                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_EMP_CashTransactinType.CashSales;
                            empCashTransaction.ReferenceNo = clientTransaction.BillingTransactionId;
                            empCashTransaction.InAmount = clientTransaction.EmployeeCashTransaction[i].InAmount;
                            empCashTransaction.OutAmount = 0;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = clientTransaction.CounterId;
                            empCashTransaction.PatientId = clientTransaction.PatientId;
                            empCashTransaction.ModuleName = clientTransaction.EmployeeCashTransaction[i].ModuleName;
                            empCashTransaction.PaymentModeSubCategoryId = clientTransaction.EmployeeCashTransaction[i].PaymentModeSubCategoryId;
                            empCashTransactionModel.Add(empCashTransaction);
                        }

                        //BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);
                        VisitBL.AddEmpCashtransactions(visitDbContext, empCashTransactionModel);
                    }

                    visitDbContext.AuditDisabled = true;

                    //sync transcation data to IRD or any other remote server.
                    if (realTimeRemoteSyncEnabled)
                    {
                        //passing null from here as we don't want to creat another billingdb context inside of it..
                        //this will be handled inside BillingBL's function. 
                        DanpheEMR.Controllers.VisitBL.SyncBillToRemoteServer(clientTransaction, "sales", visitDbContext);
                    }
                }
                else
                {
                    throw new Exception("BillingTransactionItem not found.");
                }
                return clientTransaction;
            }
            catch (Exception ex)
            {

                throw ex;

            }
        }

        //krishna, 5th,Jan,2022: Avoids the duplicate invoiceNo..
        private static void GenerateInvoiceNoAndSaveInvoice(VisitDbContext dbContext, BillingTransactionModel clientTransaction, string connString)
        {
            try
            {
                clientTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                //if(invoiceNoTest == 1) { clientTransaction.InvoiceNo = 258017; invoiceNoTest++; }//logic to test the duplicate invoice no and retry to get the latest invoiceNo
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GenerateInvoiceNoAndSaveInvoice(dbContext, clientTransaction, connString);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;

            }
        }

        //sud: 26June'19-- for followup visit. 
        private object VisitCreateForPaidFollowUp(string strLocal, RbacUser currentUser)
        {
            DanpheHTTPResponse<QuickVisitVM> responseData = new DanpheHTTPResponse<QuickVisitVM>();
            QuickVisitVM quickVisit = null;
            try
            {
                //VisitDbContext visitDbContext = new VisitDbContext(base.connString);
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                quickVisit = DanpheJSONConvert.DeserializeObject<QuickVisitVM>(strLocal);


                //check for clashing visit
                if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, quickVisit.Visit.PatientId, quickVisit.Visit.PerformerId, quickVisit.Visit.VisitDate))
                {
                    throw new Exception("Patient already has visit with this provider today.");
                }
                else
                {
                    using (var visitDbTransaction = _visitDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //quickVisit.Patient = AddPatientForVisit(visitDbContext, quickVisit.Patient, currentUser.EmployeeId);

                            quickVisit.Visit = AddVisit(_visitDbContext, quickVisit.Visit.PatientId, quickVisit.Visit, quickVisit.BillingTransaction, currentUser.EmployeeId, quickVisit.Patient);

                            quickVisit.BillingTransaction = AddBillingTransactionForPatientVisit(_visitDbContext,
                                quickVisit.BillingTransaction,
                                quickVisit.Visit.PatientId,
                                 quickVisit.Visit,
                                currentUser.EmployeeId);
                            //if (quickVisit.Visit.AppointmentType.ToLower() == "transfer" || quickVisit.Visit.AppointmentType.ToLower() == "referral" || quickVisit.Visit.AppointmentType.ToLower() == "followup")
                            if (quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower()
                                || quickVisit.Visit.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower())

                            {
                                UpdateIsContinuedStatus(quickVisit.Visit.ParentVisitId, quickVisit.Visit.AppointmentType, true, currentUser.EmployeeId, _visitDbContext);
                            }
                            visitDbTransaction.Commit();
                            quickVisit.Visit.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, quickVisit.Visit.PatientVisitId, connString);
                        }
                        catch (Exception ex)
                        {
                            visitDbTransaction.Rollback();
                            throw new Exception(ex.Message + " exception details:" + ex.ToString());
                        }
                    }
                }
                return quickVisit;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                throw ex;
            }
        }

        [HttpGet]
        [Route("GetRank")]
        public IActionResult GetRank()

        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var ranks = visitDbContext.Ranks.Where(r => r.IsActive == true).ToList();
                responseData.Status = "OK";
                responseData.Results = ranks;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message.ToString();
            }
            return Ok(responseData);
        }

        [HttpPost]
        [Route("PostRank")]
        public IActionResult PostRank([FromBody] RankNameDTO rankNameDTO)
        {
            VisitDbContext visitDbContext = new VisitDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            bool isPostExist = visitDbContext.Ranks.Any(r => r.RankName == rankNameDTO.Rank);
            if (isPostExist)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = "Rank already exists";
            }
            else
            {
                var rank = new Rank();
                rank.RankName = rankNameDTO.Rank;
                rank.IsActive = true;
                visitDbContext.Ranks.Add(rank);
                visitDbContext.SaveChanges();
                responseData.Status = "OK";
                responseData.Results = rank;
            }
            return Ok(responseData);
        }


        private object CheckExistingAppointmentOnDate(DateTime requestDate, int departmentId, int patientId, int inputProviderId)
        {
            var isDeparmentLevelVisit = _coreDbContext.Parameters.Where(a => a.ParameterGroupName.ToLower() == "visit" && a.ParameterName == "EnableDepartmentLevelAppointment").Select(a => a.ParameterValue).FirstOrDefault();
            var visitItem = _visitDbContext.Visits.Where(v => (DbFunctions.TruncateTime(v.VisitDate) == DbFunctions.TruncateTime(requestDate.Date)) && (v.DepartmentId == departmentId) && (v.PatientId == patientId && v.BillingStatus.ToLower() != ENUM_BillingStatus.returned && v.BillingStatus.ToLower() != ENUM_BillingStatus.cancel)).AsEnumerable();
            if (isDeparmentLevelVisit == "false")
                visitItem = _visitDbContext.Visits.Where(v => (DbFunctions.TruncateTime(v.VisitDate) == DbFunctions.TruncateTime(requestDate.Date)) && (v.PerformerId == inputProviderId) && (v.PatientId == patientId && v.BillingStatus.ToLower() != ENUM_BillingStatus.returned && v.BillingStatus.ToLower() != ENUM_BillingStatus.cancel)).AsEnumerable();
            if (visitItem.Any())
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        private object GetPatientVisitsWithDoctors(int patientId)
        {
            var currentDate = DateTime.Now;
            int maximumLastVisitDays = GetMaximumLastVisitDays();
            var maxLastVisitDate = currentDate.AddDays(-maximumLastVisitDays);
            var patAllVisits = (from v in _visitDbContext.Visits
                                join doc in _visitDbContext.Employees
                                                     on v.PerformerId equals doc.EmployeeId
                                where v.PatientId == patientId && v.BillingStatus != ENUM_BillingStatus.returned // "returned"
                                && DbFunctions.TruncateTime(v.VisitDate) >= DbFunctions.TruncateTime(maxLastVisitDate)
                                group new { v, doc } by new { v.PerformerId, doc.FirstName, doc.MiddleName, doc.LastName, doc.Salutation, v.ReferredById } into patVis
                                select new
                                {
                                    PatientVisitId = patVis.Max(a => a.v.PatientVisitId),
                                    PatientId = patientId,
                                    PerformerId = patVis.Key.PerformerId,
                                    PerformerName = (string.IsNullOrEmpty(patVis.Key.Salutation) ? "" : patVis.Key.Salutation + ". ") + patVis.Key.FirstName + " " + (string.IsNullOrEmpty(patVis.Key.MiddleName) ? "" : patVis.Key.MiddleName + " ") + patVis.Key.LastName,
                                    ReferredById = patVis.Key.ReferredById
                                }).OrderByDescending(v => v.PatientVisitId).ToList();

            return patAllVisits;
        }

        private object GetCurrentVisitContext(int patientId, int visitId)
        {

            var data = (from bedInfo in _admissionDbContext.PatientBedInfos
                        join bedFeat in _admissionDbContext.BedFeatures on bedInfo.BedFeatureId equals bedFeat.BedFeatureId
                        join bed in _admissionDbContext.Beds on bedInfo.BedId equals bed.BedId
                        join ward in _admissionDbContext.Wards on bedInfo.WardId equals ward.WardId
                        join adm in _admissionDbContext.Admissions on bedInfo.PatientVisitId equals adm.PatientVisitId
                        join patMap in _admissionDbContext.PatientSchemeMaps on adm.PatientVisitId equals patMap.LatestPatientVisitId
                        into grp
                        from patientScheme in grp.DefaultIfEmpty()
                        where adm.PatientId == patientId && adm.AdmissionStatus == "admitted"
                        select new
                        {
                            bedFeat.BedFeatureName,
                            adm.PatientVisitId,
                            ward.WardName,
                            bed.BedNumber,
                            bed.BedCode,
                            adm.AdmittingDoctorId,
                            bedInfo.StartedOn,
                            adm.AdmissionDate,
                            adm.Visit.SchemeId,
                            adm.Visit.PriceCategoryId,
                            RequestingDepartmentId = adm.AdmittingDoctorId != null ? (from emp in _admissionDbContext.Employees where emp.EmployeeId == adm.AdmittingDoctorId select emp.DepartmentId).FirstOrDefault() : bedInfo.RequestingDeptId,
                            patientScheme.PolicyNo,
                        }).OrderByDescending(a => a.StartedOn).FirstOrDefault();

            if (data != null)
            {
                var results = new
                {
                    PatientId = patientId,
                    PatientVisitId = data.PatientVisitId,
                    BedFeatureName = data.BedFeatureName,
                    BedNumber = data.BedNumber,
                    BedCode = data.BedCode,
                    PerformerId = data.AdmittingDoctorId,
                    PerformerName = VisitBL.GetProviderName(data.AdmittingDoctorId, base.connString),
                    Current_WardBed = data.WardName,
                    VisitType = "inpatient",
                    AdmissionDate = data.AdmissionDate,
                    VisitDate = data.AdmissionDate,//sud:14Mar'19--needed in Billing
                    SchemeId = data.SchemeId,
                    PriceCategoryId = data.PriceCategoryId,
                    RequestingDepartmentId = data.RequestingDepartmentId,
                    MemberNo = data.PolicyNo
                };
                return results;
            }
            else
            {
                var patVisitInfo = (from vis in _visitDbContext.Visits
                                    join patMap in _visitDbContext.PatientSchemeMaps on vis.PatientVisitId equals patMap.LatestPatientVisitId into grp
                                    from patientScheme in grp.DefaultIfEmpty()
                                    where vis.PatientId == patientId && (visitId > 0 ? vis.PatientVisitId == visitId : true)
                                    select new
                                    {
                                        vis.PatientId,
                                        vis.PatientVisitId,
                                        vis.PerformerId,
                                        PerformerName = "",
                                        vis.VisitType,
                                        vis.VisitDate,
                                        vis.ClaimCode,
                                        patientScheme.PolicyNo,
                                        vis.SchemeId,
                                        vis.PriceCategoryId,
                                        vis.DepartmentId
                                    }).OrderByDescending(a => a.VisitDate).FirstOrDefault();
                if (patVisitInfo != null)
                {
                    if (patVisitInfo.VisitType.ToLower() == "outpatient")
                    {
                        var results = new
                        {
                            PatientId = patVisitInfo.PatientId,
                            PatientVisitId = patVisitInfo.PatientVisitId,
                            PerformerId = patVisitInfo.PerformerId,
                            PerformerName = VisitBL.GetProviderName(patVisitInfo.PerformerId, base.connString),
                            Current_WardBed = "outpatient",
                            VisitType = "outpatient",
                            AdmissionDate = (DateTime?)null,
                            VisitDate = patVisitInfo.VisitDate,//sud:14Mar'19--needed in Billing
                            ClaimCode = patVisitInfo.ClaimCode,
                            MemberNo = patVisitInfo.PolicyNo,
                            SchemeId = patVisitInfo.SchemeId,
                            PriceCategoryId = patVisitInfo.PriceCategoryId,
                            RequestingDepartmentId = patVisitInfo.DepartmentId
                        };
                        return results;
                    }
                    else if (patVisitInfo.VisitType.ToLower() == "emergency")
                    {
                        var results = new
                        {
                            PatientId = patVisitInfo.PatientId,
                            PatientVisitId = patVisitInfo.PatientVisitId,
                            PerformerId = patVisitInfo.PerformerId,
                            PerformerName = VisitBL.GetProviderName(patVisitInfo.PerformerId, base.connString),
                            Current_WardBed = "emergency",
                            VisitType = "emergency",
                            AdmissionDate = (DateTime?)null,
                            VisitDate = patVisitInfo.VisitDate,//sud:14Mar'19--needed in Billing
                            ClaimCode = patVisitInfo.ClaimCode,
                            MemberNo = patVisitInfo.PolicyNo,
                            SchemeId = patVisitInfo.SchemeId,
                            PriceCategoryId = patVisitInfo.PriceCategoryId,
                            RequestingDepartmentId = patVisitInfo.DepartmentId
                        };
                        return results;
                    }
                }
                else
                {
                    var results = new
                    {
                        PatientId = patientId,
                        PatientVisitId = (int?)null,
                        PerformerId = (int?)null,
                        PerformerName = (string)null,
                        Current_WardBed = "outpatient",
                        VisitType = "outpatient",
                        AdmissionDate = (DateTime?)null,
                        VisitDate = (DateTime?)null,//sud:14Mar'19--needed in Billing
                        MemberNo = "",
                        SchemeId = 0,
                        PriceCategoryId = 0
                    };
                    return results;
                }
            }
            return null;
        }

        private object GetDoctorNewOpdBillingItems()
        {
            /*Logic Used:
              * IsActive and IsAppointmentApplicable should be true for Current Employee
              * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
              * Join ServiceItemId with EMP_Employee.OpdNewPatientServiceItemId  column (IMPORTANT)
             */

            var docNewOpdItems = (from emp in _visitDbContext.Employees
                                  where emp.IsActive == true && emp.IsAppointmentApplicable == true
                                  join dept in _visitDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                  join srvItm in _visitDbContext.BillServiceItems
                                  on emp.OpdNewPatientServiceItemId equals srvItm.ServiceItemId//Don't Miss this Column
                                  join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                  join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                  where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                  select new OpdServiceItemPrice_DTO
                                  {
                                      DepartmentId = dept.DepartmentId,
                                      DepartmentName = dept.DepartmentName,
                                      ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                      ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                      ServiceItemId = srvItm.ServiceItemId,
                                      PerformerId = emp.EmployeeId,
                                      PerformerName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                      PriceCategoryId = itmPrice.PriceCategoryId,
                                      ItemCode = itmPrice.ItemLegalCode,
                                      ItemName = itmPrice.ItemLegalName,
                                      Price = itmPrice.Price,
                                      IsTaxApplicable = srvItm.IsTaxApplicable,
                                      IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed,
                                      IsDiscountApplicable = itmPrice.IsDiscountApplicable
                                  }).ToList();
            return docNewOpdItems;
        }

        private List<OpdServiceItemPrice_DTO> GetDoctorFollowupBillingItems()
        {
            /*Logic Used:
            * IsActive and IsAppointmentApplicable should be true for Current Employee
            * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
            * Join ServiceItemId with EMP_Employee.FollowupServiceItemId  column (IMPORTANT)
           */

            var docFollowUpItems = (from emp in _visitDbContext.Employees
                                    where emp.IsActive == true && emp.IsAppointmentApplicable == true
                                    join dept in _visitDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                    join srvItm in _visitDbContext.BillServiceItems on emp.FollowupServiceItemId equals srvItm.ServiceItemId
                                    join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                    join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                    where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                    select new OpdServiceItemPrice_DTO
                                    {
                                        DepartmentId = dept.DepartmentId,
                                        DepartmentName = dept.DepartmentName,
                                        ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                        ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                        ServiceItemId = srvItm.ServiceItemId,
                                        PerformerId = emp.EmployeeId,
                                        PerformerName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                        PriceCategoryId = itmPrice.PriceCategoryId,
                                        ItemCode = itmPrice.ItemLegalCode,
                                        ItemName = itmPrice.ItemLegalName,
                                        Price = itmPrice.Price,
                                        IsTaxApplicable = srvItm.IsTaxApplicable,
                                        IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed
                                    }).ToList();
            return docFollowUpItems;
        }

        private List<OpdServiceItemPrice_DTO> GetDoctorOldPatientBillingItems()
        {
            /*Logic Used:
             * IsActive and IsAppointmentApplicable should be true for Current Employee
             * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
             * Join ServiceItemId with EMP_Employee.OpdOldPatientServiceItemId  column (IMPORTANT)
            */

            var docFollowUpItems = (from emp in _visitDbContext.Employees
                                    where emp.IsActive == true && emp.IsAppointmentApplicable == true
                                    join dept in _visitDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                    join srvItm in _visitDbContext.BillServiceItems on emp.OpdOldPatientServiceItemId equals srvItm.ServiceItemId
                                    join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                    join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                    where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                    select new OpdServiceItemPrice_DTO
                                    {
                                        DepartmentId = dept.DepartmentId,
                                        DepartmentName = dept.DepartmentName,
                                        ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                        ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                        ServiceItemId = srvItm.ServiceItemId,
                                        PerformerId = emp.EmployeeId,
                                        PerformerName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                        PriceCategoryId = itmPrice.PriceCategoryId,
                                        ItemCode = itmPrice.ItemLegalCode,
                                        ItemName = itmPrice.ItemLegalName,
                                        Price = itmPrice.Price,
                                        IsTaxApplicable = srvItm.IsTaxApplicable,
                                        IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed
                                    }).ToList();
            return docFollowUpItems;
        }

        private List<OpdServiceItemPrice_DTO> GetDepartmentNewOpdBillingItems()
        {

            /*Logic Used:
        * IsActive and IsAppointmentApplicable should be true for Department
        * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
        * Join ServiceItemId with MST_Department.OpdNewPatientServiceItemId  column (IMPORTANT)
       */

            var deptNewOpdItems = (from dept in _visitDbContext.Departments
                                   where dept.IsActive == true && dept.IsAppointmentApplicable == true
                                   join srvItm in _visitDbContext.BillServiceItems on dept.OpdNewPatientServiceItemId equals srvItm.ServiceItemId
                                   join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                   join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                   where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                   select new OpdServiceItemPrice_DTO
                                   {
                                       DepartmentId = dept.DepartmentId,
                                       DepartmentName = dept.DepartmentName,
                                       ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                       ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                       ServiceItemId = srvItm.ServiceItemId,
                                       PerformerId = 0,//No need of this for Department
                                       PerformerName = null,//No need of this for Department
                                       PriceCategoryId = itmPrice.PriceCategoryId,
                                       ItemCode = itmPrice.ItemLegalCode,
                                       ItemName = itmPrice.ItemLegalName,
                                       Price = itmPrice.Price,
                                       IsTaxApplicable = srvItm.IsTaxApplicable,
                                       IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed,
                                       IsPriceChangeAllowed = itmPrice.IsPriceChangeAllowed
                                   }).ToList();
            return deptNewOpdItems;

        }

        private List<OpdServiceItemPrice_DTO> GetDepartmentFollowupBillingItems()
        {
            /*Logic Used:
          * IsActive and IsAppointmentApplicable should be true for Department
          * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
          * Join ServiceItemId with MST_Department.FollowupServiceItemId  column (IMPORTANT)
         */

            var deptFollowupOpdItems = (from dept in _visitDbContext.Departments
                                        where dept.IsActive == true && dept.IsAppointmentApplicable == true
                                        join srvItm in _visitDbContext.BillServiceItems on dept.FollowupServiceItemId equals srvItm.ServiceItemId
                                        join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                        join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                        where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                        select new OpdServiceItemPrice_DTO
                                        {
                                            DepartmentId = dept.DepartmentId,
                                            DepartmentName = dept.DepartmentName,
                                            ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                            ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                            ServiceItemId = srvItm.ServiceItemId,
                                            PerformerId = 0,//No need of this for Department
                                            PerformerName = null,//No need of this for Department
                                            PriceCategoryId = itmPrice.PriceCategoryId,
                                            ItemCode = itmPrice.ItemLegalCode,
                                            ItemName = itmPrice.ItemLegalName,
                                            Price = itmPrice.Price,
                                            IsTaxApplicable = srvItm.IsTaxApplicable,
                                            IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed
                                        }).ToList();
            return deptFollowupOpdItems;

        }

        private List<OpdServiceItemPrice_DTO> GetDepartmentOldPatientBillingItems()
        {
            /*Logic Used:
        * IsActive and IsAppointmentApplicable should be true for Department
        * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
        * Join ServiceItemId with MST_Department.OpdOldPatientServiceItemId  column (IMPORTANT)
       */

            var deptOldPtOpdItems = (from dept in _visitDbContext.Departments
                                     where dept.IsActive == true && dept.IsAppointmentApplicable == true
                                     join srvItm in _visitDbContext.BillServiceItems on dept.OpdOldPatientServiceItemId equals srvItm.ServiceItemId
                                     join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                     join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                     where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                     select new OpdServiceItemPrice_DTO
                                     {
                                         DepartmentId = dept.DepartmentId,
                                         DepartmentName = dept.DepartmentName,
                                         ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                         ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                         ServiceItemId = srvItm.ServiceItemId,
                                         PerformerId = 0,//No need of this for Department
                                         PerformerName = null,//No need of this for Department
                                         PriceCategoryId = itmPrice.PriceCategoryId,
                                         ItemCode = itmPrice.ItemLegalCode,
                                         ItemName = itmPrice.ItemLegalName,
                                         Price = itmPrice.Price,
                                         IsTaxApplicable = srvItm.IsTaxApplicable,
                                         IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed
                                     }).ToList();
            return deptOldPtOpdItems;
        }

        private object GetDoctorOpdReferralBillingItems()
        {
            /*Logic Used:
              * IsActive and IsAppointmentApplicable should be true for Current Employee
              * ItemName and ItemCode comes from BillPriceCategoryServiceItems table.
              * Join ServiceItemId with EMP_Employee.InternalReferralServiceItemId  column (IMPORTANT)
             */

            var docNewOpdItems = (from emp in _visitDbContext.Employees
                                  where emp.IsActive == true && emp.IsAppointmentApplicable == true
                                  join dept in _visitDbContext.Departments on emp.DepartmentId equals dept.DepartmentId
                                  join srvItm in _visitDbContext.BillServiceItems
                                  on emp.InternalReferralServiceItemId equals srvItm.ServiceItemId//Don't Miss this Column
                                  join srvDept in _visitDbContext.ServiceDepartments on srvItm.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                  join itmPrice in _visitDbContext.BillPriceCategoryServiceItems on srvItm.ServiceItemId equals itmPrice.ServiceItemId
                                  where srvItm.ServiceDepartmentId == srvDept.ServiceDepartmentId
                                  select new OpdServiceItemPrice_DTO
                                  {
                                      DepartmentId = dept.DepartmentId,
                                      DepartmentName = dept.DepartmentName,
                                      ServiceDepartmentId = srvDept.ServiceDepartmentId,
                                      ServiceDepartmentName = srvDept.ServiceDepartmentName,
                                      ServiceItemId = srvItm.ServiceItemId,
                                      PerformerId = emp.EmployeeId,
                                      PerformerName = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                      PriceCategoryId = itmPrice.PriceCategoryId,
                                      ItemCode = itmPrice.ItemLegalCode,
                                      ItemName = itmPrice.ItemLegalName,
                                      Price = itmPrice.Price,
                                      IsTaxApplicable = srvItm.IsTaxApplicable,
                                      IsZeroPriceAllowed = itmPrice.IsZeroPriceAllowed
                                  }).ToList();
            return docNewOpdItems;
        }
        private object GetPatientHealthCardWithBillInfo(int patientId)
        {
            ////added by sud:3sept'18 -- revised the healthcard conditions..
            //PatientDbContext patDbContext = new PatientDbContext(connString);
            var cardPrintInfo = _patDbContext.PATHealthCard.Where(a => a.PatientId == patientId).FirstOrDefault();

            //BillingDbContext billingDbContext = new BillingDbContext(connString);
            //CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parameter = _coreDbContext.Parameters.Where(a => a.ParameterGroupName == "Common" && a.ParameterName == "BillItemHealthCard").FirstOrDefault();
            if (parameter != null && parameter.ParameterValue != null)
            {
                //JObject paramValue = JObject.Parse(parameter.ParameterValue);
                //var result = JsonConvert.DeserializeObject<any>(parameter.ParameterValue);

                //dynamic result = JValue.Parse(parameter.ParameterValue);

            }
            //if one item was found but cancelled or returned then we've to issue it again..
            var cardBillingInfo = _billingDbContext.BillingTransactionItems
                                           .Where(bItm => bItm.PatientId == patientId && bItm.ItemName == "Health Card"
                                           && bItm.BillStatus != ENUM_BillingStatus.cancel //"cancel" 
                                           && ((!bItm.ReturnStatus.HasValue || bItm.ReturnStatus == false)))
                                           .FirstOrDefault();

            var healthCardStatus = new
            {
                BillingDone = cardBillingInfo != null ? true : false,
                CardPrinted = cardPrintInfo != null ? true : false
            };

            return healthCardStatus;
        }

        private object GetVistByStatus(string search, string status, int dayslimit)
        {
            // var visitTemp = dbContext.Visits.ToList();
            //get visit upto 15 days from today



            //dayslimit = 30;//this will come from client side.

            int defaultMaxDays = 30;//sud:12Apr'19--now we need visits from past 30days. FollowupDays logic is handled in client side only.

            DateTime defaultLastDateToShow = System.DateTime.Now.AddDays(-defaultMaxDays);

            DateTime freeFollowupLastDate = System.DateTime.Now.AddDays(-dayslimit);

            //CoreDbContext coreDbContext = new CoreDbContext(connString);
            search = search == null ? string.Empty : search.ToLower();

            var visitVMList = (from visit in _visitDbContext.Visits
                               join department in _visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                               join patient in _visitDbContext.Patients on visit.PatientId equals patient.PatientId
                               where ((visit.VisitStatus == status)
                                  && visit.VisitDate > DbFunctions.TruncateTime(defaultLastDateToShow) && visit.VisitType != ENUM_VisitType.inpatient) && visit.BillingStatus != ENUM_BillingStatus.returned
                                  && (visit.Patient.FirstName + " " + (string.IsNullOrEmpty(visit.Patient.MiddleName) ? "" : visit.Patient.MiddleName + " ")
                             + visit.Patient.LastName + visit.Patient.PatientCode + visit.Patient.PhoneNumber).Contains(search)
                               where visit.Ins_HasInsurance == null
                               select new ListVisitsVM
                               {
                                   PatientVisitId = visit.PatientVisitId,
                                   ParentVisitId = visit.ParentVisitId,
                                   DepartmentId = department.DepartmentId,
                                   DepartmentName = department.DepartmentName,
                                   PerformerId = visit.PerformerId,
                                   PerformerName = visit.PerformerName,
                                   VisitDate = visit.VisitDate,
                                   VisitTime = visit.VisitTime,

                                   VisitType = visit.VisitType,
                                   AppointmentType = visit.AppointmentType,

                                   PatientId = patient.PatientId,
                                   PatientCode = patient.PatientCode,
                                   ShortName = patient.ShortName,
                                   //ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                   PhoneNumber = patient.PhoneNumber,
                                   DateOfBirth = patient.DateOfBirth,
                                   Gender = patient.Gender,
                                   Patient = patient,

                                   QueueNo = visit.QueueNo,

                                   BillStatus = visit.BillingStatus
                               }).OrderByDescending(v => v.VisitDate).ThenByDescending(a => a.VisitTime).AsQueryable();

            if (CommonFunctions.GetCoreParameterBoolValue(_coreDbContext, "Common", "ServerSideSearchComponent", "VisitList") == true && search == "")
            {
                visitVMList = visitVMList.Take(CommonFunctions.GetCoreParameterIntValue(_coreDbContext, "Common", "ServerSideSearchListLength"));
            }
            var finalResults = visitVMList.ToList();
            //check if the topmost visit is valid for follow up or not.
            var List = VisitBL.GetValidForFollowUp(finalResults, freeFollowupLastDate);
            //responseData.Status = "OK";
            return List;
        }

        private object CreateVisitFromBilling(string str)
        {
            List<VisitModel> visits = JsonConvert.DeserializeObject<List<VisitModel>>(str);
            visits.ForEach(visit =>
            {
                visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);
                _visitDbContext.Visits.Add(visit);

            });
            _visitDbContext.SaveChanges();

            return visits;
        }

        private object CreateVisitForFreeReferral(string str, RbacUser currentUser)
        {
            VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
            //to avoid clashing of visits
            if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, vis.PatientId, vis.PerformerId, vis.VisitDate) && vis.VisitType == "outpatient")
            {

                throw new Exception("Patient already has visit with this Doctor today.");
            }
            else
            {
                //get provider name from providerId
                if (vis.PerformerId != null && vis.PerformerId != 0)
                {
                    vis.PerformerName = VisitBL.GetProviderName(vis.PerformerId, connString);
                }

                var parentVisit = _visitDbContext.Visits.Where(x => x.PatientVisitId == vis.PatientVisitId).FirstOrDefault();
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                //var priceCategoryObj = billingDbContext.PriceCategoryModels.Where(a => a.PriceCategoryId == parentVisit.PriceCategoryId).FirstOrDefault();
                BillingSchemeModel schemeObj = billingDbContext.BillingSchemes.Where(sch => sch.SchemeId == parentVisit.SchemeId).FirstOrDefault();

                /*Manipal-RevisionNeeded*/
                //Sud:22Mar'23-- Changed from PriceCatgory to Scheme. This new logic seems ok. Review once more Just In case.. 
                if (parentVisit != null)
                {
                    vis.PriceCategoryId = parentVisit.PriceCategoryId;
                    vis.SchemeId = parentVisit.SchemeId;
                    if (schemeObj.IsBillingCoPayment == true)
                    {
                        //generate new claim code Here..
                        Random generator = new Random();
                        String r = generator.Next(1, 10000).ToString("D4");
                        vis.ClaimCode = Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
                    }
                }

                _visitDbContext.Visits.Add(vis);

                GenerateVisitCodeAndSave(_visitDbContext, vis, connString);
                if (schemeObj != null && schemeObj.IsBillingCoPayment)//Sud:22Mar'23-- this logic should be Revised.
                {
                    //Krishna, 22Jan'23 Below code is an async method, Hence it will continue at its back, User do not need to hold for this operation to complete while free follow up
                    SSFDbContext sSFDbContext = new SSFDbContext(connString);
                    VisitBL.UpdatePatientSchemeForFreeFollowupAndFreeReferral(_visitDbContext, sSFDbContext, vis, parentVisit, currentUser);
                }


                //updateIsContinuedStatus in case of referral visit and followup visit
                if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                    || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() //"followup"
                    || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower())//"transfer")
                {
                    UpdateIsContinuedStatus(vis.ParentVisitId,
                        vis.AppointmentType,
                        true,
                        currentUser.EmployeeId,
                        _visitDbContext);
                }

                vis.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, vis.PatientVisitId, connString);
                //Return Model should be in same format as that of the ListVisit since it's appended in the same list.
                ListVisitsVM returnVisit = (from visit in _visitDbContext.Visits
                                            where visit.PatientVisitId == vis.PatientVisitId
                                            join department in _visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                            join patient in _visitDbContext.Patients on visit.PatientId equals patient.PatientId
                                            select new ListVisitsVM
                                            {
                                                PatientVisitId = visit.PatientVisitId,
                                                ParentVisitId = visit.ParentVisitId,
                                                VisitDate = visit.VisitDate,
                                                VisitTime = visit.VisitTime,
                                                PatientId = patient.PatientId,
                                                PatientCode = patient.PatientCode,
                                                ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                PhoneNumber = patient.PhoneNumber,
                                                DateOfBirth = patient.DateOfBirth,
                                                Gender = patient.Gender,
                                                DepartmentId = department.DepartmentId,
                                                DepartmentName = department.DepartmentName,
                                                PerformerName = visit.PerformerName,
                                                PerformerId = visit.PerformerId,
                                                VisitType = visit.VisitType,
                                                AppointmentType = visit.AppointmentType,
                                                BillStatus = visit.BillingStatus,
                                                Patient = patient,
                                                QueueNo = visit.QueueNo
                                            }).FirstOrDefault();



                return returnVisit;
            }
        }

        private object CreateVisitForFreeFollowUp(string str, RbacUser currentUser)
        {
            VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);

            if (vis != null && VisitBL.IsValidForFollowUp(_visitDbContext, (int)vis.ParentVisitId, connString))
            {

                //to avoid clashing of visits
                if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, vis.PatientId, vis.PerformerId, vis.VisitDate) && vis.VisitType == "outpatient")
                {
                    throw new Exception("Patient already has appointment with this Doctor today.");
                }
                else
                {
                    //get provider name from providerId
                    if (vis.PerformerId != null && vis.PerformerId != 0)
                    {
                        vis.PerformerName = VisitBL.GetProviderName(vis.PerformerId, connString);
                    }

                    //vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                    var parentVisit = _visitDbContext.Visits.Where(x => x.PatientVisitId == vis.ParentVisitId).FirstOrDefault();
                    BillingDbContext billingDbContext = new BillingDbContext(connString);
                    //var priceCategoryObj = billingDbContext.PriceCategoryModels.Where(a => a.PriceCategoryId == parentVisit.PriceCategoryId).FirstOrDefault();

                    BillingSchemeModel schemeObj = billingDbContext.BillingSchemes.Where(sch => sch.SchemeId == parentVisit.SchemeId).FirstOrDefault();

                    /*Manipal-RevisionNeeded*/
                    //Sud:22Mar'23-- Changed from PriceCatgory to Scheme. Below logic needs revision.

                    if (parentVisit != null)
                    {
                        vis.PriceCategoryId = parentVisit.PriceCategoryId;
                        vis.SchemeId = parentVisit.SchemeId;
                        if (schemeObj.IsBillingCoPayment == true)
                        {
                            //generate new claim code Here..
                            Random generator = new Random();
                            String r = generator.Next(1, 10000).ToString("D4");
                            vis.ClaimCode = Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
                        }
                    }


                    _visitDbContext.Visits.Add(vis);
                    GenerateVisitCodeAndSave(_visitDbContext, vis, connString);
                    if (schemeObj != null && schemeObj.IsBillingCoPayment == true)//Sud:22Mar'23-- this logic should be Revised.
                    {
                        //Krishna, 22Jan'23 Below code is an async method, Hence it will continue at its back, User do not need to hold for this operation to complete while free follow up
                        SSFDbContext sSFDbContext = new SSFDbContext(connString);
                        VisitBL.UpdatePatientSchemeForFreeFollowupAndFreeReferral(_visitDbContext, sSFDbContext, vis, parentVisit, currentUser);
                    }


                    //updateIsContinuedStatus in case of referral visit and followup visit
                    if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                        || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() // "followup"
                        || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()) // "transfer")
                    {
                        UpdateIsContinuedStatus(vis.ParentVisitId,
                            vis.AppointmentType,
                            true,
                            currentUser.EmployeeId,
                            _visitDbContext);
                    }

                    vis.QueueNo = VisitBL.CreateNewPatientQueueNo(_visitDbContext, vis.PatientVisitId, connString);

                    //Return Model should be in same format as that of the ListVisit since it's appended in the samae list.
                    ListVisitsVM returnVisit = (from visit in _visitDbContext.Visits
                                                where visit.PatientVisitId == vis.PatientVisitId
                                                join department in _visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                                join patient in _visitDbContext.Patients on visit.PatientId equals patient.PatientId
                                                select new ListVisitsVM
                                                {
                                                    PatientVisitId = visit.PatientVisitId,
                                                    ParentVisitId = visit.ParentVisitId,
                                                    VisitDate = visit.VisitDate,
                                                    VisitTime = visit.VisitTime,
                                                    PatientId = patient.PatientId,
                                                    PatientCode = patient.PatientCode,
                                                    ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                    PhoneNumber = patient.PhoneNumber,
                                                    DateOfBirth = patient.DateOfBirth,
                                                    Gender = patient.Gender,
                                                    DepartmentId = department.DepartmentId,
                                                    DepartmentName = department.DepartmentName,
                                                    PerformerId = visit.PerformerId,
                                                    PerformerName = visit.PerformerName,
                                                    VisitType = visit.VisitType,
                                                    AppointmentType = visit.AppointmentType,
                                                    BillStatus = visit.BillingStatus,
                                                    Patient = patient,
                                                    QueueNo = visit.QueueNo,
                                                    CountrySubDivisionName = _visitDbContext.CountrySubdivisions.FirstOrDefault(a => a.CountryId == patient.CountryId).CountrySubDivisionName
                                                }).FirstOrDefault();
                    return returnVisit;
                }
            }
            else
            {
                throw new Exception("Free followup days has passed.");
            }
        }

        private object DefaultVisitCreate(string str, RbacUser currentUser)
        {
            VisitModel vis = JsonConvert.DeserializeObject<VisitModel>(str);
            //to avoid clashing of visits
            if (VisitBL.HasDuplicateVisitWithSameProvider(_visitDbContext, vis.PatientId, vis.PerformerId, vis.VisitDate) && vis.VisitType == "outpatient")
            {

                throw new Exception("Patient already has visit with this provider today.");
            }
            else
            {
                //get provider name from providerId
                if (vis.PerformerId != null && vis.PerformerId != 0)
                {
                    vis.PerformerName = VisitBL.GetProviderName(vis.PerformerId, connString);
                }

                vis.VisitCode = VisitBL.CreateNewPatientVisitCode(vis.VisitType, connString);
                _visitDbContext.Visits.Add(vis);
                _visitDbContext.SaveChanges();
                //VisitBL.UpdateVisitCode(obj.PatientVisitId, visitDbContext);
                //in client side Patient Data is also needed along with visit
                //VisitModel returnVisit = visitDbContext.Visits.Include("Patient")
                //    .Where(v => v.PatientVisitId == vis.PatientVisitId).FirstOrDefault();

                //updateIsContinuedStatus in case of referral visit and followup visit
                if (vis.AppointmentType.ToLower() == ENUM_AppointmentType.referral.ToLower() // "referral"
                || vis.AppointmentType.ToLower() == ENUM_AppointmentType.followup.ToLower() // "followup"
                || vis.AppointmentType.ToLower() == ENUM_AppointmentType.transfer.ToLower()) // "transfer")
                {
                    UpdateIsContinuedStatus(vis.ParentVisitId,
                        vis.AppointmentType,
                        true,
                        currentUser.EmployeeId,
                        _visitDbContext);
                }



                //Return Model should be in same format as that of the ListVisit since it's appended in the samae list.
                ListVisitsVM returnVisit = (from visit in _visitDbContext.Visits
                                            where visit.PatientVisitId == vis.PatientVisitId
                                            join department in _visitDbContext.Departments on visit.DepartmentId equals department.DepartmentId
                                            join patient in _visitDbContext.Patients on visit.PatientId equals patient.PatientId
                                            select new ListVisitsVM
                                            {
                                                PatientVisitId = visit.PatientVisitId,
                                                ParentVisitId = visit.ParentVisitId,
                                                VisitDate = visit.VisitDate,
                                                VisitTime = visit.VisitTime,
                                                PatientId = patient.PatientId,
                                                PatientCode = patient.PatientCode,
                                                ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                PhoneNumber = patient.PhoneNumber,
                                                DateOfBirth = patient.DateOfBirth,
                                                Gender = patient.Gender,
                                                DepartmentId = department.DepartmentId,
                                                DepartmentName = department.DepartmentName,
                                                PerformerName = visit.PerformerName,
                                                PerformerId = visit.PerformerId,
                                                VisitType = visit.VisitType,
                                                AppointmentType = visit.AppointmentType,
                                                BillStatus = visit.BillingStatus,
                                                Patient = patient
                                            }).FirstOrDefault();


                return returnVisit;
            }
        }

        private object UpdateBillingStatus(string str, string billingStatus)
        {
            List<Int32> patientVisitIds = JsonConvert.DeserializeObject<List<Int32>>(str);
            //updates the visit status when bill is paid.

            foreach (var visitId in patientVisitIds)
            {
                VisitModel dbVisit = _visitDbContext.Visits
                                            .Where(v => v.PatientVisitId == visitId)
                                            .FirstOrDefault<VisitModel>();
                if (dbVisit != null)
                {
                    dbVisit.BillingStatus = billingStatus.ToLower();
                    _visitDbContext.Entry(dbVisit).State = EntityState.Modified;
                }
            }
            _visitDbContext.SaveChanges();
            //create a return visitmodel with only updated/changed fields.
            return new VisitModel() { VisitStatus = billingStatus };
        }

        private object UpdateSignedStatusOfPatientVisit(int patientVisitId, RbacUser currentUser)
        {
            VisitModel visit = _visitDbContext.Visits.Where(a => a.PatientVisitId == patientVisitId).FirstOrDefault();
            visit.ModifiedBy = currentUser.UserId;
            visit.ModifiedOn = DateTime.Now;
            visit.IsSignedVisitSummary = true;
            _visitDbContext.Entry(visit).State = EntityState.Modified;

            _visitDbContext.Entry(visit).Property(u => u.CreatedBy).IsModified = false;
            _visitDbContext.Entry(visit).Property(u => u.CreatedOn).IsModified = false;

            _visitDbContext.SaveChanges();
            return visit;
        }

        private int GetMaximumLastVisitDays()
        {
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parameter = coreDbContext.Parameters.Where(a => a.ParameterName == "MaximumLastVisitDays" && a.ParameterGroupName == "Appointment").FirstOrDefault();
            var maximumLastVisitDays = 0;
            if (parameter != null)
            {
                string paramValueStr = parameter.ParameterValue;
                var data = DanpheJSONConvert.DeserializeObject<int>(paramValueStr);
                if (data > 0)
                {
                    maximumLastVisitDays = data;
                }
            }
            return maximumLastVisitDays;
        }

        private object GetMemberInformationByScheme(int schemeId, int patientId)
        {
            var scheme = _visitDbContext.BillingSchemes.Where(a => a.SchemeId == schemeId).FirstOrDefault();
            var patientScheme = _visitDbContext.PatientSchemeMaps.Where(a => a.SchemeId == schemeId && a.PatientId == patientId)
                                                              .Select(s => new PatientMemberInfo_DTO
                                                              {
                                                                  PatientSchemeId = s.PatientSchemeId,
                                                                  SchemeId = s.SchemeId,
                                                                  PatientId = s.PatientId,
                                                                  MemberNo = s.PolicyNo,
                                                                  LatestClaimCode = s.LatestClaimCode,
                                                                  OpCreditLimit = s.OpCreditLimit,
                                                                  IpCreditLimit = s.IpCreditLimit,
                                                                  GeneralCreditLimit = s.GeneralCreditLimit,
                                                                  PolicyHolderEmployerId = s.PolicyHolderEmployerID,
                                                                  PolicyHolderEmployerName = s.PolicyHolderEmployerName,
                                                                  PolicyHolderUid = s.PolicyHolderUID,
                                                                  LatestPatientVisitId = s.LatestPatientVisitId,
                                                                  IsGeneralCreditLimit = scheme.IsGeneralCreditLimited
                                                              }).FirstOrDefault();
            if (patientScheme == null)
            {
                PatientMemberInfo_DTO patientMemberInfo = new PatientMemberInfo_DTO()
                {
                    PatientSchemeId = 0,
                    SchemeId = scheme.SchemeId,
                    PatientId = patientId,
                    MemberNo = null,
                    LatestClaimCode = null,
                    OpCreditLimit = scheme.OpCreditLimit,
                    IpCreditLimit = scheme.IpCreditLimit,
                    GeneralCreditLimit = scheme.GeneralCreditLimit,
                    PolicyHolderEmployerId = null,
                    PolicyHolderEmployerName = null,
                    PolicyHolderUid = null,
                    LatestPatientVisitId = 0
                };
            }
            return patientScheme;
        }


        private object GetPatientCreditLimitsByScheme(int schemeId, int patientId, string serviceBillingContext)
        {
            if (schemeId == 0 || patientId == 0)
            {
                throw new ArgumentException("Either schemeId Or patientId is invalid.");
            }
            decimal creditLimit = 0;
            var scheme = GetBillingSchemeBasedOnServiceBillingContext(schemeId, serviceBillingContext);//_visitDbContext.BillingSchemes.Where(a => a.SchemeId == schemeId).FirstOrDefault();
            var patientScheme = _visitDbContext.PatientSchemeMaps.Where(a => a.SchemeId == schemeId && a.PatientId == patientId).FirstOrDefault();
            if (scheme != null)
            {
                if (scheme.IsGeneralCreditLimited && patientScheme != null)
                {
                    creditLimit = patientScheme.OpCreditLimit;//Need to replace this with GeneralCreditLimit
                }
                else if (scheme.IsGeneralCreditLimited && patientScheme == null)
                {
                    creditLimit = scheme.CreditLimit;
                }
                else if (scheme.IsCreditLimited && patientScheme != null)
                {
                    creditLimit = serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.OpBilling ? patientScheme.OpCreditLimit : patientScheme.IpCreditLimit;
                }
                else if (scheme.IsCreditLimited && patientScheme == null)
                {
                    creditLimit = 0;
                }
            }
            return creditLimit;
        }

        private BillingScheme_DTO GetBillingSchemeBasedOnServiceBillingContext(int schemeId, string serviceBillingContext)
        {
            BillingScheme_DTO scheme = new BillingScheme_DTO();
            if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.OpBilling)
            {
                scheme = _visitDbContext.BillingSchemes.Where(a => a.SchemeId == schemeId).Select(s => new BillingScheme_DTO
                {
                    SchemeId = s.SchemeId,
                    SchemeName = s.SchemeName,
                    IsGeneralCreditLimited = s.IsGeneralCreditLimited,
                    IsCreditLimited = s.IsOpCreditLimited,
                    CreditLimit = s.GeneralCreditLimit
                }).FirstOrDefault();
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.IpBilling)
            {
                scheme = _visitDbContext.BillingSchemes.Where(a => a.SchemeId == schemeId).Select(s => new BillingScheme_DTO
                {
                    SchemeId = s.SchemeId,
                    SchemeName = s.SchemeName,
                    IsGeneralCreditLimited = s.IsGeneralCreditLimited,
                    IsCreditLimited = s.IsIpCreditLimited,
                    CreditLimit = s.GeneralCreditLimit
                }).FirstOrDefault();
            }
            return scheme;
        }

        private object GetPatientVisitContextForProvisionalPayment(int patientId, int visitId)
        {
           var patientVisitContext = (from vis in _visitDbContext.Visits
                                      join patMap in _visitDbContext.PatientSchemeMaps on vis.PatientVisitId equals patMap.LatestPatientVisitId into grp
                                      from patientScheme in grp.DefaultIfEmpty()
                                      where vis.PatientId == patientId && (visitId > 0 ? vis.PatientVisitId == visitId : true)
                                      select new
                                      {
                                          PatientId = vis.PatientId,
                                          PatientVisitId = vis.PatientVisitId,
                                          PerformerId = vis.PerformerId,
                                          PerformerName = "",
                                          VisitType = vis.VisitType,
                                          VisitDate = vis.VisitDate,
                                          ClaimCode = vis.ClaimCode,
                                          MemberNo = patientScheme.PolicyNo,
                                          SchemeId = vis.SchemeId,
                                          PriceCategoryId = vis.PriceCategoryId,
                                          RequestingDepartmentId = vis.DepartmentId
                                      }).OrderByDescending(a => a.VisitDate).FirstOrDefault();
            return patientVisitContext;
        }
    }


}
