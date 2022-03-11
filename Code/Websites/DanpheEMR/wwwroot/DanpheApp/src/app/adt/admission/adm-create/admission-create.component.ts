import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import { ADT_BLService } from '../../shared/adt.bl.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingService } from '../../../billing/shared/billing.service';
import { CallbackService } from '../../../shared/callback.service';

import { Admission } from '../../shared/admission.model';
import { PatientBedInfo } from '../../shared/patient-bed-info.model';
import { Bed } from '../../shared/bed.model';
import { Ward } from '../../shared/ward.model';
import { BedFeature } from '../../shared/bedfeature.model';
import { BillingDeposit } from '../../../billing/shared/billing-deposit.model';
import { BillingTransactionItem } from '../../../billing/shared/billing-transaction-item.model';

import * as moment from 'moment/moment';
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from "../../../core/shared/core.service";
import { BedReservationInfo } from "../../shared/bed-reservation-info.model";
import { CommonValidators } from "../../../shared/common-validator";
import { ENUM_BillingStatus, ENUM_ValidatorTypes } from "../../../shared/shared-enums";
import { Patient } from "../../../patients/shared/patient.model";
import { BillingTransaction } from "../../../billing/shared/billing-transaction.model";
import { InsuranceVM } from "../../../billing/shared/patient-billing-context-vm";
import { QuickVisitVM } from "../../../appointments/shared/quick-visit-view.model";
import { Visit } from "../../../appointments/shared/visit.model";
import { Membership } from "../../../settings-new/shared/membership.model";
import { CreditOrganization } from "../../../settings-new/shared/creditOrganization.model";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";


@Component({
  templateUrl: "./admission-create.html",
  styles: [`.inl-blk, danphe-date-picker{display: inline-block;} .flx{display: flex;}`]
})
export class AdmissionCreateComponent {

  public CurrentAdmission: Admission = new Admission();
  public CurrentPatientBedInfo: PatientBedInfo = new PatientBedInfo();
  public CurrentDeposit: BillingDeposit = new BillingDeposit();
  public bedList: Array<Bed> = new Array<Bed>();
  public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
  public billTxnItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public bedBilItem: BillingTransactionItem = new BillingTransactionItem();

