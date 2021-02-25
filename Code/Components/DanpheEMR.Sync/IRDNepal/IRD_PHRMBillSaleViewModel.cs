using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Configuration;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DanpheEMR.Sync.IRDNepal.Utilities;

namespace DanpheEMR.Sync.IRDNepal.Models
{

    public class IRD_PHRMBillSaleViewModel
    {
        public static string bilConString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;
        static string ird_SellerpanNo = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
        public string username { get; set; }
        public string password { get; set; }
        public string seller_pan { get; set; }
        public string buyer_pan { get; set; }
        public string buyer_name { get; set; }
        public string fiscal_year { get; set; }
        public string invoice_number { get; set; }
        public string invoice_date { get; set; }
        public decimal total_sales { get; set; }//this is SubTotal = SUM (Price*Quantity)
        public Nullable<double> taxable_sales_vat { get; set; } // = total_sales - discountamount
        public Nullable<double> vat { get; set; } // = taxable_sales_vat * vat_percent/100
        public Nullable<double> excisable_amount { get; set; }
        public Nullable<double> excise { get; set; }
        public Nullable<double> taxable_sales_hst { get; set; } // = total_sales - discountamount
        public Nullable<double> hst { get; set; } // = taxable_sales_hst * hst_percent/100
        public Nullable<double> amount_for_esf { get; set; }
        public Nullable<double> esf { get; set; }
        public Nullable<double> export_sales { get; set; }
        public Nullable<double> tax_exempted_sales { get; set; }
        public bool isrealtime { get; set; }
        public DateTime datetimeclient { get; set; }

        public IRD_PHRMBillSaleViewModel()
        {
            username = ConfigurationManager.AppSettings["user_IRDNepal"];
            password = ConfigurationManager.AppSettings["pwd_IRDNepal"];
            taxable_sales_vat = 0.0;
            vat = 0.0;
            taxable_sales_hst = 0.0;
            hst = 0.0;
            excisable_amount = 0.0;
            excise = 0.0;
            amount_for_esf = 0.0;
            esf = 0.0;
            export_sales = 0.0;
            tax_exempted_sales = 0.0;
            datetimeclient = System.DateTime.Now;
        }

        public static IRD_PHRMBillSaleViewModel GetMappedInvoiceForIRD(PHRMInvoiceTransactionModel billTxn, bool isRealTime)
        {
            string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];               
            IRD_PHRMBillSaleViewModel salesBill = new IRD_PHRMBillSaleViewModel()
            {
                seller_pan = seller_pan,
                buyer_name = billTxn.ShortName,
                buyer_pan = billTxn.PANNumber,
                fiscal_year = billTxn.FiscalYear,
                invoice_number = "PH" + billTxn.InvoicePrintId,//get this value from current InvoiceCode
                invoice_date = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(billTxn.CreateOn.ToString()))),
                total_sales = billTxn.TotalAmount.Value,
                isrealtime = isRealTime
            };
            return salesBill;
        }

    }

    public class IRD_PHRMBillSaleReturnViewModel
    {
        public string username { get; set; }
        public string password { get; set; }
        public string seller_pan { get; set; }
        public string buyer_pan { get; set; }
        public string buyer_name { get; set; }
        public string fiscal_year { get; set; }
        public string ref_invoice_number { get; set; }
        public string credit_note_number { get; set; }
        public string credit_note_date { get; set; }
        //public string return_date_eng { get; set; }
        public string reason_for_return { get; set; }
        public decimal total_sales { get; set; }
        public Nullable<double> taxable_sales_vat { get; set; }
        public Nullable<double> vat { get; set; }
        public Nullable<double> excisable_amount { get; set; }
        public Nullable<double> excise { get; set; }
        public Nullable<double> taxable_sales_hst { get; set; }
        public Nullable<double> hst { get; set; }
        public Nullable<double> amount_for_esf { get; set; }
        public Nullable<double> esf { get; set; }
        public Nullable<double> export_sales { get; set; }
        public Nullable<double> tax_exempted_sales { get; set; }
        public bool isrealtime { get; set; }
        public DateTime datetimeclient { get; set; }

        public static string bilConString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;

        public IRD_PHRMBillSaleReturnViewModel()
        {
            username = ConfigurationManager.AppSettings["user_IRDNepal"];
            password = ConfigurationManager.AppSettings["pwd_IRDNepal"];
            taxable_sales_vat = 0.0;
            vat = 0.0;
            taxable_sales_hst = 0.0;
            hst = 0.0;
            excisable_amount = 0.0;
            excise = 0.0;
            amount_for_esf = 0.0;
            esf = 0.0;
            export_sales = 0.0;
            tax_exempted_sales = 0.0;
            datetimeclient = System.DateTime.Now;
            credit_note_number = null;
        }

        public static IRD_PHRMBillSaleReturnViewModel GetMappedPhrmSalesReturnBillForIRD(PHRMInvoiceTransactionModel billReturn, bool isRealTime)
        {
            string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
            //assign in both hst+vat since we've already set values in respective fields while local syncing
            IRD_PHRMBillSaleReturnViewModel saleReturn = new IRD_PHRMBillSaleReturnViewModel()
            {
                ref_invoice_number = "PH" + billReturn.InvoicePrintId,
                seller_pan = seller_pan,
                total_sales = billReturn.TotalAmount.Value,
                buyer_name = billReturn.ShortName,
                buyer_pan = billReturn.PANNumber,
                fiscal_year = billReturn.FiscalYear,
                credit_note_number = "",
                credit_note_date = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(billReturn.CreateOn.ToString()))),
                reason_for_return = billReturn.Remark,
                taxable_sales_hst = 0.0,
                hst = 0.0,
                taxable_sales_vat = 0.0,
                vat = 0.0
            };

            return saleReturn;

        }
    }
}
