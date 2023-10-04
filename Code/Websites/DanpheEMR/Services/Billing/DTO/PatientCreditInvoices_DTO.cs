using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.Billing.DTO
{
    public class PatientCreditInvoices_DTO
    {
        public int PatientId { get; set; }
        public int TransactionId { get; set; }
        public string InvoiceCode { get; set; }
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
