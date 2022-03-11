export class CRN_CreditNoteAllInfoVM {
    public IsInvoiceFound: boolean = false;
    public PatientInfo: CRN_PatientInfoVM = null;
    public InvoiceInfo: CRN_InvoiceInfoVM = null;
    public TransactionItems: Array<CRN_InvoiceItemsVM> = [];
    public AlreadyReturnedItms = [];
}


export class CRN_PatientInfoVM {
    public PatientId: number = 0;
    public PatientCode: string = null;
    public ShortName: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public CountryName: string = null;
    public CountrySubDivisionName: string = null;
    public Address: string = null;
}

export class CRN_InvoiceInfoVM {
    public PatientId: number = 0;
    public BillingTransactionId: number = 0;
    public InvoiceCode: string = null;
    public InvoiceNo: number = 0;
    public PaymentMode: string = null;
    public InvoiceDate: string = null;
    public InvoiceNoFormatted: string = null;
    public SubTotal: number = 0;
    public DiscountAmount: number = 0;
    public TaxTotal: number = 0;
    public TotalAmount: number = 0;
    public BillStatus: string = null;
    public TransactionType: string = null;
    public InvoiceType: string = null;
    public IsInsuranceBilling: boolean = false;
    public InsuranceProviderId: number = null;
    public UserName: string = null;
    public SettlementId:number = 0;
    public CashDiscount:number  = 0;
}

export class CRN_InvoiceItemsVM {
    public BillingTransactionItemId: number = 0;
    public BillingTransactionId: number = 0;
    public PatientId: number = 0;
    public ServiceDepartmentId: number = 0;
    public ItemId: number = 0;
    public ItemName: string = null;
    public Price: number = 0;
    public RemainingQty: number = 0;
    public SubTotal: number = 0;
    public DiscountAmtPerUnit: number = 0;
    public DiscountAmount: number = 0;
    public TaxAmtPerUnit: number = 0;
    public TaxAmount: number = 0;
    public TotalAmtPerUnit: number = 0;
    public TotalAmount: number = 0;
    public DiscountPercent: number = 0;
    public ProviderId: number = null;
    public BillStatus: string = null;
    public RequisitionId: number = null;
    public RequisitionDate: string = null;
    public RequestedBy: number = null;
    public PatientVisitId: number = null;
    public BillingPackageId: number = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public BillingType: string = null;
    public RequestingDeptId: number = null;
    public VisitType: string = null;
    public PriceCategory: string = null;
    public PatientInsurancePackageId: number = null;
    public IsInsurance: boolean = false;
    public DiscountSchemeId: number = null;
    public LabTypeName: string = null;
    public OrderStatus: string = null;

    //below two properties are only for local use (client side only)
    public ReturnQuantity: number = 0;
    public IsSelected: boolean = false;
    public IsValid: boolean = true;
    public IsReturnRestricted: boolean = false;
    public SrvDeptIntegrationName: string = null;//needed for orderstatus for return restriction. only in client side.
}