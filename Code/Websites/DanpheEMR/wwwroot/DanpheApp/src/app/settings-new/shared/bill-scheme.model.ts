import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BillingSubSchemeModel } from "../../billing/shared/bill-sub-scheme.model";

export class BillingSchemeModel {
  public SchemeId: number = 0;
  public SchemeCode: string = null;
  public SchemeName: string = null;
  public Description: string = null;
  public CommunityName: string = null;
  public ValidFromDate: string = null;
  public ValidToDate: string = null;
  public IsMembershipApplicable: boolean = false;
  public IsMemberNumberCompulsory: boolean = false;
  public DefaultPaymentMode: string = null;
  public IsCreditApplicable: boolean = false;
  public IsCreditOnlyScheme: boolean = false;
  public IsCreditLimitedInCreditSetting: boolean = false;
  public IsOpCreditLimited: boolean = false;
  public IsIpCreditLimited: boolean = false;
  public IsGeneralCreditLimited: boolean = false;
  public GeneralCreditLimit: number = 0;
  public OpCreditLimit: number = 0;
  public IpCreditLimit: number = 0;
  public IsRegistrationCreditApplicable: boolean = false;
  public IsOpBillCreditApplicable: boolean = false;
  public IsIpBillCreditApplicable: boolean = false;
  public IsAdmissionCreditApplicable: boolean = false;
  public IsOpPhrmCreditApplicable: boolean = false;
  public IsIpPhrmCreditApplicable: boolean = false;
  public IsVisitCompulsoryInBilling: boolean = false;
  public IsVisitCompulsoryInPharmacy: boolean = false;
  public IsBillingCoPayment: boolean = false;
  public IsPharmacyCoPayment: boolean = false;
  public BillCoPayCashPercent: number = 0;
  public BillCoPayCreditPercent: number = 0;
  public PharmacyCoPayCashPercent: number = 0;
  public PharmacyCoPayCreditPercent: number = 0;
  public IsDiscountApplicable: boolean = false;
  public DiscountPercent: number = 0;
  public IsDiscountEditable: boolean = false;
  public IsRegDiscountApplicable: boolean = false;
  public RegDiscountPercent: number = 0;
  public IsRegDiscountEditable: boolean = false;
  public IsOpBillDiscountApplicable: boolean = false;
  public OpBillDiscountPercent: number = 0;
  public IsOpBillDiscountEditable: boolean = false;
  public IsIpBillDiscountApplicable: boolean = false;
  public IpBillDiscountPercent: number = 0;
  public IsIpBillDiscountEditable: boolean = false;
  public IsAdmissionDiscountApplicable: boolean = false;
  public AdmissionDiscountPercent: number = 0;
  public IsAdmissionDiscountEditable: boolean = false;
  public IsOpPhrmDiscountApplicable: boolean = false;
  public OpPhrmDiscountPercent: number = 0;
  public IsOpPhrmDiscountEditable: boolean = false;
  public IsIpPhrmDiscountApplicable: boolean = false;
  public IpPhrmDiscountPercent: number = 0;
  public IsIpPhrmDiscountEditable: boolean = false;
  public DefaultCreditOrganizationId: number = 0;
  public DefaultPriceCategoryId: number = 0;
  //sud:14Mar'23--mention API IntegrationName to Get MembershipInfo for current scheme. eg: SSF, Medicare, etc./ Default Null
  public ApiIntegrationName: string = null;
  //sud:14Mar'23--This is needed to get fieldsDisplaySettingsName for current scheme. eg: ShowHideMembershipNo, ShowHideClaimCode, etc..
  public FieldSettingParamName: string = null;
  public IsCopaymentApplicable: boolean = false;
  public HasSubScheme: boolean = false;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public IsSystemDefault: boolean = false;
  public RegStickerGroupCode: string = null;
  public SchemeValidator: FormGroup = null;
  public AllowProvisionalBilling: boolean = false;
  public BillingSubSchemes: Array<BillingSubSchemeModel> = new Array<BillingSubSchemeModel>();

  constructor() {
    const _formBuilder = new FormBuilder();
    this.SchemeValidator = _formBuilder.group({
      SchemeName: ["", Validators.compose([Validators.required])],
      SchemeCode: ["", Validators.compose([Validators.required])],
      CommunityName: ["", Validators.compose([Validators.required])],
      // 'ValidFromDate': ['', Validators.compose([Validators.required])],
      // 'ValidToDate': ['', Validators.compose([Validators.required])],
      // 'DefaultPaymentMode': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.SchemeValidator.dirty;
    } else {
      return this.SchemeValidator.controls[fieldName].dirty;
    }
  }
  //   public IsDirty(fieldName): boolean {
  //     if (fieldName == undefined) {
  //       return this.PriceValidator.dirty;
  //     }

  public IsValid(): boolean {
    if (this.SchemeValidator.valid) {
      return true;
    } else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.SchemeValidator.valid;
    } else {
      return !this.SchemeValidator.hasError(validator, fieldName);
    }
  }
}
