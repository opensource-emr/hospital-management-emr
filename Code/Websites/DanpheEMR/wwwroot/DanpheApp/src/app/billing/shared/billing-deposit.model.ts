import * as moment from "moment";
import { ENUM_Deposit_OrganizationOrPatient } from "../../shared/shared-enums";
import { EmployeeCashTransaction } from "./billing-transaction.model";

export class BillingDeposit {
  public DepositId: number = 0;
  public PatientVisitId: number = 0;
  public PatientId: number = 0;
  public BillingTransactionId: number = null;
  public TransactionType: string = null;
  // public Amount: number = 0;
  public InAmount: number = 0;
  public OutAmount: number = 0;
  public DepositHeadId: number = 0;
  public CreditOrganizationId: number = null;
  public ModuleName: string = 'Billing'; //! Krishna, 19thApril'23 Keeping it hardcoded as of now.
  public OrganizationOrPatient: string = ENUM_Deposit_OrganizationOrPatient.Patient;
  public Remarks: string = null;
  //this will be employeeid of the current user--sudarshan:7may'17
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public FiscalYearId: number = null;
  public ReceiptId: number = null;
  public CounterId: number = null;
  public PrintCount: number = 0;
  public PaymentMode: string = 'cash';
  public PaymentDetails: string = null;
  public FiscalYear: string = null; //used only to display in the deposit slip
  public BillingUser: string = null; //used only to display in the deposit slip
  public DepositBalance: number = 0;
  public CareOf: string = null; //Yubraj: 11th Jan '19
  //used only in client side
  public PatientName: string = null;
  public PatientCode: string = null;
  public IsDuplicatePrint: boolean = false;
  public Address: string = null;
  public PhoneNumber: string = null;
  public ReceiptNo: number;
  //Added for enchancement task:: Yubraj: 18th Dec '18
  public IsActive: boolean = true;
  public InpatientpNumber: string;
  public AdmissionCase: string;
  public AdmissionDate: string;
  public VisitType: string;
  public empCashTransactionModel: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  // public IsDepositRefundedUsingDepositReceiptNo: boolean = false;
  public SelectedDepositId: number = null;

  constructor() {
    this.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');

  }
}
