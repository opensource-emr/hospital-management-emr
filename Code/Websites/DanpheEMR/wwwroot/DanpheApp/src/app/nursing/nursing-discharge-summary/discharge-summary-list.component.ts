
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
//import { ADT_BLService } from '../shared/adt.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
//import { Admission } from "../shared/admission.model";
//import { DischargeSummary } from "../shared/discharge-summary.model";
//import { PatientBedInfo } from "../shared/patient-bed-info.model";
import { SecurityService } from '../../security/shared/security.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { CoreService } from '../../core/shared/core.service';
//import { ADTGridColumnSettings } from '../shared/adt-grid-column-settings';
//import { DischargeCancel } from '../shared/dischage-cancel.model';
import { CallbackService } from '../../shared/callback.service';

import { Admission } from '../../adt/shared/admission.model';
import { DischargeCancel } from '../../adt/shared/dischage-cancel.model';
import { ADTGridColumnSettings } from '../../adt/shared/adt-grid-column-settings';
import { ADT_BLService } from '../../adt/shared/adt.bl.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./discharge-summary-list.html"
})

export class DischargeSummaryListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public currentDate: string = null;
  public dischargedList: any[];
  public dischargedListGridColumns: Array<any> = null;
  public admission: Admission = new Admission();
  public selectedDischarge: any;
  public selectedDischargeCancel: DischargeCancel = new DischargeCancel();
  public showDischargedList: boolean = true;
  public showDischargeSummaryAdd: boolean = false;
  public showSummaryView: boolean = false;
  public selectedIndex: number;
  public adtGriColumns: ADTGridColumnSettings = null;//sud: 10Jan'19-- to use parameterized grid-columns, we created separate class for ADT-Grid-Columns.
  public IsCancelDischargePage: boolean = false;

  public dischargeSummaryAdmittedList: any;
  public showAdmittedList: boolean = false;
  public dischargeSummaryAdmittedListGridColumns: any = null;
  public dateRangeDischargedList: string;
  public dateRangeAdmittedList: string;
  public today: string;
  public selectedClassObj = { sel: "label label-default btn btn-primary", dis: "label label-default btn btn-default" }
  public wentFrom: string = null; // either from admitted patient or discharged patinet list
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public NepaliDateForAdmittedPatientsInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public router: Router,
    public admissionBLService: ADT_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public callbackservice: CallbackService) {

    this.dateRangeDischargedList = "lastWeek";
    this.dateRangeAdmittedList = "custom";
    //this.today = moment().format('YYYY-MM-DD');

    // Uncomment this below code if need to select counter before proceding to discharge summary
    //if (this.securityService.getLoggedInCounter().CounterId < 1) {
    //  this.callbackservice.CallbackRoute = '/Nursing/DischargeSummary'
    //  this.router.navigate(['/Billing/CounterActivate']);
    //}
    //else {}
    this.adtGriColumns = new ADTGridColumnSettings(this.coreService, this.securityService);
    this.dischargedListGridColumns = this.adtGriColumns.NursingDischargedList;

    this.dischargeSummaryAdmittedListGridColumns = this.adtGriColumns.DischargeSummaryAdmittedList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmittedDate", true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DischargedDate", true));
    this.NepaliDateForAdmittedPatientsInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmittedDate", true));

  }
  Load() {
    if (this.checkDateValidation()) {
      try {

        this.GetDischargedPatientsList();
        // this.admissionBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
        //   .subscribe(res => {
        //     if (res.Status == 'OK') {
        //       this.dischargedList = res.Results;
        //     }
        //     else {
        //       this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        //     }
        //   },
        //     err => {
        //       this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        //     });
      }
      catch (exception) {
        this.ShowCatchErrMessage(exception);
      }
    }
  }
  checkDateValidation() {
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  GetDischargedPatientsList(): void {
    this.admissionBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.dischargedList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
  }
  DischargedListGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "dischargeSummary": {
        this.selectedDischarge = null;
        this.changeDetector.detectChanges();
        this.selectedDischarge = $event.Data;
        this.showDischargedList = false;
        this.wentFrom = 'dischargedList';
        if (this.selectedDischarge.IsSubmitted)
          this.showSummaryView = true;
        else
          this.showDischargeSummaryAdd = true;
        break;
      }
      case "clear-due": {
        this.selectedDischarge = $event.Data;
        this.selectedIndex = $event.RowIndex;
        this.mapAdmission();
        this.ClearDue();
        break;
      }
      case "discharge-cancel": {
        this.selectedDischarge = $event.Data;
        this.selectedIndex = $event.RowIndex;
        this.IsCancelDischargePage = true;
        this.selectedDischargeCancel = new DischargeCancel();
        break;
      }
      default:
        break;
    }
  }

  mapAdmission() {
    _.assign(this.admission, _.pick(this.selectedDischarge, _.keys(this.admission)));
    this.admission.AdmissionDate = moment(this.selectedDischarge.AdmittedOn).format('YYYY-MM-DDTHH:mm');
    this.admission.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
  }
  ClearDue() {
    this.admissionBLService.CheckPatientCreditBillStatus(this.selectedDischarge.PatientVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results) {
            this.msgBoxServ.showMessage("failed", ["Clear the due before proceeding.Total Due=" + res.Results]);
          }
          //clear due
          else {
            this.admissionBLService.ClearDue(this.admission.PatientVisitId)
              .subscribe(res => {
                if (res.Status == "OK") {
                  this.msgBoxServ.showMessage("success", ["Cleared Patient due"]);
                  this.dischargedList[this.selectedIndex].BillStatusOnDischarge = "paid";
                  this.dischargedList = this.dischargedList.slice();
                }
                else {
                  this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
              },
                err => {
                  this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
          }

        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get credit details.. please check log for details.']);
          this.logError(err.ErrorMessage);
        });
  }

  HideDischargeSummary() {
    this.showDischargeSummaryAdd = false;
    this.showSummaryView = false;
    if (this.wentFrom == 'admittedList') {
      this.showAdmittedList = true;
      this.AllAdmittedPatientList();

    } else {
      this.showDischargedList = true;
      this.GetDischargedPatientsList();

    }
  }
  logError(err: any) {
    console.log(err);
  }
  CancelDischarge() {
    this.selectedDischargeCancel.PatientVisitId = this.selectedDischarge.PatientVisitId;
    this.selectedDischargeCancel.PatientAdmissionId = this.selectedDischarge.PatientAdmissionId;
    this.selectedDischargeCancel.DischargedDate = this.selectedDischarge.DischargedDate;
    this.selectedDischargeCancel.DischargedBy = this.selectedDischarge.DischargedBy;
    this.selectedDischargeCancel.CounterId = this.securityService.getLoggedInCounter().CounterId;

    for (var i in this.selectedDischargeCancel.DischargeCancelValidator.controls) {
      this.selectedDischargeCancel.DischargeCancelValidator.controls[i].markAsDirty();
      this.selectedDischargeCancel.DischargeCancelValidator.controls[i].updateValueAndValidity();
    }
    if (this.selectedDischargeCancel.IsValidCheck(undefined, undefined)) {
      this.selectedDischargeCancel.CreatedOn = moment().format("YYYY-MM-DD");
      this.admissionBLService.PostDischargeCancelBill(this.selectedDischargeCancel)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("Success", ["Discharged of Patient is cancelled Successfully.."]);
            this.IsCancelDischargePage = false;
            this.router.navigate(['/Billing/InpatBilling']);
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
    else {
      this.msgBoxServ.showMessage("error", ["Enter Cancel Reason."]);
    }
  }
  Close() {
    this.IsCancelDischargePage = false;
    this.selectedDischarge = null;
    this.selectedDischargeCancel = new DischargeCancel();
  }

  AllAdmittedPatientList() {
    try {
      this.admissionBLService.GetAdmittedPatients() // all the admitted patient list without date range
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.dischargeSummaryAdmittedList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  LoadAdmittedPatientList() { // get all the admitted patient list within the date range

    if (this.checkDateValidation()) {
      try {
        this.admissionBLService.GetAdmittedPatientsList(this.fromDate, this.toDate)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.dischargeSummaryAdmittedList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
          },
            err => {
              this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
            });
      }
      catch (exception) {
        this.ShowCatchErrMessage(exception);
      }
    }
  }

  DischargeSummaryAdmittedListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "dischargeSummary": {
        this.selectedDischarge = null;
        this.changeDetector.detectChanges();
        this.selectedDischarge = $event.Data;
        this.wentFrom = 'admittedList';
        this.showAdmittedList = false;
        if (this.selectedDischarge.IsSubmitted)
          this.showSummaryView = true;
        else
          this.showDischargeSummaryAdd = true;
        break;
      }

      default: break;
    }
  }

  public DischargeListTabClicked() {
    this.showAdmittedList = false;
    this.showDischargeSummaryAdd = false;
    this.showSummaryView = false;
    this.showDischargedList = true;
  }

  public AdmittedListTabClicked() {
    this.showDischargedList = false;
    this.showDischargeSummaryAdd = false;
    this.showSummaryView = false;
    this.showAdmittedList = true;
    this.AllAdmittedPatientList();
  }
  onDateChangeAdmittedList($event) {

    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.LoadAdmittedPatientList();
  }
  onDateChangeDischargedList($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.Load();
  }
  SummaryAddCallBack(data) {
    this.HideDischargeSummary();
  }

  public CallbackFromViewPage(data) {
    this.showSummaryView = false;
    this.showDischargeSummaryAdd = true;
  }

  public CallBackFromAddEdit(data){
    this.showDischargeSummaryAdd = false;
    this.showSummaryView = true;   
  }

}

