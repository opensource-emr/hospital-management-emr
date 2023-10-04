
export class AdtAutoBillingItem_DTO {
  public AdtAutoBillingItemId: number = 0;
  public BedFeatureId: number = 0;
  public BedFeatureName: string = '';
  public SchemeId: number = 0;
  public SchemeName: string = '';
  public ServiceItemId: number = 0;
  public ServiceItemName: string = '';
  public MinimumChargeAmount: number = 0;
  public PercentageOfBedCharges: number = 0;
  public UsePercentageOfBedCharges: boolean = false;
  public IsRepeatable: boolean = false;
  public Price: number = 0;
  public PriceCategoryId: number = 0;
  public ItemCode: string = "";
  public ItemName: string = "";
  public ServiceDepartmentId: number = 0;
  public ServiceDepartmentName: string = "";
  public IsTaxApplicable: boolean = false;
  public IsDiscountApplicable: boolean = false;
  public DiscountPercent: number = 0;
  public IsPriceChangeAllowed: boolean = false;
  public IsZeroPriceAllowed: boolean = false;
  public HasAdditionalBillingItems: boolean = false;
  public IsDoctorMandatory: boolean = false;
  public IsCoPayment: boolean = false;
  public CoPayCashPercent: number = 0;
  public CoPayCreditPercent: number = 0;
  public IntegrationItemId: number = 0;
  public IntegrationName: string = "";
  public IsActive: boolean = false;
  public Scheme: string = '';
  public ServiceItem: string = '';
}
