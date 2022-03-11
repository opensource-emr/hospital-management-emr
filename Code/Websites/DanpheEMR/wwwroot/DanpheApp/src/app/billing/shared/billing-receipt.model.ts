import { Patient } from "../../patients/shared/patient.model";
import { BillingTransactionItem } from './billing-transaction-item.model';
import { BillingTransaction } from "./billing-transaction.model";
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from 'moment/moment';
import { ENUM_InvoiceType } from "../../shared/shared-enums";

export class BillingReceiptModel {
  public BillingTransactionId: number = null;//added: sud-7May'18
  public ReceiptNo: number = null;
  public CurrentFinYear: string = null;//IMPORTANT !!! remove this hardcode and get this value from server side.
  public ReceiptType: string = null;//eg: Provisional
  public Patient: Patient = new Patient();
  public VisitId: number = null;
  public AppointmentType: string = null;
  public BillingItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public ReturnedItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public BillingTransactionItems: any;
  public BillingDate: string = null;
  public CreditNoteNumber: number = null;
  public InsTransactionDate: string = null;//sud:19Jul'19--For Insurance Invoice (Don't Change it..)

  public SubTotal: number = null;
  public DiscountPercent: number = null;
  public DiscountAmount: number = null;
  public TaxTotal: number = null;
  public TotalAmount: number = null;
  public DepositReturnAmount: number = null;
  public Tender: number = null;
  public DepositBalance: number = null;
  public DepositUsed: number = null;//sud:11May'21--new fields added in billingtransaction table.. 
  public DepositAvailable: number = null;//sud:11May'21--new fields added in billingtransaction table.. 
  public ReturnedSubTotal: number = null;
  public ReturnedDiscount: number = null;
  public ReturnedTax: number = null;
  public ReturnedAmount: number = null;
  public Phonenumber: string = null;
  public Change: number = null;
  public Remarks: string = null;
  public BillingUser: string = null;//make User model later if required.
  public PrintCount: number = 0;
  public PrintedOn: string = null;
  public PrintedBy: number = 0;
  public IsValid: boolean = false;

  public PrintReturnReceipt: boolean = false; //Rajesh:20Sept19

  public IsAllReturnItem: boolean = true;//Rajesh:7Sept19
  public PartialReturnTxnId: number = 0;//Rajesh:7Sept19
  //public ReturnAmount:number = 0;// Rajesh: 12Sept19 for client side only


  public PaymentMode: string = null;//added: sud:4May'18
  public PaymentDetails: string = null;//added: sud:4May'18
  public BillStatus: string = null;//added: sud:4May'18

  public TaxableAmount: number = null;//added: sud:6May'18
  //invoice issue date should be print-date.. 
  public InvoiceIssueDate: string = null;//moment().format("YYYY-MM-DD HH:mm"); //added: sud:6May'18
  public InvIssueDateLocal: string = null;
  public InvoiceCode: string = null; //added: ashim: 7May'18
  public InvoiceNo: number = null;
  public TaxId: number = null;
  public IsReturned: boolean = false;//added: sud: 13May'18

  //used in client side, to differ from item billing and opd billing
  public BillingType: string = null;

  public PackageId: number = 0;
  public PackageName: string = null;

  public IMISCode: string = null;
  public IsInsuranceBilling: boolean = false;//sud:21Mar'19-- for insurance receipts.
  public OrganizationId: number = 0; //Yubraj --22nd April '19 -- for credit organization
  public OrganizationName: string = null;

  public ProvisionalReceiptNo: number = null; //Yubraj 31st May '19 --for provisional slip
  public ProvisionalFiscalYearId: number = null; //Yubraj 31st May '19 --for provisional slip
  public singleReceiptBool: boolean = false; //Yubraj 31st May '19 --for provisional slip


  //sud:12Aug'19--To show in receipt. Note: This and Referred by field are different.
  //Referred by is shown only at the time of OPD. and Consulting doctor is shown on other cases.
  public ConsultingDrName: string = null;

  public OPDReferredByDrName: string = null;//sud:12Aug'19--this will be used for OPD, above will be used for other receipts.

  public QueueNo: number = 0;//pratik:6march'20-- to show Queue no. in recipt.
  public IpNumber: number = null;//pratik:21May'20-- for Inpatient partial billing

