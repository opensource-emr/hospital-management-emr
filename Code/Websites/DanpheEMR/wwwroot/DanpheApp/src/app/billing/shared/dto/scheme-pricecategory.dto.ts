import { ENUM_BillPaymentMode } from "../../../shared/shared-enums";
import { ServiceItemDetails_DTO } from "./service-item-details.dto";

export class SchemePriceCategory_DTO {

  public ServiceBillingContext: string = "";
  public SchemeId: number = 0;
  public SchemeName: string = "";
  public PriceCategoryId: number = 0;
  public PriceCategoryName: string = null;//Use this only if required..
  public CreditLimitObj: ISchemeCreditLimit = {
    OpCreditLimit: 0,
    IpCreditLimit: 0,
    GeneralCreditLimit: 0
  };
  public IsDiscountApplicable: boolean = true;
  public DiscountPercent: number = 0;
  public IsDiscountEditable: boolean = false;
  public IsCreditApplicable: boolean = false;
  public IsCreditOnlyScheme: boolean = false;
  public DefaultCreditOrganizationId: number = 0;
  public DefaultPaymentMode: string = ENUM_BillPaymentMode.cash;

  public IsCoPayment: boolean = false;
  public IsValid: boolean = true;
  public ValidationMessage: Array<string> = [];//make this as Object which can pass array of messages.
  public ClaimCode: number = null;
  public SchemeApiIntegrationName: string = "";

  public ServiceItems: Array<ServiceItemDetails_DTO> = [];

  public IsPharmacyRateDifferent: boolean = false;
  public CoPaymentCashPercent: number = 0;
  public CoPaymentCreditPercent: number = 0;
  public IsCreditLimited: boolean = false;
  public IsGeneralCreditLimited: boolean = false;
  public AllowProvisionalBilling: boolean = false;

}
