using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using DanpheEMR.Core.Caching;
using System.Xml;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.LabModels;
using DanpheEMR.Enums;
using DanpheEMR.Core;
using System.Data;
using System.Transactions;
using System.Net;
using System.IO;
using DanpheEMR.Services;
using System.Web;
namespace DanpheEMR.Controllers
{

    public class LabController : CommonController
    {
        //private bool docPatPortalSync = false;
        private List<LabRunNumberSettingsModel> LabRunNumberSettings = new List<LabRunNumberSettingsModel>();
        private GoogleDriveFileUploadService GoogleDriveFileUpload;
        private string CovidReportFileUploadPath;
        private string CovidReportUrlComonPath;
        public IEmailService _emailService;
        private readonly LabDbContext _labDbContext;
        private readonly CoreDbContext _coreDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly BillingDbContext _billingDbContext;

        public LabController(IOptions<MyConfiguration> _config, IEmailService emailService) : base(_config)
        {
            //docPatPortalSync = _config.Value.DanphePatientPortalSync;           
            GoogleDriveFileUpload = new GoogleDriveFileUploadService(_config);
            CovidReportFileUploadPath = _config.Value.GoogleDriveFileUpload.UploadFileBasePath;
            CovidReportUrlComonPath = _config.Value.GoogleDriveFileUpload.FileUrlCommon;
            _emailService = emailService;
            _labDbContext = new LabDbContext(connString);
            _coreDbContext = new CoreDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _billingDbContext = new BillingDbContext(connString);
            this.LabRunNumberSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);
        }

        #region Start HTTP GET APIs