  public DeptRoomNumber: string = null;
  public Ins_NshiNumber: string = null;
  public LabTypeName: string = '';
  public ClaimCode: number = null;

  public static GetReceiptForTransaction(billingTxn: BillingTransaction): BillingReceiptModel {
    let retReceipt: BillingReceiptModel = new BillingReceiptModel();
    retReceipt.ReceiptNo = billingTxn.InvoiceNo;
    retReceipt.BillingTransactionId = billingTxn.BillingTransactionId;
    retReceipt.DepositBalance = billingTxn.DepositBalance;
    retReceipt.DepositReturnAmount = billingTxn.DepositReturnAmount;
    retReceipt.DepositUsed = billingTxn.DepositUsed;//sud:11May'21--new fields added in billingtransaction table.. 
    retReceipt.DepositAvailable = billingTxn.DepositAvailable;//sud:11May'21--new fields added in billingtransaction table.. 

    retReceipt.DiscountAmount = CommonFunctions.parseAmount(billingTxn.DiscountAmount);
    retReceipt.DiscountPercent = CommonFunctions.parseAmount(billingTxn.DiscountPercent);
    retReceipt.TotalAmount = CommonFunctions.parseAmount(billingTxn.TotalAmount);
    retReceipt.SubTotal = CommonFunctions.parseAmount(billingTxn.SubTotal);
    retReceipt.TaxTotal = CommonFunctions.parseAmount(billingTxn.TaxTotal);
    retReceipt.Tender = billingTxn.Tender;
    retReceipt.Change = billingTxn.Change;
    retReceipt.BillingDate = billingTxn.CreatedOn;//sud: needs revision.
    retReceipt.BillingItems = billingTxn.BillingTransactionItems;
    retReceipt.Remarks = billingTxn.Remarks;
    retReceipt.CreditNoteNumber = billingTxn.CreditNoteNumber;
    retReceipt.PaymentMode = billingTxn.PaymentMode;//added: sud:4May'18
    retReceipt.BillStatus = billingTxn.BillStatus;//added: sud:4May'18
    retReceipt.PaymentDetails = billingTxn.PaymentDetails;//added: sud:4May'18
    retReceipt.CurrentFinYear = billingTxn.FiscalYear;//added: sud:5May'18
    retReceipt.InvoiceCode = billingTxn.InvoiceCode; //added: ashim: 7May'18
    retReceipt.InvoiceNo = billingTxn.InvoiceNo;//added: ashim: 7May'18
    retReceipt.TaxId = billingTxn.TaxId;
    retReceipt.VisitId = billingTxn.PatientVisitId;//sud: 20Aug'18--
    retReceipt.IsInsuranceBilling = billingTxn.IsInsuranceBilling;
    retReceipt.OrganizationId = billingTxn.OrganizationId
    retReceipt.OrganizationName = billingTxn.OrganizationName
    retReceipt.InsTransactionDate = billingTxn.InsTransactionDate; // sud:20Jul'19--For Insurance Transaction Date.
    retReceipt.Ins_NshiNumber = billingTxn.Ins_NshiNumber;
    retReceipt.ClaimCode = billingTxn.ClaimCode;//sud:12May'21--for Insurance. 
    retReceipt.LabTypeName = billingTxn.LabTypeName;
    //retReceipt.TaxableAmount = billingTxn.TaxableAmount;
    billingTxn.BillingTransactionItems.forEach(itm => {
      retReceipt.TaxableAmount += itm.TaxableAmount;
    });

    retReceipt.TaxableAmount = CommonFunctions.parseAmount(retReceipt.TaxableAmount);
    if (billingTxn.ReturnStatus) {
      retReceipt.IsReturned = true;
    }

    //sud: 10Sept'18--for billing package modification
    if (billingTxn.PackageId || billingTxn.PackageName) {
      retReceipt.PackageId = billingTxn.PackageId;
      retReceipt.PackageName = billingTxn.PackageName;
    }

    // retReceipt.TaxableAmount = CommonFunctions.parseAmount(retReceipt.TaxableAmount != 0 ? (retReceipt.SubTotal - retReceipt.DiscountAmount) : 0);
    return retReceipt;
  }

