export class BillItemPrice{
    public BillItemPriceId: number = 0;
    public ServiceDepartmentId: number = null;
    public ItemId: number = null;
    public ItemName: string = null;
    public Price: number = null;
    public DisplaySeq: number = null;
    public GovtInsurancePrice: number = null;
    public EHSPrice: number = null;
    public SAARCCitizenPrice: number = null;
    public ForeignerPrice: number = null;    
    public ProcedureCode: string = null;
    public IntegrationName: string = null;
    public Description: string = null;
    public ItemCode: string = null;
    public IsActive: boolean = false;
    public TaxApplicable: boolean = false;
    public DiscountApplicable: boolean = false;
    public IsDoctorMandatory: boolean = false;
    public HasAdditionalBillingItems: boolean = false;
    public InsuranceApplicable: boolean = false;
    public IsInsurancePackage: boolean = false;
    public IsFractionApplicable: boolean = false;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public ModifiedBy: number = 0;
    public ModifiedOn: string = null;

    public ServiceDepartmentName: string = null;
}