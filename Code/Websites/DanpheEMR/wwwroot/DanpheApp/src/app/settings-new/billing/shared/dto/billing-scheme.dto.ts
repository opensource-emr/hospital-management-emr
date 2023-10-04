import { BillingSubScheme_DTO } from "../../../../billing/shared/dto/bill-subscheme.dto";
import { ENUM_BillPaymentMode } from "../../../../shared/shared-enums";

export class BillingScheme_DTO {
  public SchemeId: number = 0;
  public SchemeCode: string = null;
  public SchemeName: string = "";

  //sud:10Mar'23--This property is only there in Client side for now. We may have to add this to DbTable and so on..
  public MembershipDisplayName: string = null;
  public CommunityName: string = null;
  public IsDiscountApplicable: boolean = false;
  public DiscountPercent: number = 0;
  public IsDiscountEditable: boolean = false;
  public IsMembershipApplicable: boolean = false;
  public IsMemberNumberCompulsory: boolean = false;
  public DefaultPaymentMode: string = ENUM_BillPaymentMode.cash;
  public IsCreditApplicable: boolean = false;
  public IsCreditOnlyScheme: boolean = false;
  public CreditLimit: number = 0;
  public DefaultCreditOrganizationId: number = 0;
  public IsCoPayment: boolean = false;

  public DefaultPriceCategoryId: number = 0;
  public DefaultPriceCategoryName: string = null;

  public ApiIntegrationName: string = null;
  public FieldSettingParamName: string = null;// { get; set; }
  public IsSystemDefault: boolean = false;

  public CoPaymentCashPercent: number = 0;
  public CoPaymentCreditPercent: number = 0;
  public IsCreditLimited: boolean = false;
  public IsGeneralCreditLimited: boolean = false;
  public GeneralCreditLimit: number = 0;
  public IsClaimCodeAutoGenerate: boolean = false;
  public HasSubScheme: boolean = false;
  public AllowProvisionalBilling: boolean = false;
  public SubSchemes = new Array<BillingSubScheme_DTO>();
}