  public static GetReceiptFromTxnItems(txnItems: Array<BillingTransactionItem>): BillingReceiptModel {

    let retReceipt: BillingReceiptModel = new BillingReceiptModel();
    let totalAmount_BILL: number = 0;
    let subTotal_BILL: number = 0;
    let discountAmt_BILL: number = 0;
    let taxTotal_BILL: number = 0;
    let returnTotalAmount_BILL: number = 0;
    let returnSubTotal_BILL: number = 0;
    let returnDiscountAmt_BILL: number = 0;
    let returnTax_BILL: number = 0;

    for (var i = 0; i < txnItems.length; i++) {
      let curRow = txnItems[i];
      totalAmount_BILL += curRow.TotalAmount;
      taxTotal_BILL += curRow.Tax;
      discountAmt_BILL += curRow.DiscountAmount;
      subTotal_BILL += curRow.SubTotal;
    }
    retReceipt.TaxableAmount = 0;


    //Removed Return Information since we're showing watermark: RETURNED instead of return amount etc:
    //sud: 13May'18
    txnItems.forEach(itm => {
      retReceipt.TaxableAmount += itm.TaxableAmount;
      if (itm.Quantity != 0) {
        retReceipt.BillingItems.push(itm);
      }
    });


    retReceipt.TaxTotal = CommonFunctions.parseAmount(taxTotal_BILL);
    retReceipt.TotalAmount = CommonFunctions.parseAmount(totalAmount_BILL);
    retReceipt.SubTotal = CommonFunctions.parseAmount(subTotal_BILL);
    retReceipt.DiscountAmount = CommonFunctions.parseAmount(discountAmt_BILL);
    retReceipt.DiscountPercent = CommonFunctions.parseAmount((discountAmt_BILL / subTotal_BILL) * 100);

    retReceipt.Tender = CommonFunctions.parseAmount(totalAmount_BILL + returnTotalAmount_BILL);
    retReceipt.TaxableAmount = CommonFunctions.parseAmount(retReceipt.TaxableAmount);

    return retReceipt;
  }


  public static GetNewINVReceiptFromTxnItems(txnItems: Array<BillingTransactionItem>): BillingTransaction {

    let NewINVReceipt: BillingTransaction = new BillingTransaction();
    let totalAmount_BILL: number = 0;
    let subTotal_BILL: number = 0;
    let discountAmt_BILL: number = 0;
    let taxTotal_BILL: number = 0;
    let returnTotalAmount_BILL: number = 0;
    let returnSubTotal_BILL: number = 0;
    let returnDiscountAmt_BILL: number = 0;
    let returnTax_BILL: number = 0;


    for (var i = 0; i < txnItems.length; i++) {
      let curRow = txnItems[i];
      totalAmount_BILL += curRow.TotalAmount;
      taxTotal_BILL += curRow.Tax;
      discountAmt_BILL += curRow.DiscountAmount;
      subTotal_BILL += curRow.SubTotal;
    }
    NewINVReceipt.TaxableAmount = 0;

    txnItems.forEach(itm => {
      NewINVReceipt.TaxableAmount += itm.TaxableAmount;

    });

    NewINVReceipt.TaxTotal = CommonFunctions.parseAmount(taxTotal_BILL);
    NewINVReceipt.TotalAmount = CommonFunctions.parseAmount(totalAmount_BILL);
    NewINVReceipt.SubTotal = CommonFunctions.parseAmount(subTotal_BILL);
    NewINVReceipt.DiscountAmount = CommonFunctions.parseAmount(discountAmt_BILL);
    NewINVReceipt.DiscountPercent = CommonFunctions.parseAmount((discountAmt_BILL / subTotal_BILL) * 100);

    NewINVReceipt.Tender = CommonFunctions.parseAmount(totalAmount_BILL + returnTotalAmount_BILL);
    NewINVReceipt.TaxableAmount = CommonFunctions.parseAmount(NewINVReceipt.TaxableAmount);

    return NewINVReceipt;
  }

