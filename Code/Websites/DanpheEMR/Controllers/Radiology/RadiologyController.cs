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
using System.Xml;
using DanpheEMR.Security;
using DanpheEMR.Core;
using DanpheEMR.Core.Caching;
using System.Drawing;
using System.Net.Mail;
using DanpheEMR.Services;

namespace DanpheEMR.Controllers
{
    public class RadiologyController : CommonController
    {
        public IEmailService _emailService;

        public RadiologyController(IOptions<MyConfiguration> _config, IEmailService emailService) : base(_config)
        {
            _emailService = emailService;
        }

        // GET: api/values
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
                             ProviderName = i.ProviderName,
                             ImagingTypeId = i.ImagingTypeId,
                             ImagingTypeName = i.ImagingTypeName,
                             ImagingItemId = i.ImagingItemId,
                             ImagingItemName = i.ImagingItemName,
                             ImageFullPath = i.ImageFullPath,
                             //ImageName = null,//i.ImageName,
                             //ReportText = null,//i.ReportText,
                             ReportingDoctorId = i.ReportingDoctorId,
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
                                          ProviderName = s.ProviderName,
                                          ImagingTypeId = s.ImagingTypeId,
                                          ImagingTypeName = s.ImagingTypeName,
                                          ImagingItemId = s.ImagingItemId,
                                          ImagingItemName = s.ImagingItemName,
                                          ProcedureCode = s.ProcedureCode,
                                          ImagingDate = s.ImagingDate,
                                          RequisitionRemarks = s.RequisitionRemarks,
                                          OrderStatus = s.OrderStatus,
                                          ProviderId = s.ProviderId,
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
                             ProviderName = i.ProviderName,
                             ImagingTypeId = i.ImagingTypeId,
                             ImagingTypeName = i.ImagingTypeName,
                             ImagingItemId = i.ImagingItemId,
                             ImagingItemName = i.ImagingItemName,
                             ImageFullPath = i.ImageFullPath,
                             //ImageName = null,//i.ImageName,
                             //ReportText = null,//i.ReportText,                             
                             ReportingDoctorId = i.ReportingDoctorId,
                             ProviderId = i.ReportingDoctorId,
                             CreatedOn = i.CreatedOn,
                             OrderStatus = i.OrderStatus,
                             PatientStudyId = i.PatientStudyId,
                             Indication = i.Indication,
                             Signatories = i.Signatories,
                             HasInsurance = (from req in radioDbContext.ImagingRequisitions
                                             where req.ImagingRequisitionId == i.ImagingRequisitionId
                                             select req.HasInsurance).FirstOrDefault(),
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
                                     .Where(x => x.OrderStatus == reqOrderStatus
                                          && (x.BillingStatus.ToLower() == "paid" || x.BillingStatus.ToLower() == "unpaid" || x.BillingStatus.ToLower() == "provisional"))
                                      select new
                                      {
                                          ImagingRequisitionId = s.ImagingRequisitionId,
                                          PatientVisitId = s.PatientVisitId,
                                          PatientId = s.PatientId,
                                          ProviderName = s.ProviderName,
                                          ImagingTypeId = s.ImagingTypeId,
                                          ImagingTypeName = s.ImagingTypeName,
                                          ImagingItemId = s.ImagingItemId,
                                          ImagingItemName = s.ImagingItemName,
                                          ProcedureCode = s.ProcedureCode,
                                          ImagingDate = s.ImagingDate,
                                          RequisitionRemarks = s.RequisitionRemarks,
                                          OrderStatus = s.OrderStatus,
                                          ProviderId = s.ProviderId,
                                          BillingStatus = s.BillingStatus,
                                          Urgency = s.Urgency,
                                          HasInsurance = s.HasInsurance,
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
                                ProviderId = imgReq.ProviderId,
                                HasInsurance = imgReq.HasInsurance,
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


                //get all patient's imaging reports--for radiologist to view.. 
                else if (reqType == "allImagingReports")
                {

                    List<ImagingReportViewModel> imgReportList = (from report in radioDbContext.ImagingReports
                                                                  join requisition in radioDbContext.ImagingRequisitions on report.ImagingRequisitionId equals requisition.ImagingRequisitionId
                                                                  join patient in radioDbContext.Patients on report.PatientId equals patient.PatientId
                                                                  //join doc in radioDbContext.ReportingDoctors on report.ReportingDoctorId equals doc.ReportingDoctorId into docTemp
                                                                  //from repDoc in docTemp.DefaultIfEmpty()
                                                                  where report.OrderStatus == reportOrderStatus
                                                                  && (DbFunctions.TruncateTime(requisition.CreatedOn) >= fromDate && DbFunctions.TruncateTime(requisition.CreatedOn) <= toDate)
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
                                                                      ProviderName = requisition.ProviderName,
                                                                      ReportingDoctorId = report.ReportingDoctorId,
                                                                      ReportingDoctorName = report.ProviderName,
                                                                      Indication = report.Indication,
                                                                      HasInsurance = requisition.HasInsurance
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
                                                            ReportText = report.ReportText,
                                                            ImageName = report.ImageName,
                                                            PatientName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName,
                                                            Address = patient.Address,
                                                            //DoctorSignatureJSON = repDoc.DoctorSignatureJSON,
                                                            Signatories = report.Signatories,
                                                            DateOfBirth = patient.DateOfBirth,
                                                            PhoneNumber = patient.PhoneNumber,
                                                            PatientCode = patient.PatientCode,
                                                            Gender = patient.Gender,
                                                            ProviderName = report.ProviderName,
                                                            PatientStudyId = report.PatientStudyId,
                                                            ReportingDoctorId = report.ReportingDoctorId,
                                                            Indication = report.Indication,
                                                            HasInsurance = (from req in radioDbContext.ImagingRequisitions
                                                                            where req.ImagingRequisitionId== requisitionId
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

                    var imgReportList = radioDbContext.ImagingReports
                                            .Where(i => i.PatientVisitId == patientVisitId && i.OrderStatus == "final")
                                            .OrderByDescending(i => i.CreatedOn).ToList();
                    responseData.Status = "OK";
                    responseData.Results = imgReportList;
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
                            ImageName = report.ImageName
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
                    var types = radioDbContext.ImagingTypes.ToList();
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

        }

        [HttpPost]
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

                    //getting the imagingtype because imagingtypename is needed in billing for getting service department
                    List<RadiologyImagingTypeModel> Imgtype = masterContext.ImagingTypes
                                        .ToList<RadiologyImagingTypeModel>();

                    if (imgrequests != null && imgrequests.Count > 0)
                    {
                        foreach (var req in imgrequests)
                        {
                            req.ImagingDate = System.DateTime.Now;
                            req.CreatedOn = DateTime.Now;
                            req.CreatedBy = currentUser.EmployeeId;
                            if (req.ProviderId != null && req.ProviderId != 0)
                            {
                                var emp = dbContext.Employees.Where(a => a.EmployeeId == req.ProviderId).FirstOrDefault();
                                req.ProviderName = emp.FullName;
                            }
                            if (req.ImagingTypeId != null)
                            {
                                req.ImagingTypeName = Imgtype.Where(a => a.ImagingTypeId == req.ImagingTypeId).Select(a => a.ImagingTypeName).FirstOrDefault();
                                req.Urgency = string.IsNullOrEmpty(req.Urgency) ? "normal" : req.Urgency;
                            }
                            else
                            {
                                req.ImagingTypeId = Imgtype.Where(a => a.ImagingTypeName == req.ImagingTypeName).Select(a => a.ImagingTypeId).FirstOrDefault();
                            }
                            dbContext.ImagingRequisitions.Add(req);
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
                    ImagingReportModel imgReport = DanpheJSONConvert.DeserializeObject<ImagingReportModel>(reportDetails);

                    //checks if some report file is present and calls UploadReportFile function if necessary.
                    if (files.Count != 0)
                    {
                        //returns Imaging Report Object after updating Imaging Name and ImagingFullPath
                        imgReport = UploadReportFile(imgReport, files, localFolder);
                    }

                    imgReport.CreatedBy = currentUser.EmployeeId;
                    imgReport.OrderStatus = orderStatus;
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
                        returnImgReport.ImagingRequisitionId = imgReport.ImagingRequisitionId;
                        if (files.Count != 0)
                        {
                            returnImgReport.ImageFullPath = imgReport.ImageFullPath;
                            returnImgReport.ImageName = imgReport.ImageName;
                        }
                        responseData.Results = returnImgReport;
                    }
                    //if update of RequisitionItem OrderStatus Fails.
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = putRequisitionResult;
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

                    if (!EmailModel.SendPdf)
                    {
                        EmailModel.PdfBase64 = null;
                        EmailModel.AttachmentFileName = null;
                    }

                    if (!EmailModel.SendHtml)
                    {
                        EmailModel.PlainContent = "";
                    }

                    var response = _emailService.SendEmail(EmailModel.SenderEmailAddress,EmailModel.EmailList, 
                        EmailModel.SenderTitle, EmailModel.Subject, EmailModel.PlainContent, 
                        EmailModel.HtmlContent, EmailModel.PdfBase64, EmailModel.AttachmentFileName);

                    responseData.Status = "OK";
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
        }

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
                    foreach (var file in files)
                        imgReport.ImageName = imgReport.ImageName + ";" + file.FileName;
                else if (files.Count > 1 && String.IsNullOrEmpty(imgReport.ImageName))
                {
                    //ImageName contains names of multiple images seperated by ';'
                    foreach (var file in files)
                        imgReport.ImageName = imgReport.ImageName + file.FileName + ";";
                    imgReport.ImageName = imgReport.ImageName.Remove(imgReport.ImageName.Length - 1);
                }
                else
                    imgReport.ImageName = files[0].FileName;

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
        public DanpheHTTPResponse<object> PostReport(ImagingReportModel imgreport,
            IFormFileCollection files = null,
            string filePath = "")
        {
            RadiologyDbContext dbContext = new RadiologyDbContext(base.connString);
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
                    dbContext.ImagingReports.Add(imgreport);
                    dbContext.SaveChanges();
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

        [HttpPut]
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
                string providerName = this.ReadQueryStringData("providerName");
                int providerId = ToInt(this.ReadQueryStringData("providerId"));
                var localFolder = Request.Form["localFolder"];
                var reportDetails = Request.Form["reportDetails"];
                var orderStatus = Request.Form["orderStatus"];

                RadiologyDbContext dbContextUpdate = new RadiologyDbContext(base.connString);
                if (reqType == "updateImgReport" && !string.IsNullOrEmpty(reportDetails))
                {
                    var files = Request.Form.Files;
                    ImagingReportModel imgReport = JsonConvert.DeserializeObject<ImagingReportModel>(reportDetails);

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
                    dbImgReport.OrderStatus = orderStatus;
                    dbImgReport.ReportingDoctorId = imgReport.ReportingDoctorId;
                    dbImgReport.ReportTemplateId = imgReport.ReportTemplateId;
                    dbImgReport.ProviderName = imgReport.ProviderName;
                    dbImgReport.PatientStudyId = imgReport.PatientStudyId;
                    dbImgReport.ModifiedBy = currentUser.EmployeeId;
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
                    //if update of RequisitionItem OrderStatus Fails.
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = putRequisitionResult;
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

                            billItem.BillStatus = "cancel";
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

                    imagingReport.ProviderName = providerName;
                    if (providerId != 0)
                    {
                        imagingReport.ReportingDoctorId = providerId;
                        dbContextUpdate.Entry(imagingReport).Property(ent => ent.ReportingDoctorId).IsModified = true;
                    }

                    dbContextUpdate.Entry(imagingReport).Property(ent => ent.ProviderName).IsModified = true;

                    dbContextUpdate.SaveChanges();
                    responseData.Status = "OK";
                    responseData.Results = providerName;
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

        }

        private string PutRequisitionItemStatus(int requisitionId, string orderStatus)
        {
            RadiologyDbContext dbContextUpdate = new RadiologyDbContext(base.connString);
            try
            {
                ImagingRequisitionModel reqItem = dbContextUpdate.ImagingRequisitions
                                        .Where(a => a.ImagingRequisitionId == requisitionId)
                                        .FirstOrDefault<ImagingRequisitionModel>();
                if (reqItem != null)
                {
                    reqItem.OrderStatus = orderStatus.ToLower();
                    dbContextUpdate.Entry(reqItem).State = EntityState.Modified;
                    dbContextUpdate.SaveChanges();
                    return "OK";
                }
                else
                    return "Cannot match any item with this requisitionId";
            }
            catch (Exception ex)
            {
                return ex.Message + " exception details:" + ex.ToString();
            }
        }
    }
}
