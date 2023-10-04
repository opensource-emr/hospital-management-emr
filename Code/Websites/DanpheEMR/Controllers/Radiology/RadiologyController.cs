using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using DanpheEMR.CommonTypes;
using Microsoft.AspNetCore.Http;
using System.IO;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using DanpheEMR.Core;
using DanpheEMR.Core.Caching;
using System.Drawing;
using DanpheEMR.Services;
using System.Threading.Tasks;
using DanpheEMR.Enums;
using System.Transactions;
using System.Data.SqlClient;
using System.Data;

namespace DanpheEMR.Controllers
{
    public class RadiologyController : CommonController
    {
        public IEmailService _emailService;
        private readonly RadiologyDbContext _radiologyDbContext;
        private readonly DicomDbContext _dicomDbContext;
        private readonly CoreDbContext _coreDBContext;
        private readonly MasterDbContext _masterDBContext;

        public RadiologyController(IOptions<MyConfiguration> _config, IEmailService emailService) : base(_config)
        {
            _emailService = emailService;
            _radiologyDbContext = new RadiologyDbContext(connString);
            _dicomDbContext = new DicomDbContext(connString);
            _coreDBContext = new CoreDbContext(connString);
            _masterDBContext = new MasterDbContext(connString);
        }

        #region Get APIs

