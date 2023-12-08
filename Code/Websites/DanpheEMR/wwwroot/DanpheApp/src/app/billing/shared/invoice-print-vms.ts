import { PharmacyBillItemVM } from "./discharge-bill.view.model";

export class BilPrint_VM {
  PatientInfo: BilPrint_PatientInfoVM = null;
  InvoiceInfo: BilPrint_InvoiceInfoVM = null;
  InvoiceItems: Array<BilPrint_InvoiceItemVM> = null;
  VisitInfo: BilPrint_VisitInfoVM = null;
  DepositList: Array<BilPrint_DepositListVM> = null;
  IsInvoiceFound: boolean = false;
  //!Krishna, 31stMarch'23 Copied from EMR_V2.3.1_manipal for Discharge Statement
  PharmacyInvoiceItems: Array<PharmacyBillItemVM> = null
  DischargeInfo: BilPrint_DischargeInfoVM = null;
  BillingInvoiceSummary: Array<BilPrintBillingSummaryVM> = null;
  PharmacySummary: Array<BilPrintPharmacySummaryVM> = null;

}

export class SSFBil_VM {
  PatientInfo = new Array<SSF_Invoice_PatInfo>();
  InvoiceInfo = new Array<SSF_InvoiceInfoVM>();
  InvoiceItems = new Array<SSF_InvoiceItems>();
  PhrmInvoices = new Array<SSF_PhrmInvoices>();
  BillingInvoiceInfo = new Array<SSF_BillingInvoiceInfoVM>();
  BillingInvoiceItems = new Array<SSF_BillingInvoiceItems>();
  PhrmInvoiceItems = new Array<SSF_PhrmInvoiceItems>();
  LabReportInfo = new Array<SSF_LabReportInfo>();
  RadiologyReportInfo = new Array<SSF_RadiologyReportInfo>();
  BillingInvoiceReturns = new Array<SSFInvoiceReturnsList>();
  PharmacyInvoiceReturns = new Array<SSFInvoiceReturnsList>();
}

export class SSF_LabReportInfo {
  public PatientId: number = 0;
  public ClaimCode: number = 0;
  public RequisitionIdCSV: string = "";
}

export class SSF_RadiologyReportInfo {
  public PatientId: number = 0;
  public ClaimCode: number = 0;
  public RequisitionIdCSV: number = 0;
}


export class SSF_PhrmInvoiceItems {
  public UnitPrice: number = 0;
  public ServiceCode: string = "ADJ02" //* This is hardcoded and not used anywhere else.
  public PatientId: number = 0;
  public Quantity: number = 0;
  public ClaimCode: number = 0;
  public InvoiceId: number = null;
  public ItemName: string = null;
}

export class SSF_BillingInvoiceItems {
  public BillingTransactionItemId: number = null;
  public PatientId: number = null;
  public BillingTransactionId: number = null;
  public ServiceDepartmentId: number = null;
  public ItemId: number = null;
  public ServiceDepartmentName: string = null;
  public ItemName: string = null;
  public Price: number = null;
  public Quantity: number = null;
  public SubTotal: number = null;
  public DiscountAmount: number = null;
  public TotalAmount: number = null;
  public PerformerId: number = null;
  public PerformerName: string = null;
  public RequestedById: number = null;
  public RequestedByName: string = null;
  public RequestedBy: string = null;
  public PriceCategory: string = null;
  public ServiceCode: string = null;
  public ItemCode: string = null;
  public IsCoPayment: boolean = false;
  public DiscountPercent: number = null;
}

export class SSF_BillingInvoiceInfoVM {
  public PatientId: number = 0;
  public NetReceivableAmount: number = 0;
  public InvoiceNumber: number = null;
  public InvoiceCode: string = null;
  public InvoiceNumFormatted: string = null;
  public TransactionDate: string = null;
  public FiscalYearId: number = null;
  public FiscalYear: string = null;
  public PaymentMode: string = null;
  public PaymentDetails: string = null;
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
  public ReceivedAmount: number = null;
  public InvoiceDate: number = null;
}

