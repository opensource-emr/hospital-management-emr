import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from '@angular/router';

import { BillingService } from '../../../billing/shared/billing.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ADT_BLService } from '../../shared/adt.bl.service';

import { BillingDeposit } from '../../../billing/shared/billing-deposit.model';
import { BillingTransactionItem } from '../../../billing/shared/billing-transaction-item.model';
import { AdmissionModel } from '../../shared/admission.model';
import { Bed } from '../../shared/bed.model';
import { BedFeature } from '../../shared/bedfeature.model';
import { PatientBedInfo } from '../../shared/patient-bed-info.model';
import { Ward } from '../../shared/ward.model';

import * as moment from 'moment/moment';
import { PatientLatestVisitContext_DTO } from "../../../appointments/shared/dto/patient-lastvisit-context.dto";
import { QuickVisitVM } from "../../../appointments/shared/quick-visit-view.model";
import { VisitBLService } from "../../../appointments/shared/visit.bl.service";
import { Visit } from "../../../appointments/shared/visit.model";
import { BillingInvoiceBlService } from "../../../billing/shared/billing-invoice.bl.service";
import { BillingTransaction, EmployeeCashTransaction } from "../../../billing/shared/billing-transaction.model";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";
import { PatientScheme_DTO } from "../../../billing/shared/dto/patient-scheme.dto";
import { RegistrationScheme_DTO } from "../../../billing/shared/dto/registration-scheme.dto";
import { InsuranceVM } from "../../../billing/shared/patient-billing-context-vm";
import { PatientScheme } from "../../../billing/shared/patient-map-scheme";
import { CoreService } from "../../../core/shared/core.service";
import { SSFEligibility, SsfEmployerCompany } from "../../../insurance/ssf/shared/SSF-Models";
import { Patient } from "../../../patients/shared/patient.model";
import { BillingSchemeModel } from "../../../settings-new/shared/bill-scheme.model";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonValidators } from "../../../shared/common-validator";
import { CommonFunctions } from '../../../shared/common.functions';
import { ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_BillingType, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_IntegrationNames, ENUM_MessageBox_Status, ENUM_PriceCategory, ENUM_RegistrationSubCases, ENUM_SSF_EligibilityType, ENUM_ServiceBillingContext, ENUM_ValidatorTypes, ENUM_VisitType } from "../../../shared/shared-enums";
import { AdmissionSlipDetails_DTO } from "../../shared/DTOs/admission-slip-details.dto";
import { AdtAutoBillingItem_DTO } from "../../shared/DTOs/adt-auto-billingItems.dto";
import { AdtBedFeatureSchemePriceCategoryMap_DTO } from "../../shared/DTOs/adt-bedfeature-scheme-pricecategory-map.dto";
import { AdtDepositSetting_DTO } from "../../shared/DTOs/adt-deposit-settings.dto";
import { AdmissionMasterBlService } from "../../shared/admission-master.bl.service";
import { BedReservationInfo } from "../../shared/bed-reservation-info.model";


