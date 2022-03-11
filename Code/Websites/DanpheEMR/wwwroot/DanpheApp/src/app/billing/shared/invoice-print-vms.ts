export class BilPrint_VM {
    PatientInfo: BilPrint_PatientInfoVM = null;
    InvoiceInfo: BilPrint_InvoiceInfoVM = null;
    InvoiceItems: Array<BilPrint_InvoiceItemVM> = null;
    VisitInfo: BilPrint_VisitInfoVM = null;
    DepositList: Array<BilPrint_DepositListVM> = null;
    IsInvoiceFound: boolean = false;
}

export class BilPrint_PatientInfoVM {
    public PatientId: number = null;
    public PatientCode: string = null;
    public ShortName: string = null;
    public Gender: string = null;
    public DateOfBirth: string = null;
    public Age: string = null;
    public CountryId: number = null;
    public CountryName: string = null;
    public CountrySubDivisionId: number = null;
    public CountrySubDivisionName: string = null;
    public Address: number = null;
    public PhoneNumber: string = null;
    public MembershipTypeId: number = null;
    public MembershipTypeName: string = null;
    public PANNumber: string = null;
    public PatientNameLocal: string = null;
    public Ins_NshiNumber: string = null;
}

export class BilPrint_InvoiceInfoVM {
    public InvoiceNumber: number = null;
    public InvoiceCode: string = null;
    public InvoiceNumFormatted: string = null;
    public TransactionDate: string = null;
    public FiscalYearId: number = null;
    public FiscalYear: string = null;
    public PaymentMode: string = null;
    public BillStatus: string = null;
    public TransactionType: string = null;
    public InvoiceType: string = null;
    public PrintCount: number = null;
    public SubTotal: number = null;
    public DiscountAmount: number = null;
    public TaxableAmount: number = null;
    public NonTaxableAmount: number = null;
    public TotalAmount: number = null;
    public BillingTransactionId: number = null;
    public PaidDate: string = null;
    public Tender: number = null;
    public Change: number = null;
    public Remarks: string = null;
    public IsInsuranceBilling: boolean = null;
    public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places
    public CrOrganizationId: number = null;
    public CrOrganizationName: string = null;
    public UserName: string = null;
    public CounterId: number = null;
    public CounterName: string = null;
    public LabTypeName: string = null;
    public PackageId: number = null;
    public PackageName: string = null;
    public DepositAvailable: number = null;
    public DepositUsed: number = null;
    public DepositReturnAmount: number = null;
    public DepositBalance: number = null;
    public TaxTotal: number = null;
}


export class BilPrint_InvoiceItemVM {
    public BillingTransactionItemId: number = null;
    public ServiceDepartmentId: number = null;
    public ItemId: number = null;
    public ServiceDepartmentName: string = null;
    public ItemName: string = null;
    public Price: number = null;
    public Quantity: number = null;
    public SubTotal: number = null;
    public DiscountAmount: number = null;
    public TotalAmount: number = null;
    public ProviderId: number = null;
    public ProviderName: string = null;
    public RequestedById: number = null;
    public RequestedBy: string = null;
    public PriceCategory: string = null;
}


export class BilPrint_VisitInfoVM {
    public PatientVisitId: number = null;
    public VisitCode: string = null;
    public AdmissionDate: string = null;
    public DischargeDate: string = null;
    public WardName: string = null;
    public BedNumber: number = null;
    public BedCode: string = null;
    public ConsultingDoctor: string = null;
    public ItemsRequestingDoctorsId: Array<number> = new Array<number>();
    public ItemsRequestingDoctors: string = null;
}

export class BilPrint_DepositListVM {
    public DepositId: number = null;
    public ReceiptNo: number = null;
    public FiscalYearFormatted: string = null;
    public DepositReceiptNoFormattted: string = null;
    public DepositType: string = null;
    public Amount: number = null;
    public CreatedOn: string = null;
    public UserName: string = null;
}
