using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DanpheEMR.CommonTypes;
using System.IO;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Lab
{
    public class LabReportExportController : Controller
    {
        public string labTemplateFolder = null;
        private readonly bool _highlightAbnormalLabResult = false;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly string connString;
        public LabReportExportController(IOptions<MyConfiguration> _config, IHostingEnvironment hostingEnvironment)
        {
            this._hostingEnvironment = hostingEnvironment;
            this._highlightAbnormalLabResult = _config.Value.highlightAbnormalLabResult;
            this.connString = _config.Value.Connectionstring;
            //this.labTemplateFolder = _hostingEnvironment.WebRootPath + "\\" + _config.Value.FileStorageRelativeLocation;
        }
        // GET: /<controller>/
        public FileStreamResult GetTemplateDetails(int templateId, int patientId, string templatelocation, int labReportId, int currentUser)
        {

            LabDbContext labDbContext = new LabDbContext(connString);
            this.labTemplateFolder = templatelocation;
            var viewReport = (from temp in labDbContext.LabReportTemplates
                              join pat in labDbContext.Patients on 1 equals 1
                              join req in labDbContext.Requisitions on pat.PatientId equals req.PatientId
                              join labtest in labDbContext.LabTestComponentResults on req.RequisitionId equals labtest.RequisitionId
                              join user in labDbContext.Employee on currentUser equals user.EmployeeId
                              //below is equivalent syntax as LEFT JOIN. needed since providerid could be null in some cases.
                              join employee in labDbContext.Employee on req.ProviderId equals employee.EmployeeId into emptemp
                              from e in emptemp.DefaultIfEmpty()
                              where temp.ReportTemplateID == templateId && pat.PatientId == patientId && labtest.LabReportId == labReportId

                              select new
                              {
                                  TemplateName = temp.ReportTemplateShortName,
                                  TemplateId = temp.ReportTemplateID,
                                  PatientCode = pat.PatientCode,
                                  FirstName = pat.FirstName,
                                  LastName = pat.LastName,
                                  MiddleName = pat.MiddleName,
                                  HospitalNo = pat.PatientCode,

                                  Age = pat.Age,
                                  SampleCreatedOn = req.SampleCreatedOn,
                                  LabNo = req.SampleCode,
                                  Comments = (string.IsNullOrEmpty(req.Comments) ? "" : req.Comments),
                                  Sex = pat.Gender,
                                  CreatedBy = user.LongSignature,
                                  // CreatedBy = (string.IsNullOrEmpty(user.Salutation) ? "" : user.Salutation + ". ") + user.FirstName + " " + (string.IsNullOrEmpty(user.MiddleName) ? "" : user.MiddleName + " ") + user.LastName + "<w:br/>" + (string.IsNullOrEmpty(user.MedCertificationNo) ? "" : user.MedCertificationNo),
                                  // ReferredBy = (string.IsNullOrEmpty(e.Salutation) ? "" : e.Salutation + ". ") + e.FirstName + " " + (string.IsNullOrEmpty(e.MiddleName) ? "" : e.MiddleName + " ") + e.LastName,
                                  ReferredBy = e.LongSignature,
                                  PatientId = pat.PatientId,
                                  Tests = (from req in labDbContext.Requisitions
                                           where req.PatientId == pat.PatientId
                                           join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                           join result in labDbContext.LabTestComponentResults on req.RequisitionId equals result.RequisitionId
                                           //where result.IsPrint == false && req.OrderStatus == "final" &&
                                           where req.OrderStatus == "final" && test.ReportTemplateId == templateId && result.LabReportId == labReportId
                                           orderby test.LabSequence ascending
                                           group req by new
                                           {
                                               test.LabTestName,
                                               req.RequisitionId,
                                               test.LabTestId,
                                               test.LabSequence
                                           } into grp

                                           select new
                                           {
                                               TestName = grp.Key.LabTestName,
                                               RequisitionId = grp.Key.RequisitionId,
                                               TestId = grp.Key.LabTestId,
                                               Labsequence = grp.Key.LabSequence,
                                               Components = (
                                                             from res in labDbContext.LabTestComponentResults
                                                             where res.RequisitionId == grp.Key.RequisitionId
                                                             select new
                                                             {
                                                                 ComponentName = res.ComponentName,
                                                                 Value = res.Value,
                                                                 Unit = res.Unit,
                                                                 Range = res.Range,
                                                                 Remarks = res.Remarks,
                                                                 //IsPrint = res.IsPrint,
                                                                 CreatedOn = res.CreatedOn,
                                                                 Method = res.Method,
                                                                 IsNegativeResult = res.IsNegativeResult,
                                                                 IsAbnormal = res.IsAbnormal
                                                             }).ToList()

                                           } into final
                                           orderby final.Labsequence ascending
                                           select final
                                           ).ToList()
                              }).FirstOrDefault();

            //mapping the data
            PatTemplateResult patTemplateResult = new PatTemplateResult();
            LabReportTemplateModel template = new LabReportTemplateModel();
            template.ReportTemplateShortName = viewReport.TemplateName;

            patTemplateResult.PatientInfo.PatientName = viewReport.FirstName + " " + (string.IsNullOrEmpty(viewReport.MiddleName) ? "" : viewReport.MiddleName + " ") + viewReport.LastName + " (" + viewReport.HospitalNo + ")";
            patTemplateResult.PatientInfo.Age = viewReport.Age;
            patTemplateResult.PatientInfo.Sex = viewReport.Sex;
            patTemplateResult.PatientInfo.ReferredBy = viewReport.ReferredBy;
            //new format for labNo = ddMMYY-SampleCode -- sud:15Dec2017
            //new format for labNo = yyMMdd-SampleCode -- ashim:15Dec2017
            string sampleDate = viewReport.SampleCreatedOn != null ? viewReport.SampleCreatedOn.Value.ToString("yyMMdd") + "-" : "";
            patTemplateResult.PatientInfo.LabNo = sampleDate + viewReport.LabNo.ToString();

            patTemplateResult.PatientInfo.CreatedBy = viewReport.CreatedBy;
            if (patTemplateResult.PatientInfo.CreatedBy == "………………………… , , Mr. H.B. Thapa ,B.Sc.MLT-PGIMER(CHD)  ,Senior Medical Lab.Technologist ,NHPC NO: A-96" || patTemplateResult.PatientInfo.CreatedBy == "………………………… , , Mr. Mani Ram Mahato ,B.Sc.MLT(TU) ,Medical Lab.Technologist ,NHPC NO: A-1135MLT")
            {
                patTemplateResult.PatientInfo.CreatedBy = " ";
            }
            else
            {
                patTemplateResult.PatientInfo.CreatedBy = viewReport.CreatedBy;
            }

            patTemplateResult.PatientInfo.Date = System.DateTime.Now.ToString("dd-MM-yyyy");
            patTemplateResult.PatientInfo.Comments = string.IsNullOrEmpty(viewReport.Comments) ? "" : viewReport.Comments;

            patTemplateResult.tableInfo.TablePlaceHolder = "ReportTable";
            //In this viewreport we have tests and inside of the tests we have its components ...
            //we are storing testname --from tests and componentName,range,unit,value and method --- from Components
            //first--> we are create a loop of od tests and ---inside that we are created an object of test class and adding testname to the property of that test
            //second--> in second loop(the loop is of component inside the tests)--inside that loop we are creating object component class aand assiging its porperties
            // and component is added to test object each time ...
            // and in the end of the first loop we are addidnf the test to the patTemplateResult object..

            bool isNegResult = viewReport.Tests.SelectMany(a => a.Components)
                                .Where(a => a.IsNegativeResult.HasValue && a.IsNegativeResult.Value).Count() > 0;

            if (isNegResult)
            {
                patTemplateResult.PatientInfo.Comments = viewReport.Tests[0].Components[0].Remarks;
            }

            if (viewReport.Tests.Count != 0)
            {
                for (var i = 0; i < viewReport.Tests.Count; i++)
                {
                    Test test = new Test();
                    test.TestName = viewReport.Tests[i].TestName;
                    for (var j = 0; j < viewReport.Tests[i].Components.Count; j++)
                    {
                        ComponentResult result = new ComponentResult()
                        {
                            ComponentName = viewReport.Tests[i].Components[j].ComponentName,
                            Unit = viewReport.Tests[i].Components[j].Unit,
                            Range = viewReport.Tests[i].Components[j].Range,
                            Value = viewReport.Tests[i].Components[j].Value,
                            Method = viewReport.Tests[i].Components[j].Method,
                            Remarks = viewReport.Tests[i].Components[j].Remarks,
                            IsAbnormal = viewReport.Tests[i].Components[j].IsAbnormal

                        };

                        test.Result.Add(result);

                    }
                    patTemplateResult.tableInfo.Tests.Add(test);
                }

            }
            //adding the dictionaryInfo ----->in this key is the placeholder and value is actual value of the place holder...
            patTemplateResult.DictionaryInfo.Add("PatientName", patTemplateResult.PatientInfo.PatientName);
            patTemplateResult.DictionaryInfo.Add("Age", patTemplateResult.PatientInfo.Age);
            patTemplateResult.DictionaryInfo.Add("Sex", patTemplateResult.PatientInfo.Sex);
            patTemplateResult.DictionaryInfo.Add("ReferredBy", patTemplateResult.PatientInfo.ReferredBy);
            patTemplateResult.DictionaryInfo.Add("CreatedBy", patTemplateResult.PatientInfo.CreatedBy);
            patTemplateResult.DictionaryInfo.Add("LabNo", patTemplateResult.PatientInfo.LabNo.ToString());
            patTemplateResult.DictionaryInfo.Add("Date", patTemplateResult.PatientInfo.Date);
            patTemplateResult.DictionaryInfo.Add("Comments", patTemplateResult.PatientInfo.Comments);

            LabReportExport labReportExport = new LabReportExport(connString, _highlightAbnormalLabResult);
            var memStream = new MemoryStream();

            string filename = labReportExport.GetReportToExport(template, isNegResult, patTemplateResult, this.labTemplateFolder, this._highlightAbnormalLabResult);

            return new FileStreamResult(new
                        FileStream(filename, FileMode.Open), "application/msword");

        }


        public FileStreamResult GetAllTemplateDetailswithprintId(int templateId, int patientId, int labReportId, string templatelocation, int currentUser)
        {
            LabDbContext labDbContext = new LabDbContext(connString);
            this.labTemplateFolder = templatelocation;
            var viewReport = (from temp in labDbContext.LabReportTemplates
                              join pat in labDbContext.Patients on 1 equals 1
                              join req in labDbContext.Requisitions on pat.PatientId equals req.PatientId
                              join labtest in labDbContext.LabTestComponentResults on req.RequisitionId equals labtest.RequisitionId
                              //join user in labDbContext.Employee on labtest.CreatedBy equals user.EmployeeId
                              join user in labDbContext.Employee on currentUser equals user.EmployeeId

                              //below is equivalent syntax as LEFT JOIN. needed since providerid could be null in some cases.
                              join employee in labDbContext.Employee on req.ProviderId equals employee.EmployeeId into emptemp
                              from e in emptemp.DefaultIfEmpty()
                              where temp.ReportTemplateID == templateId && pat.PatientId == patientId && labtest.LabReportId == labReportId
                              select new
                              {
                                  TemplateName = temp.ReportTemplateShortName,
                                  TemplateId = temp.ReportTemplateID,
                                  PatientCode = pat.PatientCode,
                                  FirstName = pat.FirstName,
                                  LastName = pat.LastName,
                                  MiddleName = pat.MiddleName,
                                  HospitalNo = pat.PatientCode,
                                  Age = pat.Age,
                                  LabNo = req.SampleCode,
                                  SampleCreatedOn = req.SampleCreatedOn,
                                  Sex = pat.Gender,
                                  CreatedBy = user.LongSignature,
                                  Comments = (string.IsNullOrEmpty(req.Comments) ? "" : req.Comments),
                                  //CreatedBy = (string.IsNullOrEmpty(user.Salutation) ? "" : user.Salutation + ". ") + user.FirstName + " " + (string.IsNullOrEmpty(user.MiddleName) ? "" : user.MiddleName + " ") + user.LastName + "<w:br/>" + (string.IsNullOrEmpty(user.MedCertificationNo) ? "" : user.MedCertificationNo),
                                  //ReferredBy = (string.IsNullOrEmpty(e.Salutation) ? "" : e.Salutation + " ") + e.FirstName + " " + (string.IsNullOrEmpty(e.MiddleName) ? "" : e.MiddleName + " ") + e.LastName,
                                  ReferredBy = e.LongSignature,
                                  PatientId = pat.PatientId,
                                  Tests = (from req in labDbContext.Requisitions
                                           where req.PatientId == pat.PatientId
                                           join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                           join result in labDbContext.LabTestComponentResults on req.RequisitionId equals result.RequisitionId
                                           where req.OrderStatus == "final" && test.ReportTemplateId == templateId && result.LabReportId == labReportId
                                           group req by new
                                           {
                                               test.LabTestName,
                                               req.RequisitionId,
                                               test.LabTestId,
                                               test.LabSequence
                                           } into grp
                                           orderby grp.Key.LabSequence ascending
                                           select new
                                           {
                                               TestName = grp.Key.LabTestName,
                                               RequisitionId = grp.Key.RequisitionId,
                                               TestId = grp.Key.LabTestId,

                                               Components = (
                                                             from res in labDbContext.LabTestComponentResults
                                                             where res.RequisitionId == grp.Key.RequisitionId
                                                             select new
                                                             {
                                                                 ComponentName = res.ComponentName,
                                                                 Value = res.Value,
                                                                 Unit = res.Unit,
                                                                 Range = res.Range,
                                                                 Remarks = res.Remarks,
                                                                 //IsPrint = res.IsPrint,
                                                                 CreatedOn = res.CreatedOn,
                                                                 Method = res.Method,
                                                                 IsNegativeResult = res.IsNegativeResult,
                                                                 IsAbnormal = res.IsAbnormal
                                                             }).ToList()

                                           }).ToList()
                              }).FirstOrDefault();
            //mapping the data
            PatTemplateResult patTemplateResult = new PatTemplateResult();
            LabReportTemplateModel template = new LabReportTemplateModel();
            template.ReportTemplateShortName = viewReport.TemplateName;

            patTemplateResult.PatientInfo.PatientName = viewReport.FirstName + " " + (string.IsNullOrEmpty(viewReport.MiddleName) ? "" : viewReport.MiddleName + " ") + viewReport.LastName + " (" + viewReport.HospitalNo + ")";
            patTemplateResult.PatientInfo.Age = viewReport.Age;
            patTemplateResult.PatientInfo.Sex = viewReport.Sex;
            patTemplateResult.PatientInfo.ReferredBy = viewReport.ReferredBy;
            patTemplateResult.PatientInfo.CreatedBy = viewReport.CreatedBy;

            //new format for labNo = ddMMYY-SampleCode -- sud:15Dec2017
            string sampleDate = viewReport.SampleCreatedOn != null ? viewReport.SampleCreatedOn.Value.ToString("yyMMdd") + "-" : "";
            patTemplateResult.PatientInfo.LabNo = sampleDate + viewReport.LabNo.ToString();
            //patTemplateResult.PatientInfo.LabNo = viewReport.LabNo.ToString();
            patTemplateResult.PatientInfo.Comments = string.IsNullOrEmpty(viewReport.Comments) ? "" : viewReport.Comments;

            patTemplateResult.PatientInfo.Date = System.DateTime.Now.ToString("dd-MM-yyyy");

            patTemplateResult.tableInfo.TablePlaceHolder = "ReportTable";

            //In this viewreport we have tests and inside of the tests we have its components ...
            //we are storing testname --from tests and componentName,range,unit,value and method --- from Components
            //first--> we are create a loop of od tests and ---inside that we are created an object of test class and adding testname to the property of that test
            //second--> in second loop(the loop is of component inside the tests)--inside that loop we are creating object component class aand assiging its porperties
            // and component is added to test object each time ...
            // and in the end of the first loop we are addidng the test to the patTemplateResult object..

            //find if there's a negative result scenario in this lab-test components.
            bool isNegResult = viewReport.Tests.SelectMany(a => a.Components)
                 .Where(a => a.IsNegativeResult.HasValue && a.IsNegativeResult.Value).Count() > 0;
            //update comments field for negative result. for others it'll be different.
            if (isNegResult)
            {
                patTemplateResult.PatientInfo.Comments = viewReport.Tests[0].Components[0].Remarks;
            }

            if (viewReport.Tests.Count != 0)
            {


                for (var i = 0; i < viewReport.Tests.Count; i++)
                {
                    Test test = new Test();
                    test.TestName = viewReport.Tests[i].TestName;
                    for (var j = 0; j < viewReport.Tests[i].Components.Count; j++)
                    {
                        ComponentResult result = new ComponentResult()
                        {
                            ComponentName = viewReport.Tests[i].Components[j].ComponentName,
                            Unit = viewReport.Tests[i].Components[j].Unit,
                            Range = viewReport.Tests[i].Components[j].Range,
                            Value = viewReport.Tests[i].Components[j].Value,
                            Method = viewReport.Tests[i].Components[j].Method,
                            Remarks = viewReport.Tests[i].Components[j].Remarks,
                            IsAbnormal = viewReport.Tests[i].Components[j].IsAbnormal

                        };

                        test.Result.Add(result);

                    }
                    patTemplateResult.tableInfo.Tests.Add(test);
                }




            }
            //adding the dictionaryInfo ----->in this key is the placeholder and value is actual value of the place holder...
            patTemplateResult.DictionaryInfo.Add("PatientName", patTemplateResult.PatientInfo.PatientName);
            patTemplateResult.DictionaryInfo.Add("Age", patTemplateResult.PatientInfo.Age);
            patTemplateResult.DictionaryInfo.Add("Sex", patTemplateResult.PatientInfo.Sex);
            patTemplateResult.DictionaryInfo.Add("ReferredBy", patTemplateResult.PatientInfo.ReferredBy);
            patTemplateResult.PatientInfo.CreatedBy = viewReport.CreatedBy;

            //The name of the Lab Person is harcoded here for manakamana according to the Templates , Change it if you want to configure it to other Hospital .
            if (patTemplateResult.PatientInfo.CreatedBy == "………………………… , , Mr. H.B. Thapa ,B.Sc.MLT-PGIMER(CHD)  ,Senior Medical Lab.Technologist ,NHPC NO: A-96" || patTemplateResult.PatientInfo.CreatedBy == "………………………… , , Mr. Mani Ram Mahato ,B.Sc.MLT(TU) ,Medical Lab.Technologist ,NHPC NO: A-1135MLT")
            {
                patTemplateResult.PatientInfo.CreatedBy = " ";
            }
            else
            {
                patTemplateResult.PatientInfo.CreatedBy = viewReport.CreatedBy;
            }

            patTemplateResult.DictionaryInfo.Add("CreatedBy", patTemplateResult.PatientInfo.CreatedBy);
            patTemplateResult.DictionaryInfo.Add("LabNo", patTemplateResult.PatientInfo.LabNo.ToString());
            patTemplateResult.DictionaryInfo.Add("Date", patTemplateResult.PatientInfo.Date);


            patTemplateResult.DictionaryInfo.Add("Comments", patTemplateResult.PatientInfo.Comments);


            LabReportExport labReportExport = new LabReportExport(this.labTemplateFolder, _highlightAbnormalLabResult);
            //var stream = new MemoryStream();
            var memStream = new MemoryStream();
            //labReportExport.GetReportToExport(template, patTemplateResult);

            string filename = labReportExport.GetReportToExport(template, isNegResult, patTemplateResult, this.labTemplateFolder, _highlightAbnormalLabResult);
            return new FileStreamResult(new FileStream(filename, FileMode.Open), "application/msword");

        }





    }
}