  public providersPath: string = "/api/Master?type=employee&name=:keywords";
  public selectedProvider: any;
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
    public coreService: CoreService) {
    this.patientId = this.patientService.getGlobal().PatientId;
    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/ADTMain/AdmissionSearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.CareofPersonNumberMandatory = this.coreService.IsCareofPersonNoInAdmCreateMandatory();
      this.AdmittingDoctorMandatory = this.coreService.IsAdmittingDoctorInAdmCreateMandatory();
      this.Initialize();
      this.Loadparameters();
      this.LoadMembershipSettings();
      this.GetPatientDeposit();
      this.GetDocDptAndWardList();
      this.AdmissionCases = this.coreService.GetAdmissionCases();

      this.admissionSettings = this.coreService.GetNewAdmissionSettings(this.patientService.getGlobal().Ins_HasInsurance ? "Insurance" : "Billing");
      if (!this.admissionSettings.IsDiscountSchemeEnabled) { this.CurrentAdmission.DiscountSchemeId = null; }

      if (this.admissionSettings && this.admissionSettings.IsBillingEnabled) {
        this.additionalBillingItemsInAdt = this.coreService.GetAdditionalBillItemsInAdmission();
        this.LoadAllBillingItems();
      }
    }



  }
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
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

    let val = this.coreService.Parameters.find(p => p.ParameterGroupName == 'ADT' && p.ParameterName == 'AdmissionPrintSettings').ParameterValue;
    let param = JSON.parse(val);
    if (param) {
      this.showAdmSticker = param.ShowStickerPrint;
      this.showInvoice = param.ShowInvoicePrint;
      this.showWristBand = param.ShowWristBandPrint;
      if (param.DefaultFocus.toLowerCase() == "invoice") {
        this.printInvoice = true;
      }
    }
    this.CurrentAdmission.BillingTransaction.Remarks = this.isGovInsuranceAdmission ? "Government Insurance" : "";
  }

  public LoadAllBillingItems() {
    let srvIdList = this.additionalBillingItemsInAdt.map(a => a.ServiceDeptId);
    let itemIdList = this.additionalBillingItemsInAdt.map(a => a.ItemId);

    if ((this.billingService.adtAdditionalBillItms && this.billingService.adtAdditionalBillItms.length)) {
      this.SetAutoAddedAndNotAddedBillingItems();
    }
    else {
      this.admissionBLService.GetBillItemList(srvIdList, itemIdList)
        .subscribe((res) => {
          if (res.Status == "OK") {
            if (res.Results && res.Results.length) {
              let items = [];
              this.additionalBillingItemsInAdt.forEach(v => {
                let dt = res.Results.find(r => (r.ServiceDepartmentId == v.ServiceDeptId) && (r.ItemId == v.ItemId));
                if (dt) {
                  if (v.AutoAdd) {
                    dt["IsAutoAdded"] = true;
                  } else {
                    dt["IsAutoAdded"] = false;
                  }
                  items.push(dt);
                }
              });
              this.billingService.SetAdtAdditionalBillItms(items);
              this.SetAutoAddedAndNotAddedBillingItems();
            }
          }
          else {
            console.log("Couldn't load bill item prices. (appointment-main)");
          }
        });
    }
  }

  public SetAutoAddedAndNotAddedBillingItems() {
    this.autoAddedBillingItem = this.billingService.adtAdditionalBillItms.filter(d => d["IsAutoAdded"] == true)
    this.notAutoAddedBillingItem = this.billingService.adtAdditionalBillItms.filter(d => d["IsAutoAdded"] == false);

    this.autoAddedBillingItem.forEach((d, i) => {
      this.DefaultBillItemList.push(Object.assign(new BillingTransactionItem(), d));
      this.DefaultBillItemList[i].IsTaxApplicable = d.TaxApplicable;
    });

    this.Calculation();
  }

  ItemNameListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  public ItemChange(indx: number) {
    let selectedItem = this.selectedBillingRowData[indx];
    if (selectedItem && typeof (selectedItem) == "object") {
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



    if (this.CurrentAdmission.BillingTransaction.DiscountPercent == null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
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
    this.CurrentDeposit.DepositType = "Deposit";
    this.CurrentDeposit.PatientId = this.patientService.getGlobal().PatientId;
    this.CurrentDeposit.PaymentMode = 'cash';
    this.CurrentDeposit.PatientName = this.patientService.getGlobal().ShortName;
    this.CurrentDeposit.PhoneNumber = this.patientService.getGlobal().PhoneNumber;
    this.CurrentDeposit.PatientCode = this.patientService.getGlobal().PatientCode;
    this.CurrentDeposit.BillingUser = this.securityService.GetLoggedInUser().UserName;

    this.CurrentAdmission.IsPoliceCase = null;
    this.showInsuranceCheckBox = this.patientService.getGlobal().Ins_HasInsurance;
    this.isGovInsuranceAdmission = this.patientService.getGlobal().Ins_HasInsurance;
    this.CurrentAdmission.Ins_HasInsurance = this.isGovInsuranceAdmission;
    this.CurrentAdmission.Ins_NshiNumber = this.patientService.getGlobal().Ins_NshiNumber;
    this.CurrentAdmission.Ins_InsuranceBalance = this.patientService.getGlobal().Ins_InsuranceBalance;
    this.CurrentAdmission.BillingTransaction.PaymentMode = this.isGovInsuranceAdmission ? "credit" : "cash";


  }
  public EnableAutoGenerate: boolean = true;
  Loadparameters() {
    let Parameter = this.coreService.Parameters;

    //EnableAutoGenerate
    let claimCodeParam = this.coreService.Parameters.find(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "ClaimCodeAutoGenerateSettings");
    let claimparmObj = JSON.parse(claimCodeParam.ParameterValue);
    this.EnableAutoGenerate = claimparmObj.EnableAutoGenerate;
    if (this.isGovInsuranceAdmission == true) {
      this.CurrentAdmission.EnableControl("ClaimCode", true);
      this.GetClaimcode();
    }
    else {
      this.CurrentAdmission.EnableControl("ClaimCode", false);
    }

  }
  GovInsuranceAdmissionChange() {
    if (this.isGovInsuranceAdmission && this.isGovInsuranceAdmission == true) {
      this.CurrentAdmission.Ins_HasInsurance = true;
      this.CurrentAdmission.BillingTransaction.PaymentMode = 'credit';
    } else {
      this.CurrentAdmission.Ins_HasInsurance = false;
    }
  }
  GetClaimcode() {
    if (this.claimCodeType == "new") {
      this.GetNewClaimcode();
    }
    else if (this.claimCodeType == "old") {
      this.GetOldClaimcode();
    }
  }
  GetNewClaimcode() {
    this.admissionBLService.GetNewClaimcode()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.CurrentAdmission.ClaimCode = res.Results;
        }
        else if (res.Status == "Failed") {
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
  GetOldClaimcode() {
    this.admissionBLService.GetOldClaimcode(this.CurrentAdmission.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.CurrentAdmission.ClaimCode = res.Results
        }
        else if (res.Status == "Failed") {
          this.CurrentAdmission.ClaimCode = res.Results;
          this.msgBoxServ.showMessage("warning", [res.ErrorMessage]);
          console.log(res.Errors);
          this.claimCodeType = "new";
          this.GetNewClaimcode();
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
        if (res.Status == "OK") {
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
      if (adtDoc && adtDoc.Key > 0) { this.selectedProvider = adtDoc.Value; }
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
        if (res.Status == "OK")
          this.CalculatePatDepositBalance(res.Results);
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      })
  }

  CalculatePatDepositBalance(data) {
    let depositAmount = 0;
    let returnDepositAmount = 0;
    let depositDeductAmount = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].DepositType == "Deposit") {
        depositAmount = data[i].DepositAmount;
      }
      else if (data[i].DepositType == "ReturnDeposit") {
        returnDepositAmount = data[i].DepositAmount;
      }
      else if (data[i].DepositType == "depositdeduct") {
        depositDeductAmount = data[i].DepositAmount;
      }
    }
    this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(depositAmount - returnDepositAmount - depositDeductAmount);
  }

  CallBackGenerateDoctor(res) {
    if (res.Status == "OK") {
      this.doctorList = [];
      if (res && res.Results) {

        //changed the api in bl, so the return type of doctor list is as below.
        res.Results.forEach(a => {
          this.doctorList.push({ "Key": a.ProviderId, "Value": a.ProviderName, "DepartmentId": a.DepartmentId, "DepartmentName": a.DepartmentName });
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
    //if (this.selectedProvider) {
    //  this.CurrentAdmission.AdmittingDoctorId = this.selectedProvider ? this.selectedProvider.Key : null;
    //  if (!this.CurrentAdmission.AdmittingDoctorId) {
    //    this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return;
    //  }
    //}


    

    //This is to stop saving admission if billing is enabled but there are no billing items present.
    if(this.admissionSettings.IsBillingEnabled){
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
      // this.msgBoxServ.showMessage("failed", ["Insurance Balance not sufficient."]);
      validationSummary.isValid = false;
      validationSummary.message.push("Insurance Balance not sufficient.");
    }

    if (this.selectedProvider) {
      this.CurrentAdmission.AdmittingDoctorId = this.selectedProvider ? this.selectedProvider.Key : null;
    }

    this.CheckForStrInDoctor();

    if (!this.CurrentAdmission.AdmittingDoctorId && this.AdmittingDoctorMandatory) {
      this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return;
    }

    for (var i in this.CurrentAdmission.AdmissionValidator.controls) {
      this.CurrentAdmission.AdmissionValidator.controls[i].markAsDirty();
      this.CurrentAdmission.AdmissionValidator.controls[i].updateValueAndValidity();
    }
    for (var i in this.CurrentPatientBedInfo.PatientBedInfoValidator.controls) {
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].markAsDirty();
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].updateValueAndValidity();
    }


    this.SaveAdmission();//sud:1-Oct'21--No need to check for duplicate claimcode until we enable manual entry.

    // //NageshBB- check is it gov insurance patient then get new claim code again , if now claim code is assigned with value then no worry, but if there any issue like limit reached or other then return and show message
    // if (this.isGovInsuranceAdmission == true) {
    //   this.CheckDuplicateClaimCode();
    // }
    // else {
    //   this.SaveAdmission();
    // }


  }
  public SaveAdmission() {

    if (this.CurrentAdmission.IsValidCheck(undefined, undefined) && this.CurrentPatientBedInfo.IsValidCheck(undefined, undefined)) {
      if (!(this.CurrentAdmission.BillingTransaction.Remarks && this.CurrentAdmission.BillingTransaction.Remarks.length) &&
        (this.CurrentAdmission.BillingTransaction.DiscountPercent || this.CurrentAdmission.Ins_HasInsurance || this.CurrentAdmission.BillingTransaction.PaymentMode == 'credit')) {
        this.msgBoxServ.showMessage("failed", ["Billing Remarks is required."]);
        this.loading = false;
        return;
      }

      if (this.CurrentAdmission.BillingTransaction.Remarks && this.CurrentAdmission.BillingTransaction.Remarks.trim().length === 0) {
        this.msgBoxServ.showMessage("failed", ["Billing Remarks is required."]);
        this.loading = false;
        return;
      }

      this.loading = true;
      this.coreService.loading = true;

      this.AdditionBillItemList.forEach(b => {
        if (b && b.ItemId) {
          this.CurrentAdmission.BillingTransaction.BillingTransactionItems.push(b);
        }
      });

      this.DefaultBillItemList.forEach(b => {
        if (b && b.ItemId) {
          this.CurrentAdmission.BillingTransaction.BillingTransactionItems.push(b);
        }
      });


      //HotFix 27th Dec, 2018
      if (this.CurrentDeposit.Amount > 0) {
        this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(this.CurrentDeposit.DepositBalance + this.CurrentDeposit.Amount);
      }

      this.CurrentAdmission.IsBillingEnabled = this.admissionSettings.IsBillingEnabled;
      this.CurrentAdmission.BillingTransaction.IsInsuranceBilling = this.CurrentAdmission.Ins_HasInsurance;
      if (this.CurrentAdmission.BillingTransaction.IsInsuranceBilling) {
        this.CurrentAdmission.BillingTransaction.BillingTransactionItems.forEach(a => {
          a.IsInsurance = true;
        });
      }
      this.CurrentAdmission.BillingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;
      this.CurrentAdmission.PatientBedInfos = [];

      //Sud:1-Oct'21: Assign LastClaimCode Used property before submisssion.
      this.CurrentAdmission.IsLastClaimCodeUsed = this.claimCodeType == "old" ? true : false;


      this.admissionBLService.PostAdmission(this.CurrentAdmission, this.CurrentPatientBedInfo, this.CurrentDeposit, this.CurrentAdmission.BillingTransaction)
        .subscribe(
          res => {
            if (res.Status == "OK" && res.Results) {
              this.coreService.loading = false;
              let retObj = res.Results;
              this.patientVisitId = res.Results.PatientVisitId;
              if (this.CurrentDeposit.Amount > 0) {
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
              this.CurrentAdmission.BillingTransaction.BillingTransactionItems = [];
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

  //public CallBackAddVisit() {
  //    if (this.CurrentDeposit.Amount > 0)
  //        this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(this.CurrentDeposit.DepositBalance + this.CurrentDeposit.Amount);
  //    this.CurrentDeposit.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //    this.CurrentDeposit.PatientVisitId = res.PatientVisitId;
  //    this.CurrentAdmission.PatientVisitId = res.PatientVisitId;
  //    this.CurrentPatientBedInfo.PatientVisitId = res.PatientVisitId;
  //    this.billTxnItems.push(this.bedBilItem);
  //    this.billTxnItems.forEach(a => {
  //        a.PatientVisitId = res.PatientVisitId;
  //    });
  //    this.admissionBLService.PostAdmission(this.CurrentAdmission, this.CurrentPatientBedInfo, this.CurrentDeposit)
  //        .subscribe(
  //            res => {
  //                if (res.Status == "OK") {
  //                    this.patientVisitId = this.CurrentAdmission.PatientVisitId;
  //                    if (this.CurrentDeposit.Amount > 0) {
  //                        Object.assign(this.CurrentDeposit, res.Results.BilDeposit);
  //                        this.showDepositReceipt = true;
  //                        this.changeDetector.detectChanges();
  //                    }
  //                    this.showSticker = true;
  //                    this.msgBoxServ.showMessage("success", ["Patient admitted successfully."]);
  //                }
  //                else {
  //                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  //                }
  //            });
  //}
  CheckDuplicateClaimCode() {
    this.admissionBLService.GetInsVisitList(this.CurrentAdmission.ClaimCode, this.CurrentAdmission.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.prevVisitList = res.Results;
          if (this.prevVisitList && this.prevVisitList.length != 0) {
            this.msgBoxServ.showMessage('Failed', ["Claim code cannot be duplicate"]);
            this.msgBoxServ.showMessage('Failed', ["Please use another claim code"]);
            this.loading = false;
            //return;
          }
          else {
            this.SaveAdmission();
          }
        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage('Failed', [res.ErrorMessage]);
        }
      });
  }
  //get ward list in dropdown.
  GetwardList() {
    try {
      this.admissionBLService.GetWards()
        .subscribe(res => {
          if (res.Status == "OK") {
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

      this.admissionBLService.GetWardBedFeatures(wardId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.bedFeatureList = res.Results;
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
  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    if (wardId && bedFeatureId) {
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
    if (this.selectedProvider) {
      this.CurrentPatientBedInfo.RequestingDeptId = this.selectedProvider.DepartmentId;
      this.CurrentAdmission.RequestingDeptId = this.selectedProvider.DepartmentId;

      //currently we already have department name in doctor object, so we don't have to filter from departmentlist.
      this.selectedDept = this.selectedProvider.DepartmentName;
      //let dept = this.deptList.find(a => a.Key == this.selectedProvider.DepartmentId);

      //if (dept) {
      //  this.selectedDept = dept.Value;
      //}

      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.selectedProvider.DepartmentId);
    }
  }

  public CheckForStrInDoctor() {
    if (typeof (this.selectedProvider) == 'string') {
      let doc = this.doctorList.find(d => d.Value == this.selectedProvider);
      if (doc) {
        this.CurrentAdmission.AdmittingDoctorId = doc.Key;
        return;
      }
      this.CurrentAdmission.AdmittingDoctorId = null;
    }
  }

  public FilterDoctorList() {
    let deptId = 0;
    if (typeof (this.selectedDept) == 'string') {

      let dept = this.deptList.find(a => a.Value.toLowerCase() == String(this.selectedDept).toLowerCase());
      if (dept) {
        deptId = dept.Key;
      }
    }
    else if (typeof (this.selectedDept) == 'object' && this.selectedDept && this.selectedDept.Key) {
      let dept = this.deptList.find(a => a.Key == this.selectedDept.Key);
      if (dept) {
        deptId = dept.Key;
      }
    }
    this.CurrentAdmission.AdmittingDoctorId = null;
    this.selectedProvider = "";
    if (deptId > 0) {
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == deptId);
      this.CurrentPatientBedInfo.RequestingDeptId = deptId
      this.CurrentAdmission.RequestingDeptId = deptId;
    }
    else {
      this.filteredDocList = this.doctorList;
      this.selectedDept = null;
    }

  }

  public BedChanged(bed: any, curr: number) {
    var bedRes = this.bedList.find(b => b.BedId == bed && b.IsReserved);
    if (bedRes && (this.reservedBedIdByPat != bedRes.BedId)) {
      this.msgBoxServ.showMessage("error", ['Cannot reserve this bed. This bed is already reserved by '
        + bedRes.ReservedByPatient + ' for date: ' + moment(bedRes.ReservedForDate).format('YYYY-MM-DD HH:mm')]);
      this.changeDetector.detectChanges();
      this.CurrentPatientBedInfo.BedId = null;
    } else if (bed == 0) {
      this.msgBoxServ.showMessage("error", ["Cannot put bed value as 'Select bed'"])
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
    if (value != null && value != "") {
      //this.FilterDoctorList();
      if (value == "cheque" || value == "card") {
        this.setFocusById('PaymentDetails')
        return;
      }
      if (value.BedId != null && this.CurrentAdmission.Ins_HasInsurance) {
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
    if (this.AdmittingDoctorMandatory && !this.selectedProvider) {
      this.setFocusById('AdmittingDoctorId');
    } else {
      this.setFocusById('WardId');
    }
  }

  setFocusAfterChange() {
    if (this.admissionSettings.IsDepositEnabled) {
      this.setFocusById('DepositAmount')
    }
    else if (this.CurrentAdmission.Ins_HasInsurance) {
      this.setFocusById('Remarks')
    } else {
      this.setFocusById('SaveAdmission')
    }
  }

  //Anjana:11May,'21: to allow membership selection while admission
  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  OnMembershipChanged($event: Membership) {
    if ($event) {
      this.disableDiscountField = ($event.MembershipTypeName.toLowerCase() == "general") && ($event.DiscountPercent == 0);
      this.CurrentAdmission.DiscountSchemeId = $event.MembershipTypeId;
      this.CurrentAdmission.IsValidMembershipTypeName = true;
      let discount = $event.DiscountPercent;
      this.CurrentAdmission.BillingTransaction.DiscountPercent = discount;
      this.Calculation();
    }
    else {
      this.CurrentAdmission.DiscountSchemeId = null;
      this.CurrentAdmission.IsValidMembershipTypeName = false;
      // this.CurrentAdmission.BillingTransaction.Remarks = null;
    }

    //we've to set remarks as that of discount percent
    if ($event && $event.MembershipTypeName.toLowerCase() != "general") {
      this.CurrentAdmission.BillingTransaction.Remarks = $event.MembershipTypeName;
    }
    // else {
    //   this.CurrentAdmission.BillingTransaction.Remarks = null;
    // }
  }



}
