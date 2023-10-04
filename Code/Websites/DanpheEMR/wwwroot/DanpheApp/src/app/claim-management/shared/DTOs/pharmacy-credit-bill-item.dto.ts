export class PharmacyCreditBillItem_DTO {

    // for displaying on Edit Bill Items in Bill Preview (Claim Management)
    public ItemName: string = "";
    public Quantity: number = 0;
    public TotalAmount: number = 0;
    // for posting data in PHRM_TXN_CreditBillItemStatus while Claimable Status of Bill Item is changed
    public PhrmCreditBillItemStatusId: number = 0;
    public PhrmCreditBillStatusId: number = 0;
    public InvoiceId: number = 0;
    public InvoiceItemId: number = 0;
    public ItemId: number = 0;
    public NetTotalAmount: number = 0;
    public IsClaimable: boolean = false;
}