export class ClaimScurbbingInvoiceDTO {
    public InvoiceNumberFormatted: string = "";
    public InvoiceDate: string = "";
    public TotalAmount: number = 0;
    public NonClaimableAmount: number = 0;
    public ClaimableAmount: number = 0;
    public IsClaimable: boolean = false;
}