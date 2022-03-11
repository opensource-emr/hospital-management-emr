
import { Patient } from "../../patients/shared/patient.model";
import { PHRMInvoiceModel } from "./phrm-invoice.model";

export class PHRMSettlementModel {
  public SettlementId: number = 0;
  public FiscalYearId: number = null;
  public SettlementReceiptNo: number = null;
  public SettlementDate: string = null;
  public SettlementType: string = null;
  public PatientId: number = 0;
  public PayableAmount: number = 0;
  public RefundableAmount: number = 0;
  public PaidAmount: number = null;
  public ReturnedAmount: number = null;
  public DepositDeducted: number = null;
  public DiscountPercentage:number;
  public DiscountAmount: number = null;
  public DueAmount: number = null;
  public PaymentMode: string = "cash";//default payment type
  public PaymentDetails: string = null;
  public CounterId: number = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public Remarks: string = null;
  public PrintCount: number = null;
  public PrintedOn: string = null; 
  public PrintedBy: number = 0;
  public IsActive: boolean = true;
  public IsDiscounted: boolean = false;//only for local use.
  public Patient: Patient = new Patient();//added: sud: 18may'18'
  public PHRMInvoiceTransactions: Array<PHRMInvoiceModel> = null;
  public BillingUser: string = null;//for duplicate print etc.. 

  public CollectionFromReceivable: number = 0

  public PHRMReturnIdsCSV:any[] = [];

  public StoreId:number = 0;



}
