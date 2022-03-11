using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels
{

    public class BilPrint_PatientInfoVM
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Age { get; set; }

        public int CountryId { get; set; }
        public string CountryName { get; set; }
        public int CountrySubDivisionId { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public int MembershipTypeId { get; set; }
        public string MunicipalityName { get; set; }
        public string MembershipTypeName { get; set; }
        public string PANNumber { get; set; }
        public string PatientNameLocal { get; set; }
        public string Ins_NshiNumber { get; set; }

        //since we're getting datatable, we need to map it to the PatientInfoVM by First Serialize and the DeSerialize.
        public static BilPrint_PatientInfoVM MapDataTableToSingleObject(DataTable patInfo)
        {
            BilPrint_PatientInfoVM retObj = new BilPrint_PatientInfoVM();
            if (patInfo != null)
            {
                string strPatData = JsonConvert.SerializeObject(patInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<BilPrint_PatientInfoVM> patList = JsonConvert.DeserializeObject<List<BilPrint_PatientInfoVM>>(strPatData);
                if (patList != null && patList.Count > 0)
                {
                    retObj = patList.First();
                }
            }
            return retObj;
        }

    }

    public class BilPrint_InvoiceInfoVM
    {
        public int InvoiceNumber { get; set; }
        public string InvoiceCode { get; set; }
        public string InvoiceNumFormatted { get; set; }
        public DateTime TransactionDate { get; set; }
        public int FiscalYearId { get; set; }
        public string FiscalYear { get; set; }

        public string PaymentMode { get; set; }
        public string BillStatus { get; set; }
        public string TransactionType { get; set; }
        public string InvoiceType { get; set; }
        public int PrintCount { get; set; }
        public double SubTotal { get; set; }
        public double DiscountAmount { get; set; }
        public double TaxableAmount { get; set; }
        public double NonTaxableAmount { get; set; }
        public double TotalAmount { get; set; }

        public int BillingTransactionId { get; set; }
        public DateTime? PaidDate { get; set; }
        public double? Tender { get; set; }
        public double? Change { get; set; }
        public string Remarks { get; set; }
        public bool IsInsuranceBilling { get; set; }
        public Int64? ClaimCode { get; set; }
        public int? CrOrganizationId { get; set; }
        public string CrOrganizationName { get; set; }
        public string UserName { get; set; }
        public int CounterId { get; set; }
        public string CounterName { get; set; }
        public string LabTypeName { get; set; }

        public int? PackageId { get; set; }
        public string PackageName { get; set; }
        public double DepositAvailable { get; set; }
        public double DepositUsed { get; set; }
        public double DepositReturnAmount { get; set; }
        public double DepositBalance { get; set; }

        //since we're getting datatable, we need to map it to the InvoiceInfoVM by First Serialize and the DeSerialize.
        public static BilPrint_InvoiceInfoVM MapDataTableToSingleObject(DataTable invInfo)
        {
            BilPrint_InvoiceInfoVM retObj = new BilPrint_InvoiceInfoVM();
            if (invInfo != null)
            {
                string strInvData = JsonConvert.SerializeObject(invInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<BilPrint_InvoiceInfoVM> invList = JsonConvert.DeserializeObject<List<BilPrint_InvoiceInfoVM>>(strInvData);
                if (invList != null && invList.Count > 0)
                {
                    retObj = invList.First();
                }
            }
            return retObj;
        }

    }

    public class BilPrint_InvoiceItemVM
    {
        public int BillingTransactionItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public string ItemName { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
        public double SubTotal { get; set; }
        public double DiscountAmount { get; set; }
        public double TotalAmount { get; set; }
        public int? ProviderId { get; set; }
        public int? RequestedBy { get; set; }
        public string ProviderName { get; set; }
        public string RequestedByName { get; set; }
        public string PriceCategory { get; set; }


        //Map Datatable to object by first serializing then deserializing into required format.
        //Incoming datatable shoul have exact same column/datatype as that of the Object to be Mapped.
        public static List<BilPrint_InvoiceItemVM> MapDataTableToObjectList(DataTable dtInvoiceItem)
        {
            List<BilPrint_InvoiceItemVM> retListObj = new List<BilPrint_InvoiceItemVM>();
            if (dtInvoiceItem != null)
            {
                string strInvItms = JsonConvert.SerializeObject(dtInvoiceItem);
                retListObj = JsonConvert.DeserializeObject<List<BilPrint_InvoiceItemVM>>(strInvItms);
            }
            return retListObj;
        }
    }

    public class BilPrint_VisitInfoVM
    {
        public int PatientVisitId { get; set; }
        public string VisitCode { get; set; }
        public DateTime? AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string WardName { get; set; }
        public int? BedNumber { get; set; }
        public string BedCode { get; set; }
        public string ConsultingDoctor { get; set; }
        public int? ConsultingDoctorId { get; set; }
        public List<int?> ItemsRequestingDoctorsId { get; set; }
        public string ItemsRequestingDoctors { get; set; }

        //since we're getting datatable, we need to first Serialize then again Deserialize to get a proper object.
        public static BilPrint_VisitInfoVM MapDataTableToSingleObject(DataTable dtVisInfo)
        {
            BilPrint_VisitInfoVM retObj = new BilPrint_VisitInfoVM();
            if (dtVisInfo != null)
            {
                string strVisData = JsonConvert.SerializeObject(dtVisInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<BilPrint_VisitInfoVM> invList = JsonConvert.DeserializeObject<List<BilPrint_VisitInfoVM>>(strVisData);
                if (invList != null && invList.Count > 0)
                {
                    retObj = invList.First();
                }
            }
            return retObj;
        }

    }

    public class BilPrint_DepositListVM
    {
        public int DepositId { get; set; }
        public int ReceiptNo { get; set; }
        public string FiscalYearFormatted { get; set; }
        public string DepositReceiptNoFormattted { get; set; }
        public string DepositType { get; set; }
        public double Amount { get; set; }
        public DateTime CreatedOn { get; set; }
        public string UserName { get; set; }

        //Map Datatable to object by first serializing then deserializing into required format.
        //Incoming datatable shoul have exact same column/datatype as that of the Object to be Mapped.
        public static List<BilPrint_DepositListVM> MapDataTableToObjectList(DataTable dtDeposit)
        {
            List<BilPrint_DepositListVM> retListObj = new List<BilPrint_DepositListVM>();
            if (dtDeposit != null)
            {
                string strDepItms = JsonConvert.SerializeObject(dtDeposit);
                retListObj = JsonConvert.DeserializeObject<List<BilPrint_DepositListVM>>(strDepItms);
            }
            return retListObj;
        }
    }

}