        [HttpGet]
        [Route("FilmTypes")]
        public IActionResult GetFilmTypes()
        {
            //if (reqType == "getFilmTypeData")
            Func<object> func = () => (from filmType in _radiologyDbContext.FilmType.Where(a => a.IsActive == true)
                                       select filmType).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Requisitions")]
        public IActionResult GetRequisitions(string reqOrderStatus, string reportOrderStatus, string typeList, DateTime? fromDate, DateTime? toDate)
        {
            //if (reqType == "getRequisitionsList")
            Func<object> func = () => RequisitionsList(reqOrderStatus, reportOrderStatus, typeList, fromDate, toDate);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingReports")]
        public IActionResult GetImagingReports(string reportOrderStatus, DateTime? fromDate, DateTime? toDate, string typeList)
        {
            //if (reqType == "allImagingReports")
            Func<object> func = () => AllImagingReports(reportOrderStatus, fromDate, toDate, typeList);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingReport")]
        public IActionResult GetImagingReport(int requisitionId)
        {
            //if (reqType == "imagingReportByRequisitionId")
            Func<object> func = () => ImagingReportByRequisitionId(requisitionId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingResults")]
        public IActionResult ImagingResults(int patientId, string reportOrderStatus)
        {
            //if (patientId != 0 && reqType == "imagingResult")
            Func<object> func = () => (from report in _radiologyDbContext.ImagingReports
                                       join patient in _radiologyDbContext.Patients on report.PatientId equals patient.PatientId
                                       where report.PatientId == patientId && report.OrderStatus == reportOrderStatus
                                       select new ImagingReportViewModel
                                       {
                                           ImagingReportId = report.ImagingReportId,
                                           ImagingRequisitionId = report.ImagingRequisitionId,
                                           ImagingTypeName = report.ImagingTypeName,
                                           ImagingItemName = report.ImagingItemName,
                                           CreatedOn = report.CreatedOn,
                                           ReportText = report.ReportText,
                                           ImageName = report.ImageName,
                                           PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " "),
                                           DateOfBirth = patient.DateOfBirth,
                                           Gender = patient.Gender,
                                       }).OrderByDescending(b => b.CreatedOn).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PatientVisitsImagingResults")]
        public IActionResult PatientVisitsImagingResults(int patientVisitId)
        {
            //if (patientVisitId != 0 && reqType == "imagingResult-visit")
            Func<object> func = () => ImagingResultVisit(patientVisitId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingItems")]
        public IActionResult ImagingItems()
        {
            //if (reqType == "allImagingItems")
                Func<object> func = () => (from app in _radiologyDbContext.ImagingItems
                                           select app).ToList();
                return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReportDetail")]
        public IActionResult ReportDetail(bool isRequisitionReport, int id)
        {
            //if (reqType == "reportDetail")
            Func<object> func = () => GetReportDetail(isRequisitionReport, id);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImgingFilesFromPACS")]
        public IActionResult ImgingFilesFromPACS(DateTime? fromDate, DateTime? toDate)
        {
            //if (reqType == "imgingFileListFromPACS")
            Func<object> func = () => (from imgFile in _dicomDbContext.PatientStudies.AsEnumerable()
                                       where imgFile.CreatedOn.Value.Date >= fromDate && imgFile.CreatedOn <= toDate
                                       select new
                                       {
                                           PatientStudyId = imgFile.PatientStudyId,
                                           PatientName = imgFile.PatientName,
                                           Modality = imgFile.Modality,
                                           StudyDate = String.Format("{0:dd/MM/yyyy}", imgFile.StudyDate),
                                           CreatedOn = String.Format("{0:dd/MM/yyyy HH:mm:ss}", imgFile.CreatedOn),
                                           StudyDescription = imgFile.StudyDescription
                                       }).OrderByDescending(v => v.CreatedOn).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReportTemplates")]
        public IActionResult ReportTemplates()
        {
            //if (reqType == "all-report-templates")
            Func<object> func = () => (from rep in _radiologyDbContext.RadiologyReportTemplate
                                                                 where rep.IsActive == true && rep.ModuleName == "Radiology"
                                                                 select rep).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("DicomImage")]
        public IActionResult DicomImage()
        {
            //if (reqType == "dicomImageLoaderUrl")
            Func<object> func = () => (from parameter in _coreDBContext.Parameters
                                     where parameter.ParameterName == "DicomImageLoaderUrl"
                                     select parameter.ParameterValue
                                 ).SingleOrDefault();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("DicomImages")]
        public IActionResult DicomImages(string PatientStudyId)
        {
            //if (reqType == "get-dicom-image-list")
            Func<object> func = () => DicomImageList(PatientStudyId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Doctors")]
        public IActionResult Doctors()
        {
            //if (reqType == "doctor-list")
            Func<object> func = () => DoctorList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ImagingTypes")]
        public IActionResult ImagingTypes()
        {
            //if (reqType == "getImagingTypes")
            Func<object> func = () => _radiologyDbContext.ImagingTypes.Where(i => i.IsActive == true).ToList();
            return InvokeHttpGetFunction(func);
        }

        #endregion

        #region Post APIs

        [HttpPost]
        [Route("Requisitions")]
        public IActionResult Requisitions()
        {
            //if (reqType == "postRequestItems")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddRequisitions(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }
        
        [HttpPost]
        [Route("Report")]
        public IActionResult Report()
        {
            //if (reqType == "postReport")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> Func = () => PostReport(currentUser);
            return InvokeHttpPostFunction(Func);
        }

        [HttpPost]
        [Route("PatientStudy")]
        public IActionResult PostPatientStudy()
        {
            //if (reqType == "postPatientStudy")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SavePatientStudy(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("SendEmail")]
        public IActionResult SendEmail()
        {
            //if (reqType == "sendEmail")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SendEmail(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        #endregion

        #region PUT APIs

        [HttpPut]
        [Route("ImagingReport")]
        public IActionResult ImagingReport()
        {
            //if (reqType == "updateImgReport" && !string.IsNullOrEmpty(reportDetails))
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateImagingReport(currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillingStatus")]
        public IActionResult BillingStatus(string billingStatus)
        {
            //if (reqType == "billingStatus")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateBillingStatus(ipDataStr, currentUser, billingStatus);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("DeleteReportImages")]
        public IActionResult DeleteReportImages()
        {
            //if (reqType == "deleteRptImages")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateReportImages(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("PatientStudy")]
        public IActionResult PutPatientStudy()
        {
            //if (reqType == "updatePatientStudy")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdatePatientStudy(ipDataStr);
            return InvokeHttpPutFunction(func);  
        }

        [HttpPut]
        [Route("CancelInpatientRequisitions")]
        public IActionResult CancelInpatientRequisitions()
        {
            //if (reqType == "cancelInpatientRadRequest")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => CancelInpatientRadRequest(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("Doctor")]
        public IActionResult Doctor(int prescriberId, string prescriberName)
        {
            //if (reqType == "UpdateDoctor")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateDoctor(ipDataStr, prescriberId, prescriberName);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("PatientScanDone")]
        public IActionResult PatientScanDone()
        {
            //if (reqType == "updateRadPatScanData")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdatePatientScanData(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        #endregion

        private object RequisitionsList(string reqOrderStatus, string reportOrderStatus, string typeList, DateTime? fromDate, DateTime? toDate)
        {
            List<object> imgReportList = new List<object>();
            Dictionary<string, bool> radSettings = _coreDBContext.Parameters.Where(p => p.ParameterGroupName.ToLower() == "radiology"
                                         && (p.ParameterName == "EnableRadScan" || p.ParameterName == "RadHoldIPBillBeforeScan"
                                         || p.ParameterName == "RAD_AttachFileButtonShowHide"))
                                        .ToDictionary(k => k.ParameterName, d => ((d.ParameterValue == "1" || d.ParameterValue == "true") ? true : false));

            bool EnableRadScan = radSettings["EnableRadScan"];
            bool RadHoldIPBillBeforeScan = radSettings["RadHoldIPBillBeforeScan"];
            bool IsShowButton = radSettings["RAD_AttachFileButtonShowHide"];

            List<int> imgValidTypeList = DanpheJSONConvert.DeserializeObject<List<int>>(typeList);

            var dbReports =
                (from i in _radiologyDbContext.ImagingReports
                 join requisition in _radiologyDbContext.ImagingRequisitions on i.ImagingRequisitionId equals requisition.ImagingRequisitionId
                 where i.OrderStatus == reportOrderStatus && (requisition.BillingStatus.ToLower() == "paid"
                 || requisition.BillingStatus.ToLower() == "unpaid"
                 || requisition.BillingStatus.ToLower() == "provisional")
                  && (DbFunctions.TruncateTime(requisition.CreatedOn) >= fromDate && DbFunctions.TruncateTime(requisition.CreatedOn) <= toDate)
                 && imgValidTypeList.Contains(requisition.ImagingTypeId.Value)
                 join pat in _radiologyDbContext.Patients
                 on i.PatientId equals pat.PatientId
                 join mun in _radiologyDbContext.Muncipality
                 on pat.MunicipalityId equals mun.MunicipalityId into g
                 from municipality in g.DefaultIfEmpty()
                 join con in _radiologyDbContext.CountrySubDivision
                 on pat.CountrySubDivisionId equals con.CountrySubDivisionId into h
                 from CountrySubDivision in h.DefaultIfEmpty()
                 select new
                 {
                     ImagingReportId = i.ImagingReportId,
                     ImagingRequisitionId = i.ImagingRequisitionId,
                     PatientVisitId = i.PatientVisitId,
                     PatientId = i.PatientId,
                     PrescriberName = ((i.PrescriberName != null) && i.PrescriberName.Length > 0) ? i.PrescriberName : "self",
                     PerformerId = i.PerformerId,
                     PerformerName = i.PerformerName,
                     ImagingTypeId = i.ImagingTypeId,
                     ImagingTypeName = i.ImagingTypeName,
                     ImagingItemId = i.ImagingItemId,
                     ImagingItemName = i.ImagingItemName,
                     ImageFullPath = i.ImageFullPath,
                     PrescriberId = i.PrescriberId,
                     ProviderId = i.PrescriberId,
                     CreatedOn = i.CreatedOn,
                     OrderStatus = i.OrderStatus,
                     PatientStudyId = i.PatientStudyId,
                     Indication = i.Indication,
                     RadiologyNo = i.RadiologyNo,
                     Signatories = i.Signatories,
                     IsScanned = true,
                     ScannedBy = requisition.ScannedBy,
                     ScannedOn = requisition.ScannedOn,
                     WardName = requisition.WardName,
                     IsActive = requisition.IsActive,
                     HasInsurance = requisition.HasInsurance,
                     IsShowButton = IsShowButton,
                     IsReportSaved = requisition.IsReportSaved,
                     Patient = new
                     {
                         Age = i.Patient.Age,
                         DateOfBirth = i.Patient.DateOfBirth,
                         Gender = i.Patient.Gender,
                         FirstName = i.Patient.FirstName,
                         MiddleName = i.Patient.MiddleName,
                         LastName = i.Patient.LastName,
                         ShortName = i.Patient.ShortName,
                         PatientCode = i.Patient.PatientCode,
                         PatientId = i.Patient.PatientId,
                         PhoneNumber = i.Patient.PhoneNumber,
                         Address = i.Patient.Address,
                         Municipality = municipality.MunicipalityName,
                         CountrySubDivision = CountrySubDivision.CountrySubDivisionName
                     }
                 }).OrderByDescending(r => r.PatientId).ToList();

            var imgReqList = (from req in _radiologyDbContext.ImagingRequisitions.Include("Patient")
                              join billItem in _radiologyDbContext.BillingTransactionItems on req.BillingTransactionItemId equals billItem.BillingTransactionItemId
                              join serDept in _radiologyDbContext.ServiceSepartments on billItem.ServiceDepartmentId equals serDept.ServiceDepartmentId
                              where serDept.IntegrationName == "Radiology" && (EnableRadScan ? (req.OrderStatus == reqOrderStatus || req.OrderStatus == reportOrderStatus) : req.OrderStatus == reqOrderStatus)
                              && (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || req.BillingStatus.ToLower() == "provisional")
                                  && (DbFunctions.TruncateTime(req.CreatedOn) >= fromDate && DbFunctions.TruncateTime(req.CreatedOn) <= toDate)
                                  && imgValidTypeList.Contains(req.ImagingTypeId.Value)
                                  && (req.IsReportSaved != true)
                              join mun in _radiologyDbContext.Muncipality
                              on req.Patient.MunicipalityId equals mun.MunicipalityId into g
                              from municipality in g.DefaultIfEmpty()
                              join con in _radiologyDbContext.CountrySubDivision
                              on req.Patient.CountrySubDivisionId equals con.CountrySubDivisionId into h
                              from CountrySubDivision in h.DefaultIfEmpty()
                              select new
                              {
                                  ImagingRequisitionId = req.ImagingRequisitionId,
                                  PatientVisitId = req.PatientVisitId,
                                  PatientId = req.PatientId,
                                  PrescriberName = ((req.PrescriberName != null) && req.PrescriberName.Length > 0) ? req.PrescriberName : "self",
                                  PerformerId = billItem.PerformerId,
                                  PerformerName = billItem.PerformerName,
                                  ImagingTypeId = req.ImagingTypeId,
                                  ImagingTypeName = req.ImagingTypeName,
                                  ImagingItemId = req.ImagingItemId,
                                  ImagingItemName = req.ImagingItemName,
                                  ProcedureCode = req.ProcedureCode,
                                  ImagingDate = req.ImagingDate,
                                  RequisitionRemarks = req.RequisitionRemarks,
                                  OrderStatus = req.OrderStatus,
                                  PrescriberId = req.PrescriberId,
                                  BillingStatus = req.BillingStatus,
                                  Urgency = req.Urgency,
                                  HasInsurance = req.HasInsurance,
                                  WardName = req.WardName,
                                  IsActive = req.IsActive,
                                  IsScanned = EnableRadScan ? req.IsScanned : true,
                                  ScannedBy = req.ScannedBy,
                                  ScannedOn = req.ScannedOn,
                                  IsShowButton = IsShowButton,
                                  Patient = new
                                  {
                                      Age = req.Patient.Age,
                                      DateOfBirth = req.Patient.DateOfBirth,
                                      Gender = req.Patient.Gender,
                                      FirstName = req.Patient.FirstName,
                                      MiddleName = req.Patient.MiddleName,
                                      LastName = req.Patient.LastName,
                                      ShortName = req.Patient.ShortName,
                                      PatientCode = req.Patient.PatientCode,
                                      PatientId = req.Patient.PatientId,
                                      PhoneNumber = req.Patient.PhoneNumber,
                                      Address = req.Patient.Address,
                                      Municipality = municipality.MunicipalityName,
                                      CountrySubDivision = CountrySubDivision.CountrySubDivisionName
                                  }
                              }).OrderByDescending(y => y.ImagingDate).ToList();

            if (dbReports.Count != 0)
            {
                dbReports.ForEach(report =>
                {
                    imgReportList.Add(report);
                });
            }
            if (imgReqList.Count != 0)
            {
                imgReqList.ForEach(imgReq =>
                {
                    var imgReport = new
                    {

                        ImagingItemId = imgReq.ImagingItemId,
                        ImagingItemName = imgReq.ImagingItemName,
                        ImagingRequisitionId = imgReq.ImagingRequisitionId,
                        ImagingTypeId = imgReq.ImagingTypeId,
                        ImagingReportId = 0,
                        ImagingTypeName = imgReq.ImagingTypeName,
                        OrderStatus = imgReq.OrderStatus,
                        PatientId = imgReq.PatientId,
                        PatientVisitId = imgReq.PatientVisitId,
                        PrescriberName = imgReq.PrescriberName,
                        ReportingDoctorId = 0,
                        CreatedOn = imgReq.ImagingDate,
                        PrescriberId = imgReq.PrescriberId,
                        PerformerId = imgReq.PerformerId,
                        PerformerName = imgReq.PerformerName,
                        WardName = imgReq.WardName,
                        IsActive = imgReq.IsActive,
                        HasInsurance = imgReq.HasInsurance,
                        IsScanned = imgReq.IsScanned,
                        ScannedBy = imgReq.ScannedBy,
                        ScannedOn = imgReq.ScannedOn,
                        IsShowButton = imgReq.IsShowButton,
                        Patient = new
                        {
                            Age = imgReq.Patient.Age,
                            DateOfBirth = imgReq.Patient.DateOfBirth,
                            Gender = imgReq.Patient.Gender,
                            FirstName = imgReq.Patient.FirstName,
                            MiddleName = imgReq.Patient.MiddleName,
                            LastName = imgReq.Patient.LastName,
                            ShortName = imgReq.Patient.ShortName,
                            PatientCode = imgReq.Patient.PatientCode,
                            PatientId = imgReq.Patient.PatientId,
                            PhoneNumber = imgReq.Patient.PhoneNumber,
                            Address = imgReq.Patient.Address,
                            Municipality = imgReq.Patient.Municipality,
                            CountrySubDivision = imgReq.Patient.CountrySubDivision
                        }
                    };
                    imgReportList.Add(imgReport);
                });
            }
            return imgReportList;
        }

        private object AllImagingReports(string reportOrderStatus, DateTime? fromDate, DateTime? toDate, string typeList)
        {
            List<int> imgValidTypeList = DanpheJSONConvert.DeserializeObject<List<int>>(typeList);
            List<ImagingReportViewModel> imgReportList = (from report in _radiologyDbContext.ImagingReports
                                                          join requisition in _radiologyDbContext.ImagingRequisitions on report.ImagingRequisitionId equals requisition.ImagingRequisitionId
                                                          join patient in _radiologyDbContext.Patients on report.PatientId equals patient.PatientId
                                                          where report.OrderStatus == reportOrderStatus
                                                          && (requisition.BillingStatus.ToLower() == "paid" || requisition.BillingStatus.ToLower() == "unpaid" || requisition.BillingStatus.ToLower() == "provisional")
                                                          && (DbFunctions.TruncateTime(report.CreatedOn) >= fromDate && DbFunctions.TruncateTime(report.CreatedOn) <= toDate)
                                                          && imgValidTypeList.Contains(requisition.ImagingTypeId.Value)
                                                          select new ImagingReportViewModel
                                                          {
                                                              ImagingReportId = report.ImagingReportId,
                                                              ImagingRequisitionId = report.ImagingRequisitionId,
                                                              ImagingTypeName = report.ImagingTypeName,
                                                              ImagingItemName = report.ImagingItemName,
                                                              CreatedOn = report.CreatedOn,
                                                              ReportText = null,
                                                              ImageName = report.ImageName,
                                                              PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                              Signatories = report.Signatories,
                                                              DateOfBirth = patient.DateOfBirth,
                                                              Gender = patient.Gender,
                                                              PhoneNumber = patient.PhoneNumber,
                                                              PatientCode = patient.PatientCode,
                                                              Address = patient.Address,
                                                              PatientStudyId = report.PatientStudyId,
                                                              PrescriberName = requisition.PrescriberName,
                                                              PrescriberId = requisition.PrescriberId,
                                                              PerformerId = report.PerformerId,
                                                              PerformerName = report.PerformerName,
                                                              Indication = report.Indication,
                                                              RadiologyNo = report.RadiologyNo,
                                                              HasInsurance = requisition.HasInsurance,
                                                              IsActive = requisition.IsActive
                                                          }).OrderByDescending(b => b.CreatedOn).ToList();
            return imgReportList;
        }

        private object ImagingReportByRequisitionId(int requisitionId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            string base64String = null;

            var user = (from emp in _masterDBContext.Employees
                        join dpt in _masterDBContext.Departments on emp.DepartmentId equals dpt.DepartmentId
                        where emp.EmployeeId == currentUser.EmployeeId && dpt.DepartmentName.ToLower() == "radiology"
                        select emp).FirstOrDefault();
            var fileName = user == null ? null : user.SignatoryImageName;

            if (fileName != null)
            {
                var path = (from master in _masterDBContext.CFGParameters
                            where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
                            select master.ParameterValue).FirstOrDefault();

                string signatoryImagePath = path + fileName;

                using (Image image = Image.FromFile(signatoryImagePath))
                {
                    using (MemoryStream m = new MemoryStream())
                    {
                        image.Save(m, image.RawFormat);
                        byte[] imageBytes = m.ToArray();
                        base64String = Convert.ToBase64String(imageBytes);
                    }
                }
            }

            ImagingReportViewModel imgReport = (from report in _radiologyDbContext.ImagingReports
                                                join patient in _radiologyDbContext.Patients on report.PatientId equals patient.PatientId
                                                join req in _radiologyDbContext.ImagingRequisitions on report.ImagingRequisitionId equals req.ImagingRequisitionId
                                                join countrySudDivision in _radiologyDbContext.CountrySubDivision on patient.CountrySubDivisionId equals countrySudDivision.CountrySubDivisionId into csd
                                                from countrySudDivision in csd.DefaultIfEmpty()
                                                join muncipality in _radiologyDbContext.Muncipality on patient.MunicipalityId equals muncipality.MunicipalityId into mun
                                                from muncipality in mun.DefaultIfEmpty()
                                                where report.ImagingRequisitionId == requisitionId
                                                select new ImagingReportViewModel
                                                {
                                                    PatientId = report.PatientId,
                                                    ReportTemplateId = report.ReportTemplateId,
                                                    ImagingReportId = report.ImagingReportId,
                                                    ImagingRequisitionId = report.ImagingRequisitionId,

                                                    ImagingTypeName = report.ImagingTypeName,
                                                    ImagingItemName = report.ImagingItemName,
                                                    CreatedOn = report.CreatedOn,
                                                    BillingDate = req.CreatedOn,
                                                    ReportText = report.ReportText,
                                                    ImageName = report.ImageName,
                                                    PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                    Address = patient.Address,
                                                    Muncipality = muncipality.MunicipalityName == null ? null : muncipality.MunicipalityName,
                                                    CountrySubDivision = countrySudDivision.CountrySubDivisionName == null ? null : countrySudDivision.CountrySubDivisionName,
                                                    PatientNameLocal = patient.PatientNameLocal,
                                                    Signatories = report.Signatories,
                                                    DateOfBirth = patient.DateOfBirth,
                                                    PhoneNumber = patient.PhoneNumber,
                                                    PatientCode = patient.PatientCode,
                                                    Gender = patient.Gender,
                                                    PrescriberName = report.PrescriberName,
                                                    PatientStudyId = report.PatientStudyId,
                                                    PerformerId = report.PerformerId,
                                                    Indication = report.Indication,
                                                    RadiologyNo = report.RadiologyNo,
                                                    HasInsurance = (from req in _radiologyDbContext.ImagingRequisitions
                                                                    where req.ImagingRequisitionId == requisitionId
                                                                    select req.HasInsurance).FirstOrDefault(),
                                                }).FirstOrDefault();
            if (imgReport.ReportTemplateId != null)
            {
                var rptTemplate = _radiologyDbContext.RadiologyReportTemplate.Where(r => r.TemplateId == imgReport.ReportTemplateId).FirstOrDefault();

                if (rptTemplate != null)
                {
                    imgReport.TemplateName = rptTemplate.TemplateName;
                    imgReport.FooterText = rptTemplate.FooterNote;
                    imgReport.SignatoryImageBase64 = base64String;
                }
            }
            return imgReport;
        }

        private object ImagingResultVisit(int patientVisitId)
        {
            var imgReportList = _radiologyDbContext.ImagingReports
                                        .Where(i => i.PatientVisitId == patientVisitId && i.OrderStatus == "final")
                                        .GroupBy(a => a.ImagingItemId)
                                        .Select(b => new {
                                            latestUniqueImagings = b.OrderByDescending(i => i.CreatedOn).FirstOrDefault()
                                        })
                                        .Select(c => new
                                        {
                                            c.latestUniqueImagings
                                        })
                                        .ToList();

            List<ImagingReportModel> tempImg = new List<ImagingReportModel>();
            imgReportList.ForEach(a =>
            {
                tempImg.Add(a.latestUniqueImagings);
            });
            return tempImg;
        }

        private object GetReportDetail(bool isRequisitionReport, int id)
        {
            if (isRequisitionReport)
            {
                var rptTemp = (from rptTemplate in _radiologyDbContext.RadiologyReportTemplate
                               join imgItm in _radiologyDbContext.ImagingItems
                               on rptTemplate.TemplateId equals imgItm.TemplateId
                               select rptTemplate).FirstOrDefault();
                var Results = new object();
                if (rptTemp != null)
                {
                    Results = new
                    {
                        TemplateName = rptTemp.TemplateName,
                        ReportTemplateId = rptTemp.TemplateId,
                        ReportText = rptTemp.TemplateHTML,
                        ImageFullPath = string.Empty,
                        ImageName = string.Empty
                    };
                }
                return Results;
            }
            else
            {
                ImagingReportModel report = new ImagingReportModel();
                report = (from rpt in _radiologyDbContext.ImagingReports
                          where rpt.ImagingReportId == id
                          select rpt
                         ).FirstOrDefault();

                var scannedDate = (from req in _radiologyDbContext.ImagingRequisitions
                                   where req.ImagingRequisitionId == report.ImagingRequisitionId
                                   select req.ScannedOn
                                    ).FirstOrDefault();


                var reptTemplate = (from rpt in _radiologyDbContext.ImagingReports
                                    join temp in _radiologyDbContext.RadiologyReportTemplate
                                    on rpt.ReportTemplateId equals temp.TemplateId
                                    where rpt.ImagingReportId == id
                                    select temp).FirstOrDefault();

                var tempName = reptTemplate != null ? reptTemplate.TemplateName : "Not Set";

                if (report.ReportText.Length <= 0)
                {
                    var repTemp = (from temp in _radiologyDbContext.RadiologyReportTemplate
                                   join imgItm in _radiologyDbContext.ImagingItems
                                   on temp.TemplateId equals imgItm.TemplateId
                                   where imgItm.ImagingItemId == report.ImagingItemId
                                   select temp
                            ).FirstOrDefault();
                    if (repTemp != null)
                    {
                        report.ReportText = repTemp.TemplateHTML;
                        report.ReportTemplateId = repTemp.TemplateId;
                    }

                }

                var Results = new
                {
                    TemplateName = tempName,
                    ReportTemplateId = report.ReportTemplateId,
                    ReportText = report.ReportText,
                    ImageFullPath = report.ImageFullPath,
                    ImageName = report.ImageName,
                    ScannedOn = scannedDate
                };
                return Results;
            }
        }

        private object DicomImageList(string PatientStudyId)
        {
            if (string.IsNullOrEmpty(PatientStudyId) || PatientStudyId == "undefined" || PatientStudyId == "null")
            {
                var dicomImg = (from patStudy in _dicomDbContext.PatientStudies
                                where patStudy.IsMapped != true
                                select new
                                {
                                    PatientId = patStudy.PatientId,
                                    PatientName = patStudy.PatientName,
                                    PatientStudyId = patStudy.PatientStudyId,
                                    StudyDate = patStudy.StudyDate,
                                    CreatedOn = patStudy.CreatedOn,
                                    IsMapped = patStudy.IsMapped,
                                }).ToList();
                return dicomImg;
            }
            else
            {
                List<int> patStudyIdList = string.IsNullOrEmpty(PatientStudyId) ? new List<int>() : PatientStudyId.Split(',').Select(int.Parse).ToList();
                var dicomImg1 = (from patStudy in _dicomDbContext.PatientStudies
                                 where patStudy.IsMapped != true || patStudyIdList.Contains(patStudy.PatientStudyId)
                                 select new
                                 {
                                     PatientId = patStudy.PatientId,
                                     PatientName = patStudy.PatientName,
                                     PatientStudyId = patStudy.PatientStudyId,
                                     StudyDate = patStudy.StudyDate,
                                     CreatedOn = patStudy.CreatedOn,
                                     IsMapped = patStudy.IsMapped,
                                 }).ToList();
                return dicomImg1;
            }
        }

        private object DoctorList()
        {
            List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
            List<EmployeeModel> doctorList = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                             && emp.IsAppointmentApplicable == true).ToList();
            return doctorList;
        }



        private object AddRequisitions(string ipDataStr, RbacUser currentUser)
        {
            List<ImagingRequisitionModel> imgrequests = JsonConvert.DeserializeObject<List<ImagingRequisitionModel>>(ipDataStr);
            List<RadiologyImagingTypeModel> Imgtype = _masterDBContext.ImagingTypes
                                .ToList<RadiologyImagingTypeModel>();

            var notValidForReportingItem = _masterDBContext.ImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);

            if (imgrequests != null && imgrequests.Count > 0)
            {
                foreach (var req in imgrequests)
                {
                    req.ImagingDate = DateTime.Now;
                    req.CreatedOn = DateTime.Now;
                    req.CreatedBy = currentUser.EmployeeId;
                    req.IsActive = true;
                    if (req.PrescriberId != null && req.PrescriberId != 0)
                    {
                        var emp = _radiologyDbContext.Employees.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                        req.PrescriberName = emp.FullName;
                    }
                    if (req.ImagingTypeId != null)
                    {
                        req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                        req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                    }
                    else
                    {
                        req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName.ToLower() == req.ImagingTypeName.ToLower()).Select(a => a.ImagingTypeId).FirstOrDefault();
                    }
                    if (!notValidForReportingItem.Contains(req.ImagingItemId.Value))
                    {
                        _radiologyDbContext.ImagingRequisitions.Add(req);
                    }
                }
                _radiologyDbContext.SaveChanges();
                return imgrequests;
            }
            else
            {
                throw new Exception("Failed");
            }
        }

        private object PostReport(RbacUser currentUser)
        {
            var files = this.ReadFiles();
            var localFolder = Request.Form["localFolder"];
            var reportDetails = Request.Form["reportDetails"];
            var orderStatus = Request.Form["orderStatus"];
            var enableProviderEditInBillTxnItem = Convert.ToBoolean(Request.Form["enableProviderEditInBillTxnItem"]);
            ImagingReportModel imgReport = DanpheJSONConvert.DeserializeObject<ImagingReportModel>(reportDetails);

            using (TransactionScope trans = new TransactionScope())
            {
                if (files.Count != 0)
                {
                    imgReport = UploadReportFile(imgReport, files, localFolder);
                }

                imgReport.CreatedBy = currentUser.EmployeeId;
                imgReport.OrderStatus = orderStatus;
                if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                {
                    imgReport.PerformerId = imgReport.PerformerIdInBilling;
                    imgReport.PerformerName = imgReport.PerformerNameInBilling;
                }
                imgReport.CreatedOn = DateTime.Now;
                _radiologyDbContext.ImagingReports.Add(imgReport);

                if (imgReport.PatientStudyId != null)
                {
                    List<int> patStudyIdList = imgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                    List<PatientStudyModel> dicom = (from pp in _dicomDbContext.PatientStudies
                                                     where patStudyIdList.Contains(pp.PatientStudyId)
                                                     select pp).ToList();

                    dicom.ForEach(pat =>
                    {
                        pat.IsMapped = true;
                        _dicomDbContext.PatientStudies.Attach(pat);
                        _dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                    });

                    _dicomDbContext.SaveChanges();
                }
                _radiologyDbContext.SaveChanges();

                string putRequisitionResult = PutRequisitionItemStatus(imgReport.ImagingRequisitionId, orderStatus);

                if (putRequisitionResult == "OK")
                {
                    ImagingReportModel returnImgReport = new ImagingReportModel();
                    returnImgReport.ReportText = imgReport.ReportText;
                    returnImgReport.ImagingReportId = imgReport.ImagingReportId;
                    returnImgReport.OrderStatus = imgReport.OrderStatus;
                    returnImgReport.Indication = imgReport.Indication;
                    returnImgReport.RadiologyNo = imgReport.RadiologyNo;
                    returnImgReport.ImagingRequisitionId = imgReport.ImagingRequisitionId;
                    if (files.Count != 0)
                    {
                        returnImgReport.ImageFullPath = imgReport.ImageFullPath;
                        returnImgReport.ImageName = imgReport.ImageName;
                    }

                    List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@status", orderStatus.ToString())
                        };

                    DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", paramList, _radiologyDbContext);
                    RadiologyDbContext dbContextUpdate = new RadiologyDbContext(base.connString);
                    ImagingRequisitionModel imgRequsition = dbContextUpdate.ImagingRequisitions.Where(a => a.ImagingRequisitionId == imgReport.ImagingRequisitionId).FirstOrDefault();
                    imgRequsition.PrescriberId = imgReport.PrescriberId;
                    imgRequsition.PrescriberName = imgReport.PrescriberName;
                    dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberId).IsModified = true;
                    dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberName).IsModified = true;
                    dbContextUpdate.SaveChanges();
                    if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                    {
                        List<SqlParameter> paramListToUpdatePerformer = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@PerformerId", imgReport.PerformerId != null ? imgReport.PerformerId : null),
                                                    new SqlParameter("@PerformerName", imgReport.PerformerName != null ? imgReport.PerformerName : null),
                                                    new SqlParameter("@PrescriberId", imgReport.PrescriberId != null ? imgReport.PrescriberId : null),
                                                    new SqlParameter("@PrescriberName", imgReport.PrescriberName != null ? imgReport.PrescriberName : null)
                        };

                        DataTable providerUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Update_RadiologyProvider_In_BillTransactionItem", paramListToUpdatePerformer, _radiologyDbContext);
                    }

                    trans.Complete();

                    return returnImgReport;
                }
                //if update of RequisitionItem OrderStatus Fails.
                else
                {
                    throw new Exception("Failed");
                }
            }
        }

        private object SavePatientStudy(string ipDataStr, RbacUser currentUser)
        {
            ImagingReportModel imgReport = DanpheJSONConvert.DeserializeObject<ImagingReportModel>(ipDataStr);
            imgReport.CreatedOn = System.DateTime.Now;
            imgReport.CreatedBy = currentUser.EmployeeId;
            _radiologyDbContext.ImagingReports.Add(imgReport);
            _radiologyDbContext.SaveChanges();
            string putRequisitionResult = PutRequisitionItemStatus(imgReport.ImagingRequisitionId, imgReport.OrderStatus);
            return imgReport;
        }

        private object SendEmail(string ipDataStr, RbacUser currentUser)
        {
            RadEmailModel EmailModel = JsonConvert.DeserializeObject<RadEmailModel>(ipDataStr);

            var apiKey = (from param in _masterDBContext.CFGParameters
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
                    _masterDBContext.SendEmailDetails.Add(sendEmail);
                    _masterDBContext.SaveChanges();
                }

                return sendEmail;

            }
            else
            {
                throw new Exception("Failed");
            }
        }



        private object UpdateImagingReport(RbacUser currentUser)
        {
            var enableProviderEditInBillTxnItem = Convert.ToBoolean(Request.Form["enableProviderEditInBillTxnItem"]);
            var files = Request.Form.Files;
            var localFolder = Request.Form["localFolder"];
            var reportDetails = Request.Form["reportDetails"];
            var orderStatus = Request.Form["orderStatus"];
            ImagingReportModel imgReport = JsonConvert.DeserializeObject<ImagingReportModel>(reportDetails);

            using (TransactionScope trans = new TransactionScope())
            {
                try
                {
                    ImagingReportModel dbImgReport = _radiologyDbContext.ImagingReports
                .Where(r => r.ImagingReportId == imgReport.ImagingReportId).FirstOrDefault<ImagingReportModel>();

                    if (files.Count != 0)
                    {
                        imgReport = UploadReportFile(imgReport, files, localFolder);
                        dbImgReport.ImageName = imgReport.ImageName;
                        dbImgReport.ImageFullPath = imgReport.ImageFullPath;
                    }
                    if (!string.IsNullOrEmpty(dbImgReport.PatientStudyId))
                    {
                        List<int> patStudyIdList1 = dbImgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                        List<PatientStudyModel> dicom1 = (from pp in _dicomDbContext.PatientStudies
                                                          where patStudyIdList1.Contains(pp.PatientStudyId)
                                                          select pp).ToList();
                        dicom1.ForEach(pat =>
                        {
                            pat.IsMapped = false;
                            _dicomDbContext.PatientStudies.Attach(pat);
                            _dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                        });

                        _dicomDbContext.SaveChanges();

                    }

                    dbImgReport.ReportText = imgReport.ReportText;
                    dbImgReport.Indication = imgReport.Indication;
                    dbImgReport.RadiologyNo = imgReport.RadiologyNo;
                    dbImgReport.OrderStatus = orderStatus;
                    dbImgReport.PrescriberId = imgReport.PrescriberId;
                    dbImgReport.ReportTemplateId = imgReport.ReportTemplateId;
                    dbImgReport.PrescriberName = imgReport.PrescriberName;
                    dbImgReport.PatientStudyId = imgReport.PatientStudyId;
                    dbImgReport.ModifiedBy = currentUser.EmployeeId;
                    if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                    {
                        imgReport.PerformerId = imgReport.PerformerIdInBilling;
                        imgReport.PerformerName = imgReport.PerformerNameInBilling;
                    }
                    dbImgReport.ModifiedOn = DateTime.Now;
                    dbImgReport.Signatories = imgReport.Signatories;
                    _radiologyDbContext.Entry(dbImgReport).Property(u => u.CreatedBy).IsModified = false;
                    _radiologyDbContext.Entry(dbImgReport).Property(u => u.CreatedOn).IsModified = false;
                    _radiologyDbContext.Entry(dbImgReport).State = EntityState.Modified;
                    _radiologyDbContext.SaveChanges();

                    if (!string.IsNullOrEmpty(dbImgReport.PatientStudyId))
                    {
                        List<int> patStudyIdList = dbImgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                        List<PatientStudyModel> dicom = (from pp in _dicomDbContext.PatientStudies
                                                         where patStudyIdList.Contains(pp.PatientStudyId)
                                                         select pp).ToList();
                        dicom.ForEach(pat =>
                        {
                            pat.IsMapped = true;
                            _dicomDbContext.PatientStudies.Attach(pat);
                            _dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                        });
                        _dicomDbContext.SaveChanges();
                    }

                    string putRequisitionResult = PutRequisitionItemStatus(dbImgReport.ImagingRequisitionId, orderStatus);

                    List<SqlParameter> parametersList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", dbImgReport.ImagingRequisitionId),
                                                    new SqlParameter("@status", orderStatus.ToString())
                            };

                    DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", parametersList, _radiologyDbContext);

                    ImagingReportModel returnImgReport = new ImagingReportModel();

                    if (putRequisitionResult == "OK")
                    {

                        returnImgReport.ImagingReportId = dbImgReport.ImagingReportId;
                        returnImgReport.ImagingRequisitionId = dbImgReport.ImagingRequisitionId;
                        returnImgReport.ReportText = dbImgReport.ReportText;
                        returnImgReport.OrderStatus = dbImgReport.OrderStatus;

                        if (files.Count != 0)
                        {
                            returnImgReport.ImageFullPath = dbImgReport.ImageFullPath;
                            returnImgReport.ImageName = dbImgReport.ImageName;
                        }
                    }

                    ImagingRequisitionModel imgRequsition = _radiologyDbContext.ImagingRequisitions.Where(a => a.ImagingRequisitionId == imgReport.ImagingRequisitionId).FirstOrDefault();
                    imgRequsition.PrescriberId = imgReport.PrescriberId;
                    imgRequsition.PrescriberName = imgReport.PrescriberName;
                    _radiologyDbContext.Entry(imgRequsition).Property(u => u.PrescriberId).IsModified = true;
                    _radiologyDbContext.Entry(imgRequsition).Property(u => u.PrescriberName).IsModified = true;
                    _radiologyDbContext.SaveChanges();
                    if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                    {
                        List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@PerformerId", imgReport.PerformerId),
                                                    new SqlParameter("@PerformerName", imgReport.PerformerName),
                                                    new SqlParameter("@PrescriberId", imgReport.PrescriberId != null ? imgReport.PrescriberId : null),
                                                    new SqlParameter("@PrescriberName", imgReport.PrescriberName != null ? imgReport.PrescriberName : null)
                                                };
                        DataTable providerUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Update_RadiologyProvider_In_BillTransactionItem", paramList, _radiologyDbContext);
                    }
                    trans.Complete();
                    return returnImgReport;
                }
                catch (Exception ex)
                {
                    throw new Exception("Failed");
                }
            }
        }

        private object UpdateBillingStatus(string ipDataStr, RbacUser currentUser, string billingStatus)
        {
            List<Int32> requisitionIds = JsonConvert.DeserializeObject<List<Int32>>(ipDataStr);
            List<ImagingRequisitionModel> updatedImgReqs = new List<ImagingRequisitionModel>();

            foreach (var id in requisitionIds)
            {
                ImagingRequisitionModel dbImaging = _radiologyDbContext.ImagingRequisitions
                                        .Where(a => a.ImagingRequisitionId == id)
                                        .FirstOrDefault<ImagingRequisitionModel>();
                if (dbImaging != null)
                {
                    dbImaging.BillingStatus = billingStatus.ToLower();
                    dbImaging.ModifiedBy = currentUser.EmployeeId;
                    dbImaging.ModifiedOn = DateTime.Now;
                    _radiologyDbContext.Entry(dbImaging).State = EntityState.Modified;
                    updatedImgReqs.Add(dbImaging);
                }
            }
            _radiologyDbContext.SaveChanges();
            return updatedImgReqs;
        }

        private object UpdateReportImages(string ipDataStr)
        {
            ImagingReportModel imgReportClient = JsonConvert.DeserializeObject<ImagingReportModel>(ipDataStr);
            string filepath = imgReportClient.ImageFullPath;

            var AllimageNames = (from imgRpt in _radiologyDbContext.ImagingReports
                                 where imgRpt.ImagingReportId == imgReportClient.ImagingReportId
                                 select new { imageName = imgRpt.ImageName }).FirstOrDefault().imageName.ToString();

            imgReportClient.ImageFullPath = (imgReportClient.ImageName.Length > 0) ? imgReportClient.ImageFullPath : null;
            _radiologyDbContext.ImagingReports.Attach(imgReportClient);
            _radiologyDbContext.Entry(imgReportClient).Property(x => x.ImageFullPath).IsModified = true;
            _radiologyDbContext.Entry(imgReportClient).Property(x => x.ImageName).IsModified = true;
            _radiologyDbContext.SaveChanges();

            //delete files from folder
            List<string> imgsToSave = new List<string>(imgReportClient.ImageName.Split(';'));
            List<string> allImages = new List<string>(AllimageNames.Split(';'));
            imgsToSave.ForEach(itm =>
            {
                allImages.Remove(itm);//remove specieifed item.
            });
            allImages.ForEach(
                img =>
                {
                    string file = filepath + "\\" + img;
                    System.IO.File.Delete(file);
                });
            return imgReportClient;
        }

        private object UpdatePatientStudy(string ipDataStr)
        {
            ImagingReportModel imgReportClient = JsonConvert.DeserializeObject<ImagingReportModel>(ipDataStr);
            _radiologyDbContext.ImagingReports.Attach(imgReportClient);
            _radiologyDbContext.Entry(imgReportClient).Property(x => x.PatientStudyId).IsModified = true;
            _radiologyDbContext.SaveChanges();
            return imgReportClient;
        }

        private object CancelInpatientRadRequest(string ipDataStr, RbacUser currentUser)
        {
            using (var radDbContextTransaction = _radiologyDbContext.Database.BeginTransaction())
            {
                try
                {
                    BillingTransactionItemModel inpatientRadTest = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(ipDataStr);

                    BillingTransactionItemModel billItem = _radiologyDbContext.BillingTransactionItems
                                                            .Where(itm =>
                                                                    itm.RequisitionId == inpatientRadTest.RequisitionId
                                                                    && itm.ItemId == inpatientRadTest.ItemId
                                                                    && itm.PatientId == inpatientRadTest.PatientId
                                                                    && itm.PatientVisitId == inpatientRadTest.PatientVisitId
                                                                    && itm.BillingTransactionItemId == inpatientRadTest.BillingTransactionItemId
                                                                ).FirstOrDefault<BillingTransactionItemModel>();

                    _radiologyDbContext.BillingTransactionItems.Attach(billItem);

                    _radiologyDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                    _radiologyDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                    _radiologyDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                    _radiologyDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

                    billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                    billItem.CancelledBy = currentUser.EmployeeId;
                    billItem.CancelledOn = System.DateTime.Now;
                    billItem.CancelRemarks = inpatientRadTest.CancelRemarks;
                    _radiologyDbContext.SaveChanges();

                    ImagingRequisitionModel imgReq = _radiologyDbContext.ImagingRequisitions
                                                    .Where(req => req.ImagingRequisitionId == inpatientRadTest.RequisitionId
                                                        && req.BillingStatus.ToLower() != "paid"
                                                    ).FirstOrDefault<ImagingRequisitionModel>();

                    _radiologyDbContext.ImagingRequisitions.Attach(imgReq);

                    _radiologyDbContext.Entry(imgReq).Property(a => a.BillingStatus).IsModified = true;

                    imgReq.BillingStatus = "cancel";

                    _radiologyDbContext.SaveChanges();

                    radDbContextTransaction.Commit();

                    return imgReq;
                }
                catch (Exception ex)
                {
                    radDbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object UpdateDoctor(string ipDataStr, int prescriberId, string prescriberName)
        {
            int requisitionId = DanpheJSONConvert.DeserializeObject<int>(ipDataStr);
            ImagingReportModel imagingReport = (from report in _radiologyDbContext.ImagingReports
                                                where report.ImagingRequisitionId == requisitionId
                                                select report).FirstOrDefault();

            imagingReport.PrescriberName = prescriberName;

            if (prescriberId != 0)
            {
                imagingReport.PrescriberId = prescriberId;
                _radiologyDbContext.Entry(imagingReport).Property(ent => ent.PrescriberId).IsModified = true;
            }

            _radiologyDbContext.Entry(imagingReport).Property(ent => ent.PrescriberName).IsModified = true;

            _radiologyDbContext.SaveChanges();
            return prescriberName;
        }

        private object UpdatePatientScanData(string ipDataStr, RbacUser currentUser)
        {
            RadiologyScanDoneDetail scandetail = DanpheJSONConvert.DeserializeObject<RadiologyScanDoneDetail>(ipDataStr);

            bool radSettings = _coreDBContext.Parameters.Where(p => p.ParameterGroupName.ToLower() == "radiology"
                                         && p.ParameterName == "RadHoldIPBillBeforeScan").Select(d => ((d.ParameterValue == "1" || d.ParameterValue == "true") ? true : false)).FirstOrDefault();

            using (var radiologyTransactionScope = new TransactionScope())
            {
                try
                {
                    ImagingRequisitionModel imagingRequest = (from req in _radiologyDbContext.ImagingRequisitions
                                                              where req.ImagingRequisitionId == scandetail.ImagingRequisitionId
                                                              select req).FirstOrDefault();

                    imagingRequest.IsScanned = true;
                    imagingRequest.ScanRemarks = scandetail.Remarks;
                    imagingRequest.ScannedBy = currentUser.EmployeeId;
                    imagingRequest.ScannedOn = System.DateTime.Now;
                    imagingRequest.FilmTypeId = scandetail.FilmTypeId;
                    imagingRequest.FilmQuantity = scandetail.FilmQuantity;
                    imagingRequest.OrderStatus = ENUM_BillingOrderStatus.Pending;

                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.IsScanned).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.ScanRemarks).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.ScannedBy).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.ScannedOn).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.FilmTypeId).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.FilmQuantity).IsModified = true;
                    _radiologyDbContext.Entry(imagingRequest).Property(ent => ent.OrderStatus).IsModified = true;
                    _radiologyDbContext.SaveChanges();

                    List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", scandetail.ImagingRequisitionId),
                                                    new SqlParameter("@status", ENUM_BillingOrderStatus.Pending)
                                                };

                    DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", paramList, _radiologyDbContext);
                    radiologyTransactionScope.Complete();
                    return imagingRequest;
                }
                catch (Exception ex)
                {
                    radiologyTransactionScope.Dispose();
                    /*throw ex;*/
                    throw new Exception (ex.InnerException.Message);
                }
            }
        }



        #region reqType(Get)
        /*// GET: api/values
        [HttpGet]
        public string Get(int typeId,
            int patientVisitId,
            string reqType, int patientId,
            string reqOrderStatus,
            string reportOrderStatus,
            string billingStatus,
            string inputValue,
            int employeeId,
            int requisitionId,
            int id,
            bool isRequisitionReport,
             int imagingTypeId,
            int imagingReportId,
            string PatientStudyId,
            string typeList,
          DateTime? fromDate, DateTime? toDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                RadiologyDbContext radioDbContext = new RadiologyDbContext(base.connString);
                DicomDbContext dicomDbContext = new DicomDbContext(base.connStringPACSServer);
                CoreDbContext coreDBContext = new CoreDbContext(base.connString);
                //get for Master ImagingItems for search box
                if (inputValue != null && reqType == "allImagingItem")
                {
                    MasterDbContext masterContext = new MasterDbContext(base.connString);

                    List<RadiologyImagingItemModel> imgItemList = (from img in masterContext.ImagingItems

                                                                   where img.ImagingItemName.ToLower().Contains(inputValue.ToLower())
                                                                   select img).ToList();
                    responseData.Results = imgItemList;
                }

                //get patient's all imaingRequisition
                else if (patientId != 0 && reqType == "patientImagingRequisition")
                {

                    List<ImagingRequisitionModel> imgReqList = radioDbContext.ImagingRequisitions
                                            .Where(i => i.PatientId == patientId).OrderByDescending(i => i.ImagingDate).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgReqList;
                }
                else if (reqType == "getFilmTypeData")
                {
                    List<FilmTypeModel> filmTypes = (from filmType in radioDbContext.FilmType.Where(a => a.IsActive == true)
                                                     select filmType).ToList();
                    responseData.Status = "OK";
                    responseData.Results = filmTypes;
                }

                //get requisition items with status=active and report item with status=pending
                else if (reqType == "reqNReportListByStatus")
                {

                    List<object> imgReportList = new List<object>();
                    var dbReports =
                        (from i in radioDbContext.ImagingReports.AsEnumerable()
                         where i.OrderStatus == reportOrderStatus
                         join pat in radioDbContext.Patients.AsEnumerable()
                         on i.PatientId equals pat.PatientId
                         select new
                         {
                             ImagingReportId = i.ImagingReportId,
                             ImagingRequisitionId = i.ImagingRequisitionId,
                             PatientVisitId = i.PatientVisitId,
                             PatientId = i.PatientId,
                             ProviderName = i.PrescriberName,
                             ImagingTypeId = i.ImagingTypeId,
                             ImagingTypeName = i.ImagingTypeName,
                             ImagingItemId = i.ImagingItemId,
                             ImagingItemName = i.ImagingItemName,
                             ImageFullPath = i.ImageFullPath,
                             //ImageName = null,//i.ImageName,
                             //ReportText = null,//i.ReportText,
                             ReportingDoctorId = i.PrescriberId,
                             CreatedOn = i.CreatedOn,
                             OrderStatus = i.OrderStatus,
                             PatientStudyId = i.PatientStudyId,
                             Patient = new
                             {
                                 Age = i.Patient.Age,
                                 DateOfBirth = i.Patient.DateOfBirth,
                                 Gender = i.Patient.Gender,
                                 FirstName = i.Patient.FirstName,
                                 MiddleName = i.Patient.MiddleName,
                                 LastName = i.Patient.LastName,
                                 ShortName = i.Patient.FirstName + " " + (string.IsNullOrEmpty(i.Patient.MiddleName) ? "" : i.Patient.MiddleName + " ") + i.Patient.LastName,
                                 PatientCode = i.Patient.PatientCode,
                                 PatientId = i.Patient.PatientId,
                                 PhoneNumber = i.Patient.PhoneNumber,
                                 Address = i.Patient.Address
                             }
                         }).AsEnumerable()
                      .OrderByDescending(r => r.PatientId)
                   .ToList();

                    var imgReqList = (from s in radioDbContext.ImagingRequisitions.Include("Patient").AsEnumerable()
                                     .Where(x => x.OrderStatus == reqOrderStatus && x.BillingStatus == billingStatus)
                                      select new
                                      {
                                          ImagingRequisitionId = s.ImagingRequisitionId,
                                          PatientVisitId = s.PatientVisitId,
                                          PatientId = s.PatientId,
                                          ProviderName = s.PrescriberName,
                                          ImagingTypeId = s.ImagingTypeId,
                                          ImagingTypeName = s.ImagingTypeName,
                                          ImagingItemId = s.ImagingItemId,
                                          ImagingItemName = s.ImagingItemName,
                                          ProcedureCode = s.ProcedureCode,
                                          ImagingDate = s.ImagingDate,
                                          RequisitionRemarks = s.RequisitionRemarks,
                                          OrderStatus = s.OrderStatus,
                                          ProviderId = s.PrescriberId,
                                          BillingStatus = s.BillingStatus,
                                          Urgency = s.Urgency,
                                          Patient = new
                                          {
                                              Age = s.Patient.Age,
                                              DateOfBirth = s.Patient.DateOfBirth,
                                              Gender = s.Patient.Gender,
                                              FirstName = s.Patient.FirstName,
                                              MiddleName = s.Patient.MiddleName,
                                              LastName = s.Patient.LastName,
                                              ShortName = s.Patient.FirstName + " " + (string.IsNullOrEmpty(s.Patient.MiddleName) ? "" : s.Patient.MiddleName + " ") + s.Patient.LastName,
                                              PatientCode = s.Patient.PatientCode,
                                              PatientId = s.Patient.PatientId,
                                              PhoneNumber = s.Patient.PhoneNumber,
                                              Address = s.Patient.Address
                                          }
                                      }).AsEnumerable()
                      .OrderByDescending(y => y.ImagingDate)
                     .ToList();

                    //adding both the Requisition List and Report List to same array imgReportList
                    if (dbReports.Count != 0)
                    {
                        dbReports.ForEach(report =>
                        {
                            imgReportList.Add(report);
                        });
                    }
                    if (imgReqList.Count != 0)
                    {
                        imgReqList.ForEach(imgReq =>
                        {
                            var imgReport = new
                            {

                                ImagingItemId = imgReq.ImagingItemId,
                                ImagingItemName = imgReq.ImagingItemName,
                                ImagingRequisitionId = imgReq.ImagingRequisitionId,
                                ImagingTypeId = imgReq.ImagingTypeId,
                                ImagingReportId = 0,
                                ImagingTypeName = imgReq.ImagingTypeName,
                                OrderStatus = imgReq.OrderStatus,
                                PatientId = imgReq.PatientId,
                                PatientVisitId = imgReq.PatientVisitId,
                                ProviderName = imgReq.ProviderName,
                                ReportingDoctorId = 0,
                                CreatedOn = imgReq.ImagingDate,
                                //nbb- for minimizing network load, reportText call via separate get method by reportItemId
                                //var rptTemplate = reportTemplateList.Find(x => x.ImagingItemId == imgReq.ImagingItemId);
                                //if (rptTemplate != null)
                                //{
                                //    imgReport.ReportText = rptTemplate.reportText;
                                //}                           
                                Patient = new
                                {
                                    Age = imgReq.Patient.Age,
                                    DateOfBirth = imgReq.Patient.DateOfBirth,
                                    Gender = imgReq.Patient.Gender,
                                    FirstName = imgReq.Patient.FirstName,
                                    MiddleName = imgReq.Patient.MiddleName,
                                    LastName = imgReq.Patient.LastName,
                                    ShortName = imgReq.Patient.ShortName,
                                    PatientCode = imgReq.Patient.PatientCode,
                                    PatientId = imgReq.Patient.PatientId,
                                    PhoneNumber = imgReq.Patient.PhoneNumber,
                                    Address = imgReq.Patient.Address
                                }
                            };
                            imgReportList.Add(imgReport);
                        });
                    }

                    responseData.Status = "OK";
                    responseData.Results = imgReportList;

                }

                //sud:4Feb'18--We needed to include provisional, unpaid, paid in the requisition list.. 
                //so copied and modified above reqTypereq reqNReportListByStatus
                else if (reqType == "getRequisitionsList")
                {

                    List<object> imgReportList = new List<object>();
                    Dictionary<string, bool> radSettings = coreDBContext.Parameters.Where(p => p.ParameterGroupName.ToLower() == "radiology"
                                                 && (p.ParameterName == "EnableRadScan" || p.ParameterName == "RadHoldIPBillBeforeScan"
                                                 || p.ParameterName == "RAD_AttachFileButtonShowHide"))
                                                .ToDictionary(k => k.ParameterName, d => ((d.ParameterValue == "1" || d.ParameterValue == "true") ? true : false));

                    bool EnableRadScan = radSettings["EnableRadScan"];
                    bool RadHoldIPBillBeforeScan = radSettings["RadHoldIPBillBeforeScan"];
                    bool IsShowButton = radSettings["RAD_AttachFileButtonShowHide"];

                    List<int> imgValidTypeList = DanpheJSONConvert.DeserializeObject<List<int>>(typeList);

                    var dbReports =
                        (from i in radioDbContext.ImagingReports
                         join requisition in radioDbContext.ImagingRequisitions on i.ImagingRequisitionId equals requisition.ImagingRequisitionId
                         where i.OrderStatus == reportOrderStatus && (requisition.BillingStatus.ToLower() == "paid"
                         || requisition.BillingStatus.ToLower() == "unpaid"
                         || requisition.BillingStatus.ToLower() == "provisional")
                          && (DbFunctions.TruncateTime(requisition.CreatedOn) >= fromDate && DbFunctions.TruncateTime(requisition.CreatedOn) <= toDate)
                         && imgValidTypeList.Contains(requisition.ImagingTypeId.Value)
                         join pat in radioDbContext.Patients
                         on i.PatientId equals pat.PatientId
                         join mun in radioDbContext.Muncipality 
                         on pat.MunicipalityId equals mun.MunicipalityId into g
                         from municipality in g.DefaultIfEmpty()
                         join con in radioDbContext.CountrySubDivision
                         on pat.CountrySubDivisionId equals con.CountrySubDivisionId into h
                         from CountrySubDivision in h.DefaultIfEmpty()
                         select new
                         {
                             ImagingReportId = i.ImagingReportId,
                             ImagingRequisitionId = i.ImagingRequisitionId,
                             PatientVisitId = i.PatientVisitId,
                             PatientId = i.PatientId,
                             PrescriberName = ((i.PrescriberName != null) && i.PrescriberName.Length > 0) ? i.PrescriberName : "self",
                             PerformerId = i.PerformerId,
                             PerformerName = i.PerformerName,
                             ImagingTypeId = i.ImagingTypeId,
                             ImagingTypeName = i.ImagingTypeName,
                             ImagingItemId = i.ImagingItemId,
                             ImagingItemName = i.ImagingItemName,
                             ImageFullPath = i.ImageFullPath,
                             //ImageName = null,//i.ImageName,
                             //ReportText = null,//i.ReportText,                             
                             PrescriberId = i.PrescriberId,
                             ProviderId = i.PrescriberId,
                             CreatedOn = i.CreatedOn,
                             OrderStatus = i.OrderStatus,
                             PatientStudyId = i.PatientStudyId,
                             Indication = i.Indication,
                             RadiologyNo = i.RadiologyNo,
                             Signatories = i.Signatories,
                             IsScanned = true,
                             ScannedBy = requisition.ScannedBy,
                             ScannedOn = requisition.ScannedOn,
                             WardName = requisition.WardName,
                             IsActive = requisition.IsActive,
                             HasInsurance = requisition.HasInsurance,
                             IsShowButton = IsShowButton,
                             IsReportSaved = requisition.IsReportSaved,
                             Patient = new
                             {
                                 Age = i.Patient.Age,
                                 DateOfBirth = i.Patient.DateOfBirth,
                                 Gender = i.Patient.Gender,
                                 FirstName = i.Patient.FirstName,
                                 MiddleName = i.Patient.MiddleName,
                                 LastName = i.Patient.LastName,
                                 ShortName = i.Patient.FirstName + " " + (string.IsNullOrEmpty(i.Patient.MiddleName) ? "" : i.Patient.MiddleName + " ") + i.Patient.LastName,
                                 PatientCode = i.Patient.PatientCode,
                                 PatientId = i.Patient.PatientId,
                                 PhoneNumber = i.Patient.PhoneNumber,
                                 Address = i.Patient.Address,
                                 Municipality = municipality.MunicipalityName,
                                 CountrySubDivision = CountrySubDivision.CountrySubDivisionName
                             }
                         }).OrderByDescending(r => r.PatientId).ToList();


                    var imgReqList = (from req in radioDbContext.ImagingRequisitions.Include("Patient")
                                      join billItem in radioDbContext.BillingTransactionItems on req.ImagingRequisitionId equals billItem.RequisitionId
                                      join serDept in radioDbContext.ServiceSepartments on billItem.ServiceDepartmentId equals serDept.ServiceDepartmentId
                                      where serDept.IntegrationName == "Radiology" && (EnableRadScan ? (req.OrderStatus == reqOrderStatus || req.OrderStatus == reportOrderStatus) : req.OrderStatus == reqOrderStatus)
                                      && (req.BillingStatus.ToLower() == "paid" || req.BillingStatus.ToLower() == "unpaid" || req.BillingStatus.ToLower() == "provisional")
                                          && (DbFunctions.TruncateTime(req.CreatedOn) >= fromDate && DbFunctions.TruncateTime(req.CreatedOn) <= toDate)
                                          && imgValidTypeList.Contains(req.ImagingTypeId.Value)
                                          && (req.IsReportSaved != true)
                                      join mun in radioDbContext.Muncipality
                                      on req.Patient.MunicipalityId equals mun.MunicipalityId into g
                                      from municipality in g.DefaultIfEmpty()
                                      join con in radioDbContext.CountrySubDivision
                                      on req.Patient.CountrySubDivisionId equals con.CountrySubDivisionId into h
                                      from CountrySubDivision in h.DefaultIfEmpty()
                                      select new
                                      {
                                          ImagingRequisitionId = req.ImagingRequisitionId,
                                          PatientVisitId = req.PatientVisitId,
                                          PatientId = req.PatientId,
                                          PrescriberName = ((req.PrescriberName != null) && req.PrescriberName.Length > 0) ? req.PrescriberName : "self",
                                          PerformerId = billItem.PerformerId,
                                          PerformerName = billItem.PerformerName,
                                          ImagingTypeId = req.ImagingTypeId,
                                          ImagingTypeName = req.ImagingTypeName,
                                          ImagingItemId = req.ImagingItemId,
                                          ImagingItemName = req.ImagingItemName,
                                          ProcedureCode = req.ProcedureCode,
                                          ImagingDate = req.ImagingDate,
                                          RequisitionRemarks = req.RequisitionRemarks,
                                          OrderStatus = req.OrderStatus,
                                          PrescriberId = req.PrescriberId,
                                          BillingStatus = req.BillingStatus,
                                          Urgency = req.Urgency,
                                          HasInsurance = req.HasInsurance,
                                          WardName = req.WardName,
                                          IsActive = req.IsActive,
                                          IsScanned = EnableRadScan ? req.IsScanned : true,
                                          ScannedBy = req.ScannedBy,
                                          ScannedOn = req.ScannedOn,
                                          IsShowButton = IsShowButton,
                                          Patient = new
                                          {
                                              Age = req.Patient.Age,
                                              DateOfBirth = req.Patient.DateOfBirth,
                                              Gender = req.Patient.Gender,
                                              FirstName = req.Patient.FirstName,
                                              MiddleName = req.Patient.MiddleName,
                                              LastName = req.Patient.LastName,
                                              ShortName = req.Patient.FirstName + " " + (string.IsNullOrEmpty(req.Patient.MiddleName) ? "" : req.Patient.MiddleName + " ") + req.Patient.LastName,
                                              PatientCode = req.Patient.PatientCode,
                                              PatientId = req.Patient.PatientId,
                                              PhoneNumber = req.Patient.PhoneNumber,
                                              Address = req.Patient.Address,
                                              Municipality = municipality.MunicipalityName,
                                              CountrySubDivision = CountrySubDivision.CountrySubDivisionName

                                          }
                                      }).OrderByDescending(y => y.ImagingDate).ToList();

                    //adding both the Requisition List and Report List to same array imgReportList
                    if (dbReports.Count != 0)
                    {
                        dbReports.ForEach(report =>
                        {
                            imgReportList.Add(report);
                        });
                    }
                    if (imgReqList.Count != 0)
                    {
                        imgReqList.ForEach(imgReq =>
                        {
                            var imgReport = new
                            {

                                ImagingItemId = imgReq.ImagingItemId,
                                ImagingItemName = imgReq.ImagingItemName,
                                ImagingRequisitionId = imgReq.ImagingRequisitionId,
                                ImagingTypeId = imgReq.ImagingTypeId,
                                ImagingReportId = 0,
                                ImagingTypeName = imgReq.ImagingTypeName,
                                OrderStatus = imgReq.OrderStatus,
                                PatientId = imgReq.PatientId,
                                PatientVisitId = imgReq.PatientVisitId,
                                PrescriberName = imgReq.PrescriberName,
                                ReportingDoctorId = 0,
                                CreatedOn = imgReq.ImagingDate,
                                PrescriberId = imgReq.PrescriberId,
                                PerformerId = imgReq.PerformerId,
                                PerformerName = imgReq.PerformerName,
                                WardName = imgReq.WardName,
                                IsActive = imgReq.IsActive,
                                HasInsurance = imgReq.HasInsurance,
                                IsScanned = imgReq.IsScanned,
                                ScannedBy = imgReq.ScannedBy,
                                ScannedOn = imgReq.ScannedOn,
                                IsShowButton = imgReq.IsShowButton,
                                //nbb- for minimizing network load, reportText call via separate get method by reportItemId
                                //var rptTemplate = reportTemplateList.Find(x => x.ImagingItemId == imgReq.ImagingItemId);
                                //if (rptTemplate != null)
                                //{
                                //    imgReport.ReportText = rptTemplate.reportText;
                                //}                           
                                Patient = new
                                {
                                    Age = imgReq.Patient.Age,
                                    DateOfBirth = imgReq.Patient.DateOfBirth,
                                    Gender = imgReq.Patient.Gender,
                                    FirstName = imgReq.Patient.FirstName,
                                    MiddleName = imgReq.Patient.MiddleName,
                                    LastName = imgReq.Patient.LastName,
                                    ShortName = imgReq.Patient.ShortName,
                                    PatientCode = imgReq.Patient.PatientCode,
                                    PatientId = imgReq.Patient.PatientId,
                                    PhoneNumber = imgReq.Patient.PhoneNumber,
                                    Address = imgReq.Patient.Address,
                                    Municipality = imgReq.Patient.Municipality,
                                    CountrySubDivision = imgReq.Patient.CountrySubDivision
                                }
                            };
                            imgReportList.Add(imgReport);
                        });
                    }
                    
                    responseData.Status = "OK";
                    responseData.Results = imgReportList;

                }


                //get all patient's imaging reports--for radiologist to view.. 
                else if (reqType == "allImagingReports")
                {
                    List<int> imgValidTypeList = DanpheJSONConvert.DeserializeObject<List<int>>(typeList);
                    List<ImagingReportViewModel> imgReportList = (from report in radioDbContext.ImagingReports
                                                                  join requisition in radioDbContext.ImagingRequisitions on report.ImagingRequisitionId equals requisition.ImagingRequisitionId
                                                                  join patient in radioDbContext.Patients on report.PatientId equals patient.PatientId
                                                                  //join doc in radioDbContext.ReportingDoctors on report.ReportingDoctorId equals doc.ReportingDoctorId into docTemp
                                                                  //from repDoc in docTemp.DefaultIfEmpty()
                                                                  where report.OrderStatus == reportOrderStatus
                                                                  && (requisition.BillingStatus.ToLower() == "paid" || requisition.BillingStatus.ToLower() == "unpaid" || requisition.BillingStatus.ToLower() == "provisional")
                                                                  && (DbFunctions.TruncateTime(report.CreatedOn) >= fromDate && DbFunctions.TruncateTime(report.CreatedOn) <= toDate)
                                                                  && imgValidTypeList.Contains(requisition.ImagingTypeId.Value)
                                                                  select new ImagingReportViewModel
                                                                  {
                                                                      ImagingReportId = report.ImagingReportId,
                                                                      ImagingRequisitionId = report.ImagingRequisitionId,
                                                                      ImagingTypeName = report.ImagingTypeName,
                                                                      ImagingItemName = report.ImagingItemName,
                                                                      CreatedOn = report.CreatedOn,
                                                                      ReportText = null,// report.ReportText,
                                                                      ImageName = report.ImageName,
                                                                      PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                                      //DoctorSignatureJSON = repDoc.DoctorSignatureJSON,
                                                                      Signatories = report.Signatories,
                                                                      DateOfBirth = patient.DateOfBirth,
                                                                      Gender = patient.Gender,
                                                                      PhoneNumber = patient.PhoneNumber,
                                                                      PatientCode = patient.PatientCode,
                                                                      Address = patient.Address,
                                                                      PatientStudyId = report.PatientStudyId,
                                                                      PrescriberName = requisition.PrescriberName,
                                                                      PrescriberId = requisition.PrescriberId,
                                                                      PerformerId = report.PerformerId,
                                                                      PerformerName = report.PerformerName,
                                                                      Indication = report.Indication,
                                                                      RadiologyNo = report.RadiologyNo,
                                                                      HasInsurance = requisition.HasInsurance,
                                                                      IsActive = requisition.IsActive
                                                                  }).OrderByDescending(b => b.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgReportList;
                }
                else if (reqType == "imagingReportByRequisitionId")
                {
                    MasterDbContext masterContext = new MasterDbContext(base.connString);
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                    string base64String = null;

                    var user = (from emp in masterContext.Employees
                                join dpt in masterContext.Departments on emp.DepartmentId equals dpt.DepartmentId
                                where emp.EmployeeId == currentUser.EmployeeId && dpt.DepartmentName.ToLower() == "radiology"
                                select emp).FirstOrDefault();
                    var fileName = user == null ? null : user.SignatoryImageName;

                    if (fileName != null)
                    {
                        var path = (from master in masterContext.CFGParameters
                                    where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
                                    select master.ParameterValue).FirstOrDefault();

                        string signatoryImagePath = path + fileName;

                        using (Image image = Image.FromFile(signatoryImagePath))
                        {
                            using (MemoryStream m = new MemoryStream())
                            {
                                image.Save(m, image.RawFormat);
                                byte[] imageBytes = m.ToArray();

                                // Convert byte[] to Base64 String
                                base64String = Convert.ToBase64String(imageBytes);
                            }
                        }
                    }


                    ImagingReportViewModel imgReport = (from report in radioDbContext.ImagingReports
                                                        join patient in radioDbContext.Patients on report.PatientId equals patient.PatientId
                                                        join req in radioDbContext.ImagingRequisitions on report.ImagingRequisitionId equals req.ImagingRequisitionId
                                                        join countrySudDivision in radioDbContext.CountrySubDivision on patient.CountrySubDivisionId equals countrySudDivision.CountrySubDivisionId into csd
                                                        from countrySudDivision in csd.DefaultIfEmpty()
                                                        join muncipality in radioDbContext.Muncipality on patient.MunicipalityId equals muncipality.MunicipalityId into mun
                                                        from muncipality in mun.DefaultIfEmpty()

                                                            //join doc in radioDbContext.ReportingDoctors on report.ReportingDoctorId equals doc.ReportingDoctorId into docTemp
                                                            //from repDoc in docTemp.DefaultIfEmpty()
                                                        where report.ImagingRequisitionId == requisitionId
                                                        select new ImagingReportViewModel
                                                        {
                                                            PatientId = report.PatientId,//sud:14Jan'19--needed for edit report.
                                                            ReportTemplateId = report.ReportTemplateId,
                                                            ImagingReportId = report.ImagingReportId,
                                                            ImagingRequisitionId = report.ImagingRequisitionId,//sud:14Jan'19--needed for edit report.

                                                            ImagingTypeName = report.ImagingTypeName,
                                                            ImagingItemName = report.ImagingItemName,
                                                            CreatedOn = report.CreatedOn,
                                                            BillingDate = req.CreatedOn,
                                                            ReportText = report.ReportText,
                                                            ImageName = report.ImageName,
                                                            PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                            Address = patient.Address,
                                                            Muncipality = muncipality.MunicipalityName == null ? null : muncipality.MunicipalityName,
                                                            CountrySubDivision = countrySudDivision.CountrySubDivisionName == null ? null : countrySudDivision.CountrySubDivisionName,
                                                            PatientNameLocal = patient.PatientNameLocal,
                                                            //DoctorSignatureJSON = repDoc.DoctorSignatureJSON,
                                                            Signatories = report.Signatories,
                                                            DateOfBirth = patient.DateOfBirth,
                                                            PhoneNumber = patient.PhoneNumber,
                                                            PatientCode = patient.PatientCode,
                                                            Gender = patient.Gender,
                                                            PrescriberName = report.PrescriberName,
                                                            PatientStudyId = report.PatientStudyId,
                                                            PerformerId = report.PerformerId,
                                                            Indication = report.Indication,
                                                            RadiologyNo = report.RadiologyNo,
                                                            HasInsurance = (from req in radioDbContext.ImagingRequisitions
                                                                            where req.ImagingRequisitionId == requisitionId
                                                                            select req.HasInsurance).FirstOrDefault(),

                                                            //can't use below assignments since it gives LINQ error: non static method requires a target
                                                            //SignatoryImageBase64 = base64String,
                                                            //currentLoggedInUserSignature = user != null ? user.LongSignature : null
                                                            //FooterText = report.ReportTemplateId == null ? null : (from rep in radioDbContext.RadiologyReportTemplate
                                                            //                                                       where rep.TemplateId == report.ReportTemplateId
                                                            //                                                       select rep.FooterNote).FirstOrDefault()


                                                        }).FirstOrDefault();
                    responseData.Status = "OK";

                    if (imgReport.ReportTemplateId != null)
                    {

                        var rptTemplate = radioDbContext.RadiologyReportTemplate.Where(r => r.TemplateId == imgReport.ReportTemplateId).FirstOrDefault();

                        if (rptTemplate != null)
                        {
                            imgReport.TemplateName = rptTemplate.TemplateName;
                            imgReport.FooterText = rptTemplate.FooterNote;
                            imgReport.SignatoryImageBase64 = base64String;
                            imgReport.currentLoggedInUserSignature = user != null ? user.LongSignature : null;
                            //SignatoryImageBase64 = base64String,
                            //currentLoggedInUserSignature = user != null ? user.LongSignature : null
                        }

                    }

                    responseData.Results = imgReport;
                }
                //get result from report table
                else if (patientId != 0 && reqType == "imagingResult")
                {
                    List<ImagingReportViewModel> imgReportList = (from report in radioDbContext.ImagingReports
                                                                  join patient in radioDbContext.Patients on report.PatientId equals patient.PatientId
                                                                  //join doc in radioDbContext.ReportingDoctors on report.ReportingDoctorId equals doc.ReportingDoctorId into docTemp
                                                                  //from repDoc in docTemp.DefaultIfEmpty()
                                                                  where report.PatientId == patientId && report.OrderStatus == reportOrderStatus
                                                                  select new ImagingReportViewModel
                                                                  {
                                                                      ImagingReportId = report.ImagingReportId,
                                                                      ImagingRequisitionId = report.ImagingRequisitionId,
                                                                      ImagingTypeName = report.ImagingTypeName,
                                                                      ImagingItemName = report.ImagingItemName,
                                                                      CreatedOn = report.CreatedOn,
                                                                      ReportText = report.ReportText,
                                                                      ImageName = report.ImageName,
                                                                      PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                                      //DoctorSignatureJSON = repDoc.DoctorSignatureJSON,
                                                                      DateOfBirth = patient.DateOfBirth,
                                                                      Gender = patient.Gender,
                                                                  }).OrderByDescending(b => b.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgReportList;
                }
                else if (patientVisitId != 0 && reqType == "imagingResult-visit")
                {

                    //var imgReportList = radioDbContext.ImagingReports
                    //                        .Where(i => i.PatientVisitId == patientVisitId && i.OrderStatus == "final")
                    //                        .OrderByDescending(i => i.CreatedOn).ToList();

                    var imgReportList = radioDbContext.ImagingReports
                                            .Where(i => i.PatientVisitId == patientVisitId && i.OrderStatus == "final")
                                            .GroupBy(a => a.ImagingItemId)
                                            .Select(b => new {
                                                latestUniqueImagings = b.OrderByDescending(i => i.CreatedOn).FirstOrDefault()
                                            })
                                            .Select(c => new
                                            {
                                                c.latestUniqueImagings
                                            })
                                            .ToList();

                    List<ImagingReportModel> tempImg = new List<ImagingReportModel>();
                    imgReportList.ForEach(a =>
                    {
                        tempImg.Add(a.latestUniqueImagings);
                    });

                    responseData.Status = "OK";
                    responseData.Results = tempImg;
                }
                else if (reqType == "getImagingType")
                {
                    MasterDbContext masterContext = new MasterDbContext(base.connString);

                    List<RadiologyImagingTypeModel> allImaging = (from app in masterContext.ImagingTypes
                                                                  select app)
                                                .Include(a => a.ImagingItems).ToList();


                    responseData.Status = "OK";
                    responseData.Results = allImaging;
                }
                else if (reqType == "allImagingItems")
                {

                    List<RadiologyImagingItemModel> allImgItems = (from app in radioDbContext.ImagingItems
                                                                   select app).ToList();


                    responseData.Status = "OK";
                    responseData.Results = allImgItems;
                }

                //get reportText, imageName, imageFolderPath 
                else if (reqType == "reportDetail")
                {
                    ///needs revision on below code, possible duplicates---sud:13Apr'18

                    //get reportTemplate from master table because it requisition report
                    if (isRequisitionReport)
                    {
                        //get report templates from templateMaster table
                        var rptTemp = (from rptTemplate in radioDbContext.RadiologyReportTemplate
                                       join imgItm in radioDbContext.ImagingItems
                                       on rptTemplate.TemplateId equals imgItm.TemplateId
                                       where imgItm.ImagingItemId == id  //here id work as ImagingItemId
                                       select rptTemplate).FirstOrDefault();

                        if (rptTemp != null)
                        {
                            responseData.Results = new
                            {
                                TemplateName = rptTemp.TemplateName,
                                ReportTemplateId = rptTemp.TemplateId,
                                ReportText = rptTemp.TemplateHTML,
                                ImageFullPath = string.Empty,
                                ImageName = string.Empty
                            };
                        }
                    }
                    //template get from Report table because it's saved report
                    else
                    {
                        ImagingReportModel report = new ImagingReportModel();
                        //get report details from Report table by ReportItemId
                        report = (from rpt in radioDbContext.ImagingReports
                                  where rpt.ImagingReportId == id  //here is work as ImagingReportId
                                  select rpt
                                 ).FirstOrDefault();

                        var scannedDate = (from req in radioDbContext.ImagingRequisitions
                                           where req.ImagingRequisitionId == report.ImagingRequisitionId  //here is work as ImagingReportId
                                           select req.ScannedOn
                                            ).FirstOrDefault();


                        var reptTemplate = (from rpt in radioDbContext.ImagingReports
                                            join temp in radioDbContext.RadiologyReportTemplate
                                            on rpt.ReportTemplateId equals temp.TemplateId
                                            where rpt.ImagingReportId == id
                                            select temp).FirstOrDefault();

                        var tempName = reptTemplate != null ? reptTemplate.TemplateName : "Not Set";

                        //If report Text is empty then take reportTemplate from TemplateMaster table
                        if (report.ReportText.Length <= 0)
                        {
                            var repTemp = (from temp in radioDbContext.RadiologyReportTemplate
                                           join imgItm in radioDbContext.ImagingItems
                                           on temp.TemplateId equals imgItm.TemplateId
                                           where imgItm.ImagingItemId == report.ImagingItemId
                                           select temp
                                    ).FirstOrDefault();
                            if (repTemp != null)
                            {
                                report.ReportText = repTemp.TemplateHTML;
                                report.ReportTemplateId = repTemp.TemplateId;
                            }

                        }

                        responseData.Results = new
                        {
                            TemplateName = tempName,
                            ReportTemplateId = report.ReportTemplateId,
                            ReportText = report.ReportText,
                            ImageFullPath = report.ImageFullPath,
                            ImageName = report.ImageName,
                            ScannedOn = scannedDate
                        };
                    }
                    responseData.Status = "OK";
                }
                //get Imaging file list from pac server for post to patient report
                else if (reqType == "imgingFileListFromPACS")
                {
                    var imgingFileListFromPACS = (from imgFile in dicomDbContext.PatientStudies.AsEnumerable()
                                                  where imgFile.CreatedOn.Value.Date >= fromDate && imgFile.CreatedOn <= toDate
                                                  select new
                                                  {
                                                      PatientStudyId = imgFile.PatientStudyId,
                                                      PatientName = imgFile.PatientName,
                                                      Modality = imgFile.Modality,
                                                      StudyDate = String.Format("{0:dd/MM/yyyy}", imgFile.StudyDate),
                                                      CreatedOn = String.Format("{0:dd/MM/yyyy HH:mm:ss}", imgFile.CreatedOn),
                                                      StudyDescription = imgFile.StudyDescription
                                                  }).ToList().OrderByDescending(v => v.CreatedOn);


                    responseData.Status = "OK";
                    responseData.Results = imgingFileListFromPACS;
                }
                else if (reqType == "reporting-doctor")
                {

                    //List<ReportingDoctorModel> reportingDoctors = (from repDoc in radioDbContext.ReportingDoctors
                    //                                               where repDoc.ImagingTypeId == imagingTypeId && repDoc.IsActive == true
                    //                                               select repDoc).ToList();


                    //responseData.Status = "OK";
                    //responseData.Results = reportingDoctors;
                }
                else if (reqType == "all-report-templates")
                {

                    List<RadiologyReportTemplateModel> allReports = (from rep in radioDbContext.RadiologyReportTemplate
                                                                     where rep.IsActive == true && rep.ModuleName == "Radiology"
                                                                     select rep).ToList();


                    responseData.Status = "OK";
                    responseData.Results = allReports;
                }
                else if (reqType == "reportTextByRPTId")
                {
                    var reportText = (from rpt in radioDbContext.ImagingReports.AsEnumerable()
                                      where rpt.ImagingReportId == imagingReportId
                                      select rpt.ReportText
                                      ).SingleOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = reportText;
                }
                else if (reqType == "dicomViewerUrl" && imagingReportId > 0)
                {
                    if (PatientStudyId.Length > 0)
                    {
                        string dicomViewerUrl = (from parameter in coreDBContext.Parameters
                                                 where parameter.ParameterGroupName == "Dicom" && parameter.ParameterName == "dicomViewerUrl"
                                                 select parameter.ParameterValue
                                             ).SingleOrDefault();
                        responseData.Results = dicomViewerUrl;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.ErrorMessage = "Images not attached";
                        responseData.Status = "Failed";
                    }
                }
                else if (reqType == "dicomImageLoaderUrl")
                {
                    string dicomViewerUrl = (from parameter in coreDBContext.Parameters
                                             where parameter.ParameterName == "DicomImageLoaderUrl"
                                             select parameter.ParameterValue
                                         ).SingleOrDefault();
                    responseData.Results = dicomViewerUrl;
                    responseData.Status = "OK";
                }

                else if (reqType == "get-dicom-image-list")
                {


                    // List<string> patStudyIdList = new List<string>(PatientStudyId.Split(',')).ToList();

                    if (string.IsNullOrEmpty(PatientStudyId) || PatientStudyId == "undefined" || PatientStudyId == "null")
                    {
                        var dicomImg = (from patStudy in dicomDbContext.PatientStudies
                                        where patStudy.IsMapped != true
                                        select new
                                        {
                                            PatientId = patStudy.PatientId,
                                            PatientName = patStudy.PatientName,
                                            PatientStudyId = patStudy.PatientStudyId,
                                            StudyDate = patStudy.StudyDate,
                                            CreatedOn = patStudy.CreatedOn,
                                            IsMapped = patStudy.IsMapped,
                                        }).ToList();



                        responseData.Status = "OK";
                        responseData.Results = dicomImg;
                    }
                    else
                    {
                        List<int> patStudyIdList = string.IsNullOrEmpty(PatientStudyId) ? new List<int>() : PatientStudyId.Split(',').Select(int.Parse).ToList();
                        // List<string> patStudyIdList = new List<string>(PatientStudyId.Split(',')).ToList();
                        var dicomImg1 = (from patStudy in dicomDbContext.PatientStudies
                                         where patStudy.IsMapped != true || patStudyIdList.Contains(patStudy.PatientStudyId)
                                         select new
                                         {
                                             PatientId = patStudy.PatientId,
                                             PatientName = patStudy.PatientName,
                                             PatientStudyId = patStudy.PatientStudyId,
                                             StudyDate = patStudy.StudyDate,
                                             CreatedOn = patStudy.CreatedOn,
                                             IsMapped = patStudy.IsMapped,
                                         }).ToList();



                        responseData.Status = "OK";
                        responseData.Results = dicomImg1;
                    }

                }

                else if (reqType == "doctor-list")
                {
                    ////sud: 15Jun'18 -- removed departmentjoin as IsAppointmentApplicable field is now added in Employee Level as well.
                    //MasterDbContext mstDBContext = new MasterDbContext(connString);
                    //var doctorList = (from e in mstDBContext.Employees
                    //                  join d in mstDBContext.Departments
                    //                  on e.DepartmentId equals d.DepartmentId
                    //                  where d.IsAppointmentApplicable == true
                    //                  select e).ToList();

                    List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                    List<EmployeeModel> doctorList = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                     && emp.IsAppointmentApplicable == true).ToList();

                    responseData.Status = "OK";
                    responseData.Results = doctorList;
                }
                else if (reqType == "getImagingTypes")
                {
                    var types = radioDbContext.ImagingTypes.Where(i => i.IsActive == true).ToList();
                    responseData.Status = "OK";
                    responseData.Results = types;
                }
                else
                {
                    responseData.ErrorMessage = "invalid request type";
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }*/
        #endregion

        #region reqType(Post)
        /*[HttpPost]
        public string Post()
        {
            //send the response in single format. object since we're returning 2 different types of Models.
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                //string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                //post imaging requistion items.
                RadiologyDbContext dbContext = new RadiologyDbContext(base.connString);
                DicomDbContext dicomDbContext = new DicomDbContext(base.connStringPACSServer);

             

                if (reqType == "postRequestItems")
                {
                    string str = this.ReadPostData();
                    List<ImagingRequisitionModel> imgrequests = JsonConvert.DeserializeObject<List<ImagingRequisitionModel>>(str);
                    MasterDbContext masterContext = new MasterDbContext(base.connString);

                    PatientDbContext patientContext = new PatientDbContext(connString);

                    //getting the imagingtype because imagingtypename is needed in billing for getting service department
                    List<RadiologyImagingTypeModel> Imgtype = masterContext.ImagingTypes
                                        .ToList<RadiologyImagingTypeModel>();

                    var notValidForReportingItem = masterContext.ImagingItems.Where(i => i.IsValidForReporting == false).Select(m => m.ImagingItemId);

                    if (imgrequests != null && imgrequests.Count > 0)
                    {
                        foreach (var req in imgrequests)
                        {
                            req.ImagingDate = System.DateTime.Now;
                            req.CreatedOn = DateTime.Now;
                            req.CreatedBy = currentUser.EmployeeId;
                            req.IsActive = true;
                            if (req.PrescriberId != null && req.PrescriberId != 0)
                            {
                                var emp = dbContext.Employees.Where(a => a.EmployeeId == req.PrescriberId).FirstOrDefault();
                                req.PrescriberName = emp.FullName;
                            }
                            if (req.ImagingTypeId != null)
                            {
                                req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                                req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                                //req.WardName = ;
                            }
                            else
                            {
                                req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName.ToLower() == req.ImagingTypeName.ToLower()).Select(a => a.ImagingTypeId).FirstOrDefault();
                            }
                            if (!notValidForReportingItem.Contains(req.ImagingItemId.Value))
                            {
                                dbContext.ImagingRequisitions.Add(req);
                            }
                        }
                        dbContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = imgrequests;
                    }
                    else
                    {
                        responseData.ErrorMessage = "imgrequests is null";
                        responseData.Status = "Failed";
                    }
                }

                //post Imaging Report Items along with Imaging Report File
                else if (reqType == "postReport")
                {
                    var files = this.ReadFiles();
                    var localFolder = Request.Form["localFolder"];
                    var reportDetails = Request.Form["reportDetails"];
                    var orderStatus = Request.Form["orderStatus"];
                    var enableProviderEditInBillTxnItem = Convert.ToBoolean(Request.Form["enableProviderEditInBillTxnItem"]);
                    ImagingReportModel imgReport = DanpheJSONConvert.DeserializeObject<ImagingReportModel>(reportDetails);

                    using (TransactionScope trans = new TransactionScope())
                    {
                        //checks if some report file is present and calls UploadReportFile function if necessary.
                        if (files.Count != 0)
                        {
                            //returns Imaging Report Object after updating Imaging Name and ImagingFullPath
                            imgReport = UploadReportFile(imgReport, files, localFolder);
                        }
                       
                        imgReport.CreatedBy = currentUser.EmployeeId;
                        imgReport.OrderStatus = orderStatus;
                        if(enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                        {
                            imgReport.PerformerId = imgReport.PerformerIdInBilling;
                            imgReport.PerformerName = imgReport.PerformerNameInBilling;
                        }
                        imgReport.CreatedOn = System.DateTime.Now;
                        dbContext.ImagingReports.Add(imgReport);

                        //List<int> patImg = new List<int>(imgReport.PatientStudyId.Split(','));


                        if (imgReport.PatientStudyId != null)
                        {

                            List<int> patStudyIdList = imgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                            List<PatientStudyModel> dicom = (from pp in dicomDbContext.PatientStudies
                                                             where patStudyIdList.Contains(pp.PatientStudyId)
                                                             select pp).ToList();

                            dicom.ForEach(pat =>
                            {
                                pat.IsMapped = true;
                                dicomDbContext.PatientStudies.Attach(pat);
                                dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                            });


                            dicomDbContext.SaveChanges();


                        }
                        dbContext.SaveChanges();

                        //update OrderStatus of the corresponding requisition item in ImagingRequisition Table
                        string putRequisitionResult = PutRequisitionItemStatus(imgReport.ImagingRequisitionId, orderStatus);

                        if (putRequisitionResult == "OK")
                        {
                            //return to client
                            responseData.Status = "OK";

                            ImagingReportModel returnImgReport = new ImagingReportModel();
                            returnImgReport.ReportText = imgReport.ReportText;
                            returnImgReport.ImagingReportId = imgReport.ImagingReportId;
                            returnImgReport.OrderStatus = imgReport.OrderStatus;
                            returnImgReport.Indication = imgReport.Indication;
                            returnImgReport.RadiologyNo = imgReport.RadiologyNo;
                            returnImgReport.ImagingRequisitionId = imgReport.ImagingRequisitionId;
                            if (files.Count != 0)
                            {
                                returnImgReport.ImageFullPath = imgReport.ImageFullPath;
                                returnImgReport.ImageName = imgReport.ImageName;
                            }

                            List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@status", orderStatus.ToString())
                                                };

                            DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", paramList, dbContext);
                            RadiologyDbContext dbContextUpdate = new RadiologyDbContext(base.connString);
                            ImagingRequisitionModel imgRequsition = dbContextUpdate.ImagingRequisitions.Where(a => a.ImagingRequisitionId == imgReport.ImagingRequisitionId).FirstOrDefault();
                            imgRequsition.PrescriberId = imgReport.PrescriberId;
                            imgRequsition.PrescriberName = imgReport.PrescriberName;
                            dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberId).IsModified = true;
                            dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberName).IsModified = true;
                            dbContextUpdate.SaveChanges();
                            if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                            {
                                List<SqlParameter> paramListToUpdatePerformer = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@PerformerId", imgReport.PerformerId != null ? imgReport.PerformerId : null),
                                                    new SqlParameter("@PerformerName", imgReport.PerformerName != null ? imgReport.PerformerName : null),
                                                    new SqlParameter("@PrescriberId", imgReport.PrescriberId != null ? imgReport.PrescriberId : null),
                                                    new SqlParameter("@PrescriberName", imgReport.PrescriberName != null ? imgReport.PrescriberName : null)
                                                };

                                DataTable providerUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Update_RadiologyProvider_In_BillTransactionItem", paramListToUpdatePerformer, dbContext);
                            }

                            trans.Complete();

                            responseData.Results = returnImgReport;
                        }
                        //if update of RequisitionItem OrderStatus Fails.
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = putRequisitionResult;
                        }
                    }
                }
                //post report with patient study details
                else if (reqType == "postPatientStudy")
                {
                    string str = this.ReadPostData();
                    ImagingReportModel imgReport = DanpheJSONConvert.DeserializeObject<ImagingReportModel>(str);
                    imgReport.CreatedOn = System.DateTime.Now;
                    imgReport.CreatedBy = currentUser.EmployeeId;
                    dbContext.ImagingReports.Add(imgReport);
                    dbContext.SaveChanges();
                    string putRequisitionResult = PutRequisitionItemStatus(imgReport.ImagingRequisitionId, imgReport.OrderStatus);
                    responseData.Status = "OK";
                    responseData.Results = imgReport;
                }
                else if (reqType == "sendEmail")
                {
                    string str = this.ReadPostData();
                    MasterDbContext masterContext = new MasterDbContext(base.connString);
                    RadEmailModel EmailModel = JsonConvert.DeserializeObject<RadEmailModel>(str);

                    var apiKey = (from param in masterContext.CFGParameters
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
                            masterContext.SendEmailDetails.Add(sendEmail);
                            masterContext.SaveChanges();
                        }

                        responseData.Status = "OK";

                    }
                    else
                    {
                        responseData.Status = "Failed";
                    }


                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Invalid request type";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }*/
        #endregion

        #region reqType(Put)
        /*[HttpPut]
        public string Put()
        {
            //send the response in single format
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                DicomDbContext dicomDbContext = new DicomDbContext(base.connStringPACSServer);
                string reqType = this.ReadQueryStringData("reqType");
                string billingStatus = this.ReadQueryStringData("billingStatus");
                string prescriberName = this.ReadQueryStringData("prescriberName");
                int prescriberId = ToInt(this.ReadQueryStringData("prescriberId"));
                var localFolder = Request.Form["localFolder"];
                var reportDetails = Request.Form["reportDetails"];
                var orderStatus = Request.Form["orderStatus"];

                RadiologyDbContext dbContextUpdate = new RadiologyDbContext(base.connString);
                CoreDbContext coreDbContext = new CoreDbContext(base.connString);
                if (reqType == "updateImgReport" && !string.IsNullOrEmpty(reportDetails))
                {
                    var enableProviderEditInBillTxnItem = Convert.ToBoolean(Request.Form["enableProviderEditInBillTxnItem"]);
                    var files = Request.Form.Files;
                    ImagingReportModel imgReport = JsonConvert.DeserializeObject<ImagingReportModel>(reportDetails);

                    using (TransactionScope trans = new TransactionScope())
                    {

                        try
                        {
                            ImagingReportModel dbImgReport = dbContextUpdate.ImagingReports
                        .Where(r => r.ImagingReportId == imgReport.ImagingReportId).FirstOrDefault<ImagingReportModel>();

                            if (files.Count != 0)
                            {
                                //calling UploadReportFile function which returns ImagingReportModel object
                                imgReport = UploadReportFile(imgReport, files, localFolder);
                                dbImgReport.ImageName = imgReport.ImageName;
                                dbImgReport.ImageFullPath = imgReport.ImageFullPath;
                            }
                            if (!string.IsNullOrEmpty(dbImgReport.PatientStudyId))
                            {
                                List<int> patStudyIdList1 = dbImgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                                List<PatientStudyModel> dicom1 = (from pp in dicomDbContext.PatientStudies
                                                                  where patStudyIdList1.Contains(pp.PatientStudyId)
                                                                  select pp).ToList();

                                dicom1.ForEach(pat =>
                                {
                                    pat.IsMapped = false;
                                    dicomDbContext.PatientStudies.Attach(pat);
                                    dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                                });


                                dicomDbContext.SaveChanges();

                            }

                            dbImgReport.ReportText = imgReport.ReportText;
                            dbImgReport.Indication = imgReport.Indication;
                            dbImgReport.RadiologyNo = imgReport.RadiologyNo;
                            dbImgReport.OrderStatus = orderStatus;
                            dbImgReport.PrescriberId = imgReport.PrescriberId;
                            dbImgReport.ReportTemplateId = imgReport.ReportTemplateId;
                            dbImgReport.PrescriberName = imgReport.PrescriberName;
                            dbImgReport.PatientStudyId = imgReport.PatientStudyId;
                            dbImgReport.ModifiedBy = currentUser.EmployeeId;
                            if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                            {
                                imgReport.PerformerId = imgReport.PerformerIdInBilling;
                                imgReport.PerformerName = imgReport.PerformerNameInBilling;
                            }
                            dbImgReport.ModifiedOn = DateTime.Now;
                            dbImgReport.Signatories = imgReport.Signatories;//sud:14Jan'19---corrected for edit report feature.
                            dbContextUpdate.Entry(dbImgReport).Property(u => u.CreatedBy).IsModified = false;
                            dbContextUpdate.Entry(dbImgReport).Property(u => u.CreatedOn).IsModified = false;
                            dbContextUpdate.Entry(dbImgReport).State = EntityState.Modified;
                            dbContextUpdate.SaveChanges();

                            if (!string.IsNullOrEmpty(dbImgReport.PatientStudyId))
                            {

                                List<int> patStudyIdList = dbImgReport.PatientStudyId.Split(',').Select(int.Parse).ToList();
                                List<PatientStudyModel> dicom = (from pp in dicomDbContext.PatientStudies
                                                                 where patStudyIdList.Contains(pp.PatientStudyId)
                                                                 select pp).ToList();

                                dicom.ForEach(pat =>
                                {
                                    pat.IsMapped = true;
                                    dicomDbContext.PatientStudies.Attach(pat);
                                    dicomDbContext.Entry(pat).Property(u => u.IsMapped).IsModified = true;
                                });


                                dicomDbContext.SaveChanges();
                            }


                            //update OrderStatus of the corresponding requisition item in ImagingRequisition Table
                            string putRequisitionResult = PutRequisitionItemStatus(dbImgReport.ImagingRequisitionId, orderStatus);

                            List<SqlParameter> parametersList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", dbImgReport.ImagingRequisitionId),
                                                    new SqlParameter("@status", orderStatus.ToString())
                            };

                            DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", parametersList, dbContextUpdate);

                            if (putRequisitionResult == "OK")
                            {
                                //return to client
                                responseData.Status = "OK";

                                ImagingReportModel returnImgReport = new ImagingReportModel();
                                returnImgReport.ImagingReportId = dbImgReport.ImagingReportId;
                                returnImgReport.ImagingRequisitionId = dbImgReport.ImagingRequisitionId;
                                returnImgReport.ReportText = dbImgReport.ReportText;
                                returnImgReport.OrderStatus = dbImgReport.OrderStatus;

                                if (files.Count != 0)
                                {
                                    returnImgReport.ImageFullPath = dbImgReport.ImageFullPath;
                                    returnImgReport.ImageName = dbImgReport.ImageName;
                                }
                                responseData.Results = returnImgReport;
                            }

                            ImagingRequisitionModel imgRequsition = dbContextUpdate.ImagingRequisitions.Where(a => a.ImagingRequisitionId == imgReport.ImagingRequisitionId).FirstOrDefault();
                            imgRequsition.PrescriberId = imgReport.PrescriberId;
                            imgRequsition.PrescriberName = imgReport.PrescriberName;
                            dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberId).IsModified = true;
                            dbContextUpdate.Entry(imgRequsition).Property(u => u.PrescriberName).IsModified = true;
                            dbContextUpdate.SaveChanges();
                            if (enableProviderEditInBillTxnItem && imgReport.PerformerIdInBilling.HasValue)
                            {
                                List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@RequisitionId", imgReport.ImagingRequisitionId),
                                                    new SqlParameter("@PerformerId", imgReport.PerformerId),
                                                    new SqlParameter("@PerformerName", imgReport.PerformerName),
                                                    new SqlParameter("@PrescriberId", imgReport.PrescriberId != null ? imgReport.PrescriberId : null),
                                                    new SqlParameter("@PrescriberName", imgReport.PrescriberName != null ? imgReport.PrescriberName : null)
                                                };

                                DataTable providerUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Update_RadiologyProvider_In_BillTransactionItem", paramList, dbContextUpdate);
                            }

                            trans.Complete();
                        }
                        catch (Exception ex)
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.InnerException.Message;
                            throw ex;
                        }

                    }
                }

                //update billingStatus
                else if (reqType == "billingStatus")
                {
                    //string str = Request.Form.Keys.First<string>();
                    string str = this.ReadPostData();
                    List<Int32> requisitionIds = JsonConvert.DeserializeObject<List<Int32>>(str);
                    List<ImagingRequisitionModel> updatedImgReqs = new List<ImagingRequisitionModel>();

                    foreach (var id in requisitionIds)
                    {
                        ImagingRequisitionModel dbImaging = dbContextUpdate.ImagingRequisitions
                                                .Where(a => a.ImagingRequisitionId == id)
                                                .FirstOrDefault<ImagingRequisitionModel>();
                        if (dbImaging != null)
                        {
                            dbImaging.BillingStatus = billingStatus.ToLower();
                            dbImaging.ModifiedBy = currentUser.EmployeeId;
                            dbImaging.ModifiedOn = DateTime.Now;
                            dbContextUpdate.Entry(dbImaging).State = EntityState.Modified;
                            updatedImgReqs.Add(dbImaging);
                        }
                    }

                    dbContextUpdate.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = updatedImgReqs;
                }
                //update ImageName and Imagefullpath field in imagingReport
                else if (reqType == "deleteRptImages")
                {
                    string str = this.ReadPostData();
                    ImagingReportModel imgReportClient = JsonConvert.DeserializeObject<ImagingReportModel>(str);
                    string filepath = imgReportClient.ImageFullPath;

                    var AllimageNames = (from imgRpt in dbContextUpdate.ImagingReports
                                         where imgRpt.ImagingReportId == imgReportClient.ImagingReportId
                                         select new { imageName = imgRpt.ImageName }).FirstOrDefault().imageName.ToString();

                    imgReportClient.ImageFullPath = (imgReportClient.ImageName.Length > 0) ? imgReportClient.ImageFullPath : null;
                    dbContextUpdate.ImagingReports.Attach(imgReportClient);
                    dbContextUpdate.Entry(imgReportClient).Property(x => x.ImageFullPath).IsModified = true;
                    dbContextUpdate.Entry(imgReportClient).Property(x => x.ImageName).IsModified = true;
                    dbContextUpdate.SaveChanges();

                    //delete files from folder
                    List<string> imgsToSave = new List<string>(imgReportClient.ImageName.Split(';'));
                    List<string> allImages = new List<string>(AllimageNames.Split(';'));
                    imgsToSave.ForEach(itm =>
                    {
                        allImages.Remove(itm);//remove specieifed item.
                    });
                    allImages.ForEach(
                        img =>
                        {
                            string file = filepath + "\\" + img;
                            System.IO.File.Delete(file);
                        });
                    responseData.Status = "OK";
                    responseData.Results = imgReportClient;
                }
                else if (reqType == "updatePatientStudy")
                {
                    string str = this.ReadPostData();
                    ImagingReportModel imgReportClient = JsonConvert.DeserializeObject<ImagingReportModel>(str);
                    dbContextUpdate.ImagingReports.Attach(imgReportClient);
                    dbContextUpdate.Entry(imgReportClient).Property(x => x.PatientStudyId).IsModified = true;
                    dbContextUpdate.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = imgReportClient;
                }
                else if (reqType == "cancelInpatientRadRequest")
                {

                    using (var radDbContextTransaction = dbContextUpdate.Database.BeginTransaction())
                    {
                        try
                        {
                            string str = this.ReadPostData();
                            BillingTransactionItemModel inpatientRadTest = DanpheJSONConvert.DeserializeObject<BillingTransactionItemModel>(str);

                            BillingTransactionItemModel billItem = dbContextUpdate.BillingTransactionItems
                                                                    .Where(itm =>
                                                                            itm.RequisitionId == inpatientRadTest.RequisitionId
                                                                            && itm.ItemId == inpatientRadTest.ItemId
                                                                            && itm.PatientId == inpatientRadTest.PatientId
                                                                            && itm.PatientVisitId == inpatientRadTest.PatientVisitId
                                                                            && itm.BillingTransactionItemId == inpatientRadTest.BillingTransactionItemId
                                                                        ).FirstOrDefault<BillingTransactionItemModel>();

                            dbContextUpdate.BillingTransactionItems.Attach(billItem);

                            dbContextUpdate.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                            dbContextUpdate.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                            dbContextUpdate.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                            dbContextUpdate.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

                            billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                            billItem.CancelledBy = currentUser.EmployeeId;
                            billItem.CancelledOn = System.DateTime.Now;
                            billItem.CancelRemarks = inpatientRadTest.CancelRemarks;
                            dbContextUpdate.SaveChanges();



                            ImagingRequisitionModel imgReq = dbContextUpdate.ImagingRequisitions
                                                            .Where(req => req.ImagingRequisitionId == inpatientRadTest.RequisitionId
                                                                && req.BillingStatus.ToLower() != "paid"
                                                            ).FirstOrDefault<ImagingRequisitionModel>();


                            dbContextUpdate.ImagingRequisitions.Attach(imgReq);

                            dbContextUpdate.Entry(imgReq).Property(a => a.BillingStatus).IsModified = true;

                            imgReq.BillingStatus = "cancel";

                            dbContextUpdate.SaveChanges();

                            radDbContextTransaction.Commit();

                            responseData.Status = "OK";

                        }
                        catch (Exception ex)
                        {
                            radDbContextTransaction.Rollback();
                            throw (ex);
                        }
                    }
                }
                else if (reqType == "UpdateDoctor")
                {
                    string str = this.ReadPostData();
                    int requisitionId = DanpheJSONConvert.DeserializeObject<int>(str);
                    ImagingReportModel imagingReport = (from report in dbContextUpdate.ImagingReports
                                                        where report.ImagingRequisitionId == requisitionId
                                                        select report).FirstOrDefault();

                    imagingReport.PrescriberName = prescriberName;
                    if (prescriberId != 0)
                    {
                        imagingReport.PrescriberId = prescriberId;
                        dbContextUpdate.Entry(imagingReport).Property(ent => ent.PrescriberId).IsModified = true;
                    }

                    dbContextUpdate.Entry(imagingReport).Property(ent => ent.PrescriberName).IsModified = true;

                    dbContextUpdate.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = prescriberName;
                }
                else if (reqType == "updateRadPatScanData")
                {
                    string str = this.ReadPostData();
                    RadiologyScanDoneDetail scandetail = DanpheJSONConvert.DeserializeObject<RadiologyScanDoneDetail>(str);

                    bool radSettings = coreDbContext.Parameters.Where(p => p.ParameterGroupName.ToLower() == "radiology"
                                                 && p.ParameterName == "RadHoldIPBillBeforeScan").Select(d => ((d.ParameterValue == "1" || d.ParameterValue == "true") ? true : false)).FirstOrDefault();

                    using (TransactionScope trans = new TransactionScope())
                    {
                        try
                        {
                            ImagingRequisitionModel imagingRequest = (from req in dbContextUpdate.ImagingRequisitions
                                                                      where req.ImagingRequisitionId == scandetail.ImagingRequisitionId
                                                                      select req).FirstOrDefault();


                            imagingRequest.IsScanned = true;
                            imagingRequest.ScanRemarks = scandetail.Remarks;
                            imagingRequest.ScannedBy = currentUser.EmployeeId;
                            imagingRequest.ScannedOn = System.DateTime.Now;
                            imagingRequest.FilmTypeId = scandetail.FilmTypeId;
                            imagingRequest.FilmQuantity = scandetail.FilmQuantity;
                            imagingRequest.OrderStatus = ENUM_BillingOrderStatus.Pending;


                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.IsScanned).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.ScanRemarks).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.ScannedBy).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.ScannedOn).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.FilmTypeId).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.FilmQuantity).IsModified = true;
                            dbContextUpdate.Entry(imagingRequest).Property(ent => ent.OrderStatus).IsModified = true;

                            dbContextUpdate.SaveChanges();


                            List<SqlParameter> paramList = new List<SqlParameter>(){
                                                    new SqlParameter("@reqID", scandetail.ImagingRequisitionId),
                                                    new SqlParameter("@status", ENUM_BillingOrderStatus.Pending)
                                                };

                            DataTable statusUpdated = DALFunctions.GetDataTableFromStoredProc("SP_Bill_OrderStatusUpdate_Radiology", paramList, dbContextUpdate);

                            trans.Complete();

                            responseData.Status = "OK";
                            responseData.Results = imagingRequest;
                        }
                        catch (Exception ex)
                        {
                            responseData.ErrorMessage = "invalid request type or requisition ids";
                            responseData.Status = "Failed";
                            throw ex;

                        }
                    }


                }
                else
                {
                    responseData.ErrorMessage = "invalid request type or requisition ids";
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }*/
        #endregion


        //uploads Imaging Report File and returns Imaging Report Object after updating ImageName and ImageFullPath
        private ImagingReportModel UploadReportFile(ImagingReportModel imgReport, IFormFileCollection files, string localFolder)
        {
            DanpheHTTPResponse<object> uploadResponse = FileUploader.Upload(files, localFolder);
            string filePath = null;
            if (uploadResponse.Status == "OK")
            {
                filePath = uploadResponse.Results.ToString(); //Results contains the filepath

                //storing filename
                if (!String.IsNullOrEmpty(imgReport.ImageName))
                {
                    foreach (var file in files)
                    {
                        imgReport.ImageName = imgReport.ImageName + ";" + file.FileName;
                    }

                }

                else if (files.Count > 1 && String.IsNullOrEmpty(imgReport.ImageName))
                {
                    //ImageName contains names of multiple images seperated by ';'
                    foreach (var file in files)
                    {
                        imgReport.ImageName = imgReport.ImageName + file.FileName + ";";
                        //imgReport.ImageName = imgReport.ImageName.Remove(imgReport.ImageName.Length - 1);
                    }
                }
                else
                    imgReport.ImageName = files[0].FileName;

                //remove the last semicolon ';' from filename.
                if (!String.IsNullOrEmpty(imgReport.ImageName))
                {
                    if (imgReport.ImageName[imgReport.ImageName.Length - 1] == ';')
                    {
                        imgReport.ImageName = imgReport.ImageName.Remove(imgReport.ImageName.Length - 1);
                    }
                }

                imgReport.ImageFullPath = filePath;

                //returns imgReport after updating ImageName and ImageFullPath
                return imgReport;
            }
            //if upload fails
            else
            {
                throw new Exception(uploadResponse.ErrorMessage);
            }
        }

        //common postreport function called from both post image and post report only
        [HttpPost]
        [Route("PostReport")]
        public DanpheHTTPResponse<object> PostReport(ImagingReportModel imgreport,
            IFormFileCollection files = null,
            string filePath = "")
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (imgreport != null)
                {
                    imgreport.CreatedOn = System.DateTime.Now;
                    if (files != null)
                    {
                        //ImageName contains names of multiple images seperated by ';'
                        foreach (var file in files)
                            imgreport.ImageName = imgreport.ImageName + file.FileName + ':';
                        imgreport.ImageName = imgreport.ImageName.Remove(imgreport.ImageName.Length - 1);

                        imgreport.ImageFullPath = filePath;
                    }
                    _radiologyDbContext.ImagingReports.Add(imgreport);
                    _radiologyDbContext.SaveChanges();
                    responseData.Status = "OK";
                    ImagingReportModel returnImgReport = new ImagingReportModel();
                    returnImgReport.ImagingReportId = imgreport.ImagingReportId;
                    responseData.Results = returnImgReport;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return responseData;
        }

        private string PutRequisitionItemStatus(int requisitionId, string orderStatus)
        {
            try
            {
                ImagingRequisitionModel reqItem = _radiologyDbContext.ImagingRequisitions
                                        .Where(a => a.ImagingRequisitionId == requisitionId)
                                        .FirstOrDefault<ImagingRequisitionModel>();
                if (reqItem != null)
                {
                    reqItem.OrderStatus = orderStatus.ToLower();
                    reqItem.IsReportSaved = true;
                    _radiologyDbContext.Entry(reqItem).State = EntityState.Modified;
                    _radiologyDbContext.SaveChanges();
                    return ENUM_Danphe_HTTP_ResponseStatus.OK;
                }
                else
                    return "Cannot match any item with this requisitionId";
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }
    }
}
