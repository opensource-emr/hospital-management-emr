export class CurrentVisitContextVM {
    public PatientId: number = null;
    public PatientVisitId: number = null;
    // public ProviderId: number = null;
    // public ProviderName: string = null;
    public PerformerId: number = null; // Krishna, 28th'jun'22, ProviderId changed to PerformerId.
    public PerformerName: string = null;// Krishna, 28th'jun'22, ProviderName changed to PerformerName.
    public Current_WardBed: string = null;
    public VisitType: string = null;
    public AdmissionDate: string = null;
    public BedFeatureName: string = null;
    public BedCode: string = null;
    public RequestingDepartmentName: string = null;
    public RequestingDepartmentId: number;
    public ClaimCode: number = 0;
    public MemberNo: string = null;
    public SchemeId: number = null;
    public PriceCategoryId: number = null;
}
