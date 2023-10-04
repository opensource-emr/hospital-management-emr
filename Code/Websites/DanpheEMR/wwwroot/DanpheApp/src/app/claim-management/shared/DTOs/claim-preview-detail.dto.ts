export class ClaimDetails_DTO {
    public HeaderDetails: Array<HeaderDetails_DTO> = new Array<HeaderDetails_DTO>();
    public BillingDetails: Array<BillingDetails_DTO> = new Array<BillingDetails_DTO>();
    public PharmacyDetails: Array<PharmacyDetails_DTO> = new Array<PharmacyDetails_DTO>();
    public DocumentDetails: Array<DocumentDetails_DTO> = new Array<DocumentDetails_DTO>();
}

export class HeaderDetails_DTO {
    public ClaimCode: number = 0;
    public MemberNo: string = ``;
    public HospitalNo: string = ``;
    public PatientName: string = ``;
    public Address: string = ``;
    public Scheme: string = ``;
    public AgeSex: string = ``;
    public ContactNo: string = ``;
    public ClaimedAmount: number = 0;
}

export class BillingDetails_DTO {
    public InvoiceDate: string = ``;
    public ItemCode: string = ``;
    public DepartmentName: string = ``;
    public Particulars: string = ``;
    public Quantity: number = 0;
    public Rate: number = 0;
    public SubTotalAmount: number = 0;
    public DiscountAmount: number = 0;
    public TotalAmount: number = 0;
}

export class PharmacyDetails_DTO {
    public InvoiceDate: string = ``;
    public ItemCode: string = ``;
    public Particulars: string = ``;
    public BatchExpiry: string = ``;
    public Quantity: number = 0;
    public Rate: number = 0;
    public SubTotalAmount: number = 0;
    public DiscountAmount: number = 0;
    public TotalAmount: number = 0;
}

export class DocumentDetails_DTO {
    DocumentName: string = ``;
}