using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.IO.Compression;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.AspNetCore.Hosting;
using DanpheEMR.Core;

namespace DanpheEMR.Controllers
{
    public class RadiologyReportController : CommonController
    {
        public string labTemplateFolder = null;

        private readonly IHostingEnvironment _hostingEnvironment;
        //Get Current Loggedin user via session                      
        //RbacUser _currentUser = new RbacUser();
        public RadiologyReportController(IOptions<MyConfiguration> _config, IHostingEnvironment hostingEnvironment) : base(_config)
        {
            this._hostingEnvironment = hostingEnvironment;
            this.labTemplateFolder = _config.Value.FileStorageRelativeLocation;
           // this._currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        }


        [HttpGet]
        public FileStreamResult GetImagingReport(int reportId)
        {
            try
            {
                //for now we are taking signature from parameter table for print radiology report 
                CoreDbContext coreDBContext = new CoreDbContext(connString);
                string SignHtmlText = (from parameter in coreDBContext.Parameters
                                           where parameter.ParameterName == "radiology-template-doc1"
                                           select parameter.ParameterValue
                                     ).SingleOrDefault();

                RadiologyDbContext radDbContext = new RadiologyDbContext(connString);
                ImagingReportModel imgReport = radDbContext.ImagingReports.Where(r => r.ImagingReportId == reportId).Include("Patient")
                    .FirstOrDefault();

                var imgRequisition = radDbContext.ImagingRequisitions.Where(r => r.ImagingRequisitionId == imgReport.ImagingRequisitionId)
                               .FirstOrDefault();

                int? imgItemId = imgReport.ImagingItemId;

                int? rptTemplateId = radDbContext.ImagingItems.Where(i => i.ImagingItemId == imgReport.ImagingItemId)
                    .FirstOrDefault().TemplateId;

                List<RadiologyReportTemplateModel> allRptTemplates = radDbContext.RadiologyReportTemplate.ToList();
                RadiologyReportTemplateModel currTemplate = allRptTemplates.Where(r => r.TemplateId == rptTemplateId.Value)
                   .FirstOrDefault();

                ImagingReportPrintVM patReport = new ImagingReportPrintVM();               

                patReport.CreatedOn = DateTime.Now;
                patReport.PatientCode = imgReport.Patient.PatientCode;
                patReport.PatientName = imgReport.Patient.ShortName;
                patReport.ReportText = imgReport.ReportText + SignHtmlText;                
                patReport.FooterText = (currTemplate != null) ? currTemplate.FooterNote : null;
                patReport.DateOfBrith = imgReport.Patient.DateOfBirth.Value;
                patReport.Gender = imgReport.Patient.Gender;
                patReport.ProviderId = imgRequisition.ProviderId;
                patReport.ProviderName = imgReport.ProviderName;
                patReport.RequisitionNo = imgReport.ImagingRequisitionId;
                patReport.Age = imgReport.Patient.Age;

                string filename = GetImagingReport(patReport);

                return new FileStreamResult(new
                            FileStream(filename, FileMode.Open), "application/msword");
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        private string GetImagingReport(ImagingReportPrintVM report)
        {
            try
            {
                var memStream = new MemoryStream();
                var returnMemStream = new MemoryStream();
                string dateTimeNow = DateTime.Now.ToString("dd-MM-yyyy_hh_mm_ss tt");
                //given the file location ...Template dotx file is saved in wwwroot\fileuploads folder and Tests results in result folder  
                string templateFileName = this._hostingEnvironment.WebRootPath + "\\" + this.labTemplateFolder + @"Radiology\Templates\ReportTemplate.dotx";
                string fileName = this._hostingEnvironment.WebRootPath + "\\" + this.labTemplateFolder + @"Radiology\Templates\Result.docx";

                Dictionary<string, string> patInfo = new Dictionary<string, string>();

                patInfo.Add("PatientName", report.PatientName + "(" + report.PatientCode + ")");
                patInfo.Add("ReferredBy", report.ProviderName);
                patInfo.Add("ReportText", report.ReportText);
                patInfo.Add("Date", report.CreatedOn.ToString("dd-MM-yyyy hh:mm:ss tt"));
                patInfo.Add("Age", report.Age);
                patInfo.Add("Sex", report.Gender);
                patInfo.Add("RequestId", report.RequisitionNo.ToString());

                System.IO.File.Copy(templateFileName, fileName, true);
                using (WordprocessingDocument newdoc =
                    WordprocessingDocument.Open(fileName, true))
                {
                    // Change document type (dotx->docx)
                    newdoc.ChangeDocumentType(WordprocessingDocumentType.Document);
                    SetDocumentKeyValues(newdoc, patInfo);
                    newdoc.MainDocumentPart.GetStream().CopyTo(returnMemStream);
                    return fileName;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        private void SetDocumentKeyValues(WordprocessingDocument document, Dictionary<string, string> templateDictionaryInfo)
        {
            try
            {
                var elements = document.MainDocumentPart.
                                            Document.Descendants<SdtElement>();

                if (templateDictionaryInfo != null)
                {
                    foreach (KeyValuePair<string, string> item in templateDictionaryInfo)
                    {
                        //// here placeholdername are passed as key of the KeyValueCollection in dictionary.
                        ////we'll replace this element's text with value.
                        var tag = (from x in elements
                                   where x.Descendants<Tag>()
                                   .FirstOrDefault().Val == item.Key
                                   select x).FirstOrDefault();

                        if (tag != null)
                        {
                            var x1 = tag.Descendants<Text>().First<Text>();
                            if (item.Key != "ReportText")
                                x1.Text = item.Value;
                            else//here item is ReportText
                            {
                                AddHtmlToDoc(document, item.Value);
                            }

                            x1.Space = SpaceProcessingModeValues.Default;
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void AddHtmlToDoc(WordprocessingDocument document, string reportHtml)
        {
            try
            {
                String cid = "chunkid";
                Body body = document.MainDocumentPart.Document.Body;
                ///had to wrap the html inside HTML/BODY tags to export it properly, othwise the file somehow gets corrupted.
                string htmlFormatted = "<html><body>" + reportHtml + "</body></html>";

                MemoryStream ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(htmlFormatted));
                AlternativeFormatImportPart formatImportPart = document.MainDocumentPart.AddAlternativeFormatImportPart(AlternativeFormatImportPartType.Html, cid);
                formatImportPart.FeedData(ms);
                AltChunk altChunk = new AltChunk();
                altChunk.Id = cid;
                document.MainDocumentPart.Document.Body.Append(altChunk);
                document.MainDocumentPart.Document.Save();
                // here's the magic!
                //document.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
}
