using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class Settlement_PatientInfoVM
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string PatientName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }

        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }

        public static Settlement_PatientInfoVM MapDataTableToSingleObject(DataTable patInfo)
        {
            Settlement_PatientInfoVM retObj = new Settlement_PatientInfoVM();
            if (patInfo != null)
            {
                string strPatData = JsonConvert.SerializeObject(patInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<Settlement_PatientInfoVM> patList = JsonConvert.DeserializeObject<List<Settlement_PatientInfoVM>>(strPatData);
                if (patList != null && patList.Count > 0)
                {
                    retObj = patList.First();
                }
            }
            return retObj;
        }
    }

    public class Settlement_ProvisionalInfoVM
    {
        public double? ProvisionalTotal { get; set; }
        public static Settlement_ProvisionalInfoVM MapDataTableToSingleObject(DataTable provisionalInfo)
        {
            Settlement_ProvisionalInfoVM retObj = new Settlement_ProvisionalInfoVM();
            if (provisionalInfo != null)
            {
                string strProvisionalInfo = JsonConvert.SerializeObject(provisionalInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<Settlement_ProvisionalInfoVM> provisionalList = JsonConvert.DeserializeObject<List<Settlement_ProvisionalInfoVM>>(strProvisionalInfo);
                if (provisionalList != null && provisionalList.Count > 0)
                {
                    retObj = provisionalList.First();
                }
            }
            return retObj;
        }
    }

    public class Settlement_DepositInfoVM
    {
        public double? Deposit_In { get; set; }
        public double? Deposit_Out { get; set; }
        public double? Deposit_Balance { get; set; }

        public static Settlement_DepositInfoVM MapDataTableToSingleObject(DataTable depositInfo)
        {
            Settlement_DepositInfoVM retObj = new Settlement_DepositInfoVM();
            if (depositInfo != null)
            {
                string strDepositInfo = JsonConvert.SerializeObject(depositInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<Settlement_DepositInfoVM> depositList = JsonConvert.DeserializeObject<List<Settlement_DepositInfoVM>>(strDepositInfo);
                if (depositList != null && depositList.Count > 0)
                {
                    retObj = depositList.First();
                }
            }
            return retObj;
        }
    }


    public class Settlement_InvoicePreview_InvoiceInfoVM
    {
        public int InvoiceNo { get; set; }

        public DateTime InvoiceDate { get; set; }
        public double SubTotal { get; set; }
        public double DiscountAmount { get; set; }
        public double TotalAmount { get; set; }

        public static Settlement_InvoicePreview_InvoiceInfoVM MapDataTableToSingleObject(DataTable invInfo)
        {
            Settlement_InvoicePreview_InvoiceInfoVM retObj = new Settlement_InvoicePreview_InvoiceInfoVM();
            if (invInfo != null)
            {
                string strInvData = JsonConvert.SerializeObject(invInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<Settlement_InvoicePreview_InvoiceInfoVM> invList = JsonConvert.DeserializeObject<List<Settlement_InvoicePreview_InvoiceInfoVM>>(strInvData);
                if (invList != null && invList.Count > 0)
                {
                    retObj = invList.First();
                }
            }
            return retObj;
        }
    }


    public class Settlement_Info_VM
    {
        public int SettlementId { get; set; }
        public string SettlementReceiptNo { get; set; }

        public DateTime SettlementDate { get; set; }
        public string PaymentMode { get; set; }
        public int CreatedBy { get; set; }
        public string BillingUser { get; set; }
        public double? CashDiscountGiven { get; set; }


        public static Settlement_Info_VM MapDataTableToSingleObject(DataTable setlInfo)
        {
            Settlement_Info_VM retObj = new Settlement_Info_VM();
            if (setlInfo != null)
            {
                string strInfo = JsonConvert.SerializeObject(setlInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<Settlement_Info_VM> invList = JsonConvert.DeserializeObject<List<Settlement_Info_VM>>(strInfo);
                if (invList != null && invList.Count > 0)
                {
                    retObj = invList.First();
                }
            }
            return retObj;
        }
    }

}
