export class SSFEligibility {
  public SchemeName: string = "";
  public AccidentBalance: number = 0;
  public UsedMoney: number = 0;
  public OpdBalance: number = 0;
  public IPBalance: number = 0;
  public RegistrationCase: string = "";
  public Inforce: boolean = false;
}
export class Company {
  public fullUrl: string = "";
  public E_SSID: string = "";
  public name: string = "";
  public status: string = "";
}

export class ClaimBillablePeriod {
  public start: string;
  public end: string;
}

export class ClaimCategory {
  public text: string;
}

export class ClaimCoding {
  public code: string;
}

export class ClaimDiagnosis {
  public sequence: number;
  public diagnosisCodeableConcept: ClaimDiagnosisCodeableConcept = new ClaimDiagnosisCodeableConcept();
  public type: Array<ClaimType> = new Array<ClaimType>();
}

export class ClaimDiagnosisCodeableConcept {
  public coding: Array<ClaimCoding> = new Array<ClaimCoding>();
}

export class ClaimEnterer {
  public reference: string;
}

export class ClaimExtension {
  public url: string;
  public valueString: string | number;
}

export class ClaimFacility {
  public reference: string;
}

export class ClaimItem {
  public sequence: number;
  public category: ClaimCategory = new ClaimCategory();
  public productOrService: ClaimProductOrService = new ClaimProductOrService();
  public quantity: ClaimQuantity = new ClaimQuantity();
  public unitPrice: ClaimUnitPrice = new ClaimUnitPrice();
  public extension = new Array<ClaimExtension>();
}

export class ClaimPatient {
  public reference: string;
}

export class ClaimProductOrService {
  public text: string;
}

export class ClaimProvider {
  public reference: string;
}

export class ClaimQuantity {
  public value: string;
}

export class ClaimRoot {
  public resourceType: string;
  public clientClaimId: string = "";
  public claimType: ClaimType = new ClaimType();
  public billablePeriod: ClaimBillablePeriod = new ClaimBillablePeriod();
  public created: string;
  public enterer: ClaimEnterer = new ClaimEnterer();
  public facility: ClaimFacility = new ClaimFacility();
  public provider: ClaimProvider = new ClaimProvider();
  public extension: Array<ClaimExtension> = new Array<ClaimExtension>();
  public diagnosis: Array<ClaimDiagnosis> = new Array<ClaimDiagnosis>();
  public item: Array<ClaimItem> = new Array<ClaimItem>();
  public total: ClaimTotal = new ClaimTotal();
  public patient: ClaimPatient = new ClaimPatient();
  public supportingInfo: Array<ClaimSupportingInfo> = new Array<ClaimSupportingInfo>();
  public claimResponseInfo: SSFClaimResponseInfo = new SSFClaimResponseInfo();
}

export class ClaimTotal {
  public value: number = 0;
}

export class ClaimType {
  public text: string;
}

export class ClaimUnitPrice {
  public value: string;
}

export class ClaimSupportingInfo {
  public category: Category = new Category();
  public valueAttachment: ValueAttachement = new ValueAttachement();
}

export class Category {
  public coding: Array<Coding> = new Array<Coding>();
  public text: string;
}

export class Coding {
  public code: string;
  public display: string;
}
export class ValueAttachement {
  public contentType: string;
  public creation: string;
  public data: string;
  public hash: string;
  public title: string;
}


export class SSFSchemeTypeSubProduct {
  public name: string = null;
  public value: number = null;
}

export class SSFClaimResponseInfo {
  public PatientId: number = 0;
  public PatientCode: string = "";
  public ClaimedDate: string = "";
  public ClaimCode: number = 0;
  public InvoiceNoCSV: string = "";
}

export class ClaimBookingRoot_DTO {
  public BookedAmount: number = 0;
  public Patient: string = "";
  public Scheme: string = "";
  public SubProduct: number | null;
  public PatientId: number = null;
  public HospitalNo: string = "";
  public PolicyNo: string = "";
  public LatestClaimCode: number = null;
  public IsAccidentCase: boolean = false;
  // public ClaimBookings = new Array<ClaimBooking_DTO>();
  public BillingInvoiceNo: string = "";
  public PharmacyInvoiceNo: string = "";
}

export class ClaimBooking_DTO {
  public BillingInvoiceNo: string = "";
  public PharmacyInvoiceNo: string = "";
}
