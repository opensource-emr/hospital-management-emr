export class BillingDepositList_DTO {
  public DepositId: number = null;
  public HospitalNo: string = "";
  public InPatientNo: string = "";
  public ReceiptDate: string = "";
  public ReceiptNo: string = "";
  public Amount: number = 0;
  public DepositType: string = "";
  public TransactionType: string = "";
  public User: string = "";
  public Remarks: string = "";
  public IsDepositRefundedUsingDepositReceiptNo: boolean = false;
  public DepositHeadId: number = null;
}
