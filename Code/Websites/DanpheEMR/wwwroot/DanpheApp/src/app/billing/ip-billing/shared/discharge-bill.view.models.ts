import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";

export class DischargeBillVM {
  public AdmissionDetail: AdmissionDetailVM = new AdmissionDetailVM();
  public PatientDetail: PatientDetailVM = new PatientDetailVM();
  public BillingTransactionDetail: BillingTransactionDetailVM = new BillingTransactionDetailVM();
  //sud:11May'21--Deposit history is not required, we're managing only from fields available in BillingTransaction table. 
  //need to bring this again at the time of merging LPH with EMR.
  public DepositDetails: Array<DepositDetailVM> = new Array<DepositDetailVM>();
  public BillItemSummary: Array<BillItemSummary> = new Array<BillItemSummary>();
  public TotalAmount: number = 0;

  public SubTotal: number = 0;
  public DiscountAmount: number = 0;
  public Tax: number = 0;
  public Quantity: number = 0;
  public DepositBalance: number = 0;
  public TaxableAmount: number = 0;
  public TaxTotal: number = 0;
}

//export class DischargeBillSummaryVM {
//    public AdmissionDetail: AdmissionDetailVM = new AdmissionDetailVM();
//    public PatientDetail: PatientDetailVM = new PatientDetailVM();
//    public BillItems: Array<BillItemVM> = new Array<BillItemVM>();
//    public BillingTransactionDetail: BillingTransactionDetailVM = new BillingTransactionDetailVM();
//    public BillItemSummary: Array<BillItemSummary> = new Array<BillItemSummary>();
//    public DepositDetails: Array<DepositDetailVM> = new Array<DepositDetailVM>();

//    public TotalAmount: number = 0;
//    public SubTotal: number = 0;
//    public DiscountAmount: number = 0;
//    public Tax: number = 0;
//    public Quantity: number = 0;

//}

export class BillItemSummary {
  public ItemGroupName: string;
  public Items: Array<BillItemVM> = new Array<BillItemVM>();
  public TotalAmount: number = 0;
  public SubTotal: number = 0;
  public DiscountAmount: number = 0;
  public TotalPrice: number = 0;
  public Tax: number = 0;
  public Quantity: number = 0;
}

//list of all billing items
export class BillItemVM {
  public ItemId: number;
  public BillDate: string;
  public ItemGroupName: string;
  public ItemName: string;
  public DoctorId: number;
  public DoctorName: string;
  public Price: number;
  public Quantity: number;
  public SubTotal: number;
  public DiscountAmount: number;
  public TaxAmount: number;
  public TotalAmount: number;
  public ServiceDepartmentId: number;
  public IsEdited: boolean = false;
}


export class BillingTransactionDetailVM {
  public FiscalYear: string;
  public ReceiptNo: number;
  public InvoiceNumber: string;
  public BillingDate: string;
  public PaymentMode: string;
  //public DepositDeductAmount: number;
  public DepositBalance: number;
  public User: string;
  public Remarks: string;
  public PrintCount: number;
  public ReturnStatus: boolean;
  public TotalAmount: number;
  public OrganizationName: string; //Yubraj 23rd April '19 for credit organization
  public ExchangeRate: number;
  public Tender: number;
  public Change: number;
  public LabTypeName: string;

  //sud:11May'21:New fields added in BillingTxn Table.
  public DepositAvailable: number = 0;
  public DepositUsed: number = 0;
  public DepositReturnAmount: number = 0;


}


export class PatientDetailVM {
  public PatientId: number;
  public PatientName: string;
  public HospitalNo: string;
  public InpatientNo: string;
  public Address: string;
  public DateOfBirth: string;
  public ContactNo: string;
  public Gender: string;
  public CountrySubDivision: string;
  public PANNumber: string;
}

export class AdmissionDetailVM {
  public AdmissionDate: string;
  public DischargeDate: string;
  public AdmittingDoctor: string;
  public Department: string;
  public RoomType: string;
  public LengthOfStay: string;
  public ProcedureType: string = null;
}

export class DepositDetailVM {
  public DepositId: number;
  public RecieptNo: number;
  public RecieptNum: number;
  public Date: string;
  public Amount: number;
  public Balance: number;
  public DepositType: string;
  public ReferenceInvoice: string;
}

export class DischargeDetailBillingVM {
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public DischargeDate: string = null;
  public BillStatus: string = null;
  public Remarks: string = null;
  public DiscountSchemeId: number = null;

  public DischargeDateNepali: NepaliDate = null; //only used in client side.
  public AdmittedDays: string = null;
  public ProcedureType: string = null;

  public BillingTransactionId: number = null; //yubraj used for updating deposit table while discharge patient
  public IsActive: boolean;
}

export class BedDetailVM {
  public PatientBedInfoId: number = 0;
  public BedFeatureId: number = 0;
  public WardName: string = null;
  public BedCode: string = null;
  public BedFeature: string = null;
  public StartDate: string = null;
  public EndDate: string = null;
  public BedPrice: number = 0;
  public Action: string = null;
  public Days: string;

  public IsQuantityUpdated: boolean = false;
}

export class BedDurationTxnDetailsVM {
  public PatientVisitId: number = 0;
  public BedFeatureId: number = 0;
  public Days: number = 0;
  public SubTotal: number = 0;
  public TaxableAmount: number = 0;
  public NonTaxableAmount: number = 0;
  public TotalDays: number = 0;
}



