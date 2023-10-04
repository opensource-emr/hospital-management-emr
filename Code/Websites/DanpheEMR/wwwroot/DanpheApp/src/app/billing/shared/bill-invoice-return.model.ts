
import * as moment from 'moment';
import { BillInvoiceReturnItemsModel } from './bill-invoice-return-items.model';
import { BillingTransactionItem } from './billing-transaction-item.model';

export class BillInvoiceReturnModel {
  public BillReturnId: number = 0;
  public CreditNoteNumber: number = 0;
  public RefInvoiceNum: number = 0;
  public PatientId: number = null;
  public FiscalYearId: number = null;
  public FiscalYear: string = null;
  public BillingTransactionId: number = null;
  public SubTotal: number = 0;
  public DiscountAmount: number = 0;
  public TaxableAmount: number = 0;
  public TaxTotal: number = 0;
  public TotalAmount: number = 0;
  public Remarks: string = null;
  public CounterId: number = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
  public IsRemoteSynced: boolean = false;
  public TaxId: number = null;
  public InvoiceCode: string = null;
  public Tender: number = null;
  public ReturnedItems: Array<BillingTransactionItem> = [];//Rajesh:7Aug19 -- this can be removed after removing partial return
  public ReturnInvoiceItems: Array<BillInvoiceReturnItemsModel> = [];//Sud-1May'21 for Credit Note

  public PaymentMode: string = null;
  public IsInsuranceBilling: boolean = false;
  public InsuranceProviderId: number = null;
  public BillStatus: string = null;
  public DiscountReturnAmount: number = 0;
  public DiscountFromSettlement: number = 0;
  public ReturnCashAmount: number = 0;
  public ReturnCreditAmount: number = 0;
  public PriceCategoryId: number = 0;
  public TransactionType: string = "";
  public IsCoPayment: boolean = false;

  public SchemeId: number = 0;//Sud:22March'23--For new billingStructure.
  public OrganizationId: number = null;
  public ClaimCode: number = null;
  constructor() {
    this.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
  }
}
