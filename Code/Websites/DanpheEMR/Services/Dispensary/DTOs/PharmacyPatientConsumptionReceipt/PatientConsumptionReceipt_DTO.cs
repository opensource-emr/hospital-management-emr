using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyPatientConsumption
{
    public class PatientConsumptionReceipt_DTO
    {
        public int ConsumptionReceiptNo { get; set; }
        public string HospitalNo { get; set; }
        public string PatientName { get; set; }
        public string Address { get; set; }
        public string CountrySubDivisionName { get; set; }
        public DateTime CreatedOn { get; set; }
        public string ContactNo { get; set; }
        public string Age { get; set; }
        public string Sex { get; set; }
        public string IpNo { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public string UserName { get; set; }
        public string PrescriberName { get; set; }
        public string PrescriberNMCNo { get; set; }
        public string CurrentFiscalYearName { get; set; }

        public List<PatientConsumptionReceiptItems_DTO> PatientConsumptionItems { get; set; }

    }

    public class PatientConsumptionReceiptItems_DTO
    {
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public string RackNo { get; set; }

    }
}
