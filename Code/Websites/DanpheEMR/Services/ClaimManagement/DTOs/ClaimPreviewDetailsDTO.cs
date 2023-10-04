using DanpheEMR.ServerModel;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.Services.ClaimManagement.DTOs
{
    /*public class ClaimPreviewDetailsDTO
    {
        public List<HeaderDetailsDTO> HeaderDetails
        public List<BillingDetailsDTO> BillingDetails { get; set; }
        public List<PharmacyDetailsDTO> PharmacyDetails { get; set; }
        public List<DocumentDetailsDTO> DocumnetDetails { get; set; }
    }*/

    public class HeaderDetailsDTO
    {
        public Int64 ClaimCode { get; set; }
        public string MemberNo { get; set; }
        public string HospitalNo { get; set; }
        public string PatientName { get; set; }
        public string Address { get; set; }
        public string Scheme { get; set; }
        public string AgeSex { get; set; }
        public string ContactNo { get; set; }
        public decimal ClaimedAmount { get; set; }

        /*public static List<HeaderDetailsDTO> MapDataTableToSingleObject(DataTable dtHeaderDetails)
        {
            List<HeaderDetailsDTO> headerList = new List<HeaderDetailsDTO>();
            if (dtHeaderDetails != null)
            {
                foreach (DataRow row in dtHeaderDetails.Rows)
                {
                    string strPatData = JsonConvert.SerializeObject(row);
                    HeaderDetailsDTO headerItem = JsonConvert.DeserializeObject<HeaderDetailsDTO>(strPatData);
                    headerList.Add(headerItem);
                }
            }
            return headerList;
        }*/

        public static List<HeaderDetailsDTO> MapDataTableToSingleObject(DataTable dtHeaderDetails)
        {
            List<HeaderDetailsDTO> retObj = new List<HeaderDetailsDTO>();
            if (dtHeaderDetails != null)
            {
                string strPatData = JsonConvert.SerializeObject(dtHeaderDetails);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<HeaderDetailsDTO> headerList = JsonConvert.DeserializeObject<List<HeaderDetailsDTO>>(strPatData);
                retObj = headerList;
            }
            return retObj;
        }
    }

    public class BillingDetailsDTO
    {
        public DateTime InvoiceDate { get; set; }
        public string ItemCode { get; set; }
        public string DepartmentName { get; set; }
        public string Particulars { get; set; }
        public float Quantity { get; set; }
        public float Rate { get; set; }
        public float SubTotalAmount { get; set; }
        public float DiscountAmount { get; set; }
        public float TotalAmount { get; set; }

        /*public static List<BillingDetailsDTO> MapDataTableToSingleObject(DataTable dtBillingDetails)
        {
            List<BillingDetailsDTO> billingList = new List<BillingDetailsDTO>();
            if (dtBillingDetails != null)
            {
                foreach (DataRow row in dtBillingDetails.Rows)
                {
                    string strPatData = JsonConvert.SerializeObject(row);
                    BillingDetailsDTO billItem = JsonConvert.DeserializeObject<BillingDetailsDTO>(strPatData);
                    billingList.Add(billItem);
                }
            }
            return billingList;
        }*/

        public static List<BillingDetailsDTO> MapDataTableToSingleObject(DataTable dtBillingDetails)
        {
            List<BillingDetailsDTO> retObj = new List<BillingDetailsDTO>();
            if (dtBillingDetails != null)
            {
                string strPatData = JsonConvert.SerializeObject(dtBillingDetails);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<BillingDetailsDTO> billingList = JsonConvert.DeserializeObject<List<BillingDetailsDTO>>(strPatData);
                retObj = billingList;
            }
            return retObj;
        }
    }

    public class PharmacyDetailsDTO
    {
        public DateTime InvoiceDate { get; set; }
        public string ItemCode { get; set; }
        public string Particulars { get; set; }
        public string BatchExpiry { get; set; }
        public float Quantity { get; set; }
        public float Rate { get; set; }
        public float SubTotalAmount { get; set; }
        public float DiscountAmount { get; set; }
        public float TotalAmount { get; set; }

        /*public static List<PharmacyDetailsDTO> MapDataTableToSingleObject(DataTable dtPharmacyDetails)
        {
            List<PharmacyDetailsDTO> pharmacyList = new List<PharmacyDetailsDTO>();
            if (dtPharmacyDetails != null)
            {
                foreach (DataRow row in dtPharmacyDetails.Rows)
                {
                    string strPatData = JsonConvert.SerializeObject(row);
                    PharmacyDetailsDTO pharmacyItem = JsonConvert.DeserializeObject<PharmacyDetailsDTO>(strPatData);
                    pharmacyList.Add(pharmacyItem);
                }
            }
            return pharmacyList;
        }*/
        public static List<PharmacyDetailsDTO> MapDataTableToSingleObject(DataTable dtPharmacyDetails)
        {
            List<PharmacyDetailsDTO> retObj = new List<PharmacyDetailsDTO>();
            if (dtPharmacyDetails != null)
            {
                string strPatData = JsonConvert.SerializeObject(dtPharmacyDetails);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<PharmacyDetailsDTO> pharmacyList = JsonConvert.DeserializeObject<List<PharmacyDetailsDTO>>(strPatData);
                retObj = pharmacyList;
            }
            return retObj;
        }

    }

    public class DocumentDetailsDTO
    {
        public string DocumentName { get; set; }

        /*public static List<DocumentDetailsDTO> MapDataTableToSingleObject(DataTable dtDocumentDetails)
        {
            List<DocumentDetailsDTO> documentList = new List<DocumentDetailsDTO>();
            if (dtDocumentDetails != null)
            {
                foreach (DataRow row in dtDocumentDetails.Rows)
                {
                    string strPatData = JsonConvert.SerializeObject(row);
                    DocumentDetailsDTO documentItem = JsonConvert.DeserializeObject<DocumentDetailsDTO>(strPatData);
                    documentList.Add(documentItem);
                }
            }
            return documentList;
        }*/

        public static List<DocumentDetailsDTO> MapDataTableToSingleObject(DataTable dtDocumentDetails)
        {
            List<DocumentDetailsDTO> retObj = new List<DocumentDetailsDTO>();
            if (dtDocumentDetails != null)
            {
                string strPatData = JsonConvert.SerializeObject(dtDocumentDetails);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<DocumentDetailsDTO> documentList = JsonConvert.DeserializeObject<List<DocumentDetailsDTO>>(strPatData);
                retObj = documentList;
            }
            return retObj;
        }
    }
}
