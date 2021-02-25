using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Core.Caching;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using System.Configuration;
using DanpheEMR.ServerModel.LabModels;
using DanpheEMR.Enums;
/*File: LabsBL.cs
* created: 12Sept'18 <sud>
* Description: This class contains common functions used in Labs-Controllers.
* Remarks: <needs refinement>
*/

namespace DanpheEMR.Labs
{
    public class LabsBL
    {
        public static List<EmployeeModel> empList;
        public static LabReportVM GetLabReportVMForReqIds(LabDbContext labDbContext, List<Int64> reqIdList)
        {
            empList = labDbContext.Employee.ToList();
            List<LabResult_Denormalized_VM> resultsDenormalized = GetResultsDenormalized(labDbContext, reqIdList);
            LabReportVM retReport = FormatResultsForLabReportVM(resultsDenormalized, labDbContext);
            return retReport;
        }
        /// <summary>
        /// This function gives a flat list with all possible properties from the combination of LabReport, Requisition, Result, LabTest, etc.. 
        /// Which is later used to transform to our required return type.
        /// </summary>
        /// <param name="labDbContext"></param>
        /// <param name="reqIdList"></param>
        /// <returns></returns>
        public static List<LabResult_Denormalized_VM> GetResultsDenormalized(LabDbContext labDbContext, List<Int64> reqIdList)
        {
            var resultDetails = (from req in labDbContext.Requisitions
                                 join pat in labDbContext.Patients on req.PatientId equals pat.PatientId
                                 join test in labDbContext.LabTests on req.LabTestId equals test.LabTestId
                                 join template in labDbContext.LabReportTemplates on req.ReportTemplateId equals template.ReportTemplateID
                                 from doc in labDbContext.Employee.Where(emp => emp.EmployeeId == req.ProviderId).DefaultIfEmpty()
                                 from comp in labDbContext.LabTestComponentResults.Where(cmp => cmp.RequisitionId == req.RequisitionId).DefaultIfEmpty()
                                 from rept in labDbContext.LabReports.Where(rpt => rpt.LabReportId == req.LabReportId).DefaultIfEmpty()
                                     //changed below condition by sudd.. to avoid null exception.. 
                                     //from doc in labDbContext.Employee.Where(e => req.ProviderId.HasValue && req.ProviderId.Value == e.EmployeeId).DefaultIfEmpty()
                                 where reqIdList.Contains(req.RequisitionId)
                                 select new LabResult_Denormalized_VM()
                                 {
                                     PatientId = pat.PatientId,
                                     PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                     PatientCode = pat.PatientCode,
                                     Gender = pat.Gender,
                                     DOB = pat.DateOfBirth,
                                     PhoneNumber = pat.PhoneNumber,
                                     Address = pat.Address,
                                     ReferredById = (int?)req.ProviderId,
                                     //ashim: 06Sep2018 : Report details are saved only in final report. So we don't have report details in pending report.
                                     //ReferredByName will be: LongSignature (for internal), Or FullName (for external), or SELF for NULL, or Existing value based on conditions.
                                     ReferredBy = rept == null ? (req.ProviderId != null ? (string.IsNullOrEmpty(doc.LongSignature) ? doc.FullName : doc.LongSignature) : "SELF") : rept.ReferredByDr,
                                     ReceivingDate = rept == null ? ((req.RunNumberType.ToLower() == ENUM_LabRunNumType.histo || req.RunNumberType.ToLower() == ENUM_LabRunNumType.cyto) ? req.OrderDateTime : req.SampleCreatedOn) : rept.ReceivingDate,
                                     //ReceivingDate = rept == null ? ((req.RunNumberType.ToLower() == "histo" || req.RunNumberType.ToLower() == "cyto") ? req.OrderDateTime : req.SampleCreatedOn) : rept.ReceivingDate,
                                     ReportingDate = rept == null ? DateTime.Now : rept.ReportingDate,
                                     SampleDate = req.SampleCreatedOn,
                                     SampleCode = req.SampleCode,
                                     SampleCodeFormatted = req.SampleCodeFormatted,
                                     BillingStatus = req.BillingStatus,
                                     Specimen = req.LabTestSpecimen,
                                     ColSettingsJSON = template.ColSettingsJSON,
                                     Comments = req.Comments,
                                     LabReportComments = rept.Comments,
                                     ComponentName = comp.ComponentName,
                                     CreatedBy = req.CreatedBy,
                                     CreatedOn = req.CreatedOn,
                                     ReportCreatedBy = rept.CreatedBy,
                                     ReportCreatedOn = rept.CreatedOn,
                                     Description = template.Description,
                                     DiagnosisId = req.DiagnosisId,
                                     TestDisplaySequence = test.DisplaySequence,
                                     FooterText = template.FooterText,
                                     HasNegativeResults = test.HasNegativeResults.HasValue ? test.HasNegativeResults.Value : false,
                                     HeaderText = template.HeaderText,
                                     Interpretation = test.Interpretation,
                                     IsAbnormal = comp.IsAbnormal,
                                     AbnormalType = comp.AbnormalType,
                                     IsActive_Test = test.IsActive,
                                     IsDefault = template.IsDefault,
                                     IsNegativeResult = comp.IsNegativeResult,
                                     IsPrinted = rept.IsPrinted,
                                     LabReportId = rept.LabReportId,
                                     LabTestComponentsJSON = new object(),
                                     LabTestId = test.LabTestId,
                                     LabTestName = test.LabTestName,
                                     LabTestSpecimen = test.LabTestSpecimen,
                                     LabTestSpecimenSource = test.LabTestSpecimenSource,
                                     Method = comp.Method,
                                     ModifiedBy = req.ModifiedBy,
                                     ModifiedOn = req.ModifiedOn,
                                     NegativeResultText = test.NegativeResultText,
                                     OrderDateTime = req.OrderDateTime,
                                     OrderStatus = req.OrderStatus,
                                     PatientVisitId = req.PatientVisitId,
                                     ProviderId = req.ProviderId,
                                     ProviderName = req.ProviderName,
                                     Range = comp.Range,
                                     RangeDescription = comp.RangeDescription,
                                     ReferredByDr = rept.ReferredByDr,
                                     Remarks = comp.Remarks,
                                     ReportingName = test.ReportingName,
                                     ReportTemplateId = template.ReportTemplateID,
                                     ReportTemplateName = template.ReportTemplateName,
                                     ReportTemplateShortName = template.ReportTemplateShortName,
                                     RequisitionId = req.RequisitionId,
                                     RequisitionRemarks = req.RequisitionRemarks,
                                     ResultGroup = comp.ResultGroup,
                                     ResultingVendorId = req.ResultingVendorId,
                                     SampleCreatedBy = req.SampleCreatedBy,
                                     SampleCreatedOn = req.SampleCreatedOn,
                                     Signatories = rept.Signatories,
                                     VerifiedBy = req.VerifiedBy,
                                     TemplateHTML = template.TemplateHTML,
                                     TemplateId = template.ReportTemplateID,
                                     TemplateType = template.TemplateType,
                                     Unit = comp.Unit,
                                     Urgency = req.Urgency,
                                     Value = comp.Value,
                                     TestComponentResultId = comp.TestComponentResultId,
                                     IsActive_Component = comp.IsActive.HasValue ? comp.IsActive : true,
                                     VisitType = req.VisitType,
                                     RunNumberType = req.RunNumberType,
                                     TemplateDisplaySequence = template.DisplaySequence,
                                     HasInsurance = req.HasInsurance,
                                     PrintCount = rept.PrintCount,
                                     PrintedBy = rept.PrintedBy,
                                     PrintedOn = rept.PrintedOn,
                                     PrintedByName = ""
                                 }).ToList();


            return resultDetails;
        }

