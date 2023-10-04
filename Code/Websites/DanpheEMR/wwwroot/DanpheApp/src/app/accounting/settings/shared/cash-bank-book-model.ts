export class CashBankBookModel{
    public TransactionDate : Date;
    public LedgerName : string;
    public VoucherType : string;
    public VoucherNumber : string;
    public DrAmount : number;
    public CrAmount: number;
}
export class DateWiseCashBookModel{
    public TransactionDate : string;
    public OpeningBalance : number;
    public ClosingBalance : number;
    public Transactions : Array<CashBankBookModel>;
    public DrAmount : number;
    public CrAmount : number;
}