// export class SSF_PhrmInvoices {
//   public UnitPrice: number = 0;
//   public ServiceCode: string = "ADJ02" //* This is hardcoded and not used anywhere else.
//   public PatientId: number = 0;
//   public Quantity: number = 0;
//   public ClaimCode: number = 0;
//   public InvoiceId: number = null;
//   public InvoiceNo: number = 0;
//   public InvoiceDate: string = "";
// }

export class SSF_PhrmInvoices {
  public InvoiceNumber: number = 0;
  public InvoiceNoFormatted: string = "";
  public TotalAmount: number = 0;
  public ReceivedAmount: number = 0;
  public BalanceAmount: number = 0;
  public ClaimCode: number = 0;
  public PatientId: number = 0;
  public InvoiceId: number = null;
  public InvoiceDate: string = "";
}

export class SSF_Invoice_PatInfo {
  public PolicyNo: string = null;
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
  public Address: string = null;
  public PhoneNumber: string = null;
  public MembershipTypeId: number = null;
  public MembershipTypeName: string = null;
  public PANNumber: string = null;
  public PatientNameLocal: string = null;
  public Ins_NshiNumber: string = null;
  public MunicipalityName: string = null;
  public PolicyHolderUID: string = null;
  public PolicyHolderEmployerId: string = null;
  public SchemeType: number = null;
  public Admitted: string = "0"; //* server sends this as string hence cannot make it boolean.
  public Diagnosis: string = null;
  public AdmissionDate: string = null;
  public DischargeDate: string = null;
  public DischargeTypeName: string = null;
  public CaseSummary: string = null;
  public IsDead: number = null;
  public ClaimCode: number = 0;
  public VisitType: string = "";
  public VisitCreationDate: string = "";
  public WardNumber: string = null;
  public SchemeName: string = null;
  public DepartmentName: string = null;
}

export class SSFClaimList {
  public IsSelected: boolean = false;
  public InvoiceNo: number;
  //public ClaimCode : number;
  public SSFClaimCode: string;
  public InvoiceTotalAmount: number;
  public Cash: number;
  public Credit: number;
  public ClaimedAmount: number;
  public Status: boolean;
  public BillingTransactionId: number;
  public InvoiceNoFormatted: string = "";
  public BookingStatus: string = "";
  public ModuleName: string = "";
}

export class PatientWiseSSFClaimList {
  public IsSelected: boolean = false;
  public PolicyNo: string;
  public PatientName: string;
  public PatientCode: string;
  public Address: string;
  public PatientId: number = 0;
  public ClaimCode: number = 0;
  public InvoiceList: Array<SSFClaimList> = new Array<SSFClaimList>();
  public InvoiceReturnsList = new Array<SSFInvoiceReturnsList>();
  public SchemeType: number = null;
}

export class SSF_InvoiceItems {
  public BillingTransactionItemId: number = null;
  public PatientId: number = null;
  public BillingTransactionId: number = null;
  public ServiceDepartmentId: number = null;
  public ItemId: number = null;
  public ServiceDepartmentName: string = null;
  public ItemName: string = null;
  public Price: number = null;
  public Quantity: number = null;
  public SubTotal: number = null;
  public DiscountAmount: number = null;
  public TotalAmount: number = null;
  public PerformerId: number = null;
  public PerformerName: string = null;
  public RequestedById: number = null;
  public RequestedByName: string = null;
  public RequestedBy: string = null;
  public PriceCategory: string = null;
  public ServiceCode: string = null;
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
  public WardNumber: number = null;
  public PhoneNumber: string = null;
  public MembershipTypeId: number = null;
  public MembershipTypeName: string = null;
  public PANNumber: string = null;
  public PatientNameLocal: string = null;
  public Ins_NshiNumber: string = null;
  public MunicipalityName: string = null;
  public SSFPolicyNo: string = "";
  public PolicyNo: string = "";
}

