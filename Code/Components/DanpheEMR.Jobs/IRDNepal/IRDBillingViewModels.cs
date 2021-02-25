using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Configuration;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DanpheEMR.Jobs.Utilities;
namespace DanpheEMR.Jobs.IRDNepal
{
    // This model for save Billing and Billing return data at one place
    //we get some data from this table and send to ird as per IrD bill and ird bilreturn model
    public class IRD_Common_InvoiceModel
    {
        [Key]
        public Int64 IrdInvoiceId { get; set; }
        public int table_data_id { get; set; }
        /// <summary>
        /// eg: Billing, Pharmacy, etc..
        /// </summary>
        public string module_name { get; set; }
        /// <summary>
        /// eg: SalesBill, SalesReturnBill, etc..
        /// </summary>
        public string invoice_type { get; set; }
        public string seller_pan { get; set; }
        public string buyer_pan { get; set; }
        public string buyer_name { get; set; }
        public string fiscal_year { get; set; }
        public string invoice_number { get; set; }
        public string invoice_date { get; set; }
        public string invoice_date_eng { get; set; }
        public double total_sales { get; set; }
        public Nullable<double> discount_amount { get; set; }//kept only for our local purpose.
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
        public string entered_by { get; set; }
        public bool? is_printed { get; set; }
        public string printed_by { get; set; }
        public int print_count { get; set; }

        //Properites for SalesReturn
        public string credit_note_number { get; set; }
        public string credit_note_date { get; set; }

        public string return_date_eng { get; set; }
        public string remarks { get; set; }

        //for audit trail/sync tracking
        public bool? is_remote_synced { get; set; }
        public DateTime? synced_on { get; set; }
        public int sync_attempt_count { get; set; }
        public string sync_response_msg { get; set; }

        //Below two properties are only for local usage.
        [NotMapped]
        public BillReturnRequestModel SalesReturnModel { get; set; }
        [NotMapped]
        public BillingTransactionModel SalesModel { get; set; }


        public static IRD_Common_InvoiceModel MapFromBillTxnModel(BillingTransactionModel bill)
        {
            //ConfigurationManager.AppSettings["fiscal_year_IRDNepal"];
            string fiscal_year = "2074.075";//NBB-Need to remove hardcode and take from db
            string fiscal_year_ForInvNo = "2074/75";

            string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];

            IRD_Common_InvoiceModel retModel = new IRD_Common_InvoiceModel()
            {
                module_name = "billing",
                invoice_type = "sales",
                invoice_number = bill.BillingTransactionId.ToString(),
                invoice_date_eng = bill.PaidDate.ToString(),
                seller_pan = seller_pan,
                table_data_id = bill.BillingTransactionId,
                buyer_name = bill.Patient.ShortName,
                buyer_pan = bill.Patient.PANNumber,
                fiscal_year = fiscal_year,//change it to fiscal year later on.
                total_sales = bill.SubTotal.Value,//revise this.                              
                taxable_sales_hst = bill.TotalAmount,// bill.SubTotal - bill.DiscountAmount,
                hst = bill.HstTotal,
                entered_by = bill.CreatedBy.ToString(),//need username here.
                is_printed = bill.PrintCount.HasValue ? true : false,
                printed_by = bill.CreatedBy.ToString(),//need username here.
                print_count = bill.PrintCount.Value,
                discount_amount = bill.DiscountAmount,
                remarks = bill.Remarks
            };

