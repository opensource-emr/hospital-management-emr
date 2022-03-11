import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { PatientService } from '../../patients/shared/patient.service';
import { ADT_BLService } from '../shared/adt.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Admission } from "../shared/admission.model";
import { DischargeSummary } from "../shared/discharge-summary.model";
import { PatientBedInfo } from "../shared/patient-bed-info.model";
import { SecurityService } from '../../security/shared/security.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { CoreService } from '../../core/shared/core.service';
import { ADTGridColumnSettings } from '../shared/adt-grid-column-settings';
import { DischargeCancel } from '../shared/dischage-cancel.model';
import { CallbackService } from '../../shared/callback.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./discharge-list.html"
})

export class DischargedListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public currentDate: string = null;
  public dischargedList: any[];
  dischargedListGridColumns: Array<any> = null;
  public admission: Admission = new Admission();
  public selectedDischarge: any;
  public selectedDischargeCancel: DischargeCancel = new DischargeCancel();
  public showDischargedList: boolean = true;
  public showDischargeSummary: boolean = false;
  public showSummaryView: boolean = false;
  public selectedIndex: number;
  public adtGriColumns: ADTGridColumnSettings = null;//sud: 10Jan'19-- to use parameterized grid-columns, we created separate class for ADT-Grid-Columns.
  public IsCancelDischargePage: boolean = false;
  public showIsInsurancePatient: boolean = false;
  public allItemList = [];
  public filteredItemList = []

  loading: boolean = false;
  public showPoliceCase: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public router: Router,
    public admissionBLService: ADT_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public callbackservice: CallbackService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/ADTMain/DischargedList'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.adtGriColumns = new ADTGridColumnSettings(this.coreService, this.securityService);
      this.dischargedListGridColumns = this.adtGriColumns.DischargedList;
      this.Load();
    }
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('DischargedDate', true));
  }
  Load() {
    if (this.checkDateValidation()) {
      try {
        this.GetDischargedPatientsList();
        // this.admissionBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
        //   .subscribe(res => {
        //     if (res.Status == 'OK') {
        //       if(this.showPoliceCase){
        //         this.dischargedList = res.Results.filter(d => d.IsPoliceCase == true);
        //       }else{
        //         this.dischargedList = res.Results;
        //       }

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
          this.allItemList = res.Results;
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
        if (this.selectedDischarge.IsSubmitted)
          this.showSummaryView = true;
        else
          this.showDischargeSummary = true;
        break;
      }
      case "clear-due": {
        this.selectedDischarge = $event.Data;
        this.selectedIndex = $event.RowIndex;
        this.mapAdmission();
        this.ClearDue();
        break;
      }
      //sud:3May'21--Hiding Discharge Cancel functionality since Credit Note is introduced in Billing.
      // case "discharge-cancel": {
      //   this.selectedDischarge = $event.Data;
      //   this.selectedIndex = $event.RowIndex;
      //   this.IsCancelDischargePage = true;
      //   this.selectedDischargeCancel = new DischargeCancel();
      //   break;
      // }
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
    this.showDischargeSummary = false;
    this.showSummaryView = false;
    this.GetDischargedPatientsList();
    this.showDischargedList = true;
  }
  logError(err: any) {
    console.log(err);
  }
  CancelDischarge() {
    this.loading = true;
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
            this.loading = false;
            this.router.navigate(['/Billing/InpatBilling']);
          }
          else {
            this.loading = false;
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.loading = false;
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
    else {
      this.loading = false;
      this.msgBoxServ.showMessage("error", ["Enter Cancel Reason."]);
    }
  }
  Close() {
    this.IsCancelDischargePage = false;
    this.selectedDischarge = null;
    this.selectedDischargeCancel = new DischargeCancel();
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        //this.GetPendingReportList(this.fromDate, this.toDate)
        this.Load();
      } else {
        //this.msgBoxService.showMessage("failed", ['Please enter valid From date and To date']);
        console.log("not a valid date");
      }

    }
  }
  public DischargeSummaryCallback(data) {
    if (data.Status == "Ok") {
      this.HideDischargeSummary();
    }
  }

  public FilterGridItems(event) {
    this.filteredItemList = [];
    if (this.showPoliceCase && this.showIsInsurancePatient) {
      this.filteredItemList = this.allItemList.filter(s => s.IsInsurancePatient == true || s.IsPoliceCase == true);
    }
    else if (this.showIsInsurancePatient && !this.showPoliceCase) {
      this.filteredItemList = this.allItemList.filter(s => s.IsInsurancePatient == true);
    }
    else if (!this.showIsInsurancePatient && this.showPoliceCase) {
      this.filteredItemList = this.allItemList.filter(s => s.IsPoliceCase == true);
    }
    else {
      this.filteredItemList = this.allItemList;
    }
    this.dischargedList = this.filteredItemList;
  }

  public CallbackFromViewPage($event) {
    this.showSummaryView = false;
    this.showDischargeSummary = true;
  }
  public CallBackFromAddEdit(data){  
    this.showSummaryView = true;
    this.showDischargeSummary = false;
  }
}
