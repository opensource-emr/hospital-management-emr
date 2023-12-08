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
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using System.Xml;

using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using System.Threading.Tasks;
using DanpheEMR.Enums;
using System.Transactions;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.ServerModel.InsuranceModels;
using DanpheEMR.ViewModel.ADT;
using System.Data.Entity.Infrastructure;
using DanpheEMR.ServerModel.PatientModels;
using System.Web.Security;
using DanpheEMR.Services.Admission;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.Services.Discharge;
using DanpheEMR.Services.Admission.DTOs;
using DanpheEMR.Services.Visits.DTO;
using DanpheEMR.Services.Billing.DTO;
using DocumentFormat.OpenXml.Spreadsheet;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using DanpheEMR.ServerModel.Utilities;
using DanpheEMR.Services.Utilities.DTOs;
using System.Security.Cryptography;
using System.Security.Cryptography.Xml;

namespace DanpheEMR.Controllers
{

    public class AdmissionController : CommonController
    {


        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        private readonly AdmissionDbContext _admissionDbContext;
        private readonly CoreDbContext _coreDbContext;
        private readonly BillingDbContext _billingDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly RbacDbContext _rbacDbContext;

        public AdmissionController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            _admissionDbContext = new AdmissionDbContext(connString);
            _coreDbContext = new CoreDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _rbacDbContext = new RbacDbContext(connString);
        }

        #region Start HTTP GET APIs

