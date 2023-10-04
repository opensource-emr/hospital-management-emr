export class BillingPackageServiceItem_DTO {
    public PackageServiceItemId: number = 0;
    public BillingPackageId: number = 0;
    public ServiceItemId: number = 0;
    public PriceCategoryId: number = 0;
    public SchemeId: number = 0;
    public ItemCode: string = null
    public ItemName: string = "";
    public ServiceDepartmentId: number = 0
    public ServiceDepartmentName: string = null;
    public Price: number = null;
    public IsTaxApplicable: boolean = false;
    public IsDiscountApplicable: boolean = false;
    public DiscountPercent: number;
    public IsPriceChangeAllowed: boolean = false;
    public IsZeroPriceAllowed: boolean = false;
    public HasAdditionalBillingItems: boolean = false;
    public IsDoctorMandatory: boolean = false;
    public IsCoPayment: boolean = false;
    public CoPayCashPercent: number = 0;
    public CoPayCreditPercent: number = 0;
    public IntegrationItemId: number = 0;
    public IntegrationName: string = null;
    public DisplaySequence: number = null;
    public IsPackageBilling: boolean = false;
    public PerformerId: number = null;
    public Quantity: number = null;
    public PerformerName: string = null;
    public TotalAmount: number = null;
    public DiscountAmount: number = null;
    public IsErLabApplicable: boolean = false;
}