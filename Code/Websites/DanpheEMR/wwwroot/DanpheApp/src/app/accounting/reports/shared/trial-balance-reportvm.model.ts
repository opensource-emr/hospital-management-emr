export class TrialBalanceReportVM{
    public LedgerId: number = 0;
    public Particulars: string = null;
    public OpeningDr: number = 0;
    public OpeningCr: number = 0;
    public OpeningTotal:number=0;
    public OpeningBalType:string="";

    public CurrentDr: number = 0;
    public CurrentCr: number = 0;

    public TotalDr: number = 0;
    public TotalCr: number = 0;
    public Balance : number =0;
    public BalanceType:string="";
    
    public level: string = null;
    public ShowLedgerGroup: boolean = false;
    public ShowLedger: boolean = false;
    public Details: any;
    public Code:any;
}