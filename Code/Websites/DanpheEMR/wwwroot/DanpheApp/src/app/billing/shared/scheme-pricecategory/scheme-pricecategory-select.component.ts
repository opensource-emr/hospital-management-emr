import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { BillingScheme_DTO } from "../../../settings-new/billing/shared/dto/billing-scheme.dto";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { ENUM_ModuleName, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { BillingService } from "../billing.service";
import { SchemePriceCategory_DTO } from "../dto/scheme-pricecategory.dto";


@Component({
  selector: "scheme-pricecategory-select",
  templateUrl: "./scheme-pricecategory-select.component.html"
})
export class SchemePriceCategorySelectComponent {

  @Input("service-billing-context")
  serviceBillingContext: string = "";

  @Input("selected-scheme-priceCategory")
  selectedSchemePriceCategory: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  @Input("disable-selection")
  disableSelection: boolean = false;

  @Input("module-name")
  public moduleName: string = "Billing";
  @Input("show-priceCategory-selection")
  public ShowPriceCategorySelection: boolean = true;

  @Output("on-change")
  public schemePriceCategoryEmitter: EventEmitter<SchemePriceCategory_DTO> = new EventEmitter<SchemePriceCategory_DTO>();

  public currentSchemePriceCatDto: SchemePriceCategory_DTO = new SchemePriceCategory_DTO();
  public trackOldAndNewSchemePriceCategory = {
    old_PriceCategoryId: 0,
    new_PriceCategoryId: 0,
    old_schemeId: 0,
    new_schemeId: 0
  } //!Krishna, 2ndApril'23, This object will track the PriceCategory and Scheme Change Event

  public SchemeList = new Array<BillingScheme_DTO>();
  public ServiceBillingContext: string = "";

  constructor(public coreService: CoreService, private billingService: BillingService) {
    this.SchemeList = this.coreService.SchemeList;
  }
  ngOnChanges(): void {
    if (this.moduleName === ENUM_ModuleName.Pharmacy && this.selectedSchemePriceCategory && !this.selectedSchemePriceCategory.SchemeId && !this.selectedSchemePriceCategory.PriceCategoryId) {
      const systemDefaultScheme = this.SchemeList ? this.SchemeList.find(a => a.IsSystemDefault) : null;
      this.selectedSchemePriceCategory = systemDefaultScheme ? { SchemeId: systemDefaultScheme.SchemeId, PriceCategoryId: systemDefaultScheme.DefaultPriceCategoryId } : { SchemeId: 0, PriceCategoryId: 0 }
      this.selectedSchemePriceCategory.SchemeId = systemDefaultScheme ? systemDefaultScheme.SchemeId : 0;
      this.selectedSchemePriceCategory.PriceCategoryId = systemDefaultScheme ? systemDefaultScheme.DefaultPriceCategoryId : 0;
    }
    this.billingService.TriggerBillingServiceContextEvent(this.serviceBillingContext);
  }

  ngOnInit() {
    this.currentSchemePriceCatDto.SchemeId = this.selectedSchemePriceCategory.SchemeId;
    this.currentSchemePriceCatDto.PriceCategoryId = this.selectedSchemePriceCategory.PriceCategoryId;
    //this.trackOldAndNewSchemePriceCategory.old_schemeId = this.currentSchemePriceCatDto.SchemeId;

    if (!this.serviceBillingContext) {
      this.serviceBillingContext = ENUM_ServiceBillingContext.OpBilling;//default is op billing.
    }
  }
  OnSchemeChanged(scheme: BillingScheme_DTO) {
    if (scheme) {
      this.trackOldAndNewSchemePriceCategory.old_schemeId = this.currentSchemePriceCatDto.SchemeId;
      this.trackOldAndNewSchemePriceCategory.new_schemeId = scheme.SchemeId;
      this.currentSchemePriceCatDto.SchemeId = scheme.SchemeId;
      this.selectedSchemePriceCategory.SchemeId = scheme.SchemeId;
      this.currentSchemePriceCatDto.SchemeName = scheme.SchemeName;
      this.currentSchemePriceCatDto.DefaultCreditOrganizationId = scheme.DefaultCreditOrganizationId;
      this.currentSchemePriceCatDto.DefaultPaymentMode = scheme.DefaultPaymentMode;
      this.currentSchemePriceCatDto.SchemeApiIntegrationName = scheme.ApiIntegrationName;
      this.currentSchemePriceCatDto.ServiceBillingContext = this.ServiceBillingContext;
      this.currentSchemePriceCatDto.PriceCategoryName = scheme.DefaultPriceCategoryName;
      this.currentSchemePriceCatDto.IsCreditApplicable = scheme.IsCreditApplicable;
      this.currentSchemePriceCatDto.IsCreditOnlyScheme = scheme.IsCreditOnlyScheme;
      this.currentSchemePriceCatDto.IsCoPayment = scheme.IsCoPayment;
      this.currentSchemePriceCatDto.IsDiscountApplicable = scheme.IsDiscountApplicable;
      this.currentSchemePriceCatDto.DiscountPercent = scheme.DiscountPercent;
      this.currentSchemePriceCatDto.IsDiscountEditable = scheme.IsDiscountEditable;
      this.currentSchemePriceCatDto.CoPaymentCashPercent = scheme.CoPaymentCashPercent;
      this.currentSchemePriceCatDto.CoPaymentCreditPercent = scheme.CoPaymentCreditPercent;
      this.currentSchemePriceCatDto.IsCreditLimited = scheme.IsCreditLimited;
      this.currentSchemePriceCatDto.IsGeneralCreditLimited = scheme.IsGeneralCreditLimited;
      this.currentSchemePriceCatDto.SchemeApiIntegrationName = scheme.ApiIntegrationName;
      this.currentSchemePriceCatDto.AllowProvisionalBilling = scheme.AllowProvisionalBilling;
      if (this.trackOldAndNewSchemePriceCategory.old_schemeId !== this.trackOldAndNewSchemePriceCategory.new_schemeId) {

        this.trackOldAndNewSchemePriceCategory.old_PriceCategoryId = this.currentSchemePriceCatDto.PriceCategoryId;
        this.trackOldAndNewSchemePriceCategory.new_PriceCategoryId = scheme.DefaultPriceCategoryId;

        if (this.trackOldAndNewSchemePriceCategory.old_PriceCategoryId !== this.trackOldAndNewSchemePriceCategory.new_PriceCategoryId) {
          alert("This will Change the Price Category as well.");
          //We need to Reload the ServiceItems if New PriceCategoryId is different than Old PriceCategoryId.
          this.currentSchemePriceCatDto.PriceCategoryId = this.trackOldAndNewSchemePriceCategory.new_PriceCategoryId;
          this.selectedSchemePriceCategory.PriceCategoryId = this.trackOldAndNewSchemePriceCategory.new_PriceCategoryId;
          this.trackOldAndNewSchemePriceCategory.old_PriceCategoryId = this.trackOldAndNewSchemePriceCategory.new_PriceCategoryId;
        }
        else {
          this.CheckValidationAndEmit();
        }
      } else {
        this.CheckValidationAndEmit();
      }
    }
  }

  //Later this should use PriceCategoryDTO instead of using PriceCategoryModel
  OnPriceCategoryChange(priceCat: PriceCategory) {
    if (priceCat) {
      this.currentSchemePriceCatDto.PriceCategoryId = priceCat.PriceCategoryId;
      this.currentSchemePriceCatDto.IsPharmacyRateDifferent = priceCat.IsPharmacyRateDifferent;
    }

    this.CheckValidationAndEmit();
  }


  CheckValidationAndEmit() {
    if (this.currentSchemePriceCatDto.SchemeId && this.currentSchemePriceCatDto.SchemeName) {
      this.schemePriceCategoryEmitter.emit(this.currentSchemePriceCatDto);
    }
  }
}
