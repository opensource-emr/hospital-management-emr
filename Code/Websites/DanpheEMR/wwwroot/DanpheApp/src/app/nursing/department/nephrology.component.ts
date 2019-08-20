import { Component } from '@angular/core';

import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NursingBLService } from "../shared/nursing.bl.service";
import { PatientsBLService } from "../../patients/shared/patients.bl.service";
import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from "../../patients/shared/patient.service";

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { Patient } from "../../patients/shared/patient.model";
import { HemodialysisModel } from "../shared/hemodialysis.model";

@Component({
    selector: 'nursing-nephrology',
    templateUrl: './nephrology.html'
})
export class NephrologyComponent {
  public patList: Array<Patient> = new Array<Patient>();
  nurNephGridColumn: Array<any> = null;
  hemoReportList: Array<HemodialysisModel> = new Array<HemodialysisModel>();

  public reloadFrequency: number = 30000; //30000 =30 seconds: this is the frequency of new Pull-Request for OPD Patient List.
  public timer; ///timer variable to subscribe or unsubscribe the timer 
  public sub: Subscription;

  public patientId: number = null;
  public showHemoBox: boolean = false;
  public showLastHemoReport: boolean = false;
  public showPrintPage: boolean = false;
  public showNewForm: boolean = false;
  public showWarningBox: boolean = false;

  public globalPatient: any;

  public lastHemoReport: HemodialysisModel = new HemodialysisModel();
  public newHemoReport: HemodialysisModel = new HemodialysisModel();

  constructor(public nursingBLService: NursingBLService,
              public msgBoxServ: MessageboxService,
              public patientBLService: PatientsBLService,
              public patientService: PatientService,
              public visitService: VisitService
  ) {
    this.nurNephGridColumn = GridColumnSettings.NurNEPHList;
  }
  ngOnInit() {
    //we are using Timer function of Observable to Call the HTTP with angular timer
    //first Zero(0) means when component is loaded the timer is also start that time
    //seceond (60000) means after each 1 min timer will subscribe and It Perfrom HttpClient operation 
    this.timer = Observable.timer(0, this.reloadFrequency);
    // subscribing to a observable returns a subscription object
    this.sub = this.timer.subscribe(t => this.LoadPatientList(t));
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    clearInterval(this.timer);
    this.sub.unsubscribe();//IMPORTANT to unsubscribe after going away from current component.
  }
  LoadPatientList(tick) {
    this.nursingBLService.GetNephrologyPatients()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed to load data", [res.ErrorMessage]);
        }
      });
  }
  NurNephGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "add-report":
        {
          if ($event.Data) {
            this.patientId = $event.Data.PatientId;
            this.SetPatDataToGlobal($event.Data);
            this.lastHemoReport = new HemodialysisModel();
            this.newHemoReport = new HemodialysisModel();
            this.nursingBLService.PreviousReportList(this.patientId)
              .subscribe(res => {
                if (res.Status == "OK") {
                  this.hemoReportList = res.Results;
                }
              },
                err => {
                  this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
              });
            this.showLastHemoReport = false;
            this.showHemoBox = true;
            this.showNewForm = true;
          }
          break;
        }
      case "show-report":
        {
          if ($event.Data) {
            this.patientId = $event.Data.PatientId;
            this.SetPatDataToGlobal($event.Data);
            this.lastHemoReport = new HemodialysisModel();
            this.newHemoReport = new HemodialysisModel();
            this.nursingBLService.CheckForLastReport(this.patientId)
              .subscribe(res => {
                if (res.Status == 'OK') {
                  this.msgBoxServ.showMessage("Success", ["Old Report Found"]);
                  this.nursingBLService.PreviousReportList(this.patientId)
                    .subscribe(res => {
                      if (res.Status == 'OK') {
                        this.hemoReportList = res.Results;
                        this.lastHemoReport = this.hemoReportList[this.hemoReportList.length - 1];
                        this.showLastHemoReport = true;
                        this.showNewForm = false;
                        this.showHemoBox = true;
                      }
                    },
                      err => {
                        this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
                      });
                }
                else {
                  this.msgBoxServ.showMessage("Error", ["No Old Reports Found"]);
                }
              },
                err => {
                  this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
                });
          }
          break;
        }
    }
  }
  public Close(): void {
    this.showHemoBox = false;
    this.showLastHemoReport = false;
    this.showNewForm = false;
    this.showWarningBox = false;
    this.patientId = 0;
  }
  ClosePrintPage() {
    this.showPrintPage = false;
  }
  closeWarningPage() {
    this.showWarningBox = false;
  }


  public SetPatDataToGlobal(data) {
    this.globalPatient = this.patientService.CreateNewGlobal();
    this.globalPatient.PatientId = data.PatientId;
    this.globalPatient.PatientCode = data.PatientCode;
    this.globalPatient.ShortName = data.ShortName;
    this.globalPatient.DateOfBirth = data.DateOfBirth;
    this.globalPatient.Gender = data.Gender;
    this.globalPatient.PhoneNumber = data.PhoneNumber;
    this.globalPatient.Address = data.Address;
    this.globalPatient.Age = data.Age;
  }

  public printThisReport(index: number) {
    this.newHemoReport = this.hemoReportList[index];
    if (index != 0) {
      this.lastHemoReport = this.hemoReportList[index - 1];
    }
    this.showPrintPage = true;
  }

  public editThisReport(index: number) {
    this.newHemoReport = this.hemoReportList[index];
    if (index != 0) {
      this.lastHemoReport = this.hemoReportList[index - 1];
    }
    this.showNewForm = true;
  }
  public Warning(): void {
    this.showWarningBox = true;
  }
  public Submit(): void {
    if (this.newHemoReport) {
      this.showHemoBox = false;
      this.showLastHemoReport = false;
      this.showNewForm = false;
      this.showWarningBox = false;
      this.showPrintPage = true;
      this.newHemoReport.PatientId = this.globalPatient.PatientId;
      this.newHemoReport.IsSubmitted = true;
      this.nursingBLService.SubmitHemoReport(this.newHemoReport)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("success", ["New Hemodialysis Report Added"]);
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
    else
      this.msgBoxServ.showMessage("failed", ["Fill all the fields"]);

  }
  public temporarySave(): void {
    if (this.newHemoReport) {
      this.newHemoReport.PatientId = this.globalPatient.PatientId;
      this.newHemoReport.IsSubmitted = false;
      this.nursingBLService.SubmitHemoReport(this.newHemoReport)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("success", ["The Report Has Been Saved Temporarily."]);
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
    else
      this.msgBoxServ.showMessage("failed", ["Fill all the fields"]);
    this.showNewForm = false;
    this.showLastHemoReport = false;
    this.showHemoBox = false;

  }

  printHemoReport() {
    let popupWinindow;
    var printContents = document.getElementById("print-hemo-report").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600 ,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />` +
      `<style>.bold{font-weight: 700;}div{box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;} .col-md-4,.col-md-6,.col-md-8{float: left;} .col-md-4{width: 33.33%;} .col-md-6{width: 50%;} .col-md-8{width: 66.66%;}</style>` +
      `</head><body onload="window.print()">` + printContents + `</body></html>`);
    popupWinindow.document.close();
  }
}