            return retModel;
        }
    }

    //Bill Model -For IRD API
    public class IRD_BillViewModel
    {
        static string ird_SellerpanNo = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
        //static string ird_fiscalYear = "2074/075"; //NBB-Need to remove hardcode and take from db
        //ConfigurationManager.AppSettings["fiscal_year_IRDNepal"];

        public string username { get; set; }
        public string password { get; set; }
        public string seller_pan { get; set; }
        public string buyer_pan { get; set; }
        public string buyer_name { get; set; }
        public string fiscal_year { get; set; }
        public string invoice_number { get; set; }
        public string invoice_date { get; set; }
        public double total_sales { get; set; }//this is SubTotal = SUM (Price*Quantity)
        public double taxable_sales_vat { get; set; } // = total_sales - discountamount
        public double vat { get; set; } // = taxable_sales_vat * vat_percent/100
        public double excisable_amount { get; set; }
        public double excise { get; set; }
        public double taxable_sales_hst { get; set; } // = total_sales - discountamount
        public double hst { get; set; } // = taxable_sales_hst * hst_percent/100
        public double amount_for_esf { get; set; }
        public double esf { get; set; }
        public double export_sales { get; set; }
        public double tax_exempted_sales { get; set; }
        public bool isrealtime { get; set; }
        public DateTime datetimeclient { get; set; }

        public IRD_BillViewModel()
        {
            username = ConfigurationManager.AppSettings["user_IRDNepal"];
            password = ConfigurationManager.AppSettings["pwd_IRDNepal"];
            taxable_sales_vat = 0.0;
            vat = 0.0;
            excisable_amount = 0.0;
            excise = 0.0;
            amount_for_esf = 0.0;
            esf = 0.0;
            export_sales = 0.0;
            tax_exempted_sales = 0.0;
            isrealtime = false;
            datetimeclient = System.DateTime.Now;
        }

        public static IRD_BillViewModel GetMappedSalesBillForIRD(IRD_Common_InvoiceModel irdCommonInvoiceModel)
        {
            IRD_BillViewModel bill = new IRD_BillViewModel()
            {
                seller_pan = irdCommonInvoiceModel.seller_pan,
                buyer_name = irdCommonInvoiceModel.buyer_name,
                buyer_pan = irdCommonInvoiceModel.buyer_pan,
                fiscal_year = irdCommonInvoiceModel.fiscal_year,
                invoice_number = irdCommonInvoiceModel.fiscal_year + "-" + irdCommonInvoiceModel.invoice_number,
                invoice_date = irdCommonInvoiceModel.invoice_date,
                total_sales = irdCommonInvoiceModel.total_sales,
                taxable_sales_hst = irdCommonInvoiceModel.taxable_sales_hst.Value,
                hst = irdCommonInvoiceModel.hst.Value
            };
            return bill;
        }
    }

    //Bill Return class -For IRD API
    public class IRD_BillReturnViewModel
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
        public string return_date_eng { get; set; }
        public string reason_for_return { get; set; }
        public double total_sales { get; set; }
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

        public IRD_BillReturnViewModel()
        {
            username = ConfigurationManager.AppSettings["user_IRDNepal"];
            password = ConfigurationManager.AppSettings["pwd_IRDNepal"];
            taxable_sales_vat = 0.0;
            vat = 0.0;
            excisable_amount = 0.0;
            excise = 0.0;
            amount_for_esf = 0.0;
            esf = 0.0;
            export_sales = 0.0;
            tax_exempted_sales = 0.0;
            isrealtime = false;
            datetimeclient = System.DateTime.Now;
            credit_note_number = null;
        }

        public static IRD_BillReturnViewModel GetMappedSalesReturnBillForIRD(IRD_Common_InvoiceModel irdCommonInvoiceModel)
        {
            List<IRD_BillReturnViewModel> returnSalesBill = new List<IRD_BillReturnViewModel>();
            IRD_BillReturnViewModel saleReturn = new IRD_BillReturnViewModel()
            {
                seller_pan = irdCommonInvoiceModel.seller_pan,
                buyer_name = irdCommonInvoiceModel.buyer_name,
                buyer_pan = irdCommonInvoiceModel.buyer_pan,
                fiscal_year = irdCommonInvoiceModel.fiscal_year,
                ref_invoice_number = irdCommonInvoiceModel.fiscal_year + "-" + irdCommonInvoiceModel.invoice_number,
                return_date_eng = irdCommonInvoiceModel.credit_note_date,
                reason_for_return = irdCommonInvoiceModel.remarks,
                total_sales = irdCommonInvoiceModel.total_sales,
                taxable_sales_hst = irdCommonInvoiceModel.taxable_sales_hst,
                hst = irdCommonInvoiceModel.hst,
                credit_note_date = irdCommonInvoiceModel.credit_note_date,
                credit_note_number = irdCommonInvoiceModel.credit_note_number
            };
            return saleReturn;
        }

    }
}
