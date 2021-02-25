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
import { ENUM_ValidatorTypes } from "../../../shared/shared-enums";

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
  public currencyUnit: string;
  public showDepositReceipt: boolean = false;

  public CareofPersonNumberMandatory: boolean = true;

  public showReqDeptWarning: boolean = false;//sud:19Jun'18
  public loadPage: boolean = false;
  public wardList: Array<Ward> = new Array<Ward>();
  public showDepositTransferMessage: boolean = false; //yubraj: 7th Jan '19

  public CurrentBedReservation: BedReservationInfo = new BedReservationInfo();
  public reservedBedIdByPat: number = null;

  public admDate: string = null;

  constructor(
    public npCalendarService: NepaliCalendarService,
    public admissionBLService: ADT_BLService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService,
    public callbackservice: CallbackService,
    public router: Router,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService, ) {
    this.patientId = this.patientService.getGlobal().PatientId;
    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/ADTMain/AdmissionSearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.CareofPersonNumberMandatory = this.coreService.GetCareofPersonNoMandatory();
      console.log(this.CareofPersonNumberMandatory);
      this.Initialize();

      //this.LoadBillItemsAdmissionRelated();

      //this.GenerateDoctorList();
      //this.GenerateDeptList();
      //this.GetwardList();

      this.GetPatientDeposit();

      this.GetDocDptAndWardList();
    }
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    //this.CurrentAdmission.IsPoliceCase = this.patientService.getGlobal().IsPoliceCase;
    console.log(this.CurrentAdmission.IsPoliceCase);
    if (this.CareofPersonNumberMandatory) {
      CommonValidators.ComposeValidators(this.CurrentAdmission.AdmissionValidator, "CareOfPersonPhoneNo", [ENUM_ValidatorTypes.phoneNumber, ENUM_ValidatorTypes.required]);
    } 
    else {
      CommonValidators.ComposeValidators(this.CurrentAdmission.AdmissionValidator, "CareOfPersonPhoneNo", [ENUM_ValidatorTypes.phoneNumber]);
    }
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
    this.currencyUnit = this.billingService.currencyUnit;
    //initializing deposit model --ramavtar
    this.CurrentDeposit = new BillingDeposit();
    this.CurrentDeposit.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.CurrentDeposit.DepositType = "Deposit";
    this.CurrentDeposit.PatientId = this.patientService.getGlobal().PatientId;
    this.CurrentDeposit.PaymentMode = "cash";
    this.CurrentDeposit.PatientName = this.patientService.getGlobal().ShortName;
    this.CurrentDeposit.PhoneNumber = this.patientService.getGlobal().PhoneNumber;
    this.CurrentDeposit.PatientCode = this.patientService.getGlobal().PatientCode;
    this.CurrentDeposit.BillingUser = this.securityService.GetLoggedInUser().UserName;
    
    this.CurrentAdmission.IsPoliceCase = this.patientService.getGlobal().IsPoliceCase;
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
    //if(){
      console.log(this.loading)
    this.CurrentPatientBedInfo.StartedOn = this.CurrentAdmission.AdmissionDate;

    //if (this.selectedProvider) {
    //  this.CurrentAdmission.AdmittingDoctorId = this.selectedProvider ? this.selectedProvider.Key : null;
    //  if (!this.CurrentAdmission.AdmittingDoctorId) {
    //    this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return;
    //  }
    //}

    if (this.selectedProvider) {
      this.CurrentAdmission.AdmittingDoctorId = this.selectedProvider ? this.selectedProvider.Key : null;
    }
    this.CheckForStrInDoctor();
    if (!this.CurrentAdmission.AdmittingDoctorId) { this.msgBoxServ.showMessage("error", ['Please select Admitting DoctorName from List only !']); this.loading = false; return; }



    for (var i in this.CurrentAdmission.AdmissionValidator.controls) {
      this.CurrentAdmission.AdmissionValidator.controls[i].markAsDirty();
      this.CurrentAdmission.AdmissionValidator.controls[i].updateValueAndValidity();
    }
    for (var i in this.CurrentPatientBedInfo.PatientBedInfoValidator.controls) {
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].markAsDirty();
      this.CurrentPatientBedInfo.PatientBedInfoValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentAdmission.IsValidCheck(undefined, undefined) && this.CurrentPatientBedInfo.IsValidCheck(undefined, undefined)) {
      this.loading = true;
      //HotFix 27th Dec, 2018
      if (this.CurrentDeposit.Amount > 0)
        this.CurrentDeposit.DepositBalance = CommonFunctions.parseAmount(this.CurrentDeposit.DepositBalance + this.CurrentDeposit.Amount);
      this.admissionBLService.PostAdmission(this.CurrentAdmission, this.CurrentPatientBedInfo, this.CurrentDeposit)
        .subscribe(
          res => {
            if (res.Status == "OK" && res.Results) {
              this.patientVisitId = res.Results.PatientVisitId;
              if (this.CurrentDeposit.Amount > 0) {
                Object.assign(this.CurrentDeposit, res.Results.BilDeposit);
                this.showDepositReceipt = true;
                this.changeDetector.detectChanges();
              }
              this.showSticker = true;
              this.msgBoxServ.showMessage("success", ["Patient admitted successfully."]);
            }
            else {
              this.loading = false;
              this.msgBoxServ.showMessage("failed", ["Failed to admit patient."]);
              console.log(res.ErrorMessage);
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
      !useDataFromReservation ? this.CurrentPatientBedInfo.BedFeatureId = null : this.CurrentPatientBedInfo.BedFeatureId;
      this.bedList = null;
      this.CurrentPatientBedInfo.BedPrice = null;

      this.admissionBLService.GetWardBedFeatures(wardId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.bedFeatureList = res.Results;
              !useDataFromReservation ? this.CurrentPatientBedInfo.BedFeatureId = this.bedFeatureList[0].BedFeatureId : this.CurrentBedReservation.BedFeatureId;
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

  }
  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    if (wardId && bedFeatureId) {
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
  StickerPrintCallBack() {
    this.patientVisitId = null;
    this.showSticker = false;
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
    else if (typeof (this.selectedDept) == 'object' && this.selectedDept.Key) {
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
    else
      this.filteredDocList = this.doctorList;
  }

  public BedChanged(bed: any, curr: number) {
    var bedRes = this.bedList.find(b => b.BedId == bed && b.IsReserved);
    if (bedRes && (this.reservedBedIdByPat != bedRes.BedId)) {
      this.msgBoxServ.showMessage("error", ['Cannot reserve this bed. This bed is already reserved by '
        + bedRes.ReservedByPatient + ' for date: ' + moment(bedRes.ReservedForDate).format('YYYY-MM-DD HH:mm')]);
      this.changeDetector.detectChanges();
      this.CurrentPatientBedInfo.BedId = null;
    }else if(bed == 0){
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
}
