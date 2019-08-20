import { NepaliDate } from "../../shared/calendar/np/nepali-dates";

export class DischargeBillVM {
    public AdmissionDetail: AdmissionDetailVM = new AdmissionDetailVM();
    public PatientDetail: PatientDetailVM = new PatientDetailVM();
    public BillingTransactionDetail: BillingTransactionDetailVM = new BillingTransactionDetailVM();
    public DepositDetails: Array<DepositDetailVM> = new Array<DepositDetailVM>();
    public BillItemSummary: Array<BillItemSummary> = new Array<BillItemSummary>();
    public TotalAmount: number = 0;

    public SubTotal: number = 0;
    public DiscountAmount: number = 0;
    public Tax: number = 0;
    public Quantity: number = 0;
    public DepositBalance: number = 0;
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
}


export class BillingTransactionDetailVM {
    public FiscalYear: string;
    public InvoiceNumber: string;
    public BillingDate: string;
    public PaymentMode: string;
    public DepositDeductAmount: number;
    public DepositBalance: number;
    public User: string;
    public Remarks: string;
    public PrintCount: number;
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
}

export class AdmissionDetailVM {
    public AdmissionDate: string;
    public DischargeDate: string;
    public AdmittingDoctor: string;
    public Department: string;
    public RoomType: string;
    public LengthOfStay: number;
}

export class DepositDetailVM {
    public DepositId: number;
    public RecieptNo: number;
    public Date: string;
    public Amount: number;
    public Balance: number;
    public DepositType: string;
    public ReferenceInvoice: string;
}

export class DischargeDetailBillingVM {
    public PatientVisitId: number = null;
    public DischargeDate: string = null;
    public BillStatus: string = null;
    public Remarks: string = null;

    public DischargeDateNepali: NepaliDate = null; //only used in client side.
    public AdmittedDays: string = null;
}


