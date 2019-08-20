using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{

    public class LabRequisitionModel
    {

        [Key]
        public Int64 RequisitionId { get; set; }
        public int? PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int? ProviderId { get; set; }
        public Int64 LabTestId { get; set; }
        public string ProcedureCode { get; set; }
        public string LOINC { get; set; }
        public string LabTestName { get; set; }
        public string LabTestSpecimen { get; set; }
        public string LabTestSpecimenSource { get; set; }
        public string PatientName { get; set; }
        public string Diagnosis { get; set; }
        public string Urgency { get; set; }
        public DateTime? OrderDateTime { get; set; }
        public string ProviderName { get; set; }
        public string BillingStatus { get; set; }
        public string OrderStatus { get; set; }
        public int? SampleCode { get; set; }
        public string RequisitionRemarks { get; set; }
        public DateTime? SampleCreatedOn { get; set; }
        public int? SampleCreatedBy { get; set; }
        public string Comments { get; set; }
        public string RunNumberType { get; set; }   

        public List<LabTestComponentResult> LabTestComponentResults { get; set; }

        //required for billing for listing the imaging items <dinesh:19Jan'17>
        public virtual LabTestModel LabTest { get; set; }
        public virtual PatientModel Patient { get; set; }

        //Suraj: Updated to not null
        public int ReportTemplateId { get; set; }

        public int? DiagnosisId { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        public bool? IsActive { get; set; }//sud:15Sept'18--to exclude InActive Records.

        //added: ashim : 18Sep2018
        public string VisitType { get; set; }
        public int? LabReportId { get; set; }
        public int? BarCodeNumber { get; set; }
        public string WardName { get; set; }

        public bool? IsVerified { get; set; }
        public DateTime? VerifiedOn { get; set; }
        public int? VerifiedBy { get; set; }

        public int ResultingVendorId { get; set; }//sud:16May'19--for lab external vendors.
        public bool? HasInsurance { get; set; }
    }

    public class LabTestTransactionItemVM
    {
        public Int64 BillItemPriceId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public string ServiceDepartmentShortName { get; set; }
        public int? Displayseq { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ProcedureCode { get; set; }
        public int Price { get; set; }
        public bool TaxApplicable { get; set; }
        public bool DiscountApplicable { get; set; }
        public string Description { get; set; }
        public string RunNumberType { get; set; }
    }

}
