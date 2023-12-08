import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs-compat";
import { BillingService } from "../../../billing/shared/billing.service";
import { BillingSubScheme_DTO } from "../../../billing/shared/dto/bill-subscheme.dto";
import { PatientScheme_DTO } from "../../../billing/shared/dto/patient-scheme.dto";
import { RegistrationScheme_DTO } from "../../../billing/shared/dto/registration-scheme.dto";
import { SchemeParameters } from "../../../billing/shared/scheme-parameter.model";
import { CoreService } from "../../../core/shared/core.service";
import { SSFEligibility, SsfEmployerCompany } from "../../../insurance/ssf/shared/SSF-Models";
import { SsfDataStatus_DTO, SsfService } from "../../../insurance/ssf/shared/service/ssf.service";
import { BillingScheme_DTO } from "../../../settings-new/billing/shared/dto/billing-scheme.dto";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_DanpheSSFSchemes, ENUM_MessageBox_Status, ENUM_SSF_EligibilityType, ENUM_Scheme_ApiIntegrationNames, ENUM_ServiceBillingContext } from "../../../shared/shared-enums";
import { NewClaimCode_DTO } from "../dto/new-claim-code.dto";
import { PatientMemberInfo_DTO } from "../dto/patient-member-info.dto";
import { MedicareMemberVsMedicareBalanceVM } from "../medicare-model";
import { VisitBLService } from "../visit.bl.service";

@Component({
  selector: "registration-scheme-select",
  templateUrl: "./registration-scheme-select.component.html"
})
export class RegistrationSchemeSelectComponent {

  public currentRegSchemeDto: RegistrationScheme_DTO = new RegistrationScheme_DTO();
  public currentSchemeParams: SchemeParameters = new SchemeParameters();

  public IsPatientMembershipInfoLoaded: boolean = false;
  public SsfEmployer: Array<SsfEmployerCompany> = new Array<SsfEmployerCompany>();
  public SelectedSsfEmployer: SsfEmployerCompany = new SsfEmployerCompany();


  @Input("patient-id")
  currentPatientId: number = 0;

