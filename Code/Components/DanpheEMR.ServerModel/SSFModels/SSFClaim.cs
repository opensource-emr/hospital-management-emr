using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels
{
    public class ClaimBillablePeriod
    {
        public string start { get; set; }
        public string end { get; set; }
    }

    public class ClaimCategory
    {
        public List<SupportingInfoClaimCoding> coding { get; set; }
        public string text { get; set; }
    }

    public class ItemClaimCategory
    {
        public string text { get; set; }
    }

    public class ClaimCoding
    {
        public string code { get; set; }
    }
    
    public class SupportingInfoClaimCoding
    {
        public string code { get; set; }
        public string display { get; set; }
    }

    public class ClaimDiagnosis
    {
        public int sequence { get; set; }
        public ClaimDiagnosisCodeableConcept diagnosisCodeableConcept { get; set; }
        public List<ClaimType> type { get; set; }
    }

    public class ClaimDiagnosisCodeableConcept
    {
        public List<ClaimCoding> coding { get; set; }
    }

    public class ClaimEnterer
    {
        public string reference { get; set; }
    }

    public class ClaimExtension
    {
        public string url { get; set; }
        public object valueString { get; set; }
    }

    public class ClaimFacility
    {
        public string reference { get; set; }
    }

    public class ClaimItem
    {
        public int sequence { get; set; }
        public ItemClaimCategory category { get; set; }
        public ClaimProductOrService productOrService { get; set; }
        public ClaimQuantity quantity { get; set; }
        public ClaimUnitPrice unitPrice { get; set; }
        public List<ClaimExtension> extension { get; set; }
    }

    public class ClaimPatient
    {
        public string reference { get; set; }
    }

    public class ClaimProductOrService
    {
        public string text { get; set; }
    }

    public class ClaimProvider
    {
        public string reference { get; set; }
    }

    public class ClaimQuantity
    {
        public string value { get; set; }
    }

    public class ClaimRoot
    {
        public string resourceType { get; set; }
        public string clientClaimId { get; set; }
        public ClaimType type { get; set; }
        public ClaimBillablePeriod billablePeriod { get; set; }
        public string created { get; set; }
        public ClaimEnterer enterer { get; set; }
        public ClaimFacility facility { get; set; }
        public ClaimProvider provider { get; set; }
        public List<ClaimExtension> extension { get; set; }
        public List<ClaimDiagnosis> diagnosis { get; set; }
        public List<ClaimItem> item { get; set; }
        public ClaimTotal total { get; set; }
        public ClaimPatient patient { get; set; }
        public List<ClaimSupportingInfo> supportingInfo { get; set; }
    }

    public class ClaimSupportingInfo
    {
        public ClaimCategory category { get; set; }
        public claimValueAttachment valueAttachment { get; set; }

    }

    public class claimValueAttachment
    {
        public string contentType { get; set; }
        public string creation { get; set; }
        public string data { get; set; }
        public string hash { get; set; }
        public string title { get; set; }
    }

    public class ClaimTotal
    {
        public Decimal value { get; set; }
    }

    public class ClaimType
    {
        public string text { get; set; }
    }

    public class ClaimUnitPrice
    {
        public string value { get; set; }
    }

    public class ClaimRootDTO
    {
        public string resourceType { get; set; }
        public string clientClaimId { get; set; }
        public ClaimType claimType { get; set; }
        public ClaimBillablePeriod billablePeriod { get; set; }
        public string created { get; set; }
        public ClaimEnterer enterer { get; set; }
        public ClaimFacility facility { get; set; }
        public ClaimProvider provider { get; set; }
        public List<ClaimExtension> extension { get; set; }
        public List<ClaimDiagnosis> diagnosis { get; set; }
        public List<ClaimItem> item { get; set; }
        public ClaimTotal total { get; set; }
        public ClaimPatient patient { get; set; }
        public List<ClaimSupportingInfo> supportingInfo { get; set; }
        public SSFClaimResponseInfo claimResponseInfo { get; set; }
    }

    public class SSFClaimResponseInfo
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public DateTime ClaimedDate { get; set; }
        public Int64 ClaimCode { get; set; }
        public string InvoiceNoCSV { get; set; }
    }
    public class SSFClaimSubmissionOutput
    {
        public string ResponseStatus { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class Details
    {
        public ErrorText text { get; set; }
    }

    public class Issue
    {
        public string code { get; set; }
        public Details details { get; set; }
        public string severity { get; set; }
    }

    public class ErrorRoot
    {
        public string resourceType { get; set; }
        public List<Issue> issue { get; set; }
    }

    public class ErrorText
    {
        public string errorCode { get; set; }
        public string message { get; set; }
    }



}
