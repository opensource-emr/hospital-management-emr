export class BankReconcliationModel {
    public Id: number = 0;
    public SectionId: number = 0;
    public VoucherNo: string = '';
    public TransactionDate: string = '';
    public FiscalYearId: number = 0;
    public BankTransactionDate: string = '';
    public CategoryId: number = 0;
    public BankBalance: number = 0;
    public IsVerified: boolean = null;
    public VerifiedBy: number = 0;
    public VerifiedOn: string = '';
    public Remark: string = '';
    public Difference: number = 0;
    public TransactionId:number=0;
    public LedgerId:number=0;
    public HospitalId:number=0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public DrCr: boolean=null;
}

export class BankReconcliationModelVM {
    public TransactionDate: string = '';
    public VoucherNumber: string = '';
    public VoucherName: string = '';
    public LedgerDr: number = 0;
    public LedgerCr: number = 0;
    public Amount: number = 0;
    public DrCr: boolean = null;
    public AmountCr: number = 0;
    public AmountDr: number = 0;
    public Balance: number = 0;
    public BalanceType: boolean;
    public OpeningBalance: number = 0;
    public OpeningBalanceType: string = '';
    public DepartmentName: string = '';
    public Description: string = '';
    public SectionId: number = 0;
    public FiscalYearId: number = 0;
    public IsVerified: boolean;

    public OpeningBalanceDrAmount: number = 0;

    public bankBalanceType: string = '';
  
    public VoucherNo: string = '';
    public BankTransactionDate: string = '';
    public CategoryId: number = 0;
    public BankBalance: number = 0;
    public VerifiedBy: number = 0;
    public VerifiedOn: string = '';
    public Remark: string = '';
    public Difference: number = 0;
    public TransactionId:number=0;
    public LedgerId:number=0;
    public HospitalId:number=0;
     public CreatedBy: number = 0;
    public CreatedOn: string = null;
}