        #region Get ADTPatient Data
        [HttpGet]
        [Route("AdmittedPatientsData")]
        public IActionResult GetAdmittedPatientList(string admissionStatus, int patientVisitId)
        {
            //if (reqType == "getADTList")
            Func<object> func = () => GetADTList(admissionStatus, patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Ward List
        [HttpGet]
        [Route("Wards")]
        public IActionResult WardList()
        {
            //else if (reqType == "WardList")
            Func<object> func = () => GetWardList();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Departments
        [HttpGet]
        [Route("Departments")]
        public IActionResult Departments()
        {
            //else if (reqType == "DepartmentList")
            Func<object> func = () => GetDepartments();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Bed Feature List
        [HttpGet]
        [Route("BedFeatures")]
        public IActionResult BedFeatures()
        {
            //else if (reqType == "BedFeatureList")
            Func<object> func = () => GetBedFeatures();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Discharged Patient List
        [HttpGet]
        [Route("DischargedPatients")]
        public IActionResult DischargePatientList(string admissionStatus, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "DischargedPatientsList")
            Func<object> func = () => GetDischargedPatientList(admissionStatus, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Admitted Patient List
        [HttpGet]
        [Route("AdmittedPatients")]
        public IActionResult AdmittedPatients(string admissionStatus, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "AdmittedPatientsList")
            Func<object> func = () => GetAdmittedPatientList(admissionStatus, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient And Bed Info
        [HttpGet]
        [Route("PatientAndBedInfo")]
        public IActionResult GetPatAndBedInfo(int patientId, int patientVisitId)
        {
            //else if (reqType == "SelectedPatientPlusBedInfo")
            Func<object> func = () => GetPatientAndBedInfo(patientId, patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Admitted Patient Info
        [HttpGet]
        [Route("AdmissionInfo")]
        public IActionResult GetPatientAdmissionInfo(int patientId, int ipVisitId)
        {
            //else if (reqType == "get-pat-adt-info" && patientId != 0 && ipVisitId != 0)
            Func<object> func = () => GetAdmissionInfo(patientId, ipVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Admitted Patient Bed Info
        [HttpGet]
        [Route("AdmittedPatientBedInfo")]
        public IActionResult AdmittedPatientBedInfo(int patientVisitId)
        {
            //else if (reqType == "getAdmittedPatientDetails")
            Func<object> func = () => GetAdmittedPatientBedInfo(patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Admitted Patient For Nursing
        [HttpGet]
        [Route("AdmittedPatientForNursing")]
        public IActionResult AdmittedPatientInfoForNursing(string search, DateTime ToDate, int wardId, DateTime FromDate)
        {
            //else if (reqType == "getAdmittedList")
            Func<object> func = () => AdmittedPatientListForNursing(search, ToDate, wardId, FromDate);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Transferred Patient Info
        [HttpGet]
        [Route("TransferredPatientInfo")]
        public IActionResult GetTransferredPatientInfo()
        {
            //else if (reqType == "pendingAdmissionReceiveList")
            Func<object> func = () => GetPendingTransferredPatient();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Check Patient Admission Status
        [HttpGet]
        [Route("PatientAdmissionStatus")]
        public IActionResult CheckPatientAdmissionStatus(int patientId)
        {
            //else if (reqType == "checkPatientAdmission")
            Func<object> func = () => CheckAdmissionStatus(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Check Patient Provisonal Billing Status
        [HttpGet]
        [Route("ProvisionalBillStatus")]
        public IActionResult PatientProvisionalStatus(int patientId)
        {
            //else if (reqType == "checkPatProvisionalInfo")
            Func<object> func = () => CheckPatientProvisionalStatus(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get OPD Doctor List
        [HttpGet]
        [Route("Doctors")]
        public IActionResult GetDoctors()
        {
            //else if (reqType == "get-doctor-list")
            Func<object> func = () => GetDoctorList();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion
        #region Get Appointment Applicable Doctors List
        [HttpGet]
        [Route("AppointmentApplicableDoctorList")]
        public IActionResult GetAppointmentApplicableDoctorsList()
        {
            Func<object> func = () => GetAppointmentApplicableDoctorList();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Appointment Applicable Doctors
        [HttpGet]
        [Route("AppointmentApplicableDoctors")]
        public IActionResult AppointmentApplicableDoctors()
        {
            //else if (reqType == "provider-list")
            Func<object> func = () => GetAppointmentApplicableDoctors();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Anaesthetist Doctors
        [HttpGet]
        [Route("Anaesthetists")]
        public IActionResult GetAnaesthetistDoctors()
        {
            //else if (reqType == "anasthetists-employee-list")
            Func<object> func = () => GetAnaesthetist();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Discharge Types
        [HttpGet]
        [Route("DischargeTypes")]
        public IActionResult DischargeTypes()
        {
            //else if (reqType == "discharge-type")
            Func<object> func = () => GetDischargeTypes();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Discharge Summary
        [HttpGet]
        [Route("DischargeSummary")]
        public IActionResult DischargeSummary(int patientVisitId)
        {
            //else if (reqType == "discharge-summary-patientVisit")
            Func<object> func = () => GetDischargeSummary(patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Available Beds Info
        [HttpGet]
        [Route("AvailableBeds")]
        public IActionResult AvailableBeds(int wardId, int bedFeatureId)
        {
            //else if (reqType == "availableBeds")
            Func<object> func = () => GetAvailableBeds(wardId, bedFeatureId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get BedFeatures By WardId
        [HttpGet]
        [Route("Ward/BedFeatures")]
        public IActionResult BedFeatureByWardAndPriceCategoryId(int wardId, int priceCategoryId)
        {
            //else if (reqType == "wardBedFeature")
            Func<object> func = () => GetBedFeaturesByWard(wardId, priceCategoryId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Matching Bed Features
        [HttpGet]
        [Route("SimilarBedFeatures")]
        public IActionResult BedFeatureByWardId(int wardId, int bedFeatureId)
        {
            //else if (reqType == "similarBedFeatures")
            Func<object> func = () => GetSimilarBedFeature(wardId, bedFeatureId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Admission History
        [HttpGet]
        [Route("AdmissionHistory")]
        public IActionResult AdmissionHistory(int patientId)
        {
            //else if (reqType == "admissionHistory")
            Func<object> func = () => GetAdmissionHistory(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient Latest Admission Detail
        [HttpGet]
        [Route("LatestAdmissionInfo")]
        public IActionResult LatestAdmissionDetail(int patientId)
        {
            //else if (reqType == "latest-adt-detail")
            Func<object> func = () => GetLatestAdmissionDetail(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient Admission Sticker
        [HttpGet]
        [Route("AdmissionSticker")]
        public IActionResult AdmissionSticker(int patientVisitId)
        {
            //else if (reqType == "admission-sticker")
            Func<object> func = () => GetAdmissionSticker(patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient WristBand Info
        [HttpGet]
        [Route("WristBandInfo")]
        public IActionResult WristBandInfo(int patientVisitId)
        {
            //else if (reqType == "wrist-band-info")//sud: 6thJan'18
            Func<object> func = () => GetWristBandInfo(patientVisitId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get HemoDialysis Report
        [HttpGet]
        [Route("LatestHemoDialysisReport")]
        public IActionResult LastHemoDialysisReport(int patientId)
        {
            //else if (reqType == "checkForLastReport")
            Func<object> func = () => GetLastHemoDialysisReport(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get All HemoDialysis Reports
        [HttpGet]
        [Route("HemoDialysisReports")]
        public IActionResult AllHemoDialysisReport(int patientId)
        {
            //else if (reqType == "previousReportList")
            Func<object> func = () => GetAllHemodialysisReport(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient Bed Infos
        [HttpGet]
        [Route("PatientBedInfos")]
        public IActionResult GetBedItemsByPatientAndVisitId(int patientId, int patientVisitId)
        {
            //else if (reqType != null && reqType == "existing-bed-types-for-patientVisit")
            Func<object> func = () => GetBedItemsForPatientVisit(patientVisitId, patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get ICD10 List
        [HttpGet]
        [Route("ICD10")]
        public IActionResult ICD10List()
        {
            //else if (reqType == "get-icd10-list")
            Func<object> func = () => GetICD10List();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Medication Frequencies
        [HttpGet]
        [Route("MedicationFrequencies")]
        public IActionResult MedicationFrequency()
        {
            //else if (reqType == "get-medication-frequency")
            Func<object> func = () => GetMedicationFrequencies();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Discharge Condition Types
        [HttpGet]
        [Route("DischargeConditions")]
        public IActionResult DischargeConditions()
        {
            //else if (reqType == "get-discharge-condition-type")
            Func<object> func = () => GetDischargeConditions();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Delivery Types
        [HttpGet]
        [Route("DeliveryTypes")]
        public IActionResult DeliveryTypes()
        {
            //else if (reqType == "get-delivery-type")
            Func<object> func = () => GetDeliveryTypes();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Baby Birth Conditions
        [HttpGet]
        [Route("BirthConditions")]
        public IActionResult BabyBirthCondtions()
        {
            //else if (reqType == "get-baby-birth-condition")
            Func<object> func = () => GetBirthCondtions();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Death Types
        [HttpGet]
        [Route("DeathTypes")]
        public IActionResult DeathTypes()
        {
            //else if (reqType == "get-death-type")
            Func<object> func = () => GetDeathTypes();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Active Fiscal Year
        [HttpGet]
        [Route("ActiveFiscalYear")]
        public IActionResult FiscalYear()
        {
            //else if (reqType == "get-active-FiscalYear")
            Func<object> func = () => GetActiveFicalYear();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get FollowUp Preferences
        [HttpGet]
        [Route("FollowUpPreferences")]
        public IActionResult FollowUpPreferences()
        {
            //else if (reqType == "get-emp-followup")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetFollowUpPreferences(currentUser);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Patient Certificate
        [HttpGet]
        [Route("PatientCertificate")]
        public IActionResult PatientCertificate(int dischargeSummaryId, int patientId)
        {
            //else if (reqType == "get-Certificate")
            Func<object> func = () => GetPatientCertificate(dischargeSummaryId, patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Doctor Department And Ward Info
        [HttpGet]
        [Route("DoctorDeparmentAndWardInfo")]
        public IActionResult PatientCertificate(int patientId)
        {
            //else if (reqType == "get-doc-dpt-ward")
            Func<object> func = () => GetDepartmentWardDoctorAndBedInfo(patientId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Favourite PatientList
        [HttpGet]
        [Route("FavouritePatients")]
        public IActionResult FavouritePatients()
        {
            //else if (reqType == "get-emp-favorites")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetFavouritePatientList(currentUser);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Nursing Favourite PatientList
        [HttpGet]
        [Route("NursingFavouritePatients")]
        public IActionResult NursingFavouritePatients()
        {
            //else if (reqType == "get-nur-favorites")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => GetNursingFavouritePatients(currentUser);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get All Ward BedInfo
        [HttpGet]
        [Route("~/api/Admission/GetAllWardBedInfo")]
        public async Task<IActionResult> GetAllWardBedInfo()
        {
            var _context = new AdmissionDbContext(connString);
            var responseData = new DanpheHTTPResponse<object>();
            try
            {
                var wardBedInfoList = await _context.Beds.GroupBy(bed => bed.WardId).Select(uniqueBedGroup => new
                {
                    WardId = uniqueBedGroup.Key,
                    TotalBed = uniqueBedGroup.Count(),
                    Occupied = uniqueBedGroup.Count(bed => bed.IsOccupied == true),
                    Vacant = uniqueBedGroup.Count(bed => (bed.IsOccupied == false) && (bed.IsActive == true))
                }).ToListAsync();
                if (wardBedInfoList == null)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Bed Info Not Found.";
                }
                else
                {
                    responseData.Status = "OK";
                    responseData.Results = wardBedInfoList;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
        #endregion

        #region Get Admission Slip Details
        [HttpGet]
        [Route("AdmissionSlipDetails")]
        public IActionResult AdmissionSlipDetails(int PatientVisitId)
        {
            Func<object> func = () => (from adm in _admissionDbContext.Admissions
                                       join pat in _admissionDbContext.Patients on adm.PatientId equals pat.PatientId
                                       join visit in _admissionDbContext.Visits on adm.PatientVisitId equals visit.PatientVisitId
                                       join dept in _admissionDbContext.Department on visit.DepartmentId equals dept.DepartmentId
                                       join bedInfo in _admissionDbContext.PatientBedInfos on visit.PatientVisitId equals bedInfo.PatientVisitId
                                       join ward in _admissionDbContext.Wards on bedInfo.WardId equals ward.WardId
                                       join bed in _admissionDbContext.Beds on bedInfo.BedId equals bed.BedId
                                       join emp in _admissionDbContext.Employees on adm.AdmittingDoctorId equals emp.EmployeeId into empGroup
                                       from employee in empGroup.DefaultIfEmpty()
                                       where visit.PatientVisitId == PatientVisitId && adm.AdmissionStatus == ENUM_AdmissionStatus.admitted
                                       select new PatientAdmissionSlip_DTO
                                       {
                                           PatientName = pat.ShortName,
                                           AgeGender = pat.Age.ToString() + "/" + pat.Gender.Substring(0, 1),
                                           HospitalNumber = pat.PatientCode,
                                           IpNumber = visit.VisitCode,
                                           WardNameBedNumber = ward.WardName + "/" + bed.BedNumber,
                                           DepartmentName = dept.DepartmentName,
                                           DoctorName = employee.FullName,
                                           AdmittedOn = adm.AdmissionDate
                                       }).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Discharge Slip Details
        [HttpGet]
        [Route("DischargeSlipDetails")]
        public IActionResult DischargeSlipDetails(int PatientVisitId)
        {
            Func<object> func = () => (from adm in _admissionDbContext.Admissions
                                       join pat in _admissionDbContext.Patients on adm.PatientId equals pat.PatientId
                                       join visit in _admissionDbContext.Visits on adm.PatientVisitId equals visit.PatientVisitId
                                       join dept in _admissionDbContext.Department on visit.DepartmentId equals dept.DepartmentId
                                       join bedInfo in _admissionDbContext.PatientBedInfos on visit.PatientVisitId equals bedInfo.PatientVisitId
                                       join ward in _admissionDbContext.Wards on bedInfo.WardId equals ward.WardId
                                       join bed in _admissionDbContext.Beds on bedInfo.BedId equals bed.BedId
                                       join emp in _admissionDbContext.Employees on adm.AdmittingDoctorId equals emp.EmployeeId into empGroup
                                       from employee in empGroup.DefaultIfEmpty()
                                       where visit.PatientVisitId == PatientVisitId && adm.AdmissionStatus == ENUM_AdmissionStatus.discharged
                                       select new PatientDischargeSlip_DTO
                                       {
                                           PatientName = pat.ShortName,
                                           AgeGender = pat.Age.ToString() + "/" + pat.Gender.Substring(0, 1),
                                           HospitalNumber = pat.PatientCode,
                                           IpNumber = visit.VisitCode,
                                           WardNameBedNumber = ward.WardName + "/" + bed.BedNumber,
                                           DepartmentName = dept.DepartmentName,
                                           DoctorName = employee.FullName,
                                           AdmittedOn = adm.AdmissionDate,
                                           DischargedOn = (DateTime)adm.DischargeDate
                                       }).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Admission Scheme PriceCategory Info API, this will return Scheme and PriceCategory of that specific Visit
        [HttpGet]
        [Route("AdmissionSchemePriceCategoryInfo")]
        public IActionResult AdmissionSchemePriceCategoryInfo(int patientVisitId)
        {
            Func<object> func = () => GetAdmissionSchemePriceCategoryInfo(patientVisitId);
            return InvokeHttpGetFunction(func);
        }
        #endregion
        #endregion

        #region GetAvailabeBedsAndBedFeaturePrice
        [HttpGet]
        [Route("AvailableBedsAndBedFeaturePrice")]
        public IActionResult AvailableBedsAndBedFeaturePrice(int wardId, int bedFeatureId, int priceCategoryId)
        {
            Func<object> func = () => GetAvailableBedsAndBedFeaturePrice(wardId, bedFeatureId, priceCategoryId);
            return InvokeHttpGetFunction(func);
        }

        private object GetAvailableBedsAndBedFeaturePrice(int wardId, int bedFeatureId, int priceCategoryId)
        {
            var availableBedsObj = GetAvailableBeds(wardId, bedFeatureId);


            var bedFeatureWithPrice = (from bedFeature in _admissionDbContext.BedFeatures where bedFeature.BedFeatureId == bedFeatureId
                                       join serviceItem in _admissionDbContext.BillServiceItems on bedFeature.BedFeatureId equals serviceItem.IntegrationItemId
                                       join serviceItemPriceCategoryMap in _admissionDbContext.BillPriceCategoryServiceItems on
                                       new { serviceItem.ServiceItemId, serviceItem.ServiceDepartmentId } equals new { serviceItemPriceCategoryMap.ServiceItemId, serviceItemPriceCategoryMap.ServiceDepartmentId }
                                       where (bedFeature.IsActive == true && serviceItemPriceCategoryMap.PriceCategoryId == priceCategoryId
                                       && serviceItem.IntegrationName == "Bed Charges")
                                       select new BedFeature_DTO
                                       {
                                           BedFeatureId = bedFeature.BedFeatureId,
                                           ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                           BedFeatureName = bedFeature.BedFeatureName,
                                           BedFeatureFullName = bedFeature.BedFeatureFullName,
                                           BedFeatureCode = bedFeature.BedFeatureCode,
                                           BedPrice = serviceItemPriceCategoryMap.Price,
                                           ServiceItemId = serviceItem.ServiceItemId,
                                           ItemCode = serviceItem.ItemCode
                                       }).FirstOrDefault();
            decimal bedFeaturePrice = 0;
            if (bedFeatureWithPrice != null)
            {
                bedFeaturePrice = bedFeatureWithPrice.BedPrice;
            }

            return new { availableBedsObj, bedFeaturePrice };



        }
        #endregion

        [HttpGet]
        [Route("IsPreviousBedAvailable")]
        public IActionResult IsPreviousBedAvailable(int patientVisitId)
        {
            Func<object> func = () => CheckPreviousBedsAvailability(_admissionDbContext, patientVisitId);
            return InvokeHttpGetFunction(func);
        }

        #region START HTTP POST APIs

        #region Create Admission
        [HttpPost]
        [Route("Admission")]
        public IActionResult CreateAdmission()
        {
            //if (reqType == "Admission")
            string postStringContent = this.ReadPostData();
            //int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => CreateAdmission(postStringContent);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Add Discharge Summary
        [HttpPost]
        [Route("DischargeSummary")]
        public IActionResult AddDischargeSummary()
        {
            //else if (reqType == "discharge-summary")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => AddDischargeSummary(postStringContent);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Add Admission Remark
        [HttpPost]
        [Route("AdmissionRemark")]
        public IActionResult AddAdmissionRemark()
        {
            //else if (reqType == "post-admission-remark")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => AddAdmissionRemark(postStringContent);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Add Wrist Band HTML
        [HttpPost]
        [Route("WristBand")]
        public IActionResult SaveWristBand()
        {
            //else if (reqType == "saveWristBandHTML")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string PrinterName = this.ReadQueryStringData("PrinterName");
            string FilePath = this.ReadQueryStringData("FilePath");
            Func<object> func = () => SaveWristBandHTML(postStringContent, currentUser, PrinterName, FilePath);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Cancel Discharge Bill
        [HttpPost]
        [Route("CancelDischargeBill")]
        public IActionResult CancelCreditDischargeBill()
        {
            //else if (reqType == "postCancelDischargeBills")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => CancelDischargeBill(postStringContent);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Submit Hemo Dialysis Report
        [HttpPost]
        [Route("HemoDialysisReport")]
        public IActionResult SaveHemoDialysisReport()
        {
            //else if (reqType == "submitHemoReport")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostHemoDialysisReport(postStringContent, currentUser);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Post Patient Birth Certificate
        [HttpPost]
        [Route("BirthCertificate")]
        public IActionResult SavePatientBirthCertificate()
        {
            //else if (reqType == "patient-birth-certificate")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddPatientBirthCertificate(postStringContent, currentUser);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Post Admission Reservation
        [HttpPost]
        [Route("ReserveAdmission")]
        public IActionResult SaveAdmissionReservation()
        {
            //else if (reqType == "post-admission-reservation")
            string postStringContent = this.ReadPostData();
            string action = this.ReadQueryStringData("actionName");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ReserveAdmission(postStringContent, action, currentUser);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Post Discharge On Zero Item
        [HttpPost]
        [Route("DischargeOnZeroItem")]
        public IActionResult DischargeOnZeroItem()
        {
            //else if (reqType == "discharge-zero-item")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => DischargeOnZeroItem(postStringContent, currentUser);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #endregion

        #region Start HTTP PUT APIs

        #region Update Discharge
        [HttpPut]
        [Route("Discharge")]
        public IActionResult UpdateDischarge(int bedInfoId)
        {
            //if (reqType == "discharge")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => DischargePatient(postStringContent, bedInfoId);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Clear Patient Due Amount
        [HttpPut]
        [Route("ClearDueAmount")]
        public IActionResult ClearDue(int patientVisitId)
        {
            //else if (reqType == "clear-due")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ClearPatientDue(patientVisitId, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Transfer Patient
        [HttpPut]
        [Route("Transfer")]
        public IActionResult TransferPatient(int bedInfoId)
        {
            //else if (reqType == "transfer-upgrade")
            string postStringContent = this.ReadPostData();
            var transferredFrom = this.ReadQueryStringData("transferredFrom");
            Func<object> func = () => TransferPatient(transferredFrom, postStringContent, bedInfoId);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Admission Info
        [HttpPut]
        [Route("AdmissionInfo")]
        public IActionResult UpdateAdmission()
        {
            //else if (reqType == "change-admission-info")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => UpdateAdmissionInfo(postStringContent);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Admitting Doctor
        [HttpPut]
        [Route("AdmittingDoctor")]
        public IActionResult ChangeAdmittingDoctor()
        {
            //else if (reqType == "change-admitting-doctor")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => UpdateAdmittingDoctor(postStringContent);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Discharge Summary
        [HttpPut]
        [Route("DischargeSummary")]
        public IActionResult UpdateDischargeSummary()
        {
            //else if (reqType == "update-discharge-summary")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => UpdateDischargeSummary(postStringContent);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Discharge From Billing
        [HttpPut]
        [Route("BillingDischarge")]
        public IActionResult DischargeFromBilling()
        {
            //else if (reqType == "discharge-frombilling")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => DischargeFromBilling(postStringContent, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Admission Procedure
        [HttpPut]
        [Route("AdmissionProcedure")]
        public IActionResult UpdateAdmissionProcedure()
        {
            //else if (reqType == "update-Procedure")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int AdmissionPatientId = ToInt(this.ReadQueryStringData("AdmissionPatientId"));
            string ProcedureType = this.ReadQueryStringData("ProcedureType");
            Func<object> func = () => UpdateProcedure(AdmissionPatientId, ProcedureType, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Cancel Admission
        [HttpPut]
        [Route("CancelAdmission")]
        public IActionResult CancelAdmission()
        {
            //else if (reqType == "cancel-admission")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => CancelAdmission(postStringContent, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Birth Certificate
        [HttpPut]
        [Route("BirthCertificate")]
        public IActionResult UpdateBirthCertificate()
        {
            //else if (reqType == "update-birth-certificate")
            string postStringContent = this.ReadPostData();
            Func<object> func = () => UpdateBirthCertificate(postStringContent);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Update Reserved Admission
        [HttpPut]
        [Route("ReserveAdmission")]
        public IActionResult UpdateAdmissionReservation()
        {
            //else if (reqType == "update-admission-reservation")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateAdmissionReservation(postStringContent, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Cancel Reserved Admission
        [HttpPut]
        [Route("CancelReserveAdmission")]
        public IActionResult CancelReservedAdmission()
        {
            //else if (reqType == "cancel-admission-reservation")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => CancelReservedAdmission(postStringContent, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Undo Reserved Admission
        [HttpPut]
        [Route("UndoTransfer")]
        public IActionResult UndoTransfer()
        {
            //else if (reqType == "undo-transfer")
            string postStringContent = this.ReadPostData();
            string remarks = this.ReadQueryStringData("cancelRemarks");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UndoTransfer(postStringContent, currentUser, remarks);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Put Transfer
        [HttpPut]
        [Route("AdmitTransferredPatient")]
        public IActionResult ReceiveTransfer()
        {
            //        else if (reqType == "receive-transfer")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => ReceiveTransfer(postStringContent, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #endregion

        private void PostSMS(SmsModel smsmdl, string docnum, AdmissionDbContext dbContext)
        {
            using (var client = new WebClient())
            {
                {
                    var values = new NameValueCollection();
                    values["from"] = "Demo";
                    values["token"] = "1eZClpxXFuZXd7PJ0xmv";
                    values["to"] = docnum;
                    values["text"] = smsmdl.SmsInformation;
                    var response = client.UploadValues("http://api.sparrowsms.com/v2/sms/", "Post", values);
                    var responseString = Encoding.Default.GetString(response);
                    SmsModel responseSms = DanpheJSONConvert.DeserializeObject<SmsModel>(responseString);
                    //smsmdl.SmsCounter = responseSms.count;
                    //var smscount = smsmdl.SmsCounter;
                    //return responseString; 



                    //if (smscount == 200)


                    dbContext.SmsService.Add(smsmdl);
                    dbContext.SaveChanges();

                }
            }
        }

        private void UpdateIsOccupiedStatus(int bedId, bool status)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                BedModel selectedBed = dbContext.Beds
                    .Where(b => b.BedId == bedId)
                    .FirstOrDefault();
                selectedBed.IsOccupied = status;
                dbContext.Entry(selectedBed).State = EntityState.Modified;
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private object CreateAdmissionTransaction(AdmissionDbContext admissionDb, AdmissionModel admissionFromClient, string connString)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
            //var userList = rbacDbContext.Users.ToList();

            using (var dbContextTransaction = admissionDb.Database.BeginTransaction())
            {
                try
                {
                    BillingFiscalYear fiscalYear = BillingBL.GetFiscalYear(base.connString);
                    var currentDate = DateTime.Now;

                    var billingTransaction = admissionFromClient.BillingTransaction;
                    var billingTransactionItems = admissionFromClient.BillingTransaction.BillingTransactionItems;

                    //add visit
                    var visit = VisitBL.GetVisitItemsMapped(admissionFromClient.PatientId,
                        "inpatient",
                        admissionFromClient.AdmittingDoctorId,
                        admissionFromClient.AdmissionDate,
                        admissionFromClient.PriceCategoryId,
                        admissionFromClient.DiscountSchemeId,
                        currentUser.EmployeeId,
                        connString);
                    visit.Ins_HasInsurance = admissionFromClient.Ins_HasInsurance;
                    var scheme = admissionDb.Schemes.FirstOrDefault(a => a.SchemeId == visit.SchemeId);
                    var priceCategory = admissionDb.PriceCategoryModels.Where(a => a.PriceCategoryId == visit.PriceCategoryId).FirstOrDefault();
                    //if (scheme.IsBillingCoPayment == true)
                    //{
                    //    Random generator = new Random();
                    //    String r = generator.Next(1, 10000).ToString("D4");
                    //    visit.ClaimCode = Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
                    //}

                    //if (visit.Ins_HasInsurance == true)
                    //{
                    //    //Need to generate new claimcode when LastClaimCode is not used..
                    //    if (admissionFromClient.IsLastClaimCodeUsed == false)
                    //    {
                    //        INS_NewClaimCodeDTO newClaimObj = GovInsuranceBL.GetGovInsNewClaimCode(admissionDb);
                    //        visit.ClaimCode = newClaimObj.NewClaimCode;
                    //    }
                    //    else
                    //    {
                    //        visit.ClaimCode = admissionFromClient.ClaimCode;
                    //    }
                    //}


                    //Krishna, 5thJun'23, this will generate ClaimCode..
                    var creditOrganization = admissionDb.CreditOrganizations.FirstOrDefault(a => a.OrganizationId == scheme.DefaultCreditOrganizationId);

                    var INSParameter = admissionDb.CFGParameters.Where(a => a.ParameterGroupName == "Insurance" && a.ParameterName == "ClaimCodeAutoGenerateSettings").FirstOrDefault().ParameterValue;
                    var claimcodeParameter = Newtonsoft.Json.Linq.JObject.Parse(INSParameter);
                    var EnableAutoGenerate = Convert.ToBoolean(claimcodeParameter["EnableAutoGenerate"]);
                    int SchemeId = Convert.ToInt32(claimcodeParameter["SchemeId"]);

                    if (creditOrganization != null && creditOrganization.IsClaimCodeAutoGenerate && EnableAutoGenerate && SchemeId == scheme.SchemeId)
                    {
                        NewClaimCode_DTO newClaimObj = GetLatestClaimCode(admissionDb, scheme.SchemeId);
                        visit.ClaimCode = newClaimObj.NewClaimCode;
                    }
                    else
                    {
                        var patient = admissionDb.Patients.FirstOrDefault(a => a.PatientId == admissionFromClient.PatientId);
                        if (creditOrganization != null && creditOrganization.IsClaimManagementApplicable && creditOrganization.IsClaimCodeCompulsory && creditOrganization.IsClaimCodeAutoGenerate && admissionFromClient.PatientSchemesMap.LatestClaimCode == null)
                        {
                            visit.ClaimCode = GenerateClaimCode(admissionDb, admissionFromClient.PatientId, patient);
                        }

                        if (creditOrganization != null && creditOrganization.IsClaimManagementApplicable && creditOrganization.IsClaimCodeCompulsory && !creditOrganization.IsClaimCodeAutoGenerate && admissionFromClient.PatientSchemesMap.LatestClaimCode != null)
                        {
                            visit.ClaimCode = admissionFromClient.PatientSchemesMap.LatestClaimCode;
                        }

                        if (creditOrganization != null && creditOrganization.IsClaimManagementApplicable && !creditOrganization.IsClaimCodeCompulsory && !creditOrganization.IsClaimCodeAutoGenerate && admissionFromClient.PatientSchemesMap.LatestClaimCode != null)
                        {
                            visit.ClaimCode = admissionFromClient.PatientSchemesMap.LatestClaimCode;
                        }
                    }


                    visit.DepartmentId = (int)admissionFromClient.RequestingDeptId;
                    admissionDb.Visits.Add(visit);
                    GenerateUniqueVisitCodeAndSaveChanges(admissionDb, visit, connString); //Krishna, 18th,Jul'22, this function will work in the recursive manner if the visitcode is getting duplicate.



                    var refPatMap = admissionDb.PatientSchemeMaps.Where(a => a.PatientId == admissionFromClient.PatientId && a.SchemeId == visit.SchemeId)
                                    .OrderByDescending(a => a.PatientSchemeId).FirstOrDefault();
                    if (refPatMap != null)
                    {
                        refPatMap.ModifiedBy = currentUser.EmployeeId;
                        refPatMap.ModifiedOn = DateTime.Now;
                        refPatMap.LatestClaimCode = visit.ClaimCode;
                        refPatMap.PolicyHolderEmployerID = admissionFromClient.PatientSchemesMap.PolicyHolderEmployerID;
                        refPatMap.PolicyHolderEmployerName = admissionFromClient.PatientSchemesMap.PolicyHolderEmployerName;
                        //refPatMap.IpCreditLimit = admissionFromClient.PatientSchemesMap.IpCreditLimit;

                        if (scheme.IsGeneralCreditLimited)
                        {
                            refPatMap.GeneralCreditLimit = admissionFromClient.PatientSchemesMap.GeneralCreditLimit - (decimal)admissionFromClient.BillingTransaction.TotalAmount;
                        }
                        if (scheme.IsIpCreditLimited)
                        {
                            refPatMap.IpCreditLimit = admissionFromClient.PatientSchemesMap.IpCreditLimit - (decimal)admissionFromClient.BillingTransaction.TotalAmount;
                        }
                        refPatMap.OpCreditLimit = admissionFromClient.PatientSchemesMap.OpCreditLimit;
                        refPatMap.RegistrationCase = admissionFromClient.PatientSchemesMap.RegistrationCase;
                        refPatMap.RegistrationSubCase = admissionFromClient.PatientSchemesMap.RegistrationSubCase;
                        refPatMap.LatestPatientVisitId = visit.PatientVisitId;

                        admissionDb.Entry(refPatMap).Property(p => p.ModifiedBy).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.ModifiedOn).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.LatestClaimCode).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.PolicyHolderEmployerID).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.PolicyHolderEmployerName).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.IpCreditLimit).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.OpCreditLimit).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.GeneralCreditLimit).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.RegistrationCase).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.RegistrationSubCase).IsModified = true;
                        admissionDb.Entry(refPatMap).Property(p => p.LatestPatientVisitId).IsModified = true;
                    }
                    else
                    {
                        var patient = admissionDb.Patients.Where(a => a.PatientId == admissionFromClient.PatientId).FirstOrDefault();
                        var map = new PatientSchemeMapModel();
                        map.SchemeId = visit.SchemeId;
                        map.PolicyNo = admissionFromClient.PatientSchemesMap.PolicyNo;
                        map.RegistrationCase = admissionFromClient.PatientSchemesMap.RegistrationCase;
                        map.RegistrationSubCase = admissionFromClient.PatientSchemesMap.RegistrationSubCase;
                        map.PolicyHolderEmployerID = admissionFromClient.PatientSchemesMap.PolicyHolderEmployerID;
                        map.PolicyHolderEmployerName = admissionFromClient.PatientSchemesMap.PolicyHolderEmployerName;
                        map.PolicyHolderUID = admissionFromClient.PatientSchemesMap.PolicyHolderUID;
                        map.OpCreditLimit = admissionFromClient.PatientSchemesMap.OpCreditLimit;
                        if (scheme.IsGeneralCreditLimited)
                        {
                            map.GeneralCreditLimit = admissionFromClient.PatientSchemesMap.GeneralCreditLimit - (decimal)admissionFromClient.BillingTransaction.TotalAmount;
                        }
                        if (scheme.IsIpCreditLimited)
                        {
                            map.IpCreditLimit = admissionFromClient.PatientSchemesMap.IpCreditLimit - (decimal)admissionFromClient.BillingTransaction.TotalAmount;
                        }
                        //map.IpCreditLimit = admissionFromClient.PatientSchemesMap.IpCreditLimit;
                        map.LatestClaimCode = visit.ClaimCode;
                        map.CreatedOn = DateTime.Now;
                        map.CreatedBy = currentUser.EmployeeId;
                        map.LatestPatientVisitId = visit.PatientVisitId;
                        map.PatientId = visit.PatientId;
                        map.PriceCategoryId = (int)visit.PriceCategoryId;
                        map.PatientCode = patient.PatientCode;
                        map.IsActive = true;
                        admissionDb.PatientSchemeMaps.Add(map);
                    }


                    //update latest claimcode in patient table only after visit is saved..
                    if (visit.Ins_HasInsurance == true)
                    {
                        GovInsuranceBL.UpdateLatestClaimCode(connString, visit.PatientId, visit.ClaimCode, currentUser.EmployeeId);
                        admissionFromClient.ClaimCode = visit.ClaimCode;//actual claimcode is generated and already assigned to visit object.. we need to reuse that.
                    }

                    //adding admission
                    admissionFromClient.CreatedOn = currentDate;
                    admissionFromClient.CreatedBy = currentUser.EmployeeId;
                    admissionFromClient.PatientVisitId = visit.PatientVisitId;
                    admissionFromClient.PatientBedInfos[0].CreatedOn = currentDate;
                    admissionFromClient.PatientBedInfos[0].CreatedBy = currentUser.EmployeeId;
                    admissionFromClient.PatientBedInfos[0].PatientVisitId = visit.PatientVisitId;
                    var checkInsurancePatient = visit.Ins_HasInsurance;
                    admissionFromClient.IsInsurancePatient = (checkInsurancePatient == true) ? true : false;

                    admissionDb.Admissions.Add(admissionFromClient);

                    //updaing bed status

                    //Check for autocancellation of the bed and cancel accordingly
                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in admissionDb.CFGParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();
                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    int bedId = admissionFromClient.PatientBedInfos[0].BedId;
                    int reservedBedId = admissionFromClient.PatientBedInfos[0].ReservedBedId.HasValue ? admissionFromClient.PatientBedInfos[0].ReservedBedId.Value : 0;

                    BedModel selBed = admissionDb.Beds.Where(b => b.BedId == bedId
                                        && b.IsActive == true && b.IsOccupied == false).FirstOrDefault();

                    if (selBed != null)
                    {
                        //if this bed is reserved then it has to be checked for autocancelled 
                        //and Is It Reserved by same patient
                        if (selBed.IsReserved == true)
                        {
                            //show who reserved it
                            ADTBedReservation oldRes = (from bed in admissionDb.BedReservation
                                                        where bed.BedId == selBed.BedId
                                                        && bed.IsActive == true
                                                        select bed).FirstOrDefault();

                            //check for this reservation for autocancellation 
                            if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                            {
                                oldRes.IsAutoCancelled = true;
                                oldRes.IsActive = false;
                                oldRes.AutoCancelledOn = System.DateTime.Now;

                                admissionDb.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                admissionDb.Entry(oldRes).Property(b => b.IsAutoCancelled).IsModified = true;
                                admissionDb.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                admissionDb.SaveChanges();
                            }
                            //it is other whos has reserved it
                            else if (oldRes.ReservedBedInfoId != reservedBedId)
                            {
                                dbContextTransaction.Rollback();
                                throw new Exception("Selected Bed is either already Reserved or Occupied !");
                            }
                        }

                        //this is patient itself who has reserved it
                        if (reservedBedId > 0)
                        {
                            var resbed = (from res in admissionDb.BedReservation
                                          where res.ReservedBedInfoId == reservedBedId
                                          select res).FirstOrDefault();
                            resbed.IsActive = false;
                            admissionDb.Entry(resbed).Property(b => b.IsActive).IsModified = true;
                            admissionDb.SaveChanges();
                        }


                        selBed.IsReserved = false;
                        selBed.IsOccupied = true;
                        selBed.ModifiedBy = currentUser.EmployeeId;
                        selBed.ModifiedOn = currentDate;
                        admissionDb.Beds.Attach(selBed);
                        admissionDb.Entry(selBed).Property(a => a.IsOccupied).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.IsReserved).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.ModifiedBy).IsModified = true;
                        admissionDb.Entry(selBed).Property(a => a.ModifiedBy).IsModified = true;


                    }

                    //Krishna, 27thApril'23, get the Default DepositHeadId ..
                    var DefaultDepositHead = _admissionDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
                    int DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;
                    //for return deposit from OP

                    BillingDepositModel deposit = (from dpt in admissionDb.BillDeposit
                                                   where dpt.PatientId == admissionFromClient.PatientId
                                                   select dpt).OrderByDescending(a => a.DepositId).FirstOrDefault();
                    int? depositReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                    if (deposit != null)
                    {
                        BillingDbContext billDbContext = new BillingDbContext(connString);
                        //return deposit
                        if (deposit.DepositBalance > 0)
                        {
                            BillingDepositModel returnOutPat = new BillingDepositModel();
                            returnOutPat.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;// "ReturnDeposit";
                            returnOutPat.Remarks = "Deposit transfer from OutPatient to Inpatient Visit Deposit.";
                            //returnOutPat.Amount = deposit.DepositBalance;
                            returnOutPat.OutAmount = deposit.DepositBalance;
                            returnOutPat.InAmount = 0;
                            returnOutPat.IsActive = true;
                            returnOutPat.DepositBalance = 0;
                            returnOutPat.FiscalYearId = fiscalYear.FiscalYearId;
                            returnOutPat.CounterId = admissionFromClient.BilDeposit.CounterId;
                            returnOutPat.CreatedOn = currentDate;
                            returnOutPat.CreatedBy = currentUser.EmployeeId;
                            returnOutPat.PatientId = admissionFromClient.BilDeposit.PatientId;
                            //returnOutPat.PatientVisitId = admissionFromClient.BilDeposit.PatientVisitId;
                            returnOutPat.IsTransferTransaction = true;
                            returnOutPat.ReceiptNo = depositReceiptNo;
                            returnOutPat.ModuleName = ENUM_ModuleNames.Billing;
                            returnOutPat.OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient;
                            returnOutPat.DepositHeadId = DepositHeadId;
                            returnOutPat.VisitType = deposit.VisitType;
                            depositReceiptNo = depositReceiptNo + 1;

                            admissionDb.BillDeposit.Add(returnOutPat);
                            admissionDb.SaveChanges();

                            returnOutPat.FiscalYear = fiscalYear.FiscalYearName;

                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                            empCashTransaction.ReferenceNo = returnOutPat.DepositId;
                            empCashTransaction.InAmount = 0;
                            //empCashTransaction.OutAmount = returnOutPat.Amount;
                            empCashTransaction.OutAmount = (double)returnOutPat.OutAmount;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = returnOutPat.CounterId;
                            empCashTransaction.PatientId = returnOutPat.PatientId;
                            empCashTransaction.PaymentModeSubCategoryId = GetCashPaymentModeSubCategoryId();
                            empCashTransaction.ModuleName = "Billing";

                            BillingBL.AddEmpCashTransaction(billDbContext, empCashTransaction);
                        }


                        //transfer deposit to Inpatient Visit
                        if (deposit.DepositBalance > 0)
                        {
                            BillingDepositModel InPatDeposit = new BillingDepositModel();

                            InPatDeposit.TransactionType = ENUM_DepositTransactionType.Deposit;// "Deposit";
                            InPatDeposit.Remarks = "Transfered from Outpatient Visit Deposit.";
                            //InPatDeposit.Amount = deposit.DepositBalance;
                            InPatDeposit.InAmount = deposit.DepositBalance;
                            InPatDeposit.IsActive = true;
                            InPatDeposit.DepositBalance = deposit.DepositBalance;
                            InPatDeposit.FiscalYearId = fiscalYear.FiscalYearId;
                            InPatDeposit.CounterId = admissionFromClient.BilDeposit.CounterId;
                            InPatDeposit.CreatedOn = currentDate;
                            InPatDeposit.CreatedBy = currentUser.EmployeeId;
                            InPatDeposit.PatientId = admissionFromClient.BilDeposit.PatientId;
                            InPatDeposit.PatientVisitId = visit.PatientVisitId;
                            InPatDeposit.ReceiptNo = depositReceiptNo;
                            depositReceiptNo = depositReceiptNo + 1;
                            InPatDeposit.IsTransferTransaction = true;
                            InPatDeposit.ModuleName = ENUM_ModuleNames.Billing;
                            InPatDeposit.OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient;
                            InPatDeposit.DepositHeadId = DepositHeadId;
                            InPatDeposit.VisitType = ENUM_VisitType.outpatient;

                            admissionDb.BillDeposit.Add(InPatDeposit);
                            admissionDb.SaveChanges();

                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_DepositTransactionType.Deposit;
                            empCashTransaction.ReferenceNo = InPatDeposit.DepositId;
                            //empCashTransaction.InAmount = InPatDeposit.Amount;
                            empCashTransaction.InAmount = (double)InPatDeposit.InAmount;
                            empCashTransaction.OutAmount = 0;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = InPatDeposit.CounterId;
                            empCashTransaction.PatientId = InPatDeposit.PatientId;
                            empCashTransaction.PaymentModeSubCategoryId = GetCashPaymentModeSubCategoryId();
                            empCashTransaction.ModuleName = "Billing";

                            BillingBL.AddEmpCashTransaction(billDbContext, empCashTransaction);

                        }
                    }

                    BillingDbContext billingDbContext = new BillingDbContext(connString);
                    //adding deposit
                    if (admissionFromClient.BilDeposit.InAmount > 0)
                    {
                        admissionFromClient.BilDeposit.CreatedOn = currentDate;
                        //admissionFromClient.BilDeposit.DepositBalance = admissionFromClient.BilDeposit.DepositBalance;
                        admissionFromClient.BilDeposit.CreatedBy = currentUser.EmployeeId;
                        admissionFromClient.BilDeposit.PatientVisitId = visit.PatientVisitId;
                        admissionFromClient.BilDeposit.FiscalYearId = fiscalYear.FiscalYearId;
                        admissionFromClient.BilDeposit.ReceiptNo = depositReceiptNo;
                        admissionFromClient.BilDeposit.ModuleName = ENUM_ModuleNames.Billing;
                        admissionFromClient.BilDeposit.OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient;
                        admissionFromClient.BilDeposit.DepositHeadId = DepositHeadId;
                        admissionFromClient.BilDeposit.VisitType = ENUM_VisitType.inpatient;

                        admissionDb.BillDeposit.Add(admissionFromClient.BilDeposit);
                        admissionDb.SaveChanges();

                        List<EmpCashTransactionModel> empCashTransactionModel = new List<EmpCashTransactionModel>();
                        for (int i = 0; i < admissionFromClient.BilDeposit.empCashTransactionModel.Count; i++)
                        {
                            EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                            empCashTransaction.TransactionType = ENUM_DepositTransactionType.Deposit;
                            empCashTransaction.ReferenceNo = admissionFromClient.BilDeposit.DepositId;
                            //empCashTransaction.InAmount = admissionFromClient.BilDeposit.Amount;
                            empCashTransaction.InAmount = admissionFromClient.BilDeposit.empCashTransactionModel[i].InAmount;
                            empCashTransaction.OutAmount = 0;
                            empCashTransaction.EmployeeId = currentUser.EmployeeId;
                            //empCashTransaction.Description = billingTransaction.de;
                            empCashTransaction.TransactionDate = DateTime.Now;
                            empCashTransaction.CounterID = admissionFromClient.BilDeposit.CounterId;
                            empCashTransaction.PatientId = admissionFromClient.PatientId;
                            empCashTransaction.ModuleName = "ADT";
                            empCashTransaction.PaymentModeSubCategoryId = admissionFromClient.BilDeposit.empCashTransactionModel[i].PaymentModeSubCategoryId;
                            empCashTransactionModel.Add(empCashTransaction);
                        }
                        BillingBL.AddEmpCashtransactionForBilling(billingDbContext, empCashTransactionModel);
                    }
                    //adding admission related charges
                    //var admissionBillItems = GetADTBillingTransactionItems(admissionDb,
                    //    admissionFromClient.PatientId,
                    //    visit.PatientVisitId,
                    //    admissionFromClient.BilDeposit.CounterId,
                    //    currentUser.EmployeeId,
                    //    admissionFromClient.PatientBedInfos[0].BedFeatureId,
                    //    admissionFromClient.AdmissionDate,
                    //    admissionFromClient.PriceCategoryId);
                    var admissionBillItems = admissionFromClient.BillingTransaction.BillingTransactionItems;

                    foreach (BillingTransactionItemModel itm in admissionBillItems)
                    {
                        //if (itm.ServiceDepartmentName == "Bed Charges")
                        //{
                        //    itm.Quantity = 0;
                        //}
                        //if (admissionFromClient.Ins_HasInsurance == true)
                        //{
                        //    var billItm = admissionDb.BillServiceItems.Where(a => a.IntegrationItemId == itm.ItemId && a.ServiceDepartmentId == itm.ServiceDepartmentId).FirstOrDefault();
                        //    itm.IsInsurance = true;
                        //    itm.Price = 0; //billItm.GovtInsurancePrice ?? 0; //Krishna, 12thMarch'23 Need to revise this code, we are assigning 0 for now
                        //    itm.DiscountSchemeId = (int)admissionFromClient.DiscountSchemeId;
                        //}
                        //else
                        //{
                        //    itm.IsInsurance = false;
                        //    itm.DiscountSchemeId = (int)admissionFromClient.DiscountSchemeId;
                        //}
                        //itm.PriceCategory = GetPriceCategoryIdFromLastVisit(admissionDb, admissionFromClient.PatientVisitId);
                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                        var ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                        int ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                        itm.PatientVisitId = admissionFromClient.PatientVisitId;
                        itm.ProvisionalReceiptNo = ProvisionalReceiptNo;
                        itm.ProvisionalFiscalYearId = ProvisionalFiscalYearId;
                        itm.CreatedBy = currentUser.EmployeeId;
                        itm.CreatedOn = admissionFromClient.AdmissionDate;
                        itm.CounterDay = DateTime.Now;
                        itm.BillStatus = ENUM_BillingStatus.provisional;
                        itm.BillingType = ENUM_BillingType.inpatient;
                        itm.VisitType = ENUM_VisitType.inpatient;
                        itm.PatientId = admissionFromClient.PatientId;
                        admissionDb.BillTxnItem.Add(itm);
                    }
                    admissionDb.SaveChanges();

                    if (admissionFromClient.IsBillingEnabled == true)
                    {
                        var billItems = billingTransaction.BillingTransactionItems;

                        billingTransaction.PatientId = admissionFromClient.PatientId;
                        billingTransaction.PatientVisitId = visit.PatientVisitId;
                        billingTransaction.FiscalYearId = fiscalYear.FiscalYearId;
                        billingTransaction.FiscalYear = fiscalYear.FiscalYearName;
                        billingTransaction.InvoiceCode = (visit.Ins_HasInsurance == true) ? "INS" : "BL";
                        billingTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                        billingTransaction.TransactionType = "inpatient";
                        billingTransaction.CreatedBy = currentUser.EmployeeId;
                        billingTransaction.CreatedOn = currentDate;

                        if (visit.Ins_HasInsurance == false)
                        {
                            if (billingTransaction.PaymentMode == "credit")
                            {
                                billingTransaction.BillStatus = ENUM_BillingStatus.unpaid;
                                billingTransaction.PaidAmount = 0;
                                billingTransaction.PaidDate = null;
                                billingTransaction.PaymentReceivedBy = null;
                                billingTransaction.PaidCounterId = null;
                            }
                            else if (billingTransaction.PaymentMode == "cash")
                            {
                                billingTransaction.BillStatus = ENUM_BillingStatus.paid;
                                billingTransaction.PaidDate = currentDate;
                                billingTransaction.PaymentReceivedBy = currentUser.EmployeeId;
                                billingTransaction.PaidCounterId = billingTransaction.CounterId;
                                billingTransaction.PaidAmount = billingTransaction.TotalAmount;
                            }
                            else
                            {
                                throw new Exception("Unhandled Payment Mode found");
                            }
                        }
                        else
                        {
                            billingTransaction.BillStatus = ENUM_BillingStatus.unpaid;
                            billingTransaction.InsuranceProviderId = 1; ///for now there is only one provider, which is Gov Insurance so given 1
                            billingTransaction.ClaimCode = admissionFromClient.ClaimCode;
                        }
                        billingTransaction.InvoiceType = "ip-partial";
                        billingTransaction.BillingTransactionItems = new List<BillingTransactionItemModel>();
                        admissionDb.BillingTransactions.Add(billingTransaction);
                        admissionDb.SaveChanges();


                        if (billingTransaction.PaymentMode == "cash")
                        { //If transaction is done with Depositor paymentmode is credit we don't have to add in EmpCashTransaction table
                            List<EmpCashTransactionModel> empCashTransactionModel = new List<EmpCashTransactionModel>();
                            for (int i = 0; i < billingTransaction.EmployeeCashTransaction.Count; i++)
                            {
                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = "CashSales";
                                empCashTransaction.ReferenceNo = billingTransaction.BillingTransactionId;
                                //empCashTransaction.InAmount = billingTransaction.TotalAmount;
                                empCashTransaction.InAmount = billingTransaction.EmployeeCashTransaction[i].InAmount;
                                empCashTransaction.OutAmount = 0;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                empCashTransaction.TransactionDate = DateTime.Now;
                                empCashTransaction.CounterID = billingTransaction.CounterId;
                                empCashTransaction.PatientId = billingTransaction.PatientId;
                                empCashTransaction.ModuleName = "ADT";
                                empCashTransaction.PaymentModeSubCategoryId = billingTransaction.EmployeeCashTransaction[i].PaymentModeSubCategoryId;
                                empCashTransactionModel.Add(empCashTransaction);
                            }
                            BillingBL.AddEmpCashtransactionForBilling(billingDbContext, empCashTransactionModel); ;
                        }

                        foreach (var item in billItems)
                        {

                            item.BillStatus = billingTransaction.BillStatus;//item must have same billstatus as that of Invoice.


                            item.BillingTransactionId = billingTransaction.BillingTransactionId;
                            item.PatientId = billingTransaction.PatientId;
                            item.PatientVisitId = billingTransaction.PatientVisitId;
                            item.DiscountSchemeId = (int)admissionFromClient.DiscountSchemeId;
                            item.CounterId = billingTransaction.CounterId;
                            if (visit.Ins_HasInsurance == false)
                            {
                                item.PaidDate = currentDate;
                                item.PaymentReceivedBy = currentUser.EmployeeId;
                                item.PaidCounterId = billingTransaction.CounterId;
                            }
                            item.VisitType = ENUM_VisitType.inpatient;
                            item.BillingType = ENUM_BillingType.inpatient;
                            item.CreatedBy = currentUser.EmployeeId;
                            item.CreatedOn = currentDate;
                            admissionDb.BillTxnItem.Add(item);
                        }

                        admissionDb.SaveChanges();
                    }


                    //commit transaction
                    dbContextTransaction.Commit();

                    //check and update invoice number only when BillingInvoice is generated from the Frontend..
                    //else no need.
                    //Remarks: Also need to add condition check for Transaction committed or not. 
                    if (admissionFromClient.IsBillingEnabled == true)
                    {
                        //Starts: This code is for Temporary solution for Checking and Updating the Invoice Number if there is duplication Found
                        List<SqlParameter> paramList = new List<SqlParameter>() {
                                new SqlParameter("@fiscalYearId", billingTransaction.FiscalYearId),
                                new SqlParameter("@billingTransactionId", billingTransaction.BillingTransactionId),
                                new SqlParameter("@invoiceNumber", billingTransaction.InvoiceNo)
                            };

                        DataSet dataFromSP = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Update_Duplicate_Invoice_If_Exists", paramList, billingDbContext);
                        var data = new List<object>();
                        if (dataFromSP.Tables.Count > 0)
                        {
                            billingTransaction.InvoiceNo = Convert.ToInt32(dataFromSP.Tables[0].Rows[0]["LatestInvoiceNumber"].ToString());
                        }
                    }

                    var userId = admissionFromClient.BilDeposit.CreatedBy;
                    var username = (from user in rbacDbContext.Users
                                    where user.EmployeeId == userId
                                    select user.UserName).FirstOrDefault();
                    admissionFromClient.BilDeposit.BillingUser = username;
                    admissionFromClient.BilDeposit.FiscalYear = fiscalYear.FiscalYearName;
                    admissionFromClient.BillingTransaction = billingTransaction;

                    return admissionFromClient;
                }
                catch (Exception ex)
                {
                    //rollback all changes if any error occurs
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }


        public static NewClaimCode_DTO GetLatestClaimCode(AdmissionDbContext admissionDbContext, int schemeId)
        {
            NewClaimCode_DTO newClaimObj = admissionDbContext.Database.SqlQuery<NewClaimCode_DTO>("SP_Claim_GenerateNewClaimCode" + " " + schemeId).FirstOrDefault();
            return newClaimObj;
        }


        private static Int64? GenerateClaimCode(AdmissionDbContext admissionDbContext, int currPatientId, PatientModel patient)
        {
            Random generator = new Random();
            String r = generator.Next(1, 10000).ToString("D4");
            return Int64.Parse(r + DateTime.Now.Minute + DateTime.Now.Second);
        }

        private string GetPriceCategoryIdFromLastVisit(AdmissionDbContext admissionDb, int patientVisitId)
        {
            var priceCategory = "Normal";

            var PriceCategoryId = admissionDb.Visits.Where(a => a.PatientVisitId == patientVisitId).Select(a => a.PriceCategoryId).FirstOrDefault();
            var priceCategoryObj = admissionDb.PriceCategoryModels.Where(a => a.PriceCategoryId == PriceCategoryId).FirstOrDefault();
            if (priceCategoryObj != null)
            {
                priceCategory = priceCategoryObj.PriceCategoryName;
            }

            return priceCategory;
        }

        private void GenerateUniqueVisitCodeAndSaveChanges(AdmissionDbContext admissionDb, VisitModel visit, string connString)
        {
            try
            {
                visit.VisitCode = VisitBL.CreateNewPatientVisitCode(visit.VisitType, connString);

                admissionDb.SaveChanges();
            }
            catch (Exception ex)
            {

                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error 
                        {
                            GenerateUniqueVisitCodeAndSaveChanges(admissionDb, visit, connString);
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

        private int GetCashPaymentModeSubCategoryId()
        {
            var paymentModeSubCategoryId = 0;
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            var paymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }

        private List<BillingTransactionItemModel> GetADTBillingTransactionItems(AdmissionDbContext admissionDb,
            int patientId,
            int patVisitId,
            int counterId,
            int userId,
            int bedFeatureId,
            DateTime currentDate,
            int priceCategoryId)
        {
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            var parameter = coreDbContext.Parameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "AutoAddBillingItems").FirstOrDefault();
            var billItems = new List<BillingItemVM>();
            var billingTransactionItems = new List<BillingTransactionItemModel>();
            if (parameter != null && parameter.ParameterValue != null)
            {
                ADTAutoAddItemParameterVM adtParameter = DanpheJSONConvert.DeserializeObject<ADTAutoAddItemParameterVM>(parameter.ParameterValue);
                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                var ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                int ProvisionalFiscalYearId = fiscYear.FiscalYearId;

                if (adtParameter != null)
                {
                    //if (adtParameter != null && adtParameter.DoAutoAddBillingItems == true && adtParameter.ItemList.Count > 0)
                    if (adtParameter.DoAutoAddBillingItems == true && adtParameter.ItemList.Count > 0)
                    {
                        //var billItems = (from bilItem in admissionDb.BillItemPrice
                        //                 join servDept in admissionDb.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                        //                 where bilItem.IntegrationName == "ADMISSION CHARGES (INDOOR)" || bilItem.IntegrationName == "Medical and Resident officer/Nursing Charges"
                        //                 || bilItem.IntegrationName == "Medical Record Charge"
                        //                 select new BillingItemVM
                        //                 {
                        //                     ItemId = bilItem.ItemId,
                        //                     ItemName = bilItem.ItemName,
                        //                     ItemPrice = bilItem.Price,
                        //                     TaxApplicable = bilItem.TaxApplicable,
                        //                     ServiceDepartmentId = bilItem.ServiceDepartmentId,
                        //                     ServiceDepartmentName = servDept.ServiceDepartmentName,
                        //                     ProcedureCode = bilItem.ProcedureCode
                        //                 }).ToList();


                        var allBillItems = (from bilItem in admissionDb.BillServiceItems
                                            join servDept in admissionDb.ServiceDepartment on bilItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                            join priceCatServItem in admissionDb.BillPriceCategoryServiceItems on bilItem.ServiceItemId equals priceCatServItem.ServiceItemId
                                            where priceCatServItem.PriceCategoryId == priceCategoryId //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for now
                                            select new BillingItemVM
                                            {
                                                IntegrationItemId = bilItem.IntegrationItemId,
                                                ItemName = bilItem.ItemName,
                                                ItemPrice = (double)priceCatServItem.Price,
                                                TaxApplicable = bilItem.IsTaxApplicable,
                                                ServiceDepartmentId = bilItem.ServiceDepartmentId,
                                                ServiceDepartmentName = servDept.ServiceDepartmentName,
                                                ServiceItemId = bilItem.ServiceItemId,
                                                ItemCode = bilItem.ItemCode,
                                                //ProcedureCode = bilItem.ProcedureCode
                                            }).ToList();

                        adtParameter.ItemList.ForEach(autoItem =>
                        {
                            var billItem = allBillItems.Find(a => a.ServiceDepartmentId == autoItem.ServiceDepartmentId && a.IntegrationItemId == autoItem.ItemId);
                            if (billItem != null)
                            {
                                billItems.Add(billItem);
                            }
                        });
                        billItems.ForEach(item =>
                        {
                            billingTransactionItems.Add(GetBillItemsMapped(item, patientId, patVisitId, counterId, userId, currentDate, ProvisionalFiscalYearId, ProvisionalReceiptNo, priceCategoryId));
                        });
                    }

                    if (adtParameter.DoAutoAddBedItem == true)
                    {
                        //var bedFeature = admissionDb.BedFeatures.Where(a => a.BedFeatureId == bedFeatureId).FirstOrDefault();
                        var BedbillItm = (from bilItm in admissionDb.BillServiceItems
                                          join serviceItemPriceCategoryMap in _admissionDbContext.BillPriceCategoryServiceItems on
                                          new { bilItm.ServiceItemId, bilItm.ServiceDepartmentId } equals new { serviceItemPriceCategoryMap.ServiceItemId, serviceItemPriceCategoryMap.ServiceDepartmentId }
                                          join servDept in admissionDb.ServiceDepartment on bilItm.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                          where bilItm.IntegrationItemId == bedFeatureId && servDept.IntegrationName == "Bed Charges " && bilItm.IntegrationName == "Bed Charges"
                                          && serviceItemPriceCategoryMap.PriceCategoryId == priceCategoryId
                                          select new BillingItemVM
                                          {
                                              IntegrationItemId = bilItm.IntegrationItemId,
                                              ItemName = bilItm.ItemName,
                                              ItemPrice = (double)serviceItemPriceCategoryMap.Price,
                                              TaxApplicable = bilItm.IsTaxApplicable,
                                              ServiceDepartmentId = bilItm.ServiceDepartmentId,
                                              ServiceDepartmentName = servDept.ServiceDepartmentName,
                                              ServiceItemId = bilItm.ServiceItemId,
                                              ItemCode = bilItm.ItemCode,
                                              //ProcedureCode = bilItm.ProcedureCode
                                          }).FirstOrDefault();
                        billingTransactionItems.Add(GetBillItemsMapped(BedbillItm, patientId, patVisitId, counterId, userId, currentDate, ProvisionalFiscalYearId, ProvisionalReceiptNo, priceCategoryId));
                    }
                }
            }
            return billingTransactionItems;
        }

        private BillingTransactionItemModel GetBillItemsMapped(BillingItemVM item, int patientId,
            int patVisitId,
            int counterId,
            int userId,
            DateTime currentDate,
            int? ProvFiscalYearId,
            int? ProvReceiptNo,
            int priceCategoryId)
        {
            var billTxnItem = new BillingTransactionItemModel();
            billTxnItem.PatientId = patientId;
            billTxnItem.PatientVisitId = patVisitId;
            billTxnItem.ServiceDepartmentId = item.ServiceDepartmentId;
            billTxnItem.ServiceDepartmentName = item.ServiceDepartmentName;
            billTxnItem.ItemId = (int)item.IntegrationItemId;
            billTxnItem.ItemName = item.ItemName;
            billTxnItem.Price = Convert.ToDouble(item.ItemPrice);
            billTxnItem.Quantity = 1;
            billTxnItem.SubTotal = item.ItemPrice * billTxnItem.Quantity;

            billTxnItem.NonTaxableAmount = (decimal)billTxnItem.SubTotal;
            billTxnItem.TotalAmount = billTxnItem.SubTotal;
            billTxnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
            billTxnItem.CounterId = counterId;
            billTxnItem.CounterDay = currentDate;
            billTxnItem.BillingType = ENUM_BillingType.inpatient;//  "inpatient";
            billTxnItem.ProcedureCode = item.ProcedureCode;
            billTxnItem.CreatedBy = userId;
            billTxnItem.VisitType = ENUM_VisitType.inpatient;// "inpatient";
            billTxnItem.CreatedOn = currentDate;
            billTxnItem.RequisitionDate = currentDate;

            billTxnItem.Tax = 0;
            billTxnItem.TaxableAmount = 0;
            billTxnItem.TaxPercent = 0;
            billTxnItem.DiscountAmount = 0;
            billTxnItem.DiscountPercent = 0;
            billTxnItem.DiscountPercentAgg = 0;
            billTxnItem.ProvisionalFiscalYearId = ProvFiscalYearId;
            billTxnItem.ProvisionalReceiptNo = ProvReceiptNo;
            billTxnItem.ServiceItemId = item.ServiceItemId;
            billTxnItem.PriceCategoryId = priceCategoryId;
            billTxnItem.ItemCode = item.ItemCode;
            billTxnItem.IntegrationItemId = item.IntegrationItemId;
            return billTxnItem;
        }

        private void FreeBed(int bedInfoId, DateTime? endedOn, string status)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                           .Where(b => b.PatientBedInfoId == bedInfoId)
                           .FirstOrDefault();
                UpdateIsOccupiedStatus(bedInfo.BedId, false);
                //endedOn can get updated from Billing Edit item as well.
                if (bedInfo.EndedOn == null)
                    bedInfo.EndedOn = endedOn;

                //AdmissionModel patAdmissionInfo = dbContext.Admissions.Where(a => a.PatientId == bedInfo.PatientId && a.PatientVisitId == bedInfo.PatientVisitId).FirstOrDefault();

                if (status == "discharged")
                {
                    bedInfo.OutAction = "discharged";
                }
                else if (status == "transfer")
                {
                    bedInfo.OutAction = "transfer";
                }
                else
                {
                    bedInfo.OutAction = null;
                }

                dbContext.Entry(bedInfo).State = EntityState.Modified;
                dbContext.Entry(bedInfo).Property(x => x.CreatedOn).IsModified = false;
                dbContext.Entry(bedInfo).Property(x => x.StartedOn).IsModified = false;
                dbContext.Entry(bedInfo).Property(x => x.CreatedBy).IsModified = false;
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private void UpdateBillTxnQuantity(PatientBedInfo newBedInfo, int bedInfoId, AdmissionDbContext dbContext)
        {
            try
            {
                //AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                PatientBedInfo bedInfo = dbContext.PatientBedInfos
                         .Where(b => b.PatientBedInfoId == bedInfoId)
                         .FirstOrDefault();
                BillingTransactionItemModel txnitm = dbContext.BillTxnItem
                       .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                                && itm.ItemId == bedInfo.BedFeatureId).FirstOrDefault();


                if (txnitm == null)
                {
                    //sud-2March'20 -- Below lines of code crashes when AutoAddBedItem is false in parameter (CMH scenario), so returning if bed item is not found. 
                    return;
                }

                BillingTransactionItemModel txnitmForSameBed = dbContext.BillTxnItem
                   .Where(itm => itm.PatientId == newBedInfo.PatientId && itm.PatientVisitId == newBedInfo.PatientVisitId
                            && itm.ItemId == newBedInfo.BedFeatureId).FirstOrDefault();
                //Update qty for same BedfeatureId
                if (newBedInfo.IsExistBedFeatureId == true)
                {
                    //txnitmForSameBed.Quantity = txnitmForSameBed.Quantity + 1;
                    //txnitmForSameBed.SubTotal = txnitmForSameBed.Quantity * txnitmForSameBed.Price;
                    //txnitmForSameBed.DiscountAmount = (txnitmForSameBed.SubTotal * txnitmForSameBed.DiscountPercent) / 100;
                    //txnitmForSameBed.TotalAmount = txnitmForSameBed.SubTotal - txnitmForSameBed.DiscountAmount;
                    //dbContext.Entry(txnitmForSameBed).State = EntityState.Modified;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.SubTotal).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.DiscountAmount).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(a => a.TotalAmount).IsModified = true;
                    //dbContext.Entry(txnitmForSameBed).Property(x => x.Quantity).IsModified = true;
                    //dbContext.SaveChanges();
                }

                //Update qty of existing bed after transfer to new bed
                DateTime admDate = dbContext.Admissions.Where(a => a.PatientVisitId == bedInfo.PatientVisitId && a.PatientId == bedInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                var tempTime = admDate.TimeOfDay;
                var EndDate = bedInfo.EndedOn.Value.Date;
                var EndDateTime = EndDate + tempTime;
                TimeSpan qty;
                var checkBedFeatureId = dbContext.PatientBedInfos.Where(a => a.PatientVisitId == bedInfo.PatientVisitId && a.PatientId == bedInfo.PatientId && bedInfo.BedFeatureId == a.BedFeatureId).Select(a => a.BedFeatureId).ToList();
                if (bedInfo.EndedOn.Value > EndDateTime)
                {
                    //DateTime date = bedInfo.EndedOn.Value.Date + tempTime;
                    qty = EndDateTime.Subtract(bedInfo.StartedOn);
                    if (checkBedFeatureId.Count > 1)
                    {
                        txnitm.Quantity = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 + txnitm.Quantity : (int)qty.TotalDays + txnitm.Quantity; //txnitm.Quantity + (int)qty.TotalDays; //-1;
                    }
                    else
                    {
                        txnitm.Quantity = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                    }
                }
                else
                {
                    qty = bedInfo.EndedOn.Value.Subtract(bedInfo.StartedOn);
                    if (checkBedFeatureId.Count > 1)
                    {
                        txnitm.Quantity = txnitm.Quantity + (int)qty.TotalDays; //-1;
                    }
                    else
                    {
                        txnitm.Quantity = (int)qty.TotalDays;          // (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                    }
                }
                //if (bedInfo.StartedOn.Value.Date == bedInfo.EndedOn.Value.Date)
                //{
                //    //if (txnitm.Quantity != null)
                //    //    txnitm.Quantity = txnitm.Quantity - 1;
                //}
                //else
                //{
                //    if (txnitm.Quantity != null)
                //    {
                //        var StartedOn = Convert.ToDateTime(bedInfo.StartedOn).Date;
                //        var endOn = Convert.ToDateTime(bedInfo.EndedOn).Date;
                //        int totalDays = Convert.ToInt32((endOn - StartedOn).TotalDays);
                //        txnitm.Quantity = txnitm.Quantity + totalDays - 1;
                //    }
                //}


                txnitm.SubTotal = txnitm.Quantity * txnitm.Price;
                txnitm.DiscountAmount = (txnitm.SubTotal * txnitm.DiscountPercent) / 100;
                txnitm.TotalAmount = txnitm.SubTotal - txnitm.DiscountAmount;
                dbContext.Entry(txnitm).State = EntityState.Modified;
                dbContext.Entry(txnitm).Property(x => x.Quantity).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.SubTotal).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.DiscountAmount).IsModified = true;
                dbContext.Entry(txnitm).Property(a => a.TotalAmount).IsModified = true;


                dbContext.SaveChanges();




            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private void UpdateBedInfoQuantity(List<PatientBedInfo> newBedInfo, TimeSpan tempTime)
        {
            try
            {
                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                if (newBedInfo.Count > 0)
                {
                    var totalQty = 0;
                    var PatVisitId = 0;
                    var itemId = 0;
                    newBedInfo.ForEach(a =>
                    {
                        TimeSpan qty;
                        var item = 0;
                        PatVisitId = a.PatientVisitId;
                        itemId = a.BedFeatureId;
                        if (a.EndedOn != null)
                        {
                            var EndDate = a.EndedOn.Value.Date;
                            DateTime EndDateTime = EndDate + tempTime;
                            if (a.EndedOn.Value > EndDateTime)
                            {
                                qty = EndDateTime.Subtract(a.StartedOn);
                                item = (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                            }
                            else
                            {
                                var StartDate = a.StartedOn.Date;
                                DateTime StartDateTime = StartDate + tempTime;
                                EndDateTime = EndDateTime.AddDays(-1);
                                if (a.StartedOn < StartDateTime)
                                {
                                    StartDateTime = StartDateTime.AddDays(-1);
                                }
                                qty = EndDateTime.Subtract(StartDateTime);
                                item = (int)qty.TotalDays; // (qty.TotalDays > (int)qty.TotalDays) ? (int)qty.TotalDays + 1 : (int)qty.TotalDays;
                            }
                            a.BedQuantity = item;
                        }
                        else
                        {
                            a.BedQuantity = 0;
                        }
                        totalQty = totalQty + item;
                        dbContext.PatientBedInfos.Attach(a);
                        dbContext.Entry(a).Property(s => s.BedQuantity).IsModified = true;
                        dbContext.SaveChanges();
                    });
                    BillingTransactionItemModel bill = dbContext.BillTxnItem.Where(k => k.PatientVisitId == PatVisitId && k.ItemId == itemId).Select(s => s).FirstOrDefault();
                    bill.Quantity = totalQty;
                    bill.SubTotal = bill.Quantity * bill.Price;
                    bill.DiscountAmount = (bill.SubTotal * bill.DiscountPercent) / 100;
                    bill.TotalAmount = bill.SubTotal - bill.DiscountAmount;
                    dbContext.Entry(bill).State = EntityState.Modified;
                    dbContext.Entry(bill).Property(x => x.Quantity).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.SubTotal).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.DiscountAmount).IsModified = true;
                    dbContext.Entry(bill).Property(a => a.TotalAmount).IsModified = true;
                    dbContext.SaveChanges();

                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private object GetAdtReturnData(int patientBedInfoId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {

                AdmissionDbContext dbContext = new AdmissionDbContext(base.connString);
                var result = (from admission in dbContext.Admissions.Include(a => a.Visit.Patient)
                              select new
                              {
                                  PatientAdmissionId = admission.PatientAdmissionId,
                                  VisitCode = admission.Visit.VisitCode,

                                  AdmittedDate = admission.AdmissionDate,
                                  DischargedDate = admission.DischargeDate,
                                  PatientCode = admission.Visit.Patient.PatientCode,
                                  AdmittingDoctorId = admission.AdmittingDoctorId,
                                  Address = admission.Visit.Patient.Address,
                                  PatientVisitId = admission.Visit.PatientVisitId,
                                  PatientId = admission.Visit.Patient.PatientId,
                                  AdmissionNotes = admission.AdmissionNotes,
                                  AdmissionStatus = admission.AdmissionStatus,
                                  //use ShortName instead of this when possible
                                  Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                                  DateOfBirth = admission.Visit.Patient.DateOfBirth,
                                  PhoneNumber = admission.Visit.Patient.PhoneNumber,
                                  BillStatusOnDischarge = admission.BillStatusOnDischarge,
                                  Gender = admission.Visit.Patient.Gender,
                                  BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                    where (bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.PatientBedInfoId == patientBedInfoId)
                                                    select new
                                                    {
                                                        BedId = bedInfos.BedId,
                                                        PatientBedInfoId = bedInfos.PatientBedInfoId,

                                                        WardId = bedInfos.WardId,
                                                        Ward = bedInfos.Ward.WardName,
                                                        BedFeatureId = bedInfos.BedFeatureId,
                                                        BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                        BedCode = bedInfos.Bed.BedCode,
                                                        BedNumber = bedInfos.Bed.BedNumber,
                                                        StartedOn = bedInfos.StartedOn,
                                                        EndedOn = bedInfos.EndedOn,
                                                    }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                              }).FirstOrDefault();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private object CheckPreviousBedsAvailability(AdmissionDbContext admissionDbContext, int patientVisitId)
        {
            var available = false;
            var bedInfo = admissionDbContext.PatientBedInfos.Where(a => a.PatientVisitId == patientVisitId).Select(a => a).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
            var bed = admissionDbContext.Beds.Where(b => b.BedId == bedInfo.BedId).FirstOrDefault();

            //var bedsInBedFeature = admissionDbContext.BedFeaturesMaps.Where(a => a.BedFeatureId == bedInfo.BedFeatureId && a.WardId == bedInfo.WardId).ToList();
            var bedsInBedFeature = (from beds in admissionDbContext.Beds
                                    join bedFeatMap in admissionDbContext.BedFeaturesMaps on beds.BedId equals bedFeatMap.BedId
                                    where bedFeatMap.WardId == bedInfo.WardId &&  bedFeatMap.BedFeatureId == bedInfo.BedFeatureId &&  beds.IsOccupied == false && beds.IsActive == true
                                    select new
                                    {
                                        BedId = beds.BedId,
                                        BedCode = beds.BedCode,
                                        BedNumber = beds.BedNumber,
                                        WardId = bedFeatMap.WardId,
                                        IsOccupied = beds.IsOccupied,
                                        CreatedBy = beds.CreatedBy,
                                        IsActive = beds.IsActive,
                                        CreatedOn = beds.CreatedOn,
                                        OnHold = beds.OnHold,
                                        HoldedOn = beds.HoldedOn
                                    }).ToList();
            if(bed != null)
            {
                available = !bed.IsOccupied;
            }
            else
            {
                available = true;
            }
            return new { bedInfo,bedsInBedFeature,available};
        }
        private bool CancelDischargedInPatient(AdmissionDbContext admissionDbContext, DischargeCancelModel cancelDischarge)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            RbacDbContext rbacDbContext = new RbacDbContext(base.connString);
            using (var dbContextTransaction = admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    // Posting cancel discharged details 
                    cancelDischarge.CreatedOn = DateTime.Now;
                    cancelDischarge.DischargeCancelledBy = currentUser.EmployeeId;
                    //cancelDischarge.BillingTransactionId = admissionDbContext.BillingTransactions.Where(c => c.PatientVisitId == cancelDischarge.PatientVisitId && c.InvoiceType != "ip-partial").Select(a => a.BillingTransactionId).FirstOrDefault();
                    cancelDischarge.BillingTransactionId = admissionDbContext.BillingTransactions.Where(c => c.PatientVisitId == cancelDischarge.PatientVisitId && c.InvoiceType == ENUM_InvoiceType.inpatientDischarge).Select(a => a.BillingTransactionId).FirstOrDefault();
                    admissionDbContext.DischargeCancel.Add(cancelDischarge);

                    //update Patient Admission 
                    var adtPatient = admissionDbContext.Admissions.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).FirstOrDefault();
                    adtPatient.BillStatusOnDischarge = null;
                    adtPatient.DischargeDate = null;
                    adtPatient.DischargedBy = null;
                    adtPatient.DischargeRemarks = null;
                    adtPatient.ModifiedBy = null;
                    adtPatient.AdmissionStatus = ENUM_AdmissionStatus.admitted;//"admitted";
                    adtPatient.ModifiedOn = null;
                    //admissionDbContext.Admissions.Attach(adtPatient);
                    admissionDbContext.Entry(adtPatient).State = EntityState.Modified;
                    admissionDbContext.Entry(adtPatient).Property(a => a.BillStatusOnDischarge).IsModified = true;
                    admissionDbContext.Entry(adtPatient).Property(a => a.DischargeDate).IsModified = true;
                    admissionDbContext.Entry(adtPatient).Property(a => a.AdmissionStatus).IsModified = true;

                    //updating bedPatInfo
                    //Below Logic needs to be updated incase of occupied bed.
                    if(cancelDischarge.NewBedId != null || cancelDischarge.NewBedId > 0)
                    {
                        //admissionDbContext.PatientBedInfos.Add(newBedInfo);


                        var bedInfo = admissionDbContext.PatientBedInfos.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
                        bedInfo.OutAction = "transfer";
                        //admissionDbContext.Entry(bedInfo).Property(a => a.EndedOn).IsModified = true;
                        admissionDbContext.Entry(bedInfo).Property(a => a.OutAction).IsModified = true;

                        var bed = admissionDbContext.Beds.Where(b => b.BedId == cancelDischarge.NewBedId).FirstOrDefault();
                        bed.IsOccupied = true;
                        admissionDbContext.Entry(bed).Property(a => a.IsOccupied).IsModified = true;

                        PatientBedInfo newBedInfo = new PatientBedInfo();
                        newBedInfo = bedInfo;
                        newBedInfo.BedId = (int)cancelDischarge.NewBedId;
                        newBedInfo.EndedOn = null;
                        newBedInfo.Action = "transfer";
                        newBedInfo.OutAction = null;
                        newBedInfo.StartedOn = DateTime.Now;
                        newBedInfo.CreatedBy = currentUser.EmployeeId;
                        newBedInfo.CreatedOn = DateTime.Now;

                        admissionDbContext.PatientBedInfos.Add(newBedInfo);
                    }
                    else
                    {
                        var bedInfo = admissionDbContext.PatientBedInfos.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
                        bedInfo.OutAction = null;
                        bedInfo.EndedOn = null;
                        admissionDbContext.Entry(bedInfo).Property(a => a.EndedOn).IsModified = true;
                        admissionDbContext.Entry(bedInfo).Property(a => a.OutAction).IsModified = true;

                        //updating bed
                        var bed = admissionDbContext.Beds.Where(b => b.BedId == bedInfo.BedId).FirstOrDefault();
                        bed.IsOccupied = true;
                        admissionDbContext.Entry(bed).Property(a => a.IsOccupied).IsModified = true;
                    }

                    admissionDbContext.SaveChanges();

                    var CashPaymentSubCategory = admissionDbContext.PaymentModes.FirstOrDefault(a => a.PaymentSubCategoryName.ToLower() == "cash");
                    //restoring patient deposits, if exists
                    var deposits = admissionDbContext.BillDeposit.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId && a.TransactionType != ENUM_DepositTransactionType.Deposit).Select(a => a).ToList();
                    if (deposits.Count > 0)
                    {
                        //existing deposit cancels
                        deposits.ForEach(a => a.DepositBalance = 0); //this is made 0 so that we could increment it with InAmount.
                        deposits.ForEach(adv =>
                        {
                            //adv.DepositType = ENUM_BillDepositType.DepositCancel;// "depositcancel";
                            //admissionDbContext.Entry(adv).State = EntityState.Modified;
                            //admissionDbContext.Entry(adv).Property(a => a.DepositType).IsModified = true;
                            if (adv.TransactionType == ENUM_DepositTransactionType.Deposit)
                            {
                                adv.InAmount = adv.InAmount;
                                adv.DepositBalance += adv.InAmount;
                                adv.TransactionType = ENUM_DepositTransactionType.Deposit;
                                adv.CreatedBy = currentUser.EmployeeId;
                                adv.CreatedOn = DateTime.Now;

                                BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                                adv.FiscalYearId = fiscYear.FiscalYearId;
                                adv.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                                adv.Remarks = null;
                                adv.CounterId = cancelDischarge.CounterId;
                                adv.PrintCount = 0;
                                adv.PaymentMode = "cash";
                                adv.BillingTransactionId = null;
                                admissionDbContext.BillDeposit.Add(adv);

                                admissionDbContext.SaveChanges();

                                //Add Deposits Txns to EmployeeCashTxns
                                EmpCashTransactionModel depositTxn = new EmpCashTransactionModel();
                                depositTxn.TransactionType = ENUM_EmpCashTransactionType.Deposit;
                                depositTxn.ReferenceNo = adv.DepositId;
                                depositTxn.InAmount = (double)adv.InAmount;
                                depositTxn.OutAmount = 0;
                                depositTxn.EmployeeId = currentUser.EmployeeId;
                                depositTxn.TransactionDate = DateTime.Now;
                                depositTxn.CounterID = cancelDischarge.CounterId;
                                depositTxn.PaymentModeSubCategoryId = CashPaymentSubCategory.PaymentSubCategoryId;
                                depositTxn.PatientId = adv.PatientId;
                                depositTxn.ModuleName = ENUM_ModuleNames.Billing;
                                depositTxn.Remarks = "Txns against Cancelled Discharge Patient";
                                admissionDbContext.EmpCashTransactions.Add(depositTxn);
                            }
                        });

                        admissionDbContext.SaveChanges();
                    }

                    //restoring BillingTransactionItems
                    //var ipPatrialBillTxnId = admissionDbContext.BillingTransactions.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId
                    //&& a.TransactionType == "inpatient" && a.InvoiceType != "ip-partial" && a.ReturnStatus != true).FirstOrDefault();

                    var billTxnItms = admissionDbContext.BillTxnItem.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId && a.BillingTransactionId == cancelDischarge.BillingTransactionId).Select(a => a).OrderBy(a => a.BillingTransactionItemId).ToList();
                    var tempTxnId = billTxnItms.Select(a => a.BillingTransactionId).Distinct().FirstOrDefault();

                    var billtxn = admissionDbContext.BillingTransactions.Where(a => a.BillingTransactionId == tempTxnId && a.InvoiceType == ENUM_InvoiceType.inpatientDischarge).Select(a => a).FirstOrDefault();


                    //var currFiscYear = admissionDbContext.BillingFiscalYears.Where(a => a.IsActive == true).Select(a => a).FirstOrDefault();
                    //below is the logic to get currentFiscalYear: sud-6May'21
                    DateTime currentDate = DateTime.Now.Date;
                    var currFiscYear = admissionDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();

                    //Return Entry for billtxnitms
                    //generate credit note no for return bills 
                    //int maxCreditNoteNum = admissionDbContext.BillReturns.Where(a => a.FiscalYearId == currFiscYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                    int maxCreditNoteNum = (from txn in _billingDbContext.BillInvoiceReturns
                                            where txn.FiscalYearId == currFiscYear.FiscalYearId
                                            select txn.CreditNoteNumber).DefaultIfEmpty(0).Max();
                    decimal ReturnCashAmount = 0;
                    decimal ReturnCreditAmount = 0;
                    if(billTxnItms.Any(a => a.IsCoPayment == true))
                    {
                        ReturnCashAmount = billTxnItms.Sum(a => a.CoPaymentCashAmount);
                        ReturnCreditAmount = (decimal)billtxn.TotalAmount - ReturnCashAmount;
                    }
                    BillInvoiceReturnModel retBill = new BillInvoiceReturnModel();

                    retBill.InvoiceCode = billtxn.InvoiceCode;
                    retBill.RefInvoiceNum = billtxn.InvoiceNo;
                    retBill.FiscalYear = currFiscYear.FiscalYearFormatted;
                    retBill.FiscalYearId = currFiscYear.FiscalYearId;
                    retBill.PatientId = billtxn.PatientId;
                    retBill.CreditNoteNumber = (maxCreditNoteNum + 1);
                    retBill.CreatedBy = currentUser.EmployeeId;
                    retBill.BillingTransactionId = billtxn.BillingTransactionId;
                    retBill.SubTotal = billtxn.SubTotal;
                    retBill.DiscountAmount = billtxn.DiscountAmount;
                    retBill.TaxableAmount = billtxn.TaxableAmount;
                    retBill.TaxTotal = billtxn.TaxTotal;
                    retBill.TotalAmount = billtxn.TotalAmount;
                    retBill.Remarks = "Return of Cancelled Discharge Patient";
                    retBill.TaxId = billtxn.TaxId;
                    retBill.IsActive = true;
                    retBill.CreatedOn = DateTime.Now;
                    retBill.IsRemoteSynced = false;
                    retBill.CounterId = cancelDischarge.CounterId;
                    retBill.PaymentMode = billtxn.PaymentMode;
                    retBill.BillStatus = billtxn.BillStatus;
                    retBill.ClaimCode = billtxn.ClaimCode;
                    retBill.ReturnCashAmount = ReturnCashAmount;
                    retBill.ReturnCreditAmount = ReturnCreditAmount;
                    retBill.OrganizationId = billtxn.OrganizationId;
                    retBill.SchemeId = billtxn.SchemeId;
                    admissionDbContext.BillReturns.Add(retBill);
                    admissionDbContext.SaveChanges();

                    if (billTxnItms.Count > 0)
                    {
                        //returning Items
                        billTxnItms.ForEach(itm =>
                        {
                            BillInvoiceReturnItemsModel billInvoiceReturnItem = new BillInvoiceReturnItemsModel();
                            billInvoiceReturnItem.BillReturnId = retBill.BillReturnId;
                            billInvoiceReturnItem.BillingTransactionId = retBill.BillingTransactionId;
                            billInvoiceReturnItem.BillingTransactionItemId = itm.BillingTransactionItemId;
                            billInvoiceReturnItem.PatientId = itm.PatientId;
                            billInvoiceReturnItem.ServiceDepartmentId = itm.ServiceDepartmentId;
                            billInvoiceReturnItem.ServiceItemId = itm.ServiceItemId;
                            billInvoiceReturnItem.ItemName = itm.ItemName;
                            billInvoiceReturnItem.Price = itm.Price;
                            billInvoiceReturnItem.RetQuantity = itm.Quantity;
                            billInvoiceReturnItem.RetSubTotal = itm.SubTotal;
                            billInvoiceReturnItem.RetDiscountAmount = itm.DiscountAmount;
                            billInvoiceReturnItem.RetTaxAmount = itm.TaxableAmount;
                            billInvoiceReturnItem.RetTotalAmount = itm.TotalAmount;
                            billInvoiceReturnItem.RetDiscountPercent = itm.DiscountPercent;
                            billInvoiceReturnItem.PrescriberId = itm.PrescriberId;
                            billInvoiceReturnItem.PerformerId = itm.PerformerId;
                            billInvoiceReturnItem.BillStatus = itm.BillStatus;
                            billInvoiceReturnItem.RequisitionId = itm.RequisitionId;
                            billInvoiceReturnItem.RequisitionDate = itm.RequisitionDate;
                            billInvoiceReturnItem.RetCounterId = cancelDischarge.CounterId;
                            billInvoiceReturnItem.RetRemarks = "Return of Cancelled Discharge Patient";
                            billInvoiceReturnItem.PatientVisitId = itm.PatientVisitId;
                            billInvoiceReturnItem.BillingPackageId = itm.BillingPackageId;
                            billInvoiceReturnItem.CreatedBy = (int)cancelDischarge.DischargeCancelledBy;
                            billInvoiceReturnItem.CreatedOn = DateTime.Now;
                            billInvoiceReturnItem.BillingType = itm.BillingType;
                            billInvoiceReturnItem.RequestingDeptId = itm.RequestingDeptId;
                            billInvoiceReturnItem.VisitType = itm.VisitType;
                            billInvoiceReturnItem.PriceCategory = itm.PriceCategory;
                            billInvoiceReturnItem.PriceCategoryId = itm.PriceCategoryId;
                            billInvoiceReturnItem.PatientInsurancePackageId = itm.PatientInsurancePackageId;
                            billInvoiceReturnItem.IsInsurance = itm.IsInsurance;
                            billInvoiceReturnItem.DiscountSchemeId = itm.DiscountSchemeId;
                            billInvoiceReturnItem.IsCashBillSyncToAcc = false;
                            billInvoiceReturnItem.IsCreditBillSyncToAcc = false;
                            billInvoiceReturnItem.LabTypeName = itm.LabTypeName;
                            admissionDbContext.BillInvoiceReturnItems.Add(billInvoiceReturnItem);
                        });
                        admissionDbContext.SaveChanges();

                        //Add Sales Return Txn to EmployeeCashTxn table
                        EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                        empCashTransaction.TransactionType = ENUM_EmpCashTransactionType.SalesReturn;
                        empCashTransaction.ReferenceNo = retBill.BillReturnId;
                        empCashTransaction.InAmount = 0;
                        empCashTransaction.OutAmount = retBill.TotalAmount;
                        empCashTransaction.EmployeeId = currentUser.EmployeeId;
                        empCashTransaction.TransactionDate = DateTime.Now;
                        empCashTransaction.CounterID = cancelDischarge.CounterId;
                        empCashTransaction.PaymentModeSubCategoryId = CashPaymentSubCategory.PaymentSubCategoryId;
                        empCashTransaction.PatientId = retBill.PatientId;
                        empCashTransaction.ModuleName = ENUM_ModuleNames.Billing;
                        empCashTransaction.Remarks = "Return of Cancelled Discharge Patient";
                        admissionDbContext.EmpCashTransactions.Add(empCashTransaction);
                        admissionDbContext.SaveChanges();


                        //New entries for billTxnItems
                        List<OldAndNewBillingTransactionItemIds> oldAndNewBillingTransactionItemIds = new List<OldAndNewBillingTransactionItemIds>();
                        billTxnItms.ForEach(itm =>
                        {
                            OldAndNewBillingTransactionItemIds oldAndNewBillingTransactionItemId = new OldAndNewBillingTransactionItemIds();
                            oldAndNewBillingTransactionItemId.OldBillingTransactionItemId = itm.BillingTransactionItemId;
                            BillingTransactionItemModel billingtxn = new BillingTransactionItemModel();
                            billingtxn = itm;
                            billingtxn.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
                            billingtxn.PaidDate = null;
                            billingtxn.BillingTransactionId = null;
                            billingtxn.ReturnQuantity = null;
                            billingtxn.ReturnStatus = null;
                            billingtxn.CounterId = cancelDischarge.CounterId;
                            billingtxn.Remarks = "New Item added against Cancelled Discharge";
                            admissionDbContext.BillTxnItem.Add(billingtxn);
                            admissionDbContext.SaveChanges();
                            oldAndNewBillingTransactionItemId.NewBillingTransactionItemId = billingtxn.BillingTransactionItemId;
                            oldAndNewBillingTransactionItemIds.Add(oldAndNewBillingTransactionItemId);
                        });

                        oldAndNewBillingTransactionItemIds.ForEach(itm =>
                        {
                            LabRequisitionModel labItm = admissionDbContext.LabRequisitions.Where(a => a.BillingTransactionItemId == itm.OldBillingTransactionItemId).FirstOrDefault();
                            if(labItm != null)
                            {
                                labItm.BillingTransactionItemId = itm.NewBillingTransactionItemId;
                                labItm.ModifiedBy = cancelDischarge.DischargeCancelledBy;
                                labItm.ModifiedOn = DateTime.Now;
                                admissionDbContext.Entry(labItm).State = EntityState.Modified;
                            }

                            ImagingRequisitionModel imagingItm = admissionDbContext.ImagingRequisitions.Where(a => a.BillingTransactionItemId == itm.OldBillingTransactionItemId).FirstOrDefault();
                            if (imagingItm != null)
                            {
                                imagingItm.BillingTransactionItemId = itm.NewBillingTransactionItemId;
                                imagingItm.ModifiedBy = cancelDischarge.DischargeCancelledBy;
                                imagingItm.ModifiedOn = DateTime.Now;
                                admissionDbContext.Entry(imagingItm).State = EntityState.Modified;
                            }
                            admissionDbContext.SaveChanges();
                        });



                    }

                    //updating Discharge Summary 
                    var disSummary = admissionDbContext.DischargeSummary.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).FirstOrDefault();
                    if (disSummary != null)
                    {
                        disSummary.IsDischargeCancel = true;
                        admissionDbContext.Entry(disSummary).State = EntityState.Modified;
                        admissionDbContext.Entry(disSummary).Property(a => a.IsDischargeCancel).IsModified = true;
                    }

                    admissionDbContext.SaveChanges();

                    //updating Discharge Summary 
                    var dischargeStatement = admissionDbContext.DischargeStatements.Where(a => a.PatientVisitId == cancelDischarge.PatientVisitId).Select(a => a).FirstOrDefault();
                    if (dischargeStatement != null)
                    {
                        dischargeStatement.IsDischargeCancel = true;
                        admissionDbContext.Entry(dischargeStatement).State = EntityState.Modified;
                        admissionDbContext.Entry(dischargeStatement).Property(a => a.IsDischargeCancel).IsModified = true;
                    }

                    admissionDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private void UpdateNotReceivedTransferredBed(AdmissionDbContext dbContext)
        {
            //Until the Receive is done, both transferred from and transferred in PatientBedInfo are set true
            //check for the Bed to be Free incase of transfer if Not Received or Time has exceeded the limit to hold                    
            var paramList = (from param in dbContext.CFGParameters
                             where (param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                             || param.ParameterName == "AutoCancellationOfTransferReserveInMins")
                             select param).AsNoTracking().ToList();

            var resPrevBed = paramList.Where(v => v.ParameterName == "ReservePreviousBedDuringTransferFromNursing").Select(v => v.ParameterValue).FirstOrDefault();
            var autoCancelReserveMins = paramList.Where(v => v.ParameterName == "AutoCancellationOfTransferReserveInMins").Select(v => v.ParameterValue).FirstOrDefault();
            if (resPrevBed != null && resPrevBed == "true")
            {
                int timeInHrsBeforeCancel = 360;
                if (autoCancelReserveMins != null)
                {
                    timeInHrsBeforeCancel = Convert.ToInt32(autoCancelReserveMins);
                }
                var holdTimeBuffer = System.DateTime.Now.AddMinutes(-timeInHrsBeforeCancel);
                var dataToBeUpdated = (from bedInfo in dbContext.PatientBedInfos
                                       where bedInfo.Action == "transfer" && String.IsNullOrEmpty(bedInfo.OutAction)
                                       && (!bedInfo.ReceivedBy.HasValue && bedInfo.StartedOn < holdTimeBuffer)
                                       && bedInfo.IsActive == true && bedInfo.BedOnHoldEnabled == true
                                       select bedInfo.PatientVisitId).ToList();
                if (dataToBeUpdated.Count > 0)
                {
                    foreach (var visId in dataToBeUpdated)
                    {
                        var dataToUpdate = (from binfo in dbContext.PatientBedInfos
                                            where binfo.IsActive == true && binfo.PatientVisitId == visId
                                            select binfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                        //0 th element is Latest and 1 is before that
                        //Update the bedInfo as patient was not received, so set the Latest info status to isActive=false
                        dataToUpdate[0].IsActive = false;
                        dbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                        dbContext.Entry(dataToUpdate[0]).Property(x => x.IsActive).IsModified = true;

                        //Update bed where patient was transferred but not received
                        int lastBedId = dataToUpdate[0].BedId;
                        var occupiedHolded = dbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                        if (occupiedHolded.OnHold == true)
                        {
                            occupiedHolded.IsOccupied = false;
                            occupiedHolded.OnHold = false;
                            occupiedHolded.HoldedOn = null;
                        }

                        dbContext.Entry(occupiedHolded).State = EntityState.Modified;
                        dbContext.Entry(occupiedHolded).Property(x => x.IsOccupied).IsModified = true;
                        dbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                        dbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                        //Update the bedInfo as patient was not received, so set the Previous info status to null outaction
                        dataToUpdate[1].OutAction = null;
                        dataToUpdate[1].EndedOn = null;
                        dbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                        dbContext.Entry(dataToUpdate[1]).Property(x => x.OutAction).IsModified = true;
                        dbContext.Entry(dataToUpdate[1]).Property(x => x.EndedOn).IsModified = true;

                        //Update bed where patient was previously
                        int secondLastBedId = dataToUpdate[1].BedId;
                        var initialHolded = dbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                        initialHolded.IsOccupied = true;
                        initialHolded.OnHold = false;
                        initialHolded.HoldedOn = null;
                        dbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                        dbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                        dbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;
                    }

                    dbContext.SaveChanges();

                }
            }


        }


        private bool IsValidForAdmission(AdmissionDbContext dbContext, int patientId)
        {
            bool isAdmissionValid = true;

            //condition-1: Check if patient is admitted or not in Admission table.
            var admissionObj = dbContext.Admissions.Where(adm => adm.PatientId == patientId
                                                                   && adm.AdmissionStatus == ENUM_AdmissionStatus.admitted).FirstOrDefault();

            //if admission object is found that means patient is already admitted. We need to restrict admission in such case.
            if (admissionObj != null)
            {
                isAdmissionValid = false;
            }

            return isAdmissionValid;
        }

        private object GetADTList(string admissionStatus, int patientVisitId)
        {
            UpdateNotReceivedTransferredBed(_admissionDbContext);

            //var isDepartmentLevelAppointmentEnabled = EnableDepartmentLevelAppointment

            DataTable result = _admissionDbContext.GetAllAdmittedPatients(admissionStatus, patientVisitId);

            //map data coming from the SP to the VM...
            List<GetAdmittedListVm> response = GetAdmittedList_ResultFromSP_VM.MapDataTableToSingleObject(result);
            return response;
        }

        private object GetWardList()
        {
            var result = (from ward in _admissionDbContext.Wards.Where(a => a.IsActive == true)
                          select new
                          {
                              WardId = ward.WardId,
                              WardName = ward.WardName
                          }).ToList();
            return result;
        }

        private object GetDepartments()
        {
            var result = (from dept in _admissionDbContext.Department.Where(a => a.IsActive == true)
                          select new
                          {
                              DepartmentId = dept.DepartmentId,
                              DepartmentName = dept.DepartmentName
                          }).ToList();
            return result;
        }

        private object GetBedFeatures()
        {
            var result = (from bedf in _admissionDbContext.BedFeatures.Where(a => a.IsActive == true)
                          select new
                          {
                              BedFeatureId = bedf.BedFeatureId,
                              BedFeatureName = bedf.BedFeatureName
                          }).ToList();
            return result;
        }

        private object GetDischargedPatientList(string admissionStatus, DateTime FromDate, DateTime ToDate)
        {
            var employeeslist = _admissionDbContext.Employees.Select(a => new
            {
                EmployeeId = a.EmployeeId,
                EmployeeName = a.FirstName + " " + a.LastName,
            }).ToList().AsEnumerable();
            //var address = (from municiplity in masterDbContext.Municipalities
            //                        join pat in masterDbContext.Patient on municiplity.MunicipalityId equals pat.MunicipalityId where pat.MunicipalityId == municiplity.MunicipalityId
            //                        select new
            //                        {
            //                            MunicipilityName = (string.IsNullOrEmpty(municiplity.MunicipalityName) ? "" : municiplity.MunicipalityName)
            //                        }).ToList();

            var result = (from admission in _admissionDbContext.Admissions.Include(a => a.Visit.Patient)
                              //join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                              //join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                          join summary in _admissionDbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                          from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                              // join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                          where admission.AdmissionStatus == admissionStatus && (DbFunctions.TruncateTime(admission.DischargeDate) >= FromDate && DbFunctions.TruncateTime(admission.DischargeDate) <= ToDate)

                          let empName = _admissionDbContext.Employees.Where(doc => doc.EmployeeId == admission.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                          let deptName = _admissionDbContext.Department.Where(d => d.DepartmentId == admission.Visit.DepartmentId).Select(n => n.DepartmentName).FirstOrDefault() ?? string.Empty
                          let municiplityName = _admissionDbContext.Municipalities.Where(d => d.MunicipalityId == admission.Visit.Patient.MunicipalityId).Select(a => a.MunicipalityName).FirstOrDefault()
                          let districtName = _admissionDbContext.CountrySubDivisions.Where(d => d.CountrySubDivisionId == admission.Visit.Patient.CountrySubDivisionId).Select(a => a.CountrySubDivisionName).FirstOrDefault()
                          select new
                          {
                              VisitCode = admission.Visit.VisitCode,
                              PatientVisitId = admission.Visit.PatientVisitId,
                              PatientId = admission.Visit.Patient.PatientId,
                              PatientAdmissionId = admission.PatientAdmissionId,
                              AdmittedDate = admission.AdmissionDate,
                              DischargedDate = admission.DischargeDate,
                              DischargedBy = admission.DischargedBy,
                              PatientCode = admission.Visit.Patient.PatientCode,
                              AdmittingDoctorId = admission.AdmittingDoctorId,
                              AdmittingDoctorName = empName,  //admDoctor.Salutation + ". " + admDoctor.FirstName + " " + (string.IsNullOrEmpty(admDoctor.MiddleName) ? "" : admDoctor.MiddleName + " ") + admDoctor.LastName,
                              Address = (string.IsNullOrEmpty(admission.Visit.Patient.Address) ? (string.IsNullOrEmpty(municiplityName) ? districtName : municiplityName) : admission.Visit.Patient.Address),
                              AdmissionStatus = admission.AdmissionStatus,
                              BillStatusOnDischarge = admission.BillStatusOnDischarge,
                              //use ShortName instead of this when possible
                              Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                              DateOfBirth = admission.Visit.Patient.DateOfBirth,
                              PhoneNumber = admission.Visit.Patient.PhoneNumber,
                              Gender = admission.Visit.Patient.Gender,
                              IsSubmitted = dischargeSummary.IsSubmitted,
                              IsPoliceCase = admission.AdmissionCase != null ? admission.AdmissionCase == "Police Case" : false,
                              DischargeSummaryId = dischargeSummary != null ? dischargeSummary.DischargeSummaryId : 0,
                              IsInsurancePatient = admission.IsInsurancePatient != null ? admission.IsInsurancePatient : false,
                              //DischargeSummaryId = dischargeSummary.DischargeSummaryId,
                              MedicalRecordId = (from mr in _admissionDbContext.MedicalRecords
                                                 where mr.PatientId == admission.Visit.Patient.PatientId
                                                 && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                 select mr.MedicalRecordId).FirstOrDefault(),
                              Department = deptName,
                              GuardianName = admission.CareOfPersonName,
                              GuardianRelation = admission.CareOfPersonRelation,
                              IsSelected = false,
                              BedInformation = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                select new
                                                {
                                                    BedId = bedInfos.BedId,
                                                    PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                    WardId = bedInfos.WardId,
                                                    Ward = bedInfos.Ward.WardName,
                                                    BedFeatureId = bedInfos.BedFeatureId,
                                                    Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                    BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                    BedCode = bedInfos.Bed.BedCode,
                                                    BedNumber = bedInfos.Bed.BedNumber,
                                                    StartedOn = bedInfos.StartedOn,
                                                }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                          }).ToList();
            if (admissionStatus == "discharged")
            {
                return result.OrderByDescending(r => r.DischargedDate);
            }
            return result;
        }

        private object GetAdmittedPatientList(string admissionStatus, DateTime FromDate, DateTime ToDate)
        {
            var result = (from admission in _admissionDbContext.Admissions.Include(a => a.Visit.Patient)
                              //join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                              //join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                          join summary in _admissionDbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                          from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                              //join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                          where admission.AdmissionStatus == admissionStatus && (DbFunctions.TruncateTime(admission.AdmissionDate) >= FromDate && DbFunctions.TruncateTime(admission.AdmissionDate) <= ToDate)
                          let empName = _admissionDbContext.Employees.Where(doc => doc.EmployeeId == admission.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                          let deptName = _admissionDbContext.Department.Where(d => d.DepartmentId == admission.Visit.DepartmentId).Select(n => n.DepartmentName).FirstOrDefault() ?? string.Empty
                          select new
                          {
                              VisitCode = admission.Visit.VisitCode,
                              PatientVisitId = admission.Visit.PatientVisitId,
                              PatientId = admission.Visit.Patient.PatientId,
                              PatientAdmissionId = admission.PatientAdmissionId,
                              AdmittedDate = admission.AdmissionDate,
                              DischargedDate = admission.DischargeDate,
                              DischargedBy = admission.DischargedBy,
                              PatientCode = admission.Visit.Patient.PatientCode,
                              AdmittingDoctorId = admission.AdmittingDoctorId,
                              AdmittingDoctorName = empName, //admDoctor.Salutation + ". " + admDoctor.FirstName + " " + (string.IsNullOrEmpty(admDoctor.MiddleName) ? "" : admDoctor.MiddleName + " ") + admDoctor.LastName,
                              Address = admission.Visit.Patient.Address,
                              AdmissionStatus = admission.AdmissionStatus,
                              BillStatusOnDischarge = admission.BillStatusOnDischarge,
                              //use ShortName instead of this when possible
                              Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                              DateOfBirth = admission.Visit.Patient.DateOfBirth,
                              PhoneNumber = admission.Visit.Patient.PhoneNumber,
                              Gender = admission.Visit.Patient.Gender,
                              IsSubmitted = dischargeSummary.IsSubmitted,
                              DischargeSummaryId = dischargeSummary != null ? dischargeSummary.DischargeSummaryId : 0,
                              //dischargeSummary.DischargeSummaryId,
                              MedicalRecordId = (from mr in _admissionDbContext.MedicalRecords
                                                 where mr.PatientId == admission.Visit.Patient.PatientId
                                                 && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                 select mr.MedicalRecordId).FirstOrDefault(),
                              Department = deptName,
                              GuardianName = admission.CareOfPersonName,
                              GuardianRelation = admission.CareOfPersonRelation,
                              BedInformation = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                select new
                                                {
                                                    BedId = bedInfos.BedId,
                                                    PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                    WardId = bedInfos.WardId,
                                                    Ward = bedInfos.Ward.WardName,
                                                    BedFeatureId = bedInfos.BedFeatureId,
                                                    Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                    BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                    BedCode = bedInfos.Bed.BedCode,
                                                    BedNumber = bedInfos.Bed.BedNumber,
                                                    StartedOn = bedInfos.StartedOn,
                                                }).OrderByDescending(a => a.StartedOn).FirstOrDefault()

                          }).ToList();
            if (admissionStatus == "admitted")
            {
                return result.OrderByDescending(r => r.AdmittedDate);
            }
            else
            {
                return result;
            }
        }

        private object GetPatientAndBedInfo(int patientId, int patientVisitId)
        {
            //var employeeslist = dbContext.Employees.Select(a => new
            //{
            //    EmployeeId = a.EmployeeId,
            //    EmployeeName = a.FirstName + " " + a.LastName,
            //}).ToList().AsEnumerable();
            var result = (from admission in _admissionDbContext.Admissions.Include(a => a.Visit.Patient)
                              //join employee in dbContext.Employees on admission.AdmittingDoctorId equals employee.EmployeeId
                              //join department in dbContext.Department on employee.DepartmentId equals department.DepartmentId
                          join summary in _admissionDbContext.DischargeSummary on admission.PatientVisitId equals summary.PatientVisitId into dischargeSummaryTemp
                          from dischargeSummary in dischargeSummaryTemp.DefaultIfEmpty()
                          join note in _admissionDbContext.Notes on admission.PatientVisitId equals note.PatientVisitId into noteTemp
                          from notes in noteTemp.DefaultIfEmpty()
                              //join admDoctor in dbContext.Employees on admission.AdmittingDoctorId equals admDoctor.EmployeeId
                          where admission.PatientVisitId == patientVisitId && admission.PatientId == patientId
                          let empName = _admissionDbContext.Employees.Where(doc => doc.EmployeeId == admission.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                          let deptName = _admissionDbContext.Department.Where(d => d.DepartmentId == admission.Visit.DepartmentId).Select(n => n.DepartmentName).FirstOrDefault() ?? string.Empty
                          select new
                          {
                              VisitCode = admission.Visit.VisitCode,
                              PatientVisitId = admission.Visit.PatientVisitId,
                              PatientId = admission.Visit.Patient.PatientId,
                              PatientAdmissionId = admission.PatientAdmissionId,
                              AdmittedDate = admission.AdmissionDate,
                              DischargedDate = admission.DischargeDate,
                              DischargedBy = admission.DischargedBy,
                              PatientCode = admission.Visit.Patient.PatientCode,
                              AdmittingDoctorId = admission.AdmittingDoctorId,
                              AdmittingDoctorName = empName,//employee.Salutation + ". " + employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName,
                              Address = admission.Visit.Patient.Address,
                              AdmissionStatus = admission.AdmissionStatus,
                              BillStatusOnDischarge = admission.BillStatusOnDischarge,
                              //use ShortName instead of this when possible
                              Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                              DateOfBirth = admission.Visit.Patient.DateOfBirth,
                              PhoneNumber = admission.Visit.Patient.PhoneNumber,
                              Gender = admission.Visit.Patient.Gender,
                              IsSubmitted = dischargeSummary.IsSubmitted,
                              IsPending = (from note in _admissionDbContext.Notes
                                           where note.PatientVisitId == admission.Visit.PatientVisitId && note.TemplateName == "Discharge Note"
                                           select note.IsPending).FirstOrDefault(),

                              MedicalRecordId = (from mr in _admissionDbContext.MedicalRecords
                                                 where mr.PatientId == admission.Visit.Patient.PatientId
                                                 && mr.PatientVisitId == admission.Visit.PatientVisitId
                                                 select mr.MedicalRecordId).FirstOrDefault(),
                              Department = deptName,//department.DepartmentName,
                              GuardianName = admission.CareOfPersonName,
                              GuardianRelation = admission.CareOfPersonRelation,
                              BedInformation = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                where bedInfos.PatientVisitId == admission.Visit.PatientVisitId && bedInfos.IsActive == true
                                                select new
                                                {
                                                    BedId = bedInfos.BedId,
                                                    PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                    WardId = bedInfos.WardId,
                                                    Ward = bedInfos.Ward.WardName,
                                                    BedFeatureId = bedInfos.BedFeatureId,
                                                    Action = bedInfos.Action.Substring(0, 1).ToUpper() + bedInfos.Action.Substring(1),
                                                    BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                    BedCode = bedInfos.Bed.BedCode,
                                                    BedNumber = bedInfos.Bed.BedNumber,
                                                    StartedOn = bedInfos.StartedOn,
                                                }).FirstOrDefault()

                          }).ToList();
            return result;
        }

        private object GetAdmissionInfo(int patientId, int ipVisitId)
        {
            var patientInfo = (from patient in _admissionDbContext.Patients
                               join admission in _admissionDbContext.Admissions on patient.PatientId equals admission.PatientId
                               join vis in _admissionDbContext.Visits on admission.PatientVisitId equals vis.PatientVisitId
                               join bedInfo in _admissionDbContext.PatientBedInfos on admission.PatientVisitId equals bedInfo.PatientVisitId
                               join bed in _admissionDbContext.Beds on bedInfo.BedId equals bed.BedId
                               join ward in _admissionDbContext.Wards on bedInfo.WardId equals ward.WardId
                               from deposit in _admissionDbContext.BillDeposit.Where(dept => dept.PatientVisitId == vis.PatientVisitId).DefaultIfEmpty()
                               where patient.PatientId == patientId && admission.PatientVisitId == ipVisitId
                               select new AdmissionInfoVM
                               {
                                   //Patient Model
                                   PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                   PatientCode = patient.PatientCode,
                                   Address = patient.Address,
                                   DateOfBirth = patient.DateOfBirth,
                                   Gender = patient.Gender,
                                   PhoneNumber = patient.PhoneNumber,
                                   //PatientVisit Model
                                   VisitCode = vis.VisitCode,
                                   //Admission Model
                                   AdmissionDate = admission.AdmissionDate,
                                   //Deposit Model
                                   DepositId = deposit.DepositId,
                                   DepositBalance = (double)deposit.DepositBalance,
                                   //PatientBedInfo
                                   WardName = ward.WardName,
                                   BedCode = bed.BedCode
                               }).OrderByDescending(a => a.DepositId).FirstOrDefault();
            return patientInfo;
        }

        private object GetAdmittedPatientBedInfo(int patientVisitId)
        {
            var patientBedInfo = (from patientinfo in _admissionDbContext.PatientBedInfos
                                  join ward in _admissionDbContext.Wards on patientinfo.WardId equals ward.WardId
                                  join bed in _admissionDbContext.Beds on patientinfo.BedId equals bed.BedId
                                  join admissionpatient in _admissionDbContext.Admissions on patientinfo.PatientVisitId equals admissionpatient.PatientVisitId
                                  join emp in _admissionDbContext.Employees on patientinfo.SecondaryDoctorId equals emp.EmployeeId into empSummaryTemp
                                  from empSummary in empSummaryTemp.DefaultIfEmpty()
                                  where patientinfo.PatientVisitId == patientVisitId && patientinfo.IsActive == true
                                  select new PatientBedInfoVM
                                  {
                                      WardName = ward.WardName,
                                      StartedOn = patientinfo.StartedOn,
                                      EndedOn = patientinfo.EndedOn,
                                      BedNumber = bed.BedNumber,
                                      BedCode = bed.BedCode,
                                      PatientBedInfoId = patientinfo.PatientBedInfoId,
                                      PatientVisitId = patientinfo.PatientVisitId,
                                      Action = patientinfo.Action,
                                      SecondaryDoctorId = patientinfo.SecondaryDoctorId,
                                      SecondaryDoctor = empSummary.FirstName + " " + empSummary.MiddleName + " " + empSummary.LastName
                                  }).Distinct().OrderByDescending(a => a.StartedOn).ToList();

            return patientBedInfo;
        }

        private object AdmittedPatientListForNursing(string search, DateTime ToDate, int wardId, DateTime FromDate)
        {
            UpdateNotReceivedTransferredBed(_admissionDbContext);

            search = search == null ? string.Empty : search.ToLower();
            var testdate = ToDate.AddDays(1);

            var result = (from admission in _admissionDbContext.Admissions.Include(a => a.Visit.Patient)
                          where admission.AdmissionStatus == "admitted" &&
                          (admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ")
                          + admission.Visit.Patient.LastName + admission.Visit.Patient.PatientCode + admission.Visit.Patient.PhoneNumber).Contains(search)
                          let emp = _admissionDbContext.Employees.Where(e => e.EmployeeId == admission.AdmittingDoctorId).FirstOrDefault()
                          let dept = _admissionDbContext.Department.Where(d => d.DepartmentId == admission.Visit.DepartmentId).FirstOrDefault()
                          select new
                          {
                              VisitCode = admission.Visit.VisitCode,
                              PatientVisitId = admission.Visit.PatientVisitId,
                              PatientId = admission.Visit.Patient.PatientId,
                              AdmittedDate = admission.AdmissionDate,
                              PatientCode = admission.Visit.Patient.PatientCode,
                              //use ShortName instead of this when possible
                              Name = admission.Visit.Patient.FirstName + " " + (string.IsNullOrEmpty(admission.Visit.Patient.MiddleName) ? "" : admission.Visit.Patient.MiddleName + " ") + admission.Visit.Patient.LastName,
                              DateOfBirth = admission.Visit.Patient.DateOfBirth,
                              Age = admission.Visit.Patient.Age,
                              PhoneNumber = admission.Visit.Patient.PhoneNumber,
                              DepartmentName = dept.DepartmentName,
                              Gender = admission.Visit.Patient.Gender,
                              MembershipTypeId = admission.Visit.SchemeId,
                              MembershipTypeName = (from membership in _admissionDbContext.Schemes
                                                    where membership.SchemeId == admission.Visit.SchemeId
                                                    select membership.SchemeName).FirstOrDefault(),
                              PriceCategoryId = admission.Visit.PriceCategoryId,
                              AdmittingDoctorId = admission.AdmittingDoctorId,
                              AdmittingDoctorName = emp == null ? "" : emp.FullName,
                              CreatedOn = admission.CreatedOn,
                              IsPoliceCase = admission.IsPoliceCase != null ? admission.IsPoliceCase : false,
                              IsInsurancePatient = admission.IsInsurancePatient,

                              BedInformation = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                && bedInfos.IsActive == true
                                                select new
                                                {
                                                    BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                    BedCode = bedInfos.Bed.BedCode,
                                                    StartedOn = bedInfos.StartedOn,
                                                    WardId = bedInfos.WardId,
                                                    PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                    BedId = bedInfos.Bed.BedId,
                                                    BedNumber = bedInfos.Bed.BedNumber,
                                                    BedFeatureId = bedInfos.BedFeature.BedFeatureId,
                                                    OutAction = bedInfos.OutAction,
                                                    ReceivedBy = bedInfos.ReceivedBy,
                                                    ReceivedOn = bedInfos.ReceivedOn,
                                                    Action = bedInfos.Action,
                                                    BedOnHoldEnabled = bedInfos.BedOnHoldEnabled,
                                                    //AdmittedDate = bedInfos.ad,
                                                    //StartedOn = bedInfos.StartedOn,
                                                    Ward = bedInfos.Ward,
                                                    IsInsurancePatient = admission.IsInsurancePatient
                                                }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault()

                          }).OrderByDescending(r => r.AdmittedDate).AsQueryable();


            result = result.Where(res => res.BedInformation.WardId == wardId);



            //var possibleBedsToUpdate = result.Where()

            if (CommonFunctions.GetCoreParameterBoolValue(_coreDbContext, "Common", "ServerSideSearchComponent", "NursingInPatient") == true && search == "")
            {
                result = result.Take(CommonFunctions.GetCoreParameterIntValue(_coreDbContext, "Common", "ServerSideSearchListLength"));
            }
            if (FromDate != DateTime.Now.Date)
            {
                var finalResults = result.Where(a => a.CreatedOn > FromDate && a.CreatedOn < testdate).ToList();
                return finalResults;
            }
            else
            {
                var finalResults = result.ToList();
                return finalResults;
            }
        }

        private object GetPendingTransferredPatient()
        {
            UpdateNotReceivedTransferredBed(_admissionDbContext);

            var allAdm = _admissionDbContext.Admissions.Include(a => a.Visit.Patient).ToList();
            var result = (from admission in _admissionDbContext.Admissions.Include(a => a.Visit.Patient)
                          where admission.AdmissionStatus == ENUM_AdmissionStatus.admitted
                          //join emp in dbContext.Employees on admission.AdmittingDoctorId equals emp.EmployeeId
                          join bedInfo in _admissionDbContext.PatientBedInfos on admission.PatientVisitId equals bedInfo.PatientVisitId
                          where bedInfo.IsActive == true && bedInfo.Action == "transfer"
                          && (!bedInfo.ReceivedBy.HasValue) && bedInfo.BedOnHoldEnabled == true
                          let empName = _admissionDbContext.Employees.Where(doc => doc.EmployeeId == admission.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                          select new
                          {
                              VisitCode = admission.Visit.VisitCode,
                              PatientVisitId = admission.Visit.PatientVisitId,
                              PatientId = admission.Visit.Patient.PatientId,
                              AdmittedDate = admission.AdmissionDate,
                              PatientCode = admission.Visit.Patient.PatientCode,
                              //use ShortName instead of this when possible
                              Name = admission.Visit.Patient.ShortName,
                              DateOfBirth = admission.Visit.Patient.DateOfBirth,
                              Age = admission.Visit.Patient.Age,
                              PhoneNumber = admission.Visit.Patient.PhoneNumber,
                              Gender = admission.Visit.Patient.Gender,
                              AdmittingDoctorId = admission.AdmittingDoctorId,
                              AdmittingDoctorName = empName,//emp.FullName,
                              CreatedOn = admission.CreatedOn,
                              BedInformation = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                where bedInfos.PatientVisitId == admission.Visit.PatientVisitId
                                                && bedInfos.IsActive == true
                                                join employ in _admissionDbContext.Employees on bedInfos.CreatedBy equals employ.EmployeeId
                                                select new
                                                {
                                                    BedFeature = bedInfos.BedFeature.BedFeatureName,
                                                    BedCode = bedInfos.Bed.BedCode,
                                                    StartedOn = bedInfos.StartedOn,
                                                    WardId = bedInfos.WardId,
                                                    PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                    BedId = bedInfos.Bed.BedId,
                                                    BedNumber = bedInfos.Bed.BedNumber,
                                                    BedFeatureId = bedInfos.BedFeature.BedFeatureId,
                                                    OutAction = bedInfos.OutAction,
                                                    ReceivedBy = bedInfos.ReceivedBy,
                                                    ReceivedOn = bedInfos.ReceivedOn,
                                                    Action = bedInfos.Action,
                                                    BedOnHoldEnabled = bedInfos.BedOnHoldEnabled,
                                                    TransferredOn = bedInfos.StartedOn,
                                                    CreatedBy = employ.FullName,
                                                    //AdmittedDate = bedInfos.ad,
                                                    //StartedOn = bedInfos.StartedOn,
                                                    Ward = bedInfos.Ward
                                                }).OrderByDescending(a => a.PatientBedInfoId).Take(2)

                          }).OrderByDescending(r => r.AdmittedDate).AsQueryable();

            var finalResults = result.ToList();
            return finalResults;
        }

        private object CheckAdmissionStatus(int patientId)
        {
            AdmissionModel patAdmission = (from app in _admissionDbContext.Admissions
                                           join visit in _admissionDbContext.Visits on app.PatientVisitId equals visit.PatientVisitId
                                           where visit.PatientId == patientId && app.AdmissionStatus == ENUM_AdmissionStatus.admitted
                                           select app).FirstOrDefault();
            if (patAdmission != null)
                return true;
            else
                throw new Exception("Patient already admitted.");
        }

        private object CheckPatientProvisionalStatus(int patientId)
        {
            var info = (from bItm in _billingDbContext.BillingTransactionItems
                        where bItm.PatientId == patientId && bItm.BillStatus == ENUM_BillingStatus.provisional // "provisional"
                        select bItm).FirstOrDefault();
            if (info != null)
                return true;
            else
                throw new Exception("No Provisional Items Exists.");
        }

        private object GetDoctorList()
        {
            //check if we can use employee.IsAppointmentApplicable field in below join.--sud:15Jun'18
            ServiceDepartmentModel srvDept = _admissionDbContext.ServiceDepartment.Where(s => s.IntegrationName == "OPD").FirstOrDefault();
            if (srvDept != null)
            {
                var visitDoctorList = (from emp in _admissionDbContext.Employees.Where(e => e.IsAppointmentApplicable == true)
                                       join dept in _admissionDbContext.Department on emp.DepartmentId equals dept.DepartmentId
                                       join billItem in _admissionDbContext.BillServiceItems on srvDept.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                       join priceCatServItem in _admissionDbContext.BillPriceCategoryServiceItems on billItem.ServiceItemId equals priceCatServItem.ServiceItemId
                                       where priceCatServItem.PriceCategoryId == 1 //Krishna, 13thMarch'23 1 is for Normal and Hardcoded for now
                                       select new
                                       {
                                           DepartmentId = dept.DepartmentId,
                                           DepartmentName = dept.DepartmentName,
                                           PerformerId = emp.EmployeeId,
                                           PerformerName = emp.Salutation + ". " + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName,
                                           ItemName = billItem.ItemName,
                                           Price = priceCatServItem.Price,
                                           IsTaxApplicable = billItem.IsTaxApplicable
                                       }).ToList();
                return visitDoctorList;
            }
            else
            {
                throw new Exception("No ServiceDepartment Found.");
            }
        }

        private object GetAppointmentApplicableDoctorList()
        {
            var appointmentApplicableDoctorList = (from emp in _admissionDbContext.Employees.Where(e => e.IsAppointmentApplicable == true)
                                                   join dept in _admissionDbContext.Department on emp.DepartmentId equals dept.DepartmentId
                                                   select new
                                                   {
                                                       DepartmentId = dept.DepartmentId,
                                                       DepartmentName = dept.DepartmentName,
                                                       PerformerId = emp.EmployeeId,
                                                       PerformerName = emp.FullName
                                                   }).ToList();
            return appointmentApplicableDoctorList;
        }

        private object GetAppointmentApplicableDoctors()
        {
            //sud: 15Jun'18 -- removed departmentjoin as IsAppointmentApplicable field is now added in Employee Level as well.
            //List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
            //List<EmployeeModel> apptEmployees = (from e in empListFromCache
            //                                     join d in allDeptsFromCache
            //                                     on e.DepartmentId equals d.DepartmentId
            //                                     where d.IsAppointmentApplicable == true
            //                                     select e
            //                     ).ToList();

            List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
            List<EmployeeModel> apptEmployees = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                  && emp.IsAppointmentApplicable == true
                                                  //sud:13Mar'19 Get Only Active Employees.. 
                                                  && emp.IsActive == true).ToList();



            //var providerList = (from emp in masterDbContext.Employee
            //                    join role in masterDbContext.EmployeeRole on emp.EmployeeRoleId equals role.EmployeeRoleId
            //                    where role.EmployeeRoleName == "Provider"
            //                    select emp).ToList();
            return apptEmployees;
        }

        private object GetAnaesthetist()
        {
            //List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);

            //List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
            //List<EmployeeModel> empList = (from e in empListFromCache
            //                               join d in allDeptsFromCache on e.DepartmentId equals d.DepartmentId
            //                               where d.DepartmentName == "Anesthesiology"
            //                               select e).ToList();

            //Yubraj: 10th May '19 :: Getting Anaesthetist doctor list from employee
            List<EmployeeModel> empList = (from e in _masterDbContext.Employees
                                           join r in _masterDbContext.EmployeeRole on e.EmployeeRoleId equals r.EmployeeRoleId
                                           where r.EmployeeRoleName == "Anaesthetist"
                                           select e).ToList();
            return empList;
        }

        private object GetDischargeTypes()
        {
            var dischargeTypeList = _admissionDbContext.DischargeType.Where(a => a.IsActive == true).ToList();
            return dischargeTypeList;
        }

        private object GetDischargeSummary(int patientVisitId)
        {
            IQueryable<DischargeSummaryConsultantViewModel> consultantDetails =
                        from dsc in _admissionDbContext.DischargeSummaryConsultant
                        join emp in _admissionDbContext.Employees on dsc.ConsultantId equals emp.EmployeeId
                        select new DischargeSummaryConsultantViewModel
                        {
                            dischargeSummaryId = dsc.DischargeSummaryId,
                            consultantId = emp.EmployeeId,
                            consultantName = emp.FullName,
                            consultantNMC = emp.MedCertificationNo,
                            consultantLongSignature = emp.LongSignature,
                            consultantSignImgPath = string.IsNullOrEmpty(emp.SignatoryImageName) ? null : "\\fileuploads\\EmployeeSignatures\\" + emp.SignatoryImageName,
                            consultantDepartmentName = emp.Department.DepartmentName
                        };

            var summary = (from dis in _admissionDbContext.DischargeSummary
                           join visit in _admissionDbContext.Visits on dis.PatientVisitId equals visit.PatientVisitId
                           join consultant in consultantDetails on dis.DischargeSummaryId equals consultant.dischargeSummaryId into consultantsGrouped
                           join incharge in _admissionDbContext.Employees on dis.DoctorInchargeId equals incharge.EmployeeId into inchargeDrTemp
                           from inchargeLJ in inchargeDrTemp.DefaultIfEmpty()
                               //Ashim: 15Dec2017 : ResidenceDr is not mandatory
                           join residence in _admissionDbContext.Employees on dis.ResidenceDrId equals residence.EmployeeId into residenceDrTemp
                           from residenceDr in residenceDrTemp.DefaultIfEmpty()
                               //since anaesthist is a non-mandatory field, there might be null value sometimes.
                               // below logic is equivalent to a Left join, so it takes the anesthiest Only if it's present.
                           join anaesthetists in _admissionDbContext.Employees on dis.AnaesthetistsId equals anaesthetists.EmployeeId into anaesthistTemp
                           from anesthist in anaesthistTemp.DefaultIfEmpty()
                           join disType in _admissionDbContext.DischargeType on dis.DischargeTypeId equals disType.DischargeTypeId
                           join depart in _admissionDbContext.Department on visit.DepartmentId equals depart.DepartmentId
                           join pat in _admissionDbContext.Patients on visit.PatientId equals pat.PatientId
                           join med in _admissionDbContext.DischargeSummaryMedications on dis.DischargeSummaryId equals med.DischargeSummaryId into medList
                           where dis.PatientVisitId == patientVisitId
                           //&& medList.Any(a => a.IsActive == true)
                           select new
                           {
                               DischargeSummary = dis,
                               Medications = medList.Where(a => a.IsActive == true).OrderBy(a => a.OldNewMedicineType),
                               VisitCode = visit.VisitCode,
                               BabyBirthDetails = _admissionDbContext.BabyBirthDetails.Where(a => a.DischargeSummaryId == dis.DischargeSummaryId).Select(a => a).ToList(),
                               DischargeType = disType.DischargeTypeName,
                               Certificate = _admissionDbContext.PatientCertificate.Where(a => a.DischargeSummaryId == dis.DischargeSummaryId).Select(a => a).ToList(),
                               DrInchargeNMC = (string.IsNullOrEmpty(inchargeLJ.MedCertificationNo) ? "" : inchargeLJ.MedCertificationNo),
                               DrInchargeLongSignature = (string.IsNullOrEmpty(inchargeLJ.LongSignature) ? null : inchargeLJ.LongSignature),
                               DrInchargeSignImgPath = inchargeLJ != null ? string.IsNullOrEmpty(inchargeLJ.SignatoryImageName) ? null : "\\fileuploads\\EmployeeSignatures\\" + inchargeLJ.SignatoryImageName : "",
                               ResidenceDrNMC = residenceDr.MedCertificationNo,
                               ResidenceDrLongSignature = residenceDr.LongSignature,
                               ResidenceDrSignImgPath = string.IsNullOrEmpty(residenceDr.SignatoryImageName) ? null : "\\fileuploads\\EmployeeSignatures\\" + residenceDr.SignatoryImageName,
                               Consultants = consultantsGrouped,
                               AnaesthetistNMC = anesthist.MedCertificationNo,
                               AnaesthetistLongSignature = anesthist.LongSignature,
                               AnaesthetistSignImgPath = string.IsNullOrEmpty(anesthist.SignatoryImageName) ? null : "\\fileuploads\\EmployeeSignatures\\" + anesthist.SignatoryImageName,
                               DoctorInchargeName = dis.DoctorInchargeId != null ? (string.IsNullOrEmpty(inchargeLJ.Salutation) ? "" : inchargeLJ.Salutation) + (string.IsNullOrEmpty(inchargeLJ.FirstName) ? "" : inchargeLJ.FirstName) + " " + (string.IsNullOrEmpty(inchargeLJ.MiddleName) ? "" : inchargeLJ.MiddleName + " ") + (string.IsNullOrEmpty(inchargeLJ.LastName) ? "" : inchargeLJ.LastName + " ") : null,
                               Anaesthetists = anesthist != null ? anesthist.Salutation + ". " + anesthist.FirstName + " " + (string.IsNullOrEmpty(anesthist.MiddleName) ? "" : anesthist.MiddleName + " ") + anesthist.LastName : "",
                               ResidenceDrName = residenceDr != null ? residenceDr.Salutation + ". " + residenceDr.FirstName + " " + (string.IsNullOrEmpty(residenceDr.MiddleName) ? "" : residenceDr.MiddleName + " ") + residenceDr.LastName : "",
                               DischargeConditionType = _admissionDbContext.DischargeConditionTypes.Where(a => a.DischargeConditionId == dis.DischargeConditionId).Select(a => a.Condition).FirstOrDefault(),
                               BabyBirthCondition = _admissionDbContext.BabyBirthConditions.Where(A => A.BabyBirthConditionId == dis.BabyBirthConditionId).Select(a => a.BirthConditionType).FirstOrDefault(),
                               DeathType = _admissionDbContext.DeathTypes.Where(a => a.DeathTypeId == dis.DeathTypeId).Select(a => a.DeathType).FirstOrDefault(),
                               DeliveryType = _admissionDbContext.DeliveryTypes.Where(A => A.DeliveryTypeId == dis.DeliveryTypeId).Select(a => a.DeliveryTypeName).FirstOrDefault(),
                               CreatedBy = _admissionDbContext.Employees.Where(a => a.EmployeeId == dis.CreatedBy).Select(a => a.FullName).FirstOrDefault(),
                               depart.DepartmentName,
                               pat.Address,
                               BabyWeight = dis.BabyWeight,
                               ClinicalFindings = dis.ClinicalFindings,
                               CheckedBy = _admissionDbContext.Employees.Where(a => a.EmployeeId == dis.CheckedBy).Select(a => a.FullName).FirstOrDefault()
                           }).FirstOrDefault();
            return summary;
        }

        private object GetAvailableBeds(int wardId, int bedFeatureId)
        {
            int minTimeBeforeCancel = 15;
            var timeFrmParam = (from param in _billingDbContext.AdminParameters
                                where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                && param.ParameterGroupName.ToLower() == "adt"
                                select param.ParameterValue).FirstOrDefault();

            if (!String.IsNullOrEmpty(timeFrmParam))
            {
                minTimeBeforeCancel = Int32.Parse(timeFrmParam);
            }

            DateTime currentDateTime = System.DateTime.Now;
            DateTime bufferTime = currentDateTime.AddMinutes(minTimeBeforeCancel);

            int timeInMinsBeforeCancel = 360;
            var parameter = (from param in _admissionDbContext.CFGParameters
                             where param.ParameterName == "AutoCancellationOfTransferReserveInMins"
                             select param.ParameterValue).AsNoTracking().FirstOrDefault();
            if (parameter != null)
            {
                timeInMinsBeforeCancel = Convert.ToInt32(parameter);
                //add 2 min more buffer
                timeInMinsBeforeCancel = timeInMinsBeforeCancel + 2;
            }

            var holdTimeBuffer = currentDateTime.AddMinutes((timeInMinsBeforeCancel * (-1)));

            var allPossibleAvailableBeds = (from bed in _admissionDbContext.Beds
                                            join bedFeatureMap in _admissionDbContext.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
                                            where (
                                               bedFeatureMap.WardId == wardId && bedFeatureMap.BedFeatureId == bedFeatureId
                                               && bedFeatureMap.IsActive == true
                                               && bed.IsActive == true
                                               && (
                                               (bed.IsOccupied == false && (bed.OnHold != true))
                                               || (bed.IsOccupied == true && (bed.OnHold == true)
                                               && (bed.HoldedOn.HasValue && bed.HoldedOn.Value < holdTimeBuffer))
                                                )
                                               )
                                            select new
                                            {
                                                BedId = bed.BedId,
                                                BedCode = bed.BedCode,
                                                BedNumber = bed.BedNumber,
                                                WardId = bed.WardId,
                                                IsOccupied = bed.IsOccupied,
                                                CreatedBy = bed.CreatedBy,
                                                IsActive = bed.IsActive,
                                                CreatedOn = bed.CreatedOn,
                                                OnHold = bed.OnHold,
                                                HoldedOn = bed.HoldedOn
                                            }).ToList();

            var reservationBedInfoList = (from resvd in _admissionDbContext.BedReservation
                                          join pat in _admissionDbContext.Patients on resvd.PatientId equals pat.PatientId
                                          where resvd.IsActive == true
                                          && resvd.AdmissionStartsOn > bufferTime
                                          select new
                                          {
                                              ShortName = pat.ShortName,
                                              BedId = resvd.BedId,
                                              ReservedBedInfoId = resvd.ReservedBedInfoId,
                                              AdmissionStartsOn = resvd.AdmissionStartsOn
                                          }).ToList();

            var availableBeds = (from bed in allPossibleAvailableBeds
                                 select new
                                 {
                                     BedId = bed.BedId,
                                     BedCode = bed.BedCode,
                                     BedNumber = bed.BedNumber,
                                     WardId = bed.WardId,
                                     IsOccupied = bed.IsOccupied,
                                     IsReserved = (from resvd in reservationBedInfoList
                                                   where resvd.BedId == bed.BedId
                                                   select resvd.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
                                     CreatedBy = bed.CreatedBy,
                                     IsActive = bed.IsActive,
                                     CreatedOn = bed.CreatedOn,
                                     ReservedByPatient = (from resvd in reservationBedInfoList
                                                          where resvd.BedId == bed.BedId
                                                          select resvd.ShortName).FirstOrDefault(),
                                     ReservedForDate = (from resvd in reservationBedInfoList
                                                        where resvd.BedId == bed.BedId
                                                        select resvd.AdmissionStartsOn).FirstOrDefault(),
                                     OnHold = bed.OnHold,
                                     HoldedOn = bed.HoldedOn
                                 }).ToList();



            //var availableBeds = (from bed in dbContext.Beds
            //                     join bedFeatureMap in dbContext.BedFeaturesMaps on bed.BedId equals bedFeatureMap.BedId
            //                     where (
            //                        bedFeatureMap.WardId == wardId &&
            //                        bedFeatureMap.BedFeatureId == bedFeatureId &&
            //                        bed.IsActive == true && bed.IsOccupied == false && (bed.OnHold != true) &&
            //                        bedFeatureMap.IsActive == true)
            //                     select new
            //                     {
            //                         BedId = bed.BedId,
            //                         BedCode = bed.BedCode,
            //                         BedNumber = bed.BedNumber,
            //                         WardId = bed.WardId,
            //                         IsOccupied = bed.IsOccupied,
            //                         IsReserved = (from resvd in dbContext.BedReservation
            //                                       where resvd.BedId == bed.BedId && resvd.IsActive == true
            //                                       && resvd.AdmissionStartsOn > bufferTime
            //                                       select resvd.ReservedBedInfoId).FirstOrDefault() > 0 ? true : false,
            //                         CreatedBy = bed.CreatedBy,
            //                         IsActive = bed.IsActive,
            //                         CreatedOn = bed.CreatedOn,
            //                         ReservedByPatient = (from resvd in dbContext.BedReservation
            //                                              join pat in dbContext.Patients on resvd.PatientId equals pat.PatientId
            //                                              where resvd.BedId == bed.BedId && resvd.IsActive == true
            //                                              && resvd.AdmissionStartsOn > bufferTime
            //                                              select pat.FirstName + (String.IsNullOrEmpty(pat.MiddleName) ? " " : (" " + pat.MiddleName + " ")) + pat.LastName).FirstOrDefault(),
            //                         ReservedForDate = (from resvd in dbContext.BedReservation
            //                                            where resvd.BedId == bed.BedId && resvd.IsActive == true
            //                                            && resvd.AdmissionStartsOn > bufferTime
            //                                            select resvd.AdmissionStartsOn).FirstOrDefault()
            //                     }).ToList();

            var bedFeature = _admissionDbContext.BedFeatures.Where(a => a.BedFeatureId == bedFeatureId).FirstOrDefault();

            var BedbillItm = (from bilItm in _admissionDbContext.BillServiceItems
                              join servDept in _admissionDbContext.ServiceDepartment on bilItm.ServiceDepartmentId equals servDept.ServiceDepartmentId
                              join serviceItemPriceCategoryMap in _admissionDbContext.BillPriceCategoryServiceItems on
                              new { bilItm.ServiceItemId, bilItm.ServiceDepartmentId } equals new { serviceItemPriceCategoryMap.ServiceItemId, serviceItemPriceCategoryMap.ServiceDepartmentId }
                              where bilItm.IntegrationItemId == bedFeatureId && servDept.IntegrationName == "Bed Charges "
                              select new
                              {
                                  bilItm.IntegrationItemId,
                                  bilItm.ItemName,
                                  Price = serviceItemPriceCategoryMap.Price,
                                  bilItm.IsTaxApplicable,
                                  bilItm.ServiceDepartmentId,
                                  servDept.ServiceDepartmentName,
                                  bilItm.ServiceItemId,
                                  bilItm.ItemCode,
                                  //bilItm.ProcedureCode
                              }).FirstOrDefault();
            return new { availableBeds, BedbillItm };
        }

        private object GetBedFeaturesByWard(int wardId, int priceCategoryId)
        {
            var wardBedFeatures = (from bedFeature in _admissionDbContext.BedFeatures
                                   join bedFeaturesMap in _admissionDbContext.BedFeaturesMaps on bedFeature.BedFeatureId equals bedFeaturesMap.BedFeatureId
                                   join serviceItem in _admissionDbContext.BillServiceItems on bedFeature.BedFeatureId equals serviceItem.IntegrationItemId
                                   join serviceItemPriceCategoryMap in _admissionDbContext.BillPriceCategoryServiceItems on
                                   new {serviceItemId = serviceItem.ServiceItemId, priceCategoryId = priceCategoryId } equals new {serviceItemId = serviceItemPriceCategoryMap.ServiceItemId, priceCategoryId = serviceItemPriceCategoryMap.PriceCategoryId } into grp
                                   from priceCatServItm in grp.DefaultIfEmpty()
                                   where (bedFeaturesMap.WardId == wardId && bedFeaturesMap.IsActive == true && bedFeature.IsActive == true
                                   && serviceItem.IntegrationName == "Bed Charges")
                                   select new BedFeature_DTO
                                   {
                                       BedFeatureId = bedFeature.BedFeatureId,
                                       ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                       BedFeatureName = bedFeature.BedFeatureName,
                                       BedFeatureFullName = bedFeature.BedFeatureFullName,
                                       BedFeatureCode = bedFeature.BedFeatureCode,
                                       BedPrice = priceCatServItm != null ? priceCatServItm.Price : 0,
                                       ServiceItemId = serviceItem.ServiceItemId,
                                       ItemCode = serviceItem.ItemCode
                                   }).Distinct().ToList();
            return wardBedFeatures;
        }

        private object GetSimilarBedFeature(int wardId, int bedFeatureId)
        {
            var similarBedFeatures = (from bedFeature in _admissionDbContext.BedFeatures
                                      join bedFeaturesMap in _admissionDbContext.BedFeaturesMaps on bedFeature.BedFeatureId equals bedFeaturesMap.BedFeatureId
                                      join serviceItem in _admissionDbContext.BillServiceItems on bedFeature.BedFeatureId equals serviceItem.IntegrationItemId
                                      join serviceItemPriceCategoryMap in _admissionDbContext.BillPriceCategoryServiceItems on
                                      new { serviceItem.ServiceItemId, serviceItem.ServiceDepartmentId } equals new { serviceItemPriceCategoryMap.ServiceItemId, serviceItemPriceCategoryMap.ServiceDepartmentId }
                                      where (bedFeaturesMap.WardId == wardId && bedFeaturesMap.IsActive == true && bedFeature.IsActive == true
                                      && serviceItem.IntegrationName == "Bed Charges" && bedFeaturesMap.BedFeatureId != bedFeatureId)
                                      select new BedFeature_DTO
                                      {
                                          BedFeatureId = bedFeature.BedFeatureId,
                                          ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                          BedFeatureName = bedFeature.BedFeatureName,
                                          BedFeatureFullName = bedFeature.BedFeatureFullName,
                                          BedFeatureCode = bedFeature.BedFeatureCode,
                                          BedPrice = serviceItemPriceCategoryMap.Price,
                                          ServiceItemId = serviceItem.ServiceItemId,
                                          ItemCode = serviceItem.ItemCode
                                      }).Distinct().ToList();
            return similarBedFeatures;
        }

        private object GetAdmissionHistory(int patientId)
        {
            var admissionHistory = (from admission in _admissionDbContext.Admissions
                                    join visit in _admissionDbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                    where visit.PatientId == patientId
                                    select new
                                    {
                                        AdmissionId = admission.PatientAdmissionId,
                                        AdmittedOn = admission.AdmissionDate,
                                        Status = admission.AdmissionStatus,
                                        DischaragedOn = admission.DischargeDate,
                                        IPNumber = visit.VisitCode,
                                        visit.PatientId,
                                        visit.PatientVisitId,
                                        BedInformations = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                           join bedFeature in _admissionDbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                           join bed in _admissionDbContext.Beds on bedInfos.BedId equals bed.BedId
                                                           join ward in _admissionDbContext.Wards on bed.WardId equals ward.WardId
                                                           join emp in _admissionDbContext.Employees on bedInfos.CreatedBy equals emp.EmployeeId
                                                           where bedInfos.PatientVisitId == visit.PatientVisitId
                                                           select new
                                                           {
                                                               CreatedBy = emp.Salutation + " " + emp.FirstName + " " + emp.LastName,
                                                               bedInfos.CreatedOn,
                                                               ward.WardId,
                                                               ward.WardName,
                                                               BedCode = bed.BedCode,
                                                               BedFeature = bedFeature.BedFeatureName,
                                                               StartDate = bedInfos.StartedOn,
                                                               EndDate = bedInfos.EndedOn,
                                                               BedPrice = bedInfos.BedPrice,
                                                               Action = bedInfos.Action,
                                                               //calculated in clientSide
                                                               Days = 0,
                                                           }).ToList().OrderByDescending(a => a.StartDate)
                                    }).ToList().OrderByDescending(a => a.AdmittedOn);
            return admissionHistory;
        }

        private object GetLatestAdmissionDetail(int patientId)
        {
            var admisionDetail = (from admission in _admissionDbContext.Admissions
                                  join visit in _admissionDbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                  where visit.PatientId == patientId
                                  select new
                                  {
                                      AdmittedOn = admission.AdmissionDate,
                                      IPNumber = visit.VisitCode,
                                      visit.PatientId,
                                      visit.PatientVisitId,
                                      BedInformations = (from bedInfos in _admissionDbContext.PatientBedInfos
                                                         join bedFeature in _admissionDbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                         join bed in _admissionDbContext.Beds on bedInfos.BedId equals bed.BedId
                                                         join ward in _admissionDbContext.Wards on bed.WardId equals ward.WardId
                                                         where bedInfos.PatientVisitId == visit.PatientVisitId && bedInfos.IsActive == true
                                                         select new
                                                         {

                                                             ward.WardId,
                                                             WardName = ward.WardName,
                                                             BedCode = bed.BedCode,
                                                             BedFeature = bedFeature.BedFeatureName,
                                                             StartDate = bedInfos.StartedOn,
                                                             EndDate = bedInfos.EndedOn,
                                                             BedPrice = bedInfos.BedPrice,
                                                             Action = bedInfos.Action,
                                                             //calculated in clientSide
                                                             Days = 0,
                                                         }).ToList().OrderByDescending(a => a.StartDate)
                                  }).OrderByDescending(a => a.AdmittedOn).FirstOrDefault();
            return admisionDetail;
        }

        private object GetAdmissionSticker(int patientVisitId)
        {
            var userList = _rbacDbContext.Users.ToList();
            var admissionDetail = (from admission in _admissionDbContext.Admissions
                                   join visit in _admissionDbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                   join patient in _admissionDbContext.Patients on admission.PatientId equals patient.PatientId
                                   join bedInfos in _admissionDbContext.PatientBedInfos on admission.PatientVisitId equals bedInfos.PatientVisitId
                                   join ward in _admissionDbContext.Wards on bedInfos.WardId equals ward.WardId
                                   join bed in _admissionDbContext.Beds on bedInfos.BedId equals bed.BedId
                                   join dept in _admissionDbContext.Department on visit.DepartmentId equals dept.DepartmentId
                                   join cnty in _admissionDbContext.Countries on patient.CountryId equals cnty.CountryId
                                   join subDiv in _admissionDbContext.CountrySubDivisions on patient.CountrySubDivisionId equals subDiv.CountrySubDivisionId
                                   join memb in _admissionDbContext.Schemes on admission.DiscountSchemeId equals memb.SchemeId
                                   join patMap in _admissionDbContext.PatientSchemeMaps on patient.PatientId equals patMap.PatientId into p
                                   from patMap in p.DefaultIfEmpty()
                                   join munc in _admissionDbContext.Municipalities on patient.MunicipalityId equals munc.MunicipalityId into g
                                   from munc in g.DefaultIfEmpty()
                                   join cfgPriceCat in _admissionDbContext.PriceCategoryModels on memb.DefaultPriceCategoryId equals cfgPriceCat.PriceCategoryId into m
                                   from cfgPriceCat in m.DefaultIfEmpty()
                                   where admission.PatientVisitId == patientVisitId

                                   let empList = _admissionDbContext.Employees.Where(d => d.IsActive == true)
                                   //join doctor in dbContext.Employees on admission.AdmittingDoctorId equals doctor.EmployeeId
                                   select new
                                   {
                                       PatientCode = patient.PatientCode,
                                       PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                       DateOfBirth = patient.DateOfBirth,
                                       Gender = patient.Gender,
                                       Address = patient.Address,
                                       PhoneNumber = patient.PhoneNumber,
                                       CountrySubDivisionId = patient.CountrySubDivisionId,
                                       InPatientNo = visit.VisitCode,
                                       AdmittingDoctor = admission.AdmittingDoctorId.HasValue ? empList.Where(e => e.EmployeeId == admission.AdmittingDoctorId).Select(dc => dc.FullName).FirstOrDefault() : "",
                                       AdmissionDate = admission.AdmissionDate,
                                       bedInfos.PatientBedInfoId,
                                       Ward = ward.WardName,
                                       BedCode = bed.BedCode,
                                       MunicipalityName = (munc == null) ? "" : munc.MunicipalityName,
                                       WardNumber = patient.WardNumber,
                                       CountrySubDivisionName = subDiv.CountrySubDivisionName,
                                       CountryName = cnty.CountryName,
                                       CareOfPersonName = admission.CareOfPersonName,
                                       CareOfPersonPhoneNo = admission.CareOfPersonPhoneNo,
                                       CareOfPersonRelation = admission.CareOfPersonRelation,
                                       MembershipTypeName = memb.SchemeName,
                                       SSFPolicyNo = (patMap != null && patMap.PolicyNo != null && memb.SchemeName == ENUM_PriceCategory.SSF) ? patMap.PolicyNo : "",     //Returning PolicyNo as SSFPolicyNo for SSF Patient
                                       PolicyNo = (patMap != null && patMap.PolicyNo != null) ? patMap.PolicyNo : "",    //Returning PolicyNo as PolicyNo for ECHS Patient
                                       PriceCategoryName = (memb.DefaultPriceCategoryId != null) ? cfgPriceCat.PriceCategoryName : null,
                                       UserId = admission.CreatedBy,
                                       DepartmentName = dept.DepartmentName,
                                       Ins_HasInsurance = visit.Ins_HasInsurance,
                                       ClaimCode = visit.ClaimCode,
                                       Ins_NshiNumber = patient.Ins_NshiNumber
                                   }).ToList();

            var stickerDetail = (from adt in admissionDetail
                                 join user in userList on adt.UserId equals user.EmployeeId
                                 select new
                                 {
                                     adt.PatientBedInfoId,
                                     PatientCode = adt.PatientCode,
                                     PatientName = adt.PatientName,
                                     DateOfBirth = adt.DateOfBirth,
                                     Gender = adt.Gender,
                                     Address = adt.Address,
                                     CountrySubDivisionName = adt.CountrySubDivisionName,
                                     MunicipalityName = adt.MunicipalityName,
                                     WardNumber = adt.WardNumber,
                                     CountryName = adt.CountryName,
                                     PhoneNumber = adt.PhoneNumber,
                                     CountrySubDivisionId = adt.CountrySubDivisionId,
                                     InPatientNo = adt.InPatientNo,
                                     AdmittingDoctor = adt.AdmittingDoctor,
                                     AdmissionDate = adt.AdmissionDate,
                                     Ward = adt.Ward,
                                     BedCode = adt.BedCode,
                                     PriceCategoryName = adt.PriceCategoryName,
                                     RequestingDepartmentName = adt.DepartmentName,
                                     CareOfPersonName = adt.CareOfPersonName,
                                     CareOfPersonPhoneNo = adt.CareOfPersonPhoneNo,
                                     CareOfPersonRelation = adt.CareOfPersonRelation,
                                     User = user.UserName,
                                     Ins_HasInsurance = adt.Ins_HasInsurance,
                                     ClaimCode = adt.ClaimCode,
                                     Ins_NshiNumber = adt.Ins_NshiNumber,
                                     MembershipTypeName = adt.MembershipTypeName,
                                     SSFPolicyNo = adt.SSFPolicyNo,
                                     PolicyNo = adt.PolicyNo
                                 }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault();
            //using double query since it was throwing exception 'Only primitive types or enumeration types are supported in this context' (when using userList and subDivList in the first query)
            //didn't find appropriate solution other than this.
            return stickerDetail;
        }

        private object GetWristBandInfo(int patientVisitId)
        {
            var countrySubDivList = _masterDbContext.CountrySubDivision.ToList();
            var wristBandInfo_Temp = (from admission in _admissionDbContext.Admissions
                                      join visit in _admissionDbContext.Visits on admission.PatientVisitId equals visit.PatientVisitId
                                      join patient in _admissionDbContext.Patients on admission.PatientId equals patient.PatientId
                                      //join doctor in dbContext.Employees on admission.AdmittingDoctorId equals doctor.EmployeeId
                                      //join bedInfos in dbContext.PatientBedInfos on admission.PatientVisitId equals bedInfos.PatientVisitId
                                      //join ward in dbContext.Wards on bedInfos.WardId equals ward.WardId
                                      //join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                      where admission.PatientVisitId == patientVisitId
                                      let empName = _admissionDbContext.Employees.Where(doc => doc.EmployeeId == admission.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                                      select new
                                      {
                                          PatientCode = patient.PatientCode,
                                          PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                          DateOfBirth = patient.DateOfBirth,
                                          Gender = patient.Gender,
                                          Address = patient.Address,
                                          BloodGroup = patient.BloodGroup,
                                          PhoneNumber = patient.PhoneNumber,
                                          CountrySubDivisionId = patient.CountrySubDivisionId,
                                          InPatientNo = visit.VisitCode,
                                          AdmittingDoctor = empName,//doctor.Salutation + ". " + doctor.FirstName + " " + (string.IsNullOrEmpty(doctor.MiddleName) ? "" : doctor.MiddleName + " ") + doctor.LastName,
                                          AdmissionDate = admission.AdmissionDate,

                                          BedInfo = (
                                            (from bedInfo in _admissionDbContext.PatientBedInfos
                                             where bedInfo.PatientVisitId == patientVisitId && bedInfo.IsActive == true
                                             join ward in _admissionDbContext.Wards
                                        on bedInfo.WardId equals ward.WardId
                                             join bed in _admissionDbContext.Beds
                                        on bedInfo.BedId equals bed.BedId
                                             //to get the latest bedinfo, we have to take FirstOrDefault after OrderByDescending.
                                             //PatientBedInfoId needed to sort by latest..
                                             select new
                                             {
                                                 BedCode = bed.BedCode,
                                                 Ward = ward.WardName,
                                                 PatientBedInfoId = bedInfo.PatientBedInfoId
                                             }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault()
                                          ),


                                          //bedInfos.PatientBedInfoId,
                                          //Ward = ward.WardName,
                                          //BedCode = bed.BedCode
                                      }).FirstOrDefault();
            IpWristBandInfoVM wristBandInfo_Final = new IpWristBandInfoVM();
            if (wristBandInfo_Temp != null)
            {
                wristBandInfo_Final = new IpWristBandInfoVM()
                {
                    PatientCode = wristBandInfo_Temp.PatientCode,
                    PatientName = wristBandInfo_Temp.PatientName,
                    InPatientNo = wristBandInfo_Temp.InPatientNo,
                    Gender = wristBandInfo_Temp.Gender,
                    DateOfBirth = wristBandInfo_Temp.DateOfBirth.ToString(),
                    BloodGroup = wristBandInfo_Temp.BloodGroup,
                    PhoneNumber = wristBandInfo_Temp.PhoneNumber,
                    AdmittingDoctor = wristBandInfo_Temp.AdmittingDoctor,
                    AdmissionDate = wristBandInfo_Temp.AdmissionDate.ToString(),
                    Address = wristBandInfo_Temp.Address
                };

                if (wristBandInfo_Temp.BedInfo != null)
                {
                    wristBandInfo_Final.Ward = wristBandInfo_Temp.BedInfo.Ward;
                    wristBandInfo_Final.BedCode = wristBandInfo_Temp.BedInfo.BedCode;
                }
            }
            return wristBandInfo_Final;
        }

        private object GetLastHemoDialysisReport(int patientId)
        {
            var lastHemoReport = (from hemo in _admissionDbContext.HemodialysisReport
                                  where hemo.PatientId == patientId
                                  select hemo).FirstOrDefault();
            if (lastHemoReport != null)
            {
                return lastHemoReport;
            }
            else
            {
                throw new Exception("No Report Found.");
            }
        }

        private object GetAllHemodialysisReport(int patientId)
        {
            var hemoReportList = (from hemo in _admissionDbContext.HemodialysisReport
                                  where hemo.PatientId == patientId
                                  select hemo);
            if (hemoReportList != null)
            {
                return hemoReportList;
            }
            else
            {
                throw new Exception("No Report Found.");
            }
        }

        private object GetBedItemsForPatientVisit(int patientVisitId, int patientId)
        {
            var existingBedFeature = (from bedtxn in _admissionDbContext.PatientBedInfos
                                      where bedtxn.PatientId == patientId && bedtxn.PatientVisitId == patientVisitId
                                      select new
                                      {
                                          bedtxn.BedFeatureId
                                      }).Distinct().ToList();
            return existingBedFeature;
        }

        private object GetICD10List()
        {
            var icdLists = _masterDbContext.ICD10Code.Select(a => new { ICD10Id = a.ICD10ID, ICD10Code = a.ICD10Code, icd10Description = a.ICD10Description, Active = a.Active }).Where(b => b.Active == true).ToList();
            return icdLists;
        }

        private object GetMedicationFrequencies()
        {
            var frequency = _admissionDbContext.MedicationFrequencies.ToList();
            return frequency;
        }

        private object GetDischargeConditions()
        {
            var conditions = (from c in _admissionDbContext.DischargeConditionTypes
                              select c).ToList();
            return conditions;
        }

        private object GetDeliveryTypes()
        {
            var delivery = _admissionDbContext.DeliveryTypes.Select(a => a).ToList();
            return delivery;
        }

        private object GetBirthCondtions()
        {
            var condition = _admissionDbContext.BabyBirthConditions.Select(a => a).ToList();
            return condition;
        }

        private object GetDeathTypes()
        {
            var condition = _admissionDbContext.DeathTypes.Select(a => a).ToList();
            return condition;
        }

        private object GetActiveFicalYear()
        {
            //below is the logic to get currentFiscalYear: sud-6May'21 
            DateTime currentDate = DateTime.Now.Date;
            var currFiscYearName = _admissionDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate)
                               .Select(a => a.FiscalYearName).FirstOrDefault();

            //var year = dbContext.BillingFiscalYears.Where(a => a.IsActive == true).Select(a => a.FiscalYearName).ToList().LastOrDefault();
            return currFiscYearName;
        }

        private object GetFollowUpPreferences(RbacUser currentUser)
        {
            int empId = currentUser.EmployeeId;

            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceValue = (from preference in _admissionDbContext.EmployeePreferences
                                   where preference.EmployeeId == empId &&
                                   preference.PreferenceName == "Followuppreferences" &&
                                   preference.IsActive == true
                                   select preference.PreferenceValue).FirstOrDefault();
            if (preferenceValue != null)
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceValue);
                // selecting the node of xml Document with tag LabTestId

                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientId");
                List<int> patientIds = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int patId = Convert.ToInt32(nodes[i].InnerXml);
                    patientIds.Add(patId);
                }

                return patientIds;
            }
            else
            {
                return null;
            }

        }

        private object GetPatientCertificate(int dischargeSummaryId, int patientId)
        {
            var countrySubDivList = _masterDbContext.CountrySubDivision.ToList();
            var countryList = _masterDbContext.Country.ToList();
            var result = new
            {
                certificate = _admissionDbContext.PatientCertificate.Where(a => a.DischargeSummaryId == dischargeSummaryId).Select(a => a).ToList(),
                PatAddress = (from add in _admissionDbContext.Address.AsEnumerable()
                              where add.PatientId == patientId
                              select new
                              {
                                  Street = add.Street1.ToString(),
                                  Country = countryList.Where(c => c.CountryId == add.CountryId).Select(p => p.CountryName).FirstOrDefault(),
                                  CountryDivision = countrySubDivList.Where(c => c.CountrySubDivisionId == add.CountrySubDivisionId).Select(o => o.CountrySubDivisionName).FirstOrDefault(),
                                  Zip = add.ZipCode
                              }).ToList().FirstOrDefault(),
            };
            return result;
        }

        private object GetDepartmentWardDoctorAndBedInfo(int patientId)
        {
            List<DepartmentModel> deptList = _admissionDbContext.Department.Where(d => d.IsActive == true).ToList();
            int minTimeBeforeCancel = 15;
            var timeFrmParam = (from param in _masterDbContext.CFGParameters
                                where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                && param.ParameterGroupName.ToLower() == "adt"
                                select param.ParameterValue).FirstOrDefault();

            if (!String.IsNullOrEmpty(timeFrmParam))
            {
                minTimeBeforeCancel = Int32.Parse(timeFrmParam);
            }

            var filteredDeptList = (from d in deptList
                                    where d.IsAppointmentApplicable == true
                                    select new
                                    {
                                        Key = d.DepartmentId,
                                        Value = d.DepartmentName
                                    }).ToList();

            List<WardModel> wardList = (from ward in _admissionDbContext.Wards
                                        where ward.IsActive == true
                                        select ward).ToList();

            var visitDoctorList = (from emp in _admissionDbContext.Employees
                                   join dept in _admissionDbContext.Department on (int)emp.DepartmentId equals dept.DepartmentId
                                   where emp.DepartmentId.HasValue && emp.IsActive == true && emp.IsAppointmentApplicable.HasValue && emp.IsAppointmentApplicable == true
                                   select new
                                   {
                                       DepartmentId = dept.DepartmentId,
                                       DepartmentName = dept.DepartmentName,
                                       Key = emp.EmployeeId,
                                       Value = (string.IsNullOrEmpty(emp.Salutation) ? "" : emp.Salutation + ". ") + emp.FirstName + (string.IsNullOrEmpty(emp.MiddleName) ? " " : " " + emp.MiddleName + " ") + emp.LastName
                                   }).ToList();

            ADTBedReservation reservedBed = (from bedReserv in _admissionDbContext.BedReservation
                                             where bedReserv.PatientId == patientId
                                             && bedReserv.IsActive == true
                                             select bedReserv).FirstOrDefault();

            if (reservedBed != null && reservedBed.ReservedBedInfoId > 0)
            {
                reservedBed = ((reservedBed.AdmissionStartsOn).Subtract(System.DateTime.Now).TotalMinutes > minTimeBeforeCancel) ? reservedBed : null;
            }
            return new { DoctorList = visitDoctorList, DepartmentList = filteredDeptList, WardList = wardList, BedReservedForCurrentPat = reservedBed };
        }

        private object GetFavouritePatientList(RbacUser currentUser)
        {
            int empId = currentUser.EmployeeId;

            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceValue = (from preference in _admissionDbContext.EmployeePreferences
                                   where preference.EmployeeId == empId &&
                                   preference.PreferenceName == "Patientpreferences" &&
                                   preference.IsActive == true
                                   select preference.PreferenceValue).FirstOrDefault();
            if (preferenceValue != null)
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceValue);
                // selecting the node of xml Document with tag LabTestId

                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientId");
                List<int> patientIds = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int patId = Convert.ToInt32(nodes[i].InnerXml);
                    patientIds.Add(patId);
                }

                return patientIds;
            }
            else
            {
                return null;
            }

        }

        private object GetNursingFavouritePatients(RbacUser currentUser)
        {
            int empId = currentUser.EmployeeId;

            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceRow = (from preference in _admissionDbContext.EmployeePreferences
                                 where preference.EmployeeId == empId &&
                                 preference.PreferenceName == "NursingPatientPreferences" &&
                                 preference.IsActive == true
                                 select preference).FirstOrDefault();

            var dischargedDict = _admissionDbContext.Admissions.Where(d => d.AdmissionStatus == "discharged").ToDictionary(x => x.PatientVisitId, x => x.AdmissionStatus);

            XmlDocument removeFromFavList(int visitId)
            {
                XmlDocument xdoc = new XmlDocument();
                xdoc.LoadXml(preferenceRow.PreferenceValue);

                XmlNodeList nodes = xdoc.SelectNodes("/root/Row/PatientVisitId");

                foreach (XmlNode node in nodes)
                {
                    if (node.InnerXml == visitId.ToString())
                    {
                        XmlNode parent = node.ParentNode;
                        parent.ParentNode.RemoveChild(parent);
                    }
                }
                preferenceRow.PreferenceValue = xdoc.InnerXml;
                _admissionDbContext.Entry(preferenceRow).Property(p => p.PreferenceValue).IsModified = true;
                _admissionDbContext.SaveChanges();
                return xdoc;
            }
            if ((preferenceRow != null) && (preferenceRow.PreferenceValue != null))
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceRow.PreferenceValue);
                var originalxml = preferenceRow.PreferenceValue;
                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("PatientVisitId");
                List<int> patientVisitIds = new List<int>();
                List<int> favPat = new List<int>();
                List<int> resultingPat = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int patVisitId = Convert.ToInt32(nodes[i].InnerXml);
                    patientVisitIds.Add(patVisitId);
                    if (dischargedDict.ContainsKey(patientVisitIds[i]))
                    {
                        XmlDocument doc = removeFromFavList(patientVisitIds[i]);
                        favPat.Add(patientVisitIds[i]);
                    }
                    else
                    {
                        resultingPat.Add(patientVisitIds[i]);
                    }
                }
                return patientVisitIds.Except(favPat).ToList();
            }
            return null;
        }

        private object CreateAdmission(string ipDataString)
        {
            AdmissionModel clientAdt = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);

            if (IsValidForAdmission(_admissionDbContext, clientAdt.PatientId))
            {
                var res = CreateAdmissionTransaction(_admissionDbContext, clientAdt, connString);

                var pattNm = _admissionDbContext.Patients.Where(a => a.PatientId == clientAdt.PatientId).FirstOrDefault();
                var bedcode = clientAdt.PatientBedInfos[0].Bed.BedCode;
                clientAdt.CareTaker.CareOfPersonPhoneNo = clientAdt.CareOfPersonPhoneNo;
                clientAdt.CareTaker.CareOfPersonName = clientAdt.CareOfPersonName;
                clientAdt.CareTaker.CareOfPersonRelation = clientAdt.CareOfPersonRelation;
                AddPatientCareTaker(_admissionDbContext,clientAdt.CareTaker, clientAdt.PatientId);
                if (clientAdt.AdmittingDoctorId.HasValue && clientAdt.AdmittingDoctorId > 0)
                {
                    SmsModel smsmdl = new SmsModel();
                    EmployeeModel docinfo = DanpheJSONConvert.DeserializeObject<EmployeeModel>(ipDataString);
                    var docObjFromDb = _admissionDbContext.Employees.Where(a => a.EmployeeId == clientAdt.AdmittingDoctorId).FirstOrDefault();

                    //var docname = dbContext.Employees.Where(a => a.EmployeeId == clientAdt.AdmittingDoctorId).Select(a => a.FullName).FirstOrDefault();
                    var patcode = _admissionDbContext.Patients.Where(a => a.PatientId == clientAdt.PatientId).Select(a => a.PatientCode).FirstOrDefault();
                    var smsmsg = "Dear,";
                    var smsmsg1 = "has been admitted to";
                    smsmdl.SmsInformation = smsmsg;
                    smsmdl.PatientId = clientAdt.PatientId;
                    smsmdl.DoctorId = clientAdt.AdmittingDoctorId;
                    smsmdl.CreatedOn = clientAdt.CreatedOn;
                    smsmdl.CreatedBy = clientAdt.CreatedBy;

                    smsmdl.SmsInformation = smsmsg + " " + (docObjFromDb != null ? docObjFromDb.FullName : "") + ",\n" + pattNm.FirstName + " " + pattNm.LastName + " (" + patcode + ") " + smsmsg1 + " " + bedcode;

                    //var docnum = dbContext.Employees.Where(a => a.EmployeeId == clientAdt.AdmittingDoctorId).Select(a => a.ContactNumber).FirstOrDefault();
                    return res;
                    Task.Run(() => PostSMS(smsmdl, (docObjFromDb != null ? docObjFromDb.ContactNumber : "000000"), _admissionDbContext));
                }
                else
                {
                    return res;
                }

            }
            else
            {
                throw new Exception("Patient is already admitted.");
            }
        }
        private void AddPatientCareTaker(AdmissionDbContext _admissionDbContext, CareofPerson_DTO patientCareTaker, int patientId)
        {
            if(patientCareTaker != null)
            {
                var careTakerInfo = _admissionDbContext.Guarantor.Where(x => x.PatientId == patientId).FirstOrDefault();
                if (careTakerInfo != null)
                {
                    careTakerInfo.GuarantorName = patientCareTaker.CareOfPersonName;
                    careTakerInfo.PatientRelationship = patientCareTaker.CareOfPersonRelation;
                    careTakerInfo.GuarantorPhoneNumber = patientCareTaker.CareOfPersonPhoneNo;

                    _admissionDbContext.Entry(careTakerInfo).State = EntityState.Modified;
                }
                else
                {
                    var newCareTakerInfo = new GuarantorModel
                    {
                        PatientId = patientId,
                        GuarantorName = patientCareTaker.CareOfPersonName,
                        PatientRelationship = patientCareTaker.CareOfPersonRelation,
                        GuarantorPhoneNumber = patientCareTaker.CareOfPersonPhoneNo,
                    };

                    _admissionDbContext.Guarantor.Add(newCareTakerInfo);
                }

                _admissionDbContext.SaveChanges();
            }

        }
        private object AddDischargeSummary(string ipDataString)
        {
            using (var dischargeSummaryTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                DischargeSummaryModel summary = DanpheJSONConvert.DeserializeObject<DischargeSummaryModel>(ipDataString);
                summary.CreatedOn = DateTime.Now;
                _admissionDbContext.DischargeSummary.Add(summary);
                _admissionDbContext.SaveChanges();
                var summaryId = _admissionDbContext.DischargeSummary.Where(a => a.PatientVisitId == summary.PatientVisitId).Select(a => a.DischargeSummaryId).FirstOrDefault();
                summary.DischargeSummaryMedications.ForEach(a =>
                {
                    a.IsActive = true;
                    a.DischargeSummaryId = summaryId;
                    _admissionDbContext.DischargeSummaryMedications.Add(a);
                    _admissionDbContext.SaveChanges();
                });
                var patientId = _admissionDbContext.Visits.Where(a => a.PatientVisitId == summary.PatientVisitId).Select(b => b.PatientId).FirstOrDefault();
                summary.DischargeSummaryConsultants.ForEach(c =>
                {
                    c.DischargeSummaryId = summaryId;
                    c.PatientVisitId = summary.PatientVisitId;
                    c.PatientId = patientId;
                    _admissionDbContext.DischargeSummaryConsultant.Add(c);
                    _admissionDbContext.SaveChanges();
                });


                //if (summary.BabyBirthDetails.Count > 0)
                //{
                //    summary.BabyBirthDetails.ForEach(a =>
                //    {
                //        a.DischargeSummaryId = summaryId;
                //        dbContext.BabyBirthDetails.Add(a);
                //        dbContext.SaveChanges();
                //    });
                //}
                dischargeSummaryTransaction.Commit();
                return summary;
            }
        }

        private object AddAdmissionRemark(string ipDataString)
        {
            AdmissionModel admission = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);
            admission.CancelledOn = DateTime.Now;
            _admissionDbContext.Admissions.Add(admission);
            _admissionDbContext.SaveChanges();
            return admission;
        }

        private object SaveWristBandHTML(string ipStr, RbacUser currentUser, string PrinterName, string FilePath)
        {
            if (ipStr.Length > 0)
            {
                //index:i, taken in filename 
                var fileName = "ADT_WristBand_" + PrinterName + "_user_" + currentUser.EmployeeId + ".html";
                byte[] htmlbytearray = System.Text.Encoding.ASCII.GetBytes(ipStr);
                //saving file to default folder, html file need to be delete after print is called.
                System.IO.File.WriteAllBytes(@FilePath + fileName, htmlbytearray);
                return Ok(1);
            }
            else
            {
                throw new Exception("Input Data is Invalid.");
            }

        }

        private object CancelDischargeBill(string ipDataString)
        {
            DischargeCancelModel cancelDisch = DanpheJSONConvert.DeserializeObject<DischargeCancelModel>(ipDataString);

            var res = CancelDischargedInPatient(_admissionDbContext, cancelDisch);
            return res;
        }

        private object PostHemoDialysisReport(string ipDataString, RbacUser currentUser)
        {
            HemodialysisModel newHemoReport = DanpheJSONConvert.DeserializeObject<HemodialysisModel>(ipDataString);
            newHemoReport.CreatedOn = System.DateTime.Now;
            newHemoReport.CreatedBy = currentUser.EmployeeId;
            newHemoReport.IsSubmittedOn = System.DateTime.Now;
            _admissionDbContext.HemodialysisReport.Add(newHemoReport);
            _admissionDbContext.SaveChanges();
            return newHemoReport;
        }

        private object AddPatientBirthCertificate(string ipDataString, RbacUser currentUser)
        {
            PatientCertificateModel report = DanpheJSONConvert.DeserializeObject<PatientCertificateModel>(ipDataString);
            report.CreatedOn = DateTime.Now;
            report.CreatedBy = currentUser.EmployeeId;
            _admissionDbContext.PatientCertificate.Add(report);
            _admissionDbContext.SaveChanges();

            if (report.BabyBirthDetailsId > 0)
            {
                var baby = _admissionDbContext.BabyBirthDetails.Where(a => a.BabyBirthDetailsId == report.BabyBirthDetailsId).Select(a => a).FirstOrDefault();
                baby.CertificateNumber = report.CertificateNumber;
                _admissionDbContext.Entry(baby).State = EntityState.Modified;
                _admissionDbContext.SaveChanges();
            }
            return Ok();
        }

        private object ReserveAdmission(string ipDataString, string action, RbacUser currentUser)
        {
            ADTBedReservation reservedBed = DanpheJSONConvert.DeserializeObject<ADTBedReservation>(ipDataString);
            using (var adtDbTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    int minTimeBeforeCancel = 15;
                    var timeFrmParam = (from param in _admissionDbContext.CFGParameters
                                        where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                        && param.ParameterGroupName.ToLower() == "adt"
                                        select param.ParameterValue).FirstOrDefault();

                    if (!String.IsNullOrEmpty(timeFrmParam))
                    {
                        minTimeBeforeCancel = Int32.Parse(timeFrmParam);
                    }

                    if (!String.IsNullOrEmpty(action) && action.ToLower() == "emergency")
                    {
                        int patVisitId = reservedBed.PatientVisitId.Value;
                        int patId = reservedBed.PatientId;
                        //if (reservedBed.PatientId == 0)
                        //{
                        //    (from visit in dbContext.Visits
                        //     where visit.PatientVisitId == patVisitId
                        //     select visit.PatientId).FirstOrDefault();
                        //}


                        var erPat = _admissionDbContext.EmergencyPatient.Where(e => e.PatientId == patId && e.PatientVisitId == patVisitId).FirstOrDefault();
                        if (erPat != null)
                        {
                            erPat.ERStatus = "finalized";
                            erPat.FinalizedStatus = "admitted";
                            erPat.FinalizedOn = System.DateTime.Now;
                            erPat.FinalizedBy = currentUser.EmployeeId;

                            _admissionDbContext.Entry(erPat).Property(p => p.FinalizedBy).IsModified = true;
                            _admissionDbContext.Entry(erPat).Property(p => p.FinalizedOn).IsModified = true;
                            _admissionDbContext.Entry(erPat).Property(p => p.FinalizedStatus).IsModified = true;
                            _admissionDbContext.Entry(erPat).Property(p => p.ERStatus).IsModified = true;
                            _admissionDbContext.SaveChanges();
                        }
                    }

                    BedModel bedToReserve = _admissionDbContext.Beds.Where(b => b.BedId == reservedBed.BedId
                    && b.IsActive == true && b.IsOccupied == false).FirstOrDefault();

                    if (bedToReserve != null)
                    {
                        //if this bed is reserved then it has to be checked for autocancelled
                        if (bedToReserve.IsReserved == true)
                        {
                            ADTBedReservation oldRes = (from bed in _admissionDbContext.BedReservation
                                                        where bed.BedId == bedToReserve.BedId
                                                        && bed.IsActive == true
                                                        select bed).FirstOrDefault();

                            if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                            {
                                oldRes.IsAutoCancelled = true;
                                oldRes.IsActive = false;
                                oldRes.AutoCancelledOn = System.DateTime.Now;

                                _admissionDbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                _admissionDbContext.Entry(oldRes).Property(b => b.IsAutoCancelled).IsModified = true;
                                _admissionDbContext.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                _admissionDbContext.SaveChanges();
                            }
                        }


                        bedToReserve.IsReserved = true;
                        _admissionDbContext.Entry(bedToReserve).Property(b => b.IsReserved).IsModified = true;
                        _admissionDbContext.SaveChanges();

                        reservedBed.CreatedBy = currentUser.EmployeeId;
                        reservedBed.CreatedOn = System.DateTime.Now;
                        reservedBed.ReservedBy = currentUser.EmployeeId;
                        reservedBed.ReservedOn = System.DateTime.Now;
                        reservedBed.IsActive = true;

                        _admissionDbContext.BedReservation.Add(reservedBed);
                        _admissionDbContext.SaveChanges();

                        adtDbTransaction.Commit();
                        return reservedBed;
                    }
                    else
                    {
                        adtDbTransaction.Rollback();
                        throw new Exception("Cannot Reserve this bed as it may be already booked or occupied");
                    }
                }
                catch (Exception ex)
                {
                    adtDbTransaction.Rollback();
                    throw (ex);
                }
            }
        }

        private object DischargeOnZeroItem(string ipDataString, RbacUser currentUser)
        {
            ZeroItemDischargeModel data = DanpheJSONConvert.DeserializeObject<ZeroItemDischargeModel>(ipDataString);
            BillingDepositModel deposit = new BillingDepositModel();

            //int patId = dbContext.Visits.AsNoTracking().Where(v => v.PatientVisitId == visitId).Select(s => s.PatientId).FirstOrDefault();
            //using (TransactionScope trans = new TransactionScope()) //Krishna, 16thDec'22, Changing the Transaction Scope as we need to change the Isolation level in between the execution to get the DepositReceipt.
            using (var trans = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var admissionDetail = _admissionDbContext.Admissions.Where(a => a.PatientVisitId == data.PatientVisitId).FirstOrDefault();
                    admissionDetail.DischargedBy = currentUser.EmployeeId;
                    admissionDetail.DischargeDate = data.DischargeDate;
                    admissionDetail.AdmissionStatus = ENUM_AdmissionStatus.discharged;
                    if (data.DischargeFrom == "insurance")
                    {
                        admissionDetail.BillStatusOnDischarge = ENUM_BillingStatus.unpaid;
                    }
                    else if (data.DischargeFrom == "billing")
                    {
                        admissionDetail.BillStatusOnDischarge = ENUM_BillingStatus.paid;
                    }
                    admissionDetail.DischargeRemarks = data.DischargeRemarks;
                    _admissionDbContext.Entry(admissionDetail).Property(a => a.DischargedBy).IsModified = true;
                    _admissionDbContext.Entry(admissionDetail).Property(a => a.DischargeDate).IsModified = true;
                    _admissionDbContext.Entry(admissionDetail).Property(a => a.AdmissionStatus).IsModified = true;
                    _admissionDbContext.Entry(admissionDetail).Property(a => a.BillStatusOnDischarge).IsModified = true;
                    _admissionDbContext.Entry(admissionDetail).Property(a => a.DischargeRemarks).IsModified = true;
                    _admissionDbContext.SaveChanges();


                    var patBedInfo = _admissionDbContext.PatientBedInfos.Where(b => (b.PatientVisitId == data.PatientVisitId) && !b.EndedOn.HasValue && (b.OutAction == null)).OrderByDescending(o => o.PatientBedInfoId).FirstOrDefault();
                    patBedInfo.OutAction = ENUM_AdmissionStatus.discharged;
                    patBedInfo.EndedOn = data.DischargeDate;
                    _admissionDbContext.Entry(patBedInfo).Property(a => a.OutAction).IsModified = true;
                    _admissionDbContext.Entry(patBedInfo).Property(a => a.EndedOn).IsModified = true;
                    _admissionDbContext.SaveChanges();


                    var bed = _admissionDbContext.Beds.Where(b => b.BedId == patBedInfo.BedId).FirstOrDefault();
                    //set bed to not occupied
                    bed.IsOccupied = false;
                    bed.OnHold = false;
                    bed.HoldedOn = null;
                    bed.IsReserved = false;
                    _admissionDbContext.Entry(bed).Property(a => a.IsOccupied).IsModified = true;
                    _admissionDbContext.Entry(bed).Property(a => a.OnHold).IsModified = true;
                    _admissionDbContext.Entry(bed).Property(a => a.HoldedOn).IsModified = true;
                    _admissionDbContext.Entry(bed).Property(a => a.IsReserved).IsModified = true;
                    _admissionDbContext.SaveChanges();


                    if (data.DepositBalance > 0)
                    {
                        deposit.PatientId = data.PatientId;
                        deposit.PatientVisitId = data.PatientVisitId;
                        //deposit.Amount = data.DepositBalance;
                        deposit.OutAmount = (decimal)data.DepositBalance;
                        deposit.DepositBalance = 0;
                        deposit.CounterId = data.CounterId;
                        deposit.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                        deposit.CreatedOn = System.DateTime.Now;
                        deposit.CreatedBy = currentUser.EmployeeId;
                        BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                        deposit.FiscalYearId = fiscYear.FiscalYearId;
                        deposit.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                        deposit.FiscalYear = fiscYear.FiscalYearFormatted;
                        EmployeeModel currentEmp = _admissionDbContext.Employees.Where(emp => emp.EmployeeId == currentUser.EmployeeId).AsNoTracking().FirstOrDefault();
                        deposit.BillingUser = currentEmp.FullName;
                        deposit.IsActive = true;

                        _admissionDbContext.BillDeposit.Add(deposit);
                        _admissionDbContext.SaveChanges();

                        EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                        empCashTransaction.TransactionType = deposit.TransactionType;
                        empCashTransaction.ReferenceNo = deposit.DepositId;
                        empCashTransaction.InAmount = 0;
                        empCashTransaction.OutAmount = (double)deposit.OutAmount;
                        empCashTransaction.EmployeeId = currentUser.EmployeeId;
                        empCashTransaction.TransactionDate = DateTime.Now;
                        empCashTransaction.CounterID = deposit.CounterId;
                        empCashTransaction.IsActive = true;

                        _admissionDbContext.EmpCashTransactions.Add(empCashTransaction);
                        _admissionDbContext.SaveChanges();
                    }

                    trans.Commit();
                }
                catch (Exception ex)
                {
                    trans.Rollback();
                    throw (ex);
                }
            }
            return deposit;
        }

        private object DischargePatient(string ipDataString, int bedInfoId)
        {
            AdmissionModel clientAdt = DanpheJSONConvert.DeserializeObject<AdmissionModel>(ipDataString);
            _admissionDbContext.Admissions.Attach(clientAdt);
            FreeBed(bedInfoId, clientAdt.DischargeDate, clientAdt.AdmissionStatus);
            clientAdt.ModifiedOn = DateTime.Now;
            _admissionDbContext.Entry(clientAdt).State = EntityState.Modified;
            _admissionDbContext.Entry(clientAdt).Property(x => x.CreatedOn).IsModified = false;
            _admissionDbContext.Entry(clientAdt).Property(x => x.CreatedBy).IsModified = false;
            _admissionDbContext.Entry(clientAdt).Property(x => x.AdmissionDate).IsModified = false;
            _admissionDbContext.SaveChanges();
            return clientAdt.DischargeDate;
        }

        private object ClearPatientDue(int patientVisitId, RbacUser currentUser)
        {
            AdmissionModel admission = _admissionDbContext.Admissions.Where(b => b.PatientVisitId == patientVisitId).FirstOrDefault();
            if (admission != null)
            {
                admission.BillStatusOnDischarge = "paid";
                admission.ModifiedBy = currentUser.EmployeeId;
                admission.ModifiedOn = DateTime.Now;
                _admissionDbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                _admissionDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                _admissionDbContext.Entry(admission).Property(a => a.ModifiedOn).IsModified = true;
                _admissionDbContext.SaveChanges();
                return Ok();
            }
            else
            {
                throw new Exception("Unable to clear due amount.");
            }
        }

        private object TransferPatient(string transferredFrom, string ipDataString, int bedInfoId)
        {
            //var transferredFrom = this.ReadQueryStringData("transferredFrom");
            PatientBedInfo newBedInfo = DanpheJSONConvert.DeserializeObject<PatientBedInfo>(ipDataString);

            //FreeBed(bedInfoId, newBedInfo.StartedOn, "transfer");   
            PatientBedInfo oldBedInfo = _admissionDbContext.PatientBedInfos
                   .Where(b => b.PatientBedInfoId == bedInfoId)
                   .FirstOrDefault();

            int oldBedId = oldBedInfo.BedId;
            int patVisitId = oldBedInfo.PatientVisitId;

            using (var dbTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    //UpdateIsOccupiedStatus(oldBedInfo.BedId, false);
                    //endedOn can get updated from Billing Edit item as well.
                    if (oldBedInfo.EndedOn == null)
                    { oldBedInfo.EndedOn = newBedInfo.StartedOn; }

                    newBedInfo.BedOnHoldEnabled = false;
                    oldBedInfo.OutAction = "transfer";
                    _admissionDbContext.Entry(oldBedInfo).State = EntityState.Modified;
                    _admissionDbContext.Entry(oldBedInfo).Property(x => x.CreatedOn).IsModified = false;
                    _admissionDbContext.Entry(oldBedInfo).Property(x => x.StartedOn).IsModified = false;
                    _admissionDbContext.Entry(oldBedInfo).Property(x => x.CreatedBy).IsModified = false;

                    var oldBed = _admissionDbContext.Beds.Where(b => b.BedId == oldBedId).FirstOrDefault();
                    oldBed.IsOccupied = false;
                    _admissionDbContext.Entry(oldBed).State = EntityState.Modified;

                    //UpdateIsOccupiedStatus(newBedInfo.BedId, true);
                    var newBed = _admissionDbContext.Beds.Where(b => b.BedId == newBedInfo.BedId).FirstOrDefault();
                    newBed.IsOccupied = true;
                    _admissionDbContext.Entry(newBed).State = EntityState.Modified;
                    //anish: 19 May,2020---Reserve the bed until accepted if parameter is set true
                    if (!String.IsNullOrEmpty(transferredFrom) && transferredFrom == "nursing")
                    {
                        newBedInfo.BedOnHoldEnabled = true;
                        var paramList = (from param in _admissionDbContext.CFGParameters
                                         where (param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                                         || param.ParameterName == "AutoCancellationOfTransferReserveInMins")
                                         select param).AsNoTracking().ToList();

                        var resPrevBed = paramList.Where(v => v.ParameterName == "ReservePreviousBedDuringTransferFromNursing").FirstOrDefault();
                        var autocancelDetail = paramList.Where(v => v.ParameterName == "AutoCancellationOfTransferReserveInMins").FirstOrDefault();

                        if (resPrevBed != null && resPrevBed.ParameterValue == "true")
                        {
                            oldBed.OnHold = true;
                            oldBed.HoldedOn = newBedInfo.StartedOn;
                            _admissionDbContext.Entry(oldBed).Property(x => x.OnHold).IsModified = true;
                            _admissionDbContext.Entry(oldBed).Property(x => x.HoldedOn).IsModified = true;

                            newBed.OnHold = true;
                            newBed.HoldedOn = newBedInfo.StartedOn;
                            _admissionDbContext.Entry(newBed).Property(x => x.OnHold).IsModified = true;
                            _admissionDbContext.Entry(newBed).Property(x => x.HoldedOn).IsModified = true;
                        }
                    }
                    _admissionDbContext.Entry(oldBed).Property(x => x.IsOccupied).IsModified = true;
                    _admissionDbContext.Entry(newBed).Property(x => x.IsOccupied).IsModified = true;
                    _admissionDbContext.SaveChanges();

                    CoreDbContext coreDbContext = new CoreDbContext(connString);

                    //sud: read the paramter value and assign to it.. 
                    //this is the json format for parameter value of this:  {"DoAutoAddBillingItems":false,"DoAutoAddBedItem":false,"ItemList":[{ "ServiceDepartmentId":2,"ItemId":10}]"}
                    //we need to first read the value from this parameter.. 
                    bool isAutoAddBedItems = CommonFunctions.GetCoreParameterValueByKeyName_Boolean(coreDbContext, "ADT", "AutoAddBillingItems", "DoAutoAddBedItem");
                    newBedInfo.CreatedOn = DateTime.Now;
                    _admissionDbContext.PatientBedInfos.Add(newBedInfo);

                    //sud:30Apr'20--update billtxnqty only if autoaddbeditems is true..
                    //if (isAutoAddBedItems == true)
                    //{
                    //start--Sud:25Aug'22: Needed DiscountSchemeId in NewBedItems 
                    var currAdmissionObj = _admissionDbContext.Admissions.Where(adm => adm.PatientVisitId == newBedInfo.PatientVisitId).FirstOrDefault();
                    int discSchemeIdOfCurrentAdmission = (int)currAdmissionObj.DiscountSchemeId;
                    //end--Sud:25Aug'22: Needed DiscountSchemeId in NewBedItems 
                    var currentVisitObj = _admissionDbContext.Visits.Where(visit => visit.PatientVisitId == newBedInfo.PatientVisitId).FirstOrDefault();
                    var newPriceCategoryId = newBedInfo.BedChargeBilItm.PriceCategoryId;
                    int CurrentVisitPriceCategoryId = currentVisitObj.PriceCategoryId;
                    int oldPriceCategoryId = currentVisitObj.PriceCategoryId;
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    if (newPriceCategoryId != null && CurrentVisitPriceCategoryId != newPriceCategoryId)
                    {
                        CurrentVisitPriceCategoryId = newPriceCategoryId;
                        currentVisitObj.PriceCategoryId = newPriceCategoryId;
                        currentVisitObj.ModifiedBy = currentUser.EmployeeId;
                        currentVisitObj.ModifiedOn = DateTime.Now;
                        _admissionDbContext.Entry(currentVisitObj).Property(p => p.PriceCategoryId).IsModified = true;
                        _admissionDbContext.Entry(currentVisitObj).Property(p => p.ModifiedBy).IsModified = true;
                        _admissionDbContext.Entry(currentVisitObj).Property(p => p.ModifiedOn).IsModified = true;

                        //Krishna, 23rdJune'23, Keep the log of PriceCategory Change  
                        VisitSchemeChangeHistoryModel changeVisitSchemeEntity = new VisitSchemeChangeHistoryModel();
                        changeVisitSchemeEntity.ChangeAction = ENUM_VisitSchemeChangeAction.SystemUpdate;
                        changeVisitSchemeEntity.PatientId = newBedInfo.PatientId;
                        changeVisitSchemeEntity.PatientVisitId = currentVisitObj.PatientVisitId;
                        changeVisitSchemeEntity.OldSchemeId = currentVisitObj.SchemeId;
                        changeVisitSchemeEntity.OldPriceCategoryId = oldPriceCategoryId;
                        changeVisitSchemeEntity.NewSchemeId = currentVisitObj.SchemeId;
                        changeVisitSchemeEntity.NewPriceCategoryId = newPriceCategoryId;
                        changeVisitSchemeEntity.Remarks = $"PriceCategory Changed When Patient transferred";
                        changeVisitSchemeEntity.CreatedBy = currentUser.EmployeeId;
                        changeVisitSchemeEntity.CreatedOn = DateTime.Now;
                        _admissionDbContext.VisitSchemeChangeHistory.Add(changeVisitSchemeEntity);

                        _admissionDbContext.SaveChanges();

                    }

                    var autoBillingItemsToStopCalculation = _admissionDbContext.BillTxnItem.Where(a => a.PatientVisitId == currAdmissionObj.PatientVisitId
                                                                                                   && a.BillStatus == ENUM_BillingStatus.provisional
                                                                                                   && a.IsAutoBillingItem == true && a.IsAutoCalculationStop == false).ToList();
                    if(autoBillingItemsToStopCalculation != null && autoBillingItemsToStopCalculation.Count > 0)
                    {
                        autoBillingItemsToStopCalculation.ForEach(item =>
                        {
                            item.IsAutoCalculationStop = true;

                            _admissionDbContext.Entry(item).Property(p => p.IsAutoCalculationStop).IsModified = true;

                        });
                        _admissionDbContext.SaveChanges();
                    }

                    //var adtAutoBillingItems = _admissionDbContext.AdtAutoBillingItems.Where(a => a.SchemeId == discSchemeIdOfCurrentAdmission && a.BedFeatureId == newBedInfo.BedFeatureId).ToList();
                    var adtAutoBillingItems = (from adtAuto in _admissionDbContext.AdtAutoBillingItems
                                               join servMstItem in _admissionDbContext.BillServiceItems on adtAuto.ServiceItemId equals servMstItem.ServiceItemId
                                               join servItm in _admissionDbContext.BillPriceCategoryServiceItems on adtAuto.ServiceItemId equals servItm.ServiceItemId
                                               join servDep in _admissionDbContext.ServiceDepartment on servItm.ServiceDepartmentId equals servDep.ServiceDepartmentId
                                               where adtAuto.SchemeId == discSchemeIdOfCurrentAdmission && adtAuto.BedFeatureId == newBedInfo.BedFeatureId && servItm.PriceCategoryId == CurrentVisitPriceCategoryId
                                               && servDep.ServiceDepartmentName != "Bed Charges" && adtAuto.IsRepeatable == true
                                               select new AdtAutoBillingItem_DTO
                                               {
                                                   ServiceItemId = adtAuto.ServiceItemId,
                                                   PriceCategoryId = servItm.PriceCategoryId,
                                                   SchemeId = adtAuto.SchemeId,
                                                   ItemCode = servItm.ItemLegalCode,
                                                   ItemName = servItm.ItemLegalName,
                                                   ServiceDepartmentId = servDep.ServiceDepartmentId,
                                                   ServiceDepartmentName = servDep.ServiceDepartmentName,
                                                   Price = adtAuto.MinimumChargeAmount,
                                                   IntegrationItemId = servItm.IntegrationItemId,
                                                   IntegrationName = servMstItem.IntegrationName,
                                                   UsePercentageOfBedCharges = adtAuto.UsePercentageOfBedCharges,
                                                   PercentageOfBedCharges = adtAuto.PercentageOfBedCharges
                                               }).ToList();


                    BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);
                    int? provisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                    if (adtAutoBillingItems.Count > 0)
                    {

                        adtAutoBillingItems.ForEach(itm =>
                        {
                            BillingTransactionItemModel billTxnItem = new BillingTransactionItemModel();
                            billTxnItem.PatientId = currAdmissionObj.PatientId;
                            billTxnItem.PatientVisitId = currAdmissionObj.PatientVisitId;
                            billTxnItem.PriceCategoryId = CurrentVisitPriceCategoryId;
                            billTxnItem.DiscountSchemeId = discSchemeIdOfCurrentAdmission;
                            billTxnItem.ItemCode = itm.ItemCode;
                            billTxnItem.ItemName = itm.ItemName;
                            billTxnItem.ItemIntegrationName = itm.IntegrationName;
                            billTxnItem.IntegrationItemId = itm.IntegrationItemId;
                            billTxnItem.ServiceItemId = itm.ServiceItemId;
                            billTxnItem.ServiceDepartmentId = itm.ServiceDepartmentId;
                            billTxnItem.ServiceDepartmentName = itm.ServiceDepartmentName;
                            billTxnItem.Quantity = 1;
                            if (itm.UsePercentageOfBedCharges)
                            {
                                double priceUsingPercentageOfBedCharges = newBedInfo.BedChargeBilItm.Price;
                                billTxnItem.Price = ((double)itm.PercentageOfBedCharges * priceUsingPercentageOfBedCharges) / 100;
                            }
                            else
                            {
                                billTxnItem.Price = (double)itm.Price;
                            }

                            billTxnItem.SubTotal = billTxnItem.Quantity * billTxnItem.Price;
                            billTxnItem.TotalAmount = billTxnItem.SubTotal - billTxnItem.DiscountAmount;
                            billTxnItem.CounterDay = DateTime.Now;
                            billTxnItem.CreatedOn = newBedInfo.StartedOn;
                            billTxnItem.CreatedBy = currentUser.EmployeeId;
                            billTxnItem.BillStatus = ENUM_BillingStatus.provisional;
                            billTxnItem.BillingType = ENUM_BillingType.inpatient;
                            billTxnItem.VisitType = ENUM_VisitType.inpatient;
                            billTxnItem.CounterId = newBedInfo.BedChargeBilItm.CounterId;
                            billTxnItem.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                            billTxnItem.ProvisionalReceiptNo = provisionalReceiptNo;
                            billTxnItem.IsAutoBillingItem = true;
                            billTxnItem.IsAutoCalculationStop = false;
                            _admissionDbContext.BillTxnItem.Add(billTxnItem);
                        });
                        _admissionDbContext.SaveChanges();
                    }

                    var allBedItemsOfPatientByVisit = _admissionDbContext.BillTxnItem.Where(b => (b.PatientVisitId == patVisitId)
                                            && (b.ServiceDepartment.IntegrationName.ToLower() == "bed charges") && (b.BillStatus.ToLower() == "provisional")
                                            ).OrderBy(o => o.RequisitionDate).ToList();

                    var existingBedBillItem = allBedItemsOfPatientByVisit.Where(b => b.ItemId == newBedInfo.BedFeatureId).FirstOrDefault();

                    if (existingBedBillItem == null && isAutoAddBedItems)
                    {
                        //start--Sud:25Aug'22: Needed DiscountSchemeId in NewBedItems 
                        //int? discSchemeIdOfCurrentAdmission = null;
                        //var currAdmissionObj = _admissionDbContext.Admissions.Where(adm => adm.PatientVisitId == newBedInfo.PatientVisitId).FirstOrDefault();
                        //discSchemeIdOfCurrentAdmission = currAdmissionObj != null ? currAdmissionObj.DiscountSchemeId : null;
                        //end--Sud:25Aug'22: Needed DiscountSchemeId in NewBedItems 

                        newBedInfo.BedChargeBilItm.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                        newBedInfo.BedChargeBilItm.ProvisionalReceiptNo = provisionalReceiptNo;
                        newBedInfo.BedChargeBilItm.RequisitionDate = newBedInfo.StartedOn;
                        newBedInfo.BedChargeBilItm.CreatedOn = System.DateTime.Now;
                        newBedInfo.BedChargeBilItm.CreatedBy = currentUser.EmployeeId;
                        newBedInfo.BedChargeBilItm.Quantity = 1;
                        newBedInfo.BedChargeBilItm.DiscountSchemeId = (int)discSchemeIdOfCurrentAdmission;

                        newBedInfo.BedChargeBilItm.IsInsurance = newBedInfo.IsInsurancePatient;
                        newBedInfo.BedChargeBilItm.IsAutoBillingItem = true;
                        newBedInfo.BedChargeBilItm.IsAutoCalculationStop = false;

                        _admissionDbContext.BillTxnItem.Add(newBedInfo.BedChargeBilItm);
                        _admissionDbContext.SaveChanges();
                    }
                    //UpdateBillTxnQuantity(patVisitId, dbContext);
                    //}



                    _admissionDbContext.SaveChanges();
                    dbTransaction.Commit();
                    return GetAdtReturnData(newBedInfo.PatientBedInfoId);
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object UpdateAdmissionInfo(string ipDataString)
        {
            PatientBedInfoVM clientBedInfo = DanpheJSONConvert.DeserializeObject<PatientBedInfoVM>(ipDataString);
            if (clientBedInfo != null)
            {
                PatientBedInfo serverBedInfo = (from patbed in _admissionDbContext.PatientBedInfos
                                                where patbed.PatientBedInfoId == clientBedInfo.PatientBedInfoId
                                                select patbed).FirstOrDefault();
                if (serverBedInfo != null)
                {
                    //Hom 13 Jan, 2019
                    if (serverBedInfo.Action == "admission")
                    {
                        AdmissionModel admission = (from adm in _admissionDbContext.Admissions
                                                    where adm.PatientVisitId == serverBedInfo.PatientVisitId
                                                    select adm).FirstOrDefault();
                        VisitModel patVisit = (from visit in _admissionDbContext.Visits
                                               where visit.PatientVisitId == serverBedInfo.PatientVisitId
                                               select visit).FirstOrDefault();
                        if (clientBedInfo.StartedOn != null)
                        {
                            admission.AdmissionDate = clientBedInfo.StartedOn;
                            patVisit.VisitDate = clientBedInfo.StartedOn;
                            _admissionDbContext.Entry(admission).Property(a => a.AdmissionDate).IsModified = true;
                            _admissionDbContext.Entry(patVisit).Property(a => a.VisitDate).IsModified = true;
                            _admissionDbContext.SaveChanges();
                        }
                    }
                    //previous bed's ended on is next bed's startedon
                    PatientBedInfo previousbedinfo = (from patbed in _admissionDbContext.PatientBedInfos
                                                      where patbed.PatientVisitId == clientBedInfo.PatientVisitId && (DbFunctions.TruncateTime(patbed.EndedOn) == DbFunctions.TruncateTime(serverBedInfo.StartedOn))
                                                      select patbed).FirstOrDefault();

                    PatientBedInfo nextbedinfo = (from patbedinfo in _admissionDbContext.PatientBedInfos
                                                  where patbedinfo.PatientVisitId == clientBedInfo.PatientVisitId && (DbFunctions.TruncateTime(patbedinfo.StartedOn) == DbFunctions.TruncateTime(serverBedInfo.EndedOn))
                                                  select patbedinfo).FirstOrDefault();
                    if (previousbedinfo != null)
                    {
                        previousbedinfo.EndedOn = clientBedInfo.StartedOn;
                        _admissionDbContext.Entry(previousbedinfo).Property(a => a.EndedOn).IsModified = true;
                    }
                    if (nextbedinfo != null)
                    {
                        nextbedinfo.StartedOn = (DateTime)clientBedInfo.EndedOn;
                        _admissionDbContext.Entry(nextbedinfo).Property(a => a.StartedOn).IsModified = true;
                    }
                    serverBedInfo.StartedOn = clientBedInfo.StartedOn;
                    serverBedInfo.EndedOn = clientBedInfo.EndedOn;

                    //update billingItemQty in billingtransactionItems
                    DateTime admDate = _admissionDbContext.Admissions.Where(a => a.PatientVisitId == serverBedInfo.PatientVisitId && a.PatientId == serverBedInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                    var tempTime = admDate.TimeOfDay;
                    List<PatientBedInfo> ChangedBed = (from bed in _admissionDbContext.PatientBedInfos
                                                       where bed.PatientVisitId == serverBedInfo.PatientVisitId
                                                         && bed.BedFeatureId == serverBedInfo.BedFeatureId
                                                       select bed).ToList();
                    UpdateBedInfoQuantity(ChangedBed, tempTime);

                    if (previousbedinfo != null)
                    {
                        List<PatientBedInfo> previousBed = (from bed in _admissionDbContext.PatientBedInfos
                                                            where bed.PatientVisitId == previousbedinfo.PatientVisitId
                                                              && bed.BedFeatureId == previousbedinfo.BedFeatureId
                                                            select bed).ToList();
                        UpdateBedInfoQuantity(previousBed, tempTime);
                    }
                    if (nextbedinfo != null)
                    {
                        List<PatientBedInfo> nextBed = (from bed in _admissionDbContext.PatientBedInfos
                                                        where bed.PatientVisitId == nextbedinfo.PatientVisitId
                                                          && bed.BedFeatureId == nextbedinfo.BedFeatureId
                                                        select bed).ToList();
                        UpdateBedInfoQuantity(nextBed, tempTime);
                    }
                    _admissionDbContext.SaveChanges();
                    _admissionDbContext.Entry(serverBedInfo).Property(a => a.StartedOn).IsModified = true;
                    _admissionDbContext.Entry(serverBedInfo).Property(a => a.EndedOn).IsModified = true;
                    _admissionDbContext.SaveChanges();
                }
                return serverBedInfo;
            }
            else
            {
                throw new Exception("No Data Received From Client.");
            }
        }

        private object UpdateAdmittingDoctor(string ipDataString)
        {
            UpdateAdmittingDoctorVM admittingDoc = DanpheJSONConvert.DeserializeObject<UpdateAdmittingDoctorVM>(ipDataString);
            if (admittingDoc != null)
            {
                AdmissionModel admission = _admissionDbContext.Admissions.FirstOrDefault(adt => adt.PatientVisitId == admittingDoc.PatientVisitId);
                VisitModel patVisit = _admissionDbContext.Visits.FirstOrDefault(visit => visit.PatientVisitId == admittingDoc.PatientVisitId);
                admission.AdmittingDoctorId = admittingDoc.AdmittingDoctorId;
                patVisit.PerformerId = admittingDoc.AdmittingDoctorId;
                patVisit.PerformerName = admittingDoc.AdmittingDoctorName;
                if (admittingDoc.DepartmentId != null)
                {
                    patVisit.DepartmentId = (int)admittingDoc.DepartmentId;
                }
                _admissionDbContext.Entry(admission).Property(a => a.AdmittingDoctorId).IsModified = true;
                _admissionDbContext.Entry(patVisit).Property(a => a.PerformerId).IsModified = true;
                _admissionDbContext.Entry(patVisit).Property(a => a.PerformerName).IsModified = true;
                _admissionDbContext.Entry(patVisit).Property(a => a.DepartmentId).IsModified = true;
                _admissionDbContext.SaveChanges();
                return Ok();
            }
            else
            {
                throw new Exception("No Input Data Found.");
            }
        }

        private object UpdateDischargeSummary(string ipDataString)
        {
            DischargeSummaryModel summary = DanpheJSONConvert.DeserializeObject<DischargeSummaryModel>(ipDataString);
            _admissionDbContext.DischargeSummary.Attach(summary);
            _admissionDbContext.Entry(summary).State = EntityState.Modified;
            _admissionDbContext.Entry(summary).Property(x => x.CreatedOn).IsModified = false;
            _admissionDbContext.Entry(summary).Property(x => x.CreatedBy).IsModified = false;
            summary.ModifiedOn = System.DateTime.Now;
            _admissionDbContext.SaveChanges();


            if (summary.DischargeSummaryMedications.Count > 0)
            {
                //List<DischargeSummaryMedication> medicines = dbContext.DischargeSummaryMedications.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId && a.IsActive == true).ToList();
                var medicines = _admissionDbContext.DischargeSummaryMedications.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).ToList();
                medicines.ForEach(a =>
                {
                    //a.IsActive = false;
                    //dbContext.Entry(a).State = EntityState.Modified;
                    //dbContext.Entry(a).Property(x => x.IsActive).IsModified = true;
                    //dbContext.SaveChanges();
                    _admissionDbContext.DischargeSummaryMedications.Remove(a);
                });
                _admissionDbContext.SaveChanges();
                summary.DischargeSummaryMedications.ForEach(a =>
                {
                    DischargeSummaryMedication medi = new DischargeSummaryMedication();
                    medi = a;
                    medi.DischargeSummaryId = summary.DischargeSummaryId;
                    medi.IsActive = true;
                    _admissionDbContext.DischargeSummaryMedications.Add(medi);

                });
                _admissionDbContext.SaveChanges();
            }
            if (summary.DischargeSummaryConsultants.Count > 0)
            {

                var consultantsDetails = _admissionDbContext.DischargeSummaryConsultant.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).ToList();
                var patientId = _admissionDbContext.DischargeSummaryConsultant.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).Select(a => a.PatientId).FirstOrDefault();
                var patientVisitIdInConsultant = _admissionDbContext.DischargeSummaryConsultant.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).Select(a => a.PatientVisitId).FirstOrDefault();
                consultantsDetails.ForEach(a =>
                {
                    _admissionDbContext.DischargeSummaryConsultant.Remove(a);
                });
                _admissionDbContext.SaveChanges();
                summary.DischargeSummaryConsultants.ForEach(c =>
                {
                    c.DischargeSummaryId = summary.DischargeSummaryId;
                    c.PatientVisitId = patientVisitIdInConsultant;
                    c.PatientId = patientId;
                    _admissionDbContext.DischargeSummaryConsultant.Add(c);

                });
                _admissionDbContext.SaveChanges();


            }

            //if (summary.BabyBirthDetails != null)
            //{
            //    var babydetails = dbContext.BabyBirthDetails.Where(a => a.DischargeSummaryId == summary.DischargeSummaryId).Select(a => a).ToList();
            //    babydetails.ForEach(a =>
            //    {
            //        dbContext.BabyBirthDetails.Remove(a);
            //    });
            //    summary.BabyBirthDetails.ForEach(a =>
            //    {
            //        BabyBirthDetailsModel medi = new BabyBirthDetailsModel();
            //        medi = a;
            //        medi.DischargeSummaryId = summary.DischargeSummaryId;
            //        dbContext.BabyBirthDetails.Add(medi);
            //        dbContext.SaveChanges();
            //    });
            //}

            return summary;
        }

        private object DischargeFromBilling(string ipDataString, RbacUser currentUser)
        {
            DischargeDetailVM dischargeDetail = DanpheJSONConvert.DeserializeObject<DischargeDetailVM>(ipDataString);
            AdmissionModel admission = _admissionDbContext.Admissions.FirstOrDefault(adt => adt.PatientVisitId == dischargeDetail.PatientVisitId);
            if (dischargeDetail != null && dischargeDetail.PatientId != 0)
            {
                //Transaction Begins  
                using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        PatientBedInfo bedInfo = _admissionDbContext.PatientBedInfos
                .Where(bed => bed.PatientVisitId == dischargeDetail.PatientVisitId)
                .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();

                        admission.AdmissionStatus = "discharged";
                        admission.DischargeDate = dischargeDetail.DischargeDate;
                        admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                        admission.DischargedBy = currentUser.EmployeeId;
                        admission.ModifiedBy = currentUser.EmployeeId;
                        admission.ModifiedOn = DateTime.Now;
                        admission.ProcedureType = dischargeDetail.ProcedureType;
                        admission.DiscountSchemeId = dischargeDetail.DiscountSchemeId;
                        admission.DischargeRemarks = dischargeDetail.Remarks;

                        FreeBed(bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate, admission.AdmissionStatus);

                        _admissionDbContext.Entry(admission).Property(a => a.DischargedBy).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.AdmissionStatus).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.DischargeDate).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.ProcedureType).IsModified = true;
                        _admissionDbContext.Entry(admission).Property(a => a.DischargeRemarks).IsModified = true;
                        //dbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                        _admissionDbContext.SaveChanges();
                        dbContextTransaction.Commit(); //end of transaction
                        return Ok();
                    }
                    catch (Exception ex)
                    {
                        //rollback all changes if any error occurs
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            else
            {
                throw new Exception("Unable to Discharge the patient.");
            }
        }

        private object UpdateProcedure(int AdmissionPatientId, string ProcedureType, RbacUser currentUser)
        {
            AdmissionModel patAdms = (from patAdmission in _admissionDbContext.Admissions
                                      where patAdmission.PatientAdmissionId == AdmissionPatientId
                                      select patAdmission).FirstOrDefault();

            if (patAdms != null)
            {
                patAdms.ProcedureType = ProcedureType;
                patAdms.ModifiedBy = currentUser.EmployeeId;
                patAdms.ModifiedOn = currentUser.ModifiedOn;
                _admissionDbContext.Entry(patAdms).Property(a => a.ProcedureType).IsModified = true;
                _admissionDbContext.Entry(patAdms).Property(a => a.ModifiedBy).IsModified = true;
                _admissionDbContext.Entry(patAdms).Property(a => a.ModifiedOn).IsModified = true;

                _admissionDbContext.SaveChanges();
                return Ok();
            }
            else
            {
                throw new Exception("Unable to update Admission procedures.");
            }
        }

        private object CancelAdmission(string ipDataString, RbacUser currentUser)
        {
            //not required in this case as there is nojson string passed from client side 
            //BillingTransactionItemModel billingTransactionItem = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(ipDataString);
            AdmissionCancelVM admissionCancelDetail = DanpheJSONConvert.DeserializeObject<AdmissionCancelVM>(ipDataString);
            if (admissionCancelDetail != null && admissionCancelDetail.PatientVisitId != 0)
            {
                //Transaction Begins  
                using (var dbContextTransaction = _admissionDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        //---------------------------------------------- Phase 1 --------------------------------------------
                        //============================ Update cancel in patientAdmission through patientVisitId ============================			
                        //1. Update in ADT_PatientAdmission AdmissionStatus = "cancel", ModifiedOn and ModifiedBy
                        AdmissionModel patAdms = (from patAdmission in _admissionDbContext.Admissions
                                                  join pBed in _admissionDbContext.PatientBedInfos on patAdmission.PatientVisitId equals pBed.PatientVisitId
                                                  where patAdmission.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                  select patAdmission).FirstOrDefault();

                        if (patAdms != null)
                        {
                            patAdms.AdmissionStatus = "cancel";
                            patAdms.CancelledRemark = admissionCancelDetail.CancelledRemark;
                            patAdms.CancelledOn = admissionCancelDetail.CancelledOn;
                            patAdms.CancelledBy = currentUser.EmployeeId;
                            patAdms.ModifiedBy = currentUser.EmployeeId;
                            _admissionDbContext.Entry(patAdms).Property(a => a.AdmissionStatus).IsModified = true;
                            _admissionDbContext.Entry(patAdms).Property(a => a.CancelledRemark).IsModified = true;
                            _admissionDbContext.Entry(patAdms).Property(a => a.CancelledOn).IsModified = true;

                        }

                        VisitModel currentIpVisit = (from ipVisit in _admissionDbContext.Visits
                                                     where ipVisit.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                     select ipVisit).FirstOrDefault();
                        if (currentIpVisit != null)
                        {
                            currentIpVisit.BillingStatus = ENUM_BillingStatus.cancel;// "cancel";
                            currentIpVisit.VisitStatus = ENUM_VisitStatus.cancel;//  "cancel";
                            currentIpVisit.ModifiedOn = DateTime.Now;
                            currentIpVisit.ModifiedBy = currentUser.EmployeeId;
                            currentIpVisit.Remarks = "Admission Cancel: " + admissionCancelDetail.CancelledRemark;
                            _admissionDbContext.Entry(currentIpVisit).Property(a => a.ModifiedOn).IsModified = true;
                            _admissionDbContext.Entry(currentIpVisit).Property(a => a.ModifiedBy).IsModified = true;
                            _admissionDbContext.Entry(currentIpVisit).Property(a => a.BillingStatus).IsModified = true;
                            _admissionDbContext.Entry(currentIpVisit).Property(a => a.VisitStatus).IsModified = true;
                            _admissionDbContext.Entry(currentIpVisit).Property(a => a.Remarks).IsModified = true;
                        }
                        //2.Update in ADT_TXN_PatientBedInfo table Action = "cancel" , EndedOn = canceled DateTime, Cancel Remarks
                        List<PatientBedInfo> patBedInfo = (from patBed in _admissionDbContext.PatientBedInfos
                                                           where patBed.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                           select patBed).ToList();

                        if (patBedInfo != null)
                        {
                            patBedInfo.ForEach(bedInfo =>
                            {
                                bedInfo.Action = "cancel";
                                bedInfo.EndedOn = DateTime.Now;
                                bedInfo.Remarks = "Admission Cancel: " + admissionCancelDetail.CancelledRemark;
                                FreeBed(bedInfo.PatientBedInfoId, bedInfo.EndedOn, "cancel");
                                _admissionDbContext.Entry(bedInfo).Property(a => a.PatientVisitId).IsModified = true;
                            });
                        }

                        //3.Update in ADT_Bed IsOccupied = false
                        BedModel bedModel = (from bed in _admissionDbContext.Beds
                                             join patBed in _admissionDbContext.PatientBedInfos on bed.BedId equals patBed.BedId
                                             where patBed.PatientVisitId == admissionCancelDetail.PatientVisitId
                                             select bed).FirstOrDefault();

                        //Database attach
                        //which is updated 

                        if (bedModel != null)
                        {
                            bedModel.IsOccupied = false;
                            bedModel.ModifiedOn = DateTime.Now;
                            bedModel.ModifiedBy = currentUser.EmployeeId;
                            _admissionDbContext.Entry(bedModel).Property(a => a.IsOccupied).IsModified = true;
                            _admissionDbContext.Entry(bedModel).Property(a => a.ModifiedOn).IsModified = true;
                            _admissionDbContext.Entry(bedModel).Property(a => a.ModifiedBy).IsModified = true;
                            _admissionDbContext.SaveChanges();
                        }

                        //------------------------------------------ PHASE 2 ------------------------------------------------
                        //cancelling autogenerated items from BillingTransaction table
                        //Krishna,Sud 16thFeb'23 this logic was hardcoded and anyway needed to refactor,
                        //Check this again when implementing admission cancel feature
                        //List<BillingTransactionItemModel> autogeneratedItems = (from bil in _admissionDbContext.BillTxnItem
                        //                                                        join mstItm in _admissionDbContext.BillItemPrice on new { bil.ServiceDepartmentId, bil.ItemId } equals new { mstItm.ServiceDepartmentId, mstItm.IntegrationItemId }
                        //                                                        where bil.PatientVisitId == admissionCancelDetail.PatientVisitId
                        //                                                        && (mstItm.IntegrationName == "ADMISSION CHARGES (INDOOR)"
                        //                                                        || mstItm.IntegrationName == "Medical and Resident officer/Nursing Charges"
                        //                                                        || mstItm.IntegrationName == "Medical Record Charge")
                        //                                                        select bil).ToList();
                        //if (autogeneratedItems != null)
                        //{
                        //    autogeneratedItems.ForEach(item =>
                        //    {
                        //        item.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                        //        item.CancelledOn = DateTime.Now;
                        //        item.CancelledBy = currentUser.EmployeeId;
                        //        item.CancelRemarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                        //        _admissionDbContext.Entry(item).Property(a => a.BillStatus).IsModified = true;
                        //    });

                        //}

                        //cancel bed items in billiing transaciton item
                        List<BillingTransactionItemModel> bedItems = (from bill in _admissionDbContext.BillTxnItem
                                                                      join srv in _admissionDbContext.ServiceDepartment on bill.ServiceDepartmentId equals srv.ServiceDepartmentId
                                                                      where bill.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                      && srv.IntegrationName == "Bed Charges"
                                                                      select bill).ToList();
                        if (bedItems != null)
                        {

                            bedItems.ForEach(bedItem =>
                            {
                                bedItem.BillStatus = ENUM_BillingStatus.cancel; //"cancel";
                                bedItem.CancelledOn = DateTime.Now;
                                bedItem.CancelledBy = currentUser.EmployeeId;
                                bedItem.CancelRemarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                                _admissionDbContext.Entry(bedItem).Property(a => a.BillStatus).IsModified = true;
                            });

                        }
                        //we need to update cancel of autogenerated items in database at this point.
                        //since we need to update uncancelled items i.e lab/radiology to outpatient.
                        _admissionDbContext.SaveChanges();
                        //================ Update PaitentVisitId and VisitType in respective tables ============================
                        //  #Note:
                        //       1. BillingTransactionItems.ItemId and ADT_TXN_PatientBedInfo.FeatureId are same 
                        //Get All the BillingTransactionItems against that InpatientVisit

                        //get patient's latest outpatient visit or emergency visit
                        int? LatestVisitId = null;
                        string latestVisitType = "outpatient";
                        DateTime TodayDate = DateTime.Now;

                        VisitModel patVisit = (from visit in _admissionDbContext.Visits
                                               where (visit.PatientVisitId == admissionCancelDetail.PatientVisitId)
                                                && ((visit.VisitType == ENUM_VisitType.outpatient || visit.VisitType == ENUM_VisitType.emergency)
                                               //&& ((visit.VisitType == "outpatient" || visit.VisitType == "emergency")
                                               && (DbFunctions.TruncateTime(visit.VisitDate) == DbFunctions.TruncateTime(TodayDate)))
                                               select visit).ToList().OrderByDescending(a => a.PatientVisitId).FirstOrDefault();
                        if (patVisit != null)
                        {
                            LatestVisitId = patVisit.PatientVisitId;
                            latestVisitType = patVisit.VisitType;
                        }



                        //update other items as outpatient visit item
                        List<BillingTransactionItemModel> otherBillItems = (from bil in _admissionDbContext.BillTxnItem
                                                                            where bil.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                                            && bil.BillStatus != ENUM_BillingStatus.cancel // "cancel"
                                                                            select bil).ToList();
                        if (otherBillItems != null)
                        {
                            otherBillItems.ForEach(bill =>
                            {
                                ServiceDepartmentModel srvDept = _admissionDbContext.ServiceDepartment.Where(a => a.ServiceDepartmentId == bill.ServiceDepartmentId)
                                        .FirstOrDefault();
                                //update patientvisitid and visittype for billing transaction item
                                bill.PatientVisitId = LatestVisitId;
                                bill.VisitType = latestVisitType;
                                bill.BillingType = latestVisitType == ENUM_VisitType.emergency ? ENUM_BillingType.outpatient : latestVisitType;
                                //bill.BillingType = latestVisitType == "emergency" ? "outpatient" : latestVisitType;
                                bill.Remarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark;
                                _admissionDbContext.Entry(bill).Property(a => a.PatientVisitId).IsModified = true;
                                _admissionDbContext.Entry(bill).Property(a => a.VisitType).IsModified = true;
                                _admissionDbContext.Entry(bill).Property(a => a.Remarks).IsModified = true;

                                //update in respective lab departments requisitions
                                if (srvDept != null && srvDept.IntegrationName != null && srvDept.IntegrationName.ToLower() == "lab")
                                {
                                    LabRequisitionModel labReqs = _admissionDbContext.LabRequisitions.Where(a => a.RequisitionId == bill.RequisitionId).FirstOrDefault();
                                    //update patientvisitid and visittype for billing transaction item
                                    if (labReqs != null)
                                    {
                                        labReqs.PatientVisitId = (int)LatestVisitId;
                                        labReqs.VisitType = latestVisitType;
                                        labReqs.ModifiedBy = currentUser.EmployeeId;
                                        labReqs.ModifiedOn = DateTime.Now;
                                        _admissionDbContext.Entry(labReqs).Property(a => a.PatientVisitId).IsModified = true;
                                        _admissionDbContext.Entry(labReqs).Property(a => a.VisitType).IsModified = true;
                                        _admissionDbContext.Entry(labReqs).Property(a => a.ModifiedBy).IsModified = true;
                                        _admissionDbContext.Entry(labReqs).Property(a => a.ModifiedOn).IsModified = true;


                                    }
                                }

                                //update in respective radiologydepartments requisitions
                                else if (srvDept != null && srvDept.IntegrationName != null && srvDept.IntegrationName.ToLower() == "radiology")
                                {
                                    ImagingRequisitionModel redioReq = _admissionDbContext.ImagingRequisitions.Where(a => a.ImagingRequisitionId == bill.RequisitionId).FirstOrDefault();

                                    if (redioReq != null)
                                    {
                                        redioReq.PatientVisitId = LatestVisitId;
                                        redioReq.ModifiedBy = currentUser.EmployeeId;
                                        redioReq.ModifiedOn = DateTime.Now;
                                        _admissionDbContext.Entry(redioReq).Property(a => a.PatientVisitId).IsModified = true;
                                        _admissionDbContext.Entry(redioReq).Property(a => a.ModifiedBy).IsModified = true;
                                        _admissionDbContext.Entry(redioReq).Property(a => a.ModifiedOn).IsModified = true;
                                    }
                                }
                            });
                        }


                        //----------------------------------------- PHASE 3 ------------------------------------------
                        //============================ Return Deposit and Display Receipt ============================			
                        //get patient's depositbalance
                        //step:4-- if there's deposit balance, then add a return transaction to deposit table. 

                        BillingDepositModel latestDeposit = (from deposit in _admissionDbContext.BillDeposit
                                                             where deposit.PatientVisitId == admissionCancelDetail.PatientVisitId
                                                             select deposit).OrderByDescending(a => a.DepositId).FirstOrDefault();

                        BillingDepositModel returnDepositDetail = null;
                        if (latestDeposit != null && latestDeposit.DepositBalance > 0)
                        {
                            EmployeeModel currentEmp = _admissionDbContext.Employees.Where(emp => emp.EmployeeId == currentUser.EmployeeId).FirstOrDefault();
                            returnDepositDetail = new BillingDepositModel()
                            {
                                TransactionType = ENUM_DepositTransactionType.ReturnDeposit,// "ReturnDeposit",
                                Remarks = "Admission cancel: " + admissionCancelDetail.CancelledRemark,
                                //Amount = latestDeposit.DepositBalance,
                                OutAmount = (decimal)latestDeposit.DepositBalance,
                                DepositBalance = 0,
                                ReceiptNo = BillingBL.GetDepositReceiptNo(connString),
                                FiscalYearId = latestDeposit.FiscalYearId,
                                CounterId = latestDeposit.CounterId,
                                CreatedBy = latestDeposit.CreatedBy,
                                CreatedOn = DateTime.Now,
                                PatientId = latestDeposit.PatientId,
                                PatientVisitId = latestDeposit.PatientVisitId,
                                PaymentMode = latestDeposit.PaymentMode,
                                PaymentDetails = latestDeposit.PaymentDetails,
                                FiscalYear = BillingBL.GetFiscalYear(connString).FiscalYearFormatted,
                                BillingUser = currentEmp.FirstName + " " + currentEmp.LastName,
                                IsActive = true//sud:21Mar'19 -- if not active then it'll give wrong balance in Billing Transaction Page.
                            };

                            _admissionDbContext.BillDeposit.Add(returnDepositDetail);

                        }
                        _admissionDbContext.SaveChanges();
                        dbContextTransaction.Commit(); //end of transaction
                        return returnDepositDetail;
                    }
                    catch (Exception ex)
                    {
                        //rollback all changes if any error occurs
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            else
            {
                throw new Exception("No Admission Found.");
            }
        }

        private object UpdateBirthCertificate(string ipDataString)
        {
            PatientCertificateModel report = DanpheJSONConvert.DeserializeObject<PatientCertificateModel>(ipDataString);
            _admissionDbContext.PatientCertificate.Attach(report);
            _admissionDbContext.Entry(report).State = EntityState.Modified;
            _admissionDbContext.SaveChanges();

            if (report.BabyBirthDetailsId > 0)
            {
                var baby = _admissionDbContext.BabyBirthDetails.Where(a => a.BabyBirthDetailsId == report.BabyBirthDetailsId).Select(a => a).FirstOrDefault();
                baby.CertificateNumber = report.CertificateNumber;
                _admissionDbContext.Entry(baby).State = EntityState.Modified;
                _admissionDbContext.SaveChanges();
            }
            return Ok();
        }

        private object UpdateAdmissionReservation(string ipDataString, RbacUser currentUser)
        {
            ADTBedReservation bedReservationToUpdate = DanpheJSONConvert.DeserializeObject<ADTBedReservation>(ipDataString);
            int newBedId = bedReservationToUpdate.BedId;

            int minTimeBeforeCancel = 15;
            var timeFrmParam = (from param in _admissionDbContext.CFGParameters
                                where param.ParameterName == "MinutesBeforeAutoCancelOfReservedBed"
                                && param.ParameterGroupName.ToLower() == "adt"
                                select param.ParameterValue).FirstOrDefault();

            if (!String.IsNullOrEmpty(timeFrmParam))
            {
                minTimeBeforeCancel = Int32.Parse(timeFrmParam);
            }

            using (var resTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {

                    var resToUpdate = (from res in _admissionDbContext.BedReservation
                                       where res.ReservedBedInfoId == bedReservationToUpdate.ReservedBedInfoId
                                       && res.IsActive == true
                                       select res).FirstOrDefault();

                    int oldBedId = resToUpdate.BedId;


                    resToUpdate.AdmissionNotes = bedReservationToUpdate.AdmissionNotes;
                    resToUpdate.RequestingDepartmentId = bedReservationToUpdate.RequestingDepartmentId;
                    resToUpdate.AdmittingDoctorId = bedReservationToUpdate.AdmittingDoctorId;
                    resToUpdate.WardId = bedReservationToUpdate.WardId;
                    resToUpdate.BedFeatureId = bedReservationToUpdate.BedFeatureId;
                    resToUpdate.BedId = bedReservationToUpdate.BedId;
                    resToUpdate.AdmissionStartsOn = bedReservationToUpdate.AdmissionStartsOn;
                    resToUpdate.ModifiedOn = bedReservationToUpdate.ModifiedOn;
                    resToUpdate.ModifiedBy = bedReservationToUpdate.ModifiedBy;

                    if (oldBedId != newBedId)
                    {
                        var bedToReserve = (from bd in _admissionDbContext.Beds
                                            where bd.BedId == newBedId && bd.IsActive && bd.IsOccupied == false
                                            select bd
                                     ).FirstOrDefault();

                        //if this bed is reserved then it has to be checked for autocancelled
                        if (bedToReserve.IsReserved == true)
                        {
                            ADTBedReservation oldRes = (from bed in _admissionDbContext.BedReservation
                                                        where bed.BedId == bedToReserve.BedId
                                                        && bed.IsActive == true
                                                        select bed).FirstOrDefault();

                            if (oldRes.AdmissionStartsOn.Subtract(System.DateTime.Now).TotalMinutes <= minTimeBeforeCancel)
                            {
                                oldRes.IsAutoCancelled = true;
                                oldRes.AutoCancelledOn = System.DateTime.Now;
                                oldRes.IsActive = false;

                                _admissionDbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                _admissionDbContext.Entry(oldRes).Property(b => b.AutoCancelledOn).IsModified = true;
                                _admissionDbContext.Entry(oldRes).Property(b => b.IsActive).IsModified = true;
                                _admissionDbContext.SaveChanges();
                            }
                        }


                        resToUpdate.ReservedBy = bedReservationToUpdate.ReservedBy;
                        resToUpdate.ReservedOn = bedReservationToUpdate.ReservedOn;
                        _admissionDbContext.Entry(resToUpdate).Property(a => a.ReservedOn).IsModified = true;
                        _admissionDbContext.Entry(resToUpdate).Property(a => a.ReservedBy).IsModified = true;
                    }

                    resToUpdate.ModifiedBy = currentUser.EmployeeId;
                    resToUpdate.ModifiedOn = System.DateTime.Now;

                    _admissionDbContext.Entry(resToUpdate).Property(a => a.AdmissionNotes).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.RequestingDepartmentId).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.WardId).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.AdmittingDoctorId).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.BedFeatureId).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.BedId).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.AdmissionStartsOn).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.ModifiedBy).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.ModifiedOn).IsModified = true;

                    _admissionDbContext.SaveChanges();

                    if (oldBedId != newBedId)
                    {
                        var oldBed = (from bd in _admissionDbContext.Beds
                                      where bd.BedId == oldBedId && bd.IsReserved == true
                                      select bd).FirstOrDefault();
                        oldBed.IsReserved = false;
                        oldBed.ModifiedBy = currentUser.EmployeeId;
                        oldBed.ModifiedOn = System.DateTime.Now;
                        _admissionDbContext.Entry(oldBed).Property(a => a.IsReserved).IsModified = true;
                        _admissionDbContext.Entry(oldBed).Property(a => a.ModifiedBy).IsModified = true;
                        _admissionDbContext.Entry(oldBed).Property(a => a.ModifiedOn).IsModified = true;
                        _admissionDbContext.SaveChanges();

                        var newBed = (from bd in _admissionDbContext.Beds
                                      where bd.BedId == newBedId && bd.IsOccupied == false
                                      && bd.IsActive == true
                                      select bd).FirstOrDefault();
                        newBed.IsReserved = true;
                        newBed.ModifiedBy = currentUser.EmployeeId;
                        newBed.ModifiedOn = System.DateTime.Now;
                        _admissionDbContext.Entry(newBed).Property(a => a.IsReserved).IsModified = true;
                        _admissionDbContext.Entry(newBed).Property(a => a.ModifiedBy).IsModified = true;
                        _admissionDbContext.Entry(newBed).Property(a => a.ModifiedOn).IsModified = true;

                        _admissionDbContext.SaveChanges();
                    }

                    resTransaction.Commit();

                }
                catch (Exception ex)
                {
                    resTransaction.Rollback();
                    throw ex;
                }
            }
            return Ok();
        }

        private object CancelReservedAdmission(string ipDataString, RbacUser currentUser)
        {
            int resIdToCancel = DanpheJSONConvert.DeserializeObject<int>(ipDataString);
            using (var resTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var resToUpdate = (from res in _admissionDbContext.BedReservation
                                       where res.ReservedBedInfoId == resIdToCancel && res.IsActive == true
                                       select res).FirstOrDefault();

                    int bedId = resToUpdate.BedId;

                    resToUpdate.IsActive = false;
                    resToUpdate.CancelledBy = currentUser.EmployeeId;
                    resToUpdate.CancelledOn = System.DateTime.Now;

                    _admissionDbContext.Entry(resToUpdate).Property(a => a.IsActive).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.CancelledBy).IsModified = true;
                    _admissionDbContext.Entry(resToUpdate).Property(a => a.CancelledOn).IsModified = true;

                    _admissionDbContext.SaveChanges();

                    var currBed = (from bd in _admissionDbContext.Beds
                                   where bd.BedId == bedId && bd.IsOccupied == false
                                   && bd.IsReserved == true
                                   select bd).FirstOrDefault();

                    if (currBed != null)
                    {
                        currBed.IsReserved = false;
                        currBed.ModifiedBy = currentUser.EmployeeId;
                        currBed.ModifiedOn = System.DateTime.Now;
                        _admissionDbContext.Entry(currBed).Property(a => a.IsReserved).IsModified = true;
                        _admissionDbContext.Entry(currBed).Property(a => a.ModifiedBy).IsModified = true;
                        _admissionDbContext.Entry(currBed).Property(a => a.ModifiedOn).IsModified = true;
                    }


                    _admissionDbContext.SaveChanges();

                    resTransaction.Commit();

                }
                catch (Exception ex)
                {
                    resTransaction.Rollback();
                    throw ex;
                }
            }
            return Ok();
        }

        private object UndoTransfer(string ipDataString, RbacUser currentUser, string remarks)
        {
            int patVisitId = DanpheJSONConvert.DeserializeObject<int>(ipDataString);
            using (var resTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var resPrevBed = (from param in _admissionDbContext.CFGParameters
                                      where param.ParameterName == "ReservePreviousBedDuringTransferFromNursing"
                                      select param.ParameterValue).AsNoTracking().FirstOrDefault();

                    if (resPrevBed != null && resPrevBed == "true")
                    {

                        var dataToUpdate = (from binfo in _admissionDbContext.PatientBedInfos
                                            where binfo.IsActive == true && binfo.PatientVisitId == patVisitId
                                            select binfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                        //0 th element is Latest and 1 is before that
                        //Update the bedInfo as patient was not received, so set the Latest info status to isActive=false
                        dataToUpdate[0].IsActive = false;
                        dataToUpdate[0].Remarks = remarks;
                        dataToUpdate[0].CancelledBy = currentUser.EmployeeId;
                        dataToUpdate[0].CancelledOn = System.DateTime.Now;
                        dataToUpdate[0].CancelRemarks = remarks;
                        _admissionDbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                        _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.IsActive).IsModified = true;
                        _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.Remarks).IsModified = true;
                        _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.CancelledBy).IsModified = true;
                        _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.CancelledOn).IsModified = true;

                        //Update bed where patient was transferred but not received
                        int lastBedId = dataToUpdate[0].BedId;
                        var occupiedHolded = _admissionDbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                        if (occupiedHolded.OnHold == true)
                        {
                            occupiedHolded.IsOccupied = false;
                            occupiedHolded.OnHold = false;
                            occupiedHolded.HoldedOn = null;
                        }

                        _admissionDbContext.Entry(occupiedHolded).State = EntityState.Modified;
                        _admissionDbContext.Entry(occupiedHolded).Property(x => x.IsOccupied).IsModified = true;
                        _admissionDbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                        _admissionDbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                        //Update the bedInfo as patient was not received, so set the Previous info status to null outaction
                        dataToUpdate[1].OutAction = null;
                        dataToUpdate[1].EndedOn = null;
                        _admissionDbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                        _admissionDbContext.Entry(dataToUpdate[1]).Property(x => x.OutAction).IsModified = true;
                        _admissionDbContext.Entry(dataToUpdate[1]).Property(x => x.EndedOn).IsModified = true;

                        //Update bed where patient was previously
                        int secondLastBedId = dataToUpdate[1].BedId;
                        var initialHolded = _admissionDbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                        initialHolded.IsOccupied = true;
                        initialHolded.OnHold = false;
                        initialHolded.HoldedOn = null;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;

                        _admissionDbContext.SaveChanges();

                    }
                    else
                    {
                        //var bedInfoToUpdate = (from res in dbContext.PatientBedInfos
                        //                       where res.PatientBedInfoId == bedInfoIdToUndo && res.IsActive == true
                        //                       select res).FirstOrDefault();

                        //int bedId = bedInfoToUpdate.BedId;
                        //bedInfoToUpdate.IsActive = false;
                        //bedInfoToUpdate.ModifiedBy = currentUser.EmployeeId;
                        //bedInfoToUpdate.ModifiedOn = System.DateTime.Now;

                        //dbContext.Entry(bedInfoToUpdate).Property(a => a.IsActive).IsModified = true;
                        //dbContext.Entry(bedInfoToUpdate).Property(a => a.ModifiedBy).IsModified = true;
                        //dbContext.Entry(bedInfoToUpdate).Property(a => a.ModifiedOn).IsModified = true;

                        //var currBed = (from bd in dbContext.Beds
                        //               where bd.BedId == bedId
                        //               select bd).FirstOrDefault();

                        //if (currBed != null)
                        //{
                        //    currBed.IsReserved = false;
                        //    currBed.ModifiedBy = currentUser.EmployeeId;
                        //    currBed.ModifiedOn = System.DateTime.Now;
                        //    dbContext.Entry(currBed).Property(a => a.IsReserved).IsModified = true;
                        //    dbContext.Entry(currBed).Property(a => a.ModifiedBy).IsModified = true;
                        //    dbContext.Entry(currBed).Property(a => a.ModifiedOn).IsModified = true;
                        //}

                        //dbContext.SaveChanges();

                    }

                    resTransaction.Commit();

                }
                catch (Exception ex)
                {
                    resTransaction.Rollback();
                    throw ex;
                }
            }
            return Ok();
        }

        private object ReceiveTransfer(string ipDataString, RbacUser currentUser)
        {
            NotesModel NotesMaster = DanpheJSONConvert.DeserializeObject<NotesModel>(ipDataString);
            int patVisitId = NotesMaster.PatientVisitId;
            using (var resTransaction = _admissionDbContext.Database.BeginTransaction())
            {
                try
                {
                    var dataToUpdate = (from bedInfo in _admissionDbContext.PatientBedInfos
                                        where bedInfo.IsActive == true && bedInfo.PatientVisitId == patVisitId
                                        select bedInfo).OrderByDescending(d => d.PatientBedInfoId).Take(2).ToList();

                    //Update the received by detail in the Patient Bed Info
                    dataToUpdate[0].ReceivedBy = currentUser.EmployeeId;
                    dataToUpdate[0].ReceivedOn = NotesMaster.ReceivedOn;
                    _admissionDbContext.Entry(dataToUpdate[0]).State = EntityState.Modified;
                    _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.ReceivedBy).IsModified = true;
                    _admissionDbContext.Entry(dataToUpdate[0]).Property(x => x.ReceivedOn).IsModified = true;

                    //Update bed where patient was transferred to and is received
                    int lastBedId = dataToUpdate[0].BedId;
                    var occupiedHolded = _admissionDbContext.Beds.Where(b => b.BedId == lastBedId).FirstOrDefault();

                    //incase of count =1, it is the case of Admission Receive rather than Receiving the Transfer
                    if ((dataToUpdate.Count == 1) || (occupiedHolded.OnHold == true && occupiedHolded.IsReserved != true))
                    {
                        occupiedHolded.OnHold = false;
                        occupiedHolded.HoldedOn = null;
                    }
                    else
                    {
                        throw new Exception("Already Used by other patient! Please check again.");
                    }

                    _admissionDbContext.Entry(occupiedHolded).State = EntityState.Modified;
                    _admissionDbContext.Entry(occupiedHolded).Property(x => x.OnHold).IsModified = true;
                    _admissionDbContext.Entry(occupiedHolded).Property(x => x.HoldedOn).IsModified = true;

                    //Update the older bed info by setting to isActive False
                    //dataToUpdate[1].IsActive = false;
                    //dbContext.Entry(dataToUpdate[1]).State = EntityState.Modified;
                    //dbContext.Entry(dataToUpdate[1]).Property(x => x.IsActive).IsModified = true;

                    //Update bed from where the patient was transferred
                    if (dataToUpdate.Count > 1)
                    {
                        int secondLastBedId = dataToUpdate[1].BedId;
                        var initialHolded = _admissionDbContext.Beds.Where(b => b.BedId == secondLastBedId).FirstOrDefault();
                        initialHolded.IsOccupied = false;
                        initialHolded.OnHold = false;
                        initialHolded.HoldedOn = null;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.IsOccupied).IsModified = true;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.OnHold).IsModified = true;
                        _admissionDbContext.Entry(initialHolded).Property(x => x.HoldedOn).IsModified = true;
                    }

                    _admissionDbContext.SaveChanges();


                    ClinicalDbContext clinicalDbContext = new ClinicalDbContext(connString);
                    if (NotesMaster.PatientId != 0)
                    {
                        NotesMaster.CreatedOn = DateTime.Now;
                        NotesMaster.CreatedBy = currentUser.EmployeeId;
                        _admissionDbContext.Notes.Add(NotesMaster);
                        _admissionDbContext.SaveChanges();
                        var Notesid = NotesMaster.NotesId;

                        NotesMaster.FreeTextNote.NotesId = Notesid;
                        NotesMaster.FreeTextNote.PatientVisitId = NotesMaster.PatientVisitId;
                        NotesMaster.FreeTextNote.PatientId = NotesMaster.PatientId;
                        NotesMaster.FreeTextNote.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.FreeTextNote.CreatedOn = DateTime.Now;
                        NotesMaster.FreeTextNote.IsActive = true;
                        clinicalDbContext.FreeText.Add(NotesMaster.FreeTextNote);
                        clinicalDbContext.SaveChanges();

                    }

                    resTransaction.Commit();

                }
                catch (Exception ex)
                {
                    resTransaction.Rollback();
                    throw ex;
                }

                // resTransaction.Commit();
            }
            return Ok();
        }
        private object GetAdmissionSchemePriceCategoryInfo(int patientVisitId)
        {
            var admissionSchemePriceCategoryInfo = (from adm in _admissionDbContext.Admissions
                                                    join visit in _admissionDbContext.Visits
                                                    on adm.PatientVisitId equals visit.PatientVisitId
                                                    join scheme in _admissionDbContext.Schemes
                                                    on visit.SchemeId equals scheme.SchemeId
                                                    join priceCat in _admissionDbContext.PriceCategoryModels
                                                    on visit.PriceCategoryId equals priceCat.PriceCategoryId
                                                    where adm.PatientVisitId == patientVisitId
                                                    select new
                                                    {
                                                        PatientVisitId = visit.PatientVisitId,
                                                        SchemeId = visit.SchemeId,
                                                        PriceCategoryId = visit.PriceCategoryId,
                                                        SchemeName = scheme.SchemeName,
                                                        PriceCategoryName = priceCat.PriceCategoryName
                                                    }).FirstOrDefault();
            return admissionSchemePriceCategoryInfo;
        }
    }
    public class OldAndNewBillingTransactionItemIds
    {
        public int OldBillingTransactionItemId { get; set; }
        public int NewBillingTransactionItemId { get; set; }
    }
}
