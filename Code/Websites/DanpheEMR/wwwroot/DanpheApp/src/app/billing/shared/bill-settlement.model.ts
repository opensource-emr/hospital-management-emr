import * as moment from "moment";
import { Patient } from "../../patients/shared/patient.model";
import { ENUM_BillPaymentMode, ENUM_DateTimeFormat } from "../../shared/shared-enums";
import { BillingTransaction, EmployeeCashTransaction } from "./billing-transaction.model";

export class BillSettlementModel {
  public SettlementId: number = 0;
  public FiscalYearId: number = 0;
  public SettlementReceiptNo: number = 0;
  public SettlementDate: string = null;
  public SettlementType: string = null;
  public PatientId: number = 0;
  public PayableAmount: number = 0;
  public RefundableAmount: number = 0;
  public PaidAmount: number = 0;
  public ReturnedAmount: number = 0;
  public DepositDeducted: number = 0;
  public DiscountAmount: number = 0;
  public DueAmount: number = 0;
  public PaymentMode: string = ENUM_BillPaymentMode.cash;
  public PaymentDetails: string = null;
  public CounterId: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public Remarks: string = null;
  public PrintCount: number = 0;
  public PrintedOn: string = null;
  public PrintedBy: number = 0;
  public IsActive: boolean = true;
  public IsDiscounted: boolean = false;//only for local use.
  public Patient: Patient = new Patient();//added: sud: 18may'18'
  public BillingTransactions: Array<BillingTransaction> = null;
  public BillingUser: string = null;//for duplicate print etc.. 
  public CollectionFromReceivable: number = 0;//added: Krishna: 16th Nov, 21
  public DiscountReturnAmount: number = 0;//added: Krishna: 16th Nov, 21
  public BillReturnIdsCSV: any[] = [];
  public OrganizationId: number = null; //added: Krishna: 3rd FEB,22
  public empCashTransactionModel: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();

  constructor() {
    this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute_12HoursFormat);
    this.SettlementDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute_12HoursFormat);

  }

}

export class PatientInfoVM {
  public PatientId: number = 0;
  public PatientName: string = null;
  public HospitalNo: string = null;
  public Gender: string = null;
  public DateOfBirth: string = null;
  public Address: string = null;
  public MunicipalityName: string = null;
  public WardNumber: number = null;
  public CountrySubDivisionName: string = null;
  public CountryName: string = null;
  public ContactNo: string = null;
  public MembershipTypeName: string = null;
  public SSFPolicyNo: string = null;
  public PolicyNo: string = null;
}
export class SettlementInfoVM {
  public SettlementId: number = 0;
  public SettlementReceiptNo: any = "SR";
  public SettlementDate: any = null;
  public PaymentMode: any = null;
  public CreatedBy: number = 0;
  public BillingUser: any = null;
  public CashDiscountGiven: number = 0;
  public PaidAmount: number = 0;
  public CreditOrganizationName: string = null;
}
export class SalesInfoVM {
  public ReceiptNo: any = null;
  public ReceiptDate: any = null;
  public Amount: number = 0;
}

export class SalesReturnInfoVM {
  public BillRetunId: number = 0;
  public ReceiptNo: any = null;
  public ReceiptDate: any = null;
  public Amount: number = 0;
}
export class CashDiscountReturnInfoVM {
  public ReceiptNo: any = null;
  public ReceiptDate: any = null;
  public CashDiscountReceived: number = 0;
}
export class DepositInfoVM {
  public ReceiptNo: string = '';
  public ReceiptDate: string = '';
  // public Amount:number = 0;
  public InAmount: number = 0;
  public OutAmount: number = 0;
  public TransactionType: string = null;
}