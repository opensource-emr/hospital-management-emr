export class BillingPendingSettlement_DTO {
    public PatientId: number = null;
    public PatientCode: string = '';
    public PatientName: string = '';
    public DateOfBirth: string = '';
    public Gender: string = '';
    public CreditTotal: number = 0;
    public ProvisionalTotal: number = 0;
    public DepositBalance: number = 0;
    public LastTxnDate: string = '';
}