/*
  Note: This is a replica of ServerDto: ServiceItemDetails_DTO -> inside DanpheEMR.Services.Billing.DTO

  Created: 16Mar'23--Sud
*/

export class ServiceItemDetails_DTO {
  public ServiceItemId: number = 0;
  public PriceCategoryId: number = 0;
  public SchemeId: number = 0;
  public ItemCode: string = null
  public ItemName: string = "";
  public ServiceDepartmentId: number = 0
  public ServiceDepartmentName: string = null;
  public Price: number = 0;
  public IsTaxApplicable: boolean = false;
  public IsDiscountApplicable: boolean = false;
  public DiscountPercent: number = 0;
  public DiscountAmount: number = 0;
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
  public DefaultDoctorList: string = null;
}
