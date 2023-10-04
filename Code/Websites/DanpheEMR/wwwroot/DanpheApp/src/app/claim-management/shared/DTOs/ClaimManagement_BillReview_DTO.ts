export class ClaimBillReviewDTO {
    public CreditStatusId: number = 0;
    public ClaimCode: number = 0;
    public InvoiceRefId: number = 0;
    public FiscalYearId: number = 0;
    public HospitalNo: string = ``;
    public PatientName: string = ``;
    public PatientId: number = 0;
    public AgeSex: string = ``;
    public MemberNo: string = ``;
    public InvoiceNo: string = ``;
    public InvoiceDate: string = ``;
    public SchemeName: string = ``;
    public SchemeId: number = 0;
    public CreditOrganizationId: number = 0;
    public TotalAmount: number = 0;
    public NetCreditAmount: number = 0;
    public NonClaimableAmount: number = 0;
    public ClaimStatus: string = ``;
    public VisitType: string = ``;
    public AdmissionDate: string = ``;
    public DischargeDate: string = ``;
    public CreditModule: string = ``;
    public IsClaimable: boolean = false;
    public IsSelected: boolean = false;
    public ClaimSubmissionId: number = 0;
}