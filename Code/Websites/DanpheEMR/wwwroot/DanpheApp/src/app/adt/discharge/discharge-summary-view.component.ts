import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ADT_BLService } from '../shared/adt.bl.service';
import { DischargeSummary } from '../shared/discharge-summary.model';

import * as moment from 'moment/moment';

@Component({
  selector: 'discharge-summary-view1',
  templateUrl: './discharge-summary-view.html',
})
export class DischargeSummaryViewComponent {

  public dischargeSummary: DischargeSummary;
  @Input("selectedADT")
  public selectedADT: any;
  //public labResults: any;
  public labRequests: any;
  public imagingResults: any;
  public showSummaryView: boolean = false;

  constructor(public admissionBLService: ADT_BLService,
    public msgBoxServ: MessageboxService, ) {
  }

  @Input("showSummaryView")
  public set value(val: boolean) {
    this.showSummaryView = val;
    if (this.showSummaryView && this.selectedADT) {
      this.GetDischargeSummary();
      //this.GetLabResults();//commented: sud:9Aug'17--add it only after lab is implemented.
      this.GetLabRequests();
      this.GetImagingResults();
      this.FormatDates();
    }
  }
  FormatDates() {
    this.selectedADT.DOB = moment(this.selectedADT.DateOfBirth).format('YYYY-MM-DD');
    this.selectedADT.AdmittedDate = moment(this.selectedADT.AdmittedDate).format('YYYY-MM-DD hh:mm A');
    if (this.selectedADT.DischargedDate) {
      this.selectedADT.DischargedDate = moment(this.selectedADT.DischargedDate).format('YYYY-MM-DD hh:mm A');
    }
    else
      this.selectedADT.DischargedDate = moment().format('YYYY-MM-DD HH:mm A');

  }
  GetDischargeSummary() {
    this.admissionBLService.GetDischargeSummary(this.selectedADT.PatientVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results)
            this.dischargeSummary = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.'], err.ErrorMessage);
        });
  }

  //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
  public GetLabRequests() {
    this.admissionBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.labRequests = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
          this.logError(err.ErrorMessage);
        });
  }

  //public GetLabResults() {
  //    this.admissionBLService.GetLabReportByVisitId(this.selectedADT.PatientVisitId)
  //        .subscribe(res => {
  //            if (res.Status == 'OK') {
  //                this.labResults = res.Results;
  //            } else {
  //                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  //            }
  //        },
  //        err => {
  //            this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
  //            this.logError(err.ErrorMessage);
  //        });
  //}
  public GetImagingResults() {
    this.admissionBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length)
            this.imagingResults = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
        });
  }

  //thi sis used to print the receipt
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();

    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'


    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  logError(err: any) {
    console.log(err);
  }
}
