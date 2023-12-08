import { SsfPatient_DTO } from "../../../insurance/ssf/shared/service/ssf.service";
import { ENUM_BillPaymentMode } from "../../../shared/shared-enums";
import { BillingSubScheme_DTO } from "./bill-subscheme.dto";
import { PatientScheme_DTO } from "./patient-scheme.dto";

export class RegistrationScheme_DTO {
  public SchemeId: number = 0;
  public SchemeName: string = null;
  public PriceCategoryId: number = 0;
  public PriceCategoryName: string = null;
  public MemberNo: string = null;
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
  public IsClaimCodeAutoGenerate: boolean = false;
  public DefaultCreditOrganizationId: number = 0;
  public DefaultPaymentMode: string = ENUM_BillPaymentMode.cash;
  public IsCoPayment: boolean = false;
  public IsValid: boolean = true;
  public ValidationMessage: Array<string> = [];//make this as Object which can pass array of messages.
  public EmployerName: string = "";
  public ClaimCode: number = null;

  public SchemeApiIntegrationName: string = "";

  public PatientInformationFromAPI: object = null;//change this to Common DTO..
  public EmployerListFromAPI: object = null;//need to change this DataType to proper DTO.
  public IsCreditLimited: boolean = false;
  public IsGeneralCreditLimited: boolean = false;

  public PatientScheme: PatientScheme_DTO = new PatientScheme_DTO();
  public ssfPatientDetail: SsfPatient_DTO = new SsfPatient_DTO();
  public HasSubScheme: boolean = false;
  public SubSchemes = new Array<BillingSubScheme_DTO>();
  public SubSchemeId: number = null;
  public IsMemberNumberCompulsory: boolean = false;
  public IsPatientEligibleForService: boolean = true;
}