        [HttpGet]
        [Route("WorkList")]
        public ActionResult GetLabWorkList(DateTime fromDate, DateTime toDate, string categoryIdCsv)
        {
            var activeLabTypeName = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => GetLabWorkList(activeLabTypeName, fromDate, toDate, categoryIdCsv);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("PatientNotFinalizedTests")]
        public ActionResult PatientNotFinalizedTests(string categoryIdList, int patientId, DateTime FromDate, DateTime ToDate)
        {
            //if (reqType == "testListSummaryByPatientId")
            //{
            Func<object> func = () => GetPatientNotFinalizedTests(categoryIdList,patientId,FromDate,ToDate);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Requisition/SamplePending")]
        public ActionResult LabRequisitions(DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "labRequisition")//!=null not needed for string.
            //{
            var activeLab = HttpContext.Session.Get<string>("activeLabName");
            Func<object> func = () => GetLabRequisition(activeLab, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }

  

        [HttpGet]
        [Route("Requisition/PatientSamplePending")]
        public ActionResult PatientSamplePending(bool? hasInsurance, int requisitionId, int patientId, string wardName, string visitType, string runNumberType)
        {
            //else if (reqType == "LabSamplesWithCodeByPatientId")
            //{
            var activeLab = HttpContext.Session.Get<string>("activeLabName");
            Func<object> func = () => GetPatientSamplePending(activeLab , hasInsurance, requisitionId, patientId, wardName, visitType,runNumberType);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LatestSampleCode")]
        public ActionResult LatestSampleCode(DateTime SampleDate, string runNumberType, string visitType, int patientId, bool? hasInsurance)
        {
            //else if (reqType == "latest-samplecode")
            //{
            var activeLab = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => GetLatestSampleCode(SampleDate, runNumberType, visitType, patientId, activeLab, hasInsurance);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("IsSampleCodeValid")]
        public ActionResult IsSampleCodeValid(DateTime SampleDate, int? SampleCode, string runNumberType, string visitType, bool? hasInsurance)
        {
            //else if (reqType == "check-samplecode")
            //{
            var activeLab = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => CheckIsSampleCodeValid(SampleDate, SampleCode, runNumberType, visitType, activeLab, hasInsurance);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabWorkList")]
        public ActionResult LabWorkList(string categoryIdList, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "pendingLabResultsForWorkList")
            //{
            var activeLab = HttpContext.Session.Get<string>("activeLabName");
            Func<object> func = () => GetLabWorkList(categoryIdList, activeLab, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Result/Pending")]
        public ActionResult PendingLabResults(string categoryIdList, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "pendingLabResults")
            //{
            var activeLab = HttpContext.Session.Get<string>("activeLabName");
            Func<object> func = () => GetPendingLabResults(categoryIdList, activeLab, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Report/Pending")]
        public ActionResult PendingLabReport(string categoryIdList, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "pending-reports")
            //{
            var activeLab = HttpContext.Session.Get<string>("activeLabName");
            Func<object> func = () => GetPendingLabReport(categoryIdList, activeLab, FromDate, ToDate);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("Report/Finalized")]
        public ActionResult LabReportForReportDispatch(string categoryIdList, DateTime FromDate, DateTime ToDate, int patientId)
        {
            //else if (reqType == "reportsByPatIdInReportDispatch")
            //{
            Func<object> func = () => GetReportForReportDispatch(categoryIdList, FromDate, ToDate, patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientListForReportDispatch")]
        public ActionResult PatientListForReportDispatch(string categoryIdList, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "patientListForReportDispatch")
            //{
            List<string> selCategoryList = DanpheJSONConvert.DeserializeObject<List<string>>(categoryIdList);
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@StartDate", FromDate),
                        new SqlParameter("@EndDate", ToDate),
                        new SqlParameter("@CategoryList", String.Join(",",selCategoryList))
                };

            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetPatientListForReportDispatch", paramList, _labDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PatientListForFinalReport")]
        public ActionResult PatientListForFinalReport(string categoryIdList, DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "final-report-patientlist")
            //{
            var selectedLab = HttpContext.Session.Get<string>("activeLabName");
            List<string> selCategoryList = DanpheJSONConvert.DeserializeObject<List<string>>(categoryIdList);
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", FromDate),
                        new SqlParameter("@ToDate", ToDate),
                        new SqlParameter("@LabTypeName", selectedLab),
                        new SqlParameter("@CategoryIdCsv", String.Join(",",selCategoryList))
                };
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetPatAndReportInfoForFinalReport", paramList, _labDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

       [HttpGet]
        [Route("LabDataByBarcodeNumber")]
        public ActionResult LabDataByBarcodeNumber(int barCodeNumber)
        {
            //else if (reqType == "allLabDataFromBarCodeNumber")
            //{
            var selectedLab = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => GetLabDataByBarcodeNumber(barCodeNumber,selectedLab);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabDataByRunNumber")]
        public ActionResult LabDataByRunNumber(string formattedSampleCode)
        {
            //else if (reqType == "allLabDataFromRunNumber")
            //{
            Func<object> func = () => GetLabDataByRunNumber(formattedSampleCode);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabDataByPatientId")]
        public ActionResult LabDataByPatientId(int patientId)
        {
            //else if (reqType == "allLabDataFromPatientName")
            //{
            Func<object> func = () => GetLabDataByPatientId(patientId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabReportByRequisitionIds")]
        public ActionResult LabReportByRequisitionIds(string requisitionIdList)
        {
            //else if (reqType == "labReportFromReqIdList")
            //{
            Func<object> func = () => GetLabReportByRequisitionIds(requisitionIdList);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ReportDispatch/LabReportByRequisitionIds")]
        public ActionResult LabReportByRequisitionIdsForReportDispatch(string requisitionIdList)
        {
            //else if (reqType == "labReportFromListOfReqIdList")
            //{
            Func<object> func = () => GetLabReportByRequisitionIdsForReportDispatch(requisitionIdList);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabReportTemplates")]
        public ActionResult GetLabReportTemplates()
        {
            //else if (reqType == "all-report-templates")
            //{
            Func<object> func = () => (from report in _labDbContext.LabReportTemplates
                                                       where report.IsActive == true && report.TemplateType == ENUM_LabTemplateType.html// "html"
                                                       select report).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabResultsByVisitId")]
        public ActionResult GetLabResultsByVisitId(int patientVisitId)
        {
            //else if (reqType == "viewReport-visit")
            //{
            Func<object> func = () => (from req in _labDbContext.Requisitions
                              join tst in _labDbContext.LabTests on req.LabTestId equals tst.LabTestId
                              join temp in _labDbContext.LabReportTemplates on tst.ReportTemplateId equals temp.ReportTemplateID
                              where req.PatientVisitId == patientVisitId && tst.ReportTemplateId == temp.ReportTemplateID
                              select new
                              {
                                  TemplateName = temp.ReportTemplateShortName,
                                  Components = (from res in _labDbContext.LabTestComponentResults
                                                where req.RequisitionId == req.RequisitionId
                                                select new
                                                {
                                                    Component = res.ComponentName,
                                                    Value = res.Value,
                                                    Unit = res.Unit,
                                                    Range = res.Range,
                                                    Remarks = res.Remarks,
                                                    CreatedOn = res.CreatedOn,
                                                    RequisitionId = res.RequisitionId,
                                                    IsAbnormal = res.IsAbnormal
                                                }).ToList()
                              }).FirstOrDefault();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabRequisitionsByVisitId")]
        public ActionResult GetLabRequisitionsByVisitId(int patientVisitId, int patientId)
        {
            //else if (reqType == "visit-requisitions")
            //{
            Func<object> func = () => (from req in _labDbContext.Requisitions
                            where req.PatientVisitId == patientVisitId
                            && req.PatientId == patientId
                            select req
                                )
                                .GroupBy(x => x.LabTestId)
                                .Select(g => new
                                {
                                    g.Key,
                                    LatestRequisition = g.OrderByDescending(x => x.RequisitionId).FirstOrDefault()
                                })
                                .Select(x => new
                                {
                                    TestId = x.Key,
                                    TestName = x.LatestRequisition.LabTestName,
                                    labComponents = _labDbContext.LabTestComponentResults.Where(a => a.RequisitionId == x.LatestRequisition.RequisitionId).ToList()
                                })
                                .ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabResultsByPatientId")]
        public ActionResult GetLabResultsByPatientId(int patientId)
        {
            //to view report of a patient
            //else if (reqType == "viewReport-patient")
            //{
            Func<object> func = () => (from req in _labDbContext.Requisitions
                              join tst in _labDbContext.LabTests on req.LabTestId equals tst.LabTestId
                              join temp in _labDbContext.LabReportTemplates on tst.ReportTemplateId
                              equals temp.ReportTemplateID
                              where req.PatientId == patientId && tst.ReportTemplateId == temp.ReportTemplateID
                              select new
                              {
                                  TemplateName = temp.ReportTemplateShortName,
                                  Components = (from res in _labDbContext.LabTestComponentResults
                                                where res.RequisitionId == req.RequisitionId
                                                select new
                                                {
                                                    Date = req.OrderDateTime,
                                                    Component = res.ComponentName,
                                                    Value = res.Value,
                                                    Unit = res.Unit,
                                                    Range = res.Range,
                                                    Remarks = res.Remarks,
                                                    CreatedOn = res.CreatedOn,
                                                    RequisitionId = res.RequisitionId,
                                                    IsAbnormal = res.IsAbnormal

                                                }).ToList()
                              }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("LabTests")]
        public ActionResult LabTests()
        {
            //else if (reqType == "allLabTests")
            //{
            Func<object> func = () => GetAllLabTests();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Requisition/LabSpecimen")]
        public ActionResult GetSpecimen(int requisitionId)
        {
            //else if (reqType == "getSpecimen")
            //{
            Func<object> func = () => _labDbContext.Requisitions.Where(val => val.RequisitionId == requisitionId).FirstOrDefault<LabRequisitionModel>();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("RequisitionsByRequisitionIds")]
        public ActionResult RequisitionsByRequisitionIds(string requisitionIdList)
        {
            //else if (reqType == "labRequisitionFromRequisitionIdList")
            //{
            Func<object> func = () => {
                List<Int64> reqIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(requisitionIdList);
                List<LabRequisitionModel> allReq = new List<LabRequisitionModel>();
                allReq = _labDbContext.Requisitions.Where(req => reqIdList.Contains(req.RequisitionId)).ToList();
                return allReq;
            };
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("RequisitionsForExternalLab")]
        public ActionResult GetReqiusitionsForExternalLab(string LabTestCSV, DateTime FromDate, DateTime ToDate,string PatientName, string HospitalNo, int VendorId, string ExternalLabStatus)
        {
            //else if (reqType == "allTestListForExternalLabs")
            //{
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@PatientName",PatientName),
                        new SqlParameter("@HospitalCode",HospitalNo),
                        new SqlParameter("@FromDate", FromDate),
                        new SqlParameter("@ToDate", ToDate),
                        new SqlParameter("@LabTestIdCSV", LabTestCSV),
                        new SqlParameter("@VendorId",VendorId),
                        new SqlParameter("@ExternalLabStatus",ExternalLabStatus)
                };
            Func<object> func = () => DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetAllLabRequisitionForExternalLab", paramList, _labDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("RequisitionsSentToExternalLab")]
        public ActionResult RequisitionsSentToExternalLab()
        {
            //else if (reqType == "allTestListSendToExternalLabs")
            //{
            Func<object> func = () =>
                {
                    var defaultVendorId = (from vendor in _labDbContext.LabVendors
                                           where vendor.IsDefault == true
                                           select vendor.LabVendorId).FirstOrDefault();
                    DateTime dtThirtyDays = DateTime.Now.AddDays(-30);
                    List<LabTestListWithVendor> allRequisitionsWithVendors = (from req in _labDbContext.Requisitions
                                                                              join vendor in _labDbContext.LabVendors on req.ResultingVendorId equals vendor.LabVendorId
                                                                              join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                                                              join test in _labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                                                              where (req.OrderDateTime > dtThirtyDays)
                                                                              && req.ResultingVendorId != defaultVendorId
                                                                              select new LabTestListWithVendor
                                                                              {
                                                                                  PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                                                  RequisitionId = req.RequisitionId,
                                                                                  VendorName = vendor.VendorName,
                                                                                  TestName = test.LabTestName
                                                                              }).ToList();
                    return allRequisitionsWithVendors;
                };
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabCategories")]
        public ActionResult GetLabCategories()
        {
            //else if (reqType == "all-lab-category")
            //{
            Func<object> func = () => (from cat in _labDbContext.LabTestCategory
                                       select cat).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabTypes")]
        public ActionResult GetLabTypes()
        {
            //else if (reqType == "get-lab-types")
            //{
            Func<object> func = () => (from type in _labDbContext.LabTypes where type.IsActive == true
                                              select type).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("LabSpecimens")]
        public ActionResult LabSpecimentList()
        {
            //else if (reqType == "all-lab-specimen")
            //{
            Func<object> func = () => (from cat in _labDbContext.LabTestSpecimen
                                       select new
                                       {
                                           Name = cat.SpecimenName,
                                           IsSelected = false,
                                           SpecimenId = cat.SpecimenId
                                       }).ToList();
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("SampleCollectedRequisitions")]
        public ActionResult GetSampleCollectedRequisitions(DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "allSamplesCollectedData")
            //{

            Func<object> func = () =>
            {
                var activeLab = HttpContext.Session.Get<string>("activeLabName");
                List<SqlParameter> paramList = new List<SqlParameter>(){
                                                new SqlParameter("@FromDate", FromDate.Date),
                                                new SqlParameter("@ToDate", ToDate.Date),
                                                new SqlParameter("@SelectedLab", activeLab)
                                            };

                DataTable samplesCollected = DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetSamplesCollectedInfo", paramList, _labDbContext);

                var startTime = System.DateTime.Now;
                foreach (var item in samplesCollected.Rows)
                {
                    var a = 11;
                    var b = (a * 20) - 1000;
                    var c = b * 1000;
                }
                var diff = startTime.Subtract(System.DateTime.Now).TotalSeconds;
                return samplesCollected;
            };
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Notification/CovidResults")]
        public ActionResult GetCovidResults(DateTime FromDate, DateTime ToDate)
        {
            //else if (reqType == "allSmsApplicableTest")
            //{
            Func<object> func = () => _labDbContext.GetCovidTestResults(FromDate.Date, ToDate.Date);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("Notification/CovidSmsText")]
        public ActionResult GetCovidSmsText(int requisitionId)
        {
            //else if (reqType == "getSMSMessage")
            //{
            Func<object> func = () =>
            {
                var selectedId = Convert.ToInt64(requisitionId);
                var patientData = GetSmsMessageAndNumberOfPatientByReqId(_labDbContext, selectedId);
                if (!(patientData.RequisitionId > 0) || !string.IsNullOrWhiteSpace(patientData.Message))
                {
                    return patientData;
                }
                else
                {
                    throw new Exception("Invalid Record");
                }
            };
            return InvokeHttpGetFunction<object>(func);
        }

        #endregion

        #region Start HTTP POST APIs

        [HttpPost]
        [Route("ComponentResults")]
        public ActionResult PostComponentResults()
        {
            //if (reqType != null && reqType == "AddComponent")
            //{
            string ipStr = this.ReadPostData();
            string specimenDataModel = this.ReadQueryStringData("specimenData");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => AddComponents(specimenDataModel, ipStr, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

 

        [HttpPost]
        [Route("Requisitions")]
        public ActionResult PostRequisitions()
        {
            //else if (reqType == "addNewRequisitions") //comes here from doctor and nurse orders.
            //{
            string ipStr = this.ReadPostData();
            Func<object> func = () => AddNewRequsition(ipStr);
            return InvokeHttpPostFunction<object>(func);
        }


        [HttpPost]
        [Route("LabReport")]
        public ActionResult PostLabReport()
        {
            //else if (reqType == "add-labReport")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => LabReportAdd(currentUser,ipStr);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Notification/Sms")]
        public ActionResult PostSms()
        {
            //else if (reqType == "postSMS")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => PostSMS(ipStr, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("Notification/UploadCovidReportToGoogleDrive")]
        public ActionResult UploadCovidReportToGoogleDrive()
        {
            //else if (reqType == "sendCovidPdfReport")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UploadCovidReportToGoogleDrive(ipStr, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPut]
        [Route("GenerateSampleCodeAutomatic")]
        public ActionResult GenerateSampleCodeAutomatic()
        {
            //else if (reqType == "updateSampleCodeAutomatically")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            var activeLabTypeName = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => GenerateSampleCodeAutomatic(ipStr, currentUser,activeLabTypeName);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("LabStickerHtml")]
        public ActionResult LabStickerHtml()
        {
            //else if (reqType == "saveLabSticker")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            int noOfPrints = Convert.ToInt32(this.ReadQueryStringData("numOfCopies"));
            string FolderPath = this.ReadQueryStringData("filePath");
            string PrinterName = this.ReadQueryStringData("PrinterName");
            Func<object> func = () => LabStickerSave(ipStr, currentUser,PrinterName,noOfPrints,FolderPath);
            return InvokeHttpPostFunction<object>(func);
        }

        [HttpPost]
        [Route("EmailLabReport")]
        public ActionResult EmailLabReport()
        {
            //else if (reqType == "sendEmail")
            //{
            string ipStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => SendLabReportEmailToPatient(ipStr, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        

        #region Start HTTP PUT APIs
        [Route("updateFileUploadStatus")]
        [HttpPut]
        public IActionResult updateFileUploadStatus(string requisitionIdList)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            LabDbContext labDbContext = new LabDbContext(connString);
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                List<Int64> reqIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(requisitionIdList);
                List<LabRequisitionModel> model = labDbContext.Requisitions.Where(a => reqIdList.Contains(a.RequisitionId)).ToList();
                model.ForEach((singleModel) =>
                {
                    singleModel.IsFileUploadedToTeleMedicine = true;
                    singleModel.ModifiedBy = currentUser.UserId;
                    singleModel.ModifiedOn = DateTime.Now;
                    singleModel.UploadedByToTeleMedicine = currentUser.UserId;
                    singleModel.UploadedOnToTeleMedicine = DateTime.Now;
                    labDbContext.Entry(singleModel).Property(a => a.ModifiedBy).IsModified = true;
                    labDbContext.Entry(singleModel).Property(a => a.ModifiedOn).IsModified = true;
                    labDbContext.Entry(singleModel).Property(a => a.IsFileUploadedToTeleMedicine).IsModified = true;
                    labDbContext.Entry(singleModel).Property(a => a.UploadedByToTeleMedicine).IsModified = true;
                    labDbContext.Entry(singleModel).Property(a => a.UploadedOnToTeleMedicine).IsModified = true;
                    labDbContext.SaveChanges();
                });
                responseData.Results = model;
                responseData.Status = "OK";
                return Ok(responseData);
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                return BadRequest(responseData);
            }
        }

        [HttpPut]
        [Route("GenerateSampleCodeManual")]
        public ActionResult GenerateSampleCodeManual()
        {
            ////used in collect sample page.
            ////we're sending test list instead of reqId list because we may have different sample codes agaist different test if we use use last sample code feature.
            //if (reqType == "updateSampleCode")
            //{
            Func<object> func = () =>
            {
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                var activeLabTypeName = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
                List<PatientLabSampleVM> labTests = DanpheJSONConvert.DeserializeObject<List<PatientLabSampleVM>>(str); ;//this will come from client side--after parsing.

                //sample code for All Tests in Current Requests will be same.

                if (labTests != null)
                {
                    try
                    {
                        var data = UpdateSampleCode(_labDbContext, labTests, currentUser, activeLabTypeName);

                        return new { FormattedSampleCode = data.FormattedSampleCode, BarCodeNumber = data.BarCodeNumber, SampleCollectedOnDateTime = data.SampleCollectedOnDateTime };
                    }
                    catch (Exception ex)
                    {
                        throw (ex);
                    }
                }
                else
                    return null;
            };
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("Report/UpdateSampleCode")]
        public ActionResult UpdateSampleCodeFromViewReport()
        {
            //else if (reqType == "updae-sample-code-reqId")
            //{
            DateTime? SampleDate = Convert.ToDateTime(this.ReadQueryStringData("SampleDate"));
            string runNumberType = this.ReadQueryStringData("runNumberType");
            string patVisitType = this.ReadQueryStringData("visitType");
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            int? RunNumber = ToInt(this.ReadQueryStringData("RunNumber"));
            var activeLabTypeName = HttpContext.Session.Get<string>(ENUM_SessionVariables.ActiveLabType);
            Func<object> func = () => UpdateSampleCodeOfRequisition(str, SampleDate, runNumberType, patVisitType, RunNumber, currentUser,activeLabTypeName);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("Requisition/BillStatus")]
        public ActionResult UpdateBillStatus()
        {
            //else if (reqType == "updateBillStatus" && billstatus != null)
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string billstatus = this.ReadQueryStringData("billstatus");
            Func<object> func = () => UpdateBillStatus(str,billstatus, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

 
        [HttpPut]
        [Route("ComponentResults")]
        public ActionResult PutComponentResults()
        {
            // to update the lab result
            //else if (reqType == "EditLabTestResult")
            //{
            string str = this.ReadPostData();
            string specimenDataModel = this.ReadQueryStringData("specimenData");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => EditLabTestResult(specimenDataModel, str, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("UpdateLabReport")]
        public ActionResult UpdateLabReport()
        {
            //else if (reqType == "update-labReport")
            //{
            Func<object> func = () =>
            {
                string str = this.ReadPostData();
                string specimenDataModel = this.ReadQueryStringData("specimenData");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                LabReportModel clientReport = DanpheJSONConvert.DeserializeObject<LabReportModel>(str);
                LabReportModel servReport = _labDbContext.LabReports
                                         .Where(a => a.LabReportId == clientReport.LabReportId)
                                          .FirstOrDefault<LabReportModel>();

                if (servReport != null)
                {
                    servReport.ModifiedBy = currentUser.EmployeeId;
                    servReport.ModifiedOn = DateTime.Now;
                    servReport.Signatories = clientReport.Signatories;
                    servReport.Comments = clientReport.Comments;
                }
                _labDbContext.Entry(servReport).Property(a => a.Signatories).IsModified = true;
                _labDbContext.Entry(servReport).Property(a => a.ModifiedOn).IsModified = true;
                _labDbContext.Entry(servReport).Property(a => a.ModifiedBy).IsModified = true;
                _labDbContext.Entry(servReport).Property(a => a.Comments).IsModified = true;
                _labDbContext.SaveChanges();
                return Ok();
            };
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("Report/PrintCount")]
        public ActionResult UpdatePrintCount()
        {
            //else if (reqType == "update-reportPrintedFlag")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string labReqIdList = this.ReadQueryStringData("requisitionIdList");
            int? PrintedReportId = ToInt(this.ReadQueryStringData("reportId"));
            Func<object> func = () => UpdatePrintedFlag(labReqIdList,PrintedReportId, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("UpdateDoctorInLabRequisition")]
        public ActionResult UpdateDoctorInLabRequisition()
        {
            //else if (reqType == "UpdateDoctor")
            //{
            string str = this.ReadPostData();
            int prescriberId = Convert.ToInt32(this.ReadQueryStringData("id"));
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UpdateDoctor(str, prescriberId, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("UpdateDoctorInLabReport")]
        public ActionResult UpdateDoctorInLabReport()
        {
            //else if (reqType == "UpdateDoctorNameInLabReport")
            //{
            Func<object> func = () =>
            {
                string str = this.ReadPostData();
                int id = Convert.ToInt32(this.ReadQueryStringData("id"));
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                LabReportModel labreport = _labDbContext.LabReports
                    .Where(rep => rep.LabReportId == id).FirstOrDefault<LabReportModel>();

                _labDbContext.LabReports.Attach(labreport);

                _labDbContext.Entry(labreport).Property(a => a.PrescriberName).IsModified = true;
                _labDbContext.Entry(labreport).Property(a => a.ModifiedOn).IsModified = true;
                _labDbContext.Entry(labreport).Property(a => a.ModifiedBy).IsModified = true;

                labreport.PrescriberName = str;
                labreport.ModifiedBy = currentUser.EmployeeId;
                labreport.ModifiedOn = DateTime.Now;
                _labDbContext.SaveChanges();
                return Ok("OK");
            };
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("ChangeLabTestWithSamePrice")]
        public ActionResult ChangeLabTestWithSamePrice()
        {
            //else if (reqType == "ChangeLabTestWithSamePrice")
            //{
            string str = this.ReadPostData();
            int reqId = Convert.ToInt32(this.ReadQueryStringData("requisitionid"));
            Func<object> func = () => UpdateTestWithSamePrice(reqId,str);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("CancelInpatientLabTest")]
        public ActionResult CancelInpatientLabTest()
        {
            //else if (reqType == "cancelInpatientLabTest")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => CancelInpatientLabTest(str, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("Requisition/LabSpecimen")]
        public ActionResult UpdateLabSpecimen()
        {
            //else if (reqType == "update-specimen")
            //{
            Func<object> func = () =>
            {
                int reqId = Convert.ToInt32(this.ReadQueryStringData("ReqId"));
                string specimen = this.ReadQueryStringData("Specimen");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (reqId > 0)
                {
                    LabRequisitionModel labReq = _labDbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault<LabRequisitionModel>();
                    labReq.LabTestSpecimen = specimen;
                    labReq.ModifiedBy = currentUser.EmployeeId;
                    labReq.ModifiedOn = DateTime.Now;
                    _labDbContext.Entry(labReq).Property(a => a.LabTestSpecimen).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.ModifiedBy).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.ModifiedOn).IsModified = true;
                    _labDbContext.SaveChanges();
                }
                return specimen;
            };
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("UndoSampleCode")]
        public ActionResult UndoSampleCode()
        {
            //else if (reqType == "undo-samplecode")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => UndoSampleCode(str, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("VerifyTestResultWithSignatory")]
        public ActionResult VerifyTestResultWithSignatory()
        {
            //else if (reqType == "verify-all-labtests")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => VerifyTestResultWithSignatory(str, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("VerifyTestResultWithoutSignatory")]
        public ActionResult VerifyTestResultWithoutSignatory()
        {
            //else if (reqType == "verify-all-requisitions-directly")
            //{
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            Func<object> func = () => VerifyTestResultWithoutSignatory(str, currentUser);
            return InvokeHttpPutFunction<object>(func);
        }

        [HttpPut]
        [Route("Requisition/Vendor")]
        public ActionResult UpdateVendorInLabRequisition()
        {
            //else if (reqType == "UpdateVendorIdToLabTestRequisition")
            //{
            Func<object> func = () =>
            {
                string str = this.ReadPostData();
                var newVendorId = ToInt(this.ReadQueryStringData("vendorId"));
                List<Int64> RequisitionIds = (DanpheJSONConvert.DeserializeObject<List<Int64>>(str));
                foreach (Int64 reqId in RequisitionIds)
                {
                    LabRequisitionModel singleRequisition = _labDbContext.Requisitions
                                              .Where(a => a.RequisitionId == reqId)
                                              .FirstOrDefault();
                    if (singleRequisition != null)
                    {
                        singleRequisition.ResultingVendorId = newVendorId;
                        _labDbContext.Entry(singleRequisition).Property(a => a.ResultingVendorId).IsModified = true;
                        _labDbContext.SaveChanges();
                    }
                }
                return Ok("OK");
            };
            return InvokeHttpPutFunction<object>(func);
        }


        [HttpPut]
        [Route("Requisition/ChangeLabType")]
        public ActionResult TransferToLab()
        {
            //else if (reqType == "transfertoLab")
            //{
            var requisitionId = Convert.ToInt32(this.ReadQueryStringData("reqId"));
            var labType = this.ReadQueryStringData("labTypeName");
            Func<object> func = () => TransferToLab(requisitionId, labType);
            return InvokeHttpPutFunction<object>(func);
        }


        [HttpPut]
        [Route("ExternalLabStatus")]
        public IActionResult UpdateExternalLabStatus([FromBody] ExternalLabStatusUpdate_DTO externalLabStatus)
        {
            Func<object> func = () =>
            {
                foreach (int requisitionId in externalLabStatus.RequisitionIds)
                {
                    LabRequisitionModel requisition = _labDbContext.Requisitions.FirstOrDefault(r => r.RequisitionId == requisitionId);

                    if (requisition != null)
                    {
                        requisition.ExternalLabSampleStatus = externalLabStatus.SelectedExternalLabStatusType;
                    }
                    
                }
                _labDbContext.SaveChanges();
                return Ok(ENUM_Danphe_HTTP_ResponseStatus.OK);
            };
             return InvokeHttpPutFunction<object>(func);
        }
        #endregion




        private LabSMSModel GetSmsMessageAndNumberOfPatientByReqId(LabDbContext labDbContext, long reqId)
        {
            LabSMSModel data = new LabSMSModel();
            var patientData = (from req in labDbContext.Requisitions
                               join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                               join pat in labDbContext.Patients on req.PatientId equals pat.PatientId
                               join txn in labDbContext.LabTestComponentResults on req.RequisitionId equals txn.RequisitionId
                               where req.RequisitionId == reqId //&& test.LabTestName == "idsList"
                               select new
                               {
                                   RetuisitionId = req.RequisitionId,
                                   TestName = test.LabTestName,
                                   PatientName = pat.ShortName,
                                   PhoneNumber = pat.PhoneNumber,
                                   Result = txn.Value,
                                   SampleCollectedOn = req.SampleCollectedOnDateTime.Value,
                                   CovidFileId = req.GoogleFileIdForCovid
                               }).FirstOrDefault();
            if (patientData != null)
            {
                var fileUrl = CovidReportUrlComonPath.Replace("GGLFILEUPLOADID", patientData.CovidFileId);
                data.Message = "Dear " + patientData.PatientName + ", " + "Your COVID-19 Report is " + patientData.Result + "." + "\n" + "Sample collected on " + patientData.SampleCollectedOn.ToString("M/d/yyyy")
                    + (!string.IsNullOrWhiteSpace(patientData.CovidFileId) ? ("\n" + fileUrl) : "");
                data.PhoneNumber = patientData.PhoneNumber;
                data.RequisitionId = reqId;
            }
            return data;
        }

        private bool PutOrderStatusOfRequisitions(LabDbContext labDbContext, List<Int64> requisitionIds, string orderStatus)
        {
            foreach (Int64 reqId in requisitionIds)
            {
                LabRequisitionModel dbRequisition = labDbContext.Requisitions
                                                .Where(a => a.RequisitionId == reqId)
                                                .FirstOrDefault<LabRequisitionModel>();

                if (dbRequisition != null)
                {
                    dbRequisition.OrderStatus = orderStatus;
                    labDbContext.Entry(dbRequisition).Property(a => a.OrderStatus).IsModified = true;
                }
            }
            labDbContext.SaveChanges();

            return true;

        }

        private int? GetInpatientLatestSampleSequence(LabDbContext labDbContext)
        {
            int? newSampleSequence = 1;

            var samplesByType = (from req in labDbContext.Requisitions
                                 where (req.VisitType.ToLower() == ENUM_VisitType.inpatient // "inpatient" 
                                         || req.VisitType.ToLower() == ENUM_VisitType.emergency) // "emergency") 
                                 && (req.RunNumberType.ToLower() != ENUM_LabRunNumType.cyto) // "cyto") 
                                 && (req.RunNumberType.ToLower() != ENUM_LabRunNumType.histo) // "histo")
                                 && (req.SampleCode.HasValue)
                                 select new
                                 {
                                     RequisitionId = req.RequisitionId,
                                     SampleDate = req.SampleCreatedOn,
                                     SampleCode = req.SampleCode
                                 }).ToList();


            var latestYearSampleCode = (from smpl in samplesByType
                                        where DanpheDateConvertor.ConvertEngToNepDate((DateTime)smpl.SampleDate).Year
                                            == DanpheDateConvertor.ConvertEngToNepDate(System.DateTime.Now).Year
                                        group smpl by 1 into req
                                        select new
                                        {
                                            SampleCode = req.Max(a => a.SampleCode)
                                        }).FirstOrDefault();

            if (latestYearSampleCode != null)
            {
                newSampleSequence = (int)latestYearSampleCode.SampleCode + 1;
            }

            return newSampleSequence;

        }


        private int? GetLatestSampleSequence(List<LabRequisitionModel> allReqOfCurrentType,
            LabRunNumberSettingsModel currentSetting, DateTime currentSampleDate)
        {
            int? newSampleSequence = 0;

            List<int> allMaxSampleCodesForEachType = new List<int>();

            var allReqFilteredByCurrYear = (from smpl in allReqOfCurrentType
                                            where DanpheDateConvertor.ConvertEngToNepDate((DateTime)smpl.SampleCreatedOn).Year
                                                == DanpheDateConvertor.ConvertEngToNepDate(currentSampleDate).Year
                                            select smpl).ToList();

            DateTime? currentDateTime = currentSampleDate.Date;


            //currentSetting.ResetMonthly ? (req.SampleCreatedOn.Value.Month == SampleDate.Date.Month) : true
            //                               && currentSetting.ResetDaily ? ((req.SampleCreatedOn.Value.Month == SampleDate.Month)
            //                               && (req.SampleCreatedOn.Value.Day == SampleDate.Day)) : true

            //If the Reset if Yearly
            if (currentSetting.ResetYearly)
            {
                var latestYearSampleCode = (from smpl in allReqFilteredByCurrYear
                                            group smpl by 1 into req
                                            select new
                                            {
                                                SampleCode = req.Max(a => a.SampleCode)
                                            }).FirstOrDefault();

                if (latestYearSampleCode != null)
                {
                    var maxCodeForThisType = (int)latestYearSampleCode.SampleCode;
                    allMaxSampleCodesForEachType.Add(maxCodeForThisType);
                }
            }
            //If the Reset is Daily
            else if (currentSetting.ResetDaily)
            {
                var latestSampleCodeForThisType = (from smpl in allReqFilteredByCurrYear
                                                   where smpl.SampleCreatedOn.Value.Date == currentDateTime.Value.Date
                                                   group smpl by 1 into req
                                                   select new
                                                   {
                                                       SampleCode = req.Max(a => a.SampleCode)
                                                   }).FirstOrDefault();

                if (latestSampleCodeForThisType != null)
                {
                    var maxCodeForThisType = (int)latestSampleCodeForThisType.SampleCode;
                    allMaxSampleCodesForEachType.Add(maxCodeForThisType);
                }
            }
            //If the Reset is Monthly
            else if (currentSetting.ResetMonthly)
            {
                var latestYearSampleCode = (from smpl in allReqFilteredByCurrYear
                                            where DanpheDateConvertor.ConvertEngToNepDate((DateTime)smpl.SampleCreatedOn).Month
                                                == DanpheDateConvertor.ConvertEngToNepDate(System.DateTime.Now).Month
                                            group smpl by 1 into req
                                            select new
                                            {
                                                SampleCode = req.Max(a => a.SampleCode)
                                            }).FirstOrDefault();

                if (latestYearSampleCode != null)
                {
                    var maxCodeForThisType = (int)latestYearSampleCode.SampleCode;
                    allMaxSampleCodesForEachType.Add(maxCodeForThisType);
                }

            }


            if (allMaxSampleCodesForEachType.Count > 0)
            {
                newSampleSequence = allMaxSampleCodesForEachType.Max();
            }

            newSampleSequence = newSampleSequence + 1;
            return newSampleSequence;
        }

        //Anish: 30 Aug 2019 : SampleCode Logic Rendered from Format setting table present in the Cache
        private string GetSampleCodeFormatted(int? sampleCode, DateTime sampleCreatedOn,
            string visitType, string RunNumberType,string labType, bool isUnderInsurance = false)
        {
            visitType = visitType.ToLower();
            RunNumberType = RunNumberType.ToLower();

            //List<LabRunNumberSettingsModel> allLabRunNumberSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);
            LabRunNumberSettingsModel currentRunNumSetting = LabRunNumberSettings.Where(st => st.RunNumberType == RunNumberType
            && st.VisitType == visitType && st.UnderInsurance == isUnderInsurance && st.LabTypeName.ToLower() == labType.ToLower()).FirstOrDefault();

            if (currentRunNumSetting != null && sampleCode != null)
            {
                var sampleLetter = currentRunNumSetting.StartingLetter;

                if (String.IsNullOrWhiteSpace(sampleLetter))
                {
                    sampleLetter = "";
                }

                var beforeSeparator = currentRunNumSetting.FormatInitialPart;
                var separator = currentRunNumSetting.FormatSeparator;
                var afterSeparator = currentRunNumSetting.FormatLastPart;

                if (beforeSeparator == "num")
                {
                    if (afterSeparator.Contains("yy"))
                    {
                        var afterSeparatorLength = afterSeparator.Length;
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + sampleCode.ToString() + separator + nepDate.Year.ToString().Substring(1, afterSeparatorLength);
                    }
                    else if (afterSeparator.Contains("dd"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + sampleCode.ToString() + separator + nepDate.Day.ToString();
                    }
                    else if (afterSeparator.Contains("mm"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + sampleCode.ToString() + separator + nepDate.Month.ToString();
                    }
                    else
                    {
                        return sampleLetter + sampleCode;
                    }
                }
                else
                {
                    if (beforeSeparator.Contains("yy"))
                    {
                        var beforeSeparatorLength = beforeSeparator.Length;
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + nepDate.Year.ToString().Substring(1, beforeSeparatorLength) + separator + sampleCode.ToString();
                    }
                    else if (beforeSeparator.Contains("dd"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + nepDate.Day.ToString() + separator + sampleCode.ToString();
                    }
                    else if (beforeSeparator.Contains("mm"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn);
                        return sampleLetter + nepDate.Month.ToString() + separator + sampleCode.ToString();
                    }
                    else
                    {
                        return sampleLetter + sampleCode;
                    }
                }


            }
            else
            {
                throw new ArgumentException("Cannot Get Samplecode. Didnt Found Any Format");
            }
        }

        //Suraj:06Sep2018 ReportTemplateId could be updated in case of html template.
        private void UpdateReportTemplateId(Int64 requisitionid, int? templateId, LabDbContext labDbContext, int currentUserId)
        {

            LabRequisitionModel labRequisition = (from req in labDbContext.Requisitions
                                                  where req.RequisitionId == requisitionid
                                                  select req).FirstOrDefault();
            labRequisition.ReportTemplateId = templateId ?? default(int);
            labRequisition.ModifiedBy = currentUserId;
            labRequisition.ModifiedOn = DateTime.Now;
            labDbContext.Entry(labRequisition).Property(a => a.ReportTemplateId).IsModified = true;
            labDbContext.Entry(labRequisition).Property(a => a.ModifiedBy).IsModified = true;
            labDbContext.Entry(labRequisition).Property(a => a.ModifiedOn).IsModified = true;
            labDbContext.SaveChanges();
        }

        //sud: 19Sept'18
        private void EditComponentsResults(LabDbContext dbContext, List<LabTestComponentResult> compsList, RbacUser currentUser)
        {
            if (compsList != null && compsList.Count > 0)
            {
                //to update Report Template ID on Requisition Table                
                Int64 reqId = compsList[0].RequisitionId;
                int? templateId = compsList[0].TemplateId;

                LabRequisitionModel LabRequisition = dbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault();
                if (LabRequisition.ReportTemplateId != reqId)
                {
                    UpdateReportTemplateId(reqId, templateId, dbContext, currentUser.EmployeeId);
                }
                //Template ID Updated in Requisition Table


                //get distinct requisitionids, where we need to update or add components.
                List<Int64> distinctReqs = compsList.Select(c => c.RequisitionId).Distinct().ToList();



                foreach (var req in distinctReqs)
                {

                    //Section-1: Get/Filter All Components of Current Requisition from Databasea as well as from client.
                    List<LabTestComponentResult> requisitionsComps_Db = dbContext.LabTestComponentResults.Where(c => c.RequisitionId == req
                    && (c.IsActive == true)).ToList();

                    List<LabTestComponentResult> reqsComps_Client = compsList.Where(c => c.RequisitionId == req).ToList();


                    //Section-2: Separate Client components in two groups: a. Newly Added, b. Updated
                    List<LabTestComponentResult> newlyAddedComps_Client = reqsComps_Client.Where(c => c.TestComponentResultId == 0).ToList();
                    List<LabTestComponentResult> updatedComps_Client = reqsComps_Client.Where(c => c.TestComponentResultId != 0).ToList();

                    ///Section-3: Create list of deleted components by checking if Component existing in db has come or not from Client.
                    List<LabTestComponentResult> deletedComps_Db = new List<LabTestComponentResult>();
                    //find better approach to get deleted components
                    foreach (var dbComp in requisitionsComps_Db)
                    {
                        //if component from db is not found in client's list then delete it. i.e: set IsActive=0
                        if (reqsComps_Client.Where(c => c.TestComponentResultId == dbComp.TestComponentResultId).Count() == 0)
                        {
                            deletedComps_Db.Add(dbComp);
                        }
                    }

                    //Section-4: Add new components to dbContext -- Don't save it yet, we'll do the Save action at the end.
                    if (newlyAddedComps_Client.Count > 0)
                    {
                        foreach (var c in newlyAddedComps_Client)
                        {
                            c.CreatedBy = currentUser.EmployeeId;
                            dbContext.LabTestComponentResults.Add(c);
                        }
                    }

                    //Section:5--Update values of dbComponent by that of ClientComponent--
                    //note that we have to update the peoperties of dbComponent, not ClientComponent.
                    //DON'T Save it YET.. we'll do that at the end..
                    if (updatedComps_Client.Count > 0)
                    {
                        foreach (var comp in updatedComps_Client)
                        {
                            LabTestComponentResult dbComp = requisitionsComps_Db.Where(c => c.TestComponentResultId == comp.TestComponentResultId).FirstOrDefault();

                            if ((dbComp.Value != comp.Value) || (dbComp.Range != comp.Range) || (dbComp.RangeDescription != comp.RangeDescription)
                                || (dbComp.Remarks != comp.Remarks) || (dbComp.IsNegativeResult != comp.IsNegativeResult))
                            {
                                dbComp.ModifiedOn = DateTime.Now;
                                dbComp.ModifiedBy = currentUser.EmployeeId;
                                dbContext.Entry(dbComp).Property(a => a.ModifiedOn).IsModified = true;
                                dbContext.Entry(dbComp).Property(a => a.ModifiedBy).IsModified = true;
                            }

                            dbComp.Value = comp.Value;
                            dbComp.Range = comp.Range;
                            dbComp.RangeDescription = comp.RangeDescription;
                            dbComp.Remarks = comp.Remarks;
                            dbComp.IsAbnormal = comp.IsAbnormal;
                            dbComp.AbnormalType = comp.AbnormalType;
                            dbComp.IsActive = true;
                            dbComp.IsNegativeResult = comp.IsNegativeResult;
                            dbComp.ResultGroup = comp.ResultGroup;





                            dbContext.Entry(dbComp).Property(a => a.Value).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.IsNegativeResult).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.Range).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.RangeDescription).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.IsAbnormal).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.AbnormalType).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.Remarks).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.IsActive).IsModified = true;
                            dbContext.Entry(dbComp).Property(a => a.ResultGroup).IsModified = true;
                        }
                    }

                    //Section-5: Update IsActive Status of DeletedComponents.
                    if (deletedComps_Db.Count > 0)
                    {
                        foreach (var dbComp in deletedComps_Db)
                        {
                            dbComp.IsActive = false;
                            dbContext.Entry(dbComp).Property(a => a.IsActive).IsModified = true;
                        }
                    }

                }

                //YES: NOW After all Requisitions and Components are upated, we can call the SaveChanges Function()-- happy ?  :)
                dbContext.SaveChanges();

                //if (docPatPortalSync)
                //{
                //    DocPatPortalBL.PutLabReports(LabRequisition.LabReportId, distinctReqs, dbContext);
                //}

            }
        }


        private bool ValidatePrintOption(bool allowOutPatWithProv, string visittype, string billingstatus)
        {
            if (visittype.ToLower() == "inpatient")
            {
                return true;
            }
            else
            {
                if (allowOutPatWithProv)
                {
                    if (billingstatus.ToLower() == "paid" || billingstatus.ToLower() == "unpaid" || billingstatus.ToLower() == "provisional")
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    if (billingstatus.ToLower() == "paid" || billingstatus.ToLower() == "unpaid" || visittype.ToLower() == "emergency")
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }

        private List<LabPendingResultVM> GetAllHTMLLabPendingResults(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0,
            int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "", bool forWorkList = false, int defaultVendorId = 1)
        {
            bool filterByDate = true;
            bool filterByCategory = false;

            if (categoryList != null)
            {
                filterByCategory = true;
            }

            if (StartDate == null || EndDate == null)
            {
                filterByDate = false;
            }

            var htmlPendingResult = (from req in labDbContext.Requisitions
                                     join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                     join template in labDbContext.LabReportTemplates on req.ReportTemplateId equals template.ReportTemplateID
                                     join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                     where (forWorkList ? ((req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Pending) || (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded)
                                        || (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ReportGenerated)) : (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Pending))
                                     && req.SampleCode != null
                                     && (filterByDate ? (DbFunctions.TruncateTime(req.CreatedOn) >= StartDate && DbFunctions.TruncateTime(req.CreatedOn) <= EndDate) : true)
                                     && req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel // "cancel" 
                                     && req.BillingStatus.ToLower() != ENUM_BillingStatus.returned // "returned"
                                     && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                     && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                     && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                     //&& (req.BillingStatus == "paid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
                                     && (template.TemplateType.ToLower() == ENUM_LabTemplateType.html) // "html")
                                     && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                     && (req.LabTypeName == labType)
                                     && (req.ResultingVendorId == defaultVendorId)
                                     group new { req, test, template } by new
                                     {
                                         patient,
                                         req.SampleCode,
                                         req.SampleCodeFormatted,
                                         DbFunctions.TruncateTime(req.SampleCreatedOn).Value,
                                         req.VisitType,
                                         req.RequisitionId,
                                         req.RunNumberType,
                                         req.BarCodeNumber,
                                         req.WardName,
                                         req.HasInsurance
                                     } into grp
                                     select new LabPendingResultVM
                                     {
                                         PatientId = grp.Key.patient.PatientId,
                                         PatientCode = grp.Key.patient.PatientCode,
                                         DateOfBirth = grp.Key.patient.DateOfBirth,
                                         PhoneNumber = grp.Key.patient.PhoneNumber,
                                         Gender = grp.Key.patient.Gender,
                                         PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                         SampleCode = grp.Key.SampleCode,
                                         SampleDate = grp.Key.Value,
                                         VisitType = grp.Key.VisitType,
                                         RunNumType = grp.Key.RunNumberType,
                                         BarCodeNumber = grp.Key.BarCodeNumber,
                                         WardName = grp.Key.WardName,
                                         SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                         HasInsurance = grp.Key.HasInsurance,
                                         Tests = grp.Select(a =>
                                         new LabPendingResultVM.LabTestDetail()
                                         {
                                             RequisitionId = a.req.RequisitionId,
                                             TestName = a.test.LabTestName,
                                             LabTestId = a.test.LabTestId,
                                             ReportTemplateId = a.template.ReportTemplateID,
                                             ReportTemplateShortName = a.template.ReportTemplateShortName,
                                             RunNumberType = a.req.RunNumberType,
                                             BillingStatus = a.req.BillingStatus,
                                             IsVerified = a.req.IsVerified
                                         }).OrderBy(req => req.RequisitionId).ToList()
                                     }).ToList();

            return htmlPendingResult;
        }


        private List<LabPendingResultVM> GetAllNormalLabPendingResults(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0,
            int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "", bool forWorkList = false, int defaultVendorId = 1)
        {
            bool filterByDate = true;
            bool filterByCategory = false;

            if (categoryList != null)
            {
                filterByCategory = true;
            }

            if (StartDate == null || EndDate == null)
            {
                filterByDate = false;
            }

            var normalPendingResults = (from req in labDbContext.Requisitions
                                        join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                        join template in labDbContext.LabReportTemplates on req.ReportTemplateId equals template.ReportTemplateID
                                        join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                        where (forWorkList ? ((req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Pending) || (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded)
                                        || (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ReportGenerated)) : (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Pending))
                                        && req.SampleCode != null
                                        && req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel //"cancel"
                                        && req.BillingStatus.ToLower() != ENUM_BillingStatus.returned //"returned"
                                        && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                        && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                        && (filterByDate ? (DbFunctions.TruncateTime(req.CreatedOn) >= StartDate && DbFunctions.TruncateTime(req.CreatedOn) <= EndDate) : true)
                                        && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                        //Removed as all can add result but cannot Print Report Until Bill is Paid (incase of OP)
                                        //&& (req.BillingStatus == "paid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
                                        //&& (template.TemplateType.ToLower() == "normal" || template.TemplateType.ToLower() == "culture")
                                          && (template.TemplateType.ToLower() == ENUM_LabTemplateType.normal || template.TemplateType.ToLower() == ENUM_LabTemplateType.culture)
                                        && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                        && (req.LabTypeName == labType)
                                        && (req.ResultingVendorId == defaultVendorId)
                                        group new { req, test, template } by new
                                        {
                                            patient,
                                            req.SampleCode,
                                            req.SampleCodeFormatted,
                                            DbFunctions.TruncateTime(req.SampleCreatedOn).Value,
                                            req.VisitType,
                                            req.RunNumberType,
                                            req.BarCodeNumber,
                                            req.WardName,
                                            req.HasInsurance
                                        } into grp
                                        select new LabPendingResultVM
                                        {
                                            PatientId = grp.Key.patient.PatientId,
                                            PatientCode = grp.Key.patient.PatientCode,
                                            DateOfBirth = grp.Key.patient.DateOfBirth,
                                            PhoneNumber = grp.Key.patient.PhoneNumber,
                                            Gender = grp.Key.patient.Gender,
                                            PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                            SampleCode = grp.Key.SampleCode,
                                            SampleDate = grp.Key.Value,
                                            VisitType = grp.Key.VisitType,
                                            RunNumType = grp.Key.RunNumberType,
                                            BarCodeNumber = grp.Key.BarCodeNumber,
                                            SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                            WardName = grp.Key.WardName,
                                            HasInsurance = grp.Key.HasInsurance,
                                            Tests = grp.Select(a =>
                                            new LabPendingResultVM.LabTestDetail()
                                            {
                                                RequisitionId = a.req.RequisitionId,
                                                TestName = a.test.LabTestName,
                                                LabTestId = a.test.LabTestId,
                                                ReportTemplateId = a.template.ReportTemplateID,
                                                ReportTemplateShortName = a.template.ReportTemplateShortName,
                                                BillingStatus = a.req.BillingStatus,
                                                IsVerified = a.req.IsVerified
                                            }).OrderBy(req => req.RequisitionId).ToList()
                                        }).ToList();

            return normalPendingResults;

        }

        private List<LabPendingResultVM> GetAllHTMLLabPendingReports(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0,
            int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "")
        {

            var verificationParameter = (from param in labDbContext.AdminParameters
                                         where param.ParameterGroupName.ToLower() == "lab" && param.ParameterName == "LabReportVerificationNeededB4Print"
                                         select param.ParameterValue).FirstOrDefault();

            var verificationObj = DanpheJSONConvert.DeserializeObject<VerificationCoreCFGModel>(verificationParameter);

            bool verificationRequired = verificationObj.EnableVerificationStep;
            int verificationLevel = verificationObj.VerificationLevel.Value;

            bool filterByDate = true;
            bool filterByCategory = false;

            if (categoryList != null)
            {
                filterByCategory = true;
            }

            if (StartDate == null || EndDate == null)
            {
                filterByDate = false;
            }

            var htmlPendingReports = (from req in labDbContext.Requisitions
                                      join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                      join template in labDbContext.LabReportTemplates on req.ReportTemplateId equals template.ReportTemplateID
                                      join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                      where req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded // "result-added"
                                      && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                      && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                      && (filterByDate ? (DbFunctions.TruncateTime(req.CreatedOn) >= StartDate && DbFunctions.TruncateTime(req.CreatedOn) <= EndDate) : true)
                                      && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                      && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                      && req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel //"cancel" 
                                      && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned)//"returned")
                                      && (template.TemplateType.ToLower() == ENUM_LabTemplateType.html)// "html")
                                      && (req.LabTypeName == labType)
                                      group new { req, template, patient, test } by new
                                      {
                                          patient,
                                          req,
                                          req.RunNumberType,
                                          req.SampleCodeFormatted,
                                          req.BarCodeNumber,
                                          req.WardName,
                                          req.HasInsurance,
                                          req.LabReportId
                                      } into grp
                                      select new LabPendingResultVM
                                      {
                                          PatientId = grp.Key.patient.PatientId,
                                          PatientCode = grp.Key.patient.PatientCode,
                                          DateOfBirth = grp.Key.patient.DateOfBirth,
                                          PhoneNumber = grp.Key.patient.PhoneNumber,
                                          Gender = grp.Key.patient.Gender,
                                          PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                          SampleCode = grp.Key.req.SampleCode,
                                          SampleDate = DbFunctions.TruncateTime(grp.Key.req.SampleCreatedOn).Value,
                                          SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                          VisitType = grp.Key.req.VisitType,
                                          RunNumType = grp.Key.RunNumberType,
                                          BarCodeNumber = grp.Key.BarCodeNumber,
                                          WardName = grp.Key.WardName,
                                          ReportId = grp.Key.LabReportId,
                                          HasInsurance = grp.Key.HasInsurance,
                                          ResultAddedOn = grp.Max(a => a.req.ResultAddedOn),
                                          Tests = (from g in grp
                                                   select new LabPendingResultVM.LabTestDetail
                                                   {
                                                       RequisitionId = g.req.RequisitionId,
                                                       LabTestId = g.req.LabTestId,
                                                       TestName = g.req.LabTestName,
                                                       BillingStatus = g.req.BillingStatus,
                                                       LabReportId = g.req.LabReportId
                                                   }).Distinct().ToList()
                                          //Tests = (from requisition in labDbContext.Requisitions
                                          //         join test in labDbContext.LabTests on requisition.LabTestId equals test.LabTestId
                                          //         where requisition.PatientId == grp.Key.patient.PatientId
                                          //          && requisition.RequisitionId == grp.Key.req.RequisitionId
                                          //          && requisition.BarCodeNumber == grp.Key.BarCodeNumber
                                          //          && requisition.WardName == grp.Key.WardName
                                          //          && requisition.RunNumberType == grp.Key.RunNumberType
                                          //          && requisition.HasInsurance == grp.Key.HasInsurance
                                          //          && requisition.BillingStatus.ToLower() != ENUM_BillingStatus.cancel //"cancel" 
                                          //          && requisition.BillingStatus.ToLower() != ENUM_BillingStatus.returned //"returned"
                                          //          && requisition.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded// "result-added"
                                          //                                                                                 //group requisition by new { test } into g
                                          //         select new LabPendingResultVM.LabTestDetail
                                          //         {
                                          //             RequisitionId = requisition.RequisitionId,
                                          //             LabTestId = requisition.LabTestId,
                                          //             TestName = requisition.LabTestName,
                                          //             BillingStatus = requisition.BillingStatus,
                                          //             LabReportId = requisition.LabReportId
                                          //             //RequisitionId = g.Select(a => a.RequisitionId).FirstOrDefault(),
                                          //             //LabTestId = g.Key.test.LabTestId,
                                          //             //TestName = g.Key.test.LabTestName
                                          //         }).ToList()
                                      }).ToList();

            return htmlPendingReports;

        }

        private List<LabPendingResultVM> GetAllNormalLabPendingReports(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0,
            int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "")
        {
            var verificationParameter = (from param in labDbContext.AdminParameters
                                         where param.ParameterGroupName.ToLower() == "lab" && param.ParameterName == "LabReportVerificationNeededB4Print"
                                         select param.ParameterValue).FirstOrDefault();

            var verificationObj = DanpheJSONConvert.DeserializeObject<VerificationCoreCFGModel>(verificationParameter);

            bool verificationRequired = verificationObj.EnableVerificationStep;
            int verificationLevel = verificationObj.VerificationLevel.Value;

            bool filterByDate = true;
            bool filterByCategory = false;

            if (categoryList != null)
            {
                filterByCategory = true;
            }
            if (StartDate == null || EndDate == null)
            {
                filterByDate = false;
            }

            var normalPendingReports = (from req in labDbContext.Requisitions
                                        join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                        join template in labDbContext.LabReportTemplates on req.ReportTemplateId equals template.ReportTemplateID
                                        join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                        where (verificationRequired ? (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded //"result-added" 
                                        && (req.IsVerified.HasValue ? req.IsVerified == false : true)) : req.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded) // "result-added"
                                        && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                        && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                        && (filterByDate ? (DbFunctions.TruncateTime(req.CreatedOn) >= StartDate && DbFunctions.TruncateTime(req.CreatedOn) <= EndDate) : true)
                                        && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                        && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                        && req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel //"cancel" 
                                        && req.BillingStatus.ToLower() != ENUM_BillingStatus.returned //"returned"
                                        //&& (template.TemplateType.ToLower() == "normal" || template.TemplateType.ToLower() == "culture")
                                        && (template.TemplateType.ToLower() == ENUM_LabTemplateType.normal || template.TemplateType.ToLower() == ENUM_LabTemplateType.culture)
                                        && (req.LabTypeName == labType)
                                        group new { req, template, patient, test } by new
                                        {
                                            patient,
                                            req.SampleCode,
                                            DbFunctions.TruncateTime(req.SampleCreatedOn).Value,
                                            req.VisitType,
                                            req.RunNumberType,
                                            req.BarCodeNumber,
                                            req.WardName,
                                            req.LabReportId,
                                            req.SampleCodeFormatted,
                                            req.HasInsurance
                                        } into grp
                                        select new LabPendingResultVM
                                        {
                                            PatientId = grp.Key.patient.PatientId,
                                            PatientCode = grp.Key.patient.PatientCode,
                                            DateOfBirth = grp.Key.patient.DateOfBirth,
                                            PhoneNumber = grp.Key.patient.PhoneNumber,
                                            Gender = grp.Key.patient.Gender,
                                            PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                            SampleCode = grp.Key.SampleCode,
                                            SampleDate = grp.Key.Value,
                                            VisitType = grp.Key.VisitType,
                                            RunNumType = grp.Key.RunNumberType,
                                            BarCodeNumber = grp.Key.BarCodeNumber,
                                            WardName = grp.Key.WardName,
                                            ReportId = grp.Key.LabReportId,
                                            SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                            HasInsurance = grp.Key.HasInsurance,
                                            ResultAddedOn = grp.Max(a => a.req.ResultAddedOn),
                                            Tests = (from g in grp
                                                     select new LabPendingResultVM.LabTestDetail
                                                     {
                                                         RequisitionId = g.req.RequisitionId,
                                                         LabTestId = g.req.LabTestId,
                                                         TestName = g.req.LabTestName,
                                                         BillingStatus = g.req.BillingStatus,
                                                         LabReportId = g.req.LabReportId,
                                                         CovidFileUrl = !string.IsNullOrEmpty(g.req.GoogleFileIdForCovid) ? CovidReportUrlComonPath.Replace("GGLFILEUPLOADID", g.req.GoogleFileIdForCovid) : ""
                                                     }).Distinct().ToList()
                                            //Tests = (from requisition in labDbContext.Requisitions
                                            //         join test in labDbContext.LabTests on requisition.LabTestId equals test.LabTestId
                                            //         join template in labDbContext.LabReportTemplates on requisition.ReportTemplateId equals template.ReportTemplateID
                                            //         where requisition.PatientId == grp.Key.patient.PatientId
                                            //        && requisition.SampleCode == grp.Key.SampleCode
                                            //        && requisition.VisitType == grp.Key.VisitType
                                            //        && requisition.WardName == grp.Key.WardName
                                            //        && requisition.BarCodeNumber == grp.Key.BarCodeNumber
                                            //        && requisition.RunNumberType == grp.Key.RunNumberType
                                            //        && requisition.LabReportId == grp.Key.LabReportId
                                            //        && requisition.HasInsurance == grp.Key.HasInsurance
                                            //        && DbFunctions.TruncateTime(requisition.SampleCreatedOn).Value == grp.Key.Value
                                            //        && requisition.OrderStatus.ToLower() == ENUM_LabOrderStatus.ResultAdded // "result-added"
                                            //        && requisition.BillingStatus.ToLower() != ENUM_BillingStatus.cancel //"cancel" 
                                            //        && requisition.BillingStatus.ToLower() != ENUM_BillingStatus.returned //"returned"
                                            //        && (template.TemplateType.ToLower() == ENUM_LabTemplateType.normal // "normal" 
                                            //        || template.TemplateType.ToLower() == ENUM_LabTemplateType.culture // "culture"
                                            //        )
                                            //         // group new { requisition }   by new { requisition, test } into g
                                            //         select new LabPendingResultVM.LabTestDetail
                                            //         {
                                            //             RequisitionId = requisition.RequisitionId,
                                            //             LabTestId = requisition.LabTestId,
                                            //             TestName = requisition.LabTestName,
                                            //             BillingStatus = requisition.BillingStatus,
                                            //             LabReportId = requisition.LabReportId
                                            //         }).Distinct().ToList()
                                        }).ToList();

            return normalPendingReports;
        }

        private List<SPFlatReportVM> GetAllLabFinalReportsFromSP(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0, int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "", bool isForLabMaster = false)
        {
            if (StartDate == null || EndDate == null)
            {
                StartDate = StartDate ?? System.DateTime.Now.AddYears(-20);
                EndDate = EndDate ?? System.DateTime.Now;
            }

            string categoryCsv = String.Join(",", categoryList.Select(x => x.ToString()).ToArray());

            List<SqlParameter> paramList = new List<SqlParameter>() {
                            new SqlParameter("@BarcodeNumber", BarcodeNumber),
                            new SqlParameter("@SampleNumber", SampleNumber),
                            new SqlParameter("@PatientId", PatientId),
                            new SqlParameter("@StartDate", StartDate),
                            new SqlParameter("@EndDate", EndDate),
                            new SqlParameter("@CategoryList", categoryCsv),
                            new SqlParameter("@Labtype", labType),
                            new SqlParameter("@IsForLabMaster", isForLabMaster),
                        };

            DataSet dataFromSP = DALFunctions.GetDatasetFromStoredProc("SP_LAB_GetAllLabProvisionalFinalReports", paramList, labDbContext);

            List<SPFlatReportVM> dSP = new List<SPFlatReportVM>();
            var data = new List<object>();
            if (dataFromSP.Tables.Count > 0)
            {
                var resultStr = JsonConvert.SerializeObject(dataFromSP.Tables[0]);
                dSP = DanpheJSONConvert.DeserializeObject<List<SPFlatReportVM>>(resultStr);
            }

            return dSP;
        }


        private IEnumerable<FinalLabReportListVM> GetFinalReportListFormatted(List<SPFlatReportVM> data)
        {
            var retData = (from repData in data
                           group repData by new
                           {
                               repData.SampleCodeFormatted,
                               repData.SampleCode,
                               repData.LabReportId,
                               repData.SampleDate,
                               repData.VisitType,
                               repData.RunNumType,
                               repData.IsPrinted,
                               repData.BarCodeNumber,
                               repData.WardName,
                               repData.HasInsurance,
                               repData.PatientId,
                               repData.PatientCode,
                               repData.PatientName,
                               repData.DateOfBirth,
                               repData.PhoneNumber,
                               repData.Gender,
                               repData.ReportGeneratedBy,
                               repData.ReportGeneratedById,
                               repData.AllowOutpatientWithProvisional,
                               repData.BillingStatus
                           } into grp
                           let isValidToPrintReport = (grp.Key.VisitType.ToLower() == "inpatient") ? true : (grp.Key.AllowOutpatientWithProvisional ? true : (grp.Key.VisitType.ToLower() == "emergency" ? true : false))
                           select new FinalLabReportListVM
                           {
                               PatientId = grp.Key.PatientId,
                               PatientCode = grp.Key.PatientCode,
                               DateOfBirth = grp.Key.DateOfBirth,
                               PhoneNumber = grp.Key.PhoneNumber,
                               Gender = grp.Key.Gender,
                               PatientName = grp.Key.PatientName,
                               SampleCode = grp.Key.SampleCode,
                               SampleDate = grp.Key.SampleDate,
                               SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                               VisitType = grp.Key.VisitType,
                               RunNumType = grp.Key.RunNumType,
                               IsPrinted = grp.Key.IsPrinted,
                               BillingStatus = grp.Key.BillingStatus,
                               BarCodeNumber = grp.Key.BarCodeNumber,
                               ReportId = grp.Key.LabReportId,
                               WardName = grp.Key.WardName,
                               ReportGeneratedBy = grp.Key.ReportGeneratedBy,
                               LabTestCSV = string.Join(",", grp.Select(g => g.LabTestName).Distinct()),
                               LabRequisitionIdCSV = string.Join(",", grp.Select(g => g.RequisitionId).Distinct()),
                               AllowOutpatientWithProvisional = grp.Key.AllowOutpatientWithProvisional,
                               IsValidToPrint = (grp.Key.BillingStatus == "provisional") ? isValidToPrintReport : true,
                               Tests = (from g in grp
                                        select new FinalLabReportListVM.FinalReportListLabTestDetail
                                        {
                                            RequisitionId = g.RequisitionId,
                                            TestName = g.LabTestName,
                                            BillingStatus = g.BillingStatus,
                                            ValidTestToPrint = (g.BillingStatus == "provisional") ? isValidToPrintReport : true,
                                            SampleCollectedBy = g.SampleCollectedBy,
                                            PrintedBy = g.PrintedBy,
                                            ResultAddedBy = g.ResultAddedBy,
                                            VerifiedBy = g.VerifiedBy,
                                            PrintCount = g.PrintCount.HasValue ? g.PrintCount : 0
                                        }).ToList()
                           }).AsEnumerable();

            return retData;
        }


        private object GetFinalReportListFormattedInFinalReportPage(IEnumerable<FinalLabReportListVM> data)
        {
            var returnData = (from reportData in data
                              select new
                              {
                                  PatientId = reportData.PatientId,
                                  PatientCode = reportData.PatientCode,
                                  DateOfBirth = reportData.DateOfBirth,
                                  PhoneNumber = reportData.PhoneNumber,
                                  Gender = reportData.Gender,
                                  PatientName = reportData.PatientName,
                                  SampleCodeFormatted = reportData.SampleCodeFormatted,
                                  VisitType = reportData.VisitType,
                                  RunNumType = reportData.RunNumType,
                                  IsPrinted = reportData.IsPrinted,
                                  BillingStatus = reportData.BillingStatus,
                                  BarCodeNumber = reportData.BarCodeNumber,
                                  ReportId = reportData.ReportId,
                                  WardName = reportData.WardName,
                                  ReportGeneratedBy = reportData.ReportGeneratedBy,
                                  LabTestCSV = reportData.LabTestCSV,
                                  LabRequisitionIdCSV = reportData.LabRequisitionIdCSV,
                                  AllowOutpatientWithProvisional = reportData.AllowOutpatientWithProvisional,
                                  IsValidToPrint = reportData.IsValidToPrint
                              }).ToList();
            return returnData;
        }

        private object GetFinalReportListFormattedInFinalReportDispatchPage(IEnumerable<FinalLabReportListVM> data)
        {
            var start = System.DateTime.Now;
            var returnData = (from reportData in data
                              group reportData by new { reportData.PatientId, reportData.PatientCode, reportData.PatientName, reportData.PhoneNumber, reportData.Gender, reportData.WardName } into grp
                              select new
                              {
                                  PatientId = grp.Key.PatientId,
                                  PatientCode = grp.Key.PatientCode,
                                  PhoneNumber = grp.Key.PhoneNumber,
                                  Gender = grp.Key.Gender,
                                  PatientName = grp.Key.PatientName,
                                  WardName = grp.Key.WardName,
                                  IsSelected = false,
                                  //Reports = grp.Select(s => new
                                  //{
                                  //    SampleCodeFormatted = s.SampleCodeFormatted,
                                  //    IsSelected = false,
                                  //    Tests = s.Tests
                                  //}).ToList()
                              }).ToList();

            var diff = System.DateTime.Now.Subtract(start).TotalMilliseconds;
            return returnData;
        }

        private List<LabPendingResultVM> GetAllLabProvisionalFinalReports(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0, int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "", bool isForLabMaster = false)
        {
            bool filterByDate = true;
            bool filterByCategory = false;
            bool filterByLabType = !isForLabMaster;


            if (categoryList != null)
            {
                filterByCategory = true;
            }
            if (StartDate == null || EndDate == null)
            {
                filterByDate = false;
            }


            var parameterOutPatWithProvisional = (from coreData in labDbContext.AdminParameters
                                                  where coreData.ParameterGroupName.ToLower() == "lab"
                                                  && coreData.ParameterName == "AllowLabReportToPrintOnProvisional"
                                                  select coreData.ParameterValue).FirstOrDefault();

            bool allowOutPatWithProv = false;
            if (!String.IsNullOrEmpty(parameterOutPatWithProvisional) && parameterOutPatWithProvisional.ToLower() == "true")
            {
                allowOutPatWithProv = true;
            }

            var finalReportsProv = (from req in labDbContext.Requisitions
                                    join report in labDbContext.LabReports on req.LabReportId equals report.LabReportId
                                    join employee in labDbContext.Employee on report.CreatedBy equals employee.EmployeeId
                                    join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                    join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                    where req.OrderStatus == ENUM_LabOrderStatus.ReportGenerated // "report-generated"
                                    && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                    && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                    && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                    && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                    && req.BillingStatus == ENUM_BillingStatus.provisional // "provisional"
                                    && (filterByDate ? (DbFunctions.TruncateTime(report.CreatedOn) >= StartDate && DbFunctions.TruncateTime(report.CreatedOn) <= EndDate) : true)
                                    && (filterByLabType ? (req.LabTypeName == labType) : true)
                                    group new { req, patient, test } by new
                                    {
                                        patient,
                                        req.SampleCode,
                                        req.SampleCodeFormatted,
                                        req.LabReportId,
                                        employee.FullName,
                                        employee.EmployeeId,
                                        DbFunctions.TruncateTime(req.SampleCreatedOn).Value,
                                        req.VisitType,
                                        req.RunNumberType,
                                        report.IsPrinted,
                                        req.BarCodeNumber,
                                        req.WardName,
                                        req.HasInsurance
                                    } into grp
                                    let isValidToPrintReport = (grp.Key.VisitType.ToLower() == "inpatient") ? true : (allowOutPatWithProv ? true : (grp.Key.VisitType.ToLower() == "emergency" ? true : false))
                                    select new LabPendingResultVM
                                    {
                                        PatientId = grp.Key.patient.PatientId,
                                        PatientCode = grp.Key.patient.PatientCode,
                                        DateOfBirth = grp.Key.patient.DateOfBirth,
                                        PhoneNumber = grp.Key.patient.PhoneNumber,
                                        Gender = grp.Key.patient.Gender,
                                        PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                        SampleCode = grp.Key.SampleCode,
                                        SampleDate = grp.Key.Value,
                                        SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                        //SampleCodeFormatted = "",
                                        VisitType = grp.Key.VisitType,
                                        RunNumType = grp.Key.RunNumberType,
                                        IsPrinted = grp.Key.IsPrinted,
                                        BillingStatus = ENUM_BillingStatus.provisional, // "provisional",
                                        BarCodeNumber = grp.Key.BarCodeNumber,
                                        ReportId = grp.Key.LabReportId,
                                        WardName = grp.Key.WardName,
                                        HasInsurance = grp.Key.HasInsurance,
                                        ReportGeneratedBy = grp.Key.FullName,
                                        IsValidToPrint = isValidToPrintReport,
                                        Tests = (from g in grp
                                                 let isValidToPrintTest = (grp.Key.VisitType.ToLower() == "inpatient") ? true : (allowOutPatWithProv ? true : (grp.Key.VisitType.ToLower() == "emergency" ? true : false))
                                                 select new LabPendingResultVM.LabTestDetail
                                                 {
                                                     RequisitionId = g.req.RequisitionId,
                                                     LabTestId = g.req.LabTestId,
                                                     TestName = g.req.LabTestName,
                                                     SampleCollectedBy = g.req.SampleCreatedBy,
                                                     VerifiedBy = g.req.VerifiedBy,
                                                     ResultAddedBy = g.req.ResultAddedBy,
                                                     PrintCount = g.req.PrintCount == null ? 0 : g.req.PrintCount,
                                                     PrintedBy = g.req.PrintedBy,
                                                     BillingStatus = g.req.BillingStatus,
                                                     LabCategoryId = g.test.LabTestCategoryId,
                                                     ValidTestToPrint = isValidToPrintTest
                                                 }).ToList()
                                    }).OrderByDescending(d => d.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();

            return finalReportsProv;
        }

        private List<LabPendingResultVM> GetAllLabPaidUnpaidFinalReports(LabDbContext labDbContext,
            Int64 BarcodeNumber = 0, int SampleNumber = 0, int SampleCode = 0, DateTime EnglishDateToday = default(DateTime),
            int PatientId = 0, DateTime? StartDate = null, DateTime? EndDate = null, List<int> categoryList = null, string labType = "",
            bool isForLabMaster = false)
        {
            bool filterByDate = true;
            bool filterByCategory = false;

            if (categoryList != null)
            {
                filterByCategory = true;
            }

            if (StartDate == null || EndDate == null)
            {
                StartDate = StartDate ?? System.DateTime.Now.AddYears(-10);
                EndDate = EndDate ?? System.DateTime.Now;
                filterByDate = false;
            }
            var finalReportsPaidUnpaid = (from req in labDbContext.Requisitions
                                          join report in labDbContext.LabReports on req.LabReportId equals report.LabReportId
                                          join employee in labDbContext.Employee on report.CreatedBy equals employee.EmployeeId
                                          join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                          join patient in labDbContext.Patients on req.PatientId equals patient.PatientId
                                          where req.OrderStatus == ENUM_LabOrderStatus.ReportGenerated //"report-generated"
                                          && (BarcodeNumber == 0 ? true : (req.BarCodeNumber == BarcodeNumber))
                                          && (SampleNumber == 0 ? true : (req.SampleCode.HasValue ? (req.SampleCode == SampleNumber) : false))
                                          && (PatientId == 0 ? true : (req.PatientId == PatientId))
                                          && (filterByCategory ? (categoryList.Contains(test.LabTestCategoryId)) : true)
                                          && (req.BillingStatus.ToLower() == ENUM_BillingStatus.paid // "paid" 
                                          || req.BillingStatus.ToLower() == ENUM_BillingStatus.unpaid // "unpaid"
                                          )
                                          && (filterByDate ? (DbFunctions.TruncateTime(report.CreatedOn) >= StartDate && DbFunctions.TruncateTime(report.CreatedOn) <= EndDate) : true)
                                          && (!isForLabMaster ? (req.LabTypeName == labType) : true)
                                          group new { req, patient, test } by new
                                          {
                                              patient,
                                              req.SampleCode,
                                              req.SampleCodeFormatted,
                                              req.LabReportId,
                                              DbFunctions.TruncateTime(req.SampleCreatedOn).Value,
                                              req.VisitType,
                                              req.RunNumberType,
                                              report.IsPrinted,
                                              req.BarCodeNumber,
                                              req.WardName,
                                              req.HasInsurance,
                                              employee.FullName,
                                              employee.EmployeeId,
                                          } into grp

                                          select new LabPendingResultVM
                                          {
                                              PatientId = grp.Key.patient.PatientId,
                                              PatientCode = grp.Key.patient.PatientCode,
                                              DateOfBirth = grp.Key.patient.DateOfBirth,
                                              PhoneNumber = grp.Key.patient.PhoneNumber,
                                              Gender = grp.Key.patient.Gender,
                                              PatientName = grp.Key.patient.FirstName + " " + (string.IsNullOrEmpty(grp.Key.patient.MiddleName) ? "" : grp.Key.patient.MiddleName + " ") + grp.Key.patient.LastName,

                                              SampleCode = grp.Key.SampleCode,
                                              SampleDate = grp.Key.Value,
                                              SampleCodeFormatted = grp.Key.SampleCodeFormatted,
                                              //SampleCodeFormatted = "",
                                              VisitType = grp.Key.VisitType,
                                              RunNumType = grp.Key.RunNumberType,
                                              IsPrinted = grp.Key.IsPrinted,
                                              BillingStatus = "paid",
                                              BarCodeNumber = grp.Key.BarCodeNumber,
                                              ReportId = grp.Key.LabReportId,
                                              WardName = grp.Key.WardName,
                                              HasInsurance = grp.Key.HasInsurance,
                                              ReportGeneratedBy = grp.Key.FullName,
                                              IsValidToPrint = true,
                                              Tests = (from g in grp
                                                       select new LabPendingResultVM.LabTestDetail
                                                       {
                                                           RequisitionId = g.req.RequisitionId,
                                                           LabTestId = g.req.LabTestId,
                                                           TestName = g.req.LabTestName,
                                                           SampleCollectedBy = g.req.SampleCreatedBy,
                                                           VerifiedBy = g.req.VerifiedBy,
                                                           ResultAddedBy = g.req.ResultAddedBy,
                                                           PrintCount = g.req.PrintCount == null ? 0 : g.req.PrintCount,
                                                           PrintedBy = g.req.PrintedBy,
                                                           BillingStatus = g.req.BillingStatus,
                                                           LabCategoryId = g.test.LabTestCategoryId,
                                                           ValidTestToPrint = true
                                                       }).ToList()
                                          }).ToList();
            return finalReportsPaidUnpaid;
        }

        private LatestLabSampleCodeDetailVM GenerateLabSampleCode(LabDbContext labDbContext, string runNumType, string visitType, int patId, DateTime sampleDate, string labType, bool hasInsurance = false)
        {
            DataSet barcod = DALFunctions.GetDatasetFromStoredProc("SP_LAB_GetLatestBarCodeNumber", null, labDbContext);
            var strData = JsonConvert.SerializeObject(barcod.Tables[0]);
            List<BarCodeNumber> barCode = DanpheJSONConvert.DeserializeObject<List<BarCodeNumber>>(strData);
            var BarCodeNumber = barCode[0].Value;

            List<LabRunNumberSettingsModel> allLabRunNumberSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);


            List<LabRequisitionModel> allReqOfCurrentType = new List<LabRequisitionModel>();

            //Get current RunNumber Settings
            LabRunNumberSettingsModel currentRunNumSetting = allLabRunNumberSettings.Where(st => st.RunNumberType.ToLower() == runNumType.ToLower()
            && st.VisitType.ToLower() == visitType.ToLower() && st.UnderInsurance == hasInsurance && st.LabTypeName == labType).FirstOrDefault();

            //Get all the Rows based upon this GroupingIndex
            List<LabRunNumberSettingsModel> allCommonSetting = allLabRunNumberSettings.Where(r =>
            r.RunNumberGroupingIndex == currentRunNumSetting.RunNumberGroupingIndex).ToList();

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SampleDate", sampleDate),
                        new SqlParameter("@PatientId", patId),
                        new SqlParameter("@GroupingIndex", currentRunNumSetting.RunNumberGroupingIndex),
                        new SqlParameter("@LabTypeName", labType)
};
            DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_AllRequisitionsBy_VisitAndRunType", paramList, labDbContext);

            var strlatestSampleModel = JsonConvert.SerializeObject(dts.Tables[0]);
            List<SPLatestSampleCode> latestSampleModel = DanpheJSONConvert.DeserializeObject<List<SPLatestSampleCode>>(strlatestSampleModel);
            int latestSample = latestSampleModel[0].LatestSampleCode;


            List<SPExistingSampleCodeDetail> ExistingBarCodeNumbers = new List<SPExistingSampleCodeDetail>();
            if (dts.Tables.Count > 1)
            {
                var strAllReqOfCurrentType = JsonConvert.SerializeObject(dts.Tables[1]);
                ExistingBarCodeNumbers = DanpheJSONConvert.DeserializeObject<List<SPExistingSampleCodeDetail>>(strAllReqOfCurrentType);
            }


            var sampleLetter = string.Empty;
            var labSampleCode = string.Empty;

            if (currentRunNumSetting != null)
            {
                sampleLetter = currentRunNumSetting.StartingLetter;

                if (String.IsNullOrWhiteSpace(sampleLetter))
                {
                    sampleLetter = string.Empty;
                }

                var beforeSeparator = currentRunNumSetting.FormatInitialPart;
                var separator = currentRunNumSetting.FormatSeparator;
                var afterSeparator = currentRunNumSetting.FormatLastPart;

                if (beforeSeparator == "num")
                {
                    if (afterSeparator.Contains("yy"))
                    {
                        var afterSeparatorLength = afterSeparator.Length;
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Year.ToString().Substring(1, afterSeparatorLength);
                    }
                    else if (afterSeparator.Contains("dd"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Day.ToString();
                    }
                    else if (afterSeparator.Contains("mm"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Month.ToString();
                    }
                }
                else
                {
                    if (beforeSeparator.Contains("yy"))
                    {
                        var beforeSeparatorLength = beforeSeparator.Length;
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Year.ToString().Substring(1, beforeSeparatorLength);
                    }
                    else if (beforeSeparator.Contains("dd"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Day.ToString();
                    }
                    else if (beforeSeparator.Contains("mm"))
                    {
                        NepaliDateType nepDate = DanpheDateConvertor.ConvertEngToNepDate(sampleDate);
                        labSampleCode = nepDate.Month.ToString();
                    }
                }
            }
            else
            {
                throw new ArgumentException("Cannot Get Samplecode");
            }

            LatestLabSampleCodeDetailVM data = new LatestLabSampleCodeDetailVM();
            data.SampleCode = labSampleCode;
            data.SampleNumber = latestSample;
            data.BarCodeNumber = BarCodeNumber;
            data.SampleLetter = sampleLetter;
            data.ExistingBarCodeNumbersOfPatient = (ExistingBarCodeNumbers != null && ExistingBarCodeNumbers.Count > 0) ? ExistingBarCodeNumbers[0] : null;

            return data;
        }


        private UpdatedSampleCodeReturnData UpdateSampleCode(LabDbContext labDbContext, List<PatientLabSampleVM> labTests, RbacUser currentUser, string labType)
        {
            string RunNumberType = null;
            string visitType = null;
            DateTime? sampleCreatedOn = null;

            //sample code for All Tests in Current Requests will be same.
            int? sampleNum = null;
            Int64? existingBarCodeNum = null;
            Int64? LabBarCodeNum = null;
            string reqIdList = "";
            bool? hasInsurance = labTests[0].HasInsurance;
            using (TransactionScope trans = new TransactionScope())
            {
                try
                {

                    //List<LabRunNumberSettingsModel> allLabRunNumberSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);
                    var requisitionid = labTests[0].RequisitionId;
                    var allReqList = labTests.Select(s => s.RequisitionId).ToList();

                    var allRequisitionsFromDb = labDbContext.Requisitions.Where(a => allReqList.Contains(a.RequisitionId))
                                                        .ToList();

                    LabRequisitionModel currRequisitionType = allRequisitionsFromDb.Where(a => a.RequisitionId == requisitionid)
                                                                  .FirstOrDefault<LabRequisitionModel>();

                    //var barCodeList = (from v in labDbContext.LabBarCode
                    //                   select v).ToList();

                    Int64 lastBarCodeNum = (from bar in labDbContext.LabBarCode
                                            select bar.BarCodeNumber).DefaultIfEmpty(0).Max();
                    //if barcode number is not found then start from 1million (10 lakhs)
                    Int64 newBarCodeNumber = lastBarCodeNum != 0 ? lastBarCodeNum + 1 : 1000000;


                    RunNumberType = currRequisitionType.RunNumberType.ToLower();
                    visitType = currRequisitionType.VisitType.ToLower();
                    sampleCreatedOn = labTests[0].SampleCreatedOn;
                    sampleNum = labTests[0].SampleCode;
                    int patientId = currRequisitionType.PatientId;


                    //Get the GroupingIndex From visitType and Run Number Type
                    var currentSetting = (from runNumSetting in LabRunNumberSettings
                                          where runNumSetting.VisitType.ToLower() == visitType.ToLower()
                                          && runNumSetting.RunNumberType.ToLower() == RunNumberType.ToLower()
                                          && runNumSetting.UnderInsurance == hasInsurance
                                          select runNumSetting
                                         ).FirstOrDefault();

                    //get the requisition with same Run number
                    List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SampleDate", sampleCreatedOn),
                        new SqlParameter("@SampleCode", sampleNum),
                        new SqlParameter("@PatientId", patientId),
                        new SqlParameter("@GroupingIndex", currentSetting.RunNumberGroupingIndex)};
                    DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_GetPatientExistingRequisition_With_SameRunNumber", paramList, labDbContext);

                    List<LabRequisitionModel> esistingReqOfPat = new List<LabRequisitionModel>();

                    if (dts.Tables.Count > 0)
                    {
                        var strPatExistingReq = JsonConvert.SerializeObject(dts.Tables[0]);
                        esistingReqOfPat = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(strPatExistingReq);
                        currRequisitionType = (esistingReqOfPat.Count > 0) ? esistingReqOfPat[0] : null;
                    }
                    else
                    {
                        currRequisitionType = null;
                    }

                    if (currRequisitionType != null)
                    {
                        existingBarCodeNum = currRequisitionType.BarCodeNumber;
                        LabBarCodeModel newBarCode = labDbContext.LabBarCode.Where(c => c.BarCodeNumber == existingBarCodeNum)
                                                            .FirstOrDefault<LabBarCodeModel>();

                        newBarCode.IsActive = true;
                        labDbContext.Entry(newBarCode).Property(a => a.IsActive).IsModified = true;
                        labDbContext.SaveChanges();

                        sampleCreatedOn = currRequisitionType.SampleCreatedOn;
                    }
                    else
                    {
                        if (existingBarCodeNum == null)
                        {
                            LabBarCodeModel barCode = new LabBarCodeModel();
                            barCode.BarCodeNumber = newBarCodeNumber;
                            barCode.IsActive = true;
                            barCode.CreatedBy = currentUser.EmployeeId;
                            barCode.CreatedOn = System.DateTime.Now;
                            labDbContext.LabBarCode.Add(barCode);
                            labDbContext.SaveChanges();
                        }
                    }

                    string formattedSampleCode = GetSampleCodeFormatted(sampleNum, labTests[0].SampleCreatedOn ?? default(DateTime), visitType, RunNumberType,labType);
                    var sampleCollectedDateTime = System.DateTime.Now;
                    DataTable storedProcdureParam = new DataTable();
                    storedProcdureParam.Columns.Add("RequisitionId", typeof(long));
                    storedProcdureParam.Columns.Add("OrderStatus", typeof(string));
                    foreach (var test in labTests)
                    {
                        LabRequisitionModel dbRequisition = allRequisitionsFromDb.Where(r => r.RequisitionId == test.RequisitionId).FirstOrDefault();
                        reqIdList = reqIdList + test.RequisitionId + ",";
                        labDbContext.Requisitions.Attach(dbRequisition);
                        if (test.SampleCode != null)
                        {
                            dbRequisition.SampleCode = sampleNum = test.SampleCode;
                            dbRequisition.SampleCodeFormatted = formattedSampleCode;
                            dbRequisition.SampleCreatedOn = sampleCreatedOn;
                            dbRequisition.SampleCreatedBy = currentUser.EmployeeId;
                            dbRequisition.BarCodeNumber = existingBarCodeNum != null ? existingBarCodeNum : newBarCodeNumber;
                            dbRequisition.SampleCollectedOnDateTime = sampleCollectedDateTime;
                            if(test.ExternalLabSampleStatus.Length > 0)
                            {
                                dbRequisition.ExternalLabSampleStatus = test.ExternalLabSampleStatus;
                            }
                        }
                        dbRequisition.LabTestSpecimen = test.Specimen;
                        dbRequisition.ResultingVendorId = (int)((bool) test.IsOutsourceTest ? test.DefaultOutsourceVendorId : dbRequisition.ResultingVendorId);
                        dbRequisition.OrderStatus = (bool) test.IsOutsourceTest ? ENUM_LabOrderStatus.ReportGenerated : ENUM_LabOrderStatus.Pending;
                        storedProcdureParam.Rows.Add(dbRequisition.RequisitionId, dbRequisition.OrderStatus);
                    }
                    LabBarCodeNum = existingBarCodeNum != null ? existingBarCodeNum : newBarCodeNumber;

                    labDbContext.SaveChanges();

                    reqIdList = reqIdList.Substring(0, (reqIdList.Length - 1));

                    List<SqlParameter> billingParamList = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId_OrderStatus", storedProcdureParam)
                                                };
                    DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate", billingParamList, labDbContext);
                    trans.Complete();

                    var data = new UpdatedSampleCodeReturnData();
                    data.FormattedSampleCode = formattedSampleCode;
                    data.BarCodeNumber = LabBarCodeNum;
                    data.SampleCollectedOnDateTime = sampleCollectedDateTime;
                    return data;
                }
                catch (Exception ex)
                {
                    throw (ex);
                }

            }
        }


        private LabRequisitionModel GetCurrentRequisitionData(LabDbContext labDbContext, int patId, string RunNumberType, string visitType,
            DateTime? sampleCreatedOn, int runNumber, bool? isInsurance)
        {
            LabRequisitionModel currRequisitionType = null;
            var isUnderInsurance = isInsurance.HasValue ? isInsurance.Value : false;




            //Get the GroupingIndex From visitType and Run Number Type
            var currentSetting = (from runNumSetting in LabRunNumberSettings
                                  where runNumSetting.VisitType.ToLower() == visitType.ToLower()
                                  && runNumSetting.RunNumberType.ToLower() == RunNumberType.ToLower()
                                  && runNumSetting.UnderInsurance == isUnderInsurance
                                  select runNumSetting
                                 ).FirstOrDefault();


            //Get all the Rows based upon this GroupingIndex
            var allRunNumSettingsByGroupingIndex = (from runNumSetting in LabRunNumberSettings
                                                    where runNumSetting.RunNumberGroupingIndex == currentSetting.RunNumberGroupingIndex
                                                    select new
                                                    {
                                                        runNumSetting.RunNumberType,
                                                        runNumSetting.VisitType,
                                                        runNumSetting.UnderInsurance,
                                                        runNumSetting.ResetDaily,
                                                        runNumSetting.ResetMonthly,
                                                        runNumSetting.ResetYearly
                                                    }).ToList();


            //Get all the Requisition of current sample date and sample code
            var reqOfCurrentSampleYear = (from req in labDbContext.Requisitions.Where(r => r.SampleCreatedOn.HasValue) //this already filters not null data.. 
                                          where req.SampleCode == runNumber && req.SampleCreatedOn.Value.Year == sampleCreatedOn.Value.Year
                                          select req).ToList();



            foreach (var currVal in allRunNumSettingsByGroupingIndex)
            {
                if (currentSetting.ResetYearly || currentSetting.ResetMonthly || currentSetting.ResetDaily)
                {

                    var repeatedSampleData = (from req in reqOfCurrentSampleYear
                                              where (currentSetting.ResetMonthly ? (DanpheDateConvertor.ConvertEngToNepDate(req.SampleCreatedOn.Value).Month == DanpheDateConvertor.ConvertEngToNepDate(sampleCreatedOn.Value).Month) : true)
                                              && (currentSetting.ResetDaily ? ((req.SampleCreatedOn.Value.Month == sampleCreatedOn.Value.Month)
                                              && (req.SampleCreatedOn.Value.Day == sampleCreatedOn.Value.Day)) : true)
                                              && req.VisitType.ToLower() == currVal.VisitType.ToLower()
                                              && req.RunNumberType.ToLower() == currVal.RunNumberType.ToLower()
                                              && req.HasInsurance == currVal.UnderInsurance
                                              && req.PatientId == patId
                                              select req).FirstOrDefault();

                    if (repeatedSampleData != null)
                    {
                        currRequisitionType = repeatedSampleData;
                    }
                }
                else
                {
                    throw new ArgumentException("Please set the reset type.");
                }

            }
            return currRequisitionType;
        }



        bool PostSms(LabDbContext dbctx, long selectedId, int userId)
        {
            try
            {

                var patientData = GetSmsMessageAndNumberOfPatientByReqId(dbctx, selectedId);
                if (patientData != null)
                {
                    var payLoad = patientData.Message;

                    var smsParamList = dbctx.AdminParameters.Where(p => (p.ParameterGroupName.ToLower() == "lab") && ((p.ParameterName == "SmsParameter") || (p.ParameterName == "LabSmsProviderName"))).Select(d => new { d.ParameterValue, d.ParameterName }).ToList();
                    var providerName = smsParamList.Where(s => s.ParameterName == "LabSmsProviderName").Select(d => d.ParameterValue).FirstOrDefault() ?? "Sparrow";
                    var smsParam = smsParamList.Where(s => s.ParameterName == "SmsParameter").Select(d => d.ParameterValue).FirstOrDefault() ?? "[]";
                    var smsParamObj = JsonConvert.DeserializeObject<List<dynamic>>(smsParam);

                    var selectedProviderDetail = smsParamObj.Where(p => p["SmsProvider"] == providerName).FirstOrDefault();
                    if (selectedProviderDetail != null)
                    {
                        string key = selectedProviderDetail["Token"];

                        if (providerName == "LumbiniTech")
                        {
                            string url = selectedProviderDetail["Url"];
                            url = url.Replace("SMSKEY", key);
                            url = url.Replace("SMSPHONENUMBER", patientData.PhoneNumber);
                            url = url.Replace("SMSMESSAGE", payLoad);

                            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                            request.Method = "GET";
                            request.ContentType = "application/json";
                            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                            if (response.StatusCode == HttpStatusCode.OK)
                            {
                                LabSMSModel data = new LabSMSModel();
                                data.RequisitionId = Convert.ToInt32(selectedId);
                                data.Message = payLoad;
                                data.CreatedOn = System.DateTime.Now;
                                data.CreatedBy = userId;

                                dbctx.LabSms.Add(data);
                                dbctx.SaveChanges();

                                var reqStr = selectedId.ToString();
                                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@RequistionIds", reqStr) };
                                DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_Update_Test_SmsStatus", paramList, dbctx);
                                dbctx.SaveChanges();

                                return true;
                            }
                            else
                            {
                                return false;
                            }
                            //lumbinitech implementation
                        }
                        else if (providerName == "Sparrow")
                        {
                            //sparrow implementation
                            return false;
                        }
                        else
                        {
                            return false;
                        }
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object GetPatientNotFinalizedTests(string categoryIdList, int patientId, DateTime FromDate, DateTime ToDate)
        {
            List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);
            var allEmployee = _labDbContext.Employee.ToDictionary(e => e.EmployeeId.ToString(), v => v.FullName);

            var allreqByPatientId = (from req in _labDbContext.Requisitions
                                     join test in _labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                     where (req.PatientId == patientId)
                                     && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel)
                                     && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned)
                                     && (selCategoryList.Contains(test.LabTestCategoryId))
                                     && (DbFunctions.TruncateTime(req.CreatedOn) >= FromDate && DbFunctions.TruncateTime(req.CreatedOn) <= ToDate)
                                     select new
                                     {
                                         test.LabTestCategoryId,
                                         req.OrderStatus,
                                         req.OrderDateTime,
                                         req.CreatedOn,
                                         req.SampleCodeFormatted,
                                         req.SampleCreatedBy,
                                         req.SampleCollectedOnDateTime,
                                         req.PatientName,
                                         req.LabTestName,
                                         req.ResultAddedBy
                                     }).ToList();


            var requisitions = allreqByPatientId.Where(req => (req.OrderStatus == "active")).ToList();
            var resultsToAdd = allreqByPatientId.Where(req => (req.OrderStatus == "pending")).ToList();
            var resultsAdded = allreqByPatientId.Where(req => (req.OrderStatus == "result-added")).ToList();

             return new
            {
                Requisitions = requisitions,
                ResultsToAdd = resultsToAdd,
                ResultsAdded = resultsAdded,
                Employee = allEmployee
            };
        }

        private object GetLabRequisition(string activeLab,DateTime FromDate, DateTime ToDate)
        {
            var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;
            //FromDate,ToDate
            //Removed to show all detail regardless of BillingStatus
            //&& (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
            var histoNdCytoPatients = (from req in _labDbContext.Requisitions
                                       join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                       where ((req.IsActive == true) && (req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Active) //"active"
                                       && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) // "cancel" ) 
                                       && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned)// "returned") 
                                       && (req.RunNumberType.ToLower() == ENUM_LabRunNumType.histo || req.RunNumberType.ToLower() == ENUM_LabRunNumType.cyto) // "histo || cyto")
                                       && (req.LabTypeName == selectedLab)
                                       && (DbFunctions.TruncateTime(req.CreatedOn) >= FromDate && DbFunctions.TruncateTime(req.CreatedOn) <= ToDate))
                                       select new
                                       {
                                           RequisitionId = req.RequisitionId,
                                           PatientId = req.PatientId,
                                           PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                           PatientCode = pat.PatientCode,
                                           DateOfBirth = pat.DateOfBirth,
                                           Gender = pat.Gender,
                                           PhoneNumber = pat.PhoneNumber,
                                           LastestRequisitionDate = req.OrderDateTime,
                                           VisitType = req.VisitType,
                                           RunNumberType = req.RunNumberType,
                                           WardName = req.WardName,
                                           HasInsurance = req.HasInsurance
                                       }).OrderByDescending(a => a.LastestRequisitionDate).ToList();



            //Removed to show all detail regardless of BillingStatus
            //&& (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
            var normalPatients = (from req in _labDbContext.Requisitions.Include("Patient")
                                  join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                  //show only paid and unpaid requisitions in the list.
                                  //show only IsActive=True and IsActive=NULL requests, Hide IsActive=False. -- sud: 15Sept'18
                                  //if IsActive has value then it should be true, if it's null then its true by default. 
                                  where ((req.IsActive == true ) && req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Active //"active"
                                  && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel)// "cancel") 
                                  && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned) // "returned")
                                  && (req.RunNumberType.ToLower() == ENUM_LabRunNumType.normal) // "normal")
                                  && (req.LabTypeName == selectedLab)
                                  && (DbFunctions.TruncateTime(req.CreatedOn) >= FromDate && DbFunctions.TruncateTime(req.CreatedOn) <= ToDate))
                                  group req by new { req.Patient, req.VisitType, req.WardName, req.HasInsurance } into p
                                  select new
                                  {
                                      RequisitionId = (long)0,
                                      PatientId = p.Key.Patient.PatientId,
                                      PatientName = p.Key.Patient.FirstName + " " + (string.IsNullOrEmpty(p.Key.Patient.MiddleName) ? "" : p.Key.Patient.MiddleName + " ") + p.Key.Patient.LastName,
                                      PatientCode = p.Key.Patient.PatientCode,
                                      DateOfBirth = p.Key.Patient.DateOfBirth,
                                      Gender = p.Key.Patient.Gender,
                                      PhoneNumber = p.Key.Patient.PhoneNumber,
                                      LastestRequisitionDate = p.Max(r => r.OrderDateTime),
                                      VisitType = p.Key.VisitType,
                                      RunNumberType = "normal",
                                      WardName = p.Key.WardName,
                                      HasInsurance = p.Key.HasInsurance
                                      //IsAdmitted = (from adm in labDbContext.Admissions
                                      //              where adm.PatientId == p.Key.Patient.PatientId && adm.AdmissionStatus == "admitted"
                                      //              select adm.AdmissionStatus).FirstOrDefault() == null ? true : false
                                  }).OrderByDescending(b => b.LastestRequisitionDate).ToList();


            var combined = histoNdCytoPatients.Union(normalPatients);
            return combined.OrderByDescending(c => c.LastestRequisitionDate);
        }

        private object GetLabSampleByPatientId(int patientId, string visitType, string runNumberType)
        {
            //include patien ---------------------------------
            var result = (from req in _labDbContext.Requisitions.Include("Patient")
                          join labTest in _labDbContext.LabTests on req.LabTestId equals labTest.LabTestId
                          //show only IsActive=True and IsActive=NULL requests, Hide IsActive=False. -- sud: 15Sept'18
                          //if IsActive has value then it should be true, if it's null then its true by default. 
                          where req.PatientId == patientId && (req.IsActive == true) &&
                          (req.BillingStatus == ENUM_BillingStatus.paid // "paid" 
                          && req.OrderStatus == ENUM_LabOrderStatus.Active) //"active"
                          && (req.VisitType.ToLower() == visitType.ToLower())
                          && (req.RunNumberType.ToLower() == runNumberType.ToLower())

                          select new PatientLabSampleVM
                          {
                              PatientName = req.Patient.FirstName + " " + (string.IsNullOrEmpty(req.Patient.MiddleName) ? "" : req.Patient.MiddleName + " ") + req.Patient.LastName,
                              OrderStatus = req.OrderStatus,
                              SpecimenList = labTest.LabTestSpecimen,
                              RequisitionId = req.RequisitionId,
                              TestName = req.LabTestName,
                              SampleCode = req.SampleCode,
                              OrderDateTime = req.OrderDateTime,
                              SampleCreatedOn = req.SampleCreatedOn,
                              PrescriberName = req.PrescriberName,
                              PatientId = req.PatientId
                          }).ToList();
            if (result.Count != 0)
            {
                result.ForEach(res =>
                {
                    //string specimen = res.Specimen.Split('/')[0];
                    var dateTime = DateTime.Parse(res.OrderDateTime.ToString()).AddHours(-24);

                    if (res.SampleCode == null)
                    {
                        var lastTest = (from labReq in _labDbContext.Requisitions
                                        join labTest in _labDbContext.LabTests on labReq.LabTestId equals labTest.LabTestId
                                        where labReq.PatientId == patientId
                                              && res.SpecimenList.Contains(labReq.LabTestSpecimen)
                                              && labReq.SampleCreatedOn > dateTime
                                        select new
                                        {
                                            SampleCode = labReq.SampleCode,
                                            SampleCreatedOn = labReq.SampleCreatedOn,
                                            SampleCreatedBy = labReq.SampleCreatedBy,
                                            LabTestSpecimen = labReq.LabTestSpecimen
                                        }).OrderByDescending(a => a.SampleCreatedOn).ThenByDescending(a => a.SampleCode).FirstOrDefault();
                        if (lastTest != null)
                        {
                            res.LastSampleCode = DateTime.Parse(lastTest.SampleCreatedOn.ToString()).ToString("yyMMdd") + "-" + lastTest.SampleCode;
                            res.SampleCreatedOn = lastTest.SampleCreatedOn;
                            res.SampleCreatedBy = lastTest.SampleCreatedBy;
                            res.LastSpecimenUsed = lastTest.LabTestSpecimen;
                        }
                    }

                });
            }

            return result;
        }

        private object GetPatientSamplePending(string activeLab, bool? hasInsurance, int requisitionId, int patientId, string wardName, string visitType, string runNumberType)
        {
            List<PatientLabSampleVM> result = new List<PatientLabSampleVM>();
            var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;
            bool underInsurance = hasInsurance.HasValue ? hasInsurance.Value : false;
            //include patien ---------------------------------
            if (requisitionId == 0)
            {

                result = (from req in _labDbContext.Requisitions
                          join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                          join labTest in _labDbContext.LabTests on req.LabTestId equals labTest.LabTestId
                          //show only IsActive=True and IsActive=NULL requests, Hide IsActive=False. -- sud: 15Sept'18
                          //if IsActive has value then it should be true, if it's null then its true by default. 
                          where req.PatientId == patientId && (req.IsActive == true) &&
                          (wardName == "null" ? req.WardName == null : req.WardName == wardName) &&
                          (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) // "cancel") 
                          && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned)//"returned")
                          && (req.OrderStatus == ENUM_LabOrderStatus.Active) // "active"
                          && (req.VisitType.ToLower() == visitType.ToLower())
                          && (req.RunNumberType.ToLower() == runNumberType.ToLower())
                          && (req.HasInsurance == underInsurance)
                          && (req.LabTypeName == selectedLab)
                          select new PatientLabSampleVM
                          {
                              PatientId = req.PatientId,
                              PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                              OrderStatus = req.OrderStatus,
                              SpecimenList = labTest.LabTestSpecimen,
                              RequisitionId = req.RequisitionId,
                              TestName = req.LabTestName,
                              SampleCode = req.SampleCode,
                              OrderDateTime = req.OrderDateTime,
                              SampleCreatedOn = req.SampleCreatedOn,
                              RunNumberType = req.RunNumberType,
                              PrescriberName = req.PrescriberName,
                              HasInsurance = req.HasInsurance,//sud:16Jul'19--to show insurance flag in sample collection and other pages.
                              IsOutsourceTest = labTest.IsOutsourceTest,//Sud:22Aug'23--To show If Test is outsource or not in Collect-Sample page.
                              DefaultOutsourceVendorId = labTest.DefaultOutsourceVendorId,
                          }).ToList();
            }
            else
            {
                var reqId = (long)requisitionId;
                result = (from req in _labDbContext.Requisitions
                          join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                          join labTest in _labDbContext.LabTests on req.LabTestId equals labTest.LabTestId
                          //show only IsActive=True and IsActive=NULL requests, Hide IsActive=False. -- sud: 15Sept'18
                          //if IsActive has value then it should be true, if it's null then its true by default. 
                          where req.PatientId == patientId && (req.IsActive == true)
                          && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) // "cancel")
                          && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned) //"returned")
                          && req.OrderStatus == ENUM_LabOrderStatus.Active //"active"
                          && (req.VisitType.ToLower() == visitType.ToLower())
                          && (req.RunNumberType.ToLower() == runNumberType.ToLower())
                          && (req.RequisitionId == reqId)
                          && (req.LabTypeName == selectedLab)

                          select new PatientLabSampleVM
                          {
                              PatientId = req.PatientId,
                              PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                              OrderStatus = req.OrderStatus,
                              SpecimenList = labTest.LabTestSpecimen,
                              RequisitionId = req.RequisitionId,
                              TestName = req.LabTestName,
                              SampleCode = req.SampleCode,
                              OrderDateTime = req.OrderDateTime,
                              SampleCreatedOn = req.SampleCreatedOn,
                              RunNumberType = req.RunNumberType,
                              PrescriberName = req.PrescriberName,
                              HasInsurance = req.HasInsurance,
                              IsOutsourceTest = labTest.IsOutsourceTest//Sud:22Aug'23--To show If Test is outsource or not in Collect-Sample page.
                          }).ToList();
            }


            if (result.Count != 0)
            {
                result.ForEach(res =>
                {
                    DateTime sampleDate = DateTime.Now;
                });
            }
            return result;
        }

        private object GetLatestSampleCode(DateTime SampleDate, string runNumberType, string visitType, int patientId, string labType, bool? hasInsurance)
        {
            DateTime sampleDate = SampleDate != null ? SampleDate : DateTime.Now;

            var RunType = runNumberType.ToLower();
            var VisitType = visitType.ToLower();
            var PatientId = patientId;
            bool hasInsuranceFlag = hasInsurance.HasValue ? hasInsurance.Value : false;
            try
            {
                var data = this.GenerateLabSampleCode(_labDbContext, RunType, VisitType, PatientId, sampleDate, labType, hasInsuranceFlag);

                return new
                {
                    SampleCode = data.SampleCode,
                    SampleNumber = data.SampleNumber,
                    BarCodeNumber = data.BarCodeNumber,
                    SampleLetter = data.SampleLetter,
                    ExistingBarCodeNumbersOfPatient = data.ExistingBarCodeNumbersOfPatient
                };
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object CheckIsSampleCodeValid(DateTime SampleDate, int? SampleCode, string runNumberType, string visitType,string labType, bool? hasInsurance)
        {
            SampleDate = (SampleDate != null) ? SampleDate : DateTime.Now;
            var sampleCode = SampleCode;
            var RunNumberType = runNumberType.ToLower();
            var VisitType = visitType.ToLower();
            var isUnderInsurance = hasInsurance;

            List<LabRunNumberSettingsModel> allLabRunNumSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);


            //Get the GroupingIndex From visitType and Run Number Type
            var currentSetting = (from runNumSetting in allLabRunNumSettings
                                  where runNumSetting.VisitType.ToLower() == VisitType
                                  && runNumSetting.RunNumberType.ToLower() == RunNumberType
                                  && runNumSetting.UnderInsurance == isUnderInsurance
                                  select runNumSetting
                                 ).FirstOrDefault();


            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@sampleCode", sampleCode),
                        new SqlParameter("@groupingIndex", currentSetting.RunNumberGroupingIndex),
                        new SqlParameter("@sampleDate", SampleDate),
                        new SqlParameter("@LabTypeName", labType)
                    };
            DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_AllRequisitionsBy_SampleCode", paramList, _labDbContext);

            List<LabRequisitionModel> existingRequisition = new List<LabRequisitionModel>();
            if (dts.Tables.Count > 0)
            {
                var strData = JsonConvert.SerializeObject(dts.Tables[0]);
                existingRequisition = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(strData);
            }


            if ((existingRequisition != null) && (existingRequisition.Count() > 0))
            {
                var requisition = existingRequisition[0];
                return new { Exist = true, PatientName = requisition.PatientName, PatientId = requisition.PatientId, SampleCreatedOn = requisition.SampleCreatedOn };
            }
            else
            {
                return new { Exist = false };
            }
        }

        private object GetLabWorkList(string categoryIdList, string activeLab, DateTime FromDate, DateTime ToDate)
        {
            List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);
            List<LabPendingResultVM> results = new List<LabPendingResultVM>();
            var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;
            var reportWithHtmlTemplate = GetAllHTMLLabPendingResults(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab, forWorkList: true);

            var reportWithNormalEntry = GetAllNormalLabPendingResults(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab, forWorkList: true);

            results = reportWithHtmlTemplate.Union(reportWithNormalEntry).ToList();

            return results.OrderBy(d => d.BarCodeNumber).ThenBy(c => c.SampleCode).ToList();
        }

        private object GetPendingLabResults(string categoryIdList, string activeLab, DateTime FromDate, DateTime ToDate)
        {
            List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);
            List<LabPendingResultVM> results = new List<LabPendingResultVM>();
            var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;
            var dVendorId = (from vendor in _labDbContext.LabVendors
                             where vendor.IsDefault == true
                             select vendor.LabVendorId).FirstOrDefault();
            var reportWithHtmlTemplate = GetAllHTMLLabPendingResults(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab, defaultVendorId: dVendorId);

            var reportWithNormalEntry = GetAllNormalLabPendingResults(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab, defaultVendorId: dVendorId);

            results = reportWithHtmlTemplate.Union(reportWithNormalEntry).ToList();

            //foreach (var rep in reportWithHtmlTemplate)
            //{
            //    rep.SampleCodeFormatted = GetSampleCodeFormatted(rep.SampleCode, rep.SampleDate ?? default(DateTime), rep.VisitType.ToLower(), rep.RunNumType.ToLower());
            //    results.Add(rep);
            //}
            //foreach (var repNormal in reportWithNormalEntry)
            //{
            //    repNormal.SampleCodeFormatted = GetSampleCodeFormatted(repNormal.SampleCode, repNormal.SampleDate ?? default(DateTime), repNormal.VisitType, repNormal.RunNumType);
            //    results.Add(repNormal);
            //}

            return results.OrderBy(d => d.BarCodeNumber).ToList();
        }

        private object GetPendingLabReport(string categoryIdList, string activeLab, DateTime FromDate, DateTime ToDate)
        {
            List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);
            List<LabPendingResultVM> results = new List<LabPendingResultVM>();
            var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;

            var pendingNormalReports = GetAllNormalLabPendingReports(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab);
            var pendingHtmlNCS = GetAllHTMLLabPendingReports(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab);

            results = pendingHtmlNCS.Union(pendingNormalReports).ToList();

            return results.OrderBy(d => d.ResultAddedOn);
        }

        //private object GetFinalReport(string search, string activeLab, bool? isForLabMaster, string categoryIdList,DateTime FromDate, DateTime ToDate)
        //{
        //    //CoreDbContext coreDbContext = new CoreDbContext(connString);
        //    search = string.IsNullOrEmpty(search) ? string.Empty : search.Trim().ToLower();
        //    var selectedLab = String.IsNullOrEmpty(activeLab) ? "" : activeLab;
        //    bool isForLabMasterPage = isForLabMaster ?? false;

        //    List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);

        //    var allFinalReports = GetAllLabFinalReportsFromSP(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, labType: selectedLab, isForLabMaster: isForLabMasterPage);
        //    var finalReports = GetFinalReportListFormatted(allFinalReports);

        //    if (!string.IsNullOrEmpty(search))
        //    {
        //        finalReports = finalReports.Where(r => (r.BarCodeNumber.ToString() + " " + r.PatientName + " " + r.PatientCode + " " + r.SampleCode.ToString() + " " + r.PhoneNumber + " " + r.SampleCodeFormatted).ToLower().Contains(search))
        //                                   .OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();
        //    }
        //    else
        //    {
        //        finalReports = finalReports.OrderBy(rep => rep.ReportId).ToList();
        //    }


        //    // 14th Jan 2020: Here we are filtering data as per search text, this will avoid maximum records
        //    // but not improve performance same as other server side search feature pages.
        //    // Because other pages filter db data, here we are filtering with results which is get into finalReports.
        //    // we need to apply search on above function => GetAllLabProvisionalFinalReports, GetAllLabPaidUnpaidFinalReports
        //    if (CommonFunctions.GetCoreParameterBoolValue(_coreDbContext, "Common", "ServerSideSearchComponent", "LaboratoryFinalReports") == true && search == "")
        //    {
        //        finalReports = finalReports.AsEnumerable().Take(CommonFunctions.GetCoreParameterIntValue(_coreDbContext, "Common", "ServerSideSearchListLength"));
        //    }
        //    var reportFormattedForFinalReportPage = GetFinalReportListFormattedInFinalReportPage(finalReports);
        //    return reportFormattedForFinalReportPage;
        //}

        private object GetReportForReportDispatch(string categoryIdList, DateTime FromDate, DateTime ToDate, int patientId)
        {
            bool isForLabMasterPage = true;

            List<int> selCategoryList = DanpheJSONConvert.DeserializeObject<List<int>>(categoryIdList);

            var allFinalReports = GetAllLabFinalReportsFromSP(_labDbContext, StartDate: FromDate, EndDate: ToDate, categoryList: selCategoryList, isForLabMaster: isForLabMasterPage, PatientId: patientId);
            var finalReports = GetFinalReportListFormatted(allFinalReports);

            return finalReports.OrderBy(rep => rep.ReportId).ToList();
        }

        private object GetLabDataByBarcodeNumber(int barCodeNumber, string labType)
        {
            LabMasterModel LabMasterData = new LabMasterModel();

            int BarCodeNumber = barCodeNumber;

            var firstReq = (from reqsn in _labDbContext.Requisitions
                            join patient in _labDbContext.Patients on reqsn.PatientId equals patient.PatientId
                            where reqsn.BarCodeNumber == BarCodeNumber
                            select new
                            {
                                PatientId = patient.PatientId,
                                Gender = patient.Gender,
                                PatientCode = patient.PatientCode,
                                PatientDob = patient.DateOfBirth,
                                FirstName = patient.FirstName,
                                MiddleName = patient.MiddleName,
                                LastName = patient.LastName,
                                SampleCreatedOn = reqsn.SampleCreatedOn
                            }).FirstOrDefault();

            LabMasterData.PatientId = firstReq.PatientId;
            LabMasterData.PatientName = firstReq.FirstName + " " + (string.IsNullOrEmpty(firstReq.MiddleName) ? "" : firstReq.MiddleName + " ") + firstReq.LastName;
            LabMasterData.Gender = firstReq.Gender;
            LabMasterData.PatientCode = firstReq.PatientCode;
            LabMasterData.DateOfBirth = firstReq.PatientDob;
            LabMasterData.BarCodeNumber = BarCodeNumber;
            LabMasterData.SampleCollectedOn = firstReq.SampleCreatedOn;

            //Anish 24 Nov: This function below has single function for both getting AllLabData from BarcodeNumber or RunNumber-
            //but is slow due large number of for loop containing if-else statement inside it
            //LabMasterData = AllLabDataFromRunNumOrBarCode(labDbContext, BarCodeNumber);


            //All PendingLabResults (for Add-Result page) of Particular Barcode Number
            var reportWithHtmlTemplate = GetAllHTMLLabPendingResults(_labDbContext, BarcodeNumber: BarCodeNumber);

            var reportWithNormalEntry = GetAllNormalLabPendingResults(_labDbContext, BarcodeNumber: BarCodeNumber);


            foreach (var rep in reportWithHtmlTemplate)
            {
                rep.SampleCodeFormatted = GetSampleCodeFormatted(rep.SampleCode, rep.SampleDate ?? default(DateTime), rep.VisitType, rep.RunNumType, labType);
                LabMasterData.AddResult.Add(rep);
            }
            foreach (var repNormal in reportWithNormalEntry)
            {
                repNormal.SampleCodeFormatted = GetSampleCodeFormatted(repNormal.SampleCode, repNormal.SampleDate ?? default(DateTime), repNormal.VisitType, repNormal.RunNumType, labType);
                LabMasterData.AddResult.Add(repNormal);
            }

            LabMasterData.AddResult = LabMasterData.AddResult.OrderByDescending(d => d.SampleDate).ThenByDescending(c => c.SampleCode).ToList();


            var pendingNormalReports = GetAllNormalLabPendingReports(_labDbContext, BarcodeNumber: BarCodeNumber);
            var pendingHtmlNCS = GetAllHTMLLabPendingReports(_labDbContext, BarcodeNumber: BarCodeNumber);

            var pendingRep = pendingHtmlNCS.Union(pendingNormalReports);
            LabMasterData.PendingReport = pendingRep.OrderByDescending(rep => rep.ResultAddedOn).ThenByDescending(x => x.SampleDate).ThenByDescending(a => a.SampleCode).ToList();


            var allBillingStatusFinalReports = GetAllLabFinalReportsFromSP(_labDbContext, BarcodeNumber: BarCodeNumber);
            var finalReports = GetFinalReportListFormatted(allBillingStatusFinalReports);
            finalReports = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();
            LabMasterData.FinalReport = finalReports.ToList();

            //var parameterOutPatWithProvisional = (from coreData in labDbContext.AdminParameters
            //                                      where coreData.ParameterGroupName.ToLower() == "lab"
            //                                      && coreData.ParameterName == "AllowLabReportToPrintOnProvisional"
            //                                      select coreData.ParameterValue).FirstOrDefault();

            //bool allowOutPatWithProv = false;

            //if (!String.IsNullOrEmpty(parameterOutPatWithProvisional) && parameterOutPatWithProvisional.ToLower() == "true")
            //{
            //    allowOutPatWithProv = true;
            //}


            //foreach (var rep in LabMasterData.FinalReport)
            //{
            //    if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(rep.BillingStatus))
            //    {
            //        rep.IsValidToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, rep.BillingStatus);
            //    }
            //    foreach (var test in rep.Tests)
            //    {
            //        if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(test.BillingStatus))
            //        {
            //            test.ValidTestToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, test.BillingStatus);
            //        }
            //    }
            //}

            return LabMasterData;
        }

        private object GetLabDataByRunNumber(string formattedSampleCode)
        {
            LabMasterModel LabMasterData = new LabMasterModel();
            string completeSampleCode = formattedSampleCode;

            //LabMasterData = AllLabDataFromRunNumOrBarCode(labDbContext, formattedCode:completeSampleCode);


            List<LabRunNumberSettingsModel> allLabRunNumberSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);

            //assuming all the settings have same separator
            var separator = allLabRunNumberSettings[0].FormatSeparator;
            var mainCode = formattedSampleCode.Split(separator[0]);
            int samplNumber = Convert.ToInt32(mainCode[0]);
            int code = Convert.ToInt32(mainCode[1]);

            if (allLabRunNumberSettings[0].FormatInitialPart != "num")
            {
                samplNumber = code;
                code = Convert.ToInt32(mainCode[0]);
            }


            DateTime englishDateToday = DateTime.Now;
            NepaliDateType nepaliDate = DanpheDateConvertor.ConvertEngToNepDate(englishDateToday);

            if (code > 32)
            {
                nepaliDate.Year = 2000 + code;
            }
            else
            {
                nepaliDate.Day = code;
            }

            englishDateToday = DanpheDateConvertor.ConvertNepToEngDate(nepaliDate);



            var reportWithHtmlTemplate = GetAllHTMLLabPendingResults(_labDbContext, SampleNumber: samplNumber, SampleCode: code, EnglishDateToday: englishDateToday);

            var reportWithNormalEntry = GetAllNormalLabPendingResults(_labDbContext, SampleNumber: samplNumber, SampleCode: code, EnglishDateToday: englishDateToday);



            foreach (var rep in reportWithHtmlTemplate)
            {
                var letter = allLabRunNumberSettings.Where(t => t.VisitType == rep.VisitType.ToLower() && t.RunNumberType == rep.RunNumType.ToLower()).Select(s => s.StartingLetter).FirstOrDefault();
                if (!String.IsNullOrEmpty(letter))
                {
                    completeSampleCode = letter + formattedSampleCode;
                }

                if (rep.SampleCodeFormatted == completeSampleCode)
                {
                    LabMasterData.AddResult.Add(rep);
                }

            }
            foreach (var repNormal in reportWithNormalEntry)
            {
                var letter = allLabRunNumberSettings.Where(t => t.VisitType == repNormal.VisitType.ToLower() && t.RunNumberType == repNormal.RunNumType.ToLower()).Select(s => s.StartingLetter).FirstOrDefault();
                if (!String.IsNullOrEmpty(letter))
                {
                    completeSampleCode = letter + formattedSampleCode;
                }
                if (repNormal.SampleCodeFormatted == completeSampleCode)
                {
                    LabMasterData.AddResult.Add(repNormal);
                }
            }

            LabMasterData.AddResult = LabMasterData.AddResult.OrderByDescending(d => d.SampleDate).ThenByDescending(c => c.SampleCode).ToList();
            var pendingNormalReports = GetAllNormalLabPendingReports(_labDbContext, SampleNumber: samplNumber, SampleCode: code, EnglishDateToday: englishDateToday);
            var pendingHtmlNCS = GetAllHTMLLabPendingReports(_labDbContext, SampleNumber: samplNumber, SampleCode: code, EnglishDateToday: englishDateToday);

            foreach (var rep in pendingHtmlNCS)
            {
                var letter = allLabRunNumberSettings.Where(t => t.VisitType == rep.VisitType.ToLower() && t.RunNumberType == rep.RunNumType.ToLower()).Select(s => s.StartingLetter).FirstOrDefault();
                if (!String.IsNullOrEmpty(letter))
                {
                    completeSampleCode = letter + formattedSampleCode;
                }
                if (rep.SampleCodeFormatted == completeSampleCode)
                {
                    LabMasterData.PendingReport.Add(rep);
                }
            }
            foreach (var repNormal in pendingNormalReports)
            {
                var letter = allLabRunNumberSettings.Where(t => t.VisitType == repNormal.VisitType.ToLower() && t.RunNumberType == repNormal.RunNumType.ToLower()).Select(s => s.StartingLetter).FirstOrDefault();
                if (!String.IsNullOrEmpty(letter))
                {
                    completeSampleCode = letter + formattedSampleCode;
                }
                if (repNormal.SampleCodeFormatted == completeSampleCode)
                {
                    LabMasterData.PendingReport.Add(repNormal);
                }
            }

            var allBillingStatusFinalReports = GetAllLabFinalReportsFromSP(_labDbContext, SampleNumber: samplNumber, SampleCode: code, EnglishDateToday: englishDateToday);
            var finalReports = GetFinalReportListFormatted(allBillingStatusFinalReports);
            finalReports = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();
            LabMasterData.FinalReport = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();

            //var parameterOutPatWithProvisional = (from coreData in labDbContext.AdminParameters
            //                                      where coreData.ParameterGroupName.ToLower() == "lab"
            //                                      && coreData.ParameterName == "AllowLabReportToPrintOnProvisional"
            //                                      select coreData.ParameterValue).FirstOrDefault();

            //bool allowOutPatWithProv = false;

            //if (!String.IsNullOrEmpty(parameterOutPatWithProvisional) && parameterOutPatWithProvisional.ToLower() == "true")
            //{
            //    allowOutPatWithProv = true;
            //}


            //foreach (var rep in finalReports)
            //{
            //    var letter = allLabRunNumberSettings.Where(t => t.VisitType == rep.VisitType.ToLower() && t.RunNumberType == rep.RunNumType.ToLower()).Select(s => s.StartingLetter).FirstOrDefault();
            //    if (!String.IsNullOrEmpty(letter))
            //    {
            //        completeSampleCode = letter + formattedSampleCode;
            //    }
            //    if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(rep.BillingStatus))
            //    {
            //        rep.IsValidToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, rep.BillingStatus);
            //    }

            //    foreach (var test in rep.Tests)
            //    {
            //        if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(test.BillingStatus))
            //        {
            //            test.ValidTestToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, test.BillingStatus);
            //        }
            //    }

            //    if (rep.SampleCodeFormatted == completeSampleCode)
            //    {
            //        LabMasterData.FinalReport.Add(rep);
            //    }
            //}
            return LabMasterData;
        }

        private object GetLabDataByPatientId(int patientId)
        {
            LabMasterModel LabMasterData = new LabMasterModel();

            int patId = patientId;

            //All LabRequisitions of Patient
            var histoPatients = (from req in _labDbContext.Requisitions.Include("Patient")
                                 join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                 where ((req.IsActive == true) && req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Active// "active"
                                 && req.PatientId == patId
                                 && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) //"cancel") 
                                 && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned) //"returned") 
                                 && req.RunNumberType.ToLower() == ENUM_LabRunNumType.histo) // "histo")
                                 select new Requisition
                                 {
                                     RequisitionId = req.RequisitionId,
                                     PatientId = req.PatientId,
                                     PatientName = req.Patient.FirstName + " " + (string.IsNullOrEmpty(req.Patient.MiddleName) ? "" : req.Patient.MiddleName + " ") + req.Patient.LastName,
                                     PatientCode = req.Patient.PatientCode,
                                     DateOfBirth = req.Patient.DateOfBirth,
                                     Gender = req.Patient.Gender,
                                     PhoneNumber = req.Patient.PhoneNumber,
                                     LastestRequisitionDate = req.OrderDateTime,
                                     VisitType = req.VisitType,
                                     RunNumberType = req.RunNumberType,
                                     WardName = req.WardName
                                 }).OrderByDescending(a => a.LastestRequisitionDate).ToList(); ;

            //Removed to show all detail regardless of BillingStatus
            //&& (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
            var cytoPatients = (from req in _labDbContext.Requisitions.Include("Patient")
                                join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                where ((req.IsActive == true) && req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Active //"active"
                                && req.PatientId == patId
                                && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) // "cancel") 
                                && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned) // "returned")
                                && req.RunNumberType.ToLower() == ENUM_LabRunNumType.cyto) // // "cyto")
                                select new Requisition
                                {
                                    RequisitionId = req.RequisitionId,
                                    PatientId = req.PatientId,
                                    PatientName = req.Patient.FirstName + " " + (string.IsNullOrEmpty(req.Patient.MiddleName) ? "" : req.Patient.MiddleName + " ") + req.Patient.LastName,
                                    PatientCode = req.Patient.PatientCode,
                                    DateOfBirth = req.Patient.DateOfBirth,
                                    Gender = req.Patient.Gender,
                                    PhoneNumber = req.Patient.PhoneNumber,
                                    LastestRequisitionDate = req.OrderDateTime,
                                    VisitType = req.VisitType,
                                    RunNumberType = req.RunNumberType,
                                    WardName = req.WardName
                                }).OrderByDescending(a => a.LastestRequisitionDate).ToList();

            //.OrderByDescending(a => a.LatestRequisitionDate).ToList()

            //Removed to show all detail regardless of BillingStatus
            //&& (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || (req.BillingStatus == "provisional" && req.VisitType == "inpatient"))
            var normalPatients = (from req in _labDbContext.Requisitions.Include("Patient")
                                  join pat in _labDbContext.Patients on req.PatientId equals pat.PatientId
                                  //show only paid and unpaid requisitions in the list.
                                  //show only IsActive=True and IsActive=NULL requests, Hide IsActive=False. -- sud: 15Sept'18
                                  //if IsActive has value then it should be true, if it's null then its true by default. 
                                  where ((req.IsActive == true) && req.OrderStatus.ToLower() == ENUM_LabOrderStatus.Active //"active"
                                  && req.PatientId == patId
                                  && (req.BillingStatus.ToLower() != ENUM_BillingStatus.cancel) // "cancel")
                                  && (req.BillingStatus.ToLower() != ENUM_BillingStatus.returned) //"returned") 
                                  && req.RunNumberType.ToLower() == ENUM_LabRunNumType.normal) // "normal")
                                  group req by new { req.Patient, req.VisitType, req.WardName } into p
                                  select new Requisition
                                  {
                                      RequisitionId = (long)0,
                                      PatientId = p.Key.Patient.PatientId,
                                      PatientName = p.Key.Patient.FirstName + " " + (string.IsNullOrEmpty(p.Key.Patient.MiddleName) ? "" : p.Key.Patient.MiddleName + " ") + p.Key.Patient.LastName,
                                      PatientCode = p.Key.Patient.PatientCode,
                                      DateOfBirth = p.Key.Patient.DateOfBirth,
                                      Gender = p.Key.Patient.Gender,
                                      PhoneNumber = p.Key.Patient.PhoneNumber,
                                      LastestRequisitionDate = p.Max(r => r.OrderDateTime),
                                      VisitType = p.Key.VisitType,
                                      RunNumberType = "normal",
                                      WardName = p.Key.WardName
                                      //IsAdmitted = (from adm in labDbContext.Admissions
                                      //              where adm.PatientId == p.Key.Patient.PatientId && adm.AdmissionStatus == "admitted"
                                      //              select adm.AdmissionStatus).FirstOrDefault() == null ? true : false
                                  }).OrderByDescending(b => b.LastestRequisitionDate).ToList();


            var combined = histoPatients.Union(cytoPatients).Union(normalPatients);
            var allReqs = combined.OrderByDescending(c => c.LastestRequisitionDate);
            List<Requisition> allRequisitionsOfPat = new List<Requisition>(allReqs);
            LabMasterData.LabRequisitions = allRequisitionsOfPat;



            //All PendingLabResults (for Add-Result page) of Particular Barcode Number
            var reportWithHtmlTemplate = GetAllHTMLLabPendingResults(_labDbContext, PatientId: patId);
            var reportWithNormalEntry = GetAllNormalLabPendingResults(_labDbContext, PatientId: patId);

            foreach (var rep in reportWithHtmlTemplate)
            {
                LabMasterData.AddResult.Add(rep);
            }
            foreach (var repNormal in reportWithNormalEntry)
            {
                LabMasterData.AddResult.Add(repNormal);
            }

            LabMasterData.AddResult = LabMasterData.AddResult.OrderByDescending(d => d.SampleDate).ThenByDescending(c => c.SampleCode).ToList();


            var pendingNormalReports = GetAllNormalLabPendingReports(_labDbContext, PatientId: patId);
            var pendingHtmlNCS = GetAllHTMLLabPendingReports(_labDbContext, PatientId: patId);
            var pendingRep = pendingHtmlNCS.Union(pendingNormalReports);
            LabMasterData.PendingReport = pendingRep.OrderByDescending(rep => rep.ResultAddedOn).ThenByDescending(x => x.SampleDate).ThenByDescending(a => a.SampleCode).ToList();


            var allBillingStatusFinalReports = GetAllLabFinalReportsFromSP(_labDbContext, PatientId: patId);
            var finalReports = GetFinalReportListFormatted(allBillingStatusFinalReports);
            finalReports = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();
            LabMasterData.FinalReport = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();


            //var finalReportsProv = GetAllLabProvisionalFinalReports(labDbContext, PatientId: patId);
            //var finalReportsPaidUnpaid = GetAllLabPaidUnpaidFinalReports(labDbContext, PatientId: patId);


            //var finalReports = finalReportsProv.Union(finalReportsPaidUnpaid);
            //finalReports = finalReports.OrderByDescending(rep => rep.SampleDate).ThenByDescending(x => x.SampleCode).ThenByDescending(a => a.PatientId).ToList();
            //List<LabPendingResultVM> finalReportList = new List<LabPendingResultVM>(finalReports);

            //LabMasterData.FinalReport = finalReportList;


            //var parameterOutPatWithProvisional = (from coreData in labDbContext.AdminParameters
            //                                      where coreData.ParameterGroupName.ToLower() == "lab"
            //                                      && coreData.ParameterName == "AllowLabReportToPrintOnProvisional"
            //                                      select coreData.ParameterValue).FirstOrDefault();

            //bool allowOutPatWithProv = false;

            //if (!String.IsNullOrEmpty(parameterOutPatWithProvisional) && parameterOutPatWithProvisional.ToLower() == "true")
            //{
            //    allowOutPatWithProv = true;
            //}


            //foreach (var rep in LabMasterData.FinalReport)
            //{
            //    if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(rep.BillingStatus))
            //    {
            //        rep.IsValidToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, rep.BillingStatus);
            //    }
            //    foreach (var test in rep.Tests)
            //    {
            //        if (!String.IsNullOrEmpty(rep.VisitType) && !String.IsNullOrEmpty(test.BillingStatus))
            //        {
            //            test.ValidTestToPrint = ValidatePrintOption(allowOutPatWithProv, rep.VisitType, test.BillingStatus);
            //        }
            //    }
            //}

            return LabMasterData;
        }

        private object GetLabReportByRequisitionIds(string requisitionIdList)
        {
            List<Int64> reqIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(requisitionIdList);
            var allBarCode = (from requisition in _labDbContext.Requisitions
                              where reqIdList.Contains(requisition.RequisitionId)
                              select requisition.BarCodeNumber).Distinct().ToList();


            if (allBarCode != null && allBarCode.Count == 1)
            {
                LabReportVM labReport = DanpheEMR.Labs.LabsBL.GetLabReportVMForReqIds(_labDbContext, reqIdList, CovidReportUrlComonPath);
                //labReport.Lookups.SampleCodeFormatted = GetSampleCodeFormatted(labReport.Lookups.SampleCode, labReport.Lookups.SampleDate ?? default(DateTime), labReport.Lookups.VisitType, labReport.Lookups.RunNumberType);

                labReport.ValidToPrint = true;
                labReport.BarCodeNumber = allBarCode[0];
                return labReport;
            }
            else
            {
                throw new Exception("Multiple Barcode found for List of RequisitionID");
            }
        }

        private object GetLabReportByRequisitionIdsForReportDispatch(string requisitionIdList)
        {
            try
            {
                List<List<Int64>> reqIdList = DanpheJSONConvert.DeserializeObject<List<List<Int64>>>(requisitionIdList);
                List<LabReportVM> multipleReports = new List<LabReportVM>();
                foreach (var reqList in reqIdList)
                {
                    if (reqList.Count > 0)
                    {
                        var allBarCode = (from requisition in _labDbContext.Requisitions
                                          where reqList.Contains(requisition.RequisitionId)
                                          select requisition.BarCodeNumber).Distinct().ToList();
                        if (allBarCode != null && allBarCode.Count == 1)
                        {
                            LabReportVM labReport = DanpheEMR.Labs.LabsBL.GetLabReportVMForReqIds(_labDbContext, reqList, CovidReportUrlComonPath);
                            labReport.ValidToPrint = true;
                            labReport.BarCodeNumber = allBarCode[0];
                            multipleReports.Add(labReport);
                        }
                        else
                        {
                            throw new Exception("Multiple Barcode found for List of RequisitionID");
                        }
                    }
                }

                return multipleReports;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private object GetAllLabTests()
        {
            // to store in cache
            List<LabTestModel> testsFromCache = (List<LabTestModel>)DanpheCache.Get("lab-test-all");
            if (testsFromCache == null)
            {
                testsFromCache = _labDbContext.LabTests.ToList();
                DanpheCache.Add("lab-test-all", testsFromCache, 5);
            }
            return testsFromCache;
        }

        private object GetLabTestOfSelectedInpatient(int patientId, int patientVisitId)
        {

            string module = this.ReadQueryStringData("module");

            PatientModel currPatient = _labDbContext.Patients.Where(pat => pat.PatientId == patientId).FirstOrDefault();
            if (currPatient != null)
            {
                string subDivName = (from pat in _labDbContext.Patients
                                     join countrySubdiv in _labDbContext.CountrySubdivisions
                                     on pat.CountrySubDivisionId equals countrySubdiv.CountrySubDivisionId
                                     where pat.PatientId == currPatient.PatientId
                                     select countrySubdiv.CountrySubDivisionName
                                  ).FirstOrDefault();

                currPatient.CountrySubDivisionName = subDivName;
                //remove relational property of patient//sud: 12May'18
                //currPatient.BillingTransactionItems = null;
            }

            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@patientId", patientId),
                        new SqlParameter("@patientVisitId", patientVisitId),
                        new SqlParameter("@moduleName", module)
                    };

            DataTable patCreditItems = DALFunctions.GetDataTableFromStoredProc("SP_InPatient_Item_Details", paramList, _labDbContext);


            //create new anonymous type with patient information + Credit Items information : Anish:4May'18
            var patCreditDetails = new
            {
                Patient = currPatient,
                BillItems = patCreditItems
            };
            return patCreditDetails;
        }

        private object AddComponents(string specimenDataModel, string ipStr, RbacUser currentUser)
        {
            List<LabTestSpecimenModel> labSpecimenList = DanpheJSONConvert.DeserializeObject<List<LabTestSpecimenModel>>(specimenDataModel);
            List<LabTestComponentResult> labComponentFromClient = DanpheJSONConvert.DeserializeObject<List<LabTestComponentResult>>(ipStr);
            if (IsValidForAddResult(labComponentFromClient, _labDbContext))
            {
                using (TransactionScope trans = new TransactionScope())
                {
                    try
                    {


                        Int64 reqId = labComponentFromClient[0].RequisitionId;
                        int? templateId = labComponentFromClient[0].TemplateId;


                        LabRequisitionModel LabRequisition = _labDbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault();


                        if (LabRequisition.ReportTemplateId != templateId)
                        {
                            UpdateReportTemplateId(reqId, templateId, _labDbContext, currentUser.EmployeeId);
                            labComponentFromClient.ForEach(cmp =>
                            {
                                cmp.CreatedOn = DateTime.Now;
                                cmp.CreatedBy = currentUser.EmployeeId;
                                cmp.ResultGroup = cmp.ResultGroup.HasValue ? cmp.ResultGroup.Value : 1;
                                _labDbContext.LabTestComponentResults.Add(cmp);
                            });
                        }
                        else
                        {
                            labComponentFromClient.ForEach(cmp =>
                            {
                                cmp.CreatedOn = DateTime.Now;
                                cmp.CreatedBy = currentUser.EmployeeId;
                                cmp.ResultGroup = cmp.ResultGroup.HasValue ? cmp.ResultGroup.Value : 1;
                                _labDbContext.LabTestComponentResults.Add(cmp);
                            });

                        }

                        _labDbContext.SaveChanges();




                        //once the results are saved, put the status of 
                        List<Int64> distinctRequisitions = labComponentFromClient.Select(a => a.RequisitionId).Distinct().ToList();
                        string allReqIdListStr = "";
                        DataTable storedProcdureParam = new DataTable();
                        storedProcdureParam.Columns.Add("RequisitionId", typeof(long));
                        storedProcdureParam.Columns.Add("OrderStatus", typeof(string));
                        foreach (Int64 requisitionId in distinctRequisitions)
                        {
                            allReqIdListStr = allReqIdListStr + requisitionId + ",";
                            LabRequisitionModel dbRequisition = _labDbContext.Requisitions
                                                            .Where(a => a.RequisitionId == requisitionId)
                                                            .FirstOrDefault<LabRequisitionModel>();

                            if (dbRequisition != null)
                            {
                                dbRequisition.ResultAddedBy = currentUser.EmployeeId;
                                dbRequisition.ResultAddedOn = System.DateTime.Now;
                                dbRequisition.OrderStatus = ENUM_LabOrderStatus.ResultAdded;   // "result-added";
                                _labDbContext.Entry(dbRequisition).Property(a => a.OrderStatus).IsModified = true;
                                _labDbContext.Entry(dbRequisition).Property(a => a.ResultAddedBy).IsModified = true;
                                _labDbContext.Entry(dbRequisition).Property(a => a.ResultAddedOn).IsModified = true;

                            }
                            storedProcdureParam.Rows.Add(dbRequisition.RequisitionId, dbRequisition.OrderStatus);
                        }

                        _labDbContext.SaveChanges();


                        //Add specimen of culture test
                        if (labSpecimenList != null && labSpecimenList.Count > 0)
                        {
                            int ln = labSpecimenList.Count;
                            for (int i = 0; i < ln; i++)
                            {
                                int? requisitId = labSpecimenList[i].RequisitionId;
                                string specimen = labSpecimenList[i].Specimen;
                                if (requisitId != null && requisitId > 0)
                                {
                                    LabRequisitionModel labReq = _labDbContext.Requisitions.Where(val => val.RequisitionId == requisitId).FirstOrDefault<LabRequisitionModel>();
                                    labReq.LabTestSpecimen = specimen;
                                    _labDbContext.SaveChanges();
                                }
                            }
                        }

                        allReqIdListStr = allReqIdListStr.Substring(0, (allReqIdListStr.Length - 1));

                        List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId_OrderStatus", storedProcdureParam),
                                                };
                        DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate", paramList, _labDbContext);
                        trans.Complete();
                        return labComponentFromClient;
                    }
                    catch (Exception ex)
                    {
                        throw (ex);
                    }
                }
            }
            else
            {
                throw new Exception("Result is Already added for one or more tests.");
            }
        }

        //private object AddRequsitionFromBilling(string ipStr)
        //{
        //    List<LabRequisitionModel> labReqListFromClient = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(ipStr);
        //    if (labReqListFromClient != null && labReqListFromClient.Count > 0)
        //    {


        //        PatientDbContext patientContext = new PatientDbContext(connString);
        //        List<LabTestModel> allLabTests = _labDbContext.LabTests.ToList();
        //        int patId = labReqListFromClient[0].PatientId;
        //        //get patient as querystring from client side rather than searching it from request's list.
        //        PatientModel currPatient = patientContext.Patients.Where(p => p.PatientId == patId)
        //            .FirstOrDefault<PatientModel>();

        //        if (currPatient != null)
        //        {

        //            labReqListFromClient.ForEach(req =>
        //            {
        //                LabTestModel labTestdb = allLabTests.Where(a => a.LabTestId == req.LabTestId).FirstOrDefault<LabTestModel>();
        //                //get PatientId from clientSide
        //                if (labTestdb.IsValidForReporting == true)
        //                {
        //                    req.LabTestSpecimen = labTestdb.LabTestSpecimen;
        //                    req.LabTestSpecimenSource = labTestdb.LabTestSpecimenSource;
        //                    req.OrderStatus = ENUM_LabOrderStatus.Active; //"active";
        //                    req.LOINC = "LOINC Code";
        //                    req.RunNumberType = labTestdb.RunNumberType;
        //                    //req.PatientVisitId = visitId;//assign above visitid to this requisition.
        //                    if (String.IsNullOrEmpty(currPatient.MiddleName))
        //                        req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
        //                    else
        //                        req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

        //                    req.OrderDateTime = DateTime.Now;
        //                    _labDbContext.Requisitions.Add(req);
        //                }
        //            });
        //            _labDbContext.SaveChanges();
        //        }
        //        return labReqListFromClient;
        //    }
        //    else
        //    {
        //        throw new Exception("Invalid input request.");
        //    }
        //}

        private object AddNewRequsition(string ipStr)
        {
            List<LabRequisitionModel> labReqListFromClient = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(ipStr);
            LabVendorsModel defaultVendor = _labDbContext.LabVendors.Where(val => val.IsDefault == true).FirstOrDefault();


            if (labReqListFromClient != null && labReqListFromClient.Count > 0)
            {
                //PatientDbContext patientContext = new PatientDbContext(connString);
                List<LabTestModel> allLabTests = _labDbContext.LabTests.ToList();
                int patId = labReqListFromClient[0].PatientId;
                //get patient as querystring from client side rather than searching it from request's list.
                PatientModel currPatient = _labDbContext.Patients.Where(p => p.PatientId == patId)
                    .FirstOrDefault<PatientModel>();

                if (currPatient != null)
                {

                    labReqListFromClient.ForEach(req =>
                    {
                        req.ResultingVendorId = defaultVendor.LabVendorId;
                        LabTestModel labTestdb = allLabTests.Where(a => a.LabTestId == req.LabTestId).FirstOrDefault<LabTestModel>();
                        //get PatientId from clientSide
                        if (labTestdb.IsValidForReporting == true)
                        {
                            req.CreatedOn = req.OrderDateTime = System.DateTime.Now;
                            req.ReportTemplateId = labTestdb.ReportTemplateId;
                            req.LabTestSpecimen = null;
                            req.LabTestSpecimenSource = null;
                            req.LabTestName = labTestdb.LabTestName;
                            req.RunNumberType = labTestdb.RunNumberType;
                            //req.OrderStatus = "active";
                            req.LOINC = "LOINC Code";
                            req.BillCancelledBy = null;
                            req.BillCancelledOn = null;
                            if (req.PrescriberId != null && req.PrescriberId != 0)
                            {
                                var emp = _labDbContext.Employee.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                                req.PrescriberName = emp.FullName;
                            }

                            //req.PatientVisitId = visitId;//assign above visitid to this requisition.
                            if (String.IsNullOrEmpty(currPatient.MiddleName))
                                req.PatientName = currPatient.FirstName + " " + currPatient.LastName;
                            else
                                req.PatientName = currPatient.FirstName + " " + currPatient.MiddleName + " " + currPatient.LastName;

                            req.OrderDateTime = DateTime.Now;
                            _labDbContext.Requisitions.Add(req);
                            _labDbContext.SaveChanges();
                        }
                    });
                }

                return labReqListFromClient;
            }
            else
            {
                throw new Exception("Invalid input request.");
            }
        }

        private object LabReportAdd(RbacUser currentUser, string ipStr)
        {
            var requiredParam = (from param in _labDbContext.AdminParameters
                                 where (param.ParameterName == "CovidTestName" || param.ParameterName == "EnableCovidReportPDFUploadToGoogle" || param.ParameterName == "AllowLabReportToPrintOnProvisional")
                                 && (param.ParameterGroupName.ToLower() == "common" || param.ParameterGroupName.ToLower() == "lab")
                                 select param).ToList();

            string covidParameter = (from param in requiredParam
                                     where param.ParameterName == "CovidTestName"
                                     && param.ParameterGroupName.ToLower() == "common"
                                     select param.ParameterValue).FirstOrDefault();

            string covidReportUploadEnabled = (from param in requiredParam
                                               where param.ParameterName == "EnableCovidReportPDFUploadToGoogle"
                                               && param.ParameterGroupName.ToLower() == "lab"
                                               select param.ParameterValue).FirstOrDefault();

            string covidTestName = "";
            if (covidParameter != null)
            {
                var data = (JObject)JsonConvert.DeserializeObject(covidParameter);
                covidTestName = data["DisplayName"].Value<string>();
            }

            using (TransactionScope trans = new TransactionScope())
            {
                try
                {
                    LabReportModel labReport = DanpheJSONConvert.DeserializeObject<LabReportModel>(ipStr);


                    var VerificationEnabled = labReport.VerificationEnabled;
                    labReport.ReportingDate = DateTime.Now;
                    labReport.CreatedBy = currentUser.EmployeeId;
                    labReport.CreatedOn = labReport.ReportingDate;

                    List<Int64> reqIdList = new List<Int64>();
                    bool IsValidToPrint = true;


                    _labDbContext.LabReports.Add(labReport);

                    _labDbContext.SaveChanges();

                    string allReqIdListStr = "";

                    if (labReport.LabReportId != 0)
                    {
                        foreach (var componentId in labReport.ComponentIdList)
                        {
                            LabTestComponentResult component = _labDbContext.LabTestComponentResults.Where(cmp => cmp.TestComponentResultId == componentId).FirstOrDefault();
                            reqIdList.Add(component.RequisitionId);
                            component.LabReportId = labReport.LabReportId;
                            _labDbContext.Entry(component).Property(a => a.LabReportId).IsModified = true;
                        }
                        _labDbContext.SaveChanges();

                        var reqIdToUpdate = reqIdList.Distinct().ToList();

                        var parameterData = (from parameter in requiredParam
                                             where parameter.ParameterGroupName.ToLower() == "lab"
                                             && parameter.ParameterName == "AllowLabReportToPrintOnProvisional"
                                             select parameter.ParameterValue).FirstOrDefault();

                        foreach (var reqId in reqIdToUpdate)
                        {
                            allReqIdListStr = allReqIdListStr + reqId + ",";
                            LabRequisitionModel requisitionItem = _labDbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault();
                            if (VerificationEnabled != true)
                            {
                                requisitionItem.OrderStatus = ENUM_LabOrderStatus.ReportGenerated;// "report-generated";
                            }
                            requisitionItem.LabReportId = labReport.LabReportId;

                            //for covidtest create empty report in google drive
                            if (requisitionItem.LabTestName == covidTestName)
                            {
                                if ((covidReportUploadEnabled != null) && (covidReportUploadEnabled == "true" || covidReportUploadEnabled == "1"))
                                {
                                    var fileName = "LabCovidReports_" + requisitionItem.RequisitionId + "_" + DateTime.Now.ToString("yyyyMMdd-HHMMss") + ".pdf";
                                    var retData = GoogleDriveFileUpload.UploadNewFile(fileName);
                                    if (!string.IsNullOrEmpty(retData.FileId))
                                    {
                                        requisitionItem.CovidFileName = fileName;
                                        requisitionItem.GoogleFileIdForCovid = retData.FileId;
                                        labReport.CovidFileUrl = CovidReportUrlComonPath.Replace("GGLFILEUPLOADID", retData.FileId);
                                    }
                                }
                            }

                            //give provisional billing for outpatiient to print
                            if (parameterData != null && (parameterData.ToLower() == "true" || parameterData == "1"))
                            {
                                if (requisitionItem.BillingStatus.ToLower() == ENUM_BillingStatus.provisional) // "provisional")
                                {
                                    IsValidToPrint = true;
                                }

                            }
                            else
                            {
                                if ((requisitionItem.VisitType.ToLower() == ENUM_VisitType.outpatient // "outpatient" 
                                    || requisitionItem.VisitType.ToLower() == ENUM_VisitType.emergency) // "emergency") 
                                    && requisitionItem.BillingStatus.ToLower() == ENUM_BillingStatus.provisional) // "provisional")
                                {
                                    IsValidToPrint = false;
                                }
                            }

                            if (requisitionItem.RunNumberType.ToLower() == ENUM_LabRunNumType.histo // "histo" 
                                || requisitionItem.RunNumberType.ToLower() == ENUM_LabRunNumType.cyto) // "cyto")
                            {
                                LabReportModel report = _labDbContext.LabReports.Where(rep => rep.LabReportId == labReport.LabReportId).FirstOrDefault();
                                report.ReceivingDate = requisitionItem.OrderDateTime;
                                labReport.ReceivingDate = report.ReceivingDate;
                            }
                        }
                        _labDbContext.SaveChanges();



                        //if (docPatPortalSync)
                        //{
                        //    DocPatPortalBL.PostLabFinalReport(labReport, labDbContext);
                        //}
                    }

                    allReqIdListStr = allReqIdListStr.Substring(0, (allReqIdListStr.Length - 1));

                    //List<SqlParameter> paramList = new List<SqlParameter>(){
                    //                        new SqlParameter("@allReqIds", allReqIdListStr),
                    //                        new SqlParameter("@status", ENUM_BillingOrderStatus.Final)
                    //                    };
                    //DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate", paramList, labDbContext);
                    trans.Complete();

                    labReport.ValidToPrint = IsValidToPrint;

                    return  labReport;
                }
                catch (Exception ex)
                {
                    throw (ex);
                }
            }
        }

        private object PostSMS(string ipStr, RbacUser currentUser)
        {
            try
            {

                var reqIdlist = ipStr;
                var selectedId = Convert.ToInt64(ipStr);

                var patientData = GetSmsMessageAndNumberOfPatientByReqId(_labDbContext, selectedId);
                if (patientData != null)
                {
                    var payLoad = HttpUtility.UrlEncode(patientData.Message);

                    var smsParamList = _labDbContext.AdminParameters.Where(p => (p.ParameterGroupName.ToLower() == "lab") && ((p.ParameterName == "SmsParameter") || (p.ParameterName == "LabSmsProviderName"))).Select(d => new { d.ParameterValue, d.ParameterName }).ToList();
                    var providerName = smsParamList.Where(s => s.ParameterName == "LabSmsProviderName").Select(d => d.ParameterValue).FirstOrDefault() ?? "Sparrow";
                    var smsParam = smsParamList.Where(s => s.ParameterName == "SmsParameter").Select(d => d.ParameterValue).FirstOrDefault() ?? "[]";
                    var smsParamObj = JsonConvert.DeserializeObject<List<dynamic>>(smsParam);

                    var selectedProviderDetail = smsParamObj.Where(p => p["SmsProvider"] == providerName).FirstOrDefault();
                    if (selectedProviderDetail != null)
                    {
                        string key = selectedProviderDetail["Token"];

                        if (providerName == "LumbiniTech")
                        {
                            string url = selectedProviderDetail["Url"];
                            url = url.Replace("SMSKEY", key);
                            url = url.Replace("SMSPHONENUMBER", patientData.PhoneNumber);
                            url = url.Replace("SMSMESSAGE", payLoad);

                            var request = (HttpWebRequest)WebRequest.Create(url);
                            request.ContentType = "application/json";
                            request.Method = "GET";
                            var httpResponse = (HttpWebResponse)request.GetResponse();
                            using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                            {
                                var responseMsg = streamReader.ReadToEnd(); // error message or success message catched here

                                if (httpResponse.StatusCode == HttpStatusCode.OK)
                                {
                                    LabSMSModel data = new LabSMSModel();
                                    data.RequisitionId = Convert.ToInt32(selectedId);
                                    data.Message = payLoad;
                                    data.CreatedOn = System.DateTime.Now;
                                    data.CreatedBy = currentUser.EmployeeId;

                                    _labDbContext.LabSms.Add(data);
                                    _labDbContext.SaveChanges();

                                    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@RequistionIds", reqIdlist) };
                                    DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_Update_Test_SmsStatus", paramList, _labDbContext);
                                    _labDbContext.SaveChanges();

                                }
                                else
                                {
                                    throw new Exception("Unable to send SMS.");
                                }
                            }


                            //lumbinitech implementation

                        }
                        else if (providerName == "Sparrow")
                        {
                            //sparrow implementation
                        }
                    }
                    else
                    {
                        throw new Exception("SMS Provider is not avaliable.");
                    }

                }
                else
                {
                    throw new Exception("No Patient Selected.");
                }
                return Ok("SMS successfully send.");
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        private object UploadCovidReportToGoogleDrive(string PostStr, RbacUser currentUser)
        {
            var folderPath = CovidReportFileUploadPath;
            byte[] data = Convert.FromBase64String(PostStr);
            long reqId = 0;
            var reqIdStr = this.ReadQueryStringData("requisitionId");
            reqId = Convert.ToInt64(reqIdStr);
            try
            {
                if (folderPath != null)
                {
                    if (!System.IO.Directory.Exists(folderPath))
                    {
                        System.IO.Directory.CreateDirectory(folderPath);
                    }

                    var currReq = _labDbContext.Requisitions.Where(r => r.RequisitionId == reqId).FirstOrDefault();
                    if (currReq != null)
                    {
                        // var retData = GoogleDriveFileUpload.UploadNewFile(fileName);
                        Boolean isSuccess = false;
                        var fileName = "LabCovidReports_" + currReq.RequisitionId + "_" + DateTime.Now.ToString("yyyyMMdd-HHMMss") + ".pdf";
                        if (!string.IsNullOrWhiteSpace(currReq.GoogleFileIdForCovid))
                        {
                            //if (!System.IO.File.Exists(folderPath + '\\' + currReq.CovidFileName)){}
                            System.IO.File.WriteAllBytes(folderPath + '\\' + currReq.CovidFileName, data);
                            var retData = GoogleDriveFileUpload.UpdateFileById(currReq.GoogleFileIdForCovid, currReq.CovidFileName, newMimeType: "application/pdf");
                            isSuccess = true;
                        }
                        else
                        {
                            System.IO.File.WriteAllBytes(folderPath + '\\' + fileName, data);
                            var retData = GoogleDriveFileUpload.UploadNewFile(fileName);
                            currReq.GoogleFileIdForCovid = retData.FileId;
                            currReq.CovidFileName = fileName;
                            _labDbContext.SaveChanges();
                            var retDataNew = GoogleDriveFileUpload.UpdateFileById(retData.FileId, fileName, newMimeType: "application/pdf");
                            isSuccess = true;
                        }

                        if (isSuccess)
                        {
                            currReq.IsFileUploaded = true;
                            currReq.UploadedBy = currentUser.EmployeeId;
                            currReq.UploadedOn = System.DateTime.Now;
                            _labDbContext.Entry(currReq).Property(a => a.IsFileUploaded).IsModified = true;
                            _labDbContext.Entry(currReq).Property(a => a.UploadedBy).IsModified = true;
                            _labDbContext.Entry(currReq).Property(a => a.UploadedOn).IsModified = true;
                            _labDbContext.SaveChanges();
                        }

                    }
                    else
                    {
                        throw new Exception("Cannot find the test");
                    }

                }
                return 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object GenerateSampleCodeAutomatic(string str, RbacUser currentUser,string labType)
        {
            //string str = this.ReadPostData();
            List<PatientLabSampleVM> labTests = DanpheJSONConvert.DeserializeObject<List<PatientLabSampleVM>>(str);//this will come from client side--after parsing.
            if (IsValidForSampleCollection(labTests, _labDbContext))
            {
                //sample code for All Tests in Current Requests will be same.
                if (labTests != null)
                {
                    try
                    {
                        var singleReq = labTests[0];
                        var currDate = System.DateTime.Now;
                        var hasIns = singleReq.HasInsurance.HasValue ? singleReq.HasInsurance.Value : false;
                        int patId = singleReq.PatientId;
                        if ((patId == 0) || (patId < 0)) { throw new Exception("Patient not selected properly."); }
                        var sampleDetail = this.GenerateLabSampleCode(_labDbContext, singleReq.RunNumberType.ToLower(), singleReq.VisitType.ToLower(), patId, currDate, labType, hasIns);

                        var latestSample = new
                        {
                            SampleCode = sampleDetail.SampleCode,
                            SampleNumber = sampleDetail.SampleNumber,
                            BarCodeNumber = sampleDetail.BarCodeNumber,
                            SampleLetter = sampleDetail.SampleLetter,
                            ExistingBarCodeNumbersOfPatient = sampleDetail.ExistingBarCodeNumbersOfPatient
                        };

                        foreach (var item in labTests)
                        {
                            item.SampleCode = sampleDetail.SampleNumber;
                            item.BarCodeNumber = sampleDetail.BarCodeNumber;
                            item.SampleCreatedOn = currDate;
                        }
                        if (sampleDetail.SampleNumber.HasValue && (sampleDetail.SampleNumber > 0))
                        {
                            var data = UpdateSampleCode(_labDbContext, labTests, currentUser,labType);
                            return new
                            {
                                LatestSampleData = latestSample,
                                FormattedSampleCode = data.FormattedSampleCode,
                                BarCodeNumber = data.BarCodeNumber,
                                SampleCollectedOnDateTime = data.SampleCollectedOnDateTime
                            };
                        }
                        else
                        {
                            throw new Exception("Cannot update sample code now. Please try again later.");
                        }

                    }
                    catch (Exception ex)
                    {
                        throw (ex);
                    }
                }
                else
                {
                    return null;
                }
            }
            else
            {
                throw new Exception("Sample for some requisitons is already collected.");
            }
        }

        private object LabStickerSave(string ipStr, RbacUser currentUser,string PrinterName, int noOfPrints, string FolderPath)
        {
            //ipDataString is input (HTML string)
            if (ipStr.Length > 0)
            {

                ///api/Billing?reqType=saveLabSticker&PrinterName=sticker1809003399&FilePath=C:\DanpheHealthInc_PvtLtd_Files\Print\
                //Read html
                //string FileName = this.ReadQueryStringData("fileName");

                var parameter = (from param in _labDbContext.AdminParameters
                                 where param.ParameterGroupName.ToLower() == "lab" &&
                                 param.ParameterName == "LabStickerSettings"
                                 select param.ParameterValue).FirstOrDefault();

                List<LabStickerParam> paramArray = new List<LabStickerParam>();

                if (parameter != null)
                {
                    paramArray = DanpheJSONConvert.DeserializeObject<List<LabStickerParam>>(parameter);
                }

                //string FolderPath = this.ReadQueryStringData("filePath");

                if (noOfPrints == 0)
                {
                    noOfPrints = 1;
                }

                for (int i = 0; i < noOfPrints; i++)
                {
                    //index:i, taken in filename 
                    var fileFullName = "Lab" + "_user_" + currentUser.EmployeeId + "_" + (i + 1) + ".html";
                    byte[] htmlbytearray = System.Text.Encoding.ASCII.GetBytes(ipStr);
                    //saving file to default folder, html file need to be delete after print is called.
                    System.IO.File.WriteAllBytes(@FolderPath + fileFullName, htmlbytearray);

                }
                return 1;
            }
            else
            {
                throw new Exception("0");
            }
        }

        private object SendLabReportEmailToPatient(string str, RbacUser currentUser)
        {
            LabEmailModel EmailModel = JsonConvert.DeserializeObject<LabEmailModel>(str);
            var apiKey = (from param in _masterDbContext.CFGParameters
                          where param.ParameterGroupName.ToLower() == "common" && param.ParameterName == "APIKeyOfEmailSendGrid"
                          select param.ParameterValue
                          ).FirstOrDefault();

            if (!EmailModel.SendPdf)
            {
                EmailModel.PdfBase64 = null;
                EmailModel.AttachmentFileName = null;
            }

            if (!EmailModel.SendHtml)
            {
                EmailModel.PlainContent = "";
            }

            Task<string> response = _emailService.SendEmail(EmailModel.SenderEmailAddress, EmailModel.EmailList,
                EmailModel.SenderTitle, EmailModel.Subject, EmailModel.PlainContent,
                EmailModel.HtmlContent, EmailModel.PdfBase64, EmailModel.AttachmentFileName,
                EmailModel.ImageAttachments, apiKey);

            response.Wait();

            if (response.Result == "OK")
            {
                EmailSendDetailModel sendEmail = new EmailSendDetailModel();
                foreach (var eml in EmailModel.EmailList)
                {
                    sendEmail.SendBy = currentUser.EmployeeId;
                    sendEmail.SendOn = System.DateTime.Now;
                    sendEmail.SendToEmail = eml;
                    sendEmail.EmailSubject = EmailModel.Subject;
                    _masterDbContext.SendEmailDetails.Add(sendEmail);
                    _masterDbContext.SaveChanges();
                }

                return Ok("OK");

            }
            else
            {
                throw new Exception("Failed");
            }

        }

        private object UpdateSampleCodeOfRequisition(string str, DateTime? SampleDate, string runNumberType, string patVisitType, int? RunNumber,RbacUser currentUser, string labType)
        {
            List<Int64> reqIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(str);
            Int64? existingBarCodeNum = null;

            List<LabRunNumberSettingsModel> allLabRunNumSettings = (List<LabRunNumberSettingsModel>)DanpheCache.GetMasterData(MasterDataEnum.LabRunNumberSettings);
            LabRequisitionModel requisition = new LabRequisitionModel();
            Int64 lastBarCodeNum = (from bar in _labDbContext.LabBarCode
                                    select bar.BarCodeNumber).DefaultIfEmpty(0).Max();
            //if barcode number is not found then start from 1million (10 lakhs)
            Int64 newBarCodeNumber = lastBarCodeNum != 0 ? lastBarCodeNum + 1 : 1000000;

            string visitType = null;
            string RunNumberType = null;
            Int64? LabBarCodeNum = null;
            long singleReqId = reqIdList[0];
            var singleReq = _labDbContext.Requisitions.Where(a => a.RequisitionId == singleReqId).Select(s => new { s.HasInsurance, s.PatientId }).FirstOrDefault();
            bool underInsurance = singleReq.HasInsurance;

            //Get the GroupingIndex From visitType and Run Number Type
            var currentSetting = (from runNumSetting in allLabRunNumSettings
                                  where runNumSetting.VisitType.ToLower() == patVisitType.ToLower()
                                  && runNumSetting.RunNumberType.ToLower() == runNumberType.ToLower()
                                  && runNumSetting.UnderInsurance == underInsurance
                                  select runNumSetting
                                 ).FirstOrDefault();

            //get the requisition with same Run number
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@SampleDate", SampleDate),
                        new SqlParameter("@SampleCode", RunNumber),
                        new SqlParameter("@PatientId", singleReq.PatientId),
                        new SqlParameter("@GroupingIndex", currentSetting.RunNumberGroupingIndex)};
            DataSet dts = DALFunctions.GetDatasetFromStoredProc("SP_LAB_GetPatientExistingRequisition_With_SameRunNumber", paramList, _labDbContext);

            List<LabRequisitionModel> esistingReqOfPat = new List<LabRequisitionModel>();

            if (dts.Tables.Count > 0)
            {
                var strPatExistingReq = JsonConvert.SerializeObject(dts.Tables[0]);
                esistingReqOfPat = DanpheJSONConvert.DeserializeObject<List<LabRequisitionModel>>(strPatExistingReq);
                requisition = (esistingReqOfPat.Count > 0) ? esistingReqOfPat[0] : null;
            }
            else
            {
                requisition = null;
            }

            if (requisition != null)
            {
                existingBarCodeNum = requisition.BarCodeNumber;
                LabBarCodeModel newBarCode = _labDbContext.LabBarCode
                                                    .Where(c => c.BarCodeNumber == existingBarCodeNum)
                                                    .FirstOrDefault<LabBarCodeModel>();
                newBarCode.IsActive = true;

                _labDbContext.Entry(newBarCode).Property(a => a.IsActive).IsModified = true;

                _labDbContext.SaveChanges();

                SampleDate = requisition.SampleCreatedOn;
            }
            else
            {
                if (existingBarCodeNum == null)
                {
                    LabBarCodeModel barCode = new LabBarCodeModel();
                    barCode.BarCodeNumber = newBarCodeNumber;
                    barCode.IsActive = true;
                    barCode.CreatedBy = currentUser.EmployeeId;
                    barCode.CreatedOn = System.DateTime.Now;
                    _labDbContext.LabBarCode.Add(barCode);
                    _labDbContext.SaveChanges();
                }

            }


            foreach (var reqId in reqIdList)
            {
                LabRequisitionModel dbRequisition = _labDbContext.Requisitions
                                                .Where(a => a.RequisitionId == reqId)
                                                .FirstOrDefault<LabRequisitionModel>();


                if (dbRequisition != null)
                {
                    List<LabRequisitionModel> allReqWithCurrBarcode = _labDbContext.Requisitions
                                                                        .Where(r => r.BarCodeNumber == dbRequisition.BarCodeNumber)
                                                                        .ToList();


                    if (allReqWithCurrBarcode.Count == reqIdList.Count)
                    {
                        LabBarCodeModel oldBarCode = _labDbContext.LabBarCode
                                                    .Where(c => c.BarCodeNumber == dbRequisition.BarCodeNumber)
                                                    .FirstOrDefault<LabBarCodeModel>();
                        oldBarCode.IsActive = false;
                        oldBarCode.ModifiedBy = currentUser.EmployeeId;
                        oldBarCode.ModifiedOn = System.DateTime.Now;
                        _labDbContext.Entry(oldBarCode).Property(a => a.ModifiedBy).IsModified = true;
                        _labDbContext.Entry(oldBarCode).Property(a => a.ModifiedOn).IsModified = true;
                        _labDbContext.Entry(oldBarCode).Property(a => a.IsActive).IsModified = true;
                    }

                    dbRequisition.SampleCode = RunNumber;
                    dbRequisition.SampleCodeFormatted = GetSampleCodeFormatted(RunNumber, SampleDate.Value, patVisitType, runNumberType,labType);
                    dbRequisition.SampleCreatedOn = SampleDate;
                    dbRequisition.SampleCollectedOnDateTime = System.DateTime.Now;
                    dbRequisition.SampleCreatedBy = currentUser.EmployeeId;
                    dbRequisition.ModifiedBy = currentUser.EmployeeId;
                    dbRequisition.ModifiedOn = System.DateTime.Now;
                    dbRequisition.BarCodeNumber = existingBarCodeNum != null ? existingBarCodeNum : newBarCodeNumber;
                    visitType = dbRequisition.VisitType;
                    RunNumberType = dbRequisition.RunNumberType;
                    LabBarCodeNum = existingBarCodeNum != null ? existingBarCodeNum : newBarCodeNumber;
                }

                _labDbContext.Entry(dbRequisition).Property(a => a.ModifiedBy).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.ModifiedOn).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.SampleCode).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.SampleCodeFormatted).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.SampleCreatedBy).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.SampleCreatedOn).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.SampleCollectedOnDateTime).IsModified = true;
                _labDbContext.Entry(dbRequisition).Property(a => a.BarCodeNumber).IsModified = true;
            }


            _labDbContext.SaveChanges();
            string formattedSampleCode = GetSampleCodeFormatted(RunNumber, SampleDate ?? default(DateTime), visitType, RunNumberType, labType);
            return new { FormattedSampleCode = formattedSampleCode, BarCodeNumber = LabBarCodeNum };
        }

        private object UpdateBillStatus(string str, string billstatus, RbacUser currentUser)
        {
            BillingDbContext billDbContext = new BillingDbContext(connString);
            List<int> reqIds = DanpheJSONConvert.DeserializeObject<List<int>>(str);
            foreach (var reqId in reqIds)
            {
                LabRequisitionModel dbrequisition = _labDbContext.Requisitions
                                                .Where(a => a.RequisitionId == reqId)
                                                .FirstOrDefault<LabRequisitionModel>();

                //VisitType could be changed in case of copy from earlier invoice.
                BillingTransactionItemModel billTxnItem = (from item in billDbContext.BillingTransactionItems
                                                           join srvDept in billDbContext.ServiceDepartment on item.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                                                           where srvDept.IntegrationName.ToLower() == "lab" && item.RequisitionId == reqId
                                                           select item).OrderByDescending(a => a.BillingTransactionItemId).FirstOrDefault();
                if (billTxnItem != null)
                {
                    dbrequisition.VisitType = billTxnItem.VisitType;
                }

                dbrequisition.BillingStatus = billstatus;
                dbrequisition.ModifiedBy = currentUser.EmployeeId;
                dbrequisition.ModifiedOn = DateTime.Now;
                _labDbContext.Entry(dbrequisition).Property(a => a.BillingStatus).IsModified = true;
                _labDbContext.Entry(dbrequisition).Property(a => a.VisitType).IsModified = true;
                _labDbContext.Entry(dbrequisition).Property(a => a.ModifiedBy).IsModified = true;
                _labDbContext.Entry(dbrequisition).Property(a => a.ModifiedOn).IsModified = true;
                //labDbContext.Entry(dbrequisition).State = EntityState.Modified;
            }
            _labDbContext.SaveChanges();
            return  Ok("lab Billing Status  updated successfully.");
        }

        private object EditLabTestResult(string specimenDataModel, string str, RbacUser currentUser)
        {
            //string specimenDataModel = this.ReadQueryStringData("specimenData");
            List<LabTestComponentResult> labtestsresults = DanpheJSONConvert.
                DeserializeObject<List<LabTestComponentResult>>(str);
            List<LabTestSpecimenModel> labSpecimenList = DanpheJSONConvert.DeserializeObject<List<LabTestSpecimenModel>>(specimenDataModel);
            if (labtestsresults != null && labtestsresults.Count > 0)
            {

                var useNewMethod = true;//sud: use earlier method if this doesn't work correctly


                if (useNewMethod)
                {
                    EditComponentsResults(_labDbContext, labtestsresults, currentUser);

                    //Update specimen of culture test
                    if (labSpecimenList != null && labSpecimenList.Count > 0)
                    {
                        int ln = labSpecimenList.Count;
                        for (int i = 0; i < ln; i++)
                        {
                            int? requisitId = labSpecimenList[i].RequisitionId;
                            string specimen = labSpecimenList[i].Specimen;
                            if (requisitId != null && requisitId > 0)
                            {
                                LabRequisitionModel labReq = _labDbContext.Requisitions.Where(val => val.RequisitionId == requisitId).FirstOrDefault<LabRequisitionModel>();
                                labReq.LabTestSpecimen = specimen;
                                _labDbContext.SaveChanges();
                            }
                        }
                    }
                    return new List<LabTestComponentResult>();
                }
                else
                {
                    List<LabTestComponentResult> compsToUpdate = labtestsresults.Where(comp => comp.TestComponentResultId != 0).ToList();
                    List<LabTestComponentResult> compsToInsert = labtestsresults.Where(comp => comp.TestComponentResultId == 0).ToList();

                    var reportId = compsToInsert[0].LabReportId;

                    foreach (var labtestres in compsToUpdate)
                    {
                        LabTestComponentResult TestComp = _labDbContext.LabTestComponentResults
                                             .Where(a => a.TestComponentResultId == labtestres.TestComponentResultId)
                                              .FirstOrDefault<LabTestComponentResult>();


                        TestComp.LabReportId = reportId;
                        TestComp.Value = labtestres.Value;
                        TestComp.Remarks = labtestres.Remarks;
                        TestComp.IsAbnormal = labtestres.IsAbnormal;
                        TestComp.AbnormalType = labtestres.AbnormalType;
                        TestComp.ModifiedOn = DateTime.Now;
                        TestComp.ModifiedBy = currentUser.EmployeeId;
                        _labDbContext.Entry(TestComp).Property(a => a.LabReportId).IsModified = true;
                        _labDbContext.Entry(TestComp).Property(a => a.Value).IsModified = true;
                        _labDbContext.Entry(TestComp).Property(a => a.IsAbnormal).IsModified = true;
                        _labDbContext.Entry(TestComp).Property(a => a.AbnormalType).IsModified = true;
                        _labDbContext.Entry(TestComp).Property(a => a.ModifiedOn).IsModified = true;
                        _labDbContext.Entry(TestComp).Property(a => a.ModifiedBy).IsModified = true;


                        //labDbContext.Entry(TestComp).State = EntityState.Modified;
                    }
                    _labDbContext.SaveChanges();

                    //Add Extra added Components from FrontEnd Side
                    compsToInsert.ForEach(cmp =>
                    {
                        cmp.CreatedOn = DateTime.Now;
                        cmp.CreatedBy = currentUser.EmployeeId;
                        cmp.IsActive = true;
                        _labDbContext.LabTestComponentResults.Add(cmp);

                        labtestsresults.Add(cmp);
                    });

                    _labDbContext.SaveChanges();
                    return new List<LabTestComponentResult>();
                }
            }
            else
            {
                throw new Exception("Empty Component Sets");
            }

        }

        private object UpdatePrintedFlag(string labReqIdList, int? PrintedReportId, RbacUser currentUser)
        {
            List<Int64> requisitionIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(labReqIdList);
            int? repId = PrintedReportId;

            List<int> reportIdList = new List<int>();

            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    LabReportModel returnReport = new LabReportModel();
                    foreach (int req in requisitionIdList)
                    {
                        LabRequisitionModel labReq = _labDbContext.Requisitions
                                             .Where(a => a.RequisitionId == req)
                                              .FirstOrDefault<LabRequisitionModel>();

                        _labDbContext.Requisitions.Attach(labReq);
                        _labDbContext.Entry(labReq).Property(a => a.PrintCount).IsModified = true;
                        _labDbContext.Entry(labReq).Property(a => a.PrintedBy).IsModified = true;
                        if (labReq.PrintCount == null || labReq.PrintCount == 0)
                        {
                            labReq.PrintCount = 1;
                        }
                        else { labReq.PrintCount = labReq.PrintCount + 1; }
                        labReq.PrintedBy = currentUser.EmployeeId;

                        if (labReq.LabReportId.HasValue)
                        {
                            if (!reportIdList.Contains(labReq.LabReportId.Value))
                            {
                                reportIdList.Add(labReq.LabReportId.Value);
                            }
                        }

                        _labDbContext.SaveChanges();
                    }


                    if (reportIdList != null && reportIdList.Count > 0)
                    {
                        foreach (var repIdSelected in reportIdList)
                        {
                            LabReportModel report = _labDbContext.LabReports.Where(val => val.LabReportId == repIdSelected).FirstOrDefault<LabReportModel>();
                            _labDbContext.LabReports.Attach(report);

                            _labDbContext.Entry(report).Property(a => a.IsPrinted).IsModified = true;
                            _labDbContext.Entry(report).Property(a => a.PrintedOn).IsModified = true;
                            _labDbContext.Entry(report).Property(a => a.PrintedBy).IsModified = true;
                            _labDbContext.Entry(report).Property(a => a.PrintCount).IsModified = true;

                            if (report.PrintCount == null)
                            {
                                report.PrintCount = 0;
                            }

                            report.IsPrinted = true;
                            report.PrintedOn = System.DateTime.Now;
                            report.PrintedBy = currentUser.EmployeeId;
                            report.PrintCount = report.PrintCount + 1;

                            _labDbContext.SaveChanges();
                            returnReport = report;
                        }
                        dbContextTransaction.Commit();
                    }
                    else
                    {
                        throw new Exception("Cannot find the report");
                    }

                    return returnReport;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }

        }

        private object UpdateDoctor(string str, int prescriberId, RbacUser currentUser)
        {
            //update doctor name for here.. 
            List<Int32> reqList = DanpheJSONConvert.DeserializeObject<List<Int32>>(str);

            int prescriberDocId = prescriberId;
            string prescriberDoctorName = (from emp in _labDbContext.Employee
                                           where emp.EmployeeId == prescriberDocId
                                           select emp.FullName
                                           ).FirstOrDefault<string>();

            foreach (int req in reqList)
            {
                LabRequisitionModel labReq = _labDbContext.Requisitions
                                     .Where(a => a.RequisitionId == req)
                                      .FirstOrDefault<LabRequisitionModel>();

                BillingTransactionItemModel billItm = _labDbContext.BillingTransactionItems
                                                      .Where(a => a.BillingTransactionItemId == labReq.BillingTransactionItemId)
                                                      .FirstOrDefault();

                //labDbContext.Requisitions.Attach(labReq);
                labReq.PrescriberName = prescriberDoctorName;
                labReq.PrescriberId = prescriberDocId;
                labReq.ModifiedBy = currentUser.EmployeeId;
                labReq.ModifiedOn = DateTime.Now;

                _labDbContext.Entry(labReq).Property(a => a.PrescriberId).IsModified = true;
                _labDbContext.Entry(labReq).Property(a => a.PrescriberName).IsModified = true;
                _labDbContext.Entry(labReq).Property(a => a.ModifiedOn).IsModified = true;
                _labDbContext.Entry(labReq).Property(a => a.ModifiedBy).IsModified = true;


                billItm.PrescriberId = prescriberDocId;
                billItm.ModifiedBy = currentUser.EmployeeId;
                billItm.ModifiedOn = DateTime.Now;
                _labDbContext.Entry(billItm).Property(a => a.PrescriberId).IsModified = true;
                _labDbContext.Entry(billItm).Property(a => a.ModifiedBy).IsModified = true;
                _labDbContext.Entry(billItm).Property(a => a.ModifiedOn).IsModified = true;



                _labDbContext.SaveChanges();
            }

            return Ok("OK");
        }

        private object UpdateTestWithSamePrice(int reqId, string str)
        {
            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    //int reqId = Convert.ToInt32(this.ReadQueryStringData("requisitionid"));
                    //var ChangedLabTest = JsonConvert.DeserializeAnonymousType(str, BillItemVM);
                    LabTestTransactionItemVM ChangedLabTest = DanpheJSONConvert.DeserializeObject<LabTestTransactionItemVM>(str);

                    var labServiceDeptList = (from dpt in _labDbContext.Department
                                              join serviceDept in _labDbContext.ServiceDepartment on dpt.DepartmentId equals serviceDept.DepartmentId
                                              where dpt.DepartmentName.ToLower() == "lab"
                                              select serviceDept.ServiceDepartmentId).ToList();

                    BillingTransactionItemModel itemTransaction = (from billItem in _labDbContext.BillingTransactionItems
                                                                   where billItem.RequisitionId == reqId && labServiceDeptList.Contains(billItem.ServiceDepartmentId)
                                                                   select billItem).FirstOrDefault<BillingTransactionItemModel>();

                    _labDbContext.BillingTransactionItems.Attach(itemTransaction);
                    _labDbContext.Entry(itemTransaction).Property(a => a.ItemId).IsModified = true;
                    _labDbContext.Entry(itemTransaction).Property(a => a.ItemName).IsModified = true;
                    _labDbContext.Entry(itemTransaction).Property(a => a.ServiceDepartmentId).IsModified = true;
                    _labDbContext.Entry(itemTransaction).Property(a => a.ServiceDepartmentName).IsModified = true;

                    itemTransaction.ItemId = ChangedLabTest.ItemId;
                    itemTransaction.ItemName = ChangedLabTest.ItemName;
                    itemTransaction.ServiceDepartmentId = ChangedLabTest.ServiceDepartmentId;
                    itemTransaction.ServiceDepartmentName = ChangedLabTest.ServiceDepartmentName;

                    _labDbContext.SaveChanges();

                    LabRequisitionModel labReq = _labDbContext.Requisitions
                                                .Where(val => val.RequisitionId == reqId)
                                                .FirstOrDefault<LabRequisitionModel>();

                    LabTestModel labTest = _labDbContext.LabTests.
                                           Where(val => val.LabTestId == ChangedLabTest.ItemId)
                                           .FirstOrDefault<LabTestModel>();

                    LabReportTemplateModel defRptTempModel = _labDbContext.LabReportTemplates.
                                                Where(val => val.IsDefault == true)
                                                .FirstOrDefault();

                    _labDbContext.Requisitions.Attach(labReq);
                    _labDbContext.Entry(labReq).Property(a => a.LabTestId).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.LabTestName).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.ReportTemplateId).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.RunNumberType).IsModified = true;


                    labReq.LabTestName = ChangedLabTest.ItemName;
                    labReq.LabTestId = ChangedLabTest.ItemId;
                    labReq.RunNumberType = labTest.RunNumberType;

                    int newRptTempId = 1;//hardcoded value

                    if (defRptTempModel != null)
                    {
                        newRptTempId = defRptTempModel.ReportTemplateID;
                    }
                    labReq.ReportTemplateId = labTest.ReportTemplateId > 0 ? labTest.ReportTemplateId : newRptTempId;

                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return labTest;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }

        private object CancelInpatientLabTest(string str, RbacUser currentUser)
        {
            using (var labDbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    InpatientLabTestModel inpatientLabTest = DanpheJSONConvert.DeserializeObject<InpatientLabTestModel>(str);



                    BillingTransactionItemModel billItem = _labDbContext.BillingTransactionItems
                                                            .Where(itm =>
                                                                    itm.RequisitionId == inpatientLabTest.RequisitionId
                                                                    && itm.ItemId == inpatientLabTest.LabTestId
                                                                    && itm.PatientId == inpatientLabTest.PatientId
                                                                    && itm.PatientVisitId == inpatientLabTest.PatientVisitId
                                                                    && (itm.BillingType.ToLower() == ENUM_BillingType.inpatient
                                                                    || itm.BillingType.ToLower() == ENUM_BillingType.outpatient)// "inpatient", "outpatient" for cancellation from er
                                                                    && itm.BillStatus.ToLower() != ENUM_BillingStatus.paid // "paid"
                                                                    && itm.BillingTransactionItemId == inpatientLabTest.BillingTransactionItemId
                                                                ).FirstOrDefault<BillingTransactionItemModel>();


                    _labDbContext.BillingTransactionItems.Attach(billItem);

                    _labDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                    _labDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                    _labDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                    _labDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

                    billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                    billItem.CancelledBy = currentUser.EmployeeId;
                    billItem.CancelledOn = System.DateTime.Now;
                    billItem.CancelRemarks = inpatientLabTest.CancelRemarks;
                    _labDbContext.SaveChanges();



                    LabRequisitionModel labReq = _labDbContext.Requisitions
                                                    .Where(req => req.RequisitionId == inpatientLabTest.RequisitionId
                                                        && (
                                                        req.VisitType.ToLower() == ENUM_VisitType.inpatient // "inpatient"
                                                        || req.VisitType.ToLower() == ENUM_VisitType.emergency //"emergency"
                                                        )
                                                        && req.BillingStatus.ToLower() != ENUM_BillingStatus.paid // "paid"
                                                    ).FirstOrDefault<LabRequisitionModel>();

                    labReq.BillCancelledBy = currentUser.EmployeeId;
                    labReq.BillCancelledOn = System.DateTime.Now;
                    _labDbContext.Requisitions.Attach(labReq);

                    _labDbContext.Entry(labReq).Property(a => a.BillingStatus).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.BillCancelledBy).IsModified = true;
                    _labDbContext.Entry(labReq).Property(a => a.BillCancelledOn).IsModified = true;
                    labReq.BillingStatus = ENUM_BillingStatus.cancel;// "cancel";
                    _labDbContext.SaveChanges();

                    labDbContextTransaction.Commit();
                    return null;

                }
                catch (Exception ex)
                {
                    labDbContextTransaction.Rollback();
                    throw (ex);
                }
            }
        }

        private object UndoSampleCode(string str, RbacUser currentUser)
        {
            List<Int64> RequisitionIds = (DanpheJSONConvert.DeserializeObject<List<Int64>>(str));

            try
            {
                using (var trans = new TransactionScope())
                {
                    //int newPrintId = printid + 1;
                    DataTable storedProcdureParam = new DataTable();
                    storedProcdureParam.Columns.Add("RequisitionId", typeof(long));
                    storedProcdureParam.Columns.Add("OrderStatus", typeof(string));
                    foreach (Int64 reqId in RequisitionIds)
                    {
                        List<LabRequisitionModel> listTestReq = _labDbContext.Requisitions
                                                 .Where(a => a.RequisitionId == reqId)
                                                 .ToList<LabRequisitionModel>();
                        if (listTestReq != null)
                        {
                            foreach (var reqResult in listTestReq)
                            {
                                reqResult.SampleCode = null;
                                reqResult.SampleCreatedBy = null;
                                reqResult.SampleCreatedOn = null;
                                reqResult.OrderStatus = ENUM_LabOrderStatus.Active; //"active";
                                reqResult.ModifiedBy = currentUser.EmployeeId;
                                reqResult.ModifiedOn = DateTime.Now;
                                reqResult.LabTestSpecimen = null;
                                reqResult.LabTestSpecimenSource = null;
                                reqResult.BarCodeNumber = null;

                                _labDbContext.Entry(reqResult).Property(a => a.SampleCode).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.SampleCreatedBy).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.SampleCreatedOn).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.OrderStatus).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.ModifiedBy).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.ModifiedOn).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.LabTestSpecimen).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.LabTestSpecimenSource).IsModified = true;
                                _labDbContext.Entry(reqResult).Property(a => a.BarCodeNumber).IsModified = true;

