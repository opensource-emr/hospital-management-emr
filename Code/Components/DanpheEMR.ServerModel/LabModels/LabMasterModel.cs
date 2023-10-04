using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class LabMasterModel
    {
        public string PatientName { get; set; }
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public int BarCodeNumber { get; set; }
        public DateTime? SampleCollectedOn { get; set; }

        public List<LabPendingResultVM> AddResult = new List<LabPendingResultVM>();
        public List<LabPendingResultVM> PendingReport = new List<LabPendingResultVM>();
        public List<FinalLabReportListVM> FinalReport = new List<FinalLabReportListVM>();
        public List<Requisition> LabRequisitions = new List<Requisition>();
    }


    public class Requisition
    {
        public long RequisitionId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? LastestRequisitionDate { get; set; }
        public string VisitType { get; set; }
        public string RunNumberType { get; set; }
        public string WardName { get; set; }
    }

    public class LabSampleVM
    {
        public long RequisitionId { get; set; }
        public DateTime? SampleDate { get; set; }
        public int? SampleCode { get; set; }
        public int PatientId { get; set; }
        public int? BarCodeNumber { get; set; }
        public string SampleCodeFormatted { get; set; }
        public string RunNumberType { get; set; }
        public string VisitType { get; set; }

        public LabRequisitionModel ExistingDetail { get; set; }
    }
}
