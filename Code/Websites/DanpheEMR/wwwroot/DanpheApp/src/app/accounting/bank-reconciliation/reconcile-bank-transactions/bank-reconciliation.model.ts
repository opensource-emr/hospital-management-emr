import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../../shared/shared-enums";

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
    public TransactionId: number = 0;
    public LedgerId: number = 0;
    public HospitalId: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public DrCr: boolean = null;
}

export class BankReconcliationModelNew {
    public VoucherNumber: string = "";
    public SectionId: number = 0;
    public VoucherNo: string = '';
    public TransactionDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public FiscalYearId: number = 0;
    public BankTransactionDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public CategoryId: number = 0;
    public BankBalance: number = 0;
    public IsVerified: boolean = false;
    public VerifiedBy: number = 0;
    public VerifiedOn: string = '';
    public Remark: string = '';
    public Difference: number = 0;
    public TransactionId: number = 0;
    public PartyLedgerId: number = 0;
    public HospitalId: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public DrCr: boolean = false;
    public PartyLedgerName: string = "";
    public VoucherName: string = "";
    public ChequeNumber: number = 0;
    public ChequeDate: string = "";
    public LedgerCr: number = 0;
    public LedgerDr: number = 0;
    public VoucherTypeId: number = 0;
    public Status: string = "";
    public BankRefNumber: string = "";
    public LedgerId: number = 0;
    public ExtraTransactions: Array<BankReconciliationCategory> = new Array<BankReconciliationCategory>();
    public PartySubLedgerId: number = 0;
    public PartySubLedgerName: string = "";
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
    public TransactionId: number = 0;
    public LedgerId: number = 0;
    public HospitalId: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
}

export class BankReconciliationCategory {
    public CategoryId: number = 0;
    public CategoryName: string = "";
    public Description: string = "";
    public CreatedOn: string = "";
    public CreatedBy: number = 0;
    public IsActive: boolean = true;
    public MappedLedgerId: number = 0;
    public SubLedgerId: number = 0;
    public DrCr: boolean = false;
    public IsSelected: boolean = false;
    public Dr: boolean = false;
    public Cr: boolean = false;
    public Amount: number = 0;
    public IsClearable: boolean = false;
}