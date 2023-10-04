export class ReferralCommission_DTO {
    public ReferralCommissionId: number = 0;
    public FiscalYearId: number = 0;
    public BillingTransactionId: number = 0;
    public InvoiceNoFormatted: string = "";
    public InvoiceDate: string = "";
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public ReferringPartyId: number = 0;
    public ReferralSchemeId: number = 0;
    public InvoiceTotalAmount: number = 0;
    public ReturnAmount: number = 0;
    public InvoiceNetAmount: number = 0;
    public Percentage: number = 0;
    public ReferralAmount: number = 0;
    public Remarks: string = "";
    public ReferralSchemeName: string;
    public VehicleNumber: string;
    public ReferringPartyName: string;
    public AreaCode: string;
    public ReferringPartyGroupName: string;
    public ReferringOrganizationName: string;
    public ReferralPercentage: number;
}