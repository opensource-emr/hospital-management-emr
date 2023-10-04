using System.Collections.Generic;
using System;

namespace DanpheEMR.Services.Pharmacy.DTOs.Settlement
{
    public class PharmacyCreditInvoice_DTO
    {
        public int PatientId { get; set; }
        public int InvoiceId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public int InvoiceNo { get; set; }
        public double SalesAmount { get; set; }
        public double ReturnAmount { get; set; }
        public double NetAmount { get; set; }
        public string BillReturnIdsCSV { get; set; }
        public string InvoiceOf { get; set; }
        public List<int> ArrayOfBillReturnIds { get; set; }
    }
}
