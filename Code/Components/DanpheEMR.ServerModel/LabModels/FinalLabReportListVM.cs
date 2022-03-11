using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class FinalLabReportListVM
    {
        public class FinalReportListLabTestDetail
        {
            public Int64 RequisitionId { get; set; }
            public string TestName { get; set; }
            public string BillingStatus { get; set; }
            public bool ValidTestToPrint { get; set; }
            public int? ResultAddedBy { get; set; }
            public int? PrintedBy { get; set; }
            public int? SampleCollectedBy { get; set; }
            public int? VerifiedBy { get; set; }
            public int? PrintCount { get; set; }
        }

        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public int? SampleCode { get; set; }
        public DateTime? SampleDate { get; set; }
        public string VisitType { get; set; }
        public string SampleCodeFormatted { get; set; }
        public int PatientId { get; set; }
        public string RunNumType { get; set; }
        public bool IsPrinted { get; set; }
        public int? ReportId { get; set; }
        public string BillingStatus { get; set; }
        public Int64? BarCodeNumber { get; set; }
        public string WardName { get; set; }
        public string ReportGeneratedBy { get; set; }
        public string LabTestCSV { get; set; }
        public string LabRequisitionIdCSV { get; set; }
        public bool AllowOutpatientWithProvisional { get; set; }
        public List<FinalReportListLabTestDetail> Tests { get; set; }

        //this variable is used when the final report list data is rendered from mastersearch tab
        public bool IsValidToPrint { get; set; }
        public bool HasInsurance { get; set; }
    }
}
