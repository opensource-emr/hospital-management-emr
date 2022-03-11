import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import * as moment from 'moment/moment';
import { AdmissionCancelVM } from "../../shared/admission.view.model";
import { AdmissionInfoVM } from "../../shared/admission.view.model";
import { ADT_BLService } from '../../shared/adt.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as _ from 'lodash';
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { PatientService } from '../../../patients/shared/patient.service';
import { BillingDeposit } from '../../../billing/shared/billing-deposit.model';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: 'admission-cancel',
  templateUrl: "./admission-cancel.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class AdmissionCancelComponent {

  @Output("on-cancel-closed")
  public cancel = new EventEmitter<object>();

  @Input("patientId")
  public patientId: number = 0;

  @Input("ipVisitId")
  public ipVisitId: number = 0;
  public admissionInfo: AdmissionInfoVM; //to get the required information to show in Pop Up
  public admissionCancel: AdmissionCancelVM = new AdmissionCancelVM(); //to post cancelled information i.e, remarks and date
  public cancelDate: NepaliDate;
  public loading: boolean = false;
  // public currencyUnit: string;
  public showReceipt: boolean = false;
  public showReceiptPopUp: boolean = false;
  public showpatientInfoPopUp: boolean = false;
  public returnDepositInfo: BillingDeposit;
  public calType: string = "";

  constructor(
    public coreService: CoreService,
    public patientservice: PatientService,
    public dlService: DLService,
    public admissionBLService: ADT_BLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService) {
    this.LoadCalendarTypes();
    this.admissionCancel.CancelledOn = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    //this.currencyUnit = this.admissionBLService.currencyUnit;
    if (this.ipVisitId && this.patientId) {
      this.LoadCancelPatientInfo(this.patientId, this.ipVisitId);
      this.admissionCancel.PatientVisitId = this.ipVisitId;
      this.admissionCancel.PatientId = this.patientId;
    }
    else {
      this.ClosePopUp(false);
    }
  }

  LoadCancelPatientInfo(patientId: number, patientVisitId: number) {
    this.dlService.Read("/api/Admission?reqType=get-pat-adt-info&patientId=" + this.patientId + "&ipVisitId=" + this.ipVisitId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.admissionInfo = new AdmissionInfoVM();
          this.admissionInfo = res.Results;
          this.showpatientInfoPopUp = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [" Unable to get The Details."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  CancelAdmission() {
    if ((moment(this.admissionCancel.CancelledOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0)) {
      this.msgBoxServ.showMessage("failed", ["Enter valid Cancelled date"]);
      return;
    }
    if (!this.admissionCancel.CancelledRemark) {
      this.msgBoxServ.showMessage("failed", ["Remarks are mandatory"]);
      return;
    }
    this.loading = true;
    this.admissionBLService.CheckAdmissionCancelled(this.admissionCancel)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.showpatientInfoPopUp = false;
          if (res.Results) {
            this.returnDepositInfo = res.Results;
            this.returnDepositInfo.PatientName = this.admissionInfo.PatientName;
            this.returnDepositInfo.PatientCode = this.admissionInfo.PatientCode;
            this.returnDepositInfo.PhoneNumber = this.admissionInfo.PhoneNumber;
            this.showReceiptPopUp = true;
            this.showReceipt = true;
            this.loading = false;
          }
          else {
            this.loading = false;
            this.ClosePopUp(false);
          }
          if (this.returnDepositInfo && this.returnDepositInfo.Amount)
            this.msgBoxServ.showMessage("success", ["Cancelled and Amount " + this.coreService.currencyUnit + this.returnDepositInfo.Amount + " returned successfully."]);
          else
            this.msgBoxServ.showMessage("success", ["Cancelled Successfully."]);

          this.loading = false;
        }
        else {

          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          this.loading = false;
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get credit details.. please check log for details.']);
          this.logError(err.ErrorMessage);
          this.loading = false;
        });
  }

  CloseAlertPopUp() {
    if (!this.loading) {
      this.loading = true;
      this.showReceiptPopUp = false;
      this.ClosePopUp(false);
    }
    this.loading = false;
  }

  ClosePopUp(showConfirmAlert = true) {
    //if (showConfirmAlert) {
    //    //we need to be sure if the user wants to close the window.
    //    let sure = window.confirm("Are you sure you want to abort admission cancel?");
    //    if (sure) {
    //        this.cancel.emit({ CloseWindow: true });
    //    }
    //}
    //else {
    //    this.cancel.emit({ CloseWindow: true });
    //}
    this.cancel.emit({ CloseWindow: true });
  }

  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes() {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.PatientRegistration;
  }

  logError(err: any) {
    console.log(err);
  }

  CancelAdmissionAlertPopUp() {
    //we need to be sure if the user wants to cancel admission or not.
    let sure = window.confirm("Are you sure you want to cancel admission?");
    if (sure) {
      this.CancelAdmission();
    }
    else {
      this.cancel.emit({ CloseWindow: true });
    }
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.ClosePopUp();
    }
  }
}
