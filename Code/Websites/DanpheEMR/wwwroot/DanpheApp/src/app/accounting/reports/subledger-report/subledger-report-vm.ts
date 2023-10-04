export class SubLedgerSummaryDataVM{
    public LedgerName: string = "";
    public SubLedgerData: Array<SubLedgerTxnSummarVM> = new Array<SubLedgerTxnSummarVM>();
}

export class SubLedgerTxnSummarVM{
    public LedgerId: number = 0;
    public SubLedgerName: string = ``;
    public SubLedgerId: number = 0;
    public OpeningDrAmount: number = 0;
    public OpeningCrAmount: number = 0;
    public TxnDrAmount: number = 0;
    public TxnCrAmount: number = 0;
    public ClosingDrAmount: number = 0;
    public ClosingCrAmount: number = 0;
}

export class SubLedgerDetailDataVM{
    public LedgerName: string = ``;
    public SubLedgerData: Array<SubLedgerDetailDataSubLedgerList> = new Array<SubLedgerDetailDataSubLedgerList>();
}

export class SubLedgerDetailDataSubLedgerList{
    public SubLedgerName: string = ``;
    public OpeningDrAmount: number = 0;
    public OpeningCrAmount: number = 0;
    public ClosingDrAmount: number = 0;
    public ClosingCrAmount: number = 0;
    public SubLedgerDetailTxn : Array<SubLedgerTxnDetailVM> = new Array<SubLedgerTxnDetailVM>(); 
}

export class SubLedgerTxnDetailVM{
    public LedgerId: number = 0;
    public SubLedgerId: number = 0;
    public DrAmount: number = 0;
    public CrAmount: number = 0;
    public TransactionDate: string = ``;
    public VoucherId: number = 0;
    public VoucherNumber: string = ``;
    public VoucerTypeName: string = ``;
    public AccumulatedBalance: number = 0;
}

export class SubLedgerOpeningBalanceVM{
    public OpeningBalance: number = 0;
    public SubLedgerId: number = 0;
    public LedgerId: number = 0;
}

export class CustomerHeader{
    public hospitalName: string = ``;
    public address: string = ``;
    public email: string = ``;
    public tel: string = ``;
    public PANno: string = ``;
}