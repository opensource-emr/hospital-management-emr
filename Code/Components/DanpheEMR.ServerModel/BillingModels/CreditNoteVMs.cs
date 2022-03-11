using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels
{

    public class CRN_PatientInfoVM
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string CountryName { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string Address { get; set; }


        public static CRN_PatientInfoVM GetSinglePatientInfoMappedFromDbTable(DataTable patInfo)
        {
            CRN_PatientInfoVM retObj = new CRN_PatientInfoVM();
            if (patInfo != null)
            {
                string strPatData = JsonConvert.SerializeObject(patInfo);
                List<CRN_PatientInfoVM> patList = JsonConvert.DeserializeObject<List<CRN_PatientInfoVM>>(strPatData);
                if (patList != null && patList.Count > 0)
                {
                    retObj = patList.First();
                }
            }

            return retObj;
        }

    }

    public class CRN_InvoiceInfoVM
    {
        public int PatientId { get; set; }
        public int BillingTransactionId { get; set; }
        public string InvoiceCode { get; set; }
        public int InvoiceNo { get; set; }
        public string PaymentMode { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceNoFormatted { get; set; }
        public double SubTotal { get; set; }
        public double DiscountAmount { get; set; }
        public double TaxTotal { get; set; }
        public double TotalAmount { get; set; }
        public string BillStatus { get; set; }
        public string TransactionType { get; set; }
        public string InvoiceType { get; set; }
        public bool? IsInsuranceBilling { get; set; }
        public int? InsuranceProviderId { get; set; }
        public string UserName { get; set; }
        public int SettlementId { get; set; }
        public double? CashDiscount { get; set; }

        public static CRN_InvoiceInfoVM GetSingleInvoiceInfoMappedFromDbTable(DataTable invInfo)
        {
            CRN_InvoiceInfoVM retObj = new CRN_InvoiceInfoVM();
            if (invInfo != null)
            {
                string strInvData = JsonConvert.SerializeObject(invInfo);
                List<CRN_InvoiceInfoVM> invList = JsonConvert.DeserializeObject<List<CRN_InvoiceInfoVM>>(strInvData);
                if (invList != null && invList.Count > 0)
                {
                    retObj = invList.First();
                }
            }

            return retObj;
        }
    }

}
