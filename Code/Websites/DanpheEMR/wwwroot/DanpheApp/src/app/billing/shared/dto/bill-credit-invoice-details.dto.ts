export class PatientCreditInvoices_DTO {
    public PatientId: number = 0;
    public TransactionId: number = 0;
    public InvoiceCode: string = "";
    public InvoiceNo: number = 0;
    public InvoiceDate: string = "";
    public SalesAmount: number = 0;
    public ReturnAmount: number = 0;
    public NetAmount: number = 0;
    public BillReturnIdsCSV: string = "";
    public InvoiceOf: string = "";
    public isSelected: boolean = false;

    public ArrayOfBillReturnIds = new Array<number>();

}