        public static LabReportVM FormatResultsForLabReportVM(List<LabResult_Denormalized_VM> resultSets, LabDbContext labDbContext)
        {
            LabReportVM retData = (from r in resultSets
                                   select new LabReportVM()
                                   {
                                       Columns = r.ColSettingsJSON,
                                       FooterText = r.FooterText,
                                       Header = r.HeaderText,
                                       ReportId = r.LabReportId,
                                       Signatories = r.Signatories,
                                       TemplateType = r.TemplateType,
                                       TemplateHTML = r.TemplateHTML,
                                       Comments = r.LabReportComments,
                                       IsPrinted = r.IsPrinted,
                                       CreatedBy = r.CreatedBy,
                                       CreatedOn = r.CreatedOn,
                                       ReportCreatedBy = r.ReportCreatedBy,
                                       ReportCreatedOn = r.ReportCreatedOn,
                                       PrintCount = r.PrintCount,
                                       PrintedBy = r.PrintedBy,
                                       PrintedByName = (from emp in empList
                                                        where emp.EmployeeId == r.PrintedBy
                                                        select emp.FirstName + " " + emp.LastName).FirstOrDefault(),
                                       PrintedOn = r.PrintedOn
                                   }).GroupBy(tmp => tmp.TemplateType).Select(group => group.First()).FirstOrDefault();



            retData.Lookups = GetLookup(resultSets);
            retData.Templates = GetTemplateVM(resultSets, labDbContext);
            return retData;
        }

