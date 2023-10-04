export class BillingAccountingSyncModel {
    public BillingAccountingSyncId: number = 0;
    public ReferenceId: number = null;
    public TransactionDate: string = "";
    public TransactionType: string = "";
    public PatientId: number = null;
    public TotalAmount: number = null;
    public IsTransferedToAcc: boolean = false;
    public CreatedBy: number = null;
    public ReferenceModelName: string = "";
}