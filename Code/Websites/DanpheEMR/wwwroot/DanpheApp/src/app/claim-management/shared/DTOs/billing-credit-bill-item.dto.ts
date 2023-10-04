export class BillingCreditBillItem_DTO {

    // for displaying on Edit Bill Items in Bill Preview (Claim Management)
    public ItemName: string = "";
    public Quantity: number = 0;
    public TotalAmount: number = 0;
    // for posting data in BIL_TXN_CreditBillItemStatus while Claimable Status of Bill Item is changed
    public BillingCreditBillItemStatusId: number = 0;
    public BillingCreditBillStatusId: number = 0;
    public BillingTransactionId: number = 0;
    public BillingTransactionItemId: number = 0;
    public ServiceDepartmentId: number = 0;
    public ServiceItemId: number = 0;
    public NetTotalAmount: number = 0;
    public IsClaimable: boolean = false;
}