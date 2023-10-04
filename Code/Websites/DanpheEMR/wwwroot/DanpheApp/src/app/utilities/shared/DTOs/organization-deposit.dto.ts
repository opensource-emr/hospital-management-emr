import * as moment from "moment";
import { EmployeeCashTransaction } from "../../../billing/shared/billing-transaction.model";
import { ENUM_ACC_PaymentMode, ENUM_Deposit_OrganizationOrPatient } from "../../../shared/shared-enums";

export class OrganizationDeposit_DTO {
  public DepositId: number = 0;
  public CreditOrganizationId: number = 0;
  public CreditOrganizationName: string = '';
  public CreditOrganizationCode: string = '';
  public DepositBalance: number = 0;
  public TransactionType: string = null;
  public InAmount: number = 0;
  public OutAmount: number = 0;
  public DepositHeadId: number = 0;
  public Remarks: string = null;
  public CreatedOn: string = null;
  public CounterId: number = null;
  public ModuleName: String = "Billing";
  public PaymentMode: string = ENUM_ACC_PaymentMode.Cash;
  public OrganizationOrPatient: string = ENUM_Deposit_OrganizationOrPatient.Organization;
  public PaymentDetails: string = null;
  public CareOf: string = null;
  public PatientName: string = '';
  public PatientCode: string = '';
  public PhoneNumber: string = '';
  public Address: string = '';
  public empCashTransactionModel: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  constructor() {
    this.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');

  }


}
