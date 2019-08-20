import { PHRMPatient } from "./phrm-patient.model";
import { PHRMInvoiceItemsModel } from './phrm-invoice-items.model';
import { PHRMInvoiceModel } from './phrm-invoice.model';
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from 'moment/moment';

export class PharmacyReceiptModel {
  public ReceiptNo: number = null;
  public ReceiptPrintNo: number = 0;
  public CurrentFinYear: string = "" ;//"2074/2075";//IMPORTANT !!! remove this hardcode and get this value from server side.
  public ReceiptType: string = null;//eg: Sale, SaleReturn etc.. 
  public Patient: PHRMPatient = new PHRMPatient();
  public InvoiceItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  //public ReturnedItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public TotalQuantity: number = null;
  public ReceiptDate: string = null;
  public SubTotal: number = null;
  public DiscountAmount: number = null;
  public VATAmount: number = null;
  public TotalAmount: number = null;
  public PaidAmount: number = null;
  public Tender: number = null;
  public Change: number = null;
  public Phonenumber: string = null;
  public Remarks: string = null;
  public BillStatus: string = null;
  public TotalCreditAmount: number = 0;
  public BillingUser: string = null;//make User model later if required.
  public PrintCount: number = 0;
  public Adjustment: number = 0;
  public IsValid: boolean = false;
  public IsReturned: boolean = false;
  public DepositAmount: number = 0;
  public DepositDeductAmount: number = 0;
  public PaymentMode: string = "cash";

  public static GetReceiptForTransaction(invTxn: PHRMInvoiceModel): PharmacyReceiptModel {
    let retReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
    retReceipt.ReceiptNo = invTxn.InvoiceId;
    retReceipt.ReceiptPrintNo = invTxn.InvoicePrintId;
    retReceipt.ReceiptDate = invTxn.CreateOn;
    retReceipt.SubTotal = invTxn.SubTotal;
    retReceipt.DiscountAmount = invTxn.DiscountAmount;
    retReceipt.VATAmount = invTxn.VATAmount;
    retReceipt.TotalAmount = invTxn.TotalAmount;
    retReceipt.PaidAmount = invTxn.PaidAmount;
    retReceipt.BillStatus = invTxn.BilStatus;
    retReceipt.Remarks = invTxn.Remark;
    retReceipt.TotalCreditAmount = invTxn.CreditAmount;
    ///retReceipt.Patient = invTxn.selectedPatient;
    retReceipt.InvoiceItems = invTxn.InvoiceItems;
    retReceipt.Tender = invTxn.Tender;
    retReceipt.Change = invTxn.Change;
    retReceipt.Adjustment = invTxn.Adjustment;
    retReceipt.PrintCount = invTxn.PrintCount;
    retReceipt.DepositAmount = invTxn.DepositAmount;
    retReceipt.DepositDeductAmount = invTxn.DepositDeductAmount;
    retReceipt.PaymentMode = invTxn.PaymentMode;
    retReceipt.CurrentFinYear=invTxn.FiscalYear;
    return retReceipt;
  }




}
