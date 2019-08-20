using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class InvoiceDetailsModel
    {

        public string Fiscal_Year { get; set; }
        public string Bill_No { get; set; }
        public string Customer_name { get; set; }
        public string PANNumber { get; set; }
        public string BillDate { get; set; }
        public string BillType { get; set; }
        public double Amount { get; set; }
        public double DiscountAmount { get; set; }
        public double Taxable_Amount { get; set; }
        public double Tax_Amount { get; set; }
        public double Total_Amount { get; set; }
        public string SyncedWithIRD { get; set; }
        public string Is_Printed { get; set; }
        public string Printed_Time { get; set; }
        public string Entered_by { get; set; }
        public string Printed_by { get; set; }
        public int Print_Count { get; set; }
        public string Is_Bill_Active { get; set; }//added: sud-9May'18
        public string Is_Realtime { get; set; }//added: sud-9May'18
    }
}
