using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //VM stands for ViewModel, these are transition models, which doesn't exist in database.
    public class BillingItemVM
    {
        public string ProcedureCode { get; set; }
        public string ItemName { get; set; }
        public double? ItemPrice { get; set; }
        public double? NormalPrice { get; set; } //added by Yubraj : 16th May '19
        public double? SAARCCitizenPrice { get; set; }
        public double? ForeignerPrice { get; set; }
        public int ItemId { get; set; }
        public bool? TaxApplicable { get; set; }
        public string ServiceDepartmentName { get; set; }
        public int ServiceDepartmentId { get; set; }
    }

    public class PatientBillingContextVM
    {
        public int? PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public string BillingType { get; set; }//eg: inpatient/outpatient
        public int? RequestingDeptId { get; set; }
        public InsuranceVM Insurance { get; set; }
    }

    public class InsuranceVM
    {
        public int PatientId { get; set; }
        public int InsuranceProviderId { get; set; }
        public double InitialBalance { get; set; }
        public double CurrentBalance { get; set; }
        public double? InsuranceProvisionalAmount{ get; set; } //For insurance Provisional Amount --Yubraj: 9th July '19
        public string InsuranceProviderName { get; set; }
        public string IMISCode { get; set; }
        public string InsuranceNumber { get; set; }
        public PatientInsurancePkgTxnVM PatientInsurancePkgTxn { get; set; }
    }

    public class PatientInsurancePkgTxnVM
    {
        public int PatientInsurancePackageId { get; set; }
        public int PackageId { get; set; }
        public string PackageName { get; set; }
        public DateTime StartDate { get; set; }
    }

    public class AdditionalItemInfoVM
    {
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
    }
    public class AdditionalItemInfoListVM
    {
        public List<AdditionalItemInfoVM> ItemList { get; set; }
    }
    //ashim: 14Sep2018 --added for discharge bill receipts.
    //discharge bill view models

    public class AdmissionDetailVM
    {
        public DateTime AdmissionDate { get; set; }
        public DateTime DischargeDate { get; set; }
        public string AdmittingDoctor { get; set; }
        public string Department { get; set; }
        public float LengthOfStay { get; set; }
        public string RoomType { get; set; }
        public string ProcedureType { get; set; }
    }

    public class DepositDetailVM
    {
        public int DepositId { get; set; }
        public string ReceiptNo { get; set; }
        public int? ReceiptNum { get; set; } //yubraj 16th Jan '19 --to check receipt no for client side
        public DateTime? Date { get; set; }
        public double? Amount { get; set; }
        public double? Balance { get; set; }
        public string DepositType { get; set; }
        public string ReferenceInvoice { get; set; }
        public bool? IsCurrent { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PatientDetailVM
    {
        public int PatientId { get; set; }
        public string HospitalNo { get; set; }
        public string InpatientNo { get; set; }
        public string PatientName { get; set; }
        public string Address { get; set; }
        public string CountrySubDivision { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string ContactNo { get; set; }
        public string Gender { get; set; }
    }
    public class BillingTransactionDetailVM
    {
        public string FiscalYear { get; set; }
        public int? ReceiptNo { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime? BillingDate { get; set; }
        public string PaymentMode { get; set; }
        public double? DepositBalance { get; set; }
        public double? DepositDeductAmount { get; set; }
        public double? Discount { get; set; }
        public double? TotalAmount { get; set; }
        public double? SubTotal { get; set; }
        public double? Quantity { get; set; }
        public int? CreatedBy { get; set; }
        public string User { get; set; }
        public string Remarks { get; set; }
        public int? PrintCount { get; set; }
        public bool? ReturnStatus { get; set; }

        //Yubraj: 22nd April '19 for credit organization 
        public int? OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public int? ExchangeRate { get; set; } //sanjit: 5-17-2019 for foreign exchange
    }

    public class BillItemVM
    {
        public DateTime BillDate { get; set; }
        public string ItemGroupName { get; set; }
        public string ItemName { get; set; }
        public string DoctorName { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
        public double SubTotal { get; set; }
        public double DiscountAmount { get; set; }
        public double TaxAmount { get; set; }
        public double TotalAmount { get; set; }
    }

    public class DischargeDetailVM
    {
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string BillStatus { get; set; }
        public string Remarks { get; set; }
        public string ProcedureType { get; set; }
        public int BillingTransactionId { get; set; }

    }

    public class BedDetailVM
    {
        public int PatientBedInfoId { get; set; }
        public int BedFeatureId { get; set; }
        public string WardName { get; set; }
        public string BedCode { get; set; }
        public string BedFeature { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double BedPrice { get; set; }
        public string Action { get; set; }
        public double Days { get; set; }
        //only used in client side
        public bool? IsQuantityUpdated { get; set; }
    }

    public class BedDurationTxnDetailsVM
    {
        public int PatientVisitId { get; set; }
        public int BedFeatureId { get; set; }
        public double Days { get; set; }
        public double SubTotal { get; set; }
        public double TaxableAmount { get; set; }
        public double NonTaxableAmount { get; set; }
        public double TotalDays { get; set; }

    }

    public class BillingTxnItemsVM
    {
        public int BillTransactionItemId { get; set; }
        public int BillItemPriceId { get; set; }
        public string ItemName { get; set; }
        public string BillingType { get; set; }
        public int PatientId { get; set; }
        public string ProviderName { get; set; }
        public string ServiceDepartmentName { get; set; }
        public double? TotalAmount { get; set; }
        public string PatientName { get; set; }
        public DateTime? RequisitionDate { get; set; }

        public FractionCalculationModel FractionCalculation { set; get; }
    }

}