        /// <summary>
        /// this function gets only lookup part from the denormalized result sets.
        /// </summary>
        /// <param name="resultSets"></param>
        /// <returns></returns>
        public static ReportLookup GetLookup(List<LabResult_Denormalized_VM> resultSets)
        {
            ReportLookup lookups = (from r in resultSets
                                    select new ReportLookup
                                    {
                                        Address = r.Address,
                                        DOB = r.DOB,
                                        Gender = r.Gender,
                                        PatientCode = r.PatientCode,
                                        PatientName = r.PatientName,
                                        PatientId = r.PatientId,
                                        PhoneNumber = r.PhoneNumber,
                                        ReceivingDate = r.ReceivingDate,
                                        ReportingDate = r.ReportingDate,
                                        ReferredBy = r.ReferredBy,
                                        ReferredById = r.ReferredById,
                                        SampleCode = r.SampleCode,
                                        SampleCodeFormatted = r.SampleCodeFormatted,
                                        SampleDate = r.SampleDate,
                                        VisitType = r.VisitType,
                                        RunNumberType = r.RunNumberType
                                    }
                            ).FirstOrDefault();
            return lookups;
        }

        /// <summary>
        /// Gets unique templates based on templatetype(eg: normal, html, culture etc)
        /// we do loop inside each template and assign tests to them from the same source (denormalized result set)
        /// </summary>
        /// <param name="resultSets"></param>
        /// <returns></returns>
        public static List<LabReportTemplateVM> GetTemplateVM(List<LabResult_Denormalized_VM> resultSets, LabDbContext labDbContext)
        {
            List<LabReportTemplateVM> templates = (from r in resultSets
                                                   select new LabReportTemplateVM()
                                                   {
                                                       FooterText = r.FooterText,
                                                       HeaderText = r.HeaderText,
                                                       TemplateHtml = r.TemplateHTML,
                                                       TemplateId = r.TemplateId,
                                                       TemplateName = r.ReportTemplateName,
                                                       TemplateType = r.TemplateType,
                                                       DisplaySequence = r.TemplateDisplaySequence,
                                                       Tests = new object(),
                                                       TemplateColumns = r.ColSettingsJSON//sud: 19Sept'18-- to show hide columns in template's scope.
                                                   }).GroupBy(tmp => tmp.TemplateId).Select(group => group.First()).OrderBy(a => a.DisplaySequence).ToList();

            if (templates != null && templates.Count > 0)
            {
                foreach (var tmp in templates)
                {
                    tmp.Tests = GetTestsOfTemplate(resultSets, tmp.TemplateId, labDbContext);
                }
            }

            return templates;
        }

