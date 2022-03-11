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
    // This model for save Billing and Billing return data at one place
    //we get some data from this table and send to ird as per IrD bill and ird bilreturn model

    //public class IRD_Common_InvoiceModel
    //{
    //    [Key]
    //    public Int64 IrdInvoiceId { get; set; }
    //    public int table_data_id { get; set; }
    //    /// <summary>
    //    /// eg: Billing, Pharmacy, etc..
    //    /// </summary>
    //    public string module_name { get; set; }
    //    /// <summary>
    //    /// eg: SalesBill, SalesReturnBill, etc..
    //    /// </summary>
    //    public string invoice_type { get; set; }
    //    public string seller_pan { get; set; }
    //    public string buyer_pan { get; set; }
    //    public string buyer_name { get; set; }
    //    public string fiscal_year { get; set; }
    //    public string invoice_number { get; set; }
    //    public string invoice_date { get; set; }
    //    public string invoice_date_eng { get; set; }
    //    public double total_sales { get; set; }
    //    public Nullable<double> discount_amount { get; set; }//kept only for our local purpose.
    //    public Nullable<double> taxable_sales_vat { get; set; }
    //    public Nullable<double> vat { get; set; }
    //    public Nullable<double> excisable_amount { get; set; }
    //    public Nullable<double> excise { get; set; }
    //    public Nullable<double> taxable_sales_hst { get; set; }
    //    public Nullable<double> hst { get; set; }
    //    public Nullable<double> amount_for_esf { get; set; }
    //    public Nullable<double> esf { get; set; }
    //    public Nullable<double> export_sales { get; set; }
    //    public Nullable<double> tax_exempted_sales { get; set; }
    //    public string entered_by { get; set; }
    //    public bool? is_printed { get; set; }
    //    public string printed_by { get; set; }
    //    public int print_count { get; set; }

    //    //Properites for SalesReturn
    //    public string credit_note_number { get; set; }
    //    public string credit_note_date { get; set; }

    //    public string return_date_eng { get; set; }
    //    public string remarks { get; set; }

    //    //for audit trail/sync tracking
    //    public bool? is_remote_synced { get; set; }
    //    public DateTime? synced_on { get; set; }
    //    public int sync_attempt_count { get; set; }
    //    public string sync_response_msg { get; set; }
    //    public bool? isrealtime { get; set; }//sud: 10May

    //    //Below two properties are only for local usage.
    //    [NotMapped]
    //    public BillInvoiceReturnModel SalesReturnModel { get; set; }
    //    [NotMapped]
    //    public BillingTransactionModel SalesModel { get; set; }
    //    //Need to remove hardcode later on..!!
    //    private static string GetTaxNameById(int taxId)
    //    {
    //        //now only 2taxes are there.. later remove this hardcode and get proper value by joining with the tax table.
    //        if (taxId == 1)//HST
    //            return "HST";
    //        else //VAT
    //            return "VAT";

    //    }

    //    internal static IRD_Common_InvoiceModel MapFromBillTxnModel(BillingTransactionModel bill, bool isrealtime = true)
    //    {
    //        //ConfigurationManager.AppSettings["fiscal_year_IRDNepal"];
    //        //string fiscal_year = "2074.075";//NBB-Need to remove hardcode and take from db

    //        string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
    //        //string taxName = ConfigurationManager.AppSettings["taxName_IRDNepal"];
    //        string taxName = GetTaxNameById(bill.TaxId.Value);

    //        IRD_Common_InvoiceModel retModel = new IRD_Common_InvoiceModel()
    //        {
    //            module_name = "billing",
    //            invoice_type = "sales",
    //            invoice_number = bill.InvoiceNo.ToString(),
    //            invoice_date_eng = bill.PaidDate.ToString(),
    //            seller_pan = seller_pan,
    //            table_data_id = bill.BillingTransactionId,
    //            buyer_name = bill.Patient.ShortName,
    //            buyer_pan = bill.Patient.PANNumber,
    //            fiscal_year = bill.FiscalYear,//change it to fiscal year later on.
    //            total_sales = bill.TotalAmount.Value,//revise this.                              
    //            taxable_sales_hst = 0.0,
    //            hst = 0.0,
    //            taxable_sales_vat = 0.0,
    //            vat = 0.0,
    //            entered_by = bill.CreatedBy.ToString(),//need username here.
    //            is_printed = bill.PrintCount.HasValue ? true : false,
    //            printed_by = bill.CreatedBy.ToString(),//need username here.
    //            print_count = bill.PrintCount.Value,
    //            discount_amount = bill.DiscountAmount,
    //            remarks = bill.Remarks,
    //            isrealtime = isrealtime
    //        };

    //        if (taxName == "HST")
    //        {
    //            retModel.taxable_sales_hst = bill.SubTotal - bill.DiscountAmount;
    //            retModel.hst = bill.TaxTotal;
    //        }
    //        else if (taxName == "VAT")
    //        {
    //            retModel.taxable_sales_vat = bill.SubTotal - bill.DiscountAmount;
    //            retModel.vat = bill.TaxTotal;
    //        }

    //        return retModel;
    //    }

    //    internal static IRD_Common_InvoiceModel MapFromBillReturnModel(BillInvoiceReturnModel billReturn, bool isrealtime = true)
    //    {
    //        string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
    //        string taxName = GetTaxNameById(billReturn.TaxId.Value);
    //        //string taxName = ConfigurationManager.AppSettings["taxName_IRDNepal"];//get this from database

    //        IRD_Common_InvoiceModel retModel = new IRD_Common_InvoiceModel()
    //        {
    //            module_name = "billing",
    //            invoice_type = "sales-return",
    //            table_data_id = billReturn.BillReturnId,
    //            invoice_number = billReturn.RefInvoiceNum.ToString(),
    //            seller_pan = seller_pan,
    //            buyer_name = billReturn.Patient.ShortName,
    //            buyer_pan = billReturn.Patient.PANNumber,
    //            fiscal_year = billReturn.FiscalYear,
    //            total_sales = billReturn.TotalAmount.Value,
    //            discount_amount = billReturn.DiscountAmount,
    //            entered_by = billReturn.CreatedBy.ToString(),
    //            credit_note_number = billReturn.CreditNoteNumber.ToString(),
    //            credit_note_date = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(billReturn.CreatedOn.ToString()))),
    //            return_date_eng = billReturn.CreatedOn.ToString(),
    //            remarks = billReturn.Remarks,
    //            is_remote_synced = false,
    //            sync_attempt_count = 0,
    //            taxable_sales_hst = 0.0,
    //            hst = 0.0,
    //            taxable_sales_vat = 0.0,
    //            vat = 0.0,
    //            SalesReturnModel = billReturn,
    //            isrealtime = isrealtime
    //        };

    //        if (taxName == "HST")
    //        {
    //            retModel.taxable_sales_hst = billReturn.SubTotal - billReturn.DiscountAmount;
    //            retModel.hst = billReturn.TaxTotal;
    //        }
    //        else if (taxName == "VAT")
    //        {
    //            retModel.taxable_sales_vat = billReturn.SubTotal - billReturn.DiscountAmount;
    //            retModel.vat = billReturn.TaxTotal;
    //        }

    //        return retModel;
    //    }

    //}

    //Bill Model -For IRD API
    public class IRD_BillViewModel
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
        public double total_sales { get; set; }//this is SubTotal = SUM (Price*Quantity)
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
        //somehow datetimeclient is not working with both Datetime as well as string type.  
        //error message: 102: Date Format(YYYY.MM.DD) not matched. 
        //datetimeclient = System.DateTime.Now.ToString("yyyy.MM.dd hh:mm:ss");
        //public string datetimeclient { get; set; }
        public DateTime datetimeclient { get; set; }

        public IRD_BillViewModel()
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
            //isrealtime = true;
            //somehow datetimeclient is not working with both Datetime as well as string type.  
            //error message: 102: Date Format(YYYY.MM.DD) not matched. 
            //datetimeclient = System.DateTime.Now.ToString("yyyy.MM.dd hh:mm:ss");
            datetimeclient = System.DateTime.Now;
        }


        public static IRD_BillViewModel GetMappedSalesBillForIRD(BillingTransactionModel billTxn, bool isRealTime)
        {
            string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];
            //assign in both hst+vat since we've already set values in respective fields while local syncing
            IRD_BillViewModel salesBill = new IRD_BillViewModel()
            {
                seller_pan = seller_pan,
                buyer_name = billTxn.Patient.ShortName,
                buyer_pan = billTxn.Patient.PANNumber,
                fiscal_year = billTxn.FiscalYear,
                invoice_number = "BL" + billTxn.InvoiceNo,//get this value from current InvoiceCode
                invoice_date = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(billTxn.CreatedOn.ToString()))),
                total_sales = billTxn.TotalAmount.Value,
                isrealtime = isRealTime
            };

            if (billTxn.TaxId == 1)//this is HST--remove hard-code from here: sud 10May'18
            {
                salesBill.taxable_sales_hst = billTxn.TaxableAmount;
                salesBill.hst = billTxn.TaxTotal;
            }
            else if (billTxn.TaxId == 2)//this is vat
            {
                salesBill.taxable_sales_vat = billTxn.TaxableAmount;
                salesBill.vat = billTxn.TaxTotal;
            }

            if (string.IsNullOrEmpty(salesBill.fiscal_year))
            {
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);

                string fiscalYear = dbContext.BillingFiscalYears.Where(f => f.FiscalYearId == billTxn.FiscalYearId).Select(f => f.FiscalYearFormatted).FirstOrDefault();
                salesBill.fiscal_year = fiscalYear;

            }

            return salesBill;
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
        //public string return_date_eng { get; set; }
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
        //somehow datetimeclient is not working with both Datetime as well as string type.  
        //error message: 102: Date Format(YYYY.MM.DD) not matched. 
        //datetimeclient = System.DateTime.Now.ToString("yyyy.MM.dd hh:mm:ss");
        //public string datetimeclient { get; set; }
        public DateTime datetimeclient { get; set; }

        public static string bilConString = ConfigurationManager.ConnectionStrings["irdNplConnStr"].ConnectionString;

        public IRD_BillReturnViewModel()
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
            //somehow datetimeclient is not working with both Datetime as well as string type.  
            //error message: 102: Date Format(YYYY.MM.DD) not matched. 
            //datetimeclient = System.DateTime.Now.ToString("yyyy.MM.dd hh:mm:ss");
            datetimeclient = System.DateTime.Now;
            credit_note_number = null;
        }

        //public static IRD_BillReturnViewModel GetMappedSalesReturnBillForIRD(IRD_Common_InvoiceModel irdCommonInvoiceModel, bool isRealTime)
        //{
        //    //assign in both hst+vat since we've already set values in respective fields while local syncing
        //    IRD_BillReturnViewModel saleReturn = new IRD_BillReturnViewModel()
        //    {
        //        seller_pan = irdCommonInvoiceModel.seller_pan,
        //        buyer_name = irdCommonInvoiceModel.buyer_name,
        //        buyer_pan = irdCommonInvoiceModel.buyer_pan,
        //        fiscal_year = irdCommonInvoiceModel.fiscal_year,
        //        ref_invoice_number = "BL" + irdCommonInvoiceModel.invoice_number,//get this value from current InvoiceCode
        //        return_date_eng = irdCommonInvoiceModel.credit_note_date,
        //        reason_for_return = irdCommonInvoiceModel.remarks,
        //        total_sales = irdCommonInvoiceModel.total_sales,
        //        taxable_sales_hst = irdCommonInvoiceModel.taxable_sales_hst,
        //        hst = irdCommonInvoiceModel.hst,
        //        taxable_sales_vat = irdCommonInvoiceModel.taxable_sales_vat,
        //        vat = irdCommonInvoiceModel.vat,
        //        credit_note_date = irdCommonInvoiceModel.credit_note_date,
        //        credit_note_number = irdCommonInvoiceModel.credit_note_number,
        //        isrealtime = isRealTime
        //    };
        //    return saleReturn;
        //}


        public static IRD_BillReturnViewModel GetMappedSalesReturnBillForIRD(BillInvoiceReturnModel billReturn, bool isRealTime)
        {
            string seller_pan = ConfigurationManager.AppSettings["seller_pan_IRDNepal"];

            //assign in both hst+vat since we've already set values in respective fields while local syncing
            IRD_BillReturnViewModel saleReturn = new IRD_BillReturnViewModel()
            {
                isrealtime = isRealTime,
                ref_invoice_number = "BL" + billReturn.RefInvoiceNum,
                seller_pan = seller_pan,
                buyer_name = billReturn.Patient.ShortName,
                buyer_pan = billReturn.Patient.PANNumber,
                fiscal_year = billReturn.FiscalYear,
                total_sales = billReturn.TotalAmount.Value,
                credit_note_number = billReturn.CreditNoteNumber.ToString(),
                credit_note_date = DanpheDateConvertor.NepDateToString(DanpheDateConvertor.ConvertEngToNepDate(Convert.ToDateTime(billReturn.CreatedOn.ToString()))),
                reason_for_return = billReturn.Remarks,
                taxable_sales_hst = 0.0,
                hst = 0.0,
                taxable_sales_vat = 0.0,
                vat = 0.0
            };
            if (billReturn.TaxId == 1)//this is HST
            {
                saleReturn.taxable_sales_hst = billReturn.SubTotal - billReturn.DiscountAmount;
                saleReturn.hst = billReturn.TaxTotal;
            }
            else if (billReturn.TaxId == 2)
            {
                saleReturn.taxable_sales_vat = billReturn.SubTotal - billReturn.DiscountAmount;
                saleReturn.vat = billReturn.TaxTotal;
            }

            if (string.IsNullOrEmpty(saleReturn.fiscal_year))
            {
                IRDNepalDbContext dbContext = new IRDNepalDbContext(bilConString);

                string fiscalYear = dbContext.BillingFiscalYears.Where(f => f.FiscalYearId == billReturn.FiscalYearId).Select(f => f.FiscalYearFormatted).FirstOrDefault();
                saleReturn.fiscal_year = fiscalYear;

            }

            return saleReturn;

        }

    }
}