  public static GetReceiptForDeposit(billingTransaction: BillingTransaction): BillingReceiptModel {

    let retReceipt: BillingReceiptModel = new BillingReceiptModel();
    if (billingTransaction) {

      let bilTxn: BillingTransaction = Object.create(billingTransaction);

      let item = new BillingTransactionItem();
      //FOR DEPOSIT & Deposit Return ONLY-- qty = 1, price = txn's totalamount, ItemName = TransactionType.
      item.ItemName = bilTxn.TransactionType;
      item.Quantity = 1;
      //since Price, Amount etc are 0 in db for 'Deposit Return', we've to assign them from DepositReturnAmount, else get from TotalAmount itself.
      let price = item.ItemName == "DEPOSIT" ? CommonFunctions.parseAmount(bilTxn.TotalAmount) : CommonFunctions.parseAmount(bilTxn.DepositReturnAmount);
      item.Price = CommonFunctions.parseAmount(price);
      item.TotalAmount = CommonFunctions.parseAmount(price);
      item.BillingTransactionId = bilTxn.BillingTransactionId;

      retReceipt.BillingItems.push(item);
      retReceipt.TotalAmount = CommonFunctions.parseAmount(price);
      retReceipt.ReceiptNo = bilTxn.InvoiceNo;
      retReceipt.BillingTransactionId = bilTxn.BillingTransactionId;

      retReceipt.BillingDate = bilTxn.PaidDate;
      retReceipt.Remarks = bilTxn.Remarks;
      retReceipt.DepositBalance = CommonFunctions.parseAmount(bilTxn.DepositBalance);
      retReceipt.PaymentMode = bilTxn.PaymentMode;//added: sud:4May'18
      retReceipt.BillStatus = bilTxn.BillStatus;//added: sud:4May'18
      retReceipt.PaymentDetails = bilTxn.PaymentDetails;//added: sud:4May'18
      retReceipt.TaxId = bilTxn.TaxId;
      retReceipt.VisitId = bilTxn.PatientVisitId;//sud: 20Aug'18--
    }
    return retReceipt;
  }

