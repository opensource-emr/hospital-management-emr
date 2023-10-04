import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { DischargeCancel_DTO } from '../shared/DTOs/discharge-cancel.dto';
import { AdmissionModel } from "../shared/admission.model";
import { ADTGridColumnSettings } from '../shared/adt-grid-column-settings';
import { ADT_BLService } from '../shared/adt.bl.service';
import { Bed } from '../shared/bed.model';
import { DischargeCancel } from '../shared/dischage-cancel.model';
import { PatientBedInfo } from '../shared/patient-bed-info.model';

@Component({
  templateUrl: "./discharge-list.html"
})

export class DischargedListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public currentDate: string = null;
  public dischargedList: any[];
  dischargedListGridColumns: Array<any> = null;
  public admission: AdmissionModel = new AdmissionModel();
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
  public showDischargeSlip: boolean = false;
  public patientVisitId: number = 0;
  public previousBedOccupied: boolean = false;
  public PatientBedInfoNew = new PatientBedInfo();
  public bedList = new Array<Bed>();
  public DischargeCancelDto = new DischargeCancel_DTO();

  constructor(
    public router: Router,
    public admissionBLService: ADT_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public coreService: CoreService,
    public callbackservice: CallbackService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/ADTMain/DischargedList';
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
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() === true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() === true ? flag : false;
    flag = (this.toDate >= this.fromDate) === true ? flag : false;
    if (!flag) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  GetDischargedPatientsList(): void {
    this.admissionBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.dischargedList = res.Results;
          this.allItemList = res.Results;
          this.FilterGridItems(this.showIsInsurancePatient);
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
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
      //! Krishna, 30thJune'23, Opening this feature again as we need it now.
      case "discharge-cancel": {
        this.selectedDischarge = $event.Data;
        this.selectedIndex = $event.RowIndex;
        this.IsCancelDischargePage = true;
        this.selectedDischargeCancel = new DischargeCancel();
        break;
      }
      case "discharge-slip": {
        this.patientVisitId = $event.Data.PatientVisitId;
        this.changeDetector.detectChanges();
        this.showDischargeSlip = true;
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
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Clear the due before proceeding.Total Due=" + res.Results]);
          }
          //clear due
          else {
            this.admissionBLService.ClearDue(this.admission.PatientVisitId)
              .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Cleared Patient due"]);
                  this.dischargedList[this.selectedIndex].BillStatusOnDischarge = "paid";
                  this.dischargedList = this.dischargedList.slice();
                }
                else {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                }
              },
                err => {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
                });
          }

        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get credit details.. please check log for details.']);
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

    for (let i in this.selectedDischargeCancel.DischargeCancelValidator.controls) {
      this.selectedDischargeCancel.DischargeCancelValidator.controls[i].markAsDirty();
      this.selectedDischargeCancel.DischargeCancelValidator.controls[i].updateValueAndValidity();
    }
    if (this.selectedDischargeCancel.IsValidCheck(undefined, undefined)) {
      // this.selectedDischargeCancel.CreatedOn = moment().format("YYYY-MM-DD");
      // this.DischargeCancelDto.PatientVisitId = this.selectedDischargeCancel.PatientVisitId;
      // this.DischargeCancelDto.PatientAdmissionId = this.selectedDischargeCancel.PatientAdmissionId;
      // this.DischargeCancelDto.DischargedDate = this.selectedDischargeCancel.DischargedDate;
      // this.DischargeCancelDto.DischargedBy = this.selectedDischargeCancel.DischargedBy;
      // this.DischargeCancelDto.CounterId = this.selectedDischargeCancel.CounterId;
      // // this.DischargeCancelDto.DischargeCancel = this.selectedDischargeCancel;
      if (this.PatientBedInfoNew && this.PatientBedInfoNew.BedId > 0) {
        this.selectedDischargeCancel.NewBedId = +this.PatientBedInfoNew.BedId;
      }
      this.admissionBLService.PostDischargeCancelBill(this.selectedDischargeCancel)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.messageBoxService.showMessage("Success", ["Discharged of Patient is cancelled Successfully.."]);
            this.IsCancelDischargePage = false;
            this.loading = false;
            //this.router.navigate(['/Billing/InpatBilling']);
            this.GetDischargedPatientsList();
          }
          else {
            this.loading = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
          }
        },
          err => {
            this.loading = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
          });
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Enter Cancel Reason."]);
    }
  }

  IsPreviousBedAvailable() {
    const patientVisitId = this.selectedDischarge.PatientVisitId;
    this.admissionBLService.IsPreviousBedAvailable(patientVisitId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        const available = res.Results.available;
        this.PatientBedInfoNew = res.Results.bedInfo;
        this.bedList = res.Results.bedsInBedFeature;
        if (available) {
          this.CancelDischarge();
        } else {
          //! provide a feature to select the bed.
          this.previousBedOccupied = true;
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Previous Bed is Occupied, Please select a new Bed."]);
        }
      }
    });
  }

  Close() {
    this.IsCancelDischargePage = false;
    this.selectedDischarge = null;
    this.previousBedOccupied = false;
    this.selectedDischargeCancel = new DischargeCancel();
  }
  CloseRecieptView() {
    this.showDischargeSlip = false;
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate !== null && this.toDate !== null) {
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
    if (data.Status === ENUM_DanpheHTTPResponses.OK) {
      this.HideDischargeSummary();
    }
  }

  public FilterGridItems(event) {
    this.filteredItemList = [];
    if (this.showPoliceCase && this.showIsInsurancePatient) {
      this.filteredItemList = this.allItemList.filter(s => s.IsInsurancePatient === true || s.IsPoliceCase == true);
    }
    else if (this.showIsInsurancePatient && !this.showPoliceCase) {
      this.filteredItemList = this.allItemList.filter(s => s.IsInsurancePatient === true);
    }
    else if (!this.showIsInsurancePatient && this.showPoliceCase) {
      this.filteredItemList = this.allItemList.filter(s => s.IsPoliceCase === true);
    }
    else {
      this.filteredItemList = this.allItemList;
    }
    this.dischargedList = this.filteredItemList;
  }

  public CallbackFromViewPage($event) {
    this.showSummaryView = false;
    this.showDischargeSummary = true;
    this.showDischargedList = false;
  }
  public CallBackFromAddEdit(data) {
    this.showSummaryView = true;
    this.showDischargeSummary = false;
    this.showDischargedList = false;
  }

  public CloseDischargeSlip($event): void {
    if ($event === true) {
      this.showDischargeSlip = false;
    }
  }


}