  @Input("selected-scheme-priceCategory")
  selectedSchemePriceCategory: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };

  @Input("service-billing-context")
  public serviceBillingContext: string = ENUM_ServiceBillingContext.OpBilling;

  @Input("policy-no")
  public policyNo: string = "";

  @Output("on-change")
  public regSchemeChangeEmitter: EventEmitter<RegistrationScheme_DTO> = new EventEmitter<RegistrationScheme_DTO>();

  public ssfSubscription: Subscription = new Subscription();


  public currentSchemeId: number = 0;
  public old_SchemeId: number = 0;
  public new_SchemeId: number = 0; //We need these to Check when SchemeChangeEvent is Fired.

  public currentPriceCategoryId: number = 0;
  public old_PriceCategoryId: number = 0;
  public new_PriceCategoryId: number = 0; //We need these to Check when PriceCategoryChangeEvent from Scheme.
  public patientMemberInfo = new PatientMemberInfo_DTO();
  public NewClaimCodeObj = new NewClaimCode_DTO();
  public BillingSubSchemes = new Array<BillingSubScheme_DTO>();
  public SelectedSubScheme = new BillingSubScheme_DTO();
  public DisplaySubSchemeSelection: boolean = false;
  public loading: boolean = false;
  public IsClaimSuccessful: boolean = false;
  public IsSsfEmployerAssigned: boolean = false;
  public FetchSsfDetailLocally: boolean = false;
  public PatientImage: string = null;
  public DisplayMembershipLoadButton: boolean = false;

  constructor(public visitBlService: VisitBLService, public msgBoxService: MessageboxService, public ssfService: SsfService, public coreService: CoreService, public billingService: BillingService) {
    //this.currentRegSchemeDto.SchemeId = 4;//this is default-hardcoded.. need to change this soon..
    this.GetSsfDataAsObservable();
  }

  ngOnChanges() {
    this.billingService.TriggerBillingServiceContextEvent(this.serviceBillingContext);
  }

  ngOnInit() {
    this.currentRegSchemeDto.SchemeId = this.selectedSchemePriceCategory.SchemeId;
    this.currentRegSchemeDto.PriceCategoryId = this.selectedSchemePriceCategory.PriceCategoryId;
  }

  OnSchemeChanged(scheme: BillingScheme_DTO) {
    if (scheme) {
      this.ResetCurrentSchemeObj();
      this.currentRegSchemeDto.MemberNo = null;
      this.currentRegSchemeDto.HasSubScheme = scheme.HasSubScheme;
      this.DisplaySubSchemeSelection = scheme.HasSubScheme;
      this.BillingSubSchemes = scheme.SubSchemes;
      this.currentRegSchemeDto.SubSchemes = scheme.SubSchemes;
      this.old_SchemeId = this.currentRegSchemeDto.SchemeId;
      this.new_SchemeId = scheme.SchemeId;

      if (scheme.IsClaimCodeAutoGenerate) {
        const param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Insurance' && a.ParameterName === 'ClaimCodeAutoGenerateSettings');
        if (param) {
          const paramValue = JSON.parse(param.ParameterValue);
          const schemeId = paramValue ? paramValue.SchemeId : null;
          if (schemeId === scheme.SchemeId && paramValue.EnableAutoGenerate) {
            this.GetLatestClaimCode(scheme.SchemeId);
          }
        }
      }
      if (this.old_SchemeId !== this.new_SchemeId) {
        this.old_PriceCategoryId = this.currentRegSchemeDto.PriceCategoryId;
        this.new_PriceCategoryId = scheme.DefaultPriceCategoryId;
        if (this.old_PriceCategoryId && this.old_PriceCategoryId !== this.new_PriceCategoryId) {

          alert("This will change Price Category as well");
          //Scheme Initialization will again be called from PriceCategoryChanges.. So no need to call here..
          // this.currentPriceCategoryId = this.new_PriceCategoryId;
          this.currentRegSchemeDto.PriceCategoryId = this.new_PriceCategoryId;
          this.selectedSchemePriceCategory.PriceCategoryId = this.new_PriceCategoryId;
          this.new_PriceCategoryId = this.old_PriceCategoryId;
          this.AssignSchemeParametersToCurrentContext(scheme);
          this.AssignSelectedSchemePropertiesToCurrentContext(scheme);

        }
        else {
          this.InitializeNewSchemeSelection(scheme);
        }
      }
      else {
        this.InitializeNewSchemeSelection(scheme);
      }
      if (scheme && scheme.ApiIntegrationName === null || (scheme.ApiIntegrationName && (scheme.ApiIntegrationName !== ENUM_Scheme_ApiIntegrationNames.SSF && scheme.ApiIntegrationName !== ENUM_Scheme_ApiIntegrationNames.Medicare))) {
        this.LoadMemberInformationByScheme(scheme.SchemeId, this.currentPatientId);
      }
      if (scheme && scheme.ApiIntegrationName === ENUM_Scheme_ApiIntegrationNames.SSF) {
        if (this.currentPatientId) {
          this.FetchSsfDetailLocally = true;
          this.DisplayMembershipLoadButton = true;
          this.LoadSSFPatientInformation();
        } else {
          this.IsClaimSuccessful = true;
        }
      }
    }
  }

  GetLatestClaimCode(schemeId: number): void {
    this.visitBlService.GetLatestClaimCodeForAutoGeneratedClaimCodes(schemeId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.NewClaimCodeObj = res.Results;
        if (this.NewClaimCodeObj && !this.NewClaimCodeObj.IsMaxLimitReached) {
          this.currentRegSchemeDto.ClaimCode = this.NewClaimCodeObj.NewClaimCode;
        }
        if (this.NewClaimCodeObj && this.NewClaimCodeObj.IsMaxLimitReached) {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["ClaimCode reached Maximum limit"]);
        }
      } else {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't generate ClaimCode."])
      }
    });
  }
  LoadMemberInformationByScheme(schemeId: number, currentPatientId: number): void {
    this.visitBlService.getMemberInfoByScheme(schemeId, currentPatientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.patientMemberInfo = res.Results;
        if (this.patientMemberInfo) {
          this.currentRegSchemeDto.MemberNo = this.patientMemberInfo.MemberNo;
          if (!this.currentRegSchemeDto.IsClaimCodeAutoGenerate) {
            this.currentRegSchemeDto.ClaimCode = this.patientMemberInfo.LatestClaimCode;
          }
          if (this.currentRegSchemeDto.IsCreditLimited) {
            this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit = this.patientMemberInfo.OpCreditLimit;
            this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit = this.patientMemberInfo.IpCreditLimit;
          }
          if (this.currentRegSchemeDto.IsGeneralCreditLimited) {
            this.currentRegSchemeDto.CreditLimitObj.GeneralCreditLimit = this.patientMemberInfo.GeneralCreditLimit;
            this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit = 0;
            this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit = 0;
          }
          this.currentRegSchemeDto.PatientScheme = this.GetPatientSchemeForCurrentContext(this.patientMemberInfo);
        } else {
          if (this.currentRegSchemeDto.IsGeneralCreditLimited) {
            this.currentRegSchemeDto.PatientScheme.GeneralCreditLimit = this.currentRegSchemeDto.CreditLimitObj.GeneralCreditLimit;
          }
        }
        this.CheckAndProceedToEmit();
      }
    }, err => {
      console.log(err);
    });
  }

  ResetCurrentSchemeObj() {
    this.currentRegSchemeDto.MemberNo = null;
    this.currentRegSchemeDto.ClaimCode = null;
    this.currentRegSchemeDto.CreditLimitObj = {
      OpCreditLimit: 0,
      IpCreditLimit: 0,
      GeneralCreditLimit: 0
    }
  }
  InitializeNewSchemeSelection(scheme: BillingScheme_DTO) {
    this.currentRegSchemeDto = new RegistrationScheme_DTO();
    this.AssignSchemeParametersToCurrentContext(scheme);
    this.AssignSelectedSchemePropertiesToCurrentContext(scheme);
    this.LoadPatientExistingSchemeInfo(scheme);//required to Pre-Load MedicareInformation..
    this.CheckValidationAndEmit();
  }

  //Later this should use PriceCategoryDTO instead of using PriceCategoryModel
  OnPriceCategoryChange(priceCat: PriceCategory) {
    if (priceCat) {
      this.currentRegSchemeDto.PriceCategoryId = priceCat.PriceCategoryId;
    }

    this.CheckValidationAndEmit();
  }

  AssignSelectedSchemePropertiesToCurrentContext(schemeObj: BillingScheme_DTO) {
    if (schemeObj) {
      this.currentRegSchemeDto.SchemeId = schemeObj.SchemeId;
      this.currentRegSchemeDto.SchemeName = schemeObj.SchemeName;
      this.currentRegSchemeDto.IsCoPayment = schemeObj.IsCoPayment;
      this.currentRegSchemeDto.IsCreditApplicable = schemeObj.IsCreditApplicable;
      this.currentRegSchemeDto.IsCreditOnlyScheme = schemeObj.IsCreditOnlyScheme;
      this.currentRegSchemeDto.IsClaimCodeAutoGenerate = schemeObj.IsClaimCodeAutoGenerate;
      this.currentRegSchemeDto.IsDiscountApplicable = schemeObj.IsDiscountApplicable;
      this.currentRegSchemeDto.SchemeApiIntegrationName = schemeObj.ApiIntegrationName;
      this.currentRegSchemeDto.DefaultCreditOrganizationId = schemeObj.DefaultCreditOrganizationId;
      this.currentRegSchemeDto.DefaultPaymentMode = schemeObj.DefaultPaymentMode;
      this.currentRegSchemeDto.PriceCategoryId = schemeObj.DefaultPriceCategoryId;
      this.currentRegSchemeDto.PriceCategoryName = schemeObj.DefaultPriceCategoryName;
      this.currentRegSchemeDto.IsCreditLimited = schemeObj.IsCreditLimited;
      this.currentRegSchemeDto.IsGeneralCreditLimited = schemeObj.IsGeneralCreditLimited;
      this.currentRegSchemeDto.IsMemberNumberCompulsory = schemeObj.IsMemberNumberCompulsory;
      if (schemeObj.IsGeneralCreditLimited) {
        this.currentRegSchemeDto.CreditLimitObj.GeneralCreditLimit = schemeObj.GeneralCreditLimit;
      }
      this.currentRegSchemeDto.PatientScheme = new PatientScheme_DTO();
    }
  }

  AssignSchemeParametersToCurrentContext(scheme: BillingScheme_DTO) {
    this.currentSchemeParams = SchemeParameters.GetSchemeParamSettings(scheme.FieldSettingParamName);
  }

  LoadPatientExistingSchemeInfo(schemeObj: BillingScheme_DTO) {
    if (schemeObj && schemeObj.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare) {
      this.LoadMedicarePatientInformation(this.currentPatientId);
    }
  }

  CheckAndProceedToEmit(): void {
    if (this.currentSchemeParams.EnterMemberNumber || this.currentSchemeParams.EnterClaimCode) {
      if (this.currentRegSchemeDto.MemberNo || this.currentRegSchemeDto.ClaimCode) {
        this.CheckValidationAndEmit();
      }
    }


  }
  OnMemberNumberChange() {
    console.log("Member number changed..");
    this.currentRegSchemeDto.PatientScheme.PolicyNo = this.currentRegSchemeDto.MemberNo;
    this.currentRegSchemeDto.PatientScheme.SchemeId = this.currentRegSchemeDto.SchemeId;
  }

  //! Krishna, 16thMarch'23, Below ids are hardcoded, if needed to change please look for them in html file of this component and change there as well.
  GoToNextElementFromMemberNoElement() {
    if (this.currentSchemeParams.ShowMembershipLoadButton) {
      this.SetFocusById('id_load_memberInfo');
    } else if (this.currentSchemeParams.EnterClaimCode) {
      this.SetFocusById('id_txt_claimCode');
    } else {
      this.SetFocusById('id_emit_button');
    }
  }

  //! Krishna, 16thMarch'23, Below ids are hardcoded, if needed to change please look for them in html file of this component and change there as well.
  GoToNextElementFromClaimCodeNoElement() {
    if (this.currentSchemeParams.ShowMembershipLoadButton) {
      this.SetFocusById('id_load_memberInfo');
    }
  }
  SetFocusById(id: string) {
    let Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 100)
  }

  CheckValidationAndEmit() {
    //Assign default PatientScheme if it's empty in CurrentRegScheme Dto
    if (!this.currentRegSchemeDto.PatientScheme || !this.currentRegSchemeDto.PatientScheme.SchemeId) {
      this.currentRegSchemeDto.PatientScheme = new PatientScheme_DTO();
      this.currentRegSchemeDto.PatientScheme = this.GetPatientSchemeForCurrentContext_Common();
    }
    if (this.currentRegSchemeDto.SchemeId && this.currentRegSchemeDto.SchemeName) {
      this.regSchemeChangeEmitter.emit(this.currentRegSchemeDto);
    }
  }

  LoadMemberInformationClicked() {
    //Load MemberInformation from API as needed then Emit data ..
    console.log("LoadMemberInformationClicked..");
    this.loading = true;
    this.IsPatientMembershipInfoLoaded = false;//this will be set true from the respective APIs.
    if (this.currentRegSchemeDto.SchemeApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.SSF) {
      this.LoadSSFPatientInformation();
    }
    //this.loading = false;
  }
  LoadMedicarePatientInformation(patientId: number): void {
    this.visitBlService.getMedicareMemberDetail(patientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        console.log(res.Results);
        if (res.Results !== null) {
          const medicareMemberDetail: MedicareMemberVsMedicareBalanceVM = res.Results;
          this.currentRegSchemeDto.MemberNo = medicareMemberDetail.MemberNo;
          this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit = medicareMemberDetail.OpBalance;
          this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit = medicareMemberDetail.IpBalance;

          this.currentRegSchemeDto.IsValid = this.Medicare_IsEligibleForOpBilling(medicareMemberDetail);
          if (this.currentRegSchemeDto.IsValid) {
            this.currentRegSchemeDto.PatientScheme = this.Medicare_GetPatientSchemeForCurrentContext(medicareMemberDetail);
          }
          else {
            this.currentRegSchemeDto.ValidationMessage.push("Medicare balance Exceeded. Cannot Proceed for billing");
          }
          //!Krishna, To emit automatically if information is loaded.
          this.CheckValidationAndEmit();
        }
        else {
          console.log("Couldn't Find Medicare Member Detail of Current Patient.");
        }
      }
    }, err => {
      this.msgBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Could not fetch the Medicare Member Detail"]);
    });
  }

  Medicare_IsEligibleForOpBilling(medicareMemberDetail: MedicareMemberVsMedicareBalanceVM): boolean {
    if (medicareMemberDetail && !medicareMemberDetail.IsOpLimitExceeded) {
      return true;
    }
    else {
      return false;
    }
  }

  Medicare_GetPatientSchemeForCurrentContext(medicareMemberDetail: MedicareMemberVsMedicareBalanceVM): PatientScheme_DTO {
    let retObj: PatientScheme_DTO = new PatientScheme_DTO();
    retObj.SchemeId = this.currentRegSchemeDto.SchemeId;
    retObj.PatientCode = medicareMemberDetail.HospitalNo;
    retObj.PatientId = medicareMemberDetail.PatientId;
    retObj.PolicyNo = medicareMemberDetail.MemberNo;
    retObj.OpCreditLimit = medicareMemberDetail.OpBalance;
    retObj.IpCreditLimit = medicareMemberDetail.IpBalance;

    return retObj;
  }

  GetPatientSchemeForCurrentContext(patientMemberInfo: PatientMemberInfo_DTO): PatientScheme_DTO {
    let retObj: PatientScheme_DTO = new PatientScheme_DTO();
    retObj.SchemeId = this.currentRegSchemeDto.SchemeId;
    retObj.PatientId = patientMemberInfo.PatientId;
    retObj.PolicyNo = patientMemberInfo.MemberNo;
    retObj.OpCreditLimit = patientMemberInfo.OpCreditLimit;
    retObj.IpCreditLimit = patientMemberInfo.IpCreditLimit;
    retObj.GeneralCreditLimit = patientMemberInfo.GeneralCreditLimit;

    return retObj;
  }

  public loadFromSSFServer: boolean = false;
  LoadSSFPatientInformation() {

    if ((!this.currentPatientId || this.DisplayMembershipLoadButton) && this.loadFromSSFServer) {
      this.ssfService.GetSsfPatientDetailAndEligibilityFromSsfServer(this.currentRegSchemeDto.MemberNo, this.loadFromSSFServer);
    }
    else {
      this.DisplayMembershipLoadButton = false;
      this.currentRegSchemeDto.MemberNo = this.policyNo;
      this.ssfService.GetSsfPatientDetailAndEligibilityLocally(this.currentPatientId, this.currentRegSchemeDto.SchemeId);
    }
  }

  GetSsfDataAsObservable() {
    this.ssfSubscription = this.ssfService.ReturnSsfData().subscribe(res => {
      let ssfData = new SsfDataStatus_DTO();
      ssfData = res;
      if (ssfData.isPatientInformationLoaded && ssfData.isPatientEligibilityLoaded && ssfData.isEmployerListLoaded) {
        this.IsClaimSuccessful = ssfData.IsClaimSuccessful;
        this.DisplayMembershipLoadButton = this.IsClaimSuccessful;
        if (ssfData.ssfPatientDetail.img !== null) {
          this.PatientImage = `data:image/jpeg;base64,${ssfData.ssfPatientDetail.img}`;
        } else {
          this.PatientImage = null;
        }

        this.AssignSsfPatientData(ssfData);
        this.CheckValidationAndEmit();
        this.loading = false;
        this.FetchSsfDetailLocally = false;
      } else {
        this.DisplayMembershipLoadButton = true;
      }
    });
  }
  SFFEmployerListFormatter(data) {
    return data["name"];
  }

  AssignSSFEmployerDetail(data) {
    if (this.SelectedSsfEmployer) {
      this.currentRegSchemeDto.PatientScheme.PolicyHolderEmployerName = this.SelectedSsfEmployer.name;
      this.currentRegSchemeDto.PatientScheme.PolicyHolderEmployerID = this.SelectedSsfEmployer.E_SSID;
      this.IsSsfEmployerAssigned = true;
      this.CheckValidationAndEmit();
    }
  }

  AssignSsfPatientData(ssfData: SsfDataStatus_DTO) {
    this.SsfEmployer = ssfData.employerList;
    if (!this.currentRegSchemeDto.MemberNo) {
      this.currentRegSchemeDto.MemberNo = ssfData.MemberNo;
    }
    const ssfPatientDetail = ssfData.ssfPatientDetail;
    if (ssfPatientDetail && ssfPatientDetail.FirstName) {
      this.currentRegSchemeDto.ssfPatientDetail = ssfPatientDetail;
    }
    if (!(ssfData.patientEligibility && ssfData.patientEligibility.length)) {
      this.currentRegSchemeDto.IsPatientEligibleForService = false;
      this.DisplayMembershipLoadButton = true;
      this.SsfEmployer = new Array<SsfEmployerCompany>();
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Patient is not eligible for SSF Services. Please check in SSF Portal and try again!`]);
      return;
    } else {
      this.currentRegSchemeDto.IsPatientEligibleForService = true;
    }
    let eligibility = new Array<SSFEligibility>();
    //! Below SSF-Medical is hard coded, need revision
    if (this.currentRegSchemeDto.SchemeName.toLowerCase() === ENUM_DanpheSSFSchemes.Medical.toLowerCase()) {
      eligibility = ssfData.patientEligibility.filter(a => a.SsfEligibilityType.toLowerCase() === ENUM_SSF_EligibilityType.Medical.toLowerCase());
    } else {
      eligibility = ssfData.patientEligibility.filter(a => a.SsfEligibilityType.toLowerCase() === ENUM_SSF_EligibilityType.Accident.toLowerCase());
    }
    if (eligibility && eligibility.length && this.currentRegSchemeDto.SchemeName.toLowerCase() === ENUM_DanpheSSFSchemes.Medical.toLowerCase()) {
      this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit = eligibility[0].OpdBalance;
      this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit = eligibility[0].IPBalance;
      ssfData.RegistrationCase = eligibility[0].SsfEligibilityType;
      this.currentRegSchemeDto.PatientScheme = this.Ssf_GetPatientSchemeForCurrentContext(ssfData);
    } else if (eligibility && eligibility.length && this.currentRegSchemeDto.SchemeName.toLowerCase() !== ENUM_DanpheSSFSchemes.Medical.toLowerCase()) {
      this.currentRegSchemeDto.CreditLimitObj.GeneralCreditLimit = eligibility[0].AccidentBalance;
      ssfData.RegistrationCase = eligibility[0].SsfEligibilityType;
      this.currentRegSchemeDto.PatientScheme = this.Ssf_GetPatientSchemeForCurrentContext(ssfData);
    } else {
      this.currentRegSchemeDto.IsPatientEligibleForService = false;
      this.DisplayMembershipLoadButton = true;
      this.SsfEmployer = new Array<SsfEmployerCompany>();
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Patient is not eligible for SSF Services. Please check in SSF Portal and try again!`]);
      return;
    }


  }

  Ssf_GetPatientSchemeForCurrentContext(ssfData: SsfDataStatus_DTO): PatientScheme_DTO {
    let retObj: PatientScheme_DTO = new PatientScheme_DTO();
    retObj.SchemeId = this.currentRegSchemeDto.SchemeId;
    retObj.PolicyNo = this.currentRegSchemeDto.MemberNo;
    retObj.LatestClaimCode = ssfData.LatestClaimCode;
    this.currentRegSchemeDto.ClaimCode = retObj.LatestClaimCode;
    retObj.OpCreditLimit = this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit;
    retObj.IpCreditLimit = this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit;
    retObj.GeneralCreditLimit = this.currentRegSchemeDto.CreditLimitObj.GeneralCreditLimit;
    retObj.RegistrationCase = ssfData.RegistrationCase;
    retObj.PolicyHolderUID = ssfData.ssfPatientDetail.PolicyHolderUID;
    return retObj;
  }


  GetPatientSchemeForCurrentContext_Common(): PatientScheme_DTO {
    let retObj: PatientScheme_DTO = new PatientScheme_DTO();
    retObj.SchemeId = this.currentRegSchemeDto.SchemeId;
    retObj.PatientCode = null;
    retObj.PatientId = null;
    retObj.LatestClaimCode = this.currentRegSchemeDto.ClaimCode;
    retObj.PolicyNo = this.currentRegSchemeDto.MemberNo;
    retObj.OpCreditLimit = this.currentRegSchemeDto.CreditLimitObj.OpCreditLimit;
    retObj.OpCreditLimit = this.currentRegSchemeDto.CreditLimitObj.IpCreditLimit;
    return retObj;
  }


  ngOnDestroy() {
    this.ssfSubscription.unsubscribe();
  }

  SubSchemeListFormatter(data) {
    return data["SubSchemeName"];
  }

  AssignSelectedSubScheme($event: BillingSubScheme_DTO): void {
    if ($event && $event.SubSchemeId) {
      this.currentRegSchemeDto.HasSubScheme = true;
      this.currentRegSchemeDto.SubSchemeId = $event.SubSchemeId;
      this.CheckValidationAndEmit();
    }
  }
}




