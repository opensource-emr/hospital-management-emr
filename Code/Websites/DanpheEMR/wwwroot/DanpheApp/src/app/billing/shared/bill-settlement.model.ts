import { BillingTransaction } from "./billing-transaction.model";
import { Patient } from "../../patients/shared/patient.model";

export class BillSettlementModel {
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
  public BillingTransactions: Array<BillingTransaction> = null;
  public BillingUser: string = null;//for duplicate print etc.. 
  public CollectionFromReceivable: number = 0;//added: Krishna: 16th Nov, 21
  public DiscountReturnAmount: number = 0;//added: Krishna: 16th Nov, 21
  public BillReturnIdsCSV:any[] = [];

}

export class PatientInfoVM{
  public PatientId:number = 0;
  public PatientName:any = null;
  public HospitalNo:any = null;
  public Gender:any = null;
  public DateOfBirth:any = null;
  public Address:any = null;
  public ContactNo:any = null;
}
export class SettlementInfoVM{
  public SettlementId:number = 0;
  public SettlementReceiptNo:any = "SR";
  public SettlementDate:any = null;
  public PaymentMode:any = null;
  public CreatedBy:number = 0;
  public BillingUser:any = null;
  public CashDiscountGiven:number = 0;
}
export class SalesInfoVM{
  public ReceiptNo:any = null;
  public ReceiptDate:any = null;
  public Amount:number = 0;
}

export class SalesReturnInfoVM{
  public BillRetunId:number = 0;
  public ReceiptNo:any = null;
  public ReceiptDate:any = null;
  public Amount:number = 0;
}
export class CashDiscountReturnInfoVM{
  public ReceiptNo:any = null;
  public ReceiptDate:any = null;
  public CashDiscountReceived:number = 0;
}
// export class DepositReturnInfoVM{
//   public ReceiptNo:any = null;
//   public ReceiptDate:any = null;
//   public Amount:number = 0;
// }
export class DepositInfoVM{
  public ReceiptNo:any = null;
  public ReceiptDate:any = null;
  public Amount:number = 0;
  public DepositType:any = null;
}