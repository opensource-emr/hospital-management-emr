using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class InpatientLabTestModel
    {
        public int BillingTransactionItemId { get; set; }
        public int RequisitionId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string LabTestName { get; set; }
        public int LabTestId { get; set; }
        public int? ReportTemplateId { get; set; }
        public string LabTestSpecimen { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public string RunNumberType { get; set; }
        public string BillingStatus { get; set; }
        public string OrderStatus { get; set; }
        public DateTime OrderDateTime { get; set; }
        public bool IsReportGenerated { get; set; }

        public int? CounterId { get; set; }
        public int? ServiceDepartmentId { get; set; }
        public string ServiceDepartName { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime CancelledOn { get; set; }
        public string CancelRemarks { get; set; }

    }
}