  public static GetReceiptForDuplicate(receipt): BillingReceiptModel {

    console.log("Input Receipt: GetReceiptForDuplicate(receipt).. Line No: 271");
    console.log(receipt);

    let dupReceipt: BillingReceiptModel = null;
    if (receipt != null) {
      dupReceipt = new BillingReceiptModel();
      //there are 3 different TransactionType as of now : 'ItemTransaction', 'DEPOSIT','DEPOSIT RETURN'
      if (receipt.Transaction.TransactionType && (receipt.Transaction.TransactionType == "ItemTransaction"
        || receipt.Transaction.TransactionType.toLowerCase() == "inpatient"
        || receipt.Transaction.TransactionType.toLowerCase() == "outpatient"
      )) {
        dupReceipt = BillingReceiptModel.GetReceiptFromTxnItems(receipt.TransactionItems);
        dupReceipt.DepositReturnAmount = receipt.Transaction.DepositReturnAmount;
        dupReceipt.DepositBalance = CommonFunctions.parseAmount(receipt.Transaction.DepositBalance);
        dupReceipt.DepositUsed = receipt.Transaction.DepositUsed;//sud:11May'21--new fields added in billingtransaction table.. 
        dupReceipt.DepositAvailable = receipt.Transaction.DepositAvailable;//sud:11May'21--new fields added in billingtransaction table.. 


        //dupReceipt.ReceiptType = receipt.Transaction.TransactionType.toLowerCase() == "inpatient" ? "ip-receipt" : "op-receipt";
        if (receipt.Transaction.TransactionType.toLowerCase() == "inpatient" && receipt.Transaction.InvoiceType != ENUM_InvoiceType.inpatientPartial) {
          dupReceipt.ReceiptType = 'ip-receipt';
        }
        else {
          dupReceipt.ReceiptType = 'op-receipt';
        }
      }
      else {
        dupReceipt = BillingReceiptModel.GetReceiptForDeposit(receipt.Transaction);
      }

      dupReceipt.ReceiptNo = receipt.Transaction.InvoiceNo;
      dupReceipt.BillingTransactionId = receipt.Transaction.BillingTransactionId;
      dupReceipt.Patient = receipt.Patient;
      dupReceipt.IsValid = true;
      dupReceipt.Remarks = receipt.Transaction.Remarks;//check for remarks in case of return. 
      dupReceipt.BillingDate = moment(receipt.Transaction.CreatedOn).format("YYYY-MM-DD HH:mm:ss");
      dupReceipt.BillingUser = receipt.UserName;
      dupReceipt.Tender = CommonFunctions.parseAmount(receipt.Transaction.Tender);
      dupReceipt.PrintCount = receipt.Transaction.PrintCount;
      dupReceipt.Change = CommonFunctions.parseAmount(receipt.Transaction.Change);
      dupReceipt.PaymentMode = receipt.Transaction.PaymentMode;//added: sud:4May'18
      dupReceipt.BillStatus = receipt.Transaction.BillStatus;//added: sud:4May'18
      dupReceipt.PaymentDetails = receipt.Transaction.PaymentDetails;//added: sud:4May'18
      dupReceipt.CurrentFinYear = receipt.Transaction.FiscalYear;//added: sud:5May'18
      dupReceipt.InvoiceNo = receipt.Transaction.InvoiceNo;//added: ashim:7May'18
      dupReceipt.InvoiceCode = receipt.Transaction.InvoiceCode;//added: ashim:7May'18
      dupReceipt.TaxId = receipt.Transaction.TaxId;
      dupReceipt.VisitId = receipt.Transaction.PatientVisitId;//sud: 20Aug'18--
      dupReceipt.IsInsuranceBilling = receipt.Transaction.IsInsuranceBilling;//sud:21Mar'19--for Insurance Receipt.
      dupReceipt.OrganizationId = receipt.Transaction.OrganizationId;
      dupReceipt.OrganizationName = receipt.Transaction.OrganizationName;
      dupReceipt.InsTransactionDate = receipt.Transaction.InsTransactionDate; // sud:20Jul'19--For Insurance Transaction Date.
      dupReceipt.PartialReturnTxnId = receipt.Transaction.PartialReturnTxnId;// added Rajesh:9Aug19
      dupReceipt.CreditNoteNumber = receipt.Transaction.CreditNoteNumber;// added Shankar:15Nov19
      dupReceipt.QueueNo = receipt.LatestPatientVisitInfo ? receipt.LatestPatientVisitInfo.QueueNo : null; // added Anjana: 21Feb,21
      dupReceipt.LabTypeName = receipt.Transaction.LabTypeName;
      dupReceipt.BillingType = receipt.Transaction.TransactionType;

      if (receipt.Transaction.ReturnStatus) {
        dupReceipt.IsReturned = true;
      }

      //sud: 10Sept'18--for billing package modification
      if (receipt.Transaction.PackageId || receipt.Transaction.PackageName) {
        dupReceipt.PackageId = receipt.Transaction.PackageId;
        dupReceipt.PackageName = receipt.Transaction.PackageName;
      }
      //dupReceipt.TaxableAmount = receipt.Transaction.TaxableAmount;
      //dupReceipt.TaxableAmount = CommonFunctions.parseAmount(dupReceipt.SubTotal - dupReceipt.DiscountAmount);

      //sud:12May'21--for Insurance. 
      if (receipt.Transaction.IsInsuranceBilling) {
        dupReceipt.Ins_NshiNumber = receipt.Patient ? receipt.Patient.Ins_NshiNumber : "";
        dupReceipt.ClaimCode = receipt.Transaction.ClaimCode;
      }
    }

    console.log("duplicate receipt from billing-receipt model");
    console.log(dupReceipt);

    return dupReceipt;
  }


