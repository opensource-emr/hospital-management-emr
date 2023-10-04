export class MaternityPaymentReceiptModel{
    public TransactionType : string = "";
    public ReceiptNo : string = "";
    public HospitalNo: string = "";
    public Age : string = "";
    public Gender : string = "";
    public PatientName : string = "";
    public InAmount: number = 0;
    public OutAmount: number = 0;
    public EmployeeName : string = "";
    public DateOfBirth:string = "";
    public CreatedOn:string = "";
    public InOrOutAmount: number = 0; //just for client side
}