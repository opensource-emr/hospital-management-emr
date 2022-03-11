export class GroupStatementReportVM{
    public LedgerId: number = 0;
    public Code:any;
    public Particulars: string = null;
    public OpeningDr: number = 0;
    public OpeningCr: number = 0;

    public TransactionDr: number = 0;  
    public TransactionCr: number = 0;

    public OpeningTotal:number=0;//calculate after get from db
    public OpeningType:string="";//calculate after get from db

  

    public ClosingDr:number=0; ///calculate after get from db
    public ClosingCr:number=0; //calculate after get from db
    public ClosingTotal: number = 0;   //calculate after get from db
    public ClosingType:string=""; //calculate after get from db
       
}