  public static MapReceiptForNotReturnBill(receipt): BillingReceiptModel {

    let dupReceipt: BillingReceiptModel = null;
    dupReceipt = BillingReceiptModel.GetReceiptFromTxnItems(receipt.BillingTransactionItems);
    dupReceipt.DepositReturnAmount = receipt.DepositReturnAmount;
    dupReceipt.DepositBalance = CommonFunctions.parseAmount(receipt.DepositBalance);

    // dupReceipt.ReceiptType = receipt.TransactionType.toLowerCase() == "inpatient" ? "ip-receipt" : "op-receipt";

    dupReceipt.ReceiptNo = receipt.InvoiceNo;
    dupReceipt.BillingTransactionId = receipt.BillingTransactionId;
    dupReceipt.Patient = receipt.Patient;
    dupReceipt.IsValid = true;
    dupReceipt.BillingDate = moment(receipt.CreatedOn).format("YYYY-MM-DD HH:mm:ss");
    dupReceipt.BillingUser = receipt.UserName;
    dupReceipt.Tender = CommonFunctions.parseAmount(receipt.Tender);
    dupReceipt.PrintCount = receipt.PrintCount;
    dupReceipt.Change = CommonFunctions.parseAmount(receipt.Change);
    dupReceipt.PaymentMode = receipt.PaymentMode;
    dupReceipt.BillStatus = receipt.BillStatus;
    dupReceipt.PaymentDetails = receipt.PaymentDetails;
    dupReceipt.CurrentFinYear = receipt.FiscalYear;
    dupReceipt.InvoiceNo = receipt.InvoiceNo;
    dupReceipt.InvoiceCode = receipt.InvoiceCode;
    dupReceipt.TaxId = receipt.TaxId;
    dupReceipt.CreditNoteNumber = receipt.CreditNoteNumber;
    dupReceipt.VisitId = receipt.PatientVisitId;
    dupReceipt.IsInsuranceBilling = receipt.IsInsuranceBilling;
    dupReceipt.OrganizationId = receipt.OrganizationId;
    dupReceipt.OrganizationName = receipt.OrganizationName;
    dupReceipt.InsTransactionDate = receipt.InsTransactionDate;
    dupReceipt.PartialReturnTxnId = receipt.PartialReturnTxnId;
    dupReceipt.IsReturned = false;

    // if (receipt.ReturnStatus) {
    //   dupReceipt.IsReturned = true;
    // }

    if (receipt.PackageId || receipt.PackageName) {
      dupReceipt.PackageId = receipt.PackageId;
      dupReceipt.PackageName = receipt.PackageName;
    }

    return dupReceipt;
  }
  public static MapReceiptForReturnBill(receipt): BillingReceiptModel {

    let dupReceipt: BillingReceiptModel = null;
    dupReceipt = BillingReceiptModel.GetReceiptFromTxnItems(receipt.ReturnedItems);
    dupReceipt.DepositReturnAmount = receipt.DepositReturnAmount;
    dupReceipt.DepositBalance = CommonFunctions.parseAmount(receipt.DepositBalance);

    // dupReceipt.ReceiptType = receipt.TransactionType.toLowerCase() == "inpatient" ? "ip-receipt" : "op-receipt";

    dupReceipt.ReceiptNo = receipt.RefInvoiceNum;
    dupReceipt.BillingTransactionId = receipt.BillingTransactionId;
    dupReceipt.Patient = receipt.Patient;
    dupReceipt.IsValid = true;
    dupReceipt.Remarks = receipt.Remarks;
    dupReceipt.BillingDate = moment(receipt.CreatedOn).format("YYYY-MM-DD HH:mm:ss");
    dupReceipt.BillingUser = receipt.UserName;
    dupReceipt.Tender = CommonFunctions.parseAmount(receipt.Tender);
    dupReceipt.PrintCount = receipt.PrintCount;
    dupReceipt.Change = CommonFunctions.parseAmount(receipt.Change);
    dupReceipt.PaymentMode = receipt.PaymentMode;
    dupReceipt.BillStatus = receipt.BillStatus;
    dupReceipt.PaymentDetails = receipt.PaymentDetails;
    dupReceipt.CurrentFinYear = receipt.FiscalYear;
    dupReceipt.InvoiceNo = receipt.RefInvoiceNum;
    dupReceipt.InvoiceCode = receipt.InvoiceCode;
    dupReceipt.TaxId = receipt.TaxId;
    dupReceipt.VisitId = receipt.PatientVisitId;
    dupReceipt.IsInsuranceBilling = receipt.IsInsuranceBilling;
    dupReceipt.OrganizationId = receipt.OrganizationId;
    dupReceipt.OrganizationName = receipt.OrganizationName;
    dupReceipt.InsTransactionDate = receipt.InsTransactionDate;
    dupReceipt.PartialReturnTxnId = receipt.PartialReturnTxnId;
    dupReceipt.IsReturned = true;
    dupReceipt.CreditNoteNumber = receipt.CreditNoteNumber;

    if (receipt.PackageId || receipt.PackageName) {
      dupReceipt.PackageId = receipt.PackageId;
      dupReceipt.PackageName = receipt.PackageName;
    }

    return dupReceipt;
  }
  public static GetProvisionalReceiptForDuplicate(receipt, currentData) {

    let dupReceipt: BillingReceiptModel = null;
    if (receipt != null) {
      dupReceipt = new BillingReceiptModel();
      dupReceipt.BillingItems = receipt.Transaction;
      dupReceipt.IsInsuranceBilling = receipt.Transaction[0].IsInsurance;
      dupReceipt.Patient = receipt.Patient;

      dupReceipt.InvoiceNo = currentData.ProvisionalReceiptNo;
      dupReceipt.CurrentFinYear = currentData.FiscalYear;
      dupReceipt.BillingDate = currentData.CreatedOn;
      dupReceipt.SubTotal = currentData.SubTotal;
      dupReceipt.DiscountAmount = currentData.DiscountAmount;
      dupReceipt.TotalAmount = currentData.Total;
      dupReceipt.singleReceiptBool = true;
      dupReceipt.BillingUser = currentData.User.UserName;
    }
    return dupReceipt;
  }