                                storedProcdureParam.Rows.Add(reqResult.RequisitionId, reqResult.OrderStatus);
                            }
                        }

                    }
                    _labDbContext.SaveChanges();

                    string reqIdList = string.Join(",", RequisitionIds);
                    List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId_OrderStatus", storedProcdureParam),
                                                };
                    DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate", paramList, _labDbContext);

                    trans.Complete();
                    return RequisitionIds;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object VerifyTestResultWithSignatory(string str, RbacUser currentUser)
        {
            LabReportModel labReport = DanpheJSONConvert.DeserializeObject<LabReportModel>(str);
            var VerificationEnabled = labReport.VerificationEnabled;


            List<Int64> reqIdList = new List<Int64>();

            using (var verifyTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (VerificationEnabled != null && VerificationEnabled == true)
                    {
                        if (labReport.LabReportId != 0)
                        {
                            var report = _labDbContext.LabReports.Where(r => r.LabReportId == labReport.LabReportId).FirstOrDefault();
                            if (report != null)
                            {
                                report.Signatories = labReport.Signatories;
                            }
                            _labDbContext.Entry(report).Property(r => r.Signatories).IsModified = true;
                            _labDbContext.SaveChanges();


                            foreach (var componentId in labReport.ComponentIdList)
                            {
                                LabTestComponentResult component = _labDbContext.LabTestComponentResults.Where(cmp => cmp.TestComponentResultId == componentId).FirstOrDefault();
                                reqIdList.Add(component.RequisitionId);
                            }


                            var reqIdToUpdate = reqIdList.Distinct().ToList();

                            foreach (var reqId in reqIdToUpdate)
                            {
                                LabRequisitionModel requisitionItem = _labDbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault();

                                requisitionItem.OrderStatus = ENUM_LabOrderStatus.ReportGenerated; //"report-generated";
                                requisitionItem.VerifiedBy = currentUser.EmployeeId;
                                requisitionItem.VerifiedOn = DateTime.Now;
                                requisitionItem.IsVerified = true;

                                _labDbContext.Entry(requisitionItem).Property(a => a.OrderStatus).IsModified = true;
                                _labDbContext.Entry(requisitionItem).Property(a => a.VerifiedBy).IsModified = true;
                                _labDbContext.Entry(requisitionItem).Property(a => a.VerifiedOn).IsModified = true;
                                _labDbContext.Entry(requisitionItem).Property(a => a.IsVerified).IsModified = true;
                                _labDbContext.SaveChanges();
                            }
                            verifyTransaction.Commit();
                        }
                    }
                }
                catch (Exception ex)
                {
                    verifyTransaction.Rollback();
                    throw ex;
                }
            }
            return labReport;
        }

        private object VerifyTestResultWithoutSignatory(string str, RbacUser currentUser)
        {
            List<Int64> reqIdList = DanpheJSONConvert.DeserializeObject<List<Int64>>(str);

            foreach (var reqId in reqIdList)
            {
                LabRequisitionModel requisitionItem = _labDbContext.Requisitions.Where(val => val.RequisitionId == reqId).FirstOrDefault();

                requisitionItem.OrderStatus = ENUM_LabOrderStatus.ReportGenerated; //"report-generated";
                requisitionItem.VerifiedBy = currentUser.EmployeeId;
                requisitionItem.VerifiedOn = DateTime.Now;
                requisitionItem.IsVerified = true;

                _labDbContext.Entry(requisitionItem).Property(a => a.OrderStatus).IsModified = true;
                _labDbContext.Entry(requisitionItem).Property(a => a.VerifiedBy).IsModified = true;
                _labDbContext.Entry(requisitionItem).Property(a => a.VerifiedOn).IsModified = true;
                _labDbContext.Entry(requisitionItem).Property(a => a.IsVerified).IsModified = true;
                _labDbContext.SaveChanges();
            }
            return Ok("OK");
        }

        private object TransferToLab(int requisitionId, string labType)
        {
           // var requisitionId = Convert.ToInt32(this.ReadQueryStringData("reqId"));
            //var labType = this.ReadQueryStringData("labTypeName");

            LabRequisitionModel labRequest = (from req in _labDbContext.Requisitions
                                              where req.RequisitionId == requisitionId
                                              select req).FirstOrDefault();
            BillingTransactionItemModel billingItem = (from bil in _labDbContext.BillingTransactionItems
                                                       where bil.RequisitionId == requisitionId
                                                       select bil).FirstOrDefault();

            using (var dbContextTransaction = _labDbContext.Database.BeginTransaction())
            {
                try
                {
                    labRequest.LabTypeName = labType;
                    _labDbContext.Entry(labRequest).Property(a => a.LabTypeName).IsModified = true;
                    billingItem.LabTypeName = labType;
                    _labDbContext.Entry(billingItem).Property(a => a.LabTypeName).IsModified = true;

                    _labDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return labRequest;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        /// <summary>
        /// <author>Dev Narayan</author>
        /// <date>2022 Feb 22</date>
        /// Preconditions for sample collection is valid
        /// 1. All the requsitions should have orderstatus  'active'
        /// 2. If any any one of the requisition's orderstatus is other than 'active' then
        ///     i. Do not allow sample collection
        ///     ii. Show appropriate error message in client side.
        ///     iii. Relaod the current sample collection page.
        /// </summary>
        /// <param name="labTests"></param>
        /// <param name="labDbContext"></param>
        /// <returns></returns>
        private bool IsValidForSampleCollection(List<PatientLabSampleVM> labTests, LabDbContext labDbContext)
        {
            var isValid = false;
            List<Int64> distinctRequsitions = labTests.Select(a => a.RequisitionId).Distinct().ToList();
            var ReqList = labDbContext.Requisitions.Where(a => distinctRequsitions.Contains(a.RequisitionId)).ToList();
            isValid = ReqList.All(a => a.OrderStatus == ENUM_LabOrderStatus.Active);
            return isValid;
        }

        /// <summary>
        /// <author>Dev Narayan</author>
        /// <date>2022 Feb 22</date>
        /// This function tests whether we have already added results for the given requisitions or not.
        /// Preconditions for add result
        /// 1. All the requsitions should have orderstatus  'pending'
        /// 2. If any any one of the requisition's orderstatus is other than 'pending' then
        ///     i. Do not allow result add.
        ///     ii. Show appropriate error message in client side.
        ///     iii. Relaod the current add result page.
        /// </summary>
        /// <param name="labComponentFromClient"></param>
        /// <param name="labDbContext"></param>
        /// <returns></returns>
        private Boolean IsValidForAddResult(List<LabTestComponentResult> labComponentFromClient, LabDbContext labDbContext)
        {
            var isValid = false;
            List<Int64> distinctRequisitions = labComponentFromClient.Select(a => a.RequisitionId).Distinct().ToList();
            var ReqList = labDbContext.Requisitions.Where(a => distinctRequisitions.Contains(a.RequisitionId)).ToList();
            isValid = ReqList.All(a => a.OrderStatus == ENUM_LabOrderStatus.Pending);
            return isValid;
        }

        private object GetLabWorkList(string activeLabTypeName, DateTime fromDate, DateTime toDate, string categoryIdCsv)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                        new SqlParameter("@FromDate", fromDate),
                        new SqlParameter("@ToDate", toDate),
                        new SqlParameter("@LabTypeName", activeLabTypeName),
                        new SqlParameter("@CategoryIdCsv", categoryIdCsv)
                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetLabWorkList", paramList, _labDbContext);
            return dt;
        }
    }



}



