import { BillingTransactionItem } from './billing-transaction-item.model';

import * as moment from 'moment';
import { Visit } from '../../appointments/shared/visit.model';
import { LabTestRequisition } from '../../labs/shared/lab-requisition.model';
import { ImagingItemRequisition } from '../../radiology/shared/imaging-item-requisition.model';
import { ENUM_BillPaymentMode, ENUM_VisitType } from '../../shared/shared-enums';
import { DischargeDetailBillingVM } from '../ip-billing/shared/discharge-bill.view.models';
import { BillingTransactionCreditStatus } from './billing-transaction-credit-status';

export class BillingTransaction {
  public BillingTransactionId: number = 0;
  public PatientId: number = 0;
  public PatientVisitId: number = null;
  //added Patient to retrieve patient information in inter-module call. since patient service gets cleared in such situation.
  //it is already there in server model.//sudarshan:14july
  public Patient: any = null;
  public CounterId: number = 0;
  public PaidDate: string = null;
  public TransactionType: string = null;
  public InvoiceType: string = null;// pratik:29April 2020-- needed for partial payment invoice in ipbilling
  public TotalQuantity: number = 0;
  public SubTotal: number = 0;
  public DiscountPercent: number = 0;
  public DiscountAmount: number = 0;
  public TaxTotal: number = 0;
  public TotalAmount: number = 0;
  public PaidAmount: number = 0;
  public DepositAmount: number = 0;
  public DepositAvailable: number = 0;
  public DepositUsed: number = 0;
  public DepositReturnAmount: number = 0;
  public DepositBalance: number = 0;
  public Remarks: string = null;
  public Tender: number = 0;
  public Change: number = 0;
  //this will be employeeid of the requesting user--sudarshan:7May'17
  public CreatedBy: number = 0;
  public CreatedOn: string = Date();
  public ReturnRemarks: string = null;
  public PrintCount: number = 0;
  public PrintedOn: string = null;
  public PrintedBy: number = null;
  public CreditBalance: number = 0;
  public CreditNoteNumber: number = 0;
  public ReturnedAmount: number = 0;
  public BillingTransactionItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public PaymentMode: string = "cash";
  public PaymentDetails: string = null;
  public BillStatus: string = null;
  public FiscalYearId: number = 0;
  public InvoiceNo: number = 0;
  public InvoiceNumber: number = 0; //used while comparing invoiceNummber from //InvoiveNo is already existed.
  public FiscalYear: string = null;
  public TaxId: number = null;
  public InvoiceCode: string = null;
  public TaxableAmount: number = 0;//sud: 9May'18
  public ReturnStatus: boolean = false;
  public IsSelected: boolean = false;//sud: 16may'18 -- Only in client side

  public NonTaxableAmount: number = 0;//added: sud: 29May'18
  public PaymentReceivedBy: number = null;//added: sud: 29May'18
  public PaidCounterId: number = null;//added: sud: 29May'18
  public IsCopyReceipt: boolean = false; //added: Hom: 3rd April 19
  //insurance
  public IsInsuranceBilling: boolean = false;
  public IsInsuranceClaimed: boolean = false;

  public InsuranceClaimedDate: string = null;
  public InsuranceProviderId: number = null;

  public PackageId: number = null;//sud: 10Sept'18-- needs revision
  public PackageName: string = null;//sud: 10Sept'18-- needs revision
  public OrganizationId: number = null;//Yubraj --22nd April '19
  public OrganizationName: string = null;
  public ExchangeRate: number = 0; // Sanjit:5-17-19
  public singleReceiptBool: boolean = false;
  public BillingUserName: string = null; //Yubraj 28th June '19

  public InsTransactionDate: string = null;//sud:19Jul'19--For MNK Insurance Transaction Date..
  public AdjustmentTotalAmount: number = 0;
  public ReturnedItems: any;
  public Ins_NshiNumber: string = '';

  public LabTypeName: string = '';
  public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places

  public NetAmount: number = 0;//for bill settlement
  public isSelected: boolean = true; //for bill settlement
  public BillReturnIdsCSV: any[] = [];
  public ModuleName: any = null;
  public EmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();

  public ReceivedAmount: number = 0; //Krishna,19thAUG'22, Added this property to handle CoPayment.
  public CoPayment_PaymentMode: string = ENUM_BillPaymentMode.credit; //Krishna,19thAUG'22, Added this property to handle CoPayment PaymentMode.
  public IsCoPayment: boolean = false;
  public CoPaymentCreditAmount: number = 0;
  public BillingTxnCreditStatus: Array<BillingTransactionCreditStatus> = new Array<BillingTransactionCreditStatus>();
  public PatientMapPriceCategoryId: number = null;
  public PriceCategoryId: number = null;
  public IsMedicarePatientBilling: boolean = false;
  public SchemeId: number = null;
  public MemberNo: string = null;
  public SalesAmount: number = 0;
  public ReturnAmount: number = 0;
  public InvoiceDate: string = '';
  public InvoiceOf: string = ''; //* Krishna, 24thApril'23, Added this to identify Pharmacy invoice and Billing Invoice in Settlement Page
  public VisitType: string = ENUM_VisitType.outpatient; //Bibek 14thJune'23
  public OtherCurrencyDetail: string = null;
  public IsProvisionalDischargeCleared: boolean = false;
  constructor() {
    this.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
  }
}
export class BillingTransactionPost {
  public LabRequisition: Array<LabTestRequisition> = new Array<LabTestRequisition>();
  public ImagingItemRequisition: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
  public VisitItems: Array<Visit> = new Array<Visit>();
  public Txn: BillingTransaction = new BillingTransaction();
}

export class IPBillTxnVM {
  public billingTransactionModel: BillingTransaction = new BillingTransaction();
  public dischargeDetailVM: DischargeDetailBillingVM = new DischargeDetailBillingVM();
}

export class EmployeeCashTransaction {
  public InAmount: number = 0;
  public OutAmount: number = 0;
  public PaymentModeSubCategoryId: number = 0;
  public ModuleName: any = null;
  public PaymentSubCategoryName: string = '';
  public Remarks: string = null;
  public PaymentDetail: string = null;
}