  //Rajesh:8Sept19
  public static GetReceiptForGenerateNewReceipt(receipt): BillingTransaction {

    let NewGenReceipt: BillingTransaction = null;

    NewGenReceipt = new BillingTransaction();
    NewGenReceipt.DepositReturnAmount = receipt.Transaction.DepositReturnAmount;
    NewGenReceipt.DepositBalance = CommonFunctions.parseAmount(receipt.Transaction.DepositBalance);

    // NewGenReceipt.TransactionType = receipt.Transaction.TransactionType.toLowerCase() == "inpatient" ? "ip-receipt" : "op-receipt";
    NewGenReceipt.TransactionType = receipt.Transaction.TransactionType;
    NewGenReceipt.InvoiceNo = receipt.Transaction.InvoiceNo;
    NewGenReceipt.Patient = receipt.Transaction.Patient;
    NewGenReceipt.Remarks = receipt.Transaction.Remarks;//check for remarks in case of return. 
    NewGenReceipt.CreatedOn = moment(receipt.Transaction.CreatedOn).format("YYYY-MM-DD HH:mm:ss");
    NewGenReceipt.BillingUserName = receipt.Transaction.UserName;
    NewGenReceipt.Tender = CommonFunctions.parseAmount(receipt.Transaction.Tender);
    NewGenReceipt.PrintCount = receipt.Transaction.PrintCount;
    NewGenReceipt.Change = CommonFunctions.parseAmount(receipt.Transaction.Change);
    NewGenReceipt.PaymentMode = receipt.Transaction.PaymentMode;
    NewGenReceipt.BillStatus = receipt.Transaction.BillStatus;
    NewGenReceipt.PaymentDetails = receipt.Transaction.PaymentDetails;
    NewGenReceipt.FiscalYear = receipt.Transaction.FiscalYear;
    NewGenReceipt.InvoiceNo = receipt.Transaction.InvoiceNo;
    NewGenReceipt.InvoiceCode = receipt.Transaction.InvoiceCode;
    NewGenReceipt.TaxId = receipt.Transaction.TaxId;
    NewGenReceipt.PatientVisitId = receipt.Transaction.PatientVisitId;
    NewGenReceipt.PatientId = receipt.Patient.PatientId;
    NewGenReceipt.IsInsuranceBilling = receipt.Transaction.IsInsuranceBilling;
    NewGenReceipt.OrganizationId = receipt.Transaction.OrganizationId;
    NewGenReceipt.OrganizationName = receipt.Transaction.OrganizationName;
    NewGenReceipt.InsTransactionDate = receipt.Transaction.InsTransactionDate;

    return NewGenReceipt;
  }


  //start: sud:20Aug'18-- for Inpatient-Discharge-Bill

  public DischargeDetails: DischargeDetailsVM = new DischargeDetailsVM();

  //end:  sud:20Aug'18-- for Inpatient-Discharge-Bill

}

//sud:20Aug'18-- for Inpatient-Discharge-Bill
export class DischargeDetailsVM {
  public AdmissionInfo: any = new Object();
  public DepositsInfo = [];
}
