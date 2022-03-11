import { PHRMPatient } from "./phrm-patient.model";
import { PHRMInvoiceItemsModel } from './phrm-invoice-items.model';
import { PHRMInvoiceModel } from './phrm-invoice.model';
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from 'moment/moment';
import { PHRMInvoiceReturnItemsModel } from "./phrm-invoice-return-items.model";

export class PharmacyReceiptModel {
    public ReceiptNo: number = null;
    public CRNNo: number;//creditonoteid for view
    public ReceiptPrintNo: number = 0;
    public CurrentFinYear: string = "";//"2074/2075";//IMPORTANT !!! remove this hardcode and get this value from server side.
    public ReceiptType: string = null;//eg: Sale, SaleReturn etc.. 
    public Patient: PHRMPatient = new PHRMPatient();
    public ReturnedQty: number;// for view of return qty while returned from cust
    public InvoiceItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public InvoiceReturnItems: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    //public ReturnedItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
    public TotalQuantity: number = null;
    public ReceiptDate: string = null;
    public SubTotal: number = null;
    public DiscountAmount: number = null;
    public TaxableAmount: number = 0;
    public NonTaxableAmount: number = 0;
    public VATPercentage: number = 0;
    public VATAmount: number = null;
    public TotalAmount: number = null;
    public PaidAmount: number = null;
    public Tender: number = null;
    public Change: number = null;
    public Phonenumber: string = null;
    public Remarks: string = null;
    public BillStatus: string = null;
    public TotalCreditAmount: number = 0;
    public CreditOrganizationName: string; //shankar 25 May'20 to display credit organization name in the reciept.
    public BillingUser: string = null;//make User model later if required.
    public PrintCount: number = 0;
    public Adjustment: number = 0;
    public IsValid: boolean = false;
    public IsReturned: boolean = false;
    public DepositAmount: number = 0;
    public InvoiceCode: string = 'PH';
    public DepositDeductAmount: number = 0;
    public DepositBalance: number = 0;
    public localReceiptdate: string = null;
    public PaymentMode: string = "";
    public ClaimCode: number;
    public ProviderName: string;
    public ProviderNMCNumber: string;
    StoreId: number = null;
    public static GetReceiptForTransaction(invTxn: PHRMInvoiceModel): PharmacyReceiptModel {
        let retReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
        retReceipt.ReceiptNo = invTxn.InvoiceId;
        retReceipt.ReceiptPrintNo = invTxn.InvoicePrintId;
        retReceipt.ReceiptDate = invTxn.CreateOn;
        retReceipt.SubTotal = invTxn.SubTotal;
        retReceipt.DiscountAmount = invTxn.DiscountAmount;
        retReceipt.VATAmount = invTxn.VATAmount;
        retReceipt.VATPercentage = invTxn.VATPercentage;
        retReceipt.TaxableAmount = invTxn.TaxableAmount;
        retReceipt.NonTaxableAmount = invTxn.NonTaxableAmount;
        retReceipt.TotalAmount = invTxn.TotalAmount;
        retReceipt.PaidAmount = invTxn.PaidAmount;
        retReceipt.BillStatus = invTxn.BilStatus;
        retReceipt.Remarks = invTxn.Remark;
        retReceipt.TotalCreditAmount = invTxn.CreditAmount;
        retReceipt.CreditOrganizationName = invTxn.CreditOrganizationName;
        ///retReceipt.Patient = invTxn.selectedPatient;
        retReceipt.InvoiceItems = invTxn.InvoiceItems;
        retReceipt.Tender = invTxn.Tender;
        retReceipt.Change = invTxn.Change;
        retReceipt.Adjustment = invTxn.Adjustment;
        retReceipt.PrintCount = invTxn.PrintCount;
        retReceipt.DepositAmount = invTxn.DepositAmount;
        retReceipt.DepositBalance = invTxn.DepositBalance;
        retReceipt.DepositDeductAmount = invTxn.DepositDeductAmount;
        retReceipt.PaymentMode = invTxn.PaymentMode;
        retReceipt.CurrentFinYear = invTxn.FiscalYear;
        retReceipt.ClaimCode = invTxn.ClaimCode;
        retReceipt.ProviderNMCNumber = invTxn.ProviderNMCNumber;
        retReceipt.ProviderName = invTxn.ProviderName;
        return retReceipt;
    }


}
