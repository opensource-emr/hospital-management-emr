using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Dispensary.DTOs
{
    public class PatientConsumption_DTO
    {
        public int ConsumptionReceiptNo { get; set; }
        public int HospitalNo { get; set; }
        public string PatientName { get; set; }
        public string Address { get; set; }
        public DateTime CreatedOn { get; set; }
        public string ContactNo { get; set; }
        public string Age { get; set; }
        public string Sex { get; set; }
        public string IpNo { get; set; }
        public decimal TotalAmount { get; set; }
        public string UserName { get; set; }

        public List<PatientConsumptionItems_DTO> PatientConsumptionItems { get; set; }

    }

    public class PatientConsumptionItems_DTO
    {
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TotalAmount { get; set; }

    }
}
