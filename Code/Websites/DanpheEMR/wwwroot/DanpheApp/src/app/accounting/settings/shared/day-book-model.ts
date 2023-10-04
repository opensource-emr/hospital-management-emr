export class DayBookModel{
    public TransactionDate : Date;
    public LedgerName : string;
    public VoucherType : string;
    public VoucherNumber : string;
    public DrAmount : number;
    public CrAmount: number;
}
export class DateWiseDayBookModel{
    public TransactionDate : string;
    public OpeningBalance : number;
    public ClosingBalance : number;
    public Transactions : Array<DayBookModel>;
    public DrAmount : number;
    public CrAmount : number;
    public TotalDrAmount : number;
    public TotalCrAmount : number ;
}