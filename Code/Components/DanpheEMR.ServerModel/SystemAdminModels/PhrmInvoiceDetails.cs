using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SystemAdminModels
{
    public class PhrmInvoiceDetails
    {
        public string Fiscal_Year { get; set; }
        public string Bill_No { get; set; }
        public string Customer_name { get; set; }
        public string PANNumber { get; set; }
        public string BillDate { get; set; }
        public string BillType { get; set; }
        public decimal Amount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Taxable_Amount { get; set; }
        public decimal Tax_Amount { get; set; }
        public decimal Total_Amount { get; set; }
        public decimal VAT_Refund_Amount { get; set; }
        public string SyncedWithIRD { get; set; }
        public string Is_Printed { get; set; }
        public string Printed_Time { get; set; }
        public string Entered_by { get; set; }
        public string Printed_by { get; set; }
       // public int? Print_Count { get; set; }
        public string Is_Bill_Active { get; set; }
        public string Is_Realtime { get; set; }
        public decimal NonTaxable_Amount { get; set; }
        public string Payment_Method { get; set; } //added: shankar-20sept'21
        public string TransactionId { get; set; } //added: shankar-20sept'21

    }
}
