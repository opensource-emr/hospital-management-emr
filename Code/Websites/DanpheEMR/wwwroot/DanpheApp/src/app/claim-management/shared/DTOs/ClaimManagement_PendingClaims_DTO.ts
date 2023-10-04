export class InsurancePendingClaim {
    public ClaimSubmissionId: number = 0;
    public ClaimCode: number = 0;
    public HospitalNo: string = "";
    public PatientName: string = "";
    public PatientId: number = 0;
    public AgeSex: string = "";
    public ClaimStatus: string = "";
    public MemberNumber: string = "";
    public SchemeName: string = "";
    public TotalBillAmount: number = 0;
    public NonClaimableAmount: number = 0;
    public ClaimableAmount: number = 0;
    public ClaimedAmount: number = 0;
    public ApprovedAmount: number = 0;
    public RejectedAmount: number = 0;
    public ClaimRemarks: string = "";
    public ClaimSubmittedBy: string = "";
    public ClaimSubmittedOn: string = "";
    public TotalReceivedAmount: number = 0;
    public ServiceCommissionAmount: number = 0;
    public PendingAmount: number = 0;
    public CreditOrganizationId: number = 0;
}