export class BilPrint_InvoiceInfoVM {
  public InvoiceNumber: number = null;
  public InvoiceCode: string = null;
  public InvoiceNumFormatted: string = null;
  public TransactionDate: string = null;
  public FiscalYearId: number = null;
  public FiscalYear: string = null;
  public PaymentMode: string = null;
  public PaymentDetails: string = null;
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
  public CreditOrganizationName: string = null;
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
  public ReceivedAmount: number = null;
  public SchemeName: string = null;
  public OtherCurrencyDetail: string = null;
}


export class BilPrint_InvoiceItemVM {
  public BillingTransactionItemId: number = null;
  public ServiceDepartmentId: number = null;
  public IntegrationItemId: number = null;
  public ItemId: number = null;
  public ItemCode: string = null;
  public ServiceDepartmentName: string = null;
  public ItemName: string = null;
  public Price: number = null;
  public Quantity: number = null;
  public SubTotal: number = null;
  public DiscountPercent: number = 0;
  public DiscountAmount: number = null;
  public TotalAmount: number = null;
  public PerformerId: number = null;
  public PerformerName: string = null;
  public RequestedById: number = null;
  public RequestedByName: string = null;
  public RequestedBy: string = null;
  public PriceCategory: string = null;
  public BillDate: string = null;
  public IsCoPayment: boolean = false;
  public ServiceCategoryCode: string = "";
  public ServiceCategoryName: string = "";
}


export class BilPrint_VisitInfoVM {
  public PatientVisitId: number = null;
  public VisitCode: string = null;
  public AdmissionDate: string = null;
  public DischargeDate: string = null;
  public WardName: string = null;
  public BedNumber: string = null;
  public BedCode: string = null;
  public ConsultingDoctor: string = null;
  public ItemsRequestingDoctorsId: Array<number> = new Array<number>();
  public ItemsRequestingDoctors: string = null;
  public DepartmentName: string = null;
}

export class BilPrint_DepositListVM {
  public DepositId: number = null;
  public ReceiptNo: number = null;
  public FiscalYearFormatted: string = null;
  public DepositReceiptNoFormattted: string = null;
  // public DepositType: string = null;
  public TransactionType: string = null;
  public InAmount: number = 0;
  public OutAmount: number = 0;
  public CreatedOn: string = null;
  public UserName: string = null;
}

export class SSF_InvoiceInfoVM {
  public PatientId: number = 0;
  public NetReceivableAmount: number = 0;
  public InvoiceNumber: number = null;
  public InvoiceCode: string = null;
  public InvoiceNumFormatted: string = null;
  public TransactionDate: string = null;
  public FiscalYearId: number = null;
  public FiscalYear: string = null;
  public PaymentMode: string = null;
  public PaymentDetails: string = null;
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
  public CreditOrganizationName: string = null;
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
  public ReceivedAmount: number = null;
  public InvoiceDate: number = null;
}

export class BilPrint_DischargeInfoVM {
  public DischargeStatementId: number;
  public StatementNo: string;
  public StatementTime: string;
  public StatementDate: string;
}

export class BilPrintBillingSummaryVM {
  public GroupName: string;
  public SubTotal: number;
  public DiscountAmount: number;
  public TotalAmount: number;
}

export class BilPrintPharmacySummaryVM {
  public GroupName: string;
  public SubTotal: number;
  public DiscountAmount: number;
  public TotalAmount: number;
}

export class SSFInvoiceReturnsList {
  public PatientId: number = null;
  public ReturnId: number = null;
  public CreditNoteNumber: number = null;
  public CreditNoteNumberFormatted: string = "";
  public ClaimCode: number = null;
  public TotalAmount: number = 0;
  public ModuleName: string = "";
}
