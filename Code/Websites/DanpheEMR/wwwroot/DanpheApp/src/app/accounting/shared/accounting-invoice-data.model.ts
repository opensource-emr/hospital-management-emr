export class AccountingInvoiceDataModel {
    public InvoiceDataId: number;
    public SectionId: number;
    public ReferenceId: number;
    public ReferenceModelName: string;
    public ServiceDepartmentId: number;
    public ItemId: number;
    public IncomeLedgerName: string;
    public PatientId: number;
    public TransactionType: string;
    public PaymentMode: string;
    public SubTotal: number;
    public TaxAmount: number;
    public DiscountAmount: number;
    public TotalAmount: number;
    public CashAmount: number;
    public DepositAdd: number;
    public DepositDeduct: number;
    public DepositReturn: number;
    public IsTransferedToAcc: boolean;
    public TransactionDate: string;
    public CreatedOn: string;
    public CreatedBy: number;
}