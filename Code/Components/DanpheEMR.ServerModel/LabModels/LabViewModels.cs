using DanpheEMR.ServerModel.LabModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientLabSampleVM
    {
        //pair of testname and requisitionid.
        //needed since we can have multiple tests per sample-code.

        //Changed: Ashim 20Dec2017 
        //Changed as per Requirement Update:  Different tests can have different samplecode
        //SampleCode can be different for different specimen used. 

        //public class TestReqIdPair
        //{
        //    public string TestName { get; set; }
        //    public Int64 RequisitionId { get; set; }

        //}
        public string PatientName { get; set; }
        public string Specimen { get; set; }
        public string TestName { get; set; }
        public Int64 RequisitionId { get; set; }
        public int? SampleCode { get; set; }
        public DateTime? SampleCreatedOn { get; set; }
        public DateTime? OrderDateTime { get; set; }
        public string OrderStatus { get; set; }
        public int? SampleCreatedBy { get; set; }

        public string RunNumberType { get; set; }
        public string LastSpecimenUsed { get; set; }
        public string LastSampleCode { get; set; }
        public string SpecimenList { get; set; }
        public string ProviderName { get; set; }
        public int BarCodeNumber { get; set; }

        public bool? HasInsurance { get; set; }//sud:16Jul'19-- to show insurance flag in collect sample and other pages.

        //public string SmCode { get; set; }
        //public int SmNumber { get; set; }

        //public List<TestReqIdPair> Tests { get; set; }
    }

    public class PatientTestComponentsVM
    {

        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public int PatientId { get; set; }
        public int ProviderId { get; set; }
        public string ProviderName { get; set; }
        public List<LabTestJSONComponentModel> ComponentJSON { get; set; }
        public int RequisitionId { get; set; }
        public string TestName { get; set; }
        public string LabTestCategory { get; set; }
    }

    public class LabPendingResultVM
    {
        //ashim: 01Sep2018 : Revised since we're now grouping by sample code and labtest array will contain tests of different templates.
        public class LabTestDetail
        {
            public Int64 RequisitionId { get; set; }
            public string TestName { get; set; }
            public Int64 LabTestId { get; set; }
            public int ReportTemplateId { get; set; }
            public string ReportTemplateShortName { get; set; }
            public string RunNumberType { get; set; }
            public int? SampleCollectedBy { get; set; }
            public int? VerifiedBy { get; set; }
            public int? ResultAddedBy { get; set; }
            public int? PrintedBy { get; set; }
            public int? PrintCount { get; set; }
            public string BillingStatus { get; set; }
            public bool ValidTestToPrint { get; set; }
            public int? LabCategoryId { get; set; }
            public int? LabReportId { get; set; }
        }

        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        //ashim: 01Sep2018 : since we're grouping by sample code, TemplateId and TemplateName is now moved to test level. i.e LabTestDetail
        //public int TemplateId { get; set; }
        //public string TemplateName { get; set; }
        public string PhoneNumber { get; set; }

        public int? SampleCode { get; set; } // used to show the sample code on the pending labresults
        public DateTime? SampleDate { get; set; }
        public string VisitType { get; set; }
        [NotMapped]
        public string SampleCodeFormatted { get; set; }
        public int PatientId { get; set; }
        public string RunNumType { get; set; }
        public bool IsPrinted { get; set; }
        public int? ReportId { get; set; }
        public string BillingStatus { get; set; }
        public int? BarCodeNumber { get; set; }
        public string WardName { get; set; }
        public string ReportGeneratedBy { get; set; }

        public List<LabTestDetail> Tests { get; set; }


        //this variable is used when the final report list data is rendered from mastersearch tab
        public bool IsValidToPrint { get; set; }
        //ashim: 01Sep2018 : since we're grouping by sample code, TemplateId and TemplateName is now moved to test level. i.e LabTestDetail
        //public List<Int64> RequisitionIdList { get; set; }
    }

    /// <summary>
    /// added: sud-22Jun'18
    /// </summary>
    public class LabReportVM
    {
        public string Header { get; set; }
        public ReportLookup Lookups { get; set; }
        public string Columns { get; set; }
        //ashim: 01Sep2018 : since we're grouping by sample code, TemplateId and TemplateName is now moved to test level. i.e LabTestDetail
        //public int TemplateId { get; set; }
        //public string TemplateName { get; set; }
        public int? ReportId { get; set; }
        public string Signatories { get; set; }

        //Added by Anish to show CK Editor based on TemplateType(either 'normal' or 'html')
        public int TemplateId { get; set; }
        public string TemplateType { get; set; }
        public string TemplateHTML { get; set; }
        public string TemplateName { get; set; }
        public string FooterText { get; set; }
        public string Comments { get; set; }
        public bool? IsPrinted { get; set; }
        public bool ValidToPrint { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ReportCreatedOn { get; set; }
        public int? ReportCreatedBy { get; set; }
        public int? BarCodeNumber { get; set; }
        public DateTime? PrintedOn { get; set; }
        public int? PrintedBy { get; set; }
        public int? PrintCount { get; set; }
        public string PrintedByName { get; set; }
        //make it array of tests or results whatever needed
        public List<LabReportTemplateVM> Templates { get; set; }
    }
    public class ReportLookup
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public string Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public int? ReferredById { get; set; }
        public string ReferredBy { get; set; }
        public DateTime? ReceivingDate { get; set; }
        public DateTime? ReportingDate { get; set; }
        public DateTime? SampleDate { get; set; }
        public int? SampleCode { get; set; }
        public string SampleCodeFormatted { get; set; }
        public string VisitType { get; set; }
        public string RunNumberType { get; set; }
    }
    public class LabReportTemplateVM
    {
        public int? TemplateId { get; set; }
        public string TemplateName { get; set; }
        public string TemplateType { get; set; }
        public string TemplateHtml { get; set; }
        public string HeaderText { get; set; }
        public string FooterText { get; set; }
        public string TemplateColumns { get; set; }//sud:19Sept'18--to group columns in template level.
        public object Tests { get; set; }
        public int? DisplaySequence { get; set; }
    }


    //start: sud: 12Sept'18 -- for Lab-Result and Reports formatting
    public class LabResult_Denormalized_VM
    {
        //lookup
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public string Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public int? ReferredById { get; set; }
        public string ReferredBy { get; set; }
        public DateTime? ReceivingDate { get; set; }
        public DateTime? ReportingDate { get; set; }
        public DateTime? SampleDate { get; set; }
        public int? SampleCode { get; set; }
        public string SampleCodeFormatted { get; set; }
        public string RunNumberType { get; set; }

        //Lab Report
        public int? LabReportId { get; set; }
        public int? TemplateId { get; set; }
        public bool? IsPrinted { get; set; }
        public string Signatories { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ReportCreatedOn { get; set; }
        public int? ReportCreatedBy { get; set; }
        public bool? IsActive_Test { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string ReferredByDr { get; set; }
        public string LabReportComments { get; set; }
        public DateTime? PrintedOn { get; set; }
        public int? PrintedBy { get; set; }
        public int? PrintCount { get; set; }
        public string PrintedByName { get; set; }

        //Requisition + LabTests
        public int? PatientVisitId { get; set; }
        public int? ProviderId { get; set; }
        public Int64 LabTestId { get; set; }
        public string LabTestName { get; set; }
        public string LabTestSpecimen { get; set; }
        public string LabTestSpecimenSource { get; set; }
        public string Urgency { get; set; }
        public DateTime? OrderDateTime { get; set; }
        public string ProviderName { get; set; }
        public string BillingStatus { get; set; }
        public string Specimen { get; set; }
        public string OrderStatus { get; set; }
        public string RequisitionRemarks { get; set; }
        public DateTime? SampleCreatedOn { get; set; }
        public int? SampleCreatedBy { get; set; }
        public string Comments { get; set; }
        public int ReportTemplateId { get; set; }
        public int? DiagnosisId { get; set; }
        public object LabTestComponentsJSON { get; set; }
        public string Description { get; set; }
        public int? TestDisplaySequence { get; set; }
        public bool? HasNegativeResults { get; set; }
        public string NegativeResultText { get; set; }
        public string ReportingName { get; set; }
        public string Interpretation { get; set; }
        public int? VerifiedBy { get; set; }

        //Test Component Result
        public Int64? TestComponentResultId { get; set; }
        public Int64 RequisitionId { get; set; }
        public int ResultingVendorId { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string Range { get; set; }
        public string ComponentName { get; set; }
        public string Method { get; set; }
        public string Remarks { get; set; }
        public string RangeDescription { get; set; }
        public bool? IsNegativeResult { get; set; }
        public bool? IsAbnormal { get; set; }
        public bool? IsActive_Component { get; set; }
        public int? ResultGroup { get; set; }


        //LabReportTemplateModel
        public string ReportTemplateShortName { get; set; }
        public string ReportTemplateName { get; set; }
        public bool? IsDefault { get; set; }
        public string HeaderText { get; set; }
        public string ColSettingsJSON { get; set; }
        public string TemplateType { get; set; }
        public string TemplateHTML { get; set; }
        public string FooterText { get; set; }
        public int? TemplateDisplaySequence { get; set; }

        public string VisitType { get; set; }

        public bool? HasInsurance { get; set; }
        public string AbnormalType { get; set; }

    }

    public class LabTest_Temp_VM
    {
        public string TestName { get; set; } //= test.ReportingName,
        public string ReportingName { get; set; }
        public Int64 RequisitionId { get; set; } //= req.RequisitionId,
        public Int64 LabTestId { get; set; }
        public object ComponentJSON { get; set; }
        public bool? HasNegativeResults { get; set; }
        public string NegativeResultText { get; set; }
        //SampleCode = labReq.SampleCode,
        public DateTime? RequestDate { get; set; }
        //SampleCreatedOn = labReq.SampleCreatedOn,
        public string Comments { get; set; }
        public int? DisplaySequence { get; set; }
        public string Interpretation { get; set; }
        public List<LabTestComponentResult> Components { get; set; }

        public string Specimen { get; set; }
        public string SampleCollectedBy { get; set; }
        public DateTime? SampleCollectedOn { get; set; }

        public LabVendorsModel VendorDetail { get; set; }
        public bool? HasInsurance { get; set; }
        public string BillingStatus{ get; set; }
        public int? VerifiedBy { get; set; }
        public int ResultingVendorId { get; set; }
        public int? MaxResultGroup { get; set; }
    }

    //end: sud: 12Sept'18 -- for Lab-Result and Reports formatting

}