@Component({
  templateUrl: "./admission-create.html",
  styleUrls: ['./admission-create.component.css'],
  styles: [`.inl-blk, danphe-date-picker{display: inline-block;} .flx{display: flex;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class AdmissionCreateComponent {

  public CurrentAdmission: AdmissionModel = new AdmissionModel();
  public CurrentPatientBedInfo: PatientBedInfo = new PatientBedInfo();
  public CurrentDeposit: BillingDeposit = new BillingDeposit();
  public bedList: Array<Bed> = new Array<Bed>();
  public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
  public billTxnItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public bedBilItem: BillingTransactionItem = new BillingTransactionItem();

  public providersPath: string = "/api/Master/Employees?name=:keywords";
  // public selectedProvider: any;
  public selectedPerformer: any; // Krishna, 16th,jun'22, selectedPerformer changed to selectedPerformer
  public selectedDept: any;
  public doctorList: any = [];
  public deptList: any = [];
  public filteredDocList: any = [];

  public showmsgbox: boolean = false;
  public status: string = null;
  public message: string = null;

  public loading: boolean = false;
  public disableFeature: boolean = true;
  public disableBed: boolean = true;

  //public nepaliDateClass: NepaliDate;
  public admitDateNP: NepaliDate;
  public patientVisitId: number = null;
  public patientId: number = null;
  public showSticker: boolean = false;
  //public currencyUnit: string;
  public showDepositReceipt: boolean = false;
  public showBillingReceipt: boolean = false;

  public CareofPersonNumberMandatory: boolean = true;
  public AdmittingDoctorMandatory: boolean = true;

  public showReqDeptWarning: boolean = false;//sud:19Jun'18
  public loadPage: boolean = false;
  public wardList: Array<Ward> = new Array<Ward>();
  public showDepositTransferMessage: boolean = false; //yubraj: 7th Jan '19

  public CurrentBedReservation: BedReservationInfo = new BedReservationInfo();
  public reservedBedIdByPat: number = null;

  public admDate: string = null;
  public BillingTransaction: BillingTransaction = new BillingTransaction();
  public Insurance: InsuranceVM;
  public isGovInsuranceAdmission: boolean = false;
  public showInsuranceCheckBox: boolean = false;
  public quickVisit: QuickVisitVM = new QuickVisitVM();
  public prevVisitList: Array<Visit> = new Array<Visit>();
  public AdmissionCases = [];
  public isPatientInfoLoaded: boolean = false;
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };

  public admissionSettings: any;
  public additionalBillingItemsInAdt: Array<any> = new Array<any>();

  public autoAddedBillingItem: Array<any> = new Array<any>();
  public notAutoAddedBillingItem: Array<any> = new Array<any>();
  public AdditionBillItemList: Array<any> = new Array<any>();
  public DefaultBillItemList: Array<any> = new Array<any>();
  public disableDiscountField: boolean = false;

  public selectedBillingRowData: Array<any> = [];
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;
  public showPrintPopUp: boolean = false;

  public showAdmSticker: boolean = false;
  public showInvoice: boolean = false;
  public showWristBand: boolean = false;
  public printInvoice: boolean = false;
  public claimCodeType: string = "old";

  PaymentPages: any[];
  public TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  MstPaymentModes: any[];
  public membershipTypeList: Array<BillingSchemeModel> = new Array<BillingSchemeModel>();
  SSFPriceCategoryName: ENUM_PriceCategory.SSF;
  public SelectedSSFCompany: any; //! Making this any as we don't know what kind of data it will receive.
  isNewPatient = false;
  tempMembershipTypeId: number = 0;
  public SchemePriceCategoryFromVisit: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public PatientLastVisitContext = new PatientLatestVisitContext_DTO();
  public showAdmissionSlip: boolean = false;
  public admissionSlipDetails: AdmissionSlipDetails_DTO = new AdmissionSlipDetails_DTO();
  public serviceBillingContext: string = ENUM_ServiceBillingContext.IpBilling;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Save Admission ?";
  public AdtAutoBillingItems = new Array<AdtAutoBillingItem_DTO>();
  public AdtDepositSettings = new Array<AdtDepositSetting_DTO>();
  public AdtBedFeatureSchemePriceCategoryMap = new Array<AdtBedFeatureSchemePriceCategoryMap_DTO>();
  public OriginalBedFeatureList = new Array<BedFeature>();
  public DisplaySchemePriceCategorySelection: boolean = false;
  public PolicyNo: string = "";
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    public npCalendarService: NepaliCalendarService,
    public admissionBLService: ADT_BLService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService,
    public callbackservice: CallbackService,
    public billingBlService: BillingBLService,
    public router: Router,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public visitBLService: VisitBLService,
    private _admissionMasterBlService: AdmissionMasterBlService,
    private _billingInvoiceBlService: BillingInvoiceBlService) {
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();

    this.patientId = this.patientService.getGlobal().PatientId;
    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/ADTMain/AdmissionSearchPatient';
    }
    else {
      this.CareofPersonNumberMandatory = this.coreService.IsCareofPersonNoInAdmCreateMandatory();
      this.AdmittingDoctorMandatory = this.coreService.IsAdmittingDoctorInAdmCreateMandatory();
      this.membershipTypeList = this.coreService.AllMembershipTypes;
      this.Initialize();
      this.LoadParameters();
      this.LoadMembershipSettings();
      this.GetPatientDeposit();
      this.GetDocDptAndWardList();
      this.AdmissionCases = this.coreService.GetAdmissionCases();

      this.admissionSettings = this.coreService.GetNewAdmissionSettings(this.patientService.getGlobal().Ins_HasInsurance ? "Insurance" : "Billing");
      // if (!this.admissionSettings.IsDiscountSchemeEnabled) { this.CurrentAdmission.DiscountSchemeId = null; }

      // if (this.admissionSettings && this.admissionSettings.IsBillingEnabled) {
      //   this.additionalBillingItemsInAdt = this.coreService.GetAdditionalBillItemsInAdmission();
      //   this.LoadAllBillingItems();
      // }
    }



  }
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {

    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    this.SSFPriceCategoryName = ENUM_PriceCategory.SSF;
    //this.CurrentAdmission.IsPoliceCase = this.patientService.getGlobal().IsPoliceCase;
    //console.log(this.CurrentAdmission.IsPoliceCase);
    this.isPatientInfoLoaded = true;
    if (this.CareofPersonNumberMandatory) {
      CommonValidators.ComposeValidators(this.CurrentAdmission.AdmissionValidator, "CareOfPersonPhoneNo", [ENUM_ValidatorTypes.phoneNumber, ENUM_ValidatorTypes.required]);
    }
    else {
      CommonValidators.ComposeValidators(this.CurrentAdmission.AdmissionValidator, "CareOfPersonPhoneNo", [ENUM_ValidatorTypes.phoneNumber]);
    }

    if (!this.AdmittingDoctorMandatory) {
      this.CurrentAdmission.AdmissionValidator.controls["AdmittingDoctorId"].clearValidators();
    }

    let val = this.coreService.Parameters.find(p => p.ParameterGroupName === 'ADT' && p.ParameterName === 'AdmissionPrintSettings').ParameterValue;
    let param = JSON.parse(val);
    if (param) {
      this.showAdmSticker = param.ShowStickerPrint;
      this.showSticker = this.showAdmSticker;
      this.showInvoice = param.ShowInvoicePrint;
      this.showWristBand = param.ShowWristBandPrint;
      this.showAdmissionSlip = param.ShowAdmissionSlipPrint;
      if (param.DefaultFocus.toLowerCase() == "invoice") {
        this.printInvoice = true;
      }
    }
    this.CurrentAdmission.BillingTransaction.Remarks = this.isGovInsuranceAdmission ? "Government Insurance" : "";
  }

  // public LoadAllBillingItems() {
  //   let srvIdList = this.additionalBillingItemsInAdt.map(a => a.ServiceDeptId);
  //   let itemIdList = this.additionalBillingItemsInAdt.map(a => a.ItemId);

  //   if ((this.billingService.adtAdditionalBillItms && this.billingService.adtAdditionalBillItms.length)) {
  //     this.SetAutoAddedAndNotAddedBillingItems();
  //   }
  //   else {
  //     this.admissionBLService.GetBillItemList(srvIdList, itemIdList)
  //       .subscribe((res) => {
  //         if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //           if (res.Results && res.Results.length) {
  //             let items = [];
  //             this.additionalBillingItemsInAdt.forEach(v => {
  //               let dt = res.Results.find(r => (r.ServiceDepartmentId == v.ServiceDeptId) && (r.ItemId == v.ItemId));
  //               if (dt) {
  //                 if (v.AutoAdd) {
  //                   dt["IsAutoAdded"] = true;
  //                 } else {
  //                   dt["IsAutoAdded"] = false;
  //                 }
  //                 items.push(dt);
  //               }
  //             });
  //             this.billingService.SetAdtAdditionalBillItms(items);
  //             this.SetAutoAddedAndNotAddedBillingItems();
  //           }
  //         }
  //         else {
  //           console.log("Couldn't load bill item prices. (appointment-main)");
  //         }
  //       });
  //   }
  // }

  // public SetAutoAddedAndNotAddedBillingItems() {
  //   this.autoAddedBillingItem = this.billingService.adtAdditionalBillItms.filter(d => d["IsAutoAdded"] == true)
  //   this.notAutoAddedBillingItem = this.billingService.adtAdditionalBillItms.filter(d => d["IsAutoAdded"] == false);

  //   this.autoAddedBillingItem.forEach((d, i) => {
  //     this.DefaultBillItemList.push(Object.assign(new BillingTransactionItem(), d));
  //     this.DefaultBillItemList[i].IsTaxApplicable = d.TaxApplicable;
  //   });

  //   this.Calculation();
  // }

  ItemNameListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  public ItemChange(indx: number) {
    let selectedItem = this.selectedBillingRowData[indx];
    if (selectedItem && typeof (selectedItem) === "object") {
      var additionalItemObj = this.notAutoAddedBillingItem.find(a => a.ItemId == selectedItem.ItemId && a.ServiceDepartmentId == selectedItem.ServiceDepartmentId);
      if (additionalItemObj) {
        if (this.AdditionBillItemList.some(a => a.ItemId == additionalItemObj.ItemId && a.ItemName == additionalItemObj.ItemName) ? true : false) {
          this.msgBoxServ.showMessage('Warning', ["Duplicate Additional bill Item"]);
        }
        else {
          this.AdditionBillItemList[indx].ServiceDepartmentId = additionalItemObj.ServiceDepartmentId;
          this.AdditionBillItemList[indx].ServiceDepartmentName = additionalItemObj.ServiceDepartmentName;
          this.AdditionBillItemList[indx].ItemId = additionalItemObj.ItemId;
          this.AdditionBillItemList[indx].ItemName = additionalItemObj.ItemName;
          this.AdditionBillItemList[indx].Price = this.CurrentAdmission.Ins_HasInsurance ? additionalItemObj.GovtInsurancePrice : additionalItemObj.Price;
          this.AdditionBillItemList[indx].DiscountApplicable = additionalItemObj.DiscountApplicable;
          this.AdditionBillItemList[indx].IsTaxApplicable = additionalItemObj.TaxApplicable;
        }
      }
    } else {
      this.AdditionBillItemList[indx].ServiceDepartmentId = null;
      this.AdditionBillItemList[indx].ServiceDepartmentName = null;
      this.AdditionBillItemList[indx].ItemId = null;
      this.AdditionBillItemList[indx].ItemName = null;
      this.AdditionBillItemList[indx].Price = 0;
      this.AdditionBillItemList[indx].TotalAmount = 0;
      this.AdditionBillItemList[indx].DiscountAmount = 0;
    }
    this.Calculation();
  }

  public Calculation() {
    this.CurrentAdmission.BillingTransaction.DiscountAmount = 0;
    this.CurrentAdmission.BillingTransaction.TaxTotal = 0;
    this.CurrentAdmission.BillingTransaction.TaxableAmount = 0;
    this.CurrentAdmission.BillingTransaction.NonTaxableAmount = 0;
    this.CurrentAdmission.BillingTransaction.SubTotal = 0;
    this.CurrentAdmission.BillingTransaction.TotalAmount = 0;
    this.CurrentAdmission.BillingTransaction.Tender = 0;
    this.CurrentAdmission.BillingTransaction.TotalQuantity = 0;



    if (this.CurrentAdmission.BillingTransaction.DiscountPercent === null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
      this.CurrentAdmission.BillingTransaction.DiscountPercent = 0;
    }

    //for not auto added billing items
    this.AdditionBillItemList.forEach(billTxnItem => {
      if (billTxnItem.ItemId) {
        this.CurrentAdmission.BillingTransaction.TotalQuantity +=
          billTxnItem.Quantity = 1;

        billTxnItem.DiscountAmount = CommonFunctions.parseAmount((billTxnItem.Price * this.CurrentAdmission.BillingTransaction.DiscountPercent) / 100);

        if (billTxnItem.IsTaxApplicable) {
          this.CurrentAdmission.BillingTransaction.TaxTotal +=
            billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.Price - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
          this.CurrentAdmission.BillingTransaction.TaxableAmount +=
            billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        else {
          this.CurrentAdmission.BillingTransaction.NonTaxableAmount +=
            billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }

        this.CurrentAdmission.BillingTransaction.SubTotal +=
          billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.Price);
        this.CurrentAdmission.BillingTransaction.DiscountAmount = CommonFunctions.parseAmount(billTxnItem.DiscountAmount);
        this.CurrentAdmission.BillingTransaction.TotalAmount +=
          billTxnItem.TotalAmount = CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount + billTxnItem.Tax);
      }
    });

    //for auto added billing items
    this.DefaultBillItemList.forEach(billTxnItem => {
      if (billTxnItem.ItemId) {
        this.CurrentAdmission.BillingTransaction.TotalQuantity +=
          billTxnItem.Quantity = 1;

        billTxnItem.DiscountAmount = CommonFunctions.parseAmount((billTxnItem.Price * this.CurrentAdmission.BillingTransaction.DiscountPercent) / 100);

        if (billTxnItem.IsTaxApplicable) {
          this.CurrentAdmission.BillingTransaction.TaxTotal +=
            billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.Price - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
          this.CurrentAdmission.BillingTransaction.TaxableAmount +=
            billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        else {
          this.CurrentAdmission.BillingTransaction.NonTaxableAmount +=
            billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }

        this.CurrentAdmission.BillingTransaction.SubTotal +=
          billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.Price);
        this.CurrentAdmission.BillingTransaction.DiscountAmount = CommonFunctions.parseAmount(billTxnItem.DiscountAmount);
        this.CurrentAdmission.BillingTransaction.TotalAmount +=
          billTxnItem.TotalAmount = CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount + billTxnItem.Tax);
      }
    });

    this.CurrentAdmission.BillingTransaction.Tender = CommonFunctions.parseAmount(this.CurrentAdmission.BillingTransaction.TotalAmount);
  }

  public AddNewBillingRow() {
    let newRow: BillingTransactionItem = new BillingTransactionItem();
    newRow.DiscountApplicable = false;
    newRow.ItemId = 0;
    newRow.ItemName = '';
    newRow.ServiceDepartmentId = 0;
    newRow.IsTaxApplicable = false;
    this.AdditionBillItemList.push(newRow);
    this.selectedBillingRowData.push(newRow);
  }

  public RemoveBillingRow(i: number) {
    this.AdditionBillItemList.splice(i, 1).slice();
    this.selectedBillingRowData.splice(i, 1).slice();
  }


  public Initialize() {
    // this.CurrentAdmission.AdmissionDate = moment().format('YYYY-MM-DDTHH:mm:ss');
    this.CurrentAdmission.AdmissionDate = moment().format('YYYY-MM-DDTHH:mm');
    this.CurrentAdmission.PatientId = this.patientService.getGlobal().PatientId;
    this.PolicyNo = this.patientService.getGlobal().PolicyNo;
    this.GetPatientLastVisitContext(this.CurrentAdmission.PatientId); //* Krishna, 13thApril'23, This method is responsible to fetch the latest VisitContext of a given  Patient.
    // let defaultMembershipType;
    // if (this.membershipTypeList && this.membershipTypeList.length > 0) {
    //   defaultMembershipType = this.membershipTypeList.find(a => a.SchemeName.toLowerCase() === "general");
    // }
    // if (this.patientService.getGlobal().MembershipTypeId) {
    //   this.CurrentAdmission.DiscountSchemeId = this.patientService.getGlobal().MembershipTypeId; // setting MembershipTypeId from the Previous Visit
    //   this.tempMembershipTypeId = this.CurrentAdmission.DiscountSchemeId; // setting this as a temporary to avoid multiple callbacks with General membershipType
    // } else {
    // this.CurrentAdmission.DiscountSchemeId = defaultMembershipType ? defaultMembershipType.MembershipTypeId : 4; //Hardcoded 4 is assigned here incase General is not found in the list;
    // this.tempMembershipTypeId = this.CurrentAdmission.DiscountSchemeId; // setting this as a temporary to avoid multiple callbacks with General membershipType

    // }
    this.CurrentPatientBedInfo.PatientId = this.patientService.getGlobal().PatientId;
    //CreatedBy would always be employeeid--sudarshan
    this.CurrentAdmission.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.CurrentPatientBedInfo.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //this.CurrentAdmission.UpdateDischargeValidator(false);
    //clear validators at the time of initialization.
    CommonValidators.ComposeValidators(this.CurrentAdmission.AdmissionValidator, 'DischargeRemarks', []);//sud:18Feb'20-Reused CommonValidator functions.
    //this.currencyUnit = this.billingService.currencyUnit;
    //initializing deposit model --ramavtar
    this.CurrentDeposit = new BillingDeposit();
    this.CurrentDeposit.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.CurrentDeposit.TransactionType = "Deposit";
    this.CurrentDeposit.PatientId = this.patientService.getGlobal().PatientId;
    this.CurrentDeposit.PaymentMode = 'cash';
    this.CurrentDeposit.PatientName = this.patientService.getGlobal().ShortName;
    this.CurrentDeposit.Address = this.patientService.getGlobal().Address;
    this.CurrentDeposit.PhoneNumber = this.patientService.getGlobal().PhoneNumber;
    this.CurrentDeposit.PatientCode = this.patientService.getGlobal().PatientCode;
    this.CurrentDeposit.BillingUser = this.securityService.GetLoggedInUser().UserName;

    this.CurrentAdmission.IsPoliceCase = false;
    this.showInsuranceCheckBox = this.patientService.getGlobal().Ins_HasInsurance;
    this.isGovInsuranceAdmission = this.patientService.getGlobal().Ins_HasInsurance;
    this.CurrentAdmission.Ins_HasInsurance = this.isGovInsuranceAdmission;
    this.CurrentAdmission.Ins_NshiNumber = this.patientService.getGlobal().Ins_NshiNumber;
    this.CurrentAdmission.Ins_InsuranceBalance = this.patientService.getGlobal().Ins_InsuranceBalance;
    this.CurrentAdmission.CareOfPersonName = this.patientService.getGlobal().CareTakerName;
    this.CurrentAdmission.CareOfPersonPhoneNo = this.patientService.getGlobal().CareTakerContact;
    this.CurrentAdmission.CareOfPersonRelation = this.patientService.getGlobal().RelationWithCareTaker;
    this.CurrentAdmission.BillingTransaction.PaymentMode = this.isGovInsuranceAdmission ? ENUM_BillPaymentMode.credit : ENUM_BillPaymentMode.cash;
    //const ssfPolicyNo = this.patientService.getGlobal().SSFPolicyNo;
    //this.CurrentAdmission.PatientSchemesMap.PolicyNo = ssfPolicyNo;
    // if (ssfPolicyNo && this.membershipTypeName === ENUM_MembershipTypeName.SSF) {
    //   this.getSSFPatientDetailLocally();
    // } else {
    //   this.isNewPatient = true;
    // }
  }
  GetPatientLastVisitContext(PatientId: number): void {
    this.billingBlService.GetPatientLatestVisitContext(this.patientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.PatientLastVisitContext = res.Results[0];
        if (this.PatientLastVisitContext && this.PatientLastVisitContext.VisitType && this.PatientLastVisitContext.VisitType.toLowerCase() === ENUM_VisitType.outpatient.toLowerCase()) {
          this.SchemePriceCategoryFromVisit.SchemeId = this.PatientLastVisitContext.SchemeId;
          this.SchemePriceCategoryFromVisit.PriceCategoryId = this.PatientLastVisitContext.PriceCategoryId;
        } else {
          this.DisplaySchemePriceCategorySelection = true;
        }
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Could not load Last Visit Context for Patient"]);
      }
    }, err => {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, err);
    });
  }

  GetSchemeAdtAutoBillingItemsAndDepositSettings(schemeId: number, priceCategoryId: number): void {
    this._admissionMasterBlService.GetSchemeAdtAutoBillingItemsAndDepositSettings(schemeId, priceCategoryId, ENUM_ServiceBillingContext.IpBilling).subscribe(
      (res: Array<DanpheHTTPResponse>) => {
        if (res && res.length > 0) {
          //* Krishna, 15th,June'23, Taking index 0 for AutoBillingItems and index 1 for DepositSettings because forkJoin is used at its back.
          const adtSchemeAutoBillingItems = res[0];
          const adtSchemeDepositSettings = res[1];
          if (adtSchemeAutoBillingItems && adtSchemeDepositSettings.Results) {
            this.AdtAutoBillingItems = adtSchemeAutoBillingItems.Results;
          }
          if (adtSchemeDepositSettings && adtSchemeDepositSettings.Results) {
            this.AdtDepositSettings = adtSchemeDepositSettings.Results;
          }
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Cannot load Auto Billing Items and Deposit Settings"]);
        }
      }, err => {
        console.log(err);
      });
  }
  public EnableAutoGenerate: boolean = true;
  LoadParameters() {
    let Parameter = this.coreService.Parameters;

    //EnableAutoGenerate
    let claimCodeParam = this.coreService.Parameters.find(parms => parms.ParameterGroupName === 'Insurance' && parms.ParameterName === "ClaimCodeAutoGenerateSettings");
    let claimparmObj = JSON.parse(claimCodeParam.ParameterValue);
    this.EnableAutoGenerate = claimparmObj.EnableAutoGenerate;
    if (this.isGovInsuranceAdmission === true) {
      this.CurrentAdmission.EnableControl("ClaimCode", true);
      this.GetClaimCode();
    }
    else {
      this.CurrentAdmission.EnableControl("ClaimCode", false);
    }

  }
  GovInsuranceAdmissionChange() {
    if (this.isGovInsuranceAdmission && this.isGovInsuranceAdmission === true) {
      this.CurrentAdmission.Ins_HasInsurance = true;
      this.CurrentAdmission.BillingTransaction.PaymentMode = 'credit';
      this.CurrentAdmission.BillingTransaction.Remarks = "Government Insurance";
    } else {
      this.CurrentAdmission.Ins_HasInsurance = false;
      this.CurrentAdmission.BillingTransaction.Remarks = "";
    }
  }
  GetClaimCode() {
    if (this.claimCodeType === "new") {
      this.GetNewClaimCode();
    }
    else if (this.claimCodeType === "old") {
      this.GetOldClaimCode();
    }
  }
  GetNewClaimCode() {
    this.admissionBLService.GetNewClaimCode()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.CurrentAdmission.ClaimCode = res.Results;
        }
        else if (res.Status === ENUM_DanpheHTTPResponses.Failed) {
          this.CurrentAdmission.ClaimCode = res.Results;
          this.msgBoxServ.showMessage("warning", [res.ErrorMessage]);
          console.log(res.Errors);

        }
        else {
          this.msgBoxServ.showMessage("error", ['Could Not get Claim code!']);
          console.log(res.Errors);
        }
      });
  }
  GetOldClaimCode() {
    this.admissionBLService.GetOldClaimCode(this.CurrentAdmission.PatientId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.CurrentAdmission.ClaimCode = res.Results;
        }
        else if (res.Status === ENUM_DanpheHTTPResponses.Failed) {
          this.CurrentAdmission.ClaimCode = res.Results;
          this.msgBoxServ.showMessage("warning", [res.ErrorMessage]);
          console.log(res.Errors);
          this.claimCodeType = "new";
          this.GetNewClaimCode();
        }
        else {
          this.msgBoxServ.showMessage("error", ['Could Not get Claim code!']);
          console.log(res.Errors);
        }
      });
  }
  public GetDocDptAndWardList() {
    this.admissionBLService.GetDocDptAndWardList(this.patientId, this.patientVisitId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.doctorList = res.Results.DoctorList;
          this.filteredDocList = res.Results.DoctorList;
          this.deptList = res.Results.DepartmentList;
          this.wardList = res.Results.WardList;
          this.deptList.unshift({ "Key": 0, "Value": "All" });

          if (res.Results.BedReservedForCurrentPat &&
            res.Results.BedReservedForCurrentPat.ReservedBedInfoId > 0) {
            this.CurrentBedReservation = Object.assign(new BedReservationInfo(), res.Results.BedReservedForCurrentPat);
            this.SetParametersFromReservation();
          }

        } else {
          this.msgBoxServ.showMessage("error", ['There is some error, cant get the data !', res.ErrorMessage]);
        }
        this.setFocusById("admissionCase");
      });
  }


  public SetParametersFromReservation() {
    this.reservedBedIdByPat = this.CurrentBedReservation.BedId;
    let dpt = this.deptList.find(d => d.Key == this.CurrentBedReservation.RequestingDepartmentId);
    if (dpt && dpt.Key > 0) {
      this.selectedDept = dpt.Value;
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == dpt.Key);
      let adtDoc = this.doctorList.find(dc => dc.Key == this.CurrentBedReservation.AdmittingDoctorId);
      if (adtDoc && adtDoc.Key > 0) { this.selectedPerformer = adtDoc.Value; }
    }
    this.CurrentPatientBedInfo.BedFeatureId = this.CurrentBedReservation.BedFeatureId;
    this.CurrentPatientBedInfo.BedId = this.CurrentBedReservation.BedId;
    this.CurrentPatientBedInfo.WardId = this.CurrentBedReservation.WardId;
    this.CurrentPatientBedInfo.RequestingDeptId = this.CurrentBedReservation.RequestingDepartmentId;
    this.CurrentPatientBedInfo.ReservedBedId = this.CurrentBedReservation.ReservedBedInfoId;

    this.CurrentAdmission.AdmissionDate = this.CurrentBedReservation.AdmissionStartsOn;
    this.CurrentAdmission.AdmittingDoctorId = this.CurrentBedReservation.AdmittingDoctorId;

    let nepDate = this.npCalendarService.ConvertEngToNepDate(this.CurrentBedReservation.AdmissionStartsOn);
    this.admitDateNP = nepDate;

    this.WardChanged(this.CurrentBedReservation.WardId, true);
  }

  GenerateDoctorList(): void {
    this.admissionBLService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  public GenerateDeptList() {
    this.admissionBLService.GetDepartments()
      .subscribe(res => this.CallBackGenerateDept(res));
  }

  GetPatientDeposit() {
    this.admissionBLService.GetPatientDeposits(this.CurrentAdmission.PatientId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK)
          this.CalculatePatDepositBalance(res.Results);
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  CalculatePatDepositBalance(data) {
    let depositAmount = 0;
    let returnDepositAmount = 0;
    let depositDeductAmount = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].TransactionType == "Deposit") {
        depositAmount = data[i].DepositAmount;
      }
      else if (data[i].TransactionType == "ReturnDeposit") {
        returnDepositAmount = data[i].DepositAmount;
      }
      else if (data[i].TransactionType == "depositdeduct") {
        depositDeductAmount = data[i].DepositAmount;
      }
    }
    this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(depositAmount - returnDepositAmount - depositDeductAmount);
  }

  CallBackGenerateDoctor(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      this.doctorList = [];
      if (res && res.Results) {

        //changed the api in bl, so the return type of doctor list is as below.
        res.Results.forEach(a => {
          this.doctorList.push({ "Key": a.PerformerId, "Value": a.PerformerName, "DepartmentId": a.DepartmentId, "DepartmentName": a.DepartmentName });
        });

        this.filteredDocList = this.doctorList;

      }
    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }

  }

  public CallBackGenerateDept(res) {
    this.deptList = [];
    if (res.Results) {
      res.Results.forEach(a => {
        this.deptList.push({ "Key": a.DepartmentId, "Value": a.DepartmentName });
      });
    }
    this.deptList.unshift({ "Key": 0, "Value": "All" });
  }

  public AddAdmission() {
    this.loading = true;
    this.CurrentPatientBedInfo.StartedOn = this.CurrentAdmission.AdmissionDate;
    let validationSummary = { isValid: true, message: [] };

    //This is to stop saving admission if billing is enabled but there are no billing items present.
    if (this.admissionSettings.IsBillingEnabled) {
      let additionalBillValid = this.AdditionBillItemList ? this.AdditionBillItemList.length : 0;

      let defaultBillValid = this.DefaultBillItemList ? this.DefaultBillItemList.length : 0;

      if (!additionalBillValid && !defaultBillValid) {

        validationSummary.isValid = false;
        this.msgBoxServ.showMessage("error", ['No Billing Item Found. There must be at least one Billing Item.']); this.loading = false; return;
      }
    }


    if (this.CurrentAdmission.BillingTransaction.IsInsuranceBilling
      && this.patientService.Insurance
      && this.patientService.Insurance.Ins_InsuranceBalance < this.CurrentAdmission.BillingTransaction.TotalAmount) {
      validationSummary.isValid = false;
      validationSummary.message.push("Insurance Balance not sufficient.");
    }

    if (this.selectedPerformer) {
      this.CurrentAdmission.AdmittingDoctorId = this.selectedPerformer ? this.selectedPerformer.Key : null;
    }

    this.CheckForStrInDoctor();

    if (!this.CurrentAdmission.AdmittingDoctorId && this.AdmittingDoctorMandatory) {
      this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return;
    }

    for (let i in this.CurrentAdmission.AdmissionValidator.controls) {
      this.CurrentAdmission.AdmissionValidator.controls[i].markAsDirty();
      this.CurrentAdmission.AdmissionValidator.controls[i].updateValueAndValidity();
    }
    for (let i in this.CurrentPatientBedInfo.PatientBedInfoValidator.controls) {
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].markAsDirty();
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].updateValueAndValidity();
    }


    this.SaveAdmission();//sud:1-Oct'21--No need to check for duplicate claimcode until we enable manual entry.

  }
  public SaveAdmission() {

    if (this.CurrentAdmission.IsValidCheck(undefined, undefined) && this.CurrentPatientBedInfo.IsValidCheck(undefined, undefined)) {
      if (!(this.CurrentAdmission.BillingTransaction.Remarks && this.CurrentAdmission.BillingTransaction.Remarks.length) &&
        (this.CurrentAdmission.BillingTransaction.DiscountPercent || this.CurrentAdmission.Ins_HasInsurance || this.CurrentAdmission.BillingTransaction.PaymentMode === 'credit')) {
        this.msgBoxServ.showMessage("failed", ["Billing Remarks is required."]);
        this.loading = false;
        return;
      }

      if (this.CurrentAdmission.BillingTransaction.Remarks && this.CurrentAdmission.BillingTransaction.Remarks.trim().length === 0) {
        this.msgBoxServ.showMessage("failed", ["Billing Remarks is required."]);
        this.loading = false;
        return;
      }
      if (this.CurrentAdmission.BillingTransaction.PaymentMode === 'credit' && (!this.CurrentAdmission.BillingTransaction.OrganizationId || this.CurrentAdmission.BillingTransaction.OrganizationId === 0) && (!this.isGovInsuranceAdmission)) {
        this.msgBoxServ.showMessage("failed", ["Credit Organization is Required for credit Paymentmode."]);
        this.loading = false;
        return;
      }

      this.loading = true;
      this.coreService.loading = true;

      // this.AdditionBillItemList.forEach(b => {
      //   if (b && b.ItemId) {
      //     this.CurrentAdmission.BillingTransaction.BillingTransactionItems.push(b);
      //   }
      // });

      // this.DefaultBillItemList.forEach(b => {
      //   if (b && b.ItemId) {
      //     this.CurrentAdmission.BillingTransaction.BillingTransactionItems.push(b);
      //   }
      // });


      //HotFix 27th Dec, 2018
      if (this.CurrentDeposit.InAmount > 0) {
        this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(this.CurrentDeposit.DepositBalance + this.CurrentDeposit.InAmount);
      }

      this.CurrentAdmission.IsBillingEnabled = this.admissionSettings.IsBillingEnabled;
      //IsInsuranceBilling property of billingTransaction must be True or False. <if null then take it as false>
      this.CurrentAdmission.BillingTransaction.IsInsuranceBilling = this.CurrentAdmission.Ins_HasInsurance == null ? false : this.CurrentAdmission.Ins_HasInsurance;
      if (this.CurrentAdmission.BillingTransaction.IsInsuranceBilling) {
        this.CurrentAdmission.BillingTransaction.BillingTransactionItems.forEach(a => {
          a.IsInsurance = true;
        });
      }
      this.CurrentAdmission.BillingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;
      this.CurrentAdmission.PatientBedInfos = [];

      //Sud:1-Oct'21: Assign LastClaimCode Used property before submisssion.
      this.CurrentAdmission.IsLastClaimCodeUsed = this.claimCodeType === "old" ? true : false;
      this.CurrentDeposit.empCashTransactionModel = this.TempEmployeeCashTransaction;
      this.CurrentDeposit.PaymentMode = this.CurrentDeposit.PaymentMode.toLowerCase() !== 'credit' ? 'cash' : 'credit';
      this.CurrentDeposit.CareOf = this.CurrentAdmission.CareOfPersonName;
      this.CurrentAdmission.BillingTransaction.PaymentMode = this.CurrentAdmission.BillingTransaction.PaymentMode.toLowerCase() !== 'credit' ? 'cash' : 'credit';
      //this.CurrentAdmission.BillingTransaction.SchemeId = this.membershipTypeId;//sud:29Mar'23--For new billingStructure.

      this.admissionBLService.PostAdmission(this.CurrentAdmission, this.CurrentPatientBedInfo, this.CurrentDeposit, this.CurrentAdmission.BillingTransaction)
        .subscribe(
          res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
              this.GetDetailsForAdmissionSlip(res.Results.PatientVisitId);
              this.coreService.loading = false;
              let retObj = res.Results;
              this.patientVisitId = res.Results.PatientVisitId;
              if (this.CurrentDeposit.InAmount > 0) {
                Object.assign(this.CurrentDeposit, res.Results.BilDeposit);
                this.showDepositReceipt = true;
                this.changeDetector.detectChanges();
              }

              if (this.admissionSettings.IsBillingEnabled && res.Results.BillingTransaction
                && res.Results.BillingTransaction.BillingTransactionItems && res.Results.BillingTransaction.BillingTransactionItems.length) {
                this.bil_FiscalYrId = res.Results.BillingTransaction.FiscalYearId;
                this.bil_InvoiceNo = res.Results.BillingTransaction.InvoiceNo;
                this.bil_BilTxnId = res.Results.BillingTransaction.BillingTransactionId;
                this.showBillingReceipt = true;
                this.changeDetector.detectChanges();
              }

              this.CurrentDeposit.FiscalYear = retObj.BilDeposit.FiscalYear;
              this.CurrentDeposit.InpatientpNumber = retObj.Visit.VisitCode;
              this.CurrentDeposit.AdmissionCase = retObj.AdmissionCase;
              this.CurrentDeposit.AdmissionDate = moment(retObj.AdmissionDate).format("YYYY-MM-DD");
              this.showSticker = true;

              this.showPrintPopUp = true;
              this.msgBoxServ.showMessage("success", ["Patient admitted successfully."]);
            }
            else {
              this.loading = false;
              // this.CurrentAdmission.BillingTransaction.BillingTransactionItems = [];
              this.msgBoxServ.showMessage("failed", ["Failed to admit patient."]);
              console.log(res.ErrorMessage);
              this.coreService.loading = false;
            }

          });


      //this.admissionBLService.PostVisitForAdmission(this.CurrentAdmission)
      //    .subscribe(
      //        res => {
      //            if (res.Status == "OK") {
      //                this.loading = false;
      //                this.CallBackAddVisit(res.Results);
      //            }
      //            else {
      //                this.loading = false;
      //                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
      //            }
      //        });
    }
    else {
      this.loading = false;
      this.msgBoxServ.showMessage("error", ["Please fill all required field."]);
    }

    //}
  }

  //get ward list in dropdown.
  GetwardList() {
    try {
      this.admissionBLService.GetWards()
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results.length) {
              this.wardList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Failed  to get ward list"]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      // this.ShowCatchErrMessage(exception);
    }

  }

  public WardChanged(wardId: number, useDataFromReservation: boolean = false) {
    if (wardId) {
      this.disableFeature = false;
      //!useDataFromReservation ? this.CurrentPatientBedInfo.BedFeatureId = null : this.CurrentPatientBedInfo.BedFeatureId;
      this.CurrentPatientBedInfo.BedFeatureId = null;
      this.bedList = null;
      this.CurrentPatientBedInfo.BedPrice = null;
      this.admissionBLService.GetWardBedFeatures(wardId, this.CurrentAdmission.PriceCategoryId)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results.length) {
              this.bedFeatureList = res.Results;
              this.OriginalBedFeatureList = res.Results;
              this.FilterBedFeatureAsPerSelectedScheme();
              //!useDataFromReservation ? this.CurrentPatientBedInfo.BedFeatureId = this.bedFeatureList[0].BedFeatureId : this.CurrentBedReservation.BedFeatureId;
              !useDataFromReservation ? this.CurrentPatientBedInfo.BedFeatureId = null : this.CurrentBedReservation.BedFeatureId;
              this.changeDetector.detectChanges();
              this.GetAvailableBeds(wardId, this.CurrentPatientBedInfo.BedFeatureId);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No bed features available"]);
              this.bedList = null;
              this.CurrentPatientBedInfo.BedId = 0;
            }
          } else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get available beds. " + err.ErrorMessage]);
          });
    }
    else {
      this.bedFeatureList = null;
      this.bedList = null;
    }

  }
  private FilterBedFeatureAsPerSelectedScheme() {
    // this.CurrentPatientBedInfo.BedFeatureId = null;
    if (this.AdtBedFeatureSchemePriceCategoryMap && this.AdtBedFeatureSchemePriceCategoryMap.length > 0) {
      const filteredBedFeatureList = this.OriginalBedFeatureList.filter(a => this.AdtBedFeatureSchemePriceCategoryMap.some(b => b.BedFeatureId === a.BedFeatureId));
      this.bedFeatureList = filteredBedFeatureList;
    } else {
      this.bedFeatureList = this.OriginalBedFeatureList;
    }
  }

  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    if (wardId && bedFeatureId) {
      this.AssignAutoBillingItemsAndDeposits(+bedFeatureId);
      this.CurrentPatientBedInfo.BedId = null; //default
      this.bedList = null;
      var selectedFeature = this.bedFeatureList.find(a => a.BedFeatureId == bedFeatureId);
      this.CurrentPatientBedInfo.BedPrice = selectedFeature.BedPrice;
      this.disableBed = false;
      this.admissionBLService.GetAvailableBeds(wardId, bedFeatureId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.availableBeds.length) {
              this.bedList = res.Results.availableBeds;
              //this.InitializeBedBillItem(res.Results.BedbillItm)
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No beds are available for this type."]);
              this.bedList = null;
              this.CurrentPatientBedInfo.BedId = 0;
            }
          } else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get available beds. " + err.ErrorMessage]);
          });
    }
    else {
      this.bedList = null;
    }
  }

  public DisableDepositInAmountField: boolean = false;
  AssignAutoBillingItemsAndDeposits(bedFeatureId: number): void {
    if (this.AdtAutoBillingItems) {
      this.CurrentAdmission.BillingTransaction.BillingTransactionItems = [];
      this.loading = true;
      //* assign Auto Billing Items here
      const autoBillingItemsAccordingToBedFeature = this.AdtAutoBillingItems.filter(a => a.BedFeatureId === bedFeatureId && a.SchemeId === this.CurrentAdmission.DiscountSchemeId);
      if (autoBillingItemsAccordingToBedFeature) {
        let bedChargesItem = autoBillingItemsAccordingToBedFeature.find(a => a.IntegrationName === ENUM_IntegrationNames.BedCharges);
        let priceOfBedCharges = 0;
        if (bedChargesItem) {
          priceOfBedCharges = bedChargesItem.Price;
        }
        autoBillingItemsAccordingToBedFeature.forEach((itm) => {
          const billingTxnItm = new BillingTransactionItem();
          billingTxnItm.DiscountSchemeId = itm.SchemeId;
          billingTxnItm.BillStatus = ENUM_BillingStatus.provisional;
          if (itm.UsePercentageOfBedCharges) {
            billingTxnItm.Price = this._billingInvoiceBlService.CalculateAmountFromPercentage(itm.PercentageOfBedCharges, priceOfBedCharges);
          } else {
            billingTxnItm.Price = itm.IntegrationName === ENUM_IntegrationNames.BedCharges ? itm.Price : itm.MinimumChargeAmount; //! We take from PriceCategory Mapping for Bed Charges and for other auto charge items from the autBillingItems itself.
          }
          billingTxnItm.ItemCode = itm.ItemCode;
          billingTxnItm.ItemName = itm.ItemName;
          billingTxnItm.Quantity = 1;
          if (itm.IsDiscountApplicable) {
            billingTxnItm.DiscountPercent = itm.DiscountPercent;
          }
          billingTxnItm.SubTotal = (billingTxnItm.Price * billingTxnItm.Quantity);
          billingTxnItm.DiscountAmount = this._billingInvoiceBlService.CalculateAmountFromPercentage(billingTxnItm.DiscountPercent, billingTxnItm.SubTotal);
          billingTxnItm.TotalAmount = billingTxnItm.SubTotal - billingTxnItm.DiscountAmount;
          billingTxnItm.PriceCategoryId = itm.PriceCategoryId;
          billingTxnItm.DiscountSchemeId = itm.SchemeId;
          if (itm.IsCoPayment) {
            billingTxnItm.IsCoPayment = true;
            billingTxnItm.CoPaymentCashAmount = this._billingInvoiceBlService.CalculateAmountFromPercentage(itm.CoPayCashPercent, billingTxnItm.TotalAmount);
            billingTxnItm.CoPaymentCreditAmount = billingTxnItm.TotalAmount - billingTxnItm.CoPaymentCashAmount;
          }
          billingTxnItm.ItemIntegrationName = itm.IntegrationName;
          billingTxnItm.IntegrationItemId = itm.IntegrationItemId;
          billingTxnItm.ServiceItemId = itm.ServiceItemId;
          billingTxnItm.PrescriberId = this.selectedPerformer ? this.selectedPerformer.PerformerId : null;
          billingTxnItm.PrescriberName = this.selectedPerformer ? this.selectedPerformer.PerformerName : null;
          billingTxnItm.BillingType = ENUM_BillingType.inpatient;
          billingTxnItm.CounterId = this.securityService.getLoggedInCounter().CounterId;
          billingTxnItm.ServiceDepartmentId = itm.ServiceDepartmentId;
          billingTxnItm.ServiceDepartmentName = itm.ServiceDepartmentName;
          billingTxnItm.PriceCategory = null;
          billingTxnItm.IsAutoBillingItem = true;
          billingTxnItm.IsAutoCalculationStop = false;

          this.CurrentAdmission.BillingTransaction.BillingTransactionItems.push(billingTxnItm);
        });
      }
    }

    if (this.AdtDepositSettings) {
      //* assign minimum Deposits If Available.
      const depositSettings = this.AdtDepositSettings.find(a => a.BedFeatureId === bedFeatureId && a.SchemeId === this.CurrentAdmission.DiscountSchemeId);
      if (depositSettings) {
        this.CurrentDeposit.InAmount = depositSettings.MinimumDepositAmount;
        this.CurrentDeposit.DepositHeadId = depositSettings.DepositHeadId;
        this.DisableDepositInAmountField = depositSettings.IsOnlyMinimumDeposit ? true : false;
      }
    }
    this.loading = false;
  }

  myListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  myListFormatterDept(data: any): string {
    let html = data["Value"];
    return html;
  }
  //Nepali date calendar related changes below
  //this method fire when nepali calendar date changed
  //convert nepali date to english date and assign to english calendar
  NepCalendarOnDateChange() {
    let engDate = this.npCalendarService.ConvertNepToEngDate(this.admitDateNP);
    this.CurrentAdmission.AdmissionDate = engDate;
  }
  //this method fire when english calendar date changed
  //convert english date to nepali date and assign to nepali canlendar
  EngCalendarOnDateChange() {
    if (this.CurrentAdmission.AdmissionDate) {
      let nepDate = this.npCalendarService.ConvertEngToNepDate(this.CurrentAdmission.AdmissionDate);
      this.admitDateNP = nepDate;
    }
  }
  StickerPrintCallBack($event) {
    this.patientVisitId = null;
    this.showSticker = false;
    this.showPrintPopUp = false;
    this.router.navigate(["/ADTMain/AdmittedList"]);
  }

  public DoctorDdlOnChange() {
    if (this.selectedPerformer) {
      this.CurrentPatientBedInfo.RequestingDeptId = this.selectedPerformer.DepartmentId;
      this.CurrentAdmission.RequestingDeptId = this.selectedPerformer.DepartmentId;

      //currently we already have department name in doctor object, so we don't have to filter from departmentlist.
      this.selectedDept = this.selectedPerformer.DepartmentName;
      //let dept = this.deptList.find(a => a.Key == this.selectedPerformer.DepartmentId);

      //if (dept) {
      //  this.selectedDept = dept.Value;
      //}

      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.selectedPerformer.DepartmentId);
    }
  }

  public CheckForStrInDoctor() {
    if (typeof (this.selectedPerformer) === 'string') {
      let doc = this.doctorList.find(d => d.Value == this.selectedPerformer);
      if (doc) {
        this.CurrentAdmission.AdmittingDoctorId = doc.Key;
        return;
      }
      this.CurrentAdmission.AdmittingDoctorId = null;
    }
  }

  public FilterDoctorList() {
    let deptId = 0;
    if (typeof (this.selectedDept) === 'string') {

      let dept = this.deptList.find(a => a.Value.toLowerCase() == String(this.selectedDept).toLowerCase());
      if (dept) {
        deptId = dept.Key;
      }
    }
    else if (typeof (this.selectedDept) === 'object' && this.selectedDept && this.selectedDept.Key) {
      let dept = this.deptList.find(a => a.Key == this.selectedDept.Key);
      if (dept) {
        deptId = dept.Key;
      }
    }
    this.CurrentAdmission.AdmittingDoctorId = null;
    this.selectedPerformer = "";
    if (deptId > 0) {
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == deptId);
      this.CurrentPatientBedInfo.RequestingDeptId = deptId;
      this.CurrentAdmission.RequestingDeptId = deptId;
    }
    else {
      this.filteredDocList = this.doctorList;
      this.selectedDept = null;
    }

  }

  public BedChanged(bed: any, curr: number) {
    var bedRes = this.bedList.find(b => b.BedId == bed && b.IsReserved);
    if (bedRes && (this.reservedBedIdByPat !== bedRes.BedId)) {
      this.msgBoxServ.showMessage("error", ['Cannot reserve this bed. This bed is already reserved by '
        + bedRes.ReservedByPatient + ' for date: ' + moment(bedRes.ReservedForDate).format('YYYY-MM-DD HH:mm')]);
      this.changeDetector.detectChanges();
      this.CurrentPatientBedInfo.BedId = null;
    } else if (bed === 0) {
      this.msgBoxServ.showMessage("error", ["Cannot put bed value as 'Select bed'"]);
    }
  }



  //public LoadBillItemsAdmissionRelated() {
  //    this.admissionBLService.GetAdmissionBillItems()
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.InitializeBillItems(res.Results);
  //            }
  //            else {
  //                this.msgBoxServ.showMessage("error", ["Failed to get billing items related to admission. " + res.ErrorMessage]);
  //            }
  //        },
  //            err => {
  //                this.msgBoxServ.showMessage("error", ["Failed to get billing items related to admission. " + err.ErrorMessage]);
  //            })
  //}

  //public InitializeBillItems(data) {
  //    this.billTxnItems = new Array<BillingTransactionItem>();
  //    data.forEach(a => {
  //        let bilItm = new BillingTransactionItem();
  //        bilItm.PatientId = this.patientService.getGlobal().PatientId;
  //        bilItm.ServiceDepartmentId = a.ServiceDepartmentId;
  //        bilItm.ServiceDepartmentName = a.ServiceDepartmentName;
  //        bilItm.ItemId = a.ItemId;
  //        bilItm.ItemName = a.ItemName;
  //        bilItm.Price = CommonFunctions.parseAmount(a.Price);
  //        bilItm.Quantity = 1;
  //        bilItm.SubTotal = CommonFunctions.parseAmount(bilItm.Price * bilItm.Quantity);
  //        bilItm.NonTaxableAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
  //        bilItm.TotalAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
  //        bilItm.BillStatus = "provisional";
  //        bilItm.CounterId = this.securityService.getLoggedInCounter().CounterId;
  //        bilItm.CounterDay = moment().format("YYYY-MM-DD");
  //        bilItm.BillingType = "inpatient";
  //        bilItm.ProcedureCode = a.ProcedureCode;
  //        bilItm.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //        bilItm.VisitType = "inpatient";

  //        this.billTxnItems.push(bilItm);
  //    });
  //}

  //public InitializeBedBillItem(bedData) {
  //    if (bedData != null) {
  //        let bilItm = new BillingTransactionItem();
  //        bilItm.PatientId = this.patientService.getGlobal().PatientId;
  //        bilItm.ServiceDepartmentId = bedData.ServiceDepartmentId;
  //        bilItm.ServiceDepartmentName = bedData.ServiceDepartmentName;
  //        bilItm.ItemId = bedData.ItemId;
  //        bilItm.ItemName = bedData.ItemName;
  //        bilItm.Price = CommonFunctions.parseAmount(bedData.Price);
  //        bilItm.Quantity = 1;
  //        bilItm.SubTotal = CommonFunctions.parseAmount(bilItm.Price * bilItm.Quantity);
  //        bilItm.NonTaxableAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
  //        bilItm.TotalAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
  //        bilItm.BillStatus = "provisional";
  //        bilItm.CounterId = this.securityService.getLoggedInCounter().CounterId;
  //        bilItm.CounterDay = moment().format("YYYY-MM-DD");
  //        bilItm.BillingType = "inpatient";
  //        bilItm.ProcedureCode = bedData.ProcedureCode;
  //        bilItm.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //        bilItm.VisitType = "inpatient";

  //        this.bedBilItem = bilItm;
  //    }
  //}

  //common function to set focus on  given Element.
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

  //common function to focus on element dynamically
  public FocusNext(value: any, target: string, orElseTarget: string) {
    if (value !== null && value !== "") {
      //this.FilterDoctorList();
      if (value === "cheque" || value === "card") {
        this.setFocusById('PaymentDetails');
        return;
      }
      if (value.BedId !== null && this.CurrentAdmission.Ins_HasInsurance) {
        this.setFocusById(orElseTarget);
        return;
      }
      this.setFocusById(target);
    }
    else {
      //this.FilterDoctorList();
      this.setFocusById(orElseTarget);
    }
  }

  FocusOnWardFromAdmittingDoctor() {
    if (this.AdmittingDoctorMandatory && !this.selectedPerformer) {
      this.setFocusById('AdmittingDoctorId');
    } else {
      this.setFocusById('WardId');
    }
  }

  setFocusAfterChange() {
    if (this.admissionSettings.IsDepositEnabled && !this.DisableDepositInAmountField) {
      this.setFocusById('DepositAmount');
    } else if (this.admissionSettings.IsDepositEnabled && this.DisableDepositInAmountField) {
      this.setFocusById('DepositRemark');
    }
    else if (this.admissionSettings.IsBillingEnabled && this.CurrentAdmission.Ins_HasInsurance) {
      this.setFocusById('Remarks');
    }
    else {
      this.setFocusById('SaveAdmission');
    }
  }

  //Anjana:11May,'21: to allow membership selection while admission
  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  // membershipTypeId: number;
  membershipTypeName: string = null;
  // OnMembershipChanged($event: BillingSchemeModel) {
  //   if ($event) {
  //     this.disableDiscountField = ($event.SchemeName.toLowerCase() === "general") && ($event.DiscountPercent === 0);
  //     this.CurrentAdmission.DiscountSchemeId = $event.SchemeId;
  //     this.membershipTypeId = this.CurrentAdmission.DiscountSchemeId;
  //     this.membershipTypeName = $event.SchemeName;
  //     this.CurrentAdmission.IsValidMembershipTypeName = true;
  //     let discount = $event.DiscountPercent;
  //     this.CurrentAdmission.BillingTransaction.DiscountPercent = discount;
  //     let priceCategory = this.coreService.Masters.PriceCategories;
  //     let allPriceCategories = priceCategory.filter(a => a.IsActive);
  //     if ($event.DefaultPriceCategoryId) {
  //       let defaultPriceCategory = allPriceCategories.find(a => a.PriceCategoryId === $event.DefaultPriceCategoryId);
  //       if (defaultPriceCategory) {
  //         this.selectedPriceCategoryObj = defaultPriceCategory;
  //       } else {
  //         this.selectedPriceCategoryObj = allPriceCategories.find(a => a.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Normal.toLowerCase());
  //       }
  //     } else {
  //       this.selectedPriceCategoryObj = allPriceCategories.find(a => a.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Normal.toLowerCase());
  //     }
  //     this.Calculation();
  //   }
  //   else {
  //     this.CurrentAdmission.DiscountSchemeId = this.tempMembershipTypeId ? this.tempMembershipTypeId : null;;
  //     this.CurrentAdmission.IsValidMembershipTypeName = false;
  //     // this.CurrentAdmission.BillingTransaction.Remarks = null;
  //   }

  //   //we've to set remarks as that of discount percent
  //   if ($event && $event.SchemeName.toLowerCase() !== "general") {
  //     this.CurrentAdmission.BillingTransaction.Remarks = $event.SchemeName;
  //   }
  //   // else {
  //   //   this.CurrentAdmission.BillingTransaction.Remarks = null;
  //   // }
  // }

  PaymentModeChangesDeposit($event) {
    this.CurrentDeposit.PaymentMode = $event.PaymentMode.toLowerCase();
    this.CurrentDeposit.PaymentDetails = $event.PaymentDetails;
    if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length) {
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === this.CurrentDeposit.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.CurrentDeposit.DepositBalance + this.CurrentDeposit.InAmount;
      empCashTxnObj.OutAmount = 0;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "ADT";
      this.TempEmployeeCashTransaction.push(empCashTxnObj);
    }
  }
  MultiplePaymentCallBackDeposit($event) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<EmployeeCashTransaction>();
      this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
    }
    this.CurrentDeposit.PaymentDetails = $event.PaymentDetail;
  }

  PaymentModeChangesBilling($event) {
    if ($event) {
      this.CurrentAdmission.BillingTransaction.PaymentMode = $event.PaymentMode;
      this.CurrentAdmission.BillingTransaction.PaymentMode = this.CurrentAdmission.BillingTransaction.PaymentMode.toLowerCase();
    }
    if (!this.CurrentAdmission.BillingTransaction.EmployeeCashTransaction.length && this.CurrentAdmission.BillingTransaction.PaymentMode !== 'credit') {
      this.CurrentAdmission.BillingTransaction.EmployeeCashTransaction = [];
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === this.CurrentAdmission.BillingTransaction.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.CurrentAdmission.BillingTransaction.TotalAmount;
      empCashTxnObj.OutAmount = 0;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "ADT";
      this.CurrentAdmission.BillingTransaction.EmployeeCashTransaction.push(empCashTxnObj);
    }
    if (this.CurrentAdmission.BillingTransaction.PaymentMode !== 'credit') {
      this.CurrentAdmission.BillingTransaction.OrganizationId = null;
      this.CurrentAdmission.BillingTransaction.OrganizationName = null;
    }
  }

  MultiplePaymentCallBackBilling($event) {
    if ($event && $event.MultiPaymentDetail) {
      this.CurrentAdmission.BillingTransaction.EmployeeCashTransaction = [];
      this.CurrentAdmission.BillingTransaction.EmployeeCashTransaction = $event.MultiPaymentDetail;
      this.CurrentAdmission.BillingTransaction.PaymentDetails = $event.PaymentDetail;
    }
  }
  CreditOrganizationChanges($event) {
    this.CurrentAdmission.BillingTransaction.OrganizationId = $event.OrganizationId;
    this.CurrentAdmission.BillingTransaction.OrganizationName = $event.OrganizationName;
  }

  OnPriceCategoryChange($event: any) {
    if ($event) {
      this.CurrentAdmission.PriceCategoryId = $event.PriceCategoryId;
      this.selectedPriceCategoryObj = this.coreService.Masters.PriceCategories.find(a => a.PriceCategoryId === this.CurrentAdmission.PriceCategoryId);
    }
  }

  public patient: Patient = new Patient();
  public SSFEligibility: Array<SSFEligibility> = new Array<SSFEligibility>();
  public SSFCompany: Array<SsfEmployerCompany> = new Array<SsfEmployerCompany>();
  selectedPriceCategoryObj = new PriceCategory();
  isClaimSuccessful = false;

  getSSFPatientDetailLocally() {
    this.SSFEligibility = [];
    this.visitBLService.getSSFPatientDetailLocally(this.CurrentAdmission.PatientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        let patientMapPriceCategory = new PatientScheme();
        patientMapPriceCategory = res.Results;
        this.CurrentAdmission.PatientSchemesMap.RegistrationCase = patientMapPriceCategory.RegistrationCase;
        this.CurrentAdmission.PatientSchemesMap.LatestClaimCode = patientMapPriceCategory.LatestClaimCode;
        this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = patientMapPriceCategory.OpCreditLimit;
        this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = patientMapPriceCategory.IpCreditLimit;
        this.CurrentAdmission.PatientSchemesMap.PatientCode = patientMapPriceCategory.PatientCode;
        this.CurrentAdmission.PatientSchemesMap.PatientId = patientMapPriceCategory.PatientId;
        this.CurrentAdmission.PatientSchemesMap.PolicyNo = patientMapPriceCategory.PolicyNo;
        this.CurrentAdmission.PatientSchemesMap.PriceCategoryId = patientMapPriceCategory.PriceCategoryId;
        this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerID = patientMapPriceCategory.PolicyHolderEmployerID;
        this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerName = patientMapPriceCategory.PolicyHolderEmployerName;
        this.CurrentAdmission.PatientSchemesMap.OtherInfo = patientMapPriceCategory.OtherInfo;
        this.CurrentAdmission.PatientSchemesMap.PolicyHolderUID = patientMapPriceCategory.PolicyHolderUID;
        this.CurrentAdmission.PatientSchemesMap.RegistrationSubCase = patientMapPriceCategory.RegistrationSubCase;
        this.CurrentAdmission.PatientSchemesMap.LatestPatientVisitId = patientMapPriceCategory.LatestPatientVisitId;
        const ssfEligibilityLocally = new SSFEligibility();
        ssfEligibilityLocally.SsfEligibilityType = patientMapPriceCategory.RegistrationCase;
        this.SSFEligibility.push(ssfEligibilityLocally);
        this.LoadSSFEmployer();
        this.isClaimed(patientMapPriceCategory.LatestClaimCode, this.CurrentAdmission.PatientId);
      }
    }, (err: DanpheHTTPResponse) => {
      this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to get SSF Patient Detail Locally"]);
    });
  }

  LoadSSFEmployer() {
    this.visitBLService.GetSSFEmployerDetail(this.CurrentAdmission.PatientSchemesMap.PolicyHolderUID).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.SSFCompany = res.Results[0];
      }
    },
      err => {
        console.log(err);
      });
  }


  isClaimed(LatestClaimCode: number, PatientId: number): void {
    this.visitBLService.IsClaimed(LatestClaimCode, PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results === true) {
            this.isClaimSuccessful = true;
            this.getSSFPatientDetail();
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to check for pending claims"]);
        }
      );
  }

  getSSFPatientDetail() {
    if (this.CurrentAdmission.PatientSchemesMap.PolicyNo != null) {
      this.SSFEligibility = [];
      //this.SelectedSSFCompany = null;
      this.CurrentAdmission.PatientSchemesMap.RegistrationCase = "Medical";
      this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerName = "";
      this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerID = "";
      this.CurrentAdmission.PatientSchemesMap.RegistrationSubCase = "non work related";
      this.visitBLService.GetSSFPatientDetail(this.CurrentAdmission.PatientSchemesMap.PolicyNo).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.UUID !== null) {
          let result = res.Results;
          this.patient.FirstName = result.name;
          this.patient.MiddleName = "";
          this.patient.LastName = result.family;
          this.patient.DateOfBirth = result.birthdate;
          this.patient.Gender = result.gender.charAt(0).toUpperCase() + result.gender.slice(1); //* this logic is to capitalize the first letter;
          this.CurrentAdmission.PatientSchemesMap.PolicyHolderUID = result.UUID;
          //this.CalculateAge();
          this.LoadSSFEmployer();
        }
        else {
          this.patient.FirstName = "";
          this.patient.LastName = "";
          this.patient.DateOfBirth = "";
          this.patient.Gender = "";
          this.patient.Age = "0";
          this.CurrentAdmission.PatientSchemesMap.PolicyHolderUID = "";
          // this.msgBoxServ.showMessage("notice",["NO Patient Exists For This Policy Number."]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("notice", [err]);
        });


      this.visitBLService.CheckEligibility(this.CurrentAdmission.PatientSchemesMap.PolicyNo, moment().format("YYYY-MM-DD")).subscribe(res => {
        this.SSFEligibility = res.Results;
        this.SSFEligibility = this.SSFEligibility.filter(a => a.Inforce);
        if (this.SSFEligibility.length === 0) {
          this.msgBoxServ.showMessage("error", ["This Patient is not eligible for SSF claim."]);
        }
        this.OnPatientCaseChange();
      },
        err => {
          console.log(err);
        });
    }
  }

  RegistrationSubCaseChange() {
    if (this.CurrentAdmission.PatientSchemesMap.RegistrationSubCase.toLowerCase() === ENUM_RegistrationSubCases.WorkRelated.toLowerCase()) {
      this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = -1;
    }
    else {
      let obj = this.SSFEligibility.filter(a => a.SsfEligibilityType.toLowerCase() === ENUM_SSF_EligibilityType.Accident.toLowerCase());
      if (obj.length > 0) {
        this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = obj[0].AccidentBalance;
        this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = 0;
      }
    }
  }

  OnPatientCaseChange() {
    this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = 0;
    this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = 0;
    if (this.CurrentAdmission.PatientSchemesMap.RegistrationCase.toLowerCase() === ENUM_SSF_EligibilityType.Medical.toLowerCase()) {
      let obj = this.SSFEligibility.filter(a => a.SsfEligibilityType.toLowerCase() === ENUM_SSF_EligibilityType.Medical.toLowerCase());
      if (obj.length > 0) {
        this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = obj[0].OpdBalance;
        this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = obj[0].IPBalance;
      }
    }
    else {
      this.CurrentAdmission.PatientSchemesMap.RegistrationSubCase = ENUM_RegistrationSubCases.NonWorkRelated;
      let obj = this.SSFEligibility.filter(a => a.SsfEligibilityType.toLowerCase() === ENUM_SSF_EligibilityType.Accident.toLowerCase());
      if (obj.length > 0) {
        this.CurrentAdmission.PatientSchemesMap.IpCreditLimit = obj[0].AccidentBalance;
        this.CurrentAdmission.PatientSchemesMap.OpCreditLimit = 0;
      }
    }
  }

  SFFEmployerListFormatter(data) {
    return data["name"];
  }

  AssignSSFCompanyDetail(data) {
    if (this.SelectedSSFCompany) {
      this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerName = this.SelectedSSFCompany.name;
      this.CurrentAdmission.PatientSchemesMap.PolicyHolderEmployerID = this.SelectedSSFCompany.E_SSID;
    }
  }

  OnSchemePriceCategoryChanged(schemePriceObj: RegistrationScheme_DTO): void {
    if (schemePriceObj) {
      if (this.CurrentAdmission.PriceCategoryId !== schemePriceObj.PriceCategoryId) {
        this.CurrentPatientBedInfo.WardId = null;
        this.CurrentPatientBedInfo.BedPrice = 0;
      }
      this.CurrentAdmission.DiscountSchemeId = schemePriceObj.SchemeId;
      this.CurrentAdmission.PriceCategoryId = schemePriceObj.PriceCategoryId;
      this.CurrentAdmission.BillingTransaction.SchemeId = schemePriceObj.SchemeId;

      this.CurrentAdmission.PatientSchemesMap = this.GetPatientSchemeMappedFromRegistrationSchemeDto(schemePriceObj.PatientScheme);
      this.CurrentAdmission.PatientSchemesMap.LatestClaimCode = schemePriceObj.ClaimCode;
      if (schemePriceObj.SchemeId) {
        this.GetSchemeAdtAutoBillingItemsAndDepositSettings(schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
        this.GetBedFeatureSchemePriceCategoryMap(schemePriceObj.SchemeId);
      }
      this.CurrentAdmission.BillingTransaction.Remarks = schemePriceObj.SchemeName;
    }
  }
  GetBedFeatureSchemePriceCategoryMap(schemeId: number): void {
    this._admissionMasterBlService.GetBedFeatureSchemePriceCategoryMap(schemeId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.AdtBedFeatureSchemePriceCategoryMap = res.Results;

        if (this.OriginalBedFeatureList && this.OriginalBedFeatureList.length > 0) {
          this.CurrentPatientBedInfo.BedFeatureId = null;
          this.CurrentPatientBedInfo.BedPrice = 0;
          this.CurrentDeposit.InAmount = 0;
          this.DisableDepositInAmountField = false;
          this.FilterBedFeatureAsPerSelectedScheme();
        }
      }
    }, err => {
      console.log(err);
    });
  }

  GetPatientSchemeMappedFromRegistrationSchemeDto(patientSchemeObj: PatientScheme_DTO): PatientScheme {
    const patientScheme = new PatientScheme();

    patientScheme.PatientId = patientSchemeObj.PatientId !== null ? patientSchemeObj.PatientId : 0;
    patientScheme.PatientCode = patientSchemeObj.PatientCode !== null ? patientSchemeObj.PatientCode : null;
    patientScheme.SchemeId = patientSchemeObj.SchemeId;
    patientScheme.PolicyNo = patientSchemeObj.PolicyNo;
    patientScheme.PatientSchemeValidator.get("PolicyNo").setValue(patientScheme.PolicyNo);
    patientScheme.PolicyHolderUID = patientSchemeObj.PolicyHolderUID;
    patientScheme.OpCreditLimit = +patientSchemeObj.OpCreditLimit; //*Krishna, 16thApril'23, + is used to typecast the value into number type (eg: null value cannot be mapped with non null property in server, hence need to send 0 instead of null)
    patientScheme.IpCreditLimit = +patientSchemeObj.IpCreditLimit; //*Krishna, 16thApril'23, + is used to typecast the value into number type (eg: null value cannot be mapped with non null property in server, hence need to send 0 instead of null)
    patientScheme.GeneralCreditLimit = +patientSchemeObj.GeneralCreditLimit; //*Krishna, 16thApril'23, + is used to typecast the value into number type (eg: null value cannot be mapped with non null property in server, hence need to send 0 instead of null)
    patientScheme.PolicyHolderEmployerName = patientSchemeObj.PolicyHolderEmployerName;
    patientScheme.RegistrationCase = patientSchemeObj.RegistrationCase;
    patientScheme.LatestClaimCode = patientSchemeObj.LatestClaimCode;
    patientScheme.OtherInfo = patientSchemeObj.OtherInfo;
    patientScheme.PolicyHolderEmployerID = patientSchemeObj.PolicyHolderEmployerID;

    return patientScheme;
  }

  public GetDetailsForAdmissionSlip(PatientVisitId: number): void {
    try {
      this.admissionBLService.GetDetailsForAdmissionSlip(PatientVisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.admissionSlipDetails = res.Results;
            this.showAdmissionSlip = true;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed  to get Details for Admission Slip"]);
          }
        });
    }
    catch (exception) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Exception : ${exception}`]);
    }
  }

  handleConfirm() {
    this.loading = true;
    this.AddAdmission();
  }

  handleCancel() {
    this.loading = false;
  }

  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    if (event && event.keyCode == 27 && this.showPrintPopUp) { //!ESC
      this.StickerPrintCallBack('exit');
    }
  }

}