        public static List<LabTest_Temp_VM> GetTestsOfTemplate(List<LabResult_Denormalized_VM> resultSets, int? templateId, LabDbContext labDbContext)
        {

            List<LabTest_Temp_VM> retData = (from r in resultSets
                                             where templateId == r.TemplateId
                                             select new LabTest_Temp_VM()
                                             {
                                                 TestName = r.LabTestName,
                                                 ReportingName = r.ReportingName,
                                                 LabTestId = r.LabTestId,
                                                 Comments = r.Comments,
                                                 ComponentJSON = new object(),
                                                 DisplaySequence = r.TestDisplaySequence,
                                                 HasNegativeResults = r.HasNegativeResults,
                                                 Interpretation = r.Interpretation,
                                                 NegativeResultText = r.NegativeResultText,
                                                 RequestDate = r.OrderDateTime,
                                                 RequisitionId = r.RequisitionId,
                                                 Components = null,
                                                 Specimen = r.Specimen,
                                                 BillingStatus = r.BillingStatus,
                                                 ResultingVendorId = r.ResultingVendorId,
                                                 VendorDetail = new LabVendorsModel(),
                                                 SampleCollectedBy = (from employee in empList
                                                                      where employee.EmployeeId == r.SampleCreatedBy
                                                                      select employee.FirstName + " " + (string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ") + employee.LastName).FirstOrDefault(),
                                                 SampleCollectedOn = r.SampleCreatedOn,
                                                 HasInsurance = r.HasInsurance,
                                                 VerifiedBy = r.VerifiedBy
                                             }).GroupBy(tmp => tmp.RequisitionId).Select(group => group.First()).OrderBy(test => test.DisplaySequence).ToList();
            //Removed this to get same test for Multiple times for same patient
            //.GroupBy(tmp => tmp.LabTestId).Select(group => group.First()).OrderBy(test => test.DisplaySequence).ToList();

            if (retData != null && retData.Count > 0)
            {
                foreach (var tst in retData)
                {
                    tst.VendorDetail = (from vendor in labDbContext.LabVendors
                                        where vendor.LabVendorId == tst.ResultingVendorId
                                        select vendor).FirstOrDefault();
                    tst.ComponentJSON = (from labtest in labDbContext.LabTests
                                         join componentMap in labDbContext.LabTestComponentMap on labtest.LabTestId equals componentMap.LabTestId
                                         join component in labDbContext.LabTestComponents on componentMap.ComponentId equals component.ComponentId
                                         where labtest.LabTestId == tst.LabTestId && componentMap.IsActive == true
                                         select new
                                         {
                                             ComponentId = component.ComponentId,
                                             ComponentName = component.ComponentName,
                                             Unit = component.Unit,
                                             ValueType = component.ValueType,
                                             ControlType = component.ControlType,
                                             Range = component.Range,
                                             RangeDescription = component.RangeDescription,
                                             Method = component.Method,
                                             ValueLookup = component.ValueLookup,
                                             MinValue = component.MinValue,
                                             MaxValue = component.MaxValue,
                                             DisplayName = component.DisplayName,
                                             DisplaySequence = componentMap.DisplaySequence,
                                             IndentationCount = componentMap.IndentationCount,
                                             ShowInSheet = componentMap.ShowInSheet,
                                             ComponentMapId = componentMap.ComponentMapId,
                                             MaleRange = component.MaleRange,
                                             FemaleRange = component.FemaleRange,
                                             ChildRange = component.ChildRange,
                                             GroupName = componentMap.GroupName
                                         }).ToList();
                    tst.Components = GetResulsOfTestRequisition(resultSets, tst.RequisitionId);
                    tst.MaxResultGroup = tst.Components.Max(v => v.ResultGroup);
                    tst.MaxResultGroup = tst.MaxResultGroup.HasValue ? tst.MaxResultGroup.Value : 1;
                }
            }

            return retData;
        }

        public static List<LabTestComponentResult> GetResulsOfTestRequisition(List<LabResult_Denormalized_VM> resultSets, Int64 requisitionId)
        {
            List<LabTestComponentResult> retData = (from r in resultSets
                                                    where r.RequisitionId == requisitionId
                                                    && r.IsActive_Component == true
                                                    select new LabTestComponentResult()
                                                    {
                                                        TestComponentResultId = r.TestComponentResultId.HasValue ? r.TestComponentResultId.Value : 0,
                                                        ComponentName = r.ComponentName,
                                                        Value = r.Value,
                                                        Unit = r.Unit,
                                                        Range = r.Range,
                                                        RangeDescription = r.RangeDescription,
                                                        Remarks = r.Remarks,
                                                        CreatedOn = r.CreatedOn,
                                                        IsAbnormal = r.IsAbnormal,
                                                        AbnormalType = r.AbnormalType,
                                                        IsNegativeResult = r.IsNegativeResult,
                                                        Method = r.Method,
                                                        ResultGroup = r.ResultGroup
                                                    }).ToList();
            if (retData != null && retData.Count > 0 && retData[0].TestComponentResultId == 0)
            {
                retData = new List<LabTestComponentResult>();
            }

            return retData;
        }